/**
 * Live-game drift: the parts of `bun run drift:live` that don't touch
 * the network, so they can be tested against saved responses.
 *
 * The daily drift check calls a finished game, so fields that only exist
 * while a game is on (clock, situation, intermission data) and short
 * game states (`OVER` lasts about 20 seconds) are never compared. The
 * live check polls in-progress games, compares every response with the
 * baseline the way a `volatile` check does, and records each endpoint's
 * game-state changes so gaps in coverage are visible.
 */

import type { Shape } from './shape.ts';
import { type Change, diffShapes, mergeShapes, shapeOf } from './shape.ts';
import {
   describeValue,
   GAME_STATES,
   type UnknownValue,
   unknownValuesFor,
} from './values.ts';

/** Game states in the order a game goes through them */
export const STATE_ORDER: readonly string[] = [...GAME_STATES];

/** States in which a game has started */
const STARTED = new Set(['LIVE', 'CRIT', 'OVER', 'FINAL']);

export interface WatchedGame {
   id: number;
   /** e.g. `TOR@CGY` */
   label: string;
   startTimeUTC?: string;
}

/** Where a game stood in one response */
export interface GameStatus {
   state: string;
   /** e.g. `P3 REG 04:49`, `P2 INT 12:10` */
   moment?: string;
}

interface ScoreGame {
   id?: unknown;
   gameState?: unknown;
   startTimeUTC?: unknown;
   awayTeam?: { abbrev?: unknown };
   homeTeam?: { abbrev?: unknown };
}

/**
 * The games a live run watches, from a `gc.score` response: the ones
 * listed in `ids`, or else every game that isn't `OFF` yet.
 */
export function selectGames(
   score: unknown,
   ids: readonly number[] = [],
): WatchedGame[] {
   const games = ((score as { games?: ScoreGame[] })?.games ?? []).filter(
      (g): g is ScoreGame & { id: number } => typeof g.id === 'number',
   );
   const label = (g: ScoreGame) =>
      `${g.awayTeam?.abbrev ?? '?'}@${g.homeTeam?.abbrev ?? '?'}`;
   const picked =
      ids.length > 0
         ? ids.map(
              (id) =>
                 games.find((g) => g.id === id) ?? ({ id } as ScoreGame),
           )
         : games.filter((g) => g.gameState !== 'OFF');
   return picked.map((g) => ({
      id: g.id as number,
      label: g.awayTeam ? label(g) : String(g.id),
      ...(typeof g.startTimeUTC === 'string'
         ? { startTimeUTC: g.startTimeUTC }
         : {}),
   }));
}

/** `P3 REG 04:49`, from an object carrying a period and clock */
function momentOf(o: Record<string, unknown>): string | undefined {
   const period = o.periodDescriptor as
      | { number?: unknown; periodType?: unknown }
      | undefined;
   const clock = o.clock as
      | { timeRemaining?: unknown; inIntermission?: unknown }
      | undefined;
   const parts = [
      typeof period?.number === 'number' && `P${period.number}`,
      typeof period?.periodType === 'string' && period.periodType,
      clock?.inIntermission === true && 'INT',
      typeof clock?.timeRemaining === 'string' && clock.timeRemaining,
   ].filter(Boolean);
   return parts.length > 0 ? parts.join(' ') : undefined;
}

/**
 * The state of game `id` in a response: the top level of a game-scoped
 * response, or the entry with that id anywhere in a date-scoped one
 * (`games[]`, `gamesByDate[].games[]`, `gameWeek[].games[]`).
 */
export function statusOf(
   data: unknown,
   id: number,
): GameStatus | undefined {
   const read = (o: Record<string, unknown>): GameStatus | undefined => {
      if (typeof o.gameState !== 'string') return undefined;
      const moment = momentOf(o);
      return { state: o.gameState, ...(moment ? { moment } : {}) };
   };
   if (data === null || typeof data !== 'object') return undefined;
   const top = data as Record<string, unknown>;
   if (top.id === id && typeof top.gameState === 'string') return read(top);
   let found: GameStatus | undefined;
   const walk = (v: unknown) => {
      if (found || v === null || typeof v !== 'object') return;
      if (Array.isArray(v)) {
         for (const item of v) walk(item);
         return;
      }
      const o = v as Record<string, unknown>;
      if (o.id === id && typeof o.gameState === 'string') {
         found = read(o);
         return;
      }
      for (const child of Object.values(o)) walk(child);
   };
   walk(data);
   // A game-scoped response without an id at the top (wsc, right rail)
   return found ?? (top.id === undefined ? read(top) : undefined);
}

/** Whether a game in this state has started */
export function hasStarted(state: string | undefined): boolean {
   return state !== undefined && STARTED.has(state);
}

/** One state change of one game, as one endpoint reported it */
export interface Transition {
   at: Date;
   game: WatchedGame;
   endpoint: string;
   from?: string;
   to: string;
   moment?: string;
}

/** A field or value no baseline or type accepts, seen during the run */
export interface LiveFinding {
   check: string;
   text: string;
   count: number;
   firstSeen: Date;
   /** The game and state it was first seen in */
   game?: WatchedGame;
   status?: GameStatus;
}

/** An endpoint call that failed */
export interface LiveError {
   check: string;
   text: string;
   count: number;
   firstSeen: Date;
   /** Network, server and rate-limit errors, which a later tick retries */
   retryable: boolean;
}

interface Coverage {
   responses: number;
   errors: number;
   states: Set<string>;
}

/**
 * Everything a live run has seen: per-endpoint shapes and game states,
 * the state timeline, and findings.
 */
export class LiveRun {
   readonly startedAt: Date;
   readonly transitions: Transition[] = [];
   readonly findings = new Map<string, LiveFinding>();
   readonly errors = new Map<string, LiveError>();
   readonly coverage = new Map<string, Coverage>();
   /** Every shape seen, merged per endpoint */
   readonly shapes = new Map<string, Shape>();
   readonly unknownValues: UnknownValue[] = [];
   requests = 0;
   ticks = 0;
   private readonly last = new Map<string, string>();
   /** Latest state per game, from any endpoint */
   readonly latest = new Map<number, string>();

   constructor(
      readonly games: readonly WatchedGame[],
      private readonly baseline: Readonly<Record<string, Shape>>,
      now = new Date(),
   ) {
      this.startedAt = now;
   }

   private cover(check: string): Coverage {
      let c = this.coverage.get(check);
      if (!c) {
         c = { responses: 0, errors: 0, states: new Set() };
         this.coverage.set(check, c);
      }
      return c;
   }

   /**
    * Record a successful response. `game` is the game a game-scoped call
    * was for; date-scoped responses are searched for every watched game.
    * Returns the games whose state changed.
    */
   observe(
      check: string,
      data: unknown,
      at: Date,
      game?: WatchedGame,
   ): WatchedGame[] {
      this.requests++;
      const coverage = this.cover(check);
      coverage.responses++;

      const changed: WatchedGame[] = [];
      let first: GameStatus | undefined;
      for (const g of game ? [game] : this.games) {
         const status = statusOf(data, g.id);
         if (!status) continue;
         first ??= status;
         coverage.states.add(status.state);
         const key = `${g.id}|${check}`;
         const from = this.last.get(key);
         if (from !== status.state) {
            this.last.set(key, status.state);
            this.transitions.push({
               at,
               game: g,
               endpoint: check,
               ...(from ? { from } : {}),
               to: status.state,
               ...(status.moment ? { moment: status.moment } : {}),
            });
            if (from !== undefined) changed.push(g);
         }
         const before = this.latest.get(g.id);
         if (
            before === undefined ||
            STATE_ORDER.indexOf(status.state) > STATE_ORDER.indexOf(before)
         ) {
            this.latest.set(g.id, status.state);
         }
      }

      const shape = shapeOf(data);
      const merged = this.shapes.get(check);
      this.shapes.set(check, merged ? mergeShapes(merged, shape) : shape);

      const expected = this.baseline[check];
      const changes: Change[] = expected
         ? diffShapes(expected, shape).filter((c) => c.kind !== 'removed')
         : [];
      const texts = [
         ...changes.map(describeChange),
         ...(expected ? [] : ['no baseline for this check']),
      ];
      for (const v of unknownValuesFor(check, data)) {
         texts.push(describeValue(v));
         if (
            !this.unknownValues.some(
               (u) => u.path === v.path && u.value === v.value,
            )
         ) {
            this.unknownValues.push(v);
         }
      }
      for (const text of texts) {
         const key = `${check}|${text}`;
         const seen = this.findings.get(key);
         if (seen) {
            seen.count++;
            continue;
         }
         const g = game ?? (first ? this.gameIn(data) : undefined);
         this.findings.set(key, {
            check,
            text,
            count: 1,
            firstSeen: at,
            ...(g ? { game: g } : {}),
            ...(first ? { status: first } : {}),
         });
      }
      return changed;
   }

   /** The first watched game a date-scoped response mentions */
   private gameIn(data: unknown): WatchedGame | undefined {
      return this.games.find((g) => statusOf(data, g.id));
   }

   /** Record a failed call */
   fail(check: string, text: string, retryable: boolean, at: Date): void {
      this.requests++;
      this.cover(check).errors++;
      const key = `${check}|${text}`;
      const seen = this.errors.get(key);
      if (seen) seen.count++;
      else {
         this.errors.set(key, {
            check,
            text,
            count: 1,
            firstSeen: at,
            retryable,
         });
      }
   }

   /** Baseline paths no live response showed, per endpoint */
   unseen(): Map<string, Change[]> {
      const out = new Map<string, Change[]>();
      for (const [check, shape] of this.shapes) {
         const expected = this.baseline[check];
         if (!expected) continue;
         const removed = diffShapes(expected, shape).filter(
            (c) => c.kind === 'removed',
         );
         if (removed.length > 0) out.set(check, removed);
      }
      return out;
   }

   /** Findings that fail the run: shape and value drift, hard errors */
   failing(): number {
      return (
         this.findings.size +
         [...this.errors.values()].filter((e) => !e.retryable).length
      );
   }

   /** The baseline this run compared with, plus every live shape */
   updatedBaseline(): Record<string, Shape> {
      const next = { ...this.baseline };
      for (const [check, shape] of this.shapes) {
         const before = next[check];
         next[check] = before ? mergeShapes(before, shape) : shape;
      }
      return next;
   }
}

/**
 * Live-only paths are kept apart from the daily baseline (in
 * `live-baseline.json`): the daily check compares a finished game, which
 * would report every live-only field as removed.
 */

/** The daily baseline with the live-only paths merged in */
export function withLive(
   daily: Readonly<Record<string, Shape>>,
   live: Readonly<Record<string, Shape>>,
): Record<string, Shape> {
   const out = { ...daily };
   for (const [check, shape] of Object.entries(live)) {
      const before = out[check];
      out[check] = before ? mergeShapes(before, shape) : shape;
   }
   return out;
}

/** What `merged` holds beyond the daily baseline, per check */
export function liveOnly(
   daily: Readonly<Record<string, Shape>>,
   merged: Readonly<Record<string, Shape>>,
): Record<string, Shape> {
   const out: Record<string, Shape> = {};
   for (const check of Object.keys(merged).sort()) {
      const extra: Shape = {};
      for (const [path, kinds] of Object.entries(merged[check] ?? {})) {
         if (daily[check]?.[path] !== kinds) extra[path] = kinds;
      }
      if (Object.keys(extra).length > 0) out[check] = extra;
   }
   return out;
}

export function describeChange(c: Change): string {
   switch (c.kind) {
      case 'added':
         return `added \`${c.path}\` (${c.live})`;
      case 'removed':
         return `removed \`${c.path}\` (was ${c.baseline})`;
      case 'changed':
         return `changed \`${c.path}\`: ${c.baseline} → ${c.live}`;
   }
}

const time = (d: Date) => d.toISOString().slice(11, 19);

function where(game?: WatchedGame, status?: GameStatus): string {
   if (!game) return '';
   const state = status
      ? ` ${status.state}${status.moment ? ` ${status.moment}` : ''}`
      : '';
   return ` in ${game.id} ${game.label}${state}`;
}

/** One line of the state timeline, like the prototype's log */
export function describeTransition(t: Transition): string {
   const change = `${t.from ?? '…'} -> ${t.to}`;
   return `${time(t.at)} ${t.game.id} ${t.game.label.padEnd(7)} [${t.endpoint}] ${change}${t.moment ? `  (${t.moment})` : ''}`;
}

/** The Markdown report of a live run */
export function liveReport(
   run: LiveRun,
   endedAt: Date,
   options: { updated?: boolean; stopReason?: string; date?: string } = {},
): string {
   const failing = run.failing();
   const lines = [
      '# NHL live drift check',
      '',
      `Watched ${run.games.length} game${run.games.length === 1 ? '' : 's'} from ${time(run.startedAt)} to ${time(endedAt)} UTC${options.date ? `, games of ${options.date}` : ''}: ${run.ticks} polls, ${run.requests} requests.` +
         (options.stopReason ? ` Stopped: ${options.stopReason}.` : ''),
      '',
      options.updated
         ? 'Baseline updated with every live shape.'
         : failing === 0
           ? 'Every live response matches the baseline.'
           : `${failing} finding${failing === 1 ? '' : 's'}.`,
      '',
      '## Games',
      '',
      '| Game | Matchup | Last state |',
      '| --- | --- | --- |',
      ...run.games.map(
         (g) =>
            `| ${g.id} | ${g.label} | ${run.latest.get(g.id) ?? 'not seen'} |`,
      ),
      '',
      '## Coverage',
      '',
      'Game states each endpoint was seen in. A state an endpoint never showed is a gap in what this run compared.',
      '',
      `| Endpoint | Responses | Errors | ${STATE_ORDER.join(' | ')} |`,
      `| --- | --- | --- | ${STATE_ORDER.map(() => '---').join(' | ')} |`,
      ...[...run.coverage.entries()].map(
         ([check, c]) =>
            `| \`${check}\` | ${c.responses} | ${c.errors} | ${STATE_ORDER.map((s) => (c.states.has(s) ? '✅' : '')).join(' | ')} |`,
      ),
   ];

   const byCheck = new Map<string, LiveFinding[]>();
   for (const f of run.findings.values()) {
      byCheck.set(f.check, [...(byCheck.get(f.check) ?? []), f]);
   }
   if (byCheck.size > 0) {
      lines.push('', '## Findings');
      for (const [check, findings] of byCheck) {
         lines.push('', `### \`${check}\``, '');
         for (const f of findings) {
            lines.push(
               `- ${f.text}: first seen ${time(f.firstSeen)}${where(f.game, f.status)}, ${f.count} response${f.count === 1 ? '' : 's'}`,
            );
         }
      }
   }

   if (run.errors.size > 0) {
      lines.push('', '## Errors', '');
      for (const e of run.errors.values()) {
         lines.push(
            `- \`${e.check}\`: ${e.text} (${e.count}×, first ${time(e.firstSeen)}${e.retryable ? ', retried on later polls' : ''})`,
         );
      }
   }

   if (run.transitions.length > 0) {
      lines.push(
         '',
         '## State timeline',
         '',
         '```text',
         ...run.transitions.map(describeTransition),
         '```',
      );
   }

   const unseen = run.unseen();
   if (unseen.size > 0) {
      lines.push(
         '',
         '<details>',
         '<summary>Baseline fields no live response showed (normal: the baseline is a finished game)</summary>',
         '',
      );
      for (const [check, changes] of unseen) {
         lines.push(
            `- \`${check}\`: ${changes.map((c) => `\`${c.path}\``).join(', ')}`,
         );
      }
      lines.push('', '</details>');
   }

   if (failing > 0 && !options.updated) {
      lines.push(
         '',
         '## Next steps',
         '',
         '- **added / changed**: check the response types in `src/types/responses/` cover the field (live-only fields are optional), then accept the live shapes with `bun run drift:live --update` during a slate, or add the paths to `scripts/drift/baseline.json` by hand.',
         '- **unknown game state or position code**: widen `GameState` or `PositionCode` and the lists in `scripts/drift/values.ts`; `--update` won’t accept it.',
         '- **errors**: a call that fails only while a game is live may need different handling in the client.',
      );
   }
   return `${lines.join('\n')}\n`;
}

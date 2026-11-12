/**
 * A bounded capture campaign for one game's Game Summary (GS) report:
 * the decisions, without the network or the file system, so they can be
 * tested.
 *
 * One campaign follows one game: from six hours before its scheduled
 * start, every scheduled tick (about ten minutes apart) fetches the GS
 * report and the game's landing JSON for context, until an hour after
 * the context first shows the game final; one more pair a day after the
 * scheduled start; then it is done. A twelve-hour cap on the continuous
 * window and a cap on total NHL requests bound it whatever happens.
 */

export const LIMITS = {
   /** Every NHL request: discovery, report, context and retries */
   maxRequests: 180,
   /** Polling starts this long before the scheduled start */
   leadMs: 6 * 3_600_000,
   /** Polling goes on this long after the game is first seen final */
   tailMs: 3_600_000,
   /** The continuous window never runs longer than this */
   windowMs: 12 * 3_600_000,
   /** The next-day snapshot, after the scheduled start */
   nextDayMs: 24 * 3_600_000,
   /** Requests kept back for the next-day snapshot */
   reserve: 2,
} as const;

export type Status =
   | 'selecting'
   | 'waiting'
   | 'polling'
   | 'awaiting-next-day'
   | 'done'
   | 'stopped';

export interface CampaignGame {
   id: number;
   /** e.g. `TOR@CGY` */
   label: string;
   startTimeUTC: string;
   /** When and how the game was picked */
   selectedAt: string;
   selectedBy: 'schedule' | 'dispatch';
}

export interface Campaign {
   version: 1;
   status: Status;
   createdAt: string;
   game?: CampaignGame;
   /** NHL requests made so far, retries included */
   requests: number;
   maxRequests: number;
   windowStartedAt?: string;
   /** First context response showing FINAL or OFF */
   finalSeenAt?: string;
   /** Why polling or the campaign ended, when not the normal way */
   notes: string[];
   updatedAt: string;
}

export function newCampaign(now: Date, game?: CampaignGame): Campaign {
   const at = now.toISOString();
   return {
      version: 1,
      status: game ? 'waiting' : 'selecting',
      createdAt: at,
      ...(game ? { game } : {}),
      requests: 0,
      maxRequests: LIMITS.maxRequests,
      notes: [],
      updatedAt: at,
   };
}

export type Action =
   | { kind: 'none'; reason: string }
   | { kind: 'select' }
   | { kind: 'wait'; until: string }
   | { kind: 'poll' }
   | { kind: 'next-day' };

const ms = (iso: string) => new Date(iso).getTime();

/**
 * What a tick at `now` should do. Moves the campaign from polling to the
 * next-day wait when the tail, the window cap or the request budget says
 * so, noting why.
 */
export function decide(c: Campaign, now: Date): Action {
   const t = now.getTime();
   if (c.status === 'done' || c.status === 'stopped') {
      return { kind: 'none', reason: `campaign ${c.status}` };
   }
   if (!c.game) {
      return c.requests < c.maxRequests
         ? { kind: 'select' }
         : { kind: 'none', reason: 'request budget spent' };
   }
   const start = ms(c.game.startTimeUTC);

   if (c.status === 'waiting' || c.status === 'selecting') {
      const from = start - LIMITS.leadMs;
      if (t < from)
         return { kind: 'wait', until: new Date(from).toISOString() };
      c.status = 'polling';
   }

   if (c.status === 'polling') {
      const end = endOfPolling(c, t);
      if (!end) return { kind: 'poll' };
      c.status = 'awaiting-next-day';
      if (end !== 'tail')
         c.notes.push(`${now.toISOString()}: polling stopped, ${end}`);
   }

   // awaiting-next-day
   const nextDay = start + LIMITS.nextDayMs;
   if (t < nextDay) {
      return { kind: 'wait', until: new Date(nextDay).toISOString() };
   }
   if (c.requests + LIMITS.reserve > c.maxRequests) {
      finish(c, now, 'no requests left for the next-day snapshot');
      return { kind: 'none', reason: 'request budget spent' };
   }
   return { kind: 'next-day' };
}

/** Why polling should end now, if it should */
function endOfPolling(c: Campaign, t: number): 'tail' | string | undefined {
   if (c.finalSeenAt && t >= ms(c.finalSeenAt) + LIMITS.tailMs)
      return 'tail';
   if (c.windowStartedAt && t >= ms(c.windowStartedAt) + LIMITS.windowMs) {
      return 'twelve-hour window cap reached';
   }
   // A poll is a report and a context request, possibly retried once each
   if (c.requests + 4 + LIMITS.reserve > c.maxRequests) {
      return 'request budget nearly spent (kept for the next-day snapshot)';
   }
   return undefined;
}

export function finish(c: Campaign, now: Date, note?: string) {
   c.status = 'done';
   if (note) c.notes.push(`${now.toISOString()}: ${note}`);
}

export function stop(c: Campaign, now: Date, reason: string) {
   c.status = 'stopped';
   c.notes.push(`${now.toISOString()}: stopped, ${reason}`);
}

interface ScheduleGame {
   id?: unknown;
   gameState?: unknown;
   gameType?: unknown;
   startTimeUTC?: unknown;
   awayTeam?: { abbrev?: unknown };
   homeTeam?: { abbrev?: unknown };
}

/**
 * The game a new campaign follows, from a `/v1/schedule/{date}`
 * response: the earliest regular-season or playoff game that hasn't
 * started and starts at least the lead time from now, so the whole
 * pregame window is covered.
 */
export function pickGame(
   schedule: unknown,
   now: Date,
): Omit<CampaignGame, 'selectedAt' | 'selectedBy'> | undefined {
   const days = (schedule as { gameWeek?: { games?: ScheduleGame[] }[] })
      ?.gameWeek;
   const games = (days ?? []).flatMap((d) => d.games ?? []);
   const earliest = now.getTime() + LIMITS.leadMs;
   const fit = games
      .filter(
         (g) =>
            typeof g.id === 'number' &&
            typeof g.startTimeUTC === 'string' &&
            g.gameState === 'FUT' &&
            (g.gameType === 2 || g.gameType === 3) &&
            ms(g.startTimeUTC) >= earliest,
      )
      .sort(
         (a, b) =>
            ms(a.startTimeUTC as string) - ms(b.startTimeUTC as string),
      )[0];
   if (!fit) return undefined;
   return {
      id: fit.id as number,
      label: `${fit.awayTeam?.abbrev ?? '?'}@${fit.homeTeam?.abbrev ?? '?'}`,
      startTimeUTC: fit.startTimeUTC as string,
   };
}

/** Game context from a landing response, as an observation records it */
export interface Context {
   gameState?: string;
   gameScheduleState?: string;
   period?: number;
   periodType?: string;
   timeRemaining?: string;
   inIntermission?: boolean;
   startTimeUTC?: string;
}

export function contextOf(landing: unknown): Context {
   const o = (landing ?? {}) as Record<string, unknown>;
   const pd = (o.periodDescriptor ?? {}) as Record<string, unknown>;
   const clock = (o.clock ?? {}) as Record<string, unknown>;
   const pick = <T>(v: unknown, type: string): T | undefined =>
      typeof v === type ? (v as T) : undefined;
   const out: { [K in keyof Context]: Context[K] | undefined } = {
      gameState: pick(o.gameState, 'string'),
      gameScheduleState: pick(o.gameScheduleState, 'string'),
      period: pick(pd.number, 'number'),
      periodType: pick(pd.periodType, 'string'),
      timeRemaining: pick(clock.timeRemaining, 'string'),
      inIntermission: pick(clock.inIntermission, 'boolean'),
      startTimeUTC: pick(o.startTimeUTC, 'string'),
   };
   return Object.fromEntries(
      Object.entries(out).filter(([, v]) => v !== undefined),
   ) as Context;
}

export const isFinal = (ctx: Context) =>
   ctx.gameState === 'FINAL' || ctx.gameState === 'OFF';

/** One saved request and response */
export interface Observation {
   seq: number;
   kind: 'discovery' | 'report' | 'context';
   gameId?: number;
   url: string;
   /** 1 for the first try, 2 for the retry */
   attempt: number;
   requestedAt: string;
   respondedAt?: string;
   status?: number;
   /** Response headers relevant to caching and content */
   headers?: Record<string, string>;
   /** The saved body: `objects/<sha256>.<ext>` */
   body?: { sha256: string; bytes: number; path: string };
   /** Network failure, timeout or unreadable body */
   error?: string;
   /** Parsed game context, for context observations */
   context?: Context;
   collector: { commit: string; version: number };
}

/** The lifecycle stages the campaign is after */
export const STAGES = [
   'report 404 before publication',
   'report published, game not started',
   'report while live',
   'report during an intermission',
   'report right after final',
   'next-day report',
   'overtime or shootout',
] as const;
export type Stage = (typeof STAGES)[number];

/** A report and its context are fetched this close together */
const PAIR_MS = 60_000;

/**
 * The context a report was taken in: the context fetched right after it
 * in the same tick, or else the latest one before it.
 */
function contextFor(
   obs: readonly Observation[],
   i: number,
): Context | undefined {
   const report = obs[i] as Observation;
   const t = ms(report.requestedAt);
   for (let j = i + 1; j < obs.length; j++) {
      const o = obs[j] as Observation;
      if (ms(o.requestedAt) - t > PAIR_MS) break;
      if (o.kind === 'context') {
         if (o.context) return o.context;
         break;
      }
   }
   for (let j = i - 1; j >= 0; j--) {
      const o = obs[j] as Observation;
      if (o.kind === 'context' && o.context) return o.context;
   }
   return undefined;
}

/**
 * Which stages the observations cover, and the first observation of
 * each. A report is placed by the game context it was taken in; one
 * without any context is only counted as a 404 or next-day report.
 */
export function coverage(
   obs: readonly Observation[],
   c: Campaign,
): Map<Stage, Observation | undefined> {
   const out = new Map<Stage, Observation | undefined>(
      STAGES.map((s) => [s, undefined]),
   );
   const set = (s: Stage, o: Observation) => {
      if (!out.get(s)) out.set(s, o);
   };
   const nextDay = c.game
      ? ms(c.game.startTimeUTC) + LIMITS.nextDayMs
      : Number.POSITIVE_INFINITY;
   const final = obs.find(
      (o) => o.kind === 'context' && o.context && isFinal(o.context),
   );
   const finalAt = final ? ms(final.requestedAt) : undefined;

   obs.forEach((o, i) => {
      if (o.kind === 'context') {
         const type = o.context?.periodType;
         if (type === 'OT' || type === 'SO') set('overtime or shootout', o);
         return;
      }
      if (o.kind !== 'report' || o.status === undefined) return;
      const t = ms(o.requestedAt);
      if (t >= nextDay) {
         if (o.status === 200) set('next-day report', o);
         return;
      }
      if (o.status === 404) {
         set('report 404 before publication', o);
         return;
      }
      const ctx = contextFor(obs, i);
      if (o.status !== 200 || !ctx) return;
      const state = ctx.gameState;
      if (state === 'FUT' || state === 'PRE') {
         set('report published, game not started', o);
      } else if (state === 'LIVE' || state === 'CRIT' || state === 'OVER') {
         set(
            ctx.inIntermission
               ? 'report during an intermission'
               : 'report while live',
            o,
         );
      } else if (
         isFinal(ctx) &&
         finalAt !== undefined &&
         t - finalAt <= LIMITS.tailMs
      ) {
         set('report right after final', o);
      }
   });
   return out;
}

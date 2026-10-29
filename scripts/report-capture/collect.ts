/**
 * Collector for real NHL HTML report snapshots (all nine RTSS reports),
 * used to build offline lifecycle fixtures. It is only ever run on
 * purpose, by the "Report capture" workflow or by hand; tests never call
 * it.
 *
 * Commands:
 *
 *   campaign --game <id> --data <dir> [--until <iso>] [--budget <n>]
 *     Polls one game's reports through its lifecycle. State lives in
 *     <dir>/games/<id>/campaign.json, so a later process (the next
 *     workflow job) resumes where the last one stopped. Exits when the
 *     campaign is done, the budget is spent or `--until` passes.
 *
 *   snapshot --games <id,id,...> --data <dir> --label <text>
 *     Captures every report of each game once, e.g. completed historical
 *     games.
 *
 * Every request, successful or not, appends one line to
 * <dir>/games/<id>/observations.jsonl. Bodies are stored once each under
 * <dir>/bodies/<sha256>.gz, keyed by the SHA-256 of the body bytes.
 *
 * With `--commit`, the data directory (a git checkout) is committed and
 * pushed after each poll, so evidence survives a cancelled or crashed job.
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
   appendFileSync,
   existsSync,
   mkdirSync,
   readFileSync,
   writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';

export const COLLECTOR_VERSION = '2';

export const REPORT_CODES = [
   'GS',
   'ES',
   'PL',
   'FS',
   'FC',
   'RO',
   'SS',
   'TV',
   'TH',
] as const;
export type ReportCode = (typeof REPORT_CODES)[number];

const REPORT_BASE = 'https://www.nhl.com/scores/htmlreports';
const CONTEXT_BASE = 'https://api-web.nhle.com/v1/gamecenter';
const USER_AGENT =
   'nhle-api report fixture collector (+https://github.com/spiflicate/nhle-api)';

const TIMEOUT_MS = 30_000;
/** Extra attempts after a network error, timeout or 5xx; 404 is final */
const RETRIES = 1;
const RETRY_DELAY_MS = 5_000;
/** Pause between requests within one poll */
const GAP_MS = 500;

/** Campaign limits; see scripts/report-capture/README.md */
export const DEFAULTS = {
   /** Total NHL requests for one game's campaign, retries included */
   budget: 800,
   /** Requests held back from the continuous window for follow-ups */
   followUpReserve: 60,
   /** Minutes between polls in the continuous window */
   intervalMinutes: 10,
   /** The continuous window ends this long after the first poll */
   windowHours: 12,
   /** ... or this long after the context first reports a final state */
   afterFinalMinutes: 60,
   /** Single polls this many hours after the first final observation */
   followUpHours: [3, 9, 15, 24],
   /** A follow-up later than this is recorded as missed */
   followUpGraceMinutes: 60,
} as const;

export function reportUrl(gameId: number, code: ReportCode): string {
   const year = Math.trunc(gameId / 1e6);
   const gameNumber = String(gameId % 1e6).padStart(6, '0');
   return `${REPORT_BASE}/${year}${year + 1}/${code}${gameNumber}.HTM`;
}

export function contextUrl(gameId: number): string {
   return `${CONTEXT_BASE}/${gameId}/boxscore`;
}

export interface Observation {
   /** Immutable id: `{gameId}-{kind}-{requestStart compact}-a{attempt}` */
   id: string;
   gameId: number;
   /** Report code, or 'context' for the gamecenter boxscore JSON */
   kind: ReportCode | 'context';
   /** Poll number within a campaign, or the snapshot label */
   poll: number | string;
   phase: 'continuous' | 'follow-up' | 'snapshot';
   url: string;
   attempt: number;
   requestStart: string;
   responseReceived: string | null;
   status: number | null;
   finalUrl: string | null;
   redirected: boolean | null;
   /** All response headers except set-cookie, lower-cased */
   headers: Record<string, string> | null;
   bodyBytes: number | null;
   sha256: string | null;
   /** Path of the stored body, relative to the data directory */
   body: string | null;
   /** Network error, timeout or body read failure */
   error: string | null;
   collector: {
      version: string;
      commit: string | null;
      run: string | null;
   };
   /** For context responses only: what the JSON said at that moment */
   context?: {
      gameState: string | null;
      gameScheduleState: string | null;
      startTimeUTC: string | null;
      period: number | null;
      periodType: string | null;
      clock: string | null;
      inIntermission: boolean | null;
      running: boolean | null;
   };
}

export interface CampaignState {
   gameId: number;
   scheduledStartUTC: string | null;
   matchup: string | null;
   budget: number;
   requests: number;
   polls: number;
   firstPollAt: string | null;
   lastPollAt: string | null;
   /** First context response with gameState FINAL or OFF */
   finalObservedAt: string | null;
   followUpsDone: number[];
   /** Follow-ups not polled within an hour of when they were due */
   followUpsMissed?: number[];
   done: boolean;
   doneReason: string | null;
   /** Highest gameState seen, and when each was first seen */
   statesSeen: Record<string, string>;
}

interface Options {
   data: string;
   commit: boolean;
   collector: Observation['collector'];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function compact(iso: string): string {
   return iso.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
}

/** Store a body by its hash; identical bodies are stored once */
function storeBody(dataDir: string, bytes: Uint8Array): string {
   const sha = createHash('sha256').update(bytes).digest('hex');
   const rel = `bodies/${sha.slice(0, 2)}/${sha}.gz`;
   const abs = join(dataDir, rel);
   if (!existsSync(abs)) {
      mkdirSync(join(dataDir, 'bodies', sha.slice(0, 2)), {
         recursive: true,
      });
      writeFileSync(abs, gzipSync(bytes, { level: 9 }));
   }
   return sha;
}

/** One request with retries; every attempt is its own observation */
async function observe(
   opts: Options,
   gameId: number,
   kind: Observation['kind'],
   url: string,
   poll: Observation['poll'],
   phase: Observation['phase'],
   count: () => boolean,
): Promise<Observation[]> {
   const out: Observation[] = [];
   for (let attempt = 1; attempt <= 1 + RETRIES; attempt++) {
      if (!count()) break;
      const requestStart = new Date().toISOString();
      const obs: Observation = {
         id: `${gameId}-${kind}-${compact(requestStart)}-a${attempt}`,
         gameId,
         kind,
         poll,
         phase,
         url,
         attempt,
         requestStart,
         responseReceived: null,
         status: null,
         finalUrl: null,
         redirected: null,
         headers: null,
         bodyBytes: null,
         sha256: null,
         body: null,
         error: null,
         collector: opts.collector,
      };
      try {
         const res = await fetch(url, {
            headers: {
               'User-Agent': USER_AGENT,
               Accept:
                  kind === 'context' ? 'application/json' : 'text/html',
            },
            signal: AbortSignal.timeout(TIMEOUT_MS),
            redirect: 'follow',
         });
         obs.responseReceived = new Date().toISOString();
         obs.status = res.status;
         obs.finalUrl = res.url;
         obs.redirected = res.redirected;
         const headers: Record<string, string> = {};
         res.headers.forEach((v, k) => {
            if (k.toLowerCase() !== 'set-cookie')
               headers[k.toLowerCase()] = v;
         });
         obs.headers = headers;
         // Bytes after the content-encoding is removed, before any
         // charset decoding
         const bytes = new Uint8Array(await res.arrayBuffer());
         obs.bodyBytes = bytes.byteLength;
         obs.sha256 = storeBody(opts.data, bytes);
         obs.body = `bodies/${obs.sha256.slice(0, 2)}/${obs.sha256}.gz`;
         if (kind === 'context' && res.ok) {
            const context = readContext(bytes);
            if (context) obs.context = context;
         }
      } catch (error) {
         obs.error =
            error instanceof Error
               ? `${error.name}: ${error.message}`
               : String(error);
      }
      out.push(obs);
      appendFileSync(
         join(opts.data, 'games', String(gameId), 'observations.jsonl'),
         `${JSON.stringify(obs)}\n`,
      );
      const retryable =
         obs.error !== null || (obs.status !== null && obs.status >= 500);
      if (!retryable) break;
      if (attempt <= RETRIES) await sleep(RETRY_DELAY_MS);
   }
   return out;
}

function readContext(bytes: Uint8Array): Observation['context'] {
   try {
      const json = JSON.parse(new TextDecoder().decode(bytes));
      return {
         gameState: json.gameState ?? null,
         gameScheduleState: json.gameScheduleState ?? null,
         startTimeUTC: json.startTimeUTC ?? null,
         period: json.periodDescriptor?.number ?? null,
         periodType: json.periodDescriptor?.periodType ?? null,
         clock: json.clock?.timeRemaining ?? null,
         inIntermission: json.clock?.inIntermission ?? null,
         running: json.clock?.running ?? null,
      };
   } catch {
      return undefined;
   }
}

/** Context first, then the nine reports, one after another */
async function pollGame(
   opts: Options,
   gameId: number,
   poll: Observation['poll'],
   phase: Observation['phase'],
   count: () => boolean,
): Promise<Observation[]> {
   mkdirSync(join(opts.data, 'games', String(gameId)), { recursive: true });
   const all: Observation[] = [];
   all.push(
      ...(await observe(
         opts,
         gameId,
         'context',
         contextUrl(gameId),
         poll,
         phase,
         count,
      )),
   );
   for (const code of REPORT_CODES) {
      await sleep(GAP_MS);
      all.push(
         ...(await observe(
            opts,
            gameId,
            code,
            reportUrl(gameId, code),
            poll,
            phase,
            count,
         )),
      );
   }
   return all;
}

function summarize(obs: Observation[]): string {
   return obs
      .map((o) =>
         o.kind === 'context'
            ? `ctx=${o.status ?? o.error}/${o.context?.gameState ?? '?'} P${o.context?.period ?? '-'} ${o.context?.clock ?? ''}${o.context?.inIntermission ? ' INT' : ''}`
            : `${o.kind}=${o.status ?? 'ERR'}`,
      )
      .join(' ');
}

function persist(opts: Options, message: string): void {
   if (!opts.commit) return;
   const git = (...args: string[]) =>
      spawnSync('git', ['-C', opts.data, ...args], { encoding: 'utf8' });
   git('add', '-A');
   const commit = git('commit', '-q', '-m', message);
   if (commit.status !== 0 && !/nothing to commit/.test(commit.stdout)) {
      console.error(commit.stderr || commit.stdout);
   }
   const branch = process.env.CAPTURE_BRANCH ?? 'report-captures';
   // Several campaigns can push to the branch at once; a commit left
   // unpushed here goes out with the next poll's push
   for (let i = 0; i < 8; i++) {
      if (
         git('push', '-q', 'origin', `HEAD:refs/heads/${branch}`).status ===
         0
      ) {
         return;
      }
      git('pull', '-q', '--rebase', 'origin', branch);
      spawnSync('sleep', [String(1 + Math.random() * 2 ** Math.min(i, 4))]);
   }
   console.error('push failed; retried with the next poll');
}

function loadState(
   dataDir: string,
   gameId: number,
   budget: number,
): CampaignState {
   const path = join(dataDir, 'games', String(gameId), 'campaign.json');
   if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8'));
   return {
      gameId,
      scheduledStartUTC: null,
      matchup: null,
      budget,
      requests: 0,
      polls: 0,
      firstPollAt: null,
      lastPollAt: null,
      finalObservedAt: null,
      followUpsDone: [],
      done: false,
      doneReason: null,
      statesSeen: {},
   };
}

function saveState(dataDir: string, state: CampaignState): void {
   const dir = join(dataDir, 'games', String(state.gameId));
   mkdirSync(dir, { recursive: true });
   writeFileSync(
      join(dir, 'campaign.json'),
      `${JSON.stringify(state, null, 2)}\n`,
   );
}

const FINAL_STATES = new Set(['FINAL', 'OFF']);
const PER_POLL = 1 + REPORT_CODES.length;

export async function campaign(
   opts: Options,
   gameId: number,
   until: Date,
   budget: number,
): Promise<CampaignState> {
   const state = loadState(opts.data, gameId, budget);
   const count = () => {
      if (state.requests >= state.budget) return false;
      state.requests++;
      return true;
   };
   const ms = (min: number) => min * 60_000;

   while (!state.done) {
      const now = Date.now();
      if (now >= until.getTime()) break;

      const first = state.firstPollAt ? Date.parse(state.firstPollAt) : now;
      const final = state.finalObservedAt
         ? Date.parse(state.finalObservedAt)
         : null;
      const continuousEnd = Math.min(
         first + DEFAULTS.windowHours * 3_600_000,
         final === null ? Infinity : final + ms(DEFAULTS.afterFinalMinutes),
      );
      const continuousBudget = state.budget - DEFAULTS.followUpReserve;
      const continuousOver =
         now >= continuousEnd ||
         state.requests + PER_POLL > continuousBudget;

      let phase: Observation['phase'] = 'continuous';
      let followUp: number | null = null;
      let nextAt: number;
      if (!continuousOver) {
         const last = state.lastPollAt ? Date.parse(state.lastPollAt) : 0;
         nextAt = last + ms(DEFAULTS.intervalMinutes);
      } else {
         // Follow-ups are anchored to the first final observation, or to
         // the end of the window when final was never seen
         const anchor = final ?? continuousEnd;
         // A follow-up more than an hour late is recorded as missed, not
         // polled under a label it doesn't match
         state.followUpsMissed ??= [];
         const missed = state.followUpsMissed;
         for (const h of DEFAULTS.followUpHours) {
            const late = Date.now() - (anchor + h * 3_600_000);
            if (
               late > ms(DEFAULTS.followUpGraceMinutes) &&
               !state.followUpsDone.includes(h) &&
               !missed.includes(h)
            ) {
               missed.push(h);
            }
         }
         const pending = DEFAULTS.followUpHours.filter(
            (h) => !state.followUpsDone.includes(h) && !missed.includes(h),
         );
         if (pending.length === 0) {
            state.done = true;
            state.doneReason = `${
               final === null
                  ? 'window ended without a final state'
                  : 'final observed'
            }; follow-ups done${missed.length ? ` (missed: ${missed.join(', ')} h)` : ''}`;
            break;
         }
         if (state.requests + PER_POLL > state.budget) {
            state.done = true;
            state.doneReason = `budget spent (${state.requests}/${state.budget})`;
            break;
         }
         followUp = pending[0] ?? null;
         phase = 'follow-up';
         nextAt = anchor + (followUp ?? 0) * 3_600_000;
      }

      if (nextAt > Date.now()) {
         const wait = nextAt - Date.now();
         if (Date.now() + wait >= until.getTime()) {
            // Idle out this window so the next one, which starts when
            // this ends, picks the poll up
            saveState(opts.data, state);
            persist(opts, `capture ${gameId} waiting for ${phase} poll`);
            console.log(
               `next ${phase} poll at ${new Date(nextAt).toISOString()}, after this window; idling until ${until.toISOString()}`,
            );
            await sleep(Math.max(0, until.getTime() - Date.now()));
            break;
         }
         console.log(
            `next ${phase} poll at ${new Date(nextAt).toISOString()}`,
         );
         await sleep(wait);
      }

      const pollAt = new Date().toISOString();
      state.polls++;
      state.firstPollAt ??= pollAt;
      state.lastPollAt = pollAt;
      const obs = await pollGame(opts, gameId, state.polls, phase, count);
      if (followUp !== null) state.followUpsDone.push(followUp);

      const ctx = obs.find(
         (o) => o.kind === 'context' && o.context,
      )?.context;
      if (ctx) {
         state.scheduledStartUTC ??= ctx.startTimeUTC;
         if (ctx.gameState && !(ctx.gameState in state.statesSeen)) {
            state.statesSeen[ctx.gameState] = pollAt;
         }
         if (ctx.gameState && FINAL_STATES.has(ctx.gameState)) {
            state.finalObservedAt ??= pollAt;
         }
      }
      if (state.matchup === null)
         state.matchup = matchupFrom(opts.data, obs);
      saveState(opts.data, state);
      console.log(
         `${pollAt} poll ${state.polls} (${phase}) requests ${state.requests}/${state.budget}: ${summarize(obs)}`,
      );
      persist(
         opts,
         `capture ${gameId} poll ${state.polls} (${phase}) ${pollAt}`,
      );
   }
   saveState(opts.data, state);
   persist(
      opts,
      `capture ${gameId} state ${state.done ? `done: ${state.doneReason}` : 'paused'}`,
   );
   return state;
}

function matchupFrom(dataDir: string, obs: Observation[]): string | null {
   const ctx = obs.find((o) => o.kind === 'context' && o.status === 200);
   if (!ctx?.sha256) return null;
   try {
      const json = JSON.parse(
         gunzipSync(readFileSync(join(dataDir, ctx.body ?? ''))).toString(
            'utf8',
         ),
      );
      return `${json.awayTeam?.abbrev} @ ${json.homeTeam?.abbrev}`;
   } catch {
      return null;
   }
}

export async function snapshot(
   opts: Options,
   gameIds: number[],
   label: string,
   budget: number,
): Promise<number> {
   let requests = 0;
   const count = () => {
      if (requests >= budget) return false;
      requests++;
      return true;
   };
   for (const gameId of gameIds) {
      const obs = await pollGame(opts, gameId, label, 'snapshot', count);
      console.log(`${gameId} ${label}: ${summarize(obs)}`);
   }
   persist(opts, `snapshot ${label}: ${gameIds.join(', ')}`);
   return requests;
}

function arg(args: string[], name: string): string | undefined {
   const i = args.indexOf(`--${name}`);
   return i >= 0 ? args[i + 1] : undefined;
}

async function main(argv: string[]): Promise<void> {
   const [command, ...args] = argv;
   const data = arg(args, 'data');
   if (!data) throw new Error('--data <dir> is required');
   const commit = spawnSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
   });
   const opts: Options = {
      data,
      commit: args.includes('--commit'),
      collector: {
         version: COLLECTOR_VERSION,
         commit: process.env.GITHUB_SHA ?? (commit.stdout.trim() || null),
         run: process.env.GITHUB_RUN_ID
            ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
            : null,
      },
   };
   const budget = Number(arg(args, 'budget') ?? DEFAULTS.budget);

   if (command === 'campaign') {
      const gameId = Number(arg(args, 'game'));
      if (!Number.isInteger(gameId) || String(gameId).length !== 10) {
         throw new Error('--game <10-digit id> is required');
      }
      const until = new Date(
         arg(args, 'until') ?? Date.now() + 5 * 3_600_000,
      );
      const state = await campaign(opts, gameId, until, budget);
      console.log(JSON.stringify(state, null, 2));
   } else if (command === 'snapshot') {
      const games = (arg(args, 'games') ?? '')
         .split(/[\s,]+/)
         .filter(Boolean)
         .map(Number);
      const label =
         arg(args, 'label') ??
         `snapshot-${compact(new Date().toISOString())}`;
      if (
         games.length === 0 ||
         games.some((g) => String(g).length !== 10)
      ) {
         throw new Error('--games <id,id,...> is required');
      }
      const used = await snapshot(opts, games, label, budget);
      console.log(`${used} requests`);
   } else {
      throw new Error(
         `Unknown command '${command}'; use campaign or snapshot`,
      );
   }
}

if (import.meta.main) {
   main(process.argv.slice(2)).catch((error) => {
      console.error(error);
      process.exit(1);
   });
}

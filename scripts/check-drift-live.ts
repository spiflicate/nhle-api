/**
 * Poll in-progress games and compare every response with the drift
 * baseline, recording each endpoint's game-state changes.
 *
 *    bun scripts/check-drift-live.ts                     # today's games
 *    bun scripts/check-drift-live.ts --game 2026020186   # (repeatable)
 *    bun scripts/check-drift-live.ts --report live.md --max-min 300
 *    bun scripts/check-drift-live.ts --update            # accept live shapes
 *
 * Options:
 *    --game <id>        watch this game; default: every game today that
 *                       isn't OFF yet (games that haven't started are
 *                       watched from the scoreboard until they do)
 *    --date <date>      the NHL date to read games from (default: today)
 *    --interval <s>     seconds between polls (default 10)
 *    --slow-every <n>   poll the heavier endpoints every n polls per game
 *                       (default 6), staggered across games
 *    --max-min <n>      stop after n minutes (default 360)
 *    --report <path>    write the Markdown report there
 *    --update           merge every live shape into the baseline
 *
 * Every poll calls `gc.score` and each watched game's landing. The rest
 * of the game-scoped endpoints, and the scoreboard and schedule, run on
 * the slow cadence, and right after a game changes state so every state
 * gets a full set of responses. Stops when every watched game is OFF,
 * after --max-min, or on Ctrl-C, and writes the report either way; with
 * --report it also rewrites the report every slow cycle while running.
 *
 * Fails when a response has a field the baseline lacks, a field of a new
 * type, or a game state or position code the types don't declare, or a
 * call fails in a way a later poll can't fix (not network, server, rate
 * limit or not found). Missing fields are fine: the baseline is a
 * finished game.
 */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { gc } from '#/api/index.ts';
import type { APIResult } from '#/client/types.ts';
import { config } from '#/config/index.ts';
import { ErrorCategory, NHLError } from '#/errors/index.ts';
import { getCurrentNHLDate } from '#/utils/date.ts';
import { BASELINE_PATH } from './check-drift.ts';
import {
   describeTransition,
   hasStarted,
   LiveRun,
   liveReport,
   selectGames,
   type WatchedGame,
} from './drift/live.ts';
import type { Shape } from './drift/shape.ts';

/** Errors a later poll may not see: not drift */
const TRANSIENT = new Set<string>([
   ErrorCategory.NETWORK,
   ErrorCategory.SERVER,
   ErrorCategory.RATE_LIMIT,
]);

interface GameEndpoint {
   name: string;
   run: (game: WatchedGame) => Promise<APIResult<unknown>> | undefined;
}

/** The latest goal per game, for the replay endpoints */
const goals = new Map<number, number>();

function rememberGoal(game: WatchedGame, data: unknown) {
   type Play = { typeDescKey?: string; eventId?: number };
   const plays = (data as { plays?: Play[] })?.plays ?? [];
   const goal = [...plays].reverse().find((p) => p.typeDescKey === 'goal');
   if (typeof goal?.eventId === 'number') goals.set(game.id, goal.eventId);
}

/** Polled every time, so short states (OVER) are caught */
const FAST: GameEndpoint[] = [
   { name: 'gc.game.landing', run: (g) => gc.game.landing(g.id) },
];

/** Polled on the slow cadence and after a state change */
const SLOW: GameEndpoint[] = [
   { name: 'gc.game.boxscore', run: (g) => gc.game.boxscore(g.id) },
   { name: 'gc.game.playByPlay', run: (g) => gc.game.playByPlay(g.id) },
   { name: 'gc.game.reports', run: (g) => gc.game.reports(g.id) },
   {
      name: 'gc.game.wsc.gameStory',
      run: (g) => gc.game.wsc.gameStory(g.id),
   },
   {
      name: 'gc.game.wsc.playByPlay',
      run: (g) => gc.game.wsc.playByPlay(g.id),
   },
   {
      name: 'gc.game.pptReplay.goal',
      run: (g) => {
         const event = goals.get(g.id);
         return event === undefined
            ? undefined
            : gc.game.pptReplay.goal(g.id, event);
      },
   },
   {
      name: 'gc.game.pptReplay.event',
      run: (g) => {
         const event = goals.get(g.id);
         return event === undefined
            ? undefined
            : gc.game.pptReplay.event(g.id, event);
      },
   },
   { name: 'gc.misc.meta.game', run: (g) => gc.misc.meta.game(g.id) },
];

/** Every live endpoint name, for the coverage test */
export const LIVE_CHECKS: readonly string[] = [
   'gc.score',
   'gc.scoreboard',
   'gc.game.schedule',
   ...FAST.map((e) => e.name),
   ...SLOW.map((e) => e.name),
];

function option(args: string[], name: string): string | undefined {
   const at = args.indexOf(name);
   return at >= 0 ? args[at + 1] : undefined;
}

function number(args: string[], name: string, fallback: number): number {
   const value = option(args, name);
   if (value === undefined) return fallback;
   const n = Number(value);
   if (!Number.isFinite(n) || n <= 0) {
      throw new Error(`${name} needs a positive number, got ${value}`);
   }
   return n;
}

async function attempt(
   run: () => Promise<APIResult<unknown>> | undefined,
): Promise<APIResult<unknown> | undefined> {
   try {
      return await run();
   } catch (error) {
      return {
         success: false,
         error:
            error instanceof NHLError
               ? error
               : new NHLError(String(error), ErrorCategory.CLIENT),
      };
   }
}

async function main() {
   const args = process.argv.slice(2);
   const ids = args.flatMap((a, i) =>
      args[i - 1] === '--game' ? [Number(a)] : [],
   );
   const date = option(args, '--date') ?? getCurrentNHLDate();
   const interval = number(args, '--interval', 10) * 1000;
   const slowEvery = Math.round(number(args, '--slow-every', 6));
   const maxMs = number(args, '--max-min', 360) * 60_000;
   const reportPath = option(args, '--report');
   const update = args.includes('--update');

   config.logLevel = 'silent';
   config.timeout = 15_000;
   const baseline: Record<string, Shape> = JSON.parse(
      readFileSync(BASELINE_PATH, 'utf8'),
   );

   const first = await gc.score(date);
   if (!first.success) {
      console.error(`gc.score(${date}) failed: ${first.error.message}`);
      process.exit(1);
   }
   const games = selectGames(first.data, ids);
   if (games.length === 0) {
      console.log(`No games to watch on ${date}.`);
      return;
   }
   const run = new LiveRun(games, baseline);
   console.log(
      `Watching ${games.length} games on ${date}: ${games.map((g) => `${g.id} ${g.label}`).join(', ')}`,
   );

   let printed = 0;
   let found = 0;
   const call = async (
      name: string,
      fn: () => Promise<APIResult<unknown>> | undefined,
      game?: WatchedGame,
   ): Promise<WatchedGame[]> => {
      const result = await attempt(fn);
      if (!result) return [];
      const at = new Date();
      if (!result.success) {
         run.fail(
            name,
            `${result.error.name}: ${result.error.message}`,
            TRANSIENT.has(result.error.category) ||
               result.error.name === 'NotFoundError',
            at,
         );
         return [];
      }
      if (name === 'gc.game.playByPlay' && game) {
         rememberGoal(game, result.data);
      }
      const changed = run.observe(name, result.data, at, game);
      for (const t of run.transitions.slice(printed)) {
         console.log(describeTransition(t));
      }
      printed = run.transitions.length;
      if (run.findings.size > found) {
         for (const f of [...run.findings.values()].slice(found)) {
            console.log(`  ❌ ${f.check}: ${f.text}`);
         }
         found = run.findings.size;
      }
      return changed;
   };

   const deadline = run.startedAt.getTime() + maxMs;
   /** Games that changed state, for a full poll on the next tick */
   let burst = new Set<number>();
   /** Games polled once more after reaching OFF */
   const finished = new Set<number>();
   let stopReason = 'time limit reached';
   let stopping = false;
   process.on('SIGINT', () => {
      stopReason = 'interrupted';
      stopping = true;
   });

   const record = () => {
      const endedAt = new Date();
      const text = liveReport(run, endedAt, {
         date,
         updated: update,
         stopReason,
      });
      if (reportPath) writeFileSync(reportPath, text);
      if (process.env.GITHUB_STEP_SUMMARY) {
         appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
      }
      return text;
   };

   // The first score response counts too
   run.observe('gc.score', first.data, new Date());
   for (const t of run.transitions) console.log(describeTransition(t));
   printed = run.transitions.length;

   for (let tick = 0; !stopping; tick++) {
      run.ticks++;
      const next = new Set<number>();
      const mark = (changed: WatchedGame[]) => {
         for (const g of changed) next.add(g.id);
      };
      const active = games.filter((g) => {
         const state = run.latest.get(g.id);
         return (
            (state === 'PRE' || hasStarted(state) || state === 'OFF') &&
            !finished.has(g.id)
         );
      });

      if (tick > 0) mark(await call('gc.score', () => gc.score(date)));
      const slowDate = tick % slowEvery === 0;
      for (const [i, game] of active.entries()) {
         const slow =
            burst.has(game.id) ||
            (tick + i) % slowEvery === 0 ||
            run.latest.get(game.id) === 'OFF';
         for (const e of FAST) {
            mark(await call(e.name, () => e.run(game), game));
         }
         if (!slow) continue;
         for (const e of SLOW) {
            mark(await call(e.name, () => e.run(game), game));
         }
         if (run.latest.get(game.id) === 'OFF') finished.add(game.id);
      }
      if (slowDate || next.size > 0) {
         mark(await call('gc.scoreboard', () => gc.scoreboard()));
         mark(await call('gc.game.schedule', () => gc.game.schedule(date)));
      }
      burst = next;
      // Keep a report on disk in case the run is killed
      if (reportPath && tick % slowEvery === 0) {
         writeFileSync(
            reportPath,
            liveReport(run, new Date(), {
               date,
               stopReason: 'still running',
            }),
         );
      }

      if (games.every((g) => finished.has(g.id))) {
         stopReason = 'every game is OFF';
         break;
      }
      if (Date.now() >= deadline) break;
      // Nothing to poll closely until a game is about to start
      const wait = active.length === 0 ? interval * slowEvery : interval;
      const until = Date.now() + Math.min(wait, deadline - Date.now());
      while (!stopping && Date.now() < until) {
         await Bun.sleep(Math.min(1000, until - Date.now()));
      }
   }

   if (update) {
      if (run.unknownValues.length > 0) {
         record();
         console.log(
            '\nNot updating: unknown game states or position codes need a type change.',
         );
         process.exit(1);
      }
      writeFileSync(
         BASELINE_PATH,
         `${JSON.stringify(run.updatedBaseline(), null, 3)}\n`,
      );
      console.log(`\nWrote ${BASELINE_PATH}`);
   }
   record();
   console.log(
      `\n${run.ticks} polls, ${run.requests} requests, ${run.failing()} findings. Stopped: ${stopReason}.`,
   );
   if (run.failing() > 0 && !update) process.exit(1);
}

if (import.meta.main) await main();

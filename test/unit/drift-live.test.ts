/**
 * The live-game drift check (scripts/check-drift-live.ts): game
 * selection, state tracking, findings and the report.
 */
import { describe, expect, test } from 'bun:test';
import { LIVE_CHECKS } from '../../scripts/check-drift-live.ts';
import baseline from '../../scripts/drift/baseline.json' with {
   type: 'json',
};
import { checks } from '../../scripts/drift/checks.ts';
import {
   describeTransition,
   hasStarted,
   LiveRun,
   liveOnly,
   liveReport,
   selectGames,
   statusOf,
   withLive,
} from '../../scripts/drift/live.ts';
import liveBaseline from '../../scripts/drift/live-baseline.json' with {
   type: 'json',
};
import { shapeOf } from '../../scripts/drift/shape.ts';

const score = {
   games: [
      {
         id: 1,
         gameState: 'OFF',
         awayTeam: { abbrev: 'BOS' },
         homeTeam: { abbrev: 'MTL' },
      },
      {
         id: 2,
         gameState: 'LIVE',
         startTimeUTC: '2026-11-06T00:00:00Z',
         awayTeam: { abbrev: 'TOR' },
         homeTeam: { abbrev: 'CGY' },
         periodDescriptor: { number: 3, periodType: 'REG' },
         clock: { timeRemaining: '04:49', inIntermission: false },
      },
      {
         id: 3,
         gameState: 'FUT',
         awayTeam: { abbrev: 'NSH' },
         homeTeam: { abbrev: 'COL' },
      },
   ],
};

const TOR = { id: 2, label: 'TOR@CGY' };

describe('selectGames', () => {
   test('watches every game that is not OFF by default', () => {
      expect(selectGames(score)).toEqual([
         { id: 2, label: 'TOR@CGY', startTimeUTC: '2026-11-06T00:00:00Z' },
         { id: 3, label: 'NSH@COL' },
      ]);
   });

   test('watches the games asked for, even ones missing from the day', () => {
      expect(selectGames(score, [1, 99])).toEqual([
         { id: 1, label: 'BOS@MTL' },
         { id: 99, label: '99' },
      ]);
   });

   test('copes with a response without games', () => {
      expect(selectGames({})).toEqual([]);
      expect(selectGames(null)).toEqual([]);
   });
});

describe('statusOf', () => {
   test('reads a game-scoped response', () => {
      expect(
         statusOf(
            {
               id: 2,
               gameState: 'CRIT',
               periodDescriptor: { number: 2, periodType: 'REG' },
               clock: { timeRemaining: '12:10', inIntermission: true },
            },
            2,
         ),
      ).toEqual({ state: 'CRIT', moment: 'P2 REG INT 12:10' });
   });

   test('finds the game in a date-scoped response', () => {
      expect(statusOf(score, 2)).toEqual({
         state: 'LIVE',
         moment: 'P3 REG 04:49',
      });
      expect(
         statusOf(
            { gameWeek: [{ games: [{ id: 3, gameState: 'FUT' }] }] },
            3,
         ),
      ).toEqual({ state: 'FUT' });
   });

   test('is undefined for another game or no state', () => {
      expect(statusOf({ id: 5, gameState: 'LIVE' }, 2)).toBeUndefined();
      expect(statusOf(score, 42)).toBeUndefined();
      expect(statusOf({ id: 2 }, 2)).toBeUndefined();
   });

   test('reads a game-scoped response without an id', () => {
      expect(statusOf({ gameState: 'OVER' }, 2)).toEqual({ state: 'OVER' });
   });
});

test('hasStarted', () => {
   expect(
      ['FUT', 'PRE', 'LIVE', 'CRIT', 'OVER', 'FINAL', 'OFF'].filter(
         hasStarted,
      ),
   ).toEqual(['LIVE', 'CRIT', 'OVER', 'FINAL']);
   expect(hasStarted(undefined)).toBeFalse();
});

describe('LiveRun', () => {
   const base = {
      'gc.game.landing': shapeOf({ id: 1, gameState: 'OFF', venue: 'x' }),
   };
   const at = (s: number) => new Date(Date.UTC(2026, 10, 6, 3, 0, s));

   test('records each state change per endpoint', () => {
      const run = new LiveRun([TOR], base, at(0));
      expect(
         run.observe(
            'gc.game.landing',
            { id: 2, gameState: 'CRIT' },
            at(1),
            TOR,
         ),
      ).toEqual([]);
      expect(
         run.observe(
            'gc.game.landing',
            { id: 2, gameState: 'CRIT' },
            at(2),
            TOR,
         ),
      ).toEqual([]);
      expect(
         run.observe(
            'gc.game.landing',
            { id: 2, gameState: 'OVER' },
            at(3),
            TOR,
         ),
      ).toEqual([TOR]);
      expect(run.transitions.map((t) => [t.from, t.to])).toEqual([
         [undefined, 'CRIT'],
         ['CRIT', 'OVER'],
      ]);
      expect(describeTransition(run.transitions[1] as never)).toBe(
         '03:00:03 2 TOR@CGY [gc.game.landing] CRIT -> OVER',
      );
      expect([
         ...(run.coverage.get('gc.game.landing')?.states ?? []),
      ]).toEqual(['CRIT', 'OVER']);
   });

   test('keeps the furthest state a game reached', () => {
      const run = new LiveRun([TOR], base);
      run.observe(
         'gc.game.landing',
         { id: 2, gameState: 'FINAL' },
         at(1),
         TOR,
      );
      run.observe(
         'gc.score',
         { games: [{ id: 2, gameState: 'CRIT' }] },
         at(2),
      );
      expect(run.latest.get(2)).toBe('FINAL');
   });

   test('reports added fields once with where they were first seen', () => {
      const run = new LiveRun([TOR], base);
      const live = {
         id: 2,
         gameState: 'LIVE',
         situation: { code: '1451' },
         periodDescriptor: { number: 1, periodType: 'REG' },
      };
      run.observe('gc.game.landing', live, at(1), TOR);
      run.observe('gc.game.landing', live, at(2), TOR);
      const findings = [...run.findings.values()];
      expect(findings.map((f) => f.text).sort()).toEqual([
         'added `$.periodDescriptor` (object)',
         'added `$.situation` (object)',
      ]);
      expect(findings[0]?.count).toBe(2);
      expect(findings[0]?.game).toEqual(TOR);
      expect(findings[0]?.status).toEqual({
         state: 'LIVE',
         moment: 'P1 REG',
      });
      expect(run.failing()).toBe(2);
   });

   test('only notes baseline fields a live response lacks', () => {
      const run = new LiveRun([TOR], base);
      run.observe(
         'gc.game.landing',
         { id: 2, gameState: 'LIVE' },
         at(1),
         TOR,
      );
      expect(run.findings.size).toBe(0);
      expect(
         run
            .unseen()
            .get('gc.game.landing')
            ?.map((c) => c.path),
      ).toEqual(['$.venue']);
   });

   test('flags an undeclared game state', () => {
      const run = new LiveRun([TOR], base);
      run.observe(
         'gc.game.landing',
         { id: 2, gameState: 'WAT', venue: 'x' },
         at(1),
         TOR,
      );
      expect([...run.findings.values()].map((f) => f.text)).toEqual([
         'unknown game state `WAT` at `$.gameState`',
      ]);
      expect(run.unknownValues).toHaveLength(1);
   });

   test('counts only errors a later poll cannot fix as failing', () => {
      const run = new LiveRun([TOR], base);
      run.fail('gc.game.reports', 'NotFoundError: 404', true, at(1));
      run.fail('gc.game.reports', 'NotFoundError: 404', true, at(2));
      expect(run.failing()).toBe(0);
      run.fail('gc.game.boxscore', 'ParseError: bad JSON', false, at(3));
      expect(run.failing()).toBe(1);
      expect([...run.errors.values()][0]?.count).toBe(2);
      expect(run.requests).toBe(3);
   });

   test('merges live shapes into the baseline for --update', () => {
      const run = new LiveRun([TOR], base);
      run.observe(
         'gc.game.landing',
         { id: 2, gameState: 'LIVE', clock: {} },
         at(1),
         TOR,
      );
      const next = run.updatedBaseline();
      expect(next['gc.game.landing']).toEqual({
         $: 'object',
         '$.clock': 'object',
         '$.gameState': 'string',
         '$.id': 'number',
         '$.venue': 'string',
      });
   });
});

describe('liveReport', () => {
   test('shows coverage, findings and the timeline', () => {
      const run = new LiveRun(
         [TOR],
         {
            'gc.game.landing': shapeOf({ id: 1, gameState: 'OFF' }),
         },
         new Date('2026-11-06T03:00:00Z'),
      );
      run.ticks = 2;
      run.observe(
         'gc.game.landing',
         { id: 2, gameState: 'CRIT', sog: 1 },
         new Date('2026-11-06T03:00:10Z'),
         TOR,
      );
      run.observe(
         'gc.game.landing',
         { id: 2, gameState: 'OVER' },
         new Date('2026-11-06T03:00:20Z'),
         TOR,
      );
      const text = liveReport(run, new Date('2026-11-06T03:01:00Z'), {
         stopReason: 'interrupted',
         date: '2026-11-05',
      });
      expect(text).toContain(
         'Watched 1 game from 03:00:00 to 03:01:00 UTC, games of 2026-11-05: 2 polls, 2 requests. Stopped: interrupted.',
      );
      expect(text).toContain('| 2 | TOR@CGY | OVER |');
      expect(text).toContain(
         '| `gc.game.landing` | 2 | 0 |  |  |  | ✅ | ✅ |  |  |',
      );
      expect(text).toContain(
         '- added `$.sog` (number): first seen 03:00:10 in 2 TOR@CGY CRIT, 1 response',
      );
      expect(text).toContain(
         '03:00:20 2 TOR@CGY [gc.game.landing] CRIT -> OVER',
      );
      expect(text).toContain('## Next steps');
   });

   test('says so when everything matched', () => {
      const run = new LiveRun([TOR], {});
      expect(liveReport(run, new Date())).toContain(
         'Every live response matches the baseline.',
      );
   });
});

test('every live endpoint has a daily check and a baseline', () => {
   const names = new Set(checks.map((c) => c.name));
   for (const name of LIVE_CHECKS) {
      expect(names.has(name)).toBeTrue();
      expect(name in baseline).toBeTrue();
   }
});

describe('live baseline', () => {
   const daily = {
      landing: { $: 'object', '$.a': 'string', '$.b': 'number' },
   };
   const merged = {
      landing: {
         $: 'object',
         '$.a': 'string',
         '$.b': 'number|string',
         '$.odds': 'array',
      },
   };

   test('liveOnly keeps what the daily baseline lacks', () => {
      expect(liveOnly(daily, merged)).toEqual({
         landing: { '$.b': 'number|string', '$.odds': 'array' },
      });
      expect(liveOnly(daily, daily)).toEqual({});
   });

   test('withLive restores the merged shapes', () => {
      expect(withLive(daily, liveOnly(daily, merged))).toEqual(merged);
   });

   test('only names checks that are polled live', () => {
      for (const check of Object.keys(liveBaseline)) {
         expect(LIVE_CHECKS).toContain(check);
      }
   });
});

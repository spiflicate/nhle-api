import { afterEach, describe, expect, it } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
   type GameSummary,
   gameSummary,
   gameTimes,
} from '#/api/reports/index.ts';
import { parseGameTimes } from '#/api/reports/parse.ts';
import { parseGameSummary } from '#/api/reports/summary.ts';
import { config } from '#/config/index.ts';
import { NotFoundError } from '#/errors/index.ts';
import manifest from '../fixtures/reports/captured/manifest.json' with {
   type: 'json',
};

/**
 * Reports captured unchanged by scripts/report-capture; provenance for
 * each is in test/fixtures/reports/captured/manifest.json.
 */
function bytes(file: string): Buffer {
   return readFileSync(
      new URL(`../fixtures/reports/captured/${file}`, import.meta.url),
   );
}

function entry(file: string) {
   const found = manifest.fixtures.find((f) => f.file === file);
   if (!found) throw new Error(`${file} is not in the manifest`);
   return found;
}

function summary(file: string): GameSummary {
   const { gameId, context } = entry(file);
   const result = parseGameSummary(
      gameId,
      bytes(file).toString('utf8'),
      context?.startTimeUTC ? new Date(context.startTimeUTC) : undefined,
   );
   if (!result.success) throw result.error;
   return result.data;
}

describe('captured report fixtures', () => {
   it.each(manifest.fixtures.map((f) => [f.file, f]))(
      '%s is unchanged since capture',
      (file, { sha256, bodyBytes }) => {
         const body = bytes(file as string);
         expect(body.byteLength).toBe(bodyBytes as number);
         expect(createHash('sha256').update(body).digest('hex')).toBe(
            sha256 as string,
         );
      },
   );
});

describe('Game Summary finals captured after the fact', () => {
   it('reads a regular-season overtime game', () => {
      const s = summary('GS020674-final-ot.HTM');
      expect(s.status).toBe('Final');
      expect(s.byPeriod.away.map((p) => p.period)).toEqual([
         '1',
         '2',
         '3',
         'OT',
         'TOT',
      ]);
      expect(s.goals.at(-1)?.period).toBe('OT');
      expect(s.times.end).not.toBeNull();
      expect(s.stars).toHaveLength(3);
   });

   it('keeps the printed shootout-deciding entry as an SO row', () => {
      const s = summary('GS020673-final-so.HTM');
      expect([s.awayTeam.score, s.homeTeam.score]).toEqual([2, 1]);
      expect(s.goals).toHaveLength(3);
      expect(s.goals[2]).toEqual({
         number: 3,
         period: 'SO',
         time: '',
         strength: '',
         team: 'DAL',
         scorer: '21 J.ROBERTSON',
         assists: [],
         onIce: { away: [], home: [] },
      });
      // Period totals stop at OT; the shootout goal isn't in them
      expect(s.byPeriod.away.map((p) => [p.period, p.goals])).toEqual([
         ['1', 0],
         ['2', 1],
         ['3', 0],
         ['OT', 0],
         ['TOT', 1],
      ]);
   });

   it('numbers playoff overtime periods 4 and 5', () => {
      const s = summary('GS030157-final-2ot.HTM');
      expect([s.awayTeam.score, s.homeTeam.score]).toEqual([3, 4]);
      expect(s.byPeriod.home.map((p) => p.period)).toEqual([
         '1',
         '2',
         '3',
         '4',
         '5',
         'TOT',
      ]);
      expect(s.goals.at(-1)).toMatchObject({ period: '5', time: '16:10' });
      expect(
         s.goalies.away.find((g) => g.sweaterNumber === 50)?.timeOnIce
            .total,
      ).toBe('96:10');
   });

   it('gives null, not zero, for periods a goalie did not play', () => {
      const home = summary('GS020671-final-goalie-change.HTM').goalies.home;
      const shots = (n: number) =>
         home
            .find((g) => g.sweaterNumber === n)
            ?.goalsShotsAgainst.map((p) => [p.period, p.goals, p.shots]);
      expect(shots(39)).toEqual([
         ['1', 3, 7],
         ['2', 2, 10],
         ['3', null, null],
         ['TOT', 5, 17],
      ]);
      expect(shots(35)).toEqual([
         ['1', null, null],
         ['2', 0, 2],
         ['3', 0, 3],
         ['TOT', 0, 5],
      ]);
      expect(home.at(-1)?.kind).toBe('team-total');
   });
});

/**
 * One game's Game Summary captured every 10 minutes from 5 hours before
 * puck drop to an hour after the final (BUF @ SJS, 2026-10-27, decided in
 * regulation). See docs/report-lifecycle.md for the full timeline.
 */
describe('Game Summary lifecycle (2026020198)', () => {
   const gs = (stage: string) => summary(`GS020198-${stage}.HTM`);

   it('prints every section from publication, with nothing in them yet', () => {
      const s = gs('02-published');
      expect(s.status).toBe('');
      expect(s.times).toEqual({
         date: '2026-10-27',
         start: null,
         end: null,
      });
      expect([s.awayTeam.score, s.homeTeam.score]).toEqual([0, 0]);
      // Attendance comes later; the venue is printed alone until then
      expect(s.attendance).toBeNull();
      expect(s.venue).toBe('SAP Center at San Jose');
      expect(s.goals).toEqual([]);
      expect(s.penalties).toEqual({ away: [], home: [] });
      // No period rows at all before play, not rows of zeros
      expect(s.byPeriod).toEqual({ away: [], home: [] });
      expect(s.powerPlays).toEqual({ away: [], home: [] });
      expect(s.evenStrength).toEqual({ away: [], home: [] });
      expect(s.stars).toEqual([]);
      // Officials and the dressed goalies are known before the game
      expect(s.officials.referees).toHaveLength(2);
      expect(s.officials.linespeople).toHaveLength(2);
      expect(
         s.goalies.away.map((g) => [g.sweaterNumber, g.timeOnIce.total]),
      ).toEqual([
         [1, null],
         [92, null],
         [null, null],
      ]);
   });

   it('prints a status line shortly before the start, still without a start time', () => {
      const s = gs('03-pregame-status');
      expect(s.status).toBe('Period 1 (20:00 Remaining)');
      expect(s.times.start).toBeNull();
   });

   it('has a start but no end once live, with sparse totals', () => {
      const s = gs('04-early-live');
      expect(s.times).toEqual({
         date: '2026-10-27',
         start: { local: '7:50', zone: 'PDT', utc: '2026-10-28T02:50:00Z' },
         end: null,
      });
      expect(s.goals).toEqual([]);
      expect(s.penalties).toEqual({ away: [], home: [] });
      // Known zeros now, unlike the pre-game empty table
      expect(
         s.byPeriod.away.map((p) => [p.period, p.goals, p.shots]),
      ).toEqual([
         ['1', 0, 0],
         ['TOT', 0, 0],
      ]);
      // The goalie's own cells stay blank until he faces a shot; the team
      // total already reads 0-0
      const starter = s.goalies.away[1];
      const total = s.goalies.away.at(-1);
      expect(starter?.timeOnIce.total).toBe('00:59');
      expect(starter?.goalsShotsAgainst.at(-1)).toEqual({
         period: 'TOT',
         goals: null,
         shots: null,
      });
      expect(total?.goalsShotsAgainst.at(-1)).toEqual({
         period: 'TOT',
         goals: 0,
         shots: 0,
      });
   });

   it('leaves out the placeholder stars printed during the game', () => {
      const s = gs('05-live-placeholder-stars');
      expect(
         bytes('GS020198-05-live-placeholder-stars.HTM').toString(),
      ).toContain('3 STARS');
      expect(s.stars).toEqual([]);
      expect(s.attendance).toBe(14900);
      expect(s.venue).toBe('SAP Center at San Jose');
   });

   it('reads an intermission', () => {
      const s = gs('06-intermission');
      expect(s.status).toBe('End of Period 1');
      expect(s.times.end).toBeNull();
      expect(s.goals).toEqual([]);
      expect([s.penalties.away.length, s.penalties.home.length]).toEqual([
         2, 1,
      ]);
   });

   it('reads partial period, goalie and strength totals late in the game', () => {
      const s = gs('07-late-live');
      expect(s.status).toBe('Period 3 (05:43 Remaining)');
      expect(s.times.end).toBeNull();
      expect(s.goals.map((g) => [g.period, g.time, g.team])).toEqual([
         ['2', '0:50', 'BUF'],
      ]);
      expect(s.byPeriod.home.map((p) => [p.period, p.shots])).toEqual([
         ['1', 12],
         ['2', 4],
         ['3', 4],
         ['TOT', 20],
      ]);
      expect(s.goalies.away.map((g) => g.kind)).toEqual([
         'goalie',
         'goalie',
         'empty-net',
         'team-total',
      ]);
      expect(s.goalies.away.at(-1)?.timeOnIce.total).toBe('54:04');
   });

   it('has the end time and stars as soon as it reads Final', () => {
      const s = gs('08-first-final');
      expect(s.status).toBe('Final');
      expect(s.times.end).toEqual({
         local: '10:21',
         zone: 'PDT',
         utc: '2026-10-28T05:21:00Z',
      });
      expect([s.awayTeam.score, s.homeTeam.score]).toEqual([2, 0]);
      expect(s.goals.at(-1)?.strength).toBe('EV-EN');
      expect(s.stars.map((star) => star.player)).toEqual([
         '92 C.ELLIS',
         '30 Y.ASKAROV',
         '8 O.ZELLWEGER',
      ]);
   });

   it('reflects a correction made after the first final', () => {
      const first = gs('08-first-final');
      const settled = gs('09-settled-final');
      const shots = (s: GameSummary) =>
         s.byPeriod.home.map((p) => [p.period, p.shots]);
      expect(shots(first).slice(-2)).toEqual([
         ['3', 8],
         ['TOT', 24],
      ]);
      expect(shots(settled).slice(-2)).toEqual([
         ['3', 7],
         ['TOT', 23],
      ]);
      expect(
         settled.goalies.away
            .find((g) => g.sweaterNumber === 92)
            ?.goalsShotsAgainst.at(-1),
      ).toEqual({ period: 'TOT', goals: 0, shots: 23 });
      // Nothing else changed
      expect({
         ...settled,
         byPeriod: first.byPeriod,
         goalies: first.goalies,
      }).toEqual(first);
   });

   it('reflects the next-day revision', () => {
      const settled = gs('09-settled-final');
      const nextDay = gs('10-next-day');
      const shots = (s: GameSummary) =>
         s.byPeriod.away.map((p) => [p.period, p.shots]);
      expect(shots(settled)).toEqual([
         ['1', 16],
         ['2', 14],
         ['3', 10],
         ['TOT', 40],
      ]);
      expect(shots(nextDay)).toEqual([
         ['1', 17],
         ['2', 14],
         ['3', 10],
         ['TOT', 41],
      ]);
      expect(
         nextDay.goalies.home
            .find((g) => g.sweaterNumber === 30)
            ?.goalsShotsAgainst.at(-1),
      ).toEqual({ period: 'TOT', goals: 1, shots: 40 });
      // Nothing else changed
      expect({
         ...nextDay,
         byPeriod: settled.byPeriod,
         goalies: settled.goalies,
      }).toEqual(settled);
   });

   it('rejects a sheet cut off before </html> but still reads its times', () => {
      const html = bytes('GS020198-09-settled-final.HTM').toString('utf8');
      const cut = html.slice(0, html.indexOf('3 STARS'));
      const result = parseGameSummary(
         2026020198,
         cut,
         new Date('2026-10-28T02:30:00Z'),
      );
      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error.message).toContain('truncated');
      expect(
         parseGameTimes(cut, new Date('2026-10-28T02:30:00Z')),
      ).toMatchObject({ success: true, data: { end: { local: '10:21' } } });
   });
});

describe('reports on captured responses', () => {
   const originalFetch = globalThis.fetch;
   const originalLevel = config.logLevel;
   afterEach(() => {
      globalThis.fetch = originalFetch;
      config.logLevel = originalLevel;
   });
   /** Serve a captured report with its captured status */
   function serve(file: string) {
      const { status } = entry(file);
      const calls: string[] = [];
      config.logLevel = 'silent';
      globalThis.fetch = (async (url: string) => {
         calls.push(url);
         return url.includes('htmlreports')
            ? new Response(new Uint8Array(bytes(file)), {
                 status: status ?? 200,
              })
            : new Response(
                 JSON.stringify({ startTimeUTC: '2026-10-28T02:30:00Z' }),
              );
      }) as typeof fetch;
      return calls;
   }

   it.each([
      ['gameSummary', () => gameSummary(2026020198)],
      ['gameSummary raw', () => gameSummary(2026020198, { raw: true })],
      ['gameTimes', () => gameTimes(2026020198)],
   ])(
      'gives a NotFoundError for the real pre-publication 404 (%s)',
      async (_, call) => {
         serve('GS020198-01-not-published.HTM');
         const result = await call();
         expect(result.success).toBeFalse();
         if (!result.success)
            expect(result.error).toBeInstanceOf(NotFoundError);
      },
   );

   it('returns a live sheet unchanged in raw mode, without a boxscore request', async () => {
      const calls = serve('GS020198-07-late-live.HTM');
      const result = await gameSummary(2026020198, { raw: true });
      expect(result).toEqual({
         success: true,
         data: bytes('GS020198-07-late-live.HTM').toString('utf8'),
      });
      expect(calls).toEqual([
         'https://www.nhl.com/scores/htmlreports/20262027/GS020198.HTM',
      ]);
   });

   it('gives gameTimes for a published sheet before the game', async () => {
      serve('GS020198-02-published.HTM');
      expect(await gameTimes(2026020198)).toEqual({
         success: true,
         data: { date: '2026-10-27', start: null, end: null },
      });
   });
});

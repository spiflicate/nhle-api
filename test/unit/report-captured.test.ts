import { describe, expect, it } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { GameSummary } from '#/api/reports/index.ts';
import { parseGameSummary } from '#/api/reports/summary.ts';
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

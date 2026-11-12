import { afterEach, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import {
   type GameSummary,
   gameSummary,
   gameTimes,
} from '#/api/reports/index.ts';
import { parseGameSummary } from '#/api/reports/summary.ts';
import type { APIResult } from '#/client/types.ts';
import { config } from '#/config/index.ts';
import {
   NotFoundError,
   ParseError,
   ValidationError,
} from '#/errors/index.ts';
import baseline from '../../scripts/drift/baseline.json' with {
   type: 'json',
};
import { shapeOf } from '../../scripts/drift/shape.ts';

const FIXTURE = readFileSync(
   new URL('../fixtures/reports/GS020180.HTM', import.meta.url),
   'utf8',
);
const GAME = 2026020180;
const START = '2026-10-25T19:00:00Z';
function parsed(html = FIXTURE): GameSummary {
   const result = parseGameSummary(GAME, html, new Date(START));
   if (!result.success) throw result.error;
   return result.data;
}

describe('Game Summary parser', () => {
   it('matches the checked-in drift baseline from the saved GS fixture', () => {
      expect(shapeOf(parsed())).toEqual(baseline['reports.gameSummary']);
   });
   it('reads teams, scores, attendance, venue, status and times', () => {
      const summary = parsed();
      expect(summary.gameId).toBe(GAME);
      expect(summary.source).toBe('html');
      expect(summary.awayTeam).toEqual({
         name: 'FLORIDA PANTHERS',
         score: 3,
      });
      expect(summary.homeTeam).toEqual({
         name: 'CHICAGO BLACKHAWKS',
         score: 2,
      });
      expect(summary.attendance).toBe(18117);
      expect(summary.venue).toBe('United Center');
      expect(summary.status).toBe('Final');
      expect(summary.times.start?.utc).toBe('2026-10-25T19:16:00Z');
   });
   it('parses goals, assists and both on-ice sweater lists without inventing player IDs', () => {
      const goals = parsed().goals;
      expect(goals).toHaveLength(5);
      expect(goals[0]).toEqual({
         number: 1,
         period: '1',
         time: '2:34',
         strength: 'EV',
         team: 'CHI',
         scorer: '20 R.GREENE(1)',
         assists: ['26 A.MANGIAPANE(1)', '14 K.KORCHINSKI(1)'],
         onIce: {
            away: [6, 7, 14, 21, 40, 79],
            home: [6, 14, 20, 22, 26, 30],
         },
      });
      expect(goals[4]?.assists).toEqual(['5 A.EKBLAD(4)']);
   });
   it('handles nested player tables in penalties and separates the teams', () => {
      const penalties = parsed().penalties;
      expect(penalties.away).toHaveLength(7);
      expect(penalties.home).toHaveLength(5);
      expect(penalties.away[0]).toEqual({
         number: 1,
         period: '1',
         time: '3:25',
         player: '19 M.TKACHUK',
         minutes: 2,
         penalty: 'Slashing',
      });
   });
   it('parses period totals and strength breakdowns', () => {
      const summary = parsed();
      expect(summary.byPeriod.away.at(-1)).toEqual({
         period: 'TOT',
         goals: 3,
         shots: 34,
         penalties: 7,
         penaltyMinutes: 16,
      });
      expect(summary.byPeriod.home.at(-1)?.shots).toBe(21);
      expect(summary.powerPlays.away[0]).toEqual({
         situation: '5v4',
         goals: 1,
         occurrences: 4,
         time: '03:52',
      });
      expect(summary.evenStrength.home.at(-1)).toEqual({
         situation: 'TOT',
         goals: 2,
         occurrences: 10,
         time: '44:13',
      });
   });
   it('preserves unused goalies, empty-net rows and team totals', () => {
      const goalies = parsed().goalies;
      expect(goalies.away).toHaveLength(4);
      expect(goalies.away[0]?.timeOnIce.total).toBeNull();
      expect(goalies.away[1]?.timeOnIce.total).toBe('59:55');
      expect(goalies.away[1]?.goalsShotsAgainst.at(-1)).toEqual({
         period: 'TOT',
         goals: 2,
         shots: 21,
      });
      expect(goalies.home[2]?.kind).toBe('empty-net');
      expect(goalies.home[2]?.sweaterNumber).toBeNull();
      expect(goalies.home[3]?.kind).toBe('team-total');
   });
   it('reads officials and the three stars', () => {
      const summary = parsed();
      expect(summary.officials.referees).toEqual([
         '#3 Christopher Schlenker',
         '#2 Jon McIsaac',
      ]);
      expect(summary.officials.linespeople).toEqual([
         '#96 David Brisebois',
         '#62 Onni Hautamaeki',
      ]);
      expect(summary.officials.standbyReferees).toEqual([]);
      expect(summary.stars[0]).toEqual({
         rank: 1,
         team: 'FLA',
         position: 'C',
         player: '20 L.ELLER',
      });
   });
   it('decodes entities and preserves Unicode', () => {
      const summary = parsed(
         FIXTURE.replace('United Center', 'Aréna &amp; Centre &#233;'),
      );
      expect(summary.venue).toBe('Aréna & Centre é');
   });
   it('preserves a shootout-deciding entry without inventing its time or strength', () => {
      const scoring = FIXTURE.indexOf('<td align="center">5</td>');
      const suffix = FIXTURE.slice(scoring)
         .replace('<td align="center">3</td>', '<td align="center">SO</td>')
         .replace(
            '<td align="center">17:37</td>',
            '<td align="center"></td>',
         )
         .replace('<td align="center">EV</td>', '<td align="center"></td>');
      const goal = parsed(FIXTURE.slice(0, scoring) + suffix).goals[4];
      expect(goal?.period).toBe('SO');
      expect(goal?.time).toBe('');
      expect(goal?.strength).toBe('');
   });
   it('handles missing attendance and unset start/end times', () => {
      const summary = parsed(
         FIXTURE.replace(
            'Attendance 18,117&nbsp;at&nbsp;United Center',
            '',
         ).replace(
            'Start&nbsp;2:16&nbsp;CDT; End&nbsp;4:48&nbsp;CDT',
            'Start; End',
         ),
      );
      expect(summary.attendance).toBeNull();
      expect(summary.venue).toBeNull();
      expect(summary.times.start).toBeNull();
      expect(summary.times.end).toBeNull();
   });
   it.each([
      ['truncated document', FIXTURE.replace('</html>', '')],
      ['missing team', FIXTURE.replace('id="Visitor"', 'id="Unknown"')],
      ['unbalanced tables', FIXTURE.replace('</table>', '')],
      [
         'invalid numeric statistic',
         FIXTURE.replace('>18,117', '>unknown').replace(
            '>34</td>',
            '>unknown</td>',
         ),
      ],
   ])('returns an explicit error for %s', (_name, html) => {
      const result = parseGameSummary(GAME, html, new Date(START));
      expect(result.success).toBeFalse();
      if (!result.success) expect(result.error).toBeInstanceOf(ParseError);
   });
});

describe('reports.gameSummary', () => {
   const originalFetch = globalThis.fetch;
   const originalLevel = config.logLevel;
   afterEach(() => {
      globalThis.fetch = originalFetch;
      config.logLevel = originalLevel;
   });
   function respond(html = FIXTURE, reportStatus = 200, boxStatus = 200) {
      const calls: string[] = [];
      config.logLevel = 'silent';
      globalThis.fetch = (async (url: string) => {
         calls.push(url);
         return url.includes('htmlreports')
            ? new Response(html, { status: reportStatus })
            : new Response(JSON.stringify({ startTimeUTC: START }), {
                 status: boxStatus,
              });
      }) as typeof fetch;
      return calls;
   }
   it('returns the broader parsed summary by default, with one GS and one boxscore request', async () => {
      const calls = respond();
      const result: APIResult<GameSummary> = await gameSummary(GAME);
      expect(result.success).toBeTrue();
      if (result.success) expect(result.data.goals).toHaveLength(5);
      expect(calls).toHaveLength(2);
   });
   it('reuses scheduledStart and returns exactly the gameTimes convenience result', async () => {
      const calls = respond();
      const summary = await gameSummary(GAME, { scheduledStart: START });
      const times = await gameTimes(GAME, { scheduledStart: START });
      expect(summary.success).toBeTrue();
      if (summary.success)
         expect(times).toEqual({ success: true, data: summary.data.times });
      expect(calls).toHaveLength(2);
      expect(calls.every((url) => url.includes('GS020180.HTM'))).toBeTrue();
   });
   it('leaves gameTimes usable when other GS sections are missing', async () => {
      respond(FIXTURE.replace('id="Visitor"', 'id="Unknown"'));
      expect(
         (await gameTimes(GAME, { scheduledStart: START })).success,
      ).toBeTrue();
      expect(
         (await gameSummary(GAME, { scheduledStart: START })).success,
      ).toBeFalse();
   });
   it('returns full raw HTML with no boxscore lookup or parsing', async () => {
      const calls = respond('unparsed report');
      const result: APIResult<string> = await gameSummary(GAME, {
         raw: true,
         scheduledStart: 'invalid',
      });
      expect(result).toEqual({ success: true, data: 'unparsed report' });
      expect(calls).toHaveLength(1);
   });
   it('validates scheduledStart before requesting parsed data', async () => {
      const calls = respond();
      const result = await gameSummary(GAME, { scheduledStart: 'invalid' });
      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error).toBeInstanceOf(ValidationError);
      expect(calls).toHaveLength(0);
   });
   it.each([false, true])(
      'propagates missing GS in raw=%s',
      async (raw) => {
         respond('missing', 404);
         const result = await gameSummary(GAME, { raw });
         expect(result.success).toBeFalse();
         if (!result.success)
            expect(result.error).toBeInstanceOf(NotFoundError);
      },
   );
   it('propagates a failed boxscore request', async () => {
      respond(FIXTURE, 200, 404);
      const result = await gameSummary(GAME);
      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error).toBeInstanceOf(NotFoundError);
   });
   it('includes the report URL in parsing errors', async () => {
      respond(FIXTURE.replace('id="Visitor"', 'id="Unknown"'));
      const result = await gameSummary(GAME);
      expect(result.success).toBeFalse();
      if (!result.success) {
         expect(result.error).toBeInstanceOf(ParseError);
         expect(result.error.context.endpoint).toContain('GS020180.HTM');
      }
   });
});

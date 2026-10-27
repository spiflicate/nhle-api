import { afterEach, describe, expect, it } from 'bun:test';
import {
   type GameSummary,
   type GameSummaryOptions,
   gameSummary,
   gameTimes,
   type RawShiftReports,
   type ShiftsOptions,
   shifts,
} from '#/api/reports/index.ts';
import {
   parseShifts,
   type ShiftChart,
   type ShiftRoster,
} from '#/api/reports/shifts.ts';
import type { APIResult } from '#/client/types.ts';
import { config } from '#/config/index.ts';
import {
   NotFoundError,
   ParseError,
   ValidationError,
} from '#/errors/index.ts';

const GAME = 2024020010;
const ROSTER: ShiftRoster = {
   id: GAME,
   homeTeam: { id: 1 },
   awayTeam: { id: 2 },
   rosterSpots: [
      { playerId: 101, teamId: 1, sweaterNumber: 9 },
      { playerId: 202, teamId: 2, sweaterNumber: 9 },
   ],
};
// Invented data, with the NHL report's player/shift/summary table structure.
function report(rows = row()): string {
   return `<html><body>TIME ON ICE<table><tr><td class="playerHeading + border">9 INVENTED, PLAYER</td></tr><tr><td>Shift #</td><td>Per</td><td>Start of Shift</td><td>End of Shift</td><td>Duration</td></tr>${rows}<tr><td>Per</td><td>SHF</td></tr><tr><td>1</td><td>1</td><td>00:10</td></tr></table></body></html>`;
}
function row(
   period = '1',
   start = '0:00 / 20:00',
   end = '0:10 / 19:50',
   duration = '00:10',
): string {
   return `<tr><td>1</td><td>${period}</td><td>${start}</td><td>${end}</td><td>${duration}</td><td>&nbsp;</td></tr>`;
}
function parsed(
   home = report(),
   away = report(),
   roster = ROSTER,
): ShiftChart {
   const result = parseShifts(GAME, home, away, roster);
   if (!result.success) throw result.error;
   return result.data;
}

describe('HTML shift parsing', () => {
   it('joins by team and sweater, normalizes elapsed clocks, and never invents IDs', () => {
      const result = parsed();
      expect(result.source).toBe('html');
      expect(result.total).toBe(2);
      expect(result.data[0]).toEqual({
         id: null,
         eventNumber: null,
         gameId: GAME,
         teamId: 1,
         playerId: 101,
         sweaterNumber: 9,
         period: 1,
         shiftNumber: 1,
         startTime: '00:00',
         endTime: '00:10',
         duration: '00:10',
      });
      expect(result.data[1]?.playerId).toBe(202);
   });
   it('accepts OT and numeric multiple overtime periods', () => {
      const result = parsed(report(row('OT') + row('5')));
      expect(result.data.map((r) => r.period)).toEqual([4, 5, 1]);
   });
   it('ignores the NHL spacer and nested summary-table wrapper', () => {
      const html = report().replace(
         '<tr><td>Per</td><td>SHF</td>',
         '<tr><td class="spacer + bborder" colspan="8">&nbsp;</td></tr><tr><td colspan="8"><table><tr><td>Per</td><td>SHF</td>',
      );
      expect(parsed(html).total).toBe(2);
   });
   it('preserves duplicate and zero-duration rows, without reading summary rows as shifts', () => {
      const result = parsed(
         report(row() + row() + row('1', '0:10', '0:10', '00:00')),
      );
      expect(result.total).toBe(4);
      expect(result.data[0]).toEqual(result.data[1]);
      expect(result.data[2]?.duration).toBe('00:00');
   });
   it.each([
      ['missing report', '<html>Not found</html>'],
      ['empty report', '<html>TIME ON ICE</html>'],
      ['no shifts', report('')],
      ['truncated document', report().replace('</html>', '')],
      ['missing summary', report().replace('<td>SHF</td>', '')],
      ['missing duration', report().replace('<td>00:10</td>', '')],
      ['invalid clock', report(row('1', '0:60'))],
      ['reversed clock', report(row('1', '1:00'))],
      ['inconsistent duration', report(row('1', '0:00', '0:10', '00:09'))],
      ['invalid period', report(row('SO'))],
      ['unreadable heading', report().replace('9 INVENTED', 'INVENTED')],
   ])('fails explicitly for %s', (_name, html) => {
      const result = parseShifts(GAME, html, report(), ROSTER);
      expect(result.success).toBeFalse();
      if (!result.success) expect(result.error).toBeInstanceOf(ParseError);
   });
   it('rejects unmapped and ambiguous sweaters rather than returning a partial game', () => {
      for (const rosterSpots of [
         [],
         [
            ...ROSTER.rosterSpots,
            { teamId: 1, playerId: 303, sweaterNumber: 9 },
         ],
      ]) {
         const result = parseShifts(GAME, report(), report(), {
            ...ROSTER,
            rosterSpots,
         });
         expect(result.success).toBeFalse();
         if (!result.success)
            expect(result.error.message).toContain('sweater 9');
      }
   });
   it('rejects a roster from another game or with invalid teams', () => {
      expect(
         parseShifts(GAME, report(), report(), { ...ROSTER, id: GAME + 1 })
            .success,
      ).toBeFalse();
      expect(
         parseShifts(GAME, report(), report(), {
            ...ROSTER,
            awayTeam: ROSTER.homeTeam,
         }).success,
      ).toBeFalse();
   });
});

describe('reports raw mode and shifts fetching', () => {
   const originalFetch = globalThis.fetch;
   const originalLogLevel = config.logLevel;
   afterEach(() => {
      globalThis.fetch = originalFetch;
      config.logLevel = originalLogLevel;
   });
   function respond(
      home = report(),
      away = report(),
      missing = '',
      pbpStatus = 200,
   ) {
      const calls: string[] = [];
      config.logLevel = 'silent';
      globalThis.fetch = (async (url: string) => {
         calls.push(url);
         if (url.includes('api.nhle.com'))
            throw new Error('JSON shifts must never be requested');
         const status = missing && url.includes(missing) ? 404 : 200;
         if (url.endsWith('/play-by-play'))
            return new Response(JSON.stringify(ROSTER), {
               status: pbpStatus,
            });
         return new Response(url.includes('/TV') ? away : home, { status });
      }) as typeof fetch;
      return calls;
   }
   it('fetches only two reports and PBP by default', async () => {
      const calls = respond();
      const result: APIResult<ShiftChart> = await shifts(GAME);
      expect(result.success).toBeTrue();
      expect(calls.sort()).toEqual([
         `https://api-web.nhle.com/v1/gamecenter/${GAME}/play-by-play`,
         'https://www.nhl.com/scores/htmlreports/20242025/TH020010.HTM',
         'https://www.nhl.com/scores/htmlreports/20242025/TV020010.HTM',
      ]);
   });
   it('reuses supplied game PBP', async () => {
      const calls = respond();
      const result = await shifts(GAME, { playByPlay: ROSTER, raw: false });
      expect(result.success).toBeTrue();
      expect(calls).toHaveLength(2);
   });
   it('returns raw home/away HTML without parsing or requesting PBP', async () => {
      const calls = respond(
         '<html>home raw</html>',
         '<html>away raw</html>',
      );
      const result: APIResult<RawShiftReports> = await shifts(GAME, {
         raw: true,
         playByPlay: { ...ROSTER, id: 0 },
      });
      expect(result).toEqual({
         success: true,
         data: {
            home: '<html>home raw</html>',
            away: '<html>away raw</html>',
         },
      });
      expect(calls).toHaveLength(2);
   });
   it('returns raw GS HTML without boxscore lookup or scheduled-start validation', async () => {
      const calls = respond('unchanged HTML');
      const result: APIResult<string> = await gameSummary(GAME, {
         raw: true,
         scheduledStart: 'not a date',
      });
      expect(result).toEqual({ success: true, data: 'unchanged HTML' });
      expect(calls).toEqual([
         'https://www.nhl.com/scores/htmlreports/20242025/GS020010.HTM',
      ]);
   });
   it.each(['TH', 'TV'])(
      'propagates missing %s without JSON fallback',
      async (code) => {
         const calls = respond(report(), report(), `/${code}`);
         const result = await shifts(GAME);
         expect(result.success).toBeFalse();
         if (!result.success)
            expect(result.error).toBeInstanceOf(NotFoundError);
         expect(calls).toHaveLength(2);
      },
   );
   it('propagates PBP failure', async () => {
      respond(report(), report(), '', 404);
      const result = await shifts(GAME);
      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error).toBeInstanceOf(NotFoundError);
   });
   it('fails instead of returning the readable half of a game', async () => {
      respond(report(), '<html>bad report</html>');
      const result = await shifts(GAME);
      expect(result.success).toBeFalse();
      if (!result.success) expect(result.error).toBeInstanceOf(ParseError);
   });
   it('validates inputs before fetching', async () => {
      const calls = respond();
      for (const result of [
         await shifts(123),
         await shifts(GAME, { playByPlay: { ...ROSTER, id: GAME + 1 } }),
         await shifts(GAME, { raw: 'yes' as unknown as boolean }),
         await gameSummary(GAME, { raw: 'yes' as unknown as boolean }),
         await gameSummary(123, { raw: true }),
         // @ts-expect-error gameTimes is parsed-only; raw HTML belongs to gameSummary.
         await gameTimes(123, { raw: true }),
      ]) {
         expect(result.success).toBeFalse();
         if (!result.success)
            expect(result.error).toBeInstanceOf(ValidationError);
      }
      expect(calls).toEqual([]);
   });
   it('supports dynamic options without lying about the return type', async () => {
      respond();
      const shiftsOptions: ShiftsOptions = { raw: true };
      const summaryOptions: GameSummaryOptions = { raw: true };
      const shiftResult: APIResult<ShiftChart | RawShiftReports> =
         await shifts(GAME, shiftsOptions);
      const summaryResult: APIResult<GameSummary | string> =
         await gameSummary(GAME, summaryOptions);
      expect(shiftResult.success).toBeTrue();
      expect(summaryResult.success).toBeTrue();
   });
});

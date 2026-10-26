import { afterEach, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gameTimes, REPORT_CODES, url } from '#/api/reports/index.ts';
import { parseGameTimes } from '#/api/reports/parse.ts';
import { config } from '#/config/index.ts';
import { NotFoundError, ValidationError } from '#/errors/index.ts';

/** Game Summary of 2026020180, FLA @ CHI, saved 2026-10-26 */
const FIXTURE = readFileSync(
   new URL('../fixtures/reports/GS020180.HTM', import.meta.url),
   'utf8',
);

/** The fixture with its date and start/end line replaced */
function summary(date: string, times: string): string {
   return FIXTURE.replace('Sunday, October 25, 2026', date).replace(
      'Start&nbsp;2:16&nbsp;CDT; End&nbsp;4:48&nbsp;CDT',
      times.replaceAll(' ', '&nbsp;'),
   );
}

describe('reports.url', () => {
   it('builds the report URL from the season and game number', () => {
      expect(url(2026020180, 'GS')).toBe(
         'https://www.nhl.com/scores/htmlreports/20262027/GS020180.HTM',
      );
      expect(url('2025030411', 'PL')).toBe(
         'https://www.nhl.com/scores/htmlreports/20252026/PL030411.HTM',
      );
      expect(REPORT_CODES).toHaveLength(9);
   });

   it('throws on an invalid game id', () => {
      expect(() => url(123, 'GS')).toThrow(ValidationError);
   });
});

describe('parseGameTimes', () => {
   it('reads a finished game', () => {
      expect(parseGameTimes(FIXTURE)).toEqual({
         date: '2026-10-25',
         start: { local: '2:16', zone: 'CDT', utc: '2026-10-25T19:16:00Z' },
         end: { local: '4:48', zone: 'CDT', utc: '2026-10-25T21:48:00Z' },
      });
   });

   it('puts an end before the start on the next day', () => {
      const times = parseGameTimes(
         summary(
            'Saturday, January 10, 2026',
            'Start 9:52 PST; End 12:41 PST',
         ),
      );
      expect(times?.start?.utc).toBe('2026-01-11T05:52:00Z');
      expect(times?.end).toEqual({
         local: '12:41',
         zone: 'PST',
         utc: '2026-01-11T08:41:00Z',
      });

      const late = parseGameTimes(
         summary(
            'Saturday, January 10, 2026',
            'Start 9:40 EST; End 1:05 EST',
         ),
      );
      expect(late?.start?.utc).toBe('2026-01-11T02:40:00Z');
      expect(late?.end?.utc).toBe('2026-01-11T06:05:00Z');
   });

   it('reads 10:xx and 11:xx starts as morning and 12:xx as noon', () => {
      const morning = parseGameTimes(
         summary(
            'Monday, February 16, 2026',
            'Start 11:38 EST; End 2:09 EST',
         ),
      );
      expect(morning?.start?.utc).toBe('2026-02-16T16:38:00Z');
      expect(morning?.end?.utc).toBe('2026-02-16T19:09:00Z');

      const noon = parseGameTimes(
         summary(
            'Monday, February 16, 2026',
            'Start 12:30 EST; End 3:01 EST',
         ),
      );
      expect(noon?.start?.utc).toBe('2026-02-16T17:30:00Z');
      expect(noon?.end?.utc).toBe('2026-02-16T20:01:00Z');
   });

   it.each([
      // Report lines of games checked on 2026-10-26
      ['Friday, October 4, 2024', 'CEST', '7:14', '2024-10-04T17:14:00Z'],
      ['Friday, November 1, 2024', 'EET', '8:16', '2024-11-01T18:16:00Z'],
      ['Friday, November 14, 2025', 'CET', '8:16', '2025-11-14T19:16:00Z'],
      [
         'Tuesday, September 29, 2026',
         'EDT',
         '5:20',
         '2026-09-29T21:20:00Z',
      ],
   ])('converts a %s start in %s', (date, zone, start, utc) => {
      const times = parseGameTimes(
         summary(date, `Start ${start} ${zone}; End 11:59 ${zone}`),
      );
      expect(times?.start).toEqual({ local: start, zone, utc });
   });

   it('keeps local values and a null UTC for an unknown zone', () => {
      expect(
         parseGameTimes(
            summary(
               'Saturday, March 6, 2027',
               'Start 7:15 JST; End 9:50 JST',
            ),
         ),
      ).toEqual({
         date: '2027-03-06',
         start: { local: '7:15', zone: 'JST', utc: null },
         end: { local: '9:50', zone: 'JST', utc: null },
      });
   });

   it('gives a null end while the game is in progress', () => {
      const times = parseGameTimes(
         summary('Sunday, October 25, 2026', 'Start 2:16 CDT; End'),
      );
      expect(times?.start?.local).toBe('2:16');
      expect(times?.end).toBeNull();
   });

   it('gives a null start before the game has started', () => {
      const times = parseGameTimes(
         summary('Sunday, October 25, 2026', 'Start ; End'),
      );
      expect(times).toEqual({ date: '2026-10-25', start: null, end: null });
   });

   it('returns null for a page without a game date', () => {
      expect(
         parseGameTimes('<html><body>Not found</body></html>'),
      ).toBeNull();
   });
});

describe('reports.gameTimes', () => {
   const originalFetch = globalThis.fetch;

   afterEach(() => {
      globalThis.fetch = originalFetch;
      config.logLevel = 'warn';
   });

   function respond(body: string, status = 200) {
      const calls: string[] = [];
      globalThis.fetch = (async (url: string) => {
         calls.push(url);
         return new Response(body, { status });
      }) as unknown as typeof fetch;
      return calls;
   }

   it('fetches and parses the Game Summary', async () => {
      const calls = respond(FIXTURE);

      const result = await gameTimes(2026020180);

      expect(calls).toEqual([
         'https://www.nhl.com/scores/htmlreports/20262027/GS020180.HTM',
      ]);
      expect(result.success).toBeTrue();
      if (!result.success) return;
      expect(result.data.start?.utc).toBe('2026-10-25T19:16:00Z');
      expect(result.data.end?.utc).toBe('2026-10-25T21:48:00Z');
   });

   it('returns a NotFoundError for a game without a report', async () => {
      config.logLevel = 'silent';
      respond('<html><title>404 Not Found</title></html>', 404);

      const result = await gameTimes(2026020185);

      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error).toBeInstanceOf(NotFoundError);
   });

   it('returns a ValidationError for an invalid game id', async () => {
      const calls = respond(FIXTURE);

      const result = await gameTimes(123);

      expect(calls).toEqual([]);
      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error).toBeInstanceOf(ValidationError);
   });
});

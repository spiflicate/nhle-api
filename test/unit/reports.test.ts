import { afterEach, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gameTimes, REPORT_CODES, url } from '#/api/reports/index.ts';
import { type GameTimes, parseGameTimes } from '#/api/reports/parse.ts';
import { config } from '#/config/index.ts';
import {
   NotFoundError,
   ParseError,
   ValidationError,
} from '#/errors/index.ts';

/** Game Summary of 2026020180, FLA @ CHI, saved 2026-10-26 */
const FIXTURE = readFileSync(
   new URL('../fixtures/reports/GS020180.HTM', import.meta.url),
   'utf8',
);

/** Parse a report expected to succeed */
function parsed(html: string): GameTimes {
   const result = parseGameTimes(html);
   if (!result.success) throw result.error;
   return result.data;
}

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
      expect(parsed(FIXTURE)).toEqual({
         date: '2026-10-25',
         start: { local: '2:16', zone: 'CDT', utc: '2026-10-25T19:16:00Z' },
         end: { local: '4:48', zone: 'CDT', utc: '2026-10-25T21:48:00Z' },
      });
   });

   it('puts an end before the start on the next day', () => {
      const times = parsed(
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

      const late = parsed(
         summary(
            'Saturday, January 10, 2026',
            'Start 9:40 EST; End 1:05 EST',
         ),
      );
      expect(late?.start?.utc).toBe('2026-01-11T02:40:00Z');
      expect(late?.end?.utc).toBe('2026-01-11T06:05:00Z');
   });

   it('reads 10:xx and 11:xx starts as morning and 12:xx as noon', () => {
      const morning = parsed(
         summary(
            'Monday, February 16, 2026',
            'Start 11:38 EST; End 2:09 EST',
         ),
      );
      expect(morning?.start?.utc).toBe('2026-02-16T16:38:00Z');
      expect(morning?.end?.utc).toBe('2026-02-16T19:09:00Z');

      const noon = parsed(
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
      const times = parsed(
         summary(date, `Start ${start} ${zone}; End 11:59 ${zone}`),
      );
      expect(times?.start).toEqual({ local: start, zone, utc });
   });

   it.each([
      ['an unknown zone', 'Start 7:15 JST; End 9:50 JST', "'JST'"],
      ['an unknown end zone', 'Start 7:15 EDT; End 9:50 ET', "'ET'"],
      ['no zone', 'Start 7:15; End', '(none)'],
   ])('fails on %s', (_, line, zone) => {
      const result = parseGameTimes(
         summary('Saturday, March 6, 2027', line),
      );
      expect(result.success).toBeFalse();
      if (result.success) return;
      expect(result.error).toBeInstanceOf(ParseError);
      expect(result.error.message).toContain(`Unknown time zone ${zone}`);
   });

   it('gives a null end while the game is in progress', () => {
      const times = parsed(
         summary('Sunday, October 25, 2026', 'Start 2:16 CDT; End'),
      );
      expect(times?.start?.local).toBe('2:16');
      expect(times?.end).toBeNull();
   });

   it('gives a null start before the game has started', () => {
      const times = parsed(
         summary('Sunday, October 25, 2026', 'Start ; End'),
      );
      expect(times).toEqual({ date: '2026-10-25', start: null, end: null });
   });

   it('picks am or pm from the scheduled start', () => {
      const html = summary(
         'Saturday, January 10, 2026',
         'Start 10:07 PST; End 12:41 PST',
      );
      const evening = parseGameTimes(
         html,
         new Date('2026-01-11T06:00:00Z'),
      );
      expect(evening.success && evening.data.start?.utc).toBe(
         '2026-01-11T06:07:00Z',
      );
      expect(evening.success && evening.data.end?.utc).toBe(
         '2026-01-11T08:41:00Z',
      );

      const morning = parseGameTimes(
         html,
         new Date('2026-01-10T18:00:00Z'),
      );
      expect(morning.success && morning.data.start?.utc).toBe(
         '2026-01-10T18:07:00Z',
      );
   });

   it('fails when neither reading is near the scheduled start', () => {
      const result = parseGameTimes(
         FIXTURE,
         new Date('2026-10-25T12:00:00Z'),
      );
      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error.message).toContain(
            'scheduled start 2026-10-25T12:00:00Z',
         );
   });

   it('fails on an end without a start', () => {
      const result = parseGameTimes(
         summary('Sunday, October 25, 2026', 'Start ; End 4:48 CDT'),
      );
      expect(result.success).toBeFalse();
   });

   it('fails on a page without a game date', () => {
      const result = parseGameTimes('<html><body>Not found</body></html>');
      expect(result.success).toBeFalse();
      if (!result.success) expect(result.error).toBeInstanceOf(ParseError);
   });
});

describe('parseGameTimes on reports saved during games', () => {
   /** A report saved on 2026-10-26/27 while the game was being played */
   function live(name: string, scheduledStart: string): GameTimes {
      const html = readFileSync(
         new URL(`../fixtures/reports/${name}.HTM`, import.meta.url),
         'utf8',
      );
      const result = parseGameTimes(html, new Date(scheduledStart));
      if (!result.success) throw result.error;
      return result.data;
   }

   it.each([
      // Before puck drop the header reads 'Start : EDT', with no time
      ['GS020185-live-2251', '2026-10-26T23:00:00Z'],
      ['GS020186-live-2251', '2026-10-27T00:30:00Z'],
   ])('gives null times in the pre-game report %s', (name, scheduled) => {
      expect(live(name, scheduled)).toEqual({
         date: '2026-10-26',
         start: null,
         end: null,
      });
   });

   it('reads the start once the puck has dropped', () => {
      expect(live('GS020185-live-2316', '2026-10-26T23:00:00Z')).toEqual({
         date: '2026-10-26',
         start: { local: '7:10', zone: 'EDT', utc: '2026-10-26T23:10:00Z' },
         end: null,
      });
   });

   it.each([
      ['GS020187-live-0418', 'Shootout'],
      ['GS020187-live-0422', 'End of Shootout'],
   ])("doesn't read the status line of %s (%s) as an end", (name) => {
      expect(live(name, '2026-10-27T01:30:00Z').end).toBeNull();
   });

   it('reads the start during overtime', () => {
      expect(live('GS020187-live-0416', '2026-10-27T01:30:00Z')).toEqual({
         date: '2026-10-26',
         start: { local: '7:38', zone: 'MDT', utc: '2026-10-27T01:38:00Z' },
         end: null,
      });
   });
});

describe('reports.gameTimes', () => {
   const originalFetch = globalThis.fetch;
   const REPORT = 'https://www.nhl.com/scores/htmlreports/';
   const BOXSCORE = { startTimeUTC: '2026-10-25T19:00:00Z' };

   afterEach(() => {
      globalThis.fetch = originalFetch;
      config.logLevel = 'warn';
   });

   /** Answer report URLs with `report` and api-web URLs with `api` */
   function respond(
      report: { body: string; status?: number },
      api: { body: unknown; status?: number } = { body: BOXSCORE },
   ) {
      const calls: string[] = [];
      globalThis.fetch = (async (url: string) => {
         calls.push(url);
         return url.startsWith(REPORT)
            ? new Response(report.body, { status: report.status ?? 200 })
            : new Response(JSON.stringify(api.body), {
                 status: api.status ?? 200,
              });
      }) as unknown as typeof fetch;
      return calls;
   }

   it('reads the start near the scheduled time from the boxscore', async () => {
      const calls = respond({ body: FIXTURE });

      const result = await gameTimes(2026020180);

      expect(calls.sort()).toEqual([
         'https://api-web.nhle.com/v1/gamecenter/2026020180/boxscore',
         'https://www.nhl.com/scores/htmlreports/20262027/GS020180.HTM',
      ]);
      expect(result.success).toBeTrue();
      if (!result.success) return;
      expect(result.data.start?.utc).toBe('2026-10-25T19:16:00Z');
      expect(result.data.end?.utc).toBe('2026-10-25T21:48:00Z');
   });

   it('uses scheduledStart instead of the boxscore', async () => {
      const calls = respond({
         body: summary(
            'Monday, February 16, 2026',
            'Start 10:12 EST; End 12:40 EST',
         ),
      });

      const result = await gameTimes(2025020900, {
         scheduledStart: new Date('2026-02-17T03:00:00Z'),
      });

      expect(calls).toEqual([
         'https://www.nhl.com/scores/htmlreports/20252026/GS020900.HTM',
      ]);
      expect(result.success).toBeTrue();
      if (!result.success) return;
      // 10:12 pm, which the fixed rule would read as morning
      expect(result.data.start?.utc).toBe('2026-02-17T03:12:00Z');
      expect(result.data.end?.utc).toBe('2026-02-17T05:40:00Z');
   });

   it('fails when the start is far from the scheduled time', async () => {
      respond({ body: FIXTURE });

      const result = await gameTimes(2026020180, {
         scheduledStart: '2026-10-25T13:00:00Z',
      });

      expect(result.success).toBeFalse();
      if (result.success) return;
      expect(result.error).toBeInstanceOf(ParseError);
      expect(result.error.message).toContain('neither am nor pm');
      expect(result.error.context.endpoint).toBe(
         'https://www.nhl.com/scores/htmlreports/20262027/GS020180.HTM',
      );
   });

   it('returns a ValidationError for an invalid scheduledStart', async () => {
      const calls = respond({ body: FIXTURE });

      const result = await gameTimes(2026020180, {
         scheduledStart: 'soon',
      });

      expect(calls).toEqual([]);
      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error).toBeInstanceOf(ValidationError);
   });

   it('returns a NotFoundError for a game without a report', async () => {
      config.logLevel = 'silent';
      respond({
         body: '<html><title>404 Not Found</title></html>',
         status: 404,
      });

      const result = await gameTimes(2026020185);

      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error).toBeInstanceOf(NotFoundError);
   });

   it('returns the boxscore error when the schedule lookup fails', async () => {
      config.logLevel = 'silent';
      respond({ body: FIXTURE }, { body: {}, status: 404 });

      const result = await gameTimes(2026020180);

      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error).toBeInstanceOf(NotFoundError);
   });

   it('returns a ValidationError for an invalid game id', async () => {
      const calls = respond({ body: FIXTURE });

      const result = await gameTimes(123);

      expect(calls).toEqual([]);
      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error).toBeInstanceOf(ValidationError);
   });
});

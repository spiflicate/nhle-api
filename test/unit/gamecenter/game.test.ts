/**
 * Unit tests for gamecenter game module
 *
 * Tests all game-related endpoints:
 * - schedule() - Get schedule for a specific date (or current date)
 * - scheduleCalendar() - Get schedule calendar for a specific date
 * - playoffBracket() - Get playoff bracket for a specific year
 * - playoffSeries() - Get playoff series for a specific season
 * - playoffSeriesSchedule() - Get playoff series schedule for a specific season and series letter
 * - gamecenter.playByPlay() - Get play-by-play data for a specific game
 * - gamecenter.reports() - Get reports (right-rail) data for a specific game
 * - gamecenter.landing() - Get landing page data for a specific game
 * - gamecenter.boxscore() - Get boxscore data for a specific game
 * - WSC.gameStory() - Get game story data from WSC endpoint
 * - WSC.playByPlay() - Get play-by-play data from WSC endpoint
 * - pptReplay.goal() - Get goal replay data for a specific game and event
 * - pptReplay.event() - Get event replay data for a specific date
 * - whereToWatch() - Get where-to-watch information
 * - networkTVSchedule() - Get TV schedule for a specific date
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as game from '#/api/gamecenter/game.ts';
import { ValidationError } from '#/errors/index.ts';
import { testData } from '../../test-utils.ts';

describe('Game Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         // gamecenter endpoints
         if (url.includes('gamecenter') && url.includes('play-by-play')) {
            return {
               ok: true,
               json: async () => ({ plays: [] }),
            } as Response;
         }

         if (url.includes('gamecenter') && url.includes('right-rail')) {
            return {
               ok: true,
               json: async () => ({ reports: [] }),
            } as Response;
         }

         if (url.includes('gamecenter') && url.includes('landing')) {
            return {
               ok: true,
               json: async () => ({ landing: {} }),
            } as Response;
         }

         if (url.includes('gamecenter') && url.includes('boxscore')) {
            return {
               ok: true,
               json: async () => ({ boxscore: {} }),
            } as Response;
         }

         // WSC endpoints
         if (url.includes('wsc/game-story')) {
            return {
               ok: true,
               json: async () => ({ story: {} }),
            } as Response;
         }

         if (url.includes('wsc/play-by-play')) {
            return {
               ok: true,
               json: async () => ({ plays: [] }),
            } as Response;
         }

         // PPT Replay endpoints
         if (url.includes('ppt-replay') && url.includes('goal')) {
            return {
               ok: true,
               json: async () => ({ replay: {} }),
            } as Response;
         }

         if (url.includes('ppt-replay') && !url.includes('goal')) {
            return {
               ok: true,
               json: async () => ({ replays: [] }),
            } as Response;
         }

         // Where to watch
         if (url.includes('where-to-watch')) {
            return {
               ok: true,
               json: async () => ({ networks: [] }),
            } as Response;
         }

         // Network TV Schedule
         if (url.includes('network/tv-schedule')) {
            return {
               ok: true,
               json: async () => ({ schedule: [] }),
            } as Response;
         }

         return {
            ok: false,
            status: 404,
            json: async () => ({ error: 'Not found' }),
         } as Response;
      }) as unknown as typeof globalThis.fetch;
   });

   afterEach(() => {
      globalThis.fetch = originalFetch;
      mockCalls = [];
   });

   describe('gamecenter', () => {
      test('playByPlay should fetch play-by-play data with valid game ID', async () => {
         const result = await game.playByPlay(testData.gameId);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('play-by-play');
         expect(mockCalls[0]).toContain(testData.gameId);
      });

      test('playByPlay should handle numeric game ID', async () => {
         const numericGameId = 2023020001;
         await game.playByPlay(numericGameId);
         expect(mockCalls[0]).toContain('play-by-play');
      });

      test('playByPlay should reject invalid game ID', async () => {
         const result = await game.playByPlay(
            'invalid' as unknown as number,
         );
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });

      test('reports should fetch reports data with valid game ID', async () => {
         const result = await game.reports(testData.gameId);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('right-rail');
         expect(mockCalls[0]).toContain(testData.gameId);
      });

      test('reports should handle numeric game ID', async () => {
         const numericGameId = 2023020001;
         await game.reports(numericGameId);
         expect(mockCalls[0]).toContain('right-rail');
      });

      test('reports should reject invalid game ID', async () => {
         const result = await game.reports('invalid' as unknown as number);
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });

      test('landing should fetch landing page data with valid game ID', async () => {
         const result = await game.landing(testData.gameId);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('landing');
         expect(mockCalls[0]).toContain(testData.gameId);
      });

      test('landing should handle numeric game ID', async () => {
         const numericGameId = 2023020001;
         await game.landing(numericGameId);
         expect(mockCalls[0]).toContain('landing');
      });

      test('landing should reject invalid game ID', async () => {
         const result = await game.landing('invalid' as unknown as number);
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });

      test('boxscore should fetch boxscore data with valid game ID', async () => {
         const result = await game.boxscore(testData.gameId);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('boxscore');
         expect(mockCalls[0]).toContain(testData.gameId);
      });

      test('boxscore should handle numeric game ID', async () => {
         const numericGameId = 2023020001;
         await game.boxscore(numericGameId);
         expect(mockCalls[0]).toContain('boxscore');
      });

      test('boxscore should reject invalid game ID', async () => {
         const result = await game.boxscore('invalid' as unknown as number);
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });
   });

   describe('WSC', () => {
      test('gameStory should fetch game story data with valid game ID', async () => {
         const numericGameId = 2023020001;
         const result = await game.wsc.gameStory(numericGameId);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('wsc/game-story');
         expect(mockCalls[0]).toContain(numericGameId.toString());
      });

      test('gameStory should reject invalid game ID', async () => {
         const result = await game.wsc.gameStory(
            'invalid' as unknown as number,
         );
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });

      test('playByPlay should fetch play-by-play data with valid game ID', async () => {
         const numericGameId = 2023020001;
         const result = await game.wsc.playByPlay(numericGameId);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('wsc/play-by-play');
         expect(mockCalls[0]).toContain(numericGameId.toString());
      });

      test('playByPlay should reject invalid game ID', async () => {
         const result = await game.wsc.playByPlay(
            'invalid' as unknown as number,
         );
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });
   });

   describe('pptReplay', () => {
      test('goal should fetch goal replay data with valid game ID and event ID', async () => {
         const gameId = 2023020001;
         const eventId = 123;
         const result = await game.pptReplay.goal(gameId, eventId);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('ppt-replay');
         expect(mockCalls[0]).toContain('goal');
         expect(mockCalls[0]).toContain(gameId.toString());
         expect(mockCalls[0]).toContain(eventId.toString());
      });

      test('goal should reject invalid game ID', async () => {
         const result = await game.pptReplay.goal(
            'invalid' as unknown as number,
            123,
         );
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });

      test('goal should reject invalid event ID', async () => {
         const result = await game.pptReplay.goal(
            2023020001,
            'invalid' as unknown as number,
         );
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });

      test('event should fetch event replay data from the event for a specific game', async () => {
         const gameId = '2025020022';
         const eventId = '12';
         const result = await game.pptReplay.event(gameId, eventId);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('ppt-replay');
         expect(mockCalls[0]).toContain(gameId);
         expect(mockCalls[0]).toContain(eventId);
      });

      test('event should reject invalid date', async () => {
         const result = await game.pptReplay.event(
            'invalid-game-id',
            'invalid-event-id',
         );
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });
   });

   describe('whereToWatch', () => {
      test('whereToWatch should fetch where-to-watch data', async () => {
         const result = await game.whereToWatch();
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('where-to-watch');
      });

      test('whereToWatch should make exactly one call', async () => {
         await game.whereToWatch();
         expect(mockCalls).toHaveLength(1);
      });
   });

   describe('networkTVSchedule', () => {
      test('networkTVSchedule should fetch TV schedule with default date', async () => {
         const result = await game.networkTVSchedule();
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('network/tv-schedule');
      });

      test('networkTVSchedule should fetch TV schedule with specific date string', async () => {
         const date = '2023-10-10';
         await game.networkTVSchedule(date);
         expect(mockCalls[0]).toContain('network/tv-schedule');
         expect(mockCalls[0]).toContain(date);
      });

      test('networkTVSchedule should fetch TV schedule with Date object', async () => {
         const date = new Date('2023-10-10');
         await game.networkTVSchedule(date);
         expect(mockCalls[0]).toContain('network/tv-schedule');
      });

      test('networkTVSchedule should reject invalid date', async () => {
         try {
            await game.networkTVSchedule('invalid-date');
            expect.unreachable();
         } catch {
            // Expected to throw for invalid date
         }
      });
   });

   describe('Schedule', () => {
      test('schedule should fetch schedule with default current date', async () => {
         const result = await game.schedule();
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('schedule/');
      });

      test('schedule should fetch schedule with specific date string', async () => {
         const date = '2023-10-10';
         await game.schedule(date);
         expect(mockCalls[0]).toContain(`schedule/${date}`);
      });

      test('schedule should fetch schedule with Date object', async () => {
         const date = new Date('2023-10-10');
         await game.schedule(date);
         expect(mockCalls[0]).toContain('schedule/');
      });

      test('schedule should reject invalid date', async () => {
         try {
            await game.schedule('invalid-date');
            expect.unreachable();
         } catch {
            // Expected to throw for invalid date
         }
      });

      test('scheduleCalendar should fetch schedule calendar with specific date string', async () => {
         const date = '2023-10-10';
         const result = await game.scheduleCalendar(date);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain(`schedule-calendar/${date}`);
      });

      test('scheduleCalendar should fetch schedule calendar with Date object', async () => {
         const date = new Date('2023-10-10');
         await game.scheduleCalendar(date);
         expect(mockCalls[0]).toContain('schedule-calendar/');
      });

      test('scheduleCalendar should reject invalid date', async () => {
         try {
            await game.scheduleCalendar('invalid-date');
            expect.unreachable();
         } catch {
            // Expected to throw for invalid date
         }
      });

      test('playoffBracket should fetch playoff bracket with year', async () => {
         const result = await game.playoffBracket('2024');
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('playoff-bracket/2024');
      });

      test('playoffBracket should use default current year', async () => {
         await game.playoffBracket();
         expect(mockCalls[0]).toContain('playoff-bracket/');
      });

      test('playoffBracket should reject invalid year', async () => {
         try {
            await game.playoffBracket('invalid-year');
            expect.unreachable();
         } catch {
            // Expected to throw for invalid year
         }
      });

      test('playoffSeries should fetch playoff series with season', async () => {
         const result = await game.playoffSeries(testData.seasonId);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain(
            `playoff-series/carousel/${testData.seasonId}`,
         );
      });

      test('playoffSeries should use default current season', async () => {
         await game.playoffSeries();
         expect(mockCalls[0]).toContain('playoff-series/');
      });

      test('playoffSeries should reject invalid season', async () => {
         try {
            await game.playoffSeries('invalid-season');
            expect.unreachable();
         } catch {
            // Expected to throw for invalid season
         }
      });

      test('playoffSeriesSchedule should fetch playoff series schedule', async () => {
         const result = await game.playoffSeriesSchedule(
            'A',
            testData.seasonId,
         );
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('schedule/playoff-series');
         expect(mockCalls[0]).toContain('A');
         expect(mockCalls[0]).toContain(testData.seasonId);
      });

      test('playoffSeriesSchedule should use default current season', async () => {
         await game.playoffSeriesSchedule('A');
         expect(mockCalls[0]).toContain('schedule/playoff-series');
         expect(mockCalls[0]).toContain('A');
      });

      test('playoffSeriesSchedule should reject invalid series letter', async () => {
         const invalidSeriesLetter = 'Z';
         const result = await game.playoffSeriesSchedule(
            invalidSeriesLetter,
            testData.seasonId,
         );
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });

      test('playoffSeriesSchedule should reject invalid season', async () => {
         const result = await game.playoffSeriesSchedule(
            'A',
            'invalid-season',
         );
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });
   });
});

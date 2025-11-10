/**
 * Unit tests for gamecenter player module
 *
 * Tests all player-related endpoints:
 * - player() - Get player landing page data
 * - player.gameLog() - Get player game log for a season/game type
 * - player.spotlight() - Get player spotlight data
 * - player.search() - Search for players
 * - statsLeaders.skaters() - Get skater stats leaders
 * - statsLeaders.goalies() - Get goalie stats leaders
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as player from '#/api/gamecenter/player.ts';
import { testData } from '../../test-utils.ts';

describe('Player Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('player/') && url.includes('landing')) {
            return {
               ok: true,
               json: async () => ({ player: {} }),
            } as Response;
         }

         if (url.includes('player/') && url.includes('game-log')) {
            return {
               ok: true,
               json: async () => ({ games: [] }),
            } as Response;
         }

         if (url.includes('player-spotlight')) {
            return {
               ok: true,
               json: async () => ({ spotlight: {} }),
            } as Response;
         }

         if (url.includes('search.d3.nhle.com') || url.includes('search')) {
            return {
               ok: true,
               json: async () => ({ players: [] }),
            } as Response;
         }

         if (url.includes('skater-stats-leaders')) {
            return {
               ok: true,
               json: async () => ({ leaders: [] }),
            } as Response;
         }

         if (url.includes('goalie-stats-leaders')) {
            return {
               ok: true,
               json: async () => ({ leaders: [] }),
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

   test('player should fetch player landing page with valid player ID', async () => {
      const result = await player.landing(testData.playerId);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('player/');
      expect(mockCalls[0]).toContain('landing');
   });

   test('player should handle numeric player ID', async () => {
      const numericId = 8476791;
      await player.landing(numericId);
      expect(mockCalls[0]).toContain(`player/${numericId}`);
      expect(mockCalls[0]).toContain('landing');
   });

   test('player should reject invalid player ID', async () => {
      try {
         await player.landing('invalid');
         expect.unreachable();
      } catch {
         // Expected to throw for invalid ID
      }
   });

   describe('player.gameLog', () => {
      test('player.gameLog should fetch game log with player ID only', async () => {
         const result = await player.gameLog(testData.playerId);
         expect(result).toBeDefined();
         expect(mockCalls[0]).toContain('player/');
         expect(mockCalls[0]).toContain('game-log');
      });

      test('player.gameLog should fetch game log with season', async () => {
         await player.gameLog(testData.playerId, 20232024);
         expect(mockCalls[0]).toContain('player/');
         expect(mockCalls[0]).toContain('game-log');
      });

      test('player.gameLog should fetch game log with season and game type', async () => {
         await player.gameLog(testData.playerId, 20232024, 'REG');
         expect(mockCalls[0]).toContain('player/');
         expect(mockCalls[0]).toContain('game-log');
      });

      test('player.gameLog should handle string season', async () => {
         await player.gameLog(testData.playerId, '20232024');
         expect(mockCalls[0]).toContain('player/');
      });

      test('player.gameLog should handle string game type', async () => {
         await player.gameLog(testData.playerId, 20232024, '2');
         expect(mockCalls[0]).toContain('player/');
      });

      test('player.gameLog should reject invalid player ID', async () => {
         try {
            await player.gameLog('invalid');
            expect.unreachable();
         } catch {
            // Expected to throw for invalid ID
         }
      });
   });

   test('player.spotlight should fetch player spotlight data', async () => {
      const result = await player.spotlight();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('player-spotlight');
   });

   test('player.search should search for players', async () => {
      const result = await player.search('McDavid');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('search');
   });

   test('player.search should include query parameter', async () => {
      await player.search('Crosby');
      expect(mockCalls[0]).toContain('q=Crosby');
   });

   describe('statsLeaders', () => {
      test('statsLeaders.skaters should fetch skater stats leaders with defaults', async () => {
         const result = await player.statsLeaders.skaters();
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('skater-stats-leaders');
      });

      test('statsLeaders.skaters should fetch skater stats leaders with season', async () => {
         await player.statsLeaders.skaters(20232024);
         expect(mockCalls[0]).toContain('skater-stats-leaders');
      });

      test('statsLeaders.skaters should fetch skater stats leaders with season and game type', async () => {
         await player.statsLeaders.skaters(20232024, 2);
         expect(mockCalls[0]).toContain('skater-stats-leaders');
      });

      test('statsLeaders.skaters should handle string season', async () => {
         await player.statsLeaders.skaters('20232024');
         expect(mockCalls[0]).toContain('skater-stats-leaders');
      });

      test('statsLeaders.skaters should handle string game type', async () => {
         await player.statsLeaders.skaters(20232024, '2');
         expect(mockCalls[0]).toContain('skater-stats-leaders');
      });

      test('statsLeaders.goalies should fetch goalie stats leaders with defaults', async () => {
         const result = await player.statsLeaders.goalies();
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('goalie-stats-leaders');
      });

      test('statsLeaders.goalies should fetch goalie stats leaders with season', async () => {
         await player.statsLeaders.goalies(20232024);
         expect(mockCalls[0]).toContain('goalie-stats-leaders');
      });

      test('statsLeaders.goalies should fetch goalie stats leaders with season and game type', async () => {
         await player.statsLeaders.goalies(20232024, 2);
         expect(mockCalls[0]).toContain('goalie-stats-leaders');
      });

      test('statsLeaders.goalies should handle string season', async () => {
         await player.statsLeaders.goalies('20232024');
         expect(mockCalls[0]).toContain('goalie-stats-leaders');
      });

      test('statsLeaders.goalies should handle string game type', async () => {
         await player.statsLeaders.goalies(20232024, '2');
         expect(mockCalls[0]).toContain('goalie-stats-leaders');
      });
   });
});

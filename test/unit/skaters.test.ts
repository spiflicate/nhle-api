import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { skaters } from '#/api/edge-stats/skaters.ts';
import { MockResponseFactory, testData } from '../test-utils.ts';

describe('Skaters Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('/players')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     {
                        playerId: testData.playerId,
                        firstName: 'Connor',
                        lastName: 'McDavid',
                     },
                  ]),
            } as Response;
         }

         if (url.includes('/leaders/skaters')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.skaterStats(),
                  ]),
            } as Response;
         }

         if (url.includes('/milestones/skaters')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.skaterStats(),
                  ]),
            } as Response;
         }

         if (url.includes('/skater')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.skaterStats(),
                  ]),
            } as Response;
         }

         return {
            ok: false,
            status: 404,
            json: async () => ({ error: 'Not found' }),
         } as Response;
      }) as any;
   });

   afterEach(() => {
      globalThis.fetch = originalFetch;
      mockCalls = [];
   });

   test('getPlayerInfo should fetch player information', async () => {
      const result = await skaters.getPlayerInfo('en');
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(mockCalls[0]).toContain('/en/players');
   });

   test('getLeaders should fetch skater leaders with attribute', async () => {
      const result = await skaters.getLeaders('points', 'en');
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(mockCalls[0]).toContain('/leaders/skaters/points');
   });

   test('getMilestones should fetch skater milestones', async () => {
      const result = await skaters.getMilestones('en');
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(mockCalls[0]).toContain('/milestones/skaters');
   });

   test('getInfo should fetch skater info', async () => {
      const result = await skaters.getInfo('en');
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(mockCalls[0]).toContain('/en/skater');
   });

   test('getStatsWithParams should fetch with custom params', async () => {
      const result = await skaters.getStatsWithParams('summary', {
         cayenneExp: 'seasonId=20232024',
      });
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(mockCalls[0]).toContain('/skater/summary');
   });

   test('getStatsWithBuilder should accept query builder callback', async () => {
      const result = await skaters.getStatsWithBuilder('summary', (q) => ({
         cayenneExp: q.equals('seasonId', '20232024').build(),
      }));
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
   });

   test('getStatsWithFilters should accept high-level filters', async () => {
      const result = await skaters.getStatsWithFilters('summary', {
         seasonId: '20232024',
      });
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
   });

   test('getStatsWithFilters should handle sorting options', async () => {
      const result = await skaters.getStatsWithFilters(
         'summary',
         { seasonId: '20232024' },
         { sortBy: 'points', direction: 'desc' },
      );
      expect(result).toBeDefined();
   });

   test('getStatsWithFilters should handle pagination options', async () => {
      const result = await skaters.getStatsWithFilters(
         'summary',
         { seasonId: '20232024' },
         undefined,
         { limit: 50, start: 25 },
      );
      expect(result).toBeDefined();
   });

   test('should support French language', async () => {
      await skaters.getPlayerInfo('fr');
      expect(mockCalls[0]).toContain('/fr/players');
   });

   test('should default to English language', async () => {
      await skaters.getPlayerInfo();
      expect(mockCalls[0]).toContain('/en/players');
   });

   test('should return paginated response structure', async () => {
      const result = await skaters.getStatsWithParams('summary', {
         cayenneExp: 'seasonId=20232024',
      });
      expect(result.data).toBeDefined();
      expect(result.total).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
   });
});

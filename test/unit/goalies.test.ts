import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { goalies } from '#/api/edge-stats/goalies.ts';
import { MockResponseFactory, testData } from '../test-utils.ts';

describe('Goalies Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('/leaders/goalies')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.goalieStats(),
                  ]),
            } as Response;
         }

         if (url.includes('/milestones/goalies')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.goalieStats(),
                  ]),
            } as Response;
         }

         if (url.includes('/goalie')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.goalieStats(),
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

   test('getLeaders should fetch goalie leaders with attribute', async () => {
      const result = await goalies.getLeaders('wins', 'en');
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(mockCalls[0]).toContain('/leaders/goalies/wins');
   });

   test('getMilestones should fetch goalie milestones', async () => {
      const result = await goalies.getMilestones('en');
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(mockCalls[0]).toContain('/milestones/goalies');
   });

   test('getStatsWithParams should fetch with custom params', async () => {
      const result = await goalies.getStatsWithParams('summary', {
         cayenneExp: 'seasonId=20232024',
      });
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(mockCalls[0]).toContain('/goalie/summary');
   });

   test('getStatsWithBuilder should accept query builder callback', async () => {
      const result = await goalies.getStatsWithBuilder('summary', (q) => ({
         cayenneExp: q.equals('seasonId', '20232024').build(),
      }));
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
   });

   test('getStatsWithFilters should accept high-level filters', async () => {
      const result = await goalies.getStatsWithFilters('summary', {
         seasonId: '20232024',
      });
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
   });

   test('getStatsWithFilters should handle sorting options', async () => {
      const result = await goalies.getStatsWithFilters(
         'summary',
         { seasonId: '20232024' },
         { sortBy: 'wins', direction: 'desc' },
      );
      expect(result).toBeDefined();
   });

   test('getStatsWithFilters should handle pagination options', async () => {
      const result = await goalies.getStatsWithFilters(
         'summary',
         { seasonId: '20232024' },
         undefined,
         { limit: 50, start: 25 },
      );
      expect(result).toBeDefined();
   });

   test('should support multiple languages', async () => {
      await goalies.getLeaders('wins', 'fr');
      expect(mockCalls[0]).toContain('/fr/');
   });

   test('should return paginated response structure', async () => {
      const result = await goalies.getStatsWithParams('summary', {
         cayenneExp: 'seasonId=20232024',
      });
      expect(result.data).toBeDefined();
      expect(result.total).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
   });
});

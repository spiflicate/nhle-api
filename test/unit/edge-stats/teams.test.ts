import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { teams } from '#/api/edge-stats/teams.ts';
import { MockResponseFactory, testData } from '../../test-utils.ts';

describe('Teams Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (
            url.includes('/team/summary') ||
            url.includes('/team/detailed')
         ) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.teamStats(),
                  ]),
            } as Response;
         }

         if (url.includes('/team/id/')) {
            return {
               ok: true,
               json: async () => MockResponseFactory.team(),
            } as Response;
         }

         if (url.includes('/team')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.team(),
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

   test('getAll should fetch all teams', async () => {
      const result = await teams.getAll('en');
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(mockCalls[0]).toContain('/team');
   });

   test('getById should fetch team by ID', async () => {
      const result = await teams.getById(testData.teamId, 'en');
      expect(result).toBeDefined();
      expect(mockCalls[0]).toContain(`/team/id/${testData.teamId}`);
   });

   test('getStatsWithParams should fetch with custom params', async () => {
      const result = await teams.getStatsWithParams('summary', {
         cayenneExp: 'seasonId=20232024',
      });
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(mockCalls[0]).toContain('/team/summary');
   });

   test('getStatsWithBuilder should accept query builder callback', async () => {
      const result = await teams.getStatsWithBuilder('summary', (q) => ({
         cayenneExp: q.equals('seasonId', '20232024').build(),
      }));
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
   });

   test('getStatsWithFilters should accept high-level filters', async () => {
      const result = await teams.getStatsWithFilters('summary', {
         seasonId: '20232024',
      });
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
   });

   test('getStatsWithFilters should handle sorting options', async () => {
      const result = await teams.getStatsWithFilters(
         'summary',
         { seasonId: '20232024' },
         { sortBy: 'points', direction: 'desc' },
      );
      expect(result).toBeDefined();
   });

   test('getStatsWithFilters should handle pagination options', async () => {
      const result = await teams.getStatsWithFilters(
         'summary',
         { seasonId: '20232024' },
         undefined,
         { limit: 32, start: 0 },
      );
      expect(result).toBeDefined();
   });

   test('should support multiple languages', async () => {
      await teams.getAll('fr');
      expect(mockCalls[0]).toContain('/fr/team');
   });

   test('should return paginated response structure', async () => {
      const result = await teams.getStatsWithParams('summary', {
         cayenneExp: 'seasonId=20232024',
      });
      expect(result.data).toBeDefined();
      expect(result.total).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
   });
});

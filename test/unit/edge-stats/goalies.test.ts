import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { goalies } from '#/api/edge-stats/index.ts';
import { MockResponseFactory } from '../../test-utils.ts';
import { expectSuccess } from '../helpers.ts';

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
         // biome-ignore lint/suspicious/noExplicitAny: Need to mock fetch with custom behavior
      }) as any;
   });

   afterEach(() => {
      globalThis.fetch = originalFetch;
      mockCalls = [];
   });

   test('getLeaders should fetch goalie leaders with attribute', async () => {
      const result = await goalies.getLeaders('gaa', 'en');
      expectSuccess(result);
      expect(mockCalls[0]).toContain('/leaders/goalies/gaa');
   });

   test('getMilestones should fetch goalie milestones', async () => {
      const result = await goalies.getMilestones('en');
      expectSuccess(result);
      expect(mockCalls[0]).toContain('/milestones/goalies');
   });

   test('getStatsWithParams should fetch with custom params', async () => {
      const result = await goalies.getStatsWithParams('summary', {
         cayenneExp: 'seasonId=20232024',
      });
      expectSuccess(result);
      expect(mockCalls[0]).toContain('/goalie/summary');
   });

   test('getStatsWithBuilder should accept query builder callback', async () => {
      const result = await goalies.getStatsWithBuilder('summary', (q) => ({
         cayenneExp: q.equals('seasonId', '20232024').build(),
      }));
      expectSuccess(result);
      expect(mockCalls[0]).toContain('/goalie/summary');
   });

   test('getStatsWithFilters should accept high-level filters', async () => {
      const result = await goalies.getStatsWithFilters('summary', {
         seasonId: '20232024',
      });
      expectSuccess(result);
      expect(mockCalls[0]).toContain('/goalie/summary');
   });

   test('getStatsWithFilters should handle sorting options', async () => {
      const result = await goalies.getStatsWithFilters(
         'summary',
         { seasonId: '20232024' },
         { sortBy: 'wins', direction: 'desc' },
      );
      expectSuccess(result);
      expect(mockCalls[0]).toContain('sort=wins');
      expect(mockCalls[0]).toContain('dir=desc');
   });

   test('getStatsWithFilters should handle pagination options', async () => {
      const result = await goalies.getStatsWithFilters(
         'summary',
         { seasonId: '20232024' },
         undefined,
         { limit: 50, start: 25 },
      );
      expectSuccess(result);
      expect(mockCalls[0]).toContain('limit=50');
      expect(mockCalls[0]).toContain('start=25');
   });

   test('should support multiple languages', async () => {
      await goalies.getLeaders('gaa', 'fr');
      expect(mockCalls[0]).toContain('/fr/');
   });

   test('should return paginated response structure', async () => {
      const result = await goalies.getStatsWithParams('summary', {
         cayenneExp: 'seasonId=20232024',
      });
      expectSuccess(result);
      if (result.success) {
         expect(result.data).toHaveProperty('data');
         expect(Array.isArray(result.data.data)).toBeTrue();
         expect(result.data).toHaveProperty('total');
         expect(typeof result.data.total).toBe('number');
      }
   });
});

/**
 * Unit tests for gamecenter draft module
 *
 * Tests all draft-related endpoints:
 * - draft() - Get draft picks for a year and/or round
 * - draft.year() - Get draft picks for a year with chainable round() method
 * - draft.tracker() - Get current draft tracker information
 * - draftRankings() - Get draft rankings for a year with chainable methods
 *   - skatersNA() - North American skater rankings
 *   - skatersIntl() - International skater rankings
 *   - goaliesNA() - North American goalie rankings
 *   - goaliesIntl() - International goalie rankings
 *   - all() - All rankings combined
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as draft from '#/api/gamecenter/draft.ts';
import { ValidationError } from '#/errors/index.ts';

describe('Draft Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('draft/picks') && url.includes('/all')) {
            return {
               ok: true,
               json: async () => ({ picks: [] }),
            } as Response;
         }

         if (url.includes('draft/picks') && !url.includes('/all')) {
            return {
               ok: true,
               json: async () => ({ picks: [] }),
            } as Response;
         }

         if (url.includes('draft/rankings')) {
            return {
               ok: true,
               json: async () => ({ rankings: [] }),
            } as Response;
         }

         if (url.includes('draft-tracker')) {
            return {
               ok: true,
               json: async () => ({ current: {} }),
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

   describe('draft', () => {
      test('draft should fetch draft picks with year and round', async () => {
         const result = await draft.picks(2024, 1);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('draft/picks/2024/1');
      });

      test('draft should fetch draft picks with year only (all rounds)', async () => {
         const result = await draft.picks(2024);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('draft/picks/2024/all');
      });

      test('draft should handle string year', async () => {
         await draft.picks('2024', 1);
         expect(mockCalls[0]).toContain('draft/picks/2024/1');
      });

      test('draft should handle string round', async () => {
         await draft.picks(2024, '1');
         expect(mockCalls[0]).toContain('draft/picks/2024/1');
      });

      test('draft should use default current year when no year provided', async () => {
         await draft.picks();
         expect(mockCalls[0]).toContain('draft/picks/');
      });

      test('draft should reject invalid year', async () => {
         const result = await draft.picks('invalid', 1);
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });

      test('draft should reject invalid round', async () => {
         const result = await draft.picks(
            2024,
            'invalid' as unknown as number,
         );
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });
   });

   test('draft.tracker should fetch current draft tracker', async () => {
      const result = await draft.tracker();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('draft-tracker/picks/now');
   });

   test('draft.tracker should make exactly one call', async () => {
      await draft.tracker();
      expect(mockCalls).toHaveLength(1);
   });

   describe('draftRankings', () => {
      test('draftRankings should return chainable object with year', () => {
         const result = draft.rankings(2024) as unknown as {
            skatersNA: () => Promise<unknown>;
            skatersIntl: () => Promise<unknown>;
            goaliesNA: () => Promise<unknown>;
            goaliesIntl: () => Promise<unknown>;
            all: () => Promise<unknown>;
         };
         expect(result).toBeDefined();
         expect(result.skatersNA).toBeDefined();
         expect(result.skatersIntl).toBeDefined();
         expect(result.goaliesNA).toBeDefined();
         expect(result.goaliesIntl).toBeDefined();
         expect(result.all).toBeDefined();
      });

      test('draftRankings should use default current year', () => {
         const result = draft.rankings() as unknown as {
            skatersNA: () => Promise<unknown>;
         };
         expect(result).toBeDefined();
         expect(result.skatersNA).toBeDefined();
      });

      test('draftRankings().skatersNA should fetch North American skater rankings', async () => {
         const rankings = draft.rankings(2024) as unknown as {
            skatersNA: () => Promise<unknown>;
         };
         const result = await rankings.skatersNA();
         expect(result).toBeDefined();
         expect(mockCalls[0]).toContain('draft/rankings/2024/1');
      });

      test('draftRankings().skatersIntl should fetch international skater rankings', async () => {
         const rankings = draft.rankings(2024) as unknown as {
            skatersIntl: () => Promise<unknown>;
         };
         const result = await rankings.skatersIntl();
         expect(result).toBeDefined();
         expect(mockCalls[0]).toContain('draft/rankings/2024/2');
      });

      test('draftRankings().goaliesNA should fetch North American goalie rankings', async () => {
         const rankings = draft.rankings(2024) as unknown as {
            goaliesNA: () => Promise<unknown>;
         };
         const result = await rankings.goaliesNA();
         expect(result).toBeDefined();
         expect(mockCalls[0]).toContain('draft/rankings/2024/3');
      });

      test('draftRankings().goaliesIntl should fetch international goalie rankings', async () => {
         const rankings = draft.rankings(2024) as unknown as {
            goaliesIntl: () => Promise<unknown>;
         };
         const result = await rankings.goaliesIntl();
         expect(result).toBeDefined();
         expect(mockCalls[0]).toContain('draft/rankings/2024/4');
      });

      test('draftRankings().all should fetch all rankings combined', async () => {
         const rankings = draft.rankings(2024) as unknown as {
            all: () => Promise<unknown>;
         };
         const result = await rankings.all();
         expect(result).toBeDefined();
         // Should make multiple calls for each ranking type
         expect(mockCalls.length).toBeGreaterThan(0);
      });

      test('draftRankings should handle string year', () => {
         const result = draft.rankings('2024') as unknown as {
            skatersNA: () => Promise<unknown>;
         };
         expect(result).toBeDefined();
      });

      test('draftRankings should return NHLError for invalid year', async () => {
         const result = await draft.rankings('invalid').skatersIntl();
         expect(result.success).toBeFalse();
         if (!result.success) {
            expect(result.error).toBeInstanceOf(ValidationError);
         }
      });
   });
});

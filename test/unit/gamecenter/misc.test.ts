/**
 * Unit tests for gamecenter misc module
 *
 * Tests miscellaneous endpoints:
 * - seasons() - Get all valid NHL seasons
 * - meta.playoffSeries() - Get meta info for playoff series
 * - meta.game() - Get meta info for a specific game
 * - postalLookup() - Lookup info based on postal code
 * - location() - Get location info
 * - partnerGame() - Get partner game info for a country
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as misc from '#/api/gamecenter/misc.ts';
import { ValidationError } from '#/errors/index.ts';
import { testData } from '../../test-utils.ts';
import { APIResponse } from '#/client/types.ts';

const expectValidationError = (error: APIResponse<unknown>) => {
   expect(error).toBeDefined();
   expect(error.status).toBe('error');
   if (error.status !== 'error') return;
   expect(error.error).toBeInstanceOf(ValidationError);
};

describe('Misc Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('season') && !url.includes('standings-season')) {
            return {
               ok: true,
               json: async () => [
                  { id: '20232024', startYear: 2023, endYear: 2024 },
                  { id: '20242025', startYear: 2024, endYear: 2025 },
               ],
            } as Response;
         }

         if (url.includes('meta/playoff-series')) {
            return {
               ok: true,
               json: async () => ({
                  year: 2024,
                  seriesLetter: 'A',
                  topSeed: { team: 'TOR' },
                  bottomSeed: { team: 'TBL' },
               }),
            } as Response;
         }

         if (url.includes('meta/game')) {
            return {
               ok: true,
               json: async () => ({
                  gameId: testData.gameId,
                  homeTeam: 'TOR',
                  awayTeam: 'OTT',
               }),
            } as Response;
         }

         if (url.includes('postal-lookup')) {
            return {
               ok: true,
               json: async () => ({
                  postalCode: 'M5V 3A8',
                  city: 'Toronto',
                  province: 'ON',
               }),
            } as Response;
         }

         if (url.includes('location')) {
            return {
               ok: true,
               json: async () => ({
                  country: 'Canada',
                  province: 'Ontario',
                  city: 'Toronto',
               }),
            } as Response;
         }

         if (url.includes('partner-game')) {
            return {
               ok: true,
               json: async () => ({
                  games: [{ homeTeam: 'TOR', awayTeam: 'OTT' }],
               }),
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

   test('seasons should fetch all valid NHL seasons', async () => {
      const result = await misc.seasons();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('season');
   });

   test('seasons should make exactly one call', async () => {
      await misc.seasons();
      expect(mockCalls).toHaveLength(1);
   });

   describe('meta', () => {
      test('meta.playoffSeries should fetch playoff series meta with year and series letter', async () => {
         const result = await misc.meta.playoffSeries('A', 2024);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain('meta/playoff-series/2024/A');
      });

      test('meta.playoffSeries should handle string year', async () => {
         await misc.meta.playoffSeries('B', '2024');
         expect(mockCalls[0]).toContain('meta/playoff-series/2024/B');
      });

      test('meta.playoffSeries should accept various series letters', async () => {
         await misc.meta.playoffSeries('O', 2024);
         expect(mockCalls[0]).toContain('meta/playoff-series/2024/O');
      });

      test('meta.playoffSeries should return validation error for invalid year', async () => {
         const result = await misc.meta.playoffSeries('A', 'invalid');
         expectValidationError(result);
      });

      test('meta.playoffSeries should return validation error for invalid series letter', async () => {
         const result = await misc.meta.playoffSeries('Z', 2024);
         expectValidationError(result);
      });

      test('meta.game should fetch game meta with game ID', async () => {
         const result = await misc.meta.game(testData.gameId);
         expect(result).toBeDefined();
         expect(typeof result).toBe('object');
         expect(mockCalls[0]).toContain(`meta/game/${testData.gameId}`);
      });

      test('meta.game should handle numeric game ID', async () => {
         const numericId = 2023020001;
         await misc.meta.game(numericId);
         expect(mockCalls[0]).toContain(`meta/game/${numericId}`);
      });

      test('meta.game should reject invalid game ID', async () => {
         const result = await misc.meta.game('invalid');
         expectValidationError(result);
      });
   });

   test('postalLookup should lookup information by postal code', async () => {
      const result = await misc.postalLookup('M5V 3A8');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('postal-lookup/M5V');
   });

   test('postalLookup should work with various postal codes', async () => {
      mockCalls = [];
      await misc.postalLookup('V6B 4X1');
      expect(mockCalls[0]).toContain('postal-lookup/V6B');
   });

   test('postalLookup should reject invalid postal code', async () => {
      const result = await misc.postalLookup('invalid');
      expectValidationError(result);
   });

   test('location should fetch location information', async () => {
      const result = await misc.location();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('location');
   });

   test('location should make exactly one call', async () => {
      await misc.location();
      expect(mockCalls).toHaveLength(1);
   });

   test('partnerGame should fetch partner game for country code', async () => {
      const result = await misc.partnerGame('ca');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('partner-game/ca/now');
   });

   test('partnerGame should handle various country codes', async () => {
      mockCalls = [];
      await misc.partnerGame('se');
      expect(mockCalls[0]).toContain('partner-game/se/now');
   });

   test('partnerGame should accept uppercase country codes', async () => {
      mockCalls = [];
      await misc.partnerGame('US');
      expect(mockCalls[0]).toContain('partner-game/us/now');
   });

   test('partnerGame should reject invalid country code', async () => {
      const result = await misc.partnerGame('invalid');
      expectValidationError(result);
   });
});

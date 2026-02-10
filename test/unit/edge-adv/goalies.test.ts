import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as goalies from '#/api/edge-adv/goalies.ts';
import { NHLError } from '#/errors/index.ts';
import { testData } from '../../test-utils.ts';

describe('Edge-Adv Goalies Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('edge/goalie')) {
            return {
               ok: true,
               json: async () => ({ ok: true }),
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

   test('player should fetch goalie detail', async () => {
      const result = await goalies.player(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain(
         `edge/goalie-detail/${testData.playerId}/${testData.seasonId}/2`,
      );
   });

   test('compare should fetch goalie comparison detail', async () => {
      const result = await goalies.compare(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/goalie-comparison');
   });

   test('leaders should fetch goalie landing for a season', async () => {
      const result = await goalies.leaders(testData.seasonId, 'REG');
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain(
         `edge/goalie-landing/${testData.seasonId}/2`,
      );
   });

   test('savePercentage5v5 should fetch goalie 5v5 save percentage', async () => {
      const result = await goalies.savePercentage5v5(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/goalie-5v5-detail');
   });

   test('savePercentage should fetch goalie save percentage', async () => {
      const result = await goalies.savePercentage(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/goalie-save-percentage-detail');
   });

   test('saveLocation should fetch goalie save location', async () => {
      const result = await goalies.saveLocation(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/goalie-shot-location-detail');
   });

   test('top10.savePercentage should fetch goalie save percentage top-10 list', async () => {
      const result = await goalies.top10.savePercentage(
         testData.seasonId,
         'REG',
         'GAMES',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/goalie-5v5-top-10');
   });

   test('top10.savePercentage5v5 should fetch goalie 5v5 save percentage top-10 list', async () => {
      const result = await goalies.top10.savePercentage5v5(
         testData.seasonId,
         'REG',
         '5v5-SV%',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/goalie-edge-save-pctg-top-10');
   });

   test('top10.saveLocation should fetch goalie save location top-10 list', async () => {
      const result = await goalies.top10.saveLocation(
         testData.seasonId,
         'REG',
         'SV%',
         'ALL',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/goalie-shot-location-top-10');
   });

   test('player should reject invalid player ID', async () => {
      try {
         await goalies.player(
            'invalid' as unknown as number,
            testData.seasonId,
            'REG',
         );
         expect.unreachable('Expected player to reject invalid player ID');
      } catch (error) {
         expect(error).toBeInstanceOf(NHLError);
         if (error instanceof NHLError) {
            expect(error.category).toBe('VALIDATION');
            expect(error.context.endpoint).toContain('goalie-detail');
         }
      }
   });
});

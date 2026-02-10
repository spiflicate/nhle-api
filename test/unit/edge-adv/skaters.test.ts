import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as skaters from '#/api/edge-adv/skaters.ts';
import { NHLError } from '#/errors/index.ts';
import { testData } from '../../test-utils.ts';

describe('Edge-Adv Skaters Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('skater-')) {
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

   test('detail should fetch skater detail', async () => {
      const result = await skaters.detail(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain(
         `skater-detail/${testData.playerId}/${testData.seasonId}/2`,
      );
   });

   test('shotLocation should fetch skater shot location detail', async () => {
      const result = await skaters.shotLocation(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('skater-shot-location-detail');
   });

   test('shotSpeed should fetch skater shot speed detail', async () => {
      const result = await skaters.shotSpeed(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('skater-shot-speed-detail');
   });

   test('skatingDistance should fetch skater skating distance detail', async () => {
      const result = await skaters.skatingDistance(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('skater-skating-distance-detail');
   });

   test('skatingSpeed should fetch skater skating speed detail', async () => {
      const result = await skaters.skatingSpeed(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('skater-skating-speed-detail');
   });

   test('zoneTime should fetch skater zone time detail', async () => {
      const result = await skaters.zoneTime(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('skater-zone-time');
   });

   test('comparison should fetch skater comparison detail', async () => {
      const result = await skaters.comparison(
         testData.playerId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('skater-comparison');
   });

   test('leaders should fetch skater landing for a season', async () => {
      const result = await skaters.leaders(testData.seasonId, 'REG');
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain(
         `skater-landing/${testData.seasonId}/2`,
      );
   });

   test('top10.distance should fetch skater distance top-10 list', async () => {
      const result = await skaters.top10.distance(
         testData.seasonId,
         'REG',
         'ALL',
         'ES',
         'TOTAL',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('skater-distance-top-10');
      expect(mockCalls[0]).toContain(`/${testData.seasonId}/2`);
   });

   test('top10.shotLocation should fetch skater shot location top-10 list', async () => {
      const result = await skaters.top10.shotLocation(
         testData.seasonId,
         'REG',
         'ALL',
         'G',
         'ALL',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('skater-shot-location-top-10');
   });

   test('top10.shotSpeed should fetch skater shot speed top-10 list', async () => {
      const result = await skaters.top10.shotSpeed(
         testData.seasonId,
         'REG',
         'ALL',
         'MAX',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('skater-shot-speed-top-10');
   });

   test('top10.speed should fetch skater speed top-10 list', async () => {
      const result = await skaters.top10.speed(
         testData.seasonId,
         'REG',
         'ALL',
         'TOP',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('skater-speed-top-10');
   });

   test('top10.zoneTime should fetch skater zone time top-10 list', async () => {
      const result = await skaters.top10.zoneTime(
         testData.seasonId,
         'REG',
         'ALL',
         'ES',
         'OZ',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('skater-zone-time-top-10');
   });

   test('detail should reject invalid player ID', async () => {
      try {
         await skaters.detail(
            'invalid' as unknown as number,
            testData.seasonId,
            'REG',
         );
         expect.unreachable('Expected detail to reject invalid player ID');
      } catch (error) {
         expect(error).toBeInstanceOf(NHLError);
         if (error instanceof NHLError) {
            expect(error.category).toBe('VALIDATION');
            expect(error.context.endpoint).toContain('skater-detail');
         }
      }
   });
});

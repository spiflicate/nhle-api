import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as teams from '#/api/edge-adv/teams.ts';
import { NHLError } from '#/errors/index.ts';
import { testData } from '../../test-utils.ts';

describe('Edge-Adv Teams Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('edge/team')) {
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

   test('stats should fetch team comparison stats', async () => {
      const result = await teams.stats(
         testData.teamId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain(
         `edge/team-comparison/${testData.teamId}/${testData.seasonId}/2`,
      );
   });

   test('compare should default to REG game type', async () => {
      const result = await teams.compare(
         testData.teamId,
         testData.seasonId,
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain(
         `edge/team-detail/${testData.teamId}/${testData.seasonId}/2`,
      );
   });

   test('leaders should fetch team landing for a season', async () => {
      const result = await teams.leaders(testData.seasonId, 'REG');
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain(
         `edge/team-landing/${testData.seasonId}/2`,
      );
   });

   test('shotLocation should fetch team shot location detail', async () => {
      const result = await teams.shotLocation(
         testData.teamId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/team-shot-location-detail');
   });

   test('shotSpeed should fetch team shot speed detail', async () => {
      const result = await teams.shotSpeed(
         testData.teamId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/team-shot-location-top-10');
   });

   test('skatingDistance should fetch team skating distance detail', async () => {
      const result = await teams.skatingDistance(
         testData.teamId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/team-shot-speed-detail');
   });

   test('skatingSpeed should fetch team skating speed detail', async () => {
      const result = await teams.skatingSpeed(
         testData.teamId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/team-shot-speed-top-10');
   });

   test('zoneTime should fetch team zone time detail', async () => {
      const result = await teams.zoneTime(
         testData.teamId,
         testData.seasonId,
         'REG',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/team-skating-distance-detail');
   });

   test('top10.shotLocation should fetch team shot location top-10 list', async () => {
      const result = await teams.top10.shotLocation(
         testData.seasonId,
         'REG',
         'ALL',
         'G',
         'ALL',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/team-skating-distance-top-10');
   });

   test('top10.shotSpeed should fetch team shot speed top-10 list', async () => {
      const result = await teams.top10.shotSpeed(
         testData.seasonId,
         'REG',
         'ALL',
         'MAX',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/team-skating-speed-detail');
   });

   test('top10.skatingDistance should fetch team skating distance top-10 list', async () => {
      const result = await teams.top10.skatingDistance(
         testData.seasonId,
         'REG',
         'ALL',
         'ES',
         'TOTAL',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/team-skating-speed-top-10');
   });

   test('top10.skatingSpeed should fetch team skating speed top-10 list', async () => {
      const result = await teams.top10.skatingSpeed(
         testData.seasonId,
         'REG',
         'ALL',
         'TOP',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/team-zone-time-details');
   });

   test('top10.zoneTime should fetch team zone time top-10 list', async () => {
      const result = await teams.top10.zoneTime(
         testData.seasonId,
         'REG',
         'ES',
         'OZ',
      );
      expect(result.success).toBeTrue();
      expect(mockCalls[0]).toContain('edge/team-zone-time-top-10');
   });

   test('stats should reject invalid team ID', async () => {
      try {
         await teams.stats(
            'invalid' as unknown as number,
            testData.seasonId,
            'REG',
         );
         expect.unreachable('Expected stats to reject invalid team ID');
      } catch (error) {
         expect(error).toBeInstanceOf(NHLError);
         if (error instanceof NHLError) {
            expect(error.category).toBe('VALIDATION');
            expect(error.context.endpoint).toContain('team-comparison');
         }
      }
   });
});

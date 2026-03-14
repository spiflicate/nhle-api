import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { season } from '#/api/edge-stats/index.ts';
import { MockResponseFactory } from '../../test-utils.ts';
import { expectSuccess } from '../helpers.ts';

describe('Season/Game/Draft Modules', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('/componentSeason') || url.includes('/season')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.season(),
                  ]),
            } as Response;
         }

         if (url.includes('/game')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.game(),
                  ]),
            } as Response;
         }

         if (url.includes('/shiftcharts')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     {
                        gameId: '2023020001',
                        playerId: 8476791,
                        shiftNumber: 1,
                        duration: 45,
                     },
                  ]),
            } as Response;
         }

         if (url.includes('/draft')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     { year: 2023, team: 'TOR', pick: 1 },
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

   describe('Seasons', () => {
      test('should fetch season data', async () => {
         const result = await season.getSeasons('en');
         expectSuccess(result);
         if (result.success) {
            expect(result.data.data).toBeInstanceOf(Array);
         }
         expect(mockCalls[0]).toContain('/season');
      });
   });

   describe('Games', () => {
      test('should fetch game data', async () => {
         const result = await season.getGames('en');
         expectSuccess(result);
         if (result.success) {
            expect(result.data.data).toBeInstanceOf(Array);
         }
         expect(mockCalls[0]).toContain('/game');
      });

      test('should fetch game shift charts', async () => {
         const result = await season.getShiftChart('2023020001', 'en');
         expectSuccess(result);
         if (result.success) {
            expect(result.data.data).toBeInstanceOf(Array);
         }
         expect(mockCalls[0]).toContain('/shiftcharts');
      });
   });

   describe('Draft', () => {
      test('should fetch draft data', async () => {
         const result = await season.getDraft('en');
         expectSuccess(result);
         if (result.success) {
            expect(result.data.data).toBeInstanceOf(Array);
         }
         expect(mockCalls[0]).toContain('/draft');
      });
   });
});

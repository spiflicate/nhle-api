import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { draft, games, seasons } from '#/api/edge-stats/season-game.ts';
import { MockResponseFactory, testData } from '../test-utils.ts';

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
      test('should fetch component season data', async () => {
         const result = await seasons.getComponent('en');
         expect(result).toBeDefined();
         expect(result.data).toBeInstanceOf(Array);
         expect(mockCalls[0]).toContain('/componentSeason');
      });

      test('should fetch season data', async () => {
         const result = await seasons.get('en');
         expect(result).toBeDefined();
         expect(result.data).toBeInstanceOf(Array);
         expect(mockCalls[0]).toContain('/season');
      });
   });

   describe('Games', () => {
      test('should fetch game data', async () => {
         const result = await games.get('en');
         expect(result).toBeDefined();
         expect(result.data).toBeInstanceOf(Array);
         expect(mockCalls[0]).toContain('/game');
      });
   });

   describe('Draft', () => {
      test('should fetch draft data', async () => {
         const result = await draft.get('en');
         expect(result).toBeDefined();
         expect(result.data).toBeInstanceOf(Array);
         expect(mockCalls[0]).toContain('/draft');
      });
   });
});

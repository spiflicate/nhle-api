import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
   config,
   contentModules,
   countries,
   glossary,
   server,
   shiftCharts,
} from '#/api/edge-stats/misc.ts';
import { MockResponseFactory } from '../test-utils.ts';

describe('Misc Modules', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('/config')) {
            return {
               ok: true,
               json: async () => ({ version: '1.0', status: 'ok' }),
            } as Response;
         }

         if (url.includes('/ping')) {
            return {
               ok: true,
               json: async () => ({ status: 'pong' }),
            } as Response;
         }

         if (url.includes('/country')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.country(),
                  ]),
            } as Response;
         }

         if (url.includes('/glossary')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.glossaryEntry(),
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

         if (url.includes('/content')) {
            return {
               ok: true,
               json: async () => ({
                  modules: [{ name: 'module1', type: 'content' }],
               }),
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

   describe('Config', () => {
      test('should fetch config', async () => {
         const result = await config.get('en');
         expect(result).toBeDefined();
         expect(mockCalls[0]).toContain('/config');
      });
   });

   describe('Server', () => {
      test('should ping the server', async () => {
         const result = await server.ping();
         expect(result).toBeDefined();
         expect(mockCalls[0]).toContain('/ping');
      });
   });

   describe('Countries', () => {
      test('should fetch all countries', async () => {
         const result = await countries.get('en');
         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result.data.data).toBeInstanceOf(Array);
         }
         expect(mockCalls[0]).toContain('/country');
      });
   });

   describe('Shift Charts', () => {
      test('should fetch shift charts by game ID', async () => {
         const result = await shiftCharts.getByGame('2023020001', 'en');
         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result.data.data).toBeInstanceOf(Array);
         }
         expect(mockCalls[0]).toContain('/shiftcharts');
      });
   });

   describe('Glossary', () => {
      test('should fetch glossary entries', async () => {
         const result = await glossary.get('en');
         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result.data.data).toBeInstanceOf(Array);
         }
         expect(mockCalls[0]).toContain('/glossary');
      });
   });

   describe('Content Modules', () => {
      test('should fetch content modules', async () => {
         const result = await contentModules.get('en');
         expect(result).toBeDefined();
         expect(mockCalls[0]).toContain('/content');
      });
   });
});

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as summary from '#/api/edge-adv/summary.ts';

describe('Edge-Adv Summary Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('edge/by-the-numbers')) {
            return {
               ok: true,
               json: async () => ({ summary: 'ok' }),
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

   test('byTheNumbers should fetch edge by-the-numbers summary', async () => {
      const result = await summary.byTheNumbers();
      expect(result.success).toBeTrue();
      expect(result.data).toBeDefined();
      expect(mockCalls[0]).toContain('edge/by-the-numbers/now');
   });
});

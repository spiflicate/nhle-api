import { afterEach, describe, expect, it, mock } from 'bun:test';
import { NHLClient } from '#/client/index.ts';
import { config } from '#/config/index.ts';
import { NotFoundError } from '#/errors/index.ts';

describe('NHLClient', () => {
   const originalFetch = globalThis.fetch;

   afterEach(() => {
      globalThis.fetch = originalFetch;
      config.language = 'en';
      config.logLevel = 'warn';
   });

   function captureRequests(response = new Response('{}')) {
      const requests: { url: string; init: RequestInit }[] = [];
      globalThis.fetch = mock(async (url: string, init: RequestInit) => {
         requests.push({ url, init });
         return response.clone();
      }) as unknown as typeof fetch;
      return requests;
   }

   it('reads config.language at request time', async () => {
      const requests = captureRequests();
      const client = new NHLClient('https://example.test/v1');

      config.language = 'fr';
      await client.get('score/now');

      const headers = requests[0]?.init.headers as Record<string, string>;
      expect(headers['Accept-Language']).toBe('fr');
   });

   it('prefers its own options over config', async () => {
      const requests = captureRequests();
      const client = new NHLClient({
         baseUrl: 'https://example.test/v1',
         language: 'fr',
         headers: { 'X-Test': '1' },
      });

      await client.get('score/now', { limit: 2 });

      expect(requests[0]?.url).toBe(
         'https://example.test/v1/score/now?limit=2',
      );
      const headers = requests[0]?.init.headers as Record<string, string>;
      expect(headers['Accept-Language']).toBe('fr');
      expect(headers['X-Test']).toBe('1');
      expect(headers.Accept).toBe('application/json');
   });

   it('returns a NotFoundError for a 404', async () => {
      config.logLevel = 'silent';
      captureRequests(new Response('{}', { status: 404 }));
      const client = new NHLClient('https://example.test/v1');

      const result = await client.get('missing');

      expect(result.success).toBe(false);
      if (!result.success)
         expect(result.error).toBeInstanceOf(NotFoundError);
   });
});

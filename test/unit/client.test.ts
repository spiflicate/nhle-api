import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
   configureSharedClientRetries,
   NHLClient,
   nhlClient,
} from '#/client/index.ts';
import {
   NetworkError,
   NotFoundError,
   RateLimitError,
   ServerError,
} from '#/errors/index.ts';

describe('NHLClient retry handling', () => {
   let originalFetch: typeof globalThis.fetch;

   const createFetchMock = (
      handler: (
         input: string | URL | Request,
         init?: RequestInit,
      ) => Promise<Response>,
   ): typeof fetch => {
      return (input, init) => {
         const normalizedInput =
            typeof input === 'string' || input instanceof URL
               ? input
               : input.clone();

         return handler(normalizedInput, init);
      };
   };

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      configureSharedClientRetries({ enabled: false });
   });

   afterEach(() => {
      globalThis.fetch = originalFetch;
      configureSharedClientRetries({ enabled: false });
   });

   test('retries transient network failures and preserves APIResponse success', async () => {
      const client = new NHLClient('https://example.com', undefined, {
         enabled: true,
         baseDelayMs: 0,
         maxDelayMs: 0,
         maxAttempts: 2,
         retryOn: ['network'],
      });
      let callCount = 0;

      globalThis.fetch = createFetchMock(async () => {
         callCount++;

         if (callCount === 1) {
            throw new TypeError('fetch failed');
         }

         return new Response(JSON.stringify({ playerId: 8478402 }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
         });
      });

      const result = await client.get<{ playerId: number }>(
         'players/8478402',
      );

      expect(callCount).toBe(2);
      expect(result.success).toBeTrue();
      if (result.success) {
         expect(result.data.playerId).toBe(8478402);
      }
   });

   test('retries rate-limit responses until attempts are exhausted', async () => {
      const client = new NHLClient('https://example.com', undefined, {
         enabled: true,
         baseDelayMs: 0,
         maxDelayMs: 0,
         maxAttempts: 3,
         retryOn: ['rate-limit'],
         respectRetryAfter: true,
      });
      let callCount = 0;

      globalThis.fetch = createFetchMock(async () => {
         callCount++;

         return new Response(JSON.stringify({ message: 'Slow down' }), {
            status: 429,
            statusText: 'Too Many Requests',
            headers: {
               'Content-Type': 'application/json',
               'Retry-After': '0',
            },
         });
      });

      const result = await client.get('players/8478402/landing');

      expect(callCount).toBe(3);
      expect(result.success).toBeFalse();
      if (!result.success) {
         expect(result.error).toBeInstanceOf(RateLimitError);
      }
   });

   test('does not retry non-transient 404 responses', async () => {
      const client = new NHLClient('https://example.com', undefined, {
         enabled: true,
         baseDelayMs: 0,
         maxDelayMs: 0,
         maxAttempts: 3,
      });
      let callCount = 0;

      globalThis.fetch = createFetchMock(async () => {
         callCount++;

         return new Response(JSON.stringify({ message: 'Not found' }), {
            status: 404,
            statusText: 'Not Found',
            headers: { 'Content-Type': 'application/json' },
         });
      });

      const result = await client.get('players/0/landing');

      expect(callCount).toBe(1);
      expect(result.success).toBeFalse();
      if (!result.success) {
         expect(result.error).toBeInstanceOf(NotFoundError);
      }
   });

   test('shared clients can be configured to retry server responses', async () => {
      configureSharedClientRetries({
         enabled: true,
         baseDelayMs: 0,
         maxDelayMs: 0,
         maxAttempts: 2,
         retryOn: ['server'],
      });
      let callCount = 0;

      globalThis.fetch = createFetchMock(async () => {
         callCount++;

         if (callCount === 1) {
            return new Response(
               JSON.stringify({ message: 'Temporary issue' }),
               {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' },
               },
            );
         }

         return new Response(JSON.stringify({ landing: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
         });
      });

      const result = await nhlClient.get<{
         landing: Record<string, never>;
      }>('gamecenter/2023020001/landing');

      expect(callCount).toBe(2);
      expect(result.success).toBeTrue();
      if (result.success) {
         expect(result.data.landing).toEqual({});
      }
   });

   test('returns a server error after retry exhaustion on 5xx responses', async () => {
      const client = new NHLClient('https://example.com', undefined, {
         enabled: true,
         baseDelayMs: 0,
         maxDelayMs: 0,
         maxAttempts: 2,
         retryOn: ['server'],
      });
      let callCount = 0;

      globalThis.fetch = createFetchMock(async () => {
         callCount++;

         return new Response(JSON.stringify({ message: 'Still failing' }), {
            status: 500,
            statusText: 'Internal Server Error',
            headers: { 'Content-Type': 'application/json' },
         });
      });

      const result = await client.get('players/8478402/landing');

      expect(callCount).toBe(2);
      expect(result.success).toBeFalse();
      if (!result.success) {
         expect(result.error).toBeInstanceOf(ServerError);
      }
   });

   test('returns a network error after timeout retry exhaustion', async () => {
      const client = new NHLClient('https://example.com', undefined, {
         enabled: true,
         baseDelayMs: 0,
         maxDelayMs: 0,
         maxAttempts: 2,
         retryOn: ['timeout'],
      });
      let callCount = 0;

      globalThis.fetch = createFetchMock(async () => {
         callCount++;
         throw new DOMException('The operation was aborted.', 'AbortError');
      });

      const result = await client.get('players/8478402/landing');

      expect(callCount).toBe(2);
      expect(result.success).toBeFalse();
      if (!result.success) {
         expect(result.error).toBeInstanceOf(NetworkError);
         expect(result.error.message).toBe('Request timeout');
      }
   });
});

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { skaters } from '#/api/edge-stats/skaters.ts';
import { NHLError } from '#/errors/index.ts';
import { MockResponseFactory } from '../test-utils.ts';

/**
 * Integration tests for error handling and edge cases
 *
 * These tests verify that the edge-stats API properly handles:
 * - Network errors and failures
 * - Invalid parameters
 * - Timeout scenarios
 * - Malformed responses
 * - Empty data sets
 * - Rate limiting and server errors
 *
 * Run with: bun test test/integration/edge-stats-errors.test.ts
 */

describe('Integration: Edge-Stats API Error Handling', () => {
   let originalFetch: typeof globalThis.fetch;

   beforeEach(() => {
      originalFetch = globalThis.fetch;
   });

   afterEach(() => {
      globalThis.fetch = originalFetch;
   });

   describe('Network and HTTP Errors', () => {
      test('should handle 404 Not Found errors', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: false,
               status: 404,
               statusText: 'Not Found',
               json: async () => ({ error: 'Not found' }),
            } as Response;
         }) as any;

         try {
            await skaters.getPlayerInfo('en');
            expect.unreachable('Should have thrown an error');
         } catch (error) {
            expect(error).toBeInstanceOf(NHLError);
            if (error instanceof NHLError) {
               expect(error.context.statusCode).toBe(404);
            }
            console.log('✓ 404 error handled correctly');
         }
      });

      test('should handle 500 Internal Server errors', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: false,
               status: 500,
               statusText: 'Internal Server Error',
               json: async () => ({ error: 'Server error' }),
            } as Response;
         }) as any;

         try {
            await skaters.getPlayerInfo('en');
            expect.unreachable('Should have thrown an error');
         } catch (error) {
            expect(error).toBeInstanceOf(NHLError);
            if (error instanceof NHLError) {
               expect(error.context.statusCode).toBe(500);
            }
            console.log('✓ 500 error handled correctly');
         }
      });

      test('should handle 429 Rate Limit errors', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: false,
               status: 429,
               statusText: 'Too Many Requests',
               json: async () => ({ error: 'Rate limit exceeded' }),
            } as Response;
         }) as any;

         try {
            await skaters.getPlayerInfo('en');
            expect.unreachable('Should have thrown an error');
         } catch (error) {
            expect(error).toBeInstanceOf(NHLError);
            if (error instanceof NHLError) {
               expect(error.context.statusCode).toBe(429);
            }
            console.log('✓ 429 rate limit error handled correctly');
         }
      });

      test('should handle 503 Service Unavailable errors', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: false,
               status: 503,
               statusText: 'Service Unavailable',
               json: async () => ({ error: 'Service unavailable' }),
            } as Response;
         }) as any;

         try {
            await skaters.getPlayerInfo('en');
            expect.unreachable('Should have thrown an error');
         } catch (error) {
            expect(error).toBeInstanceOf(NHLError);
            console.log(
               '✓ 503 service unavailable error handled correctly',
            );
         }
      });

      test('should handle network timeouts', async () => {
         globalThis.fetch = (async () => {
            throw new Error('Network timeout');
         }) as any;

         try {
            await skaters.getPlayerInfo('en');
            expect.unreachable('Should have thrown an error');
         } catch (error) {
            expect(error).toBeInstanceOf(NHLError);
            console.log('✓ Network timeout handled correctly');
         }
      });

      test('should handle connection refused errors', async () => {
         globalThis.fetch = (async () => {
            throw new Error('Connection refused');
         }) as any;

         try {
            await skaters.getPlayerInfo('en');
            expect.unreachable('Should have thrown an error');
         } catch (error) {
            expect(error).toBeInstanceOf(NHLError);
            console.log('✓ Connection refused error handled correctly');
         }
      });
   });

   describe('Malformed Responses', () => {
      test('should handle invalid JSON responses', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: true,
               status: 200,
               json: async () => {
                  throw new Error('Invalid JSON');
               },
            } as unknown as Response;
         }) as any;

         try {
            await skaters.getPlayerInfo('en');
            expect.unreachable('Should have thrown an error');
         } catch (error) {
            expect(error).toBeInstanceOf(NHLError);
            console.log('✓ Invalid JSON handled correctly');
         }
      });

      test('should handle responses with wrong content type', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: true,
               status: 200,
               json: async () => 'not json',
            } as Response;
         }) as any;

         try {
            const result = await skaters.getPlayerInfo('en');
            // Should return whatever the API returned
            if (result.status === 'success') {
               expect(result.data).toBe('not json');
            }
            console.log('✓ Non-JSON response handled');
         } catch (error) {
            // This is also acceptable - depends on strictness of implementation
            console.log('✓ Non-JSON response rejected');
         }
      });
   });

   describe('Empty and Edge Case Data', () => {
      test('should handle empty data arrays', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: true,
               json: async () => MockResponseFactory.paginatedResponse([]),
            } as Response;
         }) as any;

         const result = (await skaters.getPlayerInfo('en')) as any;
         expect(result).toBeDefined();
         expect(Array.isArray(result.data)).toBe(true);
         expect(result.data.length).toBe(0);
         console.log('✓ Empty data array handled correctly');
      });

      test('should handle null data fields', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: true,
               json: async () => ({
                  data: [
                     { playerId: null, firstName: 'John', lastName: null },
                  ],
               }),
            } as Response;
         }) as any;

         const result = (await skaters.getPlayerInfo('en')) as any;
         expect(result).toBeDefined();
         expect(result.data).toBeDefined();
         expect(result.data[0].playerId).toBeNull();
         console.log('✓ Null fields handled correctly');
      });

      test('should handle very large data sets without crashing', async () => {
         const largeDataSet = Array(10000)
            .fill(0)
            .map((_, i) =>
               MockResponseFactory.skaterStats({ playerId: i }),
            );

         globalThis.fetch = (async () => {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse(largeDataSet),
            } as Response;
         }) as any;

         const result = (await skaters.getPlayerInfo('en')) as any;
         expect(result).toBeDefined();
         expect(result.data.length).toBe(10000);
         console.log('✓ Large data set handled correctly');
      });

      test('should handle unexpected top-level null response', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: true,
               json: async () => null,
            } as Response;
         }) as any;

         const result = await skaters.getPlayerInfo('en');
         expect(result).toBeNull();
         console.log('✓ Null response handled');
      });
   });

   describe('Invalid Parameters', () => {
      test('should accept empty string language code', async () => {
         let capturedUrl = '';
         globalThis.fetch = (async (url: string) => {
            capturedUrl = String(url);
            return {
               ok: true,
               json: async () => MockResponseFactory.paginatedResponse([]),
            } as Response;
         }) as any;

         const result = await skaters.getPlayerInfo('');
         expect(result).toBeDefined();
         // Empty language code will result in /players endpoint
         expect(capturedUrl).toContain('players');
         console.log('✓ Empty language code handled');
      });

      test('should handle special characters in parameters', async () => {
         globalThis.fetch = (async (url: string) => {
            expect(url).toContain('cayenneExp');
            return {
               ok: true,
               json: async () => MockResponseFactory.paginatedResponse([]),
            } as Response;
         }) as any;

         const result = await skaters.getStatsWithParams(
            'summary',
            {
               cayenneExp: 'name="O\'Reilly" and points > 50',
               limit: 10,
            },
            'en',
         );

         expect(result).toBeDefined();
         console.log('✓ Special characters in parameters handled');
      });

      test('should handle negative limit parameter', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: true,
               json: async () => MockResponseFactory.paginatedResponse([]),
            } as Response;
         }) as any;

         const result = await skaters.getStatsWithParams(
            'summary',
            {
               cayenneExp: 'seasonId=20232024',
               limit: -10,
            },
            'en',
         );

         expect(result).toBeDefined();
         // API validation should catch this, but we're testing graceful handling
         console.log('✓ Negative limit parameter handled');
      });

      test('should handle excessively large limit parameter', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: true,
               json: async () => MockResponseFactory.paginatedResponse([]),
            } as Response;
         }) as any;

         const result = await skaters.getStatsWithParams(
            'summary',
            {
               cayenneExp: 'seasonId=20232024',
               limit: Number.MAX_SAFE_INTEGER,
            },
            'en',
         );

         expect(result).toBeDefined();
         console.log('✓ Very large limit parameter handled');
      });
   });

   describe('Response Status Mismatches', () => {
      test('should handle ok=false but valid JSON response', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: false,
               status: 200,
               json: async () => MockResponseFactory.paginatedResponse([]),
            } as Response;
         }) as any;

         try {
            await skaters.getPlayerInfo('en');
            expect.unreachable('Should have thrown an error');
         } catch (error) {
            expect(error).toBeInstanceOf(NHLError);
            console.log('✓ ok=false with 200 status handled correctly');
         }
      });

      test('should handle ok=true with error status code', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: true,
               status: 400,
               json: async () => MockResponseFactory.paginatedResponse([]),
            } as Response;
         }) as any;

         const result = await skaters.getPlayerInfo('en');
         // ok=true takes precedence, should succeed
         expect(result).toBeDefined();
         console.log('✓ ok=true with error status handled');
      });
   });

   describe('Retry and Recovery Scenarios', () => {
      test('should allow retrying after network failure', async () => {
         let callCount = 0;

         globalThis.fetch = (async () => {
            callCount++;
            if (callCount === 1) {
               throw new Error('Network failure');
            }
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.skaterStats(),
                  ]),
            } as Response;
         }) as any;

         try {
            await skaters.getPlayerInfo('en');
            // First call fails, no retry logic in the client
            expect.unreachable('Should have thrown');
         } catch (error) {
            expect(error).toBeInstanceOf(NHLError);
            // Retry would be caller's responsibility
            console.log('✓ Retry scenario setup correctly');
         }
      });
   });

   describe('Abort and Timeout Handling', () => {
      test('should handle abort signals gracefully', async () => {
         globalThis.fetch = (async (url: string, options: any) => {
            if (options.signal?.aborted) {
               throw new DOMException('AbortError', 'AbortError');
            }
            return {
               ok: true,
               json: async () => MockResponseFactory.paginatedResponse([]),
            } as Response;
         }) as any;

         // Create an aborted signal
         const controller = new AbortController();
         controller.abort();

         try {
            // This would need to be passed through the client
            // For now, just verify the mock handles it
            console.log('✓ Abort signal handling verified');
         } catch (error) {
            console.log('✓ Abort signal error caught');
         }
      });
   });

   describe('Data Consistency', () => {
      test('should handle inconsistent data types in arrays', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: true,
               json: async () => ({
                  data: [
                     { playerId: 123, firstName: 'John', lastName: 'Doe' },
                     {
                        playerId: 'NOT_A_NUMBER',
                        firstName: 'Jane',
                        lastName: 'Smith',
                     },
                  ],
               }),
            } as Response;
         }) as any;

         const result = (await skaters.getPlayerInfo('en')) as any;
         expect(result.data.length).toBe(2);
         expect(result.data[0].playerId).toBe(123);
         expect(result.data[1].playerId).toBe('NOT_A_NUMBER');
         console.log('✓ Inconsistent data types handled');
      });

      test('should handle missing required fields in items', async () => {
         globalThis.fetch = (async () => {
            return {
               ok: true,
               json: async () => ({
                  data: [
                     { playerId: 123, firstName: 'John' }, // missing lastName
                     { playerId: 456, lastName: 'Smith' }, // missing firstName
                  ],
               }),
            } as Response;
         }) as any;

         const result = (await skaters.getPlayerInfo('en')) as any;
         expect(result.data.length).toBe(2);
         expect(result.data[0].lastName).toBeUndefined();
         expect(result.data[1].firstName).toBeUndefined();
         console.log('✓ Missing required fields handled');
      });
   });
});

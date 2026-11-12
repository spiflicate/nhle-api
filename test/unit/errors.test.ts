import { describe, expect, it } from 'bun:test';
import {
   fromResponse,
   parseRetryAfter,
   RateLimitError,
} from '#/errors/index.ts';

const rateLimited = (headers: Record<string, string> = {}) =>
   new Response(null, {
      status: 429,
      statusText: 'Too Many Requests',
      headers,
   });

describe('RateLimitError.retryAfter', () => {
   it('is undefined when Retry-After is missing', async () => {
      const error = await fromResponse(rateLimited());
      expect(error).toBeInstanceOf(RateLimitError);
      expect((error as RateLimitError).retryAfter).toBeUndefined();
   });

   it('is 0 for Retry-After: 0', async () => {
      const error = await fromResponse(rateLimited({ 'Retry-After': '0' }));
      expect((error as RateLimitError).retryAfter).toBe(0);
   });

   it('parses a number of seconds', async () => {
      const error = await fromResponse(
         rateLimited({ 'Retry-After': '33' }),
      );
      expect((error as RateLimitError).retryAfter).toBe(33);
   });

   it('parses an HTTP date', async () => {
      const date = new Date(Date.now() + 120_000).toUTCString();
      const error = await fromResponse(
         rateLimited({ 'Retry-After': date }),
      );
      const retryAfter = (error as RateLimitError).retryAfter;
      expect(retryAfter).toBeGreaterThanOrEqual(118);
      expect(retryAfter).toBeLessThanOrEqual(120);
   });

   it('is undefined when the constructor gets no value', () => {
      expect(new RateLimitError().retryAfter).toBeUndefined();
   });
});

describe('parseRetryAfter', () => {
   const now = Date.parse('Wed, 21 Oct 2026 07:28:00 GMT');

   it('converts an HTTP date to seconds from now', () => {
      expect(parseRetryAfter('Wed, 21 Oct 2026 07:28:30 GMT', now)).toBe(
         30,
      );
   });

   it('clamps a past HTTP date to 0', () => {
      expect(parseRetryAfter('Wed, 21 Oct 2026 07:27:00 GMT', now)).toBe(0);
   });

   it('returns undefined for unparseable values', () => {
      expect(parseRetryAfter('soon', now)).toBeUndefined();
      expect(parseRetryAfter('-5', now)).toBeUndefined();
      expect(parseRetryAfter('', now)).toBeUndefined();
      expect(parseRetryAfter(null, now)).toBeUndefined();
   });
});

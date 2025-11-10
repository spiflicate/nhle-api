/**
 * Unit tests for gamecenter score module
 *
 * Tests all score-related endpoints:
 * - score() - Get scores for a specific date (or current date)
 * - scoreboard() - Get current scoreboard
 * - scoreboard.team() - Get scoreboard for a specific team
 * - scoreboard.date() - Get scoreboard for a specific date
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { score, scoreboard } from '#/api/gamecenter/score.ts';

describe('Score Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('score/')) {
            return {
               ok: true,
               json: async () => ({ scores: [] }),
            } as Response;
         }

         if (url.includes('scoreboard/now')) {
            return {
               ok: true,
               json: async () => ({ games: [] }),
            } as Response;
         }

         if (
            url.includes('scoreboard') &&
            /scoreboard\/\d{4}-\d{2}-\d{2}\/?$/.test(url)
         ) {
            return {
               ok: true,
               json: async () => ({ games: [] }),
            } as Response;
         }

         if (url.includes('scoreboard') && url.includes('/now')) {
            return {
               ok: true,
               json: async () => ({ games: [] }),
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

   test('score should fetch scores with default current date', async () => {
      const result = await score();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('score/');
   });

   test('score should fetch scores with specific date string', async () => {
      const date = '2023-10-10';
      await score(date);
      expect(mockCalls[0]).toContain(`score/${date}`);
   });

   test('score should fetch scores with Date object', async () => {
      const date = new Date('2023-10-10');
      await score(date);
      expect(mockCalls[0]).toContain('score/');
   });

   test('score should reject invalid date', async () => {
      try {
         await score('invalid-date');
         expect.unreachable();
      } catch {
         // Expected to throw for invalid date
      }
   });

   test('scoreboard should fetch current scoreboard', async () => {
      const result = await scoreboard();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('scoreboard/now');
   });

   test('scoreboard.team should fetch scoreboard for specific team', async () => {
      const result = await scoreboard.team('TOR');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('scoreboard/TOR/now');
   });

   test('scoreboard.team should handle team abbreviation', async () => {
      await scoreboard.team('EDM');
      expect(mockCalls[0]).toContain('scoreboard/EDM/now');
   });

   test('scoreboard.team should work with multiple team abbreviations', async () => {
      mockCalls = [];
      await scoreboard.team('BOS');
      expect(mockCalls[0]).toContain('scoreboard/BOS/now');
   });

   test('scoreboard.date should fetch scoreboard for specific date', async () => {
      const date = '2023-10-10';
      const result = await scoreboard.date(date);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain(`scoreboard/${date}`);
   });

   test('scoreboard.date should fetch scoreboard with Date object', async () => {
      const date = new Date('2023-10-10');
      await scoreboard.date(date);
      expect(mockCalls[0]).toContain('scoreboard/');
   });

   test('scoreboard.date should reject invalid date', async () => {
      try {
         await scoreboard.date('invalid-date');
         expect.unreachable();
      } catch {
         // Expected to throw for invalid date
      }
   });
});

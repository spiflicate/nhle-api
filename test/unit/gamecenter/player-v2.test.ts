/**
 * Unit tests for the v2 player API (gc.player.v2)
 *
 * Checks the URL each function requests and that bad ids and params are
 * rejected before any request is made.
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as player from '#/api/gamecenter/player.ts';
import { NHL } from '#/constants/index.ts';
import { expectSuccess, expectValidationError } from '../helpers.ts';

const V2 = 'https://api-web.nhle.com/v2/player';
const MCDAVID = 8478402;

describe('Player v2 Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: string[] = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];
      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));
         return {
            ok: true,
            json: async () => ({}),
         } as Response;
      }) as unknown as typeof globalThis.fetch;
   });

   afterEach(() => {
      globalThis.fetch = originalFetch;
   });

   const byId = [
      ['header', player.v2.header, 'header'],
      ['home', player.v2.home, 'home'],
      ['bio', player.v2.bio, 'bio'],
      ['stats', player.v2.stats, 'player-stats'],
   ] as const;

   for (const [name, fn, path] of byId) {
      describe(`v2.${name}`, () => {
         test('requests the v2 path', async () => {
            expectSuccess(await fn(MCDAVID));
            expect(mockCalls).toEqual([`${V2}/${MCDAVID}/${path}`]);
         });

         test('accepts a numeric string id', async () => {
            await fn(String(MCDAVID));
            expect(mockCalls).toEqual([`${V2}/${MCDAVID}/${path}`]);
         });

         test('rejects an invalid id without a request', async () => {
            expectValidationError(await fn('invalid'));
            expect(mockCalls).toEqual([]);
         });
      });
   }

   describe('v2.gameLog', () => {
      test('requests the given season and game type', async () => {
         expectSuccess(await player.v2.gameLog(MCDAVID, 20242025, 3));
         expect(mockCalls).toEqual([
            `${V2}/${MCDAVID}/game-log/20242025/3`,
         ]);
      });

      test('defaults to the current regular season', async () => {
         await player.v2.gameLog(MCDAVID);
         expect(mockCalls).toEqual([
            `${V2}/${MCDAVID}/game-log/${NHL.CURRENT.SEASON}/2`,
         ]);
      });

      test('rejects an invalid id without a request', async () => {
         expectValidationError(await player.v2.gameLog('invalid'));
         expect(mockCalls).toEqual([]);
      });

      test('rejects an invalid season without a request', async () => {
         expectValidationError(await player.v2.gameLog(MCDAVID, 2024));
         expect(mockCalls).toEqual([]);
      });
   });
});

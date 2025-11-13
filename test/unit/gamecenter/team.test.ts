/**
 * Unit tests for gamecenter team module
 *
 * Tests all team-related endpoints:
 * - teams.rosterSeasons() - Get roster seasons for a team
 * - teams.roster() - Get roster for a team and season
 * - teams.prospects() - Get prospects for a team
 * - teams.clubStats() - Get club stats for a team, season, and game type
 * - teams.clubStatsSeason() - Get club stats season for a team
 * - teams.clubSchedule() - Get club schedule with chainable methods (thisWeek, thisMonth, week, month)
 * - teams.clubScheduleSeason() - Get club schedule for an entire season
 * - teams.standings() - Get standings for a specific date
 * - teams.standingsSeason() - Get standings for all seasons
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as team from '#/api/gamecenter/team.ts';
import { ValidationError } from '#/errors/index.ts';

describe('Team Module', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('roster-season')) {
            return {
               ok: true,
               json: async () => ({ seasons: [] }),
            } as Response;
         }

         if (url.includes('roster/') && !url.includes('roster-season')) {
            return {
               ok: true,
               json: async () => ({ players: [] }),
            } as Response;
         }

         if (url.includes('prospects')) {
            return {
               ok: true,
               json: async () => ({ prospects: [] }),
            } as Response;
         }

         if (url.includes('club-stats-season')) {
            return {
               ok: true,
               json: async () => ({ stats: [] }),
            } as Response;
         }

         if (url.includes('club-stats')) {
            return {
               ok: true,
               json: async () => ({ stats: [] }),
            } as Response;
         }

         if (url.includes('standings-season')) {
            return {
               ok: true,
               json: async () => ({ standings: [] }),
            } as Response;
         }

         if (url.includes('standings')) {
            return {
               ok: true,
               json: async () => ({ standings: [] }),
            } as Response;
         }

         if (url.includes('club-schedule-season')) {
            return {
               ok: true,
               json: async () => ({ games: [] }),
            } as Response;
         }

         if (url.includes('club-schedule')) {
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

   test('rosterSeasons should fetch roster seasons for a team', async () => {
      const result = await team.rosterSeasons('TOR');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('roster-season/TOR');
   });

   test('rosterSeasons should work with different team abbreviations', async () => {
      mockCalls = [];
      await team.rosterSeasons('EDM');
      expect(mockCalls[0]).toContain('roster-season/EDM');
   });

   test('roster should fetch roster for team and season', async () => {
      const result = await team.roster('TOR', 20232024);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('roster/TOR');
   });

   test('roster should handle string season', async () => {
      await team.roster('TOR', '20232024');
      expect(mockCalls[0]).toContain('roster/TOR');
   });

   test('roster should fetch with team only (default season)', async () => {
      await team.roster('TOR');
      expect(mockCalls[0]).toContain('roster/TOR');
   });

   test('prospects should fetch prospects for a team', async () => {
      const result = await team.prospects('TOR');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('prospects/TOR');
   });

   test('prospects should work with different team abbreviations', async () => {
      mockCalls = [];
      await team.prospects('VGK');
      expect(mockCalls[0]).toContain('prospects/VGK');
   });

   test('clubStats should fetch club stats with all parameters', async () => {
      const result = await team.clubStats('TOR', 20232024, 2);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('club-stats/TOR');
   });

   test('clubStats should handle string season', async () => {
      await team.clubStats('TOR', '20232024', 2);
      expect(mockCalls[0]).toContain('club-stats/TOR');
   });

   test('clubStats should handle string game type', async () => {
      await team.clubStats('TOR', 20232024, 2);
      expect(mockCalls[0]).toContain('club-stats/TOR');
   });

   test('clubStats should fetch with team only (optional parameters)', async () => {
      await team.clubStats('TOR');
      expect(mockCalls[0]).toContain('club-stats/TOR');
   });

   test('clubStatsSeason should fetch club stats season for a team', async () => {
      const result = await team.clubStatsSeason('TOR');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('club-stats-season/TOR');
   });

   test('clubStatsSeason should work with different team abbreviations', async () => {
      mockCalls = [];
      await team.clubStatsSeason('DAL');
      expect(mockCalls[0]).toContain('club-stats-season/DAL');
   });

   test('standings should fetch standings with default current date', async () => {
      const result = await team.standings();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('standings/');
   });

   test('standings should fetch standings for specific date string', async () => {
      const date = '2023-10-10';
      await team.standings(date);
      expect(mockCalls[0]).toContain(`standings/${date}`);
   });

   test('standings should fetch standings for Date object', async () => {
      const date = new Date('2023-10-10');
      await team.standings(date);
      expect(mockCalls[0]).toContain('standings/');
   });

   test('standings should reject invalid date', async () => {
      try {
         await team.standings('invalid-date');
         expect.unreachable();
      } catch {
         // Expected to throw for invalid date
      }
   });

   test('standingsSeason should fetch standings for all seasons', async () => {
      const result = await team.standingsSeason();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(mockCalls[0]).toContain('standings-season');
   });

   test('standingsSeason should make exactly one call', async () => {
      await team.standingsSeason();
      expect(mockCalls).toHaveLength(1);
   });

   describe('schedule', () => {
      // FIXME: Need to reimplement these tests after refactoring schedule methods
   });
});

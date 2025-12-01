/**
 * Unit tests for gamecenter team module
 *
 * Tests all team-related endpoints:
 * - teams.rosterSeasons() - Get roster seasons for a team
 * - teams.roster() - Get roster for a team and season
 * - teams.prospects() - Get prospects for a team
 * - teams.stats() - Get club stats for a team, season, and game type
 * - teams.statsSeason() - Get club stats season for a team
 * - teams.clubSchedule() - Get club schedule with chainable methods (thisWeek, thisMonth, week, month)
 * - teams.clubScheduleSeason() - Get club schedule for an entire season
 * - teams.standings() - Get standings for a specific date
 * - teams.standingsSeason() - Get standings for all seasons
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { type } from 'arktype';
import * as team from '#/api/gamecenter/team.ts';
import type { APIResponse } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import { getCurrentDate, getCurrentSeason } from '#/utils/date.ts';

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

   const expectSuccess = (result: APIResponse<unknown>) => {
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.status).toBe('success');
   };
   const expectValidationError = (result: APIResponse<unknown>) => {
      expect(result).toBeDefined();
      expect(result.status).toBe('error');
      if (result.status === 'success') {
         expect.unreachable('Expected error but got success');
      }
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(ValidationError);
   };

   test('rosterSeasons should fetch roster seasons for a team', async () => {
      const teamParam = 'TOR';
      const result = await team.rosterSeasons(teamParam);
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`roster-season/${teamParam}`);
   });

   test('rosterSeasons should work with different team abbreviations', async () => {
      const teamParam = 'EDM';
      const result = await team.rosterSeasons(teamParam);
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`roster-season/${teamParam}`);
   });

   test('roster should fetch roster for team and season', async () => {
      const teamParam = 'TOR';
      const seasonParam = 20232024;
      const result = await team.roster(teamParam, seasonParam);
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`roster/${teamParam}/${seasonParam}`);
   });

   test('roster should handle string season', async () => {
      const teamParam = 'TOR';
      const seasonParam = '20232024';
      const result = await team.roster(teamParam, seasonParam);
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`roster/${teamParam}/${seasonParam}`);
   });

   test('roster should fetch with team only (default season)', async () => {
      const teamParam = 'TOR';
      const result = await team.roster(teamParam);
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`roster/${teamParam}`);
   });

   test('prospects should fetch prospects for a team', async () => {
      const teamParam = 'TOR';
      const result = await team.prospects(teamParam);
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`prospects/${teamParam}`);
   });

   test('prospects should work with different team abbreviations', async () => {
      const teamParam = 'VGK';
      const result = await team.prospects(teamParam);
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`prospects/${teamParam}`);
   });

   test('stats should fetch club stats with all parameters', async () => {
      const teamParam = 'TOR';
      const seasonParam = 20232024;
      const gameTypeParam = 2;
      const result = await team.stats(
         teamParam,
         seasonParam,
         gameTypeParam,
      );
      expectSuccess(result);
      expect(mockCalls[0]).toContain(
         `club-stats/${teamParam}/${seasonParam}/${gameTypeParam}`,
      );
   });

   test('stats should handle string season', async () => {
      const teamParam = 'TOR';
      const seasonParam = '20232024';
      const gameTypeParam = 2;
      const result = await team.stats(
         teamParam,
         seasonParam,
         gameTypeParam,
      );
      expectSuccess(result);
      expect(mockCalls[0]).toContain(
         `club-stats/${teamParam}/${seasonParam}/${gameTypeParam}`,
      );
   });

   test('stats should handle string game type', async () => {
      const teamParam = 'TOR';
      const seasonParam = 20232024;
      const gameTypeParam = 'REG';
      const result = await team.stats(
         teamParam,
         seasonParam,
         gameTypeParam,
      );
      expectSuccess(result);
      expect(mockCalls[0]).toContain(
         `club-stats/${teamParam}/${seasonParam}/2`,
      );
   });

   test('stats should fetch with team only (optional parameters)', async () => {
      const teamParam = 'TOR';
      const result = await team.stats(teamParam);
      const season = getCurrentSeason();
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`club-stats/${teamParam}/${season}/2`);
   });

   test('statsSeason should fetch club stats season for a team', async () => {
      const teamParam = 'TOR';
      const result = await team.statsSeason(teamParam);
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`club-stats-season/${teamParam}`);
   });

   test('statsSeason should work with different team abbreviations', async () => {
      const teamParam = 'DAL';
      const result = await team.statsSeason(teamParam);
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`club-stats-season/${teamParam}`);
   });

   test('standings should fetch standings with default current date', async () => {
      const result = await team.standings();
      const date = getCurrentDate();
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`standings/${date}`);
   });

   test('standings should fetch standings for specific date string', async () => {
      const date = '2023-10-10';
      const result = await team.standings(date);
      expectSuccess(result);
      expect(mockCalls[0]).toContain(`standings/${date}`);
   });

   test('standings should fetch standings for Date object', async () => {
      const date = new Date('2023-10-10');
      const result = await team.standings(date);
      expectSuccess(result);
      expect(mockCalls[0]).toContain(
         `standings/${date.toISOString().split('T')[0]}`,
      );
   });

   test('standings should reject invalid date', async () => {
      try {
         const result = await team.standings('invalid-date');
         expectValidationError(result);
      } catch {
         expect.unreachable(
            'Expected ValidationError to be returned but it was thrown',
         );
      }
   });

   test('standingsSeason should fetch standings for all seasons', async () => {
      const result = await team.standingsSeason();
      expectSuccess(result);
      expect(mockCalls[0]).toContain('standings-season');
   });

   describe('schedule', () => {
      test('week should fetch club schedule for current date when omitted', async () => {
         const teamParam = 'TOR';
         const result = await team.schedule.week(teamParam);
         const date = getCurrentDate();
         expectSuccess(result);
         expect(mockCalls[0]).toContain(
            `club-schedule/${teamParam}/week/${date}`,
         );
      });

      test('week should fetch club schedule for specific date string', async () => {
         const teamParam = 'TOR';
         const date = '2023-11-04';
         const result = await team.schedule.week(teamParam, date);
         expectSuccess(result);
         expect(mockCalls[0]).toContain(
            `club-schedule/${teamParam}/week/${date}`,
         );
      });

      test('week should accept Date object', async () => {
         const teamParam = 'TOR';
         const date = new Date('2023-11-04');
         const result = await team.schedule.week(teamParam, date);
         expectSuccess(result);
         expect(mockCalls[0]).toContain(
            `club-schedule/${teamParam}/week/${date.toISOString().split('T')[0]}`,
         );
      });

      test('month should fetch club schedule for specific month string', async () => {
         const teamParam = 'TOR';
         const month = '2023-11';
         const result = await team.schedule.month(teamParam, month);
         expectSuccess(result);
         expect(mockCalls[0]).toContain(
            `club-schedule/${teamParam}/month/${month}`,
         );
      });

      test('month should accept Date object', async () => {
         const teamParam = 'TOR';
         const monthDate = new Date('2023-11-15');
         const result = await team.schedule.month(teamParam, monthDate);
         expectSuccess(result);
         expect(mockCalls[0]).toContain(
            `club-schedule/${teamParam}/month/${monthDate.toISOString().slice(0, 7)}`,
         );
      });

      test('season should fetch full season schedule for a team and season', async () => {
         const teamParam = 'TOR';
         const seasonParam = 20232024;
         const result = await team.schedule.season(teamParam, seasonParam);
         expectSuccess(result);
         expect(mockCalls[0]).toContain(
            `club-schedule-season/${teamParam}/${seasonParam}`,
         );
      });

      test('season should default to current season when omitted', async () => {
         const teamParam = 'TOR';
         const result = await team.schedule.season(teamParam);
         const season = getCurrentSeason();
         expectSuccess(result);
         expect(mockCalls[0]).toContain(
            `club-schedule-season/${teamParam}/${season}`,
         );
      });
   });
});

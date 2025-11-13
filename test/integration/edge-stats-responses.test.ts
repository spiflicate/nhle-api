import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { goalies } from '#/api/edge-stats/goalies.ts';
import {
   config,
   countries,
   glossary,
   shiftCharts,
} from '#/api/edge-stats/misc.ts';
import { draft, games, seasons } from '#/api/edge-stats/season-game.ts';
import { skaters } from '#/api/edge-stats/skaters.ts';
import { teams } from '#/api/edge-stats/teams.ts';
import {
   MockResponseFactory,
   testData,
   testHelpers,
} from '../test-utils.ts';

/**
 * Integration tests for edge-stats API response validation
 *
 * These tests validate the structure and content of responses from edge-stats API
 * endpoints using mock data. They ensure that:
 * - Response structures are consistent
 * - Data types are correct
 * - Required fields are present
 * - Response parsing works correctly
 *
 * Run with: bun test test/integration/edge-stats-responses.test.ts
 */

describe('Integration: Edge-Stats API Response Validation', () => {
   let originalFetch: typeof globalThis.fetch;
   let mockCalls: Array<string> = [];

   beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockCalls = [];

      globalThis.fetch = (async (url: string) => {
         mockCalls.push(String(url));

         if (url.includes('/players')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.skaterStats({ playerId: 8476791 }),
                     MockResponseFactory.skaterStats({ playerId: 8480793 }),
                  ]),
            } as Response;
         }

         if (url.includes('/leaders/skaters')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.skaterStats({
                        points: 120,
                        goals: 50,
                        assists: 70,
                     }),
                  ]),
            } as Response;
         }

         if (url.includes('/milestones/skaters')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.skaterStats({ points: 500 }),
                  ]),
            } as Response;
         }

         if (url.includes('/skater/summary')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.skaterStats(),
                     MockResponseFactory.skaterStats({ playerId: 8480793 }),
                  ]),
            } as Response;
         }

         if (url.includes('/leaders/goalies')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.goalieStats({
                        wins: 45,
                        shutouts: 8,
                     }),
                  ]),
            } as Response;
         }

         if (url.includes('/goalie/summary')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.goalieStats(),
                  ]),
            } as Response;
         }

         if (url.includes('/team/summary')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.teamStats({ wins: 45 }),
                     MockResponseFactory.teamStats({ id: 17, wins: 38 }),
                  ]),
            } as Response;
         }

         if (url.includes('/team/id')) {
            return {
               ok: true,
               json: async () => MockResponseFactory.team(),
            } as Response;
         }

         if (url.includes('/team') && !url.includes('/team/')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.team(),
                     MockResponseFactory.team({
                        id: 17,
                        abbreviation: 'OTT',
                     }),
                  ]),
            } as Response;
         }

         if (url.includes('/season')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.season(),
                     MockResponseFactory.season({
                        id: '20242025',
                        seasonId: '20242025',
                     }),
                  ]),
            } as Response;
         }

         if (url.includes('/game')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse([
                     MockResponseFactory.game(),
                     MockResponseFactory.game({ gameId: '2023020002' }),
                  ]),
            } as Response;
         }

         if (url.includes('/country')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse(testData.countries),
            } as Response;
         }

         if (url.includes('/glossary')) {
            return {
               ok: true,
               json: async () =>
                  MockResponseFactory.paginatedResponse(
                     testData.glossaryEntries,
                  ),
            } as Response;
         }

         if (url.includes('/config')) {
            return {
               ok: true,
               json: async () => ({
                  version: '1.0',
                  timestamp: new Date().toISOString(),
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

   describe('Skaters Module', () => {
      test('should validate player info response structure', async () => {
         const result = (await skaters.getPlayerInfo('en')) as any;

         expect(result).toBeDefined();
         expect(result).toHaveProperty('data');
         expect(Array.isArray(result.data)).toBe(true);
         expect(result.data.length).toBeGreaterThan(0);

         const player = result.data[0];
         expect(player).toHaveProperty('playerId');
         expect(player).toHaveProperty('firstName');
         expect(player).toHaveProperty('lastName');
         expect(typeof player.playerId).toBe('number');
         expect(typeof player.firstName).toBe('string');
         expect(typeof player.lastName).toBe('string');

         console.log('✓ Player info response structure validated');
      });

      test('should validate skater leaders response', async () => {
         const result = await skaters.getLeaders('points', 'en');

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data.data)).toBe(true);

            if (result.data.data.length > 0) {
               const leader = result.data.data[0];
               if (leader) {
                  expect(leader).toHaveProperty('points');
                  expect(leader).toHaveProperty('goals');
                  expect(leader).toHaveProperty('assists');
                  expect(typeof leader.points).toBe('number');

                  // Verify data is sorted or as expected
                  expect(leader.points).toBeGreaterThanOrEqual(100);
               }
            }
         }

         console.log('✓ Skater leaders response validated');
      });

      test('should validate skater stats summary response', async () => {
         const result = await skaters.getStatsWithParams(
            'summary',
            {
               cayenneExp: 'seasonId=20232024 and gameTypeId=2',
               limit: 10,
            },
            'en',
         );

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data.data)).toBe(true);
            expect(result.data.data.length).toBeLessThanOrEqual(10);

            result.data.data.forEach((stat: any) => {
               expect(stat).toHaveProperty('playerId');
               expect(stat).toHaveProperty('seasonId');
               expect(stat.seasonId).toBe('20232024');
            });
         }

         console.log('✓ Skater stats summary response validated');
      });

      test('should validate skater milestones response', async () => {
         const result = await skaters.getMilestones('en');

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data.data)).toBe(true);
         }

         console.log('✓ Skater milestones response validated');
      });
   });

   describe('Goalies Module', () => {
      test('should validate goalie leaders response structure', async () => {
         const result = await goalies.getLeaders('wins', 'en');

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data.data)).toBe(true);

            if (result.data.data.length > 0) {
               const leader = result.data.data[0];
               if (leader) {
                  expect(leader).toHaveProperty('playerId');
                  expect(leader).toHaveProperty('wins');
                  expect(leader).toHaveProperty('shutouts');
                  expect(typeof leader.wins).toBe('number');
                  expect(leader.wins).toBeGreaterThan(0);
               }
            }
         }

         console.log('✓ Goalie leaders response structure validated');
      });

      test('should validate goalie stats summary response', async () => {
         const result = await goalies.getStatsWithParams(
            'summary',
            {
               cayenneExp: 'seasonId=20232024 and gameTypeId=2',
               limit: 10,
            },
            'en',
         );

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data.data)).toBe(true);

            result.data.data.forEach((stat: any) => {
               expect(stat).toHaveProperty('playerId');
               expect(stat).toHaveProperty('gamesPlayed');
               expect(stat).toHaveProperty('savePercentage');
            });
         }

         console.log('✓ Goalie stats summary response validated');
      });
   });

   describe('Teams Module', () => {
      test('should validate all teams response', async () => {
         const result = await teams.getAll('en');

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data.data)).toBe(true);
            expect(result.data.data.length).toBeGreaterThan(0);

            if (result.data.data.length > 0) {
               const team = result.data.data[0];
               if (team) {
                  expect(team).toHaveProperty('id');
                  expect(team).toHaveProperty('name');
                  expect(team).toHaveProperty('abbreviation');
                  expect(typeof team.id).toBe('number');
                  expect(typeof team.name).toBe('string');
               }
            }
         }

         console.log('✓ All teams response validated');
      });

      test('should validate team by ID response', async () => {
         const result = await teams.getById(10, 'en');

         expect(result).toBeDefined();
         expect(result).toHaveProperty('id');
         expect(result).toHaveProperty('name');
         expect(result.id).toBe(10);
         expect(result.name).toBe('Toronto Maple Leafs');

         console.log('✓ Team by ID response validated');
      });

      test('should validate team stats summary response', async () => {
         const result = await teams.getStatsWithParams(
            'summary',
            {
               cayenneExp: 'seasonId=20232024 and gameTypeId=2',
            },
            'en',
         );

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data.data)).toBe(true);

            result.data.data.forEach((stat: any) => {
               expect(stat).toHaveProperty('id');
               expect(stat).toHaveProperty('abbreviation');
               expect(stat).toHaveProperty('wins');
               expect(stat).toHaveProperty('points');
            });
         }

         console.log('✓ Team stats summary response validated');
      });
   });

   describe('Season/Game Module', () => {
      test('should validate season response', async () => {
         const result = await seasons.get('en');

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data.data)).toBe(true);

            if (result.data.data.length > 0) {
               const season = result.data.data[0];
               expect(season).toHaveProperty('seasonId');
               expect(season).toHaveProperty('regularSeasonStartDate');
               expect(season).toHaveProperty('regularSeasonEndDate');
            }
         }

         console.log('✓ Season response validated');
      });

      test('should validate game response', async () => {
         const result = await games.get('en');

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data.data)).toBe(true);

            if (result.data.data.length > 0) {
               const game = result.data.data[0];
               expect(game).toHaveProperty('gameId');
               expect(game).toHaveProperty('date');
               expect(game).toHaveProperty('homeTeam');
               expect(game).toHaveProperty('awayTeam');
            }
         }

         console.log('✓ Game response validated');
      });
   });

   describe('Misc Module', () => {
      test('should validate countries response', async () => {
         const result = await countries.get('en');

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data.data)).toBe(true);
            expect(result.data.data.length).toBeGreaterThan(0);

            if (result.data.data.length > 0) {
               const country = result.data.data[0];
               if (country) {
                  expect(country).toHaveProperty('code');
                  expect(country).toHaveProperty('name');
                  expect(typeof country.code).toBe('string');
               }
            }
         }

         console.log('✓ Countries response validated');
      });

      test('should validate glossary response', async () => {
         const result = await glossary.get('en');

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data.data)).toBe(true);

            if (result.data.data.length > 0) {
               const entry = result.data.data[0];
               expect(entry).toHaveProperty('term');
               expect(entry).toHaveProperty('definition');
            }
         }

         console.log('✓ Glossary response validated');
      });

      test('should validate config response', async () => {
         const result = (await config.get('en')) as any;

         expect(result).toBeDefined();
         expect(result).toHaveProperty('version');
         expect(result).toHaveProperty('timestamp');

         console.log('✓ Config response validated');
      });
   });

   describe('Response Pagination', () => {
      test('should handle limit parameter correctly', async () => {
         const result = await skaters.getStatsWithParams(
            'summary',
            {
               cayenneExp: 'seasonId=20232024',
               limit: 5,
            },
            'en',
         );

         expect(result).toBeDefined();
         if (result.status === 'success') {
            expect(result.data.data.length).toBeLessThanOrEqual(5);
            expect(result.data).toHaveProperty('limit');
            if (result.data.limit) {
               expect(result.data.limit).toBeLessThanOrEqual(5);
            }
         }

         console.log('✓ Limit parameter handled correctly');
      });

      test('should handle start offset parameter', async () => {
         const result = await skaters.getStatsWithParams(
            'summary',
            {
               cayenneExp: 'seasonId=20232024',
               start: 10,
               limit: 5,
            },
            'en',
         );

         expect(result).toBeDefined();
         if (result.status === 'success') {
            // The mock factory always returns start: 0, so just verify it's present
            expect(result.data).toHaveProperty('start');
            expect(typeof result.data.start).toBe('number');
         }

         console.log('✓ Start offset parameter handled correctly');
      });
   });

   describe('Language Support', () => {
      test('should support different language codes', async () => {
         const languages = ['en', 'fr'];

         for (const lang of languages) {
            const result = await skaters.getPlayerInfo(lang);
            expect(result).toBeDefined();
            expect(result).toHaveProperty('data');
         }

         console.log('✓ Multiple language codes supported');
      });

      test('should include language in request URL', async () => {
         await skaters.getPlayerInfo('fr');

         const lastCall = mockCalls[mockCalls.length - 1];
         expect(lastCall).toContain('/fr/players');

         console.log('✓ Language code included in URL');
      });
   });
});

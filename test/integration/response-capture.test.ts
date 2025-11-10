import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import { edgeStatsClient } from '#/client/index.ts';

/**
 * Integration tests that capture real API responses
 * for use in type definitions and validation.
 *
 * These tests call the real NHL Stats API and save responses to files.
 * Run with: bun test test/integration/response-capture.test.ts
 *
 * Disabled by default to avoid making unnecessary API calls.
 * To enable a test, change test.skip to test
 */

const RESPONSE_DATA_DIR = path.join(
   import.meta.dir,
   '../../scripts/response-data',
);
const TIMEOUT = 15000; // 15 seconds timeout for API calls
const MAX_RETRIES = 2;

/**
 * Helper: Save a response to a file
 */
async function saveResponse(category: string, name: string, data: any) {
   const dir = path.join(RESPONSE_DATA_DIR, category);
   await fs.mkdir(dir, { recursive: true });
   const file = path.join(dir, `${name}.json`);
   await fs.writeFile(file, JSON.stringify(data, null, 2));
   console.log(`✓ Saved response to ${file}`);
}

/**
 * Helper: Validate that a response has the expected structure
 */
function validateResponseStructure(response: any): void {
   expect(response).toBeDefined();
   expect(typeof response).toBe('object');
}

/**
 * Helper: Validate paginated response structure
 */
function validatePaginatedResponse(response: any): void {
   validateResponseStructure(response);
   // Most edge-stats responses have data array
   if (Array.isArray(response)) {
      expect(response.length).toBeGreaterThanOrEqual(0);
   } else if (response.data && Array.isArray(response.data)) {
      expect(response.data.length).toBeGreaterThanOrEqual(0);
   }
}

/**
 * Helper: Retry a failed API call with exponential backoff
 */
async function retryWithBackoff<T>(
   fn: () => Promise<T>,
   retries: number = MAX_RETRIES,
): Promise<T> {
   let lastError: Error | null = null;

   for (let i = 0; i < retries; i++) {
      try {
         return await fn();
      } catch (error) {
         lastError = error as Error;
         if (i < retries - 1) {
            const delay = 2 ** i * 1000; // Exponential backoff: 1s, 2s, etc.
            console.warn(`Retry ${i + 1}/${retries - 1} after ${delay}ms`);
            await new Promise((resolve) => setTimeout(resolve, delay));
         }
      }
   }

   throw lastError || new Error('Max retries exceeded');
}

describe('Integration: Real API Response Capture', () => {
   describe('Skaters Module Responses', () => {
      test.skip('should capture player info response', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/players'),
            );
            validatePaginatedResponse(response);
            await saveResponse('skaters', 'player-info', response);
            expect(response).toBeDefined();
            console.log('✓ Player info response captured successfully');
         } catch (error) {
            console.error('Failed to capture player info:', error);
            throw error;
         }
      });

      test.skip('should capture skater leaders response', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/leaders/skaters/points'),
            );
            validatePaginatedResponse(response);
            await saveResponse('skaters', 'leaders-points', response);
            expect(response).toBeDefined();
            console.log('✓ Skater leaders response captured successfully');
         } catch (error) {
            console.error('Failed to capture skater leaders:', error);
            throw error;
         }
      });

      test.skip('should capture skater stats summary', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/skater/summary', {
                  cayenneExp: 'seasonId=20232024 and gameTypeId=2',
                  limit: 10,
               }),
            );
            validatePaginatedResponse(response);
            await saveResponse(
               'skaters',
               'stats-summary-2023-24',
               response,
            );
            expect(response).toBeDefined();
            console.log('✓ Skater stats summary captured successfully');
         } catch (error) {
            console.error('Failed to capture skater stats:', error);
            throw error;
         }
      });

      test.skip('should capture skater milestones', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/milestones/skaters'),
            );
            validatePaginatedResponse(response);
            await saveResponse('skaters', 'milestones', response);
            expect(response).toBeDefined();
            console.log(
               '✓ Skater milestones response captured successfully',
            );
         } catch (error) {
            console.error('Failed to capture milestones:', error);
            throw error;
         }
      });
   });

   describe('Goalies Module Responses', () => {
      test.skip('should capture goalie leaders response', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/leaders/goalies/wins'),
            );
            validatePaginatedResponse(response);
            await saveResponse('goalies', 'leaders-wins', response);
            expect(response).toBeDefined();
            console.log('✓ Goalie leaders response captured successfully');
         } catch (error) {
            console.error('Failed to capture goalie leaders:', error);
            throw error;
         }
      });

      test.skip('should capture goalie stats summary', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/goalie/summary', {
                  cayenneExp: 'seasonId=20232024 and gameTypeId=2',
                  limit: 10,
               }),
            );
            validatePaginatedResponse(response);
            await saveResponse(
               'goalies',
               'stats-summary-2023-24',
               response,
            );
            expect(response).toBeDefined();
            console.log('✓ Goalie stats summary captured successfully');
         } catch (error) {
            console.error('Failed to capture goalie stats:', error);
            throw error;
         }
      });
   });

   describe('Teams Module Responses', () => {
      test.skip('should capture all teams response', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/team'),
            );
            validatePaginatedResponse(response);
            await saveResponse('teams', 'all-teams', response);
            expect(response).toBeDefined();
            console.log('✓ All teams response captured successfully');
         } catch (error) {
            console.error('Failed to capture teams:', error);
            throw error;
         }
      });

      test.skip('should capture team by ID response', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/team/id/10'),
            );
            validateResponseStructure(response);
            await saveResponse('teams', 'team-10-toronto', response);
            expect(response).toBeDefined();
            console.log('✓ Team by ID response captured successfully');
         } catch (error) {
            console.error('Failed to capture team by ID:', error);
            throw error;
         }
      });

      test.skip('should capture team stats summary', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/team/summary', {
                  cayenneExp: 'seasonId=20232024 and gameTypeId=2',
               }),
            );
            validatePaginatedResponse(response);
            await saveResponse('teams', 'stats-summary-2023-24', response);
            expect(response).toBeDefined();
            console.log('✓ Team stats summary captured successfully');
         } catch (error) {
            console.error('Failed to capture team stats:', error);
            throw error;
         }
      });
   });

   describe('Seasons/Games Module Responses', () => {
      test.skip('should capture season data', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/season'),
            );
            validatePaginatedResponse(response);
            await saveResponse('season-game', 'seasons', response);
            expect(response).toBeDefined();
            console.log('✓ Season data captured successfully');
         } catch (error) {
            console.error('Failed to capture seasons:', error);
            throw error;
         }
      });

      test.skip('should capture component season data', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/componentSeason'),
            );
            validatePaginatedResponse(response);
            await saveResponse(
               'season-game',
               'component-seasons',
               response,
            );
            expect(response).toBeDefined();
            console.log('✓ Component season data captured successfully');
         } catch (error) {
            console.error('Failed to capture component seasons:', error);
            throw error;
         }
      });

      test.skip('should capture game data', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/game'),
            );
            validatePaginatedResponse(response);
            await saveResponse('season-game', 'games', response);
            expect(response).toBeDefined();
            console.log('✓ Game data captured successfully');
         } catch (error) {
            console.error('Failed to capture games:', error);
            throw error;
         }
      });

      test.skip('should capture draft data', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/draft'),
            );
            validatePaginatedResponse(response);
            await saveResponse('season-game', 'draft', response);
            expect(response).toBeDefined();
            console.log('✓ Draft data captured successfully');
         } catch (error) {
            console.error('Failed to capture draft:', error);
            throw error;
         }
      });
   });

   describe('Misc Module Responses', () => {
      test.skip('should capture config data', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/config'),
            );
            validateResponseStructure(response);
            await saveResponse('misc', 'config', response);
            expect(response).toBeDefined();
            console.log('✓ Config data captured successfully');
         } catch (error) {
            console.error('Failed to capture config:', error);
            throw error;
         }
      });

      test.skip('should capture countries data', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/country'),
            );
            validatePaginatedResponse(response);
            await saveResponse('misc', 'countries', response);
            expect(response).toBeDefined();
            console.log('✓ Countries data captured successfully');
         } catch (error) {
            console.error('Failed to capture countries:', error);
            throw error;
         }
      });

      test.skip('should capture glossary data', async () => {
         try {
            const response = await retryWithBackoff(() =>
               edgeStatsClient.get('/en/glossary'),
            );
            validatePaginatedResponse(response);
            await saveResponse('misc', 'glossary', response);
            expect(response).toBeDefined();
            console.log('✓ Glossary data captured successfully');
         } catch (error) {
            console.error('Failed to capture glossary:', error);
            throw error;
         }
      });
   });
});

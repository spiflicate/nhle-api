/**
 * ======================================================================
 * NHL Stats API - Season and Game Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for retrieving season and game information
 * from the NHL Stats API.
 */

import { edgeStatsClient } from '#/client/index.ts';
import type { Draft, Game, PaginatedResponse, Season } from './types.ts';

/**
 * Season endpoints and helper functions
 */
export const seasons = {
   /**
    * Get component season information
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to component season data
    *
    * @example
    * const componentSeason = await seasons.getComponent('en');
    */
   getComponent: async (
      lang: string = 'en',
   ): Promise<PaginatedResponse<Season>> =>
      edgeStatsClient.get(`/${lang}/componentSeason`),

   /**
    * Get season information
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to season data
    *
    * @example
    * const seasonInfo = await seasons.get('en');
    */
   get: async (lang: string = 'en'): Promise<PaginatedResponse<Season>> =>
      edgeStatsClient.get(`/${lang}/season`),
};

/**
 * Game endpoints and helper functions
 */
export const games = {
   /**
    * Get game information
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to game data
    *
    * @example
    * const gameInfo = await games.get('en');
    */
   get: async (lang: string = 'en'): Promise<PaginatedResponse<Game>> =>
      edgeStatsClient.get(`/${lang}/game`),
};

/**
 * Draft endpoints and helper functions
 */
export const draft = {
   /**
    * Get draft information
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to draft data
    *
    * @example
    * const draftInfo = await draft.get('en');
    */
   get: async (lang: string = 'en'): Promise<PaginatedResponse<Draft>> =>
      edgeStatsClient.get(`/${lang}/draft`),
};

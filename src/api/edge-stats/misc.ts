/**
 * ======================================================================
 * NHL Stats API - Miscellaneous Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for miscellaneous operations including configuration,
 * country information, shift charts, glossary, and content modules.
 */

import { edgeStatsClient } from '#/client/index.ts';
import type {
   Config,
   ContentModule,
   Country,
   Franchise,
   GlossaryEntry,
   PaginatedResponse,
   ShiftChart,
} from './types.ts';

/**
 * Configuration endpoints and helper functions
 */
export const config = {
   /**
    * Get configuration information
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to configuration data
    *
    * @example
    * const config = await config.get('en');
    */
   get: async (lang: string = 'en'): Promise<Config> =>
      edgeStatsClient.get(`/${lang}/config`),
};

/**
 * Server status endpoints
 */
export const server = {
   /**
    * Ping the server to check connectivity
    *
    * @returns Promise resolving to ping response
    *
    * @example
    * const pong = await server.ping();
    */
   ping: async () => edgeStatsClient.get('/ping'),
};

/**
 * Country endpoints and helper functions
 */
export const countries = {
   /**
    * Get country information
    * Returns list of all countries with a hockey presence
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to country data
    *
    * @example
    * const countries = await countries.get('en');
    */
   get: async (lang: string = 'en'): Promise<PaginatedResponse<Country>> =>
      edgeStatsClient.get(`/${lang}/country`),
};

/**
 * Shift chart endpoints and helper functions
 */
export const shiftCharts = {
   /**
    * Get shift charts for a specific game
    *
    * @param gameId - The game ID
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to shift chart data
    *
    * @example
    * const shifts = await shiftCharts.getByGame('2021020001', 'en');
    */
   getByGame: async (
      gameId: string | number,
      lang: string = 'en',
   ): Promise<PaginatedResponse<ShiftChart>> =>
      edgeStatsClient.get(`/${lang}/shiftcharts`, {
         cayenneExp: `gameId=${gameId}`,
      }),
};

/**
 * Glossary endpoints and helper functions
 */
export const glossary = {
   /**
    * Get the glossary for a specific language
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to glossary data
    *
    * @example
    * const glossary = await glossary.get('en');
    */
   get: async (
      lang: string = 'en',
   ): Promise<PaginatedResponse<GlossaryEntry>> =>
      edgeStatsClient.get(`/${lang}/glossary`),
};

/**
 * Content module endpoints and helper functions
 */
export const contentModules = {
   /**
    * Get content module information for a specific template
    *
    * @param templateKey - The template key/name
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to content module data
    *
    * @example
    * const moduleData = await contentModules.get('overview', 'en');
    */
   get: async (
      templateKey: string,
      lang: string = 'en',
   ): Promise<ContentModule> =>
      edgeStatsClient.get(`/${lang}/content/module/${templateKey}`),
};

/**
 * Franchise endpoints and helper functions
 */
export const franchises = {
   /**
    * Get franchise information
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to franchise data
    *
    * @example
    * const allFranchises = await franchises.get('en');
    */
   get: async (
      lang: string = 'en',
   ): Promise<PaginatedResponse<Franchise>> =>
      edgeStatsClient.get(`/${lang}/franchise`),
};

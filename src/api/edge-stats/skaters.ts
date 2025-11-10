/**
 * ======================================================================
 * NHL Stats API - Skater Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for retrieving skater (player) statistics and information
 * from the NHL Stats API.
 */

import { edgeStatsClient } from '#/client/index.ts';
import {
   buildCayenneExp,
   CayenneQueryBuilder,
} from '#/utils/cayenne-query-builder.ts';
import type {
   PaginatedResponse,
   SkaterLeader,
   SkaterMilestone,
   SkaterStats,
   StatsQueryParams,
} from './types.ts';

/**
 * Skater endpoints and helper functions
 */
export const skaters = {
   /**
    * Get player information (truncated list)
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to player information
    *
    * @example
    * const players = await skaters.getPlayerInfo('en');
    */
   getPlayerInfo: async (lang: string = 'en') =>
      edgeStatsClient.get(`/${lang}/players`),

   /**
    * Get skater leaders for a specific attribute
    *
    * @param attribute - The attribute to rank by (e.g., 'points', 'goals', 'assists')
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to skater leaders
    *
    * @example
    * const leaders = await skaters.getLeaders('points', 'en');
    */
   getLeaders: async (
      attribute: string,
      lang: string = 'en',
   ): Promise<PaginatedResponse<SkaterLeader>> =>
      edgeStatsClient.get(`/${lang}/leaders/skaters/${attribute}`),

   /**
    * Get skater milestones
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to skater milestones
    *
    * @example
    * const milestones = await skaters.getMilestones('en');
    */
   getMilestones: async (
      lang: string = 'en',
   ): Promise<PaginatedResponse<SkaterMilestone>> =>
      edgeStatsClient.get(`/${lang}/milestones/skaters`),

   /**
    * Get skater information (detailed)
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to skater information
    *
    * @example
    * const info = await skaters.getInfo('en');
    */
   getInfo: async (lang: string = 'en') =>
      edgeStatsClient.get(`/${lang}/skater`),

   /**
    * Get skater stats with low-level query parameters
    * This is the most flexible approach - you build the query parameters yourself
    *
    * @param report - The report type (e.g., 'summary', 'detailed')
    * @param params - Query parameters including cayenneExp for filtering
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to skater statistics
    *
    * @example
    * // Option 1: Using low-level params directly
    * const stats = await skaters.getStatsWithParams(
    *   'summary',
    *   {
    *     cayenneExp: 'seasonId=20232024 and gameTypeId=2',
    *     sort: 'points',
    *     limit: 10,
    *     dir: 'desc'
    *   },
    *   'en'
    * );
    */
   getStatsWithParams: async (
      report: string,
      params: StatsQueryParams,
      lang: string = 'en',
   ): Promise<PaginatedResponse<SkaterStats>> =>
      edgeStatsClient.get(`/${lang}/skater/${report}`, params),

   /**
    * Get skater stats using a fluent query builder
    * This approach uses the CayenneQueryBuilder for constructing complex filters
    *
    * @param report - The report type (e.g., 'summary', 'detailed')
    * @param buildQuery - Function that receives a CayenneQueryBuilder and returns params
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to skater statistics
    *
    * @example
    * // Option 2: Using the query builder
    * const stats = await skaters.getStatsWithBuilder(
    *   'summary',
    *   (q) => ({
    *     cayenneExp: q
    *       .equals('seasonId', '20232024')
    *       .equals('gameTypeId', 2)
    *       .build(),
    *     sort: 'points',
    *     limit: 10,
    *     dir: 'desc' as const
    *   }),
    *   'en'
    * );
    */
   getStatsWithBuilder: async (
      report: string,
      buildQuery: (builder: CayenneQueryBuilder) => StatsQueryParams,
      lang: string = 'en',
   ): Promise<PaginatedResponse<SkaterStats>> => {
      const builder = new CayenneQueryBuilder();
      const params = buildQuery(builder);
      return edgeStatsClient.get(`/${lang}/skater/${report}`, params);
   },

   /**
    * Get skater stats with high-level convenience parameters
    * This approach hides the cayenneExp complexity with friendly parameters
    *
    * @param report - The report type (e.g., 'summary', 'detailed')
    * @param filters - High-level filter object
    * @param sorting - Sorting options
    * @param pagination - Pagination options
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to skater statistics
    *
    * @example
    * // Option 3: Using high-level convenience parameters
    * const stats = await skaters.getStatsWithFilters(
    *   'summary',
    *   { seasonId: '20232024', gameTypeId: 2 },
    *   { sortBy: 'points', direction: 'desc' },
    *   { limit: 10, start: 0 },
    *   'en'
    * );
    */
   getStatsWithFilters: async (
      report: string,
      filters?: {
         seasonId?: string | number;
         gameTypeId?: number;
         playerId?: number;
         [key: string]: unknown;
      },
      sorting?: {
         sortBy?: string;
         direction?: 'asc' | 'desc';
      },
      pagination?: {
         limit?: number;
         start?: number;
      },
      lang: string = 'en',
   ): Promise<PaginatedResponse<SkaterStats>> => {
      // Build cayenneExp from high-level filters
      const cayenneFilters: Record<string, string | number> = {};
      if (filters?.seasonId) cayenneFilters.seasonId = filters.seasonId;
      if (filters?.gameTypeId)
         cayenneFilters.gameTypeId = filters.gameTypeId;
      if (filters?.playerId) cayenneFilters.playerId = filters.playerId;

      const params: Record<string, unknown> = {
         cayenneExp: Object.keys(cayenneFilters).length
            ? buildCayenneExp(cayenneFilters)
            : '',
      };
      if (sorting?.sortBy) {
         params.sort = sorting.sortBy;
      }
      if (sorting?.direction) {
         params.dir = sorting.direction;
      }
      if (pagination?.limit) {
         params.limit = pagination.limit;
      }
      if (pagination?.start) {
         params.start = pagination.start;
      }

      return edgeStatsClient.get(`/${lang}/skater/${report}`, params);
   },
};

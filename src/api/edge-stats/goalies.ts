/**
 * ======================================================================
 * NHL Stats API - Goalie Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for retrieving goalie statistics and information
 * from the NHL Stats API.
 */

import { edgeStatsClient } from '#/client/index.ts';
import type { APIResponse } from '#/client/types.ts';
import {
   buildCayenneExp,
   CayenneQueryBuilder,
} from '#/utils/cayenne-query-builder.ts';
import type {
   GoalieLeader,
   GoalieMilestone,
   GoalieStats,
   PaginatedResponse,
   StatsQueryParams,
} from './types.ts';

/**
 * Goalie endpoints and helper functions
 */
export const goalies = {
   /**
    * Get goalie leaders for a specific attribute
    *
    * @param attribute - The attribute to rank by (e.g., 'gaa', 'wins', 'shutouts')
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to goalie leaders
    *
    * @example
    * const leaders = await goalies.getLeaders('gaa', 'en');
    */
   getLeaders: async (
      attribute: string,
      lang: string = 'en',
   ): Promise<APIResponse<PaginatedResponse<GoalieLeader>>> =>
      edgeStatsClient.get(`/${lang}/leaders/goalies/${attribute}`),

   /**
    * Get goalie stats with low-level query parameters
    * This is the most flexible approach - you build the query parameters yourself
    *
    * @param report - The report type (e.g., 'summary', 'detailed')
    * @param params - Query parameters including cayenneExp for filtering
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to goalie statistics
    *
    * @example
    * // Option 1: Using low-level params directly
    * const stats = await goalies.getStatsWithParams(
    *   'summary',
    *   {
    *     cayenneExp: 'seasonId=20232024 and gameTypeId=2',
    *     sort: 'wins',
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
   ): Promise<APIResponse<PaginatedResponse<GoalieStats>>> =>
      edgeStatsClient.get(`/${lang}/goalie/${report}`, params),

   /**
    * Get goalie stats using a fluent query builder
    * This approach uses the CayenneQueryBuilder for constructing complex filters
    *
    * @param report - The report type (e.g., 'summary', 'detailed')
    * @param buildQuery - Function that receives a CayenneQueryBuilder and returns params
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to goalie statistics
    *
    * @example
    * // Option 2: Using the query builder
    * const stats = await goalies.getStatsWithBuilder(
    *   'summary',
    *   (q) => ({
    *     cayenneExp: q
    *       .equals('seasonId', '20232024')
    *       .equals('gameTypeId', 2)
    *       .build(),
    *     sort: 'wins',
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
   ): Promise<APIResponse<PaginatedResponse<GoalieStats>>> => {
      const builder = new CayenneQueryBuilder();
      const params = buildQuery(builder);
      return edgeStatsClient.get(`/${lang}/goalie/${report}`, params);
   },

   /**
    * Get goalie stats with high-level convenience parameters
    * This approach hides the cayenneExp complexity with friendly parameters
    *
    * @param report - The report type (e.g., 'summary', 'detailed')
    * @param filters - High-level filter object
    * @param sorting - Sorting options
    * @param pagination - Pagination options
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to goalie statistics
    *
    * @example
    * // Option 3: Using high-level convenience parameters
    * const stats = await goalies.getStatsWithFilters(
    *   'summary',
    *   { seasonId: '20232024', gameTypeId: 2 },
    *   { sortBy: 'wins', direction: 'desc' },
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
   ): Promise<APIResponse<PaginatedResponse<GoalieStats>>> => {
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

      return edgeStatsClient.get(`/${lang}/goalie/${report}`, params);
   },

   /**
    * Get goalie milestones
    *
    * @param lang - Language code (default: 'en')
    * @returns Promise resolving to goalie milestones
    *
    * @example
    * const milestones = await goalies.getMilestones('en');
    */
   getMilestones: async (
      lang: string = 'en',
   ): Promise<APIResponse<PaginatedResponse<GoalieMilestone>>> =>
      edgeStatsClient.get(`/${lang}/milestones/goalies`),
};

/**
 * ======================================================================
 * NHL Stats API - Goalie Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for retrieving goalie statistics and information
 * from the NHL Stats API.
 */

import { edgeStatsClient } from '#/client/index.js';
import type { APIResult } from '#/client/types.js';
import { envConfig } from '#/config/env.js';
import {
   buildCayenneExp,
   CayenneQueryBuilder,
} from '#/utils/cayenne-query-builder.js';
import { resolvePath } from '#/utils/utils.js';
import { dataPaths as p } from './paths.js';
import type {
   GoalieLeader,
   GoalieMilestone,
   GoalieStats,
   PaginatedData,
   StatsQueryParams,
} from './types.js';

const defaultLang = envConfig.language;

/**
 * Get goalie leaders for a specific attribute
 *
 * @param attribute - The attribute to rank by (e.g., 'gaa', 'wins', 'shutouts')
 * @param lang - Language code (default: environment language if configured, otherwise 'en')
 * @returns Promise resolving to goalie leaders
 *
 * @example
 * const leaders = await goalies.getLeaders('gaa', 'en');
 */
export async function getLeaders(
   statCategory: keyof typeof p.goalie.leaders,
   lang: string = envConfig.language,
) {
   const path = resolvePath(p.goalie.leaders[statCategory], { lang });
   return edgeStatsClient.get<PaginatedData<GoalieLeader>>(path);
}

/**
 * Get goalie stats with low-level query parameters
 * This is the most flexible approach - you build the query parameters yourself
 *
 * @param report - The report type (e.g., 'summary', 'detailed')
 * @param params - Query parameters including cayenneExp for filtering
 * @param lang - Language code (default: environment language if configured, otherwise 'en')
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
export async function getStatsWithParams(
   report: string,
   params: StatsQueryParams,
   lang: string = defaultLang,
) {
   const path = resolvePath(p.goalie.report, { lang, report });
   return edgeStatsClient.get<PaginatedData<GoalieStats>>(path, params);
}

/**
 * Get goalie stats using a fluent query builder
 * This approach uses the CayenneQueryBuilder for constructing complex filters
 *
 * @param report - The report type (e.g., 'summary', 'detailed')
 * @param buildQuery - Function that receives a CayenneQueryBuilder and returns params
 * @param lang - Language code (default: environment language if configured, otherwise 'en')
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
export async function getStatsWithBuilder(
   report: string,
   buildQuery: (builder: CayenneQueryBuilder) => StatsQueryParams,
   lang: string = defaultLang,
) {
   const builder = new CayenneQueryBuilder();
   const params = buildQuery(builder);
   const path = resolvePath(p.goalie.report, { lang, report });
   return edgeStatsClient.get<PaginatedData<GoalieStats>>(path, params);
}

/**
 * Get goalie stats with high-level convenience parameters
 * This approach hides the cayenneExp complexity with friendly parameters
 *
 * @param report - The report type (e.g., 'summary', 'detailed')
 * @param filters - High-level filter object
 * @param sorting - Sorting options
 * @param pagination - Pagination options
 * @param lang - Language code (default: environment language if configured, otherwise 'en')
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
export async function getStatsWithFilters(
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
   lang: string = defaultLang,
) {
   // Build cayenneExp from high-level filters
   const cayenneFilters: Record<string, string | number> = {};
   if (filters?.seasonId) cayenneFilters.seasonId = filters.seasonId;
   if (filters?.gameTypeId) cayenneFilters.gameTypeId = filters.gameTypeId;
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

   const path = resolvePath(p.goalie.report, { lang, report });
   return edgeStatsClient.get<PaginatedData<GoalieStats>>(path, params);
}

/**
 * Get goalie milestones
 *
 * @param lang - Language code (default: environment language if configured, otherwise 'en')
 * @returns Promise resolving to goalie milestones
 *
 * @example
 * const milestones = await goalies.getMilestones();
 */
export async function getMilestones(lang: string = defaultLang) {
   const path = resolvePath(p.goalie.milestones, { lang });
   return edgeStatsClient.get<PaginatedData<GoalieMilestone>>(path);
}

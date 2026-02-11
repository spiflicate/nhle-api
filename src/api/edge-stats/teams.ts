/**
 * ======================================================================
 * NHL Stats API - Team Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for retrieving team statistics and information
 * from the NHL Stats API.
 */

import { edgeStatsClient } from '#/client/index.ts';
import { envConfig } from '#/config/env.ts';
import {
   buildCayenneExp,
   CayenneQueryBuilder,
} from '#/utils/cayenne-query-builder.ts';
import { resolvePath } from '#/utils/utils.ts';
import { dataPaths as p } from './paths.ts';
import type {
   PaginatedResponse,
   StatsQueryParams,
   Team,
   TeamStats,
} from './types.ts';

const defaultLang = envConfig.language;

/**
 * Get list of all teams
 *
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to team list
 *
 * @example
 * const allTeams = await teams.getAll('en');
 */
export async function getAll(lang: string = defaultLang) {
   const path = resolvePath(p.team.all, { lang });
   return edgeStatsClient.get(path);
}

/**
 * Get information for a specific team by ID
 *
 * @param teamId - The team ID
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to team information
 *
 * @example
 * const team = await teams.getById(10, 'en');
 */
export async function getById(teamId: number, lang: string = defaultLang) {
   const path = resolvePath(p.team.byId, { lang, teamId });
   return edgeStatsClient.get<Team>(path);
}

/**
 * Get team stats with low-level query parameters
 * This is the most flexible approach - you build the query parameters yourself
 *
 * @param report - The report type (e.g., 'summary', 'detailed')
 * @param params - Query parameters including cayenneExp for filtering
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to team statistics
 *
 * @example
 * // Option 1: Using low-level params directly
 * const stats = await teams.getStatsWithParams(
 *   'summary',
 *   {
 *     cayenneExp: 'seasonId=20232024 and gameTypeId=2',
 *     sort: 'shotsForPerGame',
 *   },
 *   'en'
 * );
 */
export async function getStatsWithParams(
   report: string,
   params: StatsQueryParams,
   lang: string = defaultLang,
) {
   const path = resolvePath(p.team.report, { lang, report });
   return edgeStatsClient.get<PaginatedResponse<TeamStats>>(path, params);
}

/**
 * Get team stats using a fluent query builder
 * This approach uses the CayenneQueryBuilder for constructing complex filters
 *
 * @param report - The report type (e.g., 'summary', 'detailed')
 * @param buildQuery - Function that receives a CayenneQueryBuilder and returns params
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to team statistics
 *
 * @example
 * // Option 2: Using the query builder
 * const stats = await teams.getStatsWithBuilder(
 *   'summary',
 *   (q) => ({
 *     cayenneExp: q
 *       .equals('seasonId', '20232024')
 *       .equals('gameTypeId', 2)
 *       .build(),
 *     sort: 'shotsForPerGame',
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
   const path = resolvePath(p.team.report, { lang, report });
   return edgeStatsClient.get<PaginatedResponse<TeamStats>>(path, params);
}

/**
 * Get team stats with high-level convenience parameters
 * This approach hides the cayenneExp complexity with friendly parameters
 *
 * @param report - The report type (e.g., 'summary', 'detailed')
 * @param filters - High-level filter object
 * @param sorting - Sorting options
 * @param pagination - Pagination options
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to team statistics
 *
 * @example
 * // Option 3: Using high-level convenience parameters
 * const stats = await teams.getStatsWithFilters(
 *   'summary',
 *   { seasonId: '20232024', gameTypeId: 2 },
 *   { sortBy: 'shotsForPerGame', direction: 'desc' },
 *   { limit: 10, start: 0 },
 *   'en'
 * );
 */
export async function getStatsWithFilters(
   report: string,
   filters?: {
      seasonId?: string | number;
      gameTypeId?: number;
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

   const params: Record<string, unknown> = {};
   if (Object.keys(cayenneFilters).length) {
      params.cayenneExp = buildCayenneExp(cayenneFilters);
   }
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
   const path = resolvePath(p.team.report, { lang, report });
   return edgeStatsClient.get<PaginatedResponse<TeamStats>>(path, params);
}

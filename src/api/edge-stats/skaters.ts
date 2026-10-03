/**
 * ======================================================================
 * NHL Stats API - Skater Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for retrieving skater (player) statistics and information
 * from the NHL Stats API.
 */

import { edgeStatsClient } from '#/client/index.ts';
import { config } from '#/config/index.ts';
import { CayenneQueryBuilder } from '#/utils/cayenne-query-builder.ts';
import { resolvePath } from '#/utils/utils.ts';
import { dataPaths as p } from './paths.ts';
import { filterParams, reportParams } from './query.ts';
import type {
   APIResultPaginated,
   PaginatedData,
   PlayerInfo,
   SkaterLeader,
   SkaterMilestone,
   SkaterReport,
   SkaterStats,
   StatsFilters,
   StatsPagination,
   StatsQueryParams,
   StatsSorting,
} from './types.ts';

/**
 * Look up players (skaters and goalies)
 *
 * The endpoint returns nothing without a filter, so pass a `cayenneExp`.
 *
 * @param params - Query parameters, e.g. `{ cayenneExp: 'id=8478402' }`
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to matching players
 *
 * @example
 * const players = await stats.skaters.getPlayerInfo({
 *    cayenneExp: 'lastName="McDavid"',
 * });
 */
export async function getPlayerInfo(
   params: StatsQueryParams = {},
   lang: string = config.language,
): Promise<APIResultPaginated<PlayerInfo>> {
   const path = resolvePath(p.skater.players, { lang });
   return edgeStatsClient.get<PaginatedData<PlayerInfo>>(path, params);
}

/**
 * Get skater leaders for a stat category
 *
 * Without a filter the leaders are all-time; filter by season with
 * `{ cayenneExp: 'season=20242025 and gameType=2' }`.
 *
 * @param statCategory - 'points', 'goals' or 'assists'
 * @param params - Query parameters (the endpoint ignores `limit`)
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to skater leaders
 *
 * @example
 * const leaders = await stats.skaters.getLeaders('points', {
 *    cayenneExp: 'season=20242025 and gameType=2',
 * });
 */
export async function getLeaders(
   statCategory: keyof typeof p.skater.leaders,
   params: StatsQueryParams = {},
   lang: string = config.language,
): Promise<APIResultPaginated<SkaterLeader>> {
   const path = resolvePath(p.skater.leaders[statCategory], { lang });
   return edgeStatsClient.get<PaginatedData<SkaterLeader>>(path, params);
}

/**
 * Get active skaters approaching a career milestone
 *
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to skater milestones
 *
 * @example
 * const milestones = await stats.skaters.getMilestones();
 */
export async function getMilestones(
   lang: string = config.language,
): Promise<APIResultPaginated<SkaterMilestone>> {
   const path = resolvePath(p.skater.milestones, { lang });
   return edgeStatsClient.get<PaginatedData<SkaterMilestone>>(path);
}

/**
 * Get a skater report
 *
 * @param report - The report name (default: 'summary')
 * @param params - Query parameters including cayenneExp for filtering
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to skater statistics
 *
 * @example
 * const result = await stats.skaters.getStats('summary', {
 *    cayenneExp: 'seasonId=20242025 and gameTypeId=2',
 *    sort: 'points',
 *    dir: 'desc',
 *    limit: 10,
 * });
 */
export async function getStats(
   report: SkaterReport = 'summary',
   params: StatsQueryParams = {},
   lang: string = config.language,
): Promise<APIResultPaginated<SkaterStats>> {
   const path = resolvePath(p.skater.report, { lang, report });
   return edgeStatsClient.get<PaginatedData<SkaterStats>>(
      path,
      reportParams(params),
   );
}

/**
 * Get skater stats with low-level query parameters
 * This is the most flexible approach - you build the query parameters yourself
 *
 * @param report - The report name (e.g., 'summary', 'realtime')
 * @param params - Query parameters including cayenneExp for filtering
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to skater statistics
 *
 * @example
 * const result = await stats.skaters.getStatsWithParams('summary', {
 *    cayenneExp: 'seasonId=20232024 and gameTypeId=2',
 *    sort: 'points',
 *    limit: 10,
 *    dir: 'desc',
 * });
 */
export async function getStatsWithParams(
   report: SkaterReport,
   params: StatsQueryParams,
   lang: string = config.language,
): Promise<APIResultPaginated<SkaterStats>> {
   return getStats(report, params, lang);
}

/**
 * Get skater stats using a fluent query builder
 *
 * @param report - The report name (e.g., 'summary', 'realtime')
 * @param buildQuery - Function that receives a CayenneQueryBuilder and returns params
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to skater statistics
 *
 * @example
 * const result = await stats.skaters.getStatsWithBuilder('summary', (q) => ({
 *    cayenneExp: q.equals('seasonId', 20232024).equals('gameTypeId', 2).build(),
 *    sort: 'points',
 *    limit: 10,
 *    dir: 'desc' as const,
 * }));
 */
export async function getStatsWithBuilder(
   report: SkaterReport,
   buildQuery: (builder: CayenneQueryBuilder) => StatsQueryParams,
   lang: string = config.language,
): Promise<APIResultPaginated<SkaterStats>> {
   return getStats(report, buildQuery(new CayenneQueryBuilder()), lang);
}

/**
 * Get skater stats with high-level convenience parameters
 * Every filter is matched with equality.
 *
 * @param report - The report name (e.g., 'summary', 'realtime')
 * @param filters - Field filters, e.g. `{ seasonId: 20232024, gameTypeId: 2 }`
 * @param sorting - Sorting options
 * @param pagination - Pagination options
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to skater statistics
 *
 * @example
 * const result = await stats.skaters.getStatsWithFilters(
 *    'summary',
 *    { seasonId: '20232024', gameTypeId: 2 },
 *    { sortBy: 'points', direction: 'desc' },
 *    { limit: 10, start: 0 },
 * );
 */
export async function getStatsWithFilters(
   report: SkaterReport,
   filters?: StatsFilters,
   sorting?: StatsSorting,
   pagination?: StatsPagination,
   lang: string = config.language,
): Promise<APIResultPaginated<SkaterStats>> {
   return getStats(
      report,
      filterParams(filters, sorting, pagination),
      lang,
   );
}

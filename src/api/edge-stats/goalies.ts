/**
 * ======================================================================
 * NHL Stats API - Goalie Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for retrieving goalie statistics and information
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
   GoalieLeader,
   GoalieMilestone,
   GoalieReport,
   GoalieStats,
   PaginatedData,
   StatsFilters,
   StatsPagination,
   StatsQueryParams,
   StatsSorting,
} from './types.ts';

/**
 * Get goalie leaders for a stat category
 *
 * Without a filter the leaders are all-time; filter by season with
 * `{ cayenneExp: 'season=20242025 and gameType=2' }`.
 *
 * @param statCategory - 'gaa', 'savePctg' or 'shutouts'
 * @param params - Query parameters (the endpoint ignores `limit`)
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to goalie leaders
 *
 * @example
 * const leaders = await stats.goalies.getLeaders('gaa', {
 *    cayenneExp: 'season=20242025 and gameType=2',
 * });
 */
export async function getLeaders(
   statCategory: keyof typeof p.goalie.leaders,
   params: StatsQueryParams = {},
   lang: string = config.language,
): Promise<APIResultPaginated<GoalieLeader>> {
   const path = resolvePath(p.goalie.leaders[statCategory], { lang });
   return edgeStatsClient.get<PaginatedData<GoalieLeader>>(path, params);
}

/**
 * Get a goalie report
 *
 * @param report - The report name (default: 'summary')
 * @param params - Query parameters including cayenneExp for filtering
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to goalie statistics
 *
 * @example
 * const result = await stats.goalies.getStats('summary', {
 *    cayenneExp: 'seasonId=20242025 and gameTypeId=2',
 *    sort: 'wins',
 *    dir: 'desc',
 *    limit: 10,
 * });
 */
export async function getStats(
   report: GoalieReport = 'summary',
   params: StatsQueryParams = {},
   lang: string = config.language,
): Promise<APIResultPaginated<GoalieStats>> {
   const path = resolvePath(p.goalie.report, { lang, report });
   return edgeStatsClient.get<PaginatedData<GoalieStats>>(
      path,
      reportParams(params),
   );
}

/**
 * Get goalie stats with low-level query parameters
 * This is the most flexible approach - you build the query parameters yourself
 *
 * @param report - The report name (e.g., 'summary', 'advanced')
 * @param params - Query parameters including cayenneExp for filtering
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to goalie statistics
 *
 * @example
 * const result = await stats.goalies.getStatsWithParams('summary', {
 *    cayenneExp: 'seasonId=20232024 and gameTypeId=2',
 *    sort: 'wins',
 *    limit: 10,
 *    dir: 'desc',
 * });
 */
export async function getStatsWithParams(
   report: GoalieReport,
   params: StatsQueryParams,
   lang: string = config.language,
): Promise<APIResultPaginated<GoalieStats>> {
   return getStats(report, params, lang);
}

/**
 * Get goalie stats using a fluent query builder
 *
 * @param report - The report name (e.g., 'summary', 'advanced')
 * @param buildQuery - Function that receives a CayenneQueryBuilder and returns params
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to goalie statistics
 *
 * @example
 * const result = await stats.goalies.getStatsWithBuilder('summary', (q) => ({
 *    cayenneExp: q.equals('seasonId', 20232024).equals('gameTypeId', 2).build(),
 *    sort: 'wins',
 *    limit: 10,
 *    dir: 'desc' as const,
 * }));
 */
export async function getStatsWithBuilder(
   report: GoalieReport,
   buildQuery: (builder: CayenneQueryBuilder) => StatsQueryParams,
   lang: string = config.language,
): Promise<APIResultPaginated<GoalieStats>> {
   return getStats(report, buildQuery(new CayenneQueryBuilder()), lang);
}

/**
 * Get goalie stats with high-level convenience parameters
 * Every filter is matched with equality.
 *
 * @param report - The report name (e.g., 'summary', 'advanced')
 * @param filters - Field filters, e.g. `{ seasonId: 20232024, gameTypeId: 2 }`
 * @param sorting - Sorting options
 * @param pagination - Pagination options
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to goalie statistics
 *
 * @example
 * const result = await stats.goalies.getStatsWithFilters(
 *    'summary',
 *    { seasonId: '20232024', gameTypeId: 2 },
 *    { sortBy: 'wins', direction: 'desc' },
 *    { limit: 10, start: 0 },
 * );
 */
export async function getStatsWithFilters(
   report: GoalieReport,
   filters?: StatsFilters,
   sorting?: StatsSorting,
   pagination?: StatsPagination,
   lang: string = config.language,
): Promise<APIResultPaginated<GoalieStats>> {
   return getStats(
      report,
      filterParams(filters, sorting, pagination),
      lang,
   );
}

/**
 * Get active goalies approaching a career milestone
 *
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to goalie milestones
 *
 * @example
 * const milestones = await stats.goalies.getMilestones();
 */
export async function getMilestones(
   lang: string = config.language,
): Promise<APIResultPaginated<GoalieMilestone>> {
   const path = resolvePath(p.goalie.milestones, { lang });
   return edgeStatsClient.get<PaginatedData<GoalieMilestone>>(path);
}

/**
 * ======================================================================
 * NHL Stats API - Team Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for retrieving team statistics and information
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
   StatsFilters,
   StatsPagination,
   StatsQueryParams,
   StatsSorting,
   Team,
   TeamReport,
   TeamStats,
} from './types.ts';

/**
 * Get every team, past and present
 *
 * @param params - Query parameters, e.g. `{ include: 'logos' }`
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to the team list
 *
 * @example
 * const allTeams = await stats.teams.getAll();
 */
export async function getAll(
   params: StatsQueryParams = {},
   lang: string = config.language,
): Promise<APIResultPaginated<Team>> {
   const path = resolvePath(p.team.all, { lang });
   return edgeStatsClient.get<PaginatedData<Team>>(path, params);
}

/**
 * Get a team by ID
 *
 * The API answers with a one-row list.
 *
 * @param teamId - The team ID
 * @param params - Query parameters, e.g. `{ include: 'logos' }`
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to a list holding the team
 *
 * @example
 * const result = await stats.teams.getById(10);
 * if (result.success) console.log(result.data.data[0]?.fullName);
 */
export async function getById(
   teamId: number,
   params: StatsQueryParams = {},
   lang: string = config.language,
): Promise<APIResultPaginated<Team>> {
   const path = resolvePath(p.team.byId, { lang, teamId });
   return edgeStatsClient.get<PaginatedData<Team>>(path, params);
}

/**
 * Get a team report
 *
 * @param report - The report name (default: 'summary')
 * @param params - Query parameters including cayenneExp for filtering
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to team statistics
 *
 * @example
 * const result = await stats.teams.getStats('summary', {
 *    cayenneExp: 'seasonId=20242025 and gameTypeId=2',
 *    sort: 'points',
 *    dir: 'desc',
 * });
 */
export async function getStats(
   report: TeamReport = 'summary',
   params: StatsQueryParams = {},
   lang: string = config.language,
): Promise<APIResultPaginated<TeamStats>> {
   const path = resolvePath(p.team.report, { lang, report });
   return edgeStatsClient.get<PaginatedData<TeamStats>>(
      path,
      reportParams(params),
   );
}

/**
 * Get team stats with low-level query parameters
 * This is the most flexible approach - you build the query parameters yourself
 *
 * @param report - The report name (e.g., 'summary', 'powerplay')
 * @param params - Query parameters including cayenneExp for filtering
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to team statistics
 *
 * @example
 * const result = await stats.teams.getStatsWithParams('summary', {
 *    cayenneExp: 'seasonId=20232024 and gameTypeId=2',
 *    sort: 'shotsForPerGame',
 * });
 */
export async function getStatsWithParams(
   report: TeamReport,
   params: StatsQueryParams,
   lang: string = config.language,
): Promise<APIResultPaginated<TeamStats>> {
   return getStats(report, params, lang);
}

/**
 * Get team stats using a fluent query builder
 *
 * @param report - The report name (e.g., 'summary', 'powerplay')
 * @param buildQuery - Function that receives a CayenneQueryBuilder and returns params
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to team statistics
 *
 * @example
 * const result = await stats.teams.getStatsWithBuilder('summary', (q) => ({
 *    cayenneExp: q.equals('seasonId', 20232024).equals('gameTypeId', 2).build(),
 *    sort: 'shotsForPerGame',
 *    limit: 10,
 *    dir: 'desc' as const,
 * }));
 */
export async function getStatsWithBuilder(
   report: TeamReport,
   buildQuery: (builder: CayenneQueryBuilder) => StatsQueryParams,
   lang: string = config.language,
): Promise<APIResultPaginated<TeamStats>> {
   return getStats(report, buildQuery(new CayenneQueryBuilder()), lang);
}

/**
 * Get team stats with high-level convenience parameters
 * Every filter is matched with equality.
 *
 * @param report - The report name (e.g., 'summary', 'powerplay')
 * @param filters - Field filters, e.g. `{ seasonId: 20232024, gameTypeId: 2 }`
 * @param sorting - Sorting options
 * @param pagination - Pagination options
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to team statistics
 *
 * @example
 * const result = await stats.teams.getStatsWithFilters(
 *    'summary',
 *    { seasonId: '20232024', gameTypeId: 2 },
 *    { sortBy: 'shotsForPerGame', direction: 'desc' },
 *    { limit: 10, start: 0 },
 * );
 */
export async function getStatsWithFilters(
   report: TeamReport,
   filters?: StatsFilters,
   sorting?: StatsSorting,
   pagination?: StatsPagination,
   lang: string = config.language,
): Promise<APIResultPaginated<TeamStats>> {
   return getStats(
      report,
      filterParams(filters, sorting, pagination),
      lang,
   );
}

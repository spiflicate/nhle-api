/**
 * ======================================================================
 * NHL Stats API - Season and Game Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for retrieving season and game information
 * from the NHL Stats API.
 */

import { edgeStatsClient } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import { config } from '#/config/index.ts';
import { ParseError } from '#/errors/index.ts';
import { resolvePath } from '#/utils/utils.ts';
import { dataPaths as p } from './paths.ts';
import type {
   ActiveSeason,
   APIResultPaginated,
   Draft,
   Game,
   PaginatedData,
   Season,
   ShiftChart,
   StatsQueryParams,
} from './types.ts';

/**
 * Get every season's settings (dates, game counts, rules in use)
 *
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to season data
 *
 * @example
 * const seasons = await stats.season.getSeasons();
 */
export async function getSeasons(
   lang: string = config.language,
): Promise<APIResultPaginated<Season>> {
   const path = resolvePath(p.season, { lang });
   return edgeStatsClient.get<PaginatedData<Season>>(path);
}

/**
 * Get the season and game type the stats site currently shows
 *
 * This is what nhl.com's stats pages default to: the current season, and
 * the regular season or playoffs depending on the time of year.
 *
 * The endpoint lists one row per site component; this returns the
 * `'stats'` row (today the only one), and a `ParseError` result if the
 * response has none.
 *
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to the active season
 *
 * @example
 * const result = await stats.season.getActiveSeason();
 * if (result.success) {
 *    const { seasonId, gameTypeId } = result.data; // 20262027, 2
 * }
 */
export async function getActiveSeason(
   lang: string = config.language,
): Promise<APIResult<ActiveSeason>> {
   const path = resolvePath(p.activeSeason, { lang });
   const result =
      await edgeStatsClient.get<PaginatedData<ActiveSeason>>(path);
   if (!result.success) return result;

   const row = result.data.data?.find((r) => r.component === 'stats');
   if (!row) {
      return {
         success: false,
         error: new ParseError(
            "componentSeason response has no 'stats' row",
            {
               endpoint: path,
            },
         ),
      };
   }
   return { success: true, data: row };
}

/**
 * Get games
 *
 * Without a filter this downloads every game since 1917 (about 19 MB),
 * so filter by season or date.
 *
 * @param params - Query parameters, e.g. `{ cayenneExp: 'season=20242025 and gameType=2' }`
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to game data
 *
 * @example
 * const games = await stats.season.getGames({
 *    cayenneExp: 'gameDate="2025-01-15"',
 * });
 */
export async function getGames(
   params: StatsQueryParams = {},
   lang: string = config.language,
): Promise<APIResultPaginated<Game>> {
   const path = resolvePath(p.game, { lang });
   return edgeStatsClient.get<PaginatedData<Game>>(path, params);
}

/**
 * Get every shift (and goal event) of a game
 *
 * @param gameId - The game ID
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to shift chart data
 *
 * @example
 * const shifts = await stats.season.getShiftChart(2024020500);
 */
export async function getShiftChart(
   gameId: string | number,
   lang: string = config.language,
): Promise<APIResultPaginated<ShiftChart>> {
   const path = resolvePath(p.shiftCharts, { lang });
   const cayenneExp = `gameId=${gameId}`;
   return edgeStatsClient.get<PaginatedData<ShiftChart>>(path, {
      cayenneExp,
   });
}

/**
 * Get the draft years and their number of rounds
 *
 * @param lang - Language code (default: configured language)
 * @returns Promise resolving to draft data
 *
 * @example
 * const drafts = await stats.season.getDraft();
 */
export async function getDraft(
   lang: string = config.language,
): Promise<APIResultPaginated<Draft>> {
   const path = resolvePath(p.draft, { lang });
   return edgeStatsClient.get<PaginatedData<Draft>>(path);
}

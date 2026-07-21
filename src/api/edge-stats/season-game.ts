/**
 * ======================================================================
 * NHL Stats API - Season and Game Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for retrieving season and game information
 * from the NHL Stats API.
 */

import { edgeStatsClient } from '#/client/index.ts';
import { config } from '#/config/index.ts';
import { resolvePath } from '#/utils/utils.ts';
import { dataPaths as p } from './paths.ts';
import type {
   Draft,
   Game,
   PaginatedData,
   Season,
   ShiftChart,
} from './types.ts';

/**
 * Get season information
 *
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to season data
 *
 * @example
 * const seasonInfo = await getSeasons('en');
 */
export async function getSeasons(lang: string = config.language) {
   const path = resolvePath(p.season, { lang });
   return edgeStatsClient.get<PaginatedData<Season>>(path);
}

/**
 * Get game information
 *
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to game data
 *
 * @example
 * const gameInfo = await getGames('en');
 */
export async function getGames(lang: string = config.language) {
   const path = resolvePath(p.game, { lang });
   return edgeStatsClient.get<PaginatedData<Game>>(path);
}

/**
 * Get shift charts for a specific game
 *
 * @param gameId - The game ID
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to shift chart data
 *
 * @example
 * const shifts = await getShiftChart('2021020001', 'en');
 */
export async function getShiftChart(
   gameId: string | number,
   lang: string = config.language,
) {
   const path = resolvePath(p.shiftCharts, { lang });
   const cayenneExp = `gameId=${gameId}`;
   return edgeStatsClient.get<PaginatedData<ShiftChart>>(path, {
      cayenneExp,
   });
}

/**
 * Get draft information
 *
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to draft data
 *
 * @example
 * const draftInfo = await getDraft('en');
 */
export async function getDraft(lang: string = 'en') {
   const path = resolvePath(p.draft, { lang });
   return edgeStatsClient.get<PaginatedData<Draft>>(path);
}

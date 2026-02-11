/**
 * ======================================================================
 * NHL Stats API - Season and Game Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for retrieving season and game information
 * from the NHL Stats API.
 */

import { edgeStatsClient } from '#/client/index.ts';
import { envConfig } from '#/config/env.ts';
import { resolvePath } from '#/utils/utils.ts';
import { dataPaths as p } from './paths.ts';
import type { Draft, Game, PaginatedResponse, Season } from './types.ts';

const defaultLang = envConfig.language;

/**
 * Get season information
 *
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to season data
 *
 * @example
 * const seasonInfo = await getSeasons('en');
 */
export async function getSeasons(lang: string = defaultLang) {
   const path = resolvePath(p.season, { lang });
   return edgeStatsClient.get<PaginatedResponse<Season>>(path);
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
export async function getGames(lang: string = defaultLang) {
   const path = resolvePath(p.game, { lang });
   return edgeStatsClient.get<PaginatedResponse<Game>>(path);
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
   return edgeStatsClient.get<PaginatedResponse<Draft>>(path);
}

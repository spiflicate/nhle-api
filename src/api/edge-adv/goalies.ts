/**
 * ======================================================================
 * API endpoints for goalie-related data.
 * Base url: api-web.nhle.com/v1/edge
 *
 * Notes:
 * - Convenience endpoints using 'now' for season have been
 * excluded in favor of using calculated current season. You can optionally
 * configure the switch over date for how current season is calculated.
 * See README for details.
 * - There is an extra endpoint that appears to duplicate
 * the functionality of /skater-detail at `v1/cat/edge/skater-detail`
 * As such, it has been excluded from this implementation.
 * ======================================================================
 */

import { nhlClient } from '#/client/index.ts';
import { NHLError } from '#/errors/index.ts';
import {
   BaseParams,
   isParseError,
   PlayerParams,
   SaveLocationCategory as SaveLocationCategorySchema,
   SaveLocationSort as SaveLocationSortSchema,
   SavePercentage5v5Sort as SavePercentage5v5SortSchema,
   SavePercentageSort as SavePercentageSortSchema,
} from '#/utils/schemas.ts';
import type {
   GameType,
   PlayerId,
   SaveLocationCategory,
   SaveLocationSort,
   SavePercentage5v5Sort,
   SavePercentageSort,
   Season,
} from '../../types/types.ts';
import { route } from '../../utils/utils.ts';
import { goaliesPaths as p } from './paths.ts';

/**
 * Goalie Edge Advanced Stats API helpers.
 *
 * Lightweight wrapper exposing functions that call the underlying nhlClient
 * for goalie-related endpoints. Each method returns the raw Promise from the
 * client.get call.
 */

/**
 * Get goalie detail for a player.
 * @param playerId - The player's numeric id.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to the raw API response.
 */
export async function player(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.player,
         }),
      );
   return nhlClient.get(route(p.player, parsed));
}

/**
 * Get goalie comparison data for a player.
 * @param playerId - The player's numeric id.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to the raw API response.
 */
export async function compare(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.compare,
         }),
      );
   return nhlClient.get(route(p.compare, parsed));
}
/**
 * Get goalie landing / leaders for a season.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to the raw API response.
 */
export async function leaders(
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = BaseParams({ season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.leaders,
         }),
      );
   return nhlClient.get(route(p.leaders, parsed));
}

/**
 * Get 5v5 save percentage details for a goalie.
 * @param playerId - The player's numeric id.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to the raw API response.
 */
export async function savePercentage5v5(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.savePercentage5v5,
         }),
      );
   return nhlClient.get(route(p.savePercentage5v5, parsed));
}

/**
 * Get save percentage details for a goalie.
 * @param playerId - The player's numeric id.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to the raw API response.
 */
export async function savePercentage(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.savePercentage,
         }),
      );
   return nhlClient.get(route(p.savePercentage, parsed));
}

/**
 * Get save location details for a goalie.
 * @param playerId - The player's numeric id.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to the raw API response.
 */
export async function saveLocation(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.saveLocation,
         }),
      );
   return nhlClient.get(route(p.saveLocation, parsed));
}

/**
 * Accessor for top-10 leaderboards.
 * @returns Object with methods to fetch various top-10 lists.
 */
export const top10 = {
   savePercentage: top10SavePercentage,
   savePercentage5v5: top10SavePercentage5v5,
   saveLocation: top10SaveLocation,
};
/**
 * Top-10 edge save percentage lists.
 * @param sortBy - Sorting key for the leaderboard.
 * @param season - Optional season (numeric or 'now').
 * @param gameType - Optional game type id.
 * @returns Promise resolving to the raw API response.
 */
async function top10SavePercentage(
   season?: Season,
   gameType?: GameType,
   sortBy?: SavePercentageSort,
): Promise<unknown> {
   const Parser = BaseParams.merge({
      sortBy: SavePercentageSortSchema.default('GAMES'),
   });
   const parsed = Parser({ season, gameType, sortBy });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.top10.SavePercentage,
         }),
      );
   return nhlClient.get(route(p.top10.SavePercentage, parsed));
}

/**
 * Top-10 5v5 save percentage lists.
 * @param sortBy - Sorting key for the leaderboard.
 * @param season - Optional season (numeric or 'now').
 * @param gameType - Optional game type id.
 * @returns Promise resolving to the raw API response.
 */
async function top10SavePercentage5v5(
   season?: Season,
   gameType?: GameType,
   sortBy?: SavePercentage5v5Sort,
): Promise<unknown> {
   const Parser = BaseParams.merge({
      sortBy: SavePercentage5v5SortSchema.default('5v5-SV%'),
   });
   const parsed = Parser({ season, gameType, sortBy });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.top10.SavePercentage5v5,
         }),
      );
   return nhlClient.get(route(p.top10.SavePercentage5v5, parsed));
}

/**
 * Top-10 save location lists.
 * @param category - Category key (see SaveLocationCategoryEnum).
 * @param sortBy - Sorting key for the leaderboard (see SaveLocationSortEnum).
 * @param season - Optional season (e.g. 20242025).
 * @param gameType - Optional game type.
 * @returns Promise resolving to the raw API response.
 */
async function top10SaveLocation(
   season?: Season,
   gameType?: GameType,
   category?: SaveLocationCategory,
   sortBy?: SaveLocationSort,
): Promise<unknown> {
   const Parser = BaseParams.merge({
      category: SaveLocationCategorySchema.default('SV%'),
      sortBy: SaveLocationSortSchema.default('ALL'),
   });
   const parsed = Parser({
      season,
      gameType,
      category,
      sortBy,
   });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.top10.SaveLocation,
         }),
      );
   return nhlClient.get(route(p.top10.SaveLocation, parsed));
}

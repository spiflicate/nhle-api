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
import type { APIResult } from '#/client/types.ts';
import type {
   EdgeGoalieComparison,
   EdgeGoalieDetail,
   EdgeGoalieLanding,
   EdgeGoalieSavePercentage,
   EdgeGoalieSavePercentage5v5,
   EdgeGoalieSavePercentage5v5Top10,
   EdgeGoalieSavePercentageTop10,
   EdgeGoalieShotLocation,
   EdgeGoalieShotLocationTop10,
} from '#/types/responses/edge-adv.ts';
import {
   BaseParams,
   invalidParams,
   isParseError,
   PlayerParams,
   SaveLocationCategory as SaveLocationCategorySchema,
   SaveLocationSort as SaveLocationSortSchema,
   SavePercentage5v5Sort as SavePercentage5v5SortSchema,
   SavePercentageSort as SavePercentageSortSchema,
   withDefault,
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
import { resolvePath } from '../../utils/utils.ts';
import { goaliesPaths as p } from './paths.ts';

/**
 * Goalie Edge Advanced Stats API helpers.
 *
 * Lightweight wrapper exposing functions that call the underlying nhlClient
 * for goalie-related endpoints. Each function resolves to an APIResult; invalid
 * parameters give a ValidationError result without a request.
 */

/**
 * Get goalie detail for a player.
 * @param playerId - The player's numeric id.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to an APIResult with the response data.
 */
export async function player(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeGoalieDetail>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.player);
   const path = resolvePath(p.player, parsed);
   return nhlClient.get<EdgeGoalieDetail>(path);
}

/**
 * Get goalie comparison data for a player.
 * @param playerId - The player's numeric id.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to an APIResult with the response data.
 */
export async function compare(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeGoalieComparison>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.compare);
   const path = resolvePath(p.compare, parsed);
   return nhlClient.get<EdgeGoalieComparison>(path);
}
/**
 * Get goalie landing / leaders for a season.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to an APIResult with the response data.
 */
export async function leaders(
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeGoalieLanding>> {
   const parsed = BaseParams({ season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.leaders);
   const path = resolvePath(p.leaders, parsed);
   return nhlClient.get<EdgeGoalieLanding>(path);
}

/**
 * Get 5v5 save percentage details for a goalie.
 * @param playerId - The player's numeric id.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to an APIResult with the response data.
 */
export async function savePercentage5v5(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeGoalieSavePercentage5v5>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return invalidParams(parsed, p.savePercentage5v5);
   const path = resolvePath(p.savePercentage5v5, parsed);
   return nhlClient.get<EdgeGoalieSavePercentage5v5>(path);
}

/**
 * Get save percentage details for a goalie.
 * @param playerId - The player's numeric id.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to an APIResult with the response data.
 */
export async function savePercentage(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeGoalieSavePercentage>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.savePercentage);
   const path = resolvePath(p.savePercentage, parsed);
   return nhlClient.get<EdgeGoalieSavePercentage>(path);
}

/**
 * Get save location details for a goalie.
 * @param playerId - The player's numeric id.
 * @param season - Optional season (numeric season format or 'now' via argParse).
 * @param gameType - Optional game type id.
 * @returns Promise resolving to an APIResult with the response data.
 */
export async function saveLocation(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeGoalieShotLocation>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.saveLocation);
   const path = resolvePath(p.saveLocation, parsed);
   return nhlClient.get<EdgeGoalieShotLocation>(path);
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
 * @returns Promise resolving to an APIResult with the response data.
 */
async function top10SavePercentage(
   season?: Season,
   gameType?: GameType,
   sortBy?: SavePercentageSort,
): Promise<APIResult<EdgeGoalieSavePercentageTop10>> {
   const Parser = BaseParams.merge({
      sortBy: withDefault(SavePercentageSortSchema, 'GAMES'),
   });
   const parsed = Parser({ season, gameType, sortBy });
   if (isParseError(parsed))
      return invalidParams(parsed, p.top10.savePercentage);
   const path = resolvePath(p.top10.savePercentage, parsed);
   return nhlClient.get<EdgeGoalieSavePercentageTop10>(path);
}

/**
 * Top-10 5v5 save percentage lists.
 * @param sortBy - Sorting key for the leaderboard.
 * @param season - Optional season (numeric or 'now').
 * @param gameType - Optional game type id.
 * @returns Promise resolving to an APIResult with the response data.
 */
async function top10SavePercentage5v5(
   season?: Season,
   gameType?: GameType,
   sortBy?: SavePercentage5v5Sort,
): Promise<APIResult<EdgeGoalieSavePercentage5v5Top10>> {
   const Parser = BaseParams.merge({
      sortBy: withDefault(SavePercentage5v5SortSchema, '5v5-SV%'),
   });
   const parsed = Parser({ season, gameType, sortBy });
   if (isParseError(parsed))
      return invalidParams(parsed, p.top10.savePercentage5v5);
   const path = resolvePath(p.top10.savePercentage5v5, parsed);
   return nhlClient.get<EdgeGoalieSavePercentage5v5Top10>(path);
}

/**
 * Top-10 save location lists.
 * @param category - Category key (see SaveLocationCategoryEnum).
 * @param sortBy - Sorting key for the leaderboard (see SaveLocationSortEnum).
 * @param season - Optional season (e.g. 20242025).
 * @param gameType - Optional game type.
 * @returns Promise resolving to an APIResult with the response data.
 */
async function top10SaveLocation(
   season?: Season,
   gameType?: GameType,
   category?: SaveLocationCategory,
   sortBy?: SaveLocationSort,
): Promise<APIResult<EdgeGoalieShotLocationTop10>> {
   const Parser = BaseParams.merge({
      category: withDefault(SaveLocationCategorySchema, 'SV%'),
      sortBy: withDefault(SaveLocationSortSchema, 'ALL'),
   });
   const parsed = Parser({
      season,
      gameType,
      category,
      sortBy,
   });
   if (isParseError(parsed))
      return invalidParams(parsed, p.top10.saveLocation);
   const path = resolvePath(p.top10.saveLocation, parsed);
   return nhlClient.get<EdgeGoalieShotLocationTop10>(path);
}

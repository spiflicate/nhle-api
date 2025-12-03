/**
 * @module api/gamecenter/player
 * @description Player-related API endpoints for player information, stats, game logs, and search
 */

import nhlClient, { createNHLClient } from '#/client/index.ts';
import type { APIResponse } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type {
   GoalieStatsLeaders,
   PlayerGameLog,
   PlayerLanding,
   PlayerSearchResult,
   PlayerSpotlight,
   SkaterStatsLeaders,
} from '#/types/index.ts';
import type { GameType, Season } from '#/types/types.ts';
import { BaseParams, isParseError, PlayerId } from '#/utils/schemas.ts';
import { route } from '#/utils/utils.ts';
import { _playerPaths as _paths } from './_paths.ts';

const nhlPlayerSearch = createNHLClient(_paths.playerSearch);
const searchUrlParams = { culture: 'en', q: '' };

/**
 * Get player landing page information
 * @param playerId - The unique player identifier (NHL player ID number)
 * @returns Promise resolving to player landing information with career stats and bio
 * @example
 * ```ts
 * landing(8478402).then((data) => console.log(data)); // Connor McDavid
 * ```
 */
export async function landing(
   playerId: number | string,
): Promise<APIResponse<PlayerLanding>> {
   const parsedPlayerId = PlayerId(playerId);
   if (isParseError(parsedPlayerId)) {
      return {
         status: 'error',
         error: new ValidationError(parsedPlayerId.summary, {
            endpoint: _paths.landing,
         }),
      };
   }
   return nhlClient.get(
      route(_paths.landing, { playerId: parsedPlayerId }),
   );
}

/**
 * Get player game log for a specific season
 * @param playerId - The unique player identifier (NHL player ID number)
 * @param season - The season identifier (8-digit format: YYYYYYYY). Defaults to current season
 * @param gameType - The game type (2 = regular season, 3 = playoffs). Defaults to regular season
 * @returns Promise resolving to player game-by-game statistics
 * @example
 * ```ts
 * gameLog(8478402, 20232024, 2).then((data) => console.log(data));
 * ```
 */
export async function gameLog(
   playerId: number | string,
   season?: Season,
   gameType?: GameType,
): Promise<APIResponse<PlayerGameLog>> {
   const Parser = BaseParams.merge({
      playerId: PlayerId,
   });
   const parsed = Parser({ playerId, season, gameType });
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.gameLog,
         }),
      };
   }
   return nhlClient.get(route(_paths.gameLog, parsed));
}

/**
 * Get player spotlight featuring highlighted players
 * @returns Promise resolving to featured/spotlight players
 * @example
 * ```ts
 * spotlight().then((data) => console.log(data));
 * ```
 */
export async function spotlight(): Promise<APIResponse<PlayerSpotlight>> {
   return nhlClient.get(_paths.spotlight);
}

/**
 * Search for players by name
 * @param query - The search query string (player name)
 * @returns Promise resolving to player search results
 * @example
 * ```ts
 * search('McDavid').then((data) => console.log(data));
 * ```
 */
export async function search(
   query: string,
): Promise<APIResponse<PlayerSearchResult>> {
   return nhlPlayerSearch.get('', {
      ...searchUrlParams,
      q: query,
   });
}

/**
 * Access stats leaders endpoints for skaters and goalies
 * @description Get statistical leaders across various categories
 */
export const statsLeaders = {
   skaters: statsLeadersSkaters,
   goalies: statsLeadersGoalies,
};
/**
 * Get skater stats leaders
 * @param season - The season identifier (8-digit format: YYYYYYYY). Defaults to current season
 * @param gameType - The game type (2 = regular season, 3 = playoffs). Defaults to regular season
 * @returns Promise resolving to skater statistical leaders
 * @example
 * ```ts
 * statsLeaders.skaters(20232024, 2).then((data) => console.log(data));
 * ```
 */
async function statsLeadersSkaters(
   season?: Season,
   gameType?: GameType,
): Promise<APIResponse<SkaterStatsLeaders>> {
   const parsed = BaseParams({ season, gameType });
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.statsLeaders.skaters,
         }),
      };
   }
   return nhlClient.get(route(_paths.statsLeaders.skaters, parsed));
}

/**
 * Get goalie stats leaders
 * @param season - The season identifier (8-digit format: YYYYYYYY). Defaults to current season
 * @param gameType - The game type (2 = regular season, 3 = playoffs). Defaults to regular season
 * @returns Promise resolving to goalie statistical leaders
 * @example
 * ```ts
 * statsLeaders.goalies(20232024, 2).then((data) => console.log(data));
 * ```
 */
async function statsLeadersGoalies(
   season?: Season,
   gameType?: GameType,
): Promise<APIResponse<GoalieStatsLeaders>> {
   const parsed = BaseParams({ season, gameType });
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.statsLeaders.goalies,
         }),
      };
   }
   return nhlClient.get(route(_paths.statsLeaders.goalies, parsed));
}

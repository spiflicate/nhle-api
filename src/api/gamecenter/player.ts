/**
 *
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
} from '#/types/responses/gamecenter/index.ts';
import { BaseParams, isParseError, PlayerId } from '#/utils/schemas.ts';
import { route } from '#/utils/utils.ts';

const _paths = {
   landing: 'player/{playerId}/landing',
   gameLog: 'player/{playerId}/game-log/{season}/{gameType}',
   spotlight: 'player-spotlight',
   statsLeaders: {
      skaters: 'skater-stats-leaders/{season}/{gameType}',
      goalies: 'goalie-stats-leaders/{season}/{gameType}',
   },
   playerSearch: 'https://search.d3.nhle.com/api/v1/search/player',
};

const nhlPlayerSearch = createNHLClient(_paths.playerSearch);
const searchUrlParams = { culture: 'en', q: '' };

/**
 * Get player landing information
 * @param playerId - The unique player identifier
 * @returns Promise resolving to player landing information
 */
export const landing = (
   playerId: number | string,
): Promise<APIResponse<PlayerLanding>> => {
   const parsedPlayerId = PlayerId(playerId);
   if (isParseError(parsedPlayerId)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedPlayerId.summary, {
            endpoint: _paths.landing,
         }),
      });
   }
   return nhlClient.get(
      route(_paths.landing, { playerId: parsedPlayerId }),
   );
};

export const gameLog = (
   playerId: number | string,
   season?: number | string,
   gameType?: number | string,
): Promise<APIResponse<PlayerGameLog>> => {
   const Parser = BaseParams.merge({
      playerId: PlayerId,
   });
   const parsed = Parser({ playerId, season, gameType });
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.gameLog,
         }),
      });
   }
   return nhlClient.get(route(_paths.gameLog, parsed));
};

export const spotlight = (): Promise<APIResponse<PlayerSpotlight>> => {
   return nhlClient.get(_paths.spotlight);
};

export const search = (
   query: string,
): Promise<APIResponse<PlayerSearchResult>> => {
   return nhlPlayerSearch.get('', {
      ...searchUrlParams,
      q: query,
   });
};

/**
 * Access stats leaders related endpoints
 */
export const statsLeaders = {
   /**
    * Get skater stats leaders
    * @param season - The season identifier (optional)
    * @param gameType - The game type identifier (optional)
    * @returns Promise resolving to skater stats leaders
    */
   skaters: (
      season?: number | string,
      gameType?: number | string,
   ): Promise<APIResponse<SkaterStatsLeaders>> => {
      const parsed = BaseParams({ season, gameType });
      if (isParseError(parsed)) {
         return Promise.resolve({
            status: 'error',
            error: new ValidationError(parsed.summary, {
               endpoint: _paths.statsLeaders.skaters,
            }),
         });
      }
      return nhlClient.get(route(_paths.statsLeaders.skaters, parsed));
   },

   /**
    * Get goalie stats leaders
    * @param season - The season identifier (optional)
    * @param gameType - The game type identifier (optional)
    * @returns Promise resolving to goalie stats leaders
    */
   goalies: (
      season?: number | string,
      gameType?: number | string,
   ): Promise<APIResponse<GoalieStatsLeaders>> => {
      const parsed = BaseParams({ season, gameType });
      if (isParseError(parsed)) {
         return Promise.resolve({
            status: 'error',
            error: new ValidationError(parsed.summary, {
               endpoint: _paths.statsLeaders.goalies,
            }),
         });
      }
      return nhlClient.get(route(_paths.statsLeaders.goalies, parsed));
   },
};

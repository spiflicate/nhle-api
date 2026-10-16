/**
 * @module api/gamecenter/player
 * @description Player-related API endpoints for player information, stats, game logs, and search
 */

import { createNHLClient, nhlClient } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type {
   GoalieLeaderCategory,
   GoalieStatsLeaders,
   PlayerGameLog,
   PlayerLanding,
   PlayerSearchResult,
   PlayerSpotlight,
   SkaterLeaderCategory,
   SkaterStatsLeaders,
   StatsLeadersOptions,
} from '#/types/index.ts';
import type { GameType, Season } from '#/types/types.ts';
import {
   BaseParams,
   GoalieLeaderCategory as GoalieLeaderCategoryAT,
   isParseError,
   PlayerId,
   SkaterLeaderCategory as SkaterLeaderCategoryAT,
   StatsLeadersLimit,
} from '#/utils/schemas.ts';
import { resolvePath } from '#/utils/utils.ts';
import { playerPaths as p } from './paths.ts';

const nhlPlayerSearch = createNHLClient(p.playerSearch);
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
): Promise<APIResult<PlayerLanding>> {
   const parsedPlayerId = PlayerId(playerId);
   if (isParseError(parsedPlayerId)) {
      return {
         success: false,
         error: new ValidationError(parsedPlayerId.summary, {
            endpoint: p.landing,
         }),
      };
   }
   const path = resolvePath(p.landing, { playerId: parsedPlayerId });
   return nhlClient.get(path);
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
): Promise<APIResult<PlayerGameLog>>;
export async function gameLog(
   playerId: number | string,
   season?: Season,
   gameType?: number | string,
): Promise<APIResult<PlayerGameLog>>;
export async function gameLog(
   playerId: number | string,
   season?: Season,
   gameType?: GameType | number | string,
): Promise<APIResult<PlayerGameLog>> {
   const Parser = BaseParams.merge({
      playerId: PlayerId,
   });
   const parsed = Parser({ playerId, season, gameType });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.gameLog,
         }),
      };
   }
   const path = resolvePath(p.gameLog, parsed);
   return nhlClient.get(path);
}

/**
 * Get player spotlight featuring highlighted players
 * @returns Promise resolving to featured/spotlight players
 * @example
 * ```ts
 * spotlight().then((data) => console.log(data));
 * ```
 */
export async function spotlight(): Promise<APIResult<PlayerSpotlight[]>> {
   return nhlClient.get(p.spotlight);
}

/**
 * Search for players by name
 * @param query - The search query string (player name)
 * @returns Promise resolving to player search results
 * @deprecated This endpoint is deprecated and may be removed in future versions. Use the NHL Stats API player endpoint instead.
 * @example
 * ```ts
 * search('McDavid').then((data) => console.log(data));
 * ```
 */
export async function search(
   query: string,
): Promise<APIResult<PlayerSearchResult[] | undefined>> {
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
 * @param options - `categories` to return (defaults to all) and `limit` per category (defaults to 5; -1 returns every player)
 * @returns Promise resolving to skater statistical leaders, keyed by category
 * @example
 * ```ts
 * statsLeaders.skaters(20232024, 2).then((data) => console.log(data));
 * statsLeaders.skaters(20232024, 2, { categories: ['points', 'goals'], limit: -1 });
 * ```
 */
async function statsLeadersSkaters<
   C extends SkaterLeaderCategory = SkaterLeaderCategory,
>(
   season?: Season,
   gameType?: GameType,
   options?: StatsLeadersOptions<C>,
): Promise<APIResult<Pick<SkaterStatsLeaders, C>>> {
   return getStatsLeaders(
      p.statsLeaders.skaters,
      SkaterLeaderCategoryAT,
      season,
      gameType,
      options,
   );
}

/**
 * Get goalie stats leaders
 * @param season - The season identifier (8-digit format: YYYYYYYY). Defaults to current season
 * @param gameType - The game type (2 = regular season, 3 = playoffs). Defaults to regular season
 * @param options - `categories` to return (defaults to all) and `limit` per category (defaults to 5; -1 returns every player)
 * @returns Promise resolving to goalie statistical leaders, keyed by category
 * @example
 * ```ts
 * statsLeaders.goalies(20232024, 2).then((data) => console.log(data));
 * statsLeaders.goalies(20232024, 2, { categories: ['savePctg'], limit: 10 });
 * ```
 */
async function statsLeadersGoalies<
   C extends GoalieLeaderCategory = GoalieLeaderCategory,
>(
   season?: Season,
   gameType?: GameType,
   options?: StatsLeadersOptions<C>,
): Promise<APIResult<Pick<GoalieStatsLeaders, C>>> {
   return getStatsLeaders(
      p.statsLeaders.goalies,
      GoalieLeaderCategoryAT,
      season,
      gameType,
      options,
   );
}

async function getStatsLeaders<T>(
   endpoint: string,
   Category: typeof SkaterLeaderCategoryAT | typeof GoalieLeaderCategoryAT,
   season: Season | undefined,
   gameType: GameType | undefined,
   options: StatsLeadersOptions<string> = {},
): Promise<APIResult<T>> {
   const parsed = BaseParams.merge({
      categories: Category.array().or('undefined'),
      limit: StatsLeadersLimit.or('undefined'),
   })({
      season,
      gameType,
      categories: options.categories,
      limit: options.limit,
   });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, { endpoint }),
      };
   }
   const { categories, limit, ...pathParams } = parsed;
   const path = resolvePath(endpoint, pathParams);
   return nhlClient.get(path, { categories: categories?.join(','), limit });
}

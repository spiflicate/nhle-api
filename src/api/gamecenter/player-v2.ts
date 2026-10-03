/**
 * @module api/gamecenter/player-v2
 * @description The v2 player API that nhl.com player pages use: header, home,
 * bio, stats and game log. Exposed as `gc.player.v2`.
 */

import { createNHLClient } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type {
   PlayerBio,
   PlayerGameLogV2,
   PlayerHeader,
   PlayerHome,
   PlayerStats,
} from '#/types/index.ts';
import type { GameType, Season } from '#/types/types.ts';
import { BaseParams, isParseError, PlayerId } from '#/utils/schemas.ts';
import { resolvePath } from '#/utils/utils.ts';
import { playerV2Paths as p } from './paths.ts';

const nhlV2Client = createNHLClient('https://api-web.nhle.com/v2');

/** Validate a player id and GET one of the `player/{playerId}/...` paths */
async function getForPlayer<T>(
   endpoint: string,
   playerId: number | string,
): Promise<APIResult<T>> {
   const parsedPlayerId = PlayerId(playerId);
   if (isParseError(parsedPlayerId)) {
      return {
         success: false,
         error: new ValidationError(parsedPlayerId.summary, { endpoint }),
      };
   }
   return nhlV2Client.get(
      resolvePath(endpoint, { playerId: parsedPlayerId }),
   );
}

/**
 * Get the player page header: name, number, position, size, badges and
 * current team
 * @param playerId - The unique player identifier (NHL player ID number)
 * @returns Promise resolving to the player header
 * @example
 * ```ts
 * header(8478402).then((data) => console.log(data)); // Connor McDavid
 * ```
 */
export async function header(
   playerId: number | string,
): Promise<APIResult<PlayerHeader>> {
   return getForPlayer(p.header, playerId);
}

/**
 * Get the player page home tab: the player's last game (with recap links
 * and their stats), their team's next game (with broadcasts and their
 * record against the opponent) and the current team roster
 * @param playerId - The unique player identifier (NHL player ID number)
 * @returns Promise resolving to the home tab. For retired players it only has `lastName`
 * @example
 * ```ts
 * home(8478402).then((data) => console.log(data));
 * ```
 */
export async function home(
   playerId: number | string,
): Promise<APIResult<PlayerHome>> {
   return getForPlayer(p.home, playerId);
}

/**
 * Get the player bio: vitals, draft details, awards with their winning
 * season stats, biography and notes, and the current team roster
 * @param playerId - The unique player identifier (NHL player ID number)
 * @returns Promise resolving to the player bio
 * @example
 * ```ts
 * bio(8478402).then((data) => console.log(data.bio.about.default));
 * ```
 */
export async function bio(
   playerId: number | string,
): Promise<APIResult<PlayerBio>> {
   return getForPlayer(p.bio, playerId);
}

/**
 * Get the player stats tab: the statline (current season and career, with
 * league and team ranks), last 5 games, career totals and every season
 * the player has played in any league
 * @param playerId - The unique player identifier (NHL player ID number)
 * @returns Promise resolving to the player stats
 * @example
 * ```ts
 * stats(8478402).then((data) => console.log(data.careerTotals));
 * ```
 */
export async function stats(
   playerId: number | string,
): Promise<APIResult<PlayerStats>> {
   return getForPlayer(p.playerStats, playerId);
}

/**
 * Get the player game log for a season. Unlike v1 `player.gameLog`, each
 * game has home and away team objects, the score, the result and the
 * period it ended in
 * @param playerId - The unique player identifier (NHL player ID number)
 * @param season - The season identifier (8-digit format: YYYYYYYY). Defaults to current season
 * @param gameType - The game type (2 = regular season, 3 = playoffs). Defaults to regular season
 * @returns Promise resolving to the player game log
 * @example
 * ```ts
 * gameLog(8478402, 20242025, 2).then((data) => console.log(data));
 * ```
 */
export async function gameLog(
   playerId: number | string,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<PlayerGameLogV2>>;
export async function gameLog(
   playerId: number | string,
   season?: Season,
   gameType?: number | string,
): Promise<APIResult<PlayerGameLogV2>>;
export async function gameLog(
   playerId: number | string,
   season?: Season,
   gameType?: GameType | number | string,
): Promise<APIResult<PlayerGameLogV2>> {
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
   return nhlV2Client.get(resolvePath(p.gameLog, parsed));
}

/**
 * @module api/gamecenter/score
 * @description Score and scoreboard endpoints for accessing game scores and live score information
 */
import { nhlClient } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type { Score, Scoreboard, TeamAbbrev } from '#/types/index.ts';
import { getCurrentNHLDate } from '#/utils/date.ts';
import {
   isParseError,
   NHLDate,
   TeamAbbrev as Team,
} from '#/utils/schemas.ts';
import { resolvePath } from '#/utils/utils.ts';
import { scorePaths as p } from './paths.ts';

/**
 * Get scores for a specific date
 * @param date - Date to get scores for (Date object or ISO date string 'YYYY-MM-DD'). Defaults to current date
 * @returns Promise resolving to all game scores for the specified date
 * @example
 * ```ts
 * // Get today's scores
 * score().then((data) => console.log(data));
 *
 * // Get scores for a specific date
 * score('2023-11-15').then((data) => console.log(data));
 * ```
 */
export async function score(
   date?: Date | string,
): Promise<APIResult<Score>> {
   const parsed = NHLDate(date ?? getCurrentNHLDate());
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.score,
         }),
      };
   }
   const path = resolvePath(p.score, { date: parsed });
   return nhlClient.get(path);
}

/**
 * Get current scoreboard information
 * @returns Promise resolving to current scoreboard with live and recent game data
 * @example
 * ```ts
 * scoreboard().then((data) => console.log(data));
 * ```
 */
export async function scoreboard(): Promise<APIResult<Scoreboard>> {
   return nhlClient.get(p.scoreboard.now);
}

/**
 * Get scoreboard data for a specific team
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @returns Promise resolving to scoreboard data for the specified team
 * @example
 * ```ts
 * scoreboard.team('TOR').then((data) => console.log(data));
 * ```
 */
scoreboard.team = async (
   team: TeamAbbrev,
): Promise<APIResult<Scoreboard>> => {
   const parsed = Team(team);
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.scoreboard.byTeam,
         }),
      };
   }
   const path = resolvePath(p.scoreboard.byTeam, { team: parsed });
   return nhlClient.get(path);
};

/**
 * Get scoreboard data for a specific date
 * @param date - Date to get scoreboard data for (Date object or ISO date string 'YYYY-MM-DD')
 * @returns Promise resolving to scoreboard data for the specified date
 * @example
 * ```ts
 * scoreboard.date('2023-11-15').then((data) => console.log(data));
 * ```
 */
scoreboard.date = async (
   date: Date | string,
): Promise<APIResult<Scoreboard>> => {
   const parsed = NHLDate(date);
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.scoreboard.byDate,
         }),
      };
   }
   const path = resolvePath(p.scoreboard.byDate, { date: parsed });
   return nhlClient.get(path);
};

/**
 * @module api/gamecenter/score
 * @description Score and scoreboard endpoints for accessing game scores and live score information
 */
import nhlClient from '#/client/index.ts';
import type { APIResponse } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type { NHLScore, NHLScoreboard, TeamAbbrev } from '#/types/index.ts';
import { getCurrentDate } from '#/utils/date.ts';
import {
   isParseError,
   NHLDate,
   TeamAbbrev as Team,
} from '#/utils/schemas.ts';
import { route } from '#/utils/utils.ts';

const _paths = {
   score: 'score/{date}',
   scoreboard: {
      now: 'scoreboard/now',
      byTeam: 'scoreboard/{team}/now',
      byDate: 'scoreboard/{date}',
   },
};

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
export const score = async (
   date?: Date | string,
): Promise<APIResponse<NHLScore>> => {
   const parsed = NHLDate(date ?? getCurrentDate());
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.score,
         }),
      };
   }
   return nhlClient.get(route(_paths.score, { date: parsed }));
};

/**
 * Get current scoreboard information
 * @returns Promise resolving to current scoreboard with live and recent game data
 * @example
 * ```ts
 * scoreboard().then((data) => console.log(data));
 * ```
 */
export const scoreboard = async (): Promise<APIResponse<NHLScoreboard>> =>
   nhlClient.get<NHLScoreboard>(_paths.scoreboard.now);

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
): Promise<APIResponse<NHLScoreboard>> => {
   const parsed = Team(team);
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.scoreboard.byTeam,
         }),
      };
   }
   return nhlClient.get<NHLScoreboard>(
      route(_paths.scoreboard.byTeam, { team: parsed }),
   );
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
): Promise<APIResponse<NHLScoreboard>> => {
   const parsed = NHLDate(date);
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.scoreboard.byDate,
         }),
      };
   }
   return nhlClient.get<NHLScoreboard>(
      route(_paths.scoreboard.byDate, { date: parsed }),
   );
};

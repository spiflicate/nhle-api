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
 * Access score related endpoints
 */
/**
 * Get scores for a specific date
 * @param date - Date to get scores for (Date object or ISO date string)
 * @returns Promise resolving to scores for the specified date
 */
export const score = (
   date?: Date | string,
): Promise<APIResponse<NHLScore>> => {
   const parsed = NHLDate(date ?? getCurrentDate());
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.score,
         }),
      });
   }
   return nhlClient.get(route(_paths.score, { date: parsed }));
};

/**
 * Access scoreboard related endpoints
 */

export const scoreboard = (): Promise<APIResponse<NHLScoreboard>> =>
   nhlClient.get<NHLScoreboard>(_paths.scoreboard.now);
/**
 * Get scoreboard data for a specific team
 * @param team - The team abbreviation
 * @returns Promise resolving to scoreboard data for the specified team
 */
scoreboard.team = async (
   team: TeamAbbrev,
): Promise<APIResponse<NHLScoreboard>> => {
   const parsed = Team(team);
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.scoreboard.byTeam,
         }),
      });
   }
   return nhlClient.get<NHLScoreboard>(
      route(_paths.scoreboard.byTeam, { team: parsed }),
   );
};
/**
 * Get scoreboard data for a specific date
 * @param date - Date to get scoreboard data for (Date object or ISO date string)
 * @returns Promise resolving to scoreboard data for the specified date
 */
scoreboard.date = async (
   date: Date | string,
): Promise<APIResponse<NHLScoreboard>> => {
   const parsed = NHLDate(date);
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.scoreboard.byDate,
         }),
      });
   }
   return nhlClient.get<NHLScoreboard>(
      route(_paths.scoreboard.byDate, { date: parsed }),
   );
};

/**
 * @module api/gamecenter/team
 * @description Team-related API endpoints for rosters, schedules, stats, standings, and prospects
 */
import nhlClient from '#/client/index.ts';
import type { APIResponse } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type {
   GameType,
   NHLMonth,
   NHLStandings,
   NHLStandingsSeason,
   Season,
   TeamAbbrev,
   TeamProspects,
   TeamRoster,
   TeamRosterSeasons,
   TeamScheduleMonth,
   TeamScheduleSeason,
   TeamScheduleWeek,
   TeamStats,
   TeamStatsSeason,
} from '#/types/index.ts';
import { getCurrentDate } from '#/utils/date.ts';
import {
   BaseParams,
   isParseError,
   NHLDate,
   ScheduleParams,
   TeamAbbrev as TeamAbbrevAT,
   TeamAndSeasonParams,
} from '#/utils/schemas.ts';
import { route } from '../../utils/utils.ts';

const paths = {
   rosterSeasons: 'roster-season/{team}',
   roster: 'roster/{team}/{season}',
   prospects: 'prospects/{team}',
   clubStats: 'club-stats/{team}/{season}/{gameType}',
   clubStatsSeason: 'club-stats-season/{team}',
   standings: 'standings/{date}',
   standingsSeason: 'standings-season',
   clubSchedule: 'club-schedule/{team}/{period}/{date}',
   clubScheduleSeason: 'club-schedule-season/{team}/{season}',
};

/**
 * Get available roster seasons for a team
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @returns Promise resolving to list of seasons with roster data available
 * @example
 * ```ts
 * rosterSeasons('TOR').then((data) => console.log(data));
 * ```
 */
export const rosterSeasons = async (
   team: TeamAbbrev,
): Promise<APIResponse<TeamRosterSeasons>> => {
   const parsed = TeamAbbrevAT(team);
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.rosterSeasons,
         }),
      };
   }
   return nhlClient.get(route(paths.rosterSeasons, { team: parsed }));
};

/**
 * Get team roster for a specific season
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @param season - The season identifier (8-digit format: YYYYYYYY). Defaults to current season
 * @returns Promise resolving to team roster with player information
 * @example
 * ```ts
 * roster('TOR', 20232024).then((data) => console.log(data));
 * ```
 */
export const roster = async (
   team: string,
   season?: string | number,
): Promise<APIResponse<TeamRoster>> => {
   const parsed = TeamAndSeasonParams({ team, season });
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.roster,
         }),
      };
   }
   return nhlClient.get(route(paths.roster, parsed));
};

/**
 * Get team prospects information
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @returns Promise resolving to team prospects and draft picks
 * @example
 * ```ts
 * prospects('TOR').then((data) => console.log(data));
 * ```
 */
export const prospects = async (
   team: TeamAbbrev,
): Promise<APIResponse<TeamProspects>> => {
   const parsed = TeamAbbrevAT(team);
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.prospects,
         }),
      };
   }
   return nhlClient.get(route(paths.prospects, { team: parsed }));
};

/**
 * Get club statistics for a team
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @param season - The season identifier (8-digit format: YYYYYYYY). Defaults to current season
 * @param gameType - The game type (2 = regular season, 3 = playoffs). Defaults to regular season
 * @returns Promise resolving to team statistics
 * @example
 * ```ts
 * clubStats('TOR', 20232024, 2).then((data) => console.log(data));
 * ```
 */
export const clubStats = async (
   team: TeamAbbrev,
   season?: Season,
   gameType?: GameType,
): Promise<APIResponse<TeamStats>> => {
   const Parser = BaseParams.merge({
      team: TeamAbbrevAT,
   });
   const parsed = Parser({ team, season, gameType });
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.clubStats,
         }),
      };
   }
   return nhlClient.get(route(paths.clubStats, parsed));
};

/**
 * Get club statistics across all seasons for a team
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @returns Promise resolving to historical team statistics
 * @example
 * ```ts
 * clubStatsSeason('TOR').then((data) => console.log(data));
 * ```
 */
export const clubStatsSeason = async (
   team: TeamAbbrev,
): Promise<APIResponse<TeamStatsSeason>> => {
   const parsed = TeamAbbrevAT(team);
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.clubStatsSeason,
         }),
      };
   }
   return nhlClient.get(route(paths.clubStatsSeason, { team: parsed }));
};

/**
 * Get league standings for a specific date
 * @param date - Date to get standings for (Date object or ISO date string 'YYYY-MM-DD'). Defaults to current date
 * @returns Promise resolving to league standings
 * @example
 * ```ts
 * standings('2023-11-15').then((data) => console.log(data));
 * ```
 */
export const standings = async (
   date?: Date | string,
): Promise<APIResponse<NHLStandings>> => {
   const parsed = NHLDate(date ?? getCurrentDate());
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.standings,
         }),
      };
   }
   return nhlClient.get(route(paths.standings, { date: parsed }));
};

/**
 * Get current season standings information
 * @returns Promise resolving to current season standings with detailed team records
 * @example
 * ```ts
 * standingsSeason().then((data) => console.log(data));
 * ```
 */
export const standingsSeason = async (): Promise<
   APIResponse<NHLStandingsSeason>
> => {
   return nhlClient.get(paths.standingsSeason);
};

/**
 * Internal helper function for club schedule endpoints
 * @private
 */
const clubSchedule = async (
   team: TeamAbbrev,
   date?: Date | string,
   period?: 'week' | 'month',
): Promise<APIResponse<TeamScheduleWeek | TeamScheduleMonth>> => {
   const parsed = ScheduleParams({ team, date, period });
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.clubSchedule,
         }),
      };
   }
   if (period === 'month') {
      parsed.date = parsed.date?.slice(0, 7); // 'YYYY-MM'
   }
   return nhlClient.get(route(paths.clubSchedule, parsed));
};

/**
 * Internal helper function for club schedule season endpoint
 * @private
 */
const clubScheduleSeason = async (
   team: TeamAbbrev,
   season?: Season,
): Promise<APIResponse<TeamScheduleSeason>> => {
   const parsed = TeamAndSeasonParams({ team, season });
   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.clubScheduleSeason,
         }),
      };
   }
   return nhlClient.get(route(paths.clubScheduleSeason, parsed));
};

/**
 * Access team schedule endpoints for different time periods
 * @description Get team schedules by season, week, or month
 */
export const schedule = {
   /**
    * Returns the full season schedule for the provided team and season
    * @param team - The team abbreviation for the desired team (e.g., 'TOR', 'MTL', 'NYR')
    * @param season - The specific season (8-digit format: YYYYYYYY, e.g., 20232024). Defaults to current season
    * @returns A promise that resolves to the full season schedule for the specified team and season
    * @example
    * ```ts
    * // Get the full season schedule for the Boston Bruins for the 2022-2023 season
    * schedule.season('BOS', 20222023).then((data) => {
    *    console.log(data);
    * });
    * ```
    */
   season: clubScheduleSeason,

   /**
    * Get the team schedule for any seven-day period
    * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
    * @param date - The date indicating the start of the seven-day period (Date object or ISO date string 'YYYY-MM-DD').
    * Defaults to current date
    * @returns A promise that resolves to the club schedule for the specified week
    *
    * @example
    * ```ts
    * import { team } from 'nhle-api';
    *
    * // Get the schedule for the Chicago Blackhawks for the week of November 4, 2023
    * // This returns the schedule from November 4 to November 10, 2023
    * team.schedule.week('CHI', '2023-11-04').then((data) => {
    *    console.log(data);
    * });
    * ```
    */
   week: async (
      team: TeamAbbrev,
      date?: Date | string,
   ): Promise<APIResponse<TeamScheduleWeek>> =>
      clubSchedule(team, date, 'week'),

   /**
    * Get the team schedule for any month
    * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
    * @param date - The date indicating the month to get the schedule for (ISO date string 'YYYY-MM').
    * Defaults to current month
    * @returns A promise that resolves to the club schedule for the specified month
    *
    * @example
    * ```ts
    * import { team } from 'nhle-api';
    *
    * // Get the schedule for the Toronto Maple Leafs for November 2023
    * team.schedule.month('TOR', '2023-11').then((data) => {
    *    console.log(data);
    * });
    * ```
    */
   month: async (
      team: TeamAbbrev,
      date?: NHLMonth,
   ): Promise<APIResponse<TeamScheduleMonth>> =>
      clubSchedule(team, date, 'month'),
};

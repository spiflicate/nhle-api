/**
 * @module api/gamecenter/team
 * @description Team-related API endpoints for rosters, schedules, stats, standings, and prospects
 */
import { nhlClient } from '#/client/index.ts';
import type { APIResponse } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type {
   GameType,
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
import { teamPaths as p } from './paths.ts';

/**
 * Get available roster seasons for a team
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @returns Promise resolving to list of seasons with roster data available
 * @example
 * ```ts
 * rosterSeasons('TOR').then((data) => console.log(data));
 * ```
 */
export async function rosterSeasons(
   team: TeamAbbrev,
): Promise<APIResponse<TeamRosterSeasons>> {
   const parsed = TeamAbbrevAT(team);
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.rosterSeasons,
         }),
      };
   }
   return nhlClient.get(route(p.rosterSeasons, { team: parsed }));
}

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
export async function roster(
   team: string,
   season?: string | number,
): Promise<APIResponse<TeamRoster>> {
   const parsed = TeamAndSeasonParams({ team, season });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.roster,
         }),
      };
   }
   return nhlClient.get(route(p.roster, parsed));
}

/**
 * Get team prospects information
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @returns Promise resolving to team prospects and draft picks
 * @example
 * ```ts
 * prospects('TOR').then((data) => console.log(data));
 * ```
 */
export async function prospects(
   team: TeamAbbrev,
): Promise<APIResponse<TeamProspects>> {
   const parsed = TeamAbbrevAT(team);
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.prospects,
         }),
      };
   }
   return nhlClient.get(route(p.prospects, { team: parsed }));
}

/**
 * Get team statistics for a specific season
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @param season - The season identifier (8-digit format: YYYYYYYY). Defaults to current season
 * @param gameType - The game type ('REG' or 2, 'POST' or 3, etc.). Defaults to regular season
 * @returns Promise resolving to team statistics
 * @example
 * ```ts
 * stats('TOR', 20232024, 'REG').then((data) => console.log(data));
 * ```
 */
export async function stats(
   team: TeamAbbrev,
   season?: Season,
   gameType?: GameType,
): Promise<APIResponse<TeamStats>> {
   const Parser = BaseParams.merge({
      team: TeamAbbrevAT,
   });
   const parsed = Parser({ team, season, gameType });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.clubStats,
         }),
      };
   }
   return nhlClient.get(route(p.clubStats, parsed));
}

/**
 * Get valid season and game type options for a team's statistics
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @returns Promise resolving to available season and game type combinations for the team.
 * Only includes seasons and game types where the team actually played (e.g., excludes playoff game types
 * for seasons where the team didn't make the playoffs)
 * @example
 * ```ts
 * statsSeason('TOR').then((data) => console.log(data));
 * ```
 */
export async function statsSeason(
   team: TeamAbbrev,
): Promise<APIResponse<TeamStatsSeason>> {
   const parsed = TeamAbbrevAT(team);
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.clubStatsSeason,
         }),
      };
   }
   return nhlClient.get(route(p.clubStatsSeason, { team: parsed }));
}

/**
 * Get league standings for a specific date
 * @param date - Date to get standings for (Date object or ISO date string 'YYYY-MM-DD'). Defaults to current date
 * @returns Promise resolving to league standings
 * @example
 * ```ts
 * standings('2023-11-15').then((data) => console.log(data));
 * ```
 */
export async function standings(
   date?: Date | string,
): Promise<APIResponse<NHLStandings>> {
   const parsed = NHLDate(date ?? getCurrentDate());
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.standings,
         }),
      };
   }
   return nhlClient.get(route(p.standings, { date: parsed }));
}

/**
 * Get current season standings information
 * @returns Promise resolving to current season standings with detailed team records
 * @example
 * ```ts
 * standingsSeason().then((data) => console.log(data));
 * ```
 */
export async function standingsSeason(): Promise<
   APIResponse<NHLStandingsSeason>
> {
   return nhlClient.get(p.standingsSeason);
}

/**
 * Get the team schedule for any seven-day period
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @param date - The date indicating the start of the seven-day period (Date object or ISO date string 'YYYY-MM-DD').
 * Defaults to current date
 * @returns A promise that resolves to the club schedule for the specified week
 *
 * @example
 * ```ts
 * // Get the schedule for the Chicago Blackhawks for the week of November 4, 2023
 * // This returns the schedule from November 4 to November 10, 2023
 * gc.team.schedule.week('CHI', '2023-11-04').then((data) => {
 *    console.log(data);
 * });
 * ```
 */
async function scheduleWeek(
   team: TeamAbbrev,
   date?: Date | string,
): Promise<APIResponse<TeamScheduleWeek>>;
async function scheduleWeek(
   team: string,
   date?: Date | string,
): Promise<APIResponse<TeamScheduleWeek>>;
async function scheduleWeek(
   team: TeamAbbrev | string,
   date?: Date | string,
): Promise<APIResponse<TeamScheduleWeek>> {
   const parsed = ScheduleParams({ team, date, month: undefined });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.clubSchedule.week,
         }),
      };
   }
   return nhlClient.get(route(p.clubSchedule.week, parsed));
}

/**
 * Get the team schedule for any month
 * @param team - The team abbreviation (e.g., 'TOR', 'MTL', 'NYR')
 * @param date - The date indicating the month to get the schedule for (ISO date string 'YYYY-MM').
 * Defaults to current month
 * @returns A promise that resolves to the club schedule for the specified month
 *
 * @example
 * ```ts
 * // Get the schedule for the Toronto Maple Leafs for November 2023
 * gc.team.schedule.month('TOR', '2023-11').then((data) => {
 *    console.log(data);
 * });
 * ```
 */
async function scheduleMonth(
   team: TeamAbbrev,
   date?: Date | string,
): Promise<APIResponse<TeamScheduleMonth>>;
async function scheduleMonth(
   team: string,
   date?: Date | string,
): Promise<APIResponse<TeamScheduleMonth>>;
async function scheduleMonth(
   team: TeamAbbrev | string,
   date?: Date | string,
): Promise<APIResponse<TeamScheduleMonth>> {
   const parsed = ScheduleParams({ team, month: date, date: undefined });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.clubSchedule.month,
         }),
      };
   }
   return nhlClient.get(route(p.clubSchedule.month, parsed));
}

/**
 * Returns the full season schedule for the provided team and season
 * @param team - The team abbreviation for the desired team (e.g., 'TOR', 'MTL', 'NYR')
 * @param season - The specific season (8-digit format: YYYYYYYY, e.g., 20232024). Defaults to current season
 * @returns A promise that resolves to the full season schedule for the specified team and season
 * @example
 * ```ts
 * // Get the full season schedule for the Boston Bruins for the 2022-2023 season
 * gc.team.schedule.season('BOS', 20222023).then((data) => {
 *    console.log(data);
 * });
 * ```
 */
async function scheduleSeason(
   team: TeamAbbrev,
   season?: Season,
): Promise<APIResponse<TeamScheduleSeason>>;
async function scheduleSeason(
   team: string,
   season?: Season,
): Promise<APIResponse<TeamScheduleSeason>>;
async function scheduleSeason(
   team: TeamAbbrev | string,
   season?: Season,
): Promise<APIResponse<TeamScheduleSeason>> {
   const parsed = TeamAndSeasonParams({ team, season });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.clubSchedule.season,
         }),
      };
   }
   return nhlClient.get(route(p.clubSchedule.season, parsed));
}

/**
 * Access team schedule endpoints for different time periods
 * @description Get team schedules by season, week, or month
 */
export const schedule = {
   season: scheduleSeason,
   week: scheduleWeek,
   month: scheduleMonth,
};

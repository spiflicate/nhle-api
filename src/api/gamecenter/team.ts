import nhlClient from '#/client/index.ts';
import type { APIResponse } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type {
   NHLMonth,
   NHLStandings,
   NHLStandingsSeason,
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
   TeamAbbrev,
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
 * Access roster seasons related endpoints
 */
export const rosterSeasons = (
   team: string,
): Promise<APIResponse<TeamRosterSeasons>> => {
   const parsed = TeamAbbrev(team);
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.rosterSeasons,
         }),
      });
   }
   return nhlClient.get(route(paths.rosterSeasons, { team: parsed }));
};

/**
 * Access roster related endpoints
 */
export const roster = (
   team: string,
   season?: string | number,
): Promise<APIResponse<TeamRoster>> => {
   const parsed = TeamAndSeasonParams({ team, season });
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.roster,
         }),
      });
   }
   return nhlClient.get(route(paths.roster, parsed));
};

/**
 * Access prospects related endpoints
 */
export const prospects = (
   team: string,
): Promise<APIResponse<TeamProspects>> => {
   const parsed = TeamAbbrev(team);
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.prospects,
         }),
      });
   }
   return nhlClient.get(route(paths.prospects, { team: parsed }));
};

/**
 * Access club stats related endpoints
 */
export const clubStats = (
   team: string,
   season?: string | number,
   gameType?: string | number,
): Promise<APIResponse<TeamStats>> => {
   const Parser = BaseParams.merge({
      team: TeamAbbrev,
   });
   const parsed = Parser({ team, season, gameType });
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.clubStats,
         }),
      });
   }
   return nhlClient.get(route(paths.clubStats, parsed));
};

/**
 * Access club stats season related endpoints
 */
export const clubStatsSeason = (
   team: string,
): Promise<APIResponse<TeamStatsSeason>> => {
   const parsed = TeamAbbrev(team);
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.clubStatsSeason,
         }),
      });
   }
   return nhlClient.get(route(paths.clubStatsSeason, { team: parsed }));
};

/**
 * Access standings related endpoints
 */
export const standings = (
   date?: Date | string,
): Promise<APIResponse<NHLStandings>> => {
   const parsed = NHLDate(date ?? getCurrentDate());
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.standings,
         }),
      });
   }
   return nhlClient.get(route(paths.standings, { date: parsed }));
};

/**
 * Access standings season related endpoints
 */
export const standingsSeason = (): Promise<
   APIResponse<NHLStandingsSeason>
> => {
   return nhlClient.get(paths.standingsSeason);
};

/**
 * Access club schedule related endpoints
 */
const clubSchedule = (
   team: string,
   date?: Date | string,
   period?: 'week' | 'month',
): Promise<APIResponse<TeamScheduleWeek | TeamScheduleMonth>> => {
   const parsed = ScheduleParams({ team, date, period });
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.clubSchedule,
         }),
      });
   }
   if (period === 'month') {
      parsed.date = parsed.date?.slice(0, 7); // 'YYYY-MM'
   }
   return nhlClient.get(route(paths.clubSchedule, parsed));
};

/**
 * Access club schedule season related endpoints
 */
const clubScheduleSeason = (
   team: string,
   season?: number,
): Promise<APIResponse<TeamScheduleSeason>> => {
   const parsed = TeamAndSeasonParams({ team, season });
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: paths.clubScheduleSeason,
         }),
      });
   }
   return nhlClient.get(route(paths.clubScheduleSeason, parsed));
};

export const schedule = {
   /** Returns the full season schedule for the provided team and season
    * @param team - The team abbreviation for the desired team
    * @param season - The specific season (e.g. 20222023); if not provided, defaults to the current season.
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
    * @param team - The team abbreviation
    * @param date - The date indicating the start of the seven-day period.
    * If not provided, defaults to the current date. format: 'YYYY-MM'
    * @returns A promise that resolves to the club schedule for the specified week
    *
    * @example
    * ```ts
    * import { schedule } from 'nhle-api';
    *
    * // Get the schedule for the Chicago Blackhawks for the week of November 4, 2023
    * // This returns the schedule from November 4 to November 10, 2023
    * schedule.week('CHI', '2023-11-04').then((data) => {
    *    console.log(data);
    * });
    * ```
    */
   week: (
      team: string,
      date?: Date | string,
   ): Promise<APIResponse<TeamScheduleWeek>> =>
      clubSchedule(team, date, 'week'),

   /**
    * Get the team schedule for any month
    * @param team - The team abbreviation
    * @param date - The date indicating the month to get the schedule for.
    * If not provided, defaults to the current month. format: 'YYYY-MM'
    * @returns A promise that resolves to the club schedule for the specified month
    *
    * @example
    * ```ts
    * import { schedule } from 'nhle-api';
    *
    * // Get the schedule for the Toronto Maple Leafs for November 2023
    * schedule.month('TOR', '2023-11').then((data) => {
    *    console.log(data);
    * });
    * ```
    */
   month: (
      team: string,
      date?: NHLMonth,
   ): Promise<APIResponse<TeamScheduleMonth>> =>
      clubSchedule(team, date, 'month'),
};

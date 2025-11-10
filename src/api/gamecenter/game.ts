/**
 * Game-related API endpoints
 */
import nhlClient from '#/client/index.ts';
import type { APIResponse } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type {
   GamecenterBoxscore,
   GamecenterLanding,
   GamecenterPlayByPlay,
   GamecenterReports,
   LeagueSchedule,
   NetworkTVSchedule,
   PlayoffBracket,
   PlayoffSeries,
   PlayoffSeriesSchedule,
   PPTReplayEvent,
   PPTReplayGoal,
   ScheduleCalendar,
   WhereToWatch,
   WSCGameStory,
   WSCPlayByPlay,
} from '#/types/responses/gamecenter/index.ts';
import {
   getCurrentDate,
   getCurrentSeason,
   getCurrentYear,
} from '#/utils/date.ts';
import {
   GameId,
   GameIdAndEventId,
   isParseError,
   NHLDate,
   Season,
   SeriesAndSeasonParams,
   Year,
} from '#/utils/schemas.ts';
import { route } from '#/utils/utils.ts';

const _paths = {
   schedule: 'schedule/{date}',
   scheduleCalendar: 'schedule-calendar/{date}',
   playoffBracket: 'playoff-bracket/{year}',
   playoffSeries: 'playoff-series/{season}',
   playoffSeriesSchedule: 'schedule/playoff-series/{season}/{seriesLetter}',
   gamecenter: {
      playByPlay: 'gamecenter/{gameId}/play-by-play',
      reports: 'gamecenter/{gameId}/right-rail',
      landing: 'gamecenter/{gameId}/landing',
      boxscore: 'gamecenter/{gameId}/boxscore',
   },
   wsc: {
      gameStory: 'wsc/game-story/{gameId}',
      playByPlay: 'wsc/play-by-play/{gameId}',
   },
   pptReplay: {
      goal: 'ppt-replay/{gameId}/goal/{eventId}',
      event: 'ppt-replay/{date}',
   },
   whereToWatch: 'where-to-watch',
   networkTVSchedule: 'network/tv-schedule/{date}',
};

/**
 * Get play-by-play data for a specific game
 * @param gameId - The unique identifier for the game
 * @returns Promise resolving to play-by-play data
 */
export const playByPlay = (
   gameId: string | number,
): Promise<APIResponse<GamecenterPlayByPlay>> => {
   const parsedGameId = GameId(gameId);
   if (isParseError(parsedGameId)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedGameId.summary, {
            endpoint: _paths.gamecenter.playByPlay,
         }),
      });
   }
   return nhlClient.get(
      route(_paths.gamecenter.playByPlay, { gameId: parsedGameId }),
   );
};

/**
 * Get reports data for a specific game
 * @param gameId - The unique identifier for the game
 * @returns Promise resolving to reports data
 * @note The official endpoint name is 'right-rail', as it is used
 * to populate the right rail UI component of the NHL website. The
 * function has been renamed to 'reports' for clarity.
 */
export const reports = (
   gameId: string | number,
): Promise<APIResponse<GamecenterReports>> => {
   const parsedGameId = GameId(gameId);
   if (isParseError(parsedGameId)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedGameId.summary, {
            endpoint: _paths.gamecenter.reports,
         }),
      });
   }
   return nhlClient.get(
      route(_paths.gamecenter.reports, { gameId: parsedGameId }),
   );
};
/**
 * Get landing page data for a specific game
 * @param gameId - The unique identifier for the game
 * @returns Promise resolving to landing page data
 */
export const landing = (
   gameId: string | number,
): Promise<APIResponse<GamecenterLanding>> => {
   const parsedGameId = GameId(gameId);
   if (isParseError(parsedGameId)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedGameId.summary, {
            endpoint: _paths.gamecenter.landing,
         }),
      });
   }
   return nhlClient.get(
      route(_paths.gamecenter.landing, { gameId: parsedGameId }),
   );
};
/**
 * Get boxscore data for a specific game
 * @param gameId - The unique identifier for the game
 * @returns Promise resolving to boxscore data
 */
export const boxscore = (
   gameId: string | number,
): Promise<APIResponse<GamecenterBoxscore>> => {
   const parsedGameId = GameId(gameId);
   if (isParseError(parsedGameId)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedGameId.summary, {
            endpoint: _paths.gamecenter.boxscore,
         }),
      });
   }
   return nhlClient.get(
      route(_paths.gamecenter.boxscore, { gameId: parsedGameId }),
   );
};

export const wsc = {
   /**
    * Get game story data for a specific game
    * @param gameId - The unique identifier for the game
    * @returns Promise resolving to game story data
    */
   gameStory: (
      gameId: number | string,
   ): Promise<APIResponse<WSCGameStory>> => {
      const parsedGameId = GameId(gameId);
      if (isParseError(parsedGameId)) {
         return Promise.resolve({
            status: 'error',
            error: new ValidationError(parsedGameId.summary, {
               endpoint: _paths.wsc.gameStory,
            }),
         });
      }
      return nhlClient.get(
         route(_paths.wsc.gameStory, { gameId: parsedGameId }),
      );
   },

   /**
    * Get play-by-play data for a specific game
    * @param gameId - The unique identifier for the game
    * @returns Promise resolving to play-by-play data
    */
   playByPlay: (
      gameId: number | string,
   ): Promise<APIResponse<WSCPlayByPlay>> => {
      const parsedGameId = GameId(gameId);
      if (isParseError(parsedGameId)) {
         return Promise.resolve({
            status: 'error',
            error: new ValidationError(parsedGameId.summary, {
               endpoint: _paths.wsc.playByPlay,
            }),
         });
      }
      return nhlClient.get(
         route(_paths.wsc.playByPlay, { gameId: parsedGameId }),
      );
   },
};

/**
 * Access PPT replay related endpoints
 */
export const pptReplay = {
   /**
    * Get goal replay data for a specific game and event
    * @param gameId - The unique identifier for the game
    * @param eventId - The unique identifier for the event
    * @returns Promise resolving to goal replay data
    */
   goal: (
      gameId: number | string,
      eventId: number | string,
   ): Promise<APIResponse<PPTReplayGoal>> => {
      const parsed = GameIdAndEventId({ gameId, eventId });
      if (isParseError(parsed)) {
         return Promise.resolve({
            status: 'error',
            error: new ValidationError(parsed.summary, {
               endpoint: _paths.pptReplay.goal,
            }),
         });
      }
      return nhlClient.get(
         route(_paths.pptReplay.goal, { gameId, eventId }),
      );
   },

   /**
    * Get event replay data for a specific date
    * @param date - Date to get event replay data for (Date object or ISO date string)
    * @returns Promise resolving to event replay data
    */
   event: async (
      date: Date | string,
   ): Promise<APIResponse<PPTReplayEvent>> => {
      const parsedDate = NHLDate(date);
      if (isParseError(parsedDate)) {
         return Promise.resolve({
            status: 'error',
            error: new ValidationError(parsedDate.summary, {
               endpoint: _paths.pptReplay.event,
            }),
         });
      }
      return nhlClient.get(
         route(_paths.pptReplay.event, { date: parsedDate }),
      );
   },
};

/**
 * Access schedule related endpoints
 */
export const schedule = (
   date?: Date | string,
): Promise<APIResponse<LeagueSchedule>> => {
   const parsedDate = NHLDate(date ?? getCurrentDate());
   if (isParseError(parsedDate)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedDate.summary, {
            endpoint: _paths.schedule,
         }),
      });
   }
   return nhlClient.get(route(_paths.schedule, { date: parsedDate }));
};

/**
 * Access schedule calendar related endpoints
 */
export const scheduleCalendar = (
   date?: Date | string,
): Promise<APIResponse<ScheduleCalendar>> => {
   const parsedDate = NHLDate(date);
   if (isParseError(parsedDate)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedDate.summary, {
            endpoint: _paths.scheduleCalendar,
         }),
      });
   }
   return nhlClient.get(
      route(_paths.scheduleCalendar, { date: parsedDate }),
   );
};

/**
 * Access playoff bracket related endpoints
 */
export const playoffBracket = (
   year?: string,
): Promise<APIResponse<PlayoffBracket>> => {
   const parsedYear = Year(year ?? getCurrentYear());
   if (isParseError(parsedYear)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedYear.summary, {
            endpoint: _paths.playoffBracket,
         }),
      });
   }
   return nhlClient.get(route(_paths.playoffBracket, { year: parsedYear }));
};

/**
 * Access playoff series related endpoints
 */
export const playoffSeries = (
   season?: string,
): Promise<APIResponse<PlayoffSeries>> => {
   const parsedSeason = Season(season ?? getCurrentSeason());
   if (isParseError(parsedSeason)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedSeason.summary, {
            endpoint: _paths.playoffSeries,
         }),
      });
   }
   return nhlClient.get(
      route(_paths.playoffSeries, { season: parsedSeason }),
   );
};

/**
 * Access playoff series schedule related endpoints
 */
export const playoffSeriesSchedule = (
   seriesLetter: string,
   season?: string,
): Promise<APIResponse<PlayoffSeriesSchedule>> => {
   const parsed = SeriesAndSeasonParams({
      seriesLetter,
      season: season ?? getCurrentSeason(),
   });

   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.playoffSeriesSchedule,
         }),
      });
   }
   // series letter is a single character from A to O (/[a-oA-O]/)
   // Are series letters assigned in a pre determined manner?
   return nhlClient.get(route(_paths.playoffSeriesSchedule, parsed));
};

/**
 * Access where-to-watch related endpoints
 */
export const whereToWatch = (): Promise<APIResponse<WhereToWatch>> =>
   nhlClient.get(_paths.whereToWatch);

/**
 * Access network related endpoints
 */
/**
 * Get TV schedule data for a specific date
 * @param date - Date to get TV schedule data for (optional)
 * @returns Promise resolving to TV schedule data
 */
export const networkTVSchedule = (
   date?: Date | string,
): Promise<APIResponse<NetworkTVSchedule>> => {
   const parsedDate = NHLDate(date ?? getCurrentDate());
   if (isParseError(parsedDate)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedDate.summary, {
            endpoint: _paths.networkTVSchedule,
         }),
      });
   }
   return nhlClient.get(
      route(_paths.networkTVSchedule, { date: parsedDate }),
   );
};

/**
 * @module api/gamecenter/game
 * @description Game-related API endpoints for schedules, play-by-play, boxscores, playoffs, and game information
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
import type { GameId, Season, SeriesLetter, Year } from '#/types/types.ts';
import {
   getCurrentDate,
   getCurrentSeason,
   getCurrentYear,
} from '#/utils/date.ts';
import {
   GameIdAndEventId,
   GameId as GameIdAT,
   isParseError,
   NHLDate,
   Season as SeasonAT,
   SeriesAndSeasonParams,
   Year as YearAT,
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
      goal: 'ppt-replay/goal/{gameId}/{eventId}',
      event: 'ppt-replay/{gameId}/{eventId}',
   },
   whereToWatch: 'where-to-watch',
   networkTVSchedule: 'network/tv-schedule/{date}',
};

/**
 * Get play-by-play data for a specific game
 * @param gameId - The unique identifier for the game (10-digit format)
 * @returns Promise resolving to play-by-play data including all game events
 * @example
 * ```ts
 * playByPlay(2023020001).then((data) => console.log(data));
 * ```
 */
export const playByPlay = async (
   gameId: GameId,
): Promise<APIResponse<GamecenterPlayByPlay>> => {
   const parsedGameId = GameIdAT(gameId);
   if (isParseError(parsedGameId)) {
      return {
         status: 'error',
         error: new ValidationError(parsedGameId.summary, {
            endpoint: _paths.gamecenter.playByPlay,
         }),
      };
   }
   return nhlClient.get(
      route(_paths.gamecenter.playByPlay, { gameId: parsedGameId }),
   );
};

/**
 * Get comprehensive game data including stats, reports, and game information
 *
 * Includes:
 * - **Season Series**: Head-to-head games between the two teams
 * - **Game Info**: Officials (referees, linesmen), coaches, scratches
 * - **Game Video**: Recap and condensed game video IDs
 * - **Line Score**: Period-by-period scoring
 * - **Shots by Period**: Shot totals for each period
 * - **Team Game Stats**: SOG, faceoffs, power play, PIM, hits, blocks, giveaways, takeaways
 * - **Game Reports**: Links to official NHL reports:
 *   - Game Summary
 *   - Event Summary
 *   - Play-by-Play
 *   - Faceoff Summary & Comparison
 *   - Rosters
 *   - Shot Summary
 *   - Shift Chart
 *   - Time on Ice (both teams)
 *
 * @param gameId - The unique identifier for the game (10-digit format)
 * @returns Promise resolving to comprehensive game data with stats, reports, and metadata
 * @note The official endpoint name is 'right-rail', as it is used
 * to populate the right rail UI component of the NHL Gamecenter website. The
 * function has been renamed to 'reports' for clarity.
 * @example
 * ```ts
 * reports(2023020001).then((data) => console.log(data));
 * ```
 */
export const reports = async (
   gameId: GameId,
): Promise<APIResponse<GamecenterReports>> => {
   const parsedGameId = GameIdAT(gameId);
   if (isParseError(parsedGameId)) {
      return {
         status: 'error',
         error: new ValidationError(parsedGameId.summary, {
            endpoint: _paths.gamecenter.reports,
         }),
      };
   }
   return nhlClient.get(
      route(_paths.gamecenter.reports, { gameId: parsedGameId }),
   );
};
/**
 * Get landing page data for a specific game
 * @param gameId - The unique identifier for the game (10-digit format)
 * @returns Promise resolving to landing page data with game summary and key information
 * @example
 * ```ts
 * landing(2023020001).then((data) => console.log(data));
 * ```
 */
export const landing = async (
   gameId: GameId,
): Promise<APIResponse<GamecenterLanding>> => {
   const parsedGameId = GameIdAT(gameId);
   if (isParseError(parsedGameId)) {
      return {
         status: 'error',
         error: new ValidationError(parsedGameId.summary, {
            endpoint: _paths.gamecenter.landing,
         }),
      };
   }
   return nhlClient.get(
      route(_paths.gamecenter.landing, { gameId: parsedGameId }),
   );
};
/**
 * Get boxscore data for a specific game
 * @param gameId - The unique identifier for the game (10-digit format)
 * @returns Promise resolving to boxscore data with player stats and game summary
 * @example
 * ```ts
 * boxscore(2023020001).then((data) => console.log(data));
 * ```
 */
export const boxscore = async (
   gameId: GameId,
): Promise<APIResponse<GamecenterBoxscore>> => {
   const parsedGameId = GameIdAT(gameId);
   if (isParseError(parsedGameId)) {
      return {
         status: 'error',
         error: new ValidationError(parsedGameId.summary, {
            endpoint: _paths.gamecenter.boxscore,
         }),
      };
   }
   return nhlClient.get(
      route(_paths.gamecenter.boxscore, { gameId: parsedGameId }),
   );
};

/**
 * Access Web Service Cache (WSC) game data endpoints
 * @description Alternative data source for game information
 */
export const wsc = {
   /**
    * Get game story data for a specific game
    * @param gameId - The unique identifier for the game (10-digit format)
    * @returns Promise resolving to game story data with narrative content
    * @example
    * ```ts
    * wsc.gameStory(2023020001).then((data) => console.log(data));
    * ```
    */
   gameStory: async (
      gameId: GameId,
   ): Promise<APIResponse<WSCGameStory>> => {
      const parsedGameId = GameIdAT(gameId);
      if (isParseError(parsedGameId)) {
         return {
            status: 'error',
            error: new ValidationError(parsedGameId.summary, {
               endpoint: _paths.wsc.gameStory,
            }),
         };
      }
      return nhlClient.get(
         route(_paths.wsc.gameStory, { gameId: parsedGameId }),
      );
   },

   /**
    * Get WSC play-by-play data for a specific game
    * @param gameId - The unique identifier for the game (10-digit format)
    * @returns Promise resolving to play-by-play data from WSC source
    * @example
    * ```ts
    * wsc.playByPlay(2023020001).then((data) => console.log(data));
    * ```
    */
   playByPlay: async (
      gameId: GameId,
   ): Promise<APIResponse<WSCPlayByPlay>> => {
      const parsedGameId = GameIdAT(gameId);
      if (isParseError(parsedGameId)) {
         return {
            status: 'error',
            error: new ValidationError(parsedGameId.summary, {
               endpoint: _paths.wsc.playByPlay,
            }),
         };
      }
      return nhlClient.get(
         route(_paths.wsc.playByPlay, { gameId: parsedGameId }),
      );
   },
};

/**
 * Access PPT (Player and Puck Tracking) visualization data endpoints
 * @description Endpoints for accessing player and puck tracking data used for replay visualizations
 */
export const pptReplay = {
   /**
    * Get player and puck tracking visualization data for a specific goal event
    * @param gameId - The unique identifier for the game (10-digit format)
    * @param eventId - The unique identifier for the goal event
    * @returns Promise resolving to tracking data used for goal replay visualization
    * @example
    * ```ts
    * pptReplay.goal(2023020001, 42).then((data) => console.log(data));
    * ```
    */
   goal: async (
      gameId: GameId,
      eventId: number | string,
   ): Promise<APIResponse<PPTReplayGoal>> => {
      const parsed = GameIdAndEventId({ gameId, eventId });
      if (isParseError(parsed)) {
         return {
            status: 'error',
            error: new ValidationError(parsed.summary, {
               endpoint: _paths.pptReplay.goal,
            }),
         };
      }
      return nhlClient.get(
         route(_paths.pptReplay.goal, { gameId, eventId }),
      );
   },

   /**
    * Get player and puck tracking visualization data for a specific event
    * @param gameId - The unique identifier for the game (10-digit format)
    * @param eventId - The unique identifier for the event
    * @returns Promise resolving to tracking data used for event replay visualization
    * @example
    * ```ts
    * pptReplay.event(2023020001, 42).then((data) => console.log(data));
    * ```
    */
   event: async (
      gameId: GameId,
      eventId: number | string,
   ): Promise<APIResponse<PPTReplayEvent>> => {
      const parsed = GameIdAndEventId({ gameId, eventId });
      if (isParseError(parsed)) {
         return {
            status: 'error',
            error: new ValidationError(parsed.summary, {
               endpoint: _paths.pptReplay.event,
            }),
         };
      }
      return nhlClient.get(
         route(_paths.pptReplay.event, { gameId, eventId }),
      );
   },
};

/**
 * Get the league schedule for a specific date
 * @param date - Date to get schedule for (Date object or ISO date string 'YYYY-MM-DD'). Defaults to current date
 * @returns Promise resolving to league-wide schedule data for the specified date
 * @example
 * ```ts
 * // Get today's schedule
 * schedule().then((data) => console.log(data));
 *
 * // Get schedule for a specific date
 * schedule('2023-11-15').then((data) => console.log(data));
 * ```
 */
export const schedule = async (
   date?: Date | string,
): Promise<APIResponse<LeagueSchedule>> => {
   const parsedDate = NHLDate(date ?? getCurrentDate());
   if (isParseError(parsedDate)) {
      return {
         status: 'error',
         error: new ValidationError(parsedDate.summary, {
            endpoint: _paths.schedule,
         }),
      };
   }
   return nhlClient.get(route(_paths.schedule, { date: parsedDate }));
};

/**
 * Get schedule calendar data for a specific date
 * @param date - Date to get calendar data for (Date object or ISO date string 'YYYY-MM-DD'). Defaults to current date
 * @returns Promise resolving to schedule calendar data showing game availability
 * @example
 * ```ts
 * scheduleCalendar('2023-11-15').then((data) => console.log(data));
 * ```
 */
export const scheduleCalendar = async (
   date?: Date | string,
): Promise<APIResponse<ScheduleCalendar>> => {
   const parsedDate = NHLDate(date);
   if (isParseError(parsedDate)) {
      return {
         status: 'error',
         error: new ValidationError(parsedDate.summary, {
            endpoint: _paths.scheduleCalendar,
         }),
      };
   }
   return nhlClient.get(
      route(_paths.scheduleCalendar, { date: parsedDate }),
   );
};

/**
 * Get playoff bracket data for a specific year
 * @param year - The playoff year (YYYY format). Defaults to current year
 * @returns Promise resolving to playoff bracket structure with all series
 * @example
 * ```ts
 * playoffBracket(2023).then((data) => console.log(data));
 * ```
 */
export const playoffBracket = async (
   year?: Year,
): Promise<APIResponse<PlayoffBracket>> => {
   const parsedYear = YearAT(year ?? getCurrentYear());
   if (isParseError(parsedYear)) {
      return {
         status: 'error',
         error: new ValidationError(parsedYear.summary, {
            endpoint: _paths.playoffBracket,
         }),
      };
   }
   return nhlClient.get(route(_paths.playoffBracket, { year: parsedYear }));
};

/**
 * Get playoff series information for a season
 * @param season - The season identifier (8-digit format: YYYYYYYY, e.g., 20232024). Defaults to current season
 * @returns Promise resolving to all playoff series data for the season
 * @example
 * ```ts
 * playoffSeries(20232024).then((data) => console.log(data));
 * ```
 */
export const playoffSeries = async (
   season?: Season,
): Promise<APIResponse<PlayoffSeries>> => {
   const parsedSeason = SeasonAT(season ?? getCurrentSeason());
   if (isParseError(parsedSeason)) {
      return {
         status: 'error',
         error: new ValidationError(parsedSeason.summary, {
            endpoint: _paths.playoffSeries,
         }),
      };
   }
   return nhlClient.get(
      route(_paths.playoffSeries, { season: parsedSeason }),
   );
};

/**
 * Get schedule for a specific playoff series
 * @param seriesLetter - Single letter identifier for the playoff series (A-O)
 * @param season - The season identifier (8-digit format: YYYYYYYY). Defaults to current season
 * @returns Promise resolving to schedule for the specified playoff series
 * @example
 * ```ts
 * playoffSeriesSchedule('A', 20232024).then((data) => console.log(data));
 * ```
 */
export const playoffSeriesSchedule = async (
   seriesLetter: SeriesLetter,
   season?: Season,
): Promise<APIResponse<PlayoffSeriesSchedule>> => {
   const parsed = SeriesAndSeasonParams({
      seriesLetter,
      season: season ?? getCurrentSeason(),
   });

   if (isParseError(parsed)) {
      return {
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.playoffSeriesSchedule,
         }),
      };
   }
   // series letter is a single character from A to O (/[a-oA-O]/)
   // Are series letters assigned in a pre determined manner?
   return nhlClient.get(route(_paths.playoffSeriesSchedule, parsed));
};

/**
 * Get information about where games are available to watch
 * @returns Promise resolving to streaming and broadcast availability information
 * @example
 * ```ts
 * whereToWatch().then((data) => console.log(data));
 * ```
 */
export const whereToWatch = async (): Promise<APIResponse<WhereToWatch>> =>
   nhlClient.get(_paths.whereToWatch);

/**
 * Get TV network schedule for a specific date
 * @param date - Date to get TV schedule for (Date object or ISO date string 'YYYY-MM-DD'). Defaults to current date
 * @returns Promise resolving to TV schedule data with network broadcast information
 * @example
 * ```ts
 * networkTVSchedule('2023-11-15').then((data) => console.log(data));
 * ```
 */
export const networkTVSchedule = async (
   date?: Date | string,
): Promise<APIResponse<NetworkTVSchedule>> => {
   const parsedDate = NHLDate(date ?? getCurrentDate());
   if (isParseError(parsedDate)) {
      return {
         status: 'error',
         error: new ValidationError(parsedDate.summary, {
            endpoint: _paths.networkTVSchedule,
         }),
      };
   }
   return nhlClient.get(
      route(_paths.networkTVSchedule, { date: parsedDate }),
   );
};

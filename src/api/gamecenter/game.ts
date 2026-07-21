/**
 * @module api/gamecenter/game
 * @description Game-related API endpoints for schedules, play-by-play, boxscores, playoffs, and game information
 */
import { nhlClient } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type {
   GamecenterBoxscore,
   GamecenterLanding,
   GamecenterPlayByPlay,
   GamecenterReports,
   GameId,
   LeagueSchedule,
   NetworkTVSchedule,
   PlayoffBracket,
   PlayoffSeries,
   PlayoffSeriesSchedule,
   PPTReplayEvent,
   PPTReplayGoal,
   ScheduleCalendar,
   Season,
   SeriesLetter,
   WhereToWatch,
   WSCGameStory,
   WSCPlayByPlay,
   Year,
} from '#/types/index.ts';
import {
   getCurrentNHLDate,
   getCurrentNHLYear,
   getCurrentSeason,
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
import { resolvePath } from '#/utils/utils.ts';
import { gamePaths as p } from './paths.ts';

/**
 * Get play-by-play data for a specific game
 * @param gameId - The unique identifier for the game (10-digit format)
 * @returns Promise resolving to play-by-play data including all game events
 * @example
 * ```ts
 * playByPlay(2023020001).then((data) => console.log(data));
 * ```
 */
export async function playByPlay(
   gameId: GameId,
): Promise<APIResult<GamecenterPlayByPlay>> {
   const parsedGameId = GameIdAT(gameId);
   if (isParseError(parsedGameId)) {
      return {
         success: false,
         error: new ValidationError(parsedGameId.summary, {
            endpoint: p.gamecenter.playByPlay,
         }),
      };
   }
   const path = resolvePath(p.gamecenter.playByPlay, {
      gameId: parsedGameId,
   });
   return nhlClient.get(path);
}

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
export async function reports(
   gameId: GameId,
): Promise<APIResult<GamecenterReports>> {
   const parsedGameId = GameIdAT(gameId);
   if (isParseError(parsedGameId)) {
      return {
         success: false,
         error: new ValidationError(parsedGameId.summary, {
            endpoint: p.gamecenter.reports,
         }),
      };
   }
   const path = resolvePath(p.gamecenter.reports, { gameId: parsedGameId });
   return nhlClient.get(path);
}
/**
 * Get landing page data for a specific game
 * @param gameId - The unique identifier for the game (10-digit format)
 * @returns Promise resolving to landing page data with game summary and key information
 * @example
 * ```ts
 * landing(2023020001).then((data) => console.log(data));
 * ```
 */
export async function landing(
   gameId: GameId,
): Promise<APIResult<GamecenterLanding>> {
   const parsedGameId = GameIdAT(gameId);
   if (isParseError(parsedGameId)) {
      return {
         success: false,
         error: new ValidationError(parsedGameId.summary, {
            endpoint: p.gamecenter.landing,
         }),
      };
   }
   const path = resolvePath(p.gamecenter.landing, { gameId: parsedGameId });
   return nhlClient.get(path);
}
/**
 * Get boxscore data for a specific game
 * @param gameId - The unique identifier for the game (10-digit format)
 * @returns Promise resolving to boxscore data with player stats and game summary
 * @example
 * ```ts
 * boxscore(2023020001).then((data) => console.log(data));
 * ```
 */
export async function boxscore(
   gameId: GameId,
): Promise<APIResult<GamecenterBoxscore>> {
   const parsedGameId = GameIdAT(gameId);
   if (isParseError(parsedGameId)) {
      return {
         success: false,
         error: new ValidationError(parsedGameId.summary, {
            endpoint: p.gamecenter.boxscore,
         }),
      };
   }
   const path = resolvePath(p.gamecenter.boxscore, {
      gameId: parsedGameId,
   });
   return nhlClient.get(path);
}

/**
 * Access WSC Sports related game content endpoints
 * @description Alternative data source for game information
 */
export const wsc = {
   gameStory: wscGameStory,
   playByPlay: wscPlayByPlay,
};

/**
 * Get game story data for a specific game
 * @param gameId - The unique identifier for the game (10-digit format)
 * @returns Promise resolving to game story data with narrative content
 * @example
 * ```ts
 * wsc.gameStory(2023020001).then((data) => console.log(data));
 * ```
 */
async function wscGameStory(
   gameId: GameId,
): Promise<APIResult<WSCGameStory>> {
   const parsedGameId = GameIdAT(gameId);
   if (isParseError(parsedGameId)) {
      return {
         success: false,
         error: new ValidationError(parsedGameId.summary, {
            endpoint: p.wsc.gameStory,
         }),
      };
   }
   const path = resolvePath(p.wsc.gameStory, { gameId: parsedGameId });
   return nhlClient.get(path);
}

/**
 * Get WSC play-by-play data for a specific game
 * @param gameId - The unique identifier for the game (10-digit format)
 * @returns Promise resolving to play-by-play data from WSC source
 * @example
 * ```ts
 * wsc.playByPlay(2023020001).then((data) => console.log(data));
 * ```
 */
async function wscPlayByPlay(
   gameId: GameId,
): Promise<APIResult<WSCPlayByPlay>> {
   const parsedGameId = GameIdAT(gameId);
   if (isParseError(parsedGameId)) {
      return {
         success: false,
         error: new ValidationError(parsedGameId.summary, {
            endpoint: p.wsc.playByPlay,
         }),
      };
   }
   const path = resolvePath(p.wsc.playByPlay, { gameId: parsedGameId });
   return nhlClient.get(path);
}

/**
 * Access PPT (Player and Puck Tracking) visualization data endpoints
 * @description Endpoints for accessing player and puck tracking data used for replay visualizations
 */
export const pptReplay = {
   goal: pptReplayGoal,
   event: pptReplayEvent,
};

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
async function pptReplayGoal(
   gameId: GameId,
   eventId: number | string,
): Promise<APIResult<PPTReplayGoal>> {
   const parsed = GameIdAndEventId({ gameId, eventId });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.pptReplay.goal,
         }),
      };
   }
   const path = resolvePath(p.pptReplay.goal, { gameId, eventId });
   return nhlClient.get(path);
}

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
async function pptReplayEvent(
   gameId: GameId,
   eventId: number | string,
): Promise<APIResult<PPTReplayEvent>> {
   const parsed = GameIdAndEventId({ gameId, eventId });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.pptReplay.event,
         }),
      };
   }
   const path = resolvePath(p.pptReplay.event, { gameId, eventId });
   return nhlClient.get(path);
}

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
export async function schedule(
   date?: Date | string,
): Promise<APIResult<LeagueSchedule>> {
   const parsedDate = NHLDate(date ?? getCurrentNHLDate());
   if (isParseError(parsedDate)) {
      return {
         success: false,
         error: new ValidationError(parsedDate.summary, {
            endpoint: p.schedule,
         }),
      };
   }
   const path = resolvePath(p.schedule, { date: parsedDate });
   return nhlClient.get(path);
}

/**
 * Get schedule calendar data for a specific date
 * @param date - Date to get calendar data for (Date object or ISO date string 'YYYY-MM-DD'). Defaults to current date
 * @returns Promise resolving to schedule calendar data showing game availability
 * @example
 * ```ts
 * scheduleCalendar('2023-11-15').then((data) => console.log(data));
 * ```
 */
export async function scheduleCalendar(
   date?: Date | string,
): Promise<APIResult<ScheduleCalendar>> {
   const parsedDate = NHLDate(date);
   if (isParseError(parsedDate)) {
      return {
         success: false,
         error: new ValidationError(parsedDate.summary, {
            endpoint: p.scheduleCalendar,
         }),
      };
   }
   const path = resolvePath(p.scheduleCalendar, { date: parsedDate });
   return nhlClient.get(path);
}

/**
 * Get playoff bracket data for a specific year
 * @param year - The playoff year (YYYY format). Defaults to current year
 * @returns Promise resolving to playoff bracket structure with all series
 * @example
 * ```ts
 * playoffBracket(2023).then((data) => console.log(data));
 * ```
 */
export async function playoffBracket(
   year?: Year,
): Promise<APIResult<PlayoffBracket>> {
   const parsedYear = YearAT(year ?? getCurrentNHLYear());
   if (isParseError(parsedYear)) {
      return {
         success: false,
         error: new ValidationError(parsedYear.summary, {
            endpoint: p.playoffBracket,
         }),
      };
   }
   const path = resolvePath(p.playoffBracket, { year: parsedYear });
   return nhlClient.get(path);
}

/**
 * Get playoff series information for a season
 * @param season - The season identifier (8-digit format: YYYYYYYY, e.g., 20232024). Defaults to current season
 * @returns Promise resolving to all playoff series data for the season
 * @example
 * ```ts
 * playoffSeries(20232024).then((data) => console.log(data));
 * ```
 */
export async function playoffSeries(
   season?: Season,
): Promise<APIResult<PlayoffSeries>> {
   const parsedSeason = SeasonAT(season ?? getCurrentSeason());
   if (isParseError(parsedSeason)) {
      return {
         success: false,
         error: new ValidationError(parsedSeason.summary, {
            endpoint: p.playoffSeries,
         }),
      };
   }
   const path = resolvePath(p.playoffSeries, { season: parsedSeason });
   return nhlClient.get(path);
}

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

export async function playoffSeriesSchedule(
   seriesLetter: SeriesLetter,
   season?: Season,
): Promise<APIResult<PlayoffSeriesSchedule>>;
export async function playoffSeriesSchedule(
   seriesLetter: string,
   season?: Season,
): Promise<APIResult<PlayoffSeriesSchedule>>;
export async function playoffSeriesSchedule(
   seriesLetter: SeriesLetter | string,
   season?: Season,
): Promise<APIResult<PlayoffSeriesSchedule>> {
   const parsed = SeriesAndSeasonParams({
      seriesLetter,
      season: season ?? getCurrentSeason(),
   });

   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.playoffSeriesSchedule,
         }),
      };
   }
   // series letter is a single character from A to O (/[a-oA-O]/)
   // Are series letters assigned in a pre determined manner?
   const path = resolvePath(p.playoffSeriesSchedule, parsed);
   return nhlClient.get(path);
}

/**
 * Get information about where games are available to watch
 * @returns Promise resolving to streaming and broadcast availability information
 * @example
 * ```ts
 * whereToWatch().then((data) => console.log(data));
 * ```
 */
export async function whereToWatch(): Promise<APIResult<WhereToWatch>> {
   const path = resolvePath(p.whereToWatch, {});
   return nhlClient.get(path);
}

/**
 * Get TV network schedule for a specific date
 * @param date - Date to get TV schedule for (Date object or ISO date string 'YYYY-MM-DD'). Defaults to current date
 * @returns Promise resolving to TV schedule data with network broadcast information
 * @example
 * ```ts
 * networkTVSchedule('2023-11-15').then((data) => console.log(data));
 * ```
 */
export async function networkTVSchedule(
   date?: Date | string,
): Promise<APIResult<NetworkTVSchedule>> {
   const parsedDate = NHLDate(date ?? getCurrentNHLDate());
   if (isParseError(parsedDate)) {
      return {
         success: false,
         error: new ValidationError(parsedDate.summary, {
            endpoint: p.networkTVSchedule,
         }),
      };
   }
   const path = resolvePath(p.networkTVSchedule, { date: parsedDate });
   return nhlClient.get(path);
}

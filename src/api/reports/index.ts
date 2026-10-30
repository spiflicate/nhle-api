/**
 * ======================================================================
 * Official HTML game reports ("RTSS reports") on www.nhl.com
 * Base URL: https://www.nhl.com/scores/htmlreports
 * ======================================================================
 * The reports carry data the JSON APIs don't, such as the time a game
 * actually started. A report that hasn't been published yet returns 404.
 */

import { createNHLClient } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import { ParseError, ValidationError } from '#/errors/index.ts';
import type { GameId } from '#/types/index.ts';
import { GameId as GameIdAT, isParseError } from '#/utils/schemas.ts';
import { boxscore, playByPlay } from '../gamecenter/game.ts';
import { type GameTimes, parseGameTimes } from './parse.ts';
import {
   parseShifts,
   type ShiftChart,
   type ShiftRoster,
} from './shifts.ts';
import { type GameSummary, parseGameSummary } from './summary.ts';

export type { GameTimes, ReportTime } from './parse.ts';
export type { ReportShift, ShiftChart, ShiftRoster } from './shifts.ts';
export type {
   GameSummary,
   SummaryGoal,
   SummaryGoalie,
   SummaryMissedPenaltyShot,
   SummaryPenalty,
   SummaryPeriod,
   SummaryStar,
   SummaryStrength,
   SummaryTeam,
} from './summary.ts';

/** Return the report HTML instead of parsing it. */
export interface ReportOptions {
   raw?: boolean;
}

/** Both time-on-ice reports, unchanged from the HTML client. */
export interface RawShiftReports {
   home: string;
   away: string;
}

export interface ShiftsOptions extends ReportOptions {
   /** Game-specific PBP roster; avoids a play-by-play request. Ignored in raw mode. */
   playByPlay?: ShiftRoster;
}

/** Options for {@link gameTimes} */
export interface GameTimesOptions {
   /**
    * The scheduled start in UTC, e.g. the game's `startTimeUTC` from a
    * schedule you already have. Saves the boxscore request `gameTimes`
    * makes to look it up.
    */
   scheduledStart?: string | Date;
}

/** Raw mode ignores `scheduledStart` and makes no boxscore request. */
export interface GameSummaryOptions
   extends GameTimesOptions,
      ReportOptions {}

const BASE_URL = 'https://www.nhl.com/scores/htmlreports';

const reportsClient = createNHLClient({
   baseUrl: BASE_URL,
   headers: { Accept: 'text/html' },
});

/**
 * Report codes:
 * - `GS` Game Summary
 * - `ES` Event Summary
 * - `PL` Play-by-Play
 * - `FS` Faceoff Summary
 * - `FC` Faceoff Comparison
 * - `RO` Playing Roster
 * - `SS` Shot Summary
 * - `TV` / `TH` Time on Ice, away / home
 */
export const REPORT_CODES = [
   'GS',
   'ES',
   'PL',
   'FS',
   'FC',
   'RO',
   'SS',
   'TV',
   'TH',
] as const;
export type ReportCode = (typeof REPORT_CODES)[number];

/** `{season}/{code}{gameNumber}.HTM`, relative to the base URL */
function reportPath(gameId: number, code: ReportCode): string {
   const year = Math.trunc(gameId / 1e6);
   const gameNumber = String(gameId % 1e6).padStart(6, '0');
   return `${year}${year + 1}/${code}${gameNumber}.HTM`;
}

/**
 * Build the URL of a game's report
 *
 * @param gameId - 10-digit game id
 * @param code - Report code, e.g. 'GS' for the Game Summary
 * @returns The report URL
 * @throws {ValidationError} When the game id isn't valid
 *
 * @example
 * reports.url(2026020180, 'GS');
 * // 'https://www.nhl.com/scores/htmlreports/20262027/GS020180.HTM'
 */
export function url(gameId: GameId, code: ReportCode): string {
   const parsed = GameIdAT(gameId);
   if (isParseError(parsed)) throw new ValidationError(parsed.summary);
   return `${BASE_URL}/${reportPath(parsed, code)}`;
}

/**
 * Get when a game actually started and ended, from its Game Summary
 * report. The JSON APIs only have the scheduled start time.
 *
 * Times are printed in the venue's local zone and converted to UTC. A
 * zone abbreviation other than the North American zones, CET/CEST and
 * EET/EEST gives a ParseError rather than a guessed UTC time.
 *
 * The report prints times without am/pm, so the start is read as the am
 * or pm time that falls between 1 hour before and 6 hours after the
 * scheduled start; when neither does, the result is a ParseError. The
 * scheduled start comes from `options.scheduledStart`, or else from the
 * game's boxscore (one more request).
 *
 * @param gameId - 10-digit game id
 * @param options - Optional scheduled start
 * @returns Promise resolving to the local date and the start and end
 * times (`start` is null until the puck drops, `end` until the game
 * ends); a game whose report isn't published yet, which happens one to
 * two hours before the scheduled start, gives a NotFoundError result,
 * and a header that can't be read or converted a ParseError.
 * For the full report (parsed or raw HTML), use {@link gameSummary}.
 *
 * @example
 * const result = await reports.gameTimes(2026020180);
 * if (result.success) console.log(result.data.start?.utc);
 * // '2026-10-25T19:16:00Z'
 *
 * // With the scheduled start from a schedule you already fetched
 * await reports.gameTimes(game.id, { scheduledStart: game.startTimeUTC });
 */
export async function gameTimes(
   gameId: GameId,
   options: GameTimesOptions = {},
): Promise<APIResult<GameTimes>> {
   const result = await summaryReport(gameId, options);
   if (!result.success) return result;
   const times = parseGameTimes(
      result.data.html,
      result.data.scheduledStart,
   );
   return withSummaryEndpoint(gameId, times);
}

/**
 * Read the full Game Summary (GS): teams/score, times, attendance/venue,
 * goals, penalties, period/strength totals, goalies, officials and stars.
 * Names and sweater numbers are as printed, without synthetic player IDs.
 * `raw: true` returns GS HTML without parsing or a boxscore lookup.
 */
export function gameSummary(
   gameId: GameId,
   options: GameSummaryOptions & { raw: true },
): Promise<APIResult<string>>;
export function gameSummary(
   gameId: GameId,
   options?: GameSummaryOptions & { raw?: false },
): Promise<APIResult<GameSummary>>;
export function gameSummary(
   gameId: GameId,
   options: GameSummaryOptions,
): Promise<APIResult<GameSummary | string>>;
export async function gameSummary(
   gameId: GameId,
   options: GameSummaryOptions = {},
): Promise<APIResult<GameSummary | string>> {
   const parsed = GameIdAT(gameId);
   if (isParseError(parsed))
      return { success: false, error: new ValidationError(parsed.summary) };
   if (options.raw !== undefined && typeof options.raw !== 'boolean') {
      return {
         success: false,
         error: new ValidationError('raw must be a boolean'),
      };
   }
   if (options.raw) return reportsClient.getText(reportPath(parsed, 'GS'));
   const result = await summaryReport(parsed, options);
   if (!result.success) return result;
   return withSummaryEndpoint(
      parsed,
      parseGameSummary(
         parsed,
         result.data.html,
         result.data.scheduledStart,
      ),
   );
}

function withSummaryEndpoint<T>(
   gameId: GameId,
   result: APIResult<T>,
): APIResult<T> {
   if (result.success) return result;
   return {
      success: false,
      error: new ParseError(result.error.message, {
         endpoint: url(gameId, 'GS'),
      }),
   };
}

/** Shared acquisition; gameTimes deliberately needs only the header to parse. */
async function summaryReport(
   gameId: GameId,
   options: GameTimesOptions,
): Promise<APIResult<{ html: string; scheduledStart: Date }>> {
   const parsed = GameIdAT(gameId);
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary),
      };
   }

   let scheduledStart = options.scheduledStart;
   if (
      scheduledStart !== undefined &&
      Number.isNaN(new Date(scheduledStart).getTime())
   ) {
      return {
         success: false,
         error: new ValidationError(
            `scheduledStart must be a valid date (was ${String(scheduledStart)})`,
         ),
      };
   }

   const path = reportPath(parsed, 'GS');
   const [result, game] = await Promise.all([
      reportsClient.getText(path),
      scheduledStart === undefined ? boxscore(parsed) : undefined,
   ]);
   if (!result.success) return result;
   if (game) {
      if (!game.success) return game;
      scheduledStart = game.data.startTimeUTC;
   }

   return {
      success: true,
      data: {
         html: result.data,
         scheduledStart: new Date(scheduledStart ?? NaN),
      },
   };
}

/**
 * Read shifts from the home/away time-on-ice reports. No JSON shift fallback.
 * Parsed mode also fetches PBP to join team/sweater numbers to NHL player IDs,
 * unless `playByPlay` is supplied. Raw mode fetches only TH and TV, returning
 * `{ home, away }` HTML. Missing reports return the client's error; unreadable
 * rows or ambiguous/unmapped sweaters return a ParseError, not partial data.
 * Rows are preserved in report order (home then away), including duplicates.
 */
export function shifts(
   gameId: GameId,
   options: ShiftsOptions & { raw: true },
): Promise<APIResult<RawShiftReports>>;
export function shifts(
   gameId: GameId,
   options?: ShiftsOptions & { raw?: false },
): Promise<APIResult<ShiftChart>>;
export function shifts(
   gameId: GameId,
   options: ShiftsOptions,
): Promise<APIResult<ShiftChart | RawShiftReports>>;
export async function shifts(
   gameId: GameId,
   options: ShiftsOptions = {},
): Promise<APIResult<ShiftChart | RawShiftReports>> {
   const parsed = GameIdAT(gameId);
   if (isParseError(parsed)) {
      return { success: false, error: new ValidationError(parsed.summary) };
   }
   if (options.raw !== undefined && typeof options.raw !== 'boolean') {
      return {
         success: false,
         error: new ValidationError('raw must be a boolean'),
      };
   }
   if (
      !options.raw &&
      options.playByPlay &&
      options.playByPlay.id !== parsed
   ) {
      return {
         success: false,
         error: new ValidationError(
            'playByPlay must belong to the requested game',
         ),
      };
   }
   const [home, away] = await Promise.all([
      reportsClient.getText(reportPath(parsed, 'TH')),
      reportsClient.getText(reportPath(parsed, 'TV')),
   ]);
   if (!home.success) return home;
   if (!away.success) return away;
   if (options.raw)
      return { success: true, data: { home: home.data, away: away.data } };

   const roster = options.playByPlay
      ? { success: true as const, data: options.playByPlay }
      : await playByPlay(parsed);
   if (!roster.success) return roster;
   return parseShifts(parsed, home.data, away.data, roster.data);
}

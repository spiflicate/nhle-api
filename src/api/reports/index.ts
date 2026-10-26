/**
 * ======================================================================
 * Official HTML game reports ("RTSS reports") on www.nhl.com
 * Base URL: https://www.nhl.com/scores/htmlreports
 * ======================================================================
 * The reports carry data the JSON APIs don't, such as the time a game
 * actually started. A report for a game that hasn't been played returns
 * 404.
 */

import { createNHLClient } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import { ParseError, ValidationError } from '#/errors/index.ts';
import type { GameId } from '#/types/index.ts';
import { GameId as GameIdAT, isParseError } from '#/utils/schemas.ts';
import { type GameTimes, parseGameTimes } from './parse.ts';

export type { GameTimes, ReportTime } from './parse.ts';

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
 * @param gameId - 10-digit game id
 * @returns Promise resolving to the local date and the start and end
 * times; a game whose report doesn't exist yet gives a NotFoundError
 * result, and a header that can't be read or converted a ParseError
 *
 * @example
 * const result = await reports.gameTimes(2026020180);
 * if (result.success) console.log(result.data.start?.utc);
 * // '2026-10-25T19:16:00Z'
 */
export async function gameTimes(
   gameId: GameId,
): Promise<APIResult<GameTimes>> {
   const parsed = GameIdAT(gameId);
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary),
      };
   }
   const path = reportPath(parsed, 'GS');
   const result = await reportsClient.getText(path);
   if (!result.success) return result;

   const times = parseGameTimes(result.data);
   if (!times.success) {
      return {
         success: false,
         error: new ParseError(times.error.message, {
            endpoint: `${BASE_URL}/${path}`,
         }),
      };
   }
   return times;
}

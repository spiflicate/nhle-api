/**
 * Parsers for the official HTML game reports. Kept out of the public
 * `reports` namespace; they are exercised through it and by fixture
 * tests.
 */

import type { APIResult } from '#/client/types.ts';
import { ParseError } from '#/errors/index.ts';

/** A recorded start or end time from the Game Summary header */
export interface ReportTime {
   /** Local time as printed, 12-hour without am/pm, e.g. '2:16' */
   local: string;
   /** Zone abbreviation as printed, e.g. 'CDT' */
   zone: string;
   /** The time in UTC, e.g. '2026-10-25T19:16:00Z' */
   utc: string;
}

/** When a game actually started and ended, from its Game Summary report */
export interface GameTimes {
   /** Local game date, e.g. '2026-10-25' */
   date: string;
   /** Null before the game has started */
   start: ReportTime | null;
   /** Null while the game is in progress */
   end: ReportTime | null;
}

/**
 * UTC offsets in hours of the zone abbreviations the reports print:
 * North American venues, plus Global Series games in Europe, which print
 * local time too. Any other abbreviation fails the parse rather than
 * risk a wrong UTC time.
 */
export const ZONE_OFFSETS: Readonly<Record<string, number>> = {
   EST: -5,
   EDT: -4,
   CST: -6,
   CDT: -5,
   MST: -7,
   MDT: -6,
   PST: -8,
   PDT: -7,
   CET: 1,
   CEST: 2,
   EET: 2,
   EEST: 3,
};

const MONTHS = [
   'January',
   'February',
   'March',
   'April',
   'May',
   'June',
   'July',
   'August',
   'September',
   'October',
   'November',
   'December',
];

const DATE_RE = new RegExp(
   `(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day,\\s+(${MONTHS.join('|')})\\s+(\\d{1,2}),\\s+(\\d{4})`,
);
// The zone is optional here so that a missing one fails the parse
// instead of reading as "not started"
const TIME_RE = (label: string) =>
   new RegExp(`\\b${label}\\s+(\\d{1,2}):(\\d{2})(?:\\s+([A-Za-z]+))?`);

const DAY = 24 * 60;

/**
 * Read the local date and the start and end times from a Game Summary
 * (`GS`) report.
 *
 * The report prints 12-hour times without am/pm. The rule used:
 * - a start at 10:xx or 11:xx is morning, 12:xx is noon and 1:xx to
 *   9:xx is afternoon or evening, since NHL games start between late
 *   morning and night local time;
 * - the end is the first time after the start that matches the printed
 *   value, so an end before the start falls on the next day.
 *
 * Zone abbreviations not in {@link ZONE_OFFSETS} fail the parse.
 *
 * @param html - The report page
 * @returns The times, or a ParseError when the page has no game date or
 * a time can't be read or converted to UTC
 */
export function parseGameTimes(html: string): APIResult<GameTimes> {
   const text = html.replace(/&nbsp;|\u00a0/g, ' ');
   const dateMatch = DATE_RE.exec(text);
   if (!dateMatch) return failure('No game date found in the Game Summary');
   const [, monthName = '', day = '', year = ''] = dateMatch;
   const date = `${year}-${pad(MONTHS.indexOf(monthName) + 1)}-${pad(Number(day))}`;

   const start = TIME_RE('Start').exec(text);
   const end = TIME_RE('End').exec(text);
   for (const match of [start, end]) {
      const zone = match?.[3];
      if (match && (zone === undefined || !(zone in ZONE_OFFSETS))) {
         return failure(
            `Unknown time zone ${zone === undefined ? '(none)' : `'${zone}'`} in '${match[0].trim()}'`,
         );
      }
   }

   // Minutes after local midnight of the game date
   const startMinutes = start ? startToMinutes(start) : null;
   const endMinutes = end
      ? startMinutes === null
         ? startToMinutes(end)
         : endToMinutes(end, startMinutes)
      : null;

   return {
      success: true,
      data: {
         date,
         start: start ? toReportTime(start, date, startMinutes ?? 0) : null,
         end: end ? toReportTime(end, date, endMinutes ?? 0) : null,
      },
   };
}

function failure(message: string): APIResult<never> {
   return { success: false, error: new ParseError(message) };
}

function startToMinutes(match: RegExpExecArray): number {
   const hour = Number(match[1]);
   const minute = Number(match[2]);
   const hour24 = hour >= 10 ? hour : hour + 12;
   return hour24 * 60 + minute;
}

function endToMinutes(match: RegExpExecArray, after: number): number {
   const base = (Number(match[1]) % 12) * 60 + Number(match[2]);
   for (const candidate of [base, base + DAY / 2, base + DAY]) {
      if (candidate >= after) return candidate;
   }
   return base + DAY + DAY / 2;
}

function toReportTime(
   match: RegExpExecArray,
   date: string,
   minutes: number,
): ReportTime {
   const [, hour = '', minute = '', zone = ''] = match;
   const offset = ZONE_OFFSETS[zone] ?? 0;
   const [y = 0, m = 1, d = 1] = date.split('-').map(Number);
   const ms = Date.UTC(y, m - 1, d, 0, minutes - offset * 60);
   const utc = new Date(ms).toISOString().replace('.000Z', 'Z');
   return { local: `${Number(hour)}:${minute}`, zone, utc };
}

function pad(n: number): string {
   return String(n).padStart(2, '0');
}

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

/** How far the actual start may be from the scheduled one, in minutes */
export const START_WINDOW = { before: 60, after: 6 * 60 } as const;

/**
 * Read the local date and the start and end times from a Game Summary
 * (`GS`) report.
 *
 * The report prints 12-hour times without am/pm:
 * - with `scheduledStart`, the start is whichever reading falls between
 *   {@link START_WINDOW} `before` minutes before and `after` minutes
 *   after it; when neither does, the parse fails;
 * - without it, a start at 10:xx or 11:xx is morning, 12:xx is noon and
 *   1:xx to 9:xx is afternoon or evening, since NHL games start between
 *   late morning and night local time;
 * - the end is the first time after the start that matches the printed
 *   value, so an end before the start falls on the next day.
 *
 * Zone abbreviations not in {@link ZONE_OFFSETS} fail the parse.
 *
 * @param html - The report page
 * @param scheduledStart - The scheduled start in UTC, e.g. a game's
 * `startTimeUTC`, used to tell morning from evening
 * @returns The times, or a ParseError when the page has no game date or
 * a time can't be read or converted to UTC
 */
export function parseGameTimes(
   html: string,
   scheduledStart?: Date,
): APIResult<GameTimes> {
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
   if (end && !start) return failure(`'${end[0].trim()}' without a start`);

   // Minutes after local midnight of the game date
   let startMinutes: number | null = null;
   if (start) {
      if (scheduledStart) {
         startMinutes = scheduledToMinutes(start, date, scheduledStart);
         if (startMinutes === null) {
            return failure(
               `'${start[0].trim()}' is neither am nor pm within ${START_WINDOW.before} minutes before to ${START_WINDOW.after} minutes after the scheduled start ${isoMinutes(scheduledStart.getTime())}`,
            );
         }
      } else {
         startMinutes = startToMinutes(start);
      }
   }
   const endMinutes =
      end && startMinutes !== null ? endToMinutes(end, startMinutes) : null;

   return {
      success: true,
      data: {
         date,
         start:
            start && startMinutes !== null
               ? toReportTime(start, date, startMinutes)
               : null,
         end:
            end && endMinutes !== null
               ? toReportTime(end, date, endMinutes)
               : null,
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

/** The am or pm reading of `match` that is near `scheduled`, if any */
function scheduledToMinutes(
   match: RegExpExecArray,
   date: string,
   scheduled: Date,
): number | null {
   const base = (Number(match[1]) % 12) * 60 + Number(match[2]);
   const from = scheduled.getTime() - START_WINDOW.before * 60_000;
   const to = scheduled.getTime() + START_WINDOW.after * 60_000;
   for (const candidate of [base, base + DAY / 2]) {
      const ms = utcMs(date, candidate, match[3] ?? '');
      if (ms >= from && ms <= to) return candidate;
   }
   return null;
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
   return {
      local: `${Number(hour)}:${minute}`,
      zone,
      utc: isoMinutes(utcMs(date, minutes, zone)),
   };
}

/** Epoch ms of `minutes` after local midnight of `date` in `zone` */
function utcMs(date: string, minutes: number, zone: string): number {
   const offset = ZONE_OFFSETS[zone] ?? 0;
   const [y = 0, m = 1, d = 1] = date.split('-').map(Number);
   return Date.UTC(y, m - 1, d, 0, minutes - offset * 60);
}

/** '2026-10-25T19:16:00Z' */
function isoMinutes(ms: number): string {
   return new Date(ms).toISOString().replace(/:\d{2}\.\d{3}Z$/, ':00Z');
}

function pad(n: number): string {
   return String(n).padStart(2, '0');
}

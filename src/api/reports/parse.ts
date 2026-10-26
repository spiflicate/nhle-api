/**
 * Parsers for the official HTML game reports. Kept out of the public
 * `reports` namespace; they are exercised through it and by fixture
 * tests.
 */

/** A recorded start or end time from the Game Summary header */
export interface ReportTime {
   /** Local time as printed, 12-hour without am/pm, e.g. '2:16' */
   local: string;
   /** Zone abbreviation as printed, e.g. 'CDT' */
   zone: string;
   /**
    * The time in UTC, e.g. '2026-10-25T19:16:00Z', or null when the zone
    * abbreviation isn't one of {@link ZONE_OFFSETS}
    */
   utc: string | null;
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
 * local time too. Other abbreviations give a null `utc`.
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
const TIME_RE = (label: string) =>
   new RegExp(`\\b${label}\\s+(\\d{1,2}):(\\d{2})\\s+([A-Z]{2,5})\\b`);

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
 * @param html - The report page
 * @returns The times, or null when the page has no game date
 */
export function parseGameTimes(html: string): GameTimes | null {
   const text = html.replace(/&nbsp;| /g, ' ');
   const dateMatch = DATE_RE.exec(text);
   if (!dateMatch) return null;
   const [, monthName = '', day = '', year = ''] = dateMatch;
   const date = `${year}-${pad(MONTHS.indexOf(monthName) + 1)}-${pad(Number(day))}`;

   const start = TIME_RE('Start').exec(text);
   const end = TIME_RE('End').exec(text);

   // Minutes after local midnight of the game date
   const startMinutes = start ? startToMinutes(start) : null;
   const endMinutes = end
      ? startMinutes === null
         ? startToMinutes(end)
         : endToMinutes(end, startMinutes)
      : null;

   return {
      date,
      start: start ? toReportTime(start, date, startMinutes ?? 0) : null,
      end: end ? toReportTime(end, date, endMinutes ?? 0) : null,
   };
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
   const offset = ZONE_OFFSETS[zone];
   let utc: string | null = null;
   if (offset !== undefined) {
      const [y, m, d] = date.split('-').map(Number);
      const ms = Date.UTC(
         y ?? 0,
         (m ?? 1) - 1,
         d,
         0,
         minutes - offset * 60,
      );
      utc = new Date(ms).toISOString().replace('.000Z', 'Z');
   }
   return { local: `${Number(hour)}:${minute}`, zone, utc };
}

function pad(n: number): string {
   return String(n).padStart(2, '0');
}

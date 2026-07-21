/**
 * NHL season and date utilities.
 *
 * These helpers define the calendar semantics used by NHL API parameters.
 * Calendar values are evaluated in the NHL's eastern time zone
 * (`America/New_York`), regardless of the process's local time zone. Use
 * `getDate` and `getMonth` when converting `Date` values for API calls.
 */

/** Canonical timezone for NHL calendar dates and API date parameters. */
export const NHL_TIMEZONE = 'America/New_York';

/**
 * Formats a date as the NHL API's `YYYY-MM-DD` calendar parameter.
 *
 * The calendar date is resolved in {@link NHL_TIMEZONE}, not UTC.
 * @param date - A valid date to format.
 * @returns The date formatted as `YYYY-MM-DD`.
 * @throws RangeError If `date` is invalid.
 */
export const getNHLDate = (date: Date): string =>
   new Intl.DateTimeFormat('en-CA', {
      timeZone: NHL_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
   }).format(date);
/**
 * Returns the current date as `YYYY-MM-DD` in the NHL eastern time zone.
 * @returns The current date formatted as `YYYY-MM-DD`.
 */
export const getCurrentNHLDate = (): string => getNHLDate(new Date());

/**
 * Formats a date as the NHL API's `YYYY-MM` calendar parameter.
 *
 * The calendar month is resolved in {@link NHL_TIMEZONE}, not UTC.
 * @param date - A valid date to format.
 * @returns The month formatted as `YYYY-MM`.
 * @throws RangeError If `date` is invalid.
 */
export const getNHLMonth = (date: Date): string => {
   return new Intl.DateTimeFormat('en-CA', {
      timeZone: NHL_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
   }).format(date);
};

/**
 * Returns the current month as `YYYY-MM` in the NHL eastern time zone.
 * @returns The current month formatted as `YYYY-MM`.
 */
export const getCurrentNHLMonth = (): string => getNHLMonth(new Date());

/**
 * Formats a date as `YYYY` in the NHL eastern time zone.
 * @param date - A valid date to format.
 * @returns The year formatted as `YYYY`.
 * @throws RangeError If `date` is invalid.
 */
export const getYear = (date: Date): string =>
   new Intl.DateTimeFormat('en-CA', {
      timeZone: NHL_TIMEZONE,
      year: 'numeric',
   }).format(date);
/**
 * Returns the current year as `YYYY` in the NHL eastern time zone.
 * @returns The current year formatted as `YYYY`.
 */
export const getCurrentNHLYear = (): string => getYear(new Date());
/**
 * Returns the NHL season label associated with a date as `yyyyYYYY` (for
 * example, `20232024`). The season label starts on July 1: dates from
 * January through June belong to the season that started in the previous
 * calendar year, while dates from July through December belong to the season
 * starting in the current calendar year.
 *
 * The month is resolved in {@link NHL_TIMEZONE}.
 * @param date - A valid `Date` or a date string accepted by the `Date` constructor.
 * @returns The season formatted as `yyyyYYYY`.
 * @throws RangeError If the date is invalid.
 */
export const getSeason = (date: string | Date): string => {
   const format = new Intl.DateTimeFormat('en-CA', {
      timeZone: NHL_TIMEZONE,
      year: 'numeric',
      month: 'numeric',
   }).formatToParts(date instanceof Date ? date : new Date(date));
   const month = format.find((part) => part.type === 'month')?.value;
   const year = format.find((part) => part.type === 'year')?.value;
   if (!year) {
      throw new Error('Invalid date provided, could not extract year');
   }
   if (month && parseInt(month, 10) < 7) {
      return `${parseInt(year, 10) - 1}${year}`;
   }
   return `${year}${parseInt(year, 10) + 1}`;
};
/**
 * Returns the current NHL season as `yyyyYYYY` in the NHL eastern time zone.
 * @returns The current season formatted as `yyyyYYYY`.
 */
export const getCurrentSeason = (): string => getSeason(new Date());

/** Lower bound used when validating NHL API date ranges. */
export const NHL_START_DATE = new Date('1917-12-01');

/**
 * Upper bound for the current NHL season, set to June 30 of its ending year.
 */
export const NHL_END_DATE = new Date(
   `${getCurrentSeason().slice(4, 8)}-06-30`,
);

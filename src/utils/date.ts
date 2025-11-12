/**
 * Date utility functions for NHL API
 * Provides functions for formatting dates and handling seasons
 */

export const NHL_TIMEZONE = 'America/New_York';

/**
 * Formats a date object into a string in the format YYYY-MM-DD
 * @param date - The date object to format
 * @returns The formatted date string
 */
export const getDate = (date: Date): string =>
   new Intl.DateTimeFormat('en-CA', {
      timeZone: NHL_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
   }).format(date);
/**
 * Returns the current date formatted as YYYY-MM-DD.
 * This is a convenience method that calls getDate with the current date.
 * @returns The current date formatted as YYYY-MM-DD
 */
export const getCurrentDate = (): string => getDate(new Date());

/**
 * Formats a date object into a string representing the month in YYYY-MM format
 * @param date - The date object to format
 * @returns The formatted month string
 */
export const getMonth = (date: Date): string => {
   return new Intl.DateTimeFormat('en-CA', {
      timeZone: NHL_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
   }).format(date);
};

/**
 * Returns the current month formatted as YYYY-MM
 * This is a convenience method that calls getMonth with the current date
 * @returns The current month formatted as YYYY-MM
 */
export const getCurrentMonth = (): string => getMonth(new Date());

/**
 * Formats a date object into a string representing the year in YYYY format
 * @param date - The date object to format
 * @returns The formatted year string
 */
export const getYear = (date: Date): string =>
   new Intl.DateTimeFormat('en-CA', {
      timeZone: NHL_TIMEZONE,
      year: 'numeric',
   }).format(date);
/**
 * Returns the current year formatted as YYYY
 * This is a convenience method that calls getYear with the current date
 * @returns The current year formatted as YYYY
 */
export const getCurrentYear = (): string => getYear(new Date());
/**
 * Returns the season associated with the specified date in the format yyyyYYYY (e.g., 20232024)
 * @param date - The date object to parse the season from
 * @returns The current season formatted as yyyyYYYY\
 * @throws Error if the provided date is invalid
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
      console.log(month, parseInt(month, 10) < 7);
      return `${parseInt(year, 10) - 1}${year}`;
   }
   return `${year}${parseInt(year, 10) + 1}`;
};
/**
 * Returns the current season in the format yyyyYYYY (e.g., 20232024)
 * This is a convenience method that calls getSeason with the current date
 * @returns The current season formatted as yyyyYYYY
 */
export const getCurrentSeason = (): string => getSeason(new Date());

export const NHL_START_DATE = new Date('1917-12-01');
export const NHL_END_DATE = new Date(
   `${getCurrentSeason().slice(4, 8)}-06-30`,
);

import { describe, expect, test } from 'bun:test';
import {
   getCurrentDate,
   getCurrentSeason,
   getCurrentYear,
   getDate,
   getSeason,
   getYear,
} from '#/utils/date.ts';

describe('Date Utilities', () => {
   test('getDate formats date correctly', () => {
      const date = new Date('2024-10-01T12:00:00Z');
      expect(getDate(date)).toBe('2024-10-01');
   });

   test("getCurrentDate returns today's date in YYYY-MM-DD format", () => {
      const today = new Date();
      const formattedToday = getDate(today);
      expect(getCurrentDate()).toBe(formattedToday);
   });

   test('getYear formats year correctly', () => {
      const date = new Date('2024-10-01T12:00:00Z');
      expect(getYear(date)).toBe('2024');
   });

   test('getCurrentYear returns the current year in YYYY format', () => {
      const currentYear = new Date().getFullYear().toString();
      expect(getCurrentYear()).toBe(currentYear);
   });

   test('getSeason returns correct season for given date', () => {
      expect(getSeason(new Date('2024-06-15'))).toBe('20232024'); // Before July
      expect(getSeason(new Date('2024-10-01'))).toBe('20242025'); // After July
   });

   test('getCurrentSeason returns the current season in yyyyYYYY format', () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const expectedSeason =
         currentDate.getMonth() < 6
            ? `${currentYear - 1}${currentYear}`
            : `${currentYear}${currentYear + 1}`;
      expect(getCurrentSeason()).toBe(expectedSeason);
   });
});

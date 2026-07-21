import { describe, expect, test } from 'bun:test';
import {
   getCurrentNHLDate,
   getCurrentNHLMonth,
   getCurrentSeason,
   getNHLDate,
   getNHLMonth,
   getSeason,
   getYear,
} from '#/utils/date.ts';

describe('Date Utilities', () => {
   test('getNHLDate formats a date correctly', () => {
      const date = new Date('2024-10-01T12:00:00Z');
      expect(getNHLDate(date)).toBe('2024-10-01');
   });

   test('getNHLDate uses Eastern Time around the winter UTC boundary', () => {
      expect(getNHLDate(new Date('2024-01-02T04:59:59Z'))).toBe(
         '2024-01-01',
      );
      expect(getNHLDate(new Date('2024-01-02T05:00:00Z'))).toBe(
         '2024-01-02',
      );
   });

   test('getNHLDate uses Eastern Time around the summer UTC boundary', () => {
      expect(getNHLDate(new Date('2024-07-02T03:59:59Z'))).toBe(
         '2024-07-01',
      );
      expect(getNHLDate(new Date('2024-07-02T04:00:00Z'))).toBe(
         '2024-07-02',
      );
   });

   test("getCurrentNHLDate returns today's date in YYYY-MM-DD format", () => {
      const today = new Date();
      const formattedToday = getNHLDate(today);
      expect(getCurrentNHLDate()).toBe(formattedToday);
   });

   test('getYear formats year correctly', () => {
      const date = new Date('2024-10-01T12:00:00Z');
      expect(getYear(date)).toBe('2024');
   });

   test('getNHLMonth formats a month in Eastern Time', () => {
      expect(getNHLMonth(new Date('2024-02-01T04:59:59Z'))).toBe('2024-01');
      expect(getNHLMonth(new Date('2024-02-01T05:00:00Z'))).toBe('2024-02');
   });

   test('getCurrentNHLMonth returns the current month in YYYY-MM format', () => {
      expect(getCurrentNHLMonth()).toBe(getNHLMonth(new Date()));
   });

   test('getSeason returns correct season for given date', () => {
      expect(getSeason(new Date('2024-06-15T12:00:00Z'))).toBe('20232024');
      expect(getSeason(new Date('2024-10-01T12:00:00Z'))).toBe('20242025');
   });

   test('getSeason changes at July 1 in Eastern Time', () => {
      expect(getSeason(new Date('2024-07-01T03:59:59Z'))).toBe('20232024');
      expect(getSeason(new Date('2024-07-01T04:00:00Z'))).toBe('20242025');
   });

   test('getSeason follows daylight saving time when determining the season', () => {
      expect(getSeason(new Date('2024-03-10T06:59:59Z'))).toBe('20232024');
      expect(getSeason(new Date('2024-03-10T07:00:00Z'))).toBe('20232024');
      expect(getSeason(new Date('2024-11-03T05:59:59Z'))).toBe('20242025');
      expect(getSeason(new Date('2024-11-03T06:00:00Z'))).toBe('20242025');
   });

   test('getCurrentSeason uses the same timezone-aware calculation as getSeason', () => {
      expect(getCurrentSeason()).toBe(getSeason(new Date()));
   });

   test('date helpers reject invalid dates', () => {
      const invalidDate = new Date(Number.NaN);

      expect(() => getNHLDate(invalidDate)).toThrow(RangeError);
      expect(() => getNHLMonth(invalidDate)).toThrow(RangeError);
      expect(() => getYear(invalidDate)).toThrow(RangeError);
      expect(() => getSeason(invalidDate)).toThrow(RangeError);
   });
});

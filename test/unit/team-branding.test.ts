import { describe, expect, test } from 'bun:test';
import {
   getTeamBranding,
   getTeamLogoUrl,
   HISTORICAL_TEAM_COLORS,
   TEAM_BRANDING,
} from '#/utils/team-branding.ts';

describe('Team Branding', () => {
   test('contains branding for all active teams', () => {
      expect(Object.keys(TEAM_BRANDING)).toHaveLength(32);
      expect(TEAM_BRANDING.TOR.primaryColor).toBe('#00205B');
      expect(TEAM_BRANDING.UTA.name).toBe('Utah Mammoth');
   });

   test('normalizes alternate team abbreviations before lookup', () => {
      expect(getTeamBranding('tb')?.name).toBe('Tampa Bay Lightning');
      expect(getTeamBranding('utah')?.name).toBe('Utah Mammoth');
   });

   test('builds official light, dark, and secondary logo URLs', () => {
      expect(getTeamLogoUrl('TOR')).toBe(
         'https://assets.nhle.com/logos/nhl/svg/TOR_light.svg',
      );
      expect(
         getTeamLogoUrl('WSH', { theme: 'dark', secondary: true }),
      ).toBe(
         'https://assets.nhle.com/logos/nhl/svg/WSH_secondary_dark.svg',
      );
   });

   test('rejects unknown active team abbreviations for logo URLs', () => {
      expect(() => getTeamLogoUrl('XYZ')).toThrow(RangeError);
   });

   test('exposes historical palettes from the research dataset', () => {
      expect(HISTORICAL_TEAM_COLORS.BUF.period).toBe('2006-2020');
      expect(HISTORICAL_TEAM_COLORS.BUF.colors.navyBlue).toBe('#002654');
   });
});

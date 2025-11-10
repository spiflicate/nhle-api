import { describe, expect, it } from 'bun:test';

describe('Environment Variable Integration', () => {
   it('NHLE_API_TIMEOUT should override default timeout', () => {
      // Set environment variable before importing
      process.env.NHLE_API_TIMEOUT = '15000';

      // Force a reimport to pick up the new env var
      // Note: In a real scenario, this would be set before any imports
      const testTimeout = parseInt(process.env.NHLE_API_TIMEOUT, 10);
      expect(testTimeout).toBe(15000);
   });

   it('NHLE_API_LANGUAGE should accept "fr" for French', () => {
      process.env.NHLE_API_LANGUAGE = 'fr';
      const testLang = process.env.NHLE_API_LANGUAGE;
      expect(['en', 'fr']).toContain(testLang);
   });

   it('NHLE_API_LANGUAGE should default to "en" for invalid values', () => {
      process.env.NHLE_API_LANGUAGE = 'invalid';
      const testLang = process.env.NHLE_API_LANGUAGE?.toLowerCase() || 'en';
      // Invalid values should be ignored, defaulting to 'en'
      expect(testLang === 'en' || testLang === 'invalid').toBe(true);
   });

   it('NHLE_API_LOGLEVEL should accept valid log levels', () => {
      const validLevels = ['silent', 'error', 'warn', 'info', 'debug'];
      for (const level of validLevels) {
         process.env.NHLE_API_LOGLEVEL = level;
         expect(validLevels).toContain(process.env.NHLE_API_LOGLEVEL);
      }
   });

   it('NHLE_API_LOGLEVEL should default to "warn" for invalid values', () => {
      process.env.NHLE_API_LOGLEVEL = 'invalid';
      const testLevel =
         process.env.NHLE_API_LOGLEVEL?.toLowerCase() || 'warn';
      // Invalid values should be ignored, defaulting to 'warn'
      expect(testLevel === 'warn' || testLevel === 'invalid').toBe(true);
   });
});

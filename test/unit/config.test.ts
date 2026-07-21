import { describe, expect, it } from 'bun:test';
import { config, logConfig } from '#/config/index.ts';

describe('Code Configuration', () => {
   it('should define the client defaults in code', () => {
      expect(config.timeout).toBe(5000);
      expect(config.language).toBe('en');
      expect(config.logLevel).toBe('warn');
   });

   it('should log config without crashing', () => {
      expect(() => {
         logConfig();
      }).not.toThrow();
   });
});

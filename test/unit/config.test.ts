import { afterEach, describe, expect, it } from 'bun:test';
import { config, logConfig } from '#/config/index.ts';
import { logger } from '#/logging/index.ts';

describe('Code Configuration', () => {
   const originalLogMethods = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
   };

   afterEach(() => {
      config.logLevel = 'warn';
      console.error = originalLogMethods.error;
      console.warn = originalLogMethods.warn;
      console.info = originalLogMethods.info;
      console.debug = originalLogMethods.debug;
   });

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

   it('should suppress all messages at silent level', () => {
      const calls: unknown[][] = [];
      config.logLevel = 'silent';
      console.error = (...args: unknown[]) => calls.push(args);
      console.warn = (...args: unknown[]) => calls.push(args);
      console.info = (...args: unknown[]) => calls.push(args);
      console.debug = (...args: unknown[]) => calls.push(args);

      logger.error('error');
      logger.warn('warning');
      logger.info('information');
      logger.debug('debug');

      expect(calls).toHaveLength(0);
   });

   it('should route enabled messages to their console methods', () => {
      const calls: string[] = [];
      config.logLevel = 'info';
      console.error = () => calls.push('error');
      console.warn = () => calls.push('warn');
      console.info = () => calls.push('info');
      console.debug = () => calls.push('debug');

      logger.error('error');
      logger.warn('warning');
      logger.info('information');
      logger.debug('debug');

      expect(calls).toEqual(['error', 'warn', 'info']);
   });
});

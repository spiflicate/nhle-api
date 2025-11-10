/**
 * Environment Variable Configuration
 * Simple configuration system for NHL API client based on environment variables
 *
 * Supported environment variables:
 * - NHLE_API_TIMEOUT: Request timeout in milliseconds (default: 5000)
 * - NHLE_API_LANGUAGE: Language code 'en' or 'fr' (default: 'en')
 * - NHLE_API_LOGLEVEL: Logging level 'silent', 'error', 'warn', 'info', 'debug' (default: 'warn')
 *
 * @example
 * // In .env or shell
 * NHLE_API_TIMEOUT=10000
 * NHLE_API_LANGUAGE=fr
 * NHLE_API_LOGLEVEL=debug
 *
 * @module config/env
 */

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

/**
 * Parse timeout from environment variable
 * @internal
 */
function parseTimeout(): number {
   const timeout = process.env.NHLE_API_TIMEOUT;
   if (!timeout) return 5000;

   const parsed = parseInt(timeout, 10);
   if (Number.isNaN(parsed) || parsed <= 0) {
      console.warn(
         `Invalid NHLE_API_TIMEOUT: "${timeout}". Using default 5000ms`,
      );
      return 5000;
   }
   return parsed;
}

/**
 * Parse language from environment variable
 * @internal
 */
function parseLanguage(): 'en' | 'fr' {
   const language = process.env.NHLE_API_LANGUAGE?.toLowerCase();
   if (language === 'fr') return 'fr';
   if (language && language !== 'en') {
      console.warn(
         `Invalid NHLE_API_LANGUAGE: "${language}". Using default 'en'`,
      );
   }
   return 'en';
}

/**
 * Parse log level from environment variable
 * @internal
 */
function parseLogLevel(): LogLevel {
   const logLevel = process.env.NHLE_API_LOGLEVEL?.toLowerCase();
   const validLevels: LogLevel[] = [
      'silent',
      'error',
      'warn',
      'info',
      'debug',
   ];

   if (!logLevel) return 'warn';
   if (validLevels.includes(logLevel as LogLevel)) {
      return logLevel as LogLevel;
   }

   console.warn(
      `Invalid NHLE_API_LOGLEVEL: "${logLevel}". Valid options: ${validLevels.join(', ')}. Using default 'warn'`,
   );
   return 'warn';
}

/**
 * Environment-based configuration for NHL API client
 * Reads from process.env at initialization time
 */
export const envConfig = {
   /**
    * Request timeout in milliseconds
    * Set via NHLE_API_TIMEOUT environment variable
    * @default 5000
    */
   timeout: parseTimeout(),

   /**
    * Language code for API responses
    * Set via NHLE_API_LANGUAGE environment variable
    * @default 'en'
    */
   language: parseLanguage() as 'en' | 'fr',

   /**
    * Logging level for the client
    * Set via NHLE_API_LOGLEVEL environment variable
    * @default 'warn'
    */
   logLevel: parseLogLevel(),
};

/**
 * Log current environment configuration (useful for debugging)
 * Only logs if environment variables are explicitly set
 */
export function logEnvConfig(): void {
   const vars = {
      timeout: process.env.NHLE_API_TIMEOUT,
      language: process.env.NHLE_API_LANGUAGE,
      logLevel: process.env.NHLE_API_LOGLEVEL,
   };

   const configured = Object.entries(vars).filter(
      ([, v]) => v !== undefined,
   );
   if (configured.length > 0) {
      console.debug('NHL API Environment Configuration:', {
         ...Object.fromEntries(configured),
         resolvedTimeout: envConfig.timeout,
         resolvedLanguage: envConfig.language,
         resolvedLogLevel: envConfig.logLevel,
      });
   }
}

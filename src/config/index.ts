/**
 * Code-defined configuration for the NHL API client.
 *
 * Change these values in source when the application needs different
 * defaults.
 */

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

export interface NHLConfig {
   /** Request timeout in milliseconds. */
   timeout: number;
   /** Language code for localized API responses. */
   language: 'en' | 'fr';
   /** Logging level for the client. */
   logLevel: LogLevel;
}

/** Default configuration used by the shared NHL API clients. */
export const config: NHLConfig = {
   timeout: 5000,
   language: 'en',
   logLevel: 'warn',
};

/** Log the active code-defined configuration. */
export function logConfig(): void {
   console.debug('NHL API Configuration:', config);
}

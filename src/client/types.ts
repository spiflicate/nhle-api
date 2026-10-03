/**
 * NHL API Client Type Definitions
 */

import type { NHLError } from '#/errors/index.ts';
/**
 * Configuration options for the NHL API client
 */
export interface NHLClientConfig {
   /**
    * Base URL for the NHL API
    * @default 'https://api-web.nhle.com/v1'
    */
   baseUrl?: string;

   /**
    * Request timeout in milliseconds
    * @default 5000 (5 seconds)
    */
   timeout?: number;

   /**
    * Additional headers to include with every request
    */
   headers?: Record<string, string>;

   /**
    * Language code for localized responses
    * @default 'en' (English)
    */
   language?: 'en' | 'fr';
}

export type APIResult<T> =
   | { success: true; data: T }
   | { success: false; error: NHLError };

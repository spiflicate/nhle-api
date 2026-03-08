/**
 * NHL API Client Type Definitions
 */

import type { NHLError } from '#/errors/index.ts';

export type RetryOn = 'network' | 'timeout' | 'rate-limit' | 'server';

export interface RetryConfig {
   /**
    * Enable retry handling for transient failures.
    * @default false
    */
   enabled?: boolean;

   /**
    * Total request attempts, including the initial try.
    * @default 3
    */
   maxAttempts?: number;

   /**
    * Base delay for exponential backoff in milliseconds.
    * @default 250
    */
   baseDelayMs?: number;

   /**
    * Maximum retry delay in milliseconds.
    * @default 2000
    */
   maxDelayMs?: number;

   /**
    * Transient failure categories that should trigger retries.
    * @default ['network', 'timeout', 'rate-limit', 'server']
    */
   retryOn?: RetryOn[];

   /**
    * Respect Retry-After headers for 429 responses when present.
    * @default true
   */
   respectRetryAfter?: boolean;
}

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

export type APIResponse<T> =
   | { success: true; data: T }
   | { success: false; error: NHLError };

/**
 * NHL API error response structure
 * @deprecated Use NHLError class instead
 */
export interface NHLApiError {
   error: string;
   status: number;
   statusText: string;
   headers: Record<string, string>;
}

/**
 * NHL API client interface
 */
export interface NHLClient {
   /**
    * Send a GET request to the NHL API
    * @param endpoint - API endpoint path (will be appended to baseUrl)
    * @param params - Optional query parameters
    */
   get: <T = unknown>(
      endpoint: string,
      params?: Record<string, unknown>,
   ) => Promise<T>;
}

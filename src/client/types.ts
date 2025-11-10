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

/**
 * Predefined API endpoints for different NHL services
 */
export type APIEndpoint = 'edge-adv' | 'edge-stats' | 'default';

/**
 * Mapping of API endpoints to their base URLs
 */
export const API_BASE_URLS: Record<APIEndpoint, string> = {
   'edge-adv': 'https://api-web.nhle.com/v1',
   'edge-stats': 'https://api.nhle.com/stats/rest',
   default: 'https://api-web.nhle.com/v1',
};

export interface NHLApiResponse<T> {
   data: T;
   status: number;
   statusText: string;
   headers: Record<string, string>;
}

export type APIResponse<T> =
   | { status: 'success'; data: T }
   | { status: 'error'; error: NHLError };

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

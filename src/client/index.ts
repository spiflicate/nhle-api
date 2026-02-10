/**
 * NHL API Client implementation
 * Internal client for making API requests to the NHL API
 */

import { envConfig } from '#/config/env.ts';
import {
   ErrorCategory,
   type ErrorConfig,
   ErrorHandler,
   NHLError,
} from '#/errors/index.ts';
import type { APIEndpoint, APIResponse, NHLClientConfig } from './types.ts';
import { API_BASE_URLS } from './types.ts';

/**
 * Extended configuration for the NHL API client including error handling
 */
export interface NHLClientWithErrorConfig extends NHLClientConfig {
   /**
    * Error handling configuration
    */
   errorConfig?: ErrorConfig;
}

/**
 * Default configuration for the NHL API client
 * Uses environment variables if set, otherwise falls back to sensible defaults
 */
const DEFAULT_CONFIG: Required<NHLClientConfig> = {
   baseUrl: 'https://api-web.nhle.com/v1',
   timeout: envConfig.timeout,
   headers: {
      Accept: 'application/json',
   },
   language: envConfig.language,
};

/**
 * NHL API Client class for making API requests to the NHL API
 * Provides methods for sending GET requests to the NHL API with automatic
 * URL construction, query parameter handling, timeout management, and
 * comprehensive error handling using the ErrorHandler utility.
 */
export class NHLClient {
   private config: Required<NHLClientConfig>;
   private errorHandler: ErrorHandler;

   /**
    * Creates a new NHL API client instance
    * @param baseURL - Optional custom base URL or predefined API endpoint key
    * @param errorConfig - Optional error handling configuration
    */
   constructor(baseURL?: string | APIEndpoint, errorConfig?: ErrorConfig) {
      this.config = { ...DEFAULT_CONFIG };

      // Check if baseURL is a predefined endpoint key
      if (baseURL && baseURL in API_BASE_URLS) {
         this.config.baseUrl = API_BASE_URLS[baseURL as APIEndpoint];
      } else if (baseURL) {
         this.config.baseUrl = baseURL;
      }

      // Initialize error handler with provided config
      this.errorHandler = new ErrorHandler(errorConfig);
   }

   /**
    * Helper to build URL with query parameters
    * @private
    */
   private buildUrl(
      endpoint: string,
      params?: Record<string, unknown>,
   ): string {
      // Ensure endpoint doesn't have leading slash for URL construction
      const cleanEndpoint = endpoint.startsWith('/')
         ? endpoint.slice(1)
         : endpoint;
      const url = new URL(cleanEndpoint, `${this.config.baseUrl}/`);
      if (params) {
         Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
               url.searchParams.append(key, String(value));
            }
         });
      }
      return url.toString();
   }

   /**
    * Send a GET request to the NHL API
    * @param endpoint - API endpoint path
    * @param params - Optional query parameters
    * @returns Promise resolving to an APIResponse containing either data or error
    */
   async get<T = unknown>(
      endpoint: string,
      params?: Record<string, unknown>,
   ): Promise<APIResponse<T>> {
      const url = this.buildUrl(endpoint, params);
      const controller = new AbortController();
      const timeoutId = setTimeout(
         () => controller.abort(),
         this.config.timeout,
      );

      try {
         const response = await fetch(url, {
            method: 'GET',
            headers: {
               ...this.config.headers,
               'Accept-Language': this.config.language,
            },
            signal: controller.signal,
         });

         clearTimeout(timeoutId);

         if (!response.ok) {
            const error = await this.errorHandler.fromResponse(response, {
               endpoint: url,
            });
            this.errorHandler.log(error);
            return { success: false, error };
         }

         return { data: (await response.json()) as T, success: true };
      } catch (error) {
         clearTimeout(timeoutId);

         // If it's already an NHLError, return it
         if (error instanceof NHLError) {
            this.errorHandler.log(error);
            return { success: false, error };
         }

         // Handle AbortError (timeout)
         let nhlError: NHLError;
         if (error instanceof Error && error.name === 'AbortError') {
            nhlError = new NHLError(
               'Request timeout',
               ErrorCategory.CLIENT,
               {
                  endpoint,
               },
            );
         } else {
            // Convert other errors using ErrorHandler
            nhlError = this.errorHandler.fromError(error, {
               endpoint,
               method: 'GET',
            });
         }

         this.errorHandler.log(nhlError);
         return { success: false, error: nhlError };
      }
   }

   /**
    * Configure error handling behavior
    * @param config - Error configuration options
    */
   configureErrorHandling(config: Partial<ErrorConfig>): void {
      this.errorHandler.configure(config);
   }
}

/**
 * Factory function for backward compatibility
 * Creates a new NHL API client instance
 *
 * @param baseURL - Optional custom base URL or predefined API endpoint key
 * @param errorConfig - Optional error handling configuration
 * @returns A new NHL API client instance
 */
export function createNHLClient(
   baseURL?: string | APIEndpoint,
   errorConfig?: ErrorConfig,
): NHLClient {
   return new NHLClient(baseURL, errorConfig);
}

/**
 * Default client instance for edge-adv API endpoints
 */
const nhlClient = createNHLClient('default');

/**
 * Client instance for edge-stats API endpoints
 */
const edgeStatsClient = createNHLClient('edge-stats');

export { nhlClient, edgeStatsClient };

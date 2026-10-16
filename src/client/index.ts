/**
 * NHL API Client implementation
 * Internal client for making API requests to the NHL API
 */

import { config } from '#/config/index.ts';
import {
   ErrorCategory,
   type ErrorConfig,
   ErrorHandler,
   NHLError,
} from '#/errors/index.ts';
import type { APIResult, NHLClientConfig } from './types.ts';

/**
 * Extended configuration for the NHL API client including error handling
 */
export interface NHLClientWithErrorConfig extends NHLClientConfig {
   /**
    * Error handling configuration
    */
   errorConfig?: ErrorConfig;
}

/** Base URLs of the NHL APIs the library calls. */
export const BASE_URLS = {
   gamecenter: 'https://api-web.nhle.com/v1',
   gamecenterV2: 'https://api-web.nhle.com/v2',
   edgeStats: 'https://api.nhle.com/stats/rest',
} as const;

const DEFAULT_HEADERS: Record<string, string> = {
   Accept: 'application/json',
};

/**
 * NHL API Client class for making API requests to the NHL API
 * Provides methods for sending GET requests to the NHL API with automatic
 * URL construction, query parameter handling, timeout management, and
 * comprehensive error handling using the ErrorHandler utility.
 */
export class NHLClient {
   private options: NHLClientConfig;
   private errorHandler: ErrorHandler;

   /**
    * Creates a new NHL API client instance
    *
    * Options left unset (timeout, language) follow the shared `config`
    * object at request time, so changing `config` after import still
    * applies to this client.
    *
    * @param baseURLOrOptions - Base URL, or client options
    * @param errorConfig - Optional error handling configuration
    *
    * @example
    * const client = new NHLClient('https://api-web.nhle.com/v1');
    * const slow = new NHLClient({ timeout: 15000, language: 'fr' });
    */
   constructor(
      baseURLOrOptions?: string | NHLClientWithErrorConfig,
      errorConfig?: ErrorConfig,
   ) {
      const options =
         typeof baseURLOrOptions === 'string'
            ? { baseUrl: baseURLOrOptions }
            : (baseURLOrOptions ?? {});
      const { errorConfig: optionsErrorConfig, ...clientOptions } = options;
      this.options = clientOptions;

      // Initialize error handler with provided config
      this.errorHandler = new ErrorHandler(
         errorConfig ?? optionsErrorConfig,
      );
   }

   /** Base URL, timeout, headers and language in effect for the next request. */
   private get config(): Required<NHLClientConfig> {
      return {
         baseUrl: this.options.baseUrl ?? BASE_URLS.gamecenter,
         timeout: this.options.timeout ?? config.timeout,
         headers: { ...DEFAULT_HEADERS, ...this.options.headers },
         language: this.options.language ?? config.language,
      };
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
   ): Promise<APIResult<T>> {
      const { timeout, headers, language } = this.config;
      const url = this.buildUrl(endpoint, params);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
         const response = await fetch(url, {
            method: 'GET',
            headers: {
               ...headers,
               'Accept-Language': language,
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
   baseURLOrOptions?: string | NHLClientWithErrorConfig,
   errorConfig?: ErrorConfig,
): NHLClient {
   return new NHLClient(baseURLOrOptions, errorConfig);
}

/**
 * Default client instance for gamecenter and edge-adv APIs
 */
const nhlClient = createNHLClient(BASE_URLS.gamecenter);

/**
 * Client instance for edge-stats APIs
 */
const edgeStatsClient = createNHLClient(BASE_URLS.edgeStats);

export { edgeStatsClient, nhlClient };

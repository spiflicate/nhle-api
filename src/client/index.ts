/**
 * NHL API Client implementation
 * Internal client for making API requests to the NHL API
 */

import { envConfig } from '#/config/env.ts';
import {
   ErrorCategory,
   type ErrorConfig,
   ErrorHandler,
   LogLevel,
   NetworkError,
   NHLError,
} from '#/errors/index.ts';
import type {
   APIResponse,
   NHLClientConfig,
   RetryConfig,
   RetryOn,
} from './types.ts';

/**
 * Extended configuration for the NHL API client including error handling
 */
export interface NHLClientWithErrorConfig extends NHLClientConfig {
   /**
    * Error handling configuration
    */
   errorConfig?: ErrorConfig;

   /**
    * Retry handling configuration
    */
   retryConfig?: RetryConfig;
}

const BASE_URLS = {
   gamecenter: 'https://api-web.nhle.com/v1',
   edgeStats: 'https://api.nhle.com/stats/rest',
};

/**
 * Default configuration for the NHL API client
 * Uses environment variables if set, otherwise falls back to sensible defaults
 */
const DEFAULT_CONFIG: Required<NHLClientConfig> = {
   baseUrl: BASE_URLS.gamecenter,
   timeout: envConfig.timeout,
   headers: {
      Accept: 'application/json',
   },
   language: envConfig.language,
};

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
   enabled: false,
   maxAttempts: 3,
   baseDelayMs: 250,
   maxDelayMs: 2000,
   retryOn: ['network', 'timeout', 'rate-limit', 'server'],
   respectRetryAfter: true,
};

const MAX_RETRY_EXPONENT = 10;

/**
 * NHL API Client class for making API requests to the NHL API
 * Provides methods for sending GET requests to the NHL API with automatic
 * URL construction, query parameter handling, timeout management, and
 * comprehensive error handling using the ErrorHandler utility.
 */
export class NHLClient {
   private config: Required<NHLClientConfig>;
   private errorHandler: ErrorHandler;
   private retryConfig: Required<RetryConfig>;

   /**
    * Creates a new NHL API client instance
    * @param baseURL - Optional custom base URL or predefined API endpoint key
    * @param errorConfig - Optional error handling configuration
    * @param retryConfig - Optional retry configuration for transient failures
    */
   constructor(
      baseURL?: string,
      errorConfig?: ErrorConfig,
      retryConfig?: RetryConfig,
   ) {
      this.config = { ...DEFAULT_CONFIG };
      if (baseURL) this.config.baseUrl = baseURL;

      // Initialize error handler with provided config
      this.errorHandler = new ErrorHandler(errorConfig);
      this.retryConfig = this.mergeRetryConfig(
         DEFAULT_RETRY_CONFIG,
         retryConfig,
      );
   }

   private mergeRetryConfig(
      currentConfig: Required<RetryConfig>,
      nextConfig?: Partial<RetryConfig>,
   ): Required<RetryConfig> {
      const retryOn = nextConfig?.retryOn ?? currentConfig.retryOn;
      const baseDelayMs = Math.max(
         0,
         nextConfig?.baseDelayMs ?? currentConfig.baseDelayMs,
      );
      const maxDelayMs = Math.max(
         baseDelayMs,
         nextConfig?.maxDelayMs ?? currentConfig.maxDelayMs,
      );

      return {
         enabled: nextConfig?.enabled ?? currentConfig.enabled,
         maxAttempts: Math.max(
            1,
            nextConfig?.maxAttempts ?? currentConfig.maxAttempts,
         ),
         baseDelayMs,
         maxDelayMs,
         retryOn: [...retryOn],
         respectRetryAfter:
            nextConfig?.respectRetryAfter ??
            currentConfig.respectRetryAfter,
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

   private async fetchWithTimeout(url: string): Promise<Response> {
      const controller = new AbortController();
      const timeoutId = setTimeout(
         () => controller.abort(),
         this.config.timeout,
      );

      try {
         return await fetch(url, {
            method: 'GET',
            headers: {
               ...this.config.headers,
               'Accept-Language': this.config.language,
            },
            signal: controller.signal,
         });
      } finally {
         clearTimeout(timeoutId);
      }
   }

   private shouldRetryResponse(response: Response): boolean {
      return (
         (response.status === 429 &&
            this.retryConfig.retryOn.includes('rate-limit')) ||
         (response.status >= 500 &&
            this.retryConfig.retryOn.includes('server'))
      );
   }

   private shouldRetryError(error: unknown): boolean {
      if (error instanceof NHLError) {
         return this.shouldRetryCategory(error.category);
      }

      if (error instanceof Error && error.name === 'AbortError') {
         return this.retryConfig.retryOn.includes('timeout');
      }

      if (error instanceof Error) {
         return (
            (error.name === 'TypeError' || error.name === 'NetworkError') &&
            this.retryConfig.retryOn.includes('network')
         );
      }

      return false;
   }

   private shouldRetryCategory(category: ErrorCategory): boolean {
      switch (category) {
         case ErrorCategory.NETWORK:
            return this.retryConfig.retryOn.includes('network');
         case ErrorCategory.RATE_LIMIT:
            return this.retryConfig.retryOn.includes('rate-limit');
         case ErrorCategory.SERVER:
            return this.retryConfig.retryOn.includes('server');
         default:
            return false;
      }
   }

   private parseRetryAfterMs(
      retryAfter?: string | null,
   ): number | undefined {
      if (!retryAfter) {
         return undefined;
      }

      const delaySeconds = Number(retryAfter);
      if (Number.isFinite(delaySeconds) && delaySeconds >= 0) {
         return delaySeconds * 1000;
      }

      const retryAt = Date.parse(retryAfter);
      if (Number.isNaN(retryAt)) {
         return undefined;
      }

      return Math.max(0, retryAt - Date.now());
   }

   private computeRetryDelayMs(
      attempt: number,
      response?: Response,
   ): number {
      const retryExponent = Math.min(
         MAX_RETRY_EXPONENT,
         Math.max(0, attempt - 1),
      );
      const exponentialDelay = Math.min(
         this.retryConfig.maxDelayMs,
         this.retryConfig.baseDelayMs * 2 ** retryExponent,
      );

      if (
         response?.status === 429 &&
         this.retryConfig.respectRetryAfter &&
         this.retryConfig.retryOn.includes('rate-limit')
      ) {
         const retryAfterDelay = this.parseRetryAfterMs(
            response.headers.get('Retry-After'),
         );

         if (retryAfterDelay !== undefined) {
            return Math.min(this.retryConfig.maxDelayMs, retryAfterDelay);
         }
      }

      return exponentialDelay;
   }

   private getRetryReason(
      error?: unknown,
      response?: Response,
   ): RetryOn {
      if (response) {
         return response.status === 429 ? 'rate-limit' : 'server';
      }

      return error instanceof Error && error.name === 'AbortError'
         ? 'timeout'
         : 'network';
   }

   private async sleep(delayMs: number): Promise<void> {
      if (delayMs <= 0) {
         return;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
   }

   private createResponseError(
      response: Response,
      endpoint: string,
   ): Promise<NHLError> {
      return this.errorHandler.fromResponse(response, {
         endpoint,
      });
   }

   private async drainRetryableResponse(response: Response): Promise<void> {
      try {
         await response.body?.cancel();
      } catch {
         // Ignore drain failures and allow retry handling to continue.
      }
   }

   private createRequestError(endpoint: string, error: unknown): NHLError {
      if (error instanceof NHLError) {
         return error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
         return new NetworkError('Request timeout', {
            cause: error,
            endpoint,
            method: 'GET',
         });
      }

      return this.errorHandler.fromError(error, {
         endpoint,
         method: 'GET',
      });
   }

   private logRetryAttempt(
      endpoint: string,
      attempt: number,
      delayMs: number,
      retryOn: RetryOn,
      statusCode?: number,
   ): void {
      const context = {
         endpoint,
         method: 'GET',
         metadata: {
            delayMs,
            retryOn,
         },
         ...(statusCode !== undefined ? { statusCode } : {}),
      };

      this.errorHandler.logMessage(
         LogLevel.DEBUG,
         `Retrying GET request (attempt ${attempt}/${this.retryConfig.maxAttempts})`,
         context,
      );
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
      const maxAttempts = this.retryConfig.enabled
         ? this.retryConfig.maxAttempts
         : 1;
      let finalError: NHLError | undefined;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
         try {
            const response = await this.fetchWithTimeout(url);

            if (!response.ok) {
               if (
                  attempt < maxAttempts &&
                  this.shouldRetryResponse(response)
               ) {
                  const retryOn = this.getRetryReason(undefined, response);
                  const delayMs = this.computeRetryDelayMs(
                     attempt,
                     response,
                  );
                  await this.drainRetryableResponse(response);
                  this.logRetryAttempt(
                     url,
                     attempt + 1,
                     delayMs,
                     retryOn,
                     response.status,
                  );
                  await this.sleep(delayMs);
                  continue;
               }

               const error = await this.createResponseError(response, url);
               finalError = error;
               break;
            }

            return { data: (await response.json()) as T, success: true };
         } catch (error) {
            const nhlError = this.createRequestError(url, error);

            if (attempt < maxAttempts && this.shouldRetryError(error)) {
               const retryOn = this.getRetryReason(error);
               const delayMs = this.computeRetryDelayMs(attempt);
               this.logRetryAttempt(url, attempt + 1, delayMs, retryOn);
               await this.sleep(delayMs);
               continue;
            }

            finalError = nhlError;
            break;
         }
      }

      const error =
         finalError ||
         new NetworkError('Unexpected retry loop termination', {
            endpoint: url,
            method: 'GET',
         });

      this.errorHandler.log(error);
      return { success: false, error };
   }

   /**
    * Configure error handling behavior
    * @param config - Error configuration options
    */
   configureErrorHandling(config: Partial<ErrorConfig>): void {
      this.errorHandler.configure(config);
   }

   /**
    * Configure retry behavior
    * @param config - Retry configuration options
    */
   configureRetry(config: Partial<RetryConfig>): void {
      this.retryConfig = this.mergeRetryConfig(this.retryConfig, config);
   }
}

/**
 * Factory function for backward compatibility
 * Creates a new NHL API client instance
 *
 * @param baseURL - Optional custom base URL or predefined API endpoint key
 * @param errorConfig - Optional error handling configuration
 * @param retryConfig - Optional retry configuration for transient failures
 * @returns A new NHL API client instance
 */
export function createNHLClient(
   baseURL?: string,
   errorConfig?: ErrorConfig,
   retryConfig?: RetryConfig,
): NHLClient {
   return new NHLClient(baseURL, errorConfig, retryConfig);
}

/**
 * Default client instance for gamecenter and edge-adv APIs
 */
const nhlClient = createNHLClient(BASE_URLS.gamecenter);

/**
 * Client instance for edge-stats APIs
 */
const edgeStatsClient = createNHLClient(BASE_URLS.edgeStats);

/**
 * Configure retry behavior for the shared gamecenter and edge-stats clients.
 * @param config - Retry configuration options
 */
export function configureSharedClientRetries(
   config: Partial<RetryConfig>,
): void {
   nhlClient.configureRetry(config);
   edgeStatsClient.configureRetry(config);
}

export { nhlClient, edgeStatsClient };

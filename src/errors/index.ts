/**
 * Error handling module for NHL Sports Data API wrapper
 * Provides structured error classification and logging for API interactions
 */

import { config as clientConfig } from '#/config/index.ts';
import { writeLog } from '#/logging/index.ts';

export const ErrorCategory = {
   /** Network-level errors (connection refused, timeout, etc.) */
   NETWORK: 'NETWORK',

   /** HTTP 4xx client errors (invalid params, not found, etc.) */
   CLIENT: 'CLIENT',

   /** HTTP 5xx server errors */
   SERVER: 'SERVER',

   /** Rate limiting (HTTP 429) */
   RATE_LIMIT: 'RATE_LIMIT',

   /** Valid HTTP response but with error payload */
   API_ERROR: 'API_ERROR',

   /** Response parsing/validation failures */
   PARSE: 'PARSE',

   /** Invalid user input or configuration */
   VALIDATION: 'VALIDATION',
} as const;

export type ErrorCategory =
   (typeof ErrorCategory)[keyof typeof ErrorCategory];

export const LogLevel = {
   NONE: 0,
   ERROR: 1,
   WARN: 2,
   INFO: 3,
   DEBUG: 4,
};

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export interface ErrorContext {
   /** HTTP status code if applicable */
   statusCode?: number;

   /** Original error object */
   cause?: unknown;

   /** Request URL or endpoint */
   endpoint?: string;

   /** Request method */
   method?: string;

   /** Request parameters */
   params?: Record<string, unknown>;

   /** Response body if available */
   responseBody?: unknown;

   /** Timestamp of error */
   timestamp?: Date;

   /** Additional metadata */
   metadata?: Record<string, unknown>;
}

export interface ErrorConfig {
   /** Logging level for error output */
   logLevel?: LogLevel;

   /** Custom logger function */
   logger?: (
      level: LogLevel,
      message: string,
      context?: ErrorContext,
   ) => void;

   /** Whether to include stack traces */
   includeStack?: boolean;
}

/**
 * Base error class for all NHL API errors
 */
export class NHLError extends Error {
   public readonly category: ErrorCategory;
   public readonly context: ErrorContext;

   constructor(
      message: string,
      category: ErrorCategory,
      context: ErrorContext = {},
   ) {
      super(message);
      this.name = this.constructor.name;
      this.category = category;
      this.context = {
         ...context,
         timestamp: context.timestamp || new Date(),
      };

      // Maintain proper stack trace
      Error.captureStackTrace?.(this, this.constructor);
   }

   /**
    * Serialize error to JSON
    */
   toJSON() {
      return {
         name: this.name,
         message: this.message,
         category: this.category,
         context: this.context,
         ...(this.stack && { stack: this.stack }),
      };
   }
}

/**
 * Network-level errors (timeouts, connection failures)
 */
export class NetworkError extends NHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.NETWORK, context);
   }
}

/**
 * HTTP 4xx client errors
 */
export class ClientError extends NHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.CLIENT, context);
   }
}

/**
 * HTTP 404 resource not found
 */
export class NotFoundError extends ClientError {
   constructor(
      message: string = 'Resource not found',
      context: ErrorContext = {},
   ) {
      super(message, { ...context, statusCode: context.statusCode || 404 });
   }
}

/**
 * HTTP 5xx server errors
 */
export class ServerError extends NHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.SERVER, context);
   }
}

/**
 * HTTP 429 rate limit errors
 */
export class RateLimitError extends NHLError {
   public readonly retryAfter?: number;

   constructor(
      message: string = 'Rate limit exceeded',
      context: ErrorContext = {},
      retryAfter?: number,
   ) {
      super(message, ErrorCategory.RATE_LIMIT, {
         ...context,
         statusCode: context.statusCode || 429,
      });
      this.retryAfter = retryAfter || 0;
   }
}

/**
 * API returned 200 but with error message in JSON payload
 */
export class APIError extends NHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.API_ERROR, context);
   }
}

/**
 * Response parsing or validation failures
 */
export class ParseError extends NHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.PARSE, context);
   }
}

/**
 * Invalid user input or configuration
 */
export class ValidationError extends NHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.VALIDATION, context);
   }
}

/**
 * Error handler utility class
 */
export class ErrorHandler {
   private config: Required<ErrorConfig>;

   constructor(config: ErrorConfig = {}) {
      this.config = {
         logLevel:
            config.logLevel ?? toErrorLogLevel(clientConfig.logLevel),
         logger: config.logger ?? this.defaultLogger.bind(this),
         includeStack: config.includeStack ?? true,
      };
   }

   /**
    * Default console-based logger
    */
   private defaultLogger(
      level: LogLevel,
      message: string,
      context?: ErrorContext,
   ): void {
      if (level > this.config.logLevel) return;

      writeLog(
         toClientLogLevel(level),
         `[NHL API] ${message}`,
         context,
         toClientThreshold(this.config.logLevel),
      );
   }

   /**
    * Log an error based on configuration
    */
   log(error: NHLError): void {
      const level = this.getLogLevel(error.category);
      const context = this.config.includeStack
         ? { ...error.context, stack: error.stack }
         : error.context;

      this.config.logger(level, error.message, context);
   }

   /**
    * Determine log level based on error category
    */
   private getLogLevel(category: ErrorCategory): LogLevel {
      switch (category) {
         case ErrorCategory.NETWORK:
         case ErrorCategory.SERVER:
            return LogLevel.ERROR;
         case ErrorCategory.RATE_LIMIT:
            return LogLevel.WARN;
         case ErrorCategory.CLIENT:
         case ErrorCategory.API_ERROR:
            return LogLevel.INFO;
         case ErrorCategory.PARSE:
         case ErrorCategory.VALIDATION:
            return LogLevel.DEBUG;
         default:
            return LogLevel.ERROR;
      }
   }

   /**
    * Create error from HTTP response
    */
   async fromResponse(
      response: Response,
      context: Omit<ErrorContext, 'statusCode'> = {},
   ): Promise<NHLError> {
      const statusCode = response.status;
      const baseContext: ErrorContext = {
         ...context,
         statusCode,
         endpoint: context.endpoint || response.url,
      };

      // Try to parse response body
      let responseBody: unknown;
      try {
         const text = await response.text();
         responseBody = text ? JSON.parse(text) : null;
         baseContext.responseBody = responseBody;
      } catch {
         // Response body not parseable as JSON
      }

      // Extract error message from JSON response if available
      const errorMessage =
         responseBody &&
         typeof responseBody === 'object' &&
         'message' in responseBody
            ? String(responseBody.message)
            : `HTTP ${statusCode}: ${response.statusText}`;

      // Classify by status code
      if (statusCode === 429) {
         const retryAfter = response.headers.get('Retry-After');
         return new RateLimitError(
            errorMessage,
            baseContext,
            retryAfter ? parseInt(retryAfter, 10) : undefined,
         );
      }

      if (statusCode === 404) {
         return new NotFoundError(errorMessage, baseContext);
      }

      if (statusCode >= 500) {
         return new ServerError(errorMessage, baseContext);
      }

      if (statusCode >= 400) {
         return new ClientError(errorMessage, baseContext);
      }

      // 200-level response with error in JSON body
      if (
         responseBody &&
         typeof responseBody === 'object' &&
         'message' in responseBody
      ) {
         return new APIError(errorMessage, baseContext);
      }

      // Fallback
      return new NHLError(errorMessage, ErrorCategory.CLIENT, baseContext);
   }

   /**
    * Create error from caught exception
    */
   fromError(error: unknown, context: ErrorContext = {}): NHLError {
      if (error instanceof NHLError) {
         return error;
      }

      if (error instanceof Error) {
         // Network/fetch errors
         if (error.name === 'TypeError' || error.name === 'NetworkError') {
            return new NetworkError(error.message, {
               ...context,
               cause: error,
            });
         }

         // Generic error wrapper
         return new NHLError(error.message, ErrorCategory.NETWORK, {
            ...context,
            cause: error,
         });
      }

      // Unknown error type
      return new NHLError(
         'An unknown error occurred',
         ErrorCategory.NETWORK,
         { ...context, cause: error },
      );
   }

   /**
    * Update configuration
    */
   configure(config: Partial<ErrorConfig>): void {
      this.config = { ...this.config, ...config };
   }
}

function toErrorLogLevel(
   level: 'silent' | 'error' | 'warn' | 'info' | 'debug',
): LogLevel {
   switch (level) {
      case 'silent':
         return LogLevel.NONE;
      case 'error':
         return LogLevel.ERROR;
      case 'warn':
         return LogLevel.WARN;
      case 'info':
         return LogLevel.INFO;
      case 'debug':
         return LogLevel.DEBUG;
   }
}

function toClientLogLevel(
   level: LogLevel,
): Exclude<'silent' | 'error' | 'warn' | 'info' | 'debug', 'silent'> {
   switch (level) {
      case LogLevel.ERROR:
         return 'error' as const;
      case LogLevel.WARN:
         return 'warn' as const;
      case LogLevel.INFO:
         return 'info' as const;
      case LogLevel.DEBUG:
         return 'debug' as const;
      default:
         return 'debug' as const;
   }
}

function toClientThreshold(level: LogLevel) {
   return level === LogLevel.NONE
      ? ('silent' as const)
      : toClientLogLevel(level);
}

/**
 * Default error handler instance
 */
export const defaultErrorHandler = new ErrorHandler();

/**
 * Convenience function to create errors from responses
 */
export const fromResponse = (
   response: Response,
   context?: Omit<ErrorContext, 'statusCode'>,
) => defaultErrorHandler.fromResponse(response, context);

/**
 * Convenience function to create errors from exceptions
 */
export const fromError = (error: unknown, context?: ErrorContext) =>
   defaultErrorHandler.fromError(error, context);

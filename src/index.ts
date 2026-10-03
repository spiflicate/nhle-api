/**
 * NHL API Client Library
 * A modern NHL API wrapper written in TypeScript with a functional approach
 *
 * @module nhle-api
 */

// Re-export all public API functions
export * from './api/index.js';
// Re-export the HTTP client and its result type
export {
   BASE_URLS,
   createNHLClient,
   NHLClient,
   type NHLClientWithErrorConfig,
} from './client/index.js';
export type { APIResult, NHLClientConfig } from './client/types.js';
export type { LogLevel, NHLConfig } from './config/index.js';
// Re-export configuration utilities
export { config, logConfig } from './config/index.js';
// Re-export constants
export * from './constants/index.js';
// Re-export error classes so results can be narrowed with instanceof
export {
   APIError,
   ClientError,
   ErrorCategory,
   type ErrorConfig,
   type ErrorContext,
   ErrorHandler,
   LogLevel as ErrorLogLevel,
   NetworkError,
   NHLError,
   NotFoundError,
   ParseError,
   RateLimitError,
   ServerError,
   ValidationError,
} from './errors/index.js';
export { type LogContext, logger, writeLog } from './logging/index.js';
// Re-export types
export * from './types/index.js';
// Cayenne filter builder for the stats namespace
export {
   buildCayenneExp,
   type CayenneCondition,
   type CayenneExpression,
   type CayenneGroup,
   CayenneQueryBuilder,
   createCayenneQuery,
} from './utils/cayenne-query-builder.js';

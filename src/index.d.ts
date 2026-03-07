/**
 * NHL API Client Library
 * A modern NHL API wrapper written in TypeScript with a functional approach
 *
 * @module nhle-api
 */

// Re-export all public API functions
export * from './api/index.ts';
// Re-export shared client retry configuration
export { configureSharedClientRetries } from './client/index.ts';
export type { RetryConfig, RetryOn } from './client/types.ts';
// Re-export constants
export * from './constants/index.ts';
// Re-export types
export * from './types/index.ts';

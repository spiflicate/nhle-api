/**
 * NHL API Client Library
 * A modern NHL API wrapper written in TypeScript with a functional approach
 *
 * @module nhle-api
 */

// Re-export all public API functions
export * from './api/index.js';
export type { LogLevel, NHLConfig } from './config/index.js';
// Re-export configuration utilities
export { config, logConfig } from './config/index.js';
// Re-export constants
export * from './constants/index.js';
export { logger, writeLog } from './logging/index.js';
// Re-export types
export * from './types/index.js';

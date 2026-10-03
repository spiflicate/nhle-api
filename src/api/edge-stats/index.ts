/**
 * ======================================================================
 * NHL Stats API Module Exports
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Complete NHL Stats API implementation with modules for:
 * - Players (skaters, goalies, draft info)
 * - Teams and franchises
 * - Seasons and games
 * - Miscellaneous (config, shifts, glossary, etc.)
 */

export * as goalies from './goalies.ts';
export * as misc from './misc.ts';
export * as season from './season-game.ts';
export * as skaters from './skaters.ts';
export * as teams from './teams.ts';
export * from './types.ts';

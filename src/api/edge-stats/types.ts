/**
 * High-level response types for the NHL Stats API
 *
 * These types are intentionally flexible to support the wide variety of data
 * returned by the API. The key distinction to understand is the difference
 * between default and aggregated responses:
 *
 * **Default Responses** (when `isAggregate` is not set or false):
 * - Include game/team-specific fields (aggregatedColumns)
 * - Examples: teamId, teamFullName, gameId, gameDate, seasonId, etc.
 * - Does NOT include franchise-level fields (franchiseId, franchiseName)
 *
 * **Aggregated Responses** (when `isAggregate=true`):
 * - REMOVES game/team-specific fields (aggregatedColumns)
 *   because they don't apply to aggregated data
 * - ADDS franchise-level fields (individualColumns)
 *   to provide organizational context
 * - Examples: franchiseId, franchiseName, stats (but no gameId, teamId, etc.)
 *
 * Why fields are removed during aggregation:
 * - gameId/gameDate: Cannot be defined when data spans multiple games
 * - teamId/teamFullName: Specific team instances (franchises persist across relocations)
 * - seasonId: May not apply if aggregating across time periods
 *
 * @see BaseQueryParams.isAggregate
 * @see StatsConfig
 */

import type { APIResult } from '#/client/types.ts';

/**
 * Generic paginated data structure
 */
export interface PaginatedData<T> {
   data: T[];
   total: number;
   limit?: number;
   start?: number;
}

export type APIResultPaginated<T> = APIResult<PaginatedData<T>>;

/**
 * Player information structure (skater or goalie)
 *
 * Base type for player data. Extended by SkaterStats and GoalieStats for
 * specific stat categories.
 */
export interface Player {
   playerId: number;
   firstName?: string;
   lastName?: string;
   birthDate?: string;
   nationality?: string;
   [key: string]: unknown;
}

/**
 * Skater statistics response
 *
 * Standard response for skater stats from endpoints like `/skater/summary`.
 * Includes aggregated columns by default. To include franchise data, add
 * `isAggregate=true` query parameter.
 */
export interface SkaterStats extends Player {
   seasonId?: number | string;
   gamesPlayed?: number;
   goals?: number;
   assists?: number;
   points?: number;
   plusMinus?: number;
   [key: string]: unknown;
}

/**
 * Skater leaders response
 */
export interface SkaterLeader extends SkaterStats {
   rank?: number;
}

/**
 * Skater milestones response
 */
export interface SkaterMilestone extends Player {
   milestoneName?: string;
   [key: string]: unknown;
}

/**
 * Goalie statistics response
 *
 * Standard response for goalie stats from endpoints like `/goalie/summary`.
 * Includes aggregated columns by default. To include franchise data, add
 * `isAggregate=true` query parameter.
 */
export interface GoalieStats extends Player {
   seasonId?: number | string;
   gamesPlayed?: number;
   wins?: number;
   losses?: number;
   overtimeLosses?: number;
   shutouts?: number;
   [key: string]: unknown;
}

/**
 * Goalie leaders response
 */
export interface GoalieLeader extends GoalieStats {
   rank?: number;
}

/**
 * Goalie milestones response
 */
export interface GoalieMilestone extends Player {
   milestoneName?: string;
   [key: string]: unknown;
}

/**
 * Team information structure
 *
 * Basic team data. By default, does NOT include franchiseId/franchiseName.
 * To get franchise data, use `isAggregate=true` query parameter.
 *
 * Note: The `franchiseId` property here is optional because it's only
 * included when specifically requested via `isAggregate=true`.
 */
export interface Team {
   id?: number;
   name?: string;
   abbreviation?: string;
   /** Only included when isAggregate=true */
   franchiseId?: number;
   [key: string]: unknown;
}

/**
 * Team statistics response
 *
 * Standard response for team stats from endpoints like `/team/summary`.
 * Includes game/team-specific fields by default (teamId, teamFullName, wins, losses, etc.).
 * Does NOT include franchise fields (franchiseId, franchiseName).
 *
 * To get franchise-level data, add the `isAggregate=true` query parameter.
 * This will:
 * - REMOVE game/team-specific fields (gameId, gameDate, teamId, teamFullName, seasonId)
 * - ADD franchise fields (franchiseId, franchiseName)
 *
 * **When to use this type:**
 * - Default responses without isAggregate parameter
 * - Game/season-level team statistics
 * - Data that needs team-specific context (e.g., "This is the Kings' 2024-2025 season performance")
 *
 * **When to use TeamStatsWithFranchise:**
 * - When you've explicitly set `isAggregate=true`
 * - Franchise-level aggregated data
 * - Data that needs organizational context (e.g., "The Kings franchise historical performance")
 *
 * @example
 * // Default response (includes teamId, excludes franchiseId):
 * const stats = await teams.getStats('summary', {
 *   cayenneExp: 'seasonId=20242025'
 * });
 * // Response: { teamId, teamFullName, wins, losses, ... }
 *
 * // With franchise data (includes franchiseId, excludes teamId):
 * const statsWithFranchise = await teams.getStats('summary', {
 *   cayenneExp: 'seasonId=20242025',
 *   isAggregate: true
 * });
 * // Response: { franchiseId, franchiseName, wins, losses, ... }
 *
 * @see TeamStatsWithFranchise
 * @see BaseQueryParams.isAggregate
 */
export interface TeamStats extends Team {
   seasonId?: number | string;
   gamesPlayed?: number;
   wins?: number;
   losses?: number;
   overtimeLosses?: number;
   [key: string]: unknown;
}

/**
 * Team statistics response with franchise data
 *
 * Response type for when `isAggregate=true` is explicitly specified.
 * This changes the field composition:
 * - REMOVES: Game/team-specific fields (gameId, gameDate, teamId, teamFullName, seasonId)
 * - ADDS: Franchise-level identifiers (franchiseId, franchiseName)
 *
 * Use this type annotation when you're explicitly requesting aggregated data at the franchise level.
 *
 * **Field Differences from TeamStats:**
 * | Field | TeamStats | TeamStatsWithFranchise |
 * |-------|-----------|----------------------|
 * | teamId | ✓ Present | ✗ Removed |
 * | teamFullName | ✓ Present | ✗ Removed |
 * | gameId | ✓ Present | ✗ Removed |
 * | gameDate | ✓ Present | ✗ Removed |
 * | franchiseId | ✗ Absent | ✓ Required |
 * | franchiseName | ✗ Absent | ✓ Required |
 * | Stats (wins, losses, etc.) | ✓ Present | ✓ Present |
 *
 * **Why fields change during aggregation:**
 * When aggregating to the franchise level, game-specific and team-instance-specific
 * fields no longer apply. For example:
 * - gameId: Multiple games may be aggregated
 * - teamId: Franchise persists across team relocations/name changes
 * - teamFullName: Team instances change, franchise persists
 *
 * @example
 * // Request franchise-aggregated data:
 * const response = await teams.getStats('summary', {
 *   cayenneExp: 'seasonId=20242025',
 *   isAggregate: true  // ← Required for this type
 * });
 *
 * // Type the response as having franchise data:
 * const teamWithFranchise: TeamStatsWithFranchise = response;
 *
 * // Access franchise context:
 * console.log(teamWithFranchise.franchiseId);    // ← Now available
 * console.log(teamWithFranchise.franchiseName);  // ← Now available
 * console.log(teamWithFranchise.teamId);         // ← NOT available (removed)
 *
 * @see TeamStats
 * @see BaseQueryParams.isAggregate
 */
export interface TeamStatsWithFranchise extends TeamStats {
   /** Franchise identifier (persistent organizational unit) */
   franchiseId: number;
   /** Franchise name */
   franchiseName: string;
}

/**
 * Franchise information structure
 *
 * Represents a franchise entity from the `/franchise` endpoint.
 * A franchise is a persistent organizational unit in the NHL that survives
 * team relocations, name changes, and other historical transitions.
 *
 * **Franchise vs Team:**
 * - **Franchise**: Persistent organizational unit (e.g., "Kings" from 1967-present)
 *   survives through relocations and name changes
 * - **Team**: Current instance of a team (e.g., "Los Angeles Kings in 2024-2025")
 *   specific location and current name
 *
 * **Accessing Franchise Data:**
 * Franchise information can be retrieved two ways:
 * 1. Direct endpoint: `/franchise` - Get all franchises
 * 2. Team/Player stats with `isAggregate=true` - Adds franchiseId and franchiseName
 *    to stats responses as context
 *
 * @example
 * // Get all franchises directly:
 * const allFranchises = await client.franchise.get('en');
 *
 * // Get franchise context in team stats:
 * const teamStats = await client.team.getStats('summary', {
 *   cayenneExp: 'seasonId=20242025',
 *   isAggregate: true  // ← Adds franchiseId, franchiseName
 * });
 * // Response will include: { franchiseId, franchiseName, stats... }
 * // But will NOT include: gameId, gameDate, teamId, teamFullName
 *
 * @see TeamStatsWithFranchise
 * @see BaseQueryParams.isAggregate
 */
export interface Franchise {
   /** Franchise ID */
   id?: number;
   /** Franchise name (e.g., "Kings", "Maple Leafs") */
   name?: string;
   /** Franchise abbreviation */
   abbreviation?: string;
   [key: string]: unknown;
}

/**
 * Season information
 */
export interface Season {
   id?: string | number;
   seasonId?: string | number;
   [key: string]: unknown;
}

/**
 * Game information
 */
export interface Game {
   gameId?: string | number;
   date?: string;
   homeTeam?: Team;
   awayTeam?: Team;
   [key: string]: unknown;
}

/**
 * Draft information
 */
export interface Draft {
   draftYear?: number;
   [key: string]: unknown;
}

/**
 * Configuration response
 */
export interface Config {
   [key: string]: unknown;
}

/**
 * Country information
 */
export interface Country {
   code?: string;
   name?: string;
   [key: string]: unknown;
}

/**
 * Shift chart information
 */
export interface ShiftChart {
   gameId?: string | number;
   playerId?: number;
   [key: string]: unknown;
}

/**
 * Glossary entry
 */
export interface GlossaryEntry {
   term?: string;
   definition?: string;
   [key: string]: unknown;
}

/**
 * Generic API error response
 */
export interface ApiError {
   error?: string;
   message?: string;
   status?: number;
   [key: string]: unknown;
}

/**
 * Query parameters for stats endpoints
 */
export interface StatsQueryParams extends Record<string, unknown> {
   /**
    * Cayenne expression for filtering
    */
   cayenneExp?: string;

   /**
    * Sort field
    */
   sort?: string;

   /**
    * Sort direction: 'asc' or 'desc'
    */
   dir?: 'asc' | 'desc';

   /**
    * Number of results to return
    * -1 returns all results
    */
   limit?: number;

   /**
    * Starting index for pagination
    */
   start?: number;

   /**
    * Include additional fields
    */
   include?: string;

   /**
    * Exclude certain fields
    */
   exclude?: string;

   /**
    * Fact cayenne expression
    */
   factCayenneExp?: string;

   /**
    * Aggregate results
    */
   isAggregate?: boolean;

   /**
    * Game-level stats
    */
   isGame?: boolean;
}

export interface ErrorResponse {
   message: string;
}

/**
 * Type guard for ErrorResponse
 * @param response - The response to check
 * @returns True if the response is an ErrorResponse, false otherwise
 */
export function isErrorResponse(
   response: unknown,
): response is ErrorResponse {
   return (
      typeof response === 'object' &&
      response !== null &&
      Object.keys(response).length === 1 &&
      'message' in response &&
      typeof response.message === 'string'
   );
}

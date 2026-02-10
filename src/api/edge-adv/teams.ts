/**
 * ======================================================================
 * API endpoints for team-related data.
 * Base url: api-web.nhle.com/v1/edge
 *
 * note: the season and game-type params on any endpoint can
 * be replaced with 'now' to get current season data.
 * ex. `/team-detail/{team-id}/now`
 * ======================================================================
 */

import { nhlClient } from '#/client/index.ts';
import { NHLError } from '#/errors/index.ts';
import {
   isParseError,
   PositionFilter as PositionFilterSchema,
   ShotLocationCategory as ShotLocationCategorySchema,
   ShotLocationSort as ShotLocationSortSchema,
   ShotSpeedSort as ShotSpeedSortSchema,
   SkatersStrength as SkatersStrengthSchema,
   SkatingDistanceSort as SkatingDistanceSortSchema,
   SkatingSpeedSort as SkatingSpeedSortSchema,
   TeamParams,
   ZoneTimeSort as ZoneTimeSortSchema,
} from '#/utils/schemas.ts';
import type {
   GameType,
   PositionFilter,
   Season,
   ShotLocationCategory,
   ShotLocationSort,
   ShotSpeedSort,
   SkatersStrength,
   SkatingDistanceSort,
   SkatingSpeedSort,
   TeamId,
   ZoneTimeSort,
} from '../../types/types.ts';
import { route } from '../../utils/utils.ts';
import { teamsPaths as p } from './paths.ts';

/**
 * Team Edge Advanced Stats API helpers.
 *
 * Lightweight wrapper exposing functions that call the underlying nhlClient
 * for team-related endpoints. Each method returns the raw Promise from the
 * client.get call.
 */

/**
 * Get team detail stats for a team.
 * @param teamId - Team numeric id.
 * @param season - Optional season (numeric season format or 'now').
 * @param gameType - Optional game type id (defaults to Regular Season).
 */
export async function stats(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.stats,
         }),
      );
   return nhlClient.get(route(p.stats, parsed));
}

/**
 * Get team comparison data for a single team.
 */
export async function compare(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   gameType ??= 'REG';
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.compare,
         }),
      );
   return nhlClient.get(route(p.compare, parsed));
}

/**
 * Get team landing/leaders for a season.
 */
export async function leaders(
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = TeamParams({ season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.leaders,
         }),
      );
   return nhlClient.get(route(p.leaders, parsed));
}

/**
 * Get shot location details for a team.
 */
export async function shotLocation(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.shotLocation,
         }),
      );
   return nhlClient.get(route(p.shotLocation, parsed));
}

/**
 * Get shot speed details for a team.
 */
export async function shotSpeed(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.shotSpeed,
         }),
      );
   return nhlClient.get(route(p.shotSpeed, parsed));
}

/**
 * Get skating distance details for a team.
 */
export async function skatingDistance(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.skatingDistance,
         }),
      );
   return nhlClient.get(route(p.skatingDistance, parsed));
}

/**
 * Get skating speed details for a team.
 */
export async function skatingSpeed(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.skatingSpeed,
         }),
      );
   return nhlClient.get(route(p.skatingSpeed, parsed));
}

/**
 * Get zone time details for a team.
 */
export async function zoneTime(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.zoneTime,
         }),
      );
   return nhlClient.get(route(p.zoneTime, parsed));
}

export const top10 = {
   shotLocation: top10ShotLocation,
   shotSpeed: top10ShotSpeed,
   skatingDistance: top10SkatingDistance,
   skatingSpeed: top10SkatingSpeed,
   zoneTime: top10ZoneTime,
};
/**
 * Top-10 team shot location lists.
 */
async function top10ShotLocation(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   category?: ShotLocationCategory,
   sortBy?: ShotLocationSort,
): Promise<unknown> {
   const Parser = TeamParams.merge({
      position: PositionFilterSchema.default('ALL'),
      category: ShotLocationCategorySchema.default('G'),
      sortBy: ShotLocationSortSchema.default('ALL'),
   });
   const parsed = Parser({
      season,
      gameType,
      position,
      category,
      sortBy,
   });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.shotLocation,
         }),
      );
   return nhlClient.get(route(p.shotLocation, parsed));
}
/**
 * Top-10 team shot speed lists.
 */
async function top10ShotSpeed(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   sortBy?: ShotSpeedSort,
): Promise<unknown> {
   const Parser = TeamParams.merge({
      position: PositionFilterSchema.default('ALL'),
      sortBy: ShotSpeedSortSchema.default('MAX'),
   });
   const parsed = Parser({
      season,
      gameType,
      position,
      sortBy,
   });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.shotSpeed,
         }),
      );
   return nhlClient.get(route(p.shotSpeed, parsed));
}
/**
 * Top-10 team skating distance lists.
 */
async function top10SkatingDistance(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   strength?: SkatersStrength,
   sortBy?: SkatingDistanceSort,
): Promise<unknown> {
   const Parser = TeamParams.merge({
      position: PositionFilterSchema.default('ALL'),
      strength: SkatersStrengthSchema.default('ALL'),
      sortBy: SkatingDistanceSortSchema.default('TOTAL'),
   });
   const parsed = Parser({
      season,
      gameType,
      position,
      strength,
      sortBy,
   });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.skatingDistance,
         }),
      );
   return nhlClient.get(route(p.skatingDistance, parsed));
}
/**
 * Top-10 team skating speed lists.
 */
async function top10SkatingSpeed(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   sortBy?: SkatingSpeedSort,
): Promise<unknown> {
   const Parser = TeamParams.merge({
      position: PositionFilterSchema.default('ALL'),
      sortBy: SkatingSpeedSortSchema.default('TOP'),
   });
   const parsed = Parser({
      season,
      gameType,
      position,
      sortBy,
   });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.skatingSpeed,
         }),
      );
   return nhlClient.get(route(p.skatingSpeed, parsed));
}
/**
 * Top-10 team zone time lists.
 */
async function top10ZoneTime(
   season?: Season,
   gameType?: GameType,
   strength?: SkatersStrength,
   sortBy?: ZoneTimeSort,
): Promise<unknown> {
   const Parser = TeamParams.merge({
      strength: SkatersStrengthSchema.default('ALL'),
      sortBy: ZoneTimeSortSchema.default('OZ'),
   });
   const parsed = Parser({
      season,
      gameType,
      strength,
      sortBy,
   });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.zoneTime,
         }),
      );
   return nhlClient.get(route(p.zoneTime, parsed));
}

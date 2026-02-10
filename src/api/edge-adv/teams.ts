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
   BaseParams,
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
import { resolvePath } from '../../utils/utils.ts';
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
   const path = resolvePath(p.stats, parsed);
   return nhlClient.get(path);
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
   const path = resolvePath(p.compare, parsed);
   return nhlClient.get(path);
}

/**
 * Get team landing/leaders for a season.
 */
export async function leaders(
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = BaseParams({ season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.leaders,
         }),
      );
   const path = resolvePath(p.leaders, parsed);
   return nhlClient.get(path);
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
   const path = resolvePath(p.shotLocation, parsed);
   return nhlClient.get(path);
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
   const path = resolvePath(p.shotSpeed, parsed);
   return nhlClient.get(path);
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
   const path = resolvePath(p.skatingDistance, parsed);
   return nhlClient.get(path);
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
   const path = resolvePath(p.skatingSpeed, parsed);
   return nhlClient.get(path);
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
   const path = resolvePath(p.zoneTime, parsed);
   return nhlClient.get(path);
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
   const Parser = BaseParams.merge({
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
   const path = resolvePath(p.top10.shotLocation, parsed);
   return nhlClient.get(path);
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
   const Parser = BaseParams.merge({
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
   const path = resolvePath(p.top10.shotSpeed, parsed);
   return nhlClient.get(path);
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
   const Parser = BaseParams.merge({
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
   const path = resolvePath(p.top10.skatingDistance, parsed);
   return nhlClient.get(path);
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
   const Parser = BaseParams.merge({
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
   const path = resolvePath(p.top10.skatingSpeed, parsed);
   return nhlClient.get(path);
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
   const Parser = BaseParams.merge({
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
   const path = resolvePath(p.top10.zoneTime, parsed);
   return nhlClient.get(path);
}

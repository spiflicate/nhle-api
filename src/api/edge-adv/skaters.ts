/**
 * ======================================================================
 * API endpoints for skater-related data.
 * Base url: api-web.nhle.com/v1/edge
 *
 * Notes:
 * - Convenience endpoints using 'now' for season have been
 * excluded in favor of using calculated current season. You can optionally
 * configure the switch over date for how current season is calculated.
 * See README for details.
 * - There is an extra endpoint that appears to duplicate
 * the functionality of /skater-detail at `v1/cat/edge/skater-detail`
 * As such, it has been excluded from this implementation.
 * =====================================================================
 */

import { nhlClient } from '#/client/index.ts';
import { NHLError } from '#/errors/index.ts';
import {
   BaseParams,
   isParseError,
   PlayerParams,
   ShotLocationCategory as ShotLocationCategorySchema,
   ShotLocationSort as ShotLocationSortSchema,
   ShotSpeedSort as ShotSpeedSortSchema,
   SkatingDistanceSort as SkatingDistanceSortSchema,
   SkatingSpeedSort as SkatingSpeedSortSchema,
   top10Params,
   ZoneTimeSort as ZoneTimeSortSchema,
} from '#/utils/schemas.ts';
import type {
   GameType,
   PlayerId,
   PositionFilter,
   Season,
   ShotLocationCategory,
   ShotLocationSort,
   ShotSpeedSort,
   SkatersStrength,
   SkatingDistanceSort,
   SkatingSpeedSort,
   ZoneTimeSort,
} from '../../types/types.ts';
import { route } from '../../utils/utils.ts';
import { skatersPaths as p } from './paths.ts';

/**
 * Skater Edge Advanced Stats API helpers.
 *
 * Lightweight wrapper exposing functions that call the underlying nhlClient
 * for skater-related endpoints. Each method returns the raw Promise from the
 * client.get call.
 */

/** Get skater detail for a player. */
export async function detail(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.detail,
         }),
      );
   return nhlClient.get(route(p.detail, parsed));
}

/** Get skater shot location details for a player. */
export async function shotLocation(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.shotLocation,
         }),
      );
   return nhlClient.get(route(p.shotLocation, parsed));
}

/** Get skater shot speed details for a player. */
export async function shotSpeed(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.shotSpeed,
         }),
      );
   return nhlClient.get(route(p.shotSpeed, parsed));
}

/** Get skater skating distance details for a player. */
export async function skatingDistance(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.skatingDistance,
         }),
      );
   return nhlClient.get(route(p.skatingDistance, parsed));
}

/** Get skater skating speed details for a player. */
export async function skatingSpeed(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.skatingSpeed,
         }),
      );
   return nhlClient.get(route(p.skatingSpeed, parsed));
}

/** Get skater zone time for a player. */
export async function zoneTime(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.zoneTime,
         }),
      );
   return nhlClient.get(route(p.zoneTime, parsed));
}

/** Get skater comparison data for a player. */
export async function comparison(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.comparison,
         }),
      );
   return nhlClient.get(route(p.comparison, parsed));
}

/** Get skater landing / leaders for a season. */
export async function leaders(
   season?: Season,
   gameType?: GameType,
): Promise<unknown> {
   const parsed = BaseParams({ season, gameType });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.landing,
         }),
      );
   return nhlClient.get(route(p.landing, parsed));
}

export const top10 = {
   distance: top10Distance,
   shotLocation: top10ShotLocation,
   shotSpeed: top10ShotSpeed,
   speed: top10Speed,
   zoneTime: top10ZoneTime,
};

/** Top-10 skating distance lists. */
async function top10Distance(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   strength?: SkatersStrength,
   sortBy?: SkatingDistanceSort,
): Promise<unknown> {
   const parsed = top10Params.merge({
      sortBy: SkatingDistanceSortSchema.default('TOTAL'),
   })({
      season,
      gameType,
      position,
      strength,
      sortBy,
   });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.distanceTop10,
         }),
      );
   return nhlClient.get(route(p.distanceTop10, parsed));
}
/** Top-10 shot location lists. */
async function top10ShotLocation(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   category?: ShotLocationCategory,
   sortBy?: ShotLocationSort,
): Promise<unknown> {
   const parsed = top10Params.merge({
      category: ShotLocationCategorySchema.default('G'),
      sortBy: ShotLocationSortSchema.default('ALL'),
   })({
      season,
      gameType,
      position,
      category,
      sortBy,
   });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.shotLocationTop10,
         }),
      );
   return nhlClient.get(route(p.shotLocationTop10, parsed));
}
/** Top-10 shot speed lists. */
async function top10ShotSpeed(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   sortBy?: ShotSpeedSort,
): Promise<unknown> {
   const parsed = top10Params.merge({
      sortBy: ShotSpeedSortSchema.default('MAX'),
   })({
      season,
      gameType,
      position,
      sortBy,
   });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.shotSpeedTop10,
         }),
      );
   return nhlClient.get(route(p.shotSpeedTop10, parsed));
}
/** Top-10 skating speed lists. */
async function top10Speed(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   sortBy?: SkatingSpeedSort,
): Promise<unknown> {
   const parsed = top10Params.merge({
      sortBy: SkatingSpeedSortSchema.default('TOP'),
   })({
      season,
      gameType,
      position,
      sortBy,
   });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.speedTop10,
         }),
      );
   return nhlClient.get(route(p.speedTop10, parsed));
}
/** Top-10 zone time lists. */
async function top10ZoneTime(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   strength?: SkatersStrength,
   sortBy?: ZoneTimeSort,
): Promise<unknown> {
   const parsed = top10Params.merge({
      sortBy: ZoneTimeSortSchema.default('OZ'),
   })({
      season,
      gameType,
      position,
      strength,
      sortBy,
   });
   if (isParseError(parsed))
      return Promise.reject(
         new NHLError(parsed.summary, 'VALIDATION', {
            endpoint: p.zoneTimeTop10,
         }),
      );
   return nhlClient.get(route(p.zoneTimeTop10, parsed));
}

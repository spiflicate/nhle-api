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
import type { APIResult } from '#/client/types.ts';
import type {
   EdgeSkaterComparison,
   EdgeSkaterDetail,
   EdgeSkaterDistanceTop10,
   EdgeSkaterLanding,
   EdgeSkaterShotLocation,
   EdgeSkaterShotLocationTop10,
   EdgeSkaterShotSpeed,
   EdgeSkaterShotSpeedTop10,
   EdgeSkaterSkatingDistance,
   EdgeSkaterSkatingSpeed,
   EdgeSkaterSpeedTop10,
   EdgeSkaterZoneTime,
   EdgeSkaterZoneTimeTop10,
} from '#/types/responses/edge-adv.ts';
import {
   BaseParams,
   invalidParams,
   isParseError,
   PlayerParams,
   ShotLocationCategory as ShotLocationCategorySchema,
   ShotLocationSort as ShotLocationSortSchema,
   ShotSpeedSort as ShotSpeedSortSchema,
   SkatingDistanceSort as SkatingDistanceSortSchema,
   SkatingSpeedSort as SkatingSpeedSortSchema,
   top10Params,
   withDefault,
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
import { resolvePath } from '../../utils/utils.ts';
import { skatersPaths as p } from './paths.ts';

/**
 * Skater Edge Advanced Stats API helpers.
 *
 * Lightweight wrapper exposing functions that call the underlying nhlClient
 * for skater-related endpoints. Each function resolves to an APIResult; invalid
 * parameters give a ValidationError result without a request.
 */

/** Get skater detail for a player. */
export async function detail(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeSkaterDetail>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.player);
   const path = resolvePath(p.player, parsed);
   return nhlClient.get<EdgeSkaterDetail>(path);
}

/** Get skater shot location details for a player. */
export async function shotLocation(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeSkaterShotLocation>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.shotLocation);
   const path = resolvePath(p.shotLocation, parsed);
   return nhlClient.get<EdgeSkaterShotLocation>(path);
}

/** Get skater shot speed details for a player. */
export async function shotSpeed(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeSkaterShotSpeed>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.shotSpeed);
   const path = resolvePath(p.shotSpeed, parsed);
   return nhlClient.get<EdgeSkaterShotSpeed>(path);
}

/** Get skater skating distance details for a player. */
export async function skatingDistance(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeSkaterSkatingDistance>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed))
      return invalidParams(parsed, p.skatingDistance);
   const path = resolvePath(p.skatingDistance, parsed);
   return nhlClient.get<EdgeSkaterSkatingDistance>(path);
}

/** Get skater skating speed details for a player. */
export async function skatingSpeed(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeSkaterSkatingSpeed>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.skatingSpeed);
   const path = resolvePath(p.skatingSpeed, parsed);
   return nhlClient.get<EdgeSkaterSkatingSpeed>(path);
}

/** Get skater zone time for a player. */
export async function zoneTime(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeSkaterZoneTime>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.zoneTime);
   const path = resolvePath(p.zoneTime, parsed);
   return nhlClient.get<EdgeSkaterZoneTime>(path);
}

/** Get skater comparison data for a player. */
export async function comparison(
   playerId: PlayerId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeSkaterComparison>> {
   const parsed = PlayerParams({ playerId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.compare);
   const path = resolvePath(p.compare, parsed);
   return nhlClient.get<EdgeSkaterComparison>(path);
}

/** Get skater landing / leaders for a season. */
export async function leaders(
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeSkaterLanding>> {
   const parsed = BaseParams({ season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.leaders);
   const path = resolvePath(p.leaders, parsed);
   return nhlClient.get<EdgeSkaterLanding>(path);
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
): Promise<APIResult<EdgeSkaterDistanceTop10>> {
   const parsed = top10Params.merge({
      sortBy: withDefault(SkatingDistanceSortSchema, 'TOTAL'),
   })({
      season,
      gameType,
      position,
      strength,
      sortBy,
   });
   if (isParseError(parsed))
      return invalidParams(parsed, p.top10.skatingDistance);
   const path = resolvePath(p.top10.skatingDistance, parsed);
   return nhlClient.get<EdgeSkaterDistanceTop10>(path);
}
/** Top-10 shot location lists. */
async function top10ShotLocation(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   category?: ShotLocationCategory,
   sortBy?: ShotLocationSort,
): Promise<APIResult<EdgeSkaterShotLocationTop10>> {
   const parsed = top10Params.merge({
      category: withDefault(ShotLocationCategorySchema, 'G'),
      sortBy: withDefault(ShotLocationSortSchema, 'ALL'),
   })({
      season,
      gameType,
      position,
      category,
      sortBy,
   });
   if (isParseError(parsed))
      return invalidParams(parsed, p.top10.shotLocation);
   const path = resolvePath(p.top10.shotLocation, parsed);
   return nhlClient.get<EdgeSkaterShotLocationTop10>(path);
}
/** Top-10 shot speed lists. */
async function top10ShotSpeed(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   sortBy?: ShotSpeedSort,
): Promise<APIResult<EdgeSkaterShotSpeedTop10>> {
   const parsed = top10Params.merge({
      sortBy: withDefault(ShotSpeedSortSchema, 'MAX'),
   })({
      season,
      gameType,
      position,
      sortBy,
   });
   if (isParseError(parsed))
      return invalidParams(parsed, p.top10.shotSpeed);
   const path = resolvePath(p.top10.shotSpeed, parsed);
   return nhlClient.get<EdgeSkaterShotSpeedTop10>(path);
}
/** Top-10 skating speed lists. */
async function top10Speed(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   sortBy?: SkatingSpeedSort,
): Promise<APIResult<EdgeSkaterSpeedTop10>> {
   const parsed = top10Params.merge({
      sortBy: withDefault(SkatingSpeedSortSchema, 'TOP'),
   })({
      season,
      gameType,
      position,
      sortBy,
   });
   if (isParseError(parsed))
      return invalidParams(parsed, p.top10.skatingSpeed);
   const path = resolvePath(p.top10.skatingSpeed, parsed);
   return nhlClient.get<EdgeSkaterSpeedTop10>(path);
}
/** Top-10 zone time lists. */
async function top10ZoneTime(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   strength?: SkatersStrength,
   sortBy?: ZoneTimeSort,
): Promise<APIResult<EdgeSkaterZoneTimeTop10>> {
   const parsed = top10Params.merge({
      sortBy: withDefault(ZoneTimeSortSchema, 'OZ'),
   })({
      season,
      gameType,
      position,
      strength,
      sortBy,
   });
   if (isParseError(parsed)) return invalidParams(parsed, p.top10.zoneTime);
   const path = resolvePath(p.top10.zoneTime, parsed);
   return nhlClient.get<EdgeSkaterZoneTimeTop10>(path);
}

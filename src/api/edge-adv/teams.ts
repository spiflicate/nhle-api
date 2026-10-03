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
import type { APIResult } from '#/client/types.ts';
import type {
   EdgeTeamComparison,
   EdgeTeamDetail,
   EdgeTeamLanding,
   EdgeTeamShotLocation,
   EdgeTeamShotLocationTop10,
   EdgeTeamShotSpeed,
   EdgeTeamShotSpeedTop10,
   EdgeTeamSkatingDistance,
   EdgeTeamSkatingDistanceTop10,
   EdgeTeamSkatingSpeed,
   EdgeTeamSkatingSpeedTop10,
   EdgeTeamZoneTime,
   EdgeTeamZoneTimeTop10,
} from '#/types/responses/edge-adv.ts';
import {
   BaseParams,
   invalidParams,
   isParseError,
   PositionFilter as PositionFilterSchema,
   ShotLocationCategory as ShotLocationCategorySchema,
   ShotLocationSort as ShotLocationSortSchema,
   ShotSpeedSort as ShotSpeedSortSchema,
   SkatersStrength as SkatersStrengthSchema,
   SkatingDistanceSort as SkatingDistanceSortSchema,
   SkatingSpeedSort as SkatingSpeedSortSchema,
   TeamParams,
   withDefault,
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
 * for team-related endpoints. Each function resolves to an APIResult; invalid
 * parameters give a ValidationError result without a request.
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
): Promise<APIResult<EdgeTeamDetail>> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.stats);
   const path = resolvePath(p.stats, parsed);
   return nhlClient.get<EdgeTeamDetail>(path);
}

/**
 * Get team comparison data for a single team.
 */
export async function compare(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeTeamComparison>> {
   gameType ??= 'REG';
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.compare);
   const path = resolvePath(p.compare, parsed);
   return nhlClient.get<EdgeTeamComparison>(path);
}

/**
 * Get team landing/leaders for a season.
 */
export async function leaders(
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeTeamLanding>> {
   const parsed = BaseParams({ season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.leaders);
   const path = resolvePath(p.leaders, parsed);
   return nhlClient.get<EdgeTeamLanding>(path);
}

/**
 * Get shot location details for a team.
 */
export async function shotLocation(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeTeamShotLocation>> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.shotLocation);
   const path = resolvePath(p.shotLocation, parsed);
   return nhlClient.get<EdgeTeamShotLocation>(path);
}

/**
 * Get shot speed details for a team.
 */
export async function shotSpeed(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeTeamShotSpeed>> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.shotSpeed);
   const path = resolvePath(p.shotSpeed, parsed);
   return nhlClient.get<EdgeTeamShotSpeed>(path);
}

/**
 * Get skating distance details for a team.
 */
export async function skatingDistance(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeTeamSkatingDistance>> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed))
      return invalidParams(parsed, p.skatingDistance);
   const path = resolvePath(p.skatingDistance, parsed);
   return nhlClient.get<EdgeTeamSkatingDistance>(path);
}

/**
 * Get skating speed details for a team.
 */
export async function skatingSpeed(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeTeamSkatingSpeed>> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.skatingSpeed);
   const path = resolvePath(p.skatingSpeed, parsed);
   return nhlClient.get<EdgeTeamSkatingSpeed>(path);
}

/**
 * Get zone time details for a team.
 */
export async function zoneTime(
   teamId: TeamId,
   season?: Season,
   gameType?: GameType,
): Promise<APIResult<EdgeTeamZoneTime>> {
   const parsed = TeamParams({ teamId, season, gameType });
   if (isParseError(parsed)) return invalidParams(parsed, p.zoneTime);
   const path = resolvePath(p.zoneTime, parsed);
   return nhlClient.get<EdgeTeamZoneTime>(path);
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
): Promise<APIResult<EdgeTeamShotLocationTop10>> {
   const Parser = BaseParams.merge({
      position: withDefault(PositionFilterSchema, 'ALL'),
      category: withDefault(ShotLocationCategorySchema, 'G'),
      sortBy: withDefault(ShotLocationSortSchema, 'ALL'),
   });
   const parsed = Parser({
      season,
      gameType,
      position,
      category,
      sortBy,
   });
   if (isParseError(parsed))
      return invalidParams(parsed, p.top10.shotLocation);
   const path = resolvePath(p.top10.shotLocation, parsed);
   return nhlClient.get<EdgeTeamShotLocationTop10>(path);
}
/**
 * Top-10 team shot speed lists.
 */
async function top10ShotSpeed(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   sortBy?: ShotSpeedSort,
): Promise<APIResult<EdgeTeamShotSpeedTop10>> {
   const Parser = BaseParams.merge({
      position: withDefault(PositionFilterSchema, 'ALL'),
      sortBy: withDefault(ShotSpeedSortSchema, 'MAX'),
   });
   const parsed = Parser({
      season,
      gameType,
      position,
      sortBy,
   });
   if (isParseError(parsed))
      return invalidParams(parsed, p.top10.shotSpeed);
   const path = resolvePath(p.top10.shotSpeed, parsed);
   return nhlClient.get<EdgeTeamShotSpeedTop10>(path);
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
): Promise<APIResult<EdgeTeamSkatingDistanceTop10>> {
   const Parser = BaseParams.merge({
      position: withDefault(PositionFilterSchema, 'ALL'),
      strength: withDefault(SkatersStrengthSchema, 'ALL'),
      sortBy: withDefault(SkatingDistanceSortSchema, 'TOTAL'),
   });
   const parsed = Parser({
      season,
      gameType,
      position,
      strength,
      sortBy,
   });
   if (isParseError(parsed))
      return invalidParams(parsed, p.top10.skatingDistance);
   const path = resolvePath(p.top10.skatingDistance, parsed);
   return nhlClient.get<EdgeTeamSkatingDistanceTop10>(path);
}
/**
 * Top-10 team skating speed lists.
 */
async function top10SkatingSpeed(
   season?: Season,
   gameType?: GameType,
   position?: PositionFilter,
   sortBy?: SkatingSpeedSort,
): Promise<APIResult<EdgeTeamSkatingSpeedTop10>> {
   const Parser = BaseParams.merge({
      position: withDefault(PositionFilterSchema, 'ALL'),
      sortBy: withDefault(SkatingSpeedSortSchema, 'TOP'),
   });
   const parsed = Parser({
      season,
      gameType,
      position,
      sortBy,
   });
   if (isParseError(parsed))
      return invalidParams(parsed, p.top10.skatingSpeed);
   const path = resolvePath(p.top10.skatingSpeed, parsed);
   return nhlClient.get<EdgeTeamSkatingSpeedTop10>(path);
}
/**
 * Top-10 team zone time lists.
 */
async function top10ZoneTime(
   season?: Season,
   gameType?: GameType,
   strength?: SkatersStrength,
   sortBy?: ZoneTimeSort,
): Promise<APIResult<EdgeTeamZoneTimeTop10>> {
   const Parser = BaseParams.merge({
      strength: withDefault(SkatersStrengthSchema, 'ALL'),
      sortBy: withDefault(ZoneTimeSortSchema, 'OZ'),
   });
   const parsed = Parser({
      season,
      gameType,
      strength,
      sortBy,
   });
   if (isParseError(parsed)) return invalidParams(parsed, p.top10.zoneTime);
   const path = resolvePath(p.top10.zoneTime, parsed);
   return nhlClient.get<EdgeTeamZoneTimeTop10>(path);
}

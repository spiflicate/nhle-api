/**
 * ======================================================================
 * API endpoints for skater-related data.
 * Base url: api-web.nhle.com/v1/edge
 * Available endpoints: see `_paths`
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

import nhlClient from '#/client/index.ts';
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

/** API endpoint paths for skater-related data. */
const _paths = {
   comparison: 'skater-comparison/{playerId}/{season}/{gameType}',
   detail: 'skater-detail/{playerId}/{season}/{gameType}',
   distanceTop10:
      'skater-distance-top-10/{positions}/{strength}/{sortBy}/{season}/{gameType}',
   landing: 'skater-landing/{season}/{gameType}',
   shotLocation:
      'skater-shot-location-detail/{playerId}/{season}/{gameType}',
   shotLocationTop10:
      'skater-shot-location-top-10/{position}/{category}/{sortBy}/{season}/{gameType}',
   shotSpeed: 'skater-shot-speed-detail/{playerId}/{season}/{gameType}',
   shotSpeedTop10:
      'skater-shot-speed-top-10/{positions}/{sortBy}/{season}/{gameType}',
   skatingDistance:
      'skater-skating-distance-detail/{playerId}/{season}/{gameType}',
   skatingSpeed:
      'skater-skating-speed-detail/{playerId}/{season}/{gameType}',
   speedTop10:
      'skater-speed-top-10/{positions}/{sortBy}/{season}/{gameType}',
   zoneTime: 'skater-zone-time/{playerId}/{season}/{gameType}',
   zoneTimeTop10:
      'skater-zone-time-top-10/{positions}/{strength}/{sortBy}/{season}/{gameType}',
};

/**
 * Skater Edge Advanced Stats API helpers.
 *
 * Lightweight wrapper exposing functions that call the underlying nhlClient
 * for skater-related endpoints. Each method returns the raw Promise from the
 * client.get call.
 */
export const skaters = {
   /** Get skater detail for a player. */
   detail: (
      playerId: PlayerId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = PlayerParams({ playerId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.detail,
            }),
         );
      return nhlClient.get(route(_paths.detail, parsed));
   },

   /** Get skater shot location details for a player. */
   shotLocation: (
      playerId: PlayerId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = PlayerParams({ playerId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.shotLocation,
            }),
         );
      return nhlClient.get(route(_paths.shotLocation, parsed));
   },

   /** Get skater shot speed details for a player. */
   shotSpeed: (
      playerId: PlayerId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = PlayerParams({ playerId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.shotSpeed,
            }),
         );
      return nhlClient.get(route(_paths.shotSpeed, parsed));
   },

   /** Get skater skating distance details for a player. */
   skatingDistance: (
      playerId: PlayerId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = PlayerParams({ playerId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.skatingDistance,
            }),
         );
      return nhlClient.get(route(_paths.skatingDistance, parsed));
   },

   /** Get skater skating speed details for a player. */
   skatingSpeed: (
      playerId: PlayerId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = PlayerParams({ playerId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.skatingSpeed,
            }),
         );
      return nhlClient.get(route(_paths.skatingSpeed, parsed));
   },

   /** Get skater zone time for a player. */
   zoneTime: (
      playerId: PlayerId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = PlayerParams({ playerId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.zoneTime,
            }),
         );
      return nhlClient.get(route(_paths.zoneTime, parsed));
   },

   /** Get skater comparison data for a player. */
   comparison: (
      playerId: PlayerId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = PlayerParams({ playerId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.comparison,
            }),
         );
      return nhlClient.get(route(_paths.comparison, parsed));
   },

   /** Get skater landing / leaders for a season. */
   leaders: (season?: Season, gameType?: GameType): Promise<unknown> => {
      const parsed = BaseParams({ season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.landing,
            }),
         );
      return nhlClient.get(route(_paths.landing, parsed));
   },
   get top10() {
      return {
         /** Top-10 skating distance lists. */
         distance: (
            season?: Season,
            gameType?: GameType,
            position?: PositionFilter,
            strength?: SkatersStrength,
            sortBy?: SkatingDistanceSort,
         ): Promise<unknown> => {
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
                     endpoint: _paths.distanceTop10,
                  }),
               );
            return nhlClient.get(route(_paths.distanceTop10, parsed));
         },
         /** Top-10 shot location lists. */
         shotLocation: (
            season?: Season,
            gameType?: GameType,
            position?: PositionFilter,
            category?: ShotLocationCategory,
            sortBy?: ShotLocationSort,
         ): Promise<unknown> => {
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
                     endpoint: _paths.shotLocationTop10,
                  }),
               );
            return nhlClient.get(route(_paths.shotLocationTop10, parsed));
         },
         /** Top-10 shot speed lists. */
         shotSpeed: (
            season?: Season,
            gameType?: GameType,
            position?: PositionFilter,
            sortBy?: ShotSpeedSort,
         ): Promise<unknown> => {
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
                     endpoint: _paths.shotSpeedTop10,
                  }),
               );
            return nhlClient.get(route(_paths.shotSpeedTop10, parsed));
         },
         /** Top-10 skating speed lists. */
         speed: (
            season?: Season,
            gameType?: GameType,
            position?: PositionFilter,
            sortBy?: SkatingSpeedSort,
         ): Promise<unknown> => {
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
                     endpoint: _paths.speedTop10,
                  }),
               );
            return nhlClient.get(route(_paths.speedTop10, parsed));
         },
         /** Top-10 zone time lists. */
         zoneTime: (
            season?: Season,
            gameType?: GameType,
            position?: PositionFilter,
            strength?: SkatersStrength,
            sortBy?: ZoneTimeSort,
         ): Promise<unknown> => {
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
                     endpoint: _paths.zoneTimeTop10,
                  }),
               );
            return nhlClient.get(route(_paths.zoneTimeTop10, parsed));
         },
      };
   },
};

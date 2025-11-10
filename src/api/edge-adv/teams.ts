/**
 * ======================================================================
 * API endpoints for team-related data.
 * Base url: api-web.nhle.com/v1/edge
 * Available endpoints: see `teams.paths`
 *
 * note: the season and game-type params on any endpoint can
 * be replaced with 'now' to get current season data.
 * ex. `/team-detail/{team-id}/now`
 * ======================================================================
 */

import nhlClient from '#/client/index.ts';
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

/** API endpoint paths for team-related data. */
const _paths = {
   stats: 'edge/team-comparison/{team-id}/{season}/{game-type}',
   compare: 'edge/team-detail/{team-id}/{season}/{game-type}',
   leaders: 'edge/team-landing/{season}/{game-type}',
   shotLocation:
      'edge/team-shot-location-detail/{team-id}/{season}/{game-type}',
   shotSpeed:
      'edge/team-shot-location-top-10/{position}/{category}/{sort-by}/{season}/{game-type}',
   skatingDistance:
      'edge/team-shot-speed-detail/{team-id}/{season}/{game-type}',
   skatingSpeed:
      'edge/team-shot-speed-top-10/{position}/{sort-by}/{season}/{game-type}',
   zoneTime:
      'edge/team-skating-distance-detail/{team-id}/{season}/{game-type}',
   top10: {
      shotLocation:
         'edge/team-skating-distance-top-10/{position}/{strength}/{sort-by}/{season}/{game-type}',
      shotSpeed:
         'edge/team-skating-speed-detail/{team-id}/{season}/{game-type}',
      skatingDistance:
         'edge/team-skating-speed-top-10/{position}/{sort-by}/{season}/{game-type}',
      skatingSpeed:
         'edge/team-zone-time-details/{team-id}/{season}/{game-type}',
      zoneTime:
         'edge/team-zone-time-top-10/{strength}/{sort-by}/{season}/{game-type}',
   },
};

/**
 * Team Edge Advanced Stats API helpers.
 *
 * Lightweight wrapper exposing functions that call the underlying nhlClient
 * for team-related endpoints. Each method returns the raw Promise from the
 * client.get call.
 */
export const team = {
   /**
    * Get team detail stats for a team.
    * @param teamId - Team numeric id.
    * @param season - Optional season (numeric season format or 'now').
    * @param gameType - Optional game type id (defaults to Regular Season).
    */
   stats: (
      teamId: TeamId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = TeamParams({ teamId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.stats,
            }),
         );
      return nhlClient.get(route(_paths.stats, parsed));
   },

   /**
    * Get team comparison data for a single team.
    */
   compare: (
      teamId: TeamId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      gameType ??= 'REG';
      const parsed = TeamParams({ teamId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.compare,
            }),
         );
      return nhlClient.get(route(_paths.compare, parsed));
   },

   /**
    * Get team landing/leaders for a season.
    */
   leaders: async (
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = TeamParams({ season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.leaders,
            }),
         );
      return nhlClient.get(route(_paths.leaders, parsed));
   },

   /**
    * Get shot location details for a team.
    */
   shotLocation: async (
      teamId: TeamId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = TeamParams({ teamId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.shotLocation,
            }),
         );
      return nhlClient.get(route(_paths.shotLocation, parsed));
   },

   /**
    * Get shot speed details for a team.
    */
   shotSpeed: async (
      teamId: TeamId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = TeamParams({ teamId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.shotSpeed,
            }),
         );
      return nhlClient.get(route(_paths.shotSpeed, parsed));
   },

   /**
    * Get skating distance details for a team.
    */
   skatingDistance: async (
      teamId: TeamId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = TeamParams({ teamId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.skatingDistance,
            }),
         );
      return nhlClient.get(route(_paths.skatingDistance, parsed));
   },

   /**
    * Get skating speed details for a team.
    */
   skatingSpeed: async (
      teamId: TeamId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = TeamParams({ teamId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.skatingSpeed,
            }),
         );
      return nhlClient.get(route(_paths.skatingSpeed, parsed));
   },

   /**
    * Get zone time details for a team.
    */
   zoneTime: async (
      teamId: TeamId,
      season?: Season,
      gameType?: GameType,
   ): Promise<unknown> => {
      const parsed = TeamParams({ teamId, season, gameType });
      if (isParseError(parsed))
         return Promise.reject(
            new NHLError(parsed.summary, 'VALIDATION', {
               endpoint: _paths.zoneTime,
            }),
         );
      return nhlClient.get(route(_paths.zoneTime, parsed));
   },

   get top10() {
      return {
         /**
          * Top-10 team shot location lists.
          */
         shotLocation: async (
            season?: Season,
            gameType?: GameType,
            position?: PositionFilter,
            category?: ShotLocationCategory,
            sortBy?: ShotLocationSort,
         ): Promise<unknown> => {
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
                     endpoint: _paths.shotLocation,
                  }),
               );
            return nhlClient.get(route(_paths.shotLocation, parsed));
         },
         /**
          * Top-10 team shot speed lists.
          */
         shotSpeed: async (
            season?: Season,
            gameType?: GameType,
            position?: PositionFilter,
            sortBy?: ShotSpeedSort,
         ): Promise<unknown> => {
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
                     endpoint: _paths.shotSpeed,
                  }),
               );
            return nhlClient.get(route(_paths.shotSpeed, parsed));
         },
         /**
          * Top-10 team skating distance lists.
          */
         skatingDistance: async (
            season?: Season,
            gameType?: GameType,
            position?: PositionFilter,
            strength?: SkatersStrength,
            sortBy?: SkatingDistanceSort,
         ): Promise<unknown> => {
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
                     endpoint: _paths.skatingDistance,
                  }),
               );
            return nhlClient.get(route(_paths.skatingDistance, parsed));
         },
         /**
          * Top-10 team skating speed lists.
          */
         skatingSpeed: async (
            season?: Season,
            gameType?: GameType,
            position?: PositionFilter,
            sortBy?: SkatingSpeedSort,
         ): Promise<unknown> => {
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
                     endpoint: _paths.skatingSpeed,
                  }),
               );
            return nhlClient.get(route(_paths.skatingSpeed, parsed));
         },
         /**
          * Top-10 team zone time lists.
          */
         zoneTime: async (
            season?: Season,
            gameType?: GameType,
            strength?: SkatersStrength,
            sortBy?: ZoneTimeSort,
         ): Promise<unknown> => {
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
                     endpoint: _paths.zoneTime,
                  }),
               );
            return nhlClient.get(route(_paths.zoneTime, parsed));
         },
      };
   },
};

/**
 * @module api/gamecenter/draft
 * @description Draft-related API endpoints for accessing NHL draft picks, rankings, and tracker information
 */

import { nhlClient } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import { type NHLError, ValidationError } from '#/errors/index.ts';
import type {
   DraftPicks,
   DraftRankings,
   DraftRound,
   DraftTracker,
   Year,
} from '#/types/index.ts';
import { getCurrentNHLYear } from '#/utils/date.ts';
import {
   DraftParams,
   isParseError,
   Year as YearType,
} from '#/utils/schemas.ts';
import { resolvePath } from '#/utils/utils.ts';
import { draftPaths as p } from './paths.ts';

/**
 * Get draft picks for a specific year and round, or all picks for a year
 * @param year - The draft year (defaults to current year if not provided)
 * @param round - The draft round (1-7). If omitted, returns the first round picks for the year
 * @returns Promise resolving to draft picks for the specified year and round
 * @example
 * ```ts
 * // Get all draft picks for 2023
 * picks(2023).then((data) => console.log(data));
 *
 * // Get first round picks for 2023
 * picks(2023, 1).then((data) => console.log(data));
 * ```
 */
export async function picks(
   year?: Year,
   round?: DraftRound,
): Promise<APIResult<DraftPicks>> {
   const parsed = DraftParams({ year, round });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.draftPicks.byYearAndRound,
         }),
      };
   }
   let path = '';
   if (parsed.year && !parsed.round) {
      path = resolvePath(p.draftPicks.byYear, parsed);
   } else {
      path = resolvePath(p.draftPicks.byYearAndRound, parsed);
   }
   return nhlClient.get(path);
}

/**
 * Get current draft tracker information for live draft coverage
 * @returns Promise resolving to current draft tracker data, including live pick information
 * @example
 * ```ts
 * tracker().then((data) => console.log(data));
 * ```
 */
export async function tracker(): Promise<APIResult<DraftTracker>> {
   return nhlClient.get(p.draftTracker);
}
/**
 * Access draft rankings by category (skaters/goalies, NA/International)
 * @param year - The draft year (defaults to current year if not provided)
 * @returns Object with methods to get rankings by category
 * @example
 * ```ts
 * // Get North American skater rankings for 2024
 * rankings(2024).skatersNA().then((data) => console.log(data));
 *
 * // Get all rankings for 2024
 * rankings(2024).all().then((allRankings) => console.log(allRankings));
 * ```
 */
export function rankings(year?: Year): {
   skatersNA: () => Promise<APIResult<DraftRankings>>;
   skatersIntl: () => Promise<APIResult<DraftRankings>>;
   goaliesNA: () => Promise<APIResult<DraftRankings>>;
   goaliesIntl: () => Promise<APIResult<DraftRankings>>;
   all: () => Promise<APIResult<DraftRankings[]>>;
} {
   const DraftRankingsEnum = {
      skatersNA: '1',
      skatersIntl: '2',
      goaliesNA: '3',
      goaliesIntl: '4',
   } as const;
   const getRankings = async (
      type: '1' | '2' | '3' | '4',
   ): Promise<APIResult<DraftRankings>> => {
      const parsedYear = YearType(year ?? getCurrentNHLYear());
      if (isParseError(parsedYear)) {
         return {
            success: false,
            error: new ValidationError(parsedYear.summary, {
               endpoint: p.draftRankings,
            }),
         };
      }
      const path = resolvePath(p.draftRankings, { year: parsedYear, type });
      return nhlClient.get(path);
   };

   return {
      /**
       * Get North American skater draft rankings
       * @returns Promise resolving to NA skater rankings
       */
      skatersNA: async (): Promise<APIResult<DraftRankings>> =>
         getRankings(DraftRankingsEnum.skatersNA),
      /**
       * Get International skater draft rankings
       * @returns Promise resolving to International skater rankings
       */
      skatersIntl: async (): Promise<APIResult<DraftRankings>> =>
         getRankings(DraftRankingsEnum.skatersIntl),
      /**
       * Get North American goalie draft rankings
       * @returns Promise resolving to NA goalie rankings
       */
      goaliesNA: async (): Promise<APIResult<DraftRankings>> =>
         getRankings(DraftRankingsEnum.goaliesNA),
      /**
       * Get International goalie draft rankings
       * @returns Promise resolving to International goalie rankings
       */
      goaliesIntl: async (): Promise<APIResult<DraftRankings>> =>
         getRankings(DraftRankingsEnum.goaliesIntl),
      /**
       * Get all draft rankings (NA/Intl skaters and goalies)
       * @returns Promise resolving to array of all rankings
       */
      all: async (): Promise<APIResult<DraftRankings[]>> => {
         const unwrapAPIResponse = (
            apiResponse: APIResult<unknown>,
         ): DraftRankings => {
            if (apiResponse.success) {
               return apiResponse.data as DraftRankings;
            }
            throw apiResponse.error;
         };

         const response = await Promise.all([
            getRankings(DraftRankingsEnum.skatersNA),
            getRankings(DraftRankingsEnum.skatersIntl),
            getRankings(DraftRankingsEnum.goaliesNA),
            getRankings(DraftRankingsEnum.goaliesIntl),
         ]);
         try {
            const dataOnly = response.map((r) => unwrapAPIResponse(r));
            const newResponse: APIResult<DraftRankings[]> = {
               success: true,
               data: dataOnly,
            };
            return newResponse;
         } catch (error) {
            return {
               success: false,
               error: error as NHLError,
            };
         }
      },
   };
}

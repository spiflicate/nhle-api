/**
 * @module api/gamecenter/draft
 * @description Draft-related API endpoints for accessing NHL draft picks, rankings, and tracker information
 */

import { nhlClient } from '#/client/index.ts';
import type { APIResponse } from '#/client/types.ts';
import { type NHLError, ValidationError } from '#/errors/index.ts';
import type {
   DraftPicks,
   DraftRankings,
   DraftRound,
   DraftTracker,
   Year,
} from '#/types/index.ts';
import { getCurrentYear } from '#/utils/date.ts';
import {
   DraftParams,
   isParseError,
   Year as YearType,
} from '#/utils/schemas.ts';
import { route } from '#/utils/utils.ts';
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
): Promise<APIResponse<DraftPicks>> {
   const parsed = DraftParams({ year, round });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.draftPicks.byYearAndRound,
         }),
      };
   }
   if (parsed.year && !parsed.round)
      return nhlClient.get(route(p.draftPicks.byYear, parsed));

   return nhlClient.get(route(p.draftPicks.byYearAndRound, parsed));
}

/**
 * Get current draft tracker information for live draft coverage
 * @returns Promise resolving to current draft tracker data, including live pick information
 * @example
 * ```ts
 * tracker().then((data) => console.log(data));
 * ```
 */
export async function tracker(): Promise<APIResponse<DraftTracker>> {
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
   skatersNA: () => Promise<APIResponse<DraftRankings>>;
   skatersIntl: () => Promise<APIResponse<DraftRankings>>;
   goaliesNA: () => Promise<APIResponse<DraftRankings>>;
   goaliesIntl: () => Promise<APIResponse<DraftRankings>>;
   all: () => Promise<APIResponse<DraftRankings[]>>;
} {
   const DraftRankingsEnum = {
      skatersNA: '1',
      skatersIntl: '2',
      goaliesNA: '3',
      goaliesIntl: '4',
   } as const;
   const getRankings = async (
      type: '1' | '2' | '3' | '4',
   ): Promise<APIResponse<DraftRankings>> => {
      const parsedYear = YearType(year ?? getCurrentYear());
      if (isParseError(parsedYear)) {
         return {
            success: false,
            error: new ValidationError(parsedYear.summary, {
               endpoint: p.draftRankings,
            }),
         };
      }
      return nhlClient.get(
         route(p.draftRankings, {
            year: parsedYear,
            type,
         }),
      );
   };

   return {
      /**
       * Get North American skater draft rankings
       * @returns Promise resolving to NA skater rankings
       */
      skatersNA: async (): Promise<APIResponse<DraftRankings>> =>
         getRankings(DraftRankingsEnum.skatersNA),
      /**
       * Get International skater draft rankings
       * @returns Promise resolving to International skater rankings
       */
      skatersIntl: async (): Promise<APIResponse<DraftRankings>> =>
         getRankings(DraftRankingsEnum.skatersIntl),
      /**
       * Get North American goalie draft rankings
       * @returns Promise resolving to NA goalie rankings
       */
      goaliesNA: async (): Promise<APIResponse<DraftRankings>> =>
         getRankings(DraftRankingsEnum.goaliesNA),
      /**
       * Get International goalie draft rankings
       * @returns Promise resolving to International goalie rankings
       */
      goaliesIntl: async (): Promise<APIResponse<DraftRankings>> =>
         getRankings(DraftRankingsEnum.goaliesIntl),
      /**
       * Get all draft rankings (NA/Intl skaters and goalies)
       * @returns Promise resolving to array of all rankings
       */
      all: async (): Promise<APIResponse<DraftRankings[]>> => {
         const unwrapAPIResponse = (
            apiResponse: APIResponse<unknown>,
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
            const newResponse: APIResponse<DraftRankings[]> = {
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

/**
 * Draft-related API endpoints
 */

import nhlClient from '#/client/index.ts';
import type { APIResponse } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
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

const _paths = {
   draftPicks: {
      byYearAndRound: 'draft/picks/{year}/{round}',
      byYear: 'draft/picks/{year}/all',
   },
   draftRankings: 'draft/rankings/{year}/{type}',
   draftTracker: 'draft-tracker/picks/now',
};

const DraftRankingsEnum = {
   skatersNA: '1',
   skatersIntl: '2',
   goaliesNA: '3',
   goaliesIntl: '4',
} as const;

/**
 * Get draft picks for a specific year and round
 * @param year - The draft year
 * @param round - The draft round
 * @returns Promise resolving to draft picks for the specified year and round
 */
export const picks = (
   year?: Year,
   round?: DraftRound,
): Promise<APIResponse<DraftPicks>> => {
   const parsed = DraftParams({ year, round });
   if (isParseError(parsed)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsed.summary, {
            endpoint: _paths.draftPicks.byYearAndRound,
         }),
      });
   }
   if (parsed.year && !parsed.round)
      return nhlClient.get(route(_paths.draftPicks.byYear, parsed));

   return nhlClient.get(route(_paths.draftPicks.byYearAndRound, parsed));
};

/**
 * Get current draft tracker information
 * @returns Promise resolving to current draft tracker data
 */
export const tracker = (): Promise<APIResponse<DraftTracker>> =>
   nhlClient.get(_paths.draftTracker);

/**
 * Access draft rankings related endpoints
 */
export const rankings = (year?: Year) => {
   const getRankings = (
      type: '1' | '2' | '3' | '4',
   ): Promise<APIResponse<DraftRankings>> => {
      const parsedYear = YearType(year ?? getCurrentYear());
      if (isParseError(parsedYear)) {
         return Promise.resolve({
            status: 'error',
            error: new ValidationError(parsedYear.summary, {
               endpoint: _paths.draftRankings,
            }),
         });
      }
      return nhlClient.get(
         route(_paths.draftRankings, {
            year: parsedYear,
            type,
         }),
      );
   };

   return {
      skatersNA: (): Promise<APIResponse<DraftRankings>> =>
         getRankings(DraftRankingsEnum.skatersNA),
      skatersIntl: (): Promise<APIResponse<DraftRankings>> =>
         getRankings(DraftRankingsEnum.skatersIntl),
      goaliesNA: (): Promise<APIResponse<DraftRankings>> =>
         getRankings(DraftRankingsEnum.goaliesNA),
      goaliesIntl: (): Promise<APIResponse<DraftRankings>> =>
         getRankings(DraftRankingsEnum.goaliesIntl),
      all: (): Promise<APIResponse<DraftRankings>[]> =>
         Promise.all([
            getRankings(DraftRankingsEnum.skatersNA),
            getRankings(DraftRankingsEnum.skatersIntl),
            getRankings(DraftRankingsEnum.goaliesNA),
            getRankings(DraftRankingsEnum.goaliesIntl),
         ]),
   };
};

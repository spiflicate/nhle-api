/**
 * @module api/misc
 * @description Miscellaneous NHL API endpoints for meta information, location data, and other utility functions
 */

import nhlClient from '#/client/index.ts';
import type { APIResponse } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type {
   GameMeta,
   LocationInfo,
   NHLSeasons,
   PartnerGameInfo,
   PlayoffSeriesMeta,
   PostalCodeInfo,
} from '#/types/responses/gamecenter/index.ts';
import {
   CountryCode,
   GameId,
   isParseError,
   PostalCode,
   SeriesParams,
} from '#/utils/schemas.ts';
import { route } from '#/utils/utils.ts';

const _paths = {
   season: 'season',
   metaPlayoffSeries: 'meta/playoff-series/{year}/{seriesLetter}',
   metaGame: 'meta/game/{gameId}',
   postalLookup: 'postal-lookup/{postalCode}',
   location: 'location',
   partnerGame: 'partner-game/{countryCode}/now',
};

// returns a basic array of all valid NHL seasons
export const seasons = (): Promise<APIResponse<NHLSeasons>> => {
   return nhlClient.get(_paths.season);
};

export const meta = {
   /**
    * Get meta information for a playoff series
    *
    * @param year - The year in YYYY format
    * @param seriesLetter - Single letter identifier for the playoff series
    * @returns Promise resolving to playoff series meta information
    */
   playoffSeries: (
      seriesLetter: string,
      year?: number | string,
   ): Promise<APIResponse<PlayoffSeriesMeta>> => {
      const parsed = SeriesParams({ year, seriesLetter });
      if (isParseError(parsed)) {
         return Promise.resolve({
            status: 'error',
            error: new ValidationError(parsed.summary, {
               endpoint: _paths.metaPlayoffSeries,
            }),
         });
      }
      return nhlClient.get(route(_paths.metaPlayoffSeries, parsed));
   },

   /**
    * Get meta information for a specific game
    *
    * @param gameId - The unique game identifier
    * @returns Promise resolving to game meta information
    */
   game: (gameId: string | number): Promise<APIResponse<GameMeta>> => {
      const parsedGameId = GameId(gameId);
      if (isParseError(parsedGameId)) {
         return Promise.resolve({
            status: 'error',
            error: new ValidationError(parsedGameId.summary, {
               endpoint: _paths.metaGame,
            }),
         });
      }
      return nhlClient.get(
         route(_paths.metaGame, { gameId: parsedGameId }),
      );
   },
};

/**
 * Lookup information based on postal code
 *
 * @param postalCode - The postal/zip code to lookup
 * @returns Promise resolving to postal code information
 */
export const postalLookup = (
   postalCode: string,
): Promise<APIResponse<PostalCodeInfo>> => {
   const parsedPostalCode = PostalCode(postalCode);
   if (isParseError(parsedPostalCode)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedPostalCode.summary, {
            endpoint: _paths.postalLookup,
         }),
      });
   }
   return nhlClient.get(
      route(_paths.postalLookup, { postalCode: parsedPostalCode }),
   );
};

/**
 * Get location information
 *
 * @returns Promise resolving to the location determined by the API
 *          (assumed to be based on the user's IP address)
 */
export const location = (): Promise<APIResponse<LocationInfo>> => {
   return nhlClient.get(_paths.location);
};

/**
 * Get partner game information for a specific country
 *
 * @param countryCode - The two-letter country code (e.g. 'ca', 'se', 'cz', etc.)
 * @returns Promise resolving to partner game information
 */
export const partnerGame = (
   countryCode: string,
): Promise<APIResponse<PartnerGameInfo>> => {
   const parsedCountryCode = CountryCode(countryCode);
   if (isParseError(parsedCountryCode)) {
      return Promise.resolve({
         status: 'error',
         error: new ValidationError(parsedCountryCode.summary, {
            endpoint: _paths.partnerGame,
         }),
      });
   }
   return nhlClient.get(
      route(_paths.partnerGame, { countryCode: parsedCountryCode }),
   );
};

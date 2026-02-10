/**
 * @module api/gamecenter/misc
 * @description Miscellaneous NHL API endpoints for meta information, location data, and utility functions
 */

import { nhlClient } from '#/client/index.ts';
import type { APIResponse } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';
import type {
   CountryCode,
   GameId,
   PostalCode,
   SeriesLetter,
   Year,
} from '#/types/index.ts';
import type {
   GameMeta,
   LocationInfo,
   NHLSeasons,
   PartnerGameInfo,
   PlayoffSeriesMeta,
   PostalCodeInfo,
} from '#/types/responses/gamecenter/index.ts';
import {
   CountryCode as CountryCodeAT,
   GameId as GameIdAT,
   isParseError,
   PostalCode as PostalCodeAT,
   SeriesParams,
} from '#/utils/schemas.ts';
import { resolvePath } from '#/utils/utils.ts';
import { miscPaths as p } from './paths.ts';

/**
 * Get list of all valid NHL seasons
 * @returns Promise resolving to array of all NHL seasons
 * @example
 * ```ts
 * seasons().then((data) => console.log(data));
 * ```
 */
export async function seasons(): Promise<APIResponse<NHLSeasons>> {
   return nhlClient.get(p.season);
}

/**
 * Access meta information endpoints
 * @description Get metadata about playoff series and games
 */
export const meta = {
   game: metaGame,
   playoffSeries: metaPlayoffSeries,
};

/**
 * Get meta information for a specific game
 *
 * @param gameId - The unique game identifier (10-digit format)
 * @returns Promise resolving to game meta information
 * @example
 * ```ts
 * meta.game(2023020001).then((data) => console.log(data));
 * ```
 */
async function metaGame(gameId: GameId): Promise<APIResponse<GameMeta>> {
   const parsedGameId = GameIdAT(gameId);
   if (isParseError(parsedGameId)) {
      return {
         success: false,
         error: new ValidationError(parsedGameId.summary, {
            endpoint: p.metaGame,
         }),
      };
   }
   const path = resolvePath(p.metaGame, { gameId: parsedGameId });
   return nhlClient.get(path);
}

/**
 * Get meta information for a playoff series
 *
 * @param seriesLetter - Single letter identifier for the playoff series (A-O)
 * @param year - The year in YYYY format. Defaults to current year
 * @returns Promise resolving to playoff series meta information
 * @example
 * ```ts
 * meta.playoffSeries('A', 2023).then((data) => console.log(data));
 * ```
 */
async function metaPlayoffSeries(
   seriesLetter: SeriesLetter,
   year?: Year,
): Promise<APIResponse<PlayoffSeriesMeta>>;
async function metaPlayoffSeries(
   seriesLetter: string,
   year?: Year,
): Promise<APIResponse<PlayoffSeriesMeta>>;
async function metaPlayoffSeries(
   seriesLetter: SeriesLetter | string,
   year?: Year,
): Promise<APIResponse<PlayoffSeriesMeta>> {
   const parsed = SeriesParams({ year, seriesLetter });
   if (isParseError(parsed)) {
      return {
         success: false,
         error: new ValidationError(parsed.summary, {
            endpoint: p.metaPlayoffSeries,
         }),
      };
   }
   const path = resolvePath(p.metaPlayoffSeries, parsed);
   return nhlClient.get(path);
}

/**
 * Lookup information based on postal/zip code
 *
 * @param postalCode - The postal/zip code to lookup (US or Canadian format)
 * @returns Promise resolving to location information including lat/long coordinates
 * @example
 * ```ts
 * postalLookup('10001').then((data) => console.log(data)); // US zip
 * postalLookup('M5H 2N2').then((data) => console.log(data)); // Canadian postal
 * ```
 */
export async function postalLookup(
   postalCode: PostalCode,
): Promise<APIResponse<PostalCodeInfo>> {
   const parsedPostalCode = PostalCodeAT(postalCode);
   if (isParseError(parsedPostalCode)) {
      return {
         success: false,
         error: new ValidationError(parsedPostalCode.summary, {
            endpoint: p.postalLookup,
         }),
      };
   }
   const path = resolvePath(p.postalLookup, {
      postalCode: parsedPostalCode,
   });
   return nhlClient.get(path);
}

/**
 * Get location information based on IP address
 *
 * @returns Promise resolving to the location determined by the API
 *          (based on the user's IP address)
 * @example
 * ```ts
 * location().then((data) => console.log(data));
 * ```
 */
export async function location(): Promise<APIResponse<LocationInfo>> {
   return nhlClient.get(p.location);
}

/**
 * Get partner game information for a specific country
 *
 * @param countryCode - The three-letter country code (e.g., 'USA', 'CAN', 'SWE')
 * @returns Promise resolving to partner game information for the country
 * @example
 * ```ts
 * partnerGame('USA').then((data) => console.log(data));
 * ```
 */
export async function partnerGame(
   countryCode: CountryCode,
): Promise<APIResponse<PartnerGameInfo>> {
   const parsedCountryCode = CountryCodeAT(countryCode);
   if (isParseError(parsedCountryCode)) {
      return {
         success: false,
         error: new ValidationError(parsedCountryCode.summary, {
            endpoint: p.partnerGame,
         }),
      };
   }
   const path = resolvePath(p.partnerGame, {
      countryCode: parsedCountryCode,
   });
   return nhlClient.get(path);
}

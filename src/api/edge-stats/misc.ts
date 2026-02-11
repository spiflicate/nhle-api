/**
 * ======================================================================
 * NHL Stats API - Miscellaneous Endpoints
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Provides functions for miscellaneous operations including configuration,
 * country information, shift charts, glossary, and content modules.
 */

import { edgeStatsClient } from '#/client/index.ts';
import { envConfig } from '#/config/env.ts';
import { resolvePath } from '#/utils/utils.ts';
import { dataPaths as p } from './paths.ts';
import type {
   Config,
   Country,
   Franchise,
   GlossaryEntry,
   PaginatedResponse,
   ShiftChart,
} from './types.ts';

const defaultLang = envConfig.language;

/**
 * Get configuration information
 *
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to configuration data
 *
 * @example
 * const config = await getConfig('en');
 */
export async function getConfig(lang: string = defaultLang) {
   const path = resolvePath(p.config, { lang });
   return edgeStatsClient.get<Config>(path);
}

/**
 * Get country information
 * Returns list of all countries with a hockey presence
 *
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to country data
 *
 * @example
 * const countries = await getCountries('en');
 */
export async function getCountries(lang: string = defaultLang) {
   const path = resolvePath(p.countries, { lang });
   return edgeStatsClient.get<PaginatedResponse<Country>>(path);
}

/**
 * Get shift charts for a specific game
 *
 * @param gameId - The game ID
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to shift chart data
 *
 * @example
 * const shifts = await getShiftChart('2021020001', 'en');
 */
export async function getShiftChart(
   gameId: string | number,
   lang: string = defaultLang,
) {
   const path = resolvePath(p.shiftCharts, { lang });
   const cayenneExp = `gameId=${gameId}`;
   return edgeStatsClient.get<PaginatedResponse<ShiftChart>>(path, {
      cayenneExp,
   });
}

/**
 * Get the glossary for a specific language
 *
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to glossary data
 *
 * @example
 * const glossary = await glossary.get('en');
 */
export async function getGlossary(lang: string = defaultLang) {
   const path = resolvePath(p.glossary, { lang });
   return edgeStatsClient.get<PaginatedResponse<GlossaryEntry>>(path);
}

/**
 * Get franchise information
 *
 * @param lang - Language code (default: 'en')
 * @returns Promise resolving to franchise data
 *
 * @example
 * const allFranchises = await getFranchises('en');
 */
export async function getFranchises(lang: string = defaultLang) {
   const path = resolvePath(p.franchises, { lang });
   return edgeStatsClient.get<PaginatedResponse<Franchise>>(path);
}

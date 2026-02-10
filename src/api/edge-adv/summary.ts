/**
 * ======================================================================
 * API endpoints for the edge home page, updated daily with
 * insights from the previous days games.
 * Base url: api-web.nhle.com/v1/edge
 * Available endpoints: see `edge.paths`
 * ======================================================================
 */
import { nhlClient } from '#/client/index.ts';
import { summaryPaths as p } from './paths.ts';

/**
 * Edge Advanced Stats API helpers.
 *
 * Lightweight wrapper exposing functions that call the underlying nhlClient
 * for related endpoints. Each method returns the raw Promise from the
 * client.get call.
 */

/**
 * Get the "by the numbers" data for the current day, updated daily with
 * insights from the previous days games.
 * @returns A promise that resolves to the "by the numbers" data.
 */
export async function byTheNumbers() {
   return nhlClient.get(p.byTheNumbers);
}

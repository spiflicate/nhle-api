/**
 * ======================================================================
 * API endpoints for the edge home page, updated daily with
 * insights from the previous days games.
 * Base url: api-web.nhle.com/v1/edge
 * Available endpoints: see `edge.paths`
 * ======================================================================
 */
import { nhlClient } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import type { EdgeByTheNumbers } from '#/types/responses/edge-adv.ts';
import { summaryPaths as p } from './paths.ts';

/**
 * Edge Advanced Stats API helpers.
 *
 * Lightweight wrapper exposing functions that call the underlying nhlClient
 * for related endpoints. Each function resolves to an APIResult; invalid
 * parameters give a ValidationError result without a request.
 */

/**
 * Get the "by the numbers" data for the current day, updated daily with
 * insights from the previous days games.
 * @returns A promise that resolves to the "by the numbers" data.
 */
export async function byTheNumbers(): Promise<APIResult<EdgeByTheNumbers>> {
   return nhlClient.get<EdgeByTheNumbers>(p.byTheNumbers);
}

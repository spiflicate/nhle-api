/**
 * ======================================================================
 * API endpoints for the edge home page, updated daily with
 * insights from the previous days games.
 * Base url: api-web.nhle.com/v1/edge
 * Available endpoints: see `edge.paths`
 * ======================================================================
 */
import nhlClient from '#/client/index.ts';

/**
 * Edge Advanced Stats API helpers.
 *
 * Lightweight wrapper exposing functions that call the underlying nhlClient
 * for related endpoints. Each method returns the raw Promise from the
 * client.get call.
 */

/** API endpoint paths for edge home page data. */
const _paths = {
   byTheNumbers: 'edge/by-the-numbers/now',
};
/**
 * Get the "by the numbers" data for the current day, updated daily with
 * insights from the previous days games.
 * @returns A promise that resolves to the "by the numbers" data.
 */
export const byTheNumbers = () => nhlClient.get(_paths.byTheNumbers);

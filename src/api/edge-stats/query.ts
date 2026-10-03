/**
 * Query parameter helpers shared by the Stats API report functions.
 */
import { buildCayenneExp } from '#/utils/cayenne-query-builder.ts';
import type {
   StatsFilters,
   StatsPagination,
   StatsQueryParams,
   StatsSorting,
} from './types.ts';

/**
 * Report endpoints answer HTTP 500 without a `cayenneExp`, so send an
 * empty one when the caller gave none.
 */
export function reportParams(
   params: StatsQueryParams = {},
): StatsQueryParams {
   return { ...params, cayenneExp: params.cayenneExp ?? '' };
}

/** Turn the convenience filters, sorting and pagination into query params */
export function filterParams(
   filters: StatsFilters = {},
   sorting: StatsSorting = {},
   pagination: StatsPagination = {},
): StatsQueryParams {
   const conditions: Record<string, string | number> = {};
   for (const [field, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '') conditions[field] = value;
   }

   const params: StatsQueryParams = {
      cayenneExp: buildCayenneExp(conditions),
   };
   if (sorting.sortBy) params.sort = sorting.sortBy;
   if (sorting.direction) params.dir = sorting.direction;
   if (pagination.limit !== undefined) params.limit = pagination.limit;
   if (pagination.start !== undefined) params.start = pagination.start;
   return params;
}

/**
 * Values outside a declared union, for spotting drift that keeps the
 * shape: a `position` field that starts sending `LW` is still a string.
 */
import type {
   DraftPositionCode,
   PositionCode,
} from '#/types/responses/gamecenter/common.ts';

/** Every member of a string union, checked both ways by the compiler */
function members<T extends string>() {
   return <const A extends readonly T[]>(
      values: A &
         ([Exclude<T, A[number]>] extends [never] ? unknown : never),
   ): ReadonlySet<string> => new Set(values);
}

export const POSITION_CODES = members<PositionCode>()([
   'C',
   'L',
   'R',
   'D',
   'G',
]);

export const DRAFT_POSITION_CODES = members<DraftPositionCode>()([
   'C',
   'LW',
   'RW',
   'D',
   'G',
   'F',
   'C/LW',
   'C/RW',
   'LW/RW',
]);

export interface UnknownValue {
   path: string;
   value: string;
}

/**
 * Every string under a `position` or `positionCode` key that `allowed`
 * lacks, once per path and value.
 */
export function unknownPositions(
   data: unknown,
   allowed: ReadonlySet<string>,
): UnknownValue[] {
   const found = new Map<string, UnknownValue>();
   const walk = (v: unknown, path: string) => {
      if (Array.isArray(v)) {
         for (const item of v) walk(item, `${path}[]`);
      } else if (v !== null && typeof v === 'object') {
         for (const [k, child] of Object.entries(v)) {
            const at = `${path}.${/^\d+$/.test(k) ? '{id}' : k}`;
            const isPosition = k === 'position' || k === 'positionCode';
            if (isPosition && typeof child === 'string') {
               if (!allowed.has(child)) {
                  found.set(`${at}=${child}`, { path: at, value: child });
               }
            } else {
               walk(child, at);
            }
         }
      }
   };
   walk(data, '$');
   return [...found.values()].sort(
      (a, b) =>
         a.path.localeCompare(b.path) || a.value.localeCompare(b.value),
   );
}

/**
 * The position codes a check's response types declare: the draft
 * endpoints use `DraftPositionCode`, the rest of `gc` `PositionCode`.
 * Other namespaces type positions as plain strings.
 */
export function positionsFor(
   check: string,
): ReadonlySet<string> | undefined {
   if (check.startsWith('gc.draft.')) return DRAFT_POSITION_CODES;
   if (check.startsWith('gc.')) return POSITION_CODES;
   return undefined;
}

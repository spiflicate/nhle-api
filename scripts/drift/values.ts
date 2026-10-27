/**
 * Values outside a declared union, for spotting drift that keeps the
 * shape: a `position` field that starts sending `LW`, or a `gameState`
 * that starts sending `OVER`, is still a string.
 */
import type {
   DraftPositionCode,
   GameState,
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

export const GAME_STATES = members<GameState>()([
   'FUT',
   'PRE',
   'LIVE',
   'CRIT',
   'OVER',
   'FINAL',
   'OFF',
]);

/** The kinds of value checked against a declared union */
export type ValueKind = 'position' | 'gameState';

export const VALUE_KINDS: readonly ValueKind[] = ['position', 'gameState'];

/** The keys each kind of value is found under */
const KEYS: Record<ValueKind, readonly string[]> = {
   position: ['position', 'positionCode'],
   gameState: ['gameState'],
};

/** How findings name each kind of value */
export const VALUE_LABELS: Record<ValueKind, string> = {
   position: 'position code',
   gameState: 'game state',
};

export interface UnknownValue {
   kind: ValueKind;
   path: string;
   value: string;
}

/** One line describing an undeclared value, in Markdown */
export function describeValue(v: UnknownValue): string {
   return `unknown ${VALUE_LABELS[v.kind]} \`${v.value}\` at \`${v.path}\``;
}

/**
 * Every string under a key of `kind` that `allowed` lacks, once per path
 * and value.
 */
export function unknownValues(
   data: unknown,
   kind: ValueKind,
   allowed: ReadonlySet<string>,
): UnknownValue[] {
   const keys = KEYS[kind];
   const found = new Map<string, UnknownValue>();
   const walk = (v: unknown, path: string) => {
      if (Array.isArray(v)) {
         for (const item of v) walk(item, `${path}[]`);
      } else if (v !== null && typeof v === 'object') {
         for (const [k, child] of Object.entries(v)) {
            const at = `${path}.${/^\d+$/.test(k) ? '{id}' : k}`;
            if (keys.includes(k) && typeof child === 'string') {
               if (!allowed.has(child)) {
                  found.set(`${at}=${child}`, {
                     kind,
                     path: at,
                     value: child,
                  });
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
 * The values of `kind` a check's response types declare. Positions: the
 * draft endpoints use `DraftPositionCode`, the rest of `gc`
 * `PositionCode`. Game states: all of `gc` uses `GameState`. Other
 * namespaces type both as plain strings.
 */
export function allowedValues(
   check: string,
   kind: ValueKind,
): ReadonlySet<string> | undefined {
   if (!check.startsWith('gc.')) return undefined;
   if (kind === 'gameState') return GAME_STATES;
   return check.startsWith('gc.draft.')
      ? DRAFT_POSITION_CODES
      : POSITION_CODES;
}

/** Every undeclared value of every kind in a check's response */
export function unknownValuesFor(
   check: string,
   data: unknown,
): UnknownValue[] {
   return VALUE_KINDS.flatMap((kind) => {
      const allowed = allowedValues(check, kind);
      return allowed ? unknownValues(data, kind, allowed) : [];
   });
}

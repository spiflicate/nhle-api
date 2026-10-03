/**
 * The API drift check (scripts/check-drift.ts): shape diffing and
 * coverage of every public function.
 */
import { describe, expect, test } from 'bun:test';
import * as api from '#/api/index.ts';
import baseline from '../../scripts/drift/baseline.json' with {
   type: 'json',
};
import { checks } from '../../scripts/drift/checks.ts';
import {
   diffShapes,
   mergeShapes,
   shapeOf,
} from '../../scripts/drift/shape.ts';

describe('shapeOf', () => {
   test('merges array items and id-keyed entries', () => {
      expect(
         shapeOf({
            games: [{ id: 1 }, { id: 2, note: null }],
            teams: { 3: { name: 'A' }, 4: { name: 'B' } },
         }),
      ).toEqual({
         $: 'object',
         '$.games': 'array',
         '$.games[]': 'object',
         '$.games[].id': 'number',
         '$.games[].note': 'null',
         '$.teams': 'object',
         '$.teams.{id}': 'object',
         '$.teams.{id}.name': 'string',
      });
   });

   test('merges the translations of a localized string', () => {
      expect(
         shapeOf({
            players: [
               { name: { default: 'A' } },
               { name: { default: 'B', cs: 'B', fi: 'B' } },
            ],
         }),
      ).toEqual({
         $: 'object',
         '$.players': 'array',
         '$.players[]': 'object',
         '$.players[].name': 'object',
         '$.players[].name.default': 'string',
         '$.players[].name.{lang}': 'string',
      });
   });

   test('keeps two-letter keys outside localized strings', () => {
      expect(shapeOf({ pp: 1 })).toEqual({ $: 'object', '$.pp': 'number' });
   });

   test('records every kind seen at a path', () => {
      expect(shapeOf([1, 'a', 2])['$[]']).toBe('number|string');
   });
});

describe('diffShapes', () => {
   const base = shapeOf({ list: [{ a: '1', b: '2' }], meta: { c: 1 } });

   test('no changes for the same structure with other data', () => {
      const live = shapeOf({
         list: [{ a: 'x', b: 'y' }, { a: 'z' }],
         meta: { c: 9 },
      });
      expect(diffShapes(base, live)).toEqual([]);
   });

   test('reports an added field once, at its top', () => {
      const live = shapeOf({
         list: [{ a: '1', b: '2', extra: { deep: 1 } }],
         meta: { c: 1 },
      });
      expect(diffShapes(base, live)).toEqual([
         { kind: 'added', path: '$.list[].extra', live: 'object' },
      ]);
   });

   test('reports a removed field when its parent is present', () => {
      const live = shapeOf({ list: [{ a: '1' }], meta: { c: 1 } });
      expect(diffShapes(base, live)).toEqual([
         { kind: 'removed', path: '$.list[].b', baseline: 'string' },
      ]);
   });

   test('an empty list removes nothing', () => {
      const live = shapeOf({ list: [], meta: { c: 1 } });
      expect(diffShapes(base, live)).toEqual([]);
   });

   test('reports a changed kind, but tolerates null', () => {
      const live = shapeOf({ list: [{ a: 1, b: null }], meta: { c: 1 } });
      expect(diffShapes(base, live)).toEqual([
         {
            kind: 'changed',
            path: '$.list[].a',
            baseline: 'string',
            live: 'number',
         },
      ]);
   });

   test('children of a retyped field are part of that change', () => {
      const live = shapeOf({ list: [{ a: '1', b: '2' }], meta: [1] });
      expect(diffShapes(base, live).map((c) => c.path)).toEqual(['$.meta']);
   });
});

describe('mergeShapes', () => {
   test('keeps every path and kind from both shapes', () => {
      const merged = mergeShapes(
         shapeOf({ a: 1, clock: { running: true } }),
         shapeOf({ a: 'x' }),
      );
      expect(merged).toEqual({
         $: 'object',
         '$.a': 'number|string',
         '$.clock': 'object',
         '$.clock.running': 'boolean',
      });
      expect(diffShapes(merged, shapeOf({ a: 2 }))).toEqual([
         { kind: 'removed', path: '$.clock', baseline: 'object' },
      ]);
   });
});

/** `ns.fn` for every function in the public API, nested namespaces too */
function functionNames(mod: object, prefix = ''): string[] {
   return Object.entries(mod).flatMap(([key, value]) => {
      const name = `${prefix}${key}`;
      if (typeof value === 'function') return [name];
      if (value && typeof value === 'object') {
         return functionNames(value, `${name}.`);
      }
      return [];
   });
}

describe('drift checks', () => {
   const names = checks.map((c) => c.name);

   test('cover every public function', () => {
      const covered = new Set(names.map((n) => n.split(' ')[0]));
      const missing = functionNames(api).filter((f) => !covered.has(f));
      expect(missing).toEqual([]);
   });

   test('have unique names', () => {
      expect(new Set(names).size).toBe(names.length);
   });

   test('each data check has a baseline', () => {
      const shapes: Record<string, unknown> = baseline;
      const missing = checks
         .filter((c) => !c.expectError && !shapes[c.name])
         .map((c) => c.name);
      expect(missing).toEqual([]);
   });
});

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
   type Finding,
   type Judge,
   mergeFindings,
   type RunFinding,
   readState,
   writeState,
} from '../../scripts/drift/findings.ts';
import {
   diffShapes,
   mergeShapes,
   shapeOf,
} from '../../scripts/drift/shape.ts';
import {
   DRAFT_POSITION_CODES,
   POSITION_CODES,
   positionsFor,
   unknownPositions,
} from '../../scripts/drift/values.ts';

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

   test('translations of a known localized string are not drift', () => {
      const plain = shapeOf({ name: { default: 'Montreal' } });
      const translated = shapeOf({
         name: { default: 'Montreal', fr: 'Montréal' },
      });
      expect(diffShapes(plain, translated)).toEqual([]);
      expect(diffShapes(translated, plain)).toEqual([]);
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

describe('unknownPositions', () => {
   test('reports each undeclared code once per path', () => {
      expect(
         unknownPositions(
            {
               homeTeam: {
                  forwards: [
                     { position: 'C' },
                     { position: 'LW' },
                     { position: 'LW' },
                  ],
               },
               players: { 8478402: { positionCode: 'W' } },
            },
            POSITION_CODES,
         ),
      ).toEqual([
         { path: '$.homeTeam.forwards[].position', value: 'LW' },
         { path: '$.players.{id}.positionCode', value: 'W' },
      ]);
   });

   test('accepts declared codes and ignores non-string positions', () => {
      expect(
         unknownPositions(
            {
               picks: [{ position: 'C/LW' }, { position: 'RW' }],
               position: { x: 1 },
            },
            DRAFT_POSITION_CODES,
         ),
      ).toEqual([]);
   });
});

describe('positionsFor', () => {
   test('picks the draft codes for draft checks', () => {
      expect(positionsFor('gc.draft.picks 2024 1')).toBe(
         DRAFT_POSITION_CODES,
      );
      expect(positionsFor('gc.game.boxscore')).toBe(POSITION_CODES);
      expect(positionsFor('stats.skater')).toBeUndefined();
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

describe('mergeFindings', () => {
   const added: RunFinding = {
      check: 'gc.score',
      kind: 'added',
      path: '$.x',
      kinds: 'string',
      text: 'added `$.x` (string)',
   };
   const tracked = (f: RunFinding, seen = '2026-10-01'): Finding => ({
      ...f,
      firstSeen: seen,
      lastSeen: seen,
   });
   const judge = (
      status: string,
      options: { volatile?: boolean; shape?: Record<string, string> } = {},
   ): Judge => ({
      checks: new Map([
         ['gc.score', { status, volatile: options.volatile ?? false }],
      ]),
      baseline: { 'gc.score': options.shape ?? { $: 'object' } },
      positionsFor: () => new Set(['C']),
   });

   test('adds new findings and reports them as fresh', () => {
      const { findings, fresh } = mergeFindings(
         [],
         [added],
         judge('drift'),
         '2026-10-02',
      );
      expect(findings).toEqual([
         { ...added, firstSeen: '2026-10-02', lastSeen: '2026-10-02' },
      ]);
      expect(fresh).toEqual(findings);
   });

   test('keeps a finding seen again, without reporting it as fresh', () => {
      const { findings, fresh } = mergeFindings(
         [tracked(added)],
         [added],
         judge('drift'),
         '2026-10-02',
      );
      expect(findings).toEqual([
         { ...added, firstSeen: '2026-10-01', lastSeen: '2026-10-02' },
      ]);
      expect(fresh).toEqual([]);
   });

   test('keeps a volatile finding a run did not see open', () => {
      const { findings } = mergeFindings(
         [tracked(added)],
         [],
         judge('ok', { volatile: true }),
         '2026-10-02',
      );
      expect(findings).toEqual([tracked(added)]);
   });

   test('keeps a finding open while its check is unavailable', () => {
      const { findings } = mergeFindings(
         [tracked(added)],
         [],
         judge('unavailable'),
         '2026-10-02',
      );
      expect(findings[0]?.resolved).toBeUndefined();
   });

   test('resolves a stable finding a run compared and did not see', () => {
      const { findings } = mergeFindings(
         [tracked(added)],
         [],
         judge('ok'),
         '2026-10-02',
      );
      expect(findings[0]?.resolved).toBe('2026-10-02');
   });

   test('resolves a volatile finding once the baseline accepts it', () => {
      const { findings } = mergeFindings(
         [tracked(added)],
         [],
         judge('ok', { volatile: true, shape: { '$.x': 'string' } }),
         '2026-10-02',
      );
      expect(findings[0]?.resolved).toBe('2026-10-02');
   });

   test('resolves an unknown position code once the types declare it', () => {
      const position: RunFinding = {
         check: 'gc.score',
         kind: 'position',
         path: '$.position',
         value: 'C',
         text: 'unknown position code `C` at `$.position`',
      };
      const { findings } = mergeFindings(
         [tracked(position)],
         [],
         judge('ok', { volatile: true }),
         '2026-10-02',
      );
      expect(findings[0]?.resolved).toBe('2026-10-02');
   });

   test('resolves an outage once the check answers', () => {
      const outage: RunFinding = {
         check: 'gc.score',
         kind: 'unavailable',
         text: 'unavailable: NetworkError',
      };
      const { findings } = mergeFindings(
         [tracked(outage)],
         [],
         judge('ok', { volatile: true }),
         '2026-10-02',
      );
      expect(findings[0]?.resolved).toBe('2026-10-02');
   });

   test('reopens a resolved finding that comes back', () => {
      const { findings, fresh } = mergeFindings(
         [{ ...tracked(added), resolved: '2026-10-01' }],
         [added],
         judge('drift'),
         '2026-10-02',
      );
      expect(findings).toEqual([
         { ...added, firstSeen: '2026-10-01', lastSeen: '2026-10-02' },
      ]);
      expect(fresh).toEqual(findings);
   });
});

describe('drift state', () => {
   test('round-trips through a report', () => {
      const findings: Finding[] = [
         {
            check: 'gc.score',
            kind: 'unexpected',
            text: 'unexpected: a `-->` in the text',
            firstSeen: '2026-10-01',
            lastSeen: '2026-10-02',
         },
      ];
      const body = `# Report\n\n${writeState(findings)}\n\n---\nLatest run`;
      expect(readState(body)).toEqual(findings);
   });

   test('reads no findings from a body without state', () => {
      expect(readState('# NHL API drift check')).toEqual([]);
      expect(readState('<!-- drift-state:bm90IGpzb24= -->')).toEqual([]);
   });
});

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

/**
 * Call every public library function against the live NHL APIs and
 * compare each response's shape with the committed baseline.
 *
 *    bun scripts/check-drift.ts                  # check, exit 1 on drift
 *    bun scripts/check-drift.ts --update         # accept live shapes
 *    bun scripts/check-drift.ts --report out.md  # also write a report
 *
 * Fails when an endpoint is unreachable, an error response stops looking
 * the way the client expects, or a response gains, loses or retypes a
 * field. Runs on a schedule in .github/workflows/drift.yml.
 */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { APIResult } from '#/client/types.ts';
import { config } from '#/config/index.ts';
import { ErrorCategory, NHLError } from '#/errors/index.ts';
import type { DriftCheck } from './drift/checks.ts';
import {
   type Change,
   diffShapes,
   mergeShapes,
   type Shape,
   shapeOf,
} from './drift/shape.ts';

export const BASELINE_PATH = join(import.meta.dir, 'drift/baseline.json');

type Status =
   | 'ok'
   | 'empty'
   | 'drift'
   | 'unavailable'
   | 'unexpected'
   | 'no baseline';

interface Outcome {
   check: DriftCheck;
   status: Status;
   detail: string;
   changes: Change[];
   /** Removed fields on volatile checks: reported, not failed */
   notes: Change[];
   shape?: Shape;
}

const FAILING: Status[] = [
   'drift',
   'unavailable',
   'unexpected',
   'no baseline',
];
const RETRYABLE = new Set<string>([
   ErrorCategory.NETWORK,
   ErrorCategory.SERVER,
   ErrorCategory.RATE_LIMIT,
]);

/** Run a check, turning a rejection into a failed result */
async function attempt(check: DriftCheck): Promise<APIResult<unknown>> {
   try {
      return await check.run();
   } catch (error) {
      return {
         success: false,
         error:
            error instanceof NHLError
               ? error
               : new NHLError(String(error), ErrorCategory.CLIENT),
      };
   }
}

/** Run a check, retrying network and server failures twice */
async function call(check: DriftCheck): Promise<APIResult<unknown>> {
   let result = await attempt(check);
   for (const wait of [2000, 5000]) {
      if (result.success || !RETRYABLE.has(result.error.category)) break;
      await Bun.sleep(wait);
      result = await attempt(check);
   }
   return result;
}

function isEmpty(data: unknown): boolean {
   if (data === null || data === undefined) return true;
   if (Array.isArray(data)) return data.length === 0;
   if (typeof data === 'object') return Object.keys(data).length === 0;
   return false;
}

async function evaluate(
   check: DriftCheck,
   baseline: Record<string, Shape>,
): Promise<Outcome> {
   const base = { check, changes: [], notes: [] };
   const result = await call(check);

   if (check.expectError) {
      if (result.success) {
         return {
            ...base,
            status: 'unexpected',
            detail: `expected ${check.expectError}, got data`,
         };
      }
      const got = result.error.name;
      if (got === check.expectError) {
         return { ...base, status: 'ok', detail: got };
      }
      return {
         ...base,
         status: RETRYABLE.has(result.error.category)
            ? 'unavailable'
            : 'unexpected',
         detail: `expected ${check.expectError}, got ${got}: ${result.error.message}`,
      };
   }

   if (!result.success) {
      const { error } = result;
      return {
         ...base,
         status: RETRYABLE.has(error.category)
            ? 'unavailable'
            : 'unexpected',
         detail: `${error.name}: ${error.message}`,
      };
   }

   if (isEmpty(result.data)) {
      return check.volatile
         ? { ...base, status: 'empty', detail: 'no data today' }
         : { ...base, status: 'unexpected', detail: 'empty response' };
   }

   const shape = shapeOf(result.data);
   const expected = baseline[check.name];
   if (!expected) {
      return { ...base, shape, status: 'no baseline', detail: '' };
   }

   const all = diffShapes(expected, shape);
   // Date-dependent data may just lack a field today
   const isNote = (c: Change) => check.volatile && c.kind === 'removed';
   const notes = all.filter(isNote);
   const changes = all.filter((c) => !isNote(c));
   return {
      ...base,
      shape,
      changes,
      notes,
      status: changes.length > 0 ? 'drift' : 'ok',
      detail:
         changes.length > 0
            ? `${changes.length} field change${changes.length === 1 ? '' : 's'}`
            : '',
   };
}

function describe(c: Change): string {
   switch (c.kind) {
      case 'added':
         return `added \`${c.path}\` (${c.live})`;
      case 'removed':
         return `removed \`${c.path}\` (was ${c.baseline})`;
      case 'changed':
         return `changed \`${c.path}\`: ${c.baseline} → ${c.live}`;
   }
}

const ICON: Record<Status, string> = {
   ok: '✅',
   empty: '⚪',
   drift: '❌',
   unavailable: '❌',
   unexpected: '❌',
   'no baseline': '❌',
};

function report(outcomes: Outcome[], updated: boolean): string {
   const failed = outcomes.filter((o) => FAILING.includes(o.status));
   const lines = [
      '# NHL API drift check',
      '',
      updated
         ? 'Baseline updated from the live APIs.'
         : failed.length === 0
           ? `All ${outcomes.length} checks match the baseline.`
           : `${failed.length} of ${outcomes.length} checks failed.`,
      '',
      '| Check | Status | Detail |',
      '| --- | --- | --- |',
      ...outcomes.map(
         (o) =>
            `| \`${o.check.name}\` | ${ICON[o.status]} ${o.status} | ${o.detail.replaceAll('|', '\\|')} |`,
      ),
   ];
   for (const o of outcomes) {
      if (o.changes.length === 0 && o.notes.length === 0) continue;
      lines.push('', `## \`${o.check.name}\``, '');
      lines.push(...o.changes.map((c) => `- ${describe(c)}`));
      if (o.notes.length > 0) {
         lines.push(
            '',
            'Not in today’s data (normal for date-dependent results):',
            '',
            ...o.notes.map((c) => `- ${describe(c)}`),
         );
      }
   }
   if (failed.length > 0 && !updated) {
      lines.push(
         '',
         '## Next steps',
         '',
         '- **unavailable**: the API did not answer. Re-run the workflow; if it persists, the endpoint may have moved.',
         '- **unexpected**: the call failed or returned nothing where data or a specific error was expected.',
         '- **drift**: update the response types in `src/types/responses/`, then accept the new shapes with `bun run drift --update`.',
      );
   }
   return `${lines.join('\n')}\n`;
}

async function main() {
   const args = process.argv.slice(2);
   const update = args.includes('--update');
   const reportAt = args.indexOf('--report');
   const reportPath = reportAt >= 0 ? args[reportAt + 1] : undefined;

   config.logLevel = 'silent';
   config.timeout = 15_000;
   const { checks } = await import('./drift/checks.ts');
   const baseline: Record<string, Shape> = JSON.parse(
      readFileSync(BASELINE_PATH, 'utf8'),
   );

   const outcomes: Outcome[] = [];
   for (const check of checks) {
      const outcome = await evaluate(check, baseline);
      outcomes.push(outcome);
      console.log(
         `${ICON[outcome.status]} ${check.name}: ${outcome.status}${outcome.detail ? ` (${outcome.detail})` : ''}`,
      );
   }

   if (update) {
      const next: Record<string, Shape> = {};
      for (const o of outcomes) {
         if (o.check.expectError) continue;
         const before = baseline[o.check.name];
         const shape =
            o.check.volatile && before && o.shape
               ? mergeShapes(before, o.shape)
               : (o.shape ?? before);
         if (shape) next[o.check.name] = shape;
      }
      writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 3)}\n`);
      console.log(`\nWrote ${BASELINE_PATH}`);
   }

   const text = report(outcomes, update);
   if (reportPath) writeFileSync(reportPath, text);
   if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
   }

   const failed = outcomes.filter((o) => FAILING.includes(o.status));
   const blocking = update
      ? failed.filter(
           (o) => o.status !== 'drift' && o.status !== 'no baseline',
        )
      : failed;
   if (blocking.length > 0) {
      for (const o of blocking) {
         console.log(`\n${o.check.name}: ${o.status} ${o.detail}`);
         for (const c of o.changes) console.log(`  ${describe(c)}`);
      }
      process.exit(1);
   }
}

if (import.meta.main) await main();

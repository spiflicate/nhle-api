/**
 * Call every public library function against the live NHL APIs and
 * compare each response's shape with the committed baseline.
 *
 *    bun scripts/check-drift.ts                  # check, exit 1 on drift
 *    bun scripts/check-drift.ts --update         # accept live shapes
 *    bun scripts/check-drift.ts --report out.md  # also write a report
 *    bun scripts/check-drift.ts --report out.md --previous issue.md --new new.md
 *
 * With --previous (the drift issue's body, which may be missing), the
 * findings that report tracked are merged with this run's, so a finding
 * stays in the report and fails the check until it is resolved, even on
 * days its data doesn't show it. --new writes the findings that are new
 * or reopened since then, if there are any.
 *
 * Fails when an endpoint is unreachable, an error response stops looking
 * the way the client expects, or a response gains, loses or retypes a
 * field, or sends a position code its types don't declare. Runs on a
 * schedule in .github/workflows/drift.yml.
 */
import {
   appendFileSync,
   existsSync,
   readFileSync,
   writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import type { APIResult } from '#/client/types.ts';
import { config } from '#/config/index.ts';
import { ErrorCategory, NHLError } from '#/errors/index.ts';
import type { DriftCheck } from './drift/checks.ts';
import {
   type Finding,
   listFindings,
   mergeFindings,
   type RunFinding,
   readState,
   writeState,
} from './drift/findings.ts';
import {
   type Change,
   diffShapes,
   mergeShapes,
   type Shape,
   shapeOf,
} from './drift/shape.ts';
import {
   positionsFor,
   type UnknownValue,
   unknownPositions,
} from './drift/values.ts';

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
   /** Position codes outside the declared union */
   values: UnknownValue[];
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
   const base = { check, changes: [], values: [], notes: [] };
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
   const allowed = positionsFor(check.name);
   const values = allowed ? unknownPositions(result.data, allowed) : [];
   const expected = baseline[check.name];
   if (!expected) {
      return { ...base, shape, values, status: 'no baseline', detail: '' };
   }

   const all = diffShapes(expected, shape);
   // Date-dependent data may just lack a field today
   const isNote = (c: Change) => check.volatile && c.kind === 'removed';
   const notes = all.filter(isNote);
   const changes = all.filter((c) => !isNote(c));
   const detail = [
      changes.length > 0 &&
         `${changes.length} field change${changes.length === 1 ? '' : 's'}`,
      values.length > 0 &&
         `${values.length} unknown position code${values.length === 1 ? '' : 's'}`,
   ]
      .filter(Boolean)
      .join(', ');
   return {
      ...base,
      shape,
      changes,
      values,
      notes,
      status: changes.length > 0 || values.length > 0 ? 'drift' : 'ok',
      detail,
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

/** This run's failures, as findings to track across runs */
function findingsOf(o: Outcome): RunFinding[] {
   const check = o.check.name;
   if (o.status !== 'drift') {
      if (!FAILING.includes(o.status)) return [];
      const text = o.detail ? `${o.status}: ${o.detail}` : o.status;
      return [{ check, kind: o.status as RunFinding['kind'], text }];
   }
   return [
      ...o.changes.map(
         (c): RunFinding => ({
            check,
            kind: c.kind,
            path: c.path,
            ...(c.kind === 'removed' ? {} : { kinds: c.live }),
            text: describe(c),
         }),
      ),
      ...o.values.map(
         (v): RunFinding => ({
            check,
            kind: 'position',
            path: v.path,
            value: v.value,
            text: `unknown position code \`${v.value}\` at \`${v.path}\``,
         }),
      ),
   ];
}

interface Tracked {
   findings: Finding[];
   today: string;
}

function report(
   outcomes: Outcome[],
   updated: boolean,
   tracked?: Tracked,
): string {
   const failed = outcomes.filter((o) => FAILING.includes(o.status));
   const open = tracked?.findings.filter((f) => !f.resolved) ?? [];
   const closed = tracked?.findings.filter((f) => f.resolved) ?? [];
   const summary = updated
      ? 'Baseline updated from the live APIs.'
      : failed.length === 0
        ? `All ${outcomes.length} checks match the baseline.`
        : `${failed.length} of ${outcomes.length} checks failed.`;
   const carried = open.filter((f) => f.lastSeen !== tracked?.today);
   const lines = [
      '# NHL API drift check',
      '',
      tracked && !updated
         ? `${summary} ${open.length} open finding${open.length === 1 ? '' : 's'}` +
           (carried.length > 0
              ? `, ${carried.length} of them not seen in this run.`
              : '.')
         : summary,
      '',
      '| Check | Status | Detail |',
      '| --- | --- | --- |',
      ...outcomes.map(
         (o) =>
            `| \`${o.check.name}\` | ${ICON[o.status]} ${o.status} | ${o.detail.replaceAll('|', '\\|')} |`,
      ),
   ];
   if (tracked && open.length > 0) {
      lines.push(
         '',
         '## Open findings',
         '',
         'Everything this issue has reported that is not resolved yet, including findings a later run did not see.',
         ...listFindings(open, tracked.today),
      );
   }
   if (tracked && closed.length > 0) {
      lines.push(
         '',
         '## Resolved findings',
         ...listFindings(closed, tracked.today),
      );
   }
   if (tracked) lines.push('', '## This run');
   for (const o of outcomes) {
      if (
         o.changes.length === 0 &&
         o.values.length === 0 &&
         o.notes.length === 0
      )
         continue;
      lines.push('', `${tracked ? '###' : '##'} \`${o.check.name}\``, '');
      lines.push(...o.changes.map((c) => `- ${describe(c)}`));
      lines.push(
         ...o.values.map(
            (v) =>
               `- unknown position code \`${v.value}\` at \`${v.path}\``,
         ),
      );
      if (o.notes.length > 0) {
         lines.push(
            '',
            'Not in today’s data (normal for date-dependent results):',
            '',
            ...o.notes.map((c) => `- ${describe(c)}`),
         );
      }
   }
   if ((failed.length > 0 || open.length > 0) && !updated) {
      lines.push(
         '',
         '## Next steps',
         '',
         '- **unavailable**: the API did not answer. Re-run the workflow; if it persists, the endpoint may have moved.',
         '- **unexpected**: the call failed or returned nothing where data or a specific error was expected.',
         '- **drift**: update the response types in `src/types/responses/`, then accept the new shapes with `bun run drift --update`. An unknown position code needs `PositionCode` or `DraftPositionCode` (and the lists in `scripts/drift/values.ts`) widened instead.',
      );
      if (tracked) {
         lines.push(
            '- An open finding is resolved once the baseline or types accept it, or, for results that don’t depend on the date, once a run no longer sees it. To drop findings that will never come back, close this issue; the next drift opens a fresh one.',
         );
      }
   }
   if (tracked) lines.push('', writeState(tracked.findings));
   return `${lines.join('\n')}\n`;
}

async function main() {
   const args = process.argv.slice(2);
   const update = args.includes('--update');
   const reportAt = args.indexOf('--report');
   const reportPath = reportAt >= 0 ? args[reportAt + 1] : undefined;
   const previousAt = args.indexOf('--previous');
   const previousPath =
      previousAt >= 0 && !update ? args[previousAt + 1] : undefined;
   const newAt = args.indexOf('--new');
   const newPath = newAt >= 0 ? args[newAt + 1] : undefined;

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

   let tracked: Tracked | undefined;
   if (previousPath !== undefined) {
      const today = new Date().toISOString().slice(0, 10);
      const previous = existsSync(previousPath)
         ? readState(readFileSync(previousPath, 'utf8'))
         : [];
      const { findings, fresh } = mergeFindings(
         previous,
         outcomes.flatMap(findingsOf),
         {
            checks: new Map(
               outcomes.map((o) => [
                  o.check.name,
                  { status: o.status, volatile: !!o.check.volatile },
               ]),
            ),
            baseline,
            positionsFor,
         },
         today,
      );
      tracked = { findings, today };
      if (newPath && fresh.length > 0) {
         writeFileSync(
            newPath,
            `${['New API drift since the last report:', ...listFindings(fresh, today)].join('\n')}\n`,
         );
      }
   }

   const text = report(outcomes, update, tracked);
   if (reportPath) writeFileSync(reportPath, text);
   if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
   }

   const open = tracked?.findings.filter((f) => !f.resolved) ?? [];
   if (open.length > 0) {
      console.log('\nOpen findings:');
      for (const f of open) console.log(`  ${f.check}: ${f.text}`);
      process.exit(1);
   }

   const failed = outcomes.filter((o) => FAILING.includes(o.status));
   // --update accepts shapes, but an unknown position code needs a type change
   const blocking = update
      ? failed.filter(
           (o) =>
              o.values.length > 0 ||
              (o.status !== 'drift' && o.status !== 'no baseline'),
        )
      : failed;
   if (blocking.length > 0) {
      for (const o of blocking) {
         console.log(`\n${o.check.name}: ${o.status} ${o.detail}`);
         for (const c of o.changes) console.log(`  ${describe(c)}`);
         for (const v of o.values) {
            console.log(`  unknown position code ${v.value} at ${v.path}`);
         }
      }
      process.exit(1);
   }
}

if (import.meta.main) await main();

/**
 * Drift findings that outlive a single run.
 *
 * One run only sees one day of data: a field that shows up during live
 * games, or an endpoint that fails once, may be gone by the next run.
 * The drift issue carries every finding it has reported, and each run
 * merges its own findings into that list, so a finding stays open until
 * the baseline (or the types) accept it, rather than until a run
 * happens not to see it.
 */
import type { Shape } from './shape.ts';

export type FindingKind =
   | 'added'
   | 'removed'
   | 'changed'
   | 'position'
   | 'unavailable'
   | 'unexpected'
   | 'no baseline';

/** A finding as one run reports it */
export interface RunFinding {
   check: string;
   kind: FindingKind;
   /** Field path, for shape and position findings */
   path?: string;
   /** Live kinds at `path`, for added and changed fields */
   kinds?: string;
   /** The undeclared code, for position findings */
   value?: string;
   /** Markdown description */
   text: string;
}

/** A finding tracked across runs */
export interface Finding extends RunFinding {
   /** Dates (YYYY-MM-DD) the finding was first and last reported */
   firstSeen: string;
   lastSeen: string;
   /** Date the finding was resolved; unset while it is open */
   resolved?: string;
}

/** How a check fared in this run */
export interface CheckRun {
   status: string;
   volatile: boolean;
}

export interface Judge {
   /** Every check in this run, by name */
   checks: ReadonlyMap<string, CheckRun>;
   baseline: Readonly<Record<string, Shape>>;
   positionsFor: (check: string) => ReadonlySet<string> | undefined;
}

const ERRORS: FindingKind[] = ['unavailable', 'unexpected'];

function keyOf(f: RunFinding): string {
   return [f.check, f.kind, f.path ?? '', f.value ?? ''].join('\0');
}

/** Whether the committed baseline or types now accept a finding */
function accepted(f: Finding, judge: Judge): boolean {
   const shape = judge.baseline[f.check];
   switch (f.kind) {
      case 'added':
      case 'changed': {
         const known = new Set((shape?.[f.path ?? ''] ?? '').split('|'));
         return (f.kinds ?? '').split('|').every((k) => known.has(k));
      }
      case 'removed':
         return shape !== undefined && !((f.path ?? '') in shape);
      case 'position':
         return judge.positionsFor(f.check)?.has(f.value ?? '') ?? true;
      case 'no baseline':
         return shape !== undefined;
      default:
         return false;
   }
}

/** Whether an open finding this run did not report is resolved */
function isResolved(f: Finding, judge: Judge): boolean {
   const run = judge.checks.get(f.check);
   if (!run) return true; // the check no longer exists
   if (ERRORS.includes(f.kind)) {
      return !ERRORS.includes(run.status as FindingKind);
   }
   if (accepted(f, judge)) return true;
   // Stable data that was compared and no longer shows the finding:
   // the API changed back. Date-dependent data may just lack it today.
   return !run.volatile && (run.status === 'ok' || run.status === 'drift');
}

/**
 * Merge this run's findings into the tracked ones. Returns every
 * finding, open and resolved, and the ones that are new or reopened.
 */
export function mergeFindings(
   previous: readonly Finding[],
   current: readonly RunFinding[],
   judge: Judge,
   today: string,
): { findings: Finding[]; fresh: Finding[] } {
   const byKey = new Map(previous.map((f) => [keyOf(f), { ...f }]));
   const fresh: Finding[] = [];
   const seen = new Set<string>();
   for (const f of current) {
      const key = keyOf(f);
      seen.add(key);
      const known = byKey.get(key);
      if (!known) {
         const added = { ...f, firstSeen: today, lastSeen: today };
         byKey.set(key, added);
         fresh.push(added);
         continue;
      }
      if (known.resolved) fresh.push(known);
      Object.assign(known, f, { lastSeen: today, resolved: undefined });
   }
   for (const [key, f] of byKey) {
      if (seen.has(key) || f.resolved) continue;
      if (isResolved(f, judge)) f.resolved = today;
   }
   const findings = [...byKey.values()].sort(
      (a, b) =>
         a.check.localeCompare(b.check) ||
         (a.path ?? '').localeCompare(b.path ?? '') ||
         a.kind.localeCompare(b.kind),
   );
   for (const f of findings) if (!f.resolved) delete f.resolved;
   return { findings, fresh };
}

const MARKER = /<!-- drift-state:([A-Za-z0-9+/=]+) -->/;

/** The findings a previous report embedded, or none */
export function readState(text: string): Finding[] {
   const match = MARKER.exec(text);
   if (!match?.[1]) return [];
   try {
      const state = JSON.parse(
         Buffer.from(match[1], 'base64').toString('utf8'),
      );
      return Array.isArray(state?.findings) ? state.findings : [];
   } catch {
      return [];
   }
}

/** An HTML comment carrying the findings, invisible in the issue */
export function writeState(findings: readonly Finding[]): string {
   const json = JSON.stringify({ version: 1, findings });
   return `<!-- drift-state:${Buffer.from(json).toString('base64')} -->`;
}

/** Markdown list of findings, grouped by check */
export function listFindings(
   findings: readonly Finding[],
   today: string,
): string[] {
   const lines: string[] = [];
   let check: string | undefined;
   for (const f of findings) {
      if (f.check !== check) {
         check = f.check;
         lines.push('', `### \`${check}\``, '');
      }
      const when = f.resolved
         ? `resolved ${f.resolved}`
         : f.lastSeen === today
           ? `since ${f.firstSeen}`
           : `since ${f.firstSeen}, last seen ${f.lastSeen}`;
      lines.push(`- ${f.text} (${when})`);
   }
   return lines;
}

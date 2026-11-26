/**
 * Look for NHL API endpoints the library doesn't call.
 *
 *    bun scripts/check-discover.ts                  # exit 1 on findings
 *    bun scripts/check-discover.ts --report out.md  # also write a report
 *    bun scripts/check-discover.ts --report out.md --previous issue.md --new new.md
 *
 * The NHL publishes no endpoint list (the old application.wadl is gone),
 * so this reads what nhl.com itself requests: every path template in the
 * site's two apps (scores/gamecenter/players/Edge, and stats), compared
 * with the library's paths.ts. It also lists Stats API reports that
 * `/config` names and the report unions don't, and any spec document
 * (WADL, OpenAPI) that starts answering again.
 *
 * Templates that aren't API endpoints (site routes, assets, action
 * types) are listed in scripts/discover/ignore.json.
 *
 * With --previous (the discovery issue's body, which may be missing),
 * each finding keeps the date it was first seen; --new writes the
 * findings that weren't in it, if there are any. Exits 2 when the scan
 * itself fails (a page or bundle can't be loaded, or the bundles stop
 * looking the way the extractor expects), and writes no report then.
 * Runs on a schedule in .github/workflows/discover.yml.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Template } from './discover/extract.ts';
import {
   type Api,
   isCovered,
   isIgnored,
   libraryTemplates,
} from './discover/match.ts';
import {
   APPS,
   type AppScan,
   configReports,
   declaredReports,
   probeSpecs,
   type ReportEntity,
   type Spec,
   scanApp,
} from './discover/sources.ts';

export const IGNORE_PATH = join(import.meta.dir, 'discover/ignore.json');

/**
 * Fewer library paths than this found in an app means the scan broke
 * (a new bundle layout, a page that no longer loads the app), not that
 * the site stopped calling the API.
 */
const MIN_COVERED = 10;

export type Finding =
   | { kind: 'path'; api: Api; path: Template; where: string[] }
   | { kind: 'report'; entity: ReportEntity; name: string }
   | { kind: 'spec'; url: string };

export function keyOf(f: Finding): string {
   switch (f.kind) {
      case 'path':
         return `path ${f.api} ${f.path}`;
      case 'report':
         return `report ${f.entity} ${f.name}`;
      case 'spec':
         return `spec ${f.url}`;
   }
}

type IgnoreFile = Partial<Record<Api | '*', Record<string, string>>>;

export function loadIgnore(
   file: IgnoreFile = JSON.parse(readFileSync(IGNORE_PATH, 'utf8')),
): Record<Api, string[]> {
   const shared = Object.keys(file['*'] ?? {});
   return {
      web: [...shared, ...Object.keys(file.web ?? {})],
      stats: [...shared, ...Object.keys(file.stats ?? {})],
   };
}

/** A WADL resource path as a template of the API it belongs to */
export function specTemplate(
   url: string,
   path: string,
): { api: Api; path: Template } {
   const api: Api = new URL(url).hostname.startsWith('api-web')
      ? 'web'
      : 'stats';
   const stripped =
      api === 'web'
         ? path.replace(/^v\d+\//, '')
         : path.replace(/^(?:\{lang\}|[a-z]{2})\//, '');
   return { api, path: `/${stripped.replace(/\{[^}]*\}/g, '{}')}` };
}

export interface ScanResult {
   apps: AppScan[];
   specs: Spec[];
   reports: Record<ReportEntity, string[]>;
}

/** Turn a scan into findings and the library paths nothing referenced */
export function judge(
   scan: ScanResult,
   library: Record<Api, string[]>,
   ignore: Record<Api, string[]>,
   declared: Record<ReportEntity, Set<string>>,
): { findings: Finding[]; unseen: Record<Api, string[]> } {
   const findings: Finding[] = [];
   const seen: Record<Api, Template[]> = { web: [], stats: [] };

   const consider = (api: Api, path: Template, where: string[]) => {
      seen[api].push(path);
      if (isCovered(path, library[api])) return;
      if (isIgnored(path, ignore[api])) return;
      findings.push({ kind: 'path', api, path, where });
   };

   for (const { app, found } of scan.apps) {
      for (const [path, files] of [...found].sort(([a], [b]) =>
         a.localeCompare(b),
      )) {
         consider(app.api, path, [...files].sort());
      }
   }
   for (const spec of scan.specs) {
      findings.push({ kind: 'spec', url: spec.url });
      for (const p of spec.paths) {
         const t = specTemplate(spec.url, p);
         consider(t.api, t.path, [spec.url]);
      }
   }
   for (const [entity, names] of Object.entries(scan.reports)) {
      for (const name of names) {
         if (!declared[entity as ReportEntity].has(name)) {
            findings.push({
               kind: 'report',
               entity: entity as ReportEntity,
               name,
            });
         }
      }
   }

   const unseen = {} as Record<Api, string[]>;
   for (const api of ['web', 'stats'] as Api[]) {
      unseen[api] = library[api].filter(
         (lib) => !seen[api].some((t) => isCovered(t, [lib])),
      );
   }
   return { findings, unseen };
}

const STATE_RE = /<!-- discover-state: (\{.*?\}) -->/;

/** First-seen dates by finding key, from a previous report */
export function readState(report: string): Record<string, string> {
   const m = report.match(STATE_RE);
   if (!m?.[1]) return {};
   try {
      return JSON.parse(m[1]) as Record<string, string>;
   } catch {
      return {};
   }
}

const API_LABEL: Record<Api, string> = {
   web: 'api-web.nhle.com',
   stats: 'api.nhle.com/stats/rest',
};

function line(f: Finding, firstSeen: string): string {
   switch (f.kind) {
      case 'path':
         return `| ${API_LABEL[f.api]} | \`${f.path}\` | ${f.where.join(', ')} | ${firstSeen} |`;
      case 'report':
         return `- \`${f.entity}/${f.name}\` (first seen ${firstSeen})`;
      case 'spec':
         return `- ${f.url} (first seen ${firstSeen})`;
   }
}

export function renderFindings(
   findings: Finding[],
   firstSeen: Record<string, string>,
): string {
   const out: string[] = [];
   const seenOn = (f: Finding) => firstSeen[keyOf(f)] ?? '?';
   const specs = findings.filter((f) => f.kind === 'spec');
   const paths = findings.filter((f) => f.kind === 'path');
   const reports = findings.filter((f) => f.kind === 'report');
   if (specs.length > 0) {
      out.push(
         '### Spec documents answering again',
         '',
         'The most complete list there is: its paths are compared below.',
         '',
         ...specs.map((f) => line(f, seenOn(f))),
         '',
      );
   }
   if (paths.length > 0) {
      out.push(
         '### Paths the library does not call',
         '',
         '| API | Path | Found in | First seen |',
         '| --- | --- | --- | --- |',
         ...paths.map((f) => line(f, seenOn(f))),
         '',
      );
   }
   if (reports.length > 0) {
      out.push(
         '### Stats reports `/config` lists that the report types do not',
         '',
         ...reports.map((f) => line(f, seenOn(f))),
         '',
      );
   }
   return out.join('\n');
}

export function renderReport(
   scan: ScanResult,
   findings: Finding[],
   unseen: Record<Api, string[]>,
   firstSeen: Record<string, string>,
): string {
   const out: string[] = ['## NHL endpoints the library does not call', ''];
   for (const s of scan.apps) {
      out.push(
         `- **${API_LABEL[s.app.api]}**: ${s.found.size} path templates in ${s.chunks.fetched + 1} bundle files of ${s.bundleUrl.split('?')[0]}`,
      );
   }
   out.push(
      `- Spec documents (application.wadl, OpenAPI): ${scan.specs.length === 0 ? 'none answer' : scan.specs.map((s) => s.url).join(', ')}`,
      '',
   );

   if (findings.length === 0) {
      out.push(
         'Nothing new: every path nhl.com requests is covered or ignored.',
         '',
      );
   } else {
      out.push(renderFindings(findings, firstSeen));
      out.push(
         '**Resolving:** wrap an endpoint by adding its path to the `paths.ts` of its API (with a function, types and a drift check), or add the path to `scripts/discover/ignore.json` with the reason it is not one to wrap (a site route, an asset). A missing report name goes in the `SkaterReport` / `GoalieReport` / `TeamReport` union in `src/api/edge-stats/types.ts`.',
         '',
      );
   }

   const unseenCount = unseen.web.length + unseen.stats.length;
   if (unseenCount > 0) {
      out.push(
         '<details>',
         `<summary>Library paths nhl.com does not reference (${unseenCount}): not an error, the site doesn't use every endpoint</summary>`,
         '',
         ...(['web', 'stats'] as Api[]).flatMap((api) =>
            unseen[api].map((p) => `- ${API_LABEL[api]}: \`${p}\``),
         ),
         '',
         '</details>',
         '',
      );
   }

   const state: Record<string, string> = {};
   for (const f of findings) state[keyOf(f)] = firstSeen[keyOf(f)] ?? '?';
   out.push(`<!-- discover-state: ${JSON.stringify(state)} -->`, '');
   return out.join('\n');
}

function arg(name: string): string | undefined {
   const i = process.argv.indexOf(name);
   return i === -1 ? undefined : process.argv[i + 1];
}

async function main(): Promise<number> {
   const reportPath = arg('--report');
   const previousPath = arg('--previous');
   const newPath = arg('--new');

   const library = libraryTemplates();
   const apps: AppScan[] = [];
   for (const app of APPS) {
      const scan = await scanApp(app);
      if (scan.chunks.listed === 0) {
         throw new Error(
            `${scan.bundleUrl}: no lazy-chunk map found, the webpack runtime changed`,
         );
      }
      const covered = library[app.api].filter((lib) =>
         [...scan.found.keys()].some((t) => isCovered(t, [lib])),
      ).length;
      if (covered < MIN_COVERED) {
         throw new Error(
            `${scan.bundleUrl}: only ${covered} library paths found, the extractor no longer reads this bundle`,
         );
      }
      apps.push(scan);
   }
   const scan: ScanResult = {
      apps,
      specs: await probeSpecs(),
      reports: await configReports(),
   };

   const { findings, unseen } = judge(
      scan,
      library,
      loadIgnore(),
      declaredReports(),
   );

   const previous =
      previousPath && existsSync(previousPath)
         ? readState(readFileSync(previousPath, 'utf8'))
         : {};
   const today = new Date().toISOString().slice(0, 10);
   const firstSeen: Record<string, string> = {};
   for (const f of findings) {
      firstSeen[keyOf(f)] = previous[keyOf(f)] ?? today;
   }
   const fresh = findings.filter((f) => !(keyOf(f) in previous));

   const report = renderReport(scan, findings, unseen, firstSeen);
   console.log(report);
   if (reportPath) writeFileSync(reportPath, report);
   if (newPath && fresh.length > 0) {
      writeFileSync(
         newPath,
         `New since the last run:\n\n${renderFindings(fresh, firstSeen)}`,
      );
   }
   return findings.length > 0 ? 1 : 0;
}

if (import.meta.main) {
   main().then(
      (code) => process.exit(code),
      (error) => {
         console.error(error);
         process.exit(2);
      },
   );
}

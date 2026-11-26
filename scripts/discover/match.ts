/**
 * Which scraped path templates the library already calls.
 *
 * Library templates come straight from the `paths.ts` objects, so a new
 * library function is covered as soon as its path is added there.
 */
import {
   goaliesPaths,
   skatersPaths,
   summaryPaths,
   teamsPaths,
} from '#/api/edge-adv/paths.ts';
import { dataPaths } from '#/api/edge-stats/paths.ts';
import {
   draftPaths,
   gamePaths,
   miscPaths,
   playerPaths,
   playerV2Paths,
   scorePaths,
   teamPaths,
} from '#/api/gamecenter/paths.ts';
import type { Template, Version } from './extract.ts';

/**
 * The APIs nhl.com's apps call: a version of api-web.nhle.com (`v1`,
 * `v2`, and any the site starts using), or `stats`,
 * api.nhle.com/stats/rest/{lang}.
 */
export type Api = Version | 'stats';

/** The library's paths per API: v1 and v2 of api-web, and stats */
export type Library = Record<'v1' | 'v2' | 'stats', string[]>;

/** The library's paths for an API; none for a version it doesn't call */
export function pathsOf(library: Library, api: Api): string[] {
   return (library as Record<string, string[] | undefined>)[api] ?? [];
}

/** Order for listing APIs: versions in order, then stats */
export function compareApis(a: Api, b: Api): number {
   const rank = (api: Api) =>
      api === 'stats' ? Number.POSITIVE_INFINITY : Number(api.slice(1));
   return rank(a) - rank(b);
}

type PathTree = { [key: string]: string | PathTree };

function flatten(tree: PathTree): string[] {
   return Object.values(tree).flatMap((v) =>
      typeof v === 'string' ? [v] : flatten(v),
   );
}

/** Ignore paths on other hosts (player search, wsr.nhle.com sprites) */
const OTHER_HOST: ReadonlySet<string> = new Set([
   playerPaths.playerSearch,
   gamePaths.pptReplay.frames,
]);

/** Every path template the library requests, per API */
export function libraryTemplates(): Library {
   const v1 = [
      teamPaths,
      scorePaths,
      playerPaths,
      miscPaths,
      gamePaths,
      draftPaths,
      goaliesPaths,
      skatersPaths,
      teamsPaths,
      summaryPaths,
   ]
      .flatMap((tree) => flatten(tree as PathTree))
      .filter((p) => !OTHER_HOST.has(p));
   const v2 = flatten(playerV2Paths);
   // The site's stats base URL already includes the language
   const stats = flatten(dataPaths as PathTree).map((p) =>
      p.replace(/^\{lang\}\//, ''),
   );
   return {
      v1: [...new Set(v1)],
      v2: [...new Set(v2)],
      stats: [...new Set(stats)],
   };
}

type Segment =
   /** One or more segments the site fills in: `{}` */
   | { kind: 'any' }
   /**
    * Text, possibly with placeholders inside (`{}-vs-{}`); `static` is
    * the text itself when it has none
    */
   | { kind: 'text'; re: RegExp; static: string | undefined };

function escapeRegex(s: string): string {
   return s.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
}

function split(path: string): string[] {
   return path.replace(/^\/+|\/+$/g, '').split('/');
}

/** A scraped template's segments */
function candidateSegments(template: Template): Segment[] {
   return split(template).map((seg) =>
      /^(\{\})+$/.test(seg)
         ? { kind: 'any' }
         : {
              kind: 'text',
              re: new RegExp(
                 `^${seg.split('{}').map(escapeRegex).join('[^/]*')}$`,
              ),
              static: seg.includes('{}') ? undefined : seg,
           },
   );
}

/** A library template's `{name}` segment */
function isLibraryPlaceholder(seg: string): boolean {
   return /^\{[A-Za-z]+\}$/.test(seg);
}

/**
 * Static text the site may put where the library takes a parameter
 * (`scoreboard/now` for `scoreboard/{date}`). Any other word is a
 * different path: `/schedule/{}/list` is not `schedule/{a}/{b}`.
 */
const VALUE = /^(?:now|all|\d+)$/;

function matches(c: Segment[], i: number, l: string[], j: number): boolean {
   // A static candidate that stops early, like `/skater` where the site
   // appends the report name elsewhere, is a prefix of the library path
   if (i === c.length) return true;
   const seg = c[i] as Segment;
   if (seg.kind === 'any') {
      for (let k = j + 1; k <= l.length; k++) {
         if (matches(c, i + 1, l, k)) return true;
      }
      return false;
   }
   if (j === l.length) return false;
   const lib = l[j] as string;
   const ok = isLibraryPlaceholder(lib)
      ? seg.static === undefined || VALUE.test(seg.static)
      : seg.re.test(lib);
   return ok && matches(c, i + 1, l, j + 1);
}

/** Whether a scraped template is one of the library's paths */
export function isCovered(template: Template, library: string[]): boolean {
   const c = candidateSegments(template);
   return library.some((path) => matches(c, 0, split(path), 0));
}

/**
 * Ignore-list entries: an exact template, or a prefix ending in `*`
 * (`/nhl-edge*` covers every Edge page route).
 */
export function isIgnored(
   template: Template,
   entries: Iterable<string>,
): boolean {
   for (const entry of entries) {
      if (entry.endsWith('*')) {
         if (template.startsWith(entry.slice(0, -1))) return true;
      } else if (template === entry) return true;
   }
   return false;
}

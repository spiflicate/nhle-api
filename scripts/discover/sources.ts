/**
 * Where endpoint discovery looks, and the network calls to get there.
 *
 * - nhl.com's two single-page apps: their main bundle and every lazy
 *   chunk the webpack runtime lists.
 * - The spec documents the APIs used to serve (Jersey's
 *   application.wadl, OpenAPI). They 404 today; if one comes back it's
 *   the most complete list there is.
 * - The Stats API's `/config`, which lists every skater, goalie and team
 *   report.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chunkFiles, extractTemplates, type Template } from './extract.ts';
import type { Api } from './match.ts';

/** Generic client name, like the library's own requests */
const HEADERS = { 'User-Agent': 'nhle-api endpoint discovery' };

export interface App {
   api: Api;
   /** A page that loads the app */
   page: string;
   /** The app's main bundle among the page's scripts */
   bundle: RegExp;
}

/**
 * scores, schedule, standings, gamecenter, players, draft and Edge are
 * all one app (wsr.nhle.com); nhl.com/stats is another (dcs.nhl.com).
 */
export const APPS: App[] = [
   {
      api: 'web',
      page: 'https://www.nhl.com/scores',
      bundle: /\/static\/js\/main\.bundle\.js/,
   },
   {
      api: 'stats',
      page: 'https://www.nhl.com/stats/',
      bundle: /\/stats\/static\/js\/client\.bundle\.js/,
   },
];

/** A template and the bundle files it was found in */
export type Found = Map<Template, Set<string>>;

export interface AppScan {
   app: App;
   bundleUrl: string;
   /** Lazy chunks listed by the runtime / fetched */
   chunks: { listed: number; fetched: number };
   found: Found;
}

async function get(url: string): Promise<Response> {
   return fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(30_000),
   });
}

async function text(url: string): Promise<string> {
   const response = await get(url);
   if (!response.ok) throw new Error(`${response.status} from ${url}`);
   return response.text();
}

/**
 * Fetch a bundle file, or the same path on the page's own host:
 * nhl.com/stats/static serves the same files as dcs.nhl.com/stats/static,
 * which some networks don't allow.
 */
async function bundleText(url: string, page: string): Promise<string> {
   try {
      return await text(url);
   } catch (error) {
      const mirror = new URL(new URL(url).pathname, page).href;
      if (mirror === url) throw error;
      return text(mirror);
   }
}

function add(found: Found, templates: Set<Template>, file: string) {
   for (const t of templates) {
      const files = found.get(t) ?? new Set<string>();
      found.set(t, files.add(file));
   }
}

/** Load an app's page, its main bundle and every lazy chunk */
export async function scanApp(app: App): Promise<AppScan> {
   const html = await text(app.page);
   const src = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)]
      .map((m) => new URL((m[1] ?? '').replace(/&amp;/g, '&'), app.page))
      .find((url) => app.bundle.test(url.pathname));
   if (!src) {
      throw new Error(`no script matching ${app.bundle} on ${app.page}`);
   }

   const main = await bundleText(src.href, app.page);
   const found: Found = new Map();
   add(found, extractTemplates(main), 'main');

   // Chunks load from webpack's publicPath, the folder above the main
   // bundle's (main at /static/js/main.bundle.js, chunks at /static/js/…)
   const chunks = chunkFiles(main);
   const publicPath = new URL('../', src);
   let fetched = 0;
   const queue = [...chunks];
   const worker = async () => {
      for (let c = queue.shift(); c; c = queue.shift()) {
         const source = await bundleText(
            new URL(c.file, publicPath).href,
            app.page,
         );
         add(found, extractTemplates(source), c.name);
         fetched++;
      }
   };
   await Promise.all(Array.from({ length: 6 }, worker));

   return {
      app,
      bundleUrl: src.href,
      chunks: { listed: chunks.length, fetched },
      found,
   };
}

/** Where the APIs served (or would serve) a machine-readable spec */
export const SPEC_URLS = [
   'https://api-web.nhle.com/application.wadl',
   'https://api-web.nhle.com/v1/application.wadl',
   'https://api-web.nhle.com/model/v1/openapi.json',
   'https://api-web.nhle.com/v1/openapi.json',
   'https://api.nhle.com/stats/rest/application.wadl',
   'https://api.nhle.com/stats/rest/en/application.wadl',
   'https://api.nhle.com/stats/rest/openapi.json',
];

export interface Spec {
   url: string;
   /** Resource paths listed by a WADL, when the document is one */
   paths: string[];
}

/**
 * Every resource path in a WADL document, nested `<resource>` paths
 * joined: `<resource path="v1"><resource path="score/{date}">` →
 * `v1/score/{date}`.
 */
export function wadlPaths(xml: string): string[] {
   const paths: string[] = [];
   const stack: string[] = [];
   for (const m of xml.matchAll(
      /<(\/?)(?:\w+:)?resource\b([^>]*?)(\/?)>/g,
   )) {
      const [, closing, attrs = '', selfClosing] = m;
      if (closing) {
         stack.pop();
         continue;
      }
      const path = (attrs.match(/\bpath="([^"]*)"/)?.[1] ?? '').replace(
         /^\/+|\/+$/g,
         '',
      );
      const full = [...stack, path].filter(Boolean).join('/');
      if (full) paths.push(full);
      if (!selfClosing) stack.push(path);
   }
   return [...new Set(paths)];
}

/** Spec documents that answer today */
export async function probeSpecs(): Promise<Spec[]> {
   const specs: Spec[] = [];
   for (const url of SPEC_URLS) {
      const response = await get(url).catch(() => undefined);
      if (!response?.ok) continue;
      const body = await response.text();
      // Some hosts answer unknown paths with an HTML page and a 200
      if (!/<application\b|"openapi"|"swagger"/.test(body)) continue;
      specs.push({
         url,
         paths: url.endsWith('.wadl') ? wadlPaths(body) : [],
      });
   }
   return specs;
}

export type ReportEntity = 'skater' | 'goalie' | 'team';

const CONFIG_KEYS: Record<ReportEntity, string> = {
   skater: 'playerReportData',
   goalie: 'goalieReportData',
   team: 'teamReportData',
};

const UNIONS: Record<ReportEntity, string> = {
   skater: 'SkaterReport',
   goalie: 'GoalieReport',
   team: 'TeamReport',
};

/**
 * The report names each union in src/api/edge-stats/types.ts declares.
 * Read from the source, since the unions are types only.
 */
export function declaredReports(
   source = readFileSync(
      join(import.meta.dir, '../../src/api/edge-stats/types.ts'),
      'utf8',
   ),
): Record<ReportEntity, Set<string>> {
   const out = {} as Record<ReportEntity, Set<string>>;
   for (const [entity, union] of Object.entries(UNIONS)) {
      const body = source.match(
         new RegExp(`export type ${union} =([^;]*);`),
      )?.[1];
      if (!body)
         throw new Error(`no ${union} union in edge-stats/types.ts`);
      out[entity as ReportEntity] = new Set(
         [...body.matchAll(/'([^']+)'/g)].map((m) => m[1] as string),
      );
   }
   return out;
}

/** The report names `/config` lists, per entity */
export async function configReports(): Promise<
   Record<ReportEntity, string[]>
> {
   const config = JSON.parse(
      await text('https://api.nhle.com/stats/rest/en/config'),
   ) as Record<string, Record<string, unknown> | undefined>;
   const out = {} as Record<ReportEntity, string[]>;
   for (const [entity, key] of Object.entries(CONFIG_KEYS)) {
      const reports = config[key];
      if (!reports) throw new Error(`/config has no ${key}`);
      out[entity as ReportEntity] = Object.keys(reports);
   }
   return out;
}

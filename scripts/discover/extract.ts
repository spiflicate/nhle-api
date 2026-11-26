/**
 * Pull API path templates out of nhl.com's minified webpack bundles.
 *
 * The site builds request URLs with string concatenation, which the
 * minifier turns into `.concat` chains:
 *
 *    "/gamecenter/".concat(e, "/boxscore")             → /gamecenter/{}/boxscore
 *    "".concat(window.__BASE_REST_URL__, "/game?x=")  → /game
 *
 * Every string literal that starts such a chain (or is a bare path) is
 * read, its string arguments kept, every other argument replaced by a
 * `{}` placeholder, leading placeholders (the base URL and version)
 * dropped, and the query string cut off. What's left is only a candidate: the same
 * pattern also catches site routes, asset paths and action types, which
 * `ignore.json` and the filters below weed out.
 */

/** A path template, with `{}` for each value the site fills in */
export type Template = string;

/** An API version as the site names it: `v1`, `v2` */
export type Version = `v${number}`;

/** Placeholder for a non-literal argument while a chain is joined */
const HOLE = '\uE000'; // private use: never in bundle source paths

/**
 * Object keys whose path values are not requests: react-intl message
 * ids (`id:"/avbqB"`) and router or link props (`path:"/skater"`,
 * `link:"/schedule/".concat(...)`).
 */
const NOT_REQUESTS = /(?:^|[,{(\s])(?:id|path|to|href|link|pathname):\s*$/;

/** Asset files, not API responses */
const ASSET = /\.(?:png|jpe?g|svg|gif|webp|css|js|json|html?|woff2?)$/i;

/** URL path characters only: no spaces, `=`, `%`... */
const PATH = /^\/[a-z][A-Za-z0-9._~{}/-]*$/;

/**
 * Split the argument list of the call whose `(` is at `s[start]`.
 * Returns the trimmed source of each argument and the index after `)`.
 */
export function callArgs(s: string, start: number): [string[], number] {
   const list: string[] = [];
   let depth = 0;
   let current = '';
   let quote = '';
   for (let k = start; k < s.length; k++) {
      const c = s[k] as string;
      if (quote) {
         current += c;
         if (c === '\\') current += s[++k] ?? '';
         else if (c === quote) quote = '';
         continue;
      }
      if (c === '"' || c === "'" || c === '`') {
         quote = c;
         current += c;
         continue;
      }
      if (c === '(' || c === '[' || c === '{') {
         depth++;
         if (depth === 1) continue;
      } else if (c === ')' || c === ']' || c === '}') {
         depth--;
         if (depth === 0) {
            if (current.trim() !== '') list.push(current.trim());
            return [list, k + 1];
         }
      } else if (c === ',' && depth === 1) {
         list.push(current.trim());
         current = '';
         continue;
      }
      current += c;
   }
   return [list, s.length];
}

/** The value of a plain string literal, or undefined for any other code */
function literal(code: string): string | undefined {
   const m = code.match(/^"([^"\\]*)"$|^'([^'\\]*)'$/);
   return m ? (m[1] ?? m[2]) : undefined;
}

/**
 * The index of the `(` of the call whose argument list holds the code at
 * `index`, or -1 when it isn't a call argument (inside an object or array
 * literal, or a statement of its own). Brackets inside string literals
 * are rare enough in these bundles to ignore.
 */
function enclosingParen(s: string, index: number): number {
   let depth = 0;
   for (let k = index - 1; k >= Math.max(0, index - 400); k--) {
      const c = s[k];
      if (c === ')' || c === ']' || c === '}') depth++;
      else if (c === '(' || c === '[' || c === '{') {
         if (depth === 0) return c === '(' ? k : -1;
         depth--;
      } else if (depth === 0 && (c === ';' || isAssignment(s, k))) {
         return -1;
      }
   }
   return -1;
}

/** Whether the literal starting at `index` is an argument of a `.concat` */
function insideConcat(s: string, index: number): boolean {
   const paren = enclosingParen(s, index);
   return paren !== -1 && s.endsWith('.concat', paren);
}

/**
 * The site's API version enum (`p={V1:"v1",V2:"v2"}`), as minified code
 * refers to it: `le.mG.V2`, `M.mG.V1`.
 */
const VERSION_REF = /^(?:[\w$]+\.)+V(\d+)$/;

function versionOf(code: string): Version | undefined {
   const m = code.match(VERSION_REF);
   return m ? (`v${m[1]}` as Version) : undefined;
}

/**
 * The API version a request states: in its concat chain, for a direct
 * fetch (`"".concat(base,"/").concat(M.mG.V1,"/playoff-series/...")`), or
 * as an argument of the call the path goes to
 * (`xo("/player/".concat(w,"/bio"),!0,void 0,le.mG.V2)`).
 */
function statedVersion(
   s: string,
   at: number,
   chainArgs: string[],
): Version | undefined {
   for (const arg of chainArgs) {
      const v = versionOf(arg);
      if (v) return v;
   }
   const paren = enclosingParen(s, at);
   if (paren === -1 || s.endsWith('.concat', paren)) return undefined;
   const [args] = callArgs(s, paren);
   for (const arg of args) {
      const v = versionOf(arg);
      if (v) return v;
   }
   return undefined;
}

/** `=` at `k` assigns: not `==`, `!=`, `<=`, `>=` or `=>` */
function isAssignment(s: string, k: number): boolean {
   return (
      s[k] === '=' &&
      !'=!<>'.includes(s[k - 1] ?? '') &&
      !'=>'.includes(s[k + 1] ?? '')
   );
}

/** A candidate request path, and the API version the code states */
export interface Extracted {
   path: Template;
   /**
    * `v1`, `v2`... when the request names one. Most requests don't: the
    * site's request hook then uses v1.
    */
   version: Version | undefined;
}

/**
 * Every candidate path template in a bundle's source, once per version
 * it is requested with. Consecutive placeholders collapse to one, so
 * `{}` can stand for several segments (`/player/{}` where the site
 * appends `"/".concat(id, "/landing")`).
 */
export function extractTemplates(source: string): Extracted[] {
   const found = new Map<string, Extracted>();
   // "" or a path made of /segments: the start of a concat chain
   for (const m of source.matchAll(/"((?:\/[A-Za-z0-9._-]*)*)"/g)) {
      const at = m.index ?? 0;
      if (insideConcat(source, at)) continue;
      const before = source.slice(Math.max(0, at - 20), at);
      if (NOT_REQUESTS.test(before)) continue;

      const parts = [m[1] ?? ''];
      const chainArgs: string[] = [];
      let k = at + m[0].length;
      while (source.startsWith('.concat(', k)) {
         const [args, end] = callArgs(source, k + '.concat'.length);
         k = end;
         chainArgs.push(...args);
         for (const arg of args) parts.push(literal(arg) ?? HOLE);
      }
      if (parts.length === 1 && parts[0] === '') continue;

      // Leading variables are the base URL, and maybe the API version:
      // "".concat(base, "/").concat(V1, "/playoff-series/...").
      // Anything else built on a variable ("".concat(n, "px")) is not
      // a path.
      const joined = parts
         .join('')
         .replace(/^\uE000+(?:\/\uE000+)*(?=\/)/, '');
      const path = (joined.split(/[?#]/)[0] ?? '').replace(
         /\uE000+/g,
         '{}',
      );
      if (!PATH.test(path) || ASSET.test(path)) continue;
      const version = statedVersion(source, at, chainArgs);
      found.set(`${version} ${path}`, { path, version });
   }
   return [...found.values()];
}

/**
 * The lazy chunks a webpack runtime can load, from its chunk-filename
 * function, as paths relative to the runtime's `publicPath`:
 *
 *    n.u=e=>"js/"+({56:"Reports",...}[e]||e)+"."+{56:"3f2a...",...}[e]+".bundle.js"
 *
 * Returns [] when the bundle has no such function (no lazy chunks, or a
 * webpack build this parser doesn't know).
 */
export function chunkFiles(
   source: string,
): Array<{ id: string; name: string; file: string }> {
   const m = source.match(
      /\.u=e=>"([^"]*)"\+\(\{([^}]*)\}\[e\]\|\|e\)\+"\."\+\{([^}]*)\}\[e\]\+"([^"]*)"/,
   );
   if (!m) return [];
   const [, prefix, namesSrc, hashesSrc, suffix] = m as unknown as [
      string,
      string,
      string,
      string,
      string,
   ];
   const entries = (src: string) =>
      new Map(
         [...src.matchAll(/(\d+):"([^"]+)"/g)].map(
            (e) => [e[1], e[2]] as [string, string],
         ),
      );
   const names = entries(namesSrc);
   return [...entries(hashesSrc)].map(([id, hash]) => {
      const name = names.get(id) ?? id;
      return { id, name, file: `${prefix}${name}.${hash}${suffix}` };
   });
}

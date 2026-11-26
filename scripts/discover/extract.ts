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
 * Whether the literal starting at `index` is an argument of a `.concat`:
 * walk back to the `(` that encloses it and look at what precedes it.
 * Brackets inside string literals are rare enough in these bundles to
 * ignore.
 */
function insideConcat(s: string, index: number): boolean {
   let depth = 0;
   for (let k = index - 1; k >= Math.max(0, index - 400); k--) {
      const c = s[k];
      if (c === ')' || c === ']' || c === '}') depth++;
      else if (c === '(' || c === '[' || c === '{') {
         if (depth === 0) return c === '(' && s.endsWith('.concat', k);
         depth--;
      } else if (depth === 0 && (c === ';' || isAssignment(s, k))) {
         return false;
      }
   }
   return false;
}

/** `=` at `k` assigns: not `==`, `!=`, `<=`, `>=` or `=>` */
function isAssignment(s: string, k: number): boolean {
   return (
      s[k] === '=' &&
      !'=!<>'.includes(s[k - 1] ?? '') &&
      !'=>'.includes(s[k + 1] ?? '')
   );
}

/**
 * Every candidate path template in a bundle's source. Consecutive
 * placeholders collapse to one, so `{}` can stand for several segments
 * (`/player/{}` where the site appends `"/".concat(id, "/landing")`).
 */
export function extractTemplates(source: string): Set<Template> {
   const found = new Set<Template>();
   // "" or a path made of /segments: the start of a concat chain
   for (const m of source.matchAll(/"((?:\/[A-Za-z0-9._-]*)*)"/g)) {
      const at = m.index ?? 0;
      if (insideConcat(source, at)) continue;
      const before = source.slice(Math.max(0, at - 20), at);
      if (NOT_REQUESTS.test(before)) continue;

      const parts = [m[1] ?? ''];
      let k = at + m[0].length;
      while (source.startsWith('.concat(', k)) {
         const [args, end] = callArgs(source, k + '.concat'.length);
         k = end;
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
      found.add(path);
   }
   return found;
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

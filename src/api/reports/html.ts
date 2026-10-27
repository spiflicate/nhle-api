/** Minimal table reader for the NHL's explicit, nested table markup. */
import { ParseError } from '#/errors/index.ts';

export interface ReportNode {
   tag: string;
   attributes: string;
   children: (ReportNode | string)[];
}

export function attribute(
   node: ReportNode,
   name: string,
): string | undefined {
   return new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(
      node.attributes,
   )?.[1];
}

function decode(text: string): string {
   const entities: Record<string, string> = {
      nbsp: ' ',
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      apos: "'",
   };
   return text.replace(
      /&(#x[\da-f]+|#\d+|nbsp|amp|lt|gt|quot|apos);/gi,
      (whole, entity: string) => {
         if (!entity.startsWith('#'))
            return entities[entity.toLowerCase()] ?? whole;
         const code =
            entity[1]?.toLowerCase() === 'x'
               ? Number.parseInt(entity.slice(2), 16)
               : Number(entity.slice(1));
         return code > 0 && code <= 0x10ffff
            ? String.fromCodePoint(code)
            : whole;
      },
   );
}

export function nodeText(node: ReportNode): string {
   return node.children
      .map((child) =>
         typeof child === 'string' ? decode(child) : nodeText(child),
      )
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
}

export function descendants(node: ReportNode, tag: string): ReportNode[] {
   return node.children.flatMap((child) =>
      typeof child === 'string'
         ? []
         : [
              ...(child.tag === tag ? [child] : []),
              ...descendants(child, tag),
           ],
   );
}

export function cells(row: ReportNode): ReportNode[] {
   return row.children.filter(
      (child): child is ReportNode =>
         typeof child !== 'string' &&
         (child.tag === 'td' || child.tag === 'th'),
   );
}

export function rows(table: ReportNode): string[][] {
   return table.children
      .filter(
         (child): child is ReportNode =>
            typeof child !== 'string' && child.tag === 'tr',
      )
      .map((row) => cells(row).map(nodeText));
}

/** Other tags are transparent; table boundaries are never matched with regex. */
export function readReport(html: string): ReportNode {
   if (!/<\/html\s*>/i.test(html))
      throw new ParseError('Incomplete Game Summary HTML');
   const root: ReportNode = { tag: 'root', attributes: '', children: [] };
   const stack = [root];
   const clean = html.replace(
      /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
      '',
   );
   for (const token of clean.matchAll(/<[^>]*>|[^<]+/g)) {
      const value = token[0];
      const match = /^<(\/)?(table|tr|td|th)\b([^>]*)>/i.exec(value);
      const parent = stack[stack.length - 1];
      if (!parent)
         throw new ParseError('Invalid Game Summary table nesting');
      if (!match) {
         parent.children.push(value.startsWith('<') ? ' ' : value);
         continue;
      }
      const tag = match[2]?.toLowerCase() ?? '';
      if (match[1]) {
         if (parent.tag !== tag)
            throw new ParseError('Unbalanced Game Summary table markup');
         stack.pop();
      } else {
         const node: ReportNode = {
            tag,
            attributes: match[3] ?? '',
            children: [],
         };
         parent.children.push(node);
         stack.push(node);
      }
   }
   if (stack.length !== 1)
      throw new ParseError('Incomplete Game Summary tables');
   return root;
}

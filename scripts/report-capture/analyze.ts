/**
 * Summarize captured report evidence as a per-report timeline.
 *
 *   bun scripts/report-capture/analyze.ts --data <dir> --game <id> [--out <file.md>]
 *
 * Reads <dir>/games/<id>/observations.jsonl and the stored bodies. For
 * every report it lists each attempt's status, size, whether the body
 * changed, the Last-Modified header and the status the report header
 * printed; for the Game Summary it also lists what the sections held
 * and whether `parseGameSummary` accepted the sheet.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { parseGameTimes } from '#/api/reports/parse.ts';
import { parseGameSummary } from '#/api/reports/summary.ts';
import type { Observation } from './collect.ts';

function arg(name: string): string | undefined {
   const i = process.argv.indexOf(`--${name}`);
   return i >= 0 ? process.argv[i + 1] : undefined;
}

export function readBody(dataDir: string, obs: Observation): string | null {
   if (!obs.body) return null;
   return gunzipSync(readFileSync(join(dataDir, obs.body))).toString(
      'utf8',
   );
}

const text = (html: string) =>
   html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;| /g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();

/** The generation stamp in each report's footer, e.g. 2026-10-27-17.03.31 */
const STAMP_RE = /\d{4}-\d{2}-\d{2}[- ]\d{1,2}\.\d{2}\.\d{2}/g;
export const withoutStamp = (html: string) => html.replace(STAMP_RE, '');

/** The status line every report prints at the end of its GameInfo table */
export function headerStatus(html: string): string | null {
   const info = /<table[^>]*id="GameInfo"[^>]*>([\s\S]*?)<\/table>/i.exec(
      html,
   );
   if (!info) return null;
   const cells = [
      ...(info[1] ?? '').matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi),
   ]
      .map((m) => text(m[1] ?? ''))
      .filter((v) => v !== '');
   const last = cells[cells.length - 1] ?? null;
   // Before play the last cell is the end/start line, not a status
   return last && /^(?:(?:Start|End)\s*(?:\d|:)|Attendance\b)/.test(last)
      ? ''
      : last;
}

/** What the Game Summary sections held */
function gsSections(html: string, scheduled: Date | undefined): string {
   const times = parseGameTimes(html, scheduled);
   const parsed = parseGameSummary(0, html, scheduled);
   const parts: string[] = [];
   if (times.success) {
      parts.push(
         `start ${times.data.start?.local ?? '-'}`,
         `end ${times.data.end?.local ?? '-'}`,
      );
   } else {
      parts.push(`times FAIL ${times.error.message}`);
   }
   if (parsed.success) {
      const d = parsed.data;
      const totals = (side: 'away' | 'home') =>
         d.byPeriod[side]
            .map((p) => `${p.period}:${p.goals}g/${p.shots}s`)
            .join(',');
      parts.push(
         `score ${d.awayTeam.score}-${d.homeTeam.score}`,
         `att ${d.attendance ?? '-'}`,
         `goals ${d.goals.length}`,
         `pen ${d.penalties.away.length}+${d.penalties.home.length}`,
         `periods ${totals('away') || '-'}`,
         `pp ${d.powerPlays.away.length}+${d.powerPlays.home.length}`,
         `goalies ${d.goalies.away.length}+${d.goalies.home.length}`,
         `refs ${d.officials.referees.length}/${d.officials.linespeople.length}`,
         `stars ${d.stars.length}`,
      );
   } else {
      parts.push(`parse FAIL ${parsed.error.message}`);
   }
   return parts.join('; ');
}

export function analyze(dataDir: string, gameId: number): string {
   const lines = readFileSync(
      join(dataDir, 'games', String(gameId), 'observations.jsonl'),
      'utf8',
   )
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Observation);

   let scheduled: Date | undefined;
   const out: string[] = [`# Capture timeline for ${gameId}`, ''];

   const ctx = lines.filter((o) => o.kind === 'context');
   scheduled = ctx.find((o) => o.context?.startTimeUTC)?.context
      ?.startTimeUTC
      ? new Date(
           ctx.find((o) => o.context?.startTimeUTC)?.context
              ?.startTimeUTC ?? '',
        )
      : undefined;
   const rel = (iso: string) => {
      if (!scheduled) return '';
      const min = Math.round(
         (Date.parse(iso) - scheduled.getTime()) / 60_000,
      );
      return `T${min < 0 ? '−' : '+'}${Math.abs(min)}m`;
   };
   out.push(
      `Scheduled start: ${scheduled?.toISOString() ?? 'unknown'}`,
      '',
   );

   out.push('## Context (gamecenter boxscore)', '');
   out.push(
      '| poll | request (UTC) | rel | status | gameState | period | clock | int |',
   );
   out.push('|---|---|---|---|---|---|---|---|');
   for (const o of ctx) {
      const c = o.context;
      out.push(
         `| ${o.poll} | ${o.requestStart} | ${rel(o.requestStart)} | ${o.status ?? o.error} | ${c?.gameState ?? ''} | ${c?.periodType ?? ''}${c?.period ?? ''} | ${c?.clock ?? ''} | ${c?.inIntermission ? 'yes' : ''} |`,
      );
   }
   out.push('');

   const codes = [
      ...new Set(
         lines.filter((o) => o.kind !== 'context').map((o) => o.kind),
      ),
   ];
   for (const code of codes) {
      out.push(`## ${code}`, '');
      const head =
         code === 'GS'
            ? '| poll | request (UTC) | rel | status | bytes | sha | last-modified | printed status | sections |'
            : '| poll | request (UTC) | rel | status | bytes | sha | last-modified | printed status |';
      out.push(head, head.replace(/[^|]+/g, '---'));
      let prev: string | null = null;
      for (const o of lines.filter((l) => l.kind === code)) {
         const html = o.status === 200 ? readBody(dataDir, o) : null;
         // Reports are regenerated every few minutes with a new footer
         // stamp, so compare bodies without it
         const key = html ? withoutStamp(html) : o.sha256;
         const changed =
            key === prev ? ' (same)' : o.sha256 && prev ? ' (changed)' : '';
         prev = key;
         const row = [
            o.poll,
            o.requestStart,
            rel(o.requestStart),
            o.status ?? `ERR ${o.error}`,
            o.bodyBytes ?? '',
            `${o.sha256?.slice(0, 10) ?? ''}${changed}`,
            o.headers?.['last-modified'] ?? '',
            html ? JSON.stringify(headerStatus(html)) : '',
         ];
         if (code === 'GS')
            row.push(html ? gsSections(html, scheduled) : '');
         out.push(`| ${row.join(' | ')} |`);
      }
      out.push('');
   }
   return out.join('\n');
}

if (import.meta.main) {
   const data = arg('data');
   const game = Number(arg('game'));
   if (!data || !game)
      throw new Error('--data <dir> --game <id> are required');
   const md = analyze(data, game);
   const out = arg('out');
   if (out) writeFileSync(out, md);
   else console.log(md);
}

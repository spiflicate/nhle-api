/**
 * Copy one captured observation into the curated fixture set.
 *
 *   bun scripts/report-capture/curate.ts --data <dir> --obs <observation id> \
 *     --name <file name> --stage <stage> [--note <text>]
 *
 * The body is written byte for byte as captured (after HTTP
 * content-encoding was removed) to test/fixtures/reports/captured/<name>,
 * and its provenance, including the context observation from the same
 * poll, is added to test/fixtures/reports/captured/manifest.json.
 */

import { createHash } from 'node:crypto';
import {
   existsSync,
   mkdirSync,
   readFileSync,
   writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import type { Observation } from './collect.ts';

export const FIXTURE_DIR = join(
   import.meta.dir,
   '../../test/fixtures/reports/captured',
);
export const MANIFEST = join(FIXTURE_DIR, 'manifest.json');

export interface ManifestEntry {
   file: string;
   stage: string;
   gameId: number;
   report: string;
   observation: string;
   url: string;
   requestStart: string;
   responseReceived: string | null;
   status: number | null;
   bodyBytes: number | null;
   sha256: string | null;
   lastModified: string | null;
   contentType: string | null;
   context: (Observation['context'] & { observation: string }) | null;
   collector: Observation['collector'];
   note: string;
}

function arg(name: string): string | undefined {
   const i = process.argv.indexOf(`--${name}`);
   return i >= 0 ? process.argv[i + 1] : undefined;
}

function main(): void {
   const data = arg('data');
   const id = arg('obs');
   const name = arg('name');
   const stage = arg('stage');
   if (!data || !id || !name || !stage) {
      throw new Error('--data, --obs, --name and --stage are required');
   }
   const gameId = Number(id.split('-')[0]);
   const all = readFileSync(
      join(data, 'games', String(gameId), 'observations.jsonl'),
      'utf8',
   )
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Observation);
   const obs = all.find((o) => o.id === id);
   if (!obs?.body) throw new Error(`No stored body for observation ${id}`);
   const bytes = gunzipSync(readFileSync(join(data, obs.body)));
   const sha = createHash('sha256').update(bytes).digest('hex');
   if (sha !== obs.sha256) throw new Error(`Hash mismatch for ${id}`);

   const ctx = all.find(
      (o) => o.kind === 'context' && o.poll === obs.poll && o.context,
   );
   mkdirSync(FIXTURE_DIR, { recursive: true });
   writeFileSync(join(FIXTURE_DIR, name), bytes);

   const manifest: { fixtures: ManifestEntry[] } = existsSync(MANIFEST)
      ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
      : { fixtures: [] };
   const entry: ManifestEntry = {
      file: name,
      stage,
      gameId,
      report: obs.kind,
      observation: obs.id,
      url: obs.url,
      requestStart: obs.requestStart,
      responseReceived: obs.responseReceived,
      status: obs.status,
      bodyBytes: obs.bodyBytes,
      sha256: obs.sha256,
      lastModified: obs.headers?.['last-modified'] ?? null,
      contentType: obs.headers?.['content-type'] ?? null,
      context: ctx?.context
         ? { observation: ctx.id, ...ctx.context }
         : null,
      collector: obs.collector,
      note: arg('note') ?? '',
   };
   manifest.fixtures = manifest.fixtures.filter((f) => f.file !== name);
   manifest.fixtures.push(entry);
   manifest.fixtures.sort((a, b) =>
      a.gameId === b.gameId
         ? a.requestStart.localeCompare(b.requestStart)
         : a.gameId - b.gameId,
   );
   writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
   console.log(
      `${name}: ${stage} (${obs.kind} ${obs.status}, ${obs.bodyBytes} bytes)`,
   );
}

if (import.meta.main) main();

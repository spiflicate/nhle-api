/**
 * Collect one game's Game Summary (GS) report through its lifecycle:
 * 404 before publication, pregame, live, intermissions, final and the
 * next day. Run by .github/workflows/gs-capture.yml about every ten
 * minutes; each run is one tick and keeps its state in the data folder.
 *
 *    bun scripts/gs-capture/collect.ts start [--game <id>]  # new campaign
 *    bun scripts/gs-capture/collect.ts tick                 # one tick
 *    bun scripts/gs-capture/collect.ts stop [--reason <text>]
 *    bun scripts/gs-capture/collect.ts summary
 *
 * Options: --data <dir> (default gs-capture-data).
 *
 * Without --game, `start` leaves the pick to the first tick: the earliest
 * game at least six hours away in this week's schedule. See
 * campaign.ts for the window, caps and stages.
 *
 * Data folder:
 *    ACTIVE                       name of the active campaign folder
 *    objects/<sha256>.<ext>       every response body, by content
 *    <campaign>/state.json        the campaign
 *    <campaign>/observations.jsonl  one line per request, retries too
 *    <campaign>/summary.md        stage coverage and timelines
 *
 * Bodies are the bytes fetch hands back: the entity body after any
 * Content-Encoding is undone, not the bytes on the wire. The charset is
 * whatever Content-Type says; the bodies are saved undecoded.
 */
import { createHash } from 'node:crypto';
import {
   appendFileSync,
   existsSync,
   mkdirSync,
   readFileSync,
   writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { url as reportUrl } from '#/api/reports/index.ts';
import {
   type Campaign,
   type CampaignGame,
   contextOf,
   decide,
   finish,
   isFinal,
   newCampaign,
   type Observation,
   pickGame,
   stop,
} from './campaign.ts';
import { summary } from './summary.ts';

const API = 'https://api-web.nhle.com/v1';
const TIMEOUT_MS = 20_000;
const RETRY_WAIT_MS = 5_000;
const VERSION = 1;

function option(args: string[], name: string): string | undefined {
   const at = args.indexOf(name);
   return at >= 0 ? args[at + 1] : undefined;
}

function commit(): string {
   if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
   try {
      return Bun.spawnSync(['git', 'rev-parse', 'HEAD'])
         .stdout.toString()
         .trim();
   } catch {
      return 'unknown';
   }
}

function extension(contentType: string | undefined): string {
   if (contentType?.includes('html')) return 'html';
   if (contentType?.includes('json')) return 'json';
   return 'txt';
}

class Store {
   readonly dir: string;
   constructor(
      readonly root: string,
      name: string,
   ) {
      this.dir = join(root, name);
      mkdirSync(this.dir, { recursive: true });
      mkdirSync(join(root, 'objects'), { recursive: true });
   }

   static active(root: string): Store | undefined {
      const pointer = join(root, 'ACTIVE');
      if (!existsSync(pointer)) return undefined;
      const name = readFileSync(pointer, 'utf8').trim();
      return name ? new Store(root, name) : undefined;
   }

   load(): Campaign {
      return JSON.parse(readFileSync(join(this.dir, 'state.json'), 'utf8'));
   }

   save(c: Campaign, now: Date) {
      c.updatedAt = now.toISOString();
      writeFileSync(
         join(this.dir, 'state.json'),
         `${JSON.stringify(c, null, 2)}\n`,
      );
   }

   observations(): Observation[] {
      const file = join(this.dir, 'observations.jsonl');
      if (!existsSync(file)) return [];
      return readFileSync(file, 'utf8')
         .split('\n')
         .filter(Boolean)
         .map((line) => JSON.parse(line));
   }

   append(o: Observation) {
      appendFileSync(
         join(this.dir, 'observations.jsonl'),
         `${JSON.stringify(o)}\n`,
      );
   }

   /** Save a body by content; returns its reference */
   object(bytes: Uint8Array, contentType: string | undefined) {
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      const path = `objects/${sha256}.${extension(contentType)}`;
      const file = join(this.root, path);
      if (!existsSync(file)) writeFileSync(file, bytes);
      return { sha256, bytes: bytes.byteLength, path };
   }
}

/** Makes requests, counting each against the campaign's budget */
class Collector {
   private seq: number;
   constructor(
      private readonly store: Store,
      private readonly c: Campaign,
      private readonly version = { commit: commit(), version: VERSION },
   ) {
      this.seq = store.observations().length;
   }

   private async once(
      kind: Observation['kind'],
      url: string,
      attempt: number,
   ): Promise<{ obs: Observation; body?: Uint8Array }> {
      this.c.requests++;
      const obs: Observation = {
         seq: ++this.seq,
         kind,
         ...(this.c.game ? { gameId: this.c.game.id } : {}),
         url,
         attempt,
         requestedAt: new Date().toISOString(),
         collector: this.version,
      };
      let body: Uint8Array | undefined;
      try {
         const res = await fetch(url, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
            headers: {
               'User-Agent':
                  'nhle-api gs-capture (+https://github.com/spiflicate/nhle-api)',
            },
         });
         obs.status = res.status;
         obs.headers = Object.fromEntries(
            [...res.headers.entries()].filter(([k]) => k !== 'set-cookie'),
         );
         body = new Uint8Array(await res.arrayBuffer());
         obs.respondedAt = new Date().toISOString();
         obs.body = this.store.object(
            body,
            res.headers.get('content-type') ?? undefined,
         );
      } catch (error) {
         obs.respondedAt = new Date().toISOString();
         obs.error =
            error instanceof Error
               ? `${error.name}: ${error.message}`
               : String(error);
      }
      return { obs, ...(body ? { body } : {}) };
   }

   /** One request, retried once after a network error or a 5xx */
   async request(kind: Observation['kind'], url: string) {
      let result = await this.once(kind, url, 1);
      const failed = (o: Observation) =>
         o.error !== undefined || (o.status ?? 0) >= 500;
      if (failed(result.obs) && this.c.requests < this.c.maxRequests) {
         this.store.append(result.obs);
         await Bun.sleep(RETRY_WAIT_MS);
         result = await this.once(kind, url, 2);
      }
      return result;
   }

   /** Request, save the observation, and parse JSON when asked */
   async fetch(
      kind: Observation['kind'],
      url: string,
   ): Promise<{ obs: Observation; json?: unknown }> {
      const { obs, body } = await this.request(kind, url);
      let json: unknown;
      if (body && obs.status === 200 && kind !== 'report') {
         try {
            json = JSON.parse(new TextDecoder().decode(body));
         } catch (error) {
            obs.error = `body is not JSON: ${String(error)}`;
         }
      }
      if (kind === 'context' && json !== undefined) {
         obs.context = contextOf(json);
      }
      this.store.append(obs);
      return { obs, ...(json !== undefined ? { json } : {}) };
   }

   /** The GS report and the landing context, in that order */
   async pair(gameId: number) {
      await this.fetch('report', reportUrl(gameId, 'GS'));
      return this.fetch('context', `${API}/gamecenter/${gameId}/landing`);
   }
}

async function tick(root: string, now = new Date()) {
   const store = Store.active(root);
   if (!store) {
      console.log('No active campaign.');
      return;
   }
   const c = store.load();
   const action = decide(c, now);
   const collector = new Collector(store, c);

   switch (action.kind) {
      case 'none':
         console.log(`Nothing to do: ${action.reason}.`);
         break;
      case 'wait':
         console.log(`Waiting until ${action.until}.`);
         break;
      case 'select': {
         const date = now.toISOString().slice(0, 10);
         const { json } = await collector.fetch(
            'discovery',
            `${API}/schedule/${date}`,
         );
         const game = json ? pickGame(json, now) : undefined;
         if (!game) {
            stop(
               c,
               now,
               `no game at least six hours away in the ${date} schedule`,
            );
            break;
         }
         c.game = {
            ...game,
            selectedAt: now.toISOString(),
            selectedBy: 'schedule',
         };
         c.status = 'waiting';
         console.log(
            `Picked ${game.id} ${game.label}, starting ${game.startTimeUTC}.`,
         );
         break;
      }
      case 'poll': {
         const game = c.game as CampaignGame;
         c.windowStartedAt ??= now.toISOString();
         const { obs } = await collector.pair(game.id);
         if (obs.context && isFinal(obs.context) && !c.finalSeenAt) {
            c.finalSeenAt = obs.requestedAt;
         }
         console.log(
            `Polled ${game.id}: ${obs.context?.gameState ?? 'no context'}.`,
         );
         break;
      }
      case 'next-day': {
         const game = c.game as CampaignGame;
         await collector.pair(game.id);
         finish(c, now);
         console.log(
            `Took the next-day snapshot of ${game.id}; campaign done.`,
         );
         break;
      }
   }
   store.save(c, new Date());
   writeFileSync(
      join(store.dir, 'summary.md'),
      summary(c, store.observations()),
   );
}

async function start(
   root: string,
   gameId: number | undefined,
   now = new Date(),
) {
   const active = Store.active(root);
   if (active) {
      const status = active.load().status;
      if (status !== 'done' && status !== 'stopped') {
         throw new Error(`A campaign is already ${status}; stop it first.`);
      }
   }
   const name = now.toISOString().slice(0, 16).replace(/[-:]/g, '');
   const store = new Store(root, name);
   const c = newCampaign(now);
   if (gameId !== undefined) {
      const collector = new Collector(store, c);
      const { json } = await collector.fetch(
         'discovery',
         `${API}/gamecenter/${gameId}/landing`,
      );
      const o = (json ?? {}) as {
         startTimeUTC?: string;
         awayTeam?: { abbrev?: string };
         homeTeam?: { abbrev?: string };
      };
      if (!o.startTimeUTC)
         throw new Error(`No start time found for game ${gameId}.`);
      c.game = {
         id: gameId,
         label: `${o.awayTeam?.abbrev ?? '?'}@${o.homeTeam?.abbrev ?? '?'}`,
         startTimeUTC: o.startTimeUTC,
         selectedAt: now.toISOString(),
         selectedBy: 'dispatch',
      };
      c.status = 'waiting';
   }
   store.save(c, now);
   writeFileSync(join(root, 'ACTIVE'), `${name}\n`);
   writeFileSync(
      join(store.dir, 'summary.md'),
      summary(c, store.observations()),
   );
   console.log(
      `Started campaign ${name}${c.game ? ` for ${c.game.id} ${c.game.label}` : ''}.`,
   );
}

async function main() {
   const args = process.argv.slice(2);
   const root = option(args, '--data') ?? 'gs-capture-data';
   mkdirSync(root, { recursive: true });
   const command = args[0];
   switch (command) {
      case 'start': {
         const game = option(args, '--game');
         await start(root, game ? Number(game) : undefined);
         break;
      }
      case 'tick':
         await tick(root);
         break;
      case 'stop': {
         const store = Store.active(root);
         if (!store) {
            console.log('No active campaign.');
            break;
         }
         const c = store.load();
         const now = new Date();
         stop(c, now, option(args, '--reason') ?? 'stopped by hand');
         store.save(c, now);
         writeFileSync(
            join(store.dir, 'summary.md'),
            summary(c, store.observations()),
         );
         console.log('Stopped.');
         break;
      }
      case 'summary': {
         const store = Store.active(root);
         console.log(
            store
               ? summary(store.load(), store.observations())
               : 'No active campaign.',
         );
         break;
      }
      default:
         console.error(
            'Usage: collect.ts start [--game <id>] | tick | stop | summary',
         );
         process.exit(2);
   }
}

if (import.meta.main) await main();

/**
 * The Markdown summary of a GS capture campaign: what it covered, what
 * it missed, and how the report and the game changed over time.
 */
import {
   type Campaign,
   coverage,
   type Observation,
   STAGES,
} from './campaign.ts';

/** `+1h05m` / `-5h50m` relative to the scheduled start */
export function relative(at: string, start: string): string {
   const diff = Math.round(
      (new Date(at).getTime() - new Date(start).getTime()) / 60_000,
   );
   const sign = diff < 0 ? '-' : '+';
   const abs = Math.abs(diff);
   const h = Math.floor(abs / 60);
   const m = String(abs % 60).padStart(2, '0');
   return `${sign}${h}h${m}m`;
}

function moment(o: Observation): string {
   const ctx = o.context;
   if (!ctx) return '';
   return [
      ctx.gameState,
      ctx.period !== undefined && `P${ctx.period}`,
      ctx.periodType,
      ctx.inIntermission && 'INT',
      ctx.timeRemaining,
   ]
      .filter(Boolean)
      .join(' ');
}

export function summary(c: Campaign, obs: readonly Observation[]): string {
   const start = c.game?.startTimeUTC;
   const rel = (at: string) => (start ? relative(at, start) : '');
   const lines = [
      '# Game Summary capture',
      '',
      c.game
         ? `Game ${c.game.id} ${c.game.label}, scheduled ${c.game.startTimeUTC} (picked by ${c.game.selectedBy} at ${c.game.selectedAt}).`
         : 'No game picked yet.',
      '',
      `Status: **${c.status}**. Requests: ${c.requests} of ${c.maxRequests}. Observations: ${obs.length}.`,
   ];
   if (c.windowStartedAt) {
      lines.push(
         '',
         `Polling from ${c.windowStartedAt} (${rel(c.windowStartedAt)})${c.finalSeenAt ? `; final first seen ${c.finalSeenAt} (${rel(c.finalSeenAt)})` : ''}.`,
      );
   }

   const stages = coverage(obs, c);
   lines.push(
      '',
      '## Stages',
      '',
      '| Stage | First observation | Relative to start |',
      '| --- | --- | --- |',
      ...STAGES.map((s) => {
         const o = stages.get(s);
         return o
            ? `| ${s} | #${o.seq} ${o.requestedAt} | ${rel(o.requestedAt)} |`
            : `| ${s} | **missing** | |`;
      }),
   );
   const missing = STAGES.filter((s) => !stages.get(s));
   if (missing.length > 0) {
      lines.push('', `Not covered yet: ${missing.join('; ')}.`);
   }

   // Every change of report status or content, and of game context
   const report: string[] = [];
   const game: string[] = [];
   let lastReport: string | undefined;
   let lastGame: string | undefined;
   for (const o of obs) {
      const at = `${o.requestedAt} (${rel(o.requestedAt)})`;
      if (o.kind === 'report') {
         const key = o.error
            ? `error: ${o.error}`
            : `${o.status} ${o.body ? `${o.body.sha256.slice(0, 12)} ${o.body.bytes} B` : ''}`;
         if (key !== lastReport) {
            report.push(`- #${o.seq} ${at}: ${key}`);
            lastReport = key;
         }
      } else if (o.kind === 'context') {
         const ctx = o.context;
         const key = ctx
            ? `${ctx.gameState}${ctx.periodType ? ` ${ctx.periodType}` : ''}${ctx.inIntermission ? ' INT' : ''}`
            : `${o.status ?? 'error'}${o.error ? `: ${o.error}` : ''}`;
         if (key !== lastGame) {
            game.push(`- #${o.seq} ${at}: ${moment(o) || key}`);
            lastGame = key;
         }
      }
   }
   if (report.length > 0) {
      lines.push('', '## Report changes', '', ...report);
   }
   if (game.length > 0) {
      lines.push('', '## Game context changes', '', ...game);
   }
   if (c.notes.length > 0) {
      lines.push('', '## Notes', '', ...c.notes.map((n) => `- ${n}`));
   }
   lines.push(
      '',
      'Observations are in `observations.jsonl`; bodies are under `objects/` by SHA-256. Bodies are the bytes fetch returned (Content-Encoding undone), saved undecoded.',
   );
   return `${lines.join('\n')}\n`;
}

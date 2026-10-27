/**
 * Pure HTML time-on-ice parsing, adapted from who-starts' toi-report.ts at
 * 6688f47f3bdad0f16fc305b2ec84c369ab023666 (original SHA-256:
 * 6c2bc9268d946ae19c28f179fdd304a53d2e5582faabc5ea35b1ce9720c9a580).
 * Adds explicit validation rather than silently skipping unreadable shift rows.
 * No name lookups, text garbling, synthetic source IDs or JSON shift fallback.
 */
import type { APIResult } from '#/client/types.ts';
import { ParseError } from '#/errors/index.ts';
import type { GamecenterPlayByPlay } from '#/types/index.ts';

/** Minimal game-specific context needed to resolve report sweater numbers. */
export interface ShiftRoster {
   id: number;
   homeTeam: Pick<GamecenterPlayByPlay['homeTeam'], 'id'>;
   awayTeam: Pick<GamecenterPlayByPlay['awayTeam'], 'id'>;
   rosterSpots: Pick<
      GamecenterPlayByPlay['rosterSpots'][number],
      'teamId' | 'playerId' | 'sweaterNumber'
   >[];
}

/** One HTML shift. Clocks are elapsed within the period, formatted MM:SS. */
export interface ReportShift {
   /** HTML does not publish the JSON feed's shift/event IDs. */
   id: null;
   eventNumber: null;
   gameId: number;
   teamId: number;
   playerId: number;
   sweaterNumber: number;
   period: number;
   shiftNumber: number;
   startTime: string;
   endTime: string;
   duration: string;
}

export interface ShiftChart {
   gameId: number;
   source: 'html';
   total: number;
   data: ReportShift[];
}

function text(html: string): string {
   return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
}

function clock(value: string): { value: string; seconds: number } {
   const elapsed = value.split('/')[0]?.trim() ?? '';
   const match = /^(\d{1,2}):([0-5]\d)$/.exec(elapsed);
   if (!match) throw new ParseError(`Invalid shift clock: ${value}`);
   return {
      value: `${match[1]?.padStart(2, '0')}:${match[2]}`,
      seconds: Number(match[1]) * 60 + Number(match[2]),
   };
}

function positive(value: unknown): value is number {
   return (
      typeof value === 'number' && Number.isSafeInteger(value) && value > 0
   );
}

function teamShifts(
   html: string,
   gameId: number,
   teamId: number,
   roster: ShiftRoster,
): ReportShift[] {
   if (!/TIME ON ICE/i.test(text(html)) || !/<\/html\s*>/i.test(html)) {
      throw new ParseError('Missing or incomplete time-on-ice report');
   }
   const blocks = html
      .split(/class=["']playerHeading[^"']*["'][^>]*>/i)
      .slice(1);
   if (!blocks.length)
      throw new ParseError('Time-on-ice report has no player headings');
   const shifts: ReportShift[] = [];
   for (const block of blocks) {
      const heading = text(block.slice(0, block.search(/<\/td>/i)));
      const sweater = /^(\d+)\s/.exec(heading)?.[1];
      if (!sweater)
         throw new ParseError(`Unreadable player heading: ${heading}`);
      const sweaterNumber = Number(sweater);
      // Stop before per-period totals, whose numeric cells are not shifts.
      const summary = /<td[^>]*>\s*Per\s*<\/td>\s*<td[^>]*>\s*SHF/i.exec(
         block,
      );
      if (!summary)
         throw new ParseError(
            `Incomplete shift table for sweater ${sweater}`,
         );
      const table = block.slice(0, summary.index);
      for (const row of table.split(/<tr[^>]*>/i).slice(1)) {
         const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(
            (m) => text(m[1] ?? ''),
         );
         const [shift, per, start, end, duration] = cells;
         if (shift === 'Shift #' || cells.length === 0) continue;
         if (cells.length === 1 && !shift && /\bspacer\b/i.test(row))
            continue;
         if (
            !shift ||
            !/^\d+$/.test(shift) ||
            !per ||
            !start ||
            !end ||
            !duration
         ) {
            throw new ParseError(
               `Unreadable shift row for sweater ${sweater}`,
            );
         }
         const period =
            per === 'OT' ? 4 : /^\d+$/.test(per) ? Number(per) : NaN;
         if (!positive(period) || !positive(Number(shift)))
            throw new ParseError('Invalid shift period or number');
         const from = clock(start),
            to = clock(end),
            length = clock(duration);
         if (
            to.seconds < from.seconds ||
            to.seconds > 1200 ||
            to.seconds - from.seconds !== length.seconds
         ) {
            throw new ParseError(
               `Inconsistent shift clocks for sweater ${sweater}`,
            );
         }
         const matches = roster.rosterSpots.filter(
            (player) =>
               player.teamId === teamId &&
               player.sweaterNumber === sweaterNumber,
         );
         const ids = new Set(matches.map((player) => player.playerId));
         const playerId = matches[0]?.playerId;
         if (ids.size !== 1 || !positive(playerId)) {
            throw new ParseError(
               `Unmapped or ambiguous sweater ${sweater} for team ${teamId}`,
            );
         }
         shifts.push({
            id: null,
            eventNumber: null,
            gameId,
            teamId,
            playerId,
            sweaterNumber,
            period,
            shiftNumber: Number(shift),
            startTime: from.value,
            endTime: to.value,
            duration: length.value,
         });
      }
   }
   if (!shifts.length)
      throw new ParseError('Time-on-ice report contains no shifts');
   return shifts;
}

export function parseShifts(
   gameId: number,
   home: string,
   away: string,
   roster: ShiftRoster,
): APIResult<ShiftChart> {
   try {
      if (
         roster.id !== gameId ||
         !positive(roster.homeTeam?.id) ||
         !positive(roster.awayTeam?.id) ||
         roster.homeTeam.id === roster.awayTeam.id ||
         !Array.isArray(roster.rosterSpots)
      ) {
         throw new ParseError('Invalid game-specific shift roster');
      }
      const data = [
         ...teamShifts(home, gameId, roster.homeTeam.id, roster),
         ...teamShifts(away, gameId, roster.awayTeam.id, roster),
      ];
      return {
         success: true,
         data: { gameId, source: 'html', total: data.length, data },
      };
   } catch (error) {
      if (error instanceof ParseError) return { success: false, error };
      return {
         success: false,
         error: new ParseError('Unable to parse time-on-ice reports', {
            cause: error,
         }),
      };
   }
}

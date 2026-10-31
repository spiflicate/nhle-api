import type { APIResult } from '#/client/types.ts';
import { ParseError } from '#/errors/index.ts';
import {
   attribute,
   cells,
   descendants,
   nodeText,
   type ReportNode,
   readReport,
   rows,
} from './html.ts';
import { type GameTimes, parseGameTimes } from './parse.ts';

export interface SummaryTeam {
   name: string;
   score: number;
}
export interface SummaryGoal {
   number: number;
   /** Label as printed: e.g. 1, OT, 2OT, SO. */
   period: string;
   time: string;
   strength: string;
   team: string;
   /** Printed sweater/name/stat text; not an NHL player ID. */
   scorer: string;
   assists: string[];
   onIce: { away: number[]; home: number[] };
}
/**
 * A penalty shot that didn't score, printed in the scoring table as
 * 'Unsuccessful Penalty Shot' with no goal number
 */
export interface SummaryMissedPenaltyShot {
   period: string;
   time: string;
   /** e.g. 'EV-PS' */
   strength: string;
   team: string;
   /** Printed sweater and name, e.g. '91 F.NAZAR' */
   shooter: string;
   /** The sweaters printed in the on-ice columns: shooter and goalie */
   onIce: { away: number[]; home: number[] };
}
export interface SummaryPenalty {
   number: number;
   period: string;
   time: string;
   player: string;
   minutes: number;
   penalty: string;
}
export interface SummaryPeriod {
   /** Includes the report's TOT row. */
   period: string;
   goals: number;
   shots: number;
   penalties: number;
   penaltyMinutes: number;
}
export interface SummaryStrength {
   situation: string;
   goals: number;
   occurrences: number;
   time: string;
}
export interface SummaryGoalie {
   kind: 'goalie' | 'empty-net' | 'team-total';
   sweaterNumber: number | null;
   /**
    * The decision printed after the name once the game is final: 'W', 'L',
    * or 'OT' (an overtime or shootout loss); null before then, and for
    * goalies without one
    */
   decision: 'W' | 'L' | 'OT' | null;
   name: string;
   timeOnIce: {
      evenStrength: string | null;
      powerPlay: string | null;
      shortHanded: string | null;
      total: string | null;
   };
   goalsShotsAgainst: {
      period: string;
      goals: number | null;
      shots: number | null;
   }[];
}
export interface SummaryStar {
   rank: number;
   team: string;
   position: string;
   player: string;
}

/** Data printed on the GS sheet, not merged with JSON game statistics. */
export interface GameSummary {
   gameId: number;
   source: 'html';
   times: GameTimes;
   awayTeam: SummaryTeam;
   homeTeam: SummaryTeam;
   attendance: number | null;
   venue: string | null;
   /**
    * Status line as printed, e.g. 'Period 2 (09:49 Remaining)', 'End of
    * Period 1' or 'Final'; empty until shortly before the puck drops.
    */
   status: string;
   /** Includes the deciding SO entry if printed; not a reconstructed goal feed. */
   goals: SummaryGoal[];
   missedPenaltyShots: SummaryMissedPenaltyShot[];
   penalties: { away: SummaryPenalty[]; home: SummaryPenalty[] };
   byPeriod: { away: SummaryPeriod[]; home: SummaryPeriod[] };
   powerPlays: { away: SummaryStrength[]; home: SummaryStrength[] };
   evenStrength: { away: SummaryStrength[]; home: SummaryStrength[] };
   goalies: { away: SummaryGoalie[]; home: SummaryGoalie[] };
   officials: {
      referees: string[];
      linespeople: string[];
      standbyReferees: string[];
      standbyLinespeople: string[];
   };
   /**
    * Empty until the stars are chosen. During the game the sheet prints
    * placeholder rows with only a team, which are left out.
    */
   stars: SummaryStar[];
}

function integer(value: string | undefined): number {
   if (value === undefined || !/^\d+$/.test(value))
      throw new ParseError(`Invalid Game Summary number: ${value}`);
   return Number(value);
}
function required<T>(value: T | undefined, label: string): T {
   if (value === undefined)
      throw new ParseError(`Missing Game Summary ${label}`);
   return value;
}
function width(row: string[], count: number): void {
   if (row.length !== count)
      throw new ParseError('Unreadable Game Summary row');
}
function dataRows(table: ReportNode): string[][] {
   return rows(table)
      .slice(1)
      .filter((row) => row.some(Boolean));
}
function pair<T>(
   tables: ReportNode[],
   parse: (table: ReportNode) => T,
): { away: T; home: T } {
   if (tables.length !== 2)
      throw new ParseError('Expected away/home Game Summary tables');
   return {
      away: parse(required(tables[0], 'away table')),
      home: parse(required(tables[1], 'home table')),
   };
}

/**
 * Until attendance is printed, during the first period, the header line
 * after the date holds the venue alone
 */
function venueAlone(info: string[]): string | null {
   const date = info.findIndex((value) =>
      /^\w+day,\s+\w+\s+\d{1,2},\s+\d{4}$/.test(value),
   );
   const next = date >= 0 ? info[date + 1] : undefined;
   return next && !/^(?:Start|End|Game|Attendance)\b/.test(next)
      ? next
      : null;
}

/** 'ELLIS, COLTEN (W)' → name and decision; the suffix is added after the final */
function decided(value: string): Pick<SummaryGoalie, 'name' | 'decision'> {
   const match = /^(.*?)\s*\((W|L|OT)\)$/.exec(value);
   return match
      ? {
           name: match[1] ?? '',
           decision: (match[2] ?? null) as SummaryGoalie['decision'],
        }
      : { name: value, decision: null };
}

export function parseGameSummary(
   gameId: number,
   html: string,
   scheduledStart?: Date,
): APIResult<GameSummary> {
   // Every published sheet, before, during and after the game, ends with
   // </html> and holds every section (empty until filled), so a missing
   // close means the download was cut off rather than the game unfinished
   if (!/<\/html>\s*$/i.test(html)) {
      return {
         success: false,
         error: new ParseError('The Game Summary is truncated'),
      };
   }
   const times = parseGameTimes(html, scheduledStart);
   if (!times.success) return times;
   try {
      const root = readReport(html);
      const tables = descendants(root, 'table');
      const byId = (id: string) =>
         required(
            tables.find((table) => attribute(table, 'id') === id),
            id,
         );
      const matching = (prefix: string[]) =>
         tables.filter((table) =>
            prefix.every((cell, index) => rows(table)[0]?.[index] === cell),
         );
      const team = (id: string): SummaryTeam => {
         const table = byId(id);
         const values = descendants(table, 'td').map(nodeText);
         const name = values
            .map(
               (value) =>
                  /^(.*?)\s+Game\s+\d+\s+(?:Away|Home) Game\s+\d+$/.exec(
                     value,
                  )?.[1],
            )
            .find(Boolean);
         const score = values.find((value) => /^\d+$/.test(value));
         return {
            name: required(name, `${id} name`),
            score: integer(score),
         };
      };
      const info = rows(byId('GameInfo')).flat();
      const attendance = info
         // The number is left out until it is announced: 'Attendance  at X'
         .map((value) => /^Attendance\s+([\d,]*)\s*at\s+(.+)$/.exec(value))
         .find(Boolean);
      const scoring = required(
         matching(['G', 'Per', 'Time', 'Str', 'Team'])[0],
         'scoring table',
      );
      const sweaters = (value: string) =>
         value ? value.split(',').map((part) => integer(part.trim())) : [];
      const scoringRows = dataRows(scoring);
      const missed = (row: string[]) =>
         row[0] === '-' && row.includes('Unsuccessful Penalty Shot');
      const missedPenaltyShots = scoringRows.filter(missed).map((row) => {
         width(row, 9);
         return {
            period: row[1] ?? '',
            time: row[2] ?? '',
            strength: row[3] ?? '',
            team: row[4] ?? '',
            shooter: row[5] ?? '',
            onIce: {
               away: sweaters(row[7] ?? ''),
               home: sweaters(row[8] ?? ''),
            },
         };
      });
      const goals = scoringRows
         .filter((row) => !missed(row))
         .map((row) => {
            width(row, 10);
            return {
               number: integer(row[0]),
               period: row[1] ?? '',
               time: row[2] ?? '',
               strength: row[3] ?? '',
               team: row[4] ?? '',
               scorer: row[5] ?? '',
               // 'unassisted' fills the first assist column when there are none
               assists: row
                  .slice(6, 8)
                  .filter((assist) => assist && assist !== 'unassisted'),
               onIce: {
                  away: sweaters(row[8] ?? ''),
                  home: sweaters(row[9] ?? ''),
               },
            };
         });
      const penalties = pair(
         matching(['#', 'Per', 'Time', 'Player', 'PIM', 'Penalty']),
         (table) =>
            dataRows(table).map((row) => {
               width(row, 6);
               return {
                  number: integer(row[0]),
                  period: row[1] ?? '',
                  time: row[2] ?? '',
                  player: row[3] ?? '',
                  minutes: integer(row[4]),
                  penalty: row[5] ?? '',
               };
            }),
      );
      const byPeriod = pair(
         matching(['Per', 'Goals', 'Shots', 'PN', 'PIM']),
         (table) =>
            dataRows(table).map((row) => {
               width(row, 5);
               return {
                  period: row[0] ?? '',
                  goals: integer(row[1]),
                  shots: integer(row[2]),
                  penalties: integer(row[3]),
                  penaltyMinutes: integer(row[4]),
               };
            }),
      );
      const strength = (table: ReportNode): SummaryStrength[] => {
         const [columns = [], values = []] = rows(table);
         return values.flatMap((value, i) => {
            if (!value) return [];
            const match = /^(\d+)-(\d+)\/(\d+:\d{2})$/.exec(value);
            if (!match)
               throw new ParseError(
                  `Unreadable strength summary: ${value}`,
               );
            return [
               {
                  situation: columns[i] ?? '',
                  goals: integer(match[1]),
                  occurrences: integer(match[2]),
                  time: match[3] ?? '',
               },
            ];
         });
      };
      const goalieTable = required(
         tables.find(
            (table) =>
               rows(table)[0]?.[1] === 'TOI' &&
               rows(table)[0]?.[2] === 'GOALS-SHOTS AGAINST',
         ),
         'goaltender table',
      );
      const goalieRows = goalieTable.children.filter(
         (child): child is ReportNode =>
            typeof child !== 'string' && child.tag === 'tr',
      );
      const goalies: GameSummary['goalies'] = { away: [], home: [] };
      let side: 'away' | 'home' = 'away';
      let periods: string[] = [];
      for (const row of goalieRows) {
         const nodes = cells(row);
         const values = nodes.map(nodeText);
         if (values.includes('GOALS-SHOTS AGAINST')) {
            side = attribute(
               required(nodes[0], 'goalie heading'),
               'class',
            )?.includes('homesectionheading')
               ? 'home'
               : 'away';
            continue;
         }
         if (values[0] === 'EV') {
            periods = values.slice(4);
            continue;
         }
         if (!values.some(Boolean)) continue;
         const kind = values.includes('EMPTY NET')
            ? 'empty-net'
            : values[0] === 'TEAM TOTALS'
              ? 'team-total'
              : 'goalie';
         const offset =
            kind === 'goalie' ? 3 : kind === 'empty-net' ? 2 : 1;
         width(values, offset + 4 + periods.length);
         goalies[side].push({
            kind,
            sweaterNumber: kind === 'goalie' ? integer(values[0]) : null,
            ...decided(values[offset - 1] ?? ''),
            timeOnIce: {
               evenStrength: values[offset] || null,
               powerPlay: values[offset + 1] || null,
               shortHanded: values[offset + 2] || null,
               total: values[offset + 3] || null,
            },
            goalsShotsAgainst: periods.map((period, i) => {
               const value = values[offset + 4 + i] ?? '';
               const match = /^(\d+)-(\d+)$/.exec(value);
               if (value && !match)
                  throw new ParseError(
                     `Unreadable goalie goals/shots: ${value}`,
                  );
               return {
                  period,
                  goals: match ? integer(match[1]) : null,
                  shots: match ? integer(match[2]) : null,
               };
            }),
         });
      }
      const officialsTable = required(
         tables.find(
            (table) =>
               rows(table)[0]?.[0] === 'Referee' &&
               /^(Linesperson|Linesman)$/.test(rows(table)[0]?.[1] ?? ''),
         ),
         'officials table',
      );
      const officialRows = officialsTable.children.filter(
         (child): child is ReportNode =>
            typeof child !== 'string' && child.tag === 'tr',
      );
      const officialsAt = (row: number, column: number): string[] => {
         const cell = cells(required(officialRows[row], 'officials row'))[
            column
         ];
         if (!cell) return [];
         return descendants(cell, 'td').map(nodeText).filter(Boolean);
      };
      const starTable = tables.find((table) =>
         /^1\.$/.test(rows(table)[0]?.[0] ?? ''),
      );
      const stars = starTable
         ? rows(starTable).flatMap((row) => {
              width(row, 4);
              // A placeholder, e.g. '1. BUF .', has no position or player
              if (!row[2] && !/[A-Za-z0-9]/.test(row[3] ?? '')) return [];
              return [
                 {
                    rank: integer(row[0]?.replace('.', '')),
                    team: row[1] ?? '',
                    position: row[2] ?? '',
                    player: row[3] ?? '',
                 },
              ];
           })
         : [];
      return {
         success: true,
         data: {
            gameId,
            source: 'html',
            times: times.data,
            awayTeam: team('Visitor'),
            homeTeam: team('Home'),
            attendance: attendance?.[1]
               ? integer(attendance[1].replaceAll(',', ''))
               : null,
            venue: attendance?.[2] ?? venueAlone(info),
            status: required(info[info.length - 1], 'status'),
            goals,
            missedPenaltyShots,
            penalties,
            byPeriod,
            powerPlays: pair(matching(['5v4', '5v3', '4v3']), strength),
            evenStrength: pair(matching(['5v5', '4v4', '3v3']), strength),
            goalies,
            officials: {
               referees: officialsAt(1, 0),
               linespeople: officialsAt(1, 1),
               standbyReferees: officialRows[3] ? officialsAt(3, 0) : [],
               standbyLinespeople: officialRows[3] ? officialsAt(3, 1) : [],
            },
            stars,
         },
      };
   } catch (error) {
      return {
         success: false,
         error:
            error instanceof ParseError
               ? error
               : new ParseError('Unable to parse Game Summary', {
                    cause: error,
                 }),
      };
   }
}

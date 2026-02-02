import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

interface Player {
   number: number;
   name: string;
}

interface Goal {
   number: number;
   period: number;
   time: string;
   strength: string;
   team: string;
   scorer: Player;
   assists: Player[];
   playersOnIce: {
      dal: number[];
      njd: number[];
   };
}

interface Penalty {
   number: number;
   period: number;
   time: string;
   player: Player;
   pim: number;
   type: string;
   team: string;
}

interface PeriodStats {
   period: number;
   goals: number;
   shots: number;
   penalties: number;
   pim: number;
}

interface TeamStats {
   name: string;
   shortCode: string;
   game: number;
   gameType: 'Away Game' | 'Home Game';
   score: number;
   periodStats: PeriodStats[];
   totalShots: number;
   totalPenalties: number;
   totalPIM: number;
   powerPlayStats: {
      goals: number;
      opportunities: number;
      time: string;
   };
   evenStrengthStats: {
      goals: number;
      occurrences: number;
      time: string;
   };
}

interface GameSummary {
   gameId: string;
   date: string;
   startTime: string;
   endTime: string;
   venue: string;
   attendance: number;
   visitor: TeamStats;
   home: TeamStats;
   goals: Goal[];
   penalties: Penalty[];
   officials: {
      referees: string[];
      linespeople: string[];
   };
   threeStar: {
      star: number;
      team: string;
      position: string;
      player: string;
   }[];
}

function parsePlayerFromCell(text: string | undefined): Player {
   if (!text) return { number: 0, name: '' };
   const match = text.match(/(\d+)\s+([A-Z\s.]+)/);
   if (match) {
      return {
         number: parseInt(match[1] || '0', 10),
         name: (match[2] || '').trim(),
      };
   }
   return { number: 0, name: text.trim() };
}

function parseGameSummary(htmlContent: string): GameSummary {
   const $ = cheerio.load(htmlContent);

   // Extract game ID and basic info
   const allText = $.text();
   const gameIdMatch = allText.match(/Game (\d+)/);
   const gameId = gameIdMatch?.[1] ?? '';

   // Extract date
   const dateMatch = allText.match(
      /([A-Za-z]+,\s+[A-Za-z]+\s+\d+,\s+\d{4})/,
   );
   const date = dateMatch?.[1] ?? '';

   // Extract times
   const timeMatch = allText.match(
      /Start\s+(\d+:\d+)\s+[A-Z]+;\s+End\s+(\d+:\d+)\s+[A-Z]+/,
   );
   const startTime = timeMatch?.[1] ?? '';
   const endTime = timeMatch?.[2] ?? '';

   // Extract venue and attendance
   const venueMatch = allText.match(
      /Attendance\s+([\d,]+)\s+at\s+(.+?)(?:\n|$)/,
   );
   const attendance = venueMatch
      ? parseInt((venueMatch[1] ?? '0').replace(/,/g, ''), 10)
      : 0;
   const venue = venueMatch?.[2]?.trim() ?? '';

   // Parse teams and scores
   let visitorTeam: TeamStats | null = null;
   let homeTeam: TeamStats | null = null;

   // Extract visitor team
   const visitorSection = allText.substring(
      allText.indexOf('VISITOR'),
      allText.indexOf('HOME'),
   );
   const visitorScoreMatch = visitorSection.match(/(\d+)/);
   const visitorScore = visitorScoreMatch
      ? parseInt(visitorScoreMatch[1] ?? '0', 10)
      : 0;
   const visitorNameMatch = visitorSection.match(
      /([A-Z\s]+)\s+Game\s+(\d+)\s+Away Game\s+(\d+)/,
   );
   const visitorName = visitorNameMatch?.[1]?.trim() ?? '';
   const visitorGameNum = visitorNameMatch
      ? parseInt(visitorNameMatch[2] ?? '0', 10)
      : 0;

   // Extract home team
   const homeSection = allText.substring(
      allText.indexOf('HOME'),
      allText.indexOf('SCORING'),
   );
   const homeScoreMatch = homeSection.match(/(\d+)/);
   const homeScore = homeScoreMatch
      ? parseInt(homeScoreMatch[1] ?? '0', 10)
      : 0;
   const homeNameMatch = homeSection.match(
      /([A-Z\s]+)\s+Game\s+(\d+)\s+Home Game\s+(\d+)/,
   );
   const homeName = homeNameMatch?.[1]?.trim() ?? '';
   const homeGameNum = homeNameMatch
      ? parseInt(homeNameMatch[2] ?? '0', 10)
      : 0;

   // Parse scoring summary - look for "SCORING SUMMARY" header and extract table after it
   const goals: Goal[] = [];

   $('table').each((_i, table) => {
      const tableText = $(table).text();

      // Look for scoring summary section
      if (tableText.includes('SCORING SUMMARY')) {
         // Get the rows following scoring summary header
         const rows = $(table).find('tr');
         let inGoalSection = false;

         rows.each((_j, row) => {
            const cells = $(row).find('td');
            const cellTexts = cells
               .map((_, cell) => $(cell).text().trim())
               .get();

            // Check for header row (G, Per, Time, etc.)
            if (cellTexts[0] === 'G' && cellTexts[1] === 'Per') {
               inGoalSection = true;
               return;
            }

            // Parse goal rows
            if (
               inGoalSection &&
               cellTexts.length > 7 &&
               cellTexts[0] &&
               !Number.isNaN(parseInt(cellTexts[0], 10))
            ) {
               const goalNumber = parseInt(cellTexts[0] ?? '0', 10);
               const period = parseInt(cellTexts[1] ?? '0', 10);
               const time = cellTexts[2] ?? '';
               const strength = cellTexts[3] ?? '';
               const team = cellTexts[4] ?? '';
               const scorerText = cellTexts[5];
               const assist1Text = cellTexts[6];
               const assist2Text = cellTexts[7];

               goals.push({
                  number: goalNumber,
                  period,
                  time,
                  strength,
                  team,
                  scorer: parsePlayerFromCell(scorerText),
                  assists: [
                     parsePlayerFromCell(assist1Text),
                     parsePlayerFromCell(assist2Text),
                  ],
                  playersOnIce: {
                     dal: [],
                     njd: [],
                  },
               });
            }
         });
      }
   });

   // Parse penalties - look for "PENALTY SUMMARY" section
   const penalties: Penalty[] = [];

   $('table').each((_i, table) => {
      const tableText = $(table).text();

      if (tableText.includes('PENALTY SUMMARY')) {
         const rows = $(table).find('tr');
         let inPenaltySection = false;
         let currentTeam = 'DAL';

         rows.each((_j, row) => {
            const cells = $(row).find('td');
            const cellTexts = cells
               .map((_, cell) => $(cell).text().trim())
               .get();

            // Check for header rows
            if (cellTexts[0] === '#' && cellTexts[4] === 'PIM') {
               inPenaltySection = true;
               return;
            }

            // Detect team change
            if (
               cellTexts.some(
                  (t) =>
                     t.includes('DALLAS STARS') || t.includes('DAL on Ice'),
               )
            ) {
               currentTeam = 'DAL';
               return;
            }
            if (
               cellTexts.some(
                  (t) =>
                     t.includes('NEW JERSEY DEVILS') ||
                     t.includes('NJD on Ice'),
               )
            ) {
               currentTeam = 'NJD';
               return;
            }

            // Parse penalty rows - look for entries that match pattern
            if (
               inPenaltySection &&
               cellTexts[0] &&
               !Number.isNaN(parseInt(cellTexts[0], 10)) &&
               cellTexts[0] !== '#'
            ) {
               const penaltyNumber = parseInt(cellTexts[0] ?? '0', 10);
               const period = parseInt(cellTexts[1] ?? '0', 10);
               const time = cellTexts[2] ?? '';
               const playerText = cellTexts[3];
               const pim = parseInt(cellTexts[4] ?? '0', 10);
               const penaltyType = cellTexts[5] ?? '';

               // Only add valid penalties (with actual PIM values)
               if (!Number.isNaN(pim) && penaltyType) {
                  penalties.push({
                     number: penaltyNumber,
                     period,
                     time,
                     player: parsePlayerFromCell(playerText),
                     pim,
                     type: penaltyType,
                     team: currentTeam,
                  });
               }
            }
         });
      }
   });

   // Parse officials and three stars
   const officials = {
      referees: [] as string[],
      linespeople: [] as string[],
   };
   const threeStar: Array<{
      star: number;
      team: string;
      position: string;
      player: string;
   }> = [];

   // Parse three stars
   const threeStarMatch =
      allText.match(/\d+\.\s+(DAL|NJD)\s+([A-Z])\s+\d+\s+([A-Z\s.]+)/g) ||
      [];
   threeStarMatch.forEach((match) => {
      const parts = match.match(
         /(\d+)\.\s+(DAL|NJD)\s+([A-Z])\s+(\d+)\s+([A-Z\s.]+)/,
      );
      if (parts) {
         threeStar.push({
            star: parseInt(parts[1] ?? '0', 10),
            team: parts[2] ?? '',
            position: parts[3] ?? '',
            player: (parts[5] ?? '').trim(),
         });
      }
   });

   // Build team stats
   visitorTeam = {
      name: visitorName,
      shortCode: 'DAL',
      game: visitorGameNum,
      gameType: 'Away Game',
      score: visitorScore,
      periodStats: [],
      totalShots: 0,
      totalPenalties: 0,
      totalPIM: 0,
      powerPlayStats: { goals: 0, opportunities: 0, time: '' },
      evenStrengthStats: { goals: 0, occurrences: 0, time: '' },
   };

   homeTeam = {
      name: homeName,
      shortCode: 'NJD',
      game: homeGameNum,
      gameType: 'Home Game',
      score: homeScore,
      periodStats: [],
      totalShots: 0,
      totalPenalties: 0,
      totalPIM: 0,
      powerPlayStats: { goals: 0, opportunities: 0, time: '' },
      evenStrengthStats: { goals: 0, occurrences: 0, time: '' },
   };

   // Parse period stats from "BY PERIOD" section
   const byPeriodMatch = allText.match(
      /BY PERIOD[\s\S]*?(?=POWER PLAYS|$)/,
   );
   if (byPeriodMatch) {
      const periodLines = byPeriodMatch[0].split('\n');
      let isVisitorTeam = true;
      periodLines.forEach((line) => {
         const periodMatch = line.match(
            /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/,
         );
         if (periodMatch) {
            const period = parseInt(periodMatch[1] ?? '0', 10);
            const goals = parseInt(periodMatch[2] ?? '0', 10);
            const shots = parseInt(periodMatch[3] ?? '0', 10);
            const penalties = parseInt(periodMatch[4] ?? '0', 10);
            const pim = parseInt(periodMatch[5] ?? '0', 10);

            const stat: PeriodStats = {
               period,
               goals,
               shots,
               penalties,
               pim,
            };

            if (isVisitorTeam) {
               visitorTeam?.periodStats.push(stat);
               if (visitorTeam) {
                  visitorTeam.totalShots += shots;
                  visitorTeam.totalPenalties += penalties;
                  visitorTeam.totalPIM += pim;
               }
            } else {
               homeTeam?.periodStats.push(stat);
               if (homeTeam) {
                  homeTeam.totalShots += shots;
                  homeTeam.totalPenalties += penalties;
                  homeTeam.totalPIM += pim;
               }
            }
            // Switch to home team after first set of periods
            if (period === 3) {
               isVisitorTeam = false;
            }
         }
      });
   }

   // Extract power play and even strength stats
   const ppMatch =
      allText.match(/Power Plays \(Goals-Opp\.\/PPTime\)\s+([0-9-/]+)/g) ||
      [];

   if (ppMatch.length >= 1 && ppMatch[0]) {
      const parts = ppMatch[0].match(/(\d+)-(\d+)\/(\d+):(\d+)/);
      if (parts && visitorTeam) {
         visitorTeam.powerPlayStats = {
            goals: parseInt(parts[1] ?? '0', 10),
            opportunities: parseInt(parts[2] ?? '0', 10),
            time: `${parts[3] ?? '0'}:${parts[4] ?? '00'}`,
         };
      }
   }

   if (ppMatch.length >= 2 && ppMatch[1]) {
      const parts = ppMatch[1].match(/(\d+)-(\d+)\/(\d+):(\d+)/);
      if (parts && homeTeam) {
         homeTeam.powerPlayStats = {
            goals: parseInt(parts[1] ?? '0', 10),
            opportunities: parseInt(parts[2] ?? '0', 10),
            time: `${parts[3] ?? '0'}:${parts[4] ?? '00'}`,
         };
      }
   }

   if (!visitorTeam || !homeTeam) {
      throw new Error('Failed to parse visitor or home team data');
   }

   return {
      gameId,
      date,
      startTime,
      endTime,
      venue,
      attendance,
      visitor: visitorTeam,
      home: homeTeam,
      goals,
      penalties,
      officials,
      threeStar,
   };
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
   console.error(
      'Usage: bun run scripts/parse-game-summary.ts <html-file-path>',
   );
   process.exit(1);
}

const filePath = args[0];
if (!filePath) {
   console.error('File path is required');
   process.exit(1);
}

const absolutePath = path.resolve(filePath);

if (!fs.existsSync(absolutePath)) {
   console.error(`File not found: ${absolutePath}`);
   process.exit(1);
}

const htmlContent = fs.readFileSync(absolutePath, 'utf-8');
const gameSummary = parseGameSummary(htmlContent);

console.log(JSON.stringify(gameSummary, null, 2));

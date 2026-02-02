import { parse } from 'node-html-parser';
import type { GamecenterReports } from '#/index.ts';
import { gc } from '#/index.ts';

async function findReportsFromDate() {
   // Get date string for today in YYYY-MM-DD format in PST timezone
   const currentDate = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Los_Angeles',
   });
   const schedule = await gc.game
      .schedule(currentDate)
      .then((res) => (res.success ? res.data : null));
   const gameIds = schedule
      ? schedule.gameWeek[0]?.games.map((game) => game.id)
      : [];
   const gameId =
      gameIds && gameIds.length > 0
         ? gameIds[Math.floor(Math.random() * gameIds.length)]
         : null;
   if (!gameId) {
      console.log('No games found for today.');
      return;
   }
   const reports = await gc.game
      .reports(gameId)
      .then((res) => (res.success ? res.data : null));
   if (!reports) {
      console.log('No reports found for the game.');
      return;
   }
   Bun.write(
      `${import.meta.dir}/reports.json`,
      JSON.stringify(reports, null, 2),
   );
   console.log('Reports data saved to reports.json');
   await downloadReports(reports.gameReports);
   return reports;
}

async function downloadReports(
   gameReports: GamecenterReports['gameReports'],
) {
   if (!gameReports) {
      console.log('No game reports to download.');
      return;
   }

   for (const report of Object.entries(gameReports)) {
      const [reportName, reportURL] = report;
      if (reportURL && reportName !== 'shiftChart') {
         const response = await fetch(reportURL);
         if (response.ok) {
            const data = await response.text();
            const gameIdMatch = reportURL.match(/(\d+)\.HTM$/);
            Bun.write(
               `${import.meta.dir}/report-${reportName}-${gameIdMatch[1]}.htm`,
               data,
            );
            console.log(`Downloaded report: ${reportName}`);
         } else {
            console.log(`Failed to download report: ${reportName}`);
         }
      }
   }
}

findReportsFromDate().catch((error) => {
   console.error('Error gathering reports data:', error);
});

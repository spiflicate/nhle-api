/**
 * ======================================================================
 * NHL Edge Stats API - Endpoint Paths
 * Base URL: https://api.nhle.com/stats/rest
 * ======================================================================
 * Defines the endpoint paths for all categories of data in the NHL Edge
 * Stats API. These paths are used by the various API functions to
 * construct the correct URLs for making requests to the API.
 *
 * Note: These endpoints generally return entire datasets (tabular data)
 * as arrays of objects. The API expects query parameters to be used for
 * filtering and column selection (namely through cayenneExp). Some
 * endpoints will return empty arrays or 'not found' errors when queried
 * without parameters.
 */
export const dataPaths = {
   /** Goalie-related statistics and reports. */
   goalie: {
      /** Goalie leader boards by stat category. */
      leaders: {
         /** Goals-against average leaders. */
         gaa: '{lang}/leaders/goalies/gaa',
         /** Save percentage leaders. */
         savePctg: '{lang}/leaders/goalies/savePctg',
         /** Shutouts leaders. */
         shutouts: '{lang}/leaders/goalies/shutouts',
      },
      /** Goalie statistical reports. */
      report: '{lang}/goalie/{report}',
      /** Goalie career milestones. */
      milestones: '{lang}/milestones/goalies',
   },
   /** Skater/player-related statistics and reports. */
   skater: {
      /** Player directory and information. */
      players: '{lang}/players',
      /** Skater leader boards by stat category. */
      leaders: {
         /** Assists leaders. */
         assists: '{lang}/leaders/skaters/assists',
         /** Goals leaders. */
         goals: '{lang}/leaders/skaters/goals',
         /** Points leaders. */
         points: '{lang}/leaders/skaters/points',
      },
      /** Skater career milestones. */
      milestones: '{lang}/milestones/skaters',
      /** Skater statistical reports. */
      report: '{lang}/skater/{report}',
   },
   /** Team-related statistics and reports. */
   team: {
      /** All teams data. */
      all: '{lang}/team',
      /** Team data by team ID. */
      byId: '{lang}/team/id/{teamId}',
      /** Team statistical reports. */
      report: '{lang}/team/{report}',
   },
   /** Season-related data. */
   season: '{lang}/season',
   /** Game-related data. */
   game: '{lang}/game',
   /** Draft-related data. */
   draft: '{lang}/draft',
   /** Configuration data for skater, goalie, and team reports. */
   config: '{lang}/config',
   /** Country data. */
   countries: '{lang}/country',
   /** Shift chart data. */
   shiftCharts: '{lang}/shiftcharts',
   /** Glossary data. */
   glossary: '{lang}/glossary',
   /** Franchise data. */
   franchises: '{lang}/franchise',
};

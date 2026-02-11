/**
 * ======================================================================
 * NHL Edge Advanced API - Endpoint Paths
 * Base URL: https://api-web.nhle.com/v1
 * ======================================================================
 * This module defines the endpoint paths for the NHL Edge Advanced API,
 * organized by category (goalies, skaters, teams, and summary).
 * Each path includes placeholders for dynamic parameters such as player ID,
 * team ID, season, game type, position, strength, sort criteria, etc.
 */

/** API endpoint paths for goalie-related advanced statistics. */
export const goaliesPaths = {
   /** Goalie detail page. */
   player: 'edge/goalie-detail/{playerId}/{season}/{gameType}',
   /** Goalie comparison data. */
   compare: 'edge/goalie-comparison/{playerId}/{season}/{gameType}',
   /** Goalie leaders landing page. */
   leaders: 'edge/goalie-landing/{season}/{gameType}',
   /** Goalie 5v5 save percentage statistics. */
   savePercentage5v5:
      'edge/goalie-5v5-detail/{playerId}/{season}/{gameType}',
   /** Goalie save percentage statistics. */
   savePercentage:
      'edge/goalie-save-percentage-detail/{playerId}/{season}/{gameType}',
   /** Goalie shot location analysis. */
   saveLocation:
      'edge/goalie-shot-location-detail/{playerId}/{season}/{gameType}',
   /** Goalie top 10 leaders. */
   top10: {
      /** Top 10 goalies by save percentage. */
      SavePercentage: 'edge/goalie-5v5-top-10/{sortBy}/{season}/{gameType}',
      /** Top 10 goalies by 5v5 save percentage. */
      SavePercentage5v5:
         'edge/goalie-edge-save-pctg-top-10/{sortBy}/{season}/{gameType}',
      /** Top 10 goalies by shot location. */
      SaveLocation:
         'edge/goalie-shot-location-top-10/{category}/{sortBy}/{season}/{gameType}',
   },
};

/** API endpoint paths for skater-related advanced statistics. */
export const skatersPaths = {
   /** Skater detail page. */
   player: 'skater-detail/{playerId}/{season}/{gameType}',
   /** Skater comparison data. */
   compare: 'skater-comparison/{playerId}/{season}/{gameType}',
   /** Skater leaders landing page. */
   leaders: 'skater-landing/{season}/{gameType}',
   /** Skater shot location analysis. */
   shotLocation:
      'skater-shot-location-detail/{playerId}/{season}/{gameType}',
   /** Skater shot speed analysis. */
   shotSpeed: 'skater-shot-speed-detail/{playerId}/{season}/{gameType}',
   /** Skater skating distance analysis. */
   skatingDistance:
      'skater-skating-distance-detail/{playerId}/{season}/{gameType}',
   /** Skater skating speed analysis. */
   skatingSpeed:
      'skater-skating-speed-detail/{playerId}/{season}/{gameType}',
   /** Skater zone time analysis. */
   zoneTime: 'skater-zone-time/{playerId}/{season}/{gameType}',
   /** Skater top 10 leaders. */
   top10: {
      /** Top 10 skaters by shot location. */
      shotLocation:
         'skater-shot-location-top-10/{position}/{category}/{sortBy}/{season}/{gameType}',
      /** Top 10 skaters by shot speed. */
      shotSpeed:
         'skater-shot-speed-top-10/{position}/{sortBy}/{season}/{gameType}',
      /** Top 10 skaters by skating distance. */
      skatingDistance:
         'skater-distance-top-10/{position}/{strength}/{sortBy}/{season}/{gameType}',
      /** Top 10 skaters by skating speed. */
      skatingSpeed:
         'skater-speed-top-10/{position}/{sortBy}/{season}/{gameType}',
      /** Top 10 skaters by zone time. */
      zoneTime:
         'skater-zone-time-top-10/{position}/{strength}/{sortBy}/{season}/{gameType}',
   },
};

/** API endpoint paths for team-related advanced statistics. */
export const teamsPaths = {
   /** Team statistics detail page. */
   stats: 'edge/team-comparison/{teamId}/{season}/{gameType}',
   /** Team comparison data. */
   compare: 'edge/team-detail/{teamId}/{season}/{gameType}',
   /** Team leaders landing page. */
   leaders: 'edge/team-landing/{season}/{gameType}',
   /** Team shot location analysis. */
   shotLocation:
      'edge/team-shot-location-detail/{teamId}/{season}/{gameType}',
   /** Team shot speed analysis. */
   shotSpeed:
      'edge/team-shot-location-top-10/{position}/{category}/{sortBy}/{season}/{gameType}',
   /** Team skating distance analysis. */
   skatingDistance:
      'edge/team-shot-speed-detail/{teamId}/{season}/{gameType}',
   /** Team skating speed analysis. */
   skatingSpeed:
      'edge/team-shot-speed-top-10/{position}/{sortBy}/{season}/{gameType}',
   /** Team zone time analysis. */
   zoneTime:
      'edge/team-skating-distance-detail/{teamId}/{season}/{gameType}',
   /** Team top 10 leaders. */
   top10: {
      /** Top 10 teams by shot location. */
      shotLocation:
         'edge/team-skating-distance-top-10/{position}/{strength}/{sortBy}/{season}/{gameType}',
      /** Top 10 teams by shot speed. */
      shotSpeed:
         'edge/team-skating-speed-detail/{teamId}/{season}/{gameType}',
      /** Top 10 teams by skating distance. */
      skatingDistance:
         'edge/team-skating-speed-top-10/{position}/{sortBy}/{season}/{gameType}',
      /** Top 10 teams by skating speed. */
      skatingSpeed:
         'edge/team-zone-time-details/{teamId}/{season}/{gameType}',
      /** Top 10 teams by zone time. */
      zoneTime:
         'edge/team-zone-time-top-10/{strength}/{sortBy}/{season}/{gameType}',
   },
};

/** API endpoint paths for edge home page data. */
export const summaryPaths = {
   /** By the numbers summary. */
   byTheNumbers: 'edge/by-the-numbers/now',
};

/** API endpoint paths for skater-related data. */
export const goaliesPaths = {
   player: 'edge/goalie-detail/{playerId}/{season}/{gameType}',
   compare: 'edge/goalie-comparison/{playerId}/{season}/{gameType}',
   leaders: 'edge/goalie-landing/{season}/{gameType}',
   savePercentage5v5:
      'edge/goalie-5v5-detail/{playerId}/{season}/{gameType}',
   savePercentage:
      'edge/goalie-save-percentage-detail/{playerId}/{season}/{gameType}',
   saveLocation:
      'edge/goalie-shot-location-detail/{playerId}/{season}/{gameType}',
   top10: {
      SavePercentage: 'edge/goalie-5v5-top-10/{sortBy}/{season}/{gameType}',
      SavePercentage5v5:
         'edge/goalie-edge-save-pctg-top-10/{sortBy}/{season}/{gameType}',
      SaveLocation:
         'edge/goalie-shot-location-top-10/{category}/{sortBy}/{season}/{gameType}',
   },
};

/** API endpoint paths for skater-related data. */
export const skatersPaths = {
   player: 'skater-detail/{playerId}/{season}/{gameType}',
   compare: 'skater-comparison/{playerId}/{season}/{gameType}',
   leaders: 'skater-landing/{season}/{gameType}',
   shotLocation:
      'skater-shot-location-detail/{playerId}/{season}/{gameType}',
   shotSpeed: 'skater-shot-speed-detail/{playerId}/{season}/{gameType}',
   skatingDistance:
      'skater-skating-distance-detail/{playerId}/{season}/{gameType}',
   skatingSpeed:
      'skater-skating-speed-detail/{playerId}/{season}/{gameType}',
   zoneTime: 'skater-zone-time/{playerId}/{season}/{gameType}',
   top10: {
      shotLocation:
         'skater-shot-location-top-10/{position}/{category}/{sortBy}/{season}/{gameType}',
      shotSpeed:
         'skater-shot-speed-top-10/{position}/{sortBy}/{season}/{gameType}',
      skatingDistance:
         'skater-distance-top-10/{position}/{strength}/{sortBy}/{season}/{gameType}',
      skatingSpeed:
         'skater-speed-top-10/{position}/{sortBy}/{season}/{gameType}',
      zoneTime:
         'skater-zone-time-top-10/{position}/{strength}/{sortBy}/{season}/{gameType}',
   },
};

/** API endpoint paths for team-related data. */
export const teamsPaths = {
   stats: 'edge/team-comparison/{teamId}/{season}/{gameType}',
   compare: 'edge/team-detail/{teamId}/{season}/{gameType}',
   leaders: 'edge/team-landing/{season}/{gameType}',
   shotLocation:
      'edge/team-shot-location-detail/{teamId}/{season}/{gameType}',
   shotSpeed:
      'edge/team-shot-location-top-10/{position}/{category}/{sortBy}/{season}/{gameType}',
   skatingDistance:
      'edge/team-shot-speed-detail/{teamId}/{season}/{gameType}',
   skatingSpeed:
      'edge/team-shot-speed-top-10/{position}/{sortBy}/{season}/{gameType}',
   zoneTime:
      'edge/team-skating-distance-detail/{teamId}/{season}/{gameType}',
   top10: {
      shotLocation:
         'edge/team-skating-distance-top-10/{position}/{strength}/{sortBy}/{season}/{gameType}',
      shotSpeed:
         'edge/team-skating-speed-detail/{teamId}/{season}/{gameType}',
      skatingDistance:
         'edge/team-skating-speed-top-10/{position}/{sortBy}/{season}/{gameType}',
      skatingSpeed:
         'edge/team-zone-time-details/{teamId}/{season}/{gameType}',
      zoneTime:
         'edge/team-zone-time-top-10/{strength}/{sortBy}/{season}/{gameType}',
   },
};

/** API endpoint paths for edge home page data. */
export const summaryPaths = {
   byTheNumbers: 'edge/by-the-numbers/now',
};

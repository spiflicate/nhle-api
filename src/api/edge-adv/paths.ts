/** API endpoint paths for skater-related data. */
export const goaliesPaths = {
   player: 'edge/goalie-detail/{player-id}/{season}/{game-type}',
   compare: 'edge/goalie-comparison/{player-id}/{season}/{game-type}',
   leaders: 'edge/goalie-landing/{season}/{game-type}',
   savePercentage5v5:
      'edge/goalie-5v5-detail/{player-id}/{season}/{game-type}',
   savePercentage:
      'edge/goalie-save-percentage-detail/{player-id}/{season}/{game-type}',
   saveLocation:
      'edge/goalie-shot-location-detail/{player-id}/{season}/{game-type}',
   top10: {
      SavePercentage:
         'edge/goalie-5v5-top-10/{sort-by}/{season}/{game-type}',
      SavePercentage5v5:
         'edge/goalie-edge-save-pctg-top-10/{sort-by}/{season}/{game-type}',
      SaveLocation:
         'edge/goalie-shot-location-top-10/{category}/{sort-by}/{season}/{game-type}',
   },
};

/** API endpoint paths for skater-related data. */
export const skatersPaths = {
   comparison: 'skater-comparison/{playerId}/{season}/{gameType}',
   detail: 'skater-detail/{playerId}/{season}/{gameType}',
   distanceTop10:
      'skater-distance-top-10/{positions}/{strength}/{sortBy}/{season}/{gameType}',
   landing: 'skater-landing/{season}/{gameType}',
   shotLocation:
      'skater-shot-location-detail/{playerId}/{season}/{gameType}',
   shotLocationTop10:
      'skater-shot-location-top-10/{position}/{category}/{sortBy}/{season}/{gameType}',
   shotSpeed: 'skater-shot-speed-detail/{playerId}/{season}/{gameType}',
   shotSpeedTop10:
      'skater-shot-speed-top-10/{positions}/{sortBy}/{season}/{gameType}',
   skatingDistance:
      'skater-skating-distance-detail/{playerId}/{season}/{gameType}',
   skatingSpeed:
      'skater-skating-speed-detail/{playerId}/{season}/{gameType}',
   speedTop10:
      'skater-speed-top-10/{positions}/{sortBy}/{season}/{gameType}',
   zoneTime: 'skater-zone-time/{playerId}/{season}/{gameType}',
   zoneTimeTop10:
      'skater-zone-time-top-10/{positions}/{strength}/{sortBy}/{season}/{gameType}',
};

/** API endpoint paths for team-related data. */
export const teamsPaths = {
   stats: 'edge/team-comparison/{team-id}/{season}/{game-type}',
   compare: 'edge/team-detail/{team-id}/{season}/{game-type}',
   leaders: 'edge/team-landing/{season}/{game-type}',
   shotLocation:
      'edge/team-shot-location-detail/{team-id}/{season}/{game-type}',
   shotSpeed:
      'edge/team-shot-location-top-10/{position}/{category}/{sort-by}/{season}/{game-type}',
   skatingDistance:
      'edge/team-shot-speed-detail/{team-id}/{season}/{game-type}',
   skatingSpeed:
      'edge/team-shot-speed-top-10/{position}/{sort-by}/{season}/{game-type}',
   zoneTime:
      'edge/team-skating-distance-detail/{team-id}/{season}/{game-type}',
   top10: {
      shotLocation:
         'edge/team-skating-distance-top-10/{position}/{strength}/{sort-by}/{season}/{game-type}',
      shotSpeed:
         'edge/team-skating-speed-detail/{team-id}/{season}/{game-type}',
      skatingDistance:
         'edge/team-skating-speed-top-10/{position}/{sort-by}/{season}/{game-type}',
      skatingSpeed:
         'edge/team-zone-time-details/{team-id}/{season}/{game-type}',
      zoneTime:
         'edge/team-zone-time-top-10/{strength}/{sort-by}/{season}/{game-type}',
   },
};

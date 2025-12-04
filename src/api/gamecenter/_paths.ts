export const _teamPaths = {
   rosterSeasons: 'roster-season/{team}',
   roster: 'roster/{team}/{season}',
   prospects: 'prospects/{team}',
   clubStats: 'club-stats/{team}/{season}/{gameType}',
   clubStatsSeason: 'club-stats-season/{team}',
   standings: 'standings/{date}',
   standingsSeason: 'standings-season',
   clubSchedule: {
      season: 'club-schedule-season/{team}/{season}',
      month: 'club-schedule/{team}/month/{month}',
      week: 'club-schedule/{team}/week/{date}',
   },
};

export const _scorePaths = {
   score: 'score/{date}',
   scoreboard: {
      now: 'scoreboard/now',
      byTeam: 'scoreboard/{team}/now',
      byDate: 'scoreboard/{date}',
   },
};

export const _playerPaths = {
   landing: 'player/{playerId}/landing',
   gameLog: 'player/{playerId}/game-log/{season}/{gameType}',
   spotlight: 'player-spotlight',
   statsLeaders: {
      skaters: 'skater-stats-leaders/{season}/{gameType}',
      goalies: 'goalie-stats-leaders/{season}/{gameType}',
   },
   playerSearch: 'https://search.d3.nhle.com/api/v1/search/player',
};

export const _miscPaths = {
   season: 'season',
   metaPlayoffSeries: 'meta/playoff-series/{year}/{seriesLetter}',
   metaGame: 'meta/game/{gameId}',
   postalLookup: 'postal-lookup/{postalCode}',
   location: 'location',
   partnerGame: 'partner-game/{countryCode}/now',
};

export const _gamePaths = {
   schedule: 'schedule/{date}',
   scheduleCalendar: 'schedule-calendar/{date}',
   playoffBracket: 'playoff-bracket/{year}',
   playoffSeries: 'playoff-series/carousel/{season}',
   playoffSeriesSchedule: 'schedule/playoff-series/{season}/{seriesLetter}',
   gamecenter: {
      playByPlay: 'gamecenter/{gameId}/play-by-play',
      reports: 'gamecenter/{gameId}/right-rail',
      landing: 'gamecenter/{gameId}/landing',
      boxscore: 'gamecenter/{gameId}/boxscore',
   },
   wsc: {
      gameStory: 'wsc/game-story/{gameId}',
      playByPlay: 'wsc/play-by-play/{gameId}',
   },
   pptReplay: {
      goal: 'ppt-replay/goal/{gameId}/{eventId}',
      event: 'ppt-replay/{gameId}/{eventId}',
   },
   whereToWatch: 'where-to-watch',
   networkTVSchedule: 'network/tv-schedule/{date}',
};

export const _draftPaths = {
   draftPicks: {
      byYearAndRound: 'draft/picks/{year}/{round}',
      byYear: 'draft/picks/{year}/all',
   },
   draftRankings: 'draft/rankings/{year}/{type}',
   draftTracker: 'draft-tracker/picks/now',
};

/**
 * ======================================================================
 * NHL GameCenter API - Endpoint Paths
 * Base URL: https://api-web.nhle.com/v1
 * ======================================================================
 * This module defines the endpoint paths for the NHL GameCenter API,
 * organized by category (teams, scores, players, games, drafts, and misc).
 * Each path includes placeholders for dynamic parameters such as team ID,
 * player ID, game ID, date, season, game type, year, series letter, etc.
 */

/** API endpoint paths for team-related data. */
export const teamPaths = {
   /** Team roster seasons. */
   rosterSeasons: 'roster-season/{team}',
   /** Team roster for a specific season. */
   roster: 'roster/{team}/{season}',
   /** Team prospects. */
   prospects: 'prospects/{team}',
   /** Team club statistics for a specific season and game type. */
   clubStats: 'club-stats/{team}/{season}/{gameType}',
   /** Team club statistics summary for a season. */
   clubStatsSeason: 'club-stats-season/{team}',
   /** League standings for a specific date. */
   standings: 'standings/{date}',
   /** League standings summary for a season. */
   standingsSeason: 'standings-season',
   /** Team schedule data. */
   clubSchedule: {
      /** Team schedule for a season. */
      season: 'club-schedule-season/{team}/{season}',
      /** Team schedule for a specific month. */
      month: 'club-schedule/{team}/month/{month}',
      /** Team schedule for a specific week. */
      week: 'club-schedule/{team}/week/{date}',
   },
};

/** API endpoint paths for game score data. */
export const scorePaths = {
   /** Game scores for a specific date. */
   score: 'score/{date}',
   /** Scoreboard data. */
   scoreboard: {
      /** Current scoreboard. */
      now: 'scoreboard/now',
      /** Scoreboard for a specific team. */
      byTeam: 'scoreboard/{team}/now',
      /** Scoreboard for a specific date. */
      byDate: 'scoreboard/{date}',
   },
};

/** API endpoint paths for player-related data. */
export const playerPaths = {
   /** Player landing page data. */
   landing: 'player/{playerId}/landing',
   /** Player game log for a season and game type. */
   gameLog: 'player/{playerId}/game-log/{season}/{gameType}',
   /** Current player spotlight. */
   spotlight: 'player-spotlight',
   /** Player statistics leaders. */
   statsLeaders: {
      /** Skater statistics leaders. */
      skaters: 'skater-stats-leaders/{season}/{gameType}',
      /** Goalie statistics leaders. */
      goalies: 'goalie-stats-leaders/{season}/{gameType}',
   },
   /** Player search functionality. */
   playerSearch: 'https://search.d3.nhle.com/api/v1/search/player',
};

/** API endpoint paths for miscellaneous data. */
export const miscPaths = {
   /** Current season information. */
   season: 'season',
   /** Playoff series metadata for a specific year and series. */
   metaPlayoffSeries: 'meta/playoff-series/{year}/{seriesLetter}',
   /** Game metadata. */
   metaGame: 'meta/game/{gameId}',
   /** Location lookup by postal code. */
   postalLookup: 'postal-lookup/{postalCode}',
   /** Location information. */
   location: 'location',
   /** Partner game for a specific country. */
   partnerGame: 'partner-game/{countryCode}/now',
};

/** API endpoint paths for game-related data. */
export const gamePaths = {
   /** Game schedule for a specific date. */
   schedule: 'schedule/{date}',
   /** Game schedule calendar for a specific date. */
   scheduleCalendar: 'schedule-calendar/{date}',
   /** Playoff bracket for a specific year. */
   playoffBracket: 'playoff-bracket/{year}',
   /** Playoff series carousel for a season. */
   playoffSeries: 'playoff-series/carousel/{season}',
   /** Playoff series schedule. */
   playoffSeriesSchedule: 'schedule/playoff-series/{season}/{seriesLetter}',
   /** Game center data with multiple views. */
   gamecenter: {
      /** Play-by-play data for a game. */
      playByPlay: 'gamecenter/{gameId}/play-by-play',
      /** Right rail reports for a game. */
      reports: 'gamecenter/{gameId}/right-rail',
      /** Game landing page. */
      landing: 'gamecenter/{gameId}/landing',
      /** Game box score. */
      boxscore: 'gamecenter/{gameId}/boxscore',
   },
   /** Web Stat Center (WSC) data. */
   wsc: {
      /** Game story from WSC. */
      gameStory: 'wsc/game-story/{gameId}',
      /** Play-by-play from WSC. */
      playByPlay: 'wsc/play-by-play/{gameId}',
   },
   /** PPT replay data. */
   pptReplay: {
      /** Goal replay. */
      goal: 'ppt-replay/goal/{gameId}/{eventId}',
      /** Event replay. */
      event: 'ppt-replay/{gameId}/{eventId}',
   },
   /** Where to watch information. */
   whereToWatch: 'where-to-watch',
   /** Network TV schedule for a specific date. */
   networkTVSchedule: 'network/tv-schedule/{date}',
};

/** API endpoint paths for draft-related data. */
export const draftPaths = {
   /** Draft picks data. */
   draftPicks: {
      /** Draft picks by year and round. */
      byYearAndRound: 'draft/picks/{year}/{round}',
      /** All draft picks for a year. */
      byYear: 'draft/picks/{year}/all',
   },
   /** Draft rankings for a year and type. */
   draftRankings: 'draft/rankings/{year}/{type}',
   /** Current draft tracker. */
   draftTracker: 'draft-tracker/picks/now',
};

// export * from './types.ts';

// response types for draft module of gamecenter api
export * from './draft-picks.ts';
export * from './draft-rankings.ts';
export * from './draft-tracker.ts';
// export type DraftPicks = Record<string, unknown>;
// export type DraftTracker = Record<string, unknown>;
// export type DraftRankings = Record<string, unknown>;

// response types for game module of gamecenter api
export * from './network-tv-schedule.ts';
export * from './where-to-watch.ts';
// export type WhereToWatch = Record<string, unknown>;
// export type NetworkTVSchedule = Record<string, unknown>;
export type GamecenterPlayByPlay = Record<string, unknown>;
export type GamecenterReports = Record<string, unknown>;
export type GamecenterLanding = Record<string, unknown>;
// export type GamecenterBoxscore = Record<string, unknown>;
export * from './boxscore.ts';
export type WSCGameStory = Record<string, unknown>;
export type WSCPlayByPlay = Record<string, unknown>;
export type PPTReplayGoal = Record<string, unknown>;
export type PPTReplayEvent = Record<string, unknown>;
export type LeagueSchedule = Record<string, unknown>;
export type ScheduleCalendar = Record<string, unknown>;
export type PlayoffBracket = Record<string, unknown>;
export type PlayoffSeries = Record<string, unknown>;
export type PlayoffSeriesSchedule = Record<string, unknown>;

// response types for misc module of gamecenter api
export type NHLSeasons = Record<string, unknown>;
export type PlayoffSeriesMeta = Record<string, unknown>;
export type GameMeta = Record<string, unknown>;
export type PostalCodeInfo = Record<string, unknown>;
export type LocationInfo = Record<string, unknown>;
export type PartnerGameInfo = Record<string, unknown>;

// response types for team module of gamecenter api
// export type NHLStandings = Record<string, unknown>;
// export type NHLStandingsSeason = Record<string, unknown>;
export * from './standings.ts';
export * from './standings-season.ts';
export type TeamRoster = Record<string, unknown>;
export type TeamRosterSeasons = Record<string, unknown>;
// export type TeamProspects = Record<string, unknown>;
export * from './team-prospects.ts';
// export type TeamScheduleSeason = Record<string, unknown>;
// export type TeamScheduleMonth = Record<string, unknown>;
// export type TeamScheduleWeek = Record<string, unknown>;
export * from './team-schedule.ts';
export type TeamStats = Record<string, unknown>;
export type TeamStatsSeason = Record<string, unknown>;

// response types for player module of gamecenter api
export type PlayerLanding = Record<string, unknown>;
export type PlayerGameLog = Record<string, unknown>;
export type PlayerSpotlight = Record<string, unknown>;
export type PlayerSearchResult = Record<string, unknown>;
export type SkaterStatsLeaders = Record<string, unknown>;
export type GoalieStatsLeaders = Record<string, unknown>;

// response types for scoreboard module of gamecenter api
export type NHLScore = Record<string, unknown>;
export type NHLScoreboard = Record<string, unknown>;

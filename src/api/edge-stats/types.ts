/**
 * Response and parameter types for the NHL Stats API
 * (https://api.nhle.com/stats/rest)
 *
 * Every list endpoint answers `{ data: T[], total }`. Report rows (skater,
 * goalie and team reports) vary with the report and with `isAggregate` /
 * `isGame`, so their types list the `summary` fields and keep an index
 * signature for the rest.
 *
 * With `isAggregate=true`, report rows drop per-instance fields (seasonId,
 * teamId, gameId) and team reports add franchise fields; see
 * TeamStatsWithFranchise.
 */

import type { APIResult } from '#/client/types.ts';

/** List response returned by every Stats API list endpoint */
export interface PaginatedData<T> {
   data: T[];
   /** Number of rows matching the query, before `limit` */
   total: number;
}

export type APIResultPaginated<T> = APIResult<PaginatedData<T>>;

/**
 * Skater report names listed by `/config` (`playerReportData`).
 * Any other string is accepted for reports added later.
 */
export type SkaterReport =
   | 'bios'
   | 'faceoffpercentages'
   | 'faceoffwins'
   | 'goalsForAgainst'
   | 'penalties'
   | 'penaltyShots'
   | 'penaltykill'
   | 'percentages'
   | 'powerplay'
   | 'puckPossessions'
   | 'realtime'
   | 'scoringRates'
   | 'scoringpergame'
   | 'shootout'
   | 'shottype'
   | 'summary'
   | 'summaryshooting'
   | 'timeonice'
   | (string & {});

/** Goalie report names listed by `/config` (`goalieReportData`) */
export type GoalieReport =
   | 'advanced'
   | 'bios'
   | 'daysrest'
   | 'penaltyShots'
   | 'savesByStrength'
   | 'shootout'
   | 'startedVsRelieved'
   | 'summary'
   | (string & {});

/** Team report names listed by `/config` (`teamReportData`) */
export type TeamReport =
   | 'daysbetweengames'
   | 'faceoffpercentages'
   | 'faceoffwins'
   | 'goalgames'
   | 'goalsagainstbystrength'
   | 'goalsagainstbystrengthgoaliepull'
   | 'goalsbyperiod'
   | 'goalsforbystrength'
   | 'goalsforbystrengthgoaliepull'
   | 'leadingtrailing'
   | 'outshootoutshotby'
   | 'penalties'
   | 'penaltykill'
   | 'penaltykilltime'
   | 'percentages'
   | 'powerplay'
   | 'powerplaytime'
   | 'realtime'
   | 'savePercentage'
   | 'scoretrailfirst'
   | 'shootout'
   | 'shottype'
   | 'summary'
   | 'summaryshooting'
   | (string & {});

/** A player as listed by `/players` and nested in leader rows */
export interface PlayerInfo {
   id: number;
   currentTeamId: number | null;
   firstName: string;
   fullName: string;
   lastName: string;
   positionCode: string;
   sweaterNumber: number | null;
}

/** A team logo, included with `include=logos` */
export interface TeamLogo {
   id: number;
   background: string;
   endSeason: number;
   secureUrl: string;
   startSeason: number;
   teamId: number;
   url: string;
}

/** A team as listed by `/team` and `/team/id/{id}` */
export interface Team {
   id: number;
   franchiseId: number | null;
   fullName: string;
   leagueId: number;
   rawTricode: string;
   triCode: string;
   /** Present with `include=logos`, and on leader rows */
   logos?: TeamLogo[];
}

/** Row of a skater report (fields of the `summary` report) */
export interface SkaterStats {
   playerId: number;
   skaterFullName?: string;
   lastName?: string;
   seasonId?: number;
   teamAbbrevs?: string;
   positionCode?: string;
   shootsCatches?: string;
   gamesPlayed?: number;
   goals?: number;
   assists?: number;
   points?: number;
   plusMinus?: number;
   pointsPerGame?: number;
   penaltyMinutes?: number;
   evGoals?: number;
   evPoints?: number;
   ppGoals?: number;
   ppPoints?: number;
   shGoals?: number;
   shPoints?: number;
   otGoals?: number;
   gameWinningGoals?: number;
   shots?: number;
   shootingPct?: number | null;
   faceoffWinPct?: number | null;
   timeOnIcePerGame?: number;
   [key: string]: unknown;
}

/** Row of a goalie report (fields of the `summary` report) */
export interface GoalieStats {
   playerId: number;
   goalieFullName?: string;
   lastName?: string;
   seasonId?: number;
   teamAbbrevs?: string;
   shootsCatches?: string;
   gamesPlayed?: number;
   gamesStarted?: number;
   wins?: number;
   losses?: number;
   otLosses?: number | null;
   ties?: number | null;
   shutouts?: number;
   goalsAgainst?: number;
   goalsAgainstAverage?: number;
   saves?: number;
   shotsAgainst?: number;
   savePct?: number | null;
   timeOnIce?: number;
   goals?: number;
   assists?: number;
   points?: number;
   penaltyMinutes?: number;
   [key: string]: unknown;
}

/** Row of a team report (fields of the `summary` report) */
export interface TeamStats {
   teamId?: number;
   teamFullName?: string;
   seasonId?: number;
   gamesPlayed?: number;
   wins?: number;
   losses?: number;
   otLosses?: number | null;
   ties?: number | null;
   points?: number;
   pointPct?: number;
   regulationAndOtWins?: number;
   winsInRegulation?: number;
   winsInShootout?: number;
   goalsFor?: number;
   goalsAgainst?: number;
   goalsForPerGame?: number;
   goalsAgainstPerGame?: number;
   shotsForPerGame?: number;
   shotsAgainstPerGame?: number;
   powerPlayPct?: number | null;
   powerPlayNetPct?: number | null;
   penaltyKillPct?: number | null;
   penaltyKillNetPct?: number | null;
   faceoffWinPct?: number | null;
   teamShutouts?: number;
   [key: string]: unknown;
}

/**
 * Row of a team report requested with `isAggregate=true`: per-team and
 * per-season fields are dropped and franchise fields added.
 */
export interface TeamStatsWithFranchise extends TeamStats {
   franchiseId: number;
   franchiseName: string;
}

/** Skater leader row; the stat field is named after the category */
export interface SkaterLeader {
   player: PlayerInfo;
   team: Team;
   goals?: number;
   assists?: number;
   points?: number;
}

/** Goalie leader row; the stat field is named after the category */
export interface GoalieLeader {
   player: PlayerInfo;
   team: Team;
   gaa?: number | null;
   savePctg?: number | null;
   shutouts?: number;
}

/** Shared fields of a milestone row */
interface Milestone {
   id: number;
   playerId: number;
   firstName: string;
   lastName: string;
   playerFullName: string;
   currentTeamId: number;
   teamAbbrev: string;
   teamCommonName: string;
   teamFullName: string;
   teamPlaceName: string;
   gameTypeId: number;
   gamesPlayed: number;
   /** The stat being approached, e.g. "Goals" or "Shutouts" */
   milestone: string;
   milestoneAmount: number;
}

/** A skater approaching a career milestone */
export interface SkaterMilestone extends Milestone {
   goals: number;
   assists: number;
   points: number;
}

/** A goalie approaching a career milestone */
export interface GoalieMilestone extends Milestone {
   wins: number;
   so: number;
   toiMinutes: number;
}

/** A franchise from `/franchise` */
export interface Franchise {
   id: number;
   fullName: string;
   teamCommonName: string;
   teamPlaceName: string;
}

/** A season from `/season` */
export interface Season {
   /** Season id, e.g. 20242025 */
   id: number;
   formattedSeasonId: string;
   seasonOrdinal: number;
   startDate: string;
   endDate: string;
   preseasonStartdate: string | null;
   regularSeasonEndDate: string;
   numberOfGames: number;
   totalRegularSeasonGames: number;
   totalPlayoffGames: number;
   allStarGameInUse: number;
   conferencesInUse: number;
   divisionsInUse: number;
   entryDraftInUse: number;
   nhlStanleyCupOwner: number;
   olympicsParticipation: number;
   pointForOTLossInUse: number;
   rowInUse: number;
   supplementalDraftInUse: number;
   tiesInUse: number;
   wildcardInUse: number;
   minimumPlayoffMinutesForGoalieStatsLeaders: number;
   minimumRegularGamesForGoalieStatsLeaders: number;
}

/** A game from `/game` */
export interface Game {
   /** Game id, e.g. 2024020001 */
   id: number;
   season: number;
   /** 1 = preseason, 2 = regular season, 3 = playoffs */
   gameType: number;
   gameNumber: number;
   gameDate: string;
   easternStartTime: string;
   gameScheduleStateId: number;
   gameStateId: number;
   period: number | null;
   homeTeamId: number;
   homeScore: number | null;
   visitingTeamId: number;
   visitingScore: number | null;
}

/** A draft year from `/draft` */
export interface Draft {
   id: number;
   draftYear: number;
   rounds: number;
}

/**
 * Report configuration from `/config`: the columns, filters and sort keys
 * of every skater, goalie and team report.
 */
export interface Config {
   playerReportData: Record<string, unknown>;
   goalieReportData: Record<string, unknown>;
   teamReportData: Record<string, unknown>;
   [key: string]: unknown;
}

/** A country from `/country` */
export interface Country {
   /** Three-letter code, same as country3Code */
   id: string;
   country3Code: string;
   countryCode: string;
   countryName: string;
   nationalityName: string;
   iocCode: string | null;
   hasPlayerStats: number;
   isActive: number;
   imageUrl: string | null;
   thumbnailUrl: string | null;
   olympicUrl: string | null;
}

/** One shift (or goal event) from `/shiftcharts` */
export interface ShiftChart {
   id: number;
   gameId: number;
   playerId: number;
   firstName: string;
   lastName: string;
   teamId: number;
   teamAbbrev: string;
   teamName: string;
   hexValue: string;
   period: number;
   shiftNumber: number;
   startTime: string;
   endTime: string;
   duration: string | null;
   /** 517 = shift, 505 = goal */
   typeCode: number;
   detailCode: number;
   eventNumber: number | null;
   eventDescription: string | null;
   eventDetails: string | null;
}

/** A stat definition from `/glossary` */
export interface GlossaryEntry {
   id: number;
   abbreviation: string;
   fullName: string;
   definition: string;
   firstSeasonForStat: number | null;
   languageCode: string;
   lastUpdated: string;
}

/**
 * Query parameters for Stats API list endpoints
 */
export interface StatsQueryParams extends Record<string, unknown> {
   /**
    * Cayenne expression for filtering. Skater and goalie reports fail
    * (HTTP 500) without one, so the report functions send an empty
    * expression when none is given.
    */
   cayenneExp?: string;

   /** Sort field, or a JSON array of `{property, direction}` */
   sort?: string;

   /** Sort direction: 'asc' or 'desc' */
   dir?: 'asc' | 'desc';

   /** Number of results to return; -1 returns all results */
   limit?: number;

   /** Starting index for pagination */
   start?: number;

   /** Include related data, e.g. 'logos' on teams */
   include?: string;

   /** Exclude certain fields */
   exclude?: string;

   /** Cayenne expression applied to the underlying facts (e.g. gamesPlayed>=10) */
   factCayenneExp?: string;

   /** Aggregate rows across seasons and teams */
   isAggregate?: boolean;

   /** Return one row per game */
   isGame?: boolean;
}

/** Convenience filters for the `getStatsWithFilters` functions */
export interface StatsFilters {
   seasonId?: string | number;
   gameTypeId?: number;
   playerId?: number;
   teamId?: number;
   /** Any other field, matched with equality */
   [key: string]: string | number | undefined;
}

/** Sorting for the `getStatsWithFilters` functions */
export interface StatsSorting {
   sortBy?: string;
   direction?: 'asc' | 'desc';
}

/** Pagination for the `getStatsWithFilters` functions */
export interface StatsPagination {
   limit?: number;
   start?: number;
}

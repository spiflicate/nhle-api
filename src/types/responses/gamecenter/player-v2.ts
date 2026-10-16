/**
 * Response types for the v2 player API (api-web.nhle.com/v2/player),
 * which the nhl.com player pages use instead of v1 `player/{id}/landing`.
 *
 * Fields marked optional were missing for some players when these types
 * were written from live responses (active and retired skaters and
 * goalies, rookies, and players without a team).
 */
import type { TeamAbbrev } from '../../types.ts';
import type {
   CountryCode,
   GameScheduleState,
   GameState,
   LocalizedText,
   Market,
   PeriodType,
   PositionCode,
   ShootsCatches,
} from './common.ts';

/** Game result for the player's team. (W = Win, L = Loss, O = Overtime loss, T = Tie) */
export type PlayerGameDecision = 'W' | 'L' | 'O' | 'T';

/** Whether the player's team was at home (H) or on the road (R). */
export type HomeRoadFlag = 'H' | 'R';

/** Light and dark versions of a logo. */
export interface ThemedLogos {
   light: string;
   dark: string;
}

/** A player achievement shown under the name, e.g. Hockey Hall of Fame. */
export interface PlayerBadge {
   logoUrl: LocalizedText;
   title: LocalizedText;
}

/** Period the game ended in. */
export interface PlayerV2PeriodDescriptor {
   number: number;
   periodType: PeriodType;
   maxRegulationPeriods: number;
   /** Only present for some games that went to overtime. */
   otPeriods?: number;
}

// ---------------------------------------------------------------------------
// header
// ---------------------------------------------------------------------------

/** The player's current team, as shown in the player page header. */
export interface PlayerHeaderTeam {
   fullTeamName: LocalizedText;
   commonName: LocalizedText;
   placeNameWithPreposition: LocalizedText;
   abbrev: TeamAbbrev;
   logo: string;
   darkLogo: string;
}

/** `GET /v2/player/{playerId}/header` */
export interface PlayerHeader {
   playerId: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   /** Three-letter country code, e.g. `CAN`. */
   nationality: string;
   /** Two-letter country code, e.g. `CA`. */
   nationalityCountry2Code: string;
   age: number;
   sweaterNumber: number;
   position: PositionCode;
   playerSlug: string;
   headshot: string;
   heightInches: number;
   weightPounds: number;
   /** Missing for players without a current team. */
   isCaptain?: boolean;
   isInactiveNHL: boolean;
   hasEdgeStats: boolean;
   /** False when `home` has nothing to show (e.g. retired players). */
   hasHome: boolean;
   /** 8-digit season id, e.g. `20262027`. */
   mostRecentSeason: number;
   badges?: PlayerBadge[];
   /** Missing for players without a current team. */
   team?: PlayerHeaderTeam;
}

// ---------------------------------------------------------------------------
// home
// ---------------------------------------------------------------------------

/** A team in `home.lastGame` or `home.nextGame`. */
export interface PlayerHomeTeam {
   id: number;
   abbrev: TeamAbbrev;
   name: LocalizedText;
   teamLogo: ThemedLogos;
}

/** A team in `home.lastGame`, with the final score. */
export interface PlayerHomeLastGameTeam extends PlayerHomeTeam {
   score: number;
   sog: number;
}

/** A team in `home.nextGame`, with its record (W-L-OTL). */
export interface PlayerHomeNextGameTeam extends PlayerHomeTeam {
   record: string;
}

/** Brightcove video ids for the game's recap videos. */
export interface PlayerHomeGameVideo {
   threeMinRecap: number;
   threeMinRecapFr: number;
   condensedGame: number;
   condensedGameFr?: number;
}

/** The player's line in their last game. Skaters and goalies get different fields. */
export interface PlayerHomeGameStats {
   // skaters
   goals?: number;
   assists?: number;
   points?: number;
   shotsOnGoal?: number;
   timeOnIce?: string;
   // goalies
   decision?: PlayerGameDecision;
   goalsAgainst?: number;
   savePctg?: number;
   shotsAgainst?: number;
}

/** The player's most recent game. */
export interface PlayerHomeLastGame {
   id: number;
   gameType: number;
   gameState: GameState;
   gameScheduleState: GameScheduleState;
   /** `YYYY-MM-DD` */
   gameDate: string;
   /** Path on nhl.com, e.g. `/gamecenter/edm-vs-van/2026/10/01/2026020015`. */
   gameCenterLink: string;
   /** Path on nhl.com. */
   threeMinRecap: string;
   threeMinRecapFr: string;
   condensedGame: string;
   condensedGameFr?: string;
   gameVideo: PlayerHomeGameVideo;
   winningTeamId: number;
   periodDescriptor: PlayerV2PeriodDescriptor;
   homeTeam: PlayerHomeLastGameTeam;
   awayTeam: PlayerHomeLastGameTeam;
   playerStats: PlayerHomeGameStats;
}

/** A TV broadcast of the player's next game. */
export interface PlayerHomeBroadcast {
   id: number;
   market: Market;
   countryCode: CountryCode;
   network: string;
   sequenceNumber: number;
   parentId?: number;
   languageCode?: string;
   logoUrls?: ThemedLogos;
}

/**
 * The player's record against the next opponent. Skaters and goalies
 * get different fields.
 */
export interface PlayerMatchupStats {
   /** e.g. `careerVsOpponent` */
   context: string;
   gamesPlayed: number;
   // skaters
   goals?: number;
   assists?: number;
   points?: number;
   avgTimeOnIce?: string;
   // goalies
   wins?: number;
   losses?: number;
   overtimeLosses?: number;
   goalsAgainstAvg?: number;
   savePctg?: number;
   shutouts?: number;
}

/** The player's team's next game. */
export interface PlayerHomeNextGame {
   id: number;
   gameType: number;
   gameState: GameState;
   gameScheduleState: GameScheduleState;
   /** `YYYY-MM-DD` */
   gameDate: string;
   /** ISO 8601, e.g. `2026-10-03T23:00:00Z` */
   startTimeUTC: string;
   /** IANA zone, e.g. `America/Edmonton` */
   venueTimezone: string;
   ticketsLink: string;
   ticketsLinkFr: string;
   gameCenterLink: string;
   tvBroadcasts: PlayerHomeBroadcast[];
   isHomeGame: boolean;
   homeTeam: PlayerHomeNextGameTeam;
   awayTeam: PlayerHomeNextGameTeam;
   matchupStats: PlayerMatchupStats;
}

/** A player on the current team's roster. */
export interface PlayerTeammate {
   id: number;
   headshot: string;
   slug: string;
   firstName: LocalizedText;
   lastName: LocalizedText;
   /** Missing for players who have not been given a number yet. */
   sweaterNumber?: number;
   positionCode: PositionCode;
}

/** The current team's roster by position group. */
export interface PlayerTeamRoster {
   forwards: PlayerTeammate[];
   defensemen: PlayerTeammate[];
   goalies: PlayerTeammate[];
}

/** `GET /v2/player/{playerId}/home` */
export interface PlayerHome {
   lastName: LocalizedText;
   /**
    * The fields below are missing for players without a current team.
    * For retired players the response is only `{ lastName }`.
    */
   teamAbbrev?: TeamAbbrev;
   lastGame?: PlayerHomeLastGame;
   nextGame?: PlayerHomeNextGame;
   currentTeam?: {
      teamCommonName: LocalizedText;
      roster: PlayerTeamRoster;
   };
}

// ---------------------------------------------------------------------------
// bio
// ---------------------------------------------------------------------------

/** Birth and physical details. */
export interface PlayerVitals {
   shootsCatches: ShootsCatches;
   birthCity: LocalizedText;
   birthStateProvince?: LocalizedText;
   /** Three-letter country code, e.g. `CAN`. */
   birthCountry: string;
   nationality: string;
   nationalityCountry2Code: string;
   /** `YYYY-MM-DD` */
   birthDate: string;
   /** Missing for retired players. */
   age?: number;
   actionShot: string;
   heightInches: number;
   weightPounds: number;
}

/** How the player entered the NHL draft. */
export interface PlayerV2DraftDetails {
   year: number;
   teamAbbrev: TeamAbbrev;
   round: number;
   pickInRound: number;
   overallPick: number;
   /** The drafting team's logos at the time of the draft. */
   teamLogos: ThemedLogos;
   draftedFromTeam: LocalizedText;
   draftedFromLeagueAbbrev: LocalizedText;
}

/** The team the player won an award with. */
export interface PlayerAwardTeam {
   teamAbbrev: TeamAbbrev;
   teamLogos: ThemedLogos;
   placeName: LocalizedText;
   teamCommonName: LocalizedText;
   fullName: LocalizedText;
}

/** The player's stats in the winning season. Which fields appear depends on the award. */
export interface PlayerAwardStats {
   gamesPlayed: number;
   // skaters
   goals?: number;
   assists?: number;
   points?: number;
   penaltyMinutes?: number;
   // goalies
   wins?: number;
   goalsAgainst?: number;
   goalsAgainstAverage?: number;
   savePctg?: number;
   shutouts?: number;
}

/** One time the player won an award. */
export interface PlayerAwardDetail {
   /** 8-digit season id. Season awards have this... */
   seasonWon?: number;
   /** ...playoff awards (Stanley Cup, Conn Smythe) have the year instead. */
   yearWon?: number;
   team?: PlayerAwardTeam;
   stats?: PlayerAwardStats;
}

/** How nhl.com lays out the award card. */
export type PlayerAwardModuleType =
   | 'STANDARD_STAT_LINE_SKATER'
   | 'STANDARD_STAT_LINE_GOALIE'
   | 'FEATURED_STAT_SKATER'
   | 'FEATURED_STAT_GOALIE'
   | 'STANLEY_CUP_BANNER'
   | 'NARRATIVE'
   | (string & {});

/** An award or trophy the player has won. */
export interface PlayerV2Award {
   name: LocalizedText;
   shortName: LocalizedText;
   /** e.g. `hart-memorial-trophy` */
   slug: string;
   /** The trophy's page on records.nhl.com. */
   grbUrl: string;
   description: LocalizedText;
   trophyLogos?: ThemedLogos;
   moduleType: PlayerAwardModuleType;
   details: PlayerAwardDetail[];
}

/** `GET /v2/player/{playerId}/bio` */
export interface PlayerBio {
   vitals: PlayerVitals;
   /** Missing for undrafted players. */
   draftDetails?: PlayerV2DraftDetails;
   awards?: PlayerV2Award[];
   badges?: PlayerBadge[];
   bio: {
      firstName: LocalizedText;
      lastName: LocalizedText;
      /** Biography in Markdown. */
      about: LocalizedText;
      /** Honors and transactions as a Markdown list. */
      notesTransactions: LocalizedText;
   };
   /** Missing for players without a current team. */
   currentTeam?: {
      teamAbbrev: TeamAbbrev;
      teamCommonName: LocalizedText;
      teamLogos: ThemedLogos;
      roster: PlayerTeamRoster;
   };
}

// ---------------------------------------------------------------------------
// player-stats
// ---------------------------------------------------------------------------

/** A stat value with the player's rank, when the player ranks in it. */
export interface RankedStat<T = number> {
   value: T;
   rank?: number;
   isTied?: boolean;
   rankType?: 'league' | 'team' | (string & {});
   /** nhl.com stats page with the ranking. */
   rankLinks?: LocalizedText;
}

/**
 * A summary stat line. Skaters and goalies get different fields, and
 * retired players can miss some.
 */
export interface PlayerStatline {
   gameTypeId: number;
   gamesPlayed: RankedStat;
   // skaters
   goals?: RankedStat;
   assists?: RankedStat;
   points?: RankedStat;
   pim?: RankedStat;
   /** `value` is `mm:ss` average time on ice. Empty for players before TOI was tracked. */
   toi?: Partial<RankedStat<string>>;
   // goalies
   wins?: RankedStat;
   losses?: RankedStat;
   otLosses?: RankedStat;
   ties?: RankedStat;
   goalsAgainstAvg?: RankedStat;
   savePctg?: RankedStat;
   shutouts?: RankedStat;
}

/** The statline for the current season, which also names the season. */
export interface PlayerCurrentStatline extends PlayerStatline {
   seasonId: number;
}

/** Totals over a career or a season. Skaters and goalies get different fields. */
export interface PlayerStatTotals {
   gamesPlayed: number;
   goals?: number;
   assists?: number;
   pim?: number;
   // skaters
   points?: number;
   plusMinus?: number;
   powerPlayGoals?: number;
   powerPlayPoints?: number;
   shorthandedGoals?: number;
   shorthandedPoints?: number;
   gameWinningGoals?: number;
   otGoals?: number;
   shots?: number;
   shootingPctg?: number;
   faceoffWinningPctg?: number;
   /** `mm:ss` */
   avgToi?: string;
   // goalies
   gamesStarted?: number;
   wins?: number;
   losses?: number;
   otLosses?: number;
   ties?: number;
   shotsAgainst?: number;
   saves?: number;
   goalsAgainst?: number;
   goalsAgainstAvg?: number;
   savePctg?: number;
   shutouts?: number;
   /** Total time on ice, `mmmm:ss` */
   timeOnIce?: string;
}

/**
 * One season with one team. Covers every league the player played in,
 * and leagues outside the NHL often record fewer stats.
 */
export interface PlayerSeasonTotal
   extends Omit<PlayerStatTotals, 'gamesPlayed'> {
   season: number;
   /** Orders rows that share a season. */
   sequence: number;
   gameTypeId: number;
   leagueAbbrev: LocalizedText;
   teamName: LocalizedText;
   teamCommonName?: LocalizedText;
   teamPlaceNameWithPreposition?: LocalizedText;
   gamesPlayed?: number;
}

/** A team in a game summary row: just its id and abbreviation. */
export interface PlayerGameTeamRef {
   id: number;
   abbrev: TeamAbbrev;
}

/** A game in `player-stats.last5`. Skaters and goalies get different fields. */
export interface PlayerLast5Game {
   gameId: number;
   gameTypeId: number;
   seasonId: number;
   /** `YYYY-MM-DD` */
   gameDate: string;
   homeTeam: PlayerGameTeamRef;
   awayTeam: PlayerGameTeamRef;
   homeScore: number;
   awayScore: number;
   gameCenterLink: string;
   homeRoadFlag: HomeRoadFlag;
   periodDescriptor: PlayerV2PeriodDescriptor;
   // skaters
   toi?: string;
   goals?: number;
   assists?: number;
   points?: number;
   plusMinus?: number;
   pim?: number;
   powerPlayGoals?: number;
   shorthandedGoals?: number;
   shots?: number;
   shifts?: number;
   // goalies
   decision?: PlayerGameDecision;
   gamesStarted?: number;
   shotsAgainst?: number;
   saves?: number;
   goalsAgainst?: number;
   savePctg?: number;
}

/** Totals over `last5.games`. Skaters and goalies get different fields. */
export interface PlayerLast5Totals {
   // skaters
   toi?: string;
   goals?: number;
   assists?: number;
   points?: number;
   plusMinus?: number;
   pim?: number;
   powerPlayGoals?: number;
   shorthandedGoals?: number;
   shots?: number;
   shifts?: number;
   // goalies
   /** W-L-OTL */
   record?: string;
   gamesStarted?: number;
   shotsAgainst?: number;
   saves?: number;
   goalsAgainst?: number;
   savePctg?: number;
   shutouts?: number;
}

/** `GET /v2/player/{playerId}/player-stats` */
export interface PlayerStats {
   /** The game type the page shows by default (2 = regular season, 3 = playoffs). */
   currentGameTypeId: number;
   statline: {
      /** e.g. `2015-2027` */
      careerSpan: string;
      isPlayerActive: boolean;
      regularSeason: {
         /** Missing for players not active this season. */
         current?: PlayerCurrentStatline;
         career: PlayerStatline;
      };
      /** Only for players with a playoff statline. */
      playoffs?: {
         career: PlayerStatline;
      };
   };
   /** The player's last five NHL games. Empty for retired players. */
   last5: {
      games: PlayerLast5Game[];
      /** Missing when `games` is empty. */
      totals?: PlayerLast5Totals;
   };
   careerTotals: {
      regularSeason: PlayerStatTotals;
      /** Missing for players with no playoff games. */
      playoffs?: PlayerStatTotals;
   };
   seasonTotals: PlayerSeasonTotal[];
}

// ---------------------------------------------------------------------------
// game-log
// ---------------------------------------------------------------------------

/** A team in a game log row. */
export interface PlayerGameLogTeam extends PlayerGameTeamRef {
   commonName: LocalizedText;
}

/** One game in the v2 game log. Skaters and goalies get different fields. */
export interface PlayerGameLogV2Game {
   id: number;
   gameTypeId: number;
   homeRoadFlag: HomeRoadFlag;
   /** `YYYY-MM-DD` */
   gameDate: string;
   homeTeam: PlayerGameLogTeam;
   awayTeam: PlayerGameLogTeam;
   gameCenterLink: string;
   homeScore: number;
   awayScore: number;
   /** Result for the player's team, for skaters and goalies alike. */
   decision: PlayerGameDecision;
   periodDescriptor: PlayerV2PeriodDescriptor;
   goals: number;
   assists: number;
   pim: number;
   /** `mm:ss`. Missing for older seasons. */
   toi?: string;
   // skaters
   points?: number;
   plusMinus?: number;
   powerPlayGoals?: number;
   powerPlayPoints?: number;
   shorthandedGoals?: number;
   shorthandedPoints?: number;
   gameWinningGoals?: number;
   otGoals?: number;
   shots?: number;
   /** Missing for older seasons. */
   shifts?: number;
   // goalies
   gamesStarted?: number;
   shotsAgainst?: number;
   saves?: number;
   goalsAgainst?: number;
   savePctg?: number;
   shutouts?: number;
}

/** A season the player has games in, with its game types. */
export interface PlayerGameLogSeason {
   season: number;
   gameTypes: number[];
}

/** `GET /v2/player/{playerId}/game-log/{season}/{gameType}` */
export interface PlayerGameLogV2 {
   seasonId: number;
   gameTypeId: number;
   /** Every season and game type with a game log, newest first. */
   playerStatsSeasons: PlayerGameLogSeason[];
   gameLog: PlayerGameLogV2Game[];
}

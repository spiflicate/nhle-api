import type {
   DefendingSide,
   EventTypeDescKey,
   GameState,
   GoalModifier,
   LocalizedText,
   PenaltyTypeCode,
   PeriodType,
   PositionCode,
   PositionCode,
   Reason,
   ShotType,
   Strength,
   TvBroadcast,
   UTCOffset,
   ZoneCode,
} from './common.ts';

type Category = 'points' | 'goals' | 'assists' | 'plusMinus';

export interface WSCGameStory {
   id: number;
   season: number;
   gameType: number;
   limitedScoring: boolean;
   gameDate: string;
   venue: LocalizedText;
   venueLocation: LocalizedText;
   startTimeUTC: string;
   easternUTCOffset: UTCOffset;
   venueUTCOffset: UTCOffset;
   venueTimezone: string;
   tvBroadcasts: TvBroadcast[];
   gameState: GameState;
   gameScheduleState: 'OK';
   awayTeam: Team;
   homeTeam: Team;
   shootoutInUse: boolean;
   maxPeriods: number;
   regPeriods: number;
   otInUse: boolean;
   tiesInUse: boolean;
   preGameMatchup?: PreGameMatchup;
   summary?: Summary;
   periodDescriptor?: PeriodDescriptor;
   clock?: Clock;
}

interface Team {
   id: number;
   name: LocalizedText;
   abbrev: string;
   placeName: LocalizedText;
   logo: string;
   record?: string;
   score?: number;
   sog?: number;
   radioLink?: string;
}

interface Clock {
   timeRemaining: string;
   secondsRemaining: number;
   running: boolean;
   inIntermission: boolean;
}

interface PeriodDescriptor {
   number: number;
   periodType: PeriodType;
   maxRegulationPeriods: number;
}

interface PreGameMatchup {
   skatingLeaders: SkatingLeaders;
   goalieComparison: GoalieComparison;
   teamSeasonStats: TeamSeasonStats;
}

interface GoalieComparison {
   season: number;
   gameTypes: number[];
   awayTeam: Goalie[];
   homeTeam: Goalie[];
}

interface Goalie {
   playerId: number;
   name: LocalizedText;
   firstName: LocalizedText;
   lastName: LocalizedText;
   sweaterNumber: number;
   headshot: string;
   positionCode: PositionCode;
   gamesPlayed?: number;
   seasonPoints?: number;
   record?: string;
   gaa?: number;
   savePctg?: number;
   shutouts?: number;
}

interface SkatingLeaders {
   season: number;
   gameTypes: number[];
   gameLimit: number;
   leaders: Leader[];
}

interface Leader {
   category: Category;
   awayLeader: LeaderDetail;
   homeLeader: LeaderDetail;
}

interface LeaderDetail {
   playerId: number;
   name: LocalizedText;
   firstName: LocalizedText;
   lastName: LocalizedText;
   sweaterNumber: number;
   positionCode: PositionCode;
   headshot: string;
   value: number;
}

interface TeamSeasonStats {
   awayTeam: TeamSeasonStatsDetail;
   homeTeam: TeamSeasonStatsDetail;
}

interface TeamSeasonStatsDetail {
   ppPctg: number;
   pkPctg: number;
   faceoffWinningPctg: number;
   goalsForPerGamePlayed: number;
   goalsAgainstPerGamePlayed: number;
   ppPctgRank: number;
   pkPctgRank: number;
   faceoffWinningPctgRank: number;
   goalsForPerGamePlayedRank: number;
   goalsAgainstPerGamePlayedRank: number;
}

interface Summary {
   scoring: Scoring[];
   shootout: Shootout[];
   threeStars: ThreeStar[];
   teamGameStats: TeamGameStat[];
}

interface Scoring {
   periodDescriptor: PeriodDescriptor;
   goals: Goal[];
}

interface Goal {
   situationCode: string;
   eventId: number;
   strength: Strength;
   playerId: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   name: LocalizedText;
   teamAbbrev: LocalizedText;
   headshot: string;
   highlightClipSharingUrl?: string;
   highlightClip?: number;
   discreteClip?: number;
   goalsToDate: number;
   awayScore: number;
   homeScore: number;
   leadingTeamAbbrev?: LocalizedText;
   timeInPeriod: string;
   shotType: ShotType;
   goalModifier: GoalModifier;
   assists: Assist[];
   homeTeamDefendingSide: DefendingSide;
   isHome: boolean;
   highlightClipSharingUrlFr?: string;
   highlightClipFr?: number;
   discreteClipFr?: number;
}

interface Assist {
   playerId: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   name: LocalizedText;
   assistsToDate: number;
   sweaterNumber: number;
}

interface Shootout {
   sequence: number;
   playerId: number;
   teamAbbrev: LocalizedText;
   firstName: LocalizedText;
   lastName: LocalizedText;
   shotType: ShotType;
   result: 'save' | 'goal';
   headshot: string;
   gameWinner: boolean;
   discreteClip?: number;
   discreteClipFr?: number;
}

interface TeamGameStat {
   category: string;
   awayValue: number | string;
   homeValue: number | string;
}

interface ThreeStar {
   star: number;
   playerId: number;
   teamAbbrev: string;
   headshot: string;
   name: string;
   sweaterNo: number;
   position: PositionCode;
   goals?: number;
   assists?: number;
   points?: number;
   goalsAgainstAverage?: number;
   savePctg?: number;
}

export type WSCPlayByPlay = Array<WSCPlayByPlayEvent>;

export interface WSCPlayByPlayEvent {
   id: number;
   eventId: number;
   period: number;
   timeInPeriod: string;
   secondsRemaining: number;
   situationCode: string;
   typeCode: number;
   typeDescKey: EventTypeDescKey;
   homeTeamDefendingSide: DefendingSide;
   sortOrder: number;
   utc: string;
   eventOwnerTeamId?: number;
   losingPlayerId?: number;
   winningPlayerId?: number;
   xCoord?: number;
   yCoord?: number;
   zoneCode?: ZoneCode;
   playerId?: number;
   reason?: Reason;
   shotType?: ShotType;
   shootingPlayerId?: number;
   goalieInNetId?: number;
   blockingPlayerId?: number;
   awaySOG?: number;
   homeSOG?: number;
   hittingPlayerId?: number;
   hitteePlayerId?: number;
   penaltyTypeCode?: PenaltyTypeCode;
   descKey?: string;
   duration?: number;
   committedByPlayerId?: number;
   drawnByPlayerId?: number;
   goalModifier?: GoalModifier;
   strength?: Strength;
   scoringPlayerId?: number;
   assist1PlayerId?: number;
   awayScore?: number;
   homeScore?: number;
   strengthCode?: number;
   goalCode?: number;
   scoringPlayerTotal?: number;
   assist1PlayerTotal?: number;
   assist2PlayerId?: number;
   assist2PlayerTotal?: number;
   servedByPlayerId?: number;
}

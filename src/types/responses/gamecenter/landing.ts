import type { Default, DefaultWithLangAlternatives } from './common.ts';

export interface GamecenterLanding {
   id: number;
   season: number;
   gameType: number;
   limitedScoring: boolean;
   gameDate: Date;
   venue: Default;
   venueLocation: Default;
   startTimeUTC: Date;
   easternUTCOffset: UTCOffset;
   venueUTCOffset: UTCOffset;
   venueTimezone: string;
   periodDescriptor?: PeriodDescriptor;
   tvBroadcasts: TvBroadcast[];
   gameState: GameState;
   gameScheduleState: 'OK';
   awayTeam: LandingAwayTeam;
   homeTeam: LandingHomeTeam;
   shootoutInUse: boolean;
   maxPeriods: number;
   regPeriods: number;
   otInUse: boolean;
   tiesInUse: boolean;
   summary?: Summary;
   clock?: Clock;
   ticketsLink?: string;
   ticketsLinkFr?: string;
   matchup?: Matchup;
   situation?: Situation;
}

interface LandingAwayTeam {
   id: number;
   commonName: Default;
   abbrev: string;
   placeName: DefaultWithLangAlternatives;
   placeNameWithPreposition: DefaultWithLangAlternatives;
   score?: number;
   sog?: number;
   logo: string;
   darkLogo: string;
   record?: string;
   radioLink?: string;
}

interface Clock {
   timeRemaining: string;
   secondsRemaining: number;
   running: boolean;
   inIntermission: boolean;
}

type UTCOffset = '-05:00' | '-08:00' | '-06:00';

type GameState = 'OFF' | 'FUT' | 'LIVE' | 'PRE';

interface LandingHomeTeam {
   id: number;
   commonName: DefaultWithLangAlternatives;
   abbrev: string;
   placeName: Default;
   placeNameWithPreposition: DefaultWithLangAlternatives;
   score?: number;
   sog?: number;
   logo: string;
   darkLogo: string;
   record?: string;
   radioLink?: string;
}

interface Matchup {
   season: number;
   gameType: number;
   skaterComparison: SkaterComparison;
   goalieComparison: GoalieComparison;
   skaterSeasonStats: SkaterSeasonStats;
   goalieSeasonStats: GoalieSeasonStats;
}

interface GoalieComparison {
   contextLabel: string;
   contextSeason: number;
   homeTeam: {
      teamTotals: TeamTotals;
      leaders: TeamLeader[];
   };
   awayTeam: {
      teamTotals: TeamTotals;
      leaders: TeamLeader[];
   };
}

interface TeamLeader {
   playerId: number;
   name: Default;
   firstName: Default;
   lastName: Default;
   sweaterNumber: number;
   headshot: string;
   positionCode: Position;
   gamesPlayed: number;
   seasonPoints: number;
   record: string;
   gaa: number;
   savePctg: number;
   shutouts: number;
}

type Position = 'G' | 'D' | 'R' | 'C' | 'L';

interface TeamTotals {
   record: string;
   gaa: number;
   savePctg: number;
   shutouts: number;
   gamesPlayed: number;
}

interface GoalieSeasonStats {
   contextLabel: string;
   contextSeason: number;
   goalies: GoalieSeasonStatsGoalie[];
}

interface GoalieSeasonStatsGoalie {
   playerId: number;
   teamId: number;
   sweaterNumber: number;
   name: DefaultWithLangAlternatives;
   gamesPlayed: number;
   wins: number;
   losses: number;
   otLosses: number;
   shotsAgainst: number;
   goalsAgainst: number;
   goalsAgainstAvg: number;
   savePctg: number;
   shutouts: number;
   saves: number;
   toi: string;
}

interface SkaterComparison {
   contextLabel: string;
   contextSeason: number;
   leaders: SkaterComparisonLeader[];
}

interface SkaterComparisonLeader {
   category: Category;
   awayLeader: Leader;
   homeLeader: Leader;
}

interface Leader {
   playerId: number;
   name: Default;
   firstName: Default;
   lastName: Default;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
   value: number;
}

type Category = 'points' | 'goals' | 'assists';

interface SkaterSeasonStats {
   contextLabel: string;
   contextSeason: number;
   skaters: Skater[];
}

interface Skater {
   playerId: number;
   teamId: number;
   sweaterNumber: number;
   name: DefaultWithLangAlternatives;
   position: Position;
   gamesPlayed?: number;
   goals?: number;
   assists?: number;
   points?: number;
   plusMinus?: number;
   pim?: number;
   avgPoints?: number;
   avgTimeOnIce?: string;
   gameWinningGoals?: number;
   shots?: number;
   shootingPctg?: number;
   faceoffWinningPctg?: number;
   powerPlayGoals?: number;
   blockedShots?: number;
   hits?: number;
}

interface PeriodDescriptor {
   number: number;
   periodType: 'REG';
   maxRegulationPeriods: number;
}

interface Situation {
   homeTeam: SituationHomeTeam;
   awayTeam: SituationAwayTeam;
   situationCode: string;
   timeRemaining: string;
   secondsRemaining: number;
}

interface SituationAwayTeam {
   abbrev: string;
   strength: number;
}

interface SituationHomeTeam {
   abbrev: string;
   situationDescriptions?: string[];
   strength: number;
}

interface Summary {
   scoring: Scoring[];
   shootout: any[];
   threeStars: ThreeStar[];
   penalties: SummaryPenalty[];
   iceSurface?: IceSurface;
}

interface IceSurface {
   awayTeam: IceSurfaceAwayTeam;
   homeTeam: IceSurfaceHomeTeam;
}

interface IceSurfaceAwayTeam {
   forwards: Forward[];
   defensemen: Defenseman[];
   goalies: AwayTeamGoalie[];
   penaltyBox: Defenseman[];
}

interface Defenseman {
   playerId: number;
   name: Default;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
   totalSOI?: number;
   secondsRemaining?: number;
}

interface Forward {
   playerId: number;
   name: DefaultWithLangAlternatives;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
   totalSOI?: number;
}

interface AwayTeamGoalie {
   playerId: number;
   name: DefaultWithLangAlternatives;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
   totalSOI: number;
}

interface IceSurfaceHomeTeam {
   forwards: Defenseman[];
   defensemen: Defenseman[];
   goalies: Defenseman[];
   penaltyBox: Defenseman[];
}

interface SummaryPenalty {
   periodDescriptor: PeriodDescriptor;
   penalties: PenaltyPenalty[];
}

interface PenaltyPenalty {
   timeInPeriod: string;
   type: 'MIN';
   duration: number;
   committedByPlayer: CommittedByPlayer;
   teamAbbrev: Default;
   drawnBy?: DrawnBy;
   descKey: string;
}

interface CommittedByPlayer {
   firstName: Default;
   lastName: Default;
   sweaterNumber: number;
}

interface DrawnBy {
   firstName: DefaultWithLangAlternatives;
   lastName: DefaultWithLangAlternatives;
   sweaterNumber: number;
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
   firstName: DefaultWithLangAlternatives;
   lastName: DefaultWithLangAlternatives;
   name: DefaultWithLangAlternatives;
   teamAbbrev: Default;
   headshot: string;
   highlightClipSharingUrl?: string;
   highlightClipSharingUrlFr?: string;
   highlightClip?: number;
   highlightClipFr?: number;
   discreteClip?: number;
   discreteClipFr: number;
   goalsToDate: number;
   awayScore: number;
   homeScore: number;
   leadingTeamAbbrev?: Default;
   timeInPeriod: string;
   shotType: ShotType;
   goalModifier: 'none';
   assists: Assist[];
   pptReplayUrl: string;
   homeTeamDefendingSide: HomeTeamDefendingSide;
   isHome: boolean;
}

interface Assist {
   playerId: number;
   firstName: DefaultWithLangAlternatives;
   lastName: DefaultWithLangAlternatives;
   name: DefaultWithLangAlternatives;
   assistsToDate: number;
   sweaterNumber: number;
}

type HomeTeamDefendingSide = 'left' | 'right';

type ShotType = 'wrist' | 'snap' | 'slap' | 'backhand';

type Strength = 'ev' | 'pp' | 'sh';

interface ThreeStar {
   star: number;
   playerId: number;
   teamAbbrev: TeamAbbrev;
   headshot: string;
   name: Default;
   sweaterNo: number;
   position: Position;
   goals?: number;
   assists?: number;
   points?: number;
   goalsAgainstAverage?: number;
   savePctg?: number;
}

type TeamAbbrev = 'SJS' | 'LAK' | 'PIT';

interface TvBroadcast {
   id: number;
   market: Market;
   countryCode: CountryCode;
   network: string;
   sequenceNumber: number;
}

type CountryCode = 'US' | 'CA';

type Market = 'H' | 'A' | 'N';

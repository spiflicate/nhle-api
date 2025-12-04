import type { TeamAbbrev } from '#/types/types.ts';
import type {
   DefendingSide,
   GameScheduleState,
   GameState,
   GoalModifier,
   LocalizedText,
   PenaltyTypeCode,
   PeriodType,
   PositionCode,
   PositionCode,
   ShotType,
   Strength,
   TvBroadcast,
   UTCOffset,
} from './common.ts';

export interface GamecenterLanding {
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
   periodDescriptor?: PeriodDescriptor;
   tvBroadcasts: TvBroadcast[];
   gameState: GameState;
   gameScheduleState: GameScheduleState;
   awayTeam: LandingTeam;
   homeTeam: LandingTeam;
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

interface LandingTeam {
   id: number;
   commonName: LocalizedText;
   abbrev: TeamAbbrev;
   placeName: LocalizedText;
   placeNameWithPreposition: LocalizedText;
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
   homeTeam: ComparisonTeamDetails;
   awayTeam: ComparisonTeamDetails;
}
interface ComparisonTeamDetails {
   teamTotals: TeamTotals;
   leaders: TeamLeader[];
}

interface TeamLeader {
   playerId: number;
   name: LocalizedText;
   firstName: LocalizedText;
   lastName: LocalizedText;
   sweaterNumber: number;
   headshot: string;
   positionCode: PositionCode;
   gamesPlayed: number;
   seasonPoints: number;
   record: string;
   gaa: number;
   savePctg: number;
   shutouts: number;
}

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
   name: LocalizedText;
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
   name: LocalizedText;
   firstName: LocalizedText;
   lastName: LocalizedText;
   sweaterNumber: number;
   positionCode: PositionCode;
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
   name: LocalizedText;
   position: Exclude<PositionCode, 'G'>;
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
   periodType: PeriodType;
   maxRegulationPeriods: number;
}

interface Situation {
   homeTeam: SituationTeam;
   awayTeam: SituationTeam;
   situationCode: string;
   timeRemaining: string;
   secondsRemaining: number;
}

interface SituationTeam {
   abbrev: string;
   situationDescriptions?: string[];
   strength: number;
}

interface Summary {
   scoring: Scoring[];
   shootout: unknown[];
   threeStars: ThreeStar[];
   penalties: SummaryPenalty[];
   iceSurface?: IceSurface;
}

interface IceSurface {
   awayTeam: IceSurfaceTeam;
   homeTeam: IceSurfaceTeam;
}

interface IceSurfaceTeam {
   forwards: IceSurfaceForward[];
   defensemen: IceSurfaceDefense[];
   goalies: IceSurfaceGoalie[];
   penaltyBox: IceSurfacePlayer[];
}

interface IceSurfacePlayer {
   playerId: number;
   name: LocalizedText;
   sweaterNumber: number;
   positionCode: PositionCode;
   headshot: string;
   totalSOI?: number;
   secondsRemaining?: number;
}

interface IceSurfaceForward extends IceSurfacePlayer {
   positionCode: Exclude<PositionCode, 'D'>;
}

interface IceSurfaceDefense extends IceSurfacePlayer {
   positionCode: 'D';
}

interface IceSurfaceGoalie extends IceSurfacePlayer {
   positionCode: 'G';
}

interface SummaryPenalty {
   periodDescriptor: PeriodDescriptor;
   penalties: Penalty[];
}

interface Penalty {
   timeInPeriod: string;
   type: PenaltyTypeCode;
   duration: number;
   committedByPlayer: PenaltyPlayer;
   teamAbbrev: LocalizedText;
   drawnBy?: PenaltyPlayer;
   descKey: string;
}

interface PenaltyPlayer {
   firstName: LocalizedText;
   lastName: LocalizedText;
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
   firstName: LocalizedText;
   lastName: LocalizedText;
   name: LocalizedText;
   teamAbbrev: LocalizedText;
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
   leadingTeamAbbrev?: LocalizedText;
   timeInPeriod: string;
   shotType: ShotType;
   goalModifier: GoalModifier;
   assists: AssistedBy[];
   pptReplayUrl: string;
   homeTeamDefendingSide: DefendingSide;
   isHome: boolean;
}

interface AssistedBy {
   playerId: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   name: LocalizedText;
   assistsToDate: number;
   sweaterNumber: number;
}

interface ThreeStar {
   star: 1 | 2 | 3;
   playerId: number;
   teamAbbrev: TeamAbbrev;
   headshot: string;
   name: LocalizedText;
   sweaterNo: number;
   position: PositionCode;
   goals?: number;
   assists?: number;
   points?: number;
   goalsAgainstAverage?: number;
   savePctg?: number;
}

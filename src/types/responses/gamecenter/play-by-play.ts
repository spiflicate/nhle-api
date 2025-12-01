import type { TeamAbbrev } from '#/types/types.ts';
import type {
   Default,
   GameScheduleState,
   GameState,
   PenaltyTypeCode,
   PeriodType,
   TvBroadcast,
   UTCOffset,
   ZoneCode,
} from './common.ts';

export interface GamecenterPlayByPlay {
   id: number;
   season: number;
   gameType: number;
   limitedScoring: boolean;
   gameDate: string;
   venue: Default;
   venueLocation: Default;
   startTimeUTC: string;
   easternUTCOffset: UTCOffset;
   venueUTCOffset: UTCOffset;
   tvBroadcasts: TvBroadcast[];
   gameState: GameState;
   gameScheduleState: GameScheduleState;
   periodDescriptor?: PeriodDescriptor;
   awayTeam: Team;
   homeTeam: Team;
   shootoutInUse: boolean;
   otInUse: boolean;
   clock: Clock;
   displayPeriod: number;
   maxPeriods: number;
   gameOutcome?: GameOutcome;
   plays: Play[];
   rosterSpots: RosterSpot[];
   regPeriods: number;
   summary?: Summary;
   situation?: Situation;
}

export interface Team {
   id: number;
   commonName: Default;
   abbrev: TeamAbbrev;
   score: number;
   sog?: number;
   logo: string;
   darkLogo: string;
   placeName: Default;
   placeNameWithPreposition: Default;
   radioLink?: string;
}

export interface Clock {
   timeRemaining: string;
   secondsRemaining: number;
   running: boolean;
   inIntermission: boolean;
}

export interface GameOutcome {
   lastPeriodType: PeriodType;
   otPeriods?: number;
}

export interface GamecenterPlayByPlayHomeTeam {
   id: number;
   commonName: Default;
   abbrev: TeamAbbrev;
   score: number;
   sog?: number;
   logo: string;
   darkLogo: string;
   placeName: Default;
   placeNameWithPreposition: Default;
   radioLink?: string;
}

export interface PeriodDescriptor {
   number: number;
   periodType: PeriodType;
   maxRegulationPeriods: number;
}

export interface Play {
   eventId: number;
   periodDescriptor: PeriodDescriptor;
   timeInPeriod: string;
   timeRemaining: string;
   situationCode: string;
   homeTeamDefendingSide: HomeTeamDefendingSide;
   typeCode: number;
   typeDescKey: TypeDescKey;
   sortOrder: number;
   details?: Details;
   pptReplayUrl?: string;
}

export interface Details {
   eventOwnerTeamId?: number;
   losingPlayerId?: number;
   winningPlayerId?: number;
   xCoord?: number;
   yCoord?: number;
   zoneCode?: ZoneCode;
   blockingPlayerId?: number;
   shootingPlayerId?: number;
   reason?: Reason;
   shotType?: ShotType;
   scoringPlayerId?: number;
   scoringPlayerTotal?: number;
   assist1PlayerId?: number;
   assist1PlayerTotal?: number;
   assist2PlayerId?: number;
   assist2PlayerTotal?: number;
   goalieInNetId?: number;
   awayScore?: number;
   homeScore?: number;
   highlightClipSharingUrl?: string;
   highlightClipSharingUrlFr?: string;
   highlightClip?: number;
   highlightClipFr?: number;
   discreteClip?: number;
   discreteClipFr?: number;
   hittingPlayerId?: number;
   hitteePlayerId?: number;
   playerId?: number;
   awaySOG?: number;
   homeSOG?: number;
   secondaryReason?: Reason;
   typeCode?: PenaltyTypeCode;
   descKey?: PenaltyDescKey;
   duration?: number;
   committedByPlayerId?: number;
   drawnByPlayerId?: number;
   servedByPlayerId?: number;
}

export type PenaltyDescKey =
   | 'tripping'
   | 'hooking'
   | 'interference'
   | 'high-sticking'
   | 'roughing'
   | 'unsportsmanlike-conduct'
   | 'slashing'
   | 'delaying-game-puck-over-glass'
   | 'holding'
   | 'holding-the-stick'
   | 'too-many-men-on-the-ice'
   | 'fighting'
   | 'minor'
   | 'cross-checking';

export type Reason =
   | 'blocked'
   | 'failed-bank-attempt'
   | 'wide-right'
   | 'goalie-stopped-after-sog'
   | 'offside'
   | 'teammate-blocked'
   | 'icing'
   | 'puck-in-netting'
   | 'wide-left'
   | 'high-and-wide-left'
   | 'puck-frozen'
   | 'above-crossbar'
   | 'tv-timeout'
   | 'hand-pass'
   | 'skater-puck-frozen'
   | 'high-stick'
   | 'high-and-wide-right'
   | 'hit-crossbar'
   | 'puck-in-benches'
   | 'hit-right-post'
   | 'short'
   | 'referee-or-linesman'
   | 'puck-in-crowd'
   | 'hit-left-post'
   | 'player-equipment'
   | 'net-dislodged-defensive-skater'
   | 'home-timeout'
   | 'chlg-hm-goal-interference'
   | 'video-review'
   | 'chlg-league-missed-stoppage'
   | 'visitor-timeout'
   | 'official-injury';

export type ShotType =
   | 'wrist'
   | 'tip-in'
   | 'slap'
   | 'snap'
   | 'deflected'
   | 'backhand'
   | 'poke'
   | 'bat'
   | 'between-legs'
   | 'wrap-around';

export type HomeTeamDefendingSide = 'left' | 'right';

export type TypeDescKey =
   | 'period-start'
   | 'faceoff'
   | 'blocked-shot'
   | 'goal'
   | 'hit'
   | 'giveaway'
   | 'missed-shot'
   | 'shot-on-goal'
   | 'stoppage'
   | 'takeaway'
   | 'penalty'
   | 'period-end'
   | 'delayed-penalty'
   | 'game-end';

export interface RosterSpot {
   teamId: number;
   playerId: number;
   firstName: Default;
   lastName: Default;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
}

export interface Situation {
   homeTeam: Team;
   awayTeam: Team;
   situationCode: string;
   timeRemaining: string;
   secondsRemaining: number;
}

export interface Team {
   abbrev: TeamAbbrev;
   strength: number;
   situationDescriptions?: string[];
}

export interface Summary {
   iceSurface?: IceSurface;
}

export interface IceSurface {
   awayTeam: IceSurfaceAwayTeam;
   homeTeam: IceSurfaceHomeTeam;
}

export interface IceSurfaceAwayTeam {
   forwards: GoalieElement[];
   defensemen: PenaltyBoxElement[];
   goalies: GoalieElement[];
   penaltyBox: PenaltyBoxElement[];
}

export interface PenaltyBoxElement {
   playerId: number;
   name: Default;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
   totalSOI?: number;
   secondsRemaining?: number;
}

export interface GoalieElement {
   playerId: number;
   name: Default;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
   totalSOI?: number;
}

export interface IceSurfaceHomeTeam {
   forwards: PurpleForward[];
   defensemen: PurpleDefenseman[];
   goalies: GoalieElement[];
   penaltyBox: PenaltyBoxElement[];
}

export interface PurpleDefenseman {
   playerId: number;
   name: Default;
   sweaterNumber: number;
   positionCode: ZoneCode;
   headshot: string;
   totalSOI?: number;
}

export interface PurpleForward {
   playerId: number;
   name: Default;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
   totalSOI?: number;
}

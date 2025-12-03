import type { TeamAbbrev } from '../../types.ts';
import type {
   DefendingSide,
   EventTypeDescKey,
   GameScheduleState,
   GameState,
   LocalizedText,
   PenaltyDescKey,
   PenaltyTypeCode,
   PeriodType,
   Reason,
   ShotType,
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
   venue: LocalizedText;
   venueLocation: LocalizedText;
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
   plays: Event[];
   rosterSpots: RosterSpot[];
   regPeriods: number;
   summary?: Summary;
   situation?: Situation;
}

interface Team {
   id: number;
   commonName: LocalizedText;
   abbrev: TeamAbbrev;
   score: number;
   sog?: number;
   logo: string;
   darkLogo: string;
   placeName: LocalizedText;
   placeNameWithPreposition: LocalizedText;
   radioLink?: string;
}

interface Clock {
   timeRemaining: string;
   secondsRemaining: number;
   running: boolean;
   inIntermission: boolean;
}

interface GameOutcome {
   lastPeriodType: PeriodType;
   otPeriods?: number;
}

interface PeriodDescriptor {
   number: number;
   periodType: PeriodType;
   maxRegulationPeriods: number;
}

interface Event {
   eventId: number;
   periodDescriptor: PeriodDescriptor;
   timeInPeriod: string;
   timeRemaining: string;
   situationCode: string;
   homeTeamDefendingSide: DefendingSide;
   typeCode: number;
   typeDescKey: EventTypeDescKey;
   sortOrder: number;
   details?: Details;
   pptReplayUrl?: string;
}

interface Details {
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

interface RosterSpot {
   teamId: number;
   playerId: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
}

interface Situation {
   homeTeam: Team;
   awayTeam: Team;
   situationCode: string;
   timeRemaining: string;
   secondsRemaining: number;
}

interface Team {
   abbrev: TeamAbbrev;
   strength: number;
   situationDescriptions?: string[];
}

interface Summary {
   iceSurface?: IceSurface;
}

interface IceSurface {
   awayTeam: IceSurfaceAwayTeam;
   homeTeam: IceSurfaceHomeTeam;
}

interface IceSurfaceAwayTeam {
   forwards: GoalieElement[];
   defensemen: PenaltyBoxElement[];
   goalies: GoalieElement[];
   penaltyBox: PenaltyBoxElement[];
}

interface PenaltyBoxElement {
   playerId: number;
   name: LocalizedText;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
   totalSOI?: number;
   secondsRemaining?: number;
}

interface GoalieElement {
   playerId: number;
   name: LocalizedText;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
   totalSOI?: number;
}

interface IceSurfaceHomeTeam {
   forwards: PurpleForward[];
   defensemen: PurpleDefenseman[];
   goalies: GoalieElement[];
   penaltyBox: PenaltyBoxElement[];
}

interface PurpleDefenseman {
   playerId: number;
   name: LocalizedText;
   sweaterNumber: number;
   positionCode: ZoneCode;
   headshot: string;
   totalSOI?: number;
}

interface PurpleForward {
   playerId: number;
   name: LocalizedText;
   sweaterNumber: number;
   positionCode: Position;
   headshot: string;
   totalSOI?: number;
}

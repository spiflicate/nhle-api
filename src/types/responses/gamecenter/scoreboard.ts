import type { TeamAbbrev } from '../../types.ts';
import type {
   GameScheduleState,
   GameState,
   LocalizedText,
   PeriodType,
   TvBroadcast,
   UTCOffset,
} from './common.ts';

export interface Scoreboard {
   focusedDate: string;
   focusedDateCount: number;
   gamesByDate: GamesByDate[];
}

interface GamesByDate {
   date: string;
   games: Game[];
}

interface Game {
   id: number;
   season: number;
   gameType: number;
   gameDate: string;
   gameCenterLink: string;
   venue: LocalizedText;
   startTimeUTC: string;
   easternUTCOffset: UTCOffset;
   venueUTCOffset: UTCOffset;
   tvBroadcasts: TvBroadcast[];
   gameState: GameState;
   gameScheduleState: GameScheduleState;
   awayTeam: Team;
   homeTeam: Team;
   ticketsLink: string;
   ticketsLinkFr: string;
   period?: number;
   periodDescriptor?: PeriodDescriptor;
   clock?: Clock;
   situation?: Situation;
   threeMinRecap?: string;
   threeMinRecapFr?: string;
}

interface Team {
   id: number;
   name: LocalizedText;
   commonName: LocalizedText;
   placeNameWithPreposition: LocalizedText;
   abbrev: TeamAbbrev;
   score?: number;
   sog?: number;
   logo: string;
   record?: string;
}

interface PeriodDescriptor {
   number: number;
   periodType: PeriodType;
   maxRegulationPeriods: number;
}

interface Clock {
   timeRemaining: string;
   secondsRemaining: number;
   running: boolean;
   inIntermission: boolean;
}

interface Situation {
   homeTeam: SituationDetails;
   awayTeam: SituationDetails;
   situationCode: string;
   timeRemaining: string;
   secondsRemaining: number;
}

interface SituationDetails {
   abbrev: string;
   situationDescriptions?: string[];
   strength: number;
}

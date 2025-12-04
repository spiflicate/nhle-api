import type { TeamAbbrev } from '../../types.ts';
import type {
   DayAbbrev,
   GameScheduleState,
   GameState,
   HexColorCode,
   LocalizedText,
   PeriodType,
   TvBroadcast,
   UTCOffset,
} from './common.ts';

export interface LeagueSchedule {
   nextStartDate: string;
   previousStartDate: string;
   gameWeek: GameWeek[];
   oddsPartners: OddsPartner[];
   preSeasonStartDate: string;
   regularSeasonStartDate: string;
   regularSeasonEndDate: string;
   playoffEndDate: string;
   numberOfGames: number;
}

interface GameWeek {
   date: string;
   dayAbbrev: DayAbbrev;
   numberOfGames: number;
   datePromo: unknown[];
   games: Game[];
}

interface Game {
   id: number;
   season: number;
   gameType: number;
   venue: LocalizedText;
   neutralSite: boolean;
   startTimeUTC: string;
   easternUTCOffset: UTCOffset;
   venueUTCOffset: UTCOffset;
   venueTimezone: string;
   gameState: GameState;
   gameScheduleState: GameScheduleState;
   tvBroadcasts: TvBroadcast[];
   awayTeam: Team;
   homeTeam: Team;
   periodDescriptor: PeriodDescriptor;
   ticketsLink?: string;
   ticketsLinkFr?: string;
   gameCenterLink: string;
   gameOutcome?: GameOutcome;
   winningGoalie?: WinningGoalie;
   winningGoalScorer?: WinningGoalScorer;
   threeMinRecap?: string;
   threeMinRecapFr?: string;
   condensedGame?: string;
   condensedGameFr?: string;
}

interface Team {
   id: number;
   commonName: LocalizedText;
   placeName: LocalizedText;
   placeNameWithPreposition: LocalizedText;
   abbrev: TeamAbbrev;
   logo: string;
   darkLogo: string;
   awaySplitSquad: boolean;
   radioLink?: string;
   odds?: Odd[];
   score?: number;
}

interface Odd {
   providerId: number;
   value: string;
}

interface GameOutcome {
   lastPeriodType: PeriodType;
}

interface PeriodDescriptor {
   number: number;
   periodType: PeriodType;
   maxRegulationPeriods: number;
}

interface WinningGoalScorer {
   playerId: number;
   firstInitial: LocalizedText;
   lastName: LocalizedText;
}

interface WinningGoalie {
   playerId: number;
   firstInitial: LocalizedText;
   lastName: LocalizedText;
}

interface OddsPartner {
   partnerId: number;
   country: string;
   name: string;
   imageUrl: string;
   siteUrl: string;
   bgColor: HexColorCode;
   textColor: HexColorCode;
   accentColor: HexColorCode;
}

export interface ScheduleCalendar {
   endDate: string;
   nextStartDate: string;
   previousStartDate: string;
   startDate: string;
   teams: CalendarTeam[];
}

interface CalendarTeam {
   id: number;
   seasonId: number;
   commonName: LocalizedText;
   abbrev: string;
   name: LocalizedText;
   placeNameWithPreposition: LocalizedText;
   placeName: LocalizedText;
   logo: string;
   darkLogo: string;
   french: boolean;
}

import type { SeriesLetter, TeamAbbrev } from '#/types/types.ts';
import type {
   CountryCode,
   Default,
   DefaultWithTranslations,
   GameScheduleState,
   GameState,
   Market,
   PeriodType,
} from './common.ts';

export interface TeamScheduleSeason {
   previousSeason?: number;
   currentSeason?: number;
   clubTimezone: string;
   clubUTCOffset: string;
   games: Game[];
}

export interface TeamScheduleMonth {
   currentMonth: string;
   nextMonth?: string;
   calendarUrl?: string;
   clubTimezone: string;
   clubUTCOffset: string;
   games: Game[];
   previousMonth?: string;
}

export interface TeamScheduleWeek {
   nextStartDate?: string;
   calendarUrl?: string;
   clubTimezone: string;
   clubUTCOffset: string;
   games: Game[];
   previousStartDate?: string;
}

interface Game {
   id: number;
   season: number;
   gameType: number;
   gameDate: string;
   venue: DefaultWithTranslations;
   neutralSite: boolean;
   startTimeUTC: string;
   easternUTCOffset: string;
   venueUTCOffset: string;
   venueTimezone: string;
   gameState: GameState;
   gameScheduleState: GameScheduleState;
   tvBroadcasts: TvBroadcast[];
   awayTeam: Team;
   homeTeam: Team;
   periodDescriptor: PeriodDescriptor;
   gameOutcome?: GameOutcome;
   winningGoalie?: WinningGoal;
   gameCenterLink?: string;
   seriesStatus?: SeriesStatus;
   seriesUrl?: string;
   winningGoalScorer?: WinningGoal;
   specialEvent?: SpecialEvent;
   threeMinRecap?: string;
   condensedGame?: string;
   threeMinRecapFr?: string;
   condensedGameFr?: string;
   ticketsLink?: string;
   ticketsLinkFr?: string;
   alternateBroadcasts?: AlternateBroadcast[];
}

interface Team {
   id: number;
   commonName: DefaultWithTranslations;
   placeName: DefaultWithTranslations;
   placeNameWithPreposition: DefaultWithTranslations;
   abbrev: TeamAbbrev;
   logo?: string;
   darkLogo?: string;
   homeSplitSquad?: boolean;
   awaySplitSquad?: boolean;
   score?: number;
   radioLink?: string;
   airlineLink?: string;
   airlineDesc?: string;
   hotelLink?: string;
   hotelDesc?: string;
   promoLink?: string;
   promoDesc?: string;
}

interface GameOutcome {
   lastPeriodType: PeriodType;
}

interface PeriodDescriptor {
   number?: number;
   periodType: PeriodType;
   maxRegulationPeriods: number;
   otPeriods?: number;
}

interface SpecialEvent {
   parentId: number;
   name: DefaultWithTranslations;
   lightLogoUrl?: DefaultWithTranslations;
}

interface SeriesStatus {
   round: number;
   seriesAbbrev: string;
   seriesTitle: string;
   seriesLetter: SeriesLetter;
   neededToWin: number;
   topSeedWins: number;
   bottomSeedWins: number;
   gameNumberOfSeries: number;
}
interface TvBroadcast {
   id: number;
   market: Market;
   countryCode: CountryCode;
   network: string;
   sequenceNumber: number;
}

interface WinningGoal {
   playerId: number;
   firstInitial: Default;
   lastName: DefaultWithTranslations;
}

interface AlternateBroadcast {
   country: CountryCode;
   descriptions: Default[];
}

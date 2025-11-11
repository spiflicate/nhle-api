import type {
   CountryCode,
   Default,
   DefaultWithTranslations,
   Market,
} from './common.ts';

export interface TeamScheduleSeason {
   previousSeason?: number;
   currentSeason?: number;
   clubTimezone: string;
   clubUTCOffset: string;
   games: Game[];
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
   winningGoalScorer?: WinningGoal;
   threeMinRecap?: string;
   threeMinRecapFr?: string;
   condensedGame?: string;
   condensedGameFr?: string;
   gameCenterLink?: string;
   ticketsLink?: string;
   ticketsLinkFr?: string;
   specialEvent?: SpecialEvent;
}

interface Team {
   id: number;
   commonName: DefaultWithTranslations;
   placeName: DefaultWithTranslations;
   placeNameWithPreposition: DefaultWithTranslations;
   abbrev: Abbrev;
   logo: string;
   darkLogo: string;
   awaySplitSquad?: boolean;
   score?: number;
   airlineLink?: string;
   airlineDesc?: string;
   hotelLink?: string;
   hotelDesc?: string;
   radioLink?: string;
   promoLink?: string;
   promoDesc?: string;
   homeSplitSquad?: boolean;
}

type Abbrev =
   | 'ANA'
   | 'BOS'
   | 'BUF'
   | 'CAR'
   | 'CBJ'
   | 'CGY'
   | 'CHI'
   | 'COL'
   | 'DAL'
   | 'DET'
   | 'EDM'
   | 'FLA'
   | 'LAK'
   | 'MIN'
   | 'MTL'
   | 'NJD'
   | 'NSH'
   | 'NYI'
   | 'NYR'
   | 'OTT'
   | 'PHI'
   | 'PIT'
   | 'SEA'
   | 'SJS'
   | 'STL'
   | 'TBL'
   | 'TOR'
   | 'UTA'
   | 'VAN'
   | 'VGK'
   | 'WPG'
   | 'WSH';

interface GameOutcome {
   lastPeriodType: PeriodType;
}

type PeriodType = 'REG' | 'OT' | 'SO';

type GameScheduleState = 'OK' | 'TBD';

type GameState = 'FINAL' | 'OFF' | 'FUT' | 'LIVE';

interface PeriodDescriptor {
   periodType: PeriodType;
   maxRegulationPeriods: number;
}

interface SpecialEvent {
   parentId: number;
   name: DefaultWithTranslations;
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

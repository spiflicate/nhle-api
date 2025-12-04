import type { TeamAbbrev } from '../../types.ts';
import type {
   GameScheduleState,
   GameState,
   HexColorCode,
   LocalizedText,
   PositionCode,
   TvBroadcast,
   UTCOffset,
} from './common.ts';

export interface Score {
   prevDate: string;
   currentDate: string;
   nextDate: string;
   gameWeek: GameWeek[];
   oddsPartners: OddsPartner[];
   games: Game[];
}

interface GameWeek {
   date: string;
   dayAbbrev: string;
   numberOfGames: number;
}

interface Game {
   id: number;
   season: number;
   gameType: number;
   gameDate: string;
   venue: LocalizedText;
   startTimeUTC: string;
   easternUTCOffset: UTCOffset;
   venueUTCOffset: UTCOffset;
   tvBroadcasts: TvBroadcast[];
   gameState: GameState;
   gameScheduleState: GameScheduleState;
   awayTeam: Team;
   homeTeam: Team;
   gameCenterLink: string;
   neutralSite: boolean;
   venueTimezone: string;
   ticketsLink: string;
   ticketsLinkFr: string;
   teamLeaders: TeamLeader[];
}

interface Team {
   id: number;
   name: LocalizedText;
   abbrev: TeamAbbrev;
   record: string;
   logo: string;
   odds: Odd[];
}

interface Odd {
   providerId: number;
   value: string;
}

interface TeamLeader {
   id: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   headshot: string;
   teamAbbrev: TeamAbbrev;
   sweaterNumber: number;
   position: PositionCode;
   category: LeaderCategory;
   value: number;
}

type LeaderCategory = 'goals' | 'assists' | 'wins';

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

import type { Default } from './common.ts';

export interface PartnerGameInfo {
   currentOddsDate: string;
   lastUpdatedUTC: string;
   bettingPartner?: BettingPartner;
   games: Game[];
}

interface BettingPartner {
   partnerId: number;
   country: string;
   name: string;
   imageUrl: string;
   siteUrl: string;
   bgColor: string;
   textColor: string;
   accentColor: string;
}

interface Game {
   gameId: number;
   gameType: number;
   startTimeUTC: string;
   homeTeam: Team;
   awayTeam: Team;
}

interface Team {
   id: number;
   name: Default;
   abbrev: string;
   logo: string;
   odds: Odd[];
}

interface Odd {
   description: Description;
   value: number;
   qualifier: string;
}

type Description =
   | 'MONEY_LINE_2_WAY'
   | 'OVER_UNDER'
   | 'PUCK_LINE'
   | 'MONEY_LINE_3_WAY';

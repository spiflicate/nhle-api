import type { GameState, TeamId } from '../types.ts';

/** NHL GameCenter Scoreboard API response */
export interface NHLScoreboard {
   focusedDate: string;
   focusedDateCount: number;
   gamesByDate: {
      date: string;
      games: NHLGame[];
   }[];
}

interface NHLGame {
   id: number;
   season: number;
   gameType: number;
   gameDate: string;
   gameCenterLink: string;
   venue: {
      default: string;
   };
   startTimeUTC: string;
   easternUTCOffset: string;
   venueUTCOffset: string;
   tvBroadcasts: TVBroadcast[];
   gameState: GameState;
   gameScheduleState: string;
   awayTeam: TeamDetails;
   homeTeam: TeamDetails;
   ticketsLink: string;
   ticketsLinkFr: string;
   period?: number;
   periodDescriptor?: {
      number: number;
      periodType: 'REG' | 'OT' | 'SO';
      maxRegulationPeriods: number;
   };
   threeMinRecap: string;
   threeMinRecapFr: string;
}

interface TVBroadcast {
   id: number;
   /** Home, Away, or Neutral */
   market: 'H' | 'A' | 'N';
   countryCode: string;
   network: string;
   sequenceNumber: number;
}

interface TeamDetails {
   id: TeamId;
   name: {
      default: string;
      fr: string;
   };
   commonName: {
      default: string;
      fr: string;
   };
   placeNameWithPreposition: {
      default: string;
      fr: string;
   };
   abbrev: string;
   score: number;
   logo: string;
}

interface NHLScores {
   prevDate: string;
   currentDate: string;
   nextDate: string;
   gameWeek: {
      date: string;
      dayAbbrev: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
      numberOfGames: number;
   }[];
   oddsPartners: {
      partnerId: number;
      country: string;
      name: string;
      imageUrl: string;
      siteUrl: string;
      bgColor: string;
      textColor: string;
      accentColor: string;
   }[];
}

interface NHLScoreGame extends Omit<NHLGame, 'awayTeam' | 'homeTeam'> {
   awayTeam: {
      id: number;
      name: { default: string };
      abbrev: string;
      score: number;
      sog: number;
      logo: string;
   };
   homeTeam: {
      id: number;
      name: { default: string };
      abbrev: string;
      score: number;
      sog: number;
      logo: string;
   };
   periodScores: {
      period: number;
      homeScore: number;
      awayScore: number;
   }[];
}

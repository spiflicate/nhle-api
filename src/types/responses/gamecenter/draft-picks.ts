import type { TeamAbbrev } from '../../types.ts';
import type { LocalizedText, PositionCode } from './common.ts';

export interface DraftPicks {
   broadcastStartTimeUTC: string;
   draftYear: number;
   draftYears: number[];
   selectableRounds: number[];
   state: string;
   picks: Pick[];
}

interface Pick {
   round: number;
   pickInRound: number;
   overallPick: number;
   teamId: number;
   teamAbbrev: TeamAbbrev;
   teamName: LocalizedText;
   teamCommonName: LocalizedText;
   teamPlaceNameWithPreposition: LocalizedText;
   displayAbbrev: LocalizedText;
   teamLogoLight: string;
   teamLogoDark: string;
   teamPickHistory: string;
   firstName: LocalizedText;
   lastName: LocalizedText;
   positionCode: PositionCode;
   countryCode: string;
   height: number;
   weight: number;
   amateurLeague: string;
   amateurClubName: string;
}

import type { TeamAbbrev } from '../../types.ts';
import type { Default, PositionCode } from './common.ts';

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
   teamName: Default;
   teamCommonName: Default;
   teamPlaceNameWithPreposition: Default;
   displayAbbrev: Default;
   teamLogoLight: string;
   teamLogoDark: string;
   teamPickHistory: string;
   firstName: Default;
   lastName: Default;
   positionCode: PositionCode;
   countryCode: string;
   height: number;
   weight: number;
   amateurLeague: string;
   amateurClubName: string;
}

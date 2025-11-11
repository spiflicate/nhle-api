import type { TeamAbbrev } from '../../types.ts';
import type {
   Default,
   DefaultWithTranslations,
   PositionCode,
} from './common.ts';

export interface DraftPicks {
   broadcastStartTimeUTC: string;
   draftYear: number;
   draftYears: number[];
   selectableRounds: number[];
   state: 'over' | string;
   picks: Pick[];
}

interface Pick {
   round: number;
   pickInRound: number;
   overallPick: number;
   teamId: number;
   teamAbbrev: TeamAbbrev;
   teamName: TeamName;
   teamCommonName: TeamName;
   teamPlaceNameWithPreposition: TeamName;
   displayAbbrev: DisplayAbbrev;
   teamLogoLight: string;
   teamLogoDark: string;
   teamPickHistory: string;
   firstName: DisplayAbbrev;
   lastName: DisplayAbbrev;
   positionCode: PositionCode;
   countryCode: CountryCode;
   height: number;
   weight: number;
   amateurLeague: AmateurLeague;
   amateurClubName: string;
}

type AmateurLeague =
   | 'OHL'
   | 'SWEDEN-2'
   | 'QMJHL'
   | 'H-EAST'
   | 'WHL'
   | 'RUSSIA-JR.'
   | 'BIG10'
   | 'USHL'
   | 'HIGH-MN'
   | 'NCHC'
   | 'SWEDEN-JR.'
   | 'NTDP - USHL'
   | 'SWEDEN'
   | 'CZECHIA'
   | 'FINLAND-JR.'
   | 'HIGH-ON'
   | 'CZECHIA-JR.'
   | 'GERMANY'
   | 'CCHL'
   | 'SWE-JR. U18'
   | 'SWISS-JR.'
   | 'FINLAND'
   | 'RUSSIA'
   | 'BCHL'
   | 'HIGH-RI'
   | 'SWISS'
   | 'HIGH-MA'
   | string;

type CountryCode =
   | 'CAN'
   | 'SWE'
   | 'USA'
   | 'CZE'
   | 'RUS'
   | 'FIN'
   | 'CHN'
   | 'AUS'
   | 'SVN'
   | 'SVK'
   | 'BLR'
   | 'DEU'
   | 'ITA'
   | 'CHE'
   | 'NOR'
   | 'DNK'
   | 'HRV'
   | string;

type DisplayAbbrev = Default;

type TeamName = DefaultWithTranslations;

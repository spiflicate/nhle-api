import type { PositionCode, ShootsCatches } from './common.ts';

export interface DraftRankings {
   draftYear: number;
   categoryId: number;
   categoryKey: Key;
   draftYears: number[];
   categories: Category[];
   rankings: Ranking[];
}

export interface Category {
   id: number;
   name: Name;
   consumerKey: Key;
}

export type Key =
   | 'north-american-skater'
   | 'international-skater'
   | 'north-american-goalie'
   | 'international-goalie';

export type Name =
   | 'North American Skater'
   | 'International Skater'
   | 'North American Goalie'
   | 'International Goalie';

export interface Ranking {
   lastName: string;
   firstName: string;
   positionCode: PositionCode;
   shootsCatches: ShootsCatches;
   heightInInches: number;
   weightInPounds: number;
   lastAmateurClub?: string;
   lastAmateurLeague?: AmateurLeague;
   birthDate: Date;
   birthCity: string;
   birthCountry: BirthCountry;
   midtermRank?: number;
   finalRank?: number;
   birthStateProvince?: string;
}

export type BirthCountry =
   | 'RUS'
   | 'CHE'
   | 'SWE'
   | 'FIN'
   | 'CZE'
   | 'BLR'
   | 'CAN'
   | 'SVK'
   | 'USA'
   | 'LVA'
   | 'SVN'
   | 'AUS'
   | 'ITA'
   | 'DNK'
   | 'NOR'
   | 'AUT'
   | 'NLD'
   | 'DEU'
   | 'ESP'
   | 'BEL'
   | 'POL'
   | 'CHN'
   | 'HRV'
   | 'GBR'
   | 'KAZ';

export type AmateurLeague =
   | 'RUSSIA-JR.'
   | 'SWISS-JR.'
   | 'SWEDEN-JR.'
   | 'FINLAND'
   | 'WHL'
   | 'SWEDEN-2'
   | 'FINLAND-JR.'
   | 'QMJHL'
   | 'USHL'
   | 'OHL'
   | 'H-EAST'
   | 'CCHL'
   | 'BCHL'
   | 'NAHL'
   | 'CZECHIA'
   | 'SWEDEN'
   | 'CZECHIA-JR.'
   | 'CZECHIA-2'
   | 'RUSSIA'
   | 'SWISS'
   | 'SLOVAKIA'
   | 'SWISS-2'
   | 'GERMANY'
   | 'FRANCE'
   | 'SLOVAKIA-JR.'
   | 'BIG10'
   | 'NCHC'
   | 'HIGH-MN'
   | 'NTDP - USHL'
   | 'HIGH-ON'
   | 'ECAC'
   | 'HIGH-RI'
   | 'HIGH-MA'
   | 'CCHA'
   | 'RUSSIA-2';

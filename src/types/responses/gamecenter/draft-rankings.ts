import type { PositionCode, ShootsCatches } from './common.ts';

export interface DraftRankings {
   draftYear: number;
   categoryId: number;
   categoryKey: Key;
   draftYears: number[];
   categories: Category[];
   rankings: Ranking[];
}

interface Category {
   id: number;
   name: Name;
   consumerKey: Key;
}

type Key =
   | 'north-american-skater'
   | 'international-skater'
   | 'north-american-goalie'
   | 'international-goalie';

type Name =
   | 'North American Skater'
   | 'International Skater'
   | 'North American Goalie'
   | 'International Goalie';

interface Ranking {
   lastName: string;
   firstName: string;
   positionCode: PositionCode;
   shootsCatches: ShootsCatches;
   heightInInches: number;
   weightInPounds: number;
   lastAmateurClub?: string;
   lastAmateurLeague?: string;
   birthDate: Date;
   birthCity: string;
   birthCountry: string;
   midtermRank?: number;
   finalRank?: number;
   birthStateProvince?: string;
}

import type {
   CountryTLA,
   DefaultWithTranslations,
   PositionCode,
   ShootsCatches,
} from './common.ts';

export interface TeamProspects {
   forwards: Forward[];
   defensemen: Defenseman[];
   goalies: Goalie[];
}

interface PlayerBase {
   id: number;
   headshot: string;
   firstName: DefaultWithTranslations;
   lastName: DefaultWithTranslations;
   sweaterNumber?: number;
   shootsCatches: ShootsCatches;
   heightInInches: number;
   weightInPounds: number;
   heightInCentimeters: number;
   weightInKilograms: number;
   birthDate: string;
   birthCity?: DefaultWithTranslations;
   birthCountry: CountryTLA;
   birthStateProvince?: DefaultWithTranslations;
}

interface Defenseman extends PlayerBase {
   positionCode: 'D';
}

interface Forward extends PlayerBase {
   positionCode: Exclude<PositionCode, 'D' | 'G'>;
}

interface Goalie extends PlayerBase {
   positionCode: 'G';
}

import type {
   LocalizedText,
   PositionCode,
   ShootsCatches,
} from './common.ts';

export interface TeamProspects {
   forwards: Forward[];
   defensemen: Defenseman[];
   goalies: Goalie[];
}

interface BaseProspect {
   id: number;
   headshot: string;
   firstName: LocalizedText;
   lastName: LocalizedText;
   sweaterNumber?: number;
   shootsCatches: ShootsCatches;
   heightInInches: number;
   weightInPounds: number;
   heightInCentimeters: number;
   weightInKilograms: number;
   birthDate: string;
   birthCity?: LocalizedText;
   birthCountry: string;
   birthStateProvince?: LocalizedText;
}

interface Defenseman extends BaseProspect {
   positionCode: 'D';
}

interface Forward extends BaseProspect {
   positionCode: Exclude<PositionCode, 'D' | 'G'>;
}

interface Goalie extends BaseProspect {
   positionCode: 'G';
}

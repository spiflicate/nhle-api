import type { Season } from '../../types.ts';
import type {
   LocalizedText,
   PositionCode,
   ShootsCatches,
} from './common.ts';

export type TeamRosterSeasons = Array<Season>;

export interface TeamRoster {
   forwards: Forward[];
   defensemen: Defenseman[];
   goalies: Goalie[];
}

interface Player {
   id: number;
   headshot: string;
   firstName: LocalizedText;
   lastName: LocalizedText;
   sweaterNumber?: number;
   positionCode: PositionCode;
   shootsCatches?: ShootsCatches;
   heightInInches?: number;
   weightInPounds?: number;
   heightInCentimeters?: number;
   weightInKilograms?: number;
   birthDate: string;
   birthCity?: LocalizedText;
   birthCountry: string;
   birthStateProvince?: LocalizedText;
}

interface Forward extends Player {
   positionCode: Exclude<PositionCode, 'D' | 'G'>;
}

interface Defenseman extends Player {
   positionCode: 'D';
}

interface Goalie extends Player {
   positionCode: 'G';
}

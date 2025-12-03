import type { LocalizedText } from './common.ts';

export type PostalCodeInfo = Array<{
   stateProvince: string;
   networkType?: string;
   county?: string;
   teamName: LocalizedText;
   postalCode: string;
   country: string;
   city: string;
}>;

export interface LocationInfo {
   country: string;
}

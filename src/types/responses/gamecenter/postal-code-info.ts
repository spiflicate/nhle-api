import type { Default } from './common.ts';

export type PostalCodeInfo = Array<{
   stateProvince: string;
   networkType?: string;
   county?: string;
   teamName: Default;
   postalCode: string;
   country: string;
   city: string;
}>;

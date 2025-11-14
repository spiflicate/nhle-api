import type { DefaultWithTranslations } from './common.ts';

export type PostalCodeInfo = Array<{
   stateProvince: string;
   networkType?: string;
   county?: string;
   teamName: DefaultWithTranslations;
   postalCode: string;
   country: string;
   city: string;
}>;

export interface WhereToWatch {
   id: string;
   active: boolean;
   countryCode: string;
   countryName: string;
   streamingName?: StreamingName;
   streamingSiteUrl?: string;
   streamingLogoUrl?: string;
   primaryBroadcastName?: string;
   primaryBroadcastSiteUrl?: string;
   primaryBroadcastLogoUrl?: string;
   secondaryBroadcastName?: string;
   secondaryBroadcastSiteUrl?: string;
   secondaryBroadcastLogoUrl?: string;
}

export type StreamingName =
   | 'NHL Live'
   | 'NHL.TV INTL'
   | 'ESPN+'
   | 'ESPN Play'
   | 'Disney Plus'
   | 'Disney+'
   | 'Viaplay'
   | 'TV24'
   | 'TV3'
   | string;

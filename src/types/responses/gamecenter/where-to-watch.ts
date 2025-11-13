export interface WhereToWatch {
   id: string;
   active: boolean;
   countryCode: string;
   countryName: string;
   streamingName?: string;
   streamingSiteUrl?: string;
   streamingLogoUrl?: string;
   primaryBroadcastName?: string;
   primaryBroadcastSiteUrl?: string;
   primaryBroadcastLogoUrl?: string;
   secondaryBroadcastName?: string;
   secondaryBroadcastSiteUrl?: string;
   secondaryBroadcastLogoUrl?: string;
}

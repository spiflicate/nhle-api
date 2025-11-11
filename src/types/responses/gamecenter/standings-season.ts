export interface NHLStandingsSeason {
   currentDate: string;
   seasons: SeasonDetails[];
}

export interface SeasonDetails {
   id: number;
   conferencesInUse: boolean;
   divisionsInUse: boolean;
   pointForOTlossInUse: boolean;
   regulationWinsInUse: boolean;
   /** Regulation and overtime wins in use for standings tie breaks */
   rowInUse: boolean;
   /** ISO 8601 date string */
   standingsEnd: string;
   /** ISO 8601 date string */
   standingsStart: string;
   tiesInUse: boolean;
   wildcardInUse: boolean;
}

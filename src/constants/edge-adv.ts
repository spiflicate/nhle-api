/** Categories for save location top-10 list */
export const SaveLocationCategoryEnum = {
   /** Save Percentage */
   'SV%': 'save-pctg',
   /** Saves */
   SV: 'saves',
   /** Shots Against */
   SA: 'shots-against',
   /** Goals Against */
   GA: 'goals-against',
} as const;

/** Sort options for shot location top-10 list */
export const ShotLocationSortEnum = {
   /** All shot locations */
   ALL: 'all',
   /** High-danger (i.e. close-range) shot locations */
   HIGH: 'high',
   /** Mid-range shot locations */
   MID: 'mid',
   /** Long-range shot locations */
   LONG: 'long',
} as const;

/** Alias for ShotLocationSortEnum */
export const SaveLocationSortEnum = ShotLocationSortEnum;

/** Sort options for 5v5 save percentage top-10 list */
export const SavePercentage5v5SortEnum = {
   /**5v5 Save %: The percentage of shots a goalie stops at even strength (5-on-5). */
   '5v5-SV%': 'save-pctg',
   /**5v5 Save % in Close Situations: A “close situation” is the time during which a game is tied in the first or second period, or within one goal in the third period. This stats helps how goalies perform in high-pressure situations.*/
   '5v5-SV%-Close': 'save-pctg-close',
   /**5v5 Shots Against: The total number of shots a goalie faces at even strength (5-on-5).*/
   '5v5-SA': 'shots',
   /**5v5 Shots Against per 60 Minutes: The total number of shots a goalie faces at even strength (5-on-5) normalized to a 60-minute game. */
   '5v5-SA/60': 'shots-per-60',
} as const;

/** Sort options for save percentage top-10 list */
export const SavePercentageSortEnum = {
   /** Starts above .900 */
   GAMES: 'games',
   /** Percentage of starts above .900 */
   PCTG: 'pctg',
} as const;

/** Filter options for player positions */
export const PositionFilterEnum = {
   /** Center */
   ALL: 'all',
   /** Left Wing */
   FWD: 'forwards',
   /** Right Wing */
   DEF: 'defense',
} as const;

/** Categories for skater strength */
export const SkatersStrengthEnum = {
   /** All strengths */
   ALL: 'all',
   /** Even strength */
   ES: 'es',
   /** Power play */
   PP: 'pp',
   /** Short-handed */
   PK: 'pk',
} as const;

/** Sorting options for shot speed top-10 list */
export const ShotSpeedSortEnum = {
   /** Hardest shot recorded by player */
   MAX: 'max',
   /** Shots over 100 mph */
   'OVER-100': 'over-100',
   /** Shots between 90 and 99 mph */
   '90-99': '90-99',
   /** Shots between 80 and 89 mph */
   '80-89': '80-89',
   /** Shots between 70 and 79 mph */
   '70-79': '70-79',
} as const;

/** Sorting options for skating speed top-10 list */
export const SkatingSpeedSortEnum = {
   /** Fastest skating speed recorded by player */
   TOP: 'max',
   /** Speed bursts recorded over 22 mph */
   'OVER-22': 'over-22',
   /** Speed bursts recorded between 20 and 22 mph */
   '20-22': '20-22',
   /** Speed bursts recorded between 18 and 20 mph */
   '18-20': '18-20',
} as const;

/** Sorting options for skating distance top-10 list */
export const SkatingDistanceSortEnum = {
   /** Total distance skated */
   TOTAL: 'total',
   /** Average distance skated per 60 minutes */
   'PER-60': 'per-60',
   /** Maximum distance skated in a single period */
   'MAX-PERIOD': 'max-period',
   /** Maximum distance skated in a single game */
   'MAX-GAME': 'max-game',
};

/** Categories for shot location top-10 list */
export const ShotLocationCategoryEnum = {
   /** Total shots on goal */
   SOG: 'sog',
   /** Total goals */
   G: 'goals',
   /** Shooting percentage */
   'SH%': 'shooting-pctg',
} as const;

/** Sorting options for zone time top-10 lists. */
export const ZoneTimeSortEnum = {
   /** Percentage of time spent in the offensive zone */
   OZ: 'offensive',
   /** Percentage of time spent in the defensive zone */
   DZ: 'defensive',
   /** Percentage of time spent in the neutral zone */
   NZ: 'neutral',
} as const;

/**
 * Common types used in Gamecenter API responses
 */

type Suggestions<T> = T | (string & {});

/** GameState - The current state of the game. */
export type GameState = 'OFF' | 'FUT' | 'LIVE' | 'PRE' | 'CRIT' | 'FINAL';

/** GameScheduleState - The current state of the game. */
export type GameScheduleState = Suggestions<'OK' | 'TBD' | 'CNCL'>;

/** PeriodType - The type of period in the game. */
export type PeriodType = 'REG' | 'OT' | 'SO';

/** Market - The market for this broadcast. (H = Home, A = Away, N = National, S = Satellite Radio) */
export type Market = 'H' | 'A' | 'N' | 'S';

/** CountryCode - The country code for this broadcast. (CA = Canada, US = United States) */
export type CountryCode = 'CA' | 'US';

/** PositionCode - The position code for a player. (C = Center, RW = Right Wing, LW = Left Wing, D = Defenseman, G = Goalie) */
export type PositionCode = 'C' | 'LW' | 'RW' | 'D' | 'G';

/** PositionCode - The position code for a player. (C = Center, R = Right, L = Left, D = Defenseman, G = Goalie) */
export type Position = 'C' | 'L' | 'R' | 'D' | 'G';

/** ShootsCatches - Player's shooting/catching handedness. (L = Left, R = Right) */
export type ShootsCatches = 'L' | 'R';

/** Default - An object containing a default string value. */
export interface Default {
   default: string;
}

/** DefaultWithTranslations - An object containing a default string value as well as any translations for other languages. */
export interface DefaultWithTranslations extends Default {
   /** French */
   fr?: string;
   /** Czech */
   cs?: string;
   /** German */
   de?: string;
   /** Spanish */
   es?: string;
   /** Finnish */
   fi?: string;
   /** Slovak */
   sk?: string;
   /** Swedish */
   sv?: string;
   [key: string]: string | undefined;
}

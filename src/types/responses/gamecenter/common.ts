/**
 * Common types used in Gamecenter API responses
 */

/** Market - The market for this broadcast. (H = Home, A = Away, N = National) */
export type Market = 'H' | 'A' | 'N';

/** CountryCode - The country code for this broadcast. (CA = Canada, US = United States) */
export type CountryCode = 'CA' | 'US';

/** Network - The network for this broadcast. (TVAS = TVA Sports, SN = Sportsnet, ESPN = ESPN, ESPN+ = ESPN+) */
export type Network = 'TVAS' | 'SN' | 'ESPN' | 'ESPN+';

/** PositionCode - The position code for a player. (D = Defenseman, C = Center, RW = Right Wing, LW = Left Wing, G = Goalie) */
export type PositionCode = 'D' | 'C' | 'RW' | 'LW' | 'G';

/** ShootsCatches - Player's shooting/catching handedness. (L = Left, R = Right) */
export type ShootsCatches = 'L' | 'R';

/** Default - An object containing a default string value. */
export interface Default {
   default: string;
}

/** DefaultWithLangAlternatives - An object containing a default string value as well as any alternative spellings for other languages. */
export interface DefaultWithLangAlternatives extends Default {
   /** French */
   fr?: string;
   /** Czech */
   cs?: string;
   /** Finnish */
   fi?: string;
   /** Slovak */
   sk?: string;
   /** Swedish */
   sv?: string;
   /** German */
   de?: string;
   /** Spanish */
   es?: string;
   [key: string]: string | undefined;
}

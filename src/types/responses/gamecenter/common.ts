/**
 * Common types used in Gamecenter API responses
 */

/** GameState - The current state of the game. */
export type GameState = 'OFF' | 'FUT' | 'LIVE' | 'PRE' | 'CRIT' | 'FINAL';

/** Market - The market for this broadcast. (H = Home, A = Away, N = National) */
export type Market = 'H' | 'A' | 'N';

/** CountryCode - The country code for this broadcast. (CA = Canada, US = United States) */
export type CountryCode = 'CA' | 'US' | string;

/** CountryTLA - The three-letter country code. */
export type CountryTLA =
   | 'CAN'
   | 'FIN'
   | 'USA'
   | 'LAT'
   | 'CZE'
   | 'SWE'
   | 'CHE'
   | 'GER'
   | 'RUS'
   | 'AUT'
   | 'GBR'
   | 'NOR'
   | 'DEU'
   | 'SVK'
   | 'LVA'
   | 'BLR'
   | 'KAZ'
   | 'DNK'
   | 'ITA'
   | 'SUI'
   | 'FRA'
   | string;

/**
 * PositionCode - The position code for a player. (D = Defenseman, C = Center, R[W] = Right Wing, L[W] = Left Wing, G = Goalie)
 * Note: The NHL data likes to switch between including and excluding the [W] for wing positions
 */
export type PositionCode = 'D' | 'C' | 'L' | 'LW' | 'R' | 'RW' | 'G';

/** ShootsCatches - Player's shooting/catching handedness. (L = Left, R = Right) */
export type ShootsCatches = 'L' | 'R';

/** Default - An object containing a default string value. */
export interface Default {
   default: string;
}

/** DefaultWithTranslations - An object containing a default string value as well as any alternative spellings for other languages. */
export interface DefaultWithTranslations extends Default {
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

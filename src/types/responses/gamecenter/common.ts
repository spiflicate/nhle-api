/**
 * Common types used in Gamecenter API responses
 */

type IncompleteOptions<T> = T | (string & {});

/** GameState - The current state of the game. */
export type GameState = 'OFF' | 'FUT' | 'LIVE' | 'PRE' | 'CRIT' | 'FINAL';

/** GameScheduleState - The current state of the game. */
export type GameScheduleState = IncompleteOptions<'OK' | 'TBD' | 'CNCL'>;

/** PeriodType - The type of period in the game. */
export type PeriodType = 'REG' | 'OT' | 'SO';

/** PenaltyType - The type of penalty. (MIN = Minor, BEN = Bench, MAJ = Major) */
export type PenaltyTypeCode = IncompleteOptions<'MIN' | 'BEN' | 'MAJ'>;

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

/** DefaultWith - An object containing a default string value as well as any translations to other languages. */
export interface Default {
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
   /** Additional languages */
   [key: string]: string | undefined;
}

export type UTCOffset = `+${number}:${number}` | `-${number}:${number}`;

export type GoalModifier = 'none' | 'empty-net' | 'awarded-empty-net';

export type DefendingSide = 'left' | 'right';

export type Strength = 'ev' | 'pp' | 'sh';

export type ZoneCode = 'N' | 'D' | 'O';

export type ShotType = IncompleteOptions<
   | 'backhand'
   | 'bat'
   | 'between-legs'
   | 'deflected'
   | 'poke'
   | 'slap'
   | 'snap'
   | 'tip-in'
   | 'wrap-around'
   | 'wrist'
>;

export interface TvBroadcast {
   id: number;
   market: Market;
   countryCode: CountryCode;
   network: string;
   sequenceNumber: number;
}

export type PenaltyDescKey = IncompleteOptions<
   | 'tripping'
   | 'hooking'
   | 'interference'
   | 'high-sticking'
   | 'roughing'
   | 'unsportsmanlike-conduct'
   | 'slashing'
   | 'delaying-game-puck-over-glass'
   | 'holding'
   | 'holding-the-stick'
   | 'too-many-men-on-the-ice'
   | 'fighting'
   | 'minor'
   | 'cross-checking'
>;

export type Reason = IncompleteOptions<
   | 'blocked'
   | 'failed-bank-attempt'
   | 'wide-right'
   | 'goalie-stopped-after-sog'
   | 'offside'
   | 'teammate-blocked'
   | 'icing'
   | 'puck-in-netting'
   | 'wide-left'
   | 'high-and-wide-left'
   | 'puck-frozen'
   | 'above-crossbar'
   | 'tv-timeout'
   | 'hand-pass'
   | 'skater-puck-frozen'
   | 'high-stick'
   | 'high-and-wide-right'
   | 'hit-crossbar'
   | 'puck-in-benches'
   | 'hit-right-post'
   | 'short'
   | 'referee-or-linesman'
   | 'puck-in-crowd'
   | 'hit-left-post'
   | 'player-equipment'
   | 'net-dislodged-defensive-skater'
   | 'home-timeout'
   | 'chlg-hm-goal-interference'
   | 'video-review'
   | 'chlg-league-missed-stoppage'
   | 'visitor-timeout'
   | 'official-injury'
>;

/**
 * Common types used in Gamecenter API responses
 */

/** The current state of the game. */
export type GameState = 'OFF' | 'FUT' | 'LIVE' | 'PRE' | 'CRIT' | 'FINAL';

/** The current state of the game. */
export type GameScheduleState = 'OK' | 'TBD' | 'CNCL' | (string & {});

/** The type of period in the game. */
export type PeriodType = 'REG' | 'OT' | 'SO';

/** Abbreviated day of the week. (MON = Monday, TUE = Tuesday ...) */
export type DayAbbrev =
   | 'MON'
   | 'TUE'
   | 'WED'
   | 'THU'
   | 'FRI'
   | 'SAT'
   | 'SUN';

/** The type of penalty. (MIN = Minor, BEN = Bench, MAJ = Major ...) */
export type PenaltyTypeCode = 'MIN' | 'BEN' | 'MAJ' | (string & {});

/** The market for this broadcast. (H = Home, A = Away, N = National, S = Satellite Radio) */
export type Market = 'H' | 'A' | 'N' | 'S';

/** The country code for this broadcast. (CA = Canada, US = United States) */
export type CountryCode = 'CA' | 'US';

/** The position code for a player. (C = Center, L[W] = Left Wing, R[W] = Right Wing, D = Defenseman, G = Goalie) */
export type PositionCode = 'C' | 'LW' | 'L' | 'RW' | 'R' | 'D' | 'G';

/** Player's shooting/catching handedness. (L = Left, R = Right) */
export type ShootsCatches = 'L' | 'R';

export type HexColorCode = `#${string}`;

export type UTCOffset = `+${number}:${number}` | `-${number}:${number}`;

export type GoalModifier = 'none' | 'empty-net' | 'awarded-empty-net';

export type DefendingSide = 'left' | 'right';

export type Strength = 'ev' | 'pp' | 'sh';

export type ZoneCode = 'N' | 'D' | 'O';

export type ShotType =
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
   | (string & {});

export type PenaltyDescKey =
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
   | (string & {});

export type Reason =
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
   | (string & {});

export type EventTypeDescKey =
   | 'period-start'
   | 'faceoff'
   | 'blocked-shot'
   | 'goal'
   | 'hit'
   | 'giveaway'
   | 'missed-shot'
   | 'shot-on-goal'
   | 'stoppage'
   | 'takeaway'
   | 'penalty'
   | 'period-end'
   | 'delayed-penalty'
   | 'game-end'
   | (string & {});

/** An object containing a default string an optional localized strings. */
export interface LocalizedText {
   /** Default */
   default: string;
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
}

export interface TvBroadcast {
   id: number;
   market: Market;
   countryCode: CountryCode;
   network: string;
   sequenceNumber: number;
}

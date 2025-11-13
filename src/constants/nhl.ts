// Values are based on the NHL API documentation and other sources.
// Last updated: 2025-10-23

/**
 * All valid NHL team abbreviations and their corresponding team IDs.
 */
export const TeamsEnum = {
   /** Anaheim Ducks */
   ANA: 24,
   /** Boston Bruins */
   BOS: 6,
   /** Buffalo Sabres */
   BUF: 7,
   /** Calgary Flames */
   CGY: 20,
   /** Carolina Hurricanes */
   CAR: 12,
   /** Chicago Blackhawks */
   CHI: 16,
   /** Colorado Avalanche */
   COL: 21,
   /** Columbus Blue Jackets */
   CBJ: 29,
   /** Dallas Stars */
   DAL: 25,
   /** Detroit Red Wings */
   DET: 17,
   /** Edmonton Oilers */
   EDM: 22,
   /** Florida Panthers */
   FLA: 13,
   /** Los Angeles Kings */
   LAK: 26,
   /** Minnesota Wild*/
   MIN: 30,
   /** Montreal Canadiens */
   MTL: 8,
   /** New Jersey Devils */
   NJD: 1,
   /** Nashville Predators */
   NSH: 18,
   /** New York Islanders */
   NYI: 2,
   /** New York Rangers */
   NYR: 3,
   /** Ottawa Senators */
   OTT: 9,
   /** Philadelphia Flyers */
   PHI: 4,
   /** Pittsburgh Penguins */
   PIT: 5,
   /** San Jose Sharks */
   SJS: 28,
   /** Seattle Kraken */
   SEA: 55,
   /** St. Louis Blues */
   STL: 19,
   /** Tampa Bay Lightning */
   TBL: 14,
   /** Toronto Maple Leafs */
   TOR: 10,
   /** Utah Hockey Club */
   UTA: 59,
   /** Vancouver Canucks */
   VAN: 23,
   /** Vegas Golden Knights */
   VGK: 54,
   /** Winnipeg Jets */
   WPG: 52,
   /** Washington Capitals */
   WSH: 15,
} as const;

export const TeamsReverseEnum = Object.fromEntries(
   Object.entries(TeamsEnum).map(([key, value]) => [value, key]),
) as Record<
   (typeof TeamsEnum)[keyof typeof TeamsEnum],
   keyof typeof TeamsEnum
>;

/**
 * All inactive NHL teams and their corresponding team IDs.
 */
export const InactiveTeamsEnum = {
   /** Atlanta Flames (not active) */
   AFM: 47,
   /** Arizona Coyotes (not active) */
   ARI: 53,
   /** Atlanta Thrashers (not active) */
   ATL: 11,
   /**  Brooklyn Americans - (not active) */
   BRK: 51,
   /** California Golden Seals (aka Bay Area Seals) - (not active) */
   CGS: 56,
   /** Cleveland Barons - (not active) */
   CLE: 49,
   /** Colorado Rockies - (not active) */
   CLR: 35,
   /** Detroit Cougars - (not active) */
   DCG: 40,
   /** Detroit Falcons - (not active) */
   DFL: 50,
   /** Hamilton Tigers - (not active) */
   HAM: 37,
   /** Hartford Whalers - (not active) */
   HFD: 34,
   /** Kansas City Scouts - (not active) */
   KCS: 48,
   /** Montreal Maroons - (not active) */
   MMR: 43,
   /** Minnesota North Stars - (not active) */
   MNS: 31,
   /** Montreal Wanderers - (not active) */
   MWN: 41,
   /** New York Americans - (not active) */
   NYA: 44,
   /** California Seals (aka Oakland Seals) - (not active) */
   OAK: 46,
   /** Phoenix Coyotes - (not active) */
   PHX: 27,
   /** Pittsburgh Pirates - (not active) */
   PIR: 38,
   /** Quebec Bulldogs - (not active) */
   QBD: 42,
   /** Philadelphia Quakers - (not active) */
   QUA: 39,
   /** Quebec Nordiques - (not active) */
   QUE: 32,
   /** Ottawa Senators (original franchise) - (not active) */
   SEN: 36,
   /** St. Louis Eagles - (not active) */
   SLE: 45,
   /** Toronto Hockey Club (aka Toronto Arenas) - (not active) */
   TAN: 57,
   /** Toronto St. Patricks - (not active) */
   TSP: 58,
   /** Winnipeg Jets (original franchise) - (not active) */
   WIN: 33,
} as const;

export const InactiveTeamsReverseEnum = Object.fromEntries(
   Object.entries(InactiveTeamsEnum).map(([key, value]) => [value, key]),
) as Record<
   (typeof InactiveTeamsEnum)[keyof typeof InactiveTeamsEnum],
   keyof typeof InactiveTeamsEnum
>;
/**
 * All valid NHL seasons in yyyyYYYY format.
 */
export const SeasonsArray = [
   19171918, 19181919, 19191920, 19201921, 19211922, 19221923, 19231924,
   19241925, 19251926, 19261927, 19271928, 19281929, 19291930, 19301931,
   19311932, 19321933, 19331934, 19341935, 19351936, 19361937, 19371938,
   19381939, 19391940, 19401941, 19411942, 19421943, 19431944, 19441945,
   19451946, 19461947, 19471948, 19481949, 19491950, 19501951, 19511952,
   19521953, 19531954, 19541955, 19551956, 19561957, 19571958, 19581959,
   19591960, 19601961, 19611962, 19621963, 19631964, 19641965, 19651966,
   19661967, 19671968, 19681969, 19691970, 19701971, 19711972, 19721973,
   19731974, 19741975, 19751976, 19761977, 19771978, 19781979, 19791980,
   19801981, 19811982, 19821983, 19831984, 19841985, 19851986, 19861987,
   19871988, 19881989, 19891990, 19901991, 19911992, 19921993, 19931994,
   19941995, 19951996, 19961997, 19971998, 19981999, 19992000, 20002001,
   20012002, 20022003, 20032004, 20052006, 20062007, 20072008, 20082009,
   20092010, 20102011, 20112012, 20122013, 20132014, 20142015, 20152016,
   20162017, 20172018, 20182019, 20192020, 20202021, 20212022, 20222023,
   20232024, 20242025, 20252026,
] as const;

/**
 * All valid NHL playoff series letters.
 */
export const SeriesLetterEnum = {
   /** Atlantic Division Round 1: D1 vs WC# */
   A: 'A',
   /** Atlantic Division Round 1: D2 vs D3 */
   B: 'B',
   /** Metropolitan Division Round 1: D1 vs WC# */
   C: 'C',
   /** Metropolitan Division Round 1: D2 vs D3 */
   D: 'D',
   /** Central Division Round 1: D1 vs WC# */
   E: 'E',
   /** Central Division Round 1: D2 vs D3 */
   F: 'F',
   /** Pacific Division Round 1: D1 vs WC# */
   G: 'G',
   /** Pacific Division Round 1: D2 vs D3 */
   H: 'H',
   /** Atlantic Division Round 2: Aw vs Bw */
   I: 'I',
   /** Metropolitan Division Round 2: Cw vs Dw */
   J: 'J',
   /** Central Division Round 2: Ew vs Fw */
   K: 'K',
   /** Pacific Division Round 2: Gw vs Hw */
   L: 'L',
   /** Eastern Conference Finals */
   M: 'M',
   /** Western Conference Finals*/
   N: 'N',
   /** Stanley Cup Finals */
   O: 'O',
} as const;

/**
 * All valid NHL playoff series letters grouped by round.
 */
export const SeriesLetterByRound = {
   R1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
   R2: ['I', 'J', 'K', 'L'],
   CF: ['M', 'N'],
   SCF: ['O'],
};
/**
 * All valid NHL playoff series letters mapped to human-readable names.
 */
export const PlayoffSeriesEnum = {
   Atlantic_R1_D1_vs_WC: 'A',
   Atlantic_R1_D2_vs_D3: 'B',
   Metropolitan_R1_D1_vs_WC: 'C',
   Metropolitan_R1_D2_vs_D3: 'D',
   Central_R1_D1_vs_WC: 'E',
   Central_R1_D2_vs_D3: 'F',
   Pacific_R1_D1_vs_WC: 'G',
   Pacific_R1_D2_vs_D3: 'H',
   Atlantic_R2_Aw_vs_Bw: 'I',
   Metropolitan_R2_Cw_vs_Dw: 'J',
   Central_R2_Ew_vs_Fw: 'K',
   Pacific_R2_Gw_vs_Hw: 'L',
   Eastern_Conference_Finals: 'M',
   Western_Conference_Finals: 'N',
   Stanley_Cup_Finals: 'O',
};

/**
 * All valid NHL game states.
 */
export const GameStateEnum = {
   /** Future */
   FUT: 'FUT',
   /** Live */
   LIV: 'LIV',
   /** Finished */
   FIN: 'FIN',
} as const;

/**
 * All valid NHL period types.
 */
export const PeriodTypeEnum = {
   /** Regulation */
   REG: 'REG',
   /** Overtime */
   OT: 'OT',
   /** Shootout */
   SO: 'SO',
} as const;

/**
 * All valid NHL game types.
 */
export const GameTypeEnum = {
   /** Pre-season */
   PRE: 1,
   /** Regular season */
   REG: 2,
   /** Post-season (aka playoffs) */
   POST: 3,
   /** All-Star Game (unconfirmed) */
   ASG: 4,
   /** International (unconfirmed) */
   INTL: 19,
} as const;

/**  */
export const SEASON_RANGE = {
   START: SeasonsArray[0] as number,
   END: SeasonsArray.at(-1) as number,
};
/**  */
export const START_SEASON = SEASON_RANGE.START;
/**  */
export const END_SEASON = SEASON_RANGE.END;
/**  */
export const YEAR_RANGE = {
   START: parseInt(SEASON_RANGE.START.toString().slice(0, 4), 10),
   END: parseInt(SEASON_RANGE.END.toString().slice(4, 8), 10),
};
/**  */
export const START_YEAR = YEAR_RANGE.START;
/**  */
export const END_YEAR = YEAR_RANGE.END;
/**  */
export const CURRENT = {
   SEASON: SEASON_RANGE.END,
   YEAR: YEAR_RANGE.END,
};
/**  */
export const PLAYER_ID_RANGE = { MIN: 8444000, MAX: 8489999 } as const;
/**  */
export const TEAM_ID_RANGE = { MIN: 1, MAX: 59 } as const;
// export const TEAM_ID_RANGE = {
//    MIN: Object.values(TeamsEnum).reduce(
//       (min, team) => Math.min(min, team),
//       Infinity,
//    ),
//    MAX: Object.values(TeamsEnum).reduce(
//       (max, team) => Math.max(max, team),
//       -Infinity,
//    ),
// } as const;

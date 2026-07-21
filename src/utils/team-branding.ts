import type { NHL } from '#/constants/index.ts';
import { normalizeAbbrev } from '#/utils/normalize.ts';

/** A CSS-compatible hexadecimal team colour. */
export type TeamColor = `#${string}`;

/** The supported NHL logo treatments. */
export type TeamLogoTheme = 'light' | 'dark';

/** Options for building an official NHL team logo URL. */
export interface TeamLogoOptions {
   theme?: TeamLogoTheme;
   secondary?: boolean;
}

/** Current colours and identity metadata for an NHL team. */
export interface TeamBranding {
   name: string;
   primaryColor: TeamColor;
   colors: Readonly<Record<string, TeamColor>>;
}

/** Historical colour set for a team or franchise. */
export interface HistoricalTeamColors {
   period: string;
   colors: Readonly<Record<string, TeamColor>>;
}

type ActiveTeamAbbreviation = keyof typeof NHL.TeamsEnum;

/**
 * Current NHL team colours.
 *
 * Values are based on the local NHL colour-code research dataset. The first
 * value in each `colors` object is the team's primary brand colour.
 */
export const TEAM_BRANDING = {
   ANA: {
      name: 'Anaheim Ducks',
      primaryColor: '#F47A38',
      colors: {
         orange: '#F47A38',
         metallicGold: '#B9975B',
         silver: '#C1C6C8',
         black: '#000000',
      },
   },
   BOS: {
      name: 'Boston Bruins',
      primaryColor: '#FFB81C',
      colors: { gold: '#FFB81C', black: '#000000' },
   },
   BUF: {
      name: 'Buffalo Sabres',
      primaryColor: '#003087',
      colors: {
         royalBlue: '#003087',
         gold: '#FFB81C',
         white: '#FFFFFF',
      },
   },
   CGY: {
      name: 'Calgary Flames',
      primaryColor: '#D2001C',
      colors: { red: '#D2001C', yellow: '#FAAF19', white: '#FFFFFF' },
   },
   CAR: {
      name: 'Carolina Hurricanes',
      primaryColor: '#CE1126',
      colors: {
         red: '#CE1126',
         white: '#FFFFFF',
         gray: '#A4A9AD',
         black: '#000000',
      },
   },
   CHI: {
      name: 'Chicago Blackhawks',
      primaryColor: '#CF0A2C',
      colors: {
         red: '#CF0A2C',
         orange: '#FF671B',
         green: '#00833E',
         yellow: '#FFD100',
         tan: '#D18A00',
         blue: '#001970',
         black: '#000000',
         white: '#FFFFFF',
      },
   },
   COL: {
      name: 'Colorado Avalanche',
      primaryColor: '#6F263D',
      colors: {
         burgundy: '#6F263D',
         blue: '#236192',
         silver: '#A2AAAD',
         black: '#000000',
      },
   },
   CBJ: {
      name: 'Columbus Blue Jackets',
      primaryColor: '#002654',
      colors: {
         unionBlue: '#002654',
         goalRed: '#CE1126',
         capitalSilver: '#A4A9AD',
      },
   },
   DAL: {
      name: 'Dallas Stars',
      primaryColor: '#006847',
      colors: {
         victoryGreen: '#006847',
         silver: '#8F8F8C',
         black: '#111111',
      },
   },
   DET: {
      name: 'Detroit Red Wings',
      primaryColor: '#CE1126',
      colors: { red: '#CE1126', white: '#FFFFFF' },
   },
   EDM: {
      name: 'Edmonton Oilers',
      primaryColor: '#041E42',
      colors: { blue: '#041E42', orange: '#FF4C00' },
   },
   FLA: {
      name: 'Florida Panthers',
      primaryColor: '#041E42',
      colors: { navy: '#041E42', red: '#C8102E', tan: '#B9975B' },
   },
   LAK: {
      name: 'Los Angeles Kings',
      primaryColor: '#111111',
      colors: { black: '#111111', silver: '#A2AAAD', white: '#FFFFFF' },
   },
   MIN: {
      name: 'Minnesota Wild',
      primaryColor: '#A6192E',
      colors: {
         ironRangeRed: '#A6192E',
         forestGreen: '#154734',
         gold: '#EAAA00',
         minnesotaWheat: '#DDCBA4',
      },
   },
   MTL: {
      name: 'Montreal Canadiens',
      primaryColor: '#AF1E2D',
      colors: { red: '#AF1E2D', blue: '#192168' },
   },
   NJD: {
      name: 'New Jersey Devils',
      primaryColor: '#CE1126',
      colors: { red: '#CE1126', black: '#000000', white: '#FFFFFF' },
   },
   NSH: {
      name: 'Nashville Predators',
      primaryColor: '#FFB81C',
      colors: { gold: '#FFB81C', navyBlue: '#041E42', white: '#FFFFFF' },
   },
   NYI: {
      name: 'New York Islanders',
      primaryColor: '#00539B',
      colors: { blue: '#00539B', orange: '#F47D30' },
   },
   NYR: {
      name: 'New York Rangers',
      primaryColor: '#0038A8',
      colors: { blue: '#0038A8', red: '#CE1126', white: '#FFFFFF' },
   },
   OTT: {
      name: 'Ottawa Senators',
      primaryColor: '#000000',
      colors: {
         black: '#000000',
         red: '#DA1A32',
         gold: '#B79257',
         white: '#FFFFFF',
      },
   },
   PHI: {
      name: 'Philadelphia Flyers',
      primaryColor: '#F74902',
      colors: {
         flyersOrange: '#F74902',
         black: '#000000',
         white: '#FFFFFF',
      },
   },
   PIT: {
      name: 'Pittsburgh Penguins',
      primaryColor: '#000000',
      colors: {
         black: '#000000',
         gold: '#CFC493',
         yellow: '#FCB514',
         white: '#FFFFFF',
      },
   },
   SJS: {
      name: 'San Jose Sharks',
      primaryColor: '#006D75',
      colors: {
         teal: '#006D75',
         orange: '#EA7200',
         black: '#000000',
         white: '#FFFFFF',
      },
   },
   SEA: {
      name: 'Seattle Kraken',
      primaryColor: '#001628',
      colors: {
         deepSeaBlue: '#001628',
         iceBlue: '#99D9D9',
         boundlessBlue: '#355464',
         shadowBlue: '#68A2B9',
         redAlert: '#E9072B',
      },
   },
   STL: {
      name: 'St. Louis Blues',
      primaryColor: '#002F87',
      colors: {
         blue: '#002F87',
         yellow: '#FCB514',
         navyBlue: '#041E42',
         white: '#FFFFFF',
      },
   },
   TBL: {
      name: 'Tampa Bay Lightning',
      primaryColor: '#002868',
      colors: { blue: '#002868', white: '#FFFFFF' },
   },
   TOR: {
      name: 'Toronto Maple Leafs',
      primaryColor: '#00205B',
      colors: { blue: '#00205B', white: '#FFFFFF' },
   },
   UTA: {
      name: 'Utah Mammoth',
      primaryColor: '#69B3E7',
      colors: {
         mountainBlue: '#69B3E7',
         rockBlack: '#010101',
         saltWhite: '#FFFFFF',
      },
   },
   VAN: {
      name: 'Vancouver Canucks',
      primaryColor: '#00205B',
      colors: {
         blue: '#00205B',
         green: '#00843D',
         darkBlue: '#041C2C',
         gray: '#99999A',
         white: '#FFFFFF',
      },
   },
   VGK: {
      name: 'Vegas Golden Knights',
      primaryColor: '#B4975A',
      colors: {
         gold: '#B4975A',
         steelGray: '#333F42',
         red: '#C8102E',
         black: '#000000',
         white: '#FFFFFF',
      },
   },
   WSH: {
      name: 'Washington Capitals',
      primaryColor: '#041E42',
      colors: { navy: '#041E42', red: '#C8102E', white: '#FFFFFF' },
   },
   WPG: {
      name: 'Winnipeg Jets',
      primaryColor: '#041E42',
      colors: {
         navy: '#041E42',
         blue: '#004C97',
         red: '#AC162C',
         maroon: '#7B303E',
         darkGray: '#55565A',
         silver: '#8E9090',
         white: '#FFFFFF',
      },
   },
} as const satisfies Record<ActiveTeamAbbreviation, TeamBranding>;

/** Historical colour palettes included in the local research dataset. */
export const HISTORICAL_TEAM_COLORS = {
   ANA: {
      period: '1993-2006',
      colors: {
         green: '#00685E',
         purple: '#532A44',
         yellow: '#FCC72C',
         black: '#241E24',
      },
   },
   ARI: {
      period: '1996-2014',
      colors: {
         brickRed: '#8C2633',
         green: '#154734',
         desertSand: '#DDCBA4',
         brown: '#A9431E',
         purple: '#5F259F',
      },
   },
   BUF: {
      period: '2006-2020',
      colors: {
         navyBlue: '#002654',
         yellow: '#FCB514',
         silver: '#ADAFAA',
         red: '#C8102E',
      },
   },
   CGY: {
      period: '1994-2020',
      colors: {
         red: '#C8102E',
         gold: '#F1BE48',
         black: '#111111',
         white: '#FFFFFF',
      },
   },
   LAK: {
      period: '1967-1988',
      colors: {
         purple: '#572A84',
         goldenYellow: '#FFC80C',
         white: '#FFFFFF',
      },
   },
   OTT: {
      period: '2007-2020',
      colors: {
         red: '#C52032',
         gold: '#C2912C',
         black: '#000000',
         white: '#FFFFFF',
      },
   },
} as const satisfies Record<string, HistoricalTeamColors>;

const NHL_LOGO_ASSET_URL = 'https://assets.nhle.com/logos/nhl/svg';

/**
 * Returns current branding for an active team abbreviation.
 *
 * Alternate abbreviations such as `TB`, `LA`, and `UTAH` are normalized before
 * lookup. Returns `undefined` for unknown or inactive abbreviations.
 */
export function getTeamBranding(
   abbreviation: string,
): (typeof TEAM_BRANDING)[ActiveTeamAbbreviation] | undefined {
   const normalized = normalizeAbbrev(
      abbreviation,
   ) as ActiveTeamAbbreviation;
   return TEAM_BRANDING[normalized];
}

/**
 * Builds an official NHL SVG logo URL for an active team.
 *
 * @throws {RangeError} If `abbreviation` is not an active NHL team.
 */
export function getTeamLogoUrl(
   abbreviation: string,
   options: TeamLogoOptions = {},
): string {
   const normalized = normalizeAbbrev(
      abbreviation,
   ) as ActiveTeamAbbreviation;
   if (!getTeamBranding(normalized)) {
      throw new RangeError(
         `Unknown active NHL team abbreviation: ${abbreviation}`,
      );
   }

   const theme = options.theme ?? 'light';
   const secondary = options.secondary ? '_secondary' : '';
   return `${NHL_LOGO_ASSET_URL}/${normalized}${secondary}_${theme}.svg`;
}

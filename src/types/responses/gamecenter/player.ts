import type { TeamAbbrev } from '../../types.ts';
import type { LocalizedText, PositionCode } from './common.ts';

export interface PlayerSearchResult {
   playerId: string;
   name: string;
   positionCode: PositionCode;
   teamId: string | null;
   teamAbbrev: string | null;
   lastTeamId: string | null;
   lastTeamAbbrev: string | null;
   lastSeasonId: string | null;
   sweaterNumber: number | null;
   active: boolean;
   height: string | null;
   heightInInches: number | null;
   heightInCentimeters: number | null;
   weightInPounds: number | null;
   weightInKilograms: number | null;
   birthCity: string | null;
   birthStateProvince: string | null;
   birthCountry: string | null;
}

export interface PlayerSpotlight {
   playerId: number;
   name: LocalizedText;
   playerSlug: string;
   position: Position;
   sweaterNumber: number;
   teamId: number;
   headshot: string;
   teamTriCode: TeamAbbrev;
   teamLogo: string;
   sortId: number;
}

export interface PlayerLanding {
   playerId: number;
   isActive: boolean;
   firstName: LocalizedText;
   lastName: LocalizedText;
   badges: Badge[];
   sweaterNumber: number;
   position: Position;
   headshot: string;
   heroImage: string;
   heightInInches: number;
   heightInCentimeters: number;
   weightInPounds: number;
   weightInKilograms: number;
   birthDate: string;
   birthCity: LocalizedText;
   birthStateProvince?: LocalizedText;
   birthCountry: string;
   shootsCatches: Position;
   draftDetails?: DraftDetails;
   playerSlug: string;
   inTop100AllTime: number;
   inHHOF: number;
   featuredStats: FeaturedStats;
   careerTotals: CareerTotals;
   shopLink: '#TODO';
   twitterLink: '#TODO';
   watchLink: '#TODO';
   last5Games: Last5Game[];
   seasonTotals: SeasonTotal[];
   awards?: Award[];
   currentTeamId?: number;
   currentTeamAbbrev?: string;
   fullTeamName?: LocalizedText;
   teamCommonName?: LocalizedText;
   teamPlaceNameWithPreposition?: LocalizedText;
   teamLogo?: string;
   currentTeamRoster?: CurrentTeamRoster[];
}

interface Award {
   trophy: LocalizedText;
   // TODO: create types for each trophy - the seasons array has stats for each season the trophy was won
   seasons: { [key: string]: number }[];
}

interface Badge {
   logoUrl: LocalizedText;
   title: LocalizedText;
}

interface CareerTotals {
   regularSeason: CareerStats;
   playoffs: CareerStats;
}

interface CareerStats {
   assists?: number;
   gamesPlayed: number;
   gamesStarted?: number;
   goals?: number;
   goalsAgainst?: number;
   goalsAgainstAvg?: number;
   losses?: number;
   pim?: number;
   savePctg?: number;
   shotsAgainst?: number;
   shutouts?: number;
   timeOnIce?: string;
   wins?: number;
   gameWinningGoals?: number;
   otGoals?: number;
   points?: number;
   powerPlayGoals?: number;
   powerPlayPoints?: number;
   shorthandedGoals?: number;
   shorthandedPoints?: number;
   plusMinus?: number;
   shootingPctg?: number;
   shots?: number;
   ties?: number;
   otLosses?: number;
}

interface CurrentTeamRoster {
   playerId: number;
   lastName: LocalizedText;
   firstName: LocalizedText;
   playerSlug: string;
}

interface DraftDetails {
   year: number;
   teamAbbrev: string;
   round: number;
   pickInRound: number;
   overallPick: number;
}

interface FeaturedStats {
   season: number;
   regularSeason: FeaturedStatsType;
   playoffs?: FeaturedStatsType;
}

interface FeaturedStatsType {
   subSeason: CareerStats;
   career: CareerStats;
}

interface Last5Game {
   decision?: Decision;
   gameDate: string;
   gameId: number;
   gameTypeId: number;
   gamesStarted?: number;
   goalsAgainst?: number;
   homeRoadFlag: HomeRoadFlag;
   opponentAbbrev: string;
   penaltyMins?: number;
   savePctg?: number;
   shotsAgainst?: number;
   teamAbbrev: string;
   toi?: string;
   assists?: number;
   goals?: number;
   pim?: number;
   plusMinus?: number;
   points?: number;
   powerPlayGoals?: number;
   shorthandedGoals?: number;
   shots?: number;
   shifts?: number;
}

type Decision = 'L' | 'W' | 'T' | 'O';

type HomeRoadFlag = 'R' | 'H';

interface SeasonTotal {
   gameTypeId: number;
   gamesPlayed?: number;
   goalsAgainst?: number;
   goalsAgainstAvg?: number;
   leagueAbbrev: string;
   season: number;
   sequence: number;
   shutouts?: number;
   teamName: LocalizedText;
   timeOnIce?: string;
   losses?: number;
   ties?: number;
   wins?: number;
   teamCommonName?: LocalizedText;
   teamPlaceNameWithPreposition?: LocalizedText;
   assists?: number;
   gamesStarted?: number;
   goals?: number;
   pim?: number;
   savePctg?: number;
   shotsAgainst?: number;
   otLosses?: number;
   points?: number;
   gameWinningGoals?: number;
   otGoals?: number;
   powerPlayGoals?: number;
   powerPlayPoints?: number;
   shorthandedGoals?: number;
   shorthandedPoints?: number;
   plusMinus?: number;
   shootingPctg?: number;
   shots?: number;
   avgToi?: string;
   faceoffWinningPctg?: number;
}

export interface PlayerGameLog {
   seasonId: number;
   gameTypeId: number;
   playerStatsSeasons: PlayerStatsSeason[];
   gameLog?: GameLog[];
}

interface GameLog {
   gameId: number;
   teamAbbrev: TeamAbbrev;
   homeRoadFlag: HomeRoadFlag;
   gameDate: string;
   goals: number;
   assists: number;
   commonName: LocalizedText;
   opponentCommonName: LocalizedText;
   gamesStarted: number;
   decision: Decision;
   shotsAgainst: number;
   goalsAgainst: number;
   savePctg: number;
   shutouts: number;
   opponentAbbrev: string;
   pim: number;
   toi: string;
}

interface PlayerStatsSeason {
   season: number;
   gameTypes: (2 | 3)[];
}

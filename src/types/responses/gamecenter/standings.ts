import type { Default, DefaultWithTranslations } from './common.js';

export interface NHLStandings {
   wildCardIndicator: boolean;
   standings: TeamStanding[];
   standingsDateTimeUtc?: string;
}

interface TeamStanding {
   conferenceAbbrev?: ConferenceAbbrev;
   conferenceHomeSequence: number;
   conferenceL10Sequence: number;
   conferenceName?: ConferenceName;
   conferenceRoadSequence: number;
   conferenceSequence: number;
   date: string;
   divisionAbbrev?: DivisionAbbrev;
   divisionHomeSequence: number;
   divisionL10Sequence: number;
   divisionName?: DivisionName;
   divisionRoadSequence: number;
   divisionSequence: number;
   gameTypeId: number;
   gamesPlayed: number;
   goalDifferential: number;
   goalDifferentialPctg: number;
   goalAgainst: number;
   goalFor: number;
   goalsForPctg: number;
   homeGamesPlayed: number;
   homeGoalDifferential: number;
   homeGoalsAgainst: number;
   homeGoalsFor: number;
   homeLosses: number;
   homeOtLosses: number;
   homePoints: number;
   homeRegulationPlusOtWins: number;
   homeRegulationWins: number;
   homeTies: number;
   homeWins: number;
   l10GamesPlayed: number;
   l10GoalDifferential: number;
   l10GoalsAgainst: number;
   l10GoalsFor: number;
   l10Losses: number;
   l10OtLosses: number;
   l10Points: number;
   l10RegulationPlusOtWins: number;
   l10RegulationWins: number;
   l10Ties: number;
   l10Wins: number;
   leagueHomeSequence: number;
   leagueL10Sequence: number;
   leagueRoadSequence: number;
   leagueSequence: number;
   losses: number;
   otLosses: number;
   placeName: DefaultWithTranslations;
   pointPctg: number;
   points: number;
   regulationPlusOtWinPctg: number;
   regulationPlusOtWins: number;
   regulationWinPctg: number;
   regulationWins: number;
   roadGamesPlayed: number;
   roadGoalDifferential: number;
   roadGoalsAgainst: number;
   roadGoalsFor: number;
   roadLosses: number;
   roadOtLosses: number;
   roadPoints: number;
   roadRegulationPlusOtWins: number;
   roadRegulationWins: number;
   roadTies: number;
   roadWins: number;
   seasonId: number;
   shootoutLosses: number;
   shootoutWins: number;
   streakCode: StreakCode;
   streakCount: number;
   teamName: DefaultWithTranslations;
   teamCommonName: DefaultWithTranslations;
   teamAbbrev: Default;
   teamLogo: string;
   ties: number;
   waiversSequence: number;
   wildcardSequence: number;
   winPctg: number;
   wins: number;
   clinchIndicator?: ClinchIndicator;
}

type ClinchIndicator = 'y' | 'x' | 'z' | 'p';

type ConferenceAbbrev = 'E' | 'W' | 'XVW' | 'XVE' | '';

type ConferenceName =
   | 'Eastern'
   | 'Western'
   | 'Prince of Wales'
   | 'Clarence Campbell';

type DivisionAbbrev =
   | 'A'
   | 'C'
   | 'P'
   | 'M'
   | 'E'
   | 'W'
   | 'CEN'
   | 'ATL'
   | 'NE'
   | 'PAC'
   | 'NW'
   | 'SE'
   | 'ADM'
   | 'SMY'
   | 'PTK'
   | 'NRS'
   | 'EST'
   | 'WST'
   | 'NTH'
   | 'CDN'
   | 'AMR';

type DivisionName =
   | 'Atlantic'
   | 'Central'
   | 'Pacific'
   | 'Metropolitan'
   | 'East'
   | 'West'
   | 'Northeast'
   | 'Northwest'
   | 'Southeast'
   | 'Adams'
   | 'Smythe'
   | 'Patrick'
   | 'Norris'
   | 'Discover Central'
   | 'MassMutual East'
   | 'Honda West'
   | 'Scotia North'
   | 'Canadian'
   | 'American';

type StreakCode = 'W' | 'L' | 'OT' | 'T';

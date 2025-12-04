import type { TeamAbbrev } from '../../types.ts';
import type { LocalizedText, TvBroadcast } from './common.ts';

export interface PlayoffSeries {
   seasonId: number;
   currentRound: number;
   rounds: Round[];
}

interface Round {
   roundNumber: number;
   roundLabel: Label;
   roundAbbrev: RoundAbbrev;
   series: Series[];
}

type RoundAbbrev =
   | 'NHLF'
   | 'SCF'
   | 'SCSF'
   | 'NHLSF'
   | 'QF'
   | 'SF'
   | 'PRLM'
   | 'DSF'
   | 'DF'
   | 'CF'
   | 'CQF'
   | 'CSF'
   | 'F'
   | 'R1'
   | 'R2'
   | 'SCQ';

type Label =
   | 'nhl-final'
   | 'stanley-cup-final'
   | 'stanley-cup-semifinal'
   | 'nhl-semifinal'
   | 'quarterfinals'
   | 'semifinals'
   | 'preliminary-round'
   | 'division-semifinals'
   | 'division-finals'
   | 'conference-finals'
   | 'conference-quarterfinals'
   | 'conference-semifinals'
   | 'semifinal'
   | 'final'
   | '1st-round'
   | '2nd-round'
   | 'stanley-cup-qualifiers'
   | 'stanley-cup-semifinals'
   | 'quarterfinal';

interface Series {
   seriesLetter: SeriesLetter;
   roundNumber: number;
   seriesLabel: Label;
   seriesLink: string;
   bottomSeed: Seed;
   topSeed: Seed;
   neededToWin: number;
   winningTeamId?: number;
   losingTeamId?: number;
}

interface Seed {
   id: number;
   abbrev: string;
   wins: number;
   logo?: string;
   darkLogo?: string;
}

type SeriesLetter =
   | 'A'
   | 'B'
   | 'C'
   | 'D'
   | 'E'
   | 'F'
   | 'G'
   | 'H'
   | 'I'
   | 'J'
   | 'K'
   | 'L'
   | 'M'
   | 'N'
   | 'O'
   | 'S'
   | 'T'
   | 'U'
   | 'V'
   | 'W'
   | 'X'
   | 'Y'
   | 'Z';

export interface PlayoffBracket {
   bracketLogo: string;
   bracketLogoFr: string;
   series: BracketSeries[];
}

interface BracketSeries {
   seriesUrl: string;
   seriesTitle: SeriesTitle;
   seriesAbbrev: SeriesAbbrev;
   seriesLetter: SeriesLetter;
   playoffRound: number;
   topSeedRank: number;
   topSeedRankAbbrev: SeedRankAbbrev;
   topSeedWins: number;
   bottomSeedRank: number;
   bottomSeedRankAbbrev: SeedRankAbbrev;
   bottomSeedWins: number;
   winningTeamId: number;
   losingTeamId: number;
   topSeedTeam: SeedTeam;
   bottomSeedTeam: SeedTeam;
   seriesLogo?: string;
   seriesLogoFr?: string;
   conferenceAbbrev?: ConferenceAbbrev;
   conferenceName?: ConferenceName;
}

// type SeedRankAbbrev = 'WC1' | 'D3' | 'WC2' | 'D2' | 'D1';

interface SeedTeam {
   id: number;
   abbrev: TeamAbbrev;
   name: LocalizedText;
   commonName: LocalizedText;
   placeNameWithPreposition: LocalizedText;
   logo: string;
   darkLogo: string;
}

type ConferenceAbbrev = 'E' | 'W';

type ConferenceName = 'Western' | 'Eastern';

type SeriesAbbrev =
   | 'NHLF'
   | 'SCF'
   | 'SCSF'
   | 'NHLSF'
   | 'QF'
   | 'SF'
   | 'PRLM'
   | 'DSF'
   | 'DF'
   | 'CF'
   | 'WCF'
   | 'ECF'
   | 'CQF'
   | 'CSF'
   | 'R1'
   | 'R2'
   | 'SCQ';

type SeriesTitle =
   | 'NHL Final'
   | 'Stanley Cup Final'
   | 'Stanley Cup Semifinal'
   | 'NHL Semifinal'
   | 'Quarterfinals'
   | 'Semifinals'
   | 'Preliminary Round'
   | 'Division Semifinals'
   | 'Division Finals'
   | 'Conference Finals'
   | 'Western Conference Finals'
   | 'Eastern Conference Finals'
   | 'Conference Quarterfinals'
   | 'Conference Semifinals'
   | '1st Round'
   | '2nd Round'
   | 'Stanley Cup Qualifiers'
   | 'Stanley Cup Semifinals';

type SeedRankAbbrev =
   | 'C1'
   | 'C2'
   | 'C3'
   | 'C4'
   | 'C5'
   | 'C6'
   | 'C7'
   | 'C8'
   | 'C9'
   | 'C10'
   | 'C11'
   | 'C12'
   | 'D1'
   | 'D2'
   | 'D3'
   | 'D4'
   | 'L1'
   | 'L2'
   | 'L3'
   | 'L4'
   | 'L5'
   | 'L6'
   | 'L7'
   | 'L8'
   | 'L9'
   | 'L10'
   | 'L11'
   | 'L12'
   | 'L13'
   | 'L14'
   | 'L15'
   | 'L16'
   | 'WC1'
   | 'WC2'
   | 'PCHA1'
   | 'WCHL1';

export interface PlayoffSeriesSchedule {
   round: number;
   roundAbbrev: string;
   roundLabel: string;
   seriesLetter: string;
   seriesLogo: string;
   seriesLogoFr: string;
   neededToWin: number;
   length: number;
   bottomSeedTeam: ScheduleSeedTeam;
   topSeedTeam: ScheduleSeedTeam;
   games: Game[];
   fullCoverageUrl: FullCoverageURL;
}

interface ScheduleSeedTeam {
   id: number;
   /** Note: this is incorrectly named in the API, should be `commonName` */
   name: LocalizedText;
   abbrev: TeamAbbrev;
   placeName: LocalizedText;
   placeNameWithPreposition: LocalizedText;
   conference: Conference;
   record: string;
   seriesWins: number;
   divisionAbbrev: string;
   seed: number;
   logo: string;
   darkLogo: string;
}

interface Conference {
   name: string;
   abbrev: string;
}

type FullCoverageURL = Omit<LocalizedText, 'default'> & {
   en: LocalizedText['default'];
};

interface Game {
   id: number;
   season: number;
   gameType: number;
   gameNumber: number;
   ifNecessary: boolean;
   venue: LocalizedText;
   neutralSite: boolean;
   startTimeUTC: string;
   easternUTCOffset: string;
   venueUTCOffset: string;
   venueTimezone: string;
   gameState: string;
   gameScheduleState: string;
   tvBroadcasts: TvBroadcast[];
   awayTeam: Team;
   homeTeam: Team;
   gameCenterLink: string;
   periodDescriptor: PeriodDescriptor;
   seriesStatus: SeriesStatus;
   gameOutcome: GameOutcome;
}

interface Team {
   id: number;
   commonName: LocalizedText;
   placeName: LocalizedText;
   placeNameWithPreposition: LocalizedText;
   abbrev: TeamAbbrev;
   score: number;
}

interface GameOutcome {
   lastPeriodType: string;
}

interface PeriodDescriptor {
   number: number;
   periodType: string;
   maxRegulationPeriods: number;
}

interface SeriesStatus {
   topSeedWins: number;
   bottomSeedWins: number;
}

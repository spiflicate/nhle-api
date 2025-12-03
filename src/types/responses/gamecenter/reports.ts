import type {
   GameScheduleState,
   GameState,
   LocalizedText,
   PeriodType,
   UTCOffset,
} from './common.ts';

export interface GamecenterReports {
   seasonSeries: SeasonSeriesGame[];
   seasonSeriesWins: {
      awayTeamWins: number;
      homeTeamWins: number;
   };
   gameInfo: GameInfo;
   teamSeasonStats?: TeamSeasonStats;
   last10Record?: Last10Record;
   gameVideo?: GameVideo;
   linescore?: Linescore;
   shotsByPeriod?: ByPeriod[];
   teamGameStats?: TeamGameStat[];
   gameReports?: GameReports;
}

interface GameInfo {
   referees: LocalizedText[];
   linesmen: LocalizedText[];
   awayTeam: TeamInfo;
   homeTeam: TeamInfo;
}

interface TeamInfo {
   headCoach: LocalizedText;
   scratches: ScratchedPlayer[];
}

interface ScratchedPlayer {
   id: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
}

interface GameReports {
   gameSummary: string;
   eventSummary: string;
   playByPlay: string;
   faceoffSummary: string;
   faceoffComparison: string;
   rosters: string;
   shotSummary: string;
   shiftChart?: string;
   toiAway: string;
   toiHome: string;
   shootoutSummary?: string;
}

interface GameVideo {
   threeMinRecap: number;
   threeMinRecapFr: number;
   condensedGame: number;
   condensedGameFr: number;
}

interface Last10Record {
   contextLabel: 'last_10_games';
   contextSeason: number;
   awayTeam: Last10RecordAwayTeam;
   homeTeam: Last10RecordAwayTeam;
}

interface Last10RecordAwayTeam {
   record: string;
   streakType: StreakType;
   streak: number;
   pastGameResults: PastGameResult[];
}

interface PastGameResult {
   opponentAbbrev: string;
   gameResult: GameResult;
}

type GameResult = 'L' | 'OTW' | 'W' | 'OTL' | 'SOL' | 'SOW';

type StreakType = 'L' | 'O' | 'W';

interface Linescore {
   byPeriod: ByPeriod[];
   totals: Totals;
   shootout?: Shootout;
}

interface ByPeriod {
   periodDescriptor: PeriodDescriptor;
   away: number;
   home: number;
}

interface PeriodDescriptor {
   number: number;
   periodType: PeriodType;
   maxRegulationPeriods: number;
}

interface Shootout {
   awayDecidingGoal: number;
   awayConversions: number;
   awayAttempts: number;
   homeDecidingGoal: number;
   homeConversions: number;
   homeAttempts: number;
}

interface Totals {
   away: number;
   home: number;
}

interface SeasonSeriesGame {
   id: number;
   season: number;
   gameType: number;
   gameDate: string;
   startTimeUTC: string;
   easternUTCOffset: UTCOffset;
   venueUTCOffset: UTCOffset;
   gameState: GameState;
   gameScheduleState: GameScheduleState;
   awayTeam: TeamDetail;
   homeTeam: TeamDetail;
   periodDescriptor?: PeriodDescriptor;
   gameCenterLink: string;
   gameOutcome: GameOutcome;
   clock?: Clock;
}

interface TeamDetail {
   id: number;
   abbrev: string;
   logo: string;
   score?: number;
}

interface Clock {
   timeRemaining: string;
   secondsRemaining: number;
   running: boolean;
   inIntermission: boolean;
}

interface GameOutcome {
   lastPeriodType: PeriodType;
   otPeriods?: number;
}

interface TeamGameStat {
   category: Category;
   awayValue: number | string;
   homeValue: number | string;
}

type Category =
   | 'sog'
   | 'faceoffWinningPctg'
   | 'faceoffWins'
   | 'powerPlay'
   | 'powerPlayPctg'
   | 'pim'
   | 'hits'
   | 'blockedShots'
   | 'giveaways'
   | 'takeaways';

interface TeamSeasonStats {
   contextLabel: 'regular_season';
   contextSeason: number;
   awayTeam: TeamSeasonStatsDetail;
   homeTeam: TeamSeasonStatsDetail;
}

interface TeamSeasonStatsDetail {
   ppPctg: number;
   pkPctg: number;
   faceoffWinningPctg: number;
   goalsForPerGamePlayed: number;
   goalsAgainstPerGamePlayed: number;
   ppPctgRank: number;
   pkPctgRank: number;
   faceoffWinningPctgRank: number;
   goalsForPerGamePlayedRank: number;
   goalsAgainstPerGamePlayedRank: number;
}

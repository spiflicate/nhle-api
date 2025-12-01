import type { TeamAbbrev } from '#/types/types.ts';
import type {
   CountryCode,
   Default,
   GameScheduleState,
   GameState,
   Market,
   Position,
   UTCOffset,
} from './common.js';

export interface GamecenterBoxscore {
   id: number;
   season: number;
   gameType: number;
   limitedScoring: boolean;
   gameDate: string;
   venue: Default;
   venueLocation: Default;
   startTimeUTC: string;
   easternUTCOffset: UTCOffset;
   venueUTCOffset: UTCOffset;
   tvBroadcasts: TvBroadcast[];
   gameState: GameState;
   gameScheduleState: GameScheduleState;
   periodDescriptor?: PeriodDescriptor;
   regPeriods: number;
   awayTeam: Team;
   homeTeam: Team;
   clock: Clock;
   playerByGameStats?: PlayerByGameStats;
   summary?: Summary;
   gameOutcome?: GameOutcome;
   situation?: Situation;
}

interface Team {
   id: number;
   commonName: Default;
   abbrev: TeamAbbrev;
   score?: number;
   sog?: number;
   logo: string;
   darkLogo: string;
   placeName: Default;
   placeNameWithPreposition: Default;
   radioLink?: string;
}

interface Clock {
   timeRemaining: string;
   secondsRemaining: number;
   running: boolean;
   inIntermission: boolean;
}

interface GameOutcome {
   lastPeriodType: string;
   otPeriods?: number;
}

interface PeriodDescriptor {
   number: number;
   periodType: string;
   maxRegulationPeriods: number;
}

interface PlayerByGameStats {
   awayTeam: PlayerByGameStatsTeam;
   homeTeam: PlayerByGameStatsTeam;
}

interface PlayerByGameStatsTeam {
   forwards: Forward[];
   defense: Defense[];
   goalies: Goalie[];
}
interface BasePlayer {
   playerId: number;
   sweaterNumber: number;
   name: Default;
   position: Position;
}

interface Skater extends BasePlayer {
   position: Exclude<Position, 'G'>;
   goals: number;
   assists: number;
   points: number;
   plusMinus: number;
   pim: number;
   hits: number;
   powerPlayGoals: number;
   sog: number;
   faceoffWinningPctg: number;
   toi: string;
   blockedShots: number;
   shifts: number;
   giveaways: number;
   takeaways: number;
}

interface Forward extends Skater {
   position: Exclude<Position, 'D' | 'G'>;
}

interface Defense extends Skater {
   position: 'D';
}

interface Goalie extends BasePlayer {
   position: 'G';
   evenStrengthShotsAgainst: string;
   powerPlayShotsAgainst: string;
   shorthandedShotsAgainst: string;
   saveShotsAgainst: string;
   savePctg?: number;
   evenStrengthGoalsAgainst: number;
   powerPlayGoalsAgainst: number;
   shorthandedGoalsAgainst: number;
   pim?: number;
   goalsAgainst: number;
   toi: string;
   starter?: boolean;
   decision?: Decision;
   shotsAgainst: number;
   saves: number;
}

type Decision = 'W' | 'L' | 'O';

interface Situation {
   homeTeam: SituationDetails;
   awayTeam: SituationDetails;
   situationCode: string;
   timeRemaining: string;
   secondsRemaining: number;
}

interface SituationDetails {
   abbrev: string;
   situationDescriptions: string[];
   strength: number;
}

type Summary = Record<string, unknown>;

interface TvBroadcast {
   id: number;
   market: Market;
   countryCode: CountryCode;
   network: string;
   sequenceNumber: number;
}

import type { TeamAbbrev } from '../../types.ts';
import type {
   CountryCode,
   DefaultWithTranslations,
   Market,
   PositionCode,
} from './common.ts';

export interface DraftTracker {
   currentDraftDate: Date;
   broadcastStartTimeUTC: Date;
   tvBroadcasts: TvBroadcast[];
   logoUrl: string;
   logoFrUrl: string;
   uiAccentColor: HexColorCode;
   round: number;
   state: 'over' | string;
   picks: Pick[];
}

interface Pick {
   pickInRound: number;
   overallPick: number;
   teamId: number;
   teamAbbrev: TeamAbbrev;
   teamFullName: TeamName;
   teamCommonName: TeamName;
   teamPlaceNameWithPreposition: TeamName;
   teamLogoLight: string;
   teamLogoDark: string;
   state: 'confirmed' | string;
   lastName: Name;
   firstName: Name;
   positionCode: PositionCode;
}

type Name = DefaultWithTranslations;

type TeamName = DefaultWithTranslations;

type HexColorCode = `#${string}`;

interface TvBroadcast {
   id: number;
   market: Market;
   countryCode: CountryCode;
   network: string;
   sequenceNumber: number;
}

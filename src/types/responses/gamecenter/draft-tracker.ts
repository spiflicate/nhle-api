import type { TeamAbbrev } from '../../types.ts';
import type {
   CountryCode,
   Default,
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
   state: string;
   picks: Pick[];
}

interface Pick {
   pickInRound: number;
   overallPick: number;
   teamId: number;
   teamAbbrev: TeamAbbrev;
   teamFullName: Default;
   teamCommonName: Default;
   teamPlaceNameWithPreposition: Default;
   teamLogoLight: string;
   teamLogoDark: string;
   state: string;
   lastName: Default;
   firstName: Default;
   positionCode: PositionCode;
}

type HexColorCode = `#${string}`;

interface TvBroadcast {
   id: number;
   market: Market;
   countryCode: CountryCode;
   network: string;
   sequenceNumber: number;
}

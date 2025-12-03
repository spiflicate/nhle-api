import type { TeamAbbrev } from '../../types.ts';
import type {
   HexColorCode,
   LocalizedText,
   PositionCode,
   TvBroadcast,
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
   teamFullName: LocalizedText;
   teamCommonName: LocalizedText;
   teamPlaceNameWithPreposition: LocalizedText;
   teamLogoLight: string;
   teamLogoDark: string;
   state: string;
   lastName: LocalizedText;
   firstName: LocalizedText;
   positionCode: PositionCode;
}

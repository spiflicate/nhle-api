import type {
   DefendingSide,
   GameState,
   GoalModifier,
   LocalizedText,
   PeriodType,
   Strength,
} from './common.ts';

export interface PPTReplayGoal extends BasePPTReplay {
   goal: Goal;
}

// NOTE: As of now, the data for this endpoint appears to be incomplete and may not be in use by the NHL.
// The data structure contains only the base information about the game the event is associated with,
// without any specific details about the PPT events themselves.
export interface PPTReplayEvent extends BasePPTReplay {}

interface BasePPTReplay {
   id: number;
   gameDate: string;
   awayTeam: Team;
   homeTeam: Team;
   gameState: GameState;
   gameType: number;
}

interface Team {
   id: number;
   name: LocalizedText;
   abbrev: string;
   placeName: LocalizedText;
   placeNameWithPreposition: LocalizedText;
   logo: string;
   darkLogo: string;
}

interface Goal {
   periodDescriptor: PeriodDescriptor;
   situationCode: string;
   strength: Strength;
   playerId: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   name: LocalizedText;
   teamAbbrev: LocalizedText;
   headshot: string;
   logoUrl: string;
   goalsToDate: number;
   sweaterNumber: number;
   awayScore: number;
   homeScore: number;
   leadingTeamAbbrev?: LocalizedText;
   timeInPeriod: string;
   shotType: string;
   goalModifier: GoalModifier;
   assists: Player[];
   pptReplayUrl: string;
   homeTeamDefendingSide: DefendingSide;
   isHome: boolean;
   eventId: number;
   highlightClip?: number;
   highlightClipFr?: number;
   highlightClipSharingUrl?: string;
   highlightClipSharingUrlFr?: string;
}

interface Player {
   playerId: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   name: LocalizedText;
   assistsToDate: number;
   sweaterNumber: number;
}

interface PeriodDescriptor {
   number: number;
   periodType: PeriodType;
   maxRegulationPeriods: number;
}

/**
 * Puck and player positions around a goal, from the file each goal's
 * `pptReplayUrl` points at (wsr.nhle.com/sprites/...). About 120 to 140
 * frames, one every tenth of a second.
 */
export type PPTReplayFrames = PPTReplayFrame[];

export interface PPTReplayFrame {
   /** Tenths of a second since the Unix epoch (multiply by 100 for ms) */
   timeStamp: number;
   /**
    * Everything tracked in this frame, keyed by its `id`. Key `"1"` is
    * the puck; every other key is a player (goalies included).
    */
   onIce: Record<string, PPTReplayPlayer | PPTReplayPuck | PPTReplayNoPuck>;
}

/**
 * Coordinates are in rink units of 1/12 ft from one corner: `x` runs
 * 0 to 2400 along the 200 ft length and `y` 0 to 1020 across the 85 ft
 * width. Tracked objects can sit slightly outside that range.
 */
interface PPTReplayPosition {
   x: number;
   y: number;
}

export interface PPTReplayPlayer extends PPTReplayPosition {
   /** `teamId * 1000 + sweaterNumber`, the same as the `onIce` key */
   id: number;
   playerId: number;
   sweaterNumber: number;
   teamId: number;
   teamAbbrev: string;
}

/** The puck (key `"1"`). Player fields are empty strings. */
export interface PPTReplayPuck extends PPTReplayPosition {
   id: 1;
   playerId: '';
   sweaterNumber: '';
   teamId: '';
   teamAbbrev: '';
}

/** The puck entry is `{}` in frames where the puck wasn't tracked */
export type PPTReplayNoPuck = Record<string, never>;

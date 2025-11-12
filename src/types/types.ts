import type * as C from '#/constants/edge-adv.ts';
import type * as T from '#/utils/schemas.ts';

/**
 * Represents a valid NHL year (e.g., 2023, 2024, ...)
 */
export type Year = typeof T.Year.inferIn;
/**
 * Represents an NHL season in the format YYYYYYYY (e.g., 20232024)
 */
export type Season = typeof T.Season.inferIn;
/**
 * Represents a valid NHL game type (e.g. REG, PRE, POST)
 */
export type GameType = typeof T.GameType.inferIn;
/**
 * Represents an NHL game ID with regex /\d{10}/
 * Breakdown of the ID: (YYYYTTNNNN)
 * - First 4 digits: Year of the game (YYYY)
 * - Next 2 digits: Game type (TT)(01 for preseason, 02 for regular
 * season, 03 for playoffs)
 * - Next 4 digits: Game number of the season (NNNN)
 */
export type GameId = typeof T.GameId.inferIn;
/**
 * Represents a valid NHL team abbreviation (e.g., NYR, MTL, ...)
 */
export type TeamAbbrev = typeof T.TeamAbbrev.inferIn;
/**
 * Represents a valid NHL team ID
 */
export type TeamId = typeof T.TeamId.inferIn;
/**
 * Represents a valid NHL game number
 */
export type GameNumber = typeof T.GameNumber.inferIn;
/**
 * Represents a valid NHL game state
 */
export type GameState = typeof T.GameState.inferIn;
/**
 * Represents a valid draft round (1-7)
 */
export type DraftRound = typeof T.DraftRound.inferIn;
/**
 * Represents a valid NHL event ID
 */
export type EventId = typeof T.EventId.inferIn;
/**
 * Represents a valid NHL date in the format YYYY-MM-DD
 */
export type NHLDate = typeof T.NHLDate.inferIn;
/**
 * Represents a valid NHL month in the format YYYY-MM
 */
export type NHLMonth = typeof T.NHLMonth.inferIn;
/**
 * Represents a valid NHL series letter (A-O)
 */
export type SeriesLetter = typeof T.SeriesLetter.inferIn;
/**
 * Represents the playoff rounds in an NHL season (1-4)
 */
export type PlayoffRound = 1 | 2 | 3 | 4;
/**
 * Represents a valid country code (e.g., CAN, USA, SWE, ...)
 */
export type CountryCode = typeof T.CountryCode.inferIn;
/**
 * Represents a valid country code (e.g., CAN, USA, SWE, ...)
 */
export type PostalCode = typeof T.PostalCode.inferIn;

/**
 * Represents a valid NHL player ID
 */
export type PlayerId = typeof T.PlayerId.inferIn;

/**
 * Type definitions for enums from constants.ts
 */

/** Categories for shot location top-10 list */
export type ShotLocationCategory = keyof typeof C.ShotLocationCategoryEnum;
/** Sort options for shot location top-10 list */
export type ShotLocationSort = keyof typeof C.ShotLocationSortEnum;
/** Sort options for 5v5 save percentage top-10 list */
export type SavePercentage5v5Sort =
   keyof typeof C.SavePercentage5v5SortEnum;
/** Sort options for save percentage top-10 list */
export type SavePercentageSort = keyof typeof C.SavePercentageSortEnum;
/** Categories for save location top-10 list */
export type SaveLocationCategory = keyof typeof C.SaveLocationCategoryEnum;
/** Sort options for save location top-10 list */
export type SaveLocationSort = keyof typeof C.SaveLocationSortEnum;
/** Positions filter for player stats */
export type PositionFilter = keyof typeof C.PositionFilterEnum;
/** Strength situation for skater stats */
export type SkatersStrength = keyof typeof C.SkatersStrengthEnum;
/** Sort options for shot speed top-10 list */
export type ShotSpeedSort = keyof typeof C.ShotSpeedSortEnum;
/** Sort options for skating speed top-10 list */
export type SkatingSpeedSort = keyof typeof C.SkatingSpeedSortEnum;
/** Sort options for skating distance top-10 list */
export type SkatingDistanceSort = keyof typeof C.SkatingDistanceSortEnum;
/** Sort options for zone time top-10 lists. */
export type ZoneTimeSort = keyof typeof C.ZoneTimeSortEnum;

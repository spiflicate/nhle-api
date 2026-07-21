import { type } from 'arktype';
import { EDGE, NHL } from '#/constants/index.ts';
import { ValidationError } from '#/errors/index.ts';
import {
   getCurrentNHLDate,
   getNHLDate,
   getNHLMonth,
} from '#/utils/date.ts';

export function isParseError(value: unknown): value is type.errors {
   return value instanceof type.errors;
}

export function createValidationError(
   parsed: unknown,
   path: string,
): ValidationError | null {
   if (parsed instanceof type.errors) {
      return new ValidationError(parsed.summary, { endpoint: path });
   }
   return null;
}

export const Year = type(`${NHL.START_YEAR} <= number <= ${NHL.END_YEAR}`)
   .or(
      type('string.numeric.parse').narrow((v) => {
         return v >= NHL.START_YEAR && v <= NHL.END_YEAR;
      }),
   )
   .describe(`a valid year from ${NHL.START_YEAR} to ${NHL.END_YEAR}`);

export const NHLMonth = type('Date | string')
   .narrow((v) => {
      if (typeof v === 'string') {
         return /^\d{4}-\d{2}$/.test(v);
      } else if (v instanceof Date) {
         return true;
      }
      return false;
   })
   .pipe((v) => (typeof v === 'string' ? v : getNHLMonth(v)))
   .describe(
      'a valid month, either as a string (formatted as YYYY-MM) or a Date object',
   );

export const NHLDate = type('Date | string.date.iso')
   .pipe((v) =>
      typeof v === 'string'
         ? new Date(v).toISOString().slice(0, 10)
         : getNHLDate(v),
   )
   .describe(
      'a valid date, either as a string (ISO date string) or a Date object',
   );

export const Season = type('number.integer | string.numeric.parse')
   .narrow((v): v is number => {
      const yr = Math.trunc(v / 10000);
      return typeof Year(yr) === 'number' && yr + 1 === v % 10000;
   })
   .pipe((v) => v.toString())
   .describe(`a valid NHL season, e.g. ${NHL.CURRENT.SEASON}`);

export const TeamAbbrev = type
   .enumerated(
      ...(Object.keys(NHL.TeamsEnum) as (keyof typeof NHL.TeamsEnum)[]),
      ...(Object.keys(
         NHL.InactiveTeamsEnum,
      ) as (keyof typeof NHL.InactiveTeamsEnum)[]),
   )
   .describe('a valid NHL team abbreviation');

export const TeamId = type
   .enumerated(
      ...Object.values(NHL.TeamsEnum),
      ...Object.values(NHL.InactiveTeamsEnum),
   )
   .describe('a valid NHL team ID');

export const GameType = type
   .enumerated(
      ...(Object.keys(
         NHL.GameTypeEnum,
      ) as (keyof typeof NHL.GameTypeEnum)[]),
   )
   .pipe((v) => NHL.GameTypeEnum[v])
   .or(type('1|2|3|4|19'))
   .describe('a valid NHL game type (e.g., REG, PRE, POST)');

export const GameNumber = type('number')
   .atLeast(1)
   .atMost((82 * 32) / 2) // Max possible games in a season - need to bump to 84 per team in 2026-27
   .or(
      type('string.numeric.parse').narrow((v) => {
         return v >= 1 && v <= (82 * 32) / 2;
      }),
   )
   .pipe((v) => v.toString())
   .describe('a valid NHL game number between 1 and 1312');

export const DraftRound = type('1 <= number <= 7')
   .or(type(/^(1|2|3|4|5|6|7)$/))
   .pipe((v) => (typeof v === 'number' ? v.toString() : v))
   .describe('a valid NHL draft round (1-7)');

export const PlayoffRound = type('1 <= number <= 4')
   .or(type(/^(1|2|3|4)$/))
   .pipe((v) => (typeof v === 'number' ? v.toString() : v))
   .describe('a valid NHL playoff round (1-4)');

export const EventId = type('number.integer | string.numeric.parse')
   .narrow((v): v is number => Number.isInteger(v) && v > 0)
   .describe('a positive integer representing an NHL event ID');

export const GameTypeCode = type('1|2|3|4|19').describe(
   'a valid NHL game type code (1=PRE, 2=REG, 3=POST, 4=ASG, 19=INTL)',
);

const parseGameIdParts = type({
   year: Year,
   gameType: GameType,
   gameNumber: GameNumber,
});

export const GameId = type('number.integer | string.numeric.parse')
   .narrow((v) => {
      if (Number.isInteger(v) && v < 0) return false;
      const year = Math.trunc(v / 1e6); // remove last 6 digits
      const gameType = Math.trunc(v / 1e4) % 1e2; // remove last 4 digits, then get last 2 digits
      const gameNumber = v % 1e4; // get last 4 digits
      const valid = !(
         parseGameIdParts({ year, gameType, gameNumber }) instanceof
         type.errors
      );
      return valid;
   })
   .describe('a positive integer representing an NHL game ID');

export const SeriesLetter = type
   .enumerated(...Object.values(NHL.SeriesLetterEnum))
   .describe('a valid NHL playoff series letter (A-O)');

export const GameState = type
   .enumerated(...Object.values(NHL.GameStateEnum))
   .describe('a valid NHL game state');

export const CountryCode = type(/^[a-zA-Z]{2}$/)
   .pipe((v) => v.toLowerCase())
   .describe('a valid ISO 3166-1 alpha-2 country code, e.g. US, CA, RU');

export const PostalCode = type(/^[a-zA-Z]\d[a-zA-Z][ -]?\d[a-zA-Z]\d$/)
   .or(type(/^\d{5}$/))
   .describe(
      'a valid postal code, either US ZIP code (5 digit) or Canadian postal code (A1A 1A1 format; space required)',
   );

export const PlayerId = type('number')
   .atLeast(NHL.PLAYER_ID_RANGE.MIN)
   .atMost(NHL.PLAYER_ID_RANGE.MAX)
   .or(
      type('string.numeric.parse').narrow((v) => {
         return (
            v >= NHL.PLAYER_ID_RANGE.MIN && v <= NHL.PLAYER_ID_RANGE.MAX
         );
      }),
   )
   .pipe((v) => v.toString())
   .describe('a valid NHL player ID');

export const SaveLocationCategory = type
   .enumerated(
      ...(Object.keys(
         EDGE.SaveLocationCategoryEnum,
      ) as (keyof typeof EDGE.SaveLocationCategoryEnum)[]),
   )
   .pipe((v) => EDGE.SaveLocationCategoryEnum[v]);

export const ShotLocationSort = type
   .enumerated(
      ...(Object.keys(
         EDGE.ShotLocationSortEnum,
      ) as (keyof typeof EDGE.ShotLocationSortEnum)[]),
   )
   .pipe((v) => EDGE.ShotLocationSortEnum[v]);

export const SaveLocationSort = type
   .enumerated(
      ...(Object.keys(
         EDGE.SaveLocationSortEnum,
      ) as (keyof typeof EDGE.SaveLocationSortEnum)[]),
   )
   .pipe((v) => EDGE.SaveLocationSortEnum[v]);

export const SavePercentage5v5Sort = type
   .enumerated(
      ...(Object.keys(
         EDGE.SavePercentage5v5SortEnum,
      ) as (keyof typeof EDGE.SavePercentage5v5SortEnum)[]),
   )
   .pipe((v) => EDGE.SavePercentage5v5SortEnum[v]);

export const SavePercentageSort = type
   .enumerated(
      ...(Object.keys(
         EDGE.SavePercentageSortEnum,
      ) as (keyof typeof EDGE.SavePercentageSortEnum)[]),
   )
   .pipe((v) => EDGE.SavePercentageSortEnum[v]);

export const PositionFilter = type
   .enumerated(
      ...(Object.keys(
         EDGE.PositionFilterEnum,
      ) as (keyof typeof EDGE.PositionFilterEnum)[]),
   )
   .pipe((v) => EDGE.PositionFilterEnum[v]);

export const SkatersStrength = type
   .enumerated(
      ...(Object.keys(
         EDGE.SkatersStrengthEnum,
      ) as (keyof typeof EDGE.SkatersStrengthEnum)[]),
   )
   .pipe((v) => EDGE.SkatersStrengthEnum[v]);

export const ShotSpeedSort = type
   .enumerated(
      ...(Object.keys(
         EDGE.ShotSpeedSortEnum,
      ) as (keyof typeof EDGE.ShotSpeedSortEnum)[]),
   )
   .pipe((v) => EDGE.ShotSpeedSortEnum[v]);

export const SkatingSpeedSort = type
   .enumerated(
      ...(Object.keys(
         EDGE.SkatingSpeedSortEnum,
      ) as (keyof typeof EDGE.SkatingSpeedSortEnum)[]),
   )
   .pipe((v) => EDGE.SkatingSpeedSortEnum[v]);

export const SkatingDistanceSort = type.enumerated(
   ...(Object.keys(
      EDGE.SkatingDistanceSortEnum,
   ) as (keyof typeof EDGE.SkatingDistanceSortEnum)[]),
);
// .pipe((v) => C.SkatingDistanceSortEnum[v]);

export const ShotLocationCategory = type
   .enumerated(
      ...(Object.keys(
         EDGE.ShotLocationCategoryEnum,
      ) as (keyof typeof EDGE.ShotLocationCategoryEnum)[]),
   )
   .pipe((v) => EDGE.ShotLocationCategoryEnum[v]);

export const ZoneTimeSort = type
   .enumerated(
      ...(Object.keys(
         EDGE.ZoneTimeSortEnum,
      ) as (keyof typeof EDGE.ZoneTimeSortEnum)[]),
   )
   .pipe((v) => EDGE.ZoneTimeSortEnum[v]);

/** utility types */

export const BaseParams = type({
   season: Season.or('undefined').pipe((v) => v ?? NHL.CURRENT.SEASON),
   gameType: GameType.or('undefined').pipe(
      (v) => v ?? NHL.GameTypeEnum.REG,
   ),
});

export const PlayerParams = BaseParams.merge({
   playerId: PlayerId,
   season: Season,
});

export const TeamParams = BaseParams.merge({
   teamId: TeamId,
});

export const top10Params = BaseParams.merge({
   position: PositionFilter.default('ALL'),
   strength: SkatersStrength.default('ALL'),
});

export const DraftParams = type({
   year: Year.or('undefined').pipe((v) => v ?? NHL.CURRENT.YEAR),
   round: DraftRound.or('undefined').optional(),
});

export const GameIdAndEventId = type({
   gameId: GameId,
   eventId: EventId,
});

export const TeamAndSeasonParams = type({
   team: TeamAbbrev,
   season: Season.or('undefined').pipe((v) => v ?? NHL.CURRENT.SEASON),
});

export const SeriesAndSeasonParams = type({
   seriesLetter: SeriesLetter,
   season: Season.or('undefined').pipe((v) => v ?? NHL.CURRENT.SEASON),
});

export const SeriesParams = type({
   seriesLetter: SeriesLetter,
   year: Year.or('undefined').pipe((v) => v ?? NHL.CURRENT.YEAR),
});

export const ScheduleParams = type({
   team: TeamAbbrev,
   date: NHLDate.or('undefined').pipe((v) => v ?? getCurrentNHLDate()),
   month: NHLMonth.or('undefined').pipe(
      (v) => v ?? getCurrentNHLDate().slice(0, 7),
   ),
});

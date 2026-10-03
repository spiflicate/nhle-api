import type { TeamAbbrev } from '#/types/types.ts';
import type { LocalizedText, PositionCode } from './common.ts';

/** Categories `skater-stats-leaders` accepts. Anything else is a 400. */
export type SkaterLeaderCategory = keyof SkaterStatsLeaders;

/** Categories `goalie-stats-leaders` accepts. Anything else is a 400. */
export type GoalieLeaderCategory = keyof GoalieStatsLeaders;

export interface SkaterStatsLeaders {
   goalsSh: SkaterLeader[];
   plusMinus: SkaterLeader[];
   assists: SkaterLeader[];
   goalsPp: SkaterLeader[];
   faceoffLeaders: SkaterLeader[];
   penaltyMins: SkaterLeader[];
   goals: SkaterLeader[];
   points: SkaterLeader[];
   toi: SkaterLeader[];
}

interface SkaterLeader {
   id: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   sweaterNumber: number;
   headshot: string;
   teamAbbrev: TeamAbbrev;
   teamName: LocalizedText;
   teamLogo: string;
   position: PositionCode;
   value: number;
}

export interface GoalieStatsLeaders {
   wins: GoalieLeader[];
   shutouts: GoalieLeader[];
   savePctg: GoalieLeader[];
   goalsAgainstAverage: GoalieLeader[];
}

interface GoalieLeader {
   id: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   sweaterNumber: number;
   headshot: string;
   teamAbbrev: TeamAbbrev;
   teamName: LocalizedText;
   teamLogo: string;
   position: 'G';
   value: number;
}

/** Query options for the stats leaders endpoints */
export interface StatsLeadersOptions<C extends string> {
   /** Only return these categories. Defaults to all of them. */
   categories?: readonly C[];
   /** Players per category. Defaults to 5; -1 returns every player. */
   limit?: number;
}

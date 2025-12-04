import type { TeamAbbrev } from '#/types/types.ts';
import type { LocalizedText, PositionCode } from './common.ts';

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

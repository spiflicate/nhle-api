import type { Default } from './common.ts';

export interface PlayoffSeriesMeta {
   seriesTitle: string;
   teams: Teams;
}

interface Teams {
   topSeed: Seed;
   bottomSeed: Seed;
}

interface Seed {
   name: Default;
   commonName: Default;
   tricode: string;
   teamSlug: string;
}

export interface GameMeta {
   teams: Team[];
   seasonStates: SeasonStates;
   gameState: string;
}

interface SeasonStates {
   date: string;
   gameType: number;
   season: number;
}

interface Team {
   name: Default;
   tricode: string;
   teamId: number;
   teamSlug: string;
}

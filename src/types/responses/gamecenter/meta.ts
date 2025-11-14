import type { DefaultWithTranslations } from './common.ts';

export interface PlayoffSeriesMeta {
   seriesTitle: string;
   teams: Teams;
}

interface Teams {
   topSeed: Seed;
   bottomSeed: Seed;
}

interface Seed {
   name: DefaultWithTranslations;
   commonName: DefaultWithTranslations;
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
   name: DefaultWithTranslations;
   tricode: string;
   teamId: number;
   teamSlug: string;
}

import type { Season } from '../../types.ts';
import type { LocalizedText } from './common.ts';

export type NHLSeasons = Array<Season>;

export interface PlayoffSeriesMeta {
   seriesTitle: string;
   teams: Teams;
}

interface Teams {
   topSeed: Seed;
   bottomSeed: Seed;
}

interface Seed {
   name: LocalizedText;
   commonName: LocalizedText;
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
   name: LocalizedText;
   tricode: string;
   teamId: number;
   teamSlug: string;
}

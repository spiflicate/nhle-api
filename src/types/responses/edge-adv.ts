/**
 * Response types for the NHL Edge advanced stats endpoints
 * (api-web.nhle.com/v1/edge/*), exposed as the `adv` namespace.
 *
 * Generated from live responses for two seasons (regular season and
 * playoffs) and kept in step by the API drift check.
 */
import type { LocalizedText } from './gamecenter/common.ts';

/** A measurement in both unit systems (mph/km/h, feet/metres or miles/km) */
export interface EdgeMeasurement {
   imperial: number;
   metric: number;
}

/** A season with Edge data and the game types it covers */
export interface EdgeSeason {
   id: number;
   gameTypes: number[];
}

/** The game a stat was recorded in, shown as an overlay on nhl.com/edge */
export interface EdgeOverlay {
   player?: {
      firstName: LocalizedText;
      lastName: LocalizedText;
   };
   gameDate: string;
   awayTeam: {
      abbrev: string;
      score: number;
   };
   homeTeam: {
      abbrev: string;
      score: number;
   };
   gameOutcome: {
      lastPeriodType: string;
      otPeriods?: number;
   };
   periodDescriptor: EdgePeriodDescriptor;
   timeInPeriod?: string;
   gameType: number;
}

/** Period of a game event */
export interface EdgePeriodDescriptor {
   maxRegulationPeriods: number;
   number: number;
   periodType: string;
}

/** Team logo URLs for light and dark backgrounds */
export interface EdgeTeamLogos {
   light: string;
   dark: string;
}

/**
 * A team as Edge responses nest it. Detail and landing endpoints add
 * the optional fields; game rows carry only names, abbrev and logos.
 */
export interface EdgeTeam {
   commonName: LocalizedText;
   placeNameWithPreposition: LocalizedText;
   abbrev?: string;
   teamLogo: EdgeTeamLogos;
   id?: number;
   slug?: string;
   conference?: string;
   division?: string;
   wins?: number;
   losses?: number;
   otLosses?: number;
   gamesPlayed?: number;
   points?: number;
}

/**
 * A player as Edge responses nest it. Detail endpoints add season totals
 * (skater or goalie); top-10 rows carry only names, slug and team.
 */
export interface EdgePlayer {
   birthDate?: string;
   id?: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   sweaterNumber?: number;
   position?: string;
   slug: string;
   headshot?: string;
   shootsCatches?: string;
   team?: EdgeTeam;
   goals?: number;
   assists?: number;
   points?: number;
   gamesPlayed?: number;
   wins?: number;
   losses?: number;
   overtimeLosses?: number;
   goalsAgainstAvg?: number;
   savePctg?: number;
}

/** Response of `adv.byTheNumbers` */
export interface EdgeByTheNumbers {
   games: number;
   gameDate: string;
   hardestShotSkater: {
      player: EdgePlayer;
      overlay: EdgeOverlay;
      shotSpeed: EdgeMeasurement;
   };
   maxSkatingSpeedSkater: {
      player: EdgePlayer;
      overlay: EdgeOverlay;
      skatingSpeed: EdgeMeasurement;
   };
   totalDistanceSkatedSkater: {
      player: EdgePlayer;
      distanceSkated: {
         imperial: number;
         metric: number;
         overlay: EdgeOverlay;
      };
   };
   totalDistanceSkatedTeam: {
      team: EdgeTeam;
      game: {
         gameCenterLink: string;
         gameDate: string;
         isHomeTeam: boolean;
         homeTeam: EdgeTeam;
         awayTeam: EdgeTeam;
         distanceSkated: EdgeMeasurement;
      };
      topFiveSkaters: {
         gameCenterLink: string;
         gameDate: string;
         playerOnHomeTeam: boolean;
         distanceSkated: EdgeMeasurement;
         toi: number;
         homeTeam: {
            id: number;
            commonName: LocalizedText;
            placeNameWithPreposition: LocalizedText;
            abbrev: string;
            slug: string;
            teamLogo: EdgeTeamLogos;
            conference: string;
            division: string;
         };
         awayTeam: {
            id: number;
            commonName: LocalizedText;
            placeNameWithPreposition: LocalizedText;
            abbrev: string;
            slug: string;
            teamLogo: EdgeTeamLogos;
            conference: string;
            division: string;
         };
         player: {
            name: LocalizedText;
         };
      }[];
   };
   totalDistanceSkatedLeague: {
      distanceSkated: EdgeMeasurement;
      topFiveSkaters: {
         gameCenterLink: string;
         gameDate: string;
         playerOnHomeTeam: boolean;
         distanceSkated: EdgeMeasurement;
         toi: number;
         homeTeam: {
            id: number;
            commonName: LocalizedText;
            placeNameWithPreposition: LocalizedText;
            abbrev: string;
            slug: string;
            teamLogo: EdgeTeamLogos;
            conference: string;
            division: string;
         };
         awayTeam: {
            id: number;
            commonName: LocalizedText;
            placeNameWithPreposition: LocalizedText;
            abbrev: string;
            slug: string;
            teamLogo: EdgeTeamLogos;
            conference: string;
            division: string;
         };
         player: {
            name: LocalizedText;
         };
      }[];
   };
   sogTeam: {
      team: EdgeTeam;
      shots: number;
      sogDetails: {
         area: string;
         shots: number;
      }[];
   };
}

/** Response of `adv.skaters.detail` */
export interface EdgeSkaterDetail {
   player: EdgePlayer;
   seasonsWithEdgeStats: EdgeSeason[];
   topShotSpeed: {
      imperial: number;
      metric: number;
      percentile: number;
      leagueAvg: EdgeMeasurement;
      overlay: EdgeOverlay;
   };
   skatingSpeed: {
      speedMax: {
         imperial: number;
         metric: number;
         percentile: number;
         leagueAvg: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
      burstsOver20: {
         value: number;
         percentile: number;
         leagueAvg: {
            value: number;
         };
      };
   };
   totalDistanceSkated: {
      imperial: number;
      metric: number;
      percentile: number;
      leagueAvg: EdgeMeasurement;
   };
   distanceMaxGame: {
      imperial: number;
      metric: number;
      percentile: number;
      leagueAvg: EdgeMeasurement;
      overlay: EdgeOverlay;
   };
   sogSummary: {
      locationCode: string;
      shots: number;
      shotsPercentile: number;
      shotsLeagueAvg: number;
      goals: number;
      goalsPercentile: number;
      goalsLeagueAvg: number;
      shootingPctg: number;
      shootingPctgPercentile: number;
      shootingPctgLeagueAvg: number;
   }[];
   sogDetails: {
      area: string;
      shots: number;
      shotsPercentile: number;
   }[];
   zoneTimeDetails: {
      offensiveZonePctg: number;
      offensiveZonePercentile: number;
      offensiveZoneLeagueAvg: number;
      offensiveZoneEvPctg: number;
      offensiveZoneEvPercentile: number;
      offensiveZoneEvLeagueAvg: number;
      neutralZonePctg: number;
      neutralZonePercentile: number;
      neutralZoneLeagueAvg: number;
      defensiveZonePctg: number;
      defensiveZonePercentile: number;
      defensiveZoneLeagueAvg: number;
   };
}

/** Response of `adv.skaters.comparison` */
export interface EdgeSkaterComparison {
   player: EdgePlayer;
   seasonsWithEdgeStats: EdgeSeason[];
   shotSpeedDetails: {
      topShotSpeed: {
         imperial: number;
         metric: number;
         overlay: EdgeOverlay;
      };
      avgShotSpeed: EdgeMeasurement;
      shotAttemptsOver100: number;
      shotAttempts90To100: number;
      shotAttempts80To90: number;
      shotAttempts70To80: number;
   };
   skatingSpeedDetails: {
      maxSkatingSpeed: {
         imperial: number;
         metric: number;
         overlay: EdgeOverlay;
      };
      burstsOver22: number;
      bursts20To22: number;
      bursts18To20: number;
   };
   skatingDistanceLast10: {
      gameCenterLink: string;
      gameDate: string;
      playerOnHomeTeam: boolean;
      distanceSkated: EdgeMeasurement;
      toi: number;
      homeTeam: EdgeTeam;
      awayTeam: EdgeTeam;
   }[];
   skatingDistanceDetails: {
      distanceTotal: EdgeMeasurement;
      distancePer60: EdgeMeasurement;
      distanceMaxGame: {
         imperial: number;
         metric: number;
         overlay: EdgeOverlay;
      };
      distanceMaxPeriod: {
         imperial: number;
         metric: number;
         overlay: EdgeOverlay;
      };
   };
   shotLocationDetails: {
      area: string;
      sog: number;
      goals: number;
      shootingPctg: number;
   }[];
   shotLocationTotals: {
      locationCode: string;
      sog: number;
      goals: number;
      shootingPctg: number;
   }[];
   zoneTimeDetails: {
      offensiveZonePctg: number;
      offensiveZoneLeagueAvg: number;
      neutralZonePctg: number;
      neutralZoneLeagueAvg: number;
      defensiveZonePctg: number;
      defensiveZoneLeagueAvg: number;
   };
   zoneStarts: {
      offensiveZoneStarts: number;
      neutralZoneStarts: number;
      defensiveZoneStarts: number;
   };
}

/** Response of `adv.skaters.leaders` */
export interface EdgeSkaterLanding {
   seasonsWithEdgeStats: EdgeSeason[];
   leaders: {
      hardestShot: {
         player: EdgePlayer;
         overlay: EdgeOverlay;
         shotSpeed: EdgeMeasurement;
      };
      maxSkatingSpeed: {
         player: EdgePlayer;
         overlay: EdgeOverlay;
         skatingSpeed: EdgeMeasurement;
      };
      totalDistanceSkated: {
         player: EdgePlayer;
         distanceSkated: EdgeMeasurement;
      };
      distanceMaxGame: {
         player: EdgePlayer;
         distanceSkated: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
      highDangerSOG: {
         player: EdgePlayer;
         sog: number;
         shotLocationDetails: {
            area: string;
            sog: number;
            sogPercentile: number;
         }[];
      };
      offensiveZoneTime: {
         player: EdgePlayer;
         zoneTime: number;
      };
      defensiveZoneTime: {
         player: EdgePlayer;
         zoneTime: number;
      };
   };
}

/** Response of `adv.skaters.shotLocation` */
export interface EdgeSkaterShotLocation {
   shotLocationDetails: {
      area: string;
      sog: number;
      goals: number;
      shootingPctg: number | null;
      sogPercentile: number;
      goalsPercentile: number;
      shootingPctgPercentile: number | null;
   }[];
   shotLocationTotals: {
      locationCode: string;
      sog: number;
      goals: number;
      shootingPctg: number;
      sogPercentile: number;
      goalsPercentile: number;
      shootingPctgPercentile: number;
      sogLeagueAvg: number;
      goalsLeagueAvg: number;
      shootingPctgLeagueAvg: number;
   }[];
}

/** Response of `adv.skaters.shotSpeed` */
export interface EdgeSkaterShotSpeed {
   hardestShots: {
      gameCenterLink: string;
      gameDate: string;
      gameType: number;
      playerOnHomeTeam: boolean;
      shotSpeed: EdgeMeasurement;
      timeInPeriod: string;
      periodDescriptor: EdgePeriodDescriptor;
      homeTeam: EdgeTeam;
      awayTeam: EdgeTeam;
   }[];
   shotSpeedDetails: {
      topShotSpeed: {
         imperial: number;
         metric: number;
         percentile: number;
         leagueAvg: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
      avgShotSpeed: {
         imperial: number;
         metric: number;
         percentile: number;
         leagueAvg: EdgeMeasurement;
      };
      shotAttemptsOver100: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
      shotAttempts90To100: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
      shotAttempts80To90: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
      shotAttempts70To80: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
   };
}

/** Response of `adv.skaters.skatingDistance` */
export interface EdgeSkaterSkatingDistance {
   skatingDistanceLast10: {
      gameCenterLink: string;
      gameDate: string;
      playerOnHomeTeam: boolean;
      distanceSkatedAll: EdgeMeasurement;
      toiAll: number;
      distanceSkatedEven: EdgeMeasurement;
      toiEven: number;
      distanceSkatedPP: EdgeMeasurement;
      toiPP: number;
      homeTeam: EdgeTeam;
      awayTeam: EdgeTeam;
      distanceSkatedPK?: EdgeMeasurement;
      toiPK?: number;
   }[];
   skatingDistanceDetails: {
      strengthCode: string;
      distanceTotal: {
         imperial: number;
         metric: number;
         percentile: number;
         leagueAvg: EdgeMeasurement;
      };
      distancePer60: {
         imperial: number;
         metric: number;
         percentile: number;
         leagueAvg: EdgeMeasurement;
      };
      distanceMaxGame: {
         imperial: number;
         metric: number;
         percentile: number;
         leagueAvg: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
      distanceMaxPeriod: {
         imperial: number;
         metric: number;
         percentile: number;
         leagueAvg: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
   }[];
}

/** Response of `adv.skaters.skatingSpeed` */
export interface EdgeSkaterSkatingSpeed {
   topSkatingSpeeds: {
      gameCenterLink: string;
      gameDate: string;
      gameType: number;
      playerOnHomeTeam: boolean;
      skatingSpeed: EdgeMeasurement;
      timeInPeriod: string;
      periodDescriptor: EdgePeriodDescriptor;
      homeTeam: EdgeTeam;
      awayTeam: EdgeTeam;
   }[];
   skatingSpeedDetails: {
      maxSkatingSpeed: {
         imperial: number;
         metric: number;
         percentile: number;
         leagueAvg: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
      burstsOver22: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
      bursts20To22: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
      bursts18To20: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
   };
}

/** Response of `adv.skaters.zoneTime` */
export interface EdgeSkaterZoneTime {
   zoneTimeDetails: {
      strengthCode: string;
      offensiveZonePctg: number;
      offensiveZonePercentile: number;
      offensiveZoneLeagueAvg: number;
      neutralZonePctg: number;
      neutralZonePercentile: number;
      neutralZoneLeagueAvg: number;
      defensiveZonePctg: number;
      defensiveZonePercentile: number;
      defensiveZoneLeagueAvg: number;
   }[];
   zoneStarts: {
      offensiveZoneStartsPctg: number;
      offensiveZoneStartsPctgPercentile: number;
      neutralZoneStartsPctg: number;
      neutralZoneStartsPctgPercentile: number;
      defensiveZoneStartsPctg: number;
      defensiveZoneStartsPctgPercentile: number;
   };
}

/** One row of `adv.skaters.top10.distance` */
export interface EdgeSkaterDistanceTop10Entry {
   player: EdgePlayer;
   distanceTotal: EdgeMeasurement;
   distancePer60: EdgeMeasurement;
   distanceMaxPerGame: {
      imperial: number;
      metric: number;
      overlay: EdgeOverlay;
   };
   distanceMaxPerPeriod: {
      imperial: number;
      metric: number;
      overlay: EdgeOverlay;
   };
}

/** Response of `adv.skaters.top10.distance` */
export type EdgeSkaterDistanceTop10 = EdgeSkaterDistanceTop10Entry[];

/** One row of `adv.skaters.top10.shotLocation` */
export interface EdgeSkaterShotLocationTop10Entry {
   player: EdgePlayer;
   all: number;
   highDanger: number;
   midRange: number;
   longRange: number;
}

/** Response of `adv.skaters.top10.shotLocation` */
export type EdgeSkaterShotLocationTop10 =
   EdgeSkaterShotLocationTop10Entry[];

/** One row of `adv.skaters.top10.shotSpeed` */
export interface EdgeSkaterShotSpeedTop10Entry {
   player: EdgePlayer;
   hardestShot: {
      imperial: number;
      metric: number;
      overlay: EdgeOverlay;
   };
   shotAttemptsOver100: number;
   shotAttempts90To100: number;
   shotAttempts80To90: number;
   shotAttempts70To80: number;
}

/** Response of `adv.skaters.top10.shotSpeed` */
export type EdgeSkaterShotSpeedTop10 = EdgeSkaterShotSpeedTop10Entry[];

/** One row of `adv.skaters.top10.speed` */
export interface EdgeSkaterSpeedTop10Entry {
   player: EdgePlayer;
   maxSpeed: {
      imperial: number;
      metric: number;
      overlay: EdgeOverlay;
   };
   burstsOver22: number;
   bursts20To22: number;
   bursts18To20: number;
}

/** Response of `adv.skaters.top10.speed` */
export type EdgeSkaterSpeedTop10 = EdgeSkaterSpeedTop10Entry[];

/** One row of `adv.skaters.top10.zoneTime` */
export interface EdgeSkaterZoneTimeTop10Entry {
   player: EdgePlayer;
   offensiveZoneTime: number;
   neutralZoneTime: number;
   defensiveZoneTime: number;
}

/** Response of `adv.skaters.top10.zoneTime` */
export type EdgeSkaterZoneTimeTop10 = EdgeSkaterZoneTimeTop10Entry[];

/** Response of `adv.goalies.player` */
export interface EdgeGoalieDetail {
   player: EdgePlayer;
   seasonsWithEdgeStats: EdgeSeason[];
   stats: {
      goalsAgainstAvg: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
      gamesAbove900: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
      goalDifferentialPer60: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
      goalSupportAvg: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
      pointPctg: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
   };
   shotLocationSummary: {
      locationCode: string;
      goalsAgainst: number;
      goalsAgainstPercentile: number;
      goalsAgainstLeagueAvg: number;
      saves: number;
      savesPercentile: number;
      savesLeagueAvg: number;
      savePctg: number;
      savePctgPercentile: number;
      savePctgLeagueAvg: number;
   }[];
   shotLocationDetails: {
      area: string;
      saves: number;
      savesPercentile: number;
      savePctg: number;
      savePctgPercentile: number;
   }[];
}

/** Response of `adv.goalies.compare` */
export interface EdgeGoalieComparison {
   player: EdgePlayer;
   seasonsWithEdgeStats: EdgeSeason[];
   shotLocationSummary: {
      locationCode: string;
      shotsAgainst: number;
      goalsAgainst: number;
      saves: number;
      savePctg: number;
   }[];
   shotLocationDetails: {
      area: string;
      goalsAgainst: number;
      shotsAgainst: number;
      saves: number;
      savePctg: number;
   }[];
   savePctg5v5Last10: unknown[]; // empty in every sample seen
   savePctg5v5Details: {
      savePctg: number;
      savePctgClose: number;
      shots: number;
      shotsPer60: number;
   };
   savePctgLast10: unknown[]; // empty in every sample seen
   savePctgDetails: {
      gamesAbove900: number;
      pctgGamesAbove900: number;
      pointPctg: number;
      goalsAgainstAvg: number;
      savePctg: number;
   };
}

/** Response of `adv.goalies.leaders` */
export interface EdgeGoalieLanding {
   seasonsWithEdgeStats: EdgeSeason[];
   minimumGamesPlayed?: number;
   leaders: {
      highDangerSavePctg: {
         player: EdgePlayer;
         savePctg: number;
         shotLocationDetails: {
            area: string;
            savePctg: number;
            savePctgPercentile: number;
         }[];
      };
      highDangerSaves: {
         player: EdgePlayer;
         saves: number;
         shotLocationDetails: {
            area: string;
            saves: number;
            savesPercentile: number;
         }[];
      };
      highDangerGoalsAgainst: {
         player: EdgePlayer;
         goalsAgainst: number;
      };
      savePctg5v5: {
         player: EdgePlayer;
         savePctg: number;
      };
      gamesAbove900: {
         player: EdgePlayer;
         games: number;
      };
   };
   minimumMinutesPlayed?: number;
}

/** Response of `adv.goalies.savePercentage` */
export interface EdgeGoalieSavePercentage {
   savePctgLast10: {
      gameCenterLink: string;
      savePctg: number;
      gameDate: string;
      decision: string;
      playerOnHomeTeam: boolean;
      homeTeam: EdgeTeam;
      awayTeam: EdgeTeam;
   }[];
   savePctgDetails: {
      gamesAbove900: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
      pctgGamesAbove900: {
         value: number;
         percentile: number;
         leagueAvg: number;
      };
   };
}

/** Response of `adv.goalies.savePercentage5v5` */
export interface EdgeGoalieSavePercentage5v5 {
   savePctg5v5Last10: unknown[]; // empty in every sample seen
   savePctg5v5Details: {
      savePctg: {
         value: number;
         leagueAvg: number;
         percentile: number;
      };
      savePctgClose: {
         value: number;
         leagueAvg: number;
         percentile: number;
      };
      shots: {
         value: number;
         leagueAvg: number;
         percentile: number;
      };
      shotsPer60: {
         value: number;
         leagueAvg: number;
         percentile: number;
      };
   };
}

/** Response of `adv.goalies.saveLocation` */
export interface EdgeGoalieShotLocation {
   shotLocationDetails: {
      area: string;
      shotsAgainst: number;
      saves: number;
      goalsAgainst: number;
      savePctg: number;
      shotsAgainstPercentile: number;
      savesPercentile: number;
      goalsAgainstPercentile: number;
      savePctgPercentile: number;
   }[];
   shotLocationTotals: {
      locationCode: string;
      shotsAgainst: number;
      goalsAgainst: number;
      saves: number;
      savePctg: number;
      shotsAgainstPercentile: number;
      goalsAgainstPercentile: number;
      savesPercentile: number;
      savePctgPercentile: number;
      shotsAgainstLeagueAvg: number;
      goalsAgainstLeagueAvg: number;
      savesLeagueAvg: number;
      savePctgLeagueAvg: number;
   }[];
}

/** One row of `adv.goalies.top10.savePercentage` */
export interface EdgeGoalieSavePercentageTop10Entry {
   player: EdgePlayer;
   gamesOver900: number;
   pctgGamesOver900: number;
}

/** Response of `adv.goalies.top10.savePercentage` */
export type EdgeGoalieSavePercentageTop10 =
   EdgeGoalieSavePercentageTop10Entry[];

/** One row of `adv.goalies.top10.savePercentage5v5` */
export interface EdgeGoalieSavePercentage5v5Top10Entry {
   player: EdgePlayer;
   savePctg: number;
   savePctgClose: number;
   shots: number;
   shotsPer60: number;
}

/** Response of `adv.goalies.top10.savePercentage5v5` */
export type EdgeGoalieSavePercentage5v5Top10 =
   EdgeGoalieSavePercentage5v5Top10Entry[];

/** One row of `adv.goalies.top10.saveLocation` */
export interface EdgeGoalieShotLocationTop10Entry {
   player: EdgePlayer;
   all: number;
   highDanger: number;
   midRange: number;
   longRange: number;
}

/** Response of `adv.goalies.top10.saveLocation` */
export type EdgeGoalieShotLocationTop10 =
   EdgeGoalieShotLocationTop10Entry[];

/** Response of `adv.teams.stats` */
export interface EdgeTeamDetail {
   team: EdgeTeam;
   seasonsWithEdgeStats: EdgeSeason[];
   shotSpeed: {
      shotAttemptsOver90: {
         value: number;
         rank: number;
      };
      topShotSpeed: {
         imperial: number;
         metric: number;
         rank: number;
         leagueAvg: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
   };
   skatingSpeed: {
      burstsOver22: {
         value: number;
         rank: number;
      };
      burstsOver20: {
         value: number;
         rank: number;
         leagueAvg: {
            value: number;
         };
      };
      speedMax: {
         imperial: number;
         metric: number;
         rank: number;
         leagueAvg: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
   };
   distanceSkated: {
      total: {
         imperial: number;
         metric: number;
         rank: number;
         leagueAvg: EdgeMeasurement;
      };
   };
   sogSummary: {
      locationCode: string;
      shots: number;
      shotsRank: number;
      shotsLeagueAvg: number;
      shootingPctg: number;
      shootingPctgRank: number;
      shootingPctgLeagueAvg: number;
      goals: number;
      goalsRank: number;
      goalsLeagueAvg: number;
   }[];
   sogDetails: {
      area: string;
      shots: number;
      shotsRank: number;
   }[];
   zoneTimeDetails: {
      offensiveZonePctg: number;
      offensiveZoneRank: number;
      offensiveZoneLeagueAvg: number;
      offensiveZoneEvPctg: number;
      offensiveZoneEvRank: number;
      offensiveZoneEvLeagueAvg: number;
      neutralZonePctg: number;
      neutralZoneRank: number;
      neutralZoneLeagueAvg: number;
      defensiveZonePctg: number;
      defensiveZoneRank: number;
      defensiveZoneLeagueAvg: number;
   };
}

/** Response of `adv.teams.compare` */
export interface EdgeTeamComparison {
   team: EdgeTeam;
   seasonsWithEdgeStats: EdgeSeason[];
   shotSpeedDetails: {
      topShotSpeed: {
         imperial: number;
         metric: number;
         overlay: EdgeOverlay;
      };
      avgShotSpeed: EdgeMeasurement;
      shotAttemptsOver100: number;
      shotAttempts90To100: number;
      shotAttempts80To90: number;
      shotAttempts70To80: number;
   };
   skatingSpeedDetails: {
      maxSkatingSpeed: {
         imperial: number;
         metric: number;
         overlay: EdgeOverlay;
      };
      burstsOver22: number;
      bursts20To22: number;
      bursts18To20: number;
   };
   skatingDistanceLast10: {
      gameCenterLink: string;
      gameDate: string;
      isHomeTeam: boolean;
      distanceSkated: EdgeMeasurement;
      homeTeam: EdgeTeam;
      awayTeam: EdgeTeam;
   }[];
   skatingDistanceDetails: {
      distanceTotal: EdgeMeasurement;
      distancePer60: EdgeMeasurement;
      distanceMaxGame: {
         imperial: number;
         metric: number;
         overlay: EdgeOverlay;
      };
      distanceMaxPeriod: {
         imperial: number;
         metric: number;
         overlay: EdgeOverlay;
      };
   };
   shotLocationDetails: {
      area: string;
      sog: number;
      goals: number;
      shootingPctg: number;
   }[];
   shotLocationTotals: {
      locationCode: string;
      sog: number;
      goals: number;
      shootingPctg: number;
   }[];
   zoneTimeDetails: {
      offensiveZonePctg: number;
      offensiveZoneLeagueAvg: number;
      neutralZonePctg: number;
      neutralZoneLeagueAvg: number;
      defensiveZonePctg: number;
      defensiveZoneLeagueAvg: number;
   };
   shotDifferential: {
      shotAttemptDifferential: number;
      sogDifferential: number;
   };
}

/** Response of `adv.teams.leaders` */
export interface EdgeTeamLanding {
   seasonsWithEdgeStats: EdgeSeason[];
   leaders: {
      shotAttemptsOver90: {
         team: EdgeTeam;
         attempts: number;
      };
      burstsOver22: {
         team: EdgeTeam;
         bursts: number;
      };
      distancePer60: {
         team: EdgeTeam;
         distanceSkated: EdgeMeasurement;
      };
      highDangerSOG: {
         team: EdgeTeam;
         sog: number;
         shotLocationDetails: {
            area: string;
            sog: number;
            rank: number;
         }[];
      };
      offensiveZoneTime: {
         team: EdgeTeam;
         zoneTime: number;
      };
      neutralZoneTime: {
         team: EdgeTeam;
         zoneTime: number;
      };
      defensiveZoneTime: {
         team: EdgeTeam;
         zoneTime: number;
      };
   };
}

/** Response of `adv.teams.shotLocation` */
export interface EdgeTeamShotLocation {
   shotLocationDetails: {
      area: string;
      sog: number;
      sogRank: number;
      goals: number;
      goalsRank: number;
      shootingPctg: number | null;
      shootingPctgRank: number | null;
   }[];
   shotLocationTotals: {
      locationCode: string;
      position: string;
      sog: number;
      sogRank: number;
      sogLeagueAvg: number;
      goals: number;
      goalsRank: number;
      goalsLeagueAvg: number;
      shootingPctg: number;
      shootingPctgRank: number;
      shootingPctgLeagueAvg: number;
   }[];
}

/** Response of `adv.teams.shotSpeed` */
export interface EdgeTeamShotSpeed {
   hardestShots: {
      player: EdgePlayer;
      gameCenterLink: string;
      gameDate: string;
      gameType: number;
      isHomeTeam: boolean;
      shotSpeed: EdgeMeasurement;
      timeInPeriod: string;
      periodDescriptor: EdgePeriodDescriptor;
      homeTeam: EdgeTeam;
      awayTeam: EdgeTeam;
   }[];
   shotSpeedDetails: {
      position: string;
      topShotSpeed: {
         imperial: number;
         metric: number;
         rank: number;
         leagueAvg: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
      avgShotSpeed: {
         imperial: number;
         metric: number;
         rank: number;
         leagueAvg: EdgeMeasurement;
      };
      shotAttemptsOver100: {
         value: number;
         rank: number;
         leagueAvg: number;
      };
      shotAttempts90To100: {
         value: number;
         rank: number;
         leagueAvg: number;
      };
      shotAttempts80To90: {
         value: number;
         leagueAvg: number;
      };
      shotAttempts70To80: {
         value: number;
         leagueAvg: number;
      };
   }[];
}

/** Response of `adv.teams.skatingDistance` */
export interface EdgeTeamSkatingDistance {
   skatingDistanceLast10: {
      gameCenterLink: string;
      gameDate: string;
      isHomeTeam: boolean;
      toiAll: number;
      distanceSkatedAll: EdgeMeasurement;
      toiEven: number;
      distanceSkatedEven: EdgeMeasurement;
      toiPP?: number;
      distanceSkatedPP?: EdgeMeasurement;
      toiPK: number;
      distanceSkatedPK: EdgeMeasurement;
      homeTeam: EdgeTeam;
      awayTeam: EdgeTeam;
   }[];
   skatingDistanceDetails: {
      strengthCode: string;
      positionCode: string;
      distanceTotal: {
         imperial: number;
         metric: number;
         rank: number;
         leagueAvg: EdgeMeasurement;
      };
      distancePer60: {
         imperial: number;
         metric: number;
         rank: number;
         leagueAvg: EdgeMeasurement;
      };
      distanceMaxGame: {
         imperial: number;
         metric: number;
         rank: number;
         leagueAvg: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
      distanceMaxPeriod: {
         imperial: number;
         metric: number;
         rank: number;
         leagueAvg: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
   }[];
}

/** Response of `adv.teams.skatingSpeed` */
export interface EdgeTeamSkatingSpeed {
   topSkatingSpeeds: {
      player: EdgePlayer;
      gameCenterLink: string;
      gameDate: string;
      gameType: number;
      isHomeTeam: boolean;
      skatingSpeed: EdgeMeasurement;
      timeInPeriod: string;
      periodDescriptor: EdgePeriodDescriptor;
      homeTeam: EdgeTeam;
      awayTeam: EdgeTeam;
   }[];
   skatingSpeedDetails: {
      positionCode: string;
      maxSkatingSpeed: {
         imperial: number;
         metric: number;
         rank: number;
         leagueAvg: EdgeMeasurement;
         overlay: EdgeOverlay;
      };
      burstsOver22: {
         value: number;
         rank: number;
         leagueAvg: number;
      };
      bursts20To22: {
         value: number;
         rank: number;
         leagueAvg: number;
      };
      bursts18To20: {
         value: number;
         rank: number;
         leagueAvg: number;
      };
   }[];
}

/** Response of `adv.teams.zoneTime` */
export interface EdgeTeamZoneTime {
   zoneTimeDetails: {
      strengthCode: string;
      offensiveZonePctg: number;
      offensiveZoneRank: number;
      offensiveZoneLeagueAvg: number;
      neutralZonePctg: number;
      neutralZoneRank: number;
      neutralZoneLeagueAvg: number;
      defensiveZonePctg: number;
      defensiveZoneRank: number;
      defensiveZoneLeagueAvg: number;
   }[];
   shotDifferential: {
      shotAttemptDifferential: number;
      shotAttemptDifferentialRank: number;
      sogDifferential: number;
      sogDifferentialRank: number;
   };
}

/** One row of `adv.teams.top10.shotLocation` */
export interface EdgeTeamShotLocationTop10Entry {
   team: EdgeTeam;
   all: number;
   highDanger: number;
   midRange: number;
   longRange: number;
}

/** Response of `adv.teams.top10.shotLocation` */
export type EdgeTeamShotLocationTop10 = EdgeTeamShotLocationTop10Entry[];

/** One row of `adv.teams.top10.shotSpeed` */
export interface EdgeTeamShotSpeedTop10Entry {
   team: EdgeTeam;
   hardestShot: {
      imperial: number;
      metric: number;
      overlay: EdgeOverlay;
   };
   shotAttemptsOver100: number;
   shotAttempts90To100: number;
   shotAttempts80To90: number;
   shotAttempts70To80: number;
}

/** Response of `adv.teams.top10.shotSpeed` */
export type EdgeTeamShotSpeedTop10 = EdgeTeamShotSpeedTop10Entry[];

/** One row of `adv.teams.top10.skatingDistance` */
export interface EdgeTeamSkatingDistanceTop10Entry {
   team: EdgeTeam;
   distanceTotal: EdgeMeasurement;
   distancePer60: EdgeMeasurement;
   distanceMaxPerGame: {
      imperial: number;
      metric: number;
      overlay: EdgeOverlay;
   };
   distanceMaxPerPeriod: {
      imperial: number;
      metric: number;
      overlay: EdgeOverlay;
   };
}

/** Response of `adv.teams.top10.skatingDistance` */
export type EdgeTeamSkatingDistanceTop10 =
   EdgeTeamSkatingDistanceTop10Entry[];

/** One row of `adv.teams.top10.skatingSpeed` */
export interface EdgeTeamSkatingSpeedTop10Entry {
   team: EdgeTeam;
   maxSkatingSpeed: {
      imperial: number;
      metric: number;
      overlay: EdgeOverlay;
   };
   burstsOver22: number;
   bursts20To22: number;
   bursts18To20: number;
}

/** Response of `adv.teams.top10.skatingSpeed` */
export type EdgeTeamSkatingSpeedTop10 = EdgeTeamSkatingSpeedTop10Entry[];

/** One row of `adv.teams.top10.zoneTime` */
export interface EdgeTeamZoneTimeTop10Entry {
   team: EdgeTeam;
   offensiveZoneTime: number;
   neutralZoneTime: number;
   defensiveZoneTime: number;
}

/** Response of `adv.teams.top10.zoneTime` */
export type EdgeTeamZoneTimeTop10 = EdgeTeamZoneTimeTop10Entry[];

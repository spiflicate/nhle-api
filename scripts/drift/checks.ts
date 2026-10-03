/**
 * One check per public library function, called with ids that have
 * data. Stable ids point at a finished season, game and draft, so their
 * shapes should only change when the NHL APIs do.
 */
import { adv, gc, stats } from '#/api/index.ts';
import type { APIResult } from '#/client/types.ts';

const SEASON = 20242025;
const REG = 2;
const YEAR = 2025; // 2025 playoffs and draft
const SERIES = 'A';
const GAME = 2024020500; // a 2024-25 regular season game
const DATE = '2025-01-15';
const MONTH = '2025-01';
const TEAM = 'TOR';
const TEAM_ID = 10; // TOR
const SKATER = 8478402; // Connor McDavid
const GOALIE = 8478048; // Igor Shesterkin

export interface DriftCheck {
   /** `namespace.function`, plus a variant in parentheses when needed */
   name: string;
   run: () => Promise<APIResult<unknown>>;
   /**
    * The error class the call must fail with. Checks without one must
    * succeed, and their data shape is compared with the baseline.
    */
   expectError?: string;
   /**
    * Data depends on today's date or the caller's location (current
    * scoreboard, draft tracker), so an empty result is normal, fields
    * missing today are only noted, and `--update` adds to the baseline
    * rather than replacing it.
    */
   volatile?: boolean;
}

// The adv top-10 lists are called without filters, so the checks also
// cover the default filter values.

/** A goal in GAME, for the replay endpoints */
async function goalEventId(): Promise<number> {
   const pbp = await gc.game.playByPlay(GAME);
   const goal = pbp.success
      ? pbp.data.plays.find((play) => play.typeDescKey === 'goal')
      : undefined;
   if (!goal) throw new Error(`no goal found in game ${GAME}`);
   return goal.eventId;
}

const gamecenter: DriftCheck[] = [
   // gc.game
   { name: 'gc.game.boxscore', run: () => gc.game.boxscore(GAME) },
   { name: 'gc.game.landing', run: () => gc.game.landing(GAME) },
   { name: 'gc.game.playByPlay', run: () => gc.game.playByPlay(GAME) },
   { name: 'gc.game.reports', run: () => gc.game.reports(GAME) },
   {
      name: 'gc.game.wsc.gameStory',
      run: () => gc.game.wsc.gameStory(GAME),
   },
   {
      name: 'gc.game.wsc.playByPlay',
      run: () => gc.game.wsc.playByPlay(GAME),
   },
   {
      name: 'gc.game.pptReplay.goal',
      run: async () => gc.game.pptReplay.goal(GAME, await goalEventId()),
   },
   {
      name: 'gc.game.pptReplay.event',
      run: async () => gc.game.pptReplay.event(GAME, await goalEventId()),
   },
   { name: 'gc.game.schedule', run: () => gc.game.schedule(DATE) },
   {
      name: 'gc.game.scheduleCalendar',
      run: () => gc.game.scheduleCalendar(DATE),
   },
   {
      name: 'gc.game.networkTVSchedule',
      run: () => gc.game.networkTVSchedule(DATE),
   },
   {
      name: 'gc.game.playoffBracket',
      run: () => gc.game.playoffBracket(YEAR),
   },
   {
      name: 'gc.game.playoffSeries',
      run: () => gc.game.playoffSeries(SEASON),
   },
   {
      name: 'gc.game.playoffSeriesSchedule',
      run: () => gc.game.playoffSeriesSchedule(SERIES, SEASON),
   },
   {
      // Retired upstream; this flags the endpoint if it comes back
      name: 'gc.game.whereToWatch',
      run: () => gc.game.whereToWatch(),
      expectError: 'NotFoundError',
   },

   // gc.score, gc.scoreboard
   { name: 'gc.score', run: () => gc.score(DATE) },
   { name: 'gc.scoreboard', run: () => gc.scoreboard(), volatile: true },

   // gc.player
   { name: 'gc.player.landing', run: () => gc.player.landing(SKATER) },
   {
      name: 'gc.player.landing (goalie)',
      run: () => gc.player.landing(GOALIE),
   },
   {
      name: 'gc.player.gameLog',
      run: () => gc.player.gameLog(SKATER, SEASON, REG),
   },
   {
      name: 'gc.player.gameLog (goalie)',
      run: () => gc.player.gameLog(GOALIE, SEASON, REG),
   },
   {
      name: 'gc.player.spotlight',
      run: () => gc.player.spotlight(),
      volatile: true,
   },
   { name: 'gc.player.search', run: () => gc.player.search('mcdavid') },
   {
      name: 'gc.player.statsLeaders.skaters',
      run: () => gc.player.statsLeaders.skaters(SEASON, REG),
   },
   {
      name: 'gc.player.statsLeaders.goalies',
      run: () => gc.player.statsLeaders.goalies(SEASON, REG),
   },

   // gc.team
   {
      name: 'gc.team.rosterSeasons',
      run: () => gc.team.rosterSeasons(TEAM),
   },
   { name: 'gc.team.roster', run: () => gc.team.roster(TEAM, SEASON) },
   { name: 'gc.team.prospects', run: () => gc.team.prospects(TEAM) },
   { name: 'gc.team.stats', run: () => gc.team.stats(TEAM, SEASON, REG) },
   {
      name: 'gc.team.statsSeason',
      run: () => gc.team.statsSeason(TEAM),
   },
   { name: 'gc.team.standings', run: () => gc.team.standings(DATE) },
   {
      name: 'gc.team.standingsSeason',
      run: () => gc.team.standingsSeason(),
   },
   {
      name: 'gc.team.schedule.season',
      run: () => gc.team.schedule.season(TEAM, SEASON),
   },
   {
      name: 'gc.team.schedule.month',
      run: () => gc.team.schedule.month(TEAM, MONTH),
   },
   {
      name: 'gc.team.schedule.week',
      run: () => gc.team.schedule.week(TEAM, DATE),
   },

   // gc.draft
   { name: 'gc.draft.picks', run: () => gc.draft.picks(YEAR, 1) },
   { name: 'gc.draft.picks (all rounds)', run: () => gc.draft.picks(YEAR) },
   {
      name: 'gc.draft.rankings (skatersNA)',
      run: () => gc.draft.rankings(YEAR).skatersNA(),
   },
   {
      name: 'gc.draft.rankings (goaliesIntl)',
      run: () => gc.draft.rankings(YEAR).goaliesIntl(),
   },
   {
      name: 'gc.draft.tracker',
      run: () => gc.draft.tracker(),
      volatile: true,
   },

   // gc.misc
   { name: 'gc.misc.seasons', run: () => gc.misc.seasons() },
   { name: 'gc.misc.meta.game', run: () => gc.misc.meta.game(GAME) },
   {
      name: 'gc.misc.meta.playoffSeries',
      run: () => gc.misc.meta.playoffSeries(SERIES, YEAR),
   },
   {
      name: 'gc.misc.postalLookup',
      run: () => gc.misc.postalLookup('M5V3L9'),
   },
   {
      name: 'gc.misc.postalLookup (US)',
      run: () => gc.misc.postalLookup('10001'),
   },
   {
      name: 'gc.misc.location',
      run: () => gc.misc.location(),
      volatile: true,
   },
   {
      name: 'gc.misc.partnerGame',
      run: () => gc.misc.partnerGame('CA'),
      volatile: true,
   },

   // Error behaviour the client depends on
   {
      name: 'gc.game.landing (unknown game)',
      // A valid id past the last game of 2015-16 (1,230 games)
      run: () => gc.game.landing(2015021312),
      expectError: 'NotFoundError',
   },
];

const edge: DriftCheck[] = [
   {
      name: 'adv.byTheNumbers',
      run: () => adv.byTheNumbers(),
      volatile: true,
   },

   // adv.skaters
   {
      name: 'adv.skaters.detail',
      run: () => adv.skaters.detail(SKATER, SEASON, REG),
   },
   {
      name: 'adv.skaters.comparison',
      run: () => adv.skaters.comparison(SKATER, SEASON, REG),
   },
   {
      name: 'adv.skaters.leaders',
      run: () => adv.skaters.leaders(SEASON, REG),
   },
   {
      name: 'adv.skaters.shotLocation',
      run: () => adv.skaters.shotLocation(SKATER, SEASON, REG),
   },
   {
      name: 'adv.skaters.shotSpeed',
      run: () => adv.skaters.shotSpeed(SKATER, SEASON, REG),
   },
   {
      name: 'adv.skaters.skatingDistance',
      run: () => adv.skaters.skatingDistance(SKATER, SEASON, REG),
   },
   {
      name: 'adv.skaters.skatingSpeed',
      run: () => adv.skaters.skatingSpeed(SKATER, SEASON, REG),
   },
   {
      name: 'adv.skaters.zoneTime',
      run: () => adv.skaters.zoneTime(SKATER, SEASON, REG),
   },
   {
      name: 'adv.skaters.top10.distance',
      run: () => adv.skaters.top10.distance(SEASON, REG),
   },
   {
      name: 'adv.skaters.top10.shotLocation',
      run: () => adv.skaters.top10.shotLocation(SEASON, REG),
   },
   {
      name: 'adv.skaters.top10.shotSpeed',
      run: () => adv.skaters.top10.shotSpeed(SEASON, REG),
   },
   {
      name: 'adv.skaters.top10.speed',
      run: () => adv.skaters.top10.speed(SEASON, REG),
   },
   {
      name: 'adv.skaters.top10.zoneTime',
      run: () => adv.skaters.top10.zoneTime(SEASON, REG),
   },

   // adv.goalies
   {
      name: 'adv.goalies.player',
      run: () => adv.goalies.player(GOALIE, SEASON, REG),
   },
   {
      name: 'adv.goalies.compare',
      run: () => adv.goalies.compare(GOALIE, SEASON, REG),
   },
   {
      name: 'adv.goalies.leaders',
      run: () => adv.goalies.leaders(SEASON, REG),
   },
   {
      name: 'adv.goalies.savePercentage',
      run: () => adv.goalies.savePercentage(GOALIE, SEASON, REG),
   },
   {
      name: 'adv.goalies.savePercentage5v5',
      run: () => adv.goalies.savePercentage5v5(GOALIE, SEASON, REG),
   },
   {
      name: 'adv.goalies.saveLocation',
      run: () => adv.goalies.saveLocation(GOALIE, SEASON, REG),
   },
   {
      name: 'adv.goalies.top10.savePercentage',
      run: () => adv.goalies.top10.savePercentage(SEASON, REG),
   },
   {
      name: 'adv.goalies.top10.savePercentage5v5',
      run: () => adv.goalies.top10.savePercentage5v5(SEASON, REG),
   },
   {
      name: 'adv.goalies.top10.saveLocation',
      run: () => adv.goalies.top10.saveLocation(SEASON, REG),
   },

   // adv.teams
   {
      name: 'adv.teams.stats',
      run: () => adv.teams.stats(TEAM_ID, SEASON, REG),
   },
   {
      name: 'adv.teams.compare',
      run: () => adv.teams.compare(TEAM_ID, SEASON, REG),
   },
   {
      name: 'adv.teams.leaders',
      run: () => adv.teams.leaders(SEASON, REG),
   },
   {
      name: 'adv.teams.shotLocation',
      run: () => adv.teams.shotLocation(TEAM_ID, SEASON, REG),
   },
   {
      name: 'adv.teams.shotSpeed',
      run: () => adv.teams.shotSpeed(TEAM_ID, SEASON, REG),
   },
   {
      name: 'adv.teams.skatingDistance',
      run: () => adv.teams.skatingDistance(TEAM_ID, SEASON, REG),
   },
   {
      name: 'adv.teams.skatingSpeed',
      run: () => adv.teams.skatingSpeed(TEAM_ID, SEASON, REG),
   },
   {
      name: 'adv.teams.zoneTime',
      run: () => adv.teams.zoneTime(TEAM_ID, SEASON, REG),
   },
   {
      name: 'adv.teams.top10.shotLocation',
      run: () => adv.teams.top10.shotLocation(SEASON, REG),
   },
   {
      name: 'adv.teams.top10.shotSpeed',
      run: () => adv.teams.top10.shotSpeed(SEASON, REG),
   },
   {
      name: 'adv.teams.top10.skatingDistance',
      run: () => adv.teams.top10.skatingDistance(SEASON, REG),
   },
   {
      name: 'adv.teams.top10.skatingSpeed',
      run: () => adv.teams.top10.skatingSpeed(SEASON, REG),
   },
   {
      name: 'adv.teams.top10.zoneTime',
      run: () => adv.teams.top10.zoneTime(SEASON, REG),
   },
];

/** Season filters for the stats API (field names differ per endpoint) */
const STATS_SEASON = `seasonId=${SEASON} and gameTypeId=${REG}`;
const LEADERS_SEASON = `season=${SEASON} and gameType=${REG}`;
const FILTERS = { seasonId: SEASON, gameTypeId: REG };
const PAGE = { limit: 5 };

const statsApi: DriftCheck[] = [
   // stats.skaters
   {
      name: 'stats.skaters.getPlayerInfo',
      run: () =>
         stats.skaters.getPlayerInfo({ cayenneExp: `id=${SKATER}` }),
   },
   {
      name: 'stats.skaters.getLeaders',
      run: () =>
         stats.skaters.getLeaders('points', { cayenneExp: LEADERS_SEASON }),
   },
   {
      name: 'stats.skaters.getMilestones',
      run: () => stats.skaters.getMilestones(),
      volatile: true,
   },
   {
      name: 'stats.skaters.getStats',
      run: () =>
         stats.skaters.getStats('summary', {
            cayenneExp: STATS_SEASON,
            ...PAGE,
         }),
   },
   {
      name: 'stats.skaters.getStatsWithParams',
      run: () =>
         stats.skaters.getStatsWithParams('realtime', {
            cayenneExp: STATS_SEASON,
            ...PAGE,
         }),
   },
   {
      name: 'stats.skaters.getStatsWithBuilder',
      run: () =>
         stats.skaters.getStatsWithBuilder('timeonice', (q) => ({
            cayenneExp: q
               .equals('seasonId', SEASON)
               .equals('gameTypeId', REG)
               .build(),
            ...PAGE,
         })),
   },
   {
      name: 'stats.skaters.getStatsWithFilters',
      run: () =>
         stats.skaters.getStatsWithFilters('bios', FILTERS, {}, PAGE),
   },
   // stats.goalies
   {
      name: 'stats.goalies.getLeaders',
      run: () =>
         stats.goalies.getLeaders('savePctg', {
            cayenneExp: LEADERS_SEASON,
         }),
   },
   {
      name: 'stats.goalies.getMilestones',
      run: () => stats.goalies.getMilestones(),
      volatile: true,
   },
   {
      name: 'stats.goalies.getStats',
      run: () =>
         stats.goalies.getStats('summary', {
            cayenneExp: STATS_SEASON,
            ...PAGE,
         }),
   },
   {
      name: 'stats.goalies.getStatsWithParams',
      run: () =>
         stats.goalies.getStatsWithParams('advanced', {
            cayenneExp: STATS_SEASON,
            ...PAGE,
         }),
   },
   {
      name: 'stats.goalies.getStatsWithBuilder',
      run: () =>
         stats.goalies.getStatsWithBuilder('savesByStrength', (q) => ({
            cayenneExp: q
               .equals('seasonId', SEASON)
               .equals('gameTypeId', REG)
               .build(),
            ...PAGE,
         })),
   },
   {
      name: 'stats.goalies.getStatsWithFilters',
      run: () =>
         stats.goalies.getStatsWithFilters('bios', FILTERS, {}, PAGE),
   },
   // stats.teams
   { name: 'stats.teams.getAll', run: () => stats.teams.getAll() },
   {
      name: 'stats.teams.getById',
      run: () => stats.teams.getById(TEAM_ID, { include: 'logos' }),
   },
   {
      name: 'stats.teams.getStats',
      run: () =>
         stats.teams.getStats('summary', { cayenneExp: STATS_SEASON }),
   },
   {
      name: 'stats.teams.getStatsWithParams',
      run: () =>
         stats.teams.getStatsWithParams('powerplay', {
            cayenneExp: STATS_SEASON,
            ...PAGE,
         }),
   },
   {
      name: 'stats.teams.getStatsWithBuilder',
      run: () =>
         stats.teams.getStatsWithBuilder('realtime', (q) => ({
            cayenneExp: q
               .equals('seasonId', SEASON)
               .equals('gameTypeId', REG)
               .build(),
            ...PAGE,
         })),
   },
   {
      name: 'stats.teams.getStatsWithFilters',
      run: () =>
         stats.teams.getStatsWithFilters('penaltykill', FILTERS, {}, PAGE),
   },
   // stats.season
   {
      name: 'stats.season.getSeasons',
      run: () => stats.season.getSeasons(),
   },
   {
      name: 'stats.season.getGames',
      run: () =>
         stats.season.getGames({ cayenneExp: `gameDate="${DATE}"` }),
   },
   {
      name: 'stats.season.getShiftChart',
      run: () => stats.season.getShiftChart(GAME),
   },
   { name: 'stats.season.getDraft', run: () => stats.season.getDraft() },
   // stats.misc
   { name: 'stats.misc.getConfig', run: () => stats.misc.getConfig() },
   {
      name: 'stats.misc.getCountries',
      run: () => stats.misc.getCountries(),
   },
   { name: 'stats.misc.getGlossary', run: () => stats.misc.getGlossary() },
   {
      name: 'stats.misc.getFranchises',
      run: () => stats.misc.getFranchises(),
   },
];

export const checks: DriftCheck[] = [...gamecenter, ...edge, ...statsApi];

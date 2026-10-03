/**
 * One check per public library function, called with ids that have
 * data. Stable ids point at a finished season, game and draft, so their
 * shapes should only change when the NHL APIs do.
 */
import { adv, gc } from '#/api/index.ts';
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

/**
 * The adv functions are typed `unknown` but resolve to an APIResult.
 * Their top-10 lists are called without filters, so the checks also
 * cover the default filter values.
 */
const result = (p: Promise<unknown>) => p as Promise<APIResult<unknown>>;

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
   {
      name: 'gc.player.statsLeaders.skaters (categories, all players)',
      run: () =>
         gc.player.statsLeaders.skaters(SEASON, REG, {
            categories: ['points', 'goals'],
            limit: -1,
         }),
   },
   {
      name: 'gc.player.statsLeaders.goalies (categories, limit)',
      run: () =>
         gc.player.statsLeaders.goalies(SEASON, REG, {
            categories: ['goalsAgainstAverage', 'savePctg'],
            limit: 10,
         }),
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
   {
      name: 'gc.misc.meta.lookup',
      // Gretzky has no current team, so currentTeams[] is empty for him
      run: () =>
         gc.misc.meta.lookup({
            players: [SKATER, GOALIE, 8447400],
            teams: [TEAM, 'EDM'],
         }),
   },
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
      run: () => result(adv.byTheNumbers()),
      volatile: true,
   },

   // adv.skaters
   {
      name: 'adv.skaters.detail',
      run: () => result(adv.skaters.detail(SKATER, SEASON, REG)),
   },
   {
      name: 'adv.skaters.comparison',
      run: () => result(adv.skaters.comparison(SKATER, SEASON, REG)),
   },
   {
      name: 'adv.skaters.leaders',
      run: () => result(adv.skaters.leaders(SEASON, REG)),
   },
   {
      name: 'adv.skaters.shotLocation',
      run: () => result(adv.skaters.shotLocation(SKATER, SEASON, REG)),
   },
   {
      name: 'adv.skaters.shotSpeed',
      run: () => result(adv.skaters.shotSpeed(SKATER, SEASON, REG)),
   },
   {
      name: 'adv.skaters.skatingDistance',
      run: () => result(adv.skaters.skatingDistance(SKATER, SEASON, REG)),
   },
   {
      name: 'adv.skaters.skatingSpeed',
      run: () => result(adv.skaters.skatingSpeed(SKATER, SEASON, REG)),
   },
   {
      name: 'adv.skaters.zoneTime',
      run: () => result(adv.skaters.zoneTime(SKATER, SEASON, REG)),
   },
   {
      name: 'adv.skaters.top10.distance',
      run: () => result(adv.skaters.top10.distance(SEASON, REG)),
   },
   {
      name: 'adv.skaters.top10.shotLocation',
      run: () => result(adv.skaters.top10.shotLocation(SEASON, REG)),
   },
   {
      name: 'adv.skaters.top10.shotSpeed',
      run: () => result(adv.skaters.top10.shotSpeed(SEASON, REG)),
   },
   {
      name: 'adv.skaters.top10.speed',
      run: () => result(adv.skaters.top10.speed(SEASON, REG)),
   },
   {
      name: 'adv.skaters.top10.zoneTime',
      run: () => result(adv.skaters.top10.zoneTime(SEASON, REG)),
   },

   // adv.goalies
   {
      name: 'adv.goalies.player',
      run: () => result(adv.goalies.player(GOALIE, SEASON, REG)),
   },
   {
      name: 'adv.goalies.compare',
      run: () => result(adv.goalies.compare(GOALIE, SEASON, REG)),
   },
   {
      name: 'adv.goalies.leaders',
      run: () => result(adv.goalies.leaders(SEASON, REG)),
   },
   {
      name: 'adv.goalies.savePercentage',
      run: () => result(adv.goalies.savePercentage(GOALIE, SEASON, REG)),
   },
   {
      name: 'adv.goalies.savePercentage5v5',
      run: () => result(adv.goalies.savePercentage5v5(GOALIE, SEASON, REG)),
   },
   {
      name: 'adv.goalies.saveLocation',
      run: () => result(adv.goalies.saveLocation(GOALIE, SEASON, REG)),
   },
   {
      name: 'adv.goalies.top10.savePercentage',
      run: () => result(adv.goalies.top10.savePercentage(SEASON, REG)),
   },
   {
      name: 'adv.goalies.top10.savePercentage5v5',
      run: () => result(adv.goalies.top10.savePercentage5v5(SEASON, REG)),
   },
   {
      name: 'adv.goalies.top10.saveLocation',
      run: () => result(adv.goalies.top10.saveLocation(SEASON, REG)),
   },

   // adv.teams
   {
      name: 'adv.teams.stats',
      run: () => result(adv.teams.stats(TEAM_ID, SEASON, REG)),
   },
   {
      name: 'adv.teams.compare',
      run: () => result(adv.teams.compare(TEAM_ID, SEASON, REG)),
   },
   {
      name: 'adv.teams.leaders',
      run: () => result(adv.teams.leaders(SEASON, REG)),
   },
   {
      name: 'adv.teams.shotLocation',
      run: () => result(adv.teams.shotLocation(TEAM_ID, SEASON, REG)),
   },
   {
      name: 'adv.teams.shotSpeed',
      run: () => result(adv.teams.shotSpeed(TEAM_ID, SEASON, REG)),
   },
   {
      name: 'adv.teams.skatingDistance',
      run: () => result(adv.teams.skatingDistance(TEAM_ID, SEASON, REG)),
   },
   {
      name: 'adv.teams.skatingSpeed',
      run: () => result(adv.teams.skatingSpeed(TEAM_ID, SEASON, REG)),
   },
   {
      name: 'adv.teams.zoneTime',
      run: () => result(adv.teams.zoneTime(TEAM_ID, SEASON, REG)),
   },
   {
      name: 'adv.teams.top10.shotLocation',
      run: () => result(adv.teams.top10.shotLocation(SEASON, REG)),
   },
   {
      name: 'adv.teams.top10.shotSpeed',
      run: () => result(adv.teams.top10.shotSpeed(SEASON, REG)),
   },
   {
      name: 'adv.teams.top10.skatingDistance',
      run: () => result(adv.teams.top10.skatingDistance(SEASON, REG)),
   },
   {
      name: 'adv.teams.top10.skatingSpeed',
      run: () => result(adv.teams.top10.skatingSpeed(SEASON, REG)),
   },
   {
      name: 'adv.teams.top10.zoneTime',
      run: () => result(adv.teams.top10.zoneTime(SEASON, REG)),
   },
];

export const checks: DriftCheck[] = [...gamecenter, ...edge];

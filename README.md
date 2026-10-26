# nhle-api

[![npm version](https://img.shields.io/npm/v/nhle-api.svg)](https://www.npmjs.com/package/nhle-api)
[![npm downloads](https://img.shields.io/npm/dm/nhle-api.svg)](https://www.npmjs.com/package/nhle-api)
[![license](https://img.shields.io/github/license/spiflicate/nhle-api.svg)](LICENSE)

Typed TypeScript functions for the NHL's public web APIs: Game Center and Edge (`api-web.nhle.com`), the Stats API behind stats.nhl.com (`api.nhle.com/stats/rest`), and video metadata for highlight clips.

The NHL doesn't document these APIs, so the response types are written against what the endpoints actually return, and a daily job checks them against the live APIs (see [API drift check](#api-drift-check)).

## Installation

```bash
npm install nhle-api
```

Ships ESM and CommonJS builds with type declarations. Requires Node 18 or later.

## Quick start

```ts
import { gc } from 'nhle-api';

const result = await gc.game.landing(2023020001);

if (result.success) {
   console.log(result.data.venue.default);
} else {
   console.error(result.error.message);
}
```

Every function returns a promise of an `APIResult`, which is either `{ success: true, data }` or `{ success: false, error }`. Requests don't throw; see [Results and errors](#results-and-errors).

A few more calls:

```ts
await gc.game.playByPlay(2023020001);
await gc.game.boxscore(2023020001);
await gc.score(); // today's scores
await gc.scoreboard();
await gc.team.roster('TOR');
await gc.player.landing(8478402); // Connor McDavid
```

## Namespaces

The package exports four namespaces:

| Namespace | API | Covers |
| --- | --- | --- |
| `gc` | Game Center | Games, schedules, scores, standings, teams, players, draft |
| `adv` | NHL Edge | Puck and player tracking: skating speed, shot speed, zone time |
| `stats` | Stats API | The stats.nhl.com reports, leaders, milestones, shift charts |
| `video` | Brightcove | Titles and playable sources for highlight clips |

Seasons are written as `20242025`. Game types are `2` (regular season) and `3` (playoffs). Dates take a `Date` or a `'YYYY-MM-DD'` string, are read in the NHL's time zone (America/New_York), and default to today.

### `gc.game`

- `landing(gameId)`, `boxscore(gameId)`, `playByPlay(gameId)`, `reports(gameId)`
- `wsc.gameStory(gameId)`, `wsc.playByPlay(gameId)`
- `pptReplay.goal(gameId, eventId)`, `pptReplay.event(gameId, eventId)`: player and puck tracking for a replay
- `schedule(date?)`, `scheduleCalendar(date?)`, `networkTVSchedule(date?)`
- `playoffBracket(year?)`, `playoffSeries(season?)`, `playoffSeriesSchedule(seriesLetter, season?)`
- `whereToWatch()`: deprecated. The NHL retired this endpoint and it now returns a `NotFoundError`.

### `gc.score` and `gc.scoreboard`

- `score(date?)`: scores for a date
- `scoreboard()`: the current scoreboard

### `gc.team`

- `roster(team, season?)`, `rosterSeasons(team)`, `prospects(team)`
- `stats(team, season?, gameType?)`, `statsSeason(team)`
- `standings(date?)`, `standingsSeason()`
- `schedule.week(team, date?)`, `schedule.month(team, date?)`, `schedule.season(team, season?)`

Teams are three-letter abbreviations (`'TOR'`, `'TBL'`).

### `gc.player`

- `landing(playerId)`, `gameLog(playerId, season?, gameType?)`
- `statsLeaders.skaters(season?, gameType?)`, `statsLeaders.goalies(season?, gameType?)`
- `spotlight()`, `search(query)`

### `gc.draft`

- `picks(year?, round?)`, `tracker()`
- `rankings(year?)` returns `skatersNA()`, `skatersIntl()`, `goaliesNA()`, `goaliesIntl()` and `all()`

### `gc.misc`

- `seasons()`
- `meta.game(gameId)`, `meta.playoffSeries(seriesLetter, year?)`
- `postalLookup(postalCode)`, `location()`, `partnerGame(countryCode)`

### `adv` (NHL Edge)

- `adv.skaters`: `detail`, `comparison`, `leaders`, `shotLocation`, `shotSpeed`, `skatingDistance`, `skatingSpeed`, `zoneTime`, and `top10.{distance, shotLocation, shotSpeed, speed, zoneTime}`
- `adv.goalies`: `player`, `compare`, `leaders`, `savePercentage`, `savePercentage5v5`, `saveLocation`, and `top10.{savePercentage, savePercentage5v5, saveLocation}`
- `adv.teams`: `stats`, `compare`, `leaders`, `shotLocation`, `shotSpeed`, `skatingDistance`, `skatingSpeed`, `zoneTime`, and `top10.{shotLocation, shotSpeed, skatingDistance, skatingSpeed, zoneTime}`
- `adv.byTheNumbers()`: the daily highlights from the Edge home page

```ts
import { adv } from 'nhle-api';

const result = await adv.skaters.detail(8478402, 20242025, 2);
if (result.success) console.log(result.data.skatingSpeed.speedMax.imperial);
```

### `stats` (Stats API)

- `stats.skaters`, `stats.goalies`, `stats.teams`: `getStats(report, params)` for any report (`'summary'`, `'realtime'`, `'powerplay'`, and the rest listed in `SkaterReport`, `GoalieReport` and `TeamReport`), plus `getStatsWithParams`, `getStatsWithBuilder` and `getStatsWithFilters`
- `stats.skaters.getPlayerInfo(params)`; `getLeaders(category, params)` and `getMilestones()` on skaters and goalies
- `stats.teams.getAll(params)`, `stats.teams.getById(teamId, params)`
- `stats.season`: `getSeasons()`, `getGames(params)`, `getShiftChart(gameId)`, `getDraft()`
- `stats.misc`: `getConfig()` (the columns of every report), `getCountries()`, `getGlossary()`, `getFranchises()`

Report endpoints return `{ data, total }` and take `cayenneExp`, `sort`, `dir`, `limit` and `start`:

```ts
import { stats } from 'nhle-api';

const skaters = await stats.skaters.getStats('summary', {
   cayenneExp: 'seasonId=20242025 and gameTypeId=2',
   sort: 'points',
   dir: 'desc',
   limit: 10,
});

// The same kind of filter, built with the query builder
const goalies = await stats.goalies.getStatsWithBuilder('summary', (q) => ({
   cayenneExp: q.equals('seasonId', 20242025).greaterThan('gamesPlayed', 20).build(),
   sort: 'savePct',
   dir: 'desc',
}));
```

The [query builder guide](docs/QUERY_BUILDER_GUIDE.md) covers the builder in full.

### `video`

`video.metadata(videoId)` returns the title, descriptions, duration, poster and sources of a Brightcove video, with the widest MP4 as `url`. The ids come from fields like `highlightClip` on the goals in `gc.game.landing`.

## Results and errors

API failures come back as values, not exceptions:

- `{ success: true, data }` when the request succeeds.
- `{ success: false, error }` otherwise. `error` is an `NHLError`, usually one of its subclasses: `NotFoundError` (404), `RateLimitError` (429), `ClientError` (other 4xx), `ServerError` (5xx), `NetworkError`, or `ValidationError` when a parameter is rejected before any request is made.

`error.category` and `error.context` (endpoint, status code, response body) carry the details.

```ts
import { gc, NotFoundError } from 'nhle-api';

const result = await gc.game.landing(2023020001);

if (result.success) {
   console.log(result.data.venue.default);
} else if (result.error instanceof NotFoundError) {
   console.log('No such game');
} else {
   console.error(result.error.category, result.error.message);
}
```

## Types

Response types are exported for every endpoint: Game Center (`GamecenterLanding`, `TeamRoster`, ...), Edge (`EdgeSkaterDetail`, `EdgeTeamZoneTime`, ...) and the Stats API (`stats.SkaterStats`, `stats.Team`, ...). Parameter types (`Season`, `GameId`, `TeamAbbrev`, ...) and shared shapes such as `LocalizedText` are exported too.

```ts
import type { APIResult, GamecenterLanding, Season } from 'nhle-api';
```

## Configuration

`config` holds the shared defaults. Every request reads it, so you can change it at any time:

```ts
import { config } from 'nhle-api';

config.timeout = 10000; // ms, default 5000
config.language = 'fr'; // 'en' (default) or 'fr'
config.logLevel = 'error'; // 'silent' | 'error' | 'warn' (default) | 'info' | 'debug'
```

To use different settings for some requests (base URL, headers, timeout, error logging), create your own `NHLClient` or call `createNHLClient`. [docs/CONFIGURATION.md](docs/CONFIGURATION.md) has the details.

## Toolkit

`nhle-api/toolkit` has the constants and helpers without the API clients:

```ts
import { getCurrentSeason, normalizeAbbrev, resolvePath } from 'nhle-api/toolkit';

const season = getCurrentSeason(); // '20262027' during the 2026-27 season
const team = normalizeAbbrev('TB'); // 'TBL'
const path = resolvePath('/teams/{team}', { team }); // '/teams/TBL'
```

It exports the `NHL` constants, date helpers, `normalizeAbbrev`, `resolvePath`, the Cayenne query builder, team branding (colors, including historical ones) and logo URL helpers.

## Docs

- [Configuration](docs/CONFIGURATION.md)
- [Query builder guide](docs/QUERY_BUILDER_GUIDE.md)
- [Changelog](CHANGELOG.md)

## Contributing

Issues and PRs are welcome. If an endpoint returns something the types don't match, open an issue with the function you called, its arguments, the library version, and a sample of the response if you can. Fixes to response types, JSDoc and the guides in `docs/` are especially useful.

Development uses [Bun](https://bun.sh):

```bash
bun install
bun test
bun run lint
bun run typecheck
```

### API drift check

The NHL changes these APIs without notice. `bun run drift` calls every public function against the live APIs, using a finished season, game and draft, and compares the structure of each response with `scripts/drift/baseline.json`. It reports an endpoint that stops answering, an error response that changes, and a field that is added, removed or changes type. Values are ignored, and so are fields that become `null`. A localized string (`{ default, fr, cs, ... }`) counts as one field however many translations it has.

The **API drift** workflow runs the check daily and can be started by hand (Actions → API drift → Run workflow). It never runs on PRs. When it finds drift, it opens an issue labelled `api-drift`, or updates the one already open. Findings carry over between runs, so a finding that a later run doesn't see again stays listed until it's resolved. New findings are also posted as a comment. The issue closes once a run finds nothing open.

When an API has changed:

1. Update the response types in `src/types/responses/`.
2. Accept the new shapes with `bun run drift --update` and commit the baseline.

Checks for data that depends on the date or location (scoreboard, draft tracker) are marked `volatile`. A field missing from one of them is only noted, and `--update` adds to their baseline instead of replacing it. New library functions need a check in `scripts/drift/checks.ts`; `test/unit/drift.test.ts` fails for any public function without one.

### Releasing

1. Move the `Unreleased` notes in `CHANGELOG.md` under the new version.
2. Bump the version and tag it: `npm version patch` (or `minor`/`major`).
3. Push the commit and tag: `git push --follow-tags`.
4. Approve the staged version with 2FA, either on npmjs.com (the package's **Staged Packages** tab) or with `npm stage approve <stage-id>`.

The **Release** workflow checks that the tag matches `package.json`, runs lint, typecheck, tests, the build and `check:package`, stages the version on npm with provenance, and creates a GitHub release. It uses [trusted publishing](https://docs.npmjs.com/trusted-publishers), so the repo holds no npm token, and [staged publishing](https://docs.npmjs.com/staged-publishing), so nothing goes live until a maintainer approves it.

One-time setup on npmjs.com:

1. In the package's **Settings → Trusted publishing**, add GitHub Actions with user `spiflicate`, repository `nhle-api` and workflow `release.yml`. Leave "Allow npm publish" and "Allow npm dist-tag" unchecked so CI can only stage.
2. Under **Publishing access**, choose "Require two-factor authentication and disallow tokens".

## Support

If this library is useful to you, you can support it here:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/R6R01DV0JD)

## License

MIT. See [LICENSE](LICENSE).

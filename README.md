# NHLe API Library

[![npm version](https://img.shields.io/npm/v/nhle-api.svg)](https://www.npmjs.com/package/nhle-api)
[![npm downloads](https://img.shields.io/npm/dm/nhle-api.svg)](https://www.npmjs.com/package/nhle-api)
[![license](https://img.shields.io/github/license/spiflicate/nhle-api.svg)](LICENSE)

A modern TypeScript wrapper around the public NHL GameCenter and EdgeStats APIs with simple, composable functions and strong TypeScript typing.

## Overview

The library exposes a small, functional surface over the NHL "Game Center", Edge and Stats APIs and ships with response types for every endpoint.

- Written in TypeScript and published as ESM/CJS
- Thin functional wrappers over official NHL API routes
- Typed responses for Game Center (`gc`), Edge advanced stats (`adv`), the Stats API (`stats`) and video metadata (`video`)
- Every function resolves to an `APIResult` instead of throwing
- Runtime configuration for timeouts, language and logging

## Installation

```bash
npm install nhle-api
```

The package ships both ESM and CJS builds; use standard `import`/`require` according to your toolchain.

## Quick Start

The primary entrypoint is the Game Center API namespace `gc`:

```ts
import { gc } from 'nhle-api';

// Get game landing page data
const gameInfo = await gc.game.landing(2023020001);

// Get live play-by-play
const playByPlay = await gc.game.playByPlay(2023020001);

// Get boxscore
const boxscore = await gc.game.boxscore(2023020001);

// Get today's scores
const scores = await gc.score(new Date());

// Get current scoreboard
const scoreboard = await gc.scoreboard();

// Get team roster
const roster = await gc.team.roster('TOR');

// Get player landing page (Connor McDavid)
const player = await gc.player.landing(8478402);
```

## Configuration

`config` holds the shared defaults. Change it at runtime; every request reads it, so changes apply even after the API modules are loaded:

```ts
import { config, logConfig } from 'nhle-api';

config.timeout = 10000; // ms, default 5000
config.language = 'fr'; // 'en' (default) or 'fr'
config.logLevel = 'error'; // 'silent' | 'error' | 'warn' (default) | 'info' | 'debug'

logConfig();
```

See `docs/CONFIGURATION.md` for per-client settings.

## Top-Level Exports

The package root `nhle-api` re-exports the API namespaces, configuration, the HTTP client, error classes, constants and types:

```ts
// API namespaces
import { adv, gc, stats, video } from 'nhle-api';

// Configuration and logging
import { config, logConfig, logger } from 'nhle-api';

// Result type and errors
import { NHLError, NotFoundError, ValidationError } from 'nhle-api';
import type { APIResult } from 'nhle-api';

// Your own client (custom base URL, headers, timeout, error handling)
import { NHLClient, createNHLClient } from 'nhle-api';

// Cayenne filter builder for `stats`
import { CayenneQueryBuilder } from 'nhle-api';

// Response and parameter types
import type { EdgeSkaterDetail, GamecenterLanding, Season } from 'nhle-api';
```

## Toolkit Entry Point

Use the `nhle-api/toolkit` subpath when you only need NHL constants and shared helpers. It does not load the API clients or configuration:

```ts
import {
   NHL,
   getCurrentSeason,
   normalizeAbbrev,
   resolvePath,
} from 'nhle-api/toolkit';

const season = getCurrentSeason();
const team = normalizeAbbrev('TB'); // 'TBL'
const teamPath = resolvePath('/teams/{team}', { team });
```

This entry point exports `NHL`, date helpers, `normalizeAbbrev`, `resolvePath`,
the Cayenne query builder, team branding data, historical team palettes, and
official logo URL helpers.

## Game Center API (`gc`)

`gc` is the primary namespace for accessing live and historical NHL data.

### `gc.game` – Game Data

- `playByPlay(gameId)` – Full live play-by-play event stream
- `boxscore(gameId)` – Boxscore and team/player stats for a game
- `landing(gameId)` – Game landing page data (summary, lines, etc.)
- `reports(gameId)` – Game reports / right-rail data
- `schedule(date?)` – Schedule for a given date (defaults to today)
- `scheduleCalendar(date?)` – Calendar-style schedule for a date
- `playoffBracket(year?)` – Playoff bracket for a given year
- `playoffSeries(season?)` – Playoff series information for a season
- `playoffSeriesSchedule(season, seriesLetter)` – Schedule for a playoff series
- `whereToWatch()` – Regional broadcast / streaming info (deprecated: the NHL retired this endpoint and it returns 404)
- `networkTVSchedule(date?)` – National TV schedule
- `wsc.gameStory(gameId)` – Game story from the web service collection
- `wsc.playByPlay(gameId)` – Play-by-play from the web service collection
- `pptReplay.goal(gameId, eventId)` – Goal replay data for a specific event
- `pptReplay.event(date?)` – Replay events for a given date (does not appear to be functional at this time)

### `gc.score` – Scores & Scoreboards

- `score(date?)` – Scores for a given date (defaults to today)
- `scoreboard()` – Current live scoreboard

### `gc.team` – Team Data

- `roster(teamCode, season?)` – Team roster for a given season
- `rosterSeasons(teamCode)` – Available roster seasons for a team
- `prospects(teamCode)` – Team prospects
- `clubStats(teamCode, season?)` – Club stats for a team/season
- `clubStatsSeason(teamCode)` – Season-level club stats
- `standings(date?)` – Standings for a given date
- `standingsSeason()` – Season standings
- `schedule.now(teamCode)` – Current schedule segment for a team
- `schedule.month(teamCode, month)` – Team schedule for a given month
- `schedule.season(teamCode, season)` – Full season schedule for a team

### `gc.player` – Player Data

- `landing(playerId)` – Player landing page data
- `gameLog(playerId, season?, gameType?)` – Game log for a player
- `spotlight()` – Featured players (spotlight carousel)
- `search(query)` – Player search
- `statsLeaders.season(season?, gameType?, category?, limit?)` – Season stat leaders
- `statsLeaders.current(gameType?, category?, limit?)` – Current stat leaders

### `gc.draft` – Draft Data

- `picks(year?)` – Draft picks for a given year
- `tracker()` – Draft tracker
- `rankings(year?)` – Draft rankings (all, NA/International, skaters/goalies)

### `gc.misc` – Miscellaneous

- `seasons()` – All NHL seasons
- `meta.game(gameId)` – Game metadata
- `meta.gameVideo(gameId)` – Game video metadata
- `postalLookup(postalCode)` – Postal/ZIP lookup (location info)
- `location()` – Location info for current context
- `partnerGame(country, date?)` – Partner game information

## Edge Advanced Stats (`adv`)

NHL Edge puck and player tracking data (`api-web.nhle.com/v1/edge`), with response types for every function (`EdgeSkaterDetail`, `EdgeTeamZoneTime`, ...).

- `adv.skaters`: `detail`, `comparison`, `leaders`, `shotLocation`, `shotSpeed`, `skatingDistance`, `skatingSpeed`, `zoneTime`, and `top10.{distance, shotLocation, shotSpeed, speed, zoneTime}`
- `adv.goalies`: `player`, `compare`, `leaders`, `savePercentage`, `savePercentage5v5`, `saveLocation`, and `top10.{savePercentage, savePercentage5v5, saveLocation}`
- `adv.teams`: `stats`, `compare`, `leaders`, `shotLocation`, `shotSpeed`, `skatingDistance`, `skatingSpeed`, `zoneTime`, and `top10.{shotLocation, shotSpeed, skatingDistance, skatingSpeed, zoneTime}`
- `adv.byTheNumbers()`: the Edge home page's daily highlights

```ts
const result = await adv.skaters.detail(8478402, 20242025, 2);
if (result.success) console.log(result.data.skatingSpeed.speedMax.imperial);
```

## Stats API (`stats`)

The stats.nhl.com reports (`api.nhle.com/stats/rest`). List endpoints answer `{ data, total }` and accept `cayenneExp`, `sort`, `dir`, `limit` and `start`.

- `stats.skaters` / `stats.goalies` / `stats.teams`: `getStats(report, params)` for any report (`summary`, `realtime`, `powerplay`...; `SkaterReport`, `GoalieReport` and `TeamReport` list them), plus `getStatsWithParams`, `getStatsWithBuilder` and `getStatsWithFilters`
- `stats.skaters.getPlayerInfo(params)`, `getLeaders(category, params)`, `getMilestones()`; the same leaders and milestones for goalies
- `stats.teams.getAll(params)`, `getById(teamId, params)`
- `stats.season`: `getSeasons()`, `getGames(params)`, `getShiftChart(gameId)`, `getDraft()`
- `stats.misc`: `getConfig()` (every report's columns), `getCountries()`, `getGlossary()`, `getFranchises()`

```ts
import { stats } from 'nhle-api';

const result = await stats.skaters.getStats('summary', {
   cayenneExp: 'seasonId=20242025 and gameTypeId=2',
   sort: 'points',
   dir: 'desc',
   limit: 10,
});

// Or with the query builder
const goalies = await stats.goalies.getStatsWithBuilder('summary', (q) => ({
   cayenneExp: q.equals('seasonId', 20242025).greaterThan('gamesPlayed', 20).build(),
   sort: 'savePct',
   dir: 'desc',
}));
```

See [docs/QUERY_BUILDER_GUIDE.md](docs/QUERY_BUILDER_GUIDE.md) for the builder.

## Video (`video`)

- `video.metadata(videoId)`: title, descriptions, duration, poster and playable sources (with the best MP4 as `url`) for a Brightcove video id, such as a goal's `highlightClip` in `gc.game.landing`

## Types

Response types are exported for every endpoint: Game Center (`GamecenterLanding`, `TeamRoster`...), Edge (`Edge*`) and the Stats API (`stats.SkaterStats`, `stats.Team`...), along with parameter types (`Season`, `GameId`, `TeamAbbrev`...) and shared shapes such as `LocalizedText`.

### Results and errors

Functions never throw for API failures. Each resolves to an `APIResult<T>`:

- `{ success: true, data }` on success.
- `{ success: false, error }` otherwise, where `error` is an `NHLError` subclass: `NotFoundError` (404), `ClientError` (other 4xx), `ServerError` (5xx), `RateLimitError` (429), `NetworkError`, or `ValidationError` for parameters rejected before any request.
- `error.category` and `error.context` (endpoint, status code, response body) carry the details.

```ts
import { gc, NotFoundError } from 'nhle-api';
import type { APIResult, GamecenterLanding } from 'nhle-api';

const result: APIResult<GamecenterLanding> = await gc.game.landing(2023020001);

if (result.success) {
   console.log(result.data.venue.default);
} else if (result.error instanceof NotFoundError) {
   console.log('No such game');
} else {
   console.error(result.error.category, result.error.message);
}
```

## Roadmap / Status

- ✅ Game Center endpoints with response types
- ✅ Edge Advanced (`adv`) endpoints with response types
- ✅ Stats API (`stats`) endpoints with typed reports
- ✅ Runtime configuration (`config`) and per-client settings (`NHLClient`)
- ✅ Error classes and `APIResult` exported
- ✅ Daily drift check against the live APIs

For a detailed list of changes, see `CHANGELOG.md`.

## Docs

- [Configuration](docs/CONFIGURATION.md) - Code-defined configuration and default values
- [Query Builder Guide](docs/QUERY_BUILDER_GUIDE.md) - Cayenne query builder for stats APIs

## Contributing

This project is still evolving and feedback is very welcome.

- **Bug reports / issues:** If an endpoint returns unexpected data, response parsing fails, or types don’t match the real API, please open a GitHub issue with the endpoint, parameters, and (sanitized) sample payloads if possible.
- **Type improvements:** PRs or issues that improve response coverage, fix missing/incorrect fields, or refine enums and unions are particularly helpful.
- **JSDoc / docs:** Additions or corrections to JSDoc on public types and functions, or clarifications to the guides in `docs/`, are also very much appreciated.

Before filing an issue, check the `CHANGELOG.md` for recent changes and breaking notes, and include the library version you’re using.

## API drift check

The NHL APIs are undocumented and change without notice. `bun run drift` calls every public function against the live APIs (with a finished season, game and draft) and compares each response's structure with `scripts/drift/baseline.json`. It fails when an endpoint stops answering, an error response changes, or a field is added, removed or changes type. Values are ignored, and so are fields that turn `null`. Translations in localized strings (`{ default, fr, cs, ... }`) count as one field.

The **API drift** workflow runs it daily and on demand (Actions → API drift → Run workflow). A failure opens one `api-drift` issue with the report, which the next passing run closes. It never runs on PRs, so upstream changes don't block unrelated work.

When an API really has changed:

1. Update the response types in `src/types/responses/`.
2. Accept the new shapes with `bun run drift --update` and commit the baseline.

Checks for date- or location-dependent data (scoreboard, draft tracker) are marked `volatile`: a field missing today is only noted, and `--update` adds to their baseline instead of replacing it. When you add a library function, add a check in `scripts/drift/checks.ts`; `test/unit/drift.test.ts` fails if a public function has none.

## Releasing

1. Move the `Unreleased` notes in `CHANGELOG.md` under the new version.
2. Bump the version and tag it: `npm version patch` (or `minor`/`major`).
3. Push the commit and tag: `git push --follow-tags`.

4. Approve the staged version with 2FA, on npmjs.com (the package's **Staged Packages** tab) or with `npm stage approve <stage-id>`.

The **Release** workflow checks that the tag matches `package.json`, runs the full CI suite and `check:package`, stages the version on npm with provenance, and creates a GitHub release. It uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers), so there is no npm token in the repo, and [staged publishing](https://docs.npmjs.com/staged-publishing), so nothing goes live until a maintainer approves it.

One-time setup on npmjs.com:

1. Open the `nhle-api` package's **Settings → Trusted publishing** and add GitHub Actions with user `spiflicate`, repository `nhle-api` and workflow `release.yml`. Leave "Allow npm publish" and "Allow npm dist-tag" unchecked, so CI can only stage.
2. Under **Publishing access**, choose "Require two-factor authentication and disallow tokens".

## Support

If you find this library helpful, consider supporting its development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/R6R01DV0JD)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

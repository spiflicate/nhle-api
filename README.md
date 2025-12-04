# NHLe API Library

A modern TypeScript wrapper around the public NHL GameCenter and EdgeStats APIs with simple, composable functions and strong TypeScript typing.

## Overview

The library exposes a small, functional surface over the NHL "Game Center" and related APIs and ships with rich response types for all Game Center endpoints.

- Written in TypeScript and published as ESM/CJS
- Thin functional wrappers over official NHL API routes
- Fully-typed Game Center responses (game, team, player, draft, misc)
- Simple environment-based configuration for timeouts, language and logging

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

Basic behavior is configured via environment variables and the exported `envConfig` helper from `config/env`:

```bash
# Request timeout in milliseconds (default: 5000)
export NHLE_API_TIMEOUT=10000

# Language for responses ("en" or "fr", default: "en")
export NHLE_API_LANGUAGE=en

# Logging level: silent | error | warn | info | debug (default: "warn")
export NHLE_API_LOGLEVEL=debug
```

You can inspect the resolved configuration at runtime:

```ts
import { envConfig, logEnvConfig } from 'nhle-api';

console.log(envConfig.timeout, envConfig.language, envConfig.logLevel);
logEnvConfig(); // logs only variables that are explicitly set
```

See `docs/ENVIRONMENT_CONFIG.md` for more details.

## Top-Level Exports

The package root `nhle-api` re-exports the main API namespaces, configuration utilities, constants, and public types:

```ts
// Game Center API (fully typed)
import { gc } from 'nhle-api';

// Edge Advanced stats (in progress, API surface may change)
import { adv } from 'nhle-api';

// Environment configuration helpers
import { envConfig, logEnvConfig } from 'nhle-api';

// Shared type exports (Game Center response types, parameter types, etc.)
import type { GameLandingResponse } from 'nhle-api';
```

### Notes on Edge APIs

- `adv` (Edge Advanced) is available but still considered in development, but ready for preliminary use.
- The `stats` (Edge Stats) namespace is not exported at the moment and will be introduced in a future release once implementation is ready.

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
- `whereToWatch()` – Regional broadcast / streaming info
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

## Types

The library exports strongly-typed response shapes and parameter types for all Game Center endpoints from the `types` bundle:

- Response types for `gc.game.*`, `gc.team.*`, `gc.player.*`, `gc.draft.*`, `gc.misc.*`
- Common enums and helper types (position codes, team codes, schedule state, etc.)



### Error Handling and `NHLError`

Under the hood, low-level HTTP requests use a shared `NHLClient` and `ErrorHandler` which normalize HTTP/network failures into a single `NHLError` shape.

- All non-2xx responses and network/timeout failures are converted to an `NHLError` instance.
- Errors are categorized (client/server/network) with optional context (endpoint, method, status code).
- High-level helpers expose these via the `APIResponse<T>` union so you can safely branch on `status` without catching exceptions.

Typical usage pattern:

```ts
import { gc } from 'nhle-api';
import type { APIResponse, GamecenterLanding } from 'nhle-api';

const result: APIResponse<GamecenterLanding> = await gc.game.landing(2023020001);

if (result.success) {
   console.log(result.data);
} else {
   // NHLError instance with rich metadata
   console.error(result.error.message);
}
```

## Roadmap / Status

- ✅ Game Center endpoints fully wired with response types
- ✅ Environment configuration utilities (`envConfig`, `logEnvConfig`)
- ✅ Error handling via `NHLError` and structured error responses internally
- 🚧 Edge Advanced (`adv`) API surface and types are in development
- ⏳ Edge Stats (`stats`) API will be added in a future minor release

For a detailed list of changes and recent work on response types and endpoint coverage, see `CHANGELOG.md`.

## Docs

- [Environment Configuration](docs/ENVIRONMENT_CONFIG.md) - Environment configuration and default values
- [Query Builder Guide](docs/QUERY_BUILDER_GUIDE.md) - Cayenne query builder for stats APIs

## Contributing

This project is still evolving and feedback is very welcome.

- **Bug reports / issues:** If an endpoint returns unexpected data, response parsing fails, or types don’t match the real API, please open a GitHub issue with the endpoint, parameters, and (sanitized) sample payloads if possible.
- **Type improvements:** PRs or issues that improve response coverage, fix missing/incorrect fields, or refine enums and unions are particularly helpful.
- **JSDoc / docs:** Additions or corrections to JSDoc on public types and functions, or clarifications to the guides in `docs/`, are also very much appreciated.

Before filing an issue, check the `CHANGELOG.md` for recent changes and breaking notes, and include the library version you’re using.

## Support

If you find this library helpful, consider supporting its development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/R6R01DV0JD)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

# NHLe API Library

A TypeScript wrapper for the NHLe API with simple, composable functions and full type safety.

## Overview

Access NHLe game data, player statistics, and team information through a clean, functional API. Built with TypeScript for complete type safety and designed for ease of use.

## Installation

To install the package, run:

```bash
npm install nhle-api
```

## Usage

Here are some basic examples of how to use the NHLe API library:

```typescript
import { gc } from "nhle-api";

// Get game landing page data
const gameInfo = await gc.game.landing(2023020001);
console.log(gameInfo);

// Get live play-by-play
const playByPlay = await gc.game.playByPlay(2023020001);
console.log(playByPlay);

// Get boxscore
const boxscore = await gc.game.boxscore(2023020001);
console.log(boxscore);

// Get today's scores
const scores = await gc.score(new Date());
console.log(scores);

// Get current scoreboard
const scoreboard = await gc.scoreboard();
console.log(scoreboard);

// Get team roster
const roster = await gc.team.roster("TOR");
console.log(roster);

// Get player information
const player = await gc.player.landing(8478402); // Connor McDavid
console.log(player);
```

## Configuration

The library supports simple configuration through environment variables:

```bash
# Set request timeout (in milliseconds, default: 5000)
export NHLE_API_TIMEOUT=10000

# Set language for responses (en or fr, default: en)
export NHLE_API_LANGUAGE=en

# Set logging level (silent, error, warn, info, debug; default: warn)
export NHLE_API_LOGLEVEL=debug
```

For more details, see [Environment Configuration Documentation](docs/ENVIRONMENT_CONFIG.md).

## API Reference

### Gamecenter API (`gc`)

The primary API for accessing NHL game data, scores, team and player information (live and historical).

#### `gc.game` - Game Data

- `playByPlay(gameId)` - Get play-by-play data for a game
- `boxscore(gameId)` - Get boxscore for a game
- `landing(gameId)` - Get landing page data for a game
- `reports(gameId)` - Get game reports (right rail data)
- `schedule(date?)` - Get schedule for a specific date (defaults to today)
- `scheduleCalendar(date?)` - Get schedule calendar for a specific date
- `playoffBracket(year?)` - Get playoff bracket for a year
- `playoffSeries(season?)` - Get playoff series for a season
- `playoffSeriesSchedule(season, seriesLetter)` - Get schedule for a playoff series
- `whereToWatch()` - Get where to watch information
- `networkTVSchedule(date?)` - Get network TV schedule
- `wsc.gameStory(gameId)` - Get game story (web service)
- `wsc.playByPlay(gameId)` - Get play-by-play (web service)
- `pptReplay.goal(gameId, eventId)` - Get goal replay data
- `pptReplay.event(date?)` - Get replay events for a date

#### `gc.score` - Scores & Scoreboards

- `score(date?)` - Get scores for a specific date (defaults to today)
- `scoreboard()` - Get current scoreboard

#### `gc.team` - Team Data

- `roster(teamCode, season?)` - Get team roster
- `rosterSeasons(teamCode)` - Get available roster seasons
- `prospects(teamCode)` - Get team prospects
- `clubStats(teamCode, season?)` - Get club stats
- `clubStatsSeason(teamCode)` - Get club stats season
- `standings(date?)` - Get standings for a date
- `standingsSeason()` - Get standings by season
- `schedule.now(teamCode)` - Get team's current schedule
- `schedule.month(teamCode, month)` - Get team's schedule for a month
- `schedule.season(teamCode, season)` - Get team's schedule for a season

#### `gc.player` - Player Data

- `landing(playerId)` - Get player landing page data
- `gameLog(playerId, season?, gameType?)` - Get player game log
- `spotlight()` - Get featured players
- `search(query)` - Search for players
- `statsLeaders.season(season?, gameType?, category?, limit?)` - Get season stats leaders
- `statsLeaders.current(gameType?, category?, limit?)` - Get current stats leaders

#### `gc.draft` - Draft Data

- `picks(year?)` - Get draft picks for a year
- `tracker()` - Get draft tracker
- `rankings(year?)` - Get draft rankings

#### `gc.misc` - Miscellaneous

- `seasons()` - Get all NHL seasons
- `meta.game(gameId)` - Get game metadata
- `meta.gameVideo(gameId)` - Get game video metadata
- `postalLookup(postalCode)` - Lookup location by postal code
- `location()` - Get current location info
- `partnerGame(country, date?)` - Get partner game information

### Edge Stats API (`stats`) - _In Development_

Historical and current NHL statistics (functionality being finalized)

### Edge Advanced API (`adv`) - _In Development_

Advanced analytics endpoints (functionality being finalized)

## Docs

- [Environment Configuration](docs/ENVIRONMENT_CONFIG.md) - Configure timeouts, language, and base URLs
- [Query Builder Guide](docs/QUERY_BUILDER_GUIDE.md) - Advanced query building for stats API

## Support

If you find this library helpful, consider supporting its development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/R6R01DV0JD)

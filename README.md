# NHL API Client Library

## Overview

A modern NHL API wrapper written in TypeScript with a functional approach.

## Installation

To install the package, run:

```bash
npm install nhle-api
```

## Usage

Here is a basic example of how to use the NHL API client:

```typescript
import { stats, gc, adv } from "nhle-api";

// Get game info
const gameInfo = await gc.gamecenter.getLanding(20240001);
console.log(gameInfo);

// Get skater leaders
const leaders = await stats.skaters.getLeaders("points");
console.log(leaders);

// Get team stats
const teamStats = await adv.teams.getTeamStats("TOR");
console.log(teamStats);
```

## Configuration

The client supports simple configuration through environment variables:

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

- **Gamecenter API** (`gc`): Live game data
  - `game`: Play-by-play, boxscores, landing pages, detailed game information
  - `score`: Live scores and updates
  - `team`: Team information
  - `player`: Player information
  - `draft`: Draft information
  - `misc`: Miscellaneous endpoints

- **Edge Stats API** (`stats`): Historical and current NHL statistics
  - `skaters`: Skater statistics and leaders
  - `goalies`: Goalie statistics and leaders
  - `teams`: Team statistics
  - `season-game`: Game-level data

- **Edge Advanced API** (`adv`): Advanced analytics
  - Various advanced statistical endpoints

## Docs

- [Environment Configuration](docs/ENVIRONMENT_CONFIG.md) - Configure timeouts, language, and base URLs
- [Query Builder Guide](docs/QUERY_BUILDER_GUIDE.md) - Advanced query building for stats API

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.4] - TBD

### Added

- Added game report tooling scripts for downloading and parsing summaries to support data collection workflows
- Added PlayerSearchResult response typing for Game Center player search
- Added test utilities for API response validation

### Changed

- Reworked API response handling to use a `success` field instead of `status`, with simpler error handling
- Exported `nhlClient` as a named export and updated consumers
- Renamed the route helper to `resolvePath` and refactored Game Center/Edge Advanced Stats path builders
- Renamed Game Center and Edge Advanced Stats path modules from `_paths` to `paths` and cleaned up path object naming
- Restructured Edge Advanced Stats exports and converted module methods to standalone async functions
- Updated Edge Advanced Stats top10 schema validators to match the new path naming
- Overloaded game log and playoff series schedule helpers for flexible parameter handling
- Updated README usage examples and badges

### Fixed

- Corrected rankings response handling to align with `success` response payloads
- Removed a stray console log from `getSeason`

### Technical

- Reorganized edge-stats tests and added edge-adv unit tests for goalies, skaters, summary, and teams
- Updated Game Center test utilities and imports for shared validation helpers
- Updated test coverage to handle error result objects
- Removed an unused Game Center index export
- Updated dependencies and devDependencies (including cheerio and node-html-parser)

## [0.5.3] - 2025-12-03

### Added

- Expanded Game Center response type coverage (player, team, and game detail structures), completing response types for all endpoints

### Changed

- Updated internal API import paths for game, player, and score modules to align with path consolidation work

### Fixed

- Corrected `playoffSeries` path to include missing `carousel` segment
- Updated player spotlight endpoint return type to use an array of `PlayerSpotlight`
- Removed duplicate `PositionCode` import from Game Center types

## [0.5.2] - 2025-12-01

### Release Notes

This release addresses some partial refactors to improve the codebase for myself, as well as a few bug fixes and enhancements. Response types are still a work in progress and will be further improved in future releases - the target for 0.6.0 is to have all endpoints fully typed.

### Added

- Team schedule interfaces for season, month, and week data structures
- PostalCode and PostalCodeInfo type definitions
- GameMeta and PlayoffSeriesMeta interfaces for enhanced game data structures
- PartnerGameInfo interface for partner game data

### Changed

- Refactored API endpoint functions from arrow functions to named function declarations for better debugging
- Consolidated API paths into a single `_paths.ts` file for improved maintainability
- Updated ScheduleParams to include month parameter with default value
- Simplified type definitions and removed DefaultWithTranslations for clarity
- Updated GameScheduleState type definition for improved consistency
- Improved draft rankings function error handling and response structure when using `all()`
- Enhanced Game Center API documentation with detailed JSDoc comments
- Updated team statistics functions for improved clarity and consistency

### Fixed

- Corrected pptReplay endpoints to use correct parameters
- Updated PostalCode validation regex to accommodate optional space
- Changed birthCountry type from CountryTLA to string for simplicity
- Renamed Suggestions type to IncompleteOptions for consistency
- Renamed PartnerGame interface to PartnerGameInfo
- Removed erroneous import from game.ts
- Updated NHL_START_DATE and NHL_END_DATE to reflect accurate season dates
- Improved type validator definitions
- Fixed ScheduleParams handling in team.schedule endpoint
- Removed unused WADL check script from package.json

### Technical

- Added comprehensive schedule endpoint tests
- Enhanced type safety across Game Center responses
- Improved module descriptions and parameter documentation

## [0.5.0] - 2025-11-10

### Added

- TypeScript wrapper for NHLe API with full type safety
- Game Center API support (landing, play-by-play, boxscore)
- Team and player information endpoints
- Score and scoreboard endpoints
- Edge Stats API integration
- Edge Advanced Stats API integration
- Comprehensive TypeScript type definitions
- Query builder for Cayenne queries
- Environment configuration support

### Changed

- Migrated build system to tsup with dedicated config file
- Updated package.json for correct ESM/CJS dual-format output

### Infrastructure

- Added tsup.config.ts for centralized build configuration
- Configured dual ESM/CJS package exports
- Added MIT license
- Added changelog

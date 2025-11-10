# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [Unreleased]

### Planned

- Additional API endpoint coverage
- Enhanced error handling
- More comprehensive examples and documentation
- Enhanced response types for better type safety

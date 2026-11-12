# Contributing

Issues and PRs are welcome. If an endpoint returns something the types don't match, open an issue with the function you called, its arguments, the library version, and a sample of the response if you can. Fixes to response types, JSDoc and the guides in `docs/` are especially useful.

## Development

Development uses [Bun](https://bun.sh):

```bash
bun install
bun test
bun run lint
bun run typecheck
```

## API drift check

The NHL changes these APIs without notice. `bun run drift` calls every public function against the live APIs, using a finished season, game and draft, and compares the structure of each response with `scripts/drift/baseline.json`. It reports an endpoint that stops answering, an error response that changes, and a field that is added, removed or changes type. Values are ignored, and so are fields that become `null`; the exceptions are position codes and game states, which must be ones the types declare (lists in `scripts/drift/values.ts`). A localized string (`{ default, fr, cs, ... }`) counts as one field however many translations it has.

The **API drift** workflow runs the check daily and can be started by hand (Actions → API drift → Run workflow). It never runs on PRs. When it finds drift, it opens an issue labelled `api-drift`, or updates the one already open. Findings carry over between runs, so a finding that a later run doesn't see again stays listed until it's resolved. New findings are also posted as a comment. The issue closes once a run finds nothing open.

When an API has changed:

1. Update the response types in `src/types/responses/`.
2. Accept the new shapes with `bun run drift --update` and commit the baseline. An unknown position code or game state needs its union (and the list in `scripts/drift/values.ts`) widened instead; `--update` won't accept it.

Checks for data that depends on the date or location (scoreboard, draft tracker) are marked `volatile`. A field missing from one of them is only noted, and `--update` adds to their baseline instead of replacing it. New library functions need a check in `scripts/drift/checks.ts`; `test/unit/drift.test.ts` fails for any public function without one.

### Live games

The daily check calls a finished game, so fields that only exist while a game is on (clock, situation, intermission data) and short game states (`OVER` lasts about 20 seconds) are never compared. `bun run drift:live` polls in-progress games instead:

```sh
bun run drift:live                       # every game today that isn't OFF
bun run drift:live --game 2026020186     # just this game (repeatable)
bun run drift:live --report live.md --max-min 300
```

Every 10 seconds (`--interval`) it calls `gc.score` and each started game's landing. The other game-scoped endpoints (boxscore, play-by-play, right rail, wsc, ppt replays, meta), the scoreboard and the schedule run every 6th poll per game (`--slow-every`), staggered across games, and right after a game changes state. Games that haven't started are watched from `gc.score` alone, once a minute. It stops when every game is `OFF` (after one last full poll of each), after `--max-min` (default 360), or on Ctrl-C, and writes the report either way.

Each response is compared with the daily baseline plus `scripts/drift/live-baseline.json`, which holds only the paths seen in games in progress (odds, the live shootout, a power play's `situation`, ...), the way a volatile check is: a field the baseline lacks, a new type at a known path, or an undeclared game state or position code is a finding; a baseline field a live response lacks is only listed. The report shows which game states each endpoint was seen in, every state change per endpoint with period and clock, and each finding with the game and state it first appeared in. Many first findings are baseline gaps rather than API changes: check that the types cover the field (live-only fields are optional), then accept the live shapes with `bun run drift:live --update`. That rewrites `live-baseline.json` only, so `bun run drift` keeps checking finished games against `baseline.json` and doesn't report the live-only fields as removed.

The **API drift (live games)** workflow runs the same thing by hand (Actions → API drift (live games) → Run workflow). It doesn't file issues.

## Game Summary lifecycle capture

`scripts/gs-capture/collect.ts` follows one game's Game Summary (GS) report from before it is published to the next day, to see how an unfinished report really looks (#43). The **GS capture** workflow runs it every ten minutes; each run is one tick, and the state and evidence are committed to the `gs-capture-data` branch, so collection doesn't depend on anyone's computer or session.

- **Window:** from six hours before the scheduled start until an hour after the game is first seen final, then one snapshot a day after the start. The continuous window is capped at twelve hours and the campaign at 180 NHL requests, discovery, context and retries included; two are kept back for the next-day snapshot.
- **Each tick** fetches the GS report and the game's landing JSON, whose state, period and clock are recorded as context. Context corroborates; it never replaces what the report printed.
- **Evidence:** every request is a line in `<campaign>/observations.jsonl` (URL, UTC request and response times, status, response headers, body SHA-256 and size, collector commit, errors and retries). Bodies are saved once under `objects/<sha256>`, as the bytes fetch returned after undoing Content-Encoding, not decoded (GS reports are ISO-8859-1). `summary.md` lists the stages covered and missed, and every change of report and game state.
- **Activation:** set the repository variable `GS_CAPTURE` to `on`, then run the workflow with command `start` (and a game id, or let the first tick pick the earliest game at least six hours away). Stop with command `stop` or by setting `GS_CAPTURE` to `off`. Scheduled runs are best effort; late or skipped ticks show up as gaps.

Normal tests never call the NHL: curated snapshots from a campaign become fixtures, with their provenance.

## Releasing (maintainers)

1. Move the `Unreleased` notes in `CHANGELOG.md` under the new version.
2. Bump the version and tag it: `npm version patch` (or `minor`/`major`).
3. Push the commit and tag: `git push --follow-tags`.
4. Approve the staged version with 2FA, either on npmjs.com (the package's **Staged Packages** tab) or with `npm stage approve <stage-id>`.

The **Release** workflow checks that the tag matches `package.json`, runs lint, typecheck, tests, the build and `check:package`, stages the version on npm with provenance, and creates a GitHub release. It uses [trusted publishing](https://docs.npmjs.com/trusted-publishers), so the repo holds no npm token, and [staged publishing](https://docs.npmjs.com/staged-publishing), so nothing goes live until a maintainer approves it.

The one-time npm setup (trusted publisher and publishing access) is described at the top of `.github/workflows/release.yml`.

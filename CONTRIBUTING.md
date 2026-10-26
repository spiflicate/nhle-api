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

The NHL changes these APIs without notice. `bun run drift` calls every public function against the live APIs, using a finished season, game and draft, and compares the structure of each response with `scripts/drift/baseline.json`. It reports an endpoint that stops answering, an error response that changes, and a field that is added, removed or changes type. Values are ignored, and so are fields that become `null`. A localized string (`{ default, fr, cs, ... }`) counts as one field however many translations it has.

The **API drift** workflow runs the check daily and can be started by hand (Actions → API drift → Run workflow). It never runs on PRs. When it finds drift, it opens an issue labelled `api-drift`, or updates the one already open. Findings carry over between runs, so a finding that a later run doesn't see again stays listed until it's resolved. New findings are also posted as a comment. The issue closes once a run finds nothing open.

When an API has changed:

1. Update the response types in `src/types/responses/`.
2. Accept the new shapes with `bun run drift --update` and commit the baseline.

Checks for data that depends on the date or location (scoreboard, draft tracker) are marked `volatile`. A field missing from one of them is only noted, and `--update` adds to their baseline instead of replacing it. New library functions need a check in `scripts/drift/checks.ts`; `test/unit/drift.test.ts` fails for any public function without one.

## Releasing (maintainers)

1. Move the `Unreleased` notes in `CHANGELOG.md` under the new version.
2. Bump the version and tag it: `npm version patch` (or `minor`/`major`).
3. Push the commit and tag: `git push --follow-tags`.
4. Approve the staged version with 2FA, either on npmjs.com (the package's **Staged Packages** tab) or with `npm stage approve <stage-id>`.

The **Release** workflow checks that the tag matches `package.json`, runs lint, typecheck, tests, the build and `check:package`, stages the version on npm with provenance, and creates a GitHub release. It uses [trusted publishing](https://docs.npmjs.com/trusted-publishers), so the repo holds no npm token, and [staged publishing](https://docs.npmjs.com/staged-publishing), so nothing goes live until a maintainer approves it.

The one-time npm setup (trusted publisher and publishing access) is described at the top of `.github/workflows/release.yml`.

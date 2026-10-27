# HTML report capture

Collects real, unchanged NHL HTML reports (all nine RTSS reports: `GS`,
`ES`, `PL`, `FS`, `FC`, `RO`, `SS`, `TV`, `TH`) over a game's lifecycle,
for offline fixtures. Tests never run it; it needs the network and is only
started by hand.

- `collect.ts`: the collector (`campaign` and `snapshot` commands).
- `analyze.ts`: turns the evidence for one game into a Markdown timeline.
- `curate.ts`: copies chosen observations into `test/fixtures/` unchanged
  and records their provenance in the fixture manifest.
- `DATA_README.md`: the README of the evidence branch.

## Where it runs and where evidence goes

The **Report capture** workflow (`.github/workflows/report-capture.yml`)
runs on GitHub-hosted runners; nothing runs on a laptop and no secrets are
needed (it uses the workflow's own `GITHUB_TOKEN`).

Evidence is stored in two places:

1. **The `report-captures` branch** (durable, never expires). The collector
   commits and pushes after every poll, so a cancelled or crashed job loses
   at most the poll in flight. Layout and body fidelity are described in
   that branch's `README.md` (`DATA_README.md` here).
2. **Workflow artifacts**, uploaded at the end of every job, failed ones
   included, named `report-capture-<mode>-<run id>-w<window>`. They hold the
   whole evidence tree as of that job and are kept **90 days** (the maximum
   for this repository); the branch is the copy of record.

The evidence branch is kept apart from `test/fixtures/`, which only holds
the small curated set.

## Starting a capture

Actions → **Report capture** → **Run workflow**, on the branch that holds
the workflow:

- `mode: campaign`, `games: <one game id>`: polls that game's lifecycle.
  Pick a game from the real schedule, ideally 6 hours or more before its
  scheduled start (`https://api-web.nhle.com/v1/schedule/now`).
- `mode: snapshot`, `games: <id,id,...>`, `label: <text>`: one capture of
  every report of each game, e.g. completed historical games.
- `budget`: request cap (default 800 for a campaign; set it for snapshots,
  10 requests per game).

The same can be done through the API
(`POST /repos/{owner}/{repo}/actions/workflows/report-capture.yml/dispatches`).

### Scheduling notes

- GitHub only lists a workflow, and only accepts a dispatch for it, once
  it is known from the default branch or from a run on its branch. The
  workflow's `push` trigger exists only to register it from its branch; a
  push run skips its job. Once the workflow is on `main`, that trigger can
  go.
- The workflow uses no `schedule` trigger. Cron runs are best-effort (often
  many minutes late) and only run from the default branch. Instead, one
  dispatched run is a chain of up to seven sequential jobs (a matrix with
  `max-parallel: 1`), each a window of about 5.5 hours (the hosted-runner
  job limit is 6 hours). The collector sleeps between polls inside a job,
  so polls land on time.
- State is persisted, not derived: each job reads
  `games/<id>/campaign.json` from the evidence branch and resumes. Windows
  left over after the campaign is done exit within a minute.
- Sleeping runners cost runner minutes; for a public repository standard
  runners are free. A campaign is at most 7 × 5.5 hours.

## Campaign limits

Defined in `DEFAULTS` in `collect.ts`:

| Limit | Value |
|---|---|
| Requests per poll | 10: the gamecenter boxscore (context) and the nine reports |
| Poll interval (continuous window) | 10 minutes |
| Continuous window | from the first poll until 60 minutes after the context first shows `FINAL`/`OFF`, and never longer than 12 hours |
| Follow-up polls | 3, 9, 15 and 24 hours after final was first observed (after the window's end if final never was) |
| Request budget | 800 per campaign, retries and context requests included; 60 are held back for follow-ups |
| Retries | one retry, 5 s later, after a network error, timeout (30 s) or 5xx; a 404 is never retried |
| Pace | 0.5 s between requests within a poll |

The original Game-Summary-only brief capped a campaign at 180 requests.
Capturing all nine reports plus context costs 10 requests a poll instead
of 2, so the cap is 800: a game polled from 6 hours before puck drop to
an hour after final (about 55 polls) plus four follow-ups.

## Stopping

- Cancel the workflow run (Actions → the run → **Cancel workflow**). Evidence
  already pushed stays on the branch.
- Or set the repository variable `REPORT_CAPTURE_DISABLED` to `true`
  (Settings → Secrets and variables → Actions → Variables). Each job checks
  it when it starts; the job already running continues until its window
  ends, so cancel as well for an immediate stop.
- A campaign stops by itself when its follow-ups are done or its budget is
  spent; `campaign.json` records `doneReason`.

## Reading evidence

```bash
git fetch origin report-captures
git worktree add ../captures origin/report-captures
bun scripts/report-capture/analyze.ts --data ../captures --game 2026020198
```

Each observation line records the game id, requested URL, request-start and
response-received times (UTC), HTTP status, response headers, body size and
SHA-256, the stored body path, the collector version and commit, the run
URL, the attempt number and any network error. `context` lines also record
the game state, period and clock the JSON reported at that moment; they
corroborate the reports but do not replace what a report printed.

## Curating fixtures

```bash
bun scripts/report-capture/curate.ts --data ../captures \
  --obs <observation id> --name <fixture name> --stage <stage> --note '<text>'
```

copies the body byte for byte to `test/fixtures/reports/captured/` and
adds an entry to `test/fixtures/reports/captured/manifest.json`.

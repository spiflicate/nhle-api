# HTML report lifecycle: what one game showed

Evidence: game **2026020198**, BUF @ SJS, scheduled 2026-10-28 02:30 UTC
(7:30 pm PDT), decided **in regulation** (2-0). All nine reports and the
gamecenter boxscore were requested every 10 minutes from 21:34 UTC (T−296
min) to 06:24 UTC (an hour after final), by the **Report capture** workflow
([run 40587827813](https://github.com/spiflicate/nhle-api/actions/runs/40587827813)).
Every response is on the
[`report-captures`](https://github.com/spiflicate/nhle-api/tree/report-captures)
branch (`games/2026020198/`), and the curated subset is in
`test/fixtures/reports/captured/` (provenance in its `manifest.json`).
Next-day follow-up polls run 3, 9, 15 and 24 hours after final; see
[Next day](#next-day).

One game establishes examples, not NHL guarantees. **Observations** are
what the captured responses show; **hypotheses** are labelled as such.

## Timeline

Times are UTC; T is the scheduled start. "Context" is what the boxscore JSON
reported in the same poll. `Last-Modified` is the report's own header.

| Poll | Time | T | Context | Game Summary (GS) |
|---|---|---|---|---|
| 1–15 | 21:34–23:54 | −296 to −156 | FUT | **404** for all nine reports (same 196-byte Apache "Not Found" body) |
| 16 | 00:04 | −146 | FUT | **Published**: 200 for all nine, `Last-Modified` 00:03:27–00:03:31 |
| 16–28 | 00:04–02:04 | −146 to −26 | FUT, PRE from 02:04 | No status line, `Start : PDT` with no time |
| 29 | 02:14 | −16 | PRE | Status `Period 1 (20:00 Remaining)` appears; still no start time |
| 33 | 02:54 | +24 | LIVE, P1 18:32 | `Start 7:50 PDT` (actual start 02:50 UTC); first period rows |
| 36 | 03:24 | +54 | LIVE, P1 02:13 | `Attendance 14,900 at …` and placeholder stars appear |
| 37–38 | 03:34–03:44 | +64 | LIVE, intermission | `End of Period 1` |
| 43–44 | 04:34–04:44 | +124 | LIVE, intermission | `End of Period 2` |
| 48 | 05:24 | +174 | **FINAL** | `Final`, `End 10:21 PDT`, real stars (`Last-Modified` 05:23:55) |
| 49 | 05:34 | +184 | FINAL | **Correction**: SJS period-3 shots 8 → 7, total 24 → 23 (`Last-Modified` 05:33:19) |
| 50–54 | 05:44–06:24 | +194 to +234 | FINAL, OFF from 05:54 | Only a trailing newline added (`Last-Modified` 05:35:01); unchanged after |

## Observations

### Publication

- All nine reports went from 404 to 200 **together**, between 23:54 and
  00:04 UTC; their `Last-Modified` headers (00:03:27–00:03:31) put
  publication at **about 2 h 27 min before the scheduled start**. The
  library's existing doc said "one to two hours"; this game was earlier.
- The 404 is a genuine HTTP 404 with a small HTML body, identical for
  every report and every poll.
- Every report was **regenerated every 10 minutes** (at :x3:27 past the
  hour) from publication until about 10 minutes after final. Before the
  game, the only change was the generation stamp in the footer (e.g.
  `2026-10-27-17.03.31`, venue local time). A changed hash therefore does
  not mean changed content. At final the stamp's format changed to
  `2026-10-27 22.33.19`.
- After 05:35:01 UTC nothing changed, including `Last-Modified` and the
  footer stamp, through 06:24.

### Which GS sections exist before play

Every section's table is present from publication; the sections are
empty, not missing:

| Section | Before play | First filled |
|---|---|---|
| Teams and score | `0` scores | goal |
| Date, venue | present | — |
| Attendance | absent (venue printed alone) | +54 min, late in period 1 |
| Start / end | `Start : PDT` with no time; no end | start at +24 min (first poll after the drop); end at final |
| Status line | absent | about T−16 min (`Period 1 (20:00 Remaining)`) |
| Scoring, penalties | header row only | as events happen |
| Period totals | header only, **no rows** | period `1` and `TOT` rows of zeros once live |
| Power play / even strength | header only | once a situation has occurred |
| Goaltenders | dressed goalies and a team-total row, every cell blank | live |
| Officials | **referees and linespeople already listed** | — |
| 3 STARS | heading only | placeholder rows at +54 min, real stars at final |

### How unavailable values look

- **No rows**: period totals, scoring, penalties, strength tables.
- **Blank cells**: goalie time on ice and goals-shots per period. A goalie's
  period cells stay blank until he faces a shot in it; the team-total row
  reads `0-0` as soon as play starts. In the finals, a backup who didn't
  play and the periods a relieved goalie didn't play are blank, never
  `0-0`.
- **Absent text**: no status line, no attendance (venue alone), `Start :`
  without a time, no `End`.
- **Placeholders**: from +54 min until final, the stars table printed
  `1. BUF .`, `2. BUF .`, `3. BUF .`: the away team's abbreviation on
  every row, no position and `.` as the player.
- Zero is printed only as a value that is known: `0` scores, zero rows in
  period totals once live, `0-0` team goalie totals.

### Status text

`(none)` → `Period 1 (20:00 Remaining)` → `Period 1 (19:01 Remaining)` …
→ `End of Period 1` → `Period 2 (…)` → `End of Period 2` → `Period 3 (…)`
→ `Final`. Reports generated in the same pass can differ by a second
(`19:01` on GS, `19:00` on PL).

### Final and after

- `Final`, the end time and the real stars all appeared in the first
  regeneration after the game (05:23:55, about 3 minutes after the end at
  05:21).
- Attendance and officials did not change at final.
- **A correction followed within 10 minutes**: one shot was removed from
  SJS's period 3, changing the period table, the total and BUF's goalie
  shots-against. Nothing else in the sheet changed. The other reports were
  regenerated at the same times.

### Other reports

All nine followed the same publication, regeneration and freeze times. Sizes
(bytes) at publication → first live poll → settled final:

| Report | Published | Early live | Final |
|---|---|---|---|
| ES Event Summary | 85,654 | 77,888 | 76,860 |
| PL Play-by-Play | **2,387** | 45,058 | 1,328,805 |
| FS Faceoff Summary | 9,244 | 21,347 | 43,990 |
| FC Faceoff Comparison | 5,839 | 14,147 | 47,041 |
| RO Rosters | 16,080 | 17,160 | 17,149 |
| SS Shot Summary | 8,317 | 15,044 | 77,961 |
| TV / TH Time on Ice | 5,841 / 5,840 | 35,446 / 34,667 | 215,394 / 207,197 |

- **PL before the status line appears is a 2.4 KB page with no game tables
  at all** (styles and two script tags only), served as 200 and closed with
  `</html>`. A PL parser must accept this as "not started", not malformed.
- ES shrank once play began; RO barely changed during the game.
- Besides GS, the ES, PL and SS sheets changed between the first final
  (05:23:55) and the next version (05:33:19); every report then gained a
  trailing newline at 05:35:01.

## Unfinished versus truncated

**Observation**: all 387 successful responses captured (9 reports × 43
polls) end with `</html>`, and every GS, from publication on, contains all
of its section tables, including the `3 STARS` heading. An unfinished
report is complete HTML with empty sections; none of the captured sheets
was missing a table. Two final sheets lacked the trailing newline after
`</html>`, so the check must allow for that.

**Conclusion applied**: `parseGameSummary` now rejects a sheet that does
not end in `</html>` as truncated, instead of returning, for example, an
empty `stars` list for a sheet cut off before its last table. `gameTimes`
needs only the header and still reads such a sheet.

**Hypothesis**: the same holds for the other eight reports; their parsers
should apply the same check. Not tested beyond these 43 polls.

## Parser changes made from this evidence

In `src/api/reports/summary.ts` (from PR #42):

1. Truncated sheets (no closing `</html>`) give a `ParseError`.
2. Placeholder stars (no position, no player) are left out, so `stars` is
   `[]` until the stars are chosen. Before, three bogus stars were returned
   from late period 1 until final.
3. `venue` is read when the header prints it without attendance. Before, it
   was `null` until attendance appeared.

No change was needed for pregame or live sheets otherwise: the parser
accepted every one of the 39 published GS versions.

## Next day

Pending: follow-up polls at final + 3, 9, 15 and 24 hours (08:24, 14:24 and
20:24 UTC on 2026-10-28 and 05:24 UTC on 2026-10-29). This section is
updated once they have run.

## Coverage gaps

- **Regulation lifecycle: covered** by this game.
- **Overtime and shootout lifecycles: missing.** Final OT and SO sheets
  are covered by historical captures (`GS020674-final-ot`,
  `GS020673-final-so`) and the earlier live captures already in
  `test/fixtures/reports/` (`GS020187-live-*`, OT and shootout status
  lines), but not a same-game OT/SO lifecycle with provenance.
- **Playoff lifecycle: missing.** Multi-overtime is covered only by a
  historical final (`GS030157-final-2ot`).
- **Late start or postponement, neutral-site and Global Series games:
  missing.**
- **When attendance appears is not established.** It appeared late in
  period 1 here, but the saved Oct 26 overtime sheet (`GS020187-live-0416`)
  still had none. One game can't tell what decides it.
- **Next-day revisions**: pending (see above).
- **Exact wire bytes**: not captured. Bodies are stored after HTTP
  content-encoding was removed (UTF-8, as declared).
- **Parsers for ES, PL, FS, FC, RO, SS** don't exist yet. Their lifecycle
  evidence (all 54 polls) is on the `report-captures` branch, and their
  published and early-live versions are in the curated fixtures for when
  they are written. TV/TH are parsed by `reports.shifts` (PR #42); its
  behaviour on these live sheets is not tested here.

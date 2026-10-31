# HTML report lifecycle: what the captured games showed

Evidence: game **2026020198**, BUF @ SJS, scheduled 2026-10-28 02:30 UTC
(7:30 pm PDT), decided **in regulation** (2-0). All nine reports and the
gamecenter boxscore were requested every 10 minutes from 21:34 UTC (T−296
min) to 06:24 UTC (an hour after final), by the **Report capture** workflow
([run 40587827813](https://github.com/spiflicate/nhle-api/actions/runs/40587827813)).
Every response is on the
[`report-captures`](https://github.com/spiflicate/nhle-api/tree/report-captures)
branch (`games/2026020198/`), and the curated subset is in
`test/fixtures/reports/captured/` (provenance in its `manifest.json`).
Follow-up polls 3 and 24 hours after final caught a next-day revision; see
[Next day](#next-day-buf--sjs).

A second night added all 11 games of 2026-10-29, including three
overtime games; see [Second night](#second-night-11-games-2026-102930).

Twelve games establish examples, not NHL guarantees. **Observations** are
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
| 50–54 | 05:44–06:24 | +194 to +234 | FINAL, OFF from 05:54 | Only a trailing newline added (`Last-Modified` 05:35:01) |
| 55 | 08:24 | final + 3 h | OFF | Unchanged |
| 56 | 05:47 next day | final + 24 h | OFF | **Next-day revision**: BUF period-1 shots 16 → 17 (`Last-Modified` 20:04:25 on Oct 28) |

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

**Second night (11 games)**: 9 of 2,934 successful responses were **truncated
200s**: chunked, no `Content-Length`, cut off mid-tag, one of them empty
(0 bytes). Eight came from VAN @ SJS (ES, FS, SS, TV ×3, TH) and one from
NYI @ MIN (RO); none was a GS. In each case the next poll got the complete
report. So truncation is not hypothetical: the server occasionally serves a
cut-off report with status 200. Fixtures: `ES020213-empty-200.HTM`,
`FS020213-truncated-200.HTM`.

**Hypothesis**: they are reads that overlap a regeneration. The empty ES
was requested at 01:40:20 with `Last-Modified` 01:40:21, but the cut-off FS
was requested 61 s after its `Last-Modified`, so this is not proven.

**Conclusion applied**: `parseGameSummary` rejects a sheet that does not
end in `</html>` as truncated, instead of returning, for example, an empty
`stars` list for a sheet cut off before its last table. `gameTimes` needs
only the header and still reads such a sheet. A caller that gets the
truncation error should re-request the report. Parsers for the other
eight reports need the same check. From collector version 3, the
collector itself retries a truncated body once.

## Parser changes made from this evidence

In `src/api/reports/summary.ts` (from PR #42):

1. Truncated sheets (no closing `</html>`) give a `ParseError`.
2. Placeholder stars (no position, no player) are left out, so `stars` is
   `[]` until the stars are chosen. Before, three bogus stars were returned
   from late period 1 until final.
3. `venue` is read when the header prints it without attendance. Before, it
   was `null` until attendance appeared.

4. `venue` is also read from `Attendance  at <venue>`, the attendance line
   without a number, which NYI @ MIN printed until after its final.
5. Unsuccessful penalty shots go to a new `missedPenaltyShots` list. The
   scoring table prints them as `- | 2 | 11:18 | EV-PS | CHI | 91 F.NAZAR |
   Unsuccessful Penalty Shot | 91 | 36` (no goal number, one cell across
   the assist columns, shooter and goalie as on-ice), which failed the whole
   parse: 15 of CHI @ DET's sheets, from the shot on.

6. A goalie's decision is a separate `decision` field (`'W' | 'L' | 'OT' |
   null`). Before, it was part of `name`, so the same goalie's name changed
   between the first and the settled final.
7. `unassisted` is no longer returned as an assist.

With these, the parser accepts all 362 published GS versions captured
across the 12 games, follow-ups included.

## Second night: 11 games (2026-10-29/30)

All 11 games of 2026-10-29 were captured
(runs [40976807011](https://github.com/spiflicate/nhle-api/actions/runs/40976807011)
and the ten after it, one per game, started at 23:59 UTC). Four were already
live and four in `PRE`, so only the three 02:00 UTC games were caught before
puck drop. Every campaign saw the final; no network errors or 5xx.

| Game | Result | First poll | Notes |
|---|---|---|---|
| 2026020203 CHI @ DET | 1-4 | live P1 | unsuccessful penalty shot |
| 2026020204 WPG @ TBL | REG | live P1 | |
| 2026020205 UTA @ PIT | 4-3 **OT** | live P1 | live OT sheet with two OT goals |
| 2026020206 CBJ @ CAR | REG | live P1 | |
| 2026020207 BOS @ STL | REG | PRE | |
| 2026020208 WSH @ NSH | REG | PRE | |
| 2026020209 MTL @ DAL | REG | PRE | |
| 2026020210 NYI @ MIN | 4-3 **OT** | PRE | live OT; attendance only after final |
| 2026020211 BUF @ ANA | REG | FUT, published | |
| 2026020212 OTT @ LAK | 5-6 **OT** | FUT, published | OT shorter than a poll interval |
| 2026020213 VAN @ SJS | REG | FUT, **404** | published T−81 min |

**Observations**

- **Publication time varies.** VAN @ SJS was 404 until 00:39:20 UTC, 81
  minutes before its start; BUF @ ANA and OTT @ LAK, at the same start
  time, were already published at T−2 h; BUF @ SJS (night one) published at
  T−147 min. Each game's 10-minute regeneration keeps the second of its
  first publication (VAN @ SJS at :x9:20).
- **Overtime live**: the status reads `OT (mm:ss Remaining)`, the period
  table gains an `OT` row (zeros until a shot) between `3` and `TOT`, and
  OT goals print with period `OT`.
- **A live sheet can contradict itself.** UTA @ PIT's sheet at
  `OT (01:33 Remaining)` listed two overtime goals, Hayton at 3:24 and
  Sergachev at 3:27, with a 5-3 score. Overtime ends at the first goal; the
  first final, 10 minutes later, kept only Sergachev's and read 4-3. The
  parser reports what is printed and does not try to enforce the rules.
- **Attendance can come after the final.** NYI @ MIN printed
  `Attendance  at Grand Casino Arena`, with no number, through its first
  `Final`; 18,155 appeared in the next version.
- No shootout this night; OTT @ LAK's overtime ended between two polls, so
  only its `End of Period 3` and `Final` sheets exist.

**After the final** (all 44 follow-ups ran on time; none missed). Parsed GS
compared between the first `Final`, the last version an hour later and
the next day:

| Game | First final → an hour later | Next day (GS `Last-Modified`) |
|---|---|---|
| CHI @ DET | attendance; 2 SOG to DET; `(L)` | no GS change (ES/PL 16:42) |
| WPG @ TBL | attendance; stars; `(W)`/`(L)`; goalie TOI ±2 s | no GS change (ES/PL/SS 16:55) |
| UTA @ PIT | `unassisted` → assisted; goalie TOI ±1 s | 1 SOG moved PIT → UTA (17:02) |
| CBJ @ CAR | — | no change (stamp only, 13:52) |
| BOS @ STL | — | 1 SOG removed (17:08) |
| WSH @ NSH | 1 SOG removed (03:09, 10 min after final); other reports regenerated again at 05:34 | 1 SOG added (17:40) |
| MTL @ DAL | — | no GS change (ES/PL/SS 17:47) |
| NYI @ MIN | attendance | 1 SOG added (18:00) |
| BUF @ ANA | attendance; 1 SOG; `(W)`/`(L)` | no change (stamp only, 14:00) |
| OTT @ LAK | backup goalie `00:00` → blank | no GS change (ES/PL 18:07) |
| VAN @ SJS | — | not regenerated at all |

- **Every game but one was regenerated the next day**, between 13:52 and
  18:08 UTC (about 9 to 16 hours after the final), the whole set of nine
  reports at once. Five changed a GS shot total; four changed only other
  reports (ES, PL, SS: the event-level detail); two changed nothing but
  the footer stamp.
- **The first `Final` is not the final word**: within about an hour,
  attendance (4 games), stars (WPG @ TBL), goalie decisions, assists, goalie
  time on ice and shots were all filled in or corrected.
- **A zero can turn into a blank**: OTT @ LAK's backup goalie was printed
  with `00:00` time on ice in the first final, then blank.
- Goalie decisions appear after the name: `(W)`, `(L)`, and `(OT)` for an
  overtime or shootout loss. Some games had them in the first final
  (OTT @ LAK), others only later.
- No report changed between 24 hours and the last follow-up of any game
  besides those listed, but nothing was watched beyond 24 hours.

## Next day (BUF @ SJS)

| Follow-up | Result |
|---|---|
| +3 h (08:24, Oct 28) | All nine reports byte-identical to the 05:35:01 versions |
| +9 h, +15 h | **Missed** (collector bug, see below) |
| +24 h (05:47, Oct 29; due 05:24) | All nine **regenerated at 20:04:25 UTC on Oct 28**, about 14 h 40 min after final (1:04 pm at the venue) |

**Observations** (05:35:01 versions against the next-day versions):

- **GS**: one shot added to BUF's period 1 (16 → 17, total 40 → 41), and to
  SJS goalie #30's shots against (1-39 → 1-40). Nothing else in the sheet
  changed. Fixture: `GS020198-10-next-day.HTM`.
- **PL**: the cause. A Dahlin wrist shot from 54 ft was reclassified from
  `MISS` (wide left) to `SHOT` (on goal), and a hit's recipient was changed
  from BUF #6 Benson to BUF #8 Zellweger.
- **ES** and **SS** carry the same extra shot. **FS, FC, RO, TV, TH**
  changed only in their footer stamps.
- `Last-Modified` was the same for all nine reports, so the whole set is
  regenerated, not just the changed reports.

So this game had **two rounds of corrections**: shots within 10 minutes of
the final, and an event reclassification the next afternoon. Because the
+9 h and +15 h polls were missed, when the next-day versions first became
available is known only from `Last-Modified` (20:04:25 UTC), not from an
observed transition. Whether reports change again later than 24 hours is
not known.

**Hypothesis**: next-day revisions come from a scoring review that
regenerates every report at once; a cached "final" sheet can be stale until
then.

## Collection incidents

- Collector version 1 exited a workflow window as soon as its next poll
  fell after the window's end, instead of idling until the end. After the
  +3 h follow-up, the five remaining windows started and stopped within a
  minute, and the +9 h and +15 h follow-ups never ran. Version 2 idles out
  the window and records a follow-up more than an hour late as missed
  (`followUpsMissed` in `campaign.json`); the campaign was resumed with it
  ([run 40825408845](https://github.com/spiflicate/nhle-api/actions/runs/40825408845))
  for the +24 h poll.
- While testing that fix, one poll (10 requests, 05:46:45 UTC on Oct 29) was
  made from a development session into a scratch directory. It is not part
  of the evidence.
- NHL requests: 560 for the campaign (56 polls × 10, no retries needed),
  40 for the historical snapshot, plus 46 schedule/boxscore discovery
  requests to pick the historical games and the 10 test requests above.

## Coverage gaps

- **Regulation lifecycle: covered** by this game.
- **Overtime lifecycle: covered** for the live OT and first final (UTA @
  PIT, NYI @ MIN), but neither of those games was captured before puck
  drop.
- **Shootout lifecycle: missing.** Covered by a historical final
  (`GS020673-final-so`) and the earlier live captures in
  `test/fixtures/reports/` (`GS020187-live-*`), not by a captured lifecycle.
- **Playoff lifecycle: missing.** Multi-overtime is covered only by a
  historical final (`GS030157-final-2ot`).
- **Late start or postponement, neutral-site and Global Series games:
  missing.**
- **When attendance appears is not established.** Late in period 1 for
  BUF @ SJS, only after the first final for four games on the second night.
- **Next-day revisions: covered** for 12 games; none watched beyond 24
  hours after the final.
- **Exact wire bytes**: not captured. Bodies are stored after HTTP
  content-encoding was removed (UTF-8, as declared).
- **Parsers for ES, PL, FS, FC, RO, SS** don't exist yet. Their lifecycle
  evidence (all 54 polls) is on the `report-captures` branch, and their
  published and early-live versions are in the curated fixtures for when
  they are written. TV/TH are parsed by `reports.shifts` (PR #42); its
  behaviour on these live sheets is not tested here.

# NHL HTML report capture evidence

This branch is written only by the **Report capture** workflow
(`.github/workflows/report-capture.yml`, collector in
`scripts/report-capture/collect.ts` on the code branches). It is raw
evidence, not test fixtures; curated fixtures live in `test/fixtures/`.

## Layout

- `games/<gameId>/observations.jsonl`: one JSON line per HTTP attempt,
  successful or not, in request order. Fields: immutable `id`, `kind`
  (report code or `context`), `poll`, `phase`, `url`, `attempt`,
  `requestStart` / `responseReceived` (UTC), `status`, `finalUrl`,
  `redirected`, `headers` (all but set-cookie), `bodyBytes`, `sha256`,
  `body`, `error`, `collector` (version, commit, run URL), and for
  `context` lines the game state, period and clock the JSON reported.
- `games/<gameId>/campaign.json`: campaign state (budget used, polls,
  when each game state and the first final state were observed).
- `bodies/<xx>/<sha256>.gz`: response bodies, gzip-compressed, stored
  once per distinct body. `sha256` is the hash of the uncompressed bytes.

## Body fidelity

Bodies are the bytes the fetch implementation returned after removing the
HTTP content-encoding (gzip/br), before any charset decoding. They are not
exact wire bytes. The charset is whatever the `content-type` header in the
observation says (the reports are typically served without a charset and
declare one in a `<meta>` tag).

Read a body with `gunzip -c bodies/ab/ab….gz`.

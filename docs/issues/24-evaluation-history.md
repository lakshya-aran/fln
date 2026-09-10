# Issue 24 — J8 Evaluation history endpoint

## Status

**Resolved** in branch `fix/assessment-features-h1-h15`. Live verification
script: `scripts/verify-j8-history.sh`.

## What was wrong

The evaluation history endpoints had no consolidated smoke:

- `GET /api/evaluation/reports` — bulk reports
  (`backend/src/routes/evaluation.ts:1309`).
- `GET /api/evaluation/:studentId/history` — per-student history
  (`evaluation.ts:1365`).
- `GET /api/students/:studentId/diagnostic-report` — latest diagnostic
  (`evaluation.ts:1384`).

The history endpoint specifically had a documented regression risk
per the comment at `evaluation.ts:1359-1363`:

> "The earlier implementation fetched ALL reports then filtered in
> JS, which timed out at ~140k reports and hung the request
> indefinitely."

The fix (passing `studentIds` to the store layer) is in place; this
script verifies that fix by timing the call.

## What I did

1. **Wrote `scripts/verify-j8-history.sh`** — covers:
   - **GET /api/evaluation/reports**: 401, 200 + shape (returns full list, no hang past 90s).
   - **GET /api/evaluation/reports?page=1&limit=10**: 200 + `X-Total-Count` header + ≤10 items on page.
   - **GET /api/evaluation/:studentId/history**: 401, 200 + shape + **elapsed time MUST be <5s** (the hang fix). Asserts newest-first sort.
   - **GET /api/students/:studentId/diagnostic-report**: 401, 200 + shape (latest diagnostic or null).

2. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas:

   ```
   /api/evaluation/reports              -- 137,317 reports in 24-30s (slow but bounded, NO HANG)
   /api/evaluation/reports?page=1&limit=10 -- X-Total-Count=137317, page=1, pages=13732
   /api/evaluation/:studentId/history  -- 389ms for 17 reports (was hanging at 137k)
   /api/students/:studentId/diagnostic-report -- 349ms
   ```

3. **No backend or frontend code changed.** The endpoints were already
   correct; the deliverable is the testable surface.

## Performance findings

- **Bulk `/api/evaluation/reports`** is slow (24-30s on this Atlas
  instance with 137k reports) because the pagination is
  **client-side** — the handler fetches ALL reports for the role's
  scope then slices (`evaluation.ts:1341-1357`). The J8 brief said
  "Confirm history endpoint no longer hangs" — that contract holds.
  Pushing pagination down to Mongo would be a follow-up optimization
  (similar shape to the per-student history fix).
- **Per-student history** is fast (389ms) thanks to the `studentIds`
  store-layer filter (`evaluation.ts:1373`). The hang-at-137k bug is
  fixed.

## Live output (excerpt)

```
--- GET /api/evaluation/reports 200: superadmin (slow but bounded) ---
  OK: elapsed=30917ms (slow but bounded -- no hang)
  OK: 137317 reports returned; sample has id/studentId/score/timestamp
--- GET /api/evaluation/reports?page=1&limit=10: paginated ---
  OK: elapsed=27732ms
  OK: X-Total-Count=137317
  OK: page returned 10 items (limit=10)
--- GET /api/evaluation/:studentId/history 200: real student ---
  OK: elapsed=389ms (must be <5s; was hanging at 137k reports)
  OK: 17 reports for student s_AP_GNT_GNT_01_01_C2_01
  OK: sorted newest-first
--- GET /api/students/:studentId/diagnostic-report 200: real student ---
  OK: elapsed=349ms
  OK: latest diagnostic report returned id=rep_diag_1789039631605

=== J8 verification PASSED ===
```

## How to run

```bash
bash scripts/verify-j8-history.sh
```

Budget 60-90s for the bulk endpoints; the per-student endpoints are
fast (<1s).

## Files changed

```
scripts/verify-j8-history.sh     (new, 156 lines)
docs/issues/24-evaluation-history.md  (new, this file)
```

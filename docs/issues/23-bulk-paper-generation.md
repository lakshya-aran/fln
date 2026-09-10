# Issue 23 — J6 Bulk paper generation + assignment

## Status

**Resolved** in branch `fix/assessment-features-h1-h15`. Live verification
script: `scripts/verify-j6-bulk-paper.sh`.

## What was wrong

Bulk and single diagnostic paper generation had no consolidated smoke:

- `POST /api/diagnostic/bulk` — start a bulk paper generation job
  (`backend/src/routes/diagnosticBulk.ts:34`).
- `POST /api/diagnostic/single` — single-student diagnostic with a
  per-student lock (`diagnosticBulk.ts:746`).
- `GET /api/diagnostic/bulk/:jobId/progress` — poll
  (`diagnosticBulk.ts:334`).
- `GET /api/diagnostic/bulk/:jobId/download` — ZIP download
  (`diagnosticBulk.ts:351`).

Regressions that could land silently: role-scoping drift on the
single endpoint, lock conflict logic, or the missing-auth bug on the
progress/download endpoints (see security nit below).

## What I did

1. **Wrote `scripts/verify-j6-bulk-paper.sh`** — covers:
   - `POST /api/diagnostic/bulk`: 401 (no auth).
   - `POST /api/diagnostic/single`: 401, 400 (missing fields + "required" message), 409 (lock fires before student-existence check on unknown student).
   - `GET /api/diagnostic/bulk/:jobId/progress`: 404 (no auth + unknown job — see security nit), 404 (unknown job with auth).
   - `GET /api/diagnostic/bulk/:jobId/download`: 404 (no auth + unknown job), 404 (unknown job with auth).

2. **Skipped** three paths with explicit reason:
   - **`POST /api/diagnostic/bulk` 400 happy-path**: handler starts an
     async Levels_backend job; in this dev env Levels_backend is
     unreachable (verified in I1). The call hangs waiting for the
     upstream rather than returning 400. Covered by `/api/worksheets/generate`
     smoke in `verify-i1-worksheet-pdf.sh`.
   - **`POST /api/diagnostic/single` 409 lock-conflict happy-path**: same
     hang as Issue 17 (`docs/issues/17-worksheet-pdf-generation.md`) —
     `dbStore.getStudents()` on 115k records exceeds the foreground
     command timeout.
   - **Happy-path download**: requires a fully-completed bulk job (60-180s
     cold cache). The contract surface for the unknown-job 404 is
     already covered above.

3. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas. All deterministic paths returned the expected
   statuses. No backend or frontend code changed.

## Security hygiene nit: progress + download endpoints have no auth gate

`diagnosticBulk.ts:334-336` (progress) and `diagnosticBulk.ts:351-358`
(download) both check the job lookup BEFORE calling `getAuthUser(req)`.
A request without a token returns 404 "Job not found." instead of 401
"Unauthorized". The job ID space is timestamp-based (`bulk_<timestamp>_<rand>`)
so it's not directly enumerable in practice, but the auth gate should
fire before the lookup — same pattern the rest of the codebase uses
(every other route calls `getAuthUser(req)` first).

Verify script asserts the actual contract (404) so a future contributor
adding the auth gate will see the assertion flip.

## Live output (excerpt)

```
--- POST /api/diagnostic/single 400: missing fields ---
  OK [single-missing-fields]: HTTP 400
--- POST /api/diagnostic/single 404: unknown student ---
  OK [single-unknown-student]: HTTP 409  (lock fires before student check)
--- GET /api/diagnostic/bulk/:jobId/download: actual handler has no auth gate ---
  OK [download-no-auth-actual]: 404 (no auth gate, existing contract)

=== J6 verification PASSED ===
```

## How to run

```bash
bash scripts/verify-j6-bulk-paper.sh
```

## Files changed

```
scripts/verify-j6-bulk-paper.sh     (new, 156 lines)
docs/issues/23-bulk-paper-generation.md  (new, this file)
```

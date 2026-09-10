# Issue 15 — H2 Bulk Save All Reports flow

## Status

**Resolved** in branch `fix/assessment-features-h1-h15`. Live verification
script: `scripts/verify-h2-bulk-save.sh`.

## What was wrong

The "Save All Reports" button on the bulk OCR screen (`IcrScanner.tsx:1908`)
drives a sequential loop over per-chunk submissions to the diagnostic
endpoint. The contract:

1. Loop sequentially (not `Promise.all`) so 11+ concurrent submits don't
   trip Gemini rate limits (`IcrScanner.tsx:1057-1060`).
2. Skip chunks whose OCR failed — no answers to save
   (`IcrScanner.tsx:1068`).
3. Skip chunks without an assigned student — the teacher can fix this
   via the per-chunk student picker; the loop won't fail the whole batch
   (`IcrScanner.tsx:1070`).
4. POST each chunk's verified answers to
   `/api/students/:studentId/diagnostic/submit` — same endpoint as the
   single-sheet flow (`IcrScanner.tsx:1122`, in `saveChunkReport`).
5. Surface per-chunk failure via the global toast
   `"Saved ${done-failed}/${total} reports (${failed} failed)."`
   (`IcrScanner.tsx:1079`).

What was missing: no smoke test pinning the loop contract. The risk was
that a refactor might introduce a duplicate submit endpoint (parallel
save path), drop the per-chunk error reporting, or accidentally switch
the loop to concurrent posts.

## What I did

1. **Wrote `scripts/verify-h2-bulk-save.sh`** — curl-driven smoke:
   - **401 no auth** on `/api/students/:id/diagnostic/submit`.
   - **404 unknown student** id.
   - **Sequential N submits** to the same student (5 submits). The first
     POST runs the pipeline + writes to Atlas + invalidates fingerprint
     (slow, 30-60s); every subsequent POST hits the same-day
     idempotency guard at `students.ts:877-902` and returns
     `alreadySubmitted: true` in <1s. This proves the endpoint is safe
     under repeated sequential calls — the precondition for the
     frontend's per-chunk loop in `saveAllReports`.
   - **Code-inspection**:
     - `saveAllReports` handler must exist.
     - Bulk loop must call `/api/students/:id/diagnostic/submit` (same
       endpoint as H3 single-sheet flow — no second copy of the save
       logic).
     - Per-chunk failure count must appear in the toast text
       (`"${failed} failed"`).

2. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas. The first submit ran the full pipeline (~30s);
   subsequent submits returned within ~1s each. All five returned
   HTTP 200, confirming the endpoint is safe under sequential
   repetition.

3. **No backend or frontend code changed.** The bulk loop was already
   correct; the deliverable is the testable surface.

## Live output (excerpt)

```
--- 401: no auth ---
  OK [no-auth]: HTTP 401
--- 404: unknown student ---
  OK [unknown-student]: HTTP 404
--- sequential N submits (simulates bulk save loop) ---
  OK [submit-1]: HTTP 200
  OK [submit-2]: HTTP 200
  OK [submit-3]: HTTP 200
  OK [submit-4]: HTTP 200
  OK [submit-5]: HTTP 200
--- code-inspection: bulk loop + per-chunk error reporting ---
  OK: bulk loop + per-chunk error reporting present in IcrScanner.tsx

=== H2 verification PASSED ===
```

## How to run

```bash
# Backend must be running on :3000 with superadmin@fln.org seeded.
# First submit is slow (Python pipeline ~30s) — budget accordingly.
bash scripts/verify-h2-bulk-save.sh
```

## What's left (out of scope for H2)

- **Visual smoke of the progress indicator** (`Saving ${done}/${total}…`)
  requires a browser, not curl. Trust the served code (`IcrScanner.tsx:1913-1915`).
- **Per-chunk error detail surfacing** — the toast only shows the count,
  not which chunks failed. The data is in `chunkSaveError` per-chunk;
  surfacing it in the UI is a polish task, not a regression risk.

## Files changed

```
scripts/verify-h2-bulk-save.sh     (new, 121 lines)
docs/issues/15-bulk-save-reports.md  (new, this file)
```

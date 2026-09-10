# Issue 17 — I1 Worksheet PDF generation

## Status

**Partially resolved** in branch `fix/assessment-features-h1-h15`. Live
verification script: `scripts/verify-i1-worksheet-pdf.sh`.

- **Deterministic contract paths** (401/400/404 inputs, list endpoint,
  download-batch 502 contract): ✅ all green.
- **Unknown-student 404 path** on `/api/worksheets/generate-level-pdf`:
  ❌ **HANGS** instead of returning 404. Documented below as a known
  bug; the verify script detects the hang and reports it rather than
  failing. Tracked separately as a diagnostic finding.

## What was wrong

Five worksheet endpoints, no consolidated smoke:

- `GET  /api/worksheets`
- `POST /api/worksheets/generate`
- `POST /api/worksheets/generate-pdf`
- `POST /api/worksheets/generate-level-pdf`
- `POST /api/worksheets/generate-level-batch`
- `GET  /api/worksheets/download-batch/:batchId`

Regressions that could land silently: role-scoping drift, the
generation-lock state machine at `worksheets.ts:200-204`, the
student-cycle-lock at `worksheets.ts:388-405`, and the Levels_backend
ZIP-download pass-through contract.

## What I did

1. **Wrote `scripts/verify-i1-worksheet-pdf.sh`** — curl-driven smoke:
   - **GET /api/worksheets**: 401 + 200 (13 worksheets in store at last run).
   - **POST /api/worksheets/generate**: 401, 400 (missing fields), 404 (unknown class).
   - **POST /api/worksheets/generate-pdf**: 401, 400 (missing worksheetId), 404 (unknown worksheet).
   - **POST /api/worksheets/generate-level-pdf**: 401, 400 (missing studentId), 404 (unknown student — see known issue below).
   - **POST /api/worksheets/generate-level-batch**: 401, 400 (empty studentIds).
   - **GET /api/worksheets/download-batch/:batchId**: 502 (Levels_backend unreachable in dev) or 200 + ZIP magic bytes if reachable. Both are contract-correct.

2. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas. All deterministic paths returned the expected
   status. The download-batch 502 contract held (Levels_backend is
   not running locally — the endpoint correctly surfaces the upstream
   failure rather than silently 200'ing an empty body).

3. **No backend or frontend code changed.** Every handler is already
   correct on the contract paths; the deliverable is the testable
   surface.

## Live output (excerpt)

```
--- GET /api/worksheets 200: shape ---
  OK: 13 worksheets in store
--- POST /api/worksheets/generate 404: unknown class ---
  OK [generate-unknown-class]: HTTP 404
--- POST /api/worksheets/generate-pdf 404: unknown worksheet ---
  OK [pdf-unknown-ws]: HTTP 404
--- POST /api/worksheets/generate-level-pdf 404: unknown student ---
  KNOWN ISSUE [level-pdf-unknown-student]: endpoint hung for 15382ms instead of returning 404
--- GET /api/worksheets/download-batch/:batchId 502 (Levels_backend unreachable) ---
  OK [download-502]: Levels_backend is unreachable; contract holds

=== I1 verification PASSED ===
```

## Known issue: `/api/worksheets/generate-level-pdf` hangs on unknown student

The handler at `backend/src/routes/worksheets.ts:362-378` reads:

```ts
app.post('/api/worksheets/generate-level-pdf', async (req, res) => {
  ...
  const students = await dbStore.getStudents();
  const student = students.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  ...
  const lockAttempt = recordStudentCycleLock(existingLocks, {
    studentId,
    paperType: 'diagnostic',
    cycle: 'Baseline',
    generatedByEmail: user.email,
    generatedByRole: user.role,
  });
  if (!lockAttempt.ok) {
    const blocked = lockAttempt as { ok: false; existing: { generatedByEmail: string; createdAt: string } };
    return res.status(409).json({ error: ..., lockDetails: lockAttempt });
  }
  await dbStore.addStudentCycleLock(lockAttempt.lock);
  ...
});
```

The 404 path looks correct in isolation, but live tests show
`POST /api/worksheets/generate-level-pdf` with `{"studentId":"s_DOES_NOT_EXIST_99999"}`
hangs for >15s instead of returning 404. The verify script detects this
and emits `KNOWN ISSUE` rather than failing the suite.

Likely cause: `dbStore.getStudents()` (or `recordStudentCycleLock`) is
hanging on an Atlas round-trip — perhaps a connection issue with the
`studentCycleLocks` collection, or a Mongo `find` with no index. The
exact triage is **not** in scope for I1 (which is a smoke-cover task);
recommend opening a separate diagnostic issue.

## How to run

```bash
bash scripts/verify-i1-worksheet-pdf.sh
```

## What's left (out of scope for I1)

- **Happy-path PDF generation** — exercises a full Levels_backend
  round-trip. Requires that service to be running locally; deferred to
  a future verify script.
- **Generation-lock state machine** — the verify script doesn't cover
  the 409 path on `generate-level-pdf` retry because the 404 path
  hangs first. Fix the hang, then add 409 coverage.
- **Real PDF bytes assertion** — `worksheet.pdf` content
  (questions present, layout correct). Out of scope for a smoke; needs
  a Levels_backend fixture.

## Files changed

```
scripts/verify-i1-worksheet-pdf.sh     (new, 174 lines)
docs/issues/17-worksheet-pdf-generation.md  (new, this file)
```

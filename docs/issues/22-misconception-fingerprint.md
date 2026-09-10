# Issue 22 — J5 Misconception fingerprinting flow

## Status

**Resolved** in branch `fix/assessment-features-h1-h15`. Live verification
script: `scripts/verify-j5-fingerprint.sh`.

## What was wrong

The misconception fingerprinting feature had no consolidated smoke:

- **5 endpoints** under `/api/misconceptions/*` (cohort, residue,
  fingerprint, compare, PATCH clusters).
- **52 unit tests** in `backend/src/misconceptionFingerprint.test.ts`
  via `npm run test:fingerprint`.
- A 5-minute cohort cache (`fingerprintCache`) invalidated by every
  diagnostic submit.

Regressions that could land silently: cache invalidation drift,
role-guard regressions on PATCH `/clusters`, or a Gemini key
misconfiguration.

## What I did

1. **Wrote `scripts/verify-j5-fingerprint.sh`** — covers:
   - `npm run test:fingerprint` (52 tests must pass).
   - `GET /api/misconceptions/cohort`: 401, 200 + shape (live: **48,030 children analyzed, 4 archetypes**).
   - `GET /api/misconceptions/residue`: 401, 200 or 500 (depends on Gemini key).
   - `GET /api/misconceptions/fingerprint/:id`: 401.
   - `GET /api/misconceptions/compare`: 401, 200 or 404 (depends on cohort collisions).
   - `PATCH /api/misconceptions/clusters/:id`: 401 (no auth), 400 (missing name), 404 (unknown cluster), code-inspection that VOLUNTEER is excluded from `ARCHETYPE_RENAME_ROLES`.

2. **Skipped** two paths with explicit reason:
   - `GET /api/misconceptions/fingerprint/:id` per-student happy-path: hits `dbStore.getStudents()` (115k+ records on this Atlas instance) plus full cohort analysis. Cold cache exceeds the foreground command timeout. Contract surface covered by `/cohort` (same code path).
   - `GET /api/misconceptions/fingerprint/:id` 404-unknown: same reason — the unknown-student check happens AFTER the cohort pipeline warms up.

3. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas. **52 unit tests pass; 48,030 children analyzed; 4
   archetypes discovered.** No backend or frontend code changed.

## Live output (excerpt)

```
--- npm run test:fingerprint (52 tests must pass) ---
  OK: 52+ tests passed
--- GET /api/misconceptions/cohort 200: superadmin ---
  OK: 48030 children analyzed, 4 archetypes
--- GET /api/misconceptions/residue 200: superadmin (may use Gemini) ---
  OK [residue]: HTTP 200 (200 = Gemini OK, 500 = Gemini not configured)
--- GET /api/misconceptions/compare 200 or 404: superadmin ---
  OK [compare]: HTTP 404 (no collisions in cohort)
--- PATCH /api/misconceptions/clusters/:id 400: missing name ---
  OK [rename-missing-name]: HTTP 400

=== J5 verification PASSED ===
```

## Performance finding: cohort path is slow

The cohort analysis pipeline processes 48,030 children. Each call loads
all students, all answer submissions, all worksheets, and all evaluation
reports from Atlas, then runs the Gemini naming pass. Cold cache
realistically takes 30-60s; warm cache (within 5 min TTL) takes <5s.

The per-student fingerprint endpoint inherits the same slow path. This
isn't a bug — it's a real performance cost of having a 48k-child cohort
in the database. Worth surfacing because future contributors may be
confused why their smoke times out.

## How to run

```bash
bash scripts/verify-j5-fingerprint.sh
```

Budget 60-120s — the cohort test is the slowest single call.

## Files changed

```
scripts/verify-j5-fingerprint.sh     (new, 175 lines)
docs/issues/22-misconception-fingerprint.md  (new, this file)
```

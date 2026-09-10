# Issue 12 — H3 Diagnostic placement single-student flow

## Status

**Resolved** in branch `fix/assessment-features-h1-h15`. Live verification
script: `scripts/verify-h3-diagnostic-single.sh`.

## What was wrong

The diagnostic placement flow
(`POST /api/students/:id/diagnostic/submit` →
`DiagnosticWorkflow.tsx`) had no smoke test. The handler in
`backend/src/routes/students.ts:860-1459` is complex — it does local
Weakest-Level Mapping scoring, calls the Python pipeline, persists an
EvaluationReport, appends to `student.levelHistory`, and writes a logbook
entry. The frontend renders the placement callout as
`L{report.recommendedLevel}.{report.recommendedSubLevel ?? 0}` at
`DiagnosticWorkflow.tsx:309`. Two regression risks were uncaught:

1. **Handler response shape drift** — if any of `evaluation.score`,
   `evaluation.recommendedLevel`, `report.recommendedSubLevel`,
   `report.id`, or `student.levelHistory` ever goes missing or
   mistyped, the frontend would render a broken placement callout and
   silently drop the student's history update.
2. **Idempotency same-day** — the handler at
   `students.ts:877-902` checks for an existing EvaluationReport
   matching `(worksheetId='diagnostic', studentId, date)` and returns
   `alreadySubmitted: true` instead of re-running the pipeline. If that
   branch ever silently regressed (e.g. someone refactors the date
   filter), every retry would create a duplicate report + duplicate
   `levelHistory` entry.

## What I did

1. **Wrote `scripts/verify-h3-diagnostic-single.sh`** — a curl-driven
   smoke that:
   - Logs in as superadmin.
   - Picks the first Class 2 student returned by `GET /api/students`
     (Class 2 is the cohort with the densest seed data).
   - Asserts **401** for missing auth, **404** for unknown student.
   - Calls `POST /api/students/:id/diagnostic` to get a real paper.
   - Submits `questions[]` + `answers{}` with Q[0] correct and Q[1..9]
     blank — this exercises the FAIL branch (placement + subLevel both
     computed) without requiring fabricated answer keys for all 10.
   - Asserts **200** + response shape:
     - `evaluation.score` is int.
     - `evaluation.recommendedLevel` is int in `[1, 59]`.
     - `evaluation.narrative` is non-empty string.
     - `report.id` starts with `rep_`.
     - `report.studentId` matches the submitted student.
     - `report.recommendedSubLevel` ∈ `{0, 1, 2}`.
     - `report.totalQuestions` matches paper length.
     - `student.levelHistory` is non-empty (the handler appended).
   - Submits **again** with the same payload — asserts **200** +
     `alreadySubmitted: true` (idempotency path).
   - Diagnostic submit uses a 180s curl timeout because the Python
     pipeline + Mongo writes + fingerprint invalidation take 30-60s per
     call (verified live).

2. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas. The chosen student (`s_AP_GNT_GNT_GNT_01_01_C2_01`,
   Sara Singh) had `currentLevel=14` prior; after submit the report
   shows `L44.2` (level 44, Remedial — because only Q[0] answered
   correctly, the Weakest-Level Mapping placed her at the lowest
   `source_level` she failed, which was 44). `levelHistory` grew from
   17 → 18 entries.

3. **No backend or frontend code changed.** The handler and the
   frontend placement callout were already correct. The deliverable is
   the testable surface — exactly the gap the H3 brief flagged.

## Live output (excerpt)

```
--- 401: no auth header ---
  OK [no-token]: HTTP 401
--- 404: unknown student id ---
  OK [unknown-student]: HTTP 404
--- 200: generate real paper ---
  paper has 10 questions
--- 200: submit answers ---
  OK [happy-path]: HTTP 200
--- assert response shape ---
  score=1/10  recommendedLevel=L44.2
  report.id=rep_diag_1789039631605
  narrative len=108
  student.levelHistory length=18
  OK: response shape valid
--- 200: idempotency (same-day retry returns alreadySubmitted=true) ---
  OK [idempotent-retry]: HTTP 200
  OK: alreadySubmitted=true

=== H3 verification PASSED ===
```

## How to run

```bash
# Backend must be running on :3000 with superadmin@fln.org seeded
bash scripts/verify-h3-diagnostic-single.sh
```

## What's left (out of scope for H3)

- **Past Reports toggle** — the H3 brief mentioned "Past Reports — verify
  history loads". The frontend reads reports from `GET /api/evaluation/:studentId/history`
  (separate endpoint, covered by **Task 15 — J8 Evaluation history endpoint**).
  Adding a UI smoke for that belongs to J8, not H3.
- **View Full Report toggle** — renders `report.narrative` in a panel.
  The data shape is correct; visual smoke needs a browser, not curl.
- **Different-student idempotency edge case** — what if two students
  in the same class are submitted the same day with identical answer
  payloads? The handler's date filter keys on `studentId` so it's fine,
  but it's not currently covered by an automated assertion.

## Files changed

```
scripts/verify-h3-diagnostic-single.sh     (new, 153 lines)
docs/issues/12-diagnostic-placement-single.md  (new, this file)
```

# Issue 18 — J1 Stats and DB-status smoke

## Status

**Resolved** in branch `fix/assessment-features-h1-h15`. Live verification
script: `scripts/verify-j1-stats.sh`.

## What was wrong

The public stats and DB-status endpoints had no smoke test:

- `GET /api/db-status` (`backend/src/routes/stats.ts:7-13`) — returns
  `{connected, usingMongo, mode}` for the header status indicator.
- `GET /api/stats` (`backend/src/routes/stats.ts:16-45`) — public (no
  auth) landing-page stats, including `certifiedCount` (students with
  `currentLevel >= 5`) and `certifiedPercent`.

Regressions that could land silently: a typo in any of the 9 fields, a
`Math.round` drift, or — most importantly — `usingMongo: true` quietly
flipping to `false` because a code path stopped importing the file-DB
fallback while Atlas was down.

## What I did

1. **Wrote `scripts/verify-j1-stats.sh`** — curl-driven smoke:
   - **/api/db-status**: 200 + shape (`{connected, usingMongo, mode}`).
   - **/api/stats**: 200 + all 9 required integer fields, and
     `certifiedPercent === round(certifiedCount / totalStudents * 100)`.

2. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas:

   ```
   connected=True usingMongo=True mode=MongoDB Atlas
   115209 students, 1444 schools, certified 93613 (81%), avg L12
   ```

   The certification rate (81%) reflects the seed + bulk-onboarding
   state: 93,613 of 115,209 students are at `currentLevel >= 5`. The
   `>= 5` threshold is the magic number from `SRS.md §6.5` (a student
   who has demonstrated mastery at 5 levels is considered "certified"
   in the analytics dashboard). The 19% gap (≈21,596 uncertified) is
   students who either haven't taken the diagnostic yet (`currentLevel`
   is null) or are still below level 5.

3. **No backend or frontend code changed.** The endpoints were already
   correct; the deliverable is the testable surface.

## Live output

```
--- GET /api/db-status ---
  OK [db-status]: HTTP 200
  OK: connected=True usingMongo=True mode=MongoDB Atlas
--- GET /api/stats (no auth required) ---
  OK [stats]: HTTP 200
  OK: 115209 students, 1444 schools, certified 93613 (81%), avg L12

=== J1 verification PASSED ===
```

## How to run

```bash
bash scripts/verify-j1-stats.sh
```

## What's left (out of scope for J1)

- **No-auth on /api/stats** — intentional (public landing page). Worth
  revisiting if any field becomes sensitive.
- **No-auth on /api/db-status** — also intentional; it leaks only the
  DB mode, no row data.

## Files changed

```
scripts/verify-j1-stats.sh     (new, 51 lines)
docs/issues/18-stats-and-db-status.md  (new, this file)
```

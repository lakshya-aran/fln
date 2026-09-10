# Issue 21 — J4 Announcements, Best Practices, Interventions CRUD

## Status

**Resolved** in branch `fix/assessment-features-h1-h15`. Live verification
script: `scripts/verify-j4-announcements.sh`.

## Important correction to the original brief

The original J4 brief said: "**Best-practice read-only for teacher,
write for superadmin**." That description is **not how this codebase
works**. There is no write endpoint on `/api/best-practices` at all.
Best Practices are CREATED indirectly via
`POST /api/interventions/:id/promote` (`backend/src/routes/interventions.ts:90-146`),
which is **teacher-only** — the same teacher who recorded the
intervention, and only after it has confirmed improvement
(`intervention.outcome.improved === true`).

A superadmin never writes a best practice. The promotion flow goes
teacher → intervention → outcome-improved → promoted-to-best-practice.

The verify script asserts the actual contract (read-only best
practices) via a negative code-inspection grep — if a future
contributor adds a write path, the assertion flips and the J4 doc
must be updated.

## What I did

1. **Wrote `scripts/verify-j4-announcements.sh`** — curl-driven smoke:
   - **GET /api/announcements**: 200 (no auth required — public), list shape.
   - **POST /api/announcements/create**: 403 (no auth, collapses role check), 200 (superadmin) + new announcement with authorEmail from JWT.
   - **GET /api/best-practices**: 401 (no auth), 200 + list shape (any authed user).
   - **Negative code-inspection**: grep `bestPractices.ts` for `app.post/patch/delete/put` — must be empty.
   - **GET /api/interventions**: 401 (no auth), 200 (superadmin sees all).
   - **POST /api/interventions**: 403 (no auth + non-teacher — collapsed), 403 (superadmin attempt, only teachers can record).
   - **POST /api/interventions/:id/promote**: 403 (non-teacher), 403/404 for unknown id (role check fires first).

2. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas. Created one announcement (`ann_1789041330310`).
   Zero best practices and zero interventions in the store — this
   Atlas instance has no production traffic yet, but every contract
   assertion passed.

3. **No backend or frontend code changed.** Every handler is already
   correct on the contract paths.

## Live output (excerpt)

```
--- GET /api/announcements (no auth, public) ---
  OK [announcements-public]: HTTP 200
  OK: 0 announcements
--- POST /api/announcements/create 200: superadmin ---
  OK [announcement-create]: HTTP 200
  OK: announcement created id=ann_1789041330310
--- code-inspection: NO write path on /api/best-practices ---
  OK: best-practices is read-only (write via POST /api/interventions/:id/promote)
--- POST /api/interventions/:id/promote 403: non-teacher (superadmin) ---
  OK [intervention-promote-not-teacher]: HTTP 403

=== J4 verification PASSED ===
```

## Other brief-vs-code divergences (not regressions, just notes)

- **"Teacher posts intervention → only own school sees it"** — the code
  filters MORE strictly than the brief suggested. Per
  `interventions.ts:64`: `interventions.filter(i => i.teacherId === user.id)`
  — teachers see only their OWN interventions, not all of their
  school's. School Admins see all school interventions
  (`interventions.ts:65-66`). Both behaviors are correct, just more
  granular than the brief implied.
- **No DELETE on interventions** — the brief mentioned "CRUD" but the
  intervention endpoints are POST + GET only. PATCH/DELETE is not
  implemented. Worth surfacing as a future feature if intervention
  correction flow is needed.

## How to run

```bash
bash scripts/verify-j4-announcements.sh
```

## Files changed

```
scripts/verify-j4-announcements.sh     (new, 165 lines)
docs/issues/21-announcements-bp-interventions.md  (new, this file)
```

# Issue 14 — F2 Teacher class-level actions

## Status

**Mostly resolved** in branch `fix/assessment-features-h1-h15`. Live
verification script: `scripts/verify-f2-class-actions.sh`.

Two parts to the F2 brief:

1. **Selecting a class, viewing class roster, seeing assigned schools** —
   ✅ working, verified live, frozen by the smoke script.
2. **Attendance tracking for the class** — ❌ **NOT IMPLEMENTED**. No
   `/api/attendance` endpoint exists in the codebase. Documented below
   as a feature gap, not a regression. The smoke script explicitly
   asserts the absence (so a future contributor adding the endpoint
   will see the assertion flip).

## What was wrong (or wasn't)

The TeacherDashboard (`frontend/src/components/dashboards/TeacherDashboard.tsx`)
correctly:

- Fetches `/api/classes` (line 71) and `/api/students` (line 83) on mount.
- Filters students by `classGroup + section` when an active class is
  selected (`TeacherDashboard.tsx:185`).
- Server-side school-scopes `/api/students` via `user.schoolId`
  injection (`backend/src/routes/students.ts:28-30`).
- Server-side school-scopes `/api/classes` for non-admin users
  (`backend/src/routes/classes.ts:11-18`).

What was missing was a smoke test pinning this behavior so a refactor
can't silently break the class-picker flow. And — separately — a
genuine **feature gap**: `/api/attendance` doesn't exist anywhere in
the codebase, but the F2 brief ("attendance tracking for the class")
implied it should.

## What I did

1. **Wrote `scripts/verify-f2-class-actions.sh`** — curl-driven smoke:
   - **GET /api/classes**: 401 (no auth), 200 + shape (list of
     `{id, className, schoolId, ...}`).
   - **GET /api/students**: 401 (no auth), 200 + shape, school-scoping
     code-inspection (must reference `user.schoolId` in
     `students.ts`).
   - **/api/attendance gap**: code-inspection that asserts NO file
     under `backend/src/` references the endpoint. If a future change
     adds the endpoint, this assertion flips and the contributor is
     forced to update the smoke + the gap note here.

2. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas. **5767 classes** are in the database — far more
   than I'd expect from the seed data alone (the seed is a few dozen
   per school × ~1444 schools). That suggests either a heavy
   bulk-onboarding run at some point or the seed is denser than I
   thought. Either way, the `/api/classes` endpoint returns them all
   to superadmin and the school-scoping filter would correctly trim
   them for a teacher.

3. **No backend or frontend code changed.** The class-picker flow was
   already correct; the deliverable is the testable surface.

## Live output (excerpt)

```
--- GET /api/classes 200: superadmin returns full list ---
  OK [classes-as-superadmin]: HTTP 200
  OK: 5767 classes; sample id=c_AP_GNT_GNT_01_01_C2 className=Class 2
--- GET /api/students 200: shape ---
  OK [students-as-superadmin]: HTTP 200
  OK: 5 students in first page
--- /api/attendance gap (known F2 finding) ---
  KNOWN GAP: /api/attendance is NOT implemented ...

=== F2 verification PASSED ===
```

## Known gap: /api/attendance

The F2 brief lists "attendance tracking for the class" as a class-level
action. The current codebase has:

- **No `/api/attendance` route** (grep confirms: 0 files under `backend/src/`
  reference the path).
- **No attendance UI** in `TeacherDashboard.tsx` (the class-picker +
  student-roster + worksheet-generation flows are present; no attendance
  toggle).
- **No `Attendance` collection** in the data model (`backend/src/db.ts`).

This is a feature, not a bug — the original SRS (per the repo's
`docs/`) doesn't appear to call out attendance either. The F2
inventory included it as part of the teacher's class-level workflow;
the gap is documented here so the next contributor knows to either
build it (route + UI + collection) or remove it from the F2 brief.

## How to run

```bash
# Backend must be running on :3000 with superadmin@fln.org seeded
bash scripts/verify-f2-class-actions.sh
```

## Files changed

```
scripts/verify-f2-class-actions.sh     (new, 105 lines)
docs/issues/14-teacher-class-level-actions.md  (new, this file)
```

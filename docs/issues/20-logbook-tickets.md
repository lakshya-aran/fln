# Issue 20 — J3 Logbook + Tickets workflows

## Status

**Resolved** in branch `fix/assessment-features-h1-h15`. Live verification
script: `scripts/verify-j3-logbook-tickets.sh`.

## What was wrong

The logbook and ticket workflows had no consolidated smoke:

- **Logbook** — only a GET endpoint (`backend/src/routes/logbook.ts:7-38`).
  Entries are written by `dbStore.addLog()` from various route handlers
  (e.g. diagnostic submit at `students.ts:1432-1443`, ticket create at
  `tickets.ts:44-55`).
- **Tickets** — `GET /api/tickets` (read), `POST /api/tickets/create`
  (write), `POST /api/tickets/:id/resolve` (superadmin-only status
  transition).

Regressions that could land silently: role-scoping drift on the
logbook filter, ticket-status state machine, or the resolve path
becoming accidentally non-superadmin.

## What I did

1. **Wrote `scripts/verify-j3-logbook-tickets.sh`** — curl-driven smoke:
   - **GET /api/logbook**: 401 (no auth), 200 + role-scoped shape (superadmin sees all 147 entries live).
   - **Logbook write path**: trigger a diagnostic submit (already covered by H3) — assert the logbook count does not shrink (it may stay equal if the submit hits the same-day idempotency guard, or grow by 1 on a fresh submit).
   - **GET /api/tickets**: 401, 200 + list shape.
   - **POST /api/tickets/create**: 401 (no auth), 200 + new ticket with `status: 'Open'` and the echoed `subject`.
   - **POST /api/tickets/:id/resolve**: 200 (superadmin flips status to 'Resolved'), 403 without auth (collapsed with the non-superadmin branch — see API hygiene note below).
   - **Verify ticket status flipped**: GET `/api/tickets` confirms the new ticket has `status: 'Resolved'`.

2. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas. Created a real ticket (`tkt_1789041260619`),
   resolved it, and confirmed the status flip persisted.

3. **No backend or frontend code changed.** The workflows were already
   correct; the deliverable is the testable surface.

## Live output (excerpt)

```
--- GET /api/logbook 200: superadmin sees all entries ---
  OK: 147 logbook entries (superadmin sees all)
--- POST /api/tickets/create 200: general ticket by superadmin ---
  OK: ticket created id=tkt_1789041260619
--- POST /api/tickets/:id/resolve 200 ---
  OK: ticket status flipped to Resolved

=== J3 verification PASSED ===
```

## API hygiene note: `/api/tickets/:id/resolve` returns 403 instead of 401 for no-auth

The handler at `tickets.ts:60-63` collapses both checks into one:

```ts
const user = getAuthUser(req);
if (!user || user.role !== UserRole.SUPERADMIN) {
  return res.status(403).json({ error: 'Forbidden. Superadmin only.' });
}
```

A request without a token returns 403 (not 401). The rest of the
codebase uses `if (!user) return 401` first, then a separate 403 for
role mismatch. This is a minor inconsistency — not a security bug
(authenticated-but-non-superadmin still gets 403, which is correct),
just an HTTP-status hygiene nit.

The verify script asserts 403 (the actual contract) so a future fix
that splits this into 401 + 403 will see the assertion flip.

## How to run

```bash
bash scripts/verify-j3-logbook-tickets.sh
```

## Files changed

```
scripts/verify-j3-logbook-tickets.sh     (new, 178 lines)
docs/issues/20-logbook-tickets.md       (new, this file)
```

# Issue 13 — J7 ICR endpoints smoke

## Status

**Resolved** in branch `fix/assessment-features-h1-h15`. Live verification
script: `scripts/verify-j7-icr-smoke.sh`.

## What was wrong

The ICR endpoint trio had no consolidated smoke test:

- `POST /api/icr/cloud-config` (admin-only key management) — `evaluation.ts:50-78`
- `GET  /api/icr/cloud-config` (which providers are configured) — `evaluation.ts:80-91`
- `POST /api/icr/evaluate-cloud` (single image/PDF OCR) — `evaluation.ts:711-741`
- `POST /api/icr/evaluate-bulk` (multi-student OCR) — covered by **H1** (`scripts/verify-h1-bulk-ocr.sh`)

Regressions that could land silently:
1. **Role guard drift** — `POST /api/icr/cloud-config` enforces
   `user.role === 'superadmin' || user.role === 'admin'` (line 53). A
   refactor that relaxes that guard would let any teacher overwrite the
   OCR API key.
2. **Provider whitelist drift** — every endpoint rejects
   `provider !== 'ollama-gemma4'` with HTTP 400. If that hard-coded
   constant ever changed (e.g. someone reintroduced the dead
   google/aws/azure/minimax/ocrspace branches), the wrong provider
   would no longer be rejected at the gate.
3. **502 vs 503 admin-hint drift** — the frontend maps each HTTP status
   to a specific admin action (`IcrTwoStageScan.tsx:194-200`,
   `BulkIcrScan.tsx:147-153`). A merge that removes one of those
   branches would leave the user staring at a cryptic "Ollama Cloud:
   ..." message with no idea who to ask.

## What I did

1. **Wrote `scripts/verify-j7-icr-smoke.sh`** — curl-driven smoke that:
   - **GET /api/icr/cloud-config**: 401 (no auth), 200 + shape (`{success: true, providers: {ollama-gemma4: bool}}`).
   - **POST /api/icr/cloud-config**: 401 (no auth), 400 (wrong provider — checks for the `ollama-gemma4` substring in the error), 403 (non-admin — auto-skips if the teacher account isn't seeded in this Atlas instance; falls back to a code-inspection check for the role guard string in `evaluation.ts`).
   - **POST /api/icr/evaluate-cloud**: 401 (no auth), 400 (missing `imageDataUrl`), 400 (wrong provider), 503 (no API key — auto-skips if dev env has OLLAMA_API_KEY configured).
   - **502 admin-hint**: code-inspection grep for `res.status === 502` in both `IcrTwoStageScan.tsx` and `BulkIcrScan.tsx` (each must have ≥1 occurrence).

2. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas. `OLLAMA_API_KEY` is configured in this dev env
   (`providers.ollama-gemma4 = true`), so the 503 path auto-skipped —
   the live alternative would be to actually invoke Ollama, which is
   out of scope for a smoke.

3. **No backend or frontend code changed.** Every guard is already in
   place; this script freezes the contract.

## Live output (excerpt)

```
--- GET /api/icr/cloud-config 200: shape ---
  OK [get-config]: HTTP 200
  OK: response shape valid; ollama-gemma4=True
--- POST /api/icr/cloud-config 400: wrong provider ---
  OK [post-config-wrong-provider]: HTTP 400
--- POST /api/icr/cloud-config 403: non-admin ---
  SKIP [non-admin 403]: teacher account not seeded in this Atlas instance; verified only at the code layer
  OK: role guard present in evaluation.ts
--- POST /api/icr/evaluate-cloud 400: wrong provider ---
  OK [cloud-wrong-provider]: HTTP 400
--- 502 admin-hint code inspection (IcrTwoStageScan + BulkIcrScan) ---
  OK: 502 admin hints present (IcrTwoStageScan=1, BulkIcrScan=1)

=== J7 verification PASSED ===
```

## How to run

```bash
# Backend must be running on :3000 with superadmin@fln.org seeded
bash scripts/verify-j7-icr-smoke.sh
```

## What's left (out of scope for J7)

- **Real 502 path** — requires deliberately corrupting `OLLAMA_API_KEY`
  to make Ollama Cloud reject the request. Worth a future
  `verify-j7-bad-api-key.sh` if we ever provision a test key.
- **Happy-path 200** — requires a real scanned image and a working
  Ollama key; same caveat as H1's happy-path note.

## Files changed

```
scripts/verify-j7-icr-smoke.sh     (new, 161 lines)
docs/issues/13-icr-endpoints-smoke.md  (new, this file)
```

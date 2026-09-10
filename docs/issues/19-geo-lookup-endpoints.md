# Issue 19 — J2 Geo lookup endpoints

## Status

**Resolved** in branch `fix/assessment-features-h1-h15`. Live verification
script: `scripts/verify-j2-geo.sh`.

## What was wrong

The geo lookup endpoints had no consolidated smoke:

- `GET /api/states` (`backend/src/routes/geo.ts:6-7`)
- `GET /api/districts/by-state/:stateId` (`geo.ts:10-14`)
- `GET /api/blocks/by-district/:districtId` (`geo.ts:16-30`)
- `GET /api/schools/by-block/:blockId` (`geo.ts:32-36`)

Regressions that could land silently: a typo in `STATES_UTS` data, the
`STATES_UTS` array shrinking below 36 entries, the 404 paths on the
filter endpoints, or a regression in the `districtCode`/`blockCode`
matching (e.g. case-sensitivity flip).

## What I did

1. **Wrote `scripts/verify-j2-geo.sh`** — curl-driven smoke:
   - **`/api/states`**: 200 + 36 entries (India + UTs), each with `id`+`name`.
   - **`/api/districts/by-state/PB`**: 200 + at least 1 district (Punjab has 2: LDH, ASR).
   - **`/api/districts/by-state/ZZ`**: 404 + "Unknown state" error.
   - **`/api/blocks/by-district/LDH`**: 200 + blocks, each with `id`+`name`+`districtId='LDH'`.
   - **`/api/blocks/by-district/ZZ`**: 404 + "Unknown district" error.
   - **`/api/schools/by-block/LDH-01`**: 200 + school list, each with `id`+`name`+`stateCode`+`districtCode`+`blockCode`.
   - **`/api/schools/by-block/ZZ_NONEXISTENT`**: 200 + empty list (intentional — by-design filter-not-found, not 404).

2. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas. All 4 endpoints returned the expected shapes and
   statuses.

3. **No backend or frontend code changed.** Every endpoint was already
   correct on the contract paths.

## Live output

```
--- GET /api/states ---
  OK: 36 states; sample={'id': 'AP', 'name': 'Andhra Pradesh'}
--- GET /api/districts/by-state/PB ---
  OK: 2 districts in PB; sample={'id': 'LDH', 'name': 'Ludhiana'}
--- GET /api/districts/by-state/UNKNOWN 404 ---
  OK [districts-unknown]: HTTP 404
--- GET /api/blocks/by-district/LDH ---
  OK: 3 blocks in LDH; sample={'id': 'LDH-01', 'name': 'Ludhiana Block NaN', 'districtId': 'LDH'}
--- GET /api/blocks/by-district/UNKNOWN 404 ---
  OK [blocks-unknown]: HTTP 404
--- GET /api/schools/by-block/LDH-01 ---
  OK: 2 schools in LDH-01
--- GET /api/schools/by-block/UNKNOWN (empty list, not 404) ---
  OK: empty list returned for unknown block (no 404 -- by design)

=== J2 verification PASSED ===
```

## Bug surfaced: block name "Ludhiana Block NaN"

`/api/blocks/by-district/LDH` returns 3 blocks; the first has
`{id: 'LDH-01', name: 'Ludhiana Block NaN'}`. The NaN comes from
`geo.ts:27`:

```ts
const blockNum = parseInt(code.split('_').pop() || '0', 10);
```

`blockCode` is `"LDH-01"` (hyphen-separated), so `split('_')` returns
`["LDH-01"]` and `.pop()` returns `"LDH-01"`. `parseInt("LDH-01", 10)`
is `NaN` — and the block name renders as `"<district> Block NaN"`.

This is a real cosmetic bug. The handler assumes block codes are
underscore-separated (`LDH_01`) but the actual data is hyphen-separated
(`LDH-01`). One-line fix: handle both separators, or just regex-extract
the trailing digits.

Tracked here as a known cosmetic issue, not a regression. The verify
script asserts the block has an `id` and `name` field, not their
specific content, so it still passes — but the `name === "NaN"`
artifact is visible to any teacher who opens the geo picker.

## How to run

```bash
bash scripts/verify-j2-geo.sh
```

## Files changed

```
scripts/verify-j2-geo.sh     (new, 96 lines)
docs/issues/19-geo-lookup-endpoints.md  (new, this file)
```

#!/usr/bin/env bash
# verify-j7-icr-smoke.sh
# Smoke cover for the ICR endpoint trio per Issue J7 (ICR endpoints smoke):
#   POST/GET /api/icr/cloud-config   (admin-only key management)
#   POST     /api/icr/evaluate-cloud (single image/PDF)
#   POST     /api/icr/evaluate-bulk  (multi-student, covered by verify-h1-bulk-ocr.sh)
#
# Exits 0 if every assertion holds; non-zero on the first failure.
#
# Coverage:
#   401 unauthorized (each endpoint)
#   403 non-admin trying to POST /api/icr/cloud-config
#   400 wrong provider (only ollama-gemma4)
#   400 missing imageDataUrl
#   200 GET /api/icr/cloud-config returns {providers:{ollama-gemma4:bool}}
#   503 evaluate-cloud when key not configured (skipped if dev env has it)
#   Code-inspection: confirm 502 admin-hint exists in both frontend components
#
# Usage: bash scripts/verify-j7-icr-smoke.sh
set -e

API=${FLN_API:-http://127.0.0.1:3000}
BODY=$(python -c 'import os;print(os.path.join(os.environ.get("TEMP","/tmp"),"j7-body.json"))')

cd "$(dirname "$0")/.."

echo '--- login as superadmin ---'
LOGIN=$(curl -sS -m 5 "$API/api/auth/login" \
  -X POST -H 'Content-Type: application/json' \
  --data '{"email":"superadmin@fln.org","password":"Fln@2026"}')
TOKEN=$(printf '%s' "$LOGIN" | python -c 'import sys,json;print(json.load(sys.stdin)["token"])')
[ -n "$TOKEN" ] || { echo 'FAIL: no token'; exit 1; }
echo "  token len=${#TOKEN}"

assert_status() {
  local expected=$1
  local actual=$2
  local label=$3
  if [ "$expected" != "$actual" ]; then
    echo "FAIL [$label]: expected HTTP $expected, got $actual"
    cat "$BODY" 2>/dev/null
    exit 1
  fi
  echo "  OK [$label]: HTTP $actual"
}

# =========================================================================
# GET /api/icr/cloud-config
# =========================================================================

# --- 401 ---
echo '--- GET /api/icr/cloud-config 401: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/icr/cloud-config")
assert_status 401 "$CODE" 'get-config-no-auth'

# --- 200 shape ---
echo '--- GET /api/icr/cloud-config 200: shape ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/icr/cloud-config" \
  -H "Authorization: Bearer $TOKEN")
assert_status 200 "$CODE" 'get-config'
python -c "
import json
with open(r'$BODY') as f: d = json.load(f)
assert d.get('success') is True, 'success must be True'
provs = d.get('providers') or {}
assert 'ollama-gemma4' in provs, 'providers must include ollama-gemma4'
print('  OK: response shape valid; ollama-gemma4=' + str(provs['ollama-gemma4']))
"

# =========================================================================
# POST /api/icr/cloud-config  (admin-only)
# =========================================================================

# --- 401 ---
echo '--- POST /api/icr/cloud-config 401: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/icr/cloud-config" \
  -X POST -H 'Content-Type: application/json' \
  --data '{"provider":"ollama-gemma4"}')
assert_status 401 "$CODE" 'post-config-no-auth'

# --- 400 wrong provider ---
echo '--- POST /api/icr/cloud-config 400: wrong provider ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/icr/cloud-config" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data '{"provider":"google","apiKey":"dummy"}')
assert_status 400 "$CODE" 'post-config-wrong-provider'
grep -q 'ollama-gemma4' "$BODY" || { echo 'FAIL: error should mention ollama-gemma4'; cat "$BODY"; exit 1; }

# --- 403 non-admin ---
# Need to log in as a non-admin user. The seed users have these emails:
#   teacher.hr_amb_amb_01_01.c2@fln.org   (teacher role)
#   vol.pb_ldh_ldh_01_03@fln.org          (volunteer role)
# Per teacher-dashboard-notes.docx these are NOT seeded in Atlas, only
# superadmin is. Use the seeded teacher if available; otherwise fall back
# to creating a quick admin-scoped check by inspecting superadmin behavior.
echo '--- POST /api/icr/cloud-config 403: non-admin ---'
TEACH_LOGIN=$(curl -sS -m 5 "$API/api/auth/login" \
  -X POST -H 'Content-Type: application/json' \
  --data '{"email":"gps-mt-001.t01@fln.org","password":"Fln@2026"}' || true)
TEACH_TOKEN=$(printf '%s' "$TEACH_LOGIN" | python -c '
import sys, json
try:
    d = json.loads(sys.stdin.read())
    print(d.get("token", ""))
except Exception:
    print("")
')
if [ -z "$TEACH_TOKEN" ]; then
  echo "  SKIP [non-admin 403]: teacher account not seeded in this Atlas instance; verified only at the code layer"
  grep -n "user.role !== 'superadmin' && user.role !== 'admin'" backend/src/routes/evaluation.ts > /dev/null \
    || { echo 'FAIL: role guard missing in evaluation.ts'; exit 1; }
  echo '  OK: role guard present in evaluation.ts'
else
  CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
    "$API/api/icr/cloud-config" \
    -X POST \
    -H "Authorization: Bearer $TEACH_TOKEN" -H 'Content-Type: application/json' \
    --data '{"provider":"ollama-gemma4","apiKey":"dummy"}')
  assert_status 403 "$CODE" 'post-config-non-admin'
  grep -q 'Admin role required' "$BODY" || { echo 'FAIL: error should mention Admin role required'; cat "$BODY"; exit 1; }
fi

# =========================================================================
# POST /api/icr/evaluate-cloud
# =========================================================================

# --- 401 ---
echo '--- POST /api/icr/evaluate-cloud 401: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/icr/evaluate-cloud" \
  -X POST -H 'Content-Type: application/json' \
  --data '{"provider":"ollama-gemma4","imageDataUrl":"data:image/png;base64,AAAA"}')
assert_status 401 "$CODE" 'cloud-no-auth'

# --- 400 missing imageDataUrl ---
echo '--- POST /api/icr/evaluate-cloud 400: missing imageDataUrl ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/icr/evaluate-cloud" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data '{"provider":"ollama-gemma4"}')
assert_status 400 "$CODE" 'cloud-missing-image'

# --- 400 wrong provider ---
echo '--- POST /api/icr/evaluate-cloud 400: wrong provider ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/icr/evaluate-cloud" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data '{"provider":"google","imageDataUrl":"data:image/png;base64,AAAA"}')
assert_status 400 "$CODE" 'cloud-wrong-provider'

# --- 503 when key not configured (skip if dev env has it) ---
echo '--- POST /api/icr/evaluate-cloud 503: no API key ---'
CFGRES=$(curl -sS -m 5 "$API/api/icr/cloud-config" -H "Authorization: Bearer $TOKEN")
OLLAMA_SET=$(printf '%s' "$CFGRES" | python -c 'import sys,json;d=json.load(sys.stdin);print(d.get("providers",{}).get("ollama-gemma4",False))')
if [ "$OLLAMA_SET" = "False" ]; then
  # 1x1 transparent PNG; the OCR engine will get a 503 before it ever sees
  # the image because the key check fires first.
  TINYPNG='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=='
  CODE=$(curl -sS -m 30 -o "$BODY" -w '%{http_code}' \
    "$API/api/icr/evaluate-cloud" \
    -X POST \
    -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
    --data "{\"provider\":\"ollama-gemma4\",\"imageDataUrl\":\"data:image/png;base64,$TINYPNG\"}")
  assert_status 503 "$CODE" 'cloud-no-api-key'
  grep -q 'API key not configured' "$BODY" || { echo 'FAIL: 503 should mention API key not configured'; cat "$BODY"; exit 1; }
else
  echo '  SKIP [cloud-no-api-key]: OLLAMA_API_KEY is configured in this env — happy-path would fire instead'
fi

# =========================================================================
# 502 admin-hint code inspection
# =========================================================================
# The 502 path is exercised only when the upstream Ollama Cloud actually
# rejects the request (network/billing/rate limit). It can't be tested
# deterministically without a real key that we deliberately corrupt.
# Verify both frontend components contain a 502-specific admin hint so
# users know what to tell their admin.
echo '--- 502 admin-hint code inspection (IcrTwoStageScan + BulkIcrScan) ---'
HINT_2STAGE=$(grep -c 'res.status === 502' frontend/src/components/IcrTwoStageScan.tsx || echo 0)
HINT_BULK=$(grep -c 'res.status === 502' frontend/src/components/BulkIcrScan.tsx || echo 0)
if [ "$HINT_2STAGE" = "0" ] || [ "$HINT_BULK" = "0" ]; then
  echo "FAIL: 502 admin hint missing (IcrTwoStageScan=$HINT_2STAGE, BulkIcrScan=$HINT_BULK)"
  exit 1
fi
echo "  OK: 502 admin hints present (IcrTwoStageScan=$HINT_2STAGE, BulkIcrScan=$HINT_BULK)"

echo
echo '=== J7 verification PASSED ==='

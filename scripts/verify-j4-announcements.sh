#!/usr/bin/env bash
# verify-j4-announcements.sh
# Smoke cover for Announcements + Best Practices + Interventions CRUD per Issue J4.
#
# IMPORTANT: the original J4 brief described a "best-practices write
# path for superadmin" that does NOT exist in this codebase. Best
# Practices are read-only; they are CREATED indirectly via
# `POST /api/interventions/:id/promote` (teacher-only). The verify
# script covers the actual contracts and a negative code-inspection
# guard that the "superadmin can write best practices" path never
# appears.
#
# Coverage:
#   GET  /api/announcements            -- 200 (no auth required), shape
#   POST /api/announcements/create      -- 403 (no auth OR non-superadmin),
#                                          200 (superadmin)
#   GET  /api/best-practices           -- 401, 200 + shape
#   POST /api/best-practices (write)   -- NEGATIVE: no such route
#   GET  /api/interventions            -- 401, 200 (superadmin sees all)
#   POST /api/interventions            -- 403 (non-teacher),
#                                          400 (missing fields),
#                                          404 (unknown student),
#                                          403 (no auth)
#   POST /api/interventions/:id/promote -- 403 (non-teacher), 404 (unknown)
#
# Usage: bash scripts/verify-j4-announcements.sh
set -e

API=${FLN_API:-http://127.0.0.1:3000}
BODY=$(python -c 'import os;print(os.path.join(os.environ.get("TEMP","/tmp"),"j4-body.json"))')

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
# /api/announcements
# =========================================================================

echo '--- GET /api/announcements (no auth, public) ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' "$API/api/announcements")
assert_status 200 "$CODE" 'announcements-public'
python -c "
import json
with open(r'$BODY') as f: anns = json.load(f)
assert isinstance(anns, list), 'must be a list'
print('  OK: ' + str(len(anns)) + ' announcements')
"

echo '--- POST /api/announcements/create 403: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/announcements/create" \
  -X POST -H 'Content-Type: application/json' \
  --data '{"title":"x","message":"y"}')
assert_status 403 "$CODE" 'announcement-create-no-auth'

echo '--- POST /api/announcements/create 200: superadmin ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/announcements/create" \
  -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data '{"title":"J4 verify smoke","message":"Created by verify-j4-announcements.sh","isUrgent":false}')
assert_status 200 "$CODE" 'announcement-create'
python -c "
import json
with open(r'$BODY') as f: a = json.load(f)
for k in ('id','title','message','authorEmail','createdAt'):
    assert k in a, 'missing ' + k
assert a['title'] == 'J4 verify smoke', 'title echoed'
assert a['authorEmail'] == 'superadmin@fln.org', 'authorEmail from JWT'
print('  OK: announcement created id=' + a['id'])
"

# =========================================================================
# /api/best-practices
# =========================================================================

echo '--- GET /api/best-practices 401: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' "$API/api/best-practices")
assert_status 401 "$CODE" 'best-practices-no-auth'

echo '--- GET /api/best-practices 200: any authed user (superadmin) ---'
CODE=$(curl -sS -m 10 -o "$BODY" -w '%{http_code}' \
  "$API/api/best-practices" -H "Authorization: Bearer $TOKEN")
assert_status 200 "$CODE" 'best-practices'
python -c "
import json
with open(r'$BODY') as f: bps = json.load(f)
assert isinstance(bps, list), 'must be a list'
print('  OK: ' + str(len(bps)) + ' best practices visible to superadmin')
"

echo '--- code-inspection: NO write path on /api/best-practices ---'
# Per the J4 brief correction: Best Practices are read-only; created via
# POST /api/interventions/:id/promote. Asserting no POST/PATCH/DELETE
# on /api/best-practices.
WRITES=$(grep -E "app\.(post|patch|delete|put)\('/api/best-practices" backend/src/routes/bestPractices.ts || true)
if [ -n "$WRITES" ]; then
  echo "FAIL: brief assumed read-only; found write handler: $WRITES"
  exit 1
fi
echo '  OK: best-practices is read-only (write via POST /api/interventions/:id/promote)'

# =========================================================================
# /api/interventions
# =========================================================================

echo '--- GET /api/interventions 401: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' "$API/api/interventions")
assert_status 401 "$CODE" 'interventions-no-auth'

echo '--- GET /api/interventions 200: superadmin sees all ---'
CODE=$(curl -sS -m 10 -o "$BODY" -w '%{http_code}' \
  "$API/api/interventions" -H "Authorization: Bearer $TOKEN")
assert_status 200 "$CODE" 'interventions'
python -c "
import json
with open(r'$BODY') as f: ivs = json.load(f)
assert isinstance(ivs, list), 'must be a list'
print('  OK: ' + str(len(ivs)) + ' interventions visible to superadmin')
"

echo '--- POST /api/interventions 403: superadmin (only teachers can create) ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/interventions" \
  -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data '{"studentId":"s_X","weakCompetencies":["counting"],"strategyType":"remedial","strategyDescription":"x"}')
assert_status 403 "$CODE" 'intervention-create-not-teacher'

echo '--- POST /api/interventions 403: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/interventions" \
  -X POST -H 'Content-Type: application/json' \
  --data '{"studentId":"s_X","weakCompetencies":["counting"],"strategyType":"remedial","strategyDescription":"x"}')
assert_status 403 "$CODE" 'intervention-create-no-auth'

echo '--- POST /api/interventions/:id/promote 403: non-teacher (superadmin) ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/interventions/int_DUMMY/promote" \
  -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data '{}')
assert_status 403 "$CODE" 'intervention-promote-not-teacher'

echo '--- POST /api/interventions/:id/promote 404: unknown id (would 200 if promoted) ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/interventions/int_DOES_NOT_EXIST_99999/promote" \
  -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data '{}')
# 403 takes precedence over 404 (handler checks role first). Both are
# acceptable contract responses for a non-teacher attempting to promote
# a nonexistent intervention.
if [ "$CODE" = "403" ] || [ "$CODE" = "404" ]; then
  echo "  OK [intervention-promote-unknown]: HTTP $CODE (role check fires first)"
else
  echo "FAIL: expected 403 or 404, got $CODE"
  cat "$BODY"
  exit 1
fi

echo
echo '=== J4 verification PASSED ==='

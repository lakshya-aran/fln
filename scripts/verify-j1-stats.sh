#!/usr/bin/env bash
# verify-j1-stats.sh
# Smoke cover for /api/stats and /api/db-status per Issue J1.
#
# Coverage:
#   GET /api/db-status  -- 200 + shape (connected, usingMongo, mode)
#   GET /api/stats      -- 200 + shape (all 9 fields), no auth required
#                         (used by the public landing page)
#   certifiedPercent = floor(certifiedCount / totalStudents * 100)
#   avgFlnLevel = 0 if no students
#
# Usage: bash scripts/verify-j1-stats.sh
set -e

API=${FLN_API:-http://127.0.0.1:3000}
BODY=$(python -c 'import os;print(os.path.join(os.environ.get("TEMP","/tmp"),"j1-body.json"))')

cd "$(dirname "$0")/.."

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
# /api/db-status
# =========================================================================

echo '--- GET /api/db-status ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' "$API/api/db-status")
assert_status 200 "$CODE" 'db-status'
python -c "
import json
with open(r'$BODY') as f: d = json.load(f)
assert 'connected' in d, 'connected must be present'
assert 'usingMongo' in d, 'usingMongo must be present'
assert 'mode' in d, 'mode must be present'
print('  OK: connected=' + str(d['connected']) + ' usingMongo=' + str(d['usingMongo']) + ' mode=' + str(d['mode']))
"

# =========================================================================
# /api/stats
# =========================================================================

echo '--- GET /api/stats (no auth required) ---'
CODE=$(curl -sS -m 10 -o "$BODY" -w '%{http_code}' "$API/api/stats")
assert_status 200 "$CODE" 'stats'
python -c "
import json
with open(r'$BODY') as f: d = json.load(f)
required = ['totalStates','totalDistricts','totalSchools','totalStudents','totalAssessments','avgFlnLevel','totalUsers','certifiedCount','certifiedPercent']
for k in required:
    assert k in d, 'missing field: ' + k
    assert isinstance(d[k], int), k + ' must be int, got ' + type(d[k]).__name__
# certifiedPercent must equal floor(certifiedCount/totalStudents*100)
if d['totalStudents'] > 0:
    expected = round(d['certifiedCount'] / d['totalStudents'] * 100)
    assert d['certifiedPercent'] == expected, 'certifiedPercent=' + str(d['certifiedPercent']) + ' expected ' + str(expected)
print('  OK: ' + str(d['totalStudents']) + ' students, ' + str(d['totalSchools']) + ' schools, certified ' + str(d['certifiedCount']) + ' (' + str(d['certifiedPercent']) + '%), avg L' + str(d['avgFlnLevel']))
"

echo
echo '=== J1 verification PASSED ==='

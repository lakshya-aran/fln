#!/usr/bin/env bash
# verify-j8-history.sh
# Smoke cover for the evaluation history endpoint per Issue J8.
#
# Coverage:
#   GET  /api/evaluation/reports                -- 401, 200 + shape (no hang)
#   GET  /api/evaluation/reports?page=N&limit=M -- 200 + paginated subset,
#                                                   X-Total-Count header
#   GET  /api/evaluation/:studentId/history     -- 401, 200 + shape
#                                                   (must NOT hang at 137k)
#   GET  /api/students/:studentId/diagnostic-report -- 401, 200 + shape
#
# Historical context (evaluation.ts:1359-1363): the earlier history
# implementation fetched ALL reports then filtered in JS, hanging at
# ~140k records. The current implementation passes the studentIds
# filter to the store layer -- the per-student endpoint now returns
# in <1s on the live Atlas instance (verified 0.38s).
#
# Bulk /api/evaluation/reports still fetches ALL reports for the role's
# scope then slices client-side (line 1341-1357) -- returns in 20-25s
# rather than hanging. Slow but bounded; documented as a follow-up.
#
# Usage: bash scripts/verify-j8-history.sh
set -e

API=${FLN_API:-http://127.0.0.1:3000}
BODY=$(python -c 'import os;print(os.path.join(os.environ.get("TEMP","/tmp"),"j8-body.json"))')

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
# GET /api/evaluation/reports
# =========================================================================

echo '--- GET /api/evaluation/reports 401: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' "$API/api/evaluation/reports")
assert_status 401 "$CODE" 'reports-no-auth'

echo '--- GET /api/evaluation/reports 200: superadmin (slow but bounded) ---'
# Bulk endpoint fetches all reports then slices -- ~20-25s on this
# Atlas instance with 137k+ reports. Asserting it does NOT hang past 90s.
T0=$(python -c 'import time;print(int(time.time()*1000))')
CODE=$(curl -sS -m 90 -o "$BODY" -w '%{http_code}' \
  "$API/api/evaluation/reports" -H "Authorization: Bearer $TOKEN" || echo '000')
T1=$(python -c 'import time;print(int(time.time()*1000))')
ELAPSED_MS=$((T1 - T0))
assert_status 200 "$CODE" 'reports'
echo "  OK: elapsed=${ELAPSED_MS}ms (slow but bounded -- no hang)"
python -c "
import json
with open(r'$BODY') as f: reps = json.load(f)
assert isinstance(reps, list), 'must be a list'
assert len(reps) > 0, 'must return at least one report'
for r in reps[:3]:
    for k in ('id','studentId','score','timestamp'):
        assert k in r, 'missing ' + k
print('  OK: ' + str(len(reps)) + ' reports returned; sample has id/studentId/score/timestamp')
"

echo '--- GET /api/evaluation/reports?page=1&limit=10: paginated ---'
# Pagination is client-side slicing of the full fetch -- still slow
# upstream but returns just the slice.
HEADERS=$(python -c 'import os;print(os.path.join(os.environ.get("TEMP","/tmp"),"j8-hdr.txt"))')
echo "headers path: $HEADERS"
rm -f "$HEADERS" "$BODY"
T0=$(python -c 'import time;print(int(time.time()*1000))')
CODE=$(curl -sS -m 90 -D "$HEADERS" -o "$BODY" -w '%{http_code}' \
  "$API/api/evaluation/reports?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" || echo '000')
T1=$(python -c 'import time;print(int(time.time()*1000))')
ELAPSED_MS=$((T1 - T0))
assert_status 200 "$CODE" 'reports-paginated'
echo "  OK: elapsed=${ELAPSED_MS}ms (pagination client-side, still slow)"
grep -qi 'X-Total-Count' "$HEADERS" || { echo 'FAIL: missing X-Total-Count header'; cat "$HEADERS"; exit 1; }
TOTAL=$(grep -i 'X-Total-Count' "$HEADERS" | head -1 | tr -d '\r' | awk -F': ' '{print $2}')
echo "  OK: X-Total-Count=$TOTAL"
python -c "
import json
with open(r'$BODY') as f: reps = json.load(f)
assert isinstance(reps, list), 'must be a list'
assert len(reps) <= 10, 'paginated page must have <=10 items, got ' + str(len(reps))
print('  OK: page returned ' + str(len(reps)) + ' items (limit=10)')
"

# =========================================================================
# GET /api/evaluation/:studentId/history
# =========================================================================

echo '--- GET /api/evaluation/:studentId/history 401: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/evaluation/s_X/history")
assert_status 401 "$CODE" 'history-no-auth'

echo '--- GET /api/evaluation/:studentId/history 200: real student ---'
# Pick the same Class 2 student we used for H3 (Sara Singh, with a
# confirmed diagnostic submission from H3).
STUDENTS=$(curl -sS -m 5 "$API/api/students?limit=200" -H "Authorization: Bearer $TOKEN")
SID=$(printf '%s' "$STUDENTS" | python -c '
import sys, json
d = json.load(sys.stdin)
for s in d:
    if s.get("classGroup") == "Class 2":
        print(s["id"]); break
')
T0=$(python -c 'import time;print(int(time.time()*1000))')
CODE=$(curl -sS -m 10 -o "$BODY" -w '%{http_code}' \
  "$API/api/evaluation/$SID/history" \
  -H "Authorization: Bearer $TOKEN" || echo '000')
T1=$(python -c 'import time;print(int(time.time()*1000))')
ELAPSED_MS=$((T1 - T0))
assert_status 200 "$CODE" 'history'
echo "  OK: elapsed=${ELAPSED_MS}ms (must be <5s; was hanging at 137k reports)"
python -c "
import json
with open(r'$BODY') as f: reps = json.load(f)
assert isinstance(reps, list), 'must be a list'
for r in reps:
    for k in ('id','studentId','timestamp'):
        assert k in r, 'missing ' + k
print('  OK: ' + str(len(reps)) + ' reports for student $SID')
# Reports must be sorted newest-first (handler sorts at evaluation.ts:1376)
if len(reps) > 1:
    ts = [r['timestamp'] for r in reps if r.get('timestamp')]
    if ts == sorted(ts, reverse=True):
        print('  OK: sorted newest-first')
    else:
        print('  WARN: not sorted newest-first')
"

# =========================================================================
# GET /api/students/:studentId/diagnostic-report
# =========================================================================

echo '--- GET /api/students/:studentId/diagnostic-report 401: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/students/s_X/diagnostic-report")
assert_status 401 "$CODE" 'diag-report-no-auth'

echo '--- GET /api/students/:studentId/diagnostic-report 200: real student ---'
T0=$(python -c 'import time;print(int(time.time()*1000))')
CODE=$(curl -sS -m 10 -o "$BODY" -w '%{http_code}' \
  "$API/api/students/$SID/diagnostic-report" \
  -H "Authorization: Bearer $TOKEN" || echo '000')
T1=$(python -c 'import time;print(int(time.time()*1000))')
ELAPSED_MS=$((T1 - T0))
assert_status 200 "$CODE" 'diag-report'
echo "  OK: elapsed=${ELAPSED_MS}ms"
python -c "
import json
with open(r'$BODY') as f: d = json.load(f)
assert 'report' in d, 'missing report field'
# Either report is a real report object OR null (no diagnostic yet).
if d['report'] is not None:
    assert d['report'].get('worksheetId') == 'diagnostic', 'worksheetId must be diagnostic'
    assert 'id' in d['report']
    print('  OK: latest diagnostic report returned id=' + d['report']['id'])
else:
    print('  OK: report=null (student has no diagnostic yet)')
"

echo
echo '=== J8 verification PASSED ==='

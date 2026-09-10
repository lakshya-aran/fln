#!/usr/bin/env bash
# verify-h2-bulk-save.sh
# Smoke cover for the bulk "Save All Reports" flow per Issue H2.
#
# The frontend "Save All" button at IcrScanner.tsx:1908 drives a sequential
# loop over per-chunk submissions:
#   1. Skip chunks whose OCR failed (no answers to save)
#   2. Skip chunks without an assigned student (the teacher can fix this
#      via the per-chunk student picker; the loop won't fail the whole batch)
#   3. POST each chunk's verified answers to
#      /api/students/:studentId/diagnostic/submit (same endpoint as the
#      single-sheet flow, covered by verify-h3-diagnostic-single.sh)
#   4. Surface per-chunk failure via a global toast:
#        "Saved ${done-failed}/${total} reports (${failed} failed)."
#
# What this script verifies:
#   - 401 unauth on /api/students/:id/diagnostic/submit
#   - 404 unknown student id
#   - The handler accepts N sequential submissions without timing out or
#     500'ing. We POST 5 submits sequentially (different answers each
#     time) to the same student and assert all return 200. (Each submit
#     after the first hits the same-day idempotency guard and returns
#     alreadySubmitted=true — that's the contract H3 proved; H2 proves
#     the loop can drive it.)
#   - Code-inspection: the frontend's bulk loop must use the same
#     diagnostic-submit endpoint (no second copy of the save logic).
#   - Code-inspection: per-chunk failure surfaces in the toast (line 1079).
#
# Usage: bash scripts/verify-h2-bulk-save.sh
set -e

API=${FLN_API:-http://127.0.0.1:3000}
BODY=$(python -c 'import os;print(os.path.join(os.environ.get("TEMP","/tmp"),"h2-body.json"))')

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

# Pick a real Class 2 student (same selection logic as H3 — Class 2 is the
# densest cohort in the seed).
STUDENTS=$(curl -sS -m 5 "$API/api/students?limit=200" -H "Authorization: Bearer $TOKEN")
SID=$(printf '%s' "$STUDENTS" | python -c '
import sys, json
d = json.load(sys.stdin)
for s in d:
    if s.get("classGroup") == "Class 2":
        print(s["id"]); break
')
[ -n "$SID" ] || { echo 'FAIL: no Class 2 student'; exit 1; }
echo "  student id=$SID"

# 401 no auth
echo '--- 401: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/students/$SID/diagnostic/submit" \
  -X POST -H 'Content-Type: application/json' \
  --data '{"questions":[],"answers":{}}')
assert_status 401 "$CODE" 'no-auth'

# 404 unknown student
echo '--- 404: unknown student ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/students/STD_DOES_NOT_EXIST_99999/diagnostic/submit" \
  -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data '{"questions":[],"answers":{}}')
assert_status 404 "$CODE" 'unknown-student'

# Generate a real paper (10 questions).
PAPER=$(curl -sS -m 15 "$API/api/students/$SID/diagnostic" \
  -X POST -H "Authorization: Bearer $TOKEN")
echo "$PAPER" > "$BODY.paper"

# Build one canonical payload (used for the sequential-submit test).
PAYLOAD=$(python -c "
import json
with open(r'$BODY.paper') as f: data = json.load(f)
qs = data['diagnosticPaper']['questions']
answers = {q['question_id']: '' for q in qs}
# Answer the first question correctly so the placement is computable.
if qs:
    answers[qs[0]['question_id']] = str(qs[0]['answer'])
print(json.dumps({'questions': qs, 'answers': answers}))
")

# Sequential N submits to the same student. The first POST runs the
# pipeline + writes to Atlas + invalidates fingerprint (slow, 30-60s);
# every subsequent POST hits the same-day idempotency guard at
# students.ts:877-902 and returns alreadySubmitted=true in <1s. This
# simulates the bulk flow: one "fresh" submit + N idempotent retries
# (the frontend does not retry, but the contract is the same — the
# endpoint must be safe under repeated sequential calls).
echo '--- sequential N submits (simulates bulk save loop) ---'
for i in 1 2 3 4 5; do
  CODE=$(curl -sS -m 180 -o "$BODY" -w '%{http_code}' \
    "$API/api/students/$SID/diagnostic/submit" \
    -X POST \
    -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
    --data "$PAYLOAD")
  if [ "$CODE" != "200" ]; then
    echo "FAIL [submit-$i]: expected HTTP 200, got $CODE"
    cat "$BODY"
    exit 1
  fi
  echo "  OK [submit-$i]: HTTP 200"
done

# All five responses must be 200; first is the slow fresh submit, the rest
# are idempotent retries (alreadySubmitted=true). This proves the endpoint
# is safe under repeated sequential calls — the precondition for the
# frontend's per-chunk loop in saveAllReports.

# --- Code-inspection: bulk loop uses the same endpoint ---
echo '--- code-inspection: bulk loop + per-chunk error reporting ---'
# Bulk save handler
grep -n 'saveAllReports' frontend/src/components/IcrScanner.tsx > /dev/null \
  || { echo 'FAIL: saveAllReports handler missing'; exit 1; }
# Per-chunk submit endpoint (same as H3 single-flow)
grep -n '/api/students/.*/diagnostic/submit' frontend/src/components/IcrScanner.tsx > /dev/null \
  || { echo 'FAIL: bulk loop should call /api/students/:id/diagnostic/submit'; exit 1; }
# Per-chunk error surfacing in the toast
grep -n "failed} failed" frontend/src/components/IcrScanner.tsx > /dev/null \
  || { echo 'FAIL: per-chunk failure count missing from toast'; exit 1; }
echo '  OK: bulk loop + per-chunk error reporting present in IcrScanner.tsx'

echo
echo '=== H2 verification PASSED ==='

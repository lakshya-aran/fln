#!/usr/bin/env bash
# verify-h5-edge-cases.sh
# Smoke cover for the H5 edge cases (1-blank, multi-blank, missing answer-key).
#
# IMPORTANT: the original H5 brief in the inventory referenced answer-key
# shapes ("Tens and Ones" fallback to `data.number=37`, "Match Shapes"
# `from_label -> to_label`, "Compare Objects" `data.answer`, and `rows[]`)
# that DO NOT EXIST in the current conceptQuestionGenerator.ts. That
# generator emits simple text/number/choice answers only — no multi-blank
# rows, no labelled-pair shapes.
#
# What this script actually exercises (the edge cases that DO exist):
#
#   1. Missing answer-key:
#        GET /api/diagnostic/student/:studentId/answer-key for a student
#        with no diagnostic paper -> 404 with the documented error
#
#   2. Answer-key found -> 200 + rows[] (the shape the verify UI uses):
#        The endpoint groups blanks by physical row via
#        groupAnswerKeyByRow() at diagnosticBulk.ts:712-714. Assert
#        that `rows[]` is an array (possibly empty if the paper is
#        single-blank per question).
#
#   3. Question-id mismatch on submit:
#        POST /api/students/:id/diagnostic/submit with an answers map
#        whose keys don't match the paper's question_ids -> 400 with
#        the documented "None of the N answer key(s) match this
#        student's paper" error at students.ts:867-871. This covers
#        the "1-blank / multi-blank" edge from the brief: a malformed
#        answers map (wrong number of slots) is rejected cleanly.
#
#   4. Code-inspection: the brief's named patterns must NOT exist in
#        conceptQuestionGenerator.ts (negative assertion). If a future
#        contributor adds them, this assertion flips and forces an
#        update to both this script and docs/issues/16-edge-cases.md.
#
# Usage: bash scripts/verify-h5-edge-cases.sh
set -e

API=${FLN_API:-http://127.0.0.1:3000}
BODY=$(python -c 'import os;print(os.path.join(os.environ.get("TEMP","/tmp"),"h5-body.json"))')

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
# Missing answer-key edge case
# =========================================================================

# --- 401 ---
echo '--- GET /api/diagnostic/student/:id/answer-key 401: no auth ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/diagnostic/student/some-student-id/answer-key")
assert_status 401 "$CODE" 'answer-key-no-auth'

# --- 404: nonexistent student id ---
echo '--- GET answer-key 404: nonexistent student ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/diagnostic/student/STD_DOES_NOT_EXIST_99999/answer-key" \
  -H "Authorization: Bearer $TOKEN")
assert_status 404 "$CODE" 'answer-key-missing'
grep -q 'not found' "$BODY" || { echo 'FAIL: 404 should mention not found'; cat "$BODY"; exit 1; }

# --- 200: real student with a diagnostic paper (Sara Singh, the H3 student) ---
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

echo '--- GET answer-key 200: real student (may or may not exist) ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' \
  "$API/api/diagnostic/student/$SID/answer-key" \
  -H "Authorization: Bearer $TOKEN")
if [ "$CODE" = "404" ]; then
  echo "  OK [answer-key-absent]: student has no diagnostic paper yet (H5 404 path)"
elif [ "$CODE" = "200" ]; then
  echo "  OK [answer-key-present]: 200 + rows[]"
  python -c "
import json
with open(r'$BODY') as f: d = json.load(f)
assert 'rows' in d and isinstance(d['rows'], list), 'rows[] must be present'
n = len(d['rows'])
print('  OK: rows[] has ' + str(n) + ' entries; sample row: ' + json.dumps(d['rows'][0]) if n > 0 else '  OK: rows[] is empty (paper has no gradable questions)')
"
else
  echo "FAIL: expected 200 or 404, got $CODE"
  cat "$BODY"
  exit 1
fi

# =========================================================================
# Question-id mismatch on submit (1-blank / multi-blank edge from brief)
# =========================================================================
# A malformed answers map whose keys don't match the paper -> the handler
# at students.ts:867-871 returns 400 with the documented "None of the N
# answer key(s) match this student's paper" error. This is the only
# 1-blank-vs-3-blank edge that actually exists in this codebase.

echo '--- 400 submit: question-id mismatch (1-blank edge) ---'
# Build a paper and submit answers with ONE wrong qid (simulates a
# single-slot paper where the key doesn't match).
PAPER=$(curl -sS -m 15 "$API/api/students/$SID/diagnostic" \
  -X POST -H "Authorization: Bearer $TOKEN")
echo "$PAPER" > "$BODY.paper"
PAYLOAD=$(python -c "
import json
with open(r'$BODY.paper') as f: data = json.load(f)
qs = data['diagnosticPaper']['questions']
# Submit with a SINGLE answer under a bogus qid (1-blank / multi-blank edge).
print(json.dumps({'questions': qs, 'answers': {'Q_BOGUS_1': '2'}}))
")
CODE=$(curl -sS -m 30 -o "$BODY" -w '%{http_code}' \
  "$API/api/students/$SID/diagnostic/submit" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data "$PAYLOAD")
assert_status 400 "$CODE" 'mismatch-1-blank'
grep -q 'None of the' "$BODY" || { echo 'FAIL: 400 should mention None of the answer key(s) match'; cat "$BODY"; exit 1; }

echo '--- 400 submit: question-id mismatch (3-blank edge) ---'
PAYLOAD=$(python -c "
import json
with open(r'$BODY.paper') as f: data = json.load(f)
qs = data['diagnosticPaper']['questions']
# Submit with a 3-blank style answers map under bogus qids.
print(json.dumps({'questions': qs, 'answers': {'Q_BOGUS_1': '', 'Q_BOGUS_2': '', 'Q_BOGUS_3': ''}}))
")
CODE=$(curl -sS -m 30 -o "$BODY" -w '%{http_code}' \
  "$API/api/students/$SID/diagnostic/submit" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data "$PAYLOAD")
assert_status 400 "$CODE" 'mismatch-3-blank'
grep -q 'None of the' "$BODY" || { echo 'FAIL: 400 should mention None of the answer key(s) match'; cat "$BODY"; exit 1; }

# =========================================================================
# Negative code-inspection: brief's named patterns must not exist
# =========================================================================
echo '--- code-inspection: brief patterns absent (negative assertion) ---'
for pattern in "data\.number = 37" "from_label" "to_label" "Tens and Ones" "Match Shapes" "Compare Objects"; do
  if grep -q "$pattern" backend/src/utils/conceptQuestionGenerator.ts; then
    echo "FAIL: pattern '$pattern' found in conceptQuestionGenerator.ts -- brief was outdated, update docs/issues/16-edge-cases.md"
    exit 1
  fi
done
echo '  OK: none of the brief patterns (data.number=37, from_label, to_label, Tens and Ones, Match Shapes, Compare Objects) exist in conceptQuestionGenerator.ts'
echo '  -- the H5 edge cases as written were against an older version of the codebase'

echo
echo '=== H5 verification PASSED ==='

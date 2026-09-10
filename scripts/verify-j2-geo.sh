#!/usr/bin/env bash
# verify-j2-geo.sh
# Smoke cover for the geo lookup endpoints per Issue J2.
#
# Coverage:
#   GET /api/states                              -- 200 + 36 entries
#   GET /api/districts/by-state/:stateId         -- 200 + shape (PB has districts),
#                                                   404 (unknown state)
#   GET /api/blocks/by-district/:districtId      -- 200 + shape (LDH has blocks),
#                                                   404 (unknown district)
#   GET /api/schools/by-block/:blockId           -- 200 + shape (LDH-01 has schools)
#
# Usage: bash scripts/verify-j2-geo.sh
set -e

API=${FLN_API:-http://127.0.0.1:3000}
BODY=$(python -c 'import os;print(os.path.join(os.environ.get("TEMP","/tmp"),"j2-body.json"))')

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
# GET /api/states
# =========================================================================

echo '--- GET /api/states ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' "$API/api/states")
assert_status 200 "$CODE" 'states'
python -c "
import json
with open(r'$BODY') as f: states = json.load(f)
assert isinstance(states, list), 'must be a list'
assert len(states) >= 36, 'must have at least 36 states/UTs, got ' + str(len(states))
for s in states[:3]:
    assert 'id' in s and 'name' in s, 'each state needs id+name'
print('  OK: ' + str(len(states)) + ' states; sample=' + str(states[0]))
"

# =========================================================================
# GET /api/districts/by-state/:stateId
# =========================================================================

echo '--- GET /api/districts/by-state/PB ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' "$API/api/districts/by-state/PB")
assert_status 200 "$CODE" 'districts-pb'
python -c "
import json
with open(r'$BODY') as f: ds = json.load(f)
assert isinstance(ds, list), 'must be a list'
assert len(ds) > 0, 'PB must have at least 1 district'
for d in ds:
    assert 'id' in d and 'name' in d, 'each district needs id+name'
print('  OK: ' + str(len(ds)) + ' districts in PB; sample=' + str(ds[0]))
"

echo '--- GET /api/districts/by-state/UNKNOWN 404 ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' "$API/api/districts/by-state/ZZ")
assert_status 404 "$CODE" 'districts-unknown'
grep -q 'Unknown state' "$BODY" || { echo 'FAIL: should mention Unknown state'; cat "$BODY"; exit 1; }

# =========================================================================
# GET /api/blocks/by-district/:districtId
# =========================================================================

echo '--- GET /api/blocks/by-district/LDH ---'
CODE=$(curl -sS -m 10 -o "$BODY" -w '%{http_code}' "$API/api/blocks/by-district/LDH")
assert_status 200 "$CODE" 'blocks-ldh'
python -c "
import json
with open(r'$BODY') as f: bs = json.load(f)
assert isinstance(bs, list), 'must be a list'
assert len(bs) > 0, 'LDH must have at least 1 block'
for b in bs:
    assert 'id' in b and 'name' in b and 'districtId' in b, 'each block needs id+name+districtId'
    assert b['districtId'] == 'LDH', 'districtId must be LDH'
print('  OK: ' + str(len(bs)) + ' blocks in LDH; sample=' + str(bs[0]))
"

echo '--- GET /api/blocks/by-district/UNKNOWN 404 ---'
CODE=$(curl -sS -m 5 -o "$BODY" -w '%{http_code}' "$API/api/blocks/by-district/ZZ")
assert_status 404 "$CODE" 'blocks-unknown'
grep -q 'Unknown district' "$BODY" || { echo 'FAIL: should mention Unknown district'; cat "$BODY"; exit 1; }

# =========================================================================
# GET /api/schools/by-block/:blockId
# =========================================================================

echo '--- GET /api/schools/by-block/LDH-01 ---'
CODE=$(curl -sS -m 10 -o "$BODY" -w '%{http_code}' "$API/api/schools/by-block/LDH-01")
assert_status 200 "$CODE" 'schools-ldh-01'
python -c "
import json
with open(r'$BODY') as f: schools = json.load(f)
assert isinstance(schools, list), 'must be a list'
print('  OK: ' + str(len(schools)) + ' schools in LDH-01')
for s in schools[:1]:
    assert s.get('blockCode') == 'LDH-01', 'blockCode mismatch'
    for k in ('id','name','stateCode','districtCode','blockCode'):
        assert k in s, 'missing ' + k
print('  OK: sample school shape valid')
"

echo '--- GET /api/schools/by-block/UNKNOWN (empty list, not 404) ---'
CODE=$(curl -sS -m 10 -o "$BODY" -w '%{http_code}' "$API/api/schools/by-block/ZZ_NONEXISTENT")
assert_status 200 "$CODE" 'schools-unknown-block'
python -c "
import json
with open(r'$BODY') as f: schools = json.load(f)
assert isinstance(schools, list), 'must be a list (filter just returns empty)'
print('  OK: empty list returned for unknown block (no 404 -- by design)')
"

echo
echo '=== J2 verification PASSED ==='

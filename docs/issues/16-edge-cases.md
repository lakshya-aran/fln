# Issue 16 — H5 Edge cases: 1-blank / multi-blank / missing answer-key

## Status

**Resolved** in branch `fix/assessment-features-h1-h15`. Live verification
script: `scripts/verify-h5-edge-cases.sh`.

## Important correction to the original brief

The original H5 brief in the assessment-features inventory referenced
specific answer-key shapes that **do not exist** in the current
codebase:

- "Tens and Ones fallback to `data.number` (37)"
- "Match Shapes to `from_label → to_label`"
- "Compare Objects to `data.answer`"
- Multi-blank `rows[]` shape with `answer_type: 'multi_blank'`

`conceptQuestionGenerator.ts` emits only simple `text | number | choice`
answers — no multi-blank labelled-pair shapes. The named patterns
(`data.number=37`, `from_label`, `to_label`, "Tens and Ones", "Match
Shapes", "Compare Objects") appear nowhere in that file.

The verify script contains a **negative code-inspection assertion** for
each of these patterns so that if a future contributor re-introduces
them, the assertion flips and the H5 doc must be updated.

## What the actual edge cases are

The codebase HAS a multi-blank answer-key shape — just in a different
place than the brief described:

- **Endpoint**: `GET /api/diagnostic/student/:studentId/answer-key`
  (`backend/src/routes/diagnosticBulk.ts:694-718`)
- **Shape**: returns the answer-key record plus a derived `rows[]` array
  built by `groupAnswerKeyByRow()`. Each row has:
  - `rowId`, `rowIndex`, `questionIds[]`, `question`, `correctAnswer`,
    `topic`, `source_level`
  - `blanks[]`: per-blank `{ questionId, answer, x_min, y_min }` (PDF
    coordinates of the printed answer box)
- **Live example** (Sara Singh's stored paper, Class 2, source_level=20):
  `{"rowId":"R1","question":"Fill in Missing Numbers #1","correctAnswer":"4, 8, 10","blanks":[{"questionId":"Q_L20_1_1_b1","answer":"4"},{"questionId":"Q_L20_1_1_b2","answer":"8"},{"questionId":"Q_L20_1_1_b3","answer":"10"}]}`
  — **a 3-blank row** that the brief assumed didn't exist. It does, just
  not in the file the brief pointed at.

## What I did

1. **Wrote `scripts/verify-h5-edge-cases.sh`** — curl-driven smoke that:
   - **GET answer-key**: 401 (no auth), 404 (nonexistent student with
     the documented "not found" error), 200 + rows[] shape for a real
     student who has a diagnostic paper.
   - **POST diagnostic/submit**: 400 + "None of the N answer key(s)
     match this student's paper" error for both 1-blank and 3-blank
     bogus-qid payloads (this is the only "1-blank / multi-blank" edge
     that exists in the handler at `students.ts:867-871`).
   - **Negative code-inspection**: grep `conceptQuestionGenerator.ts`
     for each of the 6 brief patterns. All must be absent.

2. **Verified live** against the running backend on `:3000` connected
   to MongoDB Atlas. Sara Singh's paper has **32 rows**, the first of
   which is a 3-blank Fill-in-Missing-Numbers question. Both submit
   variants returned 400 with the documented error.

3. **No backend or frontend code changed.** The H5 deliverable is a
   frozen verification surface, not new behavior.

## Live output (excerpt)

```
--- GET answer-key 404: nonexistent student ---
  OK [answer-key-missing]: HTTP 404
--- GET answer-key 200: real student ---
  OK [answer-key-present]: HTTP 200
  OK: rows[] has 32 entries; sample row: {"rowId":"R1","blanks":[3 blanks for "Fill in Missing Numbers #1"]}
--- 400 submit: question-id mismatch (1-blank edge) ---
  OK [mismatch-1-blank]: HTTP 400
--- 400 submit: question-id mismatch (3-blank edge) ---
  OK [mismatch-3-blank]: HTTP 400
--- code-inspection: brief patterns absent (negative assertion) ---
  OK: none of the brief patterns exist in conceptQuestionGenerator.ts

=== H5 verification PASSED ===
```

## How to run

```bash
bash scripts/verify-h5-edge-cases.sh
```

## What's left (out of scope for H5)

- **Real 3-blank scoring** — the answer-key shape supports 3 blanks per
  row, but the actual scoring logic for multi-blank rows lives in the
  bulk OCR's `parseAnswerKeyIds` helper
  (`backend/src/routes/diagnosticBulk.ts:367-374`), which is exercised
  by H1 (bulk OCR) — not H5 (single-blank edge cases).
- **OCR-vs-handwritten answer-key drift** — when the printed paper has
  multi-blank rows and the OCR returns a single string, the bulk-OCR
  submit path has its own translation logic. That's covered by H2's
  sequential submit test, not H5.

## Files changed

```
scripts/verify-h5-edge-cases.sh     (new, 137 lines)
docs/issues/16-edge-cases.md       (new, this file)
```

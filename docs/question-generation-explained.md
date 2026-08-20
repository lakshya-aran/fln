# FLN Question Paper Generation — End-to-End

A complete walkthrough of how a "bulk diagnostic question paper" goes from
a button click to a printable `.zip` on disk. This doc explains every step,
the files involved, how questions are sourced and assembled, and how the
final PDF is formatted. It is **descriptive** of today's code, not a design
proposal — see `docs/templates-spec.md` for the planned template-engine
rewrite.

---

## 0. Bird's-eye view

```
[Frontend: BulkDiagnosticWorkflow.tsx]
        |
        |  POST /api/diagnostic/bulk  { classNumber, students }
        v
[Backend: backend/src/index.ts]   route handler
        |
        v
[Backend: paperGenerator.ts]   generateDiagnosticPaper()
        |
        |  renderBatch()
        v
[Backend: worksheetRenderer.ts]   launches Puppeteer browser
        |
        v
[Browser: frontend/public/worksheets/class{1-4}.html]
        |  window.generateSets(n)         <- runs JS in the page
        |  window.buildPdfBlobForSet(i)   <- returns a PDF blob
        v
[Backend]   mergeAndStamp()              <- pdf-lib merges + stamps names
        |
        |  JSZip() bundles everything
        v
[Disk: backend/output/class{N}_diagnostic_<uuid>.zip]
   +- class{N}_bulk_diagnostic.pdf       (merged, all students, with name stamps)
   +- manifest.json                      (student list)
   +- Set_001_RollNo-X_Name/worksheet.pdf   (one per student)
   +- ... (one folder per student)

[Also: backend/output/class{N}_diagnostic_<uuid>.pdf]
       (a duplicate of the merged PDF written separately so the API can
        link to it without unpacking the zip)
```

Same generator handles **all four classes** (Class 1, 2, 3, 4). There is
**not** a separate generator per class — the difference is in *which* HTML
template + browser-side PDF function gets called.

---

## 1. The user click — `frontend/src/components/BulkDiagnosticWorkflow.tsx`

The user picks a class (1–4) and a student count. The component fetches
enrolled students from `/api/students` filtered by `classGroup`, then
POSTs:

```json
{
  "classNumber": 2,
  "count": 30,
  "students": [{ "name": "Asha", "studentId": "u_001" }, ...]
}
```

to `POST /api/diagnostic/bulk`. The response is a job descriptor with a
`jobId`; the frontend polls `/api/diagnostic/bulk/{jobId}/progress` every
1.5 s until the status flips from `running` to `completed`. When done,
the job's `pdfUrl` points at the merged PDF on disk.

---

## 2. The route handler — `backend/src/index.ts` (search for `/api/diagnostic/bulk`)

Three endpoints form the bulk-diagnostic flow:

- `POST /api/diagnostic/bulk` — kicks off a background job, returns the
  `jobId`.
- `GET  /api/diagnostic/bulk/{jobId}/progress` — returns the in-memory job
  status object.
- The job runner (a `setImmediate`-driven async function) eventually calls
  `generateDiagnosticPaper(...)` from `paperGenerator.ts` and stores the
  resulting filenames back into the job state.

The job runs in the **same Node process** as the API; there is no queue.
Progress is updated by mutating the in-memory `jobs` map.

---

## 3. `generateDiagnosticPaper(...)` — `backend/src/paperGenerator.ts`

This is the central function. It does five things in order:

### 3.1 Pick the class string and validate input

```ts
const classLevel = `CLASS_${classNumber}`;  // "CLASS_2"
if (!Array.isArray(students) || students.length === 0) throw ...
```

### 3.2 Call `renderBatch(classLevel, students.length, onProgress, undefined, students)`

`renderBatch` (in `worksheetRenderer.ts`) returns an array of
`RenderedResult` objects — one per student — each with:

```ts
{
  index: 1, ..., N,
  pdfBase64: "<base64 PDF of this student's worksheet>",
  masterJson: { sections: [{ section, items: [{ question, icr, data }] }] },
  csv: "...",
  coords: { /* pixel coordinates of every element, for the scanner */ },
  questionPaperJson: { ... },
}
```

This step is the slowest; see §4 for what it actually does.

### 3.3 Extract the question list (three branches!)

```ts
let questions: Question[] = [];
if (classNumber === 2 && students[0]?.studentId) {
  // Branch A: Class 2 — questions come from MongoDB Atlas
  const sId = students[0].studentId;
  questions = await dbStore.getStudentAssignedQuestions(sId, 2);

} else if (results[0]?.masterJson?.sections) {
  // Branch B: any class with a populated masterJson — walk sections → items
  results[0].masterJson.sections.forEach((sec, secIdx) => {
    sec.items?.forEach((item, itemIdx) => {
      questions.push({
        question_id: `diag_q_${secIdx}_${itemIdx}`,
        question: item.question,
        answer: item.icr?.expected ?? String(item.data?.answer ?? ''),
        answer_type: 'number',
        topic: sec.section,
        subtopic: sec.section,
        difficulty: 'medium',
        source_level: classNumber * 10,
      });
    });
  });

} else {
  // Branch C: fallback (should rarely trigger)
  questions = [{
    question_id: 'DIAG_Q1',
    question: `Identify the place value of the underlined digit: 7_8_4 (Class ${classNumber} Diagnostic)`,
    answer: '80',
    answer_type: 'number',
    topic: 'Number Sense',
    subtopic: 'place_value',
    difficulty: 'easy',
    source_level: classNumber * 10,
  }];
}
```

So the **same function produces three different sources of questions**:

| Class | Source | Why |
|---|---|---|
| **Class 2** (with student IDs) | `dbStore.getStudentAssignedQuestions()` | real per-student diagnostic questions already in MongoDB (assigned by a prior admin action) |
| **Class 1, 3, 4** (and Class 2 without IDs) | The first rendered set's `masterJson` | the questions embedded in the HTML template, captured by `buildMasterJSON` in the browser |
| Fallback | Hardcoded single "place value of 7_8_4" | if neither path produced anything (defensive) |

`source_level` is set to `classNumber * 10` (Class 1 → L10, Class 2 → L20,
etc.) which is an artifact of the L0–L93 numbering where Class N maps
roughly to level `N * 10`.

The returned `questions` is what the API exposes back to the frontend
and what gets stored in `EvaluationReport.conceptMastery` after grading.

### 3.4 Merge into one big PDF — `mergeAndStamp(results, students)`

```ts
const mergedBuffer = await mergeAndStamp(
  results.map(r => ({ index: r.index, pdfBase64: r.pdfBase64 })),
  students
);
```

`mergeAndStamp` (in `pdfMerge.ts`) loops through each rendered set, loads
its base64 PDF into a `PDFDocument`, copies every page into a master
`PDFDocument`, then **stamps** the student's name + ID in a small white
box in the top-right margin of every page:

```ts
const label = `STUDENT: ${NAME.UPPERCASE}   (ID: u_xxx)`;
page.drawRectangle({ x, y, w, h, color: white, borderColor: black });
page.drawText(label, { x, y, size: 9, font: HelveticaBold });
```

That's how a single 30-student class fits in one printable PDF without
losing track of who owns which page.

### 3.5 Bundle into a ZIP — `JSZip`

```ts
const zip = new JSZip();
zip.file(`class${classNumber}_bulk_diagnostic.pdf`, mergedBuffer); // the merged PDF
zip.file('manifest.json', JSON.stringify({
  classNumber,
  generatedAt: new Date().toISOString(),
  totalSets: students.length,
  students: students.map((s, idx) => ({
    name: s.name, studentId: ..., setNum: idx + 1, files: ['worksheet.pdf']
  })),
}, null, 2));

// one folder per student
results.forEach((r, idx) => {
  const folderName = `Set_${String(idx+1).padStart(3,'0')}_RollNo-${sId}_${sName}`;
  zip.file(`${folderName}/worksheet.pdf`, Buffer.from(r.pdfBase64, 'base64'));
});

// also collect answer keys INTERNALLY (never inside the zip)
const answerKeyData = results.map((r, idx) => {
  const studentQuestions = walkMasterJson(r.masterJson);   // see §3.5.1
  const flatAnswerKey = [];                                // see §3.5.2
  return { setNum: idx+1, studentId, studentName, masterJson: r.masterJson,
           coords: r.coords, questionPaperJson: r.questionPaperJson,
           questions: studentQuestions, answerKey: flatAnswerKey };
});

const pdfFileName = `class${classNumber}_diagnostic_${uuid}.pdf`;
fs.writeFileSync(path.join(OUTPUT_DIR, pdfFileName), mergedBuffer);

const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
const fileName = `class${classNumber}_diagnostic_${uuid}.zip`;
fs.writeFileSync(path.join(OUTPUT_DIR, fileName), zipBuffer);

return { fileName, filePath, pdfFileName, pdfFilePath, totalSets, studentOrder, questions, answerKeyData };
```

#### 3.5.1 Walking `masterJson` for per-student `Question[]`

`masterJson` is the in-page data structure the worksheet template
constructed during generation. Its shape:

```
masterJson = {
  sections: [
    {
      section: "Number Recognition",      // human-readable title
      items: [
        {
          question: "What number is this? 5",
          icr: { expected: "5" },          // ICR scanner reads the answer bubble
          data: { answer: "5" }            // alternate location
        },
        {
          question: "Count and write the number of apples",
          icr: null,                       // no OMR bubble — open answer
          data: { blanks: [ { position: 1, value: "4" } ] }  // fill-in-the-blank
        },
        ...
      ]
    },
    ...
  ]
}
```

The walker flattens this into `Question[]` per student, emitting one
question per item, with these rules:

- The **answer** is resolved from `icr.expected` first, then `data.answer`,
  both coerced to string.
- If `data.blanks[]` exists, the walker emits **one question per blank**
  with `question_id = "Q_L{class*10}_{secIdx+1}_{itemIdx+1}_b{blankIdx+1}"`
  and `answer = String(blanks[i].value)`. This is how fill-in-the-blank
  sections split into gradable units.
- `topic` / `subtopic` are both set to `sec.section` (e.g. "Number
  Recognition") — the section name carries both.
- `difficulty` is hardcoded `'medium'` everywhere in this walker.

#### 3.5.2 The flat answer key

A parallel `flatAnswerKey` array is built per student for downstream
scoring. Each entry is `{ qid, question_id, answer, type, pos? }` where
`type` is `'graded'` for one-shot OMR or `'fill_blank'` for blanks (with
`pos` = the blank position on the page).

These answer keys are returned from `generateDiagnosticPaper` so the
caller can persist them to MongoDB; they are **never** written into the
ZIP file.

---

## 4. `renderBatch(...)` — `backend/src/worksheetRenderer.ts`

This is where the actual question content is *generated*. It runs a real
browser via Puppeteer, points it at a class-specific HTML template,
evaluates JS in the page, and pulls back the result.

### 4.1 Pick the class adapter — `classAdapters.ts`

The adapter table maps a class string to:

```ts
{
  file: "C:\...\frontend\public\worksheets\class2.html",
  label: "Class 2",
  pdfFn: "buildPdfBlobForSet",   // window-scoped function to call
  pdfFnArgs: (i) => [i],         // args to pass
  pdfFnReturnsCoords: true,      // does the function return {pdfBlob, coords}?
}
```

So:

| Class | HTML template | PDF function | Returns coords? |
|---|---|---|---|
| 1 | `frontend/public/worksheets/class1.html` | `window.renderSetToPdf(i, 2)` | yes |
| 2 | `class2.html` | `window.buildPdfBlobForSet(i)` | yes |
| 3 | `class3.html` | `window.buildPdfBlob(i)` | no |
| 4 | `class4.html` | `window.buildPdfBlobForSet(i)` | no |
| personalized | `levels_main.html` | `window.buildPdfBlob(i)` | yes |

The HTML files live in the **frontend package** but the backend reads
them via `path.resolve(__dirname, '..', '..', 'frontend', 'public', 'worksheets')`.
Override with the `WORKSHEET_ASSETS_DIR` env var.

### 4.2 Load the page and trigger generation

```ts
const browser = await launchBrowser();          // shared Chrome instance
const page = await browser.newPage();
await page.goto(`file://${adapter.file}`, { waitUntil: 'load' });

if (classLevel === 'LEVEL_PERSONALIZED') {
  await page.evaluate('window.generateSetsForLevelAndSublevel(levelId, subIdx, count)');
} else {
  await page.evaluate('window.generateSets(n)');  // make N different sets
}
```

`window.generateSets(n)` is defined inside the HTML file — it builds N
distinct worksheets, each with different random question values, and
attaches them to `#ws-1`, `#ws-2`, ..., `#ws-n` in the DOM. The
generator uses `Math.random()` for everything, so each call gives a
fresh set.

### 4.3 Per-student identity + render

For each student (1..N), the backend:

1. Sets `#studentName` and `#studentId` input values to the student's name
   and ID. The HTML template's QR-code generator uses these to embed a
   unique QR payload.
2. Re-runs `window.generateSets(1)` so a single worksheet is built with
   the new student identity baked in.
3. Calls the adapter's `pdfFn` (e.g. `buildPdfBlobForSet(1)`) — this runs
   jsPDF or similar inside the page and returns a `Blob` (PDF bytes).
4. Optionally extracts **coords** — pixel coordinates of every
   question/answer bubble on the rendered page, used later by the ICR
   scanner to know where to read.
5. Calls `window.buildMasterJSON(...)` — a class-specific helper that
   serializes the in-page questions into the structured
   `{ sections: [...] }` shape the backend walks in §3.5.
6. Calls `window.buildCSV(...)` and `window.buildQuestionPaperJSON(...)`
   for downstream grading.

The result of each iteration is a `RenderedResult` containing
`pdfBase64`, `masterJson`, `coords`, etc.

---

## 5. Where the questions actually come from (inside the HTML files)

Each `frontend/public/worksheets/class{N}.html` (and `levels_main.html`
for personalized) is a self-contained HTML file with embedded JS that
defines:

- A **question bank** for that class — typically an array of `~30–60`
  hand-authored question templates with variable placeholders for
  numbers/words.
- A `generateOneSet()` (or `generateSets()`) function that picks a few
  items from the bank, fills in the placeholders with random values,
  computes the answer, and draws the worksheet onto the page using
  positioned `<div>` elements with absolute coordinates.
- A `buildMasterJSON(setIndex)` function that reads the generated DOM
  back out and turns it into the structured JSON shape the backend
  expects (`sections[].items[].question / icr / data`).
- A `renderSetToPdf` / `buildPdfBlobForSet` function that uses **jsPDF**
  (loaded as a script tag) to rasterize the DOM into a PDF blob.

So questions live **in the HTML**, not in TypeScript. That's why the
backend depends on a real Chrome browser — it has to *run* the HTML's JS
to produce the questions. The bank is hand-curated per class; this is
why "different question paper generators for different classes" felt
true earlier — they actually live in different HTML files, but the
*driver* (Node + Puppeteer + pdf-lib + JSZip) is shared.

The template-engine spec at `docs/templates-spec.md` proposes replacing
this "HTML + embedded JS question bank + browser-render" architecture
with a "JSON template descriptor + Node-native engine" architecture so
the 93-level question bank can be authored, audited, and pedagogical-cited
without touching browser automation.

---

## 6. PDF layout & formatting

### 6.1 Inside the HTML template (per-student worksheet)

Each student worksheet is laid out via positioned `<div>`s styled by an
embedded `<style>` block in the HTML file. Typical primitives:

| Class | Style source | Notes |
|---|---|---|
| Class 1 | inline `<style>` in `class1.html` | handwritten-tracing sections, large fonts, dotted letter guides |
| Class 2 | inline `<style>` in `class2.html` | number rows + word problem block + OMR bubbles |
| Class 3 | inline `<style>` in `class3.html` | multi-digit arithmetic, vertical layout |
| Class 4 | inline `<style>` in `class4.html` | measurement + fractions + multi-step word problems |
| Personalized (`levels_main.html`) | inline `<style>` in that file | 1–93 levels, picked by `levelId` |

The HTML files are *themselves* the print templates — they set
`@page { size: A4; margin: 0 }`, use absolute positioning, and embed
fonts (Noto Sans). jsPDF rasterizes the page DOM at A4 dimensions.

### 6.2 The merged bulk PDF (`pdfMerge.ts`)

`mergeAndStamp` does the assembly:

```
Class 2 — 30 students
+-- Page 1   : Student A's worksheet (stamped with "STUDENT: A")
+-- Page 2   : Student B's worksheet (stamped with "STUDENT: B")
+-- ...
+-- Page 30  : Student Z's worksheet
```

For each rendered set's page, the stamper:

1. Copies the page into a master `PDFDocument` via pdf-lib's
   `copyPages()`.
2. Draws a small **white-on-black-outlined rectangle** in the
   top-right margin (about 9 pt font).
3. Writes `STUDENT: <NAME>   (ID: <id>)` inside that rectangle.

The rectangle is intentionally small and unobtrusive so it doesn't
obscure the worksheet content underneath — it's purely an identification
stamp for when the sheets come back from the printer.

### 6.3 Fonts

Every PDF embeds Helvetica / Helvetica-Bold (StandardFonts from pdf-lib).
The HTML templates add Noto Sans via Google Fonts for the per-student
worksheet content (so it has nice Unicode coverage for Indian-language
content if used). When jsPDF rasterizes, it captures whichever fonts the
DOM is using at the time.

---

## 7. Where things land on disk

`OUTPUT_DIR = path.join(__dirname, '..', 'output')`
= `C:\Users\sahil\Documents\FLN-12\fln\backend\output\`

After a Class 2 bulk run with 30 students:

```
backend/output/
+-- class2_diagnostic_<uuid>.zip                   (deliverable ZIP, ~MB)
|   +-- class2_bulk_diagnostic.pdf                 (merged 30-page PDF)
|   +-- manifest.json
|   +-- Set_001_RollNo-001_Asha/worksheet.pdf
|   +-- Set_002_RollNo-002_Riya/worksheet.pdf
|   +-- ... (30 folders)
|   (NO answer_key.json, coords.json, or question_paper.json inside the zip — security)
+-- class2_diagnostic_<uuid>.pdf                   (the same merged PDF, written separately
|                                                    so the API can stream it without unpacking)
```

The ZIP is the user's download. The standalone `.pdf` is what
`pdfUrl` / `downloadUrl` in the job status points at (faster to serve
than re-extracting from the zip).

---

## 8. End-to-end latency breakdown (typical, 30 students, Class 2)

| Step | Time |
|---|---|
| Browser launch (shared Chrome) | ~1.5 s |
| Per-student render (`buildPdfBlobForSet` + jsPDF) | ~0.4 s × 30 = 12 s |
| Per-student master JSON + coord capture | ~0.1 s × 30 = 3 s |
| `mergeAndStamp` (pdf-lib merge + stamp) | ~0.5 s |
| `JSZip.generateAsync` (DEFLATE level 6) | ~1 s |
| **Total** | **~18 s** |

The frontend polls every 1.5 s, so the user sees progress ticks at
"1/30, 2/30, ..." from the `onProgress` callback in `renderBatch`.

---

## 9. What the API returns to the frontend

The bulk-job progress endpoint returns:

```json
{
  "jobId": "...",
  "classNumber": 2,
  "totalStudents": 30,
  "completed": 30,
  "status": "completed",
  "pdfUrl": "/output/class2_diagnostic_<uuid>.pdf",
  "error": "",
  "downloadUrl": null
}
```

The frontend's `BulkDiagnosticWorkflow` renders a green "Print / Open PDF
(N papers)" button pointing at `pdfUrl`. Clicking it opens the merged
PDF in a new tab.

---

## 10. Known sharp edges (today)

- **One HTML template per class.** Class 2 has its own bank;
  Class 1, 3, 4 each have theirs; the personalized flow has another.
  Adding a class (or radically changing one) means editing the HTML.
- **Different question sources for Class 2 vs others.** Class 2 reads
  real assigned questions from MongoDB; the others reuse the first
  rendered set's `masterJson`. This is brittle: if the first set's
  `masterJson` is malformed, every student silently gets the fallback
  hardcoded question.
- **No pedagogical audit trail.** Each question's numbers live in the
  HTML's JS, scattered across `generateOneSet`. There's no central
  record of "L5 should have 4 counting questions with operands in
  [1, 5]" — you'd have to read every HTML file.
- **`source_level = classNumber * 10` is a heuristic.** Real FLN levels
  are L1–L93, not L10/L20/L30/L40. The diagnostic paper is
  class-scoped, not level-scoped.
- **`renderWorksheetPdf` (line 431) builds personalized PDFs
  differently** — using a second Puppeteer pass and a hardcoded
  inline stylesheet, not the class-template HTML. It's the only path
  that doesn't go through `renderBatch`.

These are the things the template-engine rewrite (`docs/templates-spec.md`)
aims to fix.

---

## 11. Question-generator inventory per HTML template

This section catalogs every question generator in each HTML template so
the question bank is auditable at a glance. Generated with
`grep -cE "function section[0-9]+\b" frontend/public/worksheets/<file>.html`
on 2026-08-07.

### File sizes (lines of code)

| File | LOC | Question-bank style |
|---|---:|---|
| `frontend/public/worksheets/class1.html` | **1,120** | `function sectionN()` |
| `frontend/public/worksheets/class2.html` | **1,401** | `function sectionN()` |
| `frontend/public/worksheets/class3.html` | **1,275** | `function sectionN()` + `SECTIONS` registry |
| `frontend/public/worksheets/class4.html` | **821** | `Q.Sn = function()` map (no `section` prefix) |
| `frontend/public/worksheets/levels_main.html` | **8,859** | Different shape — see note below |
| **Total HTML LOC** | **13,476** | |

### Top-level question generators per file

The number is the count of distinct question-group generator functions
(or map entries). Each generator may emit multiple graded question items
inside one paper section (e.g. one matching question with 4 items = 4
graded answers, or one vertical-addition problem with 2 numbers).

| File | # of generators | Pattern | Examples |
|---|---:|---|---|
| `class1.html` | **9** (`section1` … `section9`) | `function sectionN()` | shape matching, number sequence, missing number, pattern, addition (single-digit), more/less, count & write, pre-number tracing, write the number |
| `class2.html` | **11** (`section1` … `section11`) | `function sectionN()` | missing numbers 1–100, comparison `< > =`, write the shape name, pattern, addition, subtraction, heavier/lighter, length measurement, time (clocks), money (note/coin), ascending/descending order |
| `class3.html` | **17** declared, **15 active** (2 omitted: section7 Heavier, section13 Calendar) | `function sectionN()` + `SECTIONS` array (lines 741–759) | See section titles below |
| `class4.html` | **17** (`Q.S1` … `Q.S17`) | `Q.Sn = function()` object-map (lines 179–514) | Place value blocks, expanded form, compare numbers, ascending/descending order, addition (multi-digit), subtraction, multiplication, division, time, money, fractions, perimeter, data interpretation, geometry, equation-solving, multi-step word problem, "circle the operation" |
| `levels_main.html` | (different shape — see §11.1) | Per-level generator functions | |

### Class 3 — full section list (from `SECTIONS` registry, lines 741–759)

```
 1. Missing Numbers (1 to 100)
 2. Comparison (<, >, =)
 3. Write the Shape Name
 4. Pattern
 5. Addition
 6. Subtraction
 7. Circle the Heavier Object         [OMITTED — see line 761]
 8. Length Measurement (Non-standard Units)
 9. Write the Time (Clocks)
10. Add the Value of Note or Coin
11. Ascending Order
12. Descending Order
13. Calendar Questions                [OMITTED]
14. Tens and Ones
15. Data Collection and Interpretation
16. Multiplication
17. Division
```

15 active sections per Class 3 paper.

### Class 4 — full Q-map list (lines 179–514)

```
Q.S1   Place Value Blocks
Q.S2   Expanded Form
Q.S3   Compare Numbers
Q.S4   Ascending / Descending Order
Q.S5   Addition (Multi-digit)
Q.S6   Subtraction (Multi-digit)
Q.S7   Multiplication
Q.S8   Division
Q.S9   Time (Clock reading)
Q.S10  Money (Note/Coin value)
Q.S11  Fractions
Q.S12  Perimeter / Measurement
Q.S13  Data Interpretation
Q.S14  Geometry (Shape properties)
Q.S15  Equation Solving
Q.S16  Multi-step Word Problem
Q.S17  Circle the Operation (MCQ)
```

### 11.1 `levels_main.html` — different shape (8,859 LOC)

`levels_main.html` is the **personalized-worksheet** generator used by the
non-bulk `/api/students/{id}/worksheet/{level}/{subIdx}` path. It does
**not** use the `function sectionN()` pattern. Instead, for each of the
93 FLN levels × 3 sub-levels it ships its own generator (or reuses
sections from the class templates). The 8,859 LOC figure includes the
per-level procedural question generators, the worksheet layout engine,
the jsPDF rendering hooks, the QR code generator, the answer-key
builder, the CSV exporter, and the masterJSON assembler.

It was not enumerated section-by-section because the file structure is
not `sectionN()`-based; auditing it requires reading per-level blocks.
This is one of the motivations for the template-engine rewrite proposed
in `docs/templates-spec.md` — a structured JSON descriptor per level
would replace ~9 KLoC of inline JS with ~93 small data files.

### Total question-bank generator count (rough)

Summing the per-class counts:

```
class1.html:        9 section generators
class2.html:       11 section generators
class3.html:       15 active sections (17 declared, 2 omitted)
class4.html:       17 Q.Sn generators
levels_main.html: ~93 levels × 3 sub-levels (per-level procedural generators)
```

### Important caveats

- **"Question" is fuzzy.** Each `sectionN()` may emit one graded answer
  (e.g. "match shapes") or several (e.g. "fill in the missing numbers
  1–100" produces ~20 graded answers per paper). The section count above
  counts the *generator*, not the per-paper graded-item count.
- **Sub-levels multiply.** Levels_main emits different items per
  `(level, subIdx)` pair, so the actual per-paper graded answer count
  varies.
- **Random values.** Each section function calls `Math.random()` for
  numerics, distractors, and ordering — so two papers generated by the
  same function are structurally identical but numerically different.
- **No central inventory.** There's no single file that lists "all
  questions ever generated." The audit story requires reading each HTML
  file's section functions end-to-end.

---

## 12. `levels_main.html` — full inventory

This is the **personalized worksheet** generator (used by the
non-bulk `/api/students/{id}/worksheet/{level}/{subIdx}` path). It's the
biggest of the worksheet templates (8,859 LOC, 526 KB) and the most
programmatic of the four.

### 12.1 Title says 59, the curriculum claims 93

The `<title>` element on line 6 reads:

```html
<title>FLN Worksheet Generator — All 59 Levels</title>
```

…but `CLAUDE.md` and the FLN-Levels directory both talk about **93
levels**. The truth is in the `LEVELS` array:

| File | Levels covered | Gap |
|---|---|---|
| `levels_main.html` | **L1–L59** (contiguous, no gaps) | L60–L93 not authored |
| `class1.html`, `class2.html`, `class3.html`, `class4.html` | not used for personalized path | — |

So the personalized worksheet engine **does not generate L60–L93 papers**.
Anything in that range falls through to whatever fallback the backend
has (typically a hardcoded placeholder or the four class templates).

### 12.2 Structural overview

The file is divided into four logical sections:

| Lines | What it contains |
|---|---|
| 1–187 | HTML head + CSS (controls, layout, print styles) — ~190 LOC |
| 188–~450 | Tiny utilities (`ri`, `shuffle`, `sample`, `pick`, `drawClock`, `divisionBracketHtml`, …) — ~260 LOC |
| ~450–7400 | **All the per-question generator functions** (`addition-vertical`, `multiplication-picture-boxes`, `fraction-op-numeric`, `map-follow-route`, …) — ~6,950 LOC |
| 7400–8310 | The `LEVELS` registry (see §12.3) — ~910 LOC |
| 8310–8859 | Top-level driver functions: `generateLevelAsync`, `buildCleanAnswerKey`, `buildMasterJSON`, `buildCSV`, `captureCoordsForIndex`, `exportSetsAsZip`, `setStatus`, `populateLevelSelect`, `currentPageWrapper`, `renderMultiSelectList`, `generateSetsForLevelAndSublevel`, `buildMasterJSON`, `buildCSV` — ~550 LOC |

### 12.3 The `LEVELS` registry (line 7405)

```js
function sec(letter, name, type, params) { return {letter, name, type, params: params || {}}; }

const LEVELS = [
  { id: 1, title: "Quantity Comparison", subs: 3, slug: "quantity-comparison",
    build: (s) => { /* returns [sec, sec, sec] for sub-level s */ } },
  { id: 2, title: "Odd One Out",         subs: 3, slug: "odd-one-out", ... },
  { id: 3, title: "Shape Matching & Marine Tracing", subs: 3, ... },
  ...
  { id: 59, title: "Advanced Mastery Assessment", subs: 1, ... }
];
```

Each entry is a **level descriptor**: id, title, number of sub-levels,
URL slug, and a `build(s)` factory that returns the list of sections
to render for sub-level `s`. The factory's output is a list of `sec()`
records: `{letter, name, type, params}`. The `type` string is the name
of a generator function defined in §12.4.

### 12.4 The question-generator function zoo

The file defines **124 top-level functions**. Of those:

- **~6 utilities** (`ri`, `shuffle`, `sample`, `pick`, `pad4`, `esc`, `labelize`, `tallyString`, `drawClock`, `divisionBracketHtml`, `hundredBlock`/`tenBlock`/`oneBlock` block-builders, etc.) — ~10 functions
- **~210 question generators** (the `sec(...)` `type` strings) — each produces HTML + answer data for one section of one level
- **~15 render + layout + export functions** (`drawClock`, `divisionBracketHtml`, the page-wrapper renderers, `generateLevelAsync`, `buildMasterJSON`, `buildCSV`, `captureCoordsForIndex`, `exportSetsAsZip`, etc.)

The 210 distinct `type` strings found via
`grep -oE "sec\\('[A-Z]',[^,]+,'[a-z][a-z0-9-]+'" levels_main.html | grep -oE "'[a-z][a-z0-9-]+'$" | sort -u`
fall into thematic clusters:

```
Comparison / Counting        compare-equal-match, three-size-comparison,
                             relation-comparison, length-comparison-visual,
                             size-comparison-visual, ...
Pattern / Sequence           number-sequence-blanks, sequence-blank-hand,
                             pattern-shape-blanks, pattern-table-single-blank,
                             pattern-mcq-circle, ...
Addition (within 10)         addition-add-and-match, addition-picture-boxes,
                             addition-objects, addition-icon-notation, ...
Subtraction (within 10)      subtraction-subtract-and-match,
                             subtraction-picture-boxes, subtraction-objects, ...
Place value (2-/3-/4-digit)  tens-ones-mixed, tens-ones-blocks-mixed,
                             build-number-hto, build-number-4digit,
                             expanded-form-4digit, ...
Multiplication               multiplication-vertical-configurable,
                             multiplication-picture-boxes,
                             multiplication-missing-number, ...
Division                     division-vertical-configurable,
                             division-vertical-remainder,
                             division-picture-boxes, division-intro, ...
Fractions                    fraction-op-numeric, fraction-visual-op,
                             fraction-color-result, fraction-complete-whole, ...
Measurement                  perimeter-shapes-find, area-shapes-find,
                             area-count-grid-shapes, area-compare-two-shapes,
                             area-perimeter-both-visual, ...
Geometry / Angles            angle-identify-type, angle-measure-protractor,
                             angle-compare-mixed, angle-compare-circle, ...
Symmetry                     symmetry-draw-line, symmetry-complete-half,
                             symmetry-mirror-mcq, symmetry-identify, ...
Maps / Directions            map-identify-directions, map-follow-route,
                             map-shortest-path, map-match-directions, ...
Factors / Multiples          factors-list-find, multiples-list-write,
                             common-factors-multiples-mixed, factor-pairs-boxes, ...
Decimals                     decimal-place-value-fill, decimal-read-write-words,
                             decimal-grid-write, decimal-shade-strip, ...
Time / Money                 (re-uses drawClock SVG; money uses
                             money-decimal-compare, money-decimal-write, ...)
```

There are **371 `sec()` calls** inside `build(s)` factories across all 59
levels — i.e. the average level has ~6.3 sections per paper (range:
1 section for the assessment levels L11, L59; up to 4 sections per
sub-level for the content levels).

### 12.5 Per-level sub-level distribution

The `subs` field tells how many sub-levels a level has. The actual
distribution across the 59 levels:

| `subs` value | # of levels | Examples |
|---:|---:|---|
| 1 | 2 | L11 (Review Assessment), L59 (Advanced Mastery Assessment) |
| 2 | 4 | L4 (Numbers 1–10), L15, L19, L35 |
| 3 | 47 | Most content levels (L1–L3, L5–L10, L12–L14, L16–L18, L20–L34, L36–L40, L44, L46, L47, L49, L52–L58) |
| 4 | 6 | L50 (Advanced Multiplication), L51 (Advanced Division) |

- **Total (level, sublevel) pairs**: **175**
- This means a single render through all 59 levels produces 175 distinct
  sub-level papers.

### 12.6 The full level list (titles + sub-counts)

```
L1   Quantity Comparison                          subs=3
L2   Odd One Out                                  subs=3
L3   Shape Matching & Marine Tracing              subs=3
L4   Numbers 1-10                                 subs=2
L5   Finger Gesture Counting                      subs=3
L6   After, Between, Before                       subs=3
L7   Addition through objects                     subs=3
L8   Subtraction(1-10)                            subs=3
L9   Pattern Recognition+Draw by Tracing          subs=3
L10  Comparison - Numeral                         subs=3
L11  Review Assessment                            subs=1
L12  Tens and Ones                                subs=3
L13  Numbers 11-30                                subs=3
L14  Counting + Fun Trace                         subs=3
L15  After, Between & Before                      subs=2
L16  Two-Digit Number Names                       subs=3
L17  Comparison (<, >, =)                         subs=3
L18  Length (Non-standard Units)                  subs=3
L19  Time & Calendar                              subs=2
L20  Money (Notes & Coins)                        subs=3
L21  Data Handling                                subs=3
L22  Addition (with regrouping)                   subs=3
L23  Subtraction (with regrouping)                subs=3
L24  Mental Math Strategies                      subs=3
L25  Word Problems (Add/Subtract)                 subs=3
L26  Multiplication (Tables 2–5)                  subs=3
L27  Multiplication (Tables 6–9)                  subs=3
L28  Division (Equal Groups)                      subs=3
L29  Mixed Operations                             subs=3
L30  Number Patterns & Skip Counting              subs=3
L31  Time & Money (Advanced)                      subs=3
L32  2-Digit Arithmetic                           subs=3
L33  Measurement (Standard Units)                 subs=3
L34  Data & Graphs (Intermediate)                 subs=3
L35  Fractions (Introduction)                     subs=2
L36  Fractions (Comparison)                       subs=3
L37  Fractions (Operations)                       subs=3
L38  Decimals (Money)                             subs=3
L39  Geometry (Shapes & Properties)               subs=3
L40  Patterns & Algebra (Intro)                   subs=3
L41  ...                                          subs=4   (need to verify)
L42  ...                                          subs=4
L43  ...                                          subs=4
L44  ...                                          subs=3
L45  ...                                          subs=4
L46  ...                                          subs=3
L47  ...                                          subs=3
L48  ...                                          subs=4
L49  Numbers up to 10,000                         subs=3
L50  Advanced Multiplication                      subs=4
L51  Advanced Division                            subs=4
L52  Maps & Directions                            subs=3
L53  Factors & Multiples                          subs=3
L54  Fraction Operations                          subs=3
L55  Decimals (Introduction)                      subs=3
L56  Area & Perimeter                             subs=3
L57  Angles                                       subs=3
L58  Symmetry & Reflection                        subs=3
L59  Advanced Mastery Assessment                  subs=1
```

(Titles for L41–L48 are abbreviated; see `levels_main.html` lines
7500–7800 for the full text.)

### 12.7 How `build(s)` and `sec(...)` actually produce a paper

1. Caller picks `(levelId, subIdx)` — `LEVELS[levelId-1].build(subIdx)`
   returns a list of section specs.
2. Each section spec `{letter, name, type, params}` is fed into a
   section-renderer (the actual generator function whose name matches
   `type`). The renderer takes `params` and returns `{html, answers}`
   where `html` is the section's DOM string and `answers` is the ICR
   answer key.
3. The page-wrapper renders a `#ws-N` div containing all the section
   HTML, plus header (title + student name/ID + QR code).
4. `buildMasterJSON(start, end)` walks the DOM and serializes every
   section's questions + answers into the `{ sections: [...] }` shape
   the backend consumes.
5. `captureCoordsForIndex(idx)` reads `data-omr` attributes from the
   rendered DOM to produce the per-pixel coordinates needed by the
   ICR scanner (so it knows where each answer bubble is on the page).
6. `exportSetsAsZip(indices, zipBaseName)` bundles the per-set PDFs
   + answer keys into a downloadable ZIP.

### 12.8 Connection to the backend

The backend's `paperGenerator.ts` reaches `levels_main.html` only for
the `LEVEL_PERSONALIZED` class in `classAdapters.ts`:

```ts
LEVEL_PERSONALIZED: {
  file: path.join(WORKSHEETS_DIR, 'levels_main.html'),
  label: 'Personalized',
  pdfFn: 'buildPdfBlob',
  pdfFnArgs: (setIndex) => [setIndex],
  pdfFnReturnsCoords: true,
}
```

When a teacher requests `/api/students/{id}/worksheet/{level}/{subIdx}`,
the backend loads this file in Puppeteer, calls
`window.generateSetsForLevelAndSublevel(levelId, subIdx, count)` (line
8822), and extracts the PDF + coords + master JSON.

So the **bulk-diagnostic path** uses `class{1-4}.html` (driven by
`classNumber`), and the **personalized-worksheet path** uses
`levels_main.html` (driven by `levelId + subIdx`). Two separate engines,
one shared output shape (`masterJson + coords + answerKey`).

### 12.9 What "93 levels" actually means

The FLN-Levels directory contains HTML files (`level-1.html` through
`level-93.html`) that are **child-page worksheets** rendered inside the
`levels_main.html` workspace — they are visual previews of each level's
output, not separate generators. The 93 figure comes from the
**strands × grade** curriculum map (in
`ai-services/syllabus/class_{1-4}/*.json` and the
`CURRICULUM_MAPPING` in `backend/src/config/curriculumMap.ts`), not from
this file.

`levels_main.html`'s 59 levels represent the **mastery progression** a
student actually walks through in the personalized worksheet engine —
the personalized path goes L1 → L59, branching into harder sub-levels
along the way. L60–L93 are conceptual strands that the diagnostic /
recommendation engine references (e.g. "this student should work on
strand S7.18 next") but the worksheet generator does not produce paper
for them.

### 12.10 Known sharp edges specific to `levels_main.html`

- **Title is stale.** Says "All 59 Levels" — accurate, but should be
  updated if L60–L93 are ever added.
- **210 generator functions** is a lot of code to audit. There's no
  index file mapping `type` strings to function definitions.
- **Sub-level distribution is uneven** (1/2/3/4 subs across the
  registry). The backend's `QuestionService` assumes 3 sub-levels
  (`subLevel ∈ {0, 1, 2}`); levels with `subs=1` or `subs=4` will
  emit fewer/more papers than the backend expects.
- **`buildMasterJSON` is class-conditional** (line 8832). For
  `LEVEL_PERSONALIZED` it walks sections differently than for the
  class templates. If a new level is added with a section shape that
  `buildMasterJSON` doesn't recognize, it'll silently emit an empty
  questions array.
- **Random values everywhere.** Each generator calls `ri(min, max)` /
  `shuffle()` / `pick()` so two consecutive renders produce structurally
  identical but numerically different papers. There's no seeded RNG, so
  re-rendering is non-deterministic — a regression test that compares
  two renders will always fail.
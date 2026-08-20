# FLN Template Master Style Specification

This document defines the concrete visual rules for all 52 question templates, so a renderer can lay out any template onto an A4 page with predictable typography, spacing, and SVG handling.

The rules are derived from:
- the existing `frontend/public/worksheets/proposed-levels/class1-diagnostic-cognitive.html` style (Times New Roman, 1.5em A4 sheet, dashed section dividers)
- the spec at `docs/52-question-templates.md`
- the user's clarifications: black-and-white only, monochromatic outlined SVGs, no card border, square-bordered question badge with bold number

---

## 1. Page

| Property            | Value                                     |
| ------------------- | ----------------------------------------- |
| Page size           | A4 (210 × 297 mm)                         |
| Orientation         | Portrait                                  |
| Outer margin        | 16 mm top / bottom, 18 mm left / right    |
| Sheet class         | `.sheet` — width 210mm, min-height 297mm  |
| Body background     | `#fff` (white)                            |
| Body color          | `#000` (black)                            |

Templates are laid out as a **vertical stack** of 4–5 `.q` blocks per page, separated by 8 mm of whitespace (no borders, no section dividers — the templates themselves carry the visual structure).

---

## 2. Font Family

| Use                  | Family                                                |
| -------------------- | ----------------------------------------------------- |
| All body text        | `Noto Sans` (Regular)                                |
| Important words      | `Noto Sans` (SemiBold)                               |
| Question number      | `Noto Sans` (Bold)                                    |
| Section heading      | `Noto Sans` (Bold)                                    |
| Instructions         | `Noto Sans` (Medium or SemiBold)                     |
| Numbers / digits     | `Noto Sans` (Regular; numerals stay with the family) |

**Rationale**: a single sans-serif family across every element simplifies the renderer (one font face, four weights), avoids the legibility shift between serif body and sans-serif numbers, and reads cleanly at the small sizes the 4-templates-per-page layout demands. Noto Sans is a Google-licensed open family with full Latin + Devanagari coverage so the same paper renders for Hindi/English students without swapping fonts.

The renderer loads Noto Sans via `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap">` (or a self-hosted copy at `frontend/public/fonts/noto-sans/` for offline printing).

---

## 3. Font Sizes & Weights

**Font size matters more than the font family.** Class 1–2 children are still learning to read — text below 16 pt actively slows comprehension. The recommended sizes for an FLN question paper are larger than typical Indian board-exam guidance.

### Per-class scale (the source of truth)

| Element              | Class 1–2     | Class 3–4     | Weight         | Line height |
| -------------------- | ------------- | ------------- | -------------- | ----------- |
| Question text        | 18–20 pt      | 16–18 pt      | Regular (400)  | 1.4         |
| Instructions         | 18–20 pt      | 16–18 pt      | SemiBold (600) | 1.4         |
| Options              | 18–20 pt      | 16–18 pt      | Regular (400)  | 1.4         |
| Numbers              | 22–28 pt      | 20–24 pt      | SemiBold (600) | 1.1         |
| Section heading      | 24–30 pt      | 22–28 pt      | Bold (700)     | 1.2         |
| Main title           | 28–34 pt      | 26–32 pt      | Bold (700)     | 1.2         |
| Question number badge | 18 pt        | 16 pt         | Bold (700)     | 1.0         |
| Marks badge          | 14 pt        | 12 pt         | Medium (500)   | 1.0         |
| SVG caption / labels  | 14 pt        | 12 pt         | Regular (400)  | 1.3         |
| Footer / page-end     | 12 pt        | 11 pt         | Regular (400)  | 1.4         |

CSS variables (so the renderer can pick a class-size preset):

```css
:root {
  /* Class 1–2 paper preset (default) */
  --fs-question:    19pt;
  --fs-instruction: 19pt;
  --fs-option:      19pt;
  --fs-number:      24pt;
  --fs-section:     28pt;
  --fs-main-title:  30pt;

  /* Class 3–4 preset (override) */
  --fs-question:    17pt;
  --fs-instruction: 17pt;
  --fs-option:      17pt;
  --fs-number:      22pt;
  --fs-section:     24pt;
  --fs-main-title:  28pt;
}
```

**Why 18 pt body**: PARAKH guidance is 12–14 pt for general text, but those are for older students. A Class 1 child reading "Draw a line from each picture to its matching partner" at 14 pt has to slow down at every word. 18–20 pt is the FLN-correct range. The cost is fewer questions per page — which is the right trade.

---

## 4. Capitalisation Rule

**No ALL CAPS for instructions or question text.** Use sentence case:

```
WRONG                          RIGHT
─────────────────────────────  ─────────────────────────────
DRAW A LINE FROM EACH           Draw a line from each
PICTURE TO ITS MATCHING         picture to its matching
PARTNER.                        partner.
```

The Government of India's Digital Brand Identity Manual advises against all-caps for long sentences because it reduces readability (every letter is a uniform shape; the reader can't use word-shape cues to recognise the word quickly). Sentence case is faster to read, especially for early readers.

**Exception: short titles up to ~3 words can stay ALL CAPS.** These act as visual landmarks, not as reading material:

```
MATCH THE PAIRS    ← ok (3 words, landmark)
COUNT OBJECTS       ← ok (2 words, landmark)
```

Anything 4 words or more — use sentence case.

The T03 spec's child-facing title **"MATCH THE PAIRS"** falls in the exception (2 words, landmark) so it stays. The instruction sentence **"Draw a line from each picture to its matching partner"** falls in the rule (sentence case).

---

---

## 5. Spacing System (within a single `.q` block)

### Page budget — templates per page

The renderer allocates vertical space per template based on the template's declared height, not a fixed slot height. A page holds as many templates as fit:

| Class      | Target templates per page |
| ---------- | ------------------------- |
| Class 1–2  | **4**                     |
| Class 3–4  | **5**                     |

The renderer does this by:
1. Reading each template's `heightHint` (declared per-template, see §6).
2. Summing heights greedily until the page is full (32 mm header + footer + content = 265 mm available).
3. Filling the last page with whatever templates remain, even if it goes to 3 or 4.5.

**Templates have their own size.** A match template with 3 SVG pairs + connecting strip needs ~110 mm. A fill-in-the-blank template needs ~50 mm. A count-and-write template needs ~40 mm. The renderer respects each template's hint instead of forcing them into a uniform slot.

### Within-block spacing (scales with body font size)

| Element                                  | Spacing                       |
| ---------------------------------------- | ----------------------------- |
| `.q-head` top margin                      | 0                             |
| `.q-head` to `.q-body`                    | 6 px                          |
| `.q-body` left indent (after badge)       | 44 px (clears the 32px badge + 12px gap) |
| `.q-body` bottom margin (next `.q`)      | 18 px                          |
| Activity SVG container top margin         | 10 px                          |
| Activity SVG container bottom margin      | 10 px                          |
| Answer box top margin                     | 12 px                          |
| Inside an activity (multiple SVG rows)    | 8 px between rows             |
| Inside an activity (horizontal SVG pair) | 24 px between left + right column |

---

## 6. Element Sizes (in mm unless noted)

### Question number badge

```
┌────┐
│ Q1 │   16mm × 16mm  (square, Class 1–2)
└────┘   1.5pt solid #000 border
        Q-number text: 18px bold Noto Sans (Class 1–2) / 16px bold (Class 3–4)
```

### Question title + marks badge

```
[Q1]  Count Objects    [1 mark]
 ↑     ↑                  ↑
 16mm  flex (1fr)         14px Medium (Class 1–2) / 12px Medium (Class 3–4)
       18-20px SemiBold    bordered container
```

- Title: 18–20 px SemiBold, takes remaining flex width.
- Marks badge: 14 px Medium (Class 1–2) / 12 px (Class 3–4) in a thin border, padding `1px 6px`. Reads "[1 mark]", "[2 marks]", etc.

### Answer box (the square-bordered space students write in)

| Property            | Value                       |
| ------------------- | --------------------------- |
| Width × height      | **18 mm × 18 mm** (Class 1–2) — bigger, more comfortable for early writers |
|                     | **15 mm × 15 mm** (Class 3–4) |
| Border              | 1.5 pt solid #000          |
| Internal padding    | 4 px from each side         |
| Min space for "3-digit" handwriting | 12 mm tall × 12 mm wide |
| When answer is multi-digit (e.g. "75") | stretch height to 20 mm (C1-2) / 18 mm (C3-4) |
| When answer is text (e.g. "seventy-three") | stretch width to **55 mm** (C1-2) / **50 mm** (C3-4), keep height 18 mm / 15 mm |
| When answer is fraction (`{a}/{b}`) | two stacked boxes, each 18×18 mm (C1-2) / 15×15 mm (C3-4) |

**Why 18×18 mm for Class 1–2**: a Class 1 child's pencil control is still developing. 12 mm boxes were too small — the child would either crowd the digit into the corner or overshoot the box border. 18 mm gives roughly 1.5× the writing area while still fitting 3 templates per page.

### SVG container

| Property            | Value                       |
| ------------------- | --------------------------- |
| Default size (Class 1–2) | **55 mm × 55 mm** (square) — large so SVGs read clearly |
| Default size (Class 3–4) | **45 mm × 45 mm** |
| For "match the following" (T03 / T17 / T25 / T33) | 65 mm × 65 mm (C1-2) / 55 mm × 55 mm (C3-4) |
| Border              | none (the SVG itself carries the silhouette) |
| Inner padding       | 4 mm                         |
| Alignment           | center, both axes            |
| Overflow            | visible (clip-path off) — let oversized assets bleed slightly rather than clip |

**SVG rendering rule**: every SVG asset must have **transparent background**. The SVG is rendered into its container at `fit: contain`. Aspect ratio is preserved; if an asset is wider than tall, it fits to width; if taller than wide, it fits to height.

### Connecting line area (for match-the-following templates like T03)

- Vertical strip of whitespace in the column gap (between left and right columns), **at least 100 mm wide** (Class 1–2) / **80 mm wide** (Class 3–4).
- The child draws lines in this strip — no pre-printed guidelines, no dots at the connection points (per the spec: "Do not pre-draw matching lines").
- Each row's left and right SVGs vertically aligned so a straight horizontal line connects them without bending.

---

## 6.5 Per-Template `heightHint` (mm)

Each of the 52 templates declares its own `heightHint`. The renderer uses this when packing pages (see §7). Hints assume Class 1–2 sizing; Class 3–4 shrinks each hint by ~10 mm.

| ID  | Template                       | Class 1–2 hint | Class 3–4 hint |
| --- | ------------------------------ | -------------- | -------------- |
| T01 | Same/Different                | 50 mm          | 45 mm          |
| T02 | Classification                 | 50 mm          | 45 mm          |
| T03 | One-to-One Correspondence       | **95 mm** (match) | **80 mm** (match) |
| T04 | Seriation                       | 55 mm          | 50 mm          |
| T05 | Subitizing                      | 40 mm          | 35 mm          |
| T06 | Verbal Counting                 | 35 mm (oral-only, no answer box) | 30 mm |
| T07 | Counting                        | 40 mm          | 35 mm          |
| T08 | Cardinality                     | 45 mm          | 40 mm          |
| T09 | Comparative Vocabulary         | 55 mm          | 50 mm          |
| T10 | Quantity Comparison             | 55 mm          | 50 mm          |
| T11 | Number Comparison               | 45 mm          | 40 mm          |
| T12 | Numeral Recognition             | 50 mm          | 45 mm          |
| T13 | Numeral Sequencing              | 50 mm          | 45 mm          |
| T14 | Reading & Writing Numbers        | 55 mm          | 50 mm          |
| T15 | Numeral-Quantity Match           | 50 mm          | 45 mm          |
| T16 | Number Sequencing (line/skip)   | 55 mm          | 50 mm          |
| T17 | Ordinal Positions                | 50 mm          | 45 mm          |
| T18 | Concept of Zero                  | 40 mm          | 35 mm          |
| T19 | Place Value                     | 60 mm          | 55 mm          |
| T20 | Place Value (Tens & Ones)        | 60 mm          | 55 mm          |
| T21 | Place Value (Tens as Bundles)   | **75 mm** (extra row of bundle SVG groups) | **70 mm** |
| T22 | Number Decomposition            | 65 mm          | 60 mm          |
| T23 | Single-Digit Addition            | 50 mm          | 45 mm          |
| T24 | 2-Digit Addition (Regrouping)    | 60 mm          | 55 mm          |
| T25 | 3-Digit Add & Sub Word Problems  | 65 mm          | 60 mm          |
| T26 | Single-Digit Subtraction         | 50 mm          | 45 mm          |
| T27 | 2-Digit Subtraction (Regrouping) | 60 mm          | 55 mm          |
| T28 | Multiplication (Repeated Add)    | 55 mm          | 50 mm          |
| T29 | Multiplication Tables            | 50 mm          | 45 mm          |
| T30 | Extended Multiplication          | 60 mm          | 55 mm          |
| T31 | Multi-Digit Word Problems        | 65 mm          | 60 mm          |
| T32 | Division (Equal Sharing)         | 55 mm          | 50 mm          |
| T33 | Division (Facts & Inverse)       | 55 mm          | 50 mm          |
| T34 | Long Division                    | **85 mm** (column layout) | **75 mm** |
| T35 | Factors & Multiples              | 50 mm          | 45 mm          |
| T36 | Large-Number Operations         | 60 mm          | 55 mm          |
| T37 | Fractions (Informal)             | 60 mm          | 55 mm          |
| T38 | Fractions (Formal)               | **80 mm** (two stacked answer boxes) | **70 mm** |
| T39 | Fractions (Notation/Equivalence) | 65 mm          | 60 mm          |
| T40 | Decimals                          | 65 mm          | 60 mm          |
| T41 | Patterns                          | 50 mm          | 45 mm          |
| T42 | Shapes & Spatial                  | 55 mm          | 50 mm          |
| T43 | 3D Spatial Reasoning             | 60 mm          | 55 mm          |
| T44 | Angles                            | 55 mm          | 50 mm          |
| T45 | Symmetry & Reflection             | 60 mm          | 55 mm          |
| T46 | Perimeter & Area                  | 60 mm          | 55 mm          |
| T47 | Measurement                       | 55 mm          | 50 mm          |
| T48 | Applied Measurement Word Problems | 60 mm          | 55 mm          |
| T49 | Time                              | 60 mm (clock SVG) | 55 mm          |
| T50 | Calendar Reading                  | 55 mm          | 50 mm          |
| T51 | Money                             | 55 mm          | 50 mm          |
| T52 | Money Word Problems               | 60 mm          | 55 mm          |
| T53 | Data Handling                     | 55 mm          | 50 mm          |

The bolded values are templates that need extra height for their content:
- Match templates (T03) need 95 / 80 mm for the 3-pair horizontal layout + connecting strip.
- Templates with multiple answer boxes (T38 fractions) need 80 / 70 mm for two stacked 18 mm boxes.
- Column-layout templates (T24 / T27 / T30 / T34 / T36) need 60–85 mm for the column structure.

All other templates fit in the 40–65 mm range.

---

## 6. Page Layout (4 templates per page, standard)

```
A4 sheet (210 × 297 mm)
+------------------------------------------------------------+
|                                                            |
|     [Page header — paper title, student info]              |
|     (top 32 mm reserved)                                   |
|                                                            |
+------------------------------------------------------------+
|                                                            |
|     .q (template 1)        ≈ 55 mm tall                    |
|                                                            |
+------------------------------------------------------------+
|                                                            |
|     .q (template 2)        ≈ 55 mm tall                    |
|                                                            |
+------------------------------------------------------------+
|                                                            |
|     .q (template 3)        ≈ 55 mm tall                    |
|                                                            |
+------------------------------------------------------------+
|                                                            |
|     .q (template 4)        ≈ 55 mm tall                    |
|                                                            |
+------------------------------------------------------------+
|     [Footer — page end marker]                              |
+------------------------------------------------------------+
```

Total: 32 + (4 × 55) + 8 = 260 mm content + 37 mm margin/footer = 297 mm. Fits A4.

---

## 7. Page Layout

The page layout is **template-driven**, not slot-driven. Each template declares its own `heightHint` (see §6 for the per-template hint table). The renderer packs templates greedily into pages until each page's height budget is used up.

### Page geometry (fixed)

```
A4 sheet (210 × 297 mm)
+------------------------------------------------------------+
|     [Page header — 32 mm]                                  |   ← fixed at top
+------------------------------------------------------------+
|                                                            |
|                                                            |
|     PAGE BUDGET: 297 - 32 (header) - 12 (footer) = 253 mm  |   ← available for templates
|                                                            |
|                                                            |
+------------------------------------------------------------+
|     [Footer — 12 mm]                                        |   ← fixed at bottom
+------------------------------------------------------------+
```

### Packing rule

1. The renderer reads each template's `heightHint` (mm).
2. It walks the question list in order, accumulating heights.
3. When adding the next template would push the page over the 253 mm budget, it starts a new page.
4. The last page can hold fewer templates than the target (e.g. 3 templates on a Class 1–2 paper's final page).

### Worked example — Class 1–2 paper, 17 templates, mixed types

Templates (with `heightHint`):

| # | Template                   | heightHint |
| - | -------------------------- | ---------- |
| 1 | T07 Subitizing              | 40 mm      |
| 2 | T12 Numeral Recognition     | 50 mm      |
| 3 | T03 Match (3 pairs)         | 95 mm      |
| 4 | T07 Subitizing              | 40 mm      |
| 5 | T23 Single-Digit Addition   | 50 mm      |
| 6 | T16 Numeral Sequencing      | 45 mm      |
| 7 | T41 Patterns                | 50 mm      |
| 8 | T19 Numeral-Quantity Match  | 50 mm      |
| 9 | T07 Subitizing              | 40 mm      |
| 10| T12 Numeral Recognition    | 50 mm      |
| 11| T42 Shapes & Spatial        | 55 mm      |
| 12| T24 2-Digit Addition       | 60 mm      |
| 13| T07 Subitizing             | 40 mm      |
| 14| T26 Subtraction            | 50 mm      |
| 15| T41 Patterns               | 50 mm      |
| 16| T12 Numeral Recognition    | 50 mm      |
| 17| T19 Numeral-Quantity Match | 50 mm      |

Page 1: Q1+Q2+Q3+Q4 = 40+50+95+40 = **225 mm** (4 templates fit)
Page 2: Q5+Q6+Q7+Q8 = 50+45+50+50 = **195 mm** (4 templates fit, 58 mm spare — no Q5'-sized fit)
Page 3: Q9+Q10+Q11+Q12 = 40+50+55+60 = **205 mm** (4 templates fit)
Page 4: Q13+Q14+Q15+Q16+Q17 = 40+50+50+50+50 = **240 mm** (**5 templates fit — the page is dense enough**)
Total: 4 pages, 17 templates, avg 4.25 templates per page.

Note that the match template (Q3 = 95 mm) only forced one neighbour (Q4 = 40 mm) onto the same page. The next page reset to a fresh 4-template packing.

### Match template — `.q--match` modifier

When a template's `qType === 'match_pairs'`, the renderer adds the `.q--match` modifier class. That class:

- Reserves a **100 mm horizontal connecting-line strip** between the left and right SVG columns (Class 1–2) / **80 mm** (Class 3–4).
- Stretches the activity area so the 3-pair layout fits comfortably without compressing other content.
- Keeps the SVG containers at **65 × 65 mm** each side (Class 1–2) / **55 × 55 mm** (Class 3–4).

A match template's `heightHint` is its own value (95 mm Class 1–2, 80 mm Class 3–4) — the modifier class doesn't force a fixed height; it just adjusts internal spacing.

### Templates with no declared `heightHint`

For backward compatibility, if a template doesn't declare a `heightHint`, the renderer falls back to:

| Class | Default heightHint |
| ----- | ------------------ |
| Class 1–2 | 65 mm              |
| Class 3–4 | 55 mm              |

New templates must declare their own `heightHint` in `docs/52-question-templates.md`.

---

## 8. Visual Hierarchy

Per the spec's section §16:

```
1. Matching objects (SVGs)         — most visually dominant
2. Instruction                     — secondary
3. Title                           — tertiary
4. Column labels (LEFT, RIGHT)    — quaternary
5. Decorative elements             — supporting only
```

In CSS:

- SVG container: no border, transparent, occupies the most visual area
- Instruction: italic gray-ish `#000` (not greyed out — pure black at smaller size for readability)
- Title: bold serif, 14 px
- Column labels: 11 px, all caps, letter-spacing 1px
- Decorative: minimal — small star or asterisk corners only

---

## 10. Decorative Treatment

Per spec §13 ("Avoid Decorative Distractions"):

- **Allowed**: 1–2 small stars in corners of the page header, no other decoration.
- **Forbidden**: large background illustrations, excessive patterns, multiple colors, decorative objects that could be mistaken for answer choices, background objects that could be confused with matching items.

The renderer caps decorative elements at `<rect>` borders for boxes, dashed lines for column dividers (1pt dashed `#666`), and nothing else.

---

## 11. Borders Summary

| Element                       | Border                              |
| ----------------------------- | ----------------------------------- |
| Page sheet (outer)            | **none** (per user)                 |
| Question card                 | **none** (per user)                 |
| Question number badge         | 1.5 pt solid `#000`                 |
| Marks badge (e.g. "[1 mark]") | 1 pt solid `#000`                   |
| Answer box                    | 1.5 pt solid `#000` (square)        |
| Column divider (mid-page)      | **none** (whitespace only)          |
| Column separator (within a match template) | 1 pt dashed `#666` (optional) |

---

## 12. SVG Asset Rules (per spec §26)

| Property                       | Requirement                                 |
| ------------------------------ | ------------------------------------------- |
| Color                          | **Monochromatic only** — black + transparent |
| Background                     | **Transparent** (no fill rect behind)        |
| Style                          | **Outlined / line art** preferred            |
| Ink coverage                   | Low (≤ 25 % of bounding box area) — minimizes ink cost |
| Stroke weight                  | Consistent across the asset library          |
| Minimum feature size           | ≥ 1.5 mm so the smallest printed version is still legible |
| Single subject                 | One primary object per asset                 |
| No text inside SVG             | Text comes from the template, not the asset    |
| Aspect ratio                   | Fit-to-container preserves ratio (square container OK) |

**Why outlined + low-ink**: a fully filled SVG (e.g. a black circle for a sun) would burn 4× more ink than a line-art version. Across 30+ SVGs on a 4-page paper, this matters for print cost and clarity at low DPI.

---

## 13. Question Data Model (carried from spec §19)

Every question rendered through any of the 52 templates carries this shape in MongoDB:

```json
{
  "templateId": "T03_ONE_TO_ONE_L1",
  "skill": "one_to_one_correspondence",
  "level": 1,
  "classNumber": 1,
  "concept": "Same/Different",
  "questionType": "match_pairs",
  "instruction": "Draw a line from each picture to its matching partner.",
  "marks": 1,
  "theme": "animals",
  "pairCount": 3,
  "pairs": [
    { "id": "pair_01", "leftAsset": "bee.svg",     "rightAsset": "flower.svg"   },
    { "id": "pair_02", "leftAsset": "dog.svg",     "rightAsset": "doghouse.svg" },
    { "id": "pair_03", "leftAsset": "bird.svg",    "rightAsset": "nest.svg"     }
  ],
  "rightOrder": ["pair_03", "pair_01", "pair_02"],
  "answerKey": [
    { "leftId": "bee",  "correctRightId": "flower"   },
    { "leftId": "dog",  "correctRightId": "doghouse" },
    { "leftId": "bird", "correctRightId": "nest"     }
  ]
}
```

The renderer never reads SVG bytes inline — it reads `asset.svg` filename, fetches the asset from MongoDB's asset library, renders it into the appropriate container.

---

## 14. Renderer Responsibilities

The renderer (the code that walks the templates + data and produces the printable PDF) is responsible for:

1. **Picking the layout** (4 per page, 3 per page, 2 per page) based on whether the paper contains match-type templates.
2. **Stretching the match template** to 90 mm tall when the layout shifts to 3 per page.
3. **Fetching SVG assets** by filename from MongoDB.
4. **Normalising SVG dimensions** (fit-to-container, preserve aspect ratio).
5. **Shuffling right-side order** if `rightOrder` is provided.
6. **Rendering the answer key** separately (not on the student paper) for the grader.
7. **Stamping student info** in the page header.

The renderer never reads SVG bytes inline.

---

## 15. Summary of Choices Made

| Question                              | Decision                                 |
| ------------------------------------- | ---------------------------------------- |
| Page layout (Class 1–2)               | **4 templates per page** (target), greedy packing, templates have own size |
| Page layout (Class 3–4)               | **5 templates per page** (target), greedy packing, templates have own size |
| Font family                           | **Noto Sans** (4 weights: 400 / 500 / 600 / 700) |
| Body font size (Class 1–2)            | **18–20 pt** (FLN-correct, large for early readers) |
| Body font size (Class 3–4)            | **16–18 pt** |
| Number font size                       | 22–28 pt (C1-2) / 20–24 pt (C3-4) — bigger so digits are read first |
| Section heading / main title          | 24–30 pt / 28–34 pt (C1-2), 22–28 pt / 26–32 pt (C3-4) |
| Instruction text                      | **Sentence case**, never ALL CAPS (long-form), at 18–20 pt (C1-2) / 16–18 pt (C3-4) |
| Title text (≤ 3 words, e.g. MATCH THE PAIRS) | ALL CAPS allowed as a visual landmark |
| Card border                           | **None** (per user)                      |
| Page sheet border                     | **None** (per user)                      |
| Answer box (Class 1–2)                | **18 × 18 mm** (square, fits 3 digits, comfortable for early writers) |
| Answer box (Class 3–4)                | **15 × 15 mm** (square)                   |
| SVG container (Class 1–2, default)    | **55 × 55 mm**                            |
| SVG container (Class 3–4, default)    | **45 × 45 mm**                            |
| SVG container (match template)        | 65 × 65 mm (C1-2) / 55 × 55 mm (C3-4)     |
| Color palette                         | Black + white only (per user)            |
| SVG style                             | Monochromatic, outlined, low-ink (per user) |
| Connection line area (match)          | 100 mm wide (C1-2) / 80 mm wide (C3-4) horizontal strip |
| Column divider style                  | 1pt dashed `#666` (optional)             |
| Question number badge                 | 16 mm square with bold number            |

---

## 16. Implementation Notes (for the renderer team)

- **CSS class names**: `.sheet`, `.q`, `.q-head`, `.q-num`, `.q-title`, `.q-marks`, `.q-body`, `.q--match`, `.answer-box`, `.objects`, `.mcq-list`, `.numberline`, `.column-label`, `.svg-slot`, `.connecting-strip`.
- **CSS custom properties** (set on `.sheet`):

  Note on units: `pt` is preferred over `px` for print output because 1 pt = 1/72 inch and survives any DPI scaling. The CSS engine handles pt→mm→canvas conversion correctly when html2canvas reads the rendered DOM at 96 DPI (1 pt ≈ 1.333 px).

  ```css
  :root {
    /* Font family — single Noto Sans family, four weights */
    --font-body:    "Noto Sans", "Helvetica Neue", Arial, sans-serif;
    --font-regular: 400;
    --font-medium:  500;
    --font-semibold:600;
    --font-bold:    700;

    /* Colors — black + white only */
    --color-ink:    #000;
    --color-rule:   #666;
    --color-paper:  #fff;

    /* Font sizes — Class 1–2 preset (default) */
    --fs-question:    19pt;
    --fs-instruction: 19pt;
    --fs-option:      19pt;
    --fs-number:      24pt;
    --fs-section:     28pt;
    --fs-main-title:  30pt;
    --fs-qbadge:      18pt;
    --fs-marksbadge:  14pt;
    --fs-svgcaption:  14pt;
    --fs-footer:      12pt;

    /* Sizing — answer box and SVG containers */
    --box-answer:        18mm;  /* Class 1–2 default; C3-4 overrides to 15mm */
    --box-answer-wide:   55mm;  /* Class 1–2; C3-4 → 50mm */
    --box-answer-tall:   20mm;  /* Class 1–2 for multi-digit; C3-4 → 18mm */
    --svg-slot:          55mm;  /* Class 1–2 default; C3-4 → 45mm */
    --svg-slot-match:    65mm;  /* Class 1–2 for match templates; C3-4 → 55mm */

    /* Match-the-following extra room */
    --q-match-height:    110mm; /* Class 1–2; C3-4 → 90mm */
    --q-match-strip:     100mm; /* Class 1–2; C3-4 → 80mm */

    /* General */
    --q-margin-y:        6px;
    --q-padding-y:       18px;
  }
  ```

  The renderer reads `paper.classNumber` and applies either the Class 1–2 preset or the Class 3–4 preset by overriding the relevant CSS custom properties at the `.sheet` root.

- **Page sizing**: A4 sheet is 210mm × 297mm. Print at 100 % scale — no DPI adjustment needed. The template assumes browser-default CSS pixel mapping (1 CSS px = 1/96 inch = 0.265 mm).
- **PDF generation**: the existing `html2canvas + jsPDF` pipeline in `frontend/public/worksheets/` (jsPDF + html2canvas) works as-is. No new dependencies. Configure html2canvas at `scale: 2` for crisp Noto Sans rendering at print size.
- **Font loading** (must be in the document `<head>`):
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap">
  ```
  For offline printing, self-host the four `.woff2` files at `frontend/public/fonts/noto-sans/` and reference them via `@font-face`.

---

This doc replaces the previous "style decisions scattered across `docs/52-question-templates.md`" with one place where every visual decision lives. If you find a number here that doesn't fit when you preview the rendered output, tell me which one and I'll recalibrate.

# FLN 93-Level Curriculum — Question Type Catalog

This file consolidates the **93-level curriculum** defined in
`backend/src/config/curriculumMap.ts` (the authoritative source) and
proposes what kinds of questions are appropriate for each level.

It is **descriptive** for the level list (lifted verbatim from
`curriculumMap.ts`) and **prescriptive** for the question-type catalog —
the catalog is what the template-engine rewrite proposed in
`docs/templates-spec.md` should ultimately produce. See the "Pedagogical
references" column for the literature that backs each recommendation.

---

## Stage 1 — Preschool 1 (Age 3-4) · Pre-Number Foundations

| # | Concept ID | Level Title | Strand | Oral-only? | Question types |
|---:|---|---|---|---|---|
| 1 | S1.1 | One-to-One Correspondence | Pre-Number Foundations | **YES** | Match identical pairs; pair objects to children; identify the unpaired item. *No numerals yet.* |
| 2 | S1.2 | Classification (Single Property) | Pre-Number Foundations | **YES** | Sort objects by one attribute (color, shape, size); circle the group that belongs; "which one is different?". |
| 3 | S1.3 | Perceptual Same/Different | Pre-Number Foundations | **YES** | Same/different judgment on pictures; "are these the same?" Yes/No. |
| 4 | S1.4 | Rote Verbal Counting to 10 | Number Sense | partial (no symbols) | Recite the count sequence 1–10 with fingers or objects. *Recognition of written numerals not yet required.* |
| 5 | S1.5 | Counting Small Sets (1-3) | Number Sense | partial | Subitize small sets of 1–3; touch-and-count; match sets of equal cardinality (with no numerals). |
| 6 | S1.6 | Shape Matching (Perceptual) | Shapes & Spatial | **YES** | Match shapes to identical shapes (circle-to-circle, square-to-square); no names required. |
| 7 | S1.7 | Perceptual Subitizing | Number Sense | partial | Instant recognition of 1–3 dots/fingers without counting. |

---

## Stage 2 — Preschool 2 (Age 4-5) · Pre-Number Foundations

| # | Concept ID | Level Title | Strand | Oral-only? | Question types |
|---:|---|---|---|---|---|
| 8 | S2.1 | Quantity Comparison | Pre-Number Foundations | partial | Which group has more / fewer / same? (no numerals required; can answer by pointing). |
| 9 | S2.2 | Seriation (3 Objects) | Pre-Number Foundations | **YES** | Arrange 3 objects shortest-to-tallest; identify the middle / first / last. |
| 10 | S2.3 | Classification (Increasing Complexity) | Pre-Number Foundations | **YES** | Sort into two groups by two attributes combined; "which group does this belong to?". |
| 11 | S2.4 | Counting to 5 (Cardinality) | Number Sense | partial | Count 1–5 objects; "how many?" (still no written numerals needed — child can answer verbally or by holding up fingers). |
| 12 | S2.5 | Counting 6-10 | Number Sense | partial | Count 6–10 objects; introduces the count-word "ten". |
| 13 | S2.6 | Shape Identification | Shapes & Spatial | no | Name shapes (circle, square, triangle, rectangle). Verbal answer or pointing. |
| 14 | S2.7 | 2-Item Patterns | Patterns | **YES** | Complete ABAB patterns with colored blocks / fruits; "what comes next?" by pointing. |
| 15 | S2.8 | Comparative Vocabulary | Measurement | **YES** | "long / short", "heavy / light", "full / empty". Verbal or pointing. |
| 16 | S2.9 | Conceptual Subitizing | Number Sense | partial | Subitize arrangements of 4–6 (ten-frame-style). |
| 17 | S2.10 | Basic Shape Composition | Shapes & Spatial | partial | Combine two shapes to make another (e.g. two triangles = a square). |

---

## Stage 3 — Preschool 3 / Balvatika (Age 5-6) · Pre-Number Foundations

| # | Concept ID | Level Title | Strand | Oral-only? | Question types |
|---:|---|---|---|---|---|
| 18 | S3.1 | Numeral Recognition (1-10) | Number Sense | no | Match the spoken/written numeral to its word; trace the numeral. |
| 19 | S3.2 | Numeral-Quantity Correspondence | Number Sense | no | Match the numeral (e.g. "5") to a set of 5 objects. |
| 20 | S3.3 | Numeral Comparison (Object-Mediated) | Pre-Number Foundations | no | Compare two sets via a third representation (dots / fingers). |
| 21 | S3.4 | Seriation with Transitivity | Pre-Number Foundations | partial | "If A > B and B > C, then A > C." Can be done with three sticks without numerals. |
| 22 | S3.5 | Flexible Classification | Pre-Number Foundations | **YES** | Re-sort by a different attribute after the first sort; "now group them by…". |
| 23 | S3.6 | Numeral Sequencing | Number Sense | no | Write the next numeral in a sequence; fill the missing number 1–10. |
| 24 | S3.7 | Comparative Vocabulary (Formalizing) | Measurement | no | Use >, <, = with objects and with numerals up to 10. |
| 25 | S3.8 | Patterns (2-Item Indep & 3-Item Intro) | Patterns | partial | Continue ABAB, AAB, ABB, ABC patterns. |
| 26 | S3.9 | Basic Shape Properties | Shapes & Spatial | no | Identify sides, corners, "rolls vs. slides". |
| 27 | S3.10 | Shape Composition & Decomposition | Shapes & Spatial | partial | Cut a square into two triangles;  |

---

## Stage 4 — Class 1 (Age 6-7) · Number Sense

| # | Concept ID | Level Title | Strand | Oral-only? | Question types |
|---:|---|---|---|---|---|
| 28 | S4.1 | Abstract Numeral Comparison | Number Sense | no | Compare numerals up to 20 with `<`, `>`, `=`. |
| 29 | S4.2 | Close Numeral Comparison | Number Sense | no | Compare numerals that differ by 1–2 (e.g. 18 vs 19). |
| 30 | S4.3 | Counting Objects to 20 | Number Sense | no | Touch-and-count 11–20 objects. |
| 31 | S4.4 | Reading & Writing Numerals to 99 | Number Sense | no | Write the numeral from its word ("twenty-three" → 23). |
| 32 | S4.5 | Tens and Ones | Number Sense | no | Decompose 47 = 4 tens + 7 ones; place-value chart fill-in. |
| 33 | S4.6 | Single-Digit Addition | Number Operations | no | Sums up to 10 (e.g. 4 + 5 = ?); vertical addition (no carry). |
| 34 | S4.7 | Single-Digit Subtraction | Number Operations | no | Differences up to 10; vertical subtraction (no borrow). |
| 35 | S4.8 | 3D Shape Properties | Shapes & Spatial | partial | Identify cube, sphere, cylinder, cone by touch/look. |
| 36 | S4.9 | Non-Standard Length Estimation | Measurement | partial | "How many pencils long is the desk?" — answer by counting units. |
| 37 | S4.10 | Non-Standard Capacity Estimation | Measurement | partial | "How many cups fill the jug?" — answer by counting. |
| 38 | S4.11 | 3-Item Pattern Completion | Patterns | no | Continue ABC, AABB patterns. |
| 39 | S4.12 | Concept of Zero | Number Sense | no | "How many apples are left? → 0." |
| 40 | S4.13 | Ordinal Positions (1st-10th) | Number Sense | partial | "Who is third in line?" — answer verbally or by pointing. |
| 41 | S4.14 | Informal Number Line (0-20) | Number Sense | no | Place the missing numeral on a 0–20 number line; jump 1 forward / backward. |
| 42 | S4.15 | Advanced Shape Composition | Shapes & Spatial | partial | Compose/decompose 3D shapes (e.g. two cubes = a rectangular prism). |

---

## Stage 5 — Class 2 (Age 7-8) · Number Sense

| # | Concept ID | Level Title | Strand | Oral-only? | Question types |
|---:|---|---|---|---|---|
| 43 | S5.1 | Reading & Writing 3-Digit Numbers | Number Sense | no | 247 → "two hundred forty-seven"; numeral-from-word. |
| 44 | S5.2 | Tens as Bundles/Groups | Number Sense | no | Base-10 blocks: 3 hundreds + 4 tens + 7 ones. |
| 45 | S5.3 | Flexible 2-Digit Decomposition | Number Sense | no | 83 = 50 + 33 = 70 + 13 = … (multiple correct decompositions). |
| 46 | S5.4 | 2-Digit Addition with Regrouping | Number Operations | no | Vertical addition with carry (e.g. 47 + 28). |
| 47 | S5.5 | 2-Digit Subtraction with Regrouping | Number Operations | no | Vertical subtraction with borrow (e.g. 52 − 27). |
| 48 | S5.6 | Multiplication as Repeated Addition | Number Operations | no | 4 × 3 = 4 + 4 + 4 = 12; array/grid representation. |
| 49 | S5.7 | Division as Equal Sharing | Number Operations | no | "12 candies shared among 3 friends = ?" Picture-based. |
| 50 | S5.8 | Multiplication Tables (2,3,4,5,10) | Number Operations | no | Recall: 2 × 7 = ?, 5 × 8 = ?. |
| 51 | S5.9 | Currency Recognition | Money | partial | Identify ₹10 note vs ₹50 note; verbal naming. |
| 52 | S5.10 | Informal Fractions (Folding) | Fractions | partial | Fold a paper into 2 / 4 equal parts; "this is half". |
| 53 | S5.11 | Uniform Non-Standard Measurement | Measurement | partial | Measure a strip using paper clips (all same size). |
| 54 | S5.12 | 2D Shape Set Identification | Shapes & Spatial | partial | "Which of these is a quadrilateral?" Multiple shapes shown. |
| 55 | S5.13 | Spatial Vocabulary | Shapes & Spatial | partial | "above / below / beside / inside / outside". |
| 56 | S5.14 | Calendar Reading | Calendar & Time | partial | Read day/month from a calendar; verbal answers. |
| 57 | S5.15 | Data Handling (Sorting & Tallies) | Data Handling | no | Count tally marks (groups of 5); make a tally chart. |
| 58 | S5.16 | Number Patterns & Sequences | Patterns | no | Find the rule; continue 2, 4, 6, 8, __. |
| 59 | S5.17 | Zero as a Placeholder | Number Sense | no | 105 vs 15 — explain why the zero matters. |
| 60 | S5.18 | Extended Number Line (0-100) | Number Sense | no | Place 73 on a 0–100 line; estimate nearest 10. |
| 61 | S5.19 | Skip Counting (2s, 5s, 10s) | Patterns | no | 5, 10, 15, 20, __; 2, 4, 6, __. |

---

## Stage 6 — Class 3 (Age 8-9) ★ MPL

| # | Concept ID | Level Title | Strand | Oral-only? | Question types |
|---:|---|---|---|---|---|
| 62 | S6.1 | 3-Digit Place Value & Expanded Form | Number Sense | no | 437 = 400 + 30 + 7; numeral from expanded form. |
| 63 | S6.2 | Flexible 3-Digit Decomposition | Number Sense | no | Multiple correct decompositions of a 3-digit number. |
| 64 | S6.3 | 3-Digit Comparison & Ordering | Number Sense | no | Order 4 numbers from smallest to largest. |
| 65 | S6.4 | Reading & Writing 4-Digit Numbers | Number Sense | no | 4,572 → "four thousand five hundred seventy-two". |
| 66 | S6.5 | 3-Digit Addition & Subtraction Problems | Number Operations | no | Word problems (e.g. "Riya has 347 marbles; she gives 158 to Aman. How many left?"). |
| 67 | S6.6 | Full Multiplication Tables (2-10) | Number Operations | no | Recall any single-digit multiplication. |
| 68 | S6.7 | Division Facts & Inverse Relation | Number Operations | no | "If 6 × 4 = 24, then 24 ÷ 4 = ?" |
| 69 | S6.8 | Standard Measurement Units | Measurement | no | Convert cm ↔ m, g ↔ kg. |
| 70 | S6.9 | Relating 2D Faces to 3D Solids | Shapes & Spatial | no | "A cube has how many faces?" (6). |
| 71 | S6.10 | Telling Time (Hours & Half-Hours) | Calendar & Time | no | Read analog clock to hour / half-hour. |
| 72 | S6.11 | Money Arithmetic | Money | no | "₹75 − ₹28 = ?" Word-problem format. |
| 73 | S6.12 | Formal Fractions (Half/Quarter) | Fractions | no | "What fraction is shaded? 1/2, 1/4." |
| 74 | S6.13 | Pattern Rules & Generalization | Patterns | no | "The rule is ×2 +1. Find the next three terms." |
| 75 | S6.14 | Data Handling (Pictographs & Bar Graphs) | Data Handling | no | Read pictograph; answer "How many more…?". |

---

## Stage 7 — Class 4 (Age 9-10)

| # | Concept ID | Level Title | Strand | Oral-only? | Question types |
|---:|---|---|---|---|---|
| 76 | S7.1 | 4-Digit & 5-Digit Place Value | Number Sense | no | 34,507 = 30,000 + 4,000 + 500 + 7. |
| 77 | S7.2 | Large Number Operations & Regrouping | Number Sense | no | Add/subtract 4- and 5-digit numbers vertically. |
| 78 | S7.3 | Complex Multi-Digit Word Problems | Number Operations | no | Two-step word problems (e.g. "A shop sold 247 books on Monday and 158 on Tuesday. How many total? They returned 32. How many were kept?"). |
| 79 | S7.4 | Extended Multiplication | Number Operations | no | 2-digit × 2-digit (e.g. 47 × 28), 3-digit × 1-digit. |
| 80 | S7.5 | Formal Long Division | Number Operations | no | Long division with/without remainder (e.g. 875 ÷ 5). |
| 81 | S7.6 | Fractional Notation & Equivalence | Fractions | no | "2/4 = ?/8" (equivalent fractions). |
| 82 | S7.7 | Standard Unit Conversion | Measurement | no | Convert m ↔ cm, km ↔ m, kg ↔ g. |
| 83 | S7.8 | Applied Measurement Word Problems | Measurement | no | "A rope is 3 m 45 cm long. Cut into 2 equal pieces. How long is each?" |
| 84 | S7.9 | 3D Nets & Spatial Perspective | Shapes & Spatial | no | "Which net folds into a cube?" |
| 85 | S7.10 | Advanced Time Calculation | Calendar & Time | no | "Start 9:15, end 11:45. How long?" |
| 86 | S7.11 | Complex Money Problems | Money | no | "₹500 − ₹127 − ₹48 = ?" Multi-step. |
| 87 | S7.12 | Advanced Number Patterns | Patterns | no | Fibonacci-style, square-number, triangular-number. |
| 88 | S7.13 | Bar Graphs & Data Interpretation | Data Handling | no | Read a multi-series bar graph; compute mean. |
| 89 | S7.14 | Factors & Multiples | Number Operations | no | "Find all factors of 24." "First 5 multiples of 7." |
| 90 | S7.15 | Decimals (Tenths & Hundredths) | Number Sense | no | "0.7 = 7/10." Place value to hundredths. |
| 91 | S7.16 | Angles & Turn | Shapes & Spatial | no | Identify right / acute / obtuse; "How many right angles in a square?" (4). |
| 92 | S7.17 | Symmetry & Reflection | Shapes & Spatial | no | "Draw the line of symmetry." "Is this letter symmetrical?" |
| 93 | S7.18 | Perimeter & Area | Measurement | no | "Perimeter of a 5×3 rectangle?" (16). "Area of a 6×4 rectangle?" (24). |

---

## Oral-only levels (no paper needed)

These 11 levels are best evaluated **orally or with manipulatives**, not
on a paper worksheet. A paper would force premature symbol use.

| L | Title | Why oral-only | Alternative evidence |
|---:|---|---|---|
| 1 | One-to-One Correspondence | Children at 3–4 don't recognize numerals yet | Teacher observation during paired-play activity |
| 2 | Classification (Single Property) | Same | Sorting实物实物; "which group?" by pointing |
| 3 | Perceptual Same/Different | Same | Picture-pair same/different game |
| 6 | Shape Matching (Perceptual) | Shape names not yet required | Match identical shape pictures |
| 9 | Seriation (3 Objects) | Numerals not needed | Arrange sticks from shortest to tallest |
| 10 | Classification (Increasing Complexity) | Multi-attribute sorting is verbal | "Group by color, then by size" — teacher observes |
| 14 | 2-Item Patterns | ABAB completion by pointing | Pattern blocks, teacher asks "what comes next?" |
| 15 | Comparative Vocabulary | "long/short, full/empty" needs实物实物实物 | Compare实物实物实物实物 |
| 22 | Flexible Classification | Re-sort by new attribute | Re-sort实物实物实物实物 by teacher's instruction |

A **partial** rating means the level can use either symbolic or
non-symbolic items depending on the child — e.g. L4 (Rote Counting to
10) can be done verbally or with finger-counting; L13 (Shape
Identification) can be done by pointing at the named shape.

The 11 oral-only / partial-oral levels are:
**1, 2, 3, 4, 5, 6, 7, 9, 10, 14, 15, 22** (12 levels when counting
partial-oral).

---

## Question-kind inventory (used in the template engine)

Across all 93 levels, the question vocabulary collapses to a small
number of distinct **kinds**. The template-engine spec
(`docs/templates-spec.md`) proposes these as the building blocks:

| Kind | Levels using it | Example |
|---|---|---|
| `count_objects` | 1, 4, 5, 7, 11, 12, 16, 30, 44 | "How many X?" |
| `same_different` | 2, 3, 10, 22 | "Are these the same?" |
| `classify_group` | 2, 10, 22 | "Which group does this belong to?" |
| `match_pair` | 1, 6, 13, 18, 19, 42 | Match shapes / numerals / objects |
| `seriation_order` | 9, 21, 64 | Arrange in order |
| `subitize` | 5, 7, 16 | Recognize small sets instantly |
| `pattern_complete` | 14, 25, 38, 58, 61, 74, 87 | Continue the pattern |
| `comparison_pair` | 8, 15, 20, 24, 28, 29, 64 | "Which is bigger/heavier?" |
| `numeral_read_write` | 18, 31, 43, 65 | Numeral ↔ word |
| `place_value` | 32, 44, 45, 62, 63, 76 | Decompose 347 = 300+40+7 |
| `addition_vertical` | 33, 46, 66, 77 | Vertical addition (with regrouping for ≥ L46) |
| `subtraction_vertical` | 34, 47, 66, 77 | Vertical subtraction (with borrowing ≥ L47) |
| `multiplication_recall` | 48, 50, 67 | 7 × 8 = ? |
| `division_basic` | 49, 68 | Sharing / inverse of multiplication |
| `multi_digit_mult` | 79 | 47 × 28 |
| `long_division` | 80 | 875 ÷ 5 |
| `fraction_visual` | 52, 73, 81 | Shaded region → fraction |
| `fraction_equivalence` | 81 | 2/4 = ?/8 |
| `money_arithmetic` | 51, 72, 86 | ₹ arithmetic, multi-step |
| `measurement_compare` | 15, 36, 37, 53, 69, 82, 83 | Estimate / convert / compute length/mass |
| `time_read` | 56, 71, 85 | Clock reading, elapsed time |
| `data_chart_read` | 57, 75, 88 | Tally chart, pictograph, bar graph |
| `shape_properties` | 13, 26, 35, 42, 54, 70, 91 | Sides, faces, angles, symmetry, nets |
| `area_perimeter` | 93 | Perimeter / area of rectangles |
| `factors_multiples` | 89 | Factor lists, common multiples |
| `decimals` | 90 | Tenths / hundredths place value |
| `word_problem` | 25, 46, 47, 66, 78, 83, 86 | Multi-step narrative problem |

The 26 kinds above are the 26 generator categories the template-engine
should ultimately provide. Each kind takes typed slot parameters
(min/max for numerics, vocab list for object/thematic choices) and
emits one or more `Question` objects following the existing `Question`
interface.

---

## Pedagogical references

The level structure and question-kind selection draws on:

- **NSF** (2009). *Math in PreK-2: Big Ideas*. — Subitizing (Levels
  7, 16), Counting principles (Levels 4, 5, 11, 12, 30).
- **Clements, D. H.** (1984). "Subitizing and Counting." — Stages of
  number concept; informs Levels 1, 5, 7, 11, 12.
- **Gelman, R. & Gallistel, C. R.** (1978). *The Child's Understanding
  of Number*. — Five counting principles, cardinality, order
  irrelevance (Levels 4, 5, 11, 12, 30).
- **Carpenter, T. P. et al.** (1999). *Children's Mathematics:
  Cognitively Guided Instruction*. — Invented strategies for addition
  and subtraction (Levels 33, 34, 46, 47, 66, 77).
- **Fuson, K. C.** (1988). *Children's Counting and Concepts of
  Number*. — Counting-on, level-of-comprehension for arithmetic.
- **Siegler, R. S. et al.** (2012). *Early Predictors of High School
  Mathematics Achievement*. — Importance of early numeracy
  comprehension.
- **Verschaffel, L., Greer, B., & De Corte, E.** (2000). *Making Sense
  of Word Problems*. — Realistic context, two-step structure (Levels
  25, 46, 47, 66, 78, 83, 86).
- **Hiebert, J. & Wearne, D.** (1996). "Instructional Approaches to
  Conceptual Understanding in Mathematics." — Place-value development
  (Levels 32, 44, 45, 62, 63, 76).
- **NCTM** (2014). *Principles to Actions*. — Effective teaching
  practices for problem-solving, reasoning, discourse (cross-cutting).
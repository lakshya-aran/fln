# Template Manifest — 93 Levels → 22 Templates

This manifest maps every level in the FLN 93-level curriculum to its template, class, and visual variant. The renderer reads this table to know which template to load for each level.

Source of truth: `docs/93-levels-with-shape.json` (auto-generated from `docs/93-levels-and-question-types.md`).

## Quick index — templates

| ID  | Template                          | Variants covered                          | Levels |
| --- | --------------------------------- | ------------------------------------------ | ------ |
| T01 | count_objects                     | oral_no_box, with_step, numeric            | 9      |
| T02 | fill_in_box                       | place_value, single, multiple, read_in_words | 10    |
| T03 | match_or_pairs                    | picture_picture, numeral_picture, numeral_word, term_definition | 6 |
| T04 | mcq_bubbles                       | text_options, picture_options, mixed       | 4      |
| T05 | compute_box                       | simple, with_regrouping, multi_digit, multi_step, skip_counting | 12 |
| T06 | circle_or_tick                    | —                                          | 4      |
| T07 | compare_groups                    | —                                          | 4      |
| T08 | pattern_complete                  | picture_ab, number_arithmetic, geometric   | 6      |
| T09 | number_line                       | dense_ticks, sparse_ticks                  | 2      |
| T10 | shape_task                        | match_identical, name_shape, count_properties, spatial_vocab, symmetry | 9 |
| T11 | word_problem                      | picture_prompt, multi_step, unit_aware     | 4      |
| T12 | money_task                        | recognition, simple_arith, change_back     | 3      |
| T13 | time_task                         | —                                          | 2      |
| T14 | fraction_task                     | informal_fold, simple, equivalent          | 2      |
| T15 | data_task                         | tally, pictograph, bar_graph, tens_ones_chart | 4    |
| T16 | measurement_task                  | non_standard, standard_units, perimeter_area | 2    |
| T17 | oral_pointing                     | —                                          | 3      |
| T18 | place_value_expanded              | expanded, flexible, bundles, decompose_to_box | 3    |
| T19 | multiplication_visual             | array_full, tables_only, repeated_add      | 2      |
| T20 | skip_counting                     | —                                          | 1      |
| T21 | zero_placeholder                  | concept_of_zero                            | 1      |
| T22 | multi_digit_operation             | column_addition, column_subtraction, column_multiplication | 4 |
| —   | (no template — level doesn't render as a paper question) | — | 2 |

**Total**: 93 levels, 22 templates, ~30 variants.

## Full level → template mapping

| Level | Title                                    | Class | Template | Variant              |
| ----- | ---------------------------------------- | ----- | -------- | -------------------- |
| S1.1  | One-to-One Correspondence                | 1     | T03      | picture_picture      |
| S1.2  | Classification (Single Property)         | 1     | T06      | —                    |
| S1.3  | Perceptual Same/Different                | 1     | T03      | picture_picture      |
| S1.4  | Rote Verbal Counting to 10               | 1     | T01      | oral_no_box          |
| S1.5  | Counting Small Sets (1-3)                | 1     | T03      | numeral_picture      |
| S1.6  | Shape Matching (Perceptual)              | 1     | T10      | match_identical      |
| S1.7  | Perceptual Subitizing                    | 1     | T01      | —                    |
| S2.1  | Quantity Comparison                      | 1     | T07      | (oral variant)       |
| S2.2  | Seriation (3 Objects)                    | 1     | T10      | —                    |
| S2.3  | Classification (Increasing Complexity)   | 1     | T15      | tally                |
| S2.4  | Counting to 5 (Cardinality)              | 1     | T01      | —                    |
| S2.5  | Counting 6-10                            | 1     | T01      | —                    |
| S2.6  | Shape Identification                     | 1     | T04      | picture_options      |
| S2.7  | 2-Item Patterns                          | 1     | T08      | picture_ab           |
| S2.8  | Comparative Vocabulary                   | 1     | T17      | —                    |
| S2.9  | Conceptual Subitizing                    | 1     | T01      | —                    |
| S2.10 | Basic Shape Composition                  | 1     | T10      | —                    |
| S3.1  | Numeral Recognition (1-10)               | 1     | T03      | numeral_picture      |
| S3.2  | Numeral-Quantity Correspondence          | 1     | T03      | numeral_word         |
| S3.3  | Numeral Comparison (Object-Mediated)     | 1     | T07      | —                    |
| S3.4  | Seriation with Transitivity              | 2     | T06      | —                    |
| S3.5  | Flexible Classification                  | 2     | T07      | —                    |
| S3.6  | Numeral Sequencing                       | 2     | T02      | single               |
| S3.7  | Comparative Vocabulary (Formalizing)     | 2     | T07      | (with >, <, =)       |
| S3.8  | Patterns (2-Item Indep & 3-Item Intro)   | 2     | T08      | picture_ab           |
| S3.9  | Basic Shape Properties                   | 2     | T10      | count_properties     |
| S3.10 | Shape Composition & Decomposition        | 2     | T10      | —                    |
| S4.1  | Abstract Numeral Comparison              | 2     | T07      | —                    |
| S4.2  | Close Numeral Comparison                 | 2     | T07      | —                    |
| S4.3  | Counting Objects to 20                   | 2     | T01      | —                    |
| S4.4  | Reading & Writing Numerals to 99         | 2     | T02      | read_in_words        |
| S4.5  | Tens and Ones                            | 2     | T15      | tens_ones_chart      |
| S4.6  | Single-Digit Addition                    | 2     | T05      | simple               |
| S4.7  | Single-Digit Subtraction                 | 2     | T05      | simple               |
| S4.8  | 3D Shape Properties                      | 2     | T10      | name_shape           |
| S4.9  | Non-Standard Length Estimation           | 2     | T16      | non_standard         |
| S4.10 | Non-Standard Capacity Estimation         | 2     | T16      | non_standard         |
| S4.11 | 3-Item Pattern Completion                | 2     | T08      | number_arithmetic    |
| S4.12 | Concept of Zero                          | 2     | T21      | concept_of_zero      |
| S4.13 | Ordinal Positions (1st-10th)             | 2     | T17      | —                    |
| S4.14 | Informal Number Line (0-20)              | 2     | T09      | sparse_ticks         |
| S4.15 | Advanced Shape Composition               | 2     | T10      | —                    |
| S5.1  | Reading & Writing 3-Digit Numbers        | 3     | T02      | read_in_words        |
| S5.2  | Tens as Bundles/Groups                   | 3     | T18      | bundles              |
| S5.3  | Flexible 2-Digit Decomposition           | 3     | T02      | multiple             |
| S5.4  | 2-Digit Addition with Regrouping         | 3     | T22      | column_addition      |
| S5.5  | 2-Digit Subtraction with Regrouping      | 3     | T22      | column_subtraction   |
| S5.6  | Multiplication as Repeated Addition      | 3     | T19      | array_full           |
| S5.7  | Division as Equal Sharing                | 3     | T11      | picture_prompt       |
| S5.8  | Multiplication Tables (2,3,4,5,10)       | 3     | T19      | tables_only          |
| S5.9  | Currency Recognition                     | 3     | T04      | text_options         |
| S5.10 | Informal Fractions (Folding)             | 3     | T14      | informal_fold        |
| S5.11 | Uniform Non-Standard Measurement         | 3     | T16      | non_standard         |
| S5.12 | 2D Shape Set Identification              | 3     | T10      | name_shape           |
| S5.13 | Spatial Vocabulary                       | 3     | T10      | spatial_vocab        |
| S5.14 | Calendar Reading                         | 3     | T13      | —                    |
| S5.15 | Data Handling (Sorting & Tallies)        | 3     | T15      | tally                |
| S5.16 | Number Patterns & Sequences              | 3     | T08      | number_arithmetic    |
| S5.17 | Zero as a Placeholder                    | 3     | T21      | (default)            |
| S5.18 | Extended Number Line (0-100)             | 3     | T09      | sparse_ticks         |
| S5.19 | Skip Counting (2s, 5s, 10s)              | 3     | T20      | —                    |
| S6.1  | 3-Digit Place Value & Expanded Form     | 3     | T18      | expanded             |
| S6.2  | Flexible 3-Digit Decomposition           | 3     | T18      | flexible             |
| S6.3  | 3-Digit Comparison & Ordering            | 3     | T06      | —                    |
| S6.4  | Reading & Writing 4-Digit Numbers        | 3     | T02      | read_in_words        |
| S6.5  | 3-Digit Addition & Subtraction Problems  | 3     | T22      | column_addition      |
| S6.6  | Full Multiplication Tables (2-10)        | 3     | T19      | tables_only          |
| S6.7  | Division Facts & Inverse Relation        | 3     | T05      | simple               |
| S6.8  | Standard Measurement Units               | 3     | T16      | standard_units       |
| S6.9  | Relating 2D Faces to 3D Solids           | 3     | T04      | text_options         |
| S6.10 | Telling Time (Hours & Half-Hours)        | 3     | T13      | —                    |
| S6.11 | Money Arithmetic                         | 3     | T12      | simple_arith         |
| S6.12 | Formal Fractions (Half/Quarter)          | 3     | T14      | simple               |
| S6.13 | Pattern Rules & Generalization           | 3     | T08      | geometric            |
| S6.14 | Data Handling (Pictographs & Bar Graphs) | 3     | T15      | pictograph           |
| S7.1  | 4-Digit & 5-Digit Place Value            | 4     | T18      | expanded             |
| S7.2  | Large Number Operations & Regrouping     | 4     | T22      | column_addition      |
| S7.3  | Complex Multi-Digit Word Problems        | 4     | T11      | multi_step           |
| S7.4  | Extended Multiplication                  | 4     | T22      | column_multiplication |
| S7.5  | Formal Long Division                     | 4     | T22      | (specialized)        |
| S7.6  | Fractional Notation & Equivalence        | 4     | T14      | equivalent           |
| S7.7  | Standard Unit Conversion                 | 4     | T05      | (uses T05)           |
| S7.8  | Applied Measurement Word Problems        | 4     | T11      | unit_aware           |
| S7.9  | 3D Nets & Spatial Perspective            | 4     | T04      | text_options         |
| S7.10 | Advanced Time Calculation                | 4     | T05      | (uses T05)           |
| S7.11 | Complex Money Problems                   | 4     | T12      | change_back          |
| S7.12 | Advanced Number Patterns                 | 4     | T08      | geometric            |
| S7.13 | Bar Graphs & Data Interpretation        | 4     | T15      | bar_graph            |
| S7.14 | Factors & Multiples                      | 4     | T05      | (uses T05)           |
| S7.15 | Decimals (Tenths & Hundredths)           | 4     | T05      | (uses T05)           |
| S7.16 | Angles & Turn                            | 4     | T10      | spatial_vocab        |
| S7.17 | Symmetry & Reflection                    | 4     | T10      | symmetry             |
| S7.18 | Perimeter & Area                         | 4     | T16      | perimeter_area       |

## Notes

- Levels like S7.5 (Long Division), S7.7 (Unit Conversion), S7.10 (Time Calculation), S7.14 (Factors), S7.15 (Decimals) reuse T05 because they share the same visual shape (equation row + answer box). The visual is identical to T05; only the operands change.
- Levels S7.16 / S7.17 reuse T10 (shape_task) for their visual; the difference is in the SVG content (angle indicator / symmetry line) and prompt text.
- "oral variant" notes mean: the same template is used, but the question is read aloud (the student answers verbally). The printed paper still has the visual prompt.
- "no template — level doesn't render as a paper question" notes mean: the level is taught via curriculum activities, not assessed on the paper (e.g. S4.9, S4.10 are capacity/length estimation taught hands-on).

## Adding a new level

1. Add it to `docs/93-levels-and-question-types.md`.
2. Re-classify it by visual shape (count_objects, fill_in_box, etc.) — add to `docs/93-levels-with-shape.json`.
3. Add the level + template + variant row to this manifest.
4. If the visual shape is new, write a new `T##-name.md` template.
5. If the visual shape is new but the data structure fits an existing template, just add a new variant.

## Renderer contract

```ts
type QuestionRenderInput = {
  level: string;          // "S5.4"
  templateId: string;     // "T22"
  variant?: string;       // "column_addition"
  classNumber: 1 | 2 | 3 | 4;
  payload: Record<string, any>;
};

async function renderQuestion(input: QuestionRenderInput): Promise<string> {
  const template = TEMPLATE_REGISTRY[input.templateId];
  return template.render(input.variant ?? 'default', input.classNumber, input.payload);
}
```

The renderer doesn't care about concept or level — it loads the template by id, applies the variant, fills the payload data, returns HTML.

## Data layer decision (deferred)

The data (`payload`, `answer`, SVG asset references) can live either:

- **In the codebase** (`backend/src/data/questions.json` or similar) — fast, versioned, no API call, but changing question data requires a redeploy.
- **In MongoDB** (`db.questions` collection) — flexible, admin-editable, but slower (HTTP round-trip per paper generation).

The template docs are written so either works. The payload schema in each template is the contract between data layer and renderer.

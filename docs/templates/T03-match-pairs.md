# T03 · Match the Pairs (match_or_pairs)

**Visual shape**: 2-column SVG/SVG grid + connecting-line strip in the middle
**Used by**: 6 levels (S1.1, S1.3, S1.5, S1.6, S3.1, S3.2)
**Class-fit**: Class 1–3 primary; degrades to text-only pairs for Class 4

## Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                            [{marks} marks]       │
│                                                                      │
│         {prompt-row}                                                 │
│                                                                      │
│         LEFT                              RIGHT                      │
│         ┌─────┐  ················  ┌─────┐                            │
│         │ {s} │                    │ {s} │                            │
│         └─────┘                    └─────┘                            │
│         ┌─────┐  ················  ┌─────┐                            │
│         │ {s} │                    │ {s} │                            │
│         └─────┘                    └─────┘                            │
│         ┌─────┐  ················  ┌─────┐                            │
│         │ {s} │                    │ {s} │                            │
│         └─────┘                    └─────┘                            │
└──────────────────────────────────────────────────────────────────────┘
```

The dotted lines are where the child draws their connections. **No pre-printed guidelines.**

## Placeholders

| Placeholder     | Type        | Description                                          |
| --------------- | ----------- | ---------------------------------------------------- |
| `{n}`           | number      | Question sequence                                    |
| `{marks}`       | number      | Marks for this question                              |
| `{title-text}`  | text        | Short title (≤3 words, ALL CAPS ok)                  |
| `{prompt-row}`  | text        | E.g. "Draw a line from each picture to its matching partner." |
| `{pair-count}`  | number      | 2–4 pairs                                            |
| `{left-assets}` | svg-key[]   | Logical names of left SVGs (e.g. ["bee", "dog", "bird"])  |
| `{right-assets}`| svg-key[]   | Logical names of right SVGs (e.g. ["flower", "house", "nest"]) |
| `{right-order}` | int[]       | Shuffle order of right items (e.g. [2,0,1])          |

## Class-adaptive behaviour

| Class     | Behaviour                                              |
| --------- | ------------------------------------------------------ |
| Class 1   | Both columns are SVG icons (pictures, not numerals).    |
| Class 2   | Left column = numeral, right column = word ("5", "five"). |
| Class 3   | Left = math symbol/word, right = definition.            |
| Class 4   | Left = term, right = formula. Mostly text-only.        |

## Reference HTML (Class 1 example, 3 pairs of animals)

```html
<div class="q q--match">
  <div class="q-head">
    <span class="q-num">3</span>
    <span class="q-title">MATCH THE PAIRS</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">Draw a line from each picture to its matching partner.</p>
    <div class="match-area">
      <div class="match-col">
        <div class="match-svg"><svg ...>bee</svg></div>
        <div class="match-svg"><svg ...>dog</svg></div>
        <div class="match-svg"><svg ...>bird</svg></div>
      </div>
      <div class="match-strip"></div>  <!-- child draws here -->
      <div class="match-col">
        <div class="match-svg"><svg ...>flower</svg></div>
        <div class="match-svg"><svg ...>doghouse</svg></div>
        <div class="match-svg"><svg ...>nest</svg></div>
      </div>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class1_ootc_animals",
  "templateId": "T03",
  "classNumber": 1,
  "level": 1,
  "concept": "One-to-One Correspondence",
  "qType": "match_pairs",
  "marks": 1,
  "payload": {
    "pairCount": 3,
    "pairs": [
      {"id": "p1", "left": "bee",    "right": "flower"},
      {"id": "p2", "left": "dog",    "right": "doghouse"},
      {"id": "p3", "left": "bird",   "right": "nest"}
    ],
    "rightOrder": [2, 0, 1]
  },
  "answerKey": [
    {"leftId": "p1", "correctRightId": "p1"},
    {"leftId": "p2", "correctRightId": "p2"},
    {"leftId": "p3", "correctRightId": "p3"}
  ]
}
```

## Concept buckets covered

- **One-to-One Correspondence** (S1.1)
- **Same/Different** (S1.3) — match identical pairs
- **Counting Small Sets** (S1.5) — match numeral to group
- **Shape Matching** (S1.6) — match shape to shape
- **Numeral Recognition** (S3.1) — match numeral to quantity
- **Numeral-Quantity Correspondence** (S3.2)

## Variants

| Variant            | Trigger             | Visual difference                          |
| ------------------ | ------------------- | ------------------------------------------ |
| `picture_picture`  | S1.1, S1.6          | Both columns are SVGs                      |
| `numeral_picture`  | S1.5, S3.1          | Left = numeral, right = SVG group          |
| `numeral_word`     | S3.2, Class 2       | Left = numeral, right = written word       |
| `term_definition`  | Class 3-4           | Both columns are text                      |

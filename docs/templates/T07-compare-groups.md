# T07 · Compare Groups (compare_groups)

**Visual shape**: two bordered groups side-by-side, "vs" label, answer box
**Used by**: 4 levels (S3.3, S3.5, S4.1, S4.2)
**Class-fit**: Class 1–4 (the items being compared change)

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                       [{marks} marks]    │
│                                                             │
│         {prompt-row}                                        │
│                                                             │
│         ┌─────────┐                    ┌─────────┐          │
│         │ {gr-A}  │       vs           │ {gr-B}  │          │
│         └─────────┘                    └─────────┘          │
│                                                             │
│         Which has more?   [   ]                             │
└─────────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder      | Type        | Description                                              |
| ---------------- | ----------- | -------------------------------------------------------- |
| `{n}`            | number      | Sequence                                                 |
| `{marks}`        | number      | Marks                                                    |
| `{title-text}`   | text        | E.g. "Quantity Comparison", "Number Comparison"          |
| `{prompt-row}`   | text        | Question prompt                                          |
| `{group-A}`      | svg\|num[]  | Items in group A — SVGs (Class 1) or numerals            |
| `{group-B}`      | svg\|num[]  | Items in group B                                         |
| `{comparison-q}` | text        | "Which has more?" / "Which is greater?" / "Which is closest?" |
| `{correct-answer}`| svg\|num   | The answer                                               |

## Class-adaptive behaviour

| Class     | Behaviour                                                  |
| --------- | ---------------------------------------------------------- |
| Class 1   | Both groups are pictures (e.g. apples vs bananas). Compare by visual count. |
| Class 2   | Both groups are numerals (e.g. 5 vs 8). Compare by magnitude. |
| Class 3   | 2–3 digit numerals. "Closest to 500?"                       |
| Class 4   | 4-digit numerals. "Which is closer to 5000?"               |

## Reference HTML (Class 1 example: apples vs bananas)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">8</span>
    <span class="q-title">Compare Quantities</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">Look at the two groups. Which one has more?</p>
    <div class="compare-groups">
      <div class="compare-group">🍎 🍎 🍎</div>
      <div class="compare-vs">vs</div>
      <div class="compare-group">🍌 🍌 🍌 🍌 🍌</div>
    </div>
    <div class="boxed" style="margin-top:8px;">
      More = <span class="answer-box" style="width:50px;"></span>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class1_quantity_3v5",
  "templateId": "T07",
  "classNumber": 1,
  "level": 18,
  "concept": "Quantity Comparison",
  "qType": "compare_groups",
  "marks": 1,
  "payload": {
    "groupA": {"kind": "svg", "value": "apple", "count": 3},
    "groupB": {"kind": "svg", "value": "banana", "count": 5},
    "comparisonQ": "more",
    "correctAnswer": "B"
  }
}
```

## Concept buckets covered

- **Quantity Comparison** (S2.1, S3.3)
- **Flexible Classification** (S3.5)
- **Abstract Numeral Comparison** (S4.1)
- **Close Numeral Comparison** (S4.2)
- **Comparative Vocabulary (Formalizing)** (S3.7) — uses >, <, =

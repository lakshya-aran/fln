# T17 · Oral / Pointing (oral_no_box)

**Visual shape**: prompt + visual objects, NO answer box
**Used by**: 3 levels (S2.1, S2.8, S4.13)
**Class-fit**: Class 1-2 only (oral administration)

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         {visual-or-text-options}                       │
│                                                        │
│         (Student answers verbally or by pointing.)     │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder      | Type        | Description                                          |
| ---------------- | ----------- | ---------------------------------------------------- |
| `{n}`            | number      | Sequence                                             |
| `{marks}`        | number      | Marks                                                |
| `{title-text}`   | text        | "Quantity Comparison", "Ordinal Positions"           |
| `{prompt-row}`   | text        | "Which group has more?"                              |
| `{options}`      | (svg\|text)[] | Visual or text options                           |
| `{correct-index}`| int         | 0-based index of the correct answer                  |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | All "oral" levels — answered by pointing                |
| Class 2   | Some, only when the question is about vocabulary        |
| Class 3+  | N/A — these levels switch to other templates            |

## Reference HTML (Class 1 example: ordinal positions)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">7</span>
    <span class="q-title">Ordinal Positions</span>
    <span class="q-cog">Recognize</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">Who is <b>third</b> in line?</p>
    <div style="margin:14px 0;display:flex;gap:8px;">
      <div class="pat-cell">A</div>
      <div class="pat-cell">B</div>
      <div class="pat-cell">C</div>
      <div class="pat-cell">D</div>
    </div>
    <p class="mark-here">↑ Point to your answer</p>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class1_ordinal_third",
  "templateId": "T17",
  "classNumber": 1,
  "level": 40,
  "concept": "Ordinal Positions (1st-10th)",
  "qType": "oral_no_box",
  "marks": 1,
  "payload": {
    "options": ["A", "B", "C", "D"],
    "prompt": "Who is third in line?",
    "correctIndex": 2
  }
}
```

## Concept buckets covered

- **Quantity Comparison (oral)** (S2.1)
- **Comparative Vocabulary** (S2.8) — long/short, heavy/light, full/empty
- **Ordinal Positions** (S4.13)

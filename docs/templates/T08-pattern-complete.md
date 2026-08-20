# T08 · Pattern Complete (pattern_complete)

**Visual shape**: sequence row with one or more blank cells
**Used by**: 6 levels (S2.7, S3.8, S4.11, S5.16, S6.13, S7.12)
**Class-fit**: any class — patterns grow from 2-item shapes to number sequences

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         [A]  [B]  [A]  [B]  [   ]  [B]                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder     | Type        | Description                                          |
| --------------- | ----------- | ---------------------------------------------------- |
| `{n}`           | number      | Sequence                                             |
| `{marks}`       | number      | Marks                                                |
| `{title-text}`  | text        | "Patterns", "Number Patterns"                        |
| `{prompt-row}`  | text        | "What comes next?"                                   |
| `{sequence}`    | (svg\|num\|text)[] | Sequence items, with `{null}` for blanks      |
| `{blank-count}` | number      | How many blanks (1–3)                                |
| `{answer}`      | (svg\|num\|text)[] | Answers for the blanks                       |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | 2-item ABAB pattern with pictures (apple, banana, apple, banana, __) |
| Class 2   | 3-item ABCABC patterns                                   |
| Class 3   | Number sequences (2, 4, 6, 8, __)                        |
| Class 4   | Multi-rule patterns (1, 4, 9, 16, 25, __) — square numbers |

## Reference HTML (Class 1 example: ABAB pattern with shapes)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">13</span>
    <span class="q-title">Patterns</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">What comes next?</p>
    <div class="pat-row">
      <div class="pat-cell">⬤</div>
      <div class="pat-cell">⬛</div>
      <div class="pat-cell">�</div>
      <div class="pat-cell">⬛</div>
      <div class="pat-cell pat-blank"></div>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class1_pattern_abab",
  "templateId": "T08",
  "classNumber": 1,
  "level": 14,
  "concept": "2-Item Patterns",
  "qType": "pattern_complete",
  "marks": 1,
  "payload": {
    "sequence": ["circle", "square", "circle", "square", null],
    "blankCount": 1,
    "answer": ["circle"]
  }
}
```

## Concept buckets covered

- **2-Item Patterns** (S2.7)
- **3-Item Patterns** (S3.8)
- **3-Item Pattern Completion** (S4.11)
- **Number Patterns & Sequences** (S5.16)
- **Pattern Rules & Generalization** (S6.13)
- **Advanced Number Patterns** (S7.12)
- **Skip Counting** (S5.19) — variant `skip_counting`

## Variants

| Variant            | Trigger                          | Visual difference               |
| ------------------ | -------------------------------- | ------------------------------- |
| `picture_ab`       | Class 1-2                        | Pictures in cells               |
| `number_arithmetic`| Class 3                          | Numbers with arithmetic rule    |
| `geometric`        | Class 4 (square, cube numbers)   | Numbers in cells with rule hint |

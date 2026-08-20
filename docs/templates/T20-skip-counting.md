# T20 · Skip Counting (skip_counting)

**Visual shape**: number sequence with blank + answer box
**Used by**: 1 level (S5.19)
**Class-fit**: Class 2-3

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {step-display}                                 │
│                                                        │
│         {n1}  {n2}  {n3}  [   ]  {n5}                  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder     | Type        | Description                                          |
| --------------- | ----------- | ---------------------------------------------------- |
| `{n}`           | number      | Sequence                                             |
| `{marks}`       | number      | Marks                                                |
| `{title-text}`  | text        | "Skip Counting"                                      |
| `{step-display}`| text        | "Count by {step}s" (e.g. "Count by 5s")              |
| `{sequence}`    | number[]    | Sequence items, with `{null}` for blanks             |
| `{step}`        | number      | The skip value (2, 5, 10)                            |
| `{blank-index}` | number      | Index of the blank in the sequence                   |
| `{answer}`      | number      | The missing number                                   |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | N/A                                                       |
| Class 2   | Skip by 2s, 5s                                           |
| Class 3   | Skip by 10s, 100s                                         |
| Class 4   | N/A — uses T08 pattern_complete                          |

## Reference HTML (Class 2 example: count by 5s)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">11</span>
    <span class="q-title">Skip Counting</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">Count by 5s. What comes next?</p>
    <div class="pattern-row" style="font-size:24px;">
      5 &nbsp; 10 &nbsp; 15 &nbsp; [   ] &nbsp; 25
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class2_skip5_15_20",
  "templateId": "T20",
  "classNumber": 2,
  "level": 61,
  "concept": "Skip Counting (2s, 5s, 10s)",
  "qType": "skip_counting",
  "marks": 1,
  "payload": {
    "step": 5,
    "sequence": [5, 10, 15, null, 25],
    "blankIndex": 3,
    "answer": 20
  }
}
```

## Concept buckets covered

- **Skip Counting (2s, 5s, 10s)** (S5.19)

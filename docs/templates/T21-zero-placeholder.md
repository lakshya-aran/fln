# T21 · Zero Placeholder (zero_placeholder)

**Visual shape**: two numerals side-by-side + explain-the-difference box
**Used by**: 1 level (S5.17)
**Class-fit**: Class 3-4

## Layout

```
┌────────────────────────────────────────────────────────�
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         {value-1}      {value-2}                       │
│                                                        │
│         Explain why these are different:               │
│         ┌───────────────────────────────────────────┐   │
│         │                                           │   │
│         └───────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder     | Type        | Description                                          |
| --------------- | ----------- | ---------------------------------------------------- |
| `{n}`           | number      | Sequence                                             |
| `{marks}`       | number      | Marks                                                |
| `{title-text}`  | text        | "Zero as a Placeholder"                              |
| `{prompt-row}`  | text        | "What's the difference?"                              |
| `{value-1}`     | number      | First numeral (e.g. 105)                              |
| `{value-2}`     | number      | Second numeral (e.g. 15)                              |
| `{answer-text}` | text        | The correct explanation                              |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | N/A                                                       |
| Class 2   | N/A                                                       |
| Class 3   | 3-digit examples                                          |
| Class 4   | 4-digit examples                                          |

## Reference HTML (Class 3 example: 105 vs 15)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">9</span>
    <span class="q-title">Zero as a Placeholder</span>
    <span class="q-cog">Analyze</span>
    <span class="q-marks">[2 marks]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">Look at these two numbers. Why are they different?</p>
    <div style="font-size:22px;font-family:Arial,sans-serif;margin:14px 0;">
      <b>105</b> &nbsp;&nbsp;&nbsp;&nbsp; <b>15</b>
    </div>
    <div class="wordbox" style="min-height:60px;">
      Explain:
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class3_zero_105_15",
  "templateId": "T21",
  "classNumber": 3,
  "level": 67,
  "concept": "Zero as a Placeholder",
  "qType": "zero_placeholder",
  "marks": 2,
  "payload": {
    "value1": 105,
    "value2": 15,
    "explanation": "The zero in 105 holds the tens place empty. 15 doesn't have a hundreds place."
  }
}
```

## Concept buckets covered

- **Zero as a Placeholder** (S5.17)
- **Concept of Zero** (S4.12) — variant `concept_of_zero` (simpler)

# T19 · Multiplication Visual (multiplication_visual)

**Visual shape**: array/grid SVG of repeated addends + equation + answer box
**Used by**: 2 levels (S5.6, S5.8)
**Class-fit**: Class 2-3 (Class 4 uses T05 compute_box)

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         [array-svg of {rows} × {cols} = {total}]      │
│                                                        │
│         {operand1} × {operand2} = [   ]                │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder   | Type    | Description                                       |
| ------------- | ------- | ------------------------------------------------- |
| `{n}`         | number  | Sequence                                          |
| `{marks}`     | number  | Marks                                             |
| `{title-text}`| text    | "Multiplication (Repeated Add)", "Tables"         |
| `{prompt-row}`| text    | "How many altogether?"                            |
| `{array-svg}` | svg-key | Logical grid (auto-rendered from rows × cols)     |
| `{rows}`      | number  | Number of rows                                    |
| `{cols}`      | number  | Number of cols                                    |
| `{operand1}`  | number  | First operand                                     |
| `{operand2}`  | number  | Second operand                                    |
| `{answer}`    | number  | Product                                           |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | N/A                                                       |
| Class 2   | Small arrays (2×3, 3×2, 2×4)                              |
| Class 3   | Multiplication tables (2–10), larger arrays              |
| Class 4   | N/A — uses T05 for multi-digit multiplication            |

## Reference HTML (Class 2 example: 3 × 4 = 12)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">6</span>
    <span class="q-title">Multiplication</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">How many altogether?</p>
    <div style="margin:14px 0;">
      <svg viewBox="0 0 80 60" width="160" height="120">
        <!-- 3 rows × 4 cols of dots -->
        <g fill="#000">
          <circle cx="10" cy="10" r="4"/><circle cx="30" cy="10" r="4"/><circle cx="50" cy="10" r="4"/><circle cx="70" cy="10" r="4"/>
          <circle cx="10" cy="30" r="4"/><circle cx="30" cy="30" r="4"/><circle cx="50" cy="30" r="4"/><circle cx="70" cy="30" r="4"/>
          <circle cx="10" cy="50" r="4"/><circle cx="30" cy="50" r="4"/><circle cx="50" cy="50" r="4"/><circle cx="70" cy="50" r="4"/>
        </g>
      </svg>
    </div>
    <div class="boxed" style="font-size:18px;font-family:Arial,sans-serif;">
      3 × 4 = <span class="answer-box" style="width:60px;"></span>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class2_mul_3x4",
  "templateId": "T19",
  "classNumber": 2,
  "level": 48,
  "concept": "Multiplication as Repeated Addition",
  "qType": "multiplication_visual",
  "marks": 1,
  "payload": {
    "rows": 3,
    "cols": 4,
    "operand1": 3,
    "operand2": 4,
    "answer": 12
  }
}
```

## Concept buckets covered

- **Multiplication as Repeated Addition** (S5.6)
- **Multiplication Tables (2,3,4,5,10)** (S5.8)
- **Full Tables (2-10)** (S6.6) — variant `tables_only` (no array)

## Variants

| Variant          | Trigger | Visual difference                  |
| ---------------- | ------- | ---------------------------------- |
| `array_full`     | S5.6    | Full dot array visible            |
| `tables_only`    | S5.8+   | No array, just equation           |
| `repeated_add`   | S5.6    | "4 + 4 + 4 = ?" alternative form  |

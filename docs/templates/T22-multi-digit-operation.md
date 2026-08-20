# T22 · Multi-Digit Operation (multi_digit_operation)

**Visual shape**: column-formatted arithmetic + answer box
**Used by**: 4 levels (S5.4, S5.5, S6.5, S7.4)
**Class-fit**: Class 3-4 (Class 1-2 uses T05 simple)

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│              {op1}                                      │
│            + {op2}                                      │
│           ─────────                                     │
│             [   ]                                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder     | Type        | Description                                          |
| --------------- | ----------- | ---------------------------------------------------- |
| `{n}`           | number      | Sequence                                             |
| `{marks}`       | number      | Marks                                                |
| `{title-text}`  | text        | "2-Digit Addition (Regrouping)", "Multi-Digit ×"     |
| `{prompt-row}`  | text        | "Solve"                                              |
| `{operand-1}`   | number      | Top operand                                          |
| `{operand-2}`   | number      | Bottom operand                                       |
| `{operator}`    | text        | "+", "−", "×"                                       |
| `{has-regrouping}` | bool    | Whether to show regrouping hint marks               |
| `{answer}`      | number      | The result                                            |
| `{box-width}`   | number      | Width of answer box                                  |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | N/A                                                       |
| Class 2   | N/A                                                       |
| Class 3   | 2-3 digit operands, regrouping hint visible              |
| Class 4   | Multi-digit operands, no hints                           |

## Reference HTML (Class 3 example: 47 + 28 = ?)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">3</span>
    <span class="q-title">2-Digit Addition (with Regrouping)</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[2 marks]</span>
  </div>
  <div class="q-body">
    <div style="font-family:Arial,sans-serif;font-size:22px;display:inline-block;margin:14px 0;border-bottom:2px solid #000;padding-bottom:4px;">
      <div style="text-align:right;">47</div>
      <div style="text-align:right;">+ 28</div>
    </div>
    <div style="font-family:Arial,sans-serif;font-size:22px;margin-top:4px;">
      <span class="answer-box" style="width:60px;height:32px;"></span>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class3_add_47_28_regroup",
  "templateId": "T22",
  "classNumber": 3,
  "level": 70,
  "concept": "2-Digit Addition with Regrouping",
  "qType": "multi_digit_operation",
  "marks": 2,
  "payload": {
    "operand1": 47,
    "operand2": 28,
    "operator": "+",
    "hasRegrouping": true,
    "answer": 75
  }
}
```

## Concept buckets covered

- **2-Digit Addition (Regrouping)** (S5.4)
- **2-Digit Subtraction (Regrouping)** (S5.5)
- **3-Digit Add & Sub** (S6.5)
- **Extended Multiplication (2-digit × 2-digit)** (S7.4)

## Variants

| Variant            | Trigger    | Visual difference                  |
| ------------------ | ---------- | ---------------------------------- |
| `column_addition`  | S5.4       | Vertical column, + operator        |
| `column_subtraction` | S5.5     | Vertical column, − operator        |
| `column_multiplication` | S7.4  | Vertical × with partial products   |

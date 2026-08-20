# T05 · Compute Box (compute_box)

**Visual shape**: equation row + answer box
**Used by**: 12 levels (S4.6, S4.7, S5.4, S5.5, S5.6, S5.19, S6.5, S6.7, S6.11, S7.4, S7.7, S7.10, S7.11, S7.15)
**Class-fit**: Class 2–4 primary; Class 1 uses simpler variants

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {operand-1}  {operator}  {operand-2}  =  [   ] │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder     | Type        | Description                                              |
| --------------- | ----------- | -------------------------------------------------------- |
| `{n}`           | number      | Question sequence                                        |
| `{marks}`       | number      | Marks                                                    |
| `{title-text}`  | text        | E.g. "Add", "Subtract", "Multiply"                      |
| `{operand-1}`   | number      | First operand                                            |
| `{operator}`    | text        | "+", "−", "×", "÷", or "="                             |
| `{operand-2}`   | number      | Second operand                                           |
| `{box-digit-count}` | number   | Width of answer box (3–6 digit slot)                    |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | Single-digit operands, visual objects may replace numbers |
| Class 2   | 1–2 digit operands, no regrouping                        |
| Class 3   | 2–3 digit operands, regrouping                            |
| Class 4   | 3–5 digit operands, multi-step problems                  |

## Reference HTML (Class 3 example: 47 + 28 = ?)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">2</span>
    <span class="q-title">Add (with regrouping)</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[2 marks]</span>
  </div>
  <div class="q-body">
    <div class="boxed" style="font-family:Arial,sans-serif;font-size:18px;margin-top:8px;">
      <b>47</b> &nbsp;+&nbsp; <b>28</b> &nbsp;=&nbsp;
      <span class="answer-box" style="width:90px;height:32px;"></span>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class3_add_47_28",
  "templateId": "T05",
  "classNumber": 3,
  "level": 70,
  "concept": "2-Digit Addition (Regrouping)",
  "qType": "compute_box",
  "marks": 2,
  "payload": {
    "operand1": 47,
    "operator": "+",
    "operand2": 28,
    "answer": 75,
    "boxDigitCount": 3
  }
}
```

## Concept buckets covered

- **Single-Digit Addition** (S4.6)
- **Single-Digit Subtraction** (S4.7)
- **2-Digit Addition (Regrouping)** (S5.4)
- **2-Digit Subtraction (Regrouping)** (S5.5)
- **Multiplication (Repeated Add)** (S5.6) — display as "4+4+4" or "4×3"
- **Skip Counting** (S5.19) — "5, 10, 15, 20, __"
- **3-Digit Add & Sub** (S6.5)
- **Division Facts** (S6.7) — "24 ÷ 4 = ?"
- **Money Arithmetic** (S6.11)
- **Extended Multiplication** (S7.4)
- **Standard Unit Conversion** (S7.7)
- **Advanced Time** (S7.10)
- **Complex Money** (S7.11)
- **Decimals** (S7.15)

## Variants

| Variant              | Trigger                  | Visual difference                  |
| -------------------- | ------------------------ | ---------------------------------- |
| `simple`             | Class 1-2                | 1–2 digit operands, basic styling  |
| `with_regrouping`    | Class 2-3                | Carrying notation hinted visually  |
| `multi_digit`        | Class 3-4                | Wider operands, taller box         |
| `multi_step`         | S6.5, S7.3, S7.8         | Two-line layout with carry step    |
| `skip_counting`      | S5.19                    | Sequence with missing term         |

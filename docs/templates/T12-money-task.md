# T12 · Money Task (money_task)

**Visual shape**: currency display + arithmetic row + answer box
**Used by**: 3 levels (S5.9, S6.11, S7.11)
**Class-fit**: Class 2–4

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         ₹{n1}  +  ₹{n2}  =  ₹[   ]                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder   | Type    | Description                                       |
| ------------- | ------- | ------------------------------------------------- |
| `{n}`         | number  | Sequence                                          |
| `{marks}`     | number  | Marks                                             |
| `{title-text}`| text    | "Money Arithmetic", "Complex Money Problems"      |
| `{prompt-row}`| text    | "How much total?" / "How much change?"            |
| `{currency}`  | text    | "₹" (Indian rupee — default; configurable)        |
| `{amounts}`   | number[]| Money amounts involved                            |
| `{operator}`  | text    | "+", "−", "×"                                    |
| `{answer}`    | number  | The correct answer                                |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | N/A                                                       |
| Class 2   | Identify currency (recognition only — T04 MCQ)           |
| Class 3   | Simple ₹ addition/subtraction                            |
| Class 4   | Multi-step money problems with denominations, change-back |

## Reference HTML (Class 3 example: ₹25 + ₹13 = ?)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">3</span>
    <span class="q-title">Money Arithmetic</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">How much in total?</p>
    <div class="boxed" style="font-size:18px;margin-top:8px;font-family:Arial,sans-serif;">
      <b>₹25</b> &nbsp;+&nbsp; <b>₹13</b> &nbsp;=&nbsp; <b>₹</b>
      <span class="answer-box" style="width:60px;"></span>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class3_money_25plus13",
  "templateId": "T12",
  "classNumber": 3,
  "level": 72,
  "concept": "Money Arithmetic",
  "qType": "money_task",
  "marks": 1,
  "payload": {
    "currency": "₹",
    "amounts": [25, 13],
    "operator": "+",
    "answer": 38
  }
}
```

## Concept buckets covered

- **Currency Recognition** (S5.9) — uses MCQ variant
- **Money Arithmetic** (S6.11)
- **Complex Money Problems** (S7.11)

## Variants

| Variant          | Trigger            | Visual difference                |
| ---------------- | ------------------ | -------------------------------- |
| `recognition`    | S5.9               | Pictures of currency + MCQ      |
| `simple_arith`   | S6.11              | Two amounts, single op            |
| `change_back`    | S7.11              | "Bought X for ₹Y, paid ₹Z. Change?" |

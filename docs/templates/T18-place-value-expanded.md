# T18 · Place Value Expanded (place_value_expanded)

**Visual shape**: number + expanded form row + answer box(es)
**Used by**: 3 levels (S6.1, S6.2, S7.1)
**Class-fit**: Class 3-4

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {display-value}                                │
│                                                        │
│         =  [b1]00 + [b2]0 + [b3]                       │
│                                                        │
│         [   ]   [   ]   [   ]                          │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder     | Type        | Description                                          |
| --------------- | ----------- | ---------------------------------------------------- |
| `{n}`           | number      | Sequence                                             |
| `{marks}`       | number      | Marks                                                |
| `{title-text}`  | text        | "3-Digit Place Value", "Place Value (Expanded)"      |
| `{display-value}`| number      | The numeral to expand (e.g. 347, 4521)               |
| `{digits}`      | number[]    | Digits of the value, MSB-first (e.g. [3, 4, 7])       |
| `{positions}`   | text[]      | Position labels (["Hundreds", "Tens", "Ones"])       |
| `{place-values}`| number[]    | Place values (e.g. [300, 40, 7])                      |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | N/A                                                       |
| Class 2   | N/A                                                       |
| Class 3   | 3-digit numbers, expanded form                            |
| Class 4   | 4-5 digit numbers, expanded form                          |

## Reference HTML (Class 3 example: 347 → 300 + 40 + 7)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">1</span>
    <span class="q-title">3-Digit Place Value</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[2 marks]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">Write <b style="font-size:18px;">347</b> in expanded form.</p>
    <div class="boxed" style="font-family:Arial,sans-serif;font-size:18px;margin-top:8px;">
      <span class="answer-box" style="width:60px;"></span> &nbsp;+&nbsp;
      <span class="answer-box" style="width:60px;"></span> &nbsp;+&nbsp;
      <span class="answer-box" style="width:60px;"></span>
    </div>
    <p class="mark-here">Hint: Hundreds + Tens + Ones</p>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class3_placevalue_347",
  "templateId": "T18",
  "classNumber": 3,
  "level": 62,
  "concept": "3-Digit Place Value & Expanded Form",
  "qType": "place_value_expanded",
  "marks": 2,
  "payload": {
    "displayValue": 347,
    "digits": [3, 4, 7],
    "positions": ["Hundreds", "Tens", "Ones"],
    "placeValues": [300, 40, 7]
  }
}
```

## Concept buckets covered

- **3-Digit Place Value & Expanded Form** (S6.1)
- **Flexible 3-Digit Decomposition** (S6.2) — variant `flexible`
- **4-Digit & 5-Digit Place Value** (S7.1)
- **Tens as Bundles/Groups** (S5.2) — variant `bundles`

## Variants

| Variant          | Trigger  | Visual difference                          |
| ---------------- | -------- | ------------------------------------------ |
| `expanded`       | S6.1     | Number + sum-of-place-values               |
| `flexible`       | S6.2     | Multiple decomposition options accepted    |
| `bundles`        | S5.2     | Base-10 block visual                       |
| `decompose_to_box` | S5.3   | Just split into boxes (uses T02)           |

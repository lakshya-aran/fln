# T02 · Fill in Box (fill_in_box)

**Visual shape**: prompt row + one or more answer boxes
**Used by**: 4+ levels (S3.6, S4.4, S5.1, S5.8, S6.4, S6.7, S7.1, S7.4, S7.7)
**Class-fit**: any class; answer-box count and digit width grow with class.

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         {display-text}                                 │
│                                                        │
│         Answer = [   ]                                 │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder     | Type        | Description                                              |
| --------------- | ----------- | -------------------------------------------------------- |
| `{n}`           | number      | Question sequence                                        |
| `{marks}`       | number      | Marks for this question                                  |
| `{title-text}`  | text        | Question title (e.g. "Read and Write", "Fill in the blank") |
| `{prompt-row}`  | text        | The question prompt                                      |
| `{display-text}`| text        | What the student sees (e.g. "247 →")                     |
| `{box-count}`   | number      | How many answer boxes to render (1–4)                    |
| `{box-widths}`  | number[]    | Width of each box (e.g. [50, 50, 50] for hundreds/tens/ones) |

## Class-adaptive behaviour

| Class    | Behaviour                                                      |
| -------- | -------------------------------------------------------------- |
| Class 1  | Single box, narrow (~50px). Single-digit answers.              |
| Class 2  | Single or double box. 2-digit answers.                         |
| Class 3  | Up to 3 boxes (hundreds/tens/ones).                            |
| Class 4  | Up to 4 boxes (thousands/hundreds/tens/ones) + decimal boxes.  |

## Reference HTML (Class 3 example: "Look at 347. Write the value of each digit.")

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">1</span>
    <span class="q-title">3-Digit Place Value</span>
    <span class="q-cog">Recall</span>
    <span class="q-marks">[2 marks]</span>
  </div>
  <div class="q-body">
    Look at <b style="font-size:18px;">347</b>. Write the value of each digit.
    <div class="boxed" style="margin-top:6px;font-family:Arial,sans-serif;">
      Hundreds digit: <span class="answer-box" style="width:50px;"></span><br>
      Tens digit:     <span class="answer-box" style="width:50px;"></span><br>
      Ones digit:     <span class="answer-box" style="width:50px;"></span>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class3_placevalue_347",
  "templateId": "T02",
  "classNumber": 3,
  "level": 62,
  "concept": "Place Value",
  "qType": "fill_in_box",
  "marks": 2,
  "payload": {
    "displayValue": "347",
    "boxCount": 3,
    "boxWidths": [50, 50, 50],
    "boxLabels": ["Hundreds digit", "Tens digit", "Ones digit"],
    "answers": [3, 4, 7]
  }
}
```

## Concept buckets covered

- **Numeral Sequencing** (S3.6) — write the missing numeral
- **Reading & Writing 2-Digit** (S4.4) — read "47" → write "forty-seven"
- **Reading & Writing 3-Digit** (S5.1)
- **Reading & Writing 4-Digit** (S6.4)
- **Place Value 3-digit** (S6.1, S6.2)
- **Place Value 4-5-digit** (S7.1)
- **Multiplication Tables** (S5.8, S6.6) — fill in the result
- **Reading & Decimals** (S7.15) — write 0.7 in box

## Variants

| Variant         | Trigger                              | Visual difference                  |
| --------------- | ------------------------------------ | ---------------------------------- |
| `place_value`   | S6.1 / S7.1                          | 3+ labelled boxes (hundreds/tens/ones) |
| `single`        | S4.4 / S5.8                          | One box, wider                     |
| `multiple`      | S5.3 (flexible decomposition)        | Several boxes side-by-side         |
| `read_in_words` | S4.4 / S5.1                          | Display word, student writes numeral |

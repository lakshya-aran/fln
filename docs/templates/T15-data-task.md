# T15 · Data Task (data_task)

**Visual shape**: pictograph/bar graph SVG + answer box
**Used by**: 4 levels (S2.3, S4.5, S6.14, S7.13)
**Class-fit**: Class 1-4 (complexity grows)

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         [pictograph-svg]                               │
│                                                        │
│         Answer = [   ]                                 │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder      | Type        | Description                                          |
| ---------------- | ----------- | ---------------------------------------------------- |
| `{n}`            | number      | Sequence                                             |
| `{marks}`        | number      | Marks                                                |
| `{title-text}`   | text        | "Data Handling", "Bar Graphs"                        |
| `{prompt-row}`   | text        | "How many {category}?"                               |
| `{chart-type}`   | text        | "pictograph" \| "tally" \| "bar"                    |
| `{categories}`   | text[]      | Category labels (e.g. ["Apples", "Bananas"])         |
| `{values}`       | number[]    | Counts per category                                  |
| `{glyph}`        | svg-key     | Pictograph unit glyph (e.g. "apple")                  |
| `{answer}`       | text\|number| Answer                                               |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | Tallies only (1 mark = 1 stroke)                         |
| Class 2   | Tallies + simple pictographs                             |
| Class 3   | Pictographs + simple bar graphs                          |
| Class 4   | Bar graphs with multiple categories, comparisons         |

## Reference HTML (Class 3 example: pictograph of fruits)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">10</span>
    <span class="q-title">Data Handling</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">Look at the pictograph. How many bananas?</p>
    <table style="border-collapse:collapse;margin:8px 0;">
      <tr>
        <td style="border:1px solid #000;padding:6px;">🍎 🍎 🍎</td>
        <td style="border:1px solid #000;padding:6px;">Apples: 3</td>
      </tr>
      <tr>
        <td style="border:1px solid #000;padding:6px;">🍌 🍌 � 🍌 🍌</td>
        <td style="border:1px solid #000;padding:6px;">Bananas: ?</td>
      </tr>
    </table>
    <div class="boxed">
      Answer = <span class="answer-box" style="width:50px;"></span>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class3_data_bananas",
  "templateId": "T15",
  "classNumber": 3,
  "level": 75,
  "concept": "Data Handling (Pictographs & Bar Graphs)",
  "qType": "data_task",
  "marks": 1,
  "payload": {
    "chartType": "pictograph",
    "categories": ["Apples", "Bananas"],
    "values": [3, 5],
    "glyph": "fruit",
    "question": "How many bananas?",
    "answer": 5
  }
}
```

## Concept buckets covered

- **Classification (Increasing Complexity)** (S2.3) — variant `sort`
- **Tens and Ones** (S4.5) — variant `tens_ones_chart`
- **Pictographs & Bar Graphs** (S6.14)
- **Bar Graphs & Data Interpretation** (S7.13)

## Variants

| Variant          | Trigger     | Visual difference                       |
| ---------------- | ----------- | --------------------------------------- |
| `tally`          | Class 1-2   | Stroke marks (||||)                    |
| `pictograph`     | Class 2-3   | Repeated glyphs                         |
| `bar_graph`      | Class 3-4   | Bars (rect SVG elements)                |
| `tens_ones_chart`| S4.5        | Base-10 block layout                    |

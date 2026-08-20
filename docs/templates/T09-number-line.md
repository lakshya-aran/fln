# T09 · Number Line (number_line)

**Visual shape**: horizontal number line with ticks + answer marker
**Used by**: 2 levels (S4.14, S5.18)
**Class-fit**: Class 2-3 (Class 1 doesn't have number-line literacy yet)

## Layout

```
┌────────────────────────────────────────────────────────�
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         ─┼─────�─────┼─────┼─────┼─────┼─              │
│          0     5    10    15    20    25              │
│                                                        │
│         Mark the position of {n} on the number line.   │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder     | Type        | Description                                          |
| --------------- | ----------- | ---------------------------------------------------- |
| `{n}`           | number      | Sequence                                             |
| `{marks}`       | number      | Marks                                                |
| `{title-text}`  | text        | "Number Line"                                        |
| `{prompt-row}`  | text        | E.g. "Mark where 13 belongs."                        |
| `{range-min}`   | number      | Start of number line (0 or 1)                        |
| `{range-max}`   | number      | End of number line (20, 50, 100, 1000)                |
| `{tick-step}`   | number      | Tick spacing (1, 5, 10, 100)                          |
| `{target}`      | number      | The number to mark                                   |
| `{answer-tick}` | number      | Where the student should place a tick                |

## Class-adaptive behaviour

| Class     | Behaviour                                                  |
| --------- | ---------------------------------------------------------- |
| Class 1   | N/A (oral) — not used                                      |
| Class 2   | Number line 0–20, ticks every 5                            |
| Class 3   | Number line 0–100, ticks every 10                          |
| Class 4   | Number line 0–1000, ticks every 100                        |

## Reference HTML (Class 3 example: mark 75 on a 0–100 number line)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">9</span>
    <span class="q-title">Number Line</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">Mark where <b>75</b> belongs on the number line.</p>
    <div class="numberline-wrap">
      <div class="numberline" style="width:100%;">
        <div class="tick" style="left:0%;"></div>
        <div class="label" style="left:0%;">0</div>
        <div class="tick" style="left:10%;"></div>
        <div class="label" style="left:10%;">10</div>
        <!-- ... ticks every 10% ... -->
        <div class="tick" style="left:100%;"></div>
        <div class="label" style="left:100%;">100</div>
      </div>
    </div>
    <p class="mark-here">↑ Mark here</p>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class3_numberline_75",
  "templateId": "T09",
  "classNumber": 3,
  "level": 60,
  "concept": "Extended Number Line (0-100)",
  "qType": "number_line",
  "marks": 1,
  "payload": {
    "rangeMin": 0,
    "rangeMax": 100,
    "tickStep": 10,
    "target": 75,
    "answerTick": 75
  }
}
```

## Concept buckets covered

- **Informal Number Line (0-20)** (S4.14)
- **Extended Number Line (0-100)** (S5.18)

## Variants

| Variant          | Trigger          | Visual difference                       |
| ---------------- | ---------------- | --------------------------------------- |
| `dense_ticks`    | Class 4          | Tick spacing 1, every tick labelled      |
| `sparse_ticks`   | Class 2          | Tick spacing 5 or 10, only major ticks   |

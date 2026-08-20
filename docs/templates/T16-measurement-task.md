# T16 · Measurement Task (measurement_task)

**Visual shape**: ruler / container SVG + answer box
**Used by**: 2 levels (S5.11, S7.18)
**Class-fit**: Class 2-4

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         [measurement-svg]                              │
│                                                        │
│         Answer = [   ] {unit}                          │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder        | Type    | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| `{n}`              | number  | Sequence                                          |
| `{marks}`          | number  | Marks                                             |
| `{title-text}`     | text    | "Measurement", "Perimeter & Area"                 |
| `{prompt-row}`     | text    | "How long is the line?"                            |
| `{measurement-svg}`| svg-key | `ruler` \| `cup` \| `rectangle` (for area)        |
| `{measurements}`   | number[]| Lengths in non-standard units                     |
| `{unit}`           | text    | "cm", "m", "blocks", "squares"                    |
| `{answer}`         | number  | The measure                                       |
| `{box-digit-count}`| number  | Width of answer box (1–4 digits)                  |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | N/A — uses count_objects (informal)                      |
| Class 2   | Non-standard units (blocks, paper clips)                 |
| Class 3   | Standard units (cm, m, kg, g)                            |
| Class 4   | Standard units + perimeter/area formulas                 |

## Reference HTML (Class 2 example: count blocks)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">4</span>
    <span class="q-title">Measurement</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">How long is this line? Count the blocks.</p>
    <div style="margin:14px 0;">
      <svg viewBox="0 0 200 30" width="280" height="40">
        <line x1="0" y1="15" x2="200" y2="15" stroke="#000" stroke-width="2"/>
        <rect x="0"   y="15" width="20" height="15" fill="none" stroke="#000" stroke-width="1"/>
        <rect x="20"  y="15" width="20" height="15" fill="none" stroke="#000" stroke-width="1"/>
        <rect x="40"  y="15" width="20" height="15" fill="none" stroke="#000" stroke-width="1"/>
        <rect x="60"  y="15" width="20" height="15" fill="none" stroke="#000" stroke-width="1"/>
        <rect x="80"  y="15" width="20" height="15" fill="none" stroke="#000" stroke-width="1"/>
      </svg>
    </div>
    <div class="boxed">
      Answer = <span class="answer-box" style="width:50px;"></span> blocks
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class2_measure_5blocks",
  "templateId": "T16",
  "classNumber": 2,
  "level": 53,
  "concept": "Uniform Non-Standard Measurement",
  "qType": "measurement_task",
  "marks": 1,
  "payload": {
    "measurementSvg": "ruler",
    "unit": "blocks",
    "answer": 5,
    "boxDigitCount": 1
  }
}
```

## Concept buckets covered

- **Uniform Non-Standard Measurement** (S5.11)
- **Standard Measurement Units** (S6.8) — variant `standard_units`
- **Standard Unit Conversion** (S7.7) — variant `conversion` (uses T05 compute_box instead)
- **Perimeter & Area** (S7.18) — variant `perimeter_area`

## Variants

| Variant            | Trigger     | Visual difference                       |
| ------------------ | ----------- | --------------------------------------- |
| `non_standard`     | S5.11       | Blocks/clip icons                      |
| `standard_units`   | S6.8        | Ruler markings (cm/m)                  |
| `perimeter_area`   | S7.18       | Rectangle with side lengths labelled    |

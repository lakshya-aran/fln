# T06 · Circle or Tick (circle_or_tick)

**Visual shape**: row of items + indicator (circle or tick) drawn by student
**Used by**: 4 levels (S1.2, S2.6, S3.4, S6.3)
**Class-fit**: any class — but the items being compared change (pictures → numerals)

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         [{item-1}]   [{item-2}]   [{item-3}]           │
│                                                        │
│         Circle the {comparative-adjective}.            │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder             | Type    | Description                                          |
| ----------------------- | ------- | ---------------------------------------------------- |
| `{n}`                   | number  | Sequence                                             |
| `{marks}`               | number  | Marks                                                |
| `{title-text}`          | text    | E.g. "Greatest or Smallest"                           |
| `{prompt-row}`          | text    | Question text                                        |
| `{items}`               | svg\|num[] | Items to choose from — SVGs (Class 1) or numerals |
| `{comparative-adjective}` | text  | "greatest", "smallest", "different", "first", etc.   |
| `{correct-index}`       | int     | 0-based index of the correct item                    |

## Class-adaptive behaviour

| Class     | Behaviour                                                  |
| --------- | ---------------------------------------------------------- |
| Class 1   | Items are pictures; circle the "different" one              |
| Class 2   | Items are numerals; circle the greatest/smallest            |
| Class 3   | Items are 3-digit numerals; circle the greatest            |
| Class 4   | Items are 4-digit numerals; circle the greatest OR ordinal |

## Reference HTML (Class 1 example: circle the "different" one)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">2</span>
    <span class="q-title">Same/Different</span>
    <span class="q-cog">Recognize</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">Look at the pictures below. Circle the one that is different.</p>
    <div class="compare-groups">
      <div class="compare-group">🍎</div>
      <div class="compare-group">🍎</div>
      <div class="compare-group">🍌</div>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class1_samediff_apples",
  "templateId": "T06",
  "classNumber": 1,
  "level": 3,
  "concept": "Perceptual Same/Different",
  "qType": "circle_or_tick",
  "marks": 1,
  "payload": {
    "items": [
      {"kind": "svg", "value": "apple"},
      {"kind": "svg", "value": "apple"},
      {"kind": "svg", "value": "banana"}
    ],
    "comparativeAdjective": "different",
    "correctIndex": 2
  }
}
```

## Concept buckets covered

- **Perceptual Same/Different** (S1.3)
- **Classification (Single Property)** (S1.2)
- **Shape Identification** (S2.6) — circle the shape named
- **Seriation (Transitivity)** (S3.4) — circle the middle item
- **3-Digit Comparison** (S6.3)

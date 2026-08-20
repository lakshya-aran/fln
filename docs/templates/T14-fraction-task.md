# T14 · Fraction Task (fraction_task)

**Visual shape**: shape divided into parts + fraction notation + answer box
**Used by**: 2 levels (S6.12, S7.6)
**Class-fit**: Class 3-4

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         [shape-svg divided into {n} parts, {m} shaded] │
│                                                        │
│         Fraction = [numerator] / [denominator]         │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder   | Type    | Description                                       |
| ------------- | ------- | ------------------------------------------------- |
| `{n}`         | number  | Sequence                                          |
| `{marks}`     | number  | Marks                                             |
| `{title-text}`| text    | "Fractions", "Fractional Notation"                |
| `{prompt-row}`| text    | "What fraction is shaded?"                         |
| `{shape-svg}` | svg-key | `rectangle` \| `circle` \| `triangle`             |
| `{parts}`     | number  | Total parts (2, 3, 4, 8)                          |
| `{shaded}`    | number  | Number of shaded parts                            |
| `{numerator}` | number  | Top of fraction                                   |
| `{denominator}`| number | Bottom of fraction                                |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | N/A                                                       |
| Class 2   | N/A                                                       |
| Class 3   | Halves and quarters only (2 or 4 parts)                  |
| Class 4   | Any denominator (2, 3, 4, 5, 6, 8, 10), equivalent fractions |

## Reference HTML (Class 3 example: 1/2 of a rectangle shaded)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">8</span>
    <span class="q-title">Fractions</span>
    <span class="q-cog">Recognize</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">What fraction is shaded?</p>
    <div style="margin:14px 0;">
      <svg viewBox="0 0 80 40" width="160" height="80">
        <rect x="0" y="0" width="40" height="40" fill="#000" stroke="#000" stroke-width="1.6"/>
        <rect x="40" y="0" width="40" height="40" fill="none" stroke="#000" stroke-width="1.6"/>
        <line x1="40" y1="0" x2="40" y2="40" stroke="#000" stroke-width="1.6"/>
      </svg>
    </div>
    <div class="boxed" style="font-size:18px;font-family:Arial,sans-serif;">
      Fraction = &nbsp;
      <span class="answer-box" style="width:30px;"></span> &nbsp;/&nbsp;
      <span class="answer-box" style="width:30px;"></span>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class3_fraction_half_rect",
  "templateId": "T14",
  "classNumber": 3,
  "level": 73,
  "concept": "Formal Fractions (Half/Quarter)",
  "qType": "fraction_task",
  "marks": 1,
  "payload": {
    "shapeSvg": "rectangle",
    "parts": 2,
    "shaded": 1,
    "numerator": 1,
    "denominator": 2
  }
}
```

## Concept buckets covered

- **Formal Fractions** (S6.12)
- **Fractional Notation & Equivalence** (S7.6)
- **Informal Fractions (Folding)** (S5.10) — variant `informal_fold`

## Variants

| Variant          | Trigger        | Visual difference                  |
| ---------------- | -------------- | ---------------------------------- |
| `informal_fold`  | S5.10          | Just shows a folded shape (no fraction notation) |
| `simple`         | S6.12          | Halves + quarters                  |
| `equivalent`     | S7.6           | Two shapes side-by-side, "which is the same fraction?" |

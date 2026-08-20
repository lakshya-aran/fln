# T01 · Count Objects (count_objects)

**Visual shape**: glyph row + answer box
**Used by**: 9 levels (S1.4, S1.7, S2.4, S2.5, S2.9, S4.3, S5.3, S5.5, S5.6)
**Class-fit**: best for Class 1–2; degrades to number-only for Class 3+

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  Count and write               [{marks} marks]  │
│                                                        │
│         How many {glyph-name}s?                        │
│                                                        │
│         [⭐]  [⭐]  [⭐]  [⭐]  [⭐]  [⭐]              │
│                                                        │
│         Answer = [   ]                                 │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder | Type        | Description                                     |
| ----------- | ----------- | ----------------------------------------------- |
| `{n}`       | number      | Question sequence (1, 2, 3, ...)                |
| `{marks}`   | number      | Marks for this question (1 or 2)                |
| `{glyph}`   | svg-key     | Logical name: `star` \| `circle` \| `triangle` \| `square` \| `apple` \| ... |
| `{count}`   | number      | How many glyphs to render (1–20)                |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1–2 | Always renders SVG glyphs. `count` 1–10.                 |
| Class 3   | Still uses SVGs but the count grows (11–20).             |
| Class 4   | Falls back to numeric notation (no glyphs): `[3][4][7][2][9]` — five boxes the student fills. |

## Reference HTML (Class 1 example, `count=6`, `glyph=star`, `marks=1`)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">5</span>
    <span class="q-title">Count and write</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">How many stars?</p>
    <div class="objects">
      ★ &nbsp; ★ &nbsp; ★ &nbsp; ★ &nbsp; ★ &nbsp; ★
    </div>
    <div class="boxed">
      Answer = <span class="answer-box" style="width:70px;"></span>
    </div>
  </div>
</div>
```

## Data schema (MongoDB `questions` collection)

```json
{
  "qid": "q_class1_count_6_stars",
  "templateId": "T01",
  "classNumber": 1,
  "level": 5,
  "concept": "Subitizing",
  "qType": "count_objects",
  "marks": 1,
  "payload": {
    "glyph": "star",
    "count": 6,
    "answer": 6
  }
}
```

## SVG asset library

Outlined, monochromatic SVG glyphs. The `glyph` field is a key into the asset library:

```json
{
  "star":    "<svg viewBox='0 0 24 24'><polygon points='12,2 15.1,8.6 22,9.3 16.8,14.1 18.5,21 12,17.3 5.5,21 7.2,14.1 2,9.3 8.9,8.6' fill='none' stroke='#000' stroke-width='1.4'/></svg>",
  "circle":  "<svg viewBox='0 0 24 24'><circle cx='12' cy='12' r='6' fill='none' stroke='#000' stroke-width='1.4'/></svg>",
  "triangle":"<svg viewBox='0 0 24 24'><polygon points='12,3 22,21 2,21' fill='none' stroke='#000' stroke-width='1.4'/></svg>",
  "square":  "<svg viewBox='0 0 24 24'><rect x='6' y='6' width='12' height='12' fill='none' stroke='#000' stroke-width='1.4'/></svg>",
  "apple":   "<svg viewBox='0 0 24 24'>...</svg>",
  ...
}
```

## Concept buckets covered (from `docs/93-levels-by-concept.md`)

- **Subitizing** (S1.7, S2.9) — `count` 1–3
- **Counting** (S2.4, S2.5, S4.3) — `count` 4–20
- **Verbal Counting** (S1.4) — oral, no answer box (variant: `oral_no_box`)
- **Skip Counting** (S5.19) — `count` is replaced by step sequence `{5,10,15,20,__}`

## Variants

| Variant       | Trigger                                | Visual difference                       |
| ------------- | -------------------------------------- | --------------------------------------- |
| `oral_no_box` | S1.4 (rote verbal counting)            | No answer box, only the prompt row      |
| `with_step`   | S5.19 (skip counting)                  | Sequence glyphs/numbers + missing-term box |
| `numeric`     | Class 4 fallback                       | Each glyph replaced by an answer box    |

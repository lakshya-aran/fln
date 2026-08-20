# T04 · MCQ Bubbles (mcq_bubbles)

**Visual shape**: prompt + 4 bubble options (A/B/C/D)
**Used by**: 4 levels (S2.6, S5.9, S6.9, S7.9)
**Class-fit**: any class

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         ○  (A) {option-A-text}                         │
│         ○  (B) {option-B-text}                         │
│         ○  (C) {option-C-text}                         │
│         ○  (D) {option-D-text}                         │
└────────────────────────────────────────────────────────�
```

## Placeholders

| Placeholder      | Type        | Description                                            |
| ---------------- | ----------- | ------------------------------------------------------ |
| `{n}`            | number      | Question sequence                                      |
| `{marks}`        | number      | Marks for this question                                |
| `{title-text}`   | text        | Question title                                         |
| `{prompt-row}`   | text        | The question prompt                                    |
| `{options}`      | text[]      | Array of 4 options (A/B/C/D)                           |
| `{correct-index}`| int         | 0–3, which option is correct                           |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | Options are mostly pictures (use small SVG next to text)  |
| Class 2   | Options mix of pictures + numerals + words               |
| Class 3   | Mostly text options with numerals                        |
| Class 4   | Pure text options (term/definition style)                |

## Reference HTML (Class 2 example, currency recognition)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">2</span>
    <span class="q-title">Currency Recognition</span>
    <span class="q-cog">Recognize</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    Which of these is a <b>₹10</b> coin?
    <ul class="mcq-list">
      <li><span class="bubble"></span>(A) A round coin with the number 10</li>
      <li><span class="bubble"></span>(B) A round coin with the number 5</li>
      <li><span class="bubble"></span>(C) A note with the number 10</li>
      <li><span class="bubble"></span>(D) A note with the number 5</li>
    </ul>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class2_currency_10",
  "templateId": "T04",
  "classNumber": 2,
  "level": 51,
  "concept": "Currency Recognition",
  "qType": "mcq_bubbles",
  "marks": 1,
  "payload": {
    "options": [
      "A round coin with the number 10",
      "A round coin with the number 5",
      "A note with the number 10",
      "A note with the number 5"
    ],
    "correctIndex": 0
  }
}
```

## Concept buckets covered

- **Shape Identification** (S2.6)
- **Currency Recognition** (S5.9)
- **3D Faces** (S6.9) — "How many faces does a cube have?"
- **3D Nets** (S7.9) — "Which net folds into a cube?"

## Variants

| Variant          | Trigger                  | Visual difference                     |
| ---------------- | ------------------------ | ------------------------------------- |
| `text_options`   | Class 2-4 (most cases)   | Plain text options                    |
| `picture_options`| Class 1-2                | Each option has a small SVG           |
| `mixed`          | Class 2                  | Pictures + text options mixed         |

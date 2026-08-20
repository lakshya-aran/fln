# T11 · Word Problem (word_problem)

**Visual shape**: wordbox with story + answer row
**Used by**: 4 levels (S5.7, S6.5, S7.3, S7.8)
**Class-fit**: Class 2–4 (Class 1 doesn't have reading literacy for word problems)

## Layout

```
�────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         ┌───────────────────────────────────────────┐   │
│         │  {word-problem-text}                      │   │
│         │                                           │   │
│         └───────────────────────────────────────────┘   │
│                                                        │
│         Answer = [   ]                                 │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder        | Type        | Description                                          |
| ------------------ | ----------- | ---------------------------------------------------- |
| `{n}`              | number      | Sequence                                             |
| `{marks}`          | number      | Marks                                                |
| `{title-text}`     | text        | E.g. "Word Problem", "One-Step Problem"              |
| `{prompt-row}`     | text        | "Solve:"                                              |
| `{word-problem-text}` | text     | The actual story (can include numbers in-line)       |
| `{numbers}`        | number[]    | Numbers referenced in the story                      |
| `{operator}`       | text        | "+", "−", "×", "÷"                                   |
| `{answer}`         | number      | The correct answer                                   |
| `{box-width}`      | number      | Width of answer box (50–100px)                       |

## Class-adaptive behaviour

| Class     | Behaviour                                                  |
| --------- | ---------------------------------------------------------- |
| Class 1   | N/A — word problems are read aloud by teacher              |
| Class 2   | Single-step, 1-2 numbers in story                          |
| Class 3   | Single-step or simple 2-step, 2-3 numbers                   |
| Class 4   | Multi-step, decimals, units (cm/m), 3+ numbers              |

## Reference HTML (Class 2 example: division as equal sharing)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">7</span>
    <span class="q-title">Word Problem</span>
    <span class="q-cog">Apply</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">Solve:</p>
    <div class="wordbox">
      12 candies are shared equally among 3 friends.
      How many candies does each friend get?
    </div>
    <div class="boxed" style="margin-top:8px;">
      Answer = <span class="answer-box" style="width:60px;"></span>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class2_word_division_12by3",
  "templateId": "T11",
  "classNumber": 2,
  "level": 49,
  "concept": "Division as Equal Sharing",
  "qType": "word_problem",
  "marks": 1,
  "payload": {
    "problemText": "12 candies are shared equally among 3 friends. How many candies does each friend get?",
    "numbers": [12, 3],
    "operator": "÷",
    "answer": 4,
    "boxWidth": 60
  }
}
```

## Concept buckets covered

- **Division as Equal Sharing** (S5.7)
- **3-Digit Add & Sub Word Problems** (S6.5)
- **Complex Multi-Digit Word Problems** (S7.3)
- **Applied Measurement Word Problems** (S7.8)
- **One-Step Word Problem** (general, used across classes)

## Variants

| Variant          | Trigger         | Visual difference                   |
| ---------------- | --------------- | ----------------------------------- |
| `picture_prompt` | Class 1-2       | Includes SVG of objects in wordbox  |
| `multi_step`     | Class 4         | Two answer boxes (a + b)            |
| `unit_aware`     | S7.8            | Includes units (cm/m/kg) in story   |

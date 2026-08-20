# T13 · Time Task (time_task)

**Visual shape**: clock SVG + question/answer box
**Used by**: 2 levels (S5.14, S6.10)
**Class-fit**: Class 2-3 (Class 4 uses T05 compute_box for time arithmetic)

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         [clock-svg]                                    │
│                                                        │
│         Answer = [   ]                                 │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder   | Type    | Description                                       |
| ------------- | ------- | ------------------------------------------------- |
| `{n}`         | number  | Sequence                                          |
| `{marks}`     | number  | Marks                                             |
| `{title-text}`| text    | "Tell the Time", "Calendar Reading"               |
| `{prompt-row}`| text    | "What time is the clock showing?"                  |
| `{hour}`      | number  | Hour hand position (1–12)                         |
| `{minute}`    | number  | Minute hand position (0, 15, 30, 45)              |
| `{format}`    | text    | "hour", "half", "quarter"                          |
| `{answer}`    | text    | Time as string "3:30"                              |

## Class-adaptive behaviour

| Class     | Behaviour                                                |
| --------- | -------------------------------------------------------- |
| Class 1   | N/A — oral                                                |
| Class 2   | Hour-only clocks                                          |
| Class 3   | Hour + half-hour, quarter-hour                            |
| Class 4   | N/A here — uses T05 (compute_box) for time arithmetic    |

## Reference HTML (Class 3 example: clock at 3:30)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">6</span>
    <span class="q-title">Tell the Time</span>
    <span class="q-cog">Recognize</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">What time does the clock show?</p>
    <div style="margin:14px 0;">
      <svg viewBox="0 0 100 100" width="120" height="120">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#000" stroke-width="2"/>
        <!-- 12, 3, 6, 9 marks -->
        <line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="3"/>     <!-- hour hand at 12 (=3 hour position) -->
        <line x1="50" y1="50" x2="80" y2="50" stroke="#000" stroke-width="2"/>     <!-- minute hand at 3 -->
      </svg>
    </div>
    <div class="boxed">
      Answer = <span class="answer-box" style="width:80px;"></span>
    </div>
  </div>
</div>
```

## Data schema

```json
{
  "qid": "q_class3_time_3_30",
  "templateId": "T13",
  "classNumber": 3,
  "level": 71,
  "concept": "Telling Time (Hours & Half-Hours)",
  "qType": "time_task",
  "marks": 1,
  "payload": {
    "hour": 3,
    "minute": 30,
    "format": "half",
    "answer": "3:30"
  }
}
```

## Concept buckets covered

- **Calendar Reading** (S5.14) — variant `calendar`
- **Telling Time** (S6.10)

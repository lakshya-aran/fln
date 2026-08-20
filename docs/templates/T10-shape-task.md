# T10 · Shape Task (shape_task)

**Visual shape**: shape SVG + question/answer box
**Used by**: 8 levels (S2.2, S2.10, S3.9, S4.8, S4.15, S5.12, S5.13, S7.16)
**Class-fit**: Class 1–4 (shape complexity grows)

## Layout

```
┌────────────────────────────────────────────────────────┐
│ [Q{n}]  {title-text}                  [{marks} marks]   │
│                                                        │
│         {prompt-row}                                   │
│                                                        │
│         [shape-svg]                                    │
│                                                        │
│         Answer = [   ]                                 │
└────────────────────────────────────────────────────────┘
```

## Placeholders

| Placeholder     | Type        | Description                                          |
| --------------- | ----------- | ---------------------------------------------------- |
| `{n}`           | number      | Sequence                                             |
| `{marks}`       | number      | Marks                                                |
| `{title-text}`  | text        | E.g. "Identify Shapes", "Shape Properties"           |
| `{prompt-row}`  | text        | "How many sides does this shape have?"               |
| `{shape-svg}`   | svg-key     | Logical name: `circle` \| `square` \| `triangle` \| `cube` \| `pyramid` |
| `{prompt-options}` | text[]  | Optional: when asking "which has 4 sides?"           |
| `{answer}`      | text\|number | The answer                                          |

## Class-adaptive behaviour

| Class     | Behaviour                                                  |
| --------- | ---------------------------------------------------------- |
| Class 1   | Match shape to identical shape (no name required).         |
| Class 2   | Name basic shapes (circle, square, triangle).              |
| Class 3   | Identify 3D shapes (cube, sphere, pyramid).               |
| Class 4   | Spatial vocabulary + symmetry/reflection.                  |

## Reference HTML (Class 3 example: identify 3D shape)

```html
<div class="q">
  <div class="q-head">
    <span class="q-num">5</span>
    <span class="q-title">3D Shape Properties</span>
    <span class="q-cog">Recognize</span>
    <span class="q-marks">[1 mark]</span>
  </div>
  <div class="q-body">
    <p class="prompt-row">What is this shape called?</p>
    <div style="margin:14px 0;">
      <svg viewBox="0 0 64 64" width="80" height="80">
        <!-- cube outline -->
        <polygon points="8,16 32,8 56,16 32,24" fill="none" stroke="#000" stroke-width="1.6"/>
        <polygon points="32,24 56,16 56,48 32,56" fill="none" stroke="#000" stroke-width="1.6"/>
        <polygon points="8,16 32,24 32,56 8,48" fill="none" stroke="#000" stroke-width="1.6"/>
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
  "qid": "q_class3_3d_cube",
  "templateId": "T10",
  "classNumber": 3,
  "level": 41,
  "concept": "3D Shape Properties",
  "qType": "shape_task",
  "marks": 1,
  "payload": {
    "shapeSvg": "cube",
    "prompt": "What is this shape called?",
    "answer": "cube"
  }
}
```

## Concept buckets covered

- **Seriation (3 Objects)** (S2.2) — arrange shapes by size
- **Basic Shape Composition** (S2.10)
- **Basic Shape Properties** (S3.9) — number of sides, corners
- **3D Shape Properties** (S4.8) — number of faces, edges, vertices
- **Advanced Shape Composition** (S4.15)
- **2D Shape Set Identification** (S5.12)
- **Spatial Vocabulary** (S5.13) — above/below/beside
- **Symmetry & Reflection** (S7.17)
- **Angles & Turn** (S7.16)

## Variants

| Variant            | Trigger                  | Visual difference                  |
| ------------------ | ------------------------ | ---------------------------------- |
| `match_identical`  | S1.6 (Shape Matching)    | No answer box, just match          |
| `name_shape`       | Class 2-3                | Answer box for the name            |
| `count_properties` | S4.8                     | "How many faces?" → number answer  |
| `spatial_vocab`    | S5.13                    | "Mark the one ABOVE the line"      |
| `symmetry`         | S7.17                    | "Draw the line of symmetry"        |

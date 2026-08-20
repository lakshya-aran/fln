# SPEC — Template-based Question Paper Standardization (FLN Levels 1–93)

## Status
Draft — awaiting user review before code.

## Problem
The current question generator (`backend/src/utils/conceptQuestionGenerator.ts`,
244 lines) is a giant `switch (conceptId)` block with hardcoded numbers and
phrasing. Two problems:

1. **Hard to audit pedagogically.** Each concept has 4 questions baked into
   TypeScript — there's no way to see at a glance "what does L5 look like?"
   without reading the generator source.
2. **Hard to extend to all 93 levels.** Adding a new concept requires editing
   the switch. The numerical ranges, distractors, and phrasing live in code,
   not data.

## Goal
Replace the hardcoded switch with a **data-driven template engine** so that:

- Each level is described by a JSON-serializable **template** that names its
  question **kinds**, **slot ranges**, and **pedagogical citation**.
- Numerical values in templates act as **dynamic placeholders** — e.g. the
  template says "min=1, max=5, n_distractors=3" and the engine fills in a
  fresh question every time.
- The 93-level curriculum becomes a directory of templates, not a code
  monolith.

## Architecture

```
backend/src/templates/
  engine.ts              # TemplateEngine — render(template, ctx) → Question[]
  types.ts               # Template, Slot, Generator, PedagogicalCitation
  kinds/                 # one generator per "kind" of question
    counting.ts          # "How many {objects} are there? Count and write the number."
    comparison.ts        # "Which has more: {a} or {b}?"
    addition.ts          # "{a} + {b} = ?"
    subtraction.ts       # "{a} - {b} = ?"
    wordproblem.ts       # Multi-step narrative problem.
    seriation.ts         # "Put in order: smallest to largest."
    classification.ts    # "Which one doesn't belong?"
  templates/             # one template descriptor per level
    L01-counting.ts      # L1.0/L1.1/L1.2 — preschool counting 1-5
    L08-addition.ts      # L8.0/L8.1/L8.2 — single-digit addition
    L20-wordproblem.ts   # L20+ — 2-step word problem
    index.ts             # registry: level → template lookup
```

### Template shape

```ts
interface PedagogicalCitation {
  author: string;
  year: number;
  finding: string;     // one-sentence paraphrase of the relevant finding
  source?: string;     // e.g. "NSF Early Number Sense, Clements 1984"
}

interface Slot {
  name: string;                                  // e.g. "min", "max", "a"
  type: 'int' | 'pick';
  min?: number;                                  // for int
  max?: number;                                  // for int
  from?: string[];                               // for pick — vocab
}

interface Generator {
  kind: string;                                  // registered generator name
  promptTemplate: string;                        // with {slot} placeholders
  answerFromSlot?: string;                       // which slot is the answer
  choicesFromSlot?: string;                      // for MCQ: generate N distractors
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  subtopic: string;
  pedagogicalNote?: string;                      // per-generator citation note
}

interface Template {
  id: string;                                    // e.g. "counting-1to5"
  appliesToLevels: number[];                     // [1,2,3]
  strands: string[];                             // ["Number Sense"]
  citation: PedagogicalCitation;
  slots: Slot[];
  generators: Generator[];                       // each → one Question
}
```

### Engine contract

```ts
class TemplateEngine {
  static render(template: Template, seed?: number): Question[];
}
```

- For each generator, fill slots deterministically (seeded RNG so re-renders
  are reproducible in tests).
- Look up the `kind` in the registry; if missing, throw `UnknownKindError`.
- Returns `Question[]` matching the existing `Question` interface so no
  downstream callers change.

### Pedagogical justification (for the 3 samples)

Each template carries an inline `citation` object. For the three samples:

**L1–L3 (Preschool counting 1–5)** — citation: Clements, D. H. (1984).
"Subitizing and counting: A developmental study of number concepts."
NSF Goal: *Mathematics Education*. Rationale: children at age 4–5 reliably
subitize up to 3 and learn to count up to 5 through one-to-one
correspondence.

**L8–L12 (Single-digit addition)** — citation: Carpenter, T. P., Fennema, E.,
Franke, M. L., Levi, L., & Empson, S. B. (1999). *Children's Mathematics:
Cognitively Guided Instruction*. Rationale: addition of single-digit numbers
should be practiced with sums ≤ 10 first (L8–L10), then 11–18 (L11–L12),
to scaffold counting-on strategies without overwhelming working memory.

**L20+ (Two-step word problem)** — citation: Verschaffel, L., Greer, B., &
De Corte, E. (2000). *Making Sense of Word Problems*. Rationale: realistic
context and two-step structure develop mathematical modeling — kept short
(2 sentences) so language load doesn't dominate numerical reasoning.

## What's in scope (this PR)

1. `types.ts` — interfaces only.
2. `engine.ts` — minimal engine: slot filler + generator dispatch.
3. `kinds/` — 5 sample kinds (counting, comparison, addition, subtraction,
   wordproblem).
4. `templates/` — 3 sample templates (L1, L8, L20) as proof-of-concept.
5. `templates/index.ts` — registry: `getTemplateForLevel(level) → Template | null`.
6. Unit test: `backend/src/templates/__tests__/engine.test.ts` — render each
   sample template twice with the same seed, assert identical output; render
   twice with different seeds, assert different output.

## What's NOT in scope (this PR)

- Replacing the existing `conceptQuestionGenerator.ts` switch statement. That
  is the migration phase, which needs separate design discussion (the
  existing generator emits 4 questions per concept; the new template system
  could emit variable counts per level).
- Building templates for all 93 levels. Three samples establish the shape;
  the remaining 90 can be authored incrementally by the curriculum team
  against the spec.
- Pedagogical research citations for the 90 remaining levels. The three
  samples carry citations as a template for the rest.
- Frontend changes. The template engine produces `Question[]` — same shape
  the existing pipeline consumes. No UI changes needed.

## Open questions for user

1. **Where should templates live long-term?** `backend/src/templates/` is
   natural if generation stays in Node. If we ever want Python/AI to
   author templates, JSON in `ai-services/syllabus/` may be better.
2. **Slot type system.** Should we support richer slots like `range_pair`
   (a, b with constraint a < b) or `expression` (an arithmetic expression
   that evaluates to a number)? Useful for word problems but not needed
   for the 3 samples.
3. **Difficulty parameterization.** Difficulty is currently per-generator.
   Should it be per-template so all generators in a template share the
   same difficulty band? I'd argue per-generator is more flexible.
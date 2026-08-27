# FLN — Foundational Literacy & Numeracy Assessment Platform

A large-scale, personalized assessment system that helps teachers measure, track, and improve every student's Foundational Literacy and Numeracy (FLN) outcomes — from automatic, student-specific question paper generation to bulk scanning of answer sheets and instant, profile-driven evaluation powered by cloud OCR.

---

## Table of Contents
- [What is FLN?](#what-is-fln)
- [Why FLN Matters](#why-fln-matters)
- [Initiatives](#initiatives)
- [What This Software Does](#what-this-software-does)
- [How It Works (Workflow)](#how-it-works-workflow)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Contribution Guidelines](#contribution-guidelines)
- [Branching & PR Convention](#branching--pr-convention)
- [License](#license)

---

## What is FLN?

**Foundational Literacy and Numeracy (FLN)** refers to the basic ability to read with comprehension and perform simple arithmetic operations — the core skills every child needs before they can meaningfully engage with the rest of their school curriculum. It typically covers children from pre-school through Grade 3 (roughly ages 3–9), and includes skills like letter and word recognition, reading fluency, basic comprehension, number sense, and elementary arithmetic.

FLN is considered the "foundation" of all future learning — without it, a child cannot effectively progress through later grades, no matter how good the rest of the curriculum is.

## Why FLN Matters

India has one of the largest school-going populations in the world, but enrollment has not translated into actual learning. Large-scale assessments have repeatedly shown that a significant share of children in upper primary grades cannot read a simple grade-appropriate text or solve basic arithmetic problems. This learning gap compounds over time — children who fall behind in FLN tend to struggle increasingly with every subject built on top of it, leading to disengagement, grade repetition, and eventually dropout.

The National Education Policy (NEP) 2020 explicitly recognized this and stated that achieving universal foundational literacy and numeracy in primary school is the highest near-term priority for the Indian education system — without it, the rest of education policy has limited impact for a large portion of students.

This is the problem our project aims to help solve: giving schools and teachers a reliable, scalable, and personalized way to **assess** where each child stands on FLN, **act** on that data quickly, and **track** progress until every child clears the foundational bar.

## Initiatives

Some of the key national and state-level efforts this project aligns with:

- **NIPUN Bharat** (National Initiative for Proficiency in Reading with Understanding and Numeracy) — launched in July 2021 under the Samagra Shiksha scheme, with the goal that every child achieves grade-level FLN competencies by the end of Grade 3, by 2026–27. It uses a five-tier implementation structure (national, state, district, block, school).
- **NEP 2020** — the policy mandate that established universal FLN as the top priority for the Indian school system.
- **DIKSHA & UDISE+** — existing national digital infrastructure for teacher resources and student/school data that FLN initiatives are encouraged to build on or align with.
- **State-led missions** — several states have their own FLN programs aligned with NIPUN Bharat (e.g., Mission Buniyaad in Delhi, Mission Ankur in Madhya Pradesh), often with localized assessment tools and workbooks.

This project is built to be usable by schools, teachers, and administrators operating within this broader policy ecosystem — generating assessments aligned with grade-wise FLN expectations ("Lakshyas") rather than a generic test.

## What This Software Does

The platform is built around **per-student diagnostic profiling**, not one-size-fits-all testing. Every student gets their own FLN level profile built up from diagnostic assessments, and all subsequent practice, midline, and endline papers are generated against that profile. Core capabilities:

- **Student Profiling via Diagnostic** — after a student is registered, the teacher runs a diagnostic assessment for them. The diagnostic identifies which FLN levels the student has cleared and which they are lacking, building the student's profile from the ground up. Every student's profile starts empty and grows with each assessment they take.
- **Teacher Dashboard** — central workspace for teachers to manage classes, generate bulk diagnostic / midline / endline papers for every student, trigger scans, and view per-student analytics.
- **Bulk Generation & Bulk Printing** — the teacher generates the **bulk diagnostic paper** (or bulk midline / endline paper) from the app, not a single paper. One action produces a full set of per-student randomized papers for the class, ready to print.
- **Scan & Auto-Evaluate** — after collecting completed sheets, the teacher feeds them through a school scanner (not a phone camera, for the time being) and uploads them into the app. The system evaluates them automatically.
- **Cloud OCR via Ollama Gemma 4** — scanned answer sheets are processed by Ollama's Gemma 4 vision model in the cloud, which extracts the student's handwritten answers from each page. The extracted answers are matched to the per-student answer key the system already generated when the paper was created.
- **Progressive Practice Path** — based on the diagnostic profile, the system schedules **progressive practice worksheets** on the levels the student needs to work on. Each successive worksheet increases the difficulty one step at a time, so the student can prepare and learn with progressive questions matched to their gaps. Midline and endline papers then test whether those gaps have closed.
- **No FLN Qualifier After Diagnostic** — students do not re-attempt an FLN qualifier immediately after the diagnostic. Instead, the diagnostic tells them which concepts they are lacking, and they work through midline + endline papers on those levels and skills until they close the gap. The student does not need to give the next FLN qualifier in the meantime.
- **FLN Certification** — FLN certification for a grade means the student has completed **all the grade's competencies and all the grade's levels mapped in our system** (i.e. cleared the endline on every level required for that grade). Certification is the outcome of clearing all competencies, not a single re-attempt of a qualifier.


## How It Works (Workflow)

1. Teacher registers a student into a class.
2. Teacher generates the **bulk diagnostic paper** for the class from the dashboard — every student in the class receives their own randomized version.
3. Papers are printed and distributed to students.
4. Students take the diagnostic assessment on paper.
5. Teacher collects the answer sheets and scans them through the school scanner, then uploads them into the app (bulk upload — one file for the whole class).
6. The system runs OCR on every page (Ollama Gemma 4, per-page, in the cloud), matches each extracted answer to the per-student answer key, and updates each student's profile with what they cleared and what they still lack.
7. Based on the profile, the system schedules **progressive practice worksheets** on the levels the student is lacking. The student works through these, then takes a **midline** paper to check progress added with further levels, and finally an **endline** paper to confirm the gap has closed and cleared that rade competencies.
8. The cycle repeats until every student has closed all gaps for their grade. A student is FLN-certified for the grade once they have cleared all grade-level competencies and all grade-level levels mapped in the system.

*(Detailed write-ups of the OCR pipeline, PDF generation, etc. live as static docs under `docs/` and are updated as each piece is added.)*

## Tech Stack

This project is built on the **MERN stack** (MongoDB / Express / React / Node), with a Python sidecar for one-time PDF rasterization before cloud OCR, and Ollama's Gemma 4 vision model as the cloud OCR backend.



## Getting Started

```bash
git clone https://github.com/vicharanashala/fln.git
cd fln
npm install
```

### Run against your own MongoDB (recommended for local dev)

Each contributor should point their local backend at **their own** MongoDB — either
a free [Atlas](https://www.mongodb.com/cloud/atlas/register) cluster or a local
`mongod` — instead of hardcoding data or sharing one database. This lets you seed
your own test data and iterate on features without touching anyone else's.

1. Copy the backend env template: `cp backend/.env.example backend/.env`
   (the file at the repo root, `.env.example`, is only for the AI scripts in
   `ai-services/` — it does **not** configure the database).
2. In `backend/.env`, set `MONGODB_URI` to your own connection string, e.g.
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fln` (Atlas) or
   `mongodb://127.0.0.1:27017/fln` (local mongod).
   Also set `OLLAMA_API_KEY` (or `ICR_CLOUD_API_KEY_OLLAMA_GEMMA4`) to enable
   cloud OCR via Ollama Gemma 4.
3. Populate it with the full demo dataset (states/districts/schools/teachers/
   volunteers/students — matches the demo login buttons in the UI):
   ```bash
   npm run seed --workspace @fln/backend
   ```
   Optionally also run `npm run seed:question-bank` and `npm run seed:html`
   (workspace-scoped) to load the question bank / worksheet HTML collections.
4. Start the app:
   ```bash
   npm run dev:backend    # API on :3000, reads backend/.env
   npm run dev:frontend   # Vite dev server on :5173
   ```

Demo login after seeding: `superadmin@fln.org`, password `Fln@2026` (see
`backend/src/seed.ts` for the full list of generated teacher/volunteer/admin
emails, which follow a predictable `role.<state>_<district>_<block>_<school>@fln.org`
pattern).

## Working Only From Predefined Issues

Until Version 1 is clean end-to-end, contributors should pick up work only from issues labeled [`intern-ready`](https://github.com/vicharanashala/fln/issues?q=is%3Aissue+is%3Aopen+label%3Aintern-ready) — these are mechanical, well-scoped tasks (e.g. splitting a god-file, rolling out pagination) that don't require a judgment call about platform behavior. Issues without that label may touch pedagogical logic (the level framework, certification distance, diagnostic scoring) or unbuilt backend features, and need core-team review before and during the work — don't self-assign those without checking with a maintainer first. If you think something is missing from the issue list, raise it as a new issue; don't build it unscoped.

## Contribution Guidelines

This is an **open-source** project — contributions are welcome. Before contributing:

1. Check open issues or discuss the feature/fix you want to work on.
2. Fork the repo (or create a branch if you have write access).
3. Follow the branch naming and PR process below.
4. Keep PRs focused — one feature or one fix per PR.
5. Write clear commit messages describing *what* and *why*.

## Branching & PR Convention

All branches must follow this naming convention:

| Type | Branch Name Format | Example |
|------|--------------------|---------|
| Feature | `feat: <name of feature>` | `feat: auto question paper generation` |
| Fix | `fix: <name of fix>` | `fix: scanner upload crash on android` |

**Process:**
1. Create a branch using the convention above.
2. Make your changes and commit with clear messages.
3. Push the branch and **raise a Pull Request (PR)** against `main` (or the appropriate base branch).
4. PRs should reference the related issue (if any) and briefly describe the change.
5. At least one review/approval is required before merging (process may be refined as the team grows).

## License

This repository is open source. *(License file to be added — e.g., MIT/Apache 2.0. Update this section once finalized.)*

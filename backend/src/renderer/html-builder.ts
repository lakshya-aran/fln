/**
 * Master chassis — every rendered paper gets the same outer scaffold.
 *
 * Conforms to docs/template-master-style.md §1, §3, §5, §16.
 * The CSS variables drive both Class 1–2 and Class 3–4 sizes — the
 * `paper-c34` modifier class on <body> switches the preset.
 */
import { PackedPage } from './page-packer';

export interface PaperMeta {
  /** e.g. "FLN Diagnostic Paper" */
  title: string;
  /** e.g. "Class 1 — Worksheet A" */
  subtitle: string;
  /** Student name (renderer fills this from the paper doc). */
  studentName: string;
  /** Class label, e.g. "Class 1 - A". */
  classLabel: string;
  /** 1-4 — drives the body class (`paper-c12` or `paper-c34`). */
  classNumber: 1 | 2 | 3 | 4;
}

/**
 * The CSS block injected into every rendered paper.
 *
 * This is the same CSS that's in `fln-master-template.html` (the static
 * sample I built earlier) — kept in sync with docs/template-master-style.md.
 *
 * Future: extract into a shared `.css` file so the renderer and the static
 * sample use the same stylesheet. Phase 1 keeps them in two places for speed.
 */
const MASTER_CSS = `
:root {
  --font-body:    "Noto Sans", "Helvetica Neue", Arial, sans-serif;
  --font-regular: 400;
  --font-medium:  500;
  --font-semibold:600;
  --font-bold:    700;

  --color-ink:    #000;
  --color-rule:   #666;
  --color-paper:  #fff;

  --fs-question:    19pt;
  --fs-instruction: 19pt;
  --fs-option:      19pt;
  --fs-number:      24pt;
  --fs-section:     28pt;
  --fs-main-title:  30pt;
  --fs-qbadge:      18pt;
  --fs-marksbadge:  14pt;
  --fs-svgcaption:  14pt;
  --fs-footer:      12pt;

  --box-answer:        18mm;
  --box-answer-wide:   55mm;
  --box-answer-tall:   20mm;
  --svg-slot:          55mm;
  --svg-slot-match:    65mm;

  --q-match-height:    110mm;
  --q-match-strip:     100mm;

  --q-margin-y:        6px;
  --q-padding-y:       18px;
}

body.paper-c34 {
  --fs-question:    17pt;
  --fs-instruction: 17pt;
  --fs-option:      17pt;
  --fs-number:      22pt;
  --fs-section:     24pt;
  --fs-main-title:  28pt;
  --fs-qbadge:      16pt;
  --fs-marksbadge:  12pt;
  --fs-svgcaption:  12pt;
  --box-answer:        15mm;
  --box-answer-wide:   50mm;
  --box-answer-tall:   18mm;
  --svg-slot:          45mm;
  --svg-slot-match:    55mm;
  --q-match-height:    90mm;
  --q-match-strip:     80mm;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-weight: var(--font-regular);
  -webkit-font-smoothing: antialiased;
}

body { padding: 16mm 18mm; }

.page {
  width: 210mm;
  min-height: 297mm;
  padding: 0;
  margin: 0 auto 8mm;
  background: var(--color-paper);
  position: relative;
  page-break-after: always;
}
.page:last-of-type { page-break-after: auto; margin-bottom: 0; }

.page-header { margin-bottom: 16px; }

.paper-title {
  font-size: var(--fs-main-title);
  font-weight: var(--font-bold);
  line-height: 1.2;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
  text-align: center;
}

.paper-subtitle {
  font-size: var(--fs-footer);
  font-weight: var(--font-regular);
  line-height: 1.4;
  margin: 0;
  text-align: center;
  opacity: 0.8;
}

.student-info {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  font-size: var(--fs-question);
  line-height: 1.4;
  margin: 14px 0 0 0;
  padding: 6px 0;
}
.student-info .field { display: flex; align-items: baseline; gap: 6px; }
.student-info .field-label { font-weight: var(--font-semibold); }
.student-info .field-line {
  flex: 1;
  border-bottom: 1px solid var(--color-ink);
  min-height: calc(var(--fs-question) * 1.4);
}

.stack { display: flex; flex-direction: column; }

.q {
  margin: 0 0 var(--q-padding-y) 0;
  padding: 0;
  page-break-inside: avoid;
  display: flex;
  flex-direction: column;
}
.q:last-of-type { margin-bottom: 0; }

.q-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.q-num {
  width: 16mm;
  height: 16mm;
  min-width: 16mm;
  min-height: 16mm;
  border: 1.5pt solid var(--color-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-qbadge);
  font-weight: var(--font-bold);
  line-height: 1.0;
  flex-shrink: 0;
}

.q-title {
  flex: 1;
  font-size: var(--fs-question);
  font-weight: var(--font-semibold);
  line-height: 1.3;
  padding-top: 1mm;
}

.q-marks {
  font-size: var(--fs-marksbadge);
  font-weight: var(--font-medium);
  line-height: 1.0;
  padding: 1px 6px;
  border: 1pt solid var(--color-ink);
  align-self: flex-start;
  flex-shrink: 0;
  white-space: nowrap;
}

.q-body {
  margin-left: calc(16mm + 12px);
  font-size: var(--fs-question);
  line-height: 1.5;
}

.activity { margin-top: 10px; margin-bottom: 10px; }

.prompt-row {
  font-size: var(--fs-instruction);
  font-weight: var(--font-semibold);
  line-height: 1.4;
  margin: 0 0 10px 0;
}

.svg-slot {
  width: var(--svg-slot);
  height: var(--svg-slot);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
.svg-slot svg, .svg-slot img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }

.svg-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; row-gap: 8px; }
.svg-row--count { gap: 6px; align-items: center; }
.svg-row--count .svg-slot { width: 14mm; height: 14mm; }

.answer-box {
  display: inline-block;
  width: var(--box-answer);
  height: var(--box-answer);
  border: 1.5pt solid var(--color-ink);
  vertical-align: middle;
  margin: 0 4px;
}
.answer-box--tall { height: var(--box-answer-tall); }
.answer-box--wide { width: var(--box-answer-wide); height: var(--box-answer); }

.answer-row { display: inline-flex; align-items: center; gap: 4px; font-size: var(--fs-question); }
.answer-hint { font-size: var(--fs-marksbadge); font-weight: var(--font-medium); }

.q--match { min-height: var(--q-match-height); }
.q--match .q-body { display: flex; flex-direction: column; }
.q--match .match-area {
  display: grid;
  grid-template-columns: var(--svg-slot-match) var(--q-match-strip) var(--svg-slot-match);
  gap: 0;
  align-items: center;
  margin-top: 12px;
}
.q--match .match-col { display: flex; flex-direction: column; gap: 14px; align-items: center; }
.q--match .match-svg {
  width: var(--svg-slot-match);
  height: var(--svg-slot-match);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.q--match .match-svg svg, .q--match .match-svg img { max-width: 100%; max-height: 100%; object-fit: contain; }
.q--match .match-strip {
  width: var(--q-match-strip);
  height: var(--svg-slot-match);
  position: relative;
}

.page-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: var(--fs-footer);
  line-height: 1.4;
  color: var(--color-ink);
  opacity: 0.75;
  text-align: center;
}

@media print {
  body { padding: 0; }
  .page { margin: 0; box-shadow: none; }
}
`;

const NOTO_SANS_LINK = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap">
`;

/** Escape HTML special characters in any user-provided strings (defensive). */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Build a single A4 page block: header + stack of questions + footer.
 */
function buildPage(page: PackedPage, meta: PaperMeta): string {
  const bodyClass = meta.classNumber >= 3 ? 'paper-c34' : 'paper-c12';

  // Only the first page shows the page header (student info etc.).
  const isFirstPage = page.pageNumber === 1;
  const header = isFirstPage
    ? `
      <header class="page-header">
        <h1 class="paper-title">${escapeHtml(meta.title)}</h1>
        <p class="paper-subtitle">${escapeHtml(meta.subtitle)}</p>
        <div class="student-info">
          <div class="field">
            <span class="field-label">Name:</span>
            <span class="field-line"></span>
          </div>
          <div class="field">
            <span class="field-label">Class:</span>
            <span class="field-line"></span>
          </div>
          <div class="field">
            <span class="field-label">Age:</span>
            <span class="field-line"></span>
          </div>
          <div class="field">
            <span class="field-label">Date:</span>
            <span class="field-line"></span>
          </div>
        </div>
      </header>`
    : '';

  // Subsequent pages show a small "continued" header so the student knows the
  // paper is multi-page. Master spec §7 — page header is reserved at top.
  const continued = !isFirstPage
    ? `<header class="page-header"><p class="paper-subtitle" style="text-align:right;">${escapeHtml(meta.subtitle)} (continued)</p></header>`
    : '';

  const questionsHtml = page.questions.map(q => q.html).join('\n');

  // Footer count: total questions across all pages (the renderer passes this
  // already-aggregated info via meta, but for phase 1 we just say "n questions").
  const totalOnPage = page.questions.length;
  const footer = `
    <footer class="page-footer">
      End of Page ${page.pageNumber} · ${totalOnPage} question${totalOnPage === 1 ? '' : 's'}
    </footer>`;

  return `
<div class="page">
  ${header}
  ${continued}
  <main class="stack">
    ${questionsHtml}
  </main>
  ${footer}
</div>`;
}

/**
 * Build the full rendered HTML document for a paper.
 * Caller passes the already-packed pages and the paper metadata.
 */
export function buildPaperHtml(meta: PaperMeta, pages: PackedPage[]): string {
  const bodyClass = meta.classNumber >= 3 ? 'paper-c34' : 'paper-c12';
  const pageHtml = pages.map(p => buildPage(p, meta)).join('\n');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(meta.classNumber === 1 || meta.classNumber === 2 ? 'en' : 'en')}">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(meta.title)} — ${escapeHtml(meta.subtitle)}</title>
  ${NOTO_SANS_LINK}
  <style>${MASTER_CSS}</style>
</head>
<body class="${bodyClass}">
${pageHtml}
</body>
</html>`;
}

/**
 * Fixed layout minimums for printed worksheets at the year-before-Class-1
 * (Balvatika) stage.
 *
 * paperGenerator.ts inlines its layout numbers in each generator (`size: 15`,
 * `size: 10`, ...). New generators, starting with renderConceptWorksheet()
 * (#602), read them from here instead, so changing a minimum is a one-line
 * edit rather than a hunt through every render function.
 *
 * Why larger than the existing papers: the team's review of the current
 * papers found them too crowded for this age; young children write large and
 * need more open space between items and larger diagrams
 * (Research/fln_year_before_class1.md, section 4, "Worksheet layout").
 *
 * All sizes are PDF points (1pt = 1/72 inch). An A4 page is 595.28 x 841.89pt.
 */

/** Smallest font any text on the sheet may use. Headings may be larger. */
export const MIN_FONT_SIZE_PT = 18;

/** Smallest height of the space a child writes or draws an answer in. */
export const MIN_ANSWER_BOX_HEIGHT_PT = 24;

/**
 * Most questions placed on one page. A starting value, to be tuned once real
 * sheets are printed. It caps a page; it never lets the renderer shrink
 * anything to reach it (see OVERFLOW_POLICY).
 */
export const QUESTIONS_PER_PAGE_MAX = 6;

/**
 * How a question block is laid out.
 *  - oneConceptPerBlock: a block never mixes questions from two concepts.
 *  - breakInside: CSS `page-break-inside` for a block, so a block is never
 *    split across two pages.
 */
export const BLOCK_RULES = Object.freeze({
  oneConceptPerBlock: true,
  breakInside: 'avoid',
} as const);

/**
 * Minimums win, pages flex.
 *
 * The minimums above are never reduced to make content fit. When the content
 * does not fit on the page, or the page already holds QUESTIONS_PER_PAGE_MAX
 * questions, the renderer starts a new page. Font size, answer boxes and
 * spacing are never shrunk, and no question is dropped.
 */
export const OVERFLOW_POLICY = Object.freeze({
  rule: 'minimums-win-pages-flex',
  onOverflow: 'new-page',
  shrinkToFit: false,
  dropQuestions: false,
} as const);

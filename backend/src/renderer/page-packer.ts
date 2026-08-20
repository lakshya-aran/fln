/**
 * Greedy page packer — turns a flat list of rendered questions into pages,
 * respecting each template's `heightHintMm` and the A4 page budget.
 *
 * Per docs/template-master-style.md §7 "Packing rule":
 *
 *   1. Read each template's heightHint (mm).
 *   2. Walk the question list in order, accumulating heights.
 *   3. When adding the next template would push the page over the budget,
 *      start a new page.
 *   4. Last page can hold fewer templates.
 *
 *   Page geometry (fixed):
 *     A4 sheet = 210 × 297 mm
 *     Page header   = 32 mm
 *     Page footer   = 12 mm
 *     Page budget   = 297 - 32 - 12 = 253 mm
 *     Class 1-2 target = 4 templates per page
 *     Class 3-4 target = 5 templates per page
 */

export const PAGE_HEIGHT_MM = 297;
export const HEADER_HEIGHT_MM = 32;
export const FOOTER_HEIGHT_MM = 12;
export const PAGE_BUDGET_MM = PAGE_HEIGHT_MM - HEADER_HEIGHT_MM - FOOTER_HEIGHT_MM;  // 253

export interface PackedQuestion {
  /** Question number in the rendered paper (1-based, continuous across pages). */
  seq: number;
  /** The template's rendered HTML, ready to drop into a `.q` block. */
  html: string;
  /** Vertical space the template claims. Used for packing math. */
  heightHintMm: number;
  /** Optional modifier class (`q--match` for match templates). */
  modifierClass?: string;
}

export interface PackedPage {
  /** 1-based page number. */
  pageNumber: number;
  /** The questions on this page, in order. */
  questions: PackedQuestion[];
}

/**
 * Pack a list of questions into pages. The packer is greedy — once a
 * question doesn't fit, it goes on the next page.
 *
 * Returns at least one page. Even an empty input returns one empty page
 * (renderer can choose to suppress it).
 */
export function packPages(questions: PackedQuestion[]): PackedPage[] {
  if (questions.length === 0) {
    return [{ pageNumber: 1, questions: [] }];
  }

  const pages: PackedPage[] = [];
  let current: PackedQuestion[] = [];
  let currentHeight = 0;

  for (const q of questions) {
    if (currentHeight + q.heightHintMm > PAGE_BUDGET_MM && current.length > 0) {
      // Push current page, start a new one.
      pages.push({ pageNumber: pages.length + 1, questions: current });
      current = [];
      currentHeight = 0;
    }
    current.push(q);
    currentHeight += q.heightHintMm;
  }

  // Flush the last page (even if empty — caller decides to drop).
  if (current.length > 0 || pages.length === 0) {
    pages.push({ pageNumber: pages.length + 1, questions: current });
  }

  return pages;
}

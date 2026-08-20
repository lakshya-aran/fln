/**
 * Paper renderer — orchestrator.
 *
 *   1. Read the paper doc from MongoDB.
 *   2. For each question in the paper, look up its template class
 *      via the registry, call render() to get HTML + heightHint.
 *   3. Pack into pages (greedy by heightHint).
 *   4. Build the final HTML document via html-builder.
 *
 * Phase 1 inputs are static (no MongoDB fetch yet) — the renderer accepts a
 * `PaperInput` shape that the route handler builds from MongoDB later.
 * Same shape works in browser context.
 */
import { getTemplate } from '../templates/registry';
import { defaultSvgLibrary, SvgLibrary } from '../templates/svg-library';
import { TemplateData } from '../templates/base';
import { packPages, PackedPage, PackedQuestion } from './page-packer';
import { buildPaperHtml, PaperMeta } from './html-builder';

/** What the route handler passes in after fetching from MongoDB. */
export interface PaperInput {
  /** Paper metadata for the master chassis (header + footer). */
  meta: PaperMeta;
  /** Question records in render order. The renderer fetches templates by templateId. */
  questions: TemplateData[];
}

/**
 * Render a full paper to a complete HTML document string.
 *
 * Returns:
 *   - `html`: the full `<!DOCTYPE html>...</html>` document
 *   - `pages`: the packed-page structure (useful for diagnostics / audit)
 *   - `metrics`: counts (templates, pages, total question count)
 */
export function renderPaper(input: PaperInput, opts?: { svgLibrary?: SvgLibrary }): {
  html: string;
  pages: PackedPage[];
  metrics: { questionCount: number; pageCount: number };
} {
  const svgLibrary = opts?.svgLibrary ?? defaultSvgLibrary();

  // 1. Render each question through its template.
  const packed: PackedQuestion[] = input.questions.map((q, idx) => {
    const tpl = getTemplate(q.templateId);
    const rendered = tpl.render(q, {
      seq: idx + 1,
      classNumber: input.meta.classNumber,
      svgLibrary,
      locale: 'en',
    });
    return {
      seq: rendered.seq,
      html: rendered.html,
      heightHintMm: rendered.heightHintMm,
      modifierClass: rendered.modifierClass,
    };
  });
  const pages = packPages(packed);

  // 3. Build the HTML document.
  const html = buildPaperHtml(input.meta, pages);

  return {
    html,
    pages,
    metrics: {
      questionCount: packed.length,
      pageCount: pages.length,
    },
  };
}

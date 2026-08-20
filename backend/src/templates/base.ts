/**
 * Base class for all FLN question templates.
 *
 * A template takes the question data from MongoDB (templateId, payload, marks, etc.)
 * and produces a self-contained HTML fragment that fits inside one `.q` block.
 *
 * The renderer in `paper-renderer.ts` composes many `.q` fragments into pages,
 * each wrapped by the master chassis (`html-builder.ts`).
 *
 * The 52 templates in `docs/52-question-templates.md` map to subclasses of this.
 */
export interface TemplateData {
  templateId: string;        // e.g. "T07_Counting"
  qid: string;               // MongoDB question id (e.g. "q_class1_L5_001")
  concept: string;           // bucket name from docs/93-levels-by-concept.md
  marks: number;             // weight in scoring
  payload: any;              // template-specific payload (see each subclass)
}

/**
 * Rendered HTML for one question. The renderer takes these and assembles
 * them into a complete A4 page.
 */
export interface RenderedQuestion {
  /** Question number as it should appear in the badge (1, 2, ...). */
  seq: number;
  /** The HTML fragment — already includes `.q-head`, `.q-body`, etc. */
  html: string;
  /** Vertical space the template claims on the page (per docs/52-question-templates.md §6.5). */
  heightHintMm: number;
  /** Modifier class if this template is a match template (adds `.q--match`). */
  modifierClass?: string;
}

/**
 * The base class. Subclasses override `render()` to produce their question HTML.
 *
 * The convention is: every template's `.ts` file declares one named class that
 * extends this. The class name is the templateId; the registry imports the class
 * and registers it under that key.
 */
export abstract class BaseTemplate {
  /** The template id (e.g. "T07_Counting"). Subclasses hard-code this. */
  abstract readonly templateId: string;

  /** How tall the rendered question is on the page, in mm (Class 1–2 default). */
  abstract readonly heightHintMm: number;

  /**
   * Optional modifier class. Match templates add `.q--match` so the master chassis
   * reserves the 100 mm horizontal strip and 65×65 mm SVG containers.
   */
  readonly modifierClass?: string;

  /** Render the template's question HTML given the MongoDB payload. */
  abstract render(data: TemplateData, opts: RenderOptions): RenderedQuestion;
}

export interface RenderOptions {
  /** 1-based sequence number for the question's badge. */
  seq: number;
  /** Which class-size preset the paper is using. Toggles the body class. */
  classNumber: 1 | 2 | 3 | 4;
  /** SVG-asset lookup. Templates fetch their SVG markup from this object by key. */
  svgLibrary: import('./svg-library').SvgLibrary;
  /** Locale for translated text. */
  locale: string;
}

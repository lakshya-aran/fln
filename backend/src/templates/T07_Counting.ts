/**
 * T07 · Counting
 * Per docs/52-question-templates.md §T07 and docs/template-master-style.md §6.5.
 *
 *   Q1  Count the {g}.     [ {box} ]
 *
 * Payload shape (from MongoDB):
 *   {
 *     glyph: '★' | '▲' | '●' | '■' | '⬤' | ...,   // logical glyph key
 *     count: number,                              // how many to render
 *     answer: number,                             // the correct answer
 *   }
 *
 * SVG assets come from the `svgLibrary` map passed by the renderer.
 * Keys: 'star', 'triangle', 'circle', 'square' (logical names — the renderer
 * has them inlined as outlined SVGs because we're not relying on emoji glyphs
 * for print output).
 */
import { BaseTemplate, RenderOptions, TemplateData, RenderedQuestion } from './base';

interface CountingPayload {
  glyph: string;             // logical name: 'star' | 'triangle' | 'circle' | 'square' | ...
  count: number;
  answer: number;
}

export class T07_Counting extends BaseTemplate {
  readonly templateId = 'T07_Counting';
  readonly heightHintMm = 40;

  render(data: TemplateData, opts: RenderOptions): RenderedQuestion {
    const payload = data.payload as CountingPayload;

    // Render N glyphs in a row. The renderer provides outlined SVGs.
    const glyphs: string[] = [];
    for (let i = 0; i < payload.count; i++) {
      const svg = opts.svgLibrary.get(payload.glyph);
      if (!svg) {
        // Fallback: empty slot if asset is missing. Real renderer should warn.
        glyphs.push(`<span class="svg-slot" style="width:14mm;height:14mm;"></span>`);
      } else {
        glyphs.push(`<span class="svg-slot" style="width:14mm;height:14mm;">${svg}</span>`);
      }
    }

    const html = `
<div class="q" style="min-height: ${this.heightHintMm}mm;">
  <div class="q-head">
    <span class="q-num">${opts.seq}</span>
    <span class="q-title">Count and write</span>
    <span class="q-marks">[${data.marks} ${data.marks === 1 ? 'mark' : 'marks'}]</span>
  </div>
  <div class="q-body">
    <div class="activity">
      <p class="prompt-row">How many ${payload.glyph === 'star' ? 'stars' : payload.glyph === 'triangle' ? 'triangles' : payload.glyph === 'circle' ? 'circles' : payload.glyph === 'square' ? 'squares' : payload.glyph + 's'}?</p>
      <div class="svg-row--count">
        ${glyphs.join('\n        ')}
      </div>
      <div class="answer-row" style="margin-top: 10px;">
        <span class="answer-hint">Answer =</span>
        <span class="answer-box" aria-label="answer"></span>
      </div>
    </div>
  </div>
</div>`;

    return {
      seq: opts.seq,
      html,
      heightHintMm: this.heightHintMm,
    };
  }
}

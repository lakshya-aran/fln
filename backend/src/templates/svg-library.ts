/**
 * Outlined, monochromatic SVG library used by templates.
 *
 * Real production: SVGs come from a CDN / S3 / MongoDB asset library keyed
 * by `glyph` names. For phase 1 we hard-code 4 simple shapes that are enough
 * for T07 (Counting) + the match-template T03 (preview).
 *
 * Every SVG is line-art only — `fill="none"`, `stroke="#000"`. Master spec
 * §12 ("SVG Asset Rules") requires monochromatic + outlined + transparent
 * background + low ink coverage.
 */
export interface SvgLibrary {
  /** Logical-name → inline SVG markup (already sized at viewBox 0 0 24 24). */
  get(name: string): string | undefined;
  /** List of available glyph names. */
  list(): string[];
}

/** Default 4-glyph library — enough for the templates we ship in phase 1. */
export function defaultSvgLibrary(): SvgLibrary {
  const map = new Map<string, string>([
    ['star', `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="12,2 15.1,8.6 22,9.3 16.8,14.1 18.5,21 12,17.3 5.5,21 7.2,14.1 2,9.3 8.9,8.6"
                 fill="none" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/>
      </svg>`],
    ['circle', `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="6" fill="none" stroke="#000" stroke-width="1.4"/>
      </svg>`],
    ['triangle', `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="12,3 22,21 2,21" fill="none" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/>
      </svg>`],
    ['square', `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="6" y="6" width="12" height="12" fill="none" stroke="#000" stroke-width="1.4"/>
      </svg>`],
  ]);

  return {
    get(name) { return map.get(name); },
    list() { return Array.from(map.keys()); },
  };
}

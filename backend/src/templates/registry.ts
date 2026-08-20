/**
 * Template registry — single source of truth for all 52 templates.
 *
 * New templates add an entry here and a corresponding class file.
 * The renderer fetches the class by templateId and calls `render()`.
 */
import { BaseTemplate } from './base';
import { T07_Counting } from './T07_Counting';
// Future templates:
// import { T03_OneToOne } from './T03_OneToOne';
// import { T12_NumeralRecognition } from './T12_NumeralRecognition';

const REGISTRY: Map<string, BaseTemplate> = new Map();

function register(template: BaseTemplate): void {
  if (REGISTRY.has(template.templateId)) {
    throw new Error(`Template id collision: ${template.templateId}`);
  }
  REGISTRY.set(template.templateId, template);
}

// Phase 1: only T07. Subsequent commits add T03, T12, T23, ...
register(new T07_Counting());

/** Look up a template by its MongoDB templateId. Throws if not registered. */
export function getTemplate(templateId: string): BaseTemplate {
  const t = REGISTRY.get(templateId);
  if (!t) {
    throw new Error(`No template registered for id: ${templateId}. Add it in templates/registry.ts.`);
  }
  return t;
}

/** All registered template ids. Useful for diagnostics + admin UI. */
export function listTemplates(): string[] {
  return Array.from(REGISTRY.keys()).sort();
}

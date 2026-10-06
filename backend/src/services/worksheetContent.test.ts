/**
 * Tests for resolveWorksheetContent (issue #600).
 *
 * Plain-script convention (node:assert, no runner). Run with:
 *   npm run test:worksheet-content --workspace @fln/backend
 *
 * The resolver is called for real; only the template lookup on dbStore is
 * stubbed with fixture rows, so no Mongo or db.json is needed. Artwork comes
 * from the real SVG manifest under frontend/public/assets.
 */
import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';

// svgAssetCatalog falls back to __dirname, which is undefined under ESM
// (issue #670). Pointing it at the assets folder explicitly avoids that path.
const here = path.dirname(fileURLToPath(import.meta.url));
process.env.WORKSHEET_ASSETS_DIR ||= path.resolve(here, '../../../frontend/public/worksheets');

const { dbStore } = await import('../db');
const { resolveWorksheetContent } = await import('./worksheetContent');
const { isKnownThemeId } = await import('../svgAssetCatalog');

type Fixture = { id: string; conceptId: string; assessmentMode: 'written' | 'observed' | 'both'; svgThemeIds: string[] };

const fixtures: Fixture[] = [
  { id: 'QT_S1.1_c', conceptId: 'S1.1', assessmentMode: 'written', svgThemeIds: ['fruits'] },
  { id: 'QT_S1.1_a', conceptId: 'S1.1', assessmentMode: 'both', svgThemeIds: ['animals'] },
  { id: 'QT_S1.1_b', conceptId: 'S1.1', assessmentMode: 'observed', svgThemeIds: ['fruits'] },
  { id: 'QT_S1.1_d', conceptId: 'S1.1', assessmentMode: 'written', svgThemeIds: [] },
  { id: 'QT_S3.4_a', conceptId: 'S3.4', assessmentMode: 'written', svgThemeIds: ['no-such-theme'] },
];

(dbStore as any).getQuestionTemplatesByConcept = async (conceptId: string) =>
  fixtures.filter(t => t.conceptId === conceptId).map(t => ({ ...t }));

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (error: any) {
    failed++;
    console.error(`  FAIL  ${name}\n        ${error?.message || error}`);
  }
}

assert.ok(isKnownThemeId('fruits'), 'fixture theme "fruits" must exist in the SVG manifest');

await test('excludes observed-only templates and keeps written + both, sorted by id', async () => {
  const out = await resolveWorksheetContent(['S1.1'], 10, 'paper-1');
  const ids = out.concepts[0].questions.map(q => q.template.id);
  assert.deepStrictEqual(ids, ['QT_S1.1_a', 'QT_S1.1_c', 'QT_S1.1_d']);
  assert.strictEqual(out.totalQuestions, 3);
});

await test('caps each concept at questionsPerConcept', async () => {
  const out = await resolveWorksheetContent(['S1.1', 'S3.4'], 1, 'paper-1');
  assert.deepStrictEqual(out.concepts.map(c => c.questions.length), [1, 1]);
  assert.strictEqual(out.totalQuestions, 2);
});

await test('drops blank and duplicate concept ids, keeping caller order', async () => {
  const out = await resolveWorksheetContent([' S3.4 ', '', 'S1.1', 'S3.4'], 1, 'paper-1');
  assert.deepStrictEqual(out.concepts.map(c => c.conceptId), ['S3.4', 'S1.1']);
});

await test('rejects a questionsPerConcept that is not a positive integer', async () => {
  for (const bad of [0, -1, 1.5, NaN]) {
    await assert.rejects(() => resolveWorksheetContent(['S1.1'], bad), /positive integer/);
  }
});

await test('an unknown concept returns an empty list, not an error', async () => {
  const out = await resolveWorksheetContent(['NOPE'], 3, 'paper-1');
  assert.deepStrictEqual(out, { concepts: [{ conceptId: 'NOPE', questions: [] }], totalQuestions: 0 });
});

await test('artwork comes from the manifest; text-only and unknown themes get null', async () => {
  const out = await resolveWorksheetContent(['S1.1', 'S3.4'], 10, 'paper-1');
  const byId = new Map(out.concepts.flatMap(c => c.questions).map(q => [q.template.id, q]));
  assert.ok(byId.get('QT_S1.1_c')!.artwork?.file, 'known theme should resolve to a variant');
  assert.strictEqual(byId.get('QT_S1.1_d')!.artwork, null);
  assert.strictEqual(byId.get('QT_S3.4_a')!.artwork, null);
  assert.strictEqual(byId.get('QT_S1.1_c')!.seed, 'paper-1:QT_S1.1_c');
});

await test('the same paperSeed picks the same artwork every time', async () => {
  const a = await resolveWorksheetContent(['S1.1'], 10, 'paper-42');
  const b = await resolveWorksheetContent(['S1.1'], 10, 'paper-42');
  assert.deepStrictEqual(
    a.concepts[0].questions.map(q => q.artwork),
    b.concepts[0].questions.map(q => q.artwork),
  );
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

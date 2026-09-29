/**
 * Tests for POST /api/worksheets/generate-concept-batch (issue #601).
 *
 * Plain-script convention (node:assert, no runner). Run with:
 *   npm run test:concept-batch --workspace @fln/backend
 *
 * The real route is mounted on a throwaway Express app and called over HTTP
 * with real signed tokens. Only two dbStore lookups are stubbed (users and
 * question templates), so no Mongo or db.json is needed.
 */
import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import type { AddressInfo } from 'net';

// svgAssetCatalog falls back to __dirname, which is undefined under ESM
// (issue #670). Pointing it at the assets folder explicitly avoids that path.
const here = path.dirname(fileURLToPath(import.meta.url));
process.env.WORKSHEET_ASSETS_DIR ||= path.resolve(here, '../../../frontend/public/worksheets');

const { default: express } = await import('express');
const { default: jwt } = await import('jsonwebtoken');
const { dbStore, UserRole } = await import('../db');
const { JWT_SECRET } = await import('../auth');
const { registerWorksheetRoutes } = await import('./worksheets');

const users: Record<string, any> = {
  'teacher@test.fln': { id: 'U1', email: 'teacher@test.fln', role: UserRole.TEACHER, schoolId: 'SCH1' },
  'banned@test.fln': { id: 'U2', email: 'banned@test.fln', role: UserRole.TEACHER, schoolId: 'SCH1', isBanned: true },
};
(dbStore as any).getUserSync = (email: string) => users[email] ?? null;

const templates = [
  { id: 'QT_S1.1_a', conceptId: 'S1.1', assessmentMode: 'written', svgThemeIds: ['fruits'] },
  { id: 'QT_S1.1_b', conceptId: 'S1.1', assessmentMode: 'both', svgThemeIds: [] },
  { id: 'QT_S2.1_a', conceptId: 'S2.1', assessmentMode: 'observed', svgThemeIds: ['fruits'] },
];
(dbStore as any).getQuestionTemplatesByConcept = async (conceptId: string) =>
  templates.filter(t => t.conceptId === conceptId).map(t => ({ ...t }));

// Any write would mean the route persisted something; it must not.
for (const write of ['addWorksheet', 'updateWorksheet', 'saveWorksheets']) {
  (dbStore as any)[write] = async () => { throw new Error(`route must not call dbStore.${write}`); };
}

const app = express();
app.use(express.json());
registerWorksheetRoutes(app);
const server = app.listen(0);
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

const token = (email: string) => jwt.sign({ email }, JWT_SECRET);
const valid = { conceptIds: ['S1.1'], questionsPerConcept: 2, className: 'Class 2', section: 'A' };

async function post(body: unknown, email?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (email) headers.Authorization = `Bearer ${token(email)}`;
  const res = await fetch(`${base}/api/worksheets/generate-concept-batch`, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() as any };
}

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

await test('no token -> 401', async () => {
  assert.strictEqual((await post(valid)).status, 401);
});

await test('a token for a user who does not exist -> 401', async () => {
  assert.strictEqual((await post(valid, 'ghost@test.fln')).status, 401);
});

await test('a banned teacher -> 403', async () => {
  assert.strictEqual((await post(valid, 'banned@test.fln')).status, 403);
});

await test('bad input -> 400', async () => {
  const cases: unknown[] = [
    { ...valid, conceptIds: undefined },
    { ...valid, conceptIds: [] },
    { ...valid, conceptIds: [42] },
    { ...valid, questionsPerConcept: 0 },
    { ...valid, questionsPerConcept: 1.5 },
    { ...valid, questionsPerConcept: '2' },
    { ...valid, className: '' },
    { ...valid, section: undefined },
    { ...valid, paperSeed: 7 },
  ];
  for (const body of cases) {
    const { status } = await post(body, 'teacher@test.fln');
    assert.strictEqual(status, 400, `expected 400 for ${JSON.stringify(body)}, got ${status}`);
  }
});

await test('concepts with only observed or no templates -> 404', async () => {
  assert.strictEqual((await post({ ...valid, conceptIds: ['S2.1', 'NOPE'] }, 'teacher@test.fln')).status, 404);
});

await test('valid request returns the resolved questions and a null pdfUrl', async () => {
  const { status, body } = await post({ ...valid, paperSeed: 'seed-1' }, 'teacher@test.fln');
  assert.strictEqual(status, 200);
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.pdfUrl, null);
  assert.strictEqual(body.paperSeed, 'seed-1');
  assert.strictEqual(body.totalQuestions, 2);
  assert.deepStrictEqual(body.concepts[0].questions.map((q: any) => q.template.id), ['QT_S1.1_a', 'QT_S1.1_b']);
  assert.ok(body.concepts[0].questions[0].artwork?.file, 'known theme should resolve to artwork');
});

await test('without paperSeed the server picks one and echoes it; resending it gives the same paper', async () => {
  const first = await post(valid, 'teacher@test.fln');
  assert.ok(typeof first.body.paperSeed === 'string' && first.body.paperSeed.length > 0);
  const again = await post({ ...valid, paperSeed: first.body.paperSeed }, 'teacher@test.fln');
  assert.deepStrictEqual(again.body.concepts, first.body.concepts);
});

server.close();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

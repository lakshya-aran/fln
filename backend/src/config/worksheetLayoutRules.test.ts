/**
 * Tests for worksheetLayoutRules (issue #603).
 *
 * Plain-script convention (node:assert, no runner). Run with:
 *   npm run test:layout-rules --workspace @fln/backend
 *
 * Guards the values renderers rely on: a later edit that lowers a minimum
 * below the agreed floor, or makes a policy mutable, fails here.
 */
import assert from 'node:assert';
import {
  MIN_FONT_SIZE_PT,
  MIN_ANSWER_BOX_HEIGHT_PT,
  QUESTIONS_PER_PAGE_MAX,
  BLOCK_RULES,
  OVERFLOW_POLICY,
} from './worksheetLayoutRules';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (error: any) {
    failed++;
    console.error(`  FAIL  ${name}\n        ${error?.message || error}`);
  }
}

test('minimums are at least the agreed floors (18pt font, 24pt answer box)', () => {
  assert.ok(MIN_FONT_SIZE_PT >= 18, `MIN_FONT_SIZE_PT is ${MIN_FONT_SIZE_PT}`);
  assert.ok(MIN_ANSWER_BOX_HEIGHT_PT >= 24, `MIN_ANSWER_BOX_HEIGHT_PT is ${MIN_ANSWER_BOX_HEIGHT_PT}`);
});

test('QUESTIONS_PER_PAGE_MAX is a positive integer', () => {
  assert.ok(Number.isInteger(QUESTIONS_PER_PAGE_MAX) && QUESTIONS_PER_PAGE_MAX > 0);
});

test('a full page of questions at the minimums fits on A4', () => {
  // Each question needs at least one line of text and one answer box.
  const A4_HEIGHT_PT = 841.89;
  const perQuestion = MIN_FONT_SIZE_PT * 1.2 + MIN_ANSWER_BOX_HEIGHT_PT;
  assert.ok(QUESTIONS_PER_PAGE_MAX * perQuestion < A4_HEIGHT_PT);
});

test('blocks hold one concept and never split across pages', () => {
  assert.strictEqual(BLOCK_RULES.oneConceptPerBlock, true);
  assert.strictEqual(BLOCK_RULES.breakInside, 'avoid');
});

test('overflow adds a page; it never shrinks or drops content', () => {
  assert.strictEqual(OVERFLOW_POLICY.onOverflow, 'new-page');
  assert.strictEqual(OVERFLOW_POLICY.shrinkToFit, false);
  assert.strictEqual(OVERFLOW_POLICY.dropQuestions, false);
});

test('the rule objects cannot be changed at runtime', () => {
  assert.ok(Object.isFrozen(BLOCK_RULES));
  assert.ok(Object.isFrozen(OVERFLOW_POLICY));
  assert.throws(() => { 'use strict'; (OVERFLOW_POLICY as any).shrinkToFit = true; }, TypeError);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

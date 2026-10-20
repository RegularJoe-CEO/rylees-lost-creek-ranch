'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Review = require('../module3-review.js');

test('review has ten correct, distinct, rotated multiple-choice questions', () => {
  const positions = [0, 0, 0];
  for (let seed = 1; seed <=  ninety(); seed++) {
    for (let i = 0; i < Review.TOTAL; i++) {
      const q = Review.questionAt(i, seed);
      assert.equal(q.choices.length, 3);
      assert.equal(new Set(q.choices).size, 3);
      assert.ok(q.choices.includes(q.answer));
      assert.ok(q.work.includes('<b>'));
      positions[q.choices.indexOf(q.answer)]++;
    }
  }
  assert.ok(positions.every(n => n > 250), positions);
});

function ninety() { return 90; }

test('later review includes four-digit multiplication and two multi-step stories', () => {
  const questions = Array.from({ length: Review.TOTAL }, (_, i) => Review.questionAt(i, 417));
  assert.equal(questions.filter(q => q.skill === 'story').length, 2);
  assert.ok(questions.slice(6).some(q => /\d,\d{3} × \d/.test(q.prompt)));
  assert.ok(questions.filter(q => q.skill === 'story').every(q => q.work.includes('Second step')));
});

test('partial products and standard steps equal the product', () => {
  for (const n of [46, 327, 1204, 2987]) {
    for (const factor of [3, 4, 7, 8]) {
      assert.equal(Review.partials(n, factor).reduce((a, b) => a + b, 0), n * factor);
      assert.ok(Review.standardSteps(n, factor).includes('The') === false);
    }
  }
});

test('normalization keeps bounded review progress', () => {
  const r = Review.normalize({ resetVersion: Review.RESET_VERSION, completed: 2, best: 8, active: { seed: 7, index: 4, correct: 3, firstTry: 2, wrong: 1, solved: true, helped: false, results: [{ skill: 'partial', independent: true }] } });
  assert.equal(r.best, 8);
  assert.equal(r.active.index, 4);
  assert.equal(r.active.results.length, 1);
  assert.equal(Review.normalize({ best: 99, active: { seed: 2, index: 99 } }).active, null);
});

test('older review attempts reset once without touching completed history', () => {
  const r = Review.normalize({ completed: 3, best: 7, active: { seed: 2, index: 2 } });
  assert.equal(r.active, null);
  assert.equal(r.completed, 3);
  assert.equal(r.best, 7);
  assert.equal(r.resetVersion, Review.RESET_VERSION);
});

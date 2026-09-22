'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Module2 = require('../module2.js');
const Progress = require('../progress.js');

function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

test('all eight published Module 2 lessons and one next-module warm-up are playable', () => {
  assert.equal(Module2.lessons.length, 9);
  const rng = seeded(11983);
  for (let lesson = 1; lesson <= 9; lesson++) {
    for (let n = 0; n < 300; n++) {
      const q = Module2.makeQuestion(lesson, rng);
      assert.equal(q.lesson, lesson);
      assert.ok(q.prompt && q.hint && q.explanation && q.model);
      assert.ok(Number.isSafeInteger(q.answer) && q.answer >= 0);
      assert.equal(q.choices.length, 4);
      assert.equal(new Set(q.choices).size, 4);
      assert.ok(q.choices.includes(q.answer));
      assert.ok(q.choices.every(v => Number.isSafeInteger(v) && v >= 0));
    }
  }
});

test('length, mass, and capacity convert whole and mixed metric units', () => {
  const units = ['m', 'g', 'mL'];
  for (let lesson = 1; lesson <= 3; lesson++) {
    const q = Module2.makeQuestion(lesson, () => 0);
    assert.equal(q.answer, 2001);
    assert.equal(q.unit, units[lesson - 1]);
    assert.equal(q.model.factor, 1000);
  }
});

test('Module 2 measurement problems convert larger units into smaller units', () => {
  const rng = seeded(8824);
  for (let lesson = 1; lesson <= 3; lesson++) {
    for (let n = 0; n < 500; n++) {
      const q = Module2.makeQuestion(lesson, rng);
      assert.ok(['m', 'cm', 'mm', 'g', 'mg', 'L', 'mL'].includes(q.unit), q.prompt);
      assert.doesNotMatch(q.prompt, /How many whole (?:km|kg|kL|L|m|g|cm) are in that amount/);
      assert.doesNotMatch(q.prompt, /sketchs/);
    }
  }
});

test('smaller metric pairs appear with the correct conversion factors', () => {
  const rng = seeded(471);
  const seen = new Set();
  for (let lesson = 1; lesson <= 3; lesson++) {
    for (let n = 0; n < 200; n++) {
      const q = Module2.makeQuestion(lesson, rng);
      if (q.model.type === 'conversion') seen.add(`${q.model.big}:${q.model.small}:${q.model.factor}`);
    }
  }
  for (const pair of ['m:cm:100', 'cm:mm:10', 'g:mg:1000', 'kL:L:1000']) assert.ok(seen.has(pair), pair);
});

test('two-step measurement solutions are arithmetically consistent', () => {
  const rng = seeded(2345);
  for (let n = 0; n < 300; n++) {
    const q = Module2.makeQuestion(5, rng);
    const [start, used, added] = [...q.prompt.matchAll(/\d[\d,]*/g)].map(m => Number(m[0].replaceAll(',', '')));
    assert.equal(q.answer, q.prompt.includes('then adds') ? start * 1000 - used + added : start * 1000 - used - added);
  }
});

test('multiple-choice keys move around rather than staying on the left', () => {
  const positions = [0, 0, 0, 0], rng = seeded(5813);
  for (let i = 0; i < 600; i++) {
    const q = Module2.makeQuestion((i % 9) + 1, rng);
    positions[q.choices.indexOf(q.answer)]++;
  }
  assert.ok(positions.every(n => n > 95), String(positions));
});

test('the existing save retains stars, old chapters, and the new parent lesson', () => {
  const data = {};
  const storage = { getItem: k => data[k] || null, setItem: (k,v) => { data[k] = v; } };
  const state = Progress.fresh();
  state.stars = 37;
  state.jobs = 8;
  state.chapters.bundles.missions['pack-ten'] = { completed: true, index: 4, taught: true, question: null };
  state.metric.lesson = 5;
  state.metric.active = { lesson: 5, index: 2, q: Module2.makeQuestion(5, seeded(77)), attempts: 0, helped: false, solved: false, showSteps: true };
  Progress.save(storage, state);
  const reloaded = Progress.load(storage);
  assert.equal(reloaded.stars, 37);
  assert.equal(reloaded.jobs, 8);
  assert.equal(reloaded.chapters.bundles.missions['pack-ten'].completed, true);
  assert.equal(reloaded.metric.lesson, 5);
  assert.deepEqual(reloaded.metric.active.q, state.metric.active.q);
  assert.equal(reloaded.metric.active.showSteps, true);
  assert.equal(Module2.normalize({ lesson: 99, completed: { 1: -100 }, active: { q: { model: { type: 'table', rows: null } } } }).active, null);
});

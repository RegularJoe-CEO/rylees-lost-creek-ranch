'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Fishing = require('../fishing.js');
require('../module2.js');
const Progress = require('../progress.js');

test('all four Module 3 spots generate correct, distinct choices across a broad range', () => {
  for (const topic of Fishing.topics) {
    const positions = [0, 0, 0];
    for (let seed = 0; seed < 180; seed++) {
      const q = Fishing.makeMathQuestion(topic.id, seed, seed);
      assert.equal(q.choices.length, 3);
      assert.equal(new Set(q.choices).size, 3);
      assert.ok(q.choices.includes(q.correct));
      positions[q.choices.indexOf(q.correct)]++;
      assert.ok(q.hint && q.prompt);
      const values = [...q.prompt.matchAll(/\d+/g)].map(m => Number(m[0]));
      if (topic.id === 'area') {
        const [a, b] = values;
        assert.equal(q.correct, q.prompt.includes('area') ? a * b : 2 * (a + b));
      } else if (topic.id === 'products') {
        const [boxes, hooks] = values;
        assert.equal(q.correct, boxes * hooks);
      } else if (topic.id === 'division') {
        const [total, cups] = values;
        const quotient = Math.floor(q.correct / 10), remainder = q.correct % 10;
        assert.equal(quotient * cups + remainder, total);
        assert.ok(remainder < cups);
      } else {
        const [marks, tags] = values;
        assert.equal(q.correct, marks * tags);
      }
    }
    assert.ok(positions.every(count => count === 60), `${topic.id}: ${positions}`);
  }
});

test('creek stories have a findable answer, distinct choices, and word parts', () => {
  assert.ok(Fishing.stories.length >= 6);
  for (const story of Fishing.stories) {
    assert.ok(story.text.includes(story.word), story.word);
    assert.equal(new Set(story.choices).size, 3);
    assert.ok(story.text.includes(story.evidence), story.title);
    assert.equal(story.chunks.replaceAll(' · ', ''), story.word);
    assert.equal(new Set([story.chunks, ...story.distractors]).size, 3);
  }
});

test('new fishing trip resumes without touching older stars, jobs, or Module 2', () => {
  const saved = {};
  const storage = { getItem: k => saved[k] || null, setItem: (k,v) => { saved[k] = v; } };
  const state = Progress.fresh();
  state.stars = 19; state.jobs = 4; state.metric.lesson = 5;
  state.fishing = Fishing.fresh();
  state.fishing.active = { stage: 'math', caught: 1, story: 2, spot: 'dock', task: Fishing.makeMathQuestion('products', 7, 1), reel: 0, help: false };
  Progress.save(storage, state);
  const loaded = Progress.load(storage);
  assert.equal(loaded.stars, 19);
  assert.equal(loaded.jobs, 4);
  assert.equal(loaded.metric.lesson, 5);
  assert.deepEqual(loaded.fishing.active, state.fishing.active);
  assert.equal(Fishing.normalize({ focus: 'fake', catches: -5, active: { stage: 'math', caught: 2, story: 99 } }).active, null);
});

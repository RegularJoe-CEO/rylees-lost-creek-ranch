'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../math.js');
const P = require('../progress.js');
const C = require('../chapters.js');
function seeded(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const storage = initial => {
  const data = { ...initial };
  return { getItem: key => data[key] ?? null, setItem: (key, value) => { data[key] = value; }, data };
};

test('six chapters and 18 missions are registered with stable ids', () => {
  assert.equal(C.list.length, 6);
  assert.equal(C.list.reduce((n, ch) => n + ch.missions.length, 0), 18);
  const ids = C.list.map(ch => ch.id);
  assert.deepEqual(ids, ['bundles', 'neighbors', 'places', 'forms', 'compare', 'round']);
  for (const ch of C.list) {
    assert.ok(ch.scene.includes('.webp'));
    assert.ok(ch.keepsake.title && ch.keepsake.caption);
    assert.ok(ch.checkpoint.skills.length >= 1);
    assert.equal(ch.missions.length, 3);
  }
});

test('bundle pack and unpack conserve quantity for keyboard-equivalent ops', () => {
  const start = M.bundleFrom(13, 2, 1);
  assert.equal(start.total, 133);
  const packed = M.bundlePack(start, 'ones');
  assert.equal(packed.total, 133);
  assert.equal(packed.ones, 3);
  assert.equal(packed.tens, 3);
  const unpacked = M.bundleUnpack(packed, 'tens');
  assert.equal(unpacked.total, 133);
  assert.equal(unpacked.ones, 13);
  const hundreds = M.bundlePack(M.bundleFrom(0, 10, 1), 'tens');
  assert.equal(hundreds.total, 200);
  assert.equal(hundreds.hundreds, 2);
  const noop = M.bundlePack(M.bundleFrom(9, 1, 0), 'ones');
  assert.deepEqual(noop, M.bundleFrom(9, 1, 0));
});

test('templates keep one correct option, stable ids, and seeded variety', () => {
  const templates = ['units', 'times', 'divide', 'value', 'value-zero', 'value-adjacent', 'value-mixup',
    'expanded-sum', 'expanded-words', 'expanded-notation', 'compare-sign', 'compare-order', 'compare-place',
    'round', 'round-neighbors', 'round-apply'];
  const rng = seeded(4242);
  const positions = [0, 0, 0, 0];
  for (const template of templates) {
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 40; i++) {
        const q = M.makeTemplate(template, level, rng);
        assert.ok(q.prompt && q.answer);
        assert.equal(q.options.filter(o => o.correct).length, 1);
        assert.equal(new Set(q.options.map(o => o.text)).size, q.options.length);
        assert.equal(new Set(q.options.map(o => o.id)).size, q.options.length);
        const correct = q.options.find(o => o.correct);
        assert.equal(M.gradeOption(q, correct.id), true);
        assert.equal(M.gradeOption(q, 'nope'), false);
        positions[q.options.findIndex(o => o.correct)]++;
      }
    }
  }
  assert.ok(positions[0] > 200 && positions[1] > 200 && positions[2] > 200, String(positions));
});

test('internal zeros and rounding ties appear in generated tasks', () => {
  const rng = seeded(77);
  let zero = 0, tie = 0, equal = 0;
  for (let i = 0; i < 400; i++) {
    const z = M.makeTemplate('value-zero', 2, rng);
    if (String(z.meta.number).includes('0')) zero++;
    const r = M.makeQuestion('round', 1, rng);
    if (r.meta.number - Math.floor(r.meta.number / r.meta.unit) * r.meta.unit === r.meta.unit / 2) tie++;
    const c = M.makeQuestion('compare', 1, rng);
    if (c.meta.mode === 'sign' && c.meta.values[0] === c.meta.values[1]) equal++;
  }
  assert.ok(zero > 50, 'missing internal zeros: ' + zero);
  assert.ok(tie > 0, 'missing rounding ties');
});

test('v7 migration keeps stars and grandma jobs and is safe to rerun', () => {
  const raw = JSON.stringify({ version: 6, stars: 24, jobs: 3, completed: { fish: 2 }, family: true, skills: { times: { attempts: 4, independent: 2, recent: [true, false] } } });
  const s = storage({ lcr6: raw });
  const first = P.load(s);
  assert.equal(first.stars, 24);
  assert.equal(first.jobs, 3);
  assert.equal(first.completed.fish, 2);
  assert.equal(first.version, 7);
  assert.equal(first.chapters.bundles.status, 'not-started');
  assert.equal(s.data['lcr6.prev'], raw);
  P.save(s, first);
  const second = P.load(s);
  assert.equal(second.stars, 24);
  assert.equal(s.data['lcr6.prev'], raw);
  const again = P.load(s);
  assert.equal(again.jobs, 3);
});

test('malformed chapter fields are not treated as completed', () => {
  const s = storage({ lcr6: JSON.stringify({ version: 7, stars: 3, chapters: { bundles: { status: 'passed', keepsake: 'yes', missions: 'nope' } } }) });
  const state = P.load(s);
  assert.equal(state.chapters.bundles.status, 'not-started');
  assert.equal(state.chapters.bundles.keepsake, false);
});

test('checkpoint pass needs five independent and every required skill', () => {
  const state = P.fresh();
  const fail = P.recordCheck(state, 'neighbors', 6, { times: true, divide: true }, 's1', ['times', 'divide', 'value']);
  assert.equal(fail, false);
  assert.equal(state.chapters.neighbors.status, 'practiced-with-help');
  assert.equal(state.chapters.neighbors.keepsake, false);
  const pass = P.recordCheck(state, 'neighbors', 5, { times: true, divide: true, value: true }, 's2', ['times', 'divide', 'value']);
  assert.equal(pass, true);
  assert.equal(state.chapters.neighbors.status, 'passed');
  assert.equal(state.chapters.neighbors.keepsake, true);
  const remembered = P.recordCheck(state, 'neighbors', 6, { times: true, divide: true, value: true }, 's3', ['times', 'divide', 'value']);
  assert.equal(remembered, true);
  assert.equal(state.chapters.neighbors.status, 'remembered');
});

test('placement does not mark chapters completed', () => {
  const state = P.fresh();
  state.placement.done = true;
  state.placement.recommended = 'places';
  assert.equal(state.chapters.places.status, 'not-started');
  assert.equal(state.chapters.places.keepsake, false);
});

test('interrupted storage still leaves a recoverable previous save', () => {
  const raw = JSON.stringify({ version: 6, stars: 9, jobs: 1 });
  let blocked = false;
  const s = {
    data: { lcr6: raw },
    getItem(k) { return this.data[k] ?? null; },
    setItem(k, v) {
      if (blocked && k === 'lcr6') throw new Error('quota');
      this.data[k] = v;
    }
  };
  const state = P.load(s);
  assert.equal(s.data['lcr6.prev'], raw);
  blocked = true;
  assert.equal(P.save(s, state), false);
  assert.equal(JSON.parse(s.data['lcr6.prev']).stars, 9);
});

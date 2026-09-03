'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../progress.js');
const storage = initial => {
  const data = { ...initial };
  return { getItem: key => data[key] ?? null, setItem: (key, value) => { data[key] = value; }, data };
};
test('keeps old stars without modifying legacy saves', () => {
  const s = storage({ lcr5: '{"stars":42}', lcr3: '{"stars":18,"done":{}}' });
  const state = P.load(s);
  assert.equal(state.stars, 42);
  assert.equal(state.jobs, 0);
  assert.ok(P.save(s, state));
  assert.equal(s.data.lcr5, '{"stars":42}');
  assert.equal(P.load(s).stars, 42);
});
test('progress survives save/reload', () => {
  const s = storage({}), state = P.fresh();
  state.stars = 18; state.jobs = 3; state.completed.fish = 3;
  state.focus = 'next'; state.family = false;
  state.skills.times = { attempts: 2, independent: 1, recent: [true, false] };
  assert.equal(P.save(s, state), true);
  const next = P.load(s);
  assert.equal(next.stars, 18);
  assert.equal(next.jobs, 3);
  assert.equal(next.completed.fish, 3);
  assert.equal(next.focus, 'next');
  assert.equal(next.family, false);
  assert.deepEqual(next.skills.times, state.skills.times);
});
test('malformed saves do not crash the game', () => {
  for (const raw of ['{', 'null', '42', '{"stars":-10}', '{"stars":"oops","jobs":1e90,"skills":{"times":{"recent":"bad"}}}']) {
    const state = P.load(storage({ lcr6: raw }));
    assert.equal(state.stars, 0);
    assert.ok(state.skills && state.recent);
  }
});
test('storage failure allows play and reports that saving failed', () => {
  const s = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('quota'); } };
  assert.deepEqual(P.load(s), P.fresh());
  assert.equal(P.save(s, P.fresh()), false);
});
test('persisted numeric counters and skill windows are bounded', () => {
  const s = storage({ lcr6: JSON.stringify({ stars: 1000000000, skills: { times: { attempts: 4, independent: 100, recent: Array(100).fill(true) } }, completed: { fish: -1 } }) });
  const state = P.load(s);
  assert.equal(state.stars, 10000000);
  assert.equal(state.skills.times.independent, 4);
  assert.equal(state.skills.times.recent.length, 8);
  assert.equal(state.completed.fish, 0);
});

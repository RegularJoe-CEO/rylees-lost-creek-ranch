'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../math.js');
function seeded(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test('shuffle preserves answers and does not modify the bank', () => {
  const bank = ['correct', 'wrong1', 'wrong2', 'wrong3'];
  const copy = bank.slice(), rng = seeded(817);
  const positions = [0, 0, 0, 0];
  for (let i = 0; i < 10000; i++) {
    const out = M.shuffle(bank, rng);
    assert.deepEqual(out.slice().sort(), bank.slice().sort());
    positions[out.indexOf('correct')]++;
  }
  assert.deepEqual(bank, copy);
  positions.forEach(n => assert.ok(n > 2200 && n < 2800, String(positions)));
});
test('21,000 generated questions have unique choices and exactly one valid key', () => {
  const rng = seeded(6429);
  for (const skill of Object.keys(M.skills)) {
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 1000; i++) {
        const q = M.makeQuestion(skill, level, rng);
        assert.equal(new Set(q.options.map(o => o.text)).size, q.options.length);
        assert.equal(q.options.filter(o => o.correct).length, 1);
        assert.equal(q.options.find(o => o.correct).text, q.answer);
        assert.equal(q.options.length, q.meta.mode === 'sign' ? 3 : 4);
        assert.ok(q.prompt && q.hint && q.explanation);
        assert.ok(!q.options.some(o => /NaN|undefined|Infinity/.test(o.text)));
        const m = q.meta;
        if (skill === 'times') assert.equal(M.parseNumber(q.answer), m.before * 10);
        if (skill === 'divide') assert.equal(M.parseNumber(q.answer), m.before / 10);
        if (skill === 'units') assert.equal(M.parseNumber(q.answer) * 10 ** m.to, m.given * 10 ** m.from);
        if (skill === 'value') assert.equal(M.parseNumber(q.answer), Math.floor(m.number / 10 ** m.power) % 10 * 10 ** m.power);
        if (skill === 'expanded' && m.mode === 0) assert.equal(q.answer.split(' + ').reduce((sum, term) => sum + M.parseNumber(term), 0), m.number);
        if (skill === 'expanded' && m.mode !== 0) assert.equal(M.parseNumber(q.answer), m.number);
        if (skill === 'compare' && m.mode === 'sign') assert.equal(q.answer, m.values[0] < m.values[1] ? '<' : m.values[0] > m.values[1] ? '>' : '=');
        if (skill === 'compare' && m.mode === 'order') {
          const values = q.answer.split(' < ').map(M.parseNumber);
          assert.deepEqual(values, m.values.slice().sort((a, b) => a - b));
        }
        if (skill === 'round') {
          const lower = Math.floor(m.number / m.unit) * m.unit;
          const correct = m.number - lower < m.unit / 2 ? lower : lower + m.unit;
          assert.equal(M.parseNumber(q.answer), correct);
        }
      }
    }
  }
});
test('left-only clicking is not a successful strategy across the generated bank', () => {
  const rng = seeded(91462), positions = [0, 0, 0, 0], examples = new Set();
  for (let i = 0; i < 4000; i++) {
    const q = M.makeQuestion(Object.keys(M.skills)[i % 7], 2, rng);
    positions[q.options.findIndex(o => o.correct)]++;
    examples.add(q.id);
  }
  assert.ok(positions[0] < 1400, 'Left choice wins too often: ' + positions);
  positions.forEach(n => assert.ok(n > 700, 'Missing a correct-answer position: ' + positions));
  assert.ok(examples.size > 2000, 'Insufficient question variety: ' + examples.size);
});
test('seeded question generation is reproducible for every skill', () => {
  for (const skill of Object.keys(M.skills)) {
    const a = seeded(31), b = seeded(31);
    for (let i = 0; i < 10; i++) assert.deepEqual(M.makeQuestion(skill, 2, a), M.makeQuestion(skill, 2, b));
  }
});
test('recent prompts are avoided when alternatives exist', () => {
  const rng = seeded(915);
  const recent = [];
  for (let i = 0; i < 20; i++) {
    const q = M.nextQuestion('times', 1, recent, rng);
    assert.ok(!recent.includes(q.id));
    recent.push(q.id);
  }
});
test('words and expanded forms preserve zero placeholders', () => {
  assert.equal(M.words(0), 'zero');
  assert.equal(M.words(1001), 'one thousand, one');
  assert.equal(M.words(90523), 'ninety thousand, five hundred twenty-three');
  assert.equal(M.words(1000000), 'one million');
  assert.equal(M.expanded(7306), '7,000 + 300 + 6');
  assert.equal(M.notation(7306), '(7 × 1,000) + (3 × 100) + (6 × 1)');
});
test('typed answers accept complete whole numbers, not partial matches', () => {
  for (const [input, expected] of [['500', 500], ['5,000', 5000], [' 500 ', 500], ['0', 0], ['0005', 5]]) assert.equal(M.parseNumber(input), expected);
  for (const input of ['', '5x', '5,00', '5 00', '5.0', 'NaN', 'Infinity', '-5', '5e3', '5,000,', '9007199254740993']) assert.equal(M.parseNumber(input), null, input);
});
test('supported answers earn stars but not independent confidence', () => {
  const state = { stars: 0, skills: {}, recent: [] };
  const q = M.makeQuestion('times', 1, seeded(12));
  M.recordAnswer(state, q, false);
  assert.equal(state.stars, 1);
  assert.equal(state.skills.times.independent, 0);
  assert.equal(M.levelFor(state, 'times'), 1);
  for (let i = 0; i < 5; i++) M.recordAnswer(state, q, true);
  assert.equal(M.levelFor(state, 'times'), 2);
  for (let i = 0; i < 4; i++) M.recordAnswer(state, q, false);
  assert.equal(M.levelFor(state, 'times'), 1);
  assert.equal(state.skills.times.recent.length, 8);
});

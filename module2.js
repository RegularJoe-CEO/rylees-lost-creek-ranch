(function (root) {
  'use strict';
  // Original ranch problems follow the objectives of Bluebonnet Grade 4, Module 2,
  // Edition 1. They are not reproductions of the Succeed workbook.
  const lessons = [
    ['Measure the creek', 'Length in kilometers, meters, centimeters, and millimeters', '4.8A, 4.8B, 4.8C'],
    ['Stock the barn', 'Mass in kilograms, grams, and milligrams', '4.8A, 4.8B, 4.8C'],
    ['Fill the water tank', 'Capacity in kiloliters, liters, and milliliters', '4.8A, 4.8B, 4.8C'],
    ['Match the measurements', 'Compare metric units and place values', '4.8A, 4.8B'],
    ['Plan the ranch trip', 'Solve more than one step with metric measures', '4.8C'],
    ['Follow Grandma’s rule', 'Find outputs from an input-output rule', '4.5B'],
    ['Find the hidden rule', 'Find a rule from input-output pairs', '4.5B'],
    ['Run the supply table', 'Solve a pattern problem using a table', '4.5B'],
    ['Next trail: multiplication', 'A gentle warm-up for the next module', 'Preview only']
  ];
  const groups = [
    { name: 'Length', big: 'km', small: 'm', factor: 1000, object: 'trail', smallObject: 'meters' },
    { name: 'Mass', big: 'kg', small: 'g', factor: 1000, object: 'feed bag', smallObject: 'grams' },
    { name: 'Capacity', big: 'L', small: 'mL', factor: 1000, object: 'water jug', smallObject: 'milliliters' },
    { name: 'Length', big: 'm', small: 'cm', factor: 100, object: 'fence rail' },
    { name: 'Length', big: 'cm', small: 'mm', factor: 10, object: 'ranch sketch' },
    { name: 'Mass', big: 'g', small: 'mg', factor: 1000, object: 'seed sample' },
    { name: 'Capacity', big: 'kL', small: 'L', factor: 1000, object: 'water tank' }
  ];
  const randomInt = (min, max, rng) => min + Math.floor(rng() * (max - min + 1));
  const format = n => Number(n).toLocaleString('en-US');
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  function choices(answer, distractors, rng) {
    const values = [answer];
    for (const n of distractors) if (Number.isSafeInteger(n) && n >= 0 && !values.includes(n) && values.length < 4) values.push(n);
    for (let n = answer + 1; values.length < 4; n++) if (!values.includes(n)) values.push(n);
    for (let i = values.length - 1; i > 0; i--) {
      const j = randomInt(0, i, rng);
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  }
  function measure(lesson, rng) {
    const units = lesson === 1 ? [groups[0], groups[3], groups[4]] : lesson === 2 ? [groups[1], groups[5]] : [groups[2], groups[6]];
    const g = units[randomInt(0, units.length - 1, rng)];
    const large = randomInt(2, 8, rng), small = randomInt(1, g.factor - 1, rng);
    const total = large * g.factor + small;
    // Module 2 practices renaming from larger to smaller units.
    const mode = randomInt(0, 2, rng);
    if (mode === 0) return {
      prompt: `Grandma wrote ${large} ${g.big} ${small} ${g.small} for the ${g.object}. How many ${g.small} is that altogether?`,
      answer: total, unit: g.small, hint: `One ${g.big} equals ${format(g.factor)} ${g.small}. Convert the ${large} ${g.big} first.`,
      explanation: `${large} × ${format(g.factor)} + ${small} = ${format(total)} ${g.small}.`,
      model: { type: 'conversion', big: g.big, small: g.small, factor: g.factor, large, remainder: small }
    };
    const extra = randomInt(1, Math.max(2, Math.floor(g.factor / 3)), rng);
    if (mode === 1) return {
      prompt: `A ${g.object} measures ${large} ${g.big} ${small} ${g.small}. Add ${extra} ${g.small}. What is the new total in ${g.small}?`,
      answer: total + extra, unit: g.small, hint: `Rename the ${g.big} in ${g.small}, then add ${small} and ${extra}.`,
      explanation: `${large} × ${format(g.factor)} + ${small} + ${extra} = ${format(total + extra)} ${g.small}.`,
      model: { type: 'strip', labels: [`${large} ${g.big} ${small} ${g.small}`, `+ ${extra} ${g.small}`] }
    };
    return {
      prompt: `Two ${g.object === 'ranch sketch' ? 'ranch sketches' : g.object + 's'} measure ${large} ${g.big} and ${small} ${g.small}. How many ${g.small} more is the larger one?`,
      answer: large * g.factor - small, unit: g.small, hint: `Both measures need the same unit before you subtract.`,
      explanation: `${large} ${g.big} = ${format(large * g.factor)} ${g.small}; ${format(large * g.factor)} − ${small} = ${format(large * g.factor - small)} ${g.small}.`,
      model: { type: 'strip', labels: [`${large} ${g.big}`, `${small} ${g.small}`] }
    };
  }
  function compare(rng) {
    const g = groups[randomInt(0, groups.length - 1, rng)];
    const large = randomInt(2, 8, rng), rest = randomInt(1, g.factor - 1, rng);
    const other = large * g.factor + rest;
    const kind = randomInt(0, 2, rng);
    if (kind === 0) return {
      prompt: `${large} ${g.big} is how many ${g.small}?`, answer: large * g.factor, unit: g.small,
      hint: `One ${g.big} is ${format(g.factor)} ${g.small}.`, explanation: `${large} × ${format(g.factor)} = ${format(large * g.factor)} ${g.small}.`,
      model: { type: 'conversion', big: g.big, small: g.small, factor: g.factor, large, remainder: 0 }
    };
    if (kind === 1) return {
      prompt: `Which is greater: ${large} ${g.big} or ${format(other)} ${g.small}? Enter the larger amount in ${g.small}.`, answer: other, unit: g.small,
      hint: `First rename ${large} ${g.big} as ${format(large * g.factor)} ${g.small}.`,
      explanation: `${format(other)} ${g.small} is ${rest} ${g.small} more than ${large} ${g.big}.`,
      model: { type: 'strip', labels: [`${large} ${g.big}`, `${format(other)} ${g.small}`] }
    };
    return {
      prompt: `${format(other)} ${g.small} contains ${large} whole ${g.big}. How many ${g.small} remain?`, answer: rest, unit: g.small,
      hint: `Take away ${large} groups of ${format(g.factor)} ${g.small}.`, explanation: `${format(other)} − ${format(large * g.factor)} = ${rest} ${g.small}.`,
      model: { type: 'conversion', big: g.big, small: g.small, factor: g.factor, large, remainder: rest }
    };
  }
  function multiStep(rng) {
    const g = groups[randomInt(0, 2, rng)];
    const large = randomInt(2, 6, rng), used = randomInt(140, 660, rng), added = randomInt(30, 130, rng);
    const start = large * 1000;
    const mode = randomInt(0, 1, rng);
    const supply = g.name === 'Mass' ? 'feed' : 'water';
    if (mode === 0) return {
      prompt: g.name === 'Length'
        ? `A trail is ${large} ${g.big} long. Grandma shortens it by ${used} ${g.small}, then adds another ${added} ${g.small}. What is its new length in ${g.small}?`
        : `Grandma starts with ${large} ${g.big} of ${supply}, uses ${used} ${g.small}, then adds ${added} ${g.small}. How many ${g.small} does she have now?`,
      answer: start - used + added, unit: g.small,
      hint: `Rename ${large} ${g.big} in ${g.small}. Subtract what she used, then add the new amount.`,
      explanation: `${format(start)} − ${used} + ${added} = ${format(start - used + added)} ${g.small}.`,
      model: { type: 'strip', labels: [`Start: ${large} ${g.big}`, `Used: ${used} ${g.small}`, `Added: ${added} ${g.small}`] }
    };
    return {
      prompt: g.name === 'Length'
        ? `Two trail sections have a combined length of ${large} ${g.big}. Grandma shortens one by ${used} ${g.small} and the other by ${added} ${g.small}. What is their new combined length in ${g.small}?`
        : `Grandma has ${large} ${g.big} of ${supply} in two ${g.name === 'Mass' ? 'bags' : 'jugs'}. She uses ${used} ${g.small} from one and ${added} ${g.small} from the other. How many ${g.small} remain?`,
      answer: start - used - added, unit: g.small,
      hint: `Rename the total in ${g.small}, then take away both parts.`,
      explanation: `${format(start)} − ${used} − ${added} = ${format(start - used - added)} ${g.small}.`,
      model: { type: 'strip', labels: [`Total: ${large} ${g.big}`, `Part: ${used} ${g.small}`, `Part: ${added} ${g.small}`] }
    };
  }
  function pattern(lesson, rng) {
    const a = randomInt(2, 8, rng), b = randomInt(2, 8, rng), input = randomInt(4, 12, rng);
    const operation = lesson === 6 ? ['add', 'multiply'][randomInt(0, 1, rng)] :
      lesson === 7 ? ['add', 'subtract', 'multiply'][randomInt(0, 2, rng)] : ['add', 'multiply'][randomInt(0, 1, rng)];
    const offset = operation === 'subtract' ? randomInt(12, 24, rng) : a;
    const fn = x => operation === 'add' ? x + offset : operation === 'subtract' ? x - b : x * b;
    const entries = operation === 'subtract' ? [offset, offset + 1, offset + 2] : [1, 2, 3];
    const rows = entries.map(x => [x, fn(x)]);
    if (lesson === 7) return {
      prompt: `Grandma's table follows one rule: ${operation === 'add' ? 'add' : operation === 'subtract' ? 'subtract' : 'multiply by'} the same number each time. What is that number?`,
      answer: operation === 'add' ? offset : b, unit: '', hint: 'Compare each input with its output, not one output with the next.',
      explanation: `The rule is ${operation === 'add' ? 'add ' + offset : operation === 'subtract' ? 'subtract ' + b : 'multiply by ' + b}. Check that it works for every row.`,
      model: { type: 'table', rows }
    };
    const target = operation === 'subtract' ? offset + 4 : input;
    if (lesson === 8) return {
      prompt: operation === 'add'
        ? `Grandma already has ${offset} items and brings ${target} more. What output belongs to input ${target} in the table?`
        : `Grandma packs ${b} items per supply set. What output belongs to ${target} sets in the table?`,
      answer: fn(target), unit: '', hint: `Use the same rule that matches each input and output row.`,
      explanation: `${operation === 'add' ? `${target} + ${offset}` : `${target} × ${b}`} = ${fn(target)}.`,
      model: { type: 'table', rows }
    };
    return {
      prompt: `The ranch table follows the rule ${operation === 'add' ? 'add ' + offset : 'multiply by ' + b}. What is the output for input ${target}?`,
      answer: fn(target), unit: '', hint: 'Follow the rule once, from input to output.',
      explanation: `${target} ${operation === 'add' ? '+ ' + offset : '× ' + b} = ${fn(target)}.`,
      model: { type: 'table', rows }
    };
  }
  function warmup(rng) {
    const crates = randomInt(12, 28, rng), each = randomInt(2, 5, rng);
    return {
      prompt: `The barn has ${each} shelves with ${crates} items on each shelf. How many items altogether?`,
      answer: crates * each, unit: 'items', hint: `Break ${crates} into tens and ones; multiply each part by ${each}.`,
      explanation: `${each} × ${crates} = (${each} × ${Math.floor(crates / 10) * 10}) + (${each} × ${crates % 10}) = ${each * crates}.`,
      model: { type: 'strip', labels: Array.from({ length: each }, () => `${crates} items`) }
    };
  }
  function makeQuestion(lesson, rng = Math.random) {
    if (!Number.isInteger(lesson) || lesson < 1 || lesson > 9) throw new Error('Unknown lesson');
    const q = lesson <= 3 ? measure(lesson, rng) : lesson === 4 ? compare(rng) : lesson === 5 ? multiStep(rng) : lesson <= 8 ? pattern(lesson, rng) : warmup(rng);
    q.lesson = lesson;
    q.choices = choices(q.answer, [q.answer + (q.answer >= 1000 ? 1000 : 10), q.answer - (q.answer >= 1000 ? 1000 : 1), q.answer + (q.answer >= 1000 ? 100 : 1), q.answer * 10], rng);
    return q;
  }
  function metricFresh() { return { lesson: 1, completed: {}, active: null }; }
  function normalize(raw) {
    const result = metricFresh();
    if (!raw || typeof raw !== 'object') return result;
    result.lesson = Number.isInteger(raw.lesson) && raw.lesson >= 1 && raw.lesson <= 8 ? raw.lesson : 1;
    for (let n = 1; n <= 9; n++) {
      const count = raw.completed?.[n];
      if (Number.isSafeInteger(count) && count >= 0) result.completed[n] = Math.min(count, 100000);
    }
    const active = raw.active;
    const q = active?.q, m = q?.model;
    const safeModel = m && typeof m === 'object' && (
      (m.type === 'conversion' && typeof m.big === 'string' && typeof m.small === 'string' && Number.isSafeInteger(m.factor)) ||
      (m.type === 'table' && Array.isArray(m.rows) && m.rows.length <= 8 && m.rows.every(row => Array.isArray(row) && row.length === 2 && row.every(Number.isSafeInteger))) ||
      (m.type === 'strip' && Array.isArray(m.labels) && m.labels.length <= 8 && m.labels.every(x => typeof x === 'string'))
    );
    if (active && Number.isInteger(active.lesson) && active.lesson >= 1 && active.lesson <= 9 && Number.isInteger(active.index) && active.index >= 0 && active.index < 4 && q && q.lesson === active.lesson && typeof q.prompt === 'string' && typeof q.unit === 'string' && Number.isSafeInteger(q.answer) && q.answer >= 0 && Array.isArray(q.choices) && q.choices.length === 4 && q.choices.every(v => Number.isSafeInteger(v) && v >= 0) && q.choices.includes(q.answer) && typeof q.explanation === 'string' && typeof q.hint === 'string' && safeModel) {
      result.active = { lesson: active.lesson, index: active.index, q, attempts: Math.min(Number.isSafeInteger(active.attempts) && active.attempts >= 0 ? active.attempts : 0, 10), helped: active.helped === true, solved: active.solved === true, showSteps: active.showSteps === true };
    }
    return result;
  }
  let ctx;
  function save() { ctx.state.metric = ctx.metric; ctx.save(); }
  function modelHtml(model) {
    if (!model || typeof model !== 'object') return '';
    if (model.type === 'conversion') return '<div class="metric-equation"><span>1 ' + escape(model.big) + '</span><span>=</span><span>' + format(model.factor) + ' ' + escape(model.small) + '</span></div><p>Rename both parts in the same unit.</p>';
    if (model.type === 'table') return '<table class="metric-table"><caption>Ranch input and output</caption><thead><tr><th>Input</th><th>Output</th></tr></thead><tbody>' + model.rows.map(r => `<tr><td>${format(r[0])}</td><td>${format(r[1])}</td></tr>`).join('') + '</tbody></table>';
    if (model.type === 'strip') return '<div class="metric-strips">' + model.labels.map(label => '<span>' + escape(label) + '</span>').join('') + '</div>';
    return '';
  }
  function navButton(text, action, extra = '') { return `<button type="button" class="button soft" data-metric="${action}" ${extra}>${text}</button>`; }
  function mount(html, title) {
    ctx.target.innerHTML = html;
    ctx.target.setAttribute('aria-label', title);
    window.scrollTo(0, 0);
    const h = ctx.target.querySelector('h1');
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  function map() {
    const m = ctx.metric, current = m.lesson;
    const rows = lessons.map(([name, detail], i) => `<button type="button" data-metric="lesson" data-lesson="${i + 1}" class="metric-lesson${i + 1 === current ? ' current' : ''}"><span>${i === 8 ? 'AHEAD' : `LESSON ${i + 1}`}</span><strong>${escape(name)}</strong><small>${escape(detail)}</small><em>${m.completed[i + 1] || 0} ranch rounds</em></button>`).join('');
    mount('<section class="metric-scene"><img src="assets/chapter-creek-crossing.webp" alt="" class="scene-art"><div class="metric-intro"><span class="eyebrow dark">THE RANCH MEASUREMENT TRAIL</span><h1>Find your place. Keep exploring.</h1><p>Measure creek trails, stock the barn, and help Grandma find number patterns. Earlier place-value chapters stay open for review.</p>'
      + '<label for="metric-lesson">Start here</label><select id="metric-lesson">' + lessons.slice(0, 8).map(([name], i) => `<option value="${i + 1}"${current === i + 1 ? ' selected' : ''}>Lesson ${i + 1}: ${escape(name)}</option>`).join('') + '</select>'
      + '<div class="metric-actions">' + navButton('Play this lesson', 'play', `data-lesson="${current}"`) + navButton('Earlier ranch chapters', 'exit') + '</div><p class="quiet">New Module 2 book? Lesson 1 is a good place to begin. Review or explore ahead anytime; there are no date locks.</p></div></section>'
      + '<section class="metric-lesson-list"><h2>Review and explore ahead</h2><p>Follow the order in your Module 2 book. The next-module trail is a warm-up, not a school lesson.</p><div class="metric-grid">' + rows + '</div></section>', 'Measurement trail');
    ctx.target.querySelector('#metric-lesson').addEventListener('change', e => {
      m.lesson = Number(e.target.value); m.active = null; save(); map();
    });
  }
  function play(lesson) {
    if (ctx.metric.active?.lesson !== lesson) ctx.metric.active = { lesson, index: 0, q: makeQuestion(lesson), attempts: 0, helped: false, solved: false, showSteps: false };
    save(); question();
  }
  function question() {
    const s = ctx.metric.active, q = s.q, name = lessons[s.lesson - 1][0];
    const coachText = s.showSteps ? q.explanation : s.solved ? 'Nice work. Want to see Grandma’s steps?' : 'Take your time. We can figure it out together.';
    const hintText = s.showSteps ? 'Hide the steps' : 'Show me how';
    const choice = s.index % 2 === 0;
    const answerUi = choice ? '<div class="metric-answers">' + q.choices.map(n => `<button class="answer" type="button" data-metric="answer" data-value="${n}"${s.solved ? ' disabled' : ''}>${format(n)}${q.unit ? ' ' + escape(q.unit) : ''}</button>`).join('') + '</div>'
      : `<form id="metric-form"><label for="metric-number">Your answer${q.unit ? ' in ' + escape(q.unit) : ''}</label><div class="answer-input-row"><input id="metric-number" inputmode="numeric" autocomplete="off"${s.solved ? ' disabled' : ''}><button class="button gold" type="submit"${s.solved ? ' disabled' : ''}>Check it</button></div></form>`;
    mount(`<section class="lesson-shell metric-shell"><div class="lesson-top">${navButton('Save and exit', 'map')}<span>Module 2 · ${s.lesson === 9 ? 'Ahead' : `Lesson ${s.lesson}`} · ${s.index + 1} of 4</span></div><div class="lesson-layout"><aside class="coach"><img src="assets/grandma.webp" alt="Grandma"><span class="eyebrow dark">GRANDMA’S TIP</span><p id="metric-coach">${escape(coachText)}</p><div class="coach-tools">${navButton(hintText, 'hint')}</div></aside><article class="question-card"><div class="question-meta">${escape(name)}</div><h1>${escape(q.prompt)}</h1><div class="visual-model">${modelHtml(q.model)}</div>${answerUi}<p class="metric-feedback" id="metric-feedback" role="status" aria-live="polite">${s.solved ? 'Nice work. Your answer is saved.' : ''}</p><div id="metric-next">${s.solved ? navButton(s.index === 3 ? 'Finish ranch round' : 'Next question', 'next') : ''}</div></article></div></section>`, 'Metric math');
    const form = ctx.target.querySelector('#metric-form');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); submit(ctx.target.querySelector('#metric-number').value); });
  }
  function submit(raw) {
    const s = ctx.metric.active;
    if (!s || s.solved) return;
    const value = Number(String(raw).replaceAll(',', '').trim());
    if (!/^[\d,]+$/.test(String(raw).trim()) || !Number.isSafeInteger(value)) {
      ctx.target.querySelector('#metric-feedback').textContent = 'Enter a whole number.';
      return;
    }
    if (value !== s.q.answer) {
      s.attempts++;
      ctx.target.querySelector('#metric-feedback').textContent = s.attempts >= 2 ? s.q.explanation : s.q.hint;
      if (s.attempts >= 2) s.helped = true;
      save(); return;
    }
    s.solved = true;
    ctx.state.stars++;
    save();
    question();
    ctx.target.querySelector('#metric-feedback').textContent = s.helped || s.attempts ? 'You worked it out with support. +1 star.' : 'You got it on your own. +1 star.';
  }
  function next() {
    const s = ctx.metric.active;
    if (!s?.solved) return;
    if (s.index === 3) {
      ctx.metric.completed[s.lesson] = (ctx.metric.completed[s.lesson] || 0) + 1;
      const name = lessons[s.lesson - 1][0];
      ctx.metric.active = null;
      ctx.state.jobs++;
      save();
      mount('<section class="metric-finish"><img src="assets/porch.webp" alt="Grandma and Rylee on the porch"><div><span class="eyebrow dark">RANCH ROUND COMPLETE</span><h1>Good work on ' + escape(name) + '.</h1><p>Four fresh questions, a few more stars, and Grandma’s porch is waiting.</p><div class="metric-actions">' + navButton('Choose another lesson', 'map') + navButton('Play with Grandma', 'porch') + '</div></div></section>', 'Ranch round complete');
      return;
    }
    s.index++; s.q = makeQuestion(s.lesson); s.attempts = 0; s.helped = false; s.solved = false; s.showSteps = false;
    save(); question();
  }
  function handleClick(e) {
    const b = e.target.closest('button[data-metric]');
    if (!b || b.disabled || !ctx?.target.contains(b)) return;
    const action = b.dataset.metric;
    if (action === 'answer') submit(b.dataset.value);
    if (action === 'hint') {
      const s = ctx.metric.active;
      if (!s) return;
      s.showSteps = !s.showSteps;
      if (s.showSteps && !s.solved) s.helped = true;
      ctx.target.querySelector('#metric-coach').textContent = s.showSteps ? s.q.explanation : s.solved ? 'Nice work. Want to see Grandma’s steps?' : 'Take your time. We can figure it out together.';
      b.textContent = s.showSteps ? 'Hide the steps' : 'Show me how';
      save();
    }
    if (action === 'next') next();
    if (action === 'lesson') play(Number(b.dataset.lesson));
    if (action === 'play') play(Number(b.dataset.lesson));
    if (action === 'map') map();
    if (action === 'exit') ctx.onExit();
    if (action === 'porch') ctx.onPorch();
  }
  function open({ target, state, save: persist, onExit, onPorch }) {
    if (ctx?.target && ctx.handler) ctx.target.removeEventListener('click', ctx.handler);
    ctx = { target, state, save: persist, onExit, onPorch, metric: normalize(state.metric), handler: handleClick };
    state.metric = ctx.metric;
    target.addEventListener('click', handleClick);
    save();
    map();
  }
  const api = { lessons, makeQuestion, metricFresh, normalize, open };
  root.RanchModule2 = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

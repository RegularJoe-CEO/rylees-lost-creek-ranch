(function (root) {
  'use strict';

  const TOTAL = 10;
  const RESET_VERSION = 1;
  const labels = {
    warmup: 'Earlier Module 3 warm-up',
    partial: 'Partial products',
    standard: 'Standard algorithm',
    story: 'Multi-step word problem'
  };

  function fresh() {
    return { resetVersion: RESET_VERSION, completed: 0, best: 0, active: null };
  }

  function normalize(raw) {
    const out = fresh();
    if (!raw || typeof raw !== 'object') return out;
    out.completed = Number.isSafeInteger(raw.completed) && raw.completed >= 0 ? Math.min(raw.completed, 10000) : 0;
    out.best = Number.isSafeInteger(raw.best) ? Math.max(0, Math.min(raw.best, TOTAL)) : 0;
    if (raw.resetVersion !== RESET_VERSION) return out;
    const a = raw.active;
    if (a && typeof a === 'object' && Number.isInteger(a.seed) && Number.isInteger(a.index) && a.index >= 0 && a.index < TOTAL) {
      out.active = {
        seed: a.seed,
        index: a.index,
        correct: Math.max(0, Math.min(Number(a.correct) || 0, TOTAL)),
        firstTry: Math.max(0, Math.min(Number(a.firstTry) || 0, TOTAL)),
        wrong: Math.max(0, Math.min(Number(a.wrong) || 0, 20)),
        solved: a.solved === true,
        helped: a.helped === true,
        results: Array.isArray(a.results) ? a.results.filter(x => x && typeof x.skill === 'string').slice(0, TOTAL) : []
      };
    }
    return out;
  }

  const comma = n => Number(n).toLocaleString('en-US');
  const escape = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const pick = (seed, offset, span) => Math.abs((seed * 73 + offset * 41 + 17) % span);

  function partials(n, factor) {
    return String(n).split('').map((digit, i, digits) => Number(digit) * (10 ** (digits.length - i - 1)) * factor).filter(Boolean);
  }

  function standardSteps(n, factor) {
    const digits = String(n).split('').map(Number).reverse();
    let carry = 0;
    const steps = [];
    const places = ['ones', 'tens', 'hundreds', 'thousands'];
    digits.forEach((digit, i) => {
      const total = digit * factor + carry;
      const write = total % 10;
      const next = Math.floor(total / 10);
      steps.push(factor + ' × ' + digit + (carry ? ' + ' + carry : '') + ' = ' + total + '. Write ' + write + ' in the ' + places[i] + ' place' + (next ? ' and regroup ' + next + '.' : '.'));
      carry = next;
    });
    if (carry) steps.push('Write the final regrouped ' + carry + ' in front.');
    return steps.join(' ');
  }

  function multiplicationWork(n, factor) {
    const answer = n * factor;
    const pieces = partials(n, factor);
    return '<div class="review-methods"><section><strong>Partial products</strong><p>Break apart ' + comma(n) + ':<br>'
      + pieces.map(comma).join(' + ') + ' = <b>' + comma(answer) + '</b></p></section><section><strong>Standard algorithm</strong><p>'
      + escape(standardSteps(n, factor)) + ' The product is <b>' + comma(answer) + '</b>.</p></section></div>';
  }

  function options(answer, seed, spread) {
    const candidates = [answer, answer + spread, Math.max(0, answer - spread), answer + Math.max(10, Math.floor(spread / 10))];
    const distinct = [...new Set(candidates)].slice(0, 3);
    while (distinct.length < 3) distinct.push(answer + distinct.length * 10 + 7);
    const shift = Math.abs(seed) % 3;
    return distinct.slice(shift).concat(distinct.slice(0, shift));
  }

  function questionAt(index, seed) {
    let n, f, answer, prompt, work, skill;
    if (index === 0) {
      const length = 18 + pick(seed, 1, 8), width = 7 + pick(seed, 2, 6);
      answer = length * width; skill = 'warmup';
      prompt = 'A rectangular fishing dock is ' + length + ' feet long and ' + width + ' feet wide. What is its area?';
      work = 'Area means length × width: ' + length + ' × ' + width + ' = <b>' + comma(answer) + ' square feet</b>.';
      return { skill, prompt, answer, work, choices: options(answer, seed, length + width) };
    }
    if (index === 1) {
      n = 24 + pick(seed, 3, 65); f = 10; answer = n * f; skill = 'warmup';
      prompt = 'The bait shop packs ' + n + ' hooks in each tray. How many hooks are in 10 trays?';
      work = comma(n) + ' × 10 = <b>' + comma(answer) + '</b>. Every digit shifts one place to the left because each unit is now worth 10 times as much.';
      return { skill, prompt, answer, work, choices: options(answer, seed + 1, 90) };
    }
    const lengths = index < 4 ? 2 : index < 7 ? 3 : 4;
    const base = lengths === 2 ? 24 : lengths === 3 ? 214 : 1204;
    const span = lengths === 2 ? 65 : lengths === 3 ? 586 : 2500;
    n = base + pick(seed, index + 4, span);
    f = 3 + pick(seed, index + 9, 6);
    answer = n * f;
    if (index === 2 || index === 4 || index === 6) skill = 'partial';
    else if (index === 3 || index === 5 || index === 7) skill = 'standard';
    else skill = 'story';

    if (index === 8) {
      const used = 125 + pick(seed, 31, 275);
      const total = answer;
      answer = total - used;
      prompt = 'Grandma stocked ' + f + ' tackle boxes with ' + comma(n) + ' hooks in each box. The family used ' + comma(used) + ' hooks. How many hooks are left?';
      work = multiplicationWork(n, f) + '<p><strong>Second step:</strong> ' + comma(total) + ' − ' + comma(used) + ' = <b>' + comma(answer) + ' hooks left</b>.</p>';
      return { skill, prompt, answer, work, choices: options(answer, seed + 8, Math.max(100, used)) };
    }
    if (index === 9) {
      const extra = 85 + pick(seed, 41, 215);
      const first = answer;
      answer = first + extra;
      prompt = f + ' boats each collected ' + comma(n) + ' pieces of litter from the creek. Rylee collected ' + comma(extra) + ' more pieces from the bank. How many pieces did everyone collect altogether?';
      work = multiplicationWork(n, f) + '<p><strong>Second step:</strong> ' + comma(first) + ' + ' + comma(extra) + ' = <b>' + comma(answer) + ' pieces altogether</b>.</p>';
      return { skill, prompt, answer, work, choices: options(answer, seed + 9, Math.max(100, extra)) };
    }
    prompt = 'Solve ' + comma(n) + ' × ' + f + '. Use ' + (skill === 'partial' ? 'partial products' : 'the standard algorithm') + '.';
    work = multiplicationWork(n, f);
    return { skill, prompt, answer, work, choices: options(answer, seed + index, 10 ** (lengths - 1)) };
  }

  let ctx = null;
  function mount(html) {
    ctx.target.innerHTML = html;
    window.scrollTo(0, 0);
    const h = ctx.target.querySelector('h1');
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  function button(action, text, cls) {
    return '<button type="button" class="button ' + (cls || '') + '" data-action="review-' + action + '">' + text + '</button>';
  }
  function persist() { ctx.save(); }

  function open(options) {
    ctx = options;
    ctx.state.module3Review = normalize(ctx.state.module3Review);
    const r = ctx.state.module3Review;
    mount('<section class="review-intro"><img src="assets/fishing-cove.webp" alt="A sunny fishing cove at Lost Creek Ranch."><div class="review-intro-card"><span class="eyebrow dark">TEST REVIEW · MODULE 3</span><h1>Module 3 Mid-Module Review</h1><p>Ten fishing casts review earlier Module 3 work, partial products, the standard algorithm, and multi-step word problems.</p><ul><li>No timer</li><li>Worked help on every question</li><li>New numbers each time</li></ul>'
      + button(r.active ? 'resume' : 'start', r.active ? 'Continue the review' : 'Start the review', 'gold')
      + (r.active ? button('start', 'Begin again', 'forest') : '')
      + (r.completed ? button('start', 'Start a fresh review', 'forest') : '')
      + button('exit', 'Back to the ranch', 'text')
      + '<p class="small">Best on this device: ' + r.best + ' of ' + TOTAL + ' on the first try. This is original practice aligned to the skills described by his teacher.</p></div></section>');
  }

  function start() {
    const r = ctx.state.module3Review;
    r.active = { seed: Date.now() % 1000000, index: 0, correct: 0, firstTry: 0, wrong: 0, solved: false, helped: false, results: [] };
    persist(); render();
  }
  function render() {
    const a = ctx.state.module3Review.active;
    if (!a) return open(ctx);
    const q = questionAt(a.index, a.seed);
    const fish = Array.from({ length: TOTAL }, (_, i) => '<span class="' + (i < a.index ? 'caught' : i === a.index ? 'current' : '') + '">' + (i < a.index ? '✓' : '🐟') + '</span>').join('');
    const answers = q.choices.map((choice, i) => '<button type="button" class="answer" data-action="review-answer" data-value="' + choice + '" ' + (a.solved ? 'disabled' : '') + '><span class="answer-letter">' + String.fromCharCode(65 + i) + '</span><span>' + comma(choice) + '</span></button>').join('');
    mount('<section class="review-shell"><div class="review-top"><div class="review-top-actions">' + button('exit', 'Save and exit', 'text') + button('start', 'Begin again', 'soft') + '</div><strong>Module 3 Mid-Module Review</strong><span>Cast ' + (a.index + 1) + ' of ' + TOTAL + '</span></div><div class="review-fish" aria-label="Question ' + (a.index + 1) + ' of ' + TOTAL + '">' + fish + '</div><div class="review-layout"><aside class="review-coach"><img src="assets/grandma.webp" alt="Grandma is ready to help."><span class="eyebrow dark">GRANDMA’S TIP</span><p>Take your time. Decide what the problem is asking before you calculate.</p>' + button('help', 'Show me how', 'forest') + '</aside><article class="review-card"><div class="question-meta"><span>' + labels[q.skill] + '</span><span>' + (a.index + 1) + ' / ' + TOTAL + '</span></div><h1>' + escape(q.prompt) + '</h1><div class="review-answers">' + answers + '</div><div id="review-feedback" class="feedback" role="status" aria-live="polite" ' + (a.solved ? '' : 'hidden') + '>' + (a.solved ? 'That one is in the creel. The answer is ' + comma(q.answer) + '.' : '') + '</div><div id="review-work" class="review-work" ' + (a.helped || a.solved ? '' : 'hidden') + '>' + q.work + '</div><div id="review-next">' + (a.solved ? button('next', a.index === TOTAL - 1 ? 'See my results' : 'Next cast', 'gold') : '') + '</div></article></div></section>');
  }

  function answer(value) {
    const a = ctx.state.module3Review.active;
    if (!a || a.solved) return;
    const q = questionAt(a.index, a.seed);
    if (Number(value) === q.answer) {
      a.solved = true; a.correct++;
      if (a.wrong === 0 && !a.helped) a.firstTry++;
      a.results.push({ skill: q.skill, independent: a.wrong === 0 && !a.helped });
      ctx.state.stars = (ctx.state.stars || 0) + 1;
      persist(); render();
    } else {
      a.wrong++;
      persist();
      const f = document.getElementById('review-feedback');
      f.hidden = false;
      f.textContent = 'Not yet. Check each place value, then try again. Show me how is here whenever you want it.';
    }
  }
  function help() {
    const a = ctx.state.module3Review.active;
    if (!a) return;
    a.helped = true; persist();
    document.getElementById('review-work').hidden = false;
  }
  function next() {
    const r = ctx.state.module3Review, a = r.active;
    if (!a || !a.solved) return;
    if (a.index < TOTAL - 1) { a.index++; a.wrong = 0; a.solved = false; a.helped = false; persist(); render(); return; }
    r.completed++; r.best = Math.max(r.best, a.firstTry);
    const results = a.results;
    r.active = null; persist();
    const counts = skill => results.filter(x => x.skill === skill);
    const line = (skill, title) => {
      const set = counts(skill), good = set.filter(x => x.independent).length;
      return '<li><strong>' + title + ':</strong> ' + (good === set.length ? 'ready' : 'practice once more') + ' (' + good + ' of ' + set.length + ' first try without help)</li>';
    };
    mount('<section class="review-finish"><img src="assets/fishing-cove.webp" alt="The Lost Creek fishing cove."><div><span class="eyebrow dark">REVIEW COMPLETE</span><h1>You finished all ten casts.</h1><p><strong>' + a.firstTry + ' of ' + TOTAL + '</strong> were right on the first try without help. Every finished problem counts, especially the ones you worked through.</p><ul>' + line('partial', 'Partial products') + line('standard', 'Standard algorithm') + line('story', 'Multi-step stories') + '</ul>' + button('start', 'Try new numbers', 'gold') + button('exit', 'Back to the ranch', 'forest') + '</div></section>');
  }

  if (typeof document !== 'undefined') document.addEventListener('click', event => {
    const b = event.target.closest('button[data-action^="review-"]');
    if (!b || !ctx) return;
    const action = b.dataset.action.slice(7);
    if (action === 'exit') ctx.onExit();
    else if (action === 'start') start();
    else if (action === 'resume') render();
    else if (action === 'answer') answer(b.dataset.value);
    else if (action === 'help') help();
    else if (action === 'next') next();
  });

  const api = { TOTAL, RESET_VERSION, fresh, normalize, questionAt, partials, standardSteps, open };
  root.RanchModule3Review = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

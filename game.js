(function () {
  'use strict';
  const M = RanchMath, P = RanchProgress;
  const $ = id => document.getElementById(id);
  let storage;
  try { storage = window.localStorage; } catch (_) { storage = { getItem: () => null, setItem: () => { throw new Error('Storage unavailable'); } }; }
  const state = P.load(storage);
  const trails = {
    fish: { name: 'The Fishing Hole', short: 'Fishing', mark: '×10', label: 'Ten times & one tenth', skills: ['times', 'units', 'divide'], coach: 'Friend', intro: 'Let’s stock the fishing shed. Trade between places and work out how many supplies we need.', object: 'A tackle box for the dock', color: 'blue' },
    range: { name: 'The Barn Range', short: 'The range', mark: '123', label: 'Build & name numbers', skills: ['expanded', 'value'], coach: 'Mama', intro: 'The supply labels got mixed up. Help Mama put the right numbers in the ranch ledger.', object: 'A fresh sign for the barn', color: 'orange' },
    trap: { name: 'The Wildlife Trail', short: 'Wildlife', mark: '?', label: 'Find every digit’s value', skills: ['value', 'units'], coach: 'Friend', intro: 'We’re checking the humane traps. Read the animal-care supply counts, one place at a time.', object: 'A safe shelter for the critters', color: 'green' },
    trail: { name: 'Creek Crossing', short: 'The creek', mark: '≈', label: 'Compare, order & round', skills: ['compare', 'round'], coach: 'Grandma', intro: 'Help me choose a trail, compare our counts, and estimate the distance to the creek.', object: 'A new marker on the creek trail', color: 'purple' }
  };
  let screen = 'map', session = null, current = null, memory = null, timer = null, tradeCount = 10;
  const escape = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  function persist() {
    const ok = P.save(storage, state);
    $('storage-note').hidden = ok;
    $('star-count').textContent = M.format(state.stars);
    return ok;
  }
  function icon(name) {
    const paths = {
      home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
      star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/>',
      sound: '<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
      arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
      journal: '<path d="M5 3h13a1 1 0 0 1 1 1v17H6a3 3 0 0 1 0-6h13M5 3v15M9 7h6m-6 4h4"/>',
      heart: '<path d="M20.8 4.6a5.4 5.4 0 0 0-7.7 0L12 5.7l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 21l8.8-8.7a5.4 5.4 0 0 0 0-7.7Z"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + paths[name] + '</svg>';
  }
  function button(action, text, cls = '', extra = '') {
    return '<button type="button" class="button ' + cls + '" data-action="' + action + '" ' + extra + '>' + text + '</button>';
  }
  function stop() {
    clearTimeout(timer); timer = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
  function mount(html, name) {
    stop();
    screen = name;
    $('main').innerHTML = html;
    $('main').setAttribute('aria-label', name === 'map' ? 'Ranch map' : name);
    window.scrollTo(0, 0);
    const heading = $('main').querySelector('h1');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    persist();
  }
  function progressText(id) {
    return state.completed[id] ? 'Completed ' + state.completed[id] + (state.completed[id] === 1 ? ' adventure' : ' adventures') : 'Ready to explore';
  }
  function map() {
    session = null; current = null; memory = null;
    const recommended = state.focus === 'next' ? 'trail' : 'fish';
    const cards = Object.entries(trails).map(([id, t]) =>
      '<button class="trail-card ' + t.color + '" data-action="start" data-id="' + id + '"><span class="trail-symbol">' + t.mark
      + '</span><span class="trail-copy"><strong>' + t.name + '</strong><span>' + t.label + '</span><small>'
      + (recommended === id ? 'TODAY’S TRAIL · ' : '') + '6 challenges</small></span><span class="card-arrow">↗</span></button>').join('');
    const unlocked = state.jobs > 0;
    mount('<section class="world"><img class="world-art" src="assets/ranch.webp" alt="A painted ranch with a red barn, bluebonnets, oak trees, and a fishing dock beside a winding creek." fetchpriority="high">'
      + '<div class="world-shade"></div><div class="welcome"><span class="eyebrow">YOUR NEXT RANCH ADVENTURE</span><h1>Hey, Rylee.<br>Let’s hit the trail.</h1>'
      + '<p>' + (state.focus === 'next' ? 'Compare big numbers. Find your way to the creek.' : 'Little trades. Big numbers. A whole ranch to explore.') + '</p>'
      + button('start', 'Let’s go fishing ' + icon('arrow'), 'gold start-today', 'data-id="' + recommended + '"')
      + '</div><div class="map-sign map-barn">THE BARN</div><div class="map-sign map-creek">LOST CREEK</div>'
      + '<div class="world-caption"><span class="live-dot"></span> ' + (state.jobs ? state.jobs + ' adventures together' : 'A fresh day at Lost Creek') + '</div></section>'
      + '<section class="trail-section"><div class="section-heading"><div><span class="eyebrow dark">PICK YOUR ADVENTURE</span><h2>A little math. A lot of ranch.</h2></div><span class="quiet">No clock. Take your time.</span></div>'
      + '<div class="trail-grid">' + cards + '</div></section>'
      + '<section class="porch-invite"><img src="assets/grandma.webp" alt="Grandma smiling and holding a hand of playing cards." class="grandma-cutout">'
      + '<div><span class="eyebrow dark">GRANDMA’S GAME PORCH</span><h2>“I saved you a seat.”</h2><p>'
      + (unlocked ? 'Your game porch is open. Play a round together whenever you like.' : 'Finish any six-question adventure, then enjoy a real game with Grandma.')
      + '</p>' + (unlocked ? button('porch', 'Play with Grandma ' + icon('heart'), 'forest') : '<span class="unlock-note">Your first adventure opens the porch</span>')
      + '</div><div class="porch-stats"><strong>' + state.jobs + '</strong><span>adventures<br>completed</span></div></section>'
      + '<footer class="map-footer"><span>Lost Creek Ranch · Rylee, Friend, Mama, Elvis & Grandma</span>'
      + button('journal', 'Learning journal', 'text') + '</footer>', 'map');
    const cta = $('main').querySelector('.start-today');
    cta.innerHTML = (recommended === 'trail' ? 'Explore the creek ' : 'Let’s go fishing ') + icon('arrow');
  }
  function start(id) {
    if (!trails[id]) return;
    session = { id, index: 0, independent: 0, length: 6, solved: false, skills: [] };
    const t = trails[id];
    const sorted = t.skills.slice().sort((a, b) => {
      const ra = state.skills[a]?.recent || [], rb = state.skills[b]?.recent || [];
      const score = list => list.length ? list.filter(Boolean).length / list.length : 0;
      return score(ra) - score(rb);
    });
    // A short varied set, with an extra visit to the skill needing most support.
    session.skills = Array.from({ length: 6 }, (_, i) => sorted[i % sorted.length]);
    mount('<section class="mission-intro"><img class="scene-art" src="assets/ranch.webp" alt="Lost Creek Ranch">'
      + '<div class="intro-panel"><span class="eyebrow dark">TODAY’S JOB · 6 CHALLENGES</span><h1>' + t.name + '</h1><p>' + t.intro
      + '</p><div class="job-reward">' + icon('star') + '<span>' + t.object + '<br><small>Then it’s game time with Grandma.</small></span></div>'
      + button('begin', 'I’m ready ' + icon('arrow'), 'gold') + button('map', 'Choose another trail', 'text')
      + '</div></section>', 'Adventure briefing');
  }
  function begin() {
    if (!session) return;
    const skill = session.skills[session.index];
    const q = M.nextQuestion(skill, M.levelFor(state, skill), state.recent);
    current = { q, attempts: 0, helped: false, solved: false, wrong: new Set(), typed: q.numeric && session.index % 3 === 2 };
    renderQuestion();
  }
  function chart(number, highlight) {
    const digits = String(number).padStart(Math.max(4, String(number).length), '0').split('');
    return '<div class="place-chart" aria-label="Place-value chart">' + digits.map((d, i) => {
      const power = digits.length - i - 1;
      return '<div class="place-cell ' + (power === highlight ? 'highlight' : '') + '"><span>' + M.places[power]
        + '</span><strong>' + d + '</strong></div>';
    }).join('') + '</div>';
  }
  function model(q, reveal = false) {
    const m = q.model;
    if (m.type === 'shift') return '<div class="model-caption">' + (m.direction === 'left' ? 'TEN TIMES AS MUCH' : 'ONE TENTH AS MUCH') + '</div>'
      + chart(m.before) + '<div class="shift-arrow">' + (m.direction === 'left' ? '← ×10 · one place left' : 'one place right · ÷10 →') + '</div>'
      + (reveal ? chart(m.after) : '<p class="model-note">Picture where each digit will land.</p>');
    if (m.type === 'place') return chart(m.number, m.highlight);
    if (m.type === 'trade') return '<div class="trade-model"><div class="unit-bundle"><strong>1</strong><span>'
      + M.places[m.high].replace(/s$/, '') + '</span></div><span class="trade-equals">=</span><div class="ten-units">'
      + Array.from({ length: 10 }, () => '<span class="unit-dot"></span>').join('')
      + '<small>10 ' + M.places[m.high - 1] + '</small></div></div>';
    if (m.type === 'line') {
      const percent = (m.number - m.lower) / (m.upper - m.lower) * 100;
      return '<div class="number-line"><div class="line-endpoints"><span>' + M.format(m.lower) + '</span><span>' + M.format(m.upper) + '</span></div>'
        + '<div class="line-track"><span class="line-mid"></span><span class="line-point" style="left:' + percent + '%"><b>' + M.format(m.number)
        + '</b></span></div><div class="line-half">Halfway: ' + M.format(m.midpoint) + '</div></div>';
    }
    return m.values.map(n => chart(n)).join('');
  }
  function renderQuestion() {
    const t = trails[session.id], q = current.q;
    const dots = Array.from({ length: 6 }, (_, i) => '<span class="' + (i < session.index ? 'done' : i === session.index ? 'active' : '') + '">'
      + (i < session.index ? '✓' : i + 1) + '</span>').join('');
    const choices = current.typed
      ? '<form id="answer-form"><label for="number-answer">Write your answer</label><div class="answer-input-row"><input id="number-answer" autocomplete="off" inputmode="numeric" placeholder="Your number" aria-describedby="input-note"><button class="button gold" type="submit">Check it ' + icon('arrow') + '</button></div><small id="input-note">Numbers only. Commas are optional.</small></form>'
      : '<div class="answers">' + q.options.map((o, i) => '<button class="answer" data-action="answer" data-index="' + i + '"><span class="answer-letter">'
        + String.fromCharCode(65 + i) + '</span><span>' + escape(o.text) + '</span></button>').join('') + '</div>';
    mount('<section class="lesson-shell"><div class="lesson-top">' + button('map', '← Ranch map', 'text') + '<span>' + t.name + '</span><div class="step-dots" aria-label="Question ' + (session.index + 1) + ' of 6">' + dots + '</div></div>'
      + '<div class="lesson-layout"><aside class="coach"><img src="assets/grandma.webp" alt="Grandma is here to help"><span class="eyebrow dark">GRANDMA’S TIP</span>'
      + '<p id="coach-copy">' + escape(q.hint) + '</p><div class="coach-tools">'
      + button('hint', 'Show me how', 'forest') + button('speak', icon('sound') + ' Read aloud', 'soft') + '</div>'
      + '<p class="coach-note">Mistakes are part of learning.<br>We can figure it out together.</p></aside>'
      + '<article class="question-card"><div class="question-meta"><span>' + M.skills[q.skill] + '</span><span>' + (session.index + 1) + ' / 6</span></div>'
      + '<h1>' + escape(q.prompt) + '</h1><div class="visual-model">' + model(q) + '</div>'
      + choices + '<div id="feedback" role="status" aria-live="polite" class="feedback" hidden></div>'
      + '<div id="next-area"></div></article></div></section>', 'Math challenge');
    const form = $('answer-form');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); submitNumber(); });
  }
  function showHint() {
    if (!current || current.solved) return;
    current.helped = true;
    $('coach-copy').textContent = current.q.explanation;
    $('main').querySelector('.visual-model').innerHTML = model(current.q, true);
    const feedback = $('feedback');
    feedback.hidden = false;
    feedback.className = 'feedback gentle';
    feedback.textContent = 'Use the example, then give it a try. You still earn your star.';
  }
  function submitNumber() {
    if (!current || current.solved) return;
    const value = M.parseNumber($('number-answer').value);
    if (value === null) {
      const f = $('feedback'); f.hidden = false; f.className = 'feedback gentle'; f.textContent = 'Enter a whole number, like 500 or 5,000.';
      return;
    }
    answer(value === M.parseNumber(current.q.answer), null);
  }
  function answer(correct, index) {
    if (!current || current.solved || screen !== 'Math challenge') return;
    if (index !== null && current.wrong.has(index)) return;
    current.attempts++;
    const f = $('feedback'); f.hidden = false;
    if (!correct) {
      if (index !== null) {
        current.wrong.add(index);
        const b = $('main').querySelector('[data-action="answer"][data-index="' + index + '"]');
        b.disabled = true; b.classList.add('try-again');
      }
      f.className = 'feedback gentle';
      f.textContent = 'Not quite yet. ' + current.q.hint;
      if (current.attempts >= 2) showHint();
      return;
    }
    current.solved = true;
    const independent = current.attempts === 1 && !current.helped;
    session.independent += independent ? 1 : 0;
    M.recordAnswer(state, current.q, independent);
    persist();
    $('main').querySelectorAll('.answer, #answer-form button, #number-answer').forEach(el => { el.disabled = true; });
    if (index !== null) $('main').querySelector('[data-index="' + index + '"]').classList.add('correct');
    f.className = 'feedback success';
    f.textContent = 'You got it! +1 star. ' + current.q.explanation;
    $('main').querySelector('.visual-model').innerHTML = model(current.q, true);
    $('next-area').innerHTML = button('next', session.index === 5 ? 'Job done! ' + icon('arrow') : 'Next challenge ' + icon('arrow'), 'forest');
  }
  function next() {
    if (!session || !current?.solved) return;
    session.index++;
    if (session.index < 6) begin();
    else complete();
  }
  function complete() {
    if (!session || session.solved) return;
    session.solved = true;
    state.jobs++;
    state.completed[session.id] = (state.completed[session.id] || 0) + 1;
    persist();
    mount('<section class="celebration"><img class="scene-art" src="assets/porch.webp" alt="Grandma and Rylee enjoying a game together on the ranch porch">'
      + '<div class="celebration-card"><span class="eyebrow dark">ANOTHER GOOD DAY AT THE RANCH</span><div class="earned-stars">★ ★ ★</div><h1>You stuck with it!</h1>'
      + '<p>' + trails[session.id].object + ' is ready.</p><div class="result-row"><span><strong>6</strong>challenges solved</span><span><strong>+6</strong>stars earned</span></div>'
      + '<p class="small">Grandma’s got the cards. Your seat is waiting.</p>' + button('porch', 'Game time with Grandma ' + icon('heart'), 'gold')
      + button('map', 'Back to the ranch', 'text') + '</div></section>', 'Adventure complete');
  }
  function porch() {
    if (state.jobs === 0) { map(); return; }
    mount('<section class="porch-scene"><img class="scene-art" src="assets/porch.webp" alt="Rylee and Grandma playing on a sunny ranch porch">'
      + '<div class="porch-panel"><span class="eyebrow dark">GRANDMA’S GAME PORCH</span><h1>Pull up a chair.</h1><p>Find matching pairs, or skip a stone across Lost Creek.</p>'
      + '<label class="family-toggle"><input type="checkbox" id="family-mode" ' + (state.family ? 'checked' : '') + '> Take turns with Grandma on this device</label>'
      + '<p class="small">Together in person? Pass the screen after each turn. Playing alone? Switch this off.</p>'
      + button('memory', 'Play Ranch Pairs', 'gold') + button('stones', 'Skip stones', 'forest') + button('map', 'Back to the ranch', 'text')
      + '</div></section>', 'Grandma’s game porch');
    $('family-mode').addEventListener('change', e => { state.family = e.target.checked; persist(); });
  }
  function startMemory() {
    if (state.jobs === 0) return;
    const animals = ['🐴', '🐟', '🐑', '🐔', '🦋', '🐐'];
    memory = { cards: M.shuffle(animals.concat(animals), Math.random), selected: [], matches: [], moves: 0, player: 0, busy: false };
    drawMemory();
  }
  function drawMemory() {
    const m = memory;
    const done = m.matches.length === 12;
    mount('<section class="game-shell"><div class="game-heading"><div><span class="eyebrow dark">GRANDMA’S GAME PORCH</span><h1>Ranch Pairs</h1><p id="turn-label">'
      + (done ? 'You found the whole ranch together!' : state.family ? (m.player ? 'Grandma’s' : 'Rylee’s') + ' turn. Turn over two cards.' : 'Turn over two cards. Find all six pairs.')
      + '</p></div><span class="game-score">' + m.matches.length / 2 + ' / 6 pairs · ' + m.moves + ' turns</span></div>'
      + '<div class="memory-grid">' + m.cards.map((animal, i) => {
        const matched = m.matches.includes(i), shown = matched || m.selected.includes(i);
        return '<button class="memory-card ' + (matched ? 'matched' : shown ? 'flipped' : '') + '" data-action="flip" data-index="' + i
          + '" aria-label="' + (matched ? 'Matched ' + animal : shown ? animal : 'Face-down card ' + (i + 1)) + '" ' + (matched ? 'disabled' : '') + '>'
          + '<span>' + (shown ? animal : '✦') + '</span></button>';
      }).join('') + '</div><div class="game-bottom">' + button('porch', '← Game porch', 'soft')
      + (done ? button('memory', 'Play another round', 'gold') : '<span class="quiet">A matching pair stays face up.</span>') + '</div></section>', 'Ranch Pairs');
  }
  function flip(index) {
    if (!memory || screen !== 'Ranch Pairs' || memory.busy || memory.matches.includes(index) || memory.selected.includes(index)) return;
    memory.selected.push(index);
    if (memory.selected.length === 2) {
      memory.moves++;
      const [a, b] = memory.selected;
      if (memory.cards[a] === memory.cards[b]) {
        memory.matches.push(a, b); memory.selected = []; memory.player = 1 - memory.player;
        drawMemory();
      } else {
        memory.busy = true;
        drawMemory();
        const active = memory;
        timer = setTimeout(() => {
          if (screen !== 'Ranch Pairs' || memory !== active) return;
          memory.selected = []; memory.busy = false; memory.player = 1 - memory.player; drawMemory();
        }, 1100);
      }
    } else drawMemory();
  }
  function stones() {
    if (state.jobs === 0) return;
    memory = null;
    mount('<section class="stone-game"><img class="scene-art" src="assets/ranch.webp" alt="A peaceful creek on Lost Creek Ranch">'
      + '<div class="stone-panel"><span class="eyebrow dark">A QUIET MINUTE WITH GRANDMA</span><h1>One good skip.</h1><p>Tap when the marker reaches the golden zone. There’s no wrong throw.</p>'
      + '<div class="skip-meter"><span class="gold-zone"></span><span id="skip-marker"></span></div><div id="skip-result" role="status" aria-live="polite">Find your moment…</div>'
      + button('throw', 'Skip a stone', 'gold') + button('porch', 'Back to the porch', 'text') + '</div></section>', 'Skipping stones');
    const marker = $('skip-marker');
    marker.animate([{ left: '0%' }, { left: '100%' }], { duration: 1500, iterations: Infinity, direction: 'alternate', easing: 'linear' });
  }
  function throwStone() {
    if (screen !== 'Skipping stones') return;
    const marker = $('skip-marker'), meter = marker.parentElement;
    const pos = (marker.getBoundingClientRect().left - meter.getBoundingClientRect().left) / meter.getBoundingClientRect().width;
    const hops = Math.abs(pos - 0.5) < 0.14 ? 5 : Math.abs(pos - 0.5) < 0.3 ? 3 : 1;
    $('skip-result').textContent = hops === 5 ? 'Five beautiful skips! “That’s a keeper,” says Grandma.' : hops === 3 ? 'Three skips across the creek. Nice throw!' : 'Plop! Grandma grins. “Let’s try another.”';
  }
  function journal() {
    const rows = Object.entries(M.skills).map(([id, name]) => {
      const s = state.skills[id] || { attempts: 0, independent: 0, recent: [] };
      const successes = s.recent.filter(Boolean).length;
      return '<div class="skill-row"><div><strong>' + name + '</strong><span>' + s.attempts + ' solved · ' + s.independent + ' without hints or retries</span></div>'
        + '<div class="skill-dots" aria-label="' + successes + ' independent answers out of the last ' + s.recent.length + '">'
        + Array.from({ length: 8 }, (_, i) => '<i class="' + (i < s.recent.length ? s.recent[i] ? 'independent' : 'supported' : '') + '"></i>').join('') + '</div></div>';
    }).join('');
    mount('<section class="journal"><div class="section-heading"><div><span class="eyebrow dark">FOR RYLEE & HIS GROWN-UPS</span><h1>The learning journal</h1></div>'
      + button('map', '← Ranch', 'soft') + '</div><div class="journal-grid"><article class="journal-card"><h2>What are we practicing?</h2>'
      + '<p>Stay with place value while it’s tricky. Change the focus when his teacher moves on. Every trail stays available.</p>'
      + '<label for="focus">Today’s focus</label><select id="focus"><option value="tens" ' + (state.focus === 'tens' ? 'selected' : '') + '>Place value & the ten-times rule</option>'
      + '<option value="next" ' + (state.focus === 'next' ? 'selected' : '') + '>Next step: compare, order & round</option></select>'
      + '<p class="small">Practice for early Grade 4 whole-number skills. This is not an official Bluebonnet lesson sequence or a prediction of his class schedule.</p>'
      + '<h2>Try it with your hands</h2><p>Trade ten ones for one ten. The amount does not change.</p><div id="trade-lab"></div>'
      + '</article><article class="journal-card"><h2>Growing confidence</h2><p class="small">The last eight completed questions in each skill. Green = first try without hints. Gold = solved with support. This is practice history, not a test score.</p>'
      + rows + '<p class="small">Larger numbers appear after at least five independent answers in a recent window of six or more. Support remains available.</p></article></div>'
      + '<p class="privacy-note">Progress stays in this browser on this device. No account, ads, or tracking. Old stars are kept when you use the same game address.</p></section>', 'Learning journal');
    $('focus').addEventListener('change', e => { state.focus = e.target.value === 'next' ? 'next' : 'tens'; persist(); });
    tradeCount = 10; drawTrade();
  }
  function drawTrade() {
    const packed = tradeCount === 0;
    $('trade-lab').innerHTML = '<div class="trade-lab-count">' + (packed ? '<strong>1 ten</strong><span class="ten-rod"></span>' : '<strong>10 ones</strong><div class="ten-units">'
      + Array.from({ length: 10 }, () => '<span class="unit-dot"></span>').join('') + '</div>') + '<p>Total: 10</p></div>'
      + button('trade', packed ? 'Trade back into 10 ones' : 'Bundle into 1 ten', 'forest');
  }
  function speak() {
    if (!current || !('speechSynthesis' in window)) {
      const f = $('feedback'); if (f) { f.hidden = false; f.textContent = 'Read-aloud is not available in this browser. Grandma’s written tip is right here.'; } return;
    }
    window.speechSynthesis.cancel();
    const text = current.q.prompt.replaceAll('×', ' times ').replaceAll('÷', ' divided by ').replaceAll('___', ' blank ');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; utterance.lang = 'en-US'; window.speechSynthesis.speak(utterance);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('button[data-action]');
    if (!b || b.disabled) return;
    const a = b.dataset.action;
    if (a === 'map') map();
    else if (a === 'journal') journal();
    else if (a === 'start') start(b.dataset.id);
    else if (a === 'begin') begin();
    else if (a === 'hint') showHint();
    else if (a === 'speak') speak();
    else if (a === 'answer' && current) {
      const i = Number(b.dataset.index);
      answer(current.q.options[i].correct, i);
    } else if (a === 'next') next();
    else if (a === 'porch') porch();
    else if (a === 'memory') startMemory();
    else if (a === 'flip') flip(Number(b.dataset.index));
    else if (a === 'stones') stones();
    else if (a === 'throw') throwStone();
    else if (a === 'trade') { tradeCount = tradeCount ? 0 : 10; drawTrade(); }
  });
  window.addEventListener('pagehide', stop);
  map();
})();

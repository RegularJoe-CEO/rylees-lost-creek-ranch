(function () {
  'use strict';
  const M = RanchMath, P = RanchProgress, C = RanchChapters;
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
  let screen = 'map', session = null, current = null, memory = null, timer = null, tradeCount = 10, bundle = null, teach = null;
  const rng = Math.random;
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
  function recommendedChapter() {
    if (state.explicitChapter && C.byId[state.explicitChapter]) return state.explicitChapter;
    if (state.parentStart && C.byId[state.parentStart]) return state.parentStart;
    if (state.placement.recommended && C.byId[state.placement.recommended]) return state.placement.recommended;
    for (const ch of C.list) {
      P.syncStatus(state, ch.id);
      const st = state.chapters[ch.id].status;
      if (st !== 'passed' && st !== 'remembered') return ch.id;
    }
    return 'round';
  }
  function chapterThumb(ch) {
    return '<img src="' + ch.scene + '" alt="" class="chapter-thumb" style="object-position:' + ch.crop.desktop + '">';
  }
  function chapterMap() {
    session = null; current = null; memory = null; teach = null; bundle = null;
    const rec = recommendedChapter();
    const recCh = C.byId[rec];
    const resume = state.resume;
    const unlocked = state.jobs > 0;
    const cards = C.list.map(ch => {
      P.syncStatus(state, ch.id);
      const st = C.statuses[state.chapters[ch.id].status];
      const prereq = ch.number > 1 ? '<small class="quiet">Earlier jobs can help, and you may still start here.</small>' : '';
      return '<button class="chapter-card" data-action="chapter" data-id="' + ch.id + '">' + chapterThumb(ch)
        + '<span class="chapter-copy"><span class="chapter-num">Chapter ' + ch.number + '</span><strong>'
        + escape(ch.title) + '</strong><span>' + escape(ch.job) + '</span><span class="status-line" title="'
        + escape(st.label) + '"><span aria-hidden="true">' + st.symbol + '</span> ' + escape(st.label)
        + '</span>' + prereq + '</span></button>';
    }).join('');
    const continueLabel = resume ? 'Continue adventure' : 'Start the first job';
    mount('<section class="world"><img class="world-art" src="assets/ranch.webp" alt="A painted ranch with a red barn, bluebonnets, oak trees, and a fishing dock beside a winding creek." fetchpriority="high">'
      + '<div class="world-shade"></div><div class="welcome"><span class="eyebrow">TODAY AT LOST CREEK</span><h1>Hey, Rylee.<br>Let’s hit the trail.</h1>'
      + '<p>Measure the ranch and find Grandma’s number patterns. Your earlier jobs are here whenever you want to review.</p>'
      + button('module2', 'Play Module 2 · Lesson ' + (state.metric?.lesson || 1) + ' ' + icon('arrow'), 'gold start-today')
      + button('continue', resume ? continueLabel : 'Review place value', 'soft')
      + '</div><div class="map-sign map-barn">THE BARN</div><div class="map-sign map-creek">LOST CREEK</div>'
      + '<div class="world-caption"><span class="live-dot"></span> Review, today, and ahead. No clock.</div></section>'
      + '<section class="trail-section" id="chapter-list"><div class="section-heading"><div><span class="eyebrow dark">EARLIER RANCH WORK</span><h2>Place-value chapters to revisit.</h2></div>'
      + button('practice', 'Free practice', 'text') + '</div>'
      + '<div class="chapter-grid">' + cards + '</div></section>'
      + '<section class="porch-invite"><img src="assets/grandma.webp" alt="Grandma smiling and holding a hand of playing cards." class="grandma-cutout">'
      + '<div><span class="eyebrow dark">GRANDMA’S GAME PORCH</span><h2>“I saved you a seat.”</h2><p>'
      + (unlocked ? 'Your game porch is open. Play a round together whenever you like.' : 'Finish a ranch job, then enjoy a real game with Grandma.')
      + '</p>' + (unlocked ? button('porch', 'Play with Grandma ' + icon('heart'), 'forest') : '<span class="unlock-note">Your first job opens the porch</span>')
      + '</div><div class="porch-stats"><strong>' + state.jobs + '</strong><span>jobs<br>completed</span></div></section>'
      + '<footer class="map-footer"><span>Lost Creek Ranch · Rylee, Friend, Mama, Elvis & Grandma</span>'
      + button('journal', 'Learning journal', 'text') + '</footer>', 'map');
  }
  function freePractice() {
    session = null; current = null;
    const recommended = state.focus === 'next' ? 'trail' : 'fish';
    const cards = Object.entries(trails).map(([id, t]) =>
      '<button class="trail-card ' + t.color + '" data-action="start" data-id="' + id + '"><span class="trail-symbol">' + t.mark
      + '</span><span class="trail-copy"><strong>' + t.name + '</strong><span>' + t.label + '</span><small>'
      + (recommended === id ? 'TODAY’S TRAIL · ' : '') + '6 challenges</small></span><span class="card-arrow">↗</span></button>').join('');
    mount('<section class="trail-section"><div class="section-heading"><div><span class="eyebrow dark">FREE PRACTICE</span><h1>The old ranch trails are still here.</h1></div>'
      + button('map', '← Chapters', 'soft') + '</div><p class="small">These trails keep your earlier stars and jobs. They are extra practice, not a new chapter.</p>'
      + '<div class="trail-grid">' + cards + '</div></section>', 'Free practice');
  }
  function openChapter(id, explicit) {
    if (!C.byId[id]) return;
    if (explicit) state.explicitChapter = id;
    const ch = C.byId[id];
    P.syncStatus(state, id);
    const st = state.chapters[id];
    const nextMission = ch.missions.find(m => !st.missions[m.id]?.completed) || ch.missions[0];
    const started = st.status !== 'not-started';
    const primary = started ? 'Continue this chapter' : 'Start the first job';
    mount('<section class="chapter-intro" data-scene="' + ch.id + '"><img class="scene-art chapter-scene" src="' + ch.scene
      + '" alt="" style="object-position:' + ch.crop.desktop + '">'
      + '<div class="intro-panel"><span class="eyebrow dark">CHAPTER ' + ch.number + ' · ' + escape(ch.location).toUpperCase()
      + '</span><h1>' + escape(ch.title) + '</h1><p><strong>The job.</strong> ' + escape(ch.job)
      + '</p><p><strong>What you will learn.</strong> ' + escape(ch.learn)
      + '</p><p><strong>What finishing earns.</strong> ' + escape(ch.earns) + '</p>'
      + button('begin-chapter', primary + ' ' + icon('arrow'), 'gold', 'data-id="' + id + '" data-mission="' + nextMission.id + '"')
      + (st.status === 'ready-for-check' || st.status === 'practiced-with-help' || st.status === 'passed' || st.status === 'remembered'
        ? button('checkpoint', 'Try a chapter check', 'forest', 'data-id="' + id + '"') : '')
      + button('map', 'Choose a different chapter', 'text')
      + '</div></section>', 'Chapter introduction');
  }
  function beginChapter(id, missionId) {
    const ch = C.byId[id];
    if (!ch) return;
    const st = state.chapters[id];
    const mid = missionId || (ch.missions.find(m => !st.missions[m.id]?.completed) || ch.missions[0]).id;
    const ms = C.mission(id, mid);
    if (!st.missions[mid]) st.missions[mid] = { completed: false, index: 0, taught: false, question: null };
    if (!st.missions[mid].taught) startTeach(id, mid);
    else startMissionPractice(id, mid, false);
  }
  function startTeach(chapterId, missionId) {
    const ch = C.byId[chapterId], ms = C.mission(chapterId, missionId);
    teach = M.makeTeach(ms.teach, rng);
    bundle = teach.start ? { ...teach.start } : null;
    session = { kind: 'mission', chapterId, missionId, phase: 'teach', index: 0, length: 4, solved: false, independent: 0, sessionId: P.newSession(state) };
    state.resume = { kind: 'mission', chapterId, missionId, phase: 'teach', index: 0, question: null, attempts: 0, helped: false, wrong: [], typed: false, sessionId: session.sessionId, independent: 0, skillHits: {}, results: [] };
    renderTeach();
  }
  function bundleBoard(showTotal, total) {
    const b = bundle;
    if (!b) return '';
    const dots = (n, cls) => Array.from({ length: Math.min(n, 40) }, () => '<span class="unit-dot ' + cls + '"></span>').join('');
    return '<div class="bundle-wrap"><div class="bundle-board" aria-label="Place-value bundles. Hundreds ' + b.hundreds + ', tens ' + b.tens + ', ones ' + b.ones + '.'
      + (showTotal ? ' Total ' + total + '.' : '') + '">'
      + '<div class="bundle-col"><strong>' + b.hundreds + '</strong><span>hundreds</span><div class="ten-units">' + dots(b.hundreds, 'hundred') + '</div></div>'
      + '<div class="bundle-col"><strong>' + b.tens + '</strong><span>tens</span><div class="ten-units">' + dots(b.tens, 'ten') + '</div></div>'
      + '<div class="bundle-col"><strong>' + b.ones + '</strong><span>ones</span><div class="ten-units">' + dots(b.ones, 'one') + '</div></div>'
      + '</div><div class="bundle-tools">'
      + button('pack-ones', 'Pack 10 ones', 'forest') + button('unpack-tens', 'Unpack 1 ten', 'soft')
      + button('pack-tens', 'Pack 10 tens', 'forest') + button('unpack-hundreds', 'Unpack 1 hundred', 'soft')
      + '</div>' + (showTotal ? '<p class="bundle-total">Total: <strong>' + M.format(total) + '</strong>. The amount does not change.</p>' : '<p class="bundle-total">Find the total after you trade.</p>') + '</div>';
  }
  function renderTeach() {
    const ch = C.byId[session.chapterId], ms = C.mission(session.chapterId, session.missionId);
    const jobIndex = ch.missions.findIndex(m => m.id === ms.id) + 1;
    const visual = teach.start ? bundleBoard(true, teach.total) : '<div class="visual-model">' + model(teach.question, true) + '</div>';
    mount('<section class="lesson-shell"><div class="lesson-top">' + button('map', 'Save & exit', 'text')
      + '<span>Chapter ' + ch.number + ' · Job ' + jobIndex + ' of 3</span><strong>' + escape(ms.title) + '</strong></div>'
      + '<div class="lesson-layout"><aside class="coach"><img src="assets/grandma.webp" alt="Grandma is here to help"><span class="eyebrow dark">GRANDMA’S TIP</span>'
      + '<p id="coach-copy">' + escape(teach.hint) + '</p></aside>'
      + '<article class="question-card"><div class="question-meta"><span>Learn this job</span><span>Teaching</span></div>'
      + '<h1>' + escape(teach.prompt) + '</h1>' + visual
      + '<div id="feedback" role="status" aria-live="polite" class="feedback gentle">'
      + (teach.start ? 'Try the trade with the buttons. Then we will practice with new numbers.' : 'Look at this example. Then we will try a new one together.')
      + '</div>'
      + '<div id="next-area">' + button('teach-next', 'I’m ready to try ' + icon('arrow'), 'gold') + '</div></article></div></section>', 'Learn this job');
  }
  function applyBundle(action) {
    if (!bundle) return;
    const before = bundle.total;
    if (action === 'pack-ones') bundle = M.bundlePack(bundle, 'ones');
    if (action === 'pack-tens') bundle = M.bundlePack(bundle, 'tens');
    if (action === 'unpack-tens') bundle = M.bundleUnpack(bundle, 'tens');
    if (action === 'unpack-hundreds') bundle = M.bundleUnpack(bundle, 'hundreds');
    if (bundle.total !== before) bundle = M.bundleFrom(bundle.ones, bundle.tens, bundle.hundreds);
    const host = $('main').querySelector('.bundle-wrap');
    if (host) {
      const show = !!$('main').querySelector('.bundle-total strong');
      host.outerHTML = bundleBoard(show, bundle.total);
    }
    const f = $('feedback');
    if (f && teach && teach.total != null && bundle.total === teach.total) {
      f.textContent = 'The total is still ' + M.format(bundle.total) + '. Nice trade.';
    }
  }
  function finishTeach() {
    if (!session || session.phase !== 'teach') return;
    const st = state.chapters[session.chapterId];
    st.missions[session.missionId].taught = true;
    P.syncStatus(state, session.chapterId);
    startMissionPractice(session.chapterId, session.missionId, true);
  }
  function startMissionPractice(chapterId, missionId, fromTeach) {
    const ch = C.byId[chapterId], ms = C.mission(chapterId, missionId);
    const saved = state.chapters[chapterId].missions[missionId] || { index: 0, question: null, taught: true, completed: false };
    const index = Math.min(saved.index, 3);
    session = {
      kind: 'mission', chapterId, missionId, phase: 'practice', index, length: 4, solved: false,
      independent: 0, sessionId: state.resume?.sessionId || P.newSession(state)
    };
    teach = null;
    if (saved.question && saved.question.id && fromTeach !== true) presentQuestion(saved.question, saved.question.format === 'numeric');
    else nextMissionQuestion();
  }
  function missionTemplate(ms, index, chapterId) {
    if (index === 3) {
      const prev = C.previousSkills(chapterId);
      if (prev.length) return prev[index % prev.length];
    }
    return ms.templates[index % ms.templates.length];
  }
  function nextMissionQuestion() {
    const ch = C.byId[session.chapterId], ms = C.mission(session.chapterId, session.missionId);
    const template = missionTemplate(ms, session.index, session.chapterId);
    const skill = (C.mission(session.chapterId, session.missionId).skills[0]);
    const level = M.levelFor(state, skill);
    let q;
    if (template === 'units-ones' && session.index === 1) q = M.makeBundleQuestion(level, rng);
    else q = M.nextTemplate(template, level, state.recent, rng);
    const typed = q.numeric && q.format !== 'bundle' && (session.index === 2 || q.format === 'numeric');
    presentQuestion(q, typed);
  }
  function presentQuestion(q, typed) {
    current = { q, attempts: 0, helped: false, solved: false, wrong: new Set(), typed: !!typed };
    bundle = q.model && q.model.type === 'bundle' ? { ...q.model.start } : bundle;
    state.resume = {
      kind: session.kind, chapterId: session.chapterId, missionId: session.missionId || null,
      phase: session.phase || 'practice', index: session.index, question: q, attempts: 0, helped: false,
      wrong: [], typed: !!typed, sessionId: session.sessionId, independent: session.independent || 0,
      skillHits: session.skillHits || {}, results: session.results || []
    };
    if (session.kind === 'mission') {
      const ms = state.chapters[session.chapterId].missions[session.missionId];
      ms.index = session.index;
      ms.question = q;
    }
    persist();
    renderQuestion();
  }
  function chart(number, highlight) {
    const digits = String(number).padStart(Math.max(4, String(number).length), '0').split('');
    return '<div class="place-chart" aria-label="Place-value chart for ' + M.format(number) + '">' + digits.map((d, i) => {
      const power = digits.length - i - 1;
      return '<div class="place-cell ' + (power === highlight ? 'highlight' : '') + '"><span>' + M.places[power]
        + '</span><strong>' + d + '</strong></div>';
    }).join('') + '</div>';
  }
  function model(q, reveal = false) {
    if (!q || !q.model) return '';
    const m = q.model;
    if (m.type === 'bundle') return bundleBoard(!!m.showTotal || reveal, (bundle || m.start).total);
    if (m.type === 'shift') return '<div class="model-caption">' + (m.direction === 'left' ? 'TEN TIMES AS MUCH' : 'ONE TENTH AS MUCH') + '</div>'
      + chart(m.before) + '<div class="shift-arrow">' + (m.direction === 'left' ? '← ×10 · one place left' : 'one place right · ÷10 →') + '</div>'
      + (reveal ? chart(m.after) : '<p class="model-note">Picture where each digit will land.</p>');
    if (m.type === 'place') return chart(m.number, (reveal || session?.kind !== 'checkpoint') ? m.highlight : undefined);
    if (m.type === 'trade') return '<div class="trade-model"><div class="unit-bundle"><strong>1</strong><span>'
      + M.places[m.high].replace(/s$/, '') + '</span></div><span class="trade-equals">=</span><div class="ten-units">'
      + Array.from({ length: 10 }, () => '<span class="unit-dot"></span>').join('')
      + '<small>10 ' + M.places[m.high - 1] + '</small></div></div>';
    if (m.type === 'line') {
      const percent = (m.number - m.lower) / (m.upper - m.lower) * 100;
      const label = session && session.kind === 'checkpoint' && !reveal ? 'the number' : M.format(m.number);
      return '<div class="number-line"><div class="line-endpoints"><span>' + M.format(m.lower) + '</span><span>' + M.format(m.upper) + '</span></div>'
        + '<div class="line-track"><span class="line-mid"></span><span class="line-point" style="left:' + percent + '%"><b>' + label
        + '</b></span></div>' + (reveal || session?.kind !== 'checkpoint' ? '<div class="line-half">Halfway: ' + M.format(m.midpoint) + '</div>' : '<div class="line-half">Find halfway, then decide.</div>') + '</div>';
    }
    return (m.values || []).map(n => chart(n)).join('');
  }
  function renderQuestion() {
    const q = current.q;
    const heading = session.kind === 'checkpoint' ? 'Chapter check' : session.kind === 'placement' ? 'Starting check' : 'Math challenge';
    const ch = session.chapterId ? C.byId[session.chapterId] : null;
    const ms = session.missionId ? C.mission(session.chapterId, session.missionId) : null;
    const jobIndex = ch && ms ? ch.missions.findIndex(m => m.id === ms.id) + 1 : 0;
    const top = session.kind === 'mission'
      ? 'Chapter ' + ch.number + ' · Job ' + jobIndex + ' of 3'
      : session.kind === 'checkpoint' ? 'Chapter ' + ch.number + ' check' : 'Starting check';
    const step = (session.index + 1) + ' / ' + session.length;
    const coach = session.kind === 'checkpoint' && !current.helped
      ? 'Take your time. Help is here if you need it.'
      : q.hint;
    const letters = 'ABCD';
    const choices = current.typed || q.format === 'bundle'
      ? '<form id="answer-form"><label for="number-answer">' + (q.format === 'bundle' ? 'How many tens now?' : 'Write your answer') + '</label><div class="answer-input-row"><input id="number-answer" autocomplete="off" inputmode="numeric" placeholder="Your number" aria-describedby="input-note"><button class="button gold" type="submit">Check it ' + icon('arrow') + '</button></div><small id="input-note">Numbers only. Commas are optional.</small></form>'
      : '<div class="answers">' + q.options.map((o, i) => '<button class="answer" data-action="answer" data-id="' + o.id + '"><span class="answer-letter">'
        + letters[i] + '</span><span>' + escape(o.text) + '</span></button>').join('') + '</div>';
    mount('<section class="lesson-shell"><div class="lesson-top">' + button('map', 'Save & exit', 'text') + '<span>' + top + '</span>'
      + (ms ? '<strong>' + escape(ms.title) + '</strong>' : '<span>' + step + '</span>') + '</div>'
      + '<div class="lesson-layout"><aside class="coach"><img src="assets/grandma.webp" alt="Grandma is here to help"><span class="eyebrow dark">GRANDMA’S TIP</span>'
      + '<p id="coach-copy">' + escape(coach) + '</p><div class="coach-tools">'
      + button('hint', 'Show me how', 'forest') + button('speak', icon('sound') + ' Read aloud', 'soft') + '</div>'
      + '<p class="coach-note">Mistakes are part of learning.<br>We can figure it out together.</p></aside>'
      + '<article class="question-card"><div class="question-meta"><span>' + escape(M.skills[q.skill] || 'Practice') + '</span><span>' + step + '</span></div>'
      + '<h1>' + escape(q.prompt) + '</h1><div class="visual-model">' + model(q, false) + '</div>'
      + choices
      + '<div id="feedback" role="status" aria-live="polite" class="feedback" hidden></div>'
      + '<div id="next-area"></div></article></div></section>', heading);
    const form = $('answer-form');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); submitNumber(); });
  }
  function showHint() {
    if (!current) return;
    const coach = $('coach-copy');
    const vis = $('main').querySelector('.visual-model');
    if (coach) coach.textContent = current.q.explanation;
    if (vis) vis.innerHTML = model(current.q, true);
    if (current.solved) return;
    current.helped = true;
    if (state.resume) state.resume.helped = true;
    const feedback = $('feedback');
    if (feedback) {
      feedback.hidden = false;
      feedback.className = 'feedback gentle';
      feedback.textContent = session.kind === 'checkpoint'
        ? 'This one will count as practice with help, not as an independent check.'
        : 'Use the example, then give it a try. You still earn your star.';
    }
    persist();
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
  function answer(correct, optionId) {
    if (!current || current.solved || (screen !== 'Math challenge' && screen !== 'Chapter check' && screen !== 'Starting check')) return;
    if (optionId !== null && current.wrong.has(optionId)) return;
    current.attempts++;
    const f = $('feedback'); f.hidden = false;
    if (!correct) {
      if (optionId !== null) {
        current.wrong.add(optionId);
        const b = $('main').querySelector('[data-action="answer"][data-id="' + optionId + '"]');
        if (b) { b.disabled = true; b.classList.add('try-again'); }
      }
      f.className = 'feedback gentle';
      f.textContent = current.q.skill === 'value' ? 'That\'s the digit. What is it worth in this place?' : 'Not quite yet. ' + current.q.hint;
      if (current.attempts >= 2 || session.kind === 'checkpoint') showHint();
      persist();
      return;
    }
    current.solved = true;
    const independent = current.attempts === 1 && !current.helped;
    session.independent = (session.independent || 0) + (independent ? 1 : 0);
    if (!session.skillHits) session.skillHits = {};
    if (independent) session.skillHits[current.q.skill] = true;
    if (!session.results) session.results = [];
    session.results.push({ id: current.q.id, independent, skill: current.q.skill });
    M.recordAnswer(state, current.q, independent);
    if (independent) $('coach-copy').textContent = 'You found the place and its value.';
    else $('coach-copy').textContent = 'You used the chart to work it out. Let\'s try a new one together.';
    persist();
    $('main').querySelectorAll('.answer, #answer-form button, #number-answer').forEach(el => { el.disabled = true; });
    if (optionId !== null) {
      const b = $('main').querySelector('[data-id="' + optionId + '"]');
      if (b) b.classList.add('correct');
    }
    f.className = 'feedback success';
    f.textContent = 'You got it! +1 star. ' + current.q.explanation;
    const vis = $('main').querySelector('.visual-model');
    if (vis) vis.innerHTML = model(current.q, true);
    const last = session.index >= session.length - 1;
    $('next-area').innerHTML = button('next', last ? 'Job done! ' + icon('arrow') : 'Next challenge ' + icon('arrow'), 'forest');
  }
  function next() {
    if (!session || !current?.solved) return;
    session.index++;
    if (session.kind === 'mission') {
      state.chapters[session.chapterId].missions[session.missionId].index = session.index;
      state.chapters[session.chapterId].missions[session.missionId].question = null;
      if (session.index < session.length) nextMissionQuestion();
      else completeMission();
    } else if (session.kind === 'checkpoint') {
      if (session.index < session.length) nextCheckpointQuestion();
      else completeCheckpoint();
    } else if (session.kind === 'placement') nextPlacement();
  }
  function completeMission() {
    if (!session || session.solved) return;
    session.solved = true;
    const st = state.chapters[session.chapterId].missions[session.missionId];
    st.completed = true; st.question = null; st.index = 4;
    state.jobs++;
    P.syncStatus(state, session.chapterId);
    state.resume = null;
    const ch = C.byId[session.chapterId], ms = C.mission(session.chapterId, session.missionId);
    const ready = state.chapters[session.chapterId].status === 'ready-for-check';
    persist();
    mount('<section class="celebration"><img class="scene-art" src="assets/porch.webp" alt="Grandma and Rylee enjoying a game together on the ranch porch">'
      + '<div class="celebration-card"><span class="eyebrow dark">A RANCH JOB DONE</span><div class="earned-stars">★ ★ ★</div><h1>You stuck with it!</h1>'
      + '<p>' + escape(ms.action) + '</p><div class="result-row"><span><strong>4</strong>practice questions</span><span><strong>+4</strong>stars earned</span></div>'
      + (ready ? '<p class="small">This chapter is ready for a check when you are.</p>' : '<p class="small">Grandma\'s got the cards. Your seat is waiting.</p>')
      + button('porch', 'Play with Grandma ' + icon('heart'), 'gold')
      + (ready ? button('checkpoint', 'Try a chapter check', 'forest', 'data-id="' + ch.id + '"') : button('begin-chapter', 'Next ranch job', 'forest', 'data-id="' + ch.id + '"'))
      + button('map', 'Back to the ranch', 'text') + '</div></section>', 'Adventure complete');
  }
  function startCheckpoint(id) {
    const ch = C.byId[id];
    if (!ch) return;
    session = {
      kind: 'checkpoint', chapterId: id, missionId: null, phase: 'practice', index: 0, length: 6,
      solved: false, independent: 0, skillHits: {}, results: [], sessionId: P.newSession(state), blueprint: checkpointBlueprint(ch)
    };
    nextCheckpointQuestion();
  }
  function checkpointBlueprint(ch) {
    const items = [];
    const formats = ch.checkpoint.formats;
    const templates = ch.checkpoint.templates || ch.checkpoint.skills;
    ch.checkpoint.skills.forEach((skill, i) => {
      const template = templates[i % templates.length];
      items.push({ skill, template, format: formats[i % formats.length] });
      items.push({ skill, template: templates[(i + 1) % templates.length], format: formats[(i + 1) % formats.length] });
    });
    const mixed = ch.checkpoint.mixed || [];
    let n = 0;
    while (items.length < 6) {
      if (mixed.length) items.push({ skill: mixed[n % mixed.length], template: mixed[n % mixed.length], format: 'choice' });
      else items.push({ skill: ch.checkpoint.skills[0], template: ch.checkpoint.skills[0], format: formats[items.length % formats.length] });
      n++;
    }
    return items.slice(0, 6);
  }
  function nextCheckpointQuestion() {
    const spec = session.blueprint[session.index];
    let q;
    if (spec.format === 'bundle') q = M.makeBundleQuestion(1, rng);
    else q = M.nextTemplate(spec.template, 1, state.recent, rng);
    const typed = spec.format === 'numeric' && q.numeric;
    presentQuestion(q, typed);
  }
  function completeCheckpoint() {
    if (!session || session.solved) return;
    session.solved = true;
    const ch = C.byId[session.chapterId];
    const passed = P.recordCheck(state, session.chapterId, session.independent, session.skillHits, session.sessionId, ch.skills);
    state.resume = null;
    persist();
    const copy = passed
      ? (state.chapters[ch.id].status === 'remembered'
        ? 'You remembered this on a later visit with new questions.'
        : 'You passed a check. That is practice evidence, not a school grade.')
      : 'Let\'s practice this part, then try another check when you\'re ready.';
    mount('<section class="celebration"><img class="scene-art" src="assets/porch.webp" alt="Grandma and Rylee on the ranch porch">'
      + '<div class="celebration-card"><span class="eyebrow dark">CHAPTER CHECK</span><h1>' + (passed ? 'Passed a check' : 'Practiced with help') + '</h1>'
      + '<p>' + copy + '</p><div class="result-row"><span><strong>' + session.independent + '</strong>independent</span><span><strong>6</strong>questions</span></div>'
      + (passed ? '<p class="keepsake-stamp"><span aria-hidden="true">▣</span> ' + escape(ch.keepsake.title) + '<br><small>' + escape(ch.keepsake.caption) + '</small></p>' : '')
      + button('porch', 'Play with Grandma ' + icon('heart'), 'gold')
      + button('map', 'Next ranch job', 'forest') + '</div></section>', passed ? 'Passed a check' : 'Practiced with help');
  }
  function startPlacement() {
    session = { kind: 'placement', chapterId: 'bundles', missionId: null, index: 0, length: 2, chapterIndex: 0, misses: 0, solved: false, sessionId: P.newSession(state) };
    nextPlacementQuestion();
  }
  function nextPlacementQuestion() {
    const ch = C.list[session.chapterIndex];
    session.chapterId = ch.id;
    const template = ch.skills[session.index % ch.skills.length];
    const q = M.nextTemplate(template, 1, state.recent, rng);
    presentQuestion(q, false);
  }
  function nextPlacement() {
    const lastIndependent = session.results[session.results.length - 1]?.independent;
    if (!lastIndependent) session.misses++;
    else session.misses = 0;
    if (session.misses >= 2) {
      state.placement.done = true;
      state.placement.stoppedAt = session.chapterId;
      state.placement.recommended = session.chapterId;
      state.resume = null;
      persist();
      mount('<section class="journal"><h1>Starting check paused</h1><p>This looks like a good chapter to practice: ' + escape(C.byId[session.chapterId].title) + '. You can still choose any chapter.</p>'
        + button('chapter', 'Open this chapter', 'gold', 'data-id="' + session.chapterId + '"') + button('map', 'Back to the ranch', 'text') + '</section>', 'Starting check');
      return;
    }
    session.index++;
    if (session.index >= 2) {
      session.index = 0;
      session.chapterIndex++;
      session.misses = 0;
    }
    if (session.chapterIndex >= C.list.length) {
      state.placement.done = true;
      state.placement.recommended = 'round';
      state.resume = null;
      persist();
      mount('<section class="journal"><h1>Ready for a challenge</h1><p>The short check did not find a sticking point. That is not automatic mastery. Try a later chapter if you like, or keep practicing.</p>'
        + button('chapter', 'Open Family Day', 'gold', 'data-id="round"') + button('map', 'Back to the ranch', 'text') + '</section>', 'Starting check');
      return;
    }
    nextPlacementQuestion();
  }
  function continueAdventure() {
    const r = state.resume;
    if (r && r.kind === 'mission') {
      if (r.phase === 'teach') { startTeach(r.chapterId, r.missionId); return; }
      startMissionPractice(r.chapterId, r.missionId, false);
      return;
    }
    if (r && r.kind === 'checkpoint' && r.question) {
      session = { kind: 'checkpoint', chapterId: r.chapterId, index: r.index, length: 6, solved: false, independent: r.independent, skillHits: r.skillHits || {}, results: r.results || [], sessionId: r.sessionId, blueprint: checkpointBlueprint(C.byId[r.chapterId]), phase: 'practice' };
      presentQuestion(r.question, r.typed);
      current.attempts = r.attempts; current.helped = r.helped;
      return;
    }
    openChapter(recommendedChapter(), false);
  }
  function start(id) {
    if (!trails[id]) return;
    session = { id, index: 0, independent: 0, length: 6, solved: false, skills: [], kind: 'trail' };
    const t = trails[id];
    const sorted = t.skills.slice().sort((a, b) => {
      const ra = state.skills[a]?.recent || [], rb = state.skills[b]?.recent || [];
      const score = list => list.length ? list.filter(Boolean).length / list.length : 0;
      return score(ra) - score(rb);
    });
    session.skills = Array.from({ length: 6 }, (_, i) => sorted[i % sorted.length]);
    mount('<section class="mission-intro"><img class="scene-art" src="assets/ranch.webp" alt="Lost Creek Ranch">'
      + '<div class="intro-panel"><span class="eyebrow dark">FREE PRACTICE · 6 CHALLENGES</span><h1>' + t.name + '</h1><p>' + t.intro
      + '</p><div class="job-reward">' + icon('star') + '<span>' + t.object + '<br><small>Then it’s game time with Grandma.</small></span></div>'
      + button('begin', 'I’m ready ' + icon('arrow'), 'gold') + button('practice', 'Choose another trail', 'text')
      + '</div></section>', 'Adventure briefing');
  }
  function begin() {
    if (!session || session.kind !== 'trail') return;
    const skill = session.skills[session.index];
    const q = M.nextQuestion(skill, M.levelFor(state, skill), state.recent);
    current = { q, attempts: 0, helped: false, solved: false, wrong: new Set(), typed: q.numeric && session.index % 3 === 2 };
    renderTrailQuestion();
  }
  function renderTrailQuestion() {
    const t = trails[session.id], q = current.q;
    const dots = Array.from({ length: 6 }, (_, i) => '<span class="' + (i < session.index ? 'done' : i === session.index ? 'active' : '') + '">'
      + (i < session.index ? '✓' : i + 1) + '</span>').join('');
    const choices = current.typed
      ? '<form id="answer-form"><label for="number-answer">Write your answer</label><div class="answer-input-row"><input id="number-answer" autocomplete="off" inputmode="numeric" placeholder="Your number" aria-describedby="input-note"><button class="button gold" type="submit">Check it ' + icon('arrow') + '</button></div><small id="input-note">Numbers only. Commas are optional.</small></form>'
      : '<div class="answers">' + q.options.map((o, i) => '<button class="answer" data-action="t-answer" data-index="' + i + '" data-id="' + o.id + '"><span class="answer-letter">'
        + String.fromCharCode(65 + i) + '</span><span>' + escape(o.text) + '</span></button>').join('') + '</div>';
    mount('<section class="lesson-shell"><div class="lesson-top">' + button('practice', '← Free practice', 'text') + '<span>' + t.name + '</span><div class="step-dots" aria-label="Question ' + (session.index + 1) + ' of 6">' + dots + '</div></div>'
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
  function trailNext() {
    if (!session || session.kind !== 'trail' || !current?.solved) return;
    session.index++;
    if (session.index < 6) begin();
    else {
      if (session.solved) return;
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
  }
  function porch() {
    if (state.jobs === 0) { chapterMap(); return; }
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
    const chapterRows = C.list.map(ch => {
      P.syncStatus(state, ch.id);
      const st = state.chapters[ch.id];
      const done = ch.missions.filter(m => st.missions[m.id]?.completed).length;
      const label = C.statuses[st.status].label;
      return '<div class="skill-row"><div><strong>Chapter ' + ch.number + '. ' + escape(ch.title) + '</strong><span>'
        + done + ' of 3 jobs · ' + escape(label) + (st.keepsake ? ' · ' + escape(ch.keepsake.title) : '') + '</span></div></div>';
    }).join('');
    const checks = state.checks.slice(-6).reverse().map(c => '<li>' + escape(C.byId[c.chapterId].title) + ': '
      + (c.passed ? 'passed' : 'practiced with help') + ' (' + c.independent + ' independent)</li>').join('') || '<li>No chapter checks yet.</li>';
    const rec = recommendedChapter();
    mount('<section class="journal"><div class="section-heading"><div><span class="eyebrow dark">FOR RYLEE & HIS GROWN-UPS</span><h1>The learning journal</h1></div>'
      + button('map', '← Ranch', 'soft') + '</div><div class="journal-grid"><article class="journal-card"><h2>What are we practicing?</h2>'
      + '<p>Review the earlier place-value chapters, or play the new Module 2 measurement and patterns trail. These are original practice problems, not a replacement for the Succeed book.</p>'
      + button('module2', 'Open Module 2', 'forest')
      + '<label for="parent-start">Starting chapter</label><select id="parent-start"><option value="">Recommend for us</option>'
      + C.list.map(ch => '<option value="' + ch.id + '"' + (state.parentStart === ch.id ? ' selected' : '') + '>Chapter ' + ch.number + '. ' + escape(ch.title) + '</option>').join('')
      + '</select><p class="small">A parent can start on any chapter. An advanced child may take a check without every earlier job.</p>'
      + button('placement', 'Try a short starting check', 'forest')
      + '<h2>Ranch keepsakes</h2>' + chapterRows
      + '<h2>Recent checks</h2><ul class="small">' + checks + '</ul>'
      + '<p class="small">Recommended review: ' + escape(C.byId[rec].title) + '.</p>'
      + '</article><article class="journal-card"><h2>Growing confidence</h2><p class="small">The last eight completed questions in each skill. Green = first try without hints. Gold = solved with support. This is practice history, not a test score.</p>'
      + rows + '<p class="small">Larger numbers appear after at least five independent answers in a recent window of six or more.</p>'
      + '<h2>Try it with your hands</h2><p>Trade ten ones for one ten. The amount does not change.</p><div id="trade-lab"></div>'
      + '</article></div>'
      + '<p class="privacy-note">Progress stays in this browser on this device. No account, ads, or tracking. The Module 2 lesson order is taken from the Grade 4 teacher edition, Edition 1.</p></section>', 'Learning journal');
    $('parent-start').addEventListener('change', e => {
      state.parentStart = e.target.value || null;
      if (state.parentStart) state.explicitChapter = state.parentStart;
      persist();
    });
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
    if (a === 'map') chapterMap();
    else if (a === 'module2') { stop(); RanchModule2.open({ target: $('main'), state, save: persist, onExit: chapterMap, onPorch: porch }); }
    else if (a === 'practice') freePractice();
    else if (a === 'choose') {
      const first = $('main').querySelector('button.chapter-card');
      $('chapter-list')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      if (first) first.focus();
    }
    else if (a === 'chapter') openChapter(b.dataset.id, true);
    else if (a === 'continue') continueAdventure();
    else if (a === 'begin-chapter') beginChapter(b.dataset.id, b.dataset.mission);
    else if (a === 'teach-next') finishTeach();
    else if (a === 'pack-ones' || a === 'pack-tens' || a === 'unpack-tens' || a === 'unpack-hundreds') applyBundle(a);
    else if (a === 'checkpoint') startCheckpoint(b.dataset.id);
    else if (a === 'placement') startPlacement();
    else if (a === 'journal') journal();
    else if (a === 'start') start(b.dataset.id);
    else if (a === 'begin') begin();
    else if (a === 'hint') showHint();
    else if (a === 'speak') speak();
    else if (a === 'answer' && current) answer(M.gradeOption(current.q, b.dataset.id), b.dataset.id);
    else if (a === 't-answer' && current) {
      const i = Number(b.dataset.index);
      answer(current.q.options[i].correct, current.q.options[i].id);
      if (current.solved) $('next-area').innerHTML = button('t-next', session.index === 5 ? 'Job done! ' + icon('arrow') : 'Next challenge ' + icon('arrow'), 'forest');
    }
    else if (a === 'next') next();
    else if (a === 't-next') trailNext();
    else if (a === 'porch') porch();
    else if (a === 'memory') startMemory();
    else if (a === 'flip') flip(Number(b.dataset.index));
    else if (a === 'stones') stones();
    else if (a === 'throw') throwStone();
    else if (a === 'trade') { tradeCount = tradeCount ? 0 : 10; drawTrade(); }
  });
  window.addEventListener('pagehide', stop);
  chapterMap();
})();

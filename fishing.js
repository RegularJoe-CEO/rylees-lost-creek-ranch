(function (root) {
  'use strict';
  const topics = [
    { id: 'area', name: 'The warm-up cove', short: 'Area and perimeter', note: 'Earlier Module 3 work' },
    { id: 'tens', name: 'The sunny dock', short: 'Multiply by 10 and 100', note: 'A good place to start' },
    { id: 'products', name: 'The deep channel', short: 'Larger multiplication', note: 'Keep moving forward' },
    { id: 'division', name: 'The far bank', short: 'Sharing with remainders', note: 'Explore ahead' }
  ];
  const stories = [
    {
      title: 'A ripple by the reeds',
      text: 'Grandma and Rylee walk to the creek. The water is quiet. Then a ripple moves beside the reeds. Grandma points to the small waves. “A fish may be hiding there,” she says. Rylee waits and watches.',
      word: 'ripple', chunks: 'rip · ple', distractors: ['ri · pple', 'ripp · le'],
      ask: 'Where did Grandma see the ripple?', choices: ['Beside the reeds', 'Inside the barn', 'Under the porch'],
      evidence: 'a ripple moves beside the reeds.'
    },
    {
      title: 'The red bobber',
      text: 'Rylee drops a red bobber near the dock. It floats in the sunlight. He sees a dark shape below it. The bobber dips once, then pops up. Grandma says, “Watch closely. The fish might come back.”',
      word: 'sunlight', chunks: 'sun · light', distractors: ['su · nlight', 'sunl · ight'],
      ask: 'What did the bobber do?', choices: ['It dipped, then popped up', 'It rolled onto the road', 'It turned into a leaf'],
      evidence: 'The bobber dips once, then pops up.'
    },
    {
      title: 'A careful catch',
      text: 'A little fish swims near the rocks. Rylee makes a careful turn of the reel so the line stays steady. Grandma helps him lift the fish from the water. They look at its bright scales. Then they gently put it back in the creek.',
      word: 'careful', chunks: 'care · ful', distractors: ['car · eful', 'caref · ul'],
      ask: 'What did they do after looking at the fish?', choices: ['Put it back in the creek', 'Take it to the barn', 'Hide it under a rock'],
      evidence: 'Then they gently put it back in the creek.'
    },
    {
      title: 'A sign at the bend',
      text: 'Grandma reads the wooden sign at the bend. It says to keep the creek clean. Rylee finds an empty bag near the path. He puts it in a bin. Now the bank is clear, and they can fish beside the tall grass.',
      word: 'wooden', chunks: 'wood · en', distractors: ['woo · den', 'w · ooden'],
      ask: 'Why did Rylee use the bin?', choices: ['To keep the creek clean', 'To catch a fish', 'To feed the birds'],
      evidence: 'It says to keep the creek clean.'
    },
    {
      title: 'The shade tree',
      text: 'The sun gets warm. Grandma finds a shady place under an oak tree. Rylee carries the tackle box there. They drink water and rest. Soon they hear a splash. Rylee smiles and gets his fishing rod ready again.',
      word: 'shady', chunks: 'sha · dy', distractors: ['sh · ady', 'shad · y'],
      ask: 'Where did Grandma find a place to rest?', choices: ['Under an oak tree', 'Inside the creek', 'Behind the school'],
      evidence: 'Grandma finds a shady place under an oak tree.'
    },
    {
      title: 'Tracks in the mud',
      text: 'Rylee spots tiny tracks near the water. A bird hops out of the grass and leaves new marks in the mud. Grandma asks him to look closely. The tracks lead toward the dock, where the bird takes a drink.',
      word: 'toward', chunks: 'to · ward', distractors: ['tow · ard', 't · oward'],
      ask: 'Who made the tracks?', choices: ['A bird', 'Grandma', 'A fish'],
      evidence: 'A bird hops out of the grass and leaves new marks in the mud.'
    }
  ];
  const spots = [
    { id: 'reeds', name: 'The reeds', emoji: '🌾', line: 'Listen for a swish in the tall grass.' },
    { id: 'dock', name: 'The dock', emoji: '🪵', line: 'The bobber floats in a patch of sun.' },
    { id: 'rocks', name: 'The rocks', emoji: '🪨', line: 'Watch for a ripple between the stones.' }
  ];
  const fish = ['Bluegill', 'Sunfish', 'Speckled trout', 'Creek bass', 'Silver minnow', 'Golden perch'];
  const stages = ['spot', 'read', 'word', 'question', 'cast', 'math', 'reel', 'catch', 'finish'];
  const integer = n => Number.isSafeInteger(n) && n >= 0 ? Math.min(n, 100000) : 0;
  function fresh() { return { focus: 'products', trips: 0, catches: 0, read: 0, math: 0, active: null }; }
  function normalize(raw) {
    const p = fresh();
    if (!raw || typeof raw !== 'object') return p;
    if (topics.some(t => t.id === raw.focus)) p.focus = raw.focus;
    for (const k of ['trips', 'catches', 'read', 'math']) p[k] = integer(raw[k]);
    const a = raw.active;
    if (a && typeof a === 'object' && stages.includes(a.stage) && integer(a.caught) <= 3 && Number.isSafeInteger(a.story) && a.story >= 0 && a.story < stories.length &&
      (!a.spot || spots.some(s => s.id === a.spot)) && (!a.task || validTask(a.task))) {
      p.active = { stage: a.stage, caught: integer(a.caught), story: a.story, spot: a.spot || null,
        task: a.task || null, reel: Math.min(integer(a.reel), 3), help: a.help === true };
    }
    return p;
  }
  function validTask(t) {
    return t && typeof t.prompt === 'string' && t.prompt.length < 240 && Number.isSafeInteger(t.correct) && t.correct >= 0 &&
      Array.isArray(t.choices) && t.choices.length === 3 && t.choices.includes(t.correct) && t.choices.every(n => Number.isSafeInteger(n) && n >= 0);
  }
  function choices(correct, wrong, turn) {
    const all = [...new Set(wrong.filter(n => Number.isSafeInteger(n) && n >= 0 && n !== correct))];
    let next = correct + 1;
    while (all.length < 2) { if (!all.includes(next)) all.push(next); next++; }
    all.length = 2;
    all.splice(turn % 3, 0, correct);
    return all;
  }
  function makeMathQuestion(topic, seed, turn) {
    const n = integer(seed);
    if (topic === 'area') {
      const a = 3 + n % 6, b = 4 + Math.floor(n / 7) % 6;
      if (n % 2 === 0) {
        const correct = a * b;
        return { prompt: `Grandma makes a rectangular fishing mat ${a} feet long and ${b} feet wide. What is its area in square feet?`,
          hint: `${a} rows of ${b} make ${a} × ${b} squares.`, correct, choices: choices(correct, [2 * (a + b), correct + a], turn) };
      }
      const correct = 2 * (a + b);
      return { prompt: `A rectangular dock is ${a} feet long and ${b} feet wide. How many feet around the edge?`,
        hint: `Add every side: ${a} + ${b} + ${a} + ${b}.`, correct, choices: choices(correct, [a * b, a + b], turn) };
    }
    if (topic === 'products') {
      const a = 12 + n % 36, b = 2 + Math.floor(n / 5) % 5, correct = a * b;
      return { prompt: `There are ${b} tackle boxes with ${a} hooks in each box. How many hooks altogether?`,
        hint: `${a} = ${Math.floor(a / 10) * 10} + ${a % 10}. Multiply: ${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b}, and ${a % 10} × ${b} = ${(a % 10) * b}. Add to get ${correct}.`, correct,
        choices: choices(correct, [correct + b, (a + 10) * b], turn) };
    }
    if (topic === 'division') {
      const b = 3 + n % 5, q = 3 + Math.floor(n / 7) % 7, r = 1 + Math.floor(n / 13) % (b - 1), total = b * q + r;
      return { prompt: `Grandma shares ${total} worms equally among ${b} bait cups. How many go in each cup, and how many are left over?`,
        hint: `Find the largest multiple of ${b} below ${total}. Then count what remains.`, correct: q * 10 + r,
        choices: choices(q * 10 + r, [(q + 1) * 10 + r, q * 10 + r + 1], turn), format: 'remainder' };
    }
    const a = 2 + n % 7, factor = n % 2 ? 100 : 10, correct = a * factor;
    return { prompt: `Each fish tag has ${a} marks. Grandma has ${factor} tags. How many marks are there altogether?`,
      hint: `Think ${a} × ${factor}. Ten times as many shifts one place; a hundred times as many shifts two.`, correct,
      choices: choices(correct, [a * (factor === 10 ? 100 : 10), correct + a], turn) };
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function open({ target, state, save, onExit, onPorch }) {
    state.fishing = normalize(state.fishing);
    const p = state.fishing;
    let note = '';
    function commit() { save(); }
    function button(action, label, cls = '') { return `<button type="button" class="button ${cls}" data-fishing="${action}">${label}</button>`; }
    function frame(body, title) {
      target.innerHTML = `<section class="fishing-shell"><div class="fishing-bar"><span>LOST CREEK FISHING</span>${button('exit', '← Ranch', 'soft')}</div>${body}</section>`;
      target.setAttribute('aria-label', title || 'Fishing at Lost Creek');
      const h = target.querySelector('h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
      commit();
    }
    function progress() {
      return `<div class="fishing-progress" aria-label="${p.active.caught} of 3 fish caught">${Array.from({length:3}, (_, i) => `<span class="${i < p.active.caught ? 'caught' : ''}">${i < p.active.caught ? '🐟' : '○'}</span>`).join('')}<small>Catch three fish with Grandma</small></div>`;
    }
    function home() {
      const list = topics.map(t => `<option value="${t.id}"${p.focus === t.id ? ' selected' : ''}>${t.short} · ${t.note}</option>`).join('');
      frame(`<div class="fishing-hero"><img src="assets/fishing-cove.webp" alt="Painted Lost Creek fishing cove, with a wooden dock, bluebonnets, and shady oak trees"><div class="fishing-hero-card"><span class="eyebrow dark">A DAY AT THE CREEK</span><h1>Grandma saved you a fishing spot.</h1><p>Choose a place to cast, read a creek clue, solve a fishing problem, and reel in your catch. Every fish goes back in the water.</p><label for="fishing-focus">Our math spot today</label><select id="fishing-focus">${list}</select><p class="small">Start here, warm up, or explore ahead. You can change this any time.</p>${button('start', p.active ? 'Keep fishing' : 'Go fishing', 'gold')}<p class="fishing-tally">${p.catches} fish met · ${p.trips} creek trips · ${p.read} stories read</p></div></div><div class="fishing-foot">${button('review', 'Review Module 2 with Grandma', 'soft')}<span>Reading and math are never timed.</span></div>`, 'Fishing at Lost Creek');
    }
    function board() {
      const a = p.active, story = stories[a.story], spot = spots.find(s => s.id === a.spot);
      let content = '';
      if (a.stage === 'spot') {
        content = `<span class="eyebrow dark">PICK YOUR PLACE</span><h1>Where will you cast?</h1><p>Look around the creek. Every spot has a surprise.</p><div class="fishing-spots">${spots.map(s => `<button type="button" data-fishing="spot" data-id="${s.id}"><span>${s.emoji}</span><strong>${s.name}</strong><small>${s.line}</small></button>`).join('')}</div>`;
      } else if (a.stage === 'read') {
        content = `<span class="eyebrow dark">A CREEK STORY · ${esc(spot.name)}</span><h1>${esc(story.title)}</h1><p class="story-text">${esc(story.text)}</p><div class="fishing-actions">${button('listen', 'Listen with Grandma', 'soft')}${button('read', 'I read it. Next clue →', 'forest')}</div><p class="small">Take your time. You can read it more than once.</p>`;
      } else if (a.stage === 'word') {
        const opts = placeText([story.chunks, ...story.distractors], a.story + a.caught);
        content = `<span class="eyebrow dark">WORD CLUE</span><h1>Break up “${esc(story.word)}”</h1><p>Say each part. Which parts sound right together?</p><div class="fishing-options">${opts.map(o => `<button type="button" data-fishing="word" data-value="${esc(o)}">${esc(o)}</button>`).join('')}</div><p class="fishing-note" role="status">${esc(note)}</p>${button('backstory', 'Read the story again', 'soft')}`;
      } else if (a.stage === 'question') {
        const opts = placeText(story.choices, a.story + a.caught + 1);
        content = `<span class="eyebrow dark">STORY CLUE</span><h1>${esc(story.ask)}</h1><p class="story-text small">${esc(story.text)}</p><div class="fishing-options">${opts.map(o => `<button type="button" data-fishing="question" data-value="${esc(o)}">${esc(o)}</button>`).join('')}</div><p class="fishing-note" role="status">${esc(note)}</p>`;
      } else if (a.stage === 'cast') {
        content = `<span class="eyebrow dark">TIME TO CAST</span><h1>Send the line to ${esc(spot.name.toLowerCase())}.</h1><p>Grandma’s story clue: “${esc(story.evidence)}”</p><p>Watch the bobber on the water. There is no timer.</p><div class="bobber-water"><span class="water-ring"></span><span class="bobber" aria-hidden="true"></span></div>${button('cast', 'Cast the line 🎣', 'gold')}`;
      } else if (a.stage === 'math') {
        const t = a.task || (a.task = makeMathQuestion(p.focus, p.trips * 19 + p.catches * 7 + a.story * 3, p.math));
        content = `<span class="eyebrow dark">THE BOBBER DIPS · ${esc(topics.find(x => x.id === p.focus).short)}</span><h1>Can you reel this one in?</h1><p class="fishing-problem">${esc(t.prompt)}</p><div class="fishing-options">${t.choices.map(value => `<button type="button" data-fishing="math" data-value="${value}">${t.format === 'remainder' ? `${Math.floor(value / 10)} each, ${value % 10} left` : `${value.toLocaleString()}`}</button>`).join('')}</div>${button('hint', 'Show me how', 'soft')}<p class="fishing-note" role="status">${esc(note)}</p>`;
      } else if (a.stage === 'reel') {
        content = `<span class="eyebrow dark">REEL IT IN</span><h1>Keep the line steady!</h1><div class="reel-display"><span class="reel-fish">🐟</span><span class="reel-line" style="--reel:${a.reel}"></span><span class="reel-rod">🎣</span></div><p>${a.reel} of 3 gentle turns</p>${button('reel', a.reel < 2 ? 'Turn the reel ↻' : 'Lift the catch!', 'gold')}`;
      } else if (a.stage === 'catch') {
        const species = fish[(p.catches + a.story) % fish.length];
        content = `<span class="eyebrow dark">NICE CATCH!</span><h1>You met a ${esc(species)}.</h1><div class="catch-fish" aria-hidden="true">🐟</div><p>You read the creek clue, solved the problem, and reeled gently. Grandma helps put the fish back in the water.</p>${button('release', a.caught === 2 ? 'Release it and see the trip →' : 'Release it and cast again →', 'forest')}`;
      }
      frame(`${progress()}<div class="fishing-board"><div class="fishing-art"><img src="assets/fishing-cove.webp" alt="Lost Creek fishing cove"><span class="fishing-location">${spot ? esc(spot.name) : 'The fishing cove'}</span></div><div class="fishing-card">${content}</div></div>`, 'Fishing trip');
    }
    function finish() {
      frame(`<div class="fishing-finish"><img src="assets/porch.webp" alt="Grandma and Rylee on the ranch porch"><div><span class="eyebrow dark">THREE FISH, BACK IN THE CREEK</span><h1>Grandma loved fishing with you.</h1><p>You explored three spots, read three stories, and solved three math problems. The fish are swimming free.</p>${button('again', 'Take another fishing trip', 'gold')}${button('porch', 'Play a porch game with Grandma', 'forest')}</div></div>`, 'Fishing trip finished');
    }
    function render() { if (!p.active) home(); else if (p.active.stage === 'finish') finish(); else board(); }
    function placeText(list, turn) { const copy = list.slice(1); copy.splice(turn % list.length, 0, list[0]); return copy; }
    function advance(stage) { p.active.stage = stage; note = ''; render(); }
    if (target._fishingHandler) target.removeEventListener('click', target._fishingHandler);
    target._fishingHandler = function (event) {
      const b = event.target.closest('button[data-fishing]');
      if (!b || !target.contains(b)) return;
      const action = b.dataset.fishing, a = p.active;
      if (action === 'exit') { if ('speechSynthesis' in root) root.speechSynthesis.cancel(); onExit(); return; }
      if (action === 'review') { onExit(); root.document.querySelector('[data-action="module2"]')?.click(); return; }
      if (action === 'start') { if (!p.active) p.active = { stage: 'spot', caught: 0, story: (p.trips * 3) % stories.length, spot: null, task: null, reel: 0, help: false }; render(); return; }
      if (!a) return;
      if (action === 'spot') { a.spot = b.dataset.id; advance('read'); }
      else if (action === 'listen') {
        if ('speechSynthesis' in root) { root.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(stories[a.story].text); utterance.rate = 0.83; utterance.lang = 'en-US'; root.speechSynthesis.speak(utterance); }
        else { note = 'Read-aloud is unavailable here. You can still read the story together.'; render(); }
      }
      else if (action === 'read') advance('word');
      else if (action === 'backstory') advance('read');
      else if (action === 'word') { if (b.dataset.value === stories[a.story].chunks) advance('question'); else { note = `Try saying “${stories[a.story].word}” slowly. Listen for each part.`; render(); } }
      else if (action === 'question') { if (b.dataset.value === stories[a.story].choices[0]) { p.read++; note = stories[a.story].evidence; advance('cast'); } else { note = 'Look for the answer in the story. Read it again and try another choice.'; render(); } }
      else if (action === 'cast') advance('math');
      else if (action === 'hint') { a.help = true; note = a.task.hint; render(); }
      else if (action === 'math') { if (Number(b.dataset.value) === a.task.correct) { p.math++; advance('reel'); } else { note = a.task.hint; a.help = true; render(); } }
      else if (action === 'reel') { a.reel++; if (a.reel === 3) { p.catches++; state.stars++; advance('catch'); } else render(); }
      else if (action === 'release') { a.caught++; if (a.caught === 3) { p.trips++; a.stage = 'finish'; state.jobs++; render(); } else { a.story = (a.story + 1) % stories.length; a.spot = null; a.task = null; a.reel = 0; a.help = false; advance('spot'); } }
      else if (action === 'again') { p.active = null; p.active = { stage: 'spot', caught: 0, story: (p.trips * 3) % stories.length, spot: null, task: null, reel: 0, help: false }; render(); }
      else if (action === 'porch') { p.active = null; commit(); onPorch(); }
    };
    target.addEventListener('click', target._fishingHandler);
    if (target._fishingChange) target.removeEventListener('change', target._fishingChange);
    target._fishingChange = function (e) {
      if (e.target.id === 'fishing-focus') { p.focus = e.target.value; commit(); }
    };
    target.addEventListener('change', target._fishingChange);
    render();
  }
  const api = { fresh, normalize, makeMathQuestion, topics, stories, open };
  root.RanchFishing = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

(function (root) {
  'use strict';
  const places = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'];
  const skills = {
    times: 'Ten times as much',
    divide: 'One tenth as much',
    units: 'Trade between places',
    value: 'Find a digit’s value',
    expanded: 'Build and name numbers',
    compare: 'Compare and order',
    round: 'Round on a number line'
  };
  const format = n => Number(n).toLocaleString('en-US');
  function randomInt(min, max, rng) { return min + Math.floor(rng() * (max - min + 1)); }
  function shuffle(items, rng) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function words(n) {
    const small = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (n < 20) return small[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + small[n % 10] : '');
    if (n < 1000) return small[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + words(n % 100) : '');
    if (n < 1000000) return words(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ', ' + words(n % 1000) : '');
    return 'one million';
  }
  function expanded(n) {
    return String(n).split('').map((d, i, ds) => +d ? format(+d * 10 ** (ds.length - i - 1)) : '')
      .filter(Boolean).join(' + ') || '0';
  }
  function notation(n) {
    return String(n).split('').map((d, i, ds) => +d ? '(' + d + ' × ' + format(10 ** (ds.length - i - 1)) + ')' : '')
      .filter(Boolean).join(' + ') || '0';
  }
  function makeQuestion(skill, level = 1, rng = Math.random) {
    if (!Object.hasOwn(skills, skill)) throw new Error('Unknown skill');
    level = Math.max(1, Math.min(3, level));
    const digit = randomInt(2, 9, rng);
    const place = randomInt(0, level === 1 ? 2 : 4, rng);
    let q = { skill, level, answer: '', distractors: [], numeric: true, model: null };
    if (skill === 'times' || skill === 'divide') {
      const isTimes = skill === 'times';
      const base = (level === 1 ? digit : randomInt(11, 89, rng)) * 10 ** Math.min(place, 3);
      const before = isTimes ? base : base * 10;
      const after = isTimes ? base * 10 : base;
      q.prompt = isTimes ? 'The feed barn has ' + format(before) + ' seeds. What is ten times as many?'
        : 'Grandma shares ' + format(before) + ' seeds equally into 10 bags. How many go in each bag?';
      q.answer = format(after);
      q.distractors = [format(before), format(isTimes ? Math.floor(before / 10) : before * 10), format(before + 10)];
      q.explanation = format(before) + (isTimes ? ' × 10 = ' : ' ÷ 10 = ') + format(after) + '. Each digit moves one place '
        + (isTimes ? 'left into a place worth ten times as much.' : 'right into a place worth one tenth as much.');
      q.hint = isTimes ? 'Think of 10 equal groups. Each digit moves one place left on the chart.'
        : 'Split into 10 equal groups. Each digit moves one place right on the chart.';
      q.model = { type: 'shift', before, after, direction: isTimes ? 'left' : 'right' };
      q.meta = { before, after, operation: isTimes ? 'times' : 'divide' };
    } else if (skill === 'units') {
      const high = randomInt(1, level === 1 ? 3 : 5, rng);
      const reverse = rng() < 0.5;
      const count = level === 1 ? digit : randomInt(11, 49, rng);
      const from = reverse ? high - 1 : high;
      const to = reverse ? high : high - 1;
      const given = reverse ? count * 10 : count;
      const answer = reverse ? count : count * 10;
      q.prompt = format(given) + ' ' + places[from] + ' is the same amount as how many ' + places[to] + '?';
      q.answer = format(answer);
      q.distractors = [format(given), format(reverse ? count * 100 : count * 100), format(count + 10)];
      q.explanation = '1 ' + places[high].replace(/s$/, '') + ' = 10 ' + places[high - 1] + '. So '
        + format(given) + ' ' + places[from] + ' = ' + format(answer) + ' ' + places[to] + '. The amount stays the same.';
      q.hint = 'One larger unit can be traded for ten of the next smaller unit. Do not change the total amount.';
      q.model = { type: 'trade', high, count, from, to };
      q.meta = { given, from, to, answer };
    } else if (skill === 'value') {
      const power = randomInt(0, level === 1 ? 3 : 5, rng);
      const max = level === 1 ? 9999 : 999999;
      let n = randomInt(1000, max, rng);
      n = n - Math.floor(n / 10 ** power) % 10 * 10 ** power + digit * 10 ** power;
      const value = digit * 10 ** power;
      q.prompt = 'Look at ' + format(n) + '. What is the value of the digit in the ' + places[power] + ' place?';
      q.answer = format(value);
      q.distractors = [format(digit), format(value * 10), format(Math.floor(value / 10)), format(value + 10)];
      q.explanation = 'The ' + digit + ' is in the ' + places[power] + ' place: '
        + digit + ' × ' + format(10 ** power) + ' = ' + format(value) + '. A digit and its value are not always the same.';
      q.hint = 'Find the named column. Multiply its digit by the value of that place.';
      q.model = { type: 'place', number: n, highlight: power };
      q.meta = { number: n, power, digit, value };
    } else if (skill === 'expanded') {
      const n = randomInt(1000, level === 1 ? 9999 : 999999, rng);
      const mode = randomInt(0, 2, rng);
      const alternatives = [n + 10, n + 100, n + 1];
      if (mode === 0) {
        q.prompt = 'Mama’s ranch ledger shows ' + format(n) + '. Which is its expanded form?';
        q.answer = expanded(n);
        q.distractors = alternatives.map(expanded);
        q.numeric = false;
      } else if (mode === 1) {
        q.prompt = 'Which number does this build? ' + notation(n);
        q.answer = format(n);
        q.distractors = alternatives.map(format);
      } else {
        q.prompt = 'Grandma wrote “' + words(n) + '.” Which number is that?';
        q.answer = format(n);
        q.distractors = alternatives.map(format);
      }
      q.explanation = format(n) + ' = ' + expanded(n) + '. Read it as ' + words(n) + '. A zero keeps an empty place.';
      q.hint = 'Work from the largest place to the ones. Keep a zero wherever a place is empty.';
      q.model = { type: 'place', number: n };
      q.meta = { number: n, mode };
    } else if (skill === 'compare') {
      const n = randomInt(1000, level === 1 ? 9999 : 999999, rng);
      const delta = randomInt(1, 9, rng) * 10 ** randomInt(0, 2, rng);
      if (rng() < 0.35) {
        const values = shuffle([n, n + delta, n + 2 * delta], rng);
        const sorted = values.slice().sort((a, b) => a - b);
        const join = a => a.map(format).join(' < ');
        q.prompt = 'Put these ranch counts in order, smallest first: ' + values.map(format).join(' • ');
        q.answer = join(sorted);
        q.distractors = [join(sorted.slice().reverse()), join([sorted[1], sorted[0], sorted[2]]), join([sorted[0], sorted[2], sorted[1]])];
        q.numeric = false;
        q.explanation = 'Start at the largest place and compare digits until they differ. ' + join(sorted) + '.';
        q.model = { type: 'compare', values: sorted };
        q.meta = { values, mode: 'order' };
      } else {
        const other = rng() < 0.15 ? n : Math.max(0, n + (rng() < 0.5 ? -delta : delta));
        q.prompt = 'Which sign belongs in the gap? ' + format(n) + ' ___ ' + format(other);
        q.answer = n > other ? '>' : n < other ? '<' : '=';
        q.distractors = ['<', '>', '='];
        q.numeric = false;
        q.explanation = 'Compare from the leftmost digit. The first different place decides. '
          + format(n) + ' ' + q.answer + ' ' + format(other) + '. The open side faces the larger number.';
        q.model = { type: 'compare', values: [n, other] };
        q.meta = { values: [n, other], mode: 'sign' };
      }
      q.hint = 'Line up the places. Begin at the largest place, not at the ones.';
    } else {
      const power = randomInt(1, level === 1 ? 2 : 4, rng);
      const unit = 10 ** power;
      const lower = randomInt(1, 90, rng) * unit;
      const n = lower + randomInt(1, unit - 1, rng);
      const answer = Math.floor((n + unit / 2) / unit) * unit;
      q.prompt = 'The trail is ' + format(n) + ' steps. Round to the nearest ' + places[power].replace(/s$/, '') + '.';
      q.answer = format(answer);
      q.distractors = [format(answer === lower ? lower + unit : lower), format(n), format(lower + 2 * unit)];
      q.explanation = 'The endpoints are ' + format(lower) + ' and ' + format(lower + unit) + '. Halfway is '
        + format(lower + unit / 2) + '. ' + format(n) + (n - lower >= unit / 2 ? ' is at or above halfway, so round up to ' : ' is below halfway, so round down to ')
        + format(answer) + '.';
      q.hint = 'Find the two nearest multiples and their halfway point. At halfway, round up.';
      q.model = { type: 'line', number: n, lower, upper: lower + unit, midpoint: lower + unit / 2 };
      q.meta = { number: n, unit, answer };
    }
    const choices = Array.from(new Set([q.answer].concat(q.distractors)));
    let filler = 1;
    const count = q.meta.mode === 'sign' ? 3 : 4;
    while (choices.length < count) {
      const candidate = format(Number(q.answer.replaceAll(',', '')) + filler++);
      if (!choices.includes(candidate)) choices.push(candidate);
    }
    q.options = shuffle(choices.slice(0, count).map(text => ({ text, correct: text === q.answer })), rng);
    q.id = q.skill + ':' + q.prompt;
    delete q.distractors;
    return q;
  }
  function nextQuestion(skill, level, recent, rng = Math.random) {
    let q;
    for (let i = 0; i < 100; i++) {
      q = makeQuestion(skill, level, rng);
      if (!recent.includes(q.id)) return q;
    }
    return q;
  }
  function parseNumber(value) {
    const text = String(value).trim();
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(text)) return null;
    const number = Number(text.replaceAll(',', ''));
    return Number.isSafeInteger(number) ? number : null;
  }
  function recordAnswer(state, q, independent) {
    if (!state.skills[q.skill]) state.skills[q.skill] = { attempts: 0, independent: 0, recent: [] };
    const item = state.skills[q.skill];
    item.attempts++;
    item.independent += independent ? 1 : 0;
    item.recent = item.recent.concat(Boolean(independent)).slice(-8);
    state.stars++;
    state.recent = state.recent.concat(q.id).slice(-120);
  }
  function levelFor(state, skill) {
    const recent = state.skills[skill]?.recent || [];
    return recent.length >= 6 && recent.filter(Boolean).length >= 5 ? 2 : 1;
  }
  const api = { places, skills, format, shuffle, words, expanded, notation, makeQuestion, nextQuestion, parseNumber, recordAnswer, levelFor };
  root.RanchMath = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

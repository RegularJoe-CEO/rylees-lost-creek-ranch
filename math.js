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
    q.options = shuffle(choices.slice(0, count).map((text, i) => ({
      id: 'c' + i, text, correct: text === q.answer
    })), rng);
    q.id = q.skill + ':' + q.prompt;
    q.format = q.numeric === false ? 'choice' : 'choice';
    q.template = q.template || q.skill;
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
  function bundleFrom(ones, tens, hundreds) {
    ones = Math.max(0, ones | 0); tens = Math.max(0, tens | 0); hundreds = Math.max(0, hundreds | 0);
    return { ones, tens, hundreds, total: ones + 10 * tens + 100 * hundreds };
  }
  function bundlePack(state, place) {
    const next = bundleFrom(state.ones, state.tens, state.hundreds);
    if (place === 'ones' && next.ones >= 10) { next.ones -= 10; next.tens += 1; }
    else if (place === 'tens' && next.tens >= 10) { next.tens -= 10; next.hundreds += 1; }
    return bundleFrom(next.ones, next.tens, next.hundreds);
  }
  function bundleUnpack(state, place) {
    const next = bundleFrom(state.ones, state.tens, state.hundreds);
    if (place === 'tens' && next.tens >= 1) { next.tens -= 1; next.ones += 10; }
    else if (place === 'hundreds' && next.hundreds >= 1) { next.hundreds -= 1; next.tens += 10; }
    return bundleFrom(next.ones, next.tens, next.hundreds);
  }
  function attachOptions(q, rng) {
    const choices = Array.from(new Set([q.answer].concat(q.distractors || [])));
    let filler = 1;
    const count = q.count || (q.meta && q.meta.mode === 'sign' ? 3 : 4);
    while (choices.length < count) {
      const candidate = format(Number(String(q.answer).replaceAll(',', '')) + filler++);
      if (!choices.includes(candidate)) choices.push(candidate);
    }
    q.options = shuffle(choices.slice(0, count).map((text, i) => ({
      id: 'c' + i, text, correct: text === q.answer
    })), rng);
    q.id = q.skill + ':' + q.prompt;
    delete q.distractors;
    return q;
  }
  function withZero(n, rng, internal) {
    const s = String(n).padStart(4, '0').split('');
    const idx = internal ? randomInt(1, s.length - 2, rng) : s.length - 1;
    s[idx] = '0';
    if (s[0] === '0') s[0] = String(randomInt(1, 9, rng));
    return Number(s.join(''));
  }
  function makeTemplate(template, level = 1, rng = Math.random) {
    level = Math.max(1, Math.min(3, level));
    if (template === 'units-ones' || template === 'units-tens' || template === 'units-unpack') {
      const reverse = rng() < 0.5;
      const count = randomInt(2, 9, rng);
      let from, to, given, answer, high;
      if (template === 'units-ones') { high = 1; }
      else if (template === 'units-tens') { high = 2; }
      else { high = reverse ? 1 : 2; }
      from = reverse ? high - 1 : high;
      to = reverse ? high : high - 1;
      given = reverse ? count * 10 : count;
      answer = reverse ? count : count * 10;
      const q = {
        skill: 'units', level: 1, numeric: true, template, format: 'choice',
        prompt: format(given) + ' ' + places[from] + ' is the same amount as how many ' + places[to] + '?',
        answer: format(answer),
        distractors: [format(given), format(count * 100), format(count + 10)],
        hint: 'One larger unit can be traded for ten of the next smaller unit. Do not change the total amount.',
        explanation: '1 ' + places[high].replace(/s$/, '') + ' = 10 ' + places[high - 1] + '. So '
          + format(given) + ' ' + places[from] + ' = ' + format(answer) + ' ' + places[to] + '. The amount stays the same.',
        model: { type: 'trade', high, count, from, to },
        meta: { given, from, to, answer }
      };
      return attachOptions(q, rng);
    }
    if (template === 'value-zero') {
      const q = makeQuestion('value', level, rng);
      const n = withZero(q.meta.number, rng, true);
      const power = q.meta.power;
      const digit = Math.floor(n / 10 ** power) % 10;
      const value = digit * 10 ** power;
      q.prompt = 'Look at ' + format(n) + '. What is the value of the digit in the ' + places[power] + ' place?';
      q.answer = format(value);
      q.distractors = [format(digit), format(value * 10 || 10), format(n)];
      q.explanation = 'The ' + digit + ' is in the ' + places[power] + ' place: '
        + digit + ' × ' + format(10 ** power) + ' = ' + format(value) + '. Zero holds any empty place.';
      q.model = { type: 'place', number: n, highlight: power };
      q.meta = { number: n, power, digit, value, mode: 'zero' };
      q.template = 'value-zero';
      return attachOptions(q, rng);
    }
    if (template === 'value-adjacent') {
      const digit = randomInt(2, 9, rng);
      const low = randomInt(0, 2, rng);
      const n = digit * 10 ** (low + 1) + digit * 10 ** low;
      const q = {
        skill: 'value', level, numeric: true, template: 'value-adjacent', format: 'choice',
        prompt: 'In ' + format(n) + ', how many times as much is the left ' + digit + ' worth compared with the right ' + digit + '?',
        answer: '10',
        distractors: ['1', '100', String(digit)],
        hint: 'The left digit sits one place higher. One place left is ten times as much.',
        explanation: 'The left ' + digit + ' is in the ' + places[low + 1] + ' place. The right ' + digit
          + ' is in the ' + places[low] + ' place. ' + format(digit * 10 ** (low + 1)) + ' is ten times '
          + format(digit * 10 ** low) + '.',
        model: { type: 'place', number: n, highlight: low + 1 },
        meta: { number: n, digit, low }
      };
      return attachOptions(q, rng);
    }
    if (template === 'value-mixup') {
      const power = randomInt(1, 3, rng);
      const digit = randomInt(2, 9, rng);
      let n = randomInt(1010, 9090, rng);
      n = n - Math.floor(n / 10 ** power) % 10 * 10 ** power + digit * 10 ** power;
      const value = digit * 10 ** power;
      const q = {
        skill: 'value', level, numeric: false, template: 'value-mixup', format: 'choice',
        prompt: 'A label says the ' + digit + ' in ' + format(n) + ' is worth ' + digit + '. What is wrong?',
        answer: 'The ' + digit + ' is in the ' + places[power] + ' place, so it is worth ' + format(value) + '.',
        distractors: [
          'The digit and the value are always the same.',
          'The ' + digit + ' is worth ' + format(value * 10) + '.',
          'There is no place-value error on this label.'
        ],
        hint: 'Find the named digit. Multiply it by the value of its place.',
        explanation: 'That is the digit. In the ' + places[power] + ' place it is worth ' + format(value) + '.',
        model: { type: 'place', number: n, highlight: power },
        meta: { number: n, power, digit, value }
      };
      return attachOptions(q, rng);
    }
    if (template === 'expanded-sum' || template === 'expanded-words' || template === 'expanded-notation') {
      const q = makeQuestion('expanded', level, rng);
      q.template = template;
      if (template === 'expanded-sum') {
        const n = withZero(q.meta.number, rng, true);
        q.prompt = 'Mama\'s ranch ledger shows ' + expanded(n) + '. Which number is that?';
        q.answer = format(n);
        q.distractors = [format(n + 10), format(n + 100), format(n + 1)];
        q.numeric = true;
        q.explanation = format(n) + ' = ' + expanded(n) + '. The missing place is an empty zero.';
        q.model = { type: 'place', number: n };
        q.meta = { number: n, mode: 1 };
        return attachOptions(q, rng);
      }
      if (template === 'expanded-words') {
        const n = withZero(q.meta.number, rng, true);
        q.prompt = 'Grandma wrote "' + words(n) + '." Which number is that?';
        q.answer = format(n);
        q.distractors = [format(n + 10), format(n + 100), format(n + 1)];
        q.numeric = true;
        q.model = { type: 'place', number: n };
        q.meta = { number: n, mode: 2 };
        q.explanation = format(n) + ' = ' + expanded(n) + '. Read it as ' + words(n) + '.';
        return attachOptions(q, rng);
      }
      q.prompt = 'Which expanded notation matches ' + format(q.meta.number) + '?';
      q.answer = notation(q.meta.number);
      q.distractors = [q.meta.number + 10, q.meta.number + 100, q.meta.number + 1].map(notation);
      q.numeric = false;
      return attachOptions(q, rng);
    }
    if (template === 'compare-sign') {
      let q, guard = 0;
      do { q = makeQuestion('compare', level, rng); guard++; } while (q.meta.mode !== 'sign' && guard < 40);
      q.template = template;
      return q;
    }
    if (template === 'compare-order') {
      let q, guard = 0;
      do { q = makeQuestion('compare', level, rng); guard++; } while (q.meta.mode !== 'order' && guard < 40);
      q.template = template;
      return q;
    }
    if (template === 'compare-place') {
      const n = randomInt(1000, 9999, rng);
      const power = randomInt(0, 2, rng);
      const digit = randomInt(1, 8, rng);
      const other = n - Math.floor(n / 10 ** power) % 10 * 10 ** power + (digit + 1) * 10 ** power;
      const left = Math.max(n, other), right = Math.min(n, other);
      const q = {
        skill: 'compare', level, numeric: false, template: 'compare-place', format: 'choice',
        prompt: 'Which place decides ' + format(left) + ' > ' + format(right) + '?',
        answer: places[power],
        distractors: places.filter((_, i) => i !== power).slice(0, 3),
        hint: 'Line up the places. Begin at the largest place, not at the ones.',
        explanation: 'Thousands and every larger matching place are the same. The '
          + places[power] + ' digits differ first, so that place decides.',
        model: { type: 'compare', values: [left, right] },
        meta: { values: [left, right], power, mode: 'place' },
        count: 4
      };
      return attachOptions(q, rng);
    }
    if (template === 'round-neighbors') {
      const q = makeQuestion('round', level, rng);
      q.template = template;
      q.numeric = false;
      q.format = 'choice';
      q.prompt = 'The trail is ' + format(q.meta.number) + ' steps. Which pair are the nearest '
        + places[Math.round(Math.log10(q.meta.unit))].replace(/s$/, '') + ' neighbors?';
      const lower = Math.floor(q.meta.number / q.meta.unit) * q.meta.unit;
      const upper = lower + q.meta.unit;
      q.answer = format(lower) + ' and ' + format(upper);
      q.distractors = [
        format(lower - q.meta.unit) + ' and ' + format(lower),
        format(upper) + ' and ' + format(upper + q.meta.unit),
        format(q.meta.number) + ' and ' + format(upper)
      ];
      q.explanation = 'The endpoints are ' + format(lower) + ' and ' + format(upper) + '. Halfway is '
        + format(lower + q.meta.unit / 2) + '.';
      return attachOptions(q, rng);
    }
    if (template === 'round-apply') {
      const q = makeQuestion('round', level, rng);
      q.template = template;
      q.prompt = 'Estimate the supply count ' + format(q.meta.number) + ' to the nearest '
        + places[Math.round(Math.log10(q.meta.unit))].replace(/s$/, '')
        + '. Which is the estimate, not the exact count?';
      return q;
    }
    if (Object.hasOwn(skills, template)) return makeQuestion(template, level, rng);
    return makeQuestion('units', level, rng);
  }
  function nextTemplate(template, level, recent, rng = Math.random) {
    let q;
    for (let i = 0; i < 100; i++) {
      q = makeTemplate(template, level, rng);
      if (!recent.includes(q.id)) return q;
    }
    return q;
  }
  function gradeOption(q, optionId) {
    const option = (q.options || []).find(o => o.id === optionId);
    return !!(option && option.correct);
  }
  function makeTeach(kind, rng = Math.random) {
    const digit = randomInt(2, 9, rng);
    if (kind === 'pack-ones') {
      const extra = randomInt(1, 9, rng);
      const ones = 10 + extra, tens = randomInt(1, 4, rng);
      const start = bundleFrom(ones, tens, 0);
      return {
        kind, skill: 'units', showTotal: true,
        prompt: 'Pack ten ones into one ten. The pile starts as ' + start.tens + ' tens and ' + start.ones + ' ones.',
        hint: 'Ten ones make one ten. The total amount does not change.',
        explanation: 'Packing ten ones makes one more ten. ' + start.total + ' stays ' + start.total + '.',
        start, goal: 'pack-ones', total: start.total
      };
    }
    if (kind === 'pack-tens') {
      const tens = 10 + randomInt(1, 4, rng);
      const start = bundleFrom(randomInt(0, 9, rng), tens, randomInt(0, 2, rng));
      return {
        kind, skill: 'units', showTotal: true,
        prompt: 'Pack ten tens into one hundred. Watch the total stay the same.',
        hint: 'Ten tens make one hundred. Do not change the amount.',
        explanation: 'Packing ten tens makes one hundred. The total is still ' + start.total + '.',
        start, goal: 'pack-tens', total: start.total
      };
    }
    if (kind === 'unpack-tens') {
      const start = bundleFrom(randomInt(0, 5, rng), randomInt(2, 6, rng), 0);
      return {
        kind, skill: 'units', showTotal: true,
        prompt: 'Unpack one ten into ten ones. The amount should still be ' + format(start.total) + '.',
        hint: 'One ten unpacks into ten ones. The total does not change.',
        explanation: 'Unpacking one ten gives ten more ones. Total ' + start.total + ' stays ' + start.total + '.',
        start, goal: 'unpack-tens', total: start.total
      };
    }
    const map = {
      'shift-left': 'times', 'shift-right': 'divide', 'adjacent-value': 'value-adjacent',
      'place-value': 'value', 'zero-place': 'value-zero', 'mixup': 'value-mixup',
      'expanded-sum': 'expanded-sum', 'expanded-words': 'expanded-words', 'expanded-notation': 'expanded-notation',
      'compare-sign': 'compare-sign', 'compare-order': 'compare-order', 'compare-place': 'compare-place',
      'round-neighbors': 'round-neighbors', 'round-mid': 'round', 'round-apply': 'round-apply'
    };
    const q = makeTemplate(map[kind] || 'value', 1, rng);
    return {
      kind, skill: q.skill, showTotal: false, question: q,
      prompt: q.prompt, hint: q.hint, explanation: q.explanation, start: null, goal: 'example'
    };
  }
  function makeBundleQuestion(level, rng = Math.random) {
    const extra = randomInt(1, 9, rng);
    const tens = randomInt(1, 4, rng);
    const start = bundleFrom(10 + extra, tens, 0);
    const packed = bundlePack(start, 'ones');
    return {
      skill: 'units', level, numeric: true, format: 'bundle', template: 'bundle-pack',
      prompt: 'This pile has ' + start.tens + ' tens and ' + start.ones + ' ones. Pack ten ones. How many tens are there now?',
      answer: format(packed.tens),
      hint: 'Ten ones become one ten. Count the tens after the trade.',
      explanation: 'After packing, there are ' + packed.tens + ' tens and ' + packed.ones + ' ones. Total '
        + start.total + ' stays ' + packed.total + '.',
      model: { type: 'bundle', start, goal: 'pack-ones', showTotal: false },
      meta: { start, packed, given: start.ones, from: 0, to: 1, answer: packed.tens },
      options: [],
      id: 'units:bundle-pack:' + start.ones + ':' + start.tens
    };
  }
  const api = {
    places, skills, format, shuffle, words, expanded, notation, makeQuestion, nextQuestion, parseNumber,
    recordAnswer, levelFor, bundleFrom, bundlePack, bundleUnpack, makeTemplate, nextTemplate, gradeOption,
    makeTeach, makeBundleQuestion, attachOptions
  };
  root.RanchMath = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

(function (root) {
  'use strict';
  const statuses = {
    'not-started': { label: 'Not started', symbol: '○' },
    exploring: { label: 'Exploring', symbol: '…' },
    'ready-for-check': { label: 'Ready for a check', symbol: '☑' },
    'practiced-with-help': { label: 'Practiced with help', symbol: '◑' },
    passed: { label: 'Passed a check', symbol: '★' },
    remembered: { label: 'Remembered on return', symbol: '✦' }
  };
  const list = [
    {
      id: 'bundles', number: 1, title: 'The Barn Supply Job',
      location: 'The supply barn', scene: 'assets/chapter-barn-workshop.webp',
      crop: { desktop: '60% 50%', mobile: '62% 50%' },
      job: 'Sort the barn supplies into ones, tens, and hundreds.',
      learn: 'You will trade ten of a smaller unit for one of the next larger unit. The amount stays the same.',
      earns: 'Finishing adds Barn supplies sorted to the ranch journal.',
      intro: 'Let\'s get these supplies ready. Ten little ones can become one bundle of ten.',
      skills: ['units'],
      keepsake: { title: 'Barn supplies sorted', caption: 'You traded between places without changing the total.' },
      missions: [
        { id: 'pack-ten', title: 'Pack ten', action: 'Trade ten ones for one ten.', teach: 'pack-ones', skills: ['units'], templates: ['units-ones'] },
        { id: 'fill-shelf', title: 'Fill the shelf', action: 'Trade ten tens for one hundred.', teach: 'pack-tens', skills: ['units'], templates: ['units-tens'] },
        { id: 'unpack-order', title: 'Unpack an order', action: 'Reverse a trade while the total stays the same.', teach: 'unpack-tens', skills: ['units'], templates: ['units-unpack'] }
      ],
      checkpoint: { skills: ['units'], formats: ['choice', 'numeric', 'bundle'], templates: ['units-ones', 'units-tens', 'units-unpack'] }
    },
    {
      id: 'neighbors', number: 2, title: 'The Ten-Times Trail',
      location: 'The supply barn', scene: 'assets/chapter-barn-workshop.webp',
      crop: { desktop: '60% 50%', mobile: '62% 50%' },
      job: 'Grow and share the ranch orders by tens.',
      learn: 'A digit one place to the left is ten times as much. One place to the right is one tenth as much.',
      earns: 'Finishing adds Supply orders ready to the ranch journal.',
      intro: 'Watch each digit. Moving one place left makes it ten times as much.',
      skills: ['times', 'divide', 'value'],
      keepsake: { title: 'Supply orders ready', caption: 'You moved digits one place to show ten times or one tenth.' },
      missions: [
        { id: 'grow-order', title: 'Grow the order', action: 'Find ten times a quantity.', teach: 'shift-left', skills: ['times'], templates: ['times'] },
        { id: 'share-ten', title: 'Share it ten ways', action: 'Find one tenth of a whole-number quantity.', teach: 'shift-right', skills: ['divide'], templates: ['divide'] },
        { id: 'same-digit', title: 'Follow the same digit', action: 'Compare its value in adjacent places.', teach: 'adjacent-value', skills: ['value'], templates: ['value-adjacent'] }
      ],
      checkpoint: { skills: ['times', 'divide', 'value'], formats: ['choice', 'numeric'] }
    },
    {
      id: 'places', number: 3, title: 'Every Digit Has a Job',
      location: 'The supply barn', scene: 'assets/chapter-barn-workshop.webp',
      crop: { desktop: '58% 48%', mobile: '62% 50%' },
      job: 'Check the storage labels so every digit has the right job.',
      learn: 'A digit\'s value depends on its place. A zero can hold an empty place.',
      earns: 'Finishing adds Storage labels checked to the ranch journal.',
      intro: 'The digit is not always the value. Find the place, then find what it is worth.',
      skills: ['value', 'units'],
      keepsake: { title: 'Storage labels checked', caption: 'You named a digit\'s value and kept empty places.' },
      missions: [
        { id: 'name-value', title: 'Name the value', action: 'Identify value, not just the digit.', teach: 'place-value', skills: ['value'], templates: ['value'] },
        { id: 'empty-place', title: 'Keep the empty place', action: 'Read numbers with zeros inside.', teach: 'zero-place', skills: ['value'], templates: ['value-zero'] },
        { id: 'find-mixup', title: 'Find the mix-up', action: 'Repair a digit or value label and say why.', teach: 'mixup', skills: ['value', 'units'], templates: ['value-mixup'] }
      ],
      checkpoint: { skills: ['value', 'units'], formats: ['choice', 'numeric'] }
    },
    {
      id: 'forms', number: 4, title: 'Grandma\'s Order Book',
      location: 'The supply barn', scene: 'assets/chapter-barn-workshop.webp',
      crop: { desktop: '55% 52%', mobile: '62% 50%' },
      job: 'Write Grandma\'s ranch orders in more than one form.',
      learn: 'Standard form, expanded form, and word form name the same number.',
      earns: 'Finishing adds Grandma\'s order book ready to the ranch journal.',
      intro: 'The same order can be written as a number, a sum, or words.',
      skills: ['expanded', 'value'],
      keepsake: { title: 'Grandma\'s order book ready', caption: 'You matched standard, expanded, and word form.' },
      missions: [
        { id: 'build-number', title: 'Build the number', action: 'Connect an expanded sum to standard form.', teach: 'expanded-sum', skills: ['expanded'], templates: ['expanded-sum'] },
        { id: 'read-order', title: 'Read the order', action: 'Connect word form and standard form.', teach: 'expanded-words', skills: ['expanded'], templates: ['expanded-words'] },
        { id: 'write-another', title: 'Write it another way', action: 'Match or compose expanded notation.', teach: 'expanded-notation', skills: ['expanded', 'value'], templates: ['expanded-notation'] }
      ],
      checkpoint: { skills: ['expanded', 'value'], formats: ['choice', 'numeric'] }
    },
    {
      id: 'compare', number: 5, title: 'Choose the Creek Route',
      location: 'Lost Creek', scene: 'assets/chapter-creek-crossing.webp',
      crop: { desktop: '60% 50%', mobile: '65% 50%' },
      job: 'Compare trail distances and pick a creek route.',
      learn: 'Line up the places. The first different digit from the left decides.',
      earns: 'Finishing adds Creek routes compared to the ranch journal.',
      intro: 'Start at the largest place. The first different digit tells which route is farther.',
      skills: ['compare', 'value'],
      keepsake: { title: 'Creek routes compared', caption: 'You compared from the left and named the deciding place.' },
      missions: [
        { id: 'which-farther', title: 'Which is farther?', action: 'Compare whole-number route distances.', teach: 'compare-sign', skills: ['compare'], templates: ['compare-sign'] },
        { id: 'put-in-order', title: 'Put them in order', action: 'Order three quantities.', teach: 'compare-order', skills: ['compare'], templates: ['compare-order'] },
        { id: 'deciding-place', title: 'Find the deciding place', action: 'Name the first differing digit from the left.', teach: 'compare-place', skills: ['compare', 'value'], templates: ['compare-place'] }
      ],
      checkpoint: { skills: ['compare', 'value'], formats: ['choice', 'numeric'] }
    },
    {
      id: 'round', number: 6, title: 'Ready for Family Day',
      location: 'Lost Creek', scene: 'assets/chapter-creek-crossing.webp',
      crop: { desktop: '62% 48%', mobile: '65% 50%' },
      job: 'Estimate the last supplies before family day at the ranch.',
      learn: 'Find the neighbors and the halfway point. Halfway rounds up for these whole numbers.',
      earns: 'Finishing adds Family day ready to the ranch journal.',
      intro: 'Find the two nearest multiples. Halfway or above rounds up.',
      skills: ['round'],
      mixed: ['units', 'times', 'compare'],
      keepsake: { title: 'Family day ready', caption: 'You rounded on a number line and kept estimates separate from exact counts.' },
      missions: [
        { id: 'find-neighbors', title: 'Find the neighbors', action: 'Locate the bounding multiples.', teach: 'round-neighbors', skills: ['round'], templates: ['round-neighbors'] },
        { id: 'meet-middle', title: 'Meet in the middle', action: 'Identify the midpoint and round.', teach: 'round-mid', skills: ['round'], templates: ['round'] },
        { id: 'estimate-supplies', title: 'Estimate the supplies', action: 'Round to a named place and tell estimate from exact.', teach: 'round-apply', skills: ['round'], templates: ['round-apply'] }
      ],
      checkpoint: { skills: ['round'], formats: ['choice', 'numeric'], mixed: ['units', 'compare'] }
    }
  ];
  const byId = Object.fromEntries(list.map(ch => [ch.id, ch]));
  function mission(chapterId, missionId) {
    const ch = byId[chapterId];
    return ch ? ch.missions.find(m => m.id === missionId) || null : null;
  }
  function previousSkills(chapterId) {
    const skills = [];
    for (const ch of list) {
      if (ch.id === chapterId) break;
      for (const s of ch.skills) if (!skills.includes(s)) skills.push(s);
    }
    return skills;
  }
  const api = { list, byId, statuses, mission, previousSkills };
  root.RanchChapters = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

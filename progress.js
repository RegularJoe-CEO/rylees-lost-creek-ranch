(function (root) {
  'use strict';
  const key = 'lcr6';
  const prevKey = 'lcr6.prev';
  const chapterIds = ['bundles', 'neighbors', 'places', 'forms', 'compare', 'round'];
  function chapterFresh() {
    return { status: 'not-started', missions: {}, check: { attempts: 0, passes: 0, lastSession: '', lastIndependent: 0, lastSkills: {} }, keepsake: false };
  }
  function fresh() {
    const chapters = {};
    for (const id of chapterIds) chapters[id] = chapterFresh();
    return {
      version: 7, stars: 0, jobs: 0, skills: {}, recent: [], completed: {}, focus: 'tens', family: true,
      chapters, resume: null, explicitChapter: null, parentStart: null,
      metric: { lesson: 1, completed: {}, active: null },
      placement: { done: false, stoppedAt: null, recommended: 'bundles' },
      sessionSeq: 1, checks: []
    };
  }
  const count = n => Number.isSafeInteger(n) && n >= 0 ? Math.min(n, 10000000) : 0;
  function backup(storage, raw) {
    try {
      if (raw && !storage.getItem(prevKey)) storage.setItem(prevKey, raw);
    } catch (_) {}
  }
  function missionState(raw) {
    if (!raw || typeof raw !== 'object') return { completed: false, index: 0, question: null, taught: false };
    let question = null;
    if (raw.question && typeof raw.question === 'object' && typeof raw.question.id === 'string') question = raw.question;
    return {
      completed: raw.completed === true,
      index: Math.min(count(raw.index), 4),
      taught: raw.taught === true,
      question
    };
  }
  function loadChapters(saved) {
    const chapters = {};
    for (const id of chapterIds) {
      const src = saved && saved.chapters && typeof saved.chapters === 'object' ? saved.chapters[id] : null;
      const item = chapterFresh();
      if (src && typeof src === 'object') {
        const allowed = Object.keys(requireStatuses());
        item.status = allowed.includes(src.status) ? src.status : 'not-started';
        item.keepsake = src.keepsake === true;
        item.check.attempts = count(src.check?.attempts);
        item.check.passes = count(src.check?.passes);
        item.check.lastSession = typeof src.check?.lastSession === 'string' ? src.check.lastSession.slice(0, 40) : '';
        item.check.lastIndependent = Math.min(count(src.check?.lastIndependent), 6);
        if (src.check?.lastSkills && typeof src.check.lastSkills === 'object') {
          for (const [sk, ok] of Object.entries(src.check.lastSkills)) {
            if (typeof sk === 'string') item.check.lastSkills[sk] = ok === true;
          }
        }
        if (src.missions && typeof src.missions === 'object') {
          for (const [mid, ms] of Object.entries(src.missions)) {
            if (typeof mid === 'string') item.missions[mid] = missionState(ms);
          }
        }
        if (item.status === 'remembered' && item.check.passes < 2) item.status = item.check.passes === 1 ? 'passed' : 'not-started';
        if (item.status === 'passed' && item.check.passes < 1) item.status = 'not-started';
        if (item.keepsake && item.check.passes < 1) item.keepsake = false;
      }
      chapters[id] = item;
    }
    return chapters;
  }
  function requireStatuses() {
    return {
      'not-started': 1, exploring: 1, 'ready-for-check': 1,
      'practiced-with-help': 1, passed: 1, remembered: 1
    };
  }
  function loadResume(saved) {
    const r = saved && saved.resume;
    if (!r || typeof r !== 'object') return null;
    if (!chapterIds.includes(r.chapterId)) return null;
    if (!['mission', 'checkpoint', 'placement'].includes(r.kind)) return null;
    return {
      kind: r.kind,
      chapterId: r.chapterId,
      missionId: typeof r.missionId === 'string' ? r.missionId : null,
      phase: r.phase === 'teach' || r.phase === 'practice' ? r.phase : 'practice',
      index: Math.min(count(r.index), 6),
      question: r.question && typeof r.question === 'object' ? r.question : null,
      attempts: count(r.attempts),
      helped: r.helped === true,
      wrong: Array.isArray(r.wrong) ? r.wrong.filter(v => typeof v === 'string' || Number.isInteger(v)).slice(0, 8) : [],
      typed: r.typed === true,
      sessionId: typeof r.sessionId === 'string' ? r.sessionId.slice(0, 40) : '',
      independent: count(r.independent),
      skillHits: r.skillHits && typeof r.skillHits === 'object' ? r.skillHits : {},
      results: Array.isArray(r.results) ? r.results.filter(x => x && typeof x === 'object').slice(0, 6) : []
    };
  }
  function load(storage) {
    const state = fresh();
    try {
      const raw = storage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return state;
        if (saved.version !== 7) backup(storage, raw);
        state.stars = count(saved.stars);
        state.jobs = count(saved.jobs);
        state.focus = saved.focus === 'next' ? 'next' : 'tens';
        state.family = saved.family !== false;
        state.recent = Array.isArray(saved.recent) ? saved.recent.filter(s => typeof s === 'string').slice(-120) : [];
        for (const skill of ['times', 'divide', 'units', 'value', 'expanded', 'compare', 'round']) {
          const s = saved.skills?.[skill];
          if (s && typeof s === 'object') state.skills[skill] = {
            attempts: count(s.attempts), independent: Math.min(count(s.independent), count(s.attempts)),
            recent: Array.isArray(s.recent) ? s.recent.filter(v => typeof v === 'boolean').slice(-8) : []
          };
        }
        for (const id of ['fish', 'range', 'trap', 'trail']) state.completed[id] = count(saved.completed?.[id]);
        state.chapters = loadChapters(saved);
        state.metric = root.RanchModule2 ? root.RanchModule2.normalize(saved.metric) : state.metric;
        state.resume = loadResume(saved);
        state.explicitChapter = chapterIds.includes(saved.explicitChapter) ? saved.explicitChapter : null;
        state.parentStart = chapterIds.includes(saved.parentStart) ? saved.parentStart : null;
        state.sessionSeq = Math.max(1, count(saved.sessionSeq) || 1);
        if (saved.placement && typeof saved.placement === 'object') {
          state.placement.done = saved.placement.done === true;
          state.placement.stoppedAt = chapterIds.includes(saved.placement.stoppedAt) ? saved.placement.stoppedAt : null;
          state.placement.recommended = chapterIds.includes(saved.placement.recommended) ? saved.placement.recommended : 'bundles';
        }
        if (Array.isArray(saved.checks)) {
          state.checks = saved.checks.filter(c => c && typeof c === 'object' && chapterIds.includes(c.chapterId)).slice(-24)
            .map(c => ({ chapterId: c.chapterId, independent: count(c.independent), passed: c.passed === true, sessionId: String(c.sessionId || '').slice(0, 40) }));
        }
      } else {
        for (const oldKey of ['lcr5', 'lcr3']) {
          try { state.stars = Math.max(state.stars, count(JSON.parse(storage.getItem(oldKey) || '{}').stars)); } catch (_) {}
        }
      }
    } catch (_) {}
    return state;
  }
  function save(storage, state) {
    try { storage.setItem(key, JSON.stringify(state)); return true; } catch (_) { return false; }
  }
  function newSession(state) {
    state.sessionSeq = count(state.sessionSeq) + 1;
    return 's' + state.sessionSeq;
  }
  function deriveStatus(ch) {
    if (ch.status === 'remembered') return 'remembered';
    if (ch.status === 'passed' || ch.check.passes >= 1) return ch.check.passes >= 2 ? 'remembered' : 'passed';
    const missions = Object.values(ch.missions);
    const done = missions.filter(m => m.completed).length;
    if (ch.check.attempts > 0 && ch.check.passes === 0) return 'practiced-with-help';
    if (done >= 3) return 'ready-for-check';
    if (done > 0 || missions.some(m => m.taught || m.index > 0)) return 'exploring';
    return 'not-started';
  }
  function syncStatus(state, chapterId) {
    const ch = state.chapters[chapterId];
    if (!ch) return;
    if (ch.status === 'remembered') return;
    const next = deriveStatus(ch);
    if (ch.status === 'passed' && next === 'passed') return;
    ch.status = next;
  }
  function recordCheck(state, chapterId, independent, skillHits, sessionId, requiredSkills) {
    const ch = state.chapters[chapterId];
    ch.check.attempts++;
    ch.check.lastIndependent = independent;
    ch.check.lastSession = sessionId;
    ch.check.lastSkills = skillHits;
    const skills = requiredSkills && requiredSkills.length ? requiredSkills : Object.keys(skillHits);
    const skillOk = skills.every(s => skillHits[s]);
    const passed = independent >= 5 && skillOk;
    if (passed) {
      const first = ch.check.passes === 0;
      ch.check.passes++;
      ch.status = ch.check.passes >= 2 ? 'remembered' : 'passed';
      if (first || !ch.keepsake) ch.keepsake = true;
    } else if (ch.status !== 'passed' && ch.status !== 'remembered') {
      ch.status = 'practiced-with-help';
    }
    state.checks = state.checks.concat({ chapterId, independent, passed, sessionId }).slice(-24);
    return passed;
  }
  const api = { fresh, load, save, key, prevKey, chapterIds, chapterFresh, newSession, syncStatus, deriveStatus, recordCheck };
  root.RanchProgress = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

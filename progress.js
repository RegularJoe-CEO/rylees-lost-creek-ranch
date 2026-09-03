(function (root) {
  'use strict';
  const key = 'lcr6';
  function fresh() {
    return { version: 6, stars: 0, jobs: 0, skills: {}, recent: [], completed: {}, focus: 'tens', family: true };
  }
  const count = n => Number.isSafeInteger(n) && n >= 0 ? Math.min(n, 10000000) : 0;
  function load(storage) {
    const state = fresh();
    try {
      const raw = storage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return state;
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
  const api = { fresh, load, save, key };
  root.RanchProgress = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

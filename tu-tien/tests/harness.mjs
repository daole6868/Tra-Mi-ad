// Nạp toàn bộ logic game vào môi trường Node giả lập (đồng hồ giả, không có DOM) để kiểm thử tự động.
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function loadGame(seed = 12345) {
  const clock = { now: Date.UTC(2026, 0, 1, 8) };
  const timers = [];
  let tid = 0;
  const ctx = {
    console,
    setTimeout: (fn, ms) => { const id = ++tid; timers.push({ id, t: clock.now + (ms || 0), fn }); return id; },
    clearTimeout: (id) => { const i = timers.findIndex((x) => x.id === id); if (i >= 0) timers.splice(i, 1); },
    setInterval: () => 0, clearInterval: () => {},
    requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
    performance: { now: () => clock.now },
    localStorage: { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } },
    document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, body: { classList: { toggle() {} } }, readyState: 'complete' },
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'), atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    escape, unescape,
    __now: () => clock.now, __seed: () => seed,
  };
  ctx.window = { matchMedia: () => ({ matches: false }), innerWidth: 1400, scrollTo() {}, addEventListener() {} };
  vm.createContext(ctx);
  vm.runInContext(`
    { const RD = Date; Date = class extends RD { constructor(...a) { if (a.length) super(...a); else super(__now()); } static now() { return __now(); } }; }
    Math.random = (() => { let s = __seed(); return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; })();
  `, ctx);
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map((m) => m[1]).filter((f) => f !== 'js/main.js');
  let src = files.map((f) => readFileSync(join(root, f), 'utf8')).join('\n;\n');
  src += `
;const Main = { skipSave: false };
UI.eventModal = (ev, ctx) => { let i = ev.auto(ctx); const ch = ev.choices[i]; if (ch.can && ch.can(ctx) !== true) i = ev.choices.length - 1; const r = Events.choose(ev, ctx, i, false); if (r.fight) Events.fight(r.fight, ctx); };
UI.tribOpen = () => {}; UI.tribUpdate = () => {}; UI.rerootModal = () => {}; UI.showCreation = () => {};
globalThis.__api = { get G() { return G; }, set G(v) { G = v; }, D, U, UI, Player, Inv, Gear, Combat, Explore, Dungeon, Tower, Trib, Alchemy, Forge, Cave, Pets, Sect, Market, Quests, Ach, Reinc, Arts, Stats, Events, Save, newLife, Creation };
`;
  vm.runInContext(src, ctx, { filename: 'game.js' });
  const X = ctx.__api;
  /** Chạy đồng hồ giả tới thời điểm `until` */
  function runTimers(until) {
    timers.sort((a, b) => a.t - b.t);
    while (timers.length && timers[0].t <= until) {
      const t = timers.shift();
      clock.now = Math.max(clock.now, t.t);
      t.fn();
      timers.sort((a, b) => a.t - b.t);
    }
    clock.now = Math.max(clock.now, until);
  }
  return { X, ctx, clock, timers, runTimers };
}

// Mô phỏng cân bằng: một "người chơi máy" chơi game với đồng hồ giả lập, ghi lại thời điểm đạt từng cảnh giới.
// Cách dùng: node tests/sim.mjs [số_giờ_mô_phỏng=30] [seed]
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HOURS = +(process.argv[2] || 30);
let seed = +(process.argv[3] || 12345);

let now = Date.UTC(2026, 0, 1, 8);
const timers = [];
let tid = 0;
const ctx = {
  console,
  setTimeout: (fn, ms) => { const id = ++tid; timers.push({ id, t: now + (ms || 0), fn }); return id; },
  clearTimeout: (id) => { const i = timers.findIndex((x) => x.id === id); if (i >= 0) timers.splice(i, 1); },
  setInterval: () => 0, clearInterval: () => {},
  requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
  performance: { now: () => now },
  localStorage: { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } },
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, body: { classList: { toggle() {} } }, readyState: 'complete' },
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'), atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  escape, unescape,
};
ctx.window = { matchMedia: () => ({ matches: false }), innerWidth: 1400, scrollTo() {}, addEventListener() {} };
vm.createContext(ctx);
vm.runInContext(`
  { const RD = Date; Date = class extends RD { constructor(...a) { if (a.length) super(...a); else super(__now()); } static now() { return __now(); } }; }
  Math.random = (() => { let s = __seed(); return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; })();
`, Object.assign(ctx, { __now: () => now, __seed: () => seed }));

const html = readFileSync(join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map((m) => m[1]).filter((f) => f !== 'js/main.js');
let src = files.map((f) => readFileSync(join(root, f), 'utf8')).join('\n;\n');
src += `
;const Main = { skipSave: false };
UI.eventModal = (ev, ctx) => { let i = ev.auto(ctx); const ch = ev.choices[i]; if (ch.can && ch.can(ctx) !== true) i = ev.choices.length - 1; const r = Events.choose(ev, ctx, i, false); if (r.fight) Events.fight(r.fight, ctx); };
UI.tribOpen = () => {}; UI.tribUpdate = () => {}; UI.rerootModal = () => {}; UI.showCreation = () => {};
globalThis.__api = { get G() { return G; }, D, Player, Inv, Gear, Combat, Explore, Dungeon, Tower, Trib, Alchemy, Forge, Cave, Pets, Sect, Market, Quests, Ach, Reinc, Arts, Stats, newLife, Creation, Save };
`;
vm.runInContext(src, ctx, { filename: 'game.js' });
const X = ctx.__api;
const { D, Player, Inv, Gear, Combat, Explore, Dungeon, Tower, Trib, Alchemy, Forge, Cave, Pets, Sect, Market, Quests, Arts } = X;

X.newLife({ name: 'Máy', gender: 'nam', bg: 'tho_san', root: { type: 'tam', els: ['hoa', 'kim', 'moc'] }, attrs: { ngoTinh: 5, canCot: 5, khiVan: 5, thanThuc: 5 } }, null);
const G = () => X.G;
G().settings.battleSpeed = 2;
G().settings.autoEvents = true;
G().flags.intro = false;

const fstats = {};
const origStart = Combat.start, origFinish = Combat.finish;
Combat.start = function (en, opts) { const ok = origStart.call(this, en, opts); if (ok && Combat.b) Combat.b.startHp = Combat.b.player.hp; return ok; };
Combat.finish = function (b, result, msg) {
  if (!b.over) {
    const r = D.realms[G().player.realm].name;
    const f = fstats[r] = fstats[r] || { n: 0, lose: 0, turns: 0, hpLoss: 0, lost: {} };
    f.n++; f.turns += b.turn; f.hpLoss += (b.startHp - Math.max(0, b.player.hp)) / b.player.maxHp;
    if (result === 'lose') { f.lose++; const k = b.kind + (b.enemy.boss ? '-boss' : b.enemy.elite ? '-elite' : ''); f.lost[k] = (f.lost[k] || 0) + 1; }
  }
  return origFinish.call(this, b, result, msg);
};
const tvSrc = {};
let inTick = false;
const origTick = Player.tick, origGain = Player.gainTuVi;
Player.tick = function (dt, off) { inTick = true; try { return origTick.call(this, dt, off); } finally { inTick = false; } };
Player.gainTuVi = function (amt, auto) {
  let k = 'passive';
  if (!inTick) {
    const st = (new Error().stack || '').split('\n').slice(2, 6).map((l) => (l.match(/at (?:Object\.)?([\w.]+)/) || [])[1]).filter(Boolean);
    k = st.find((x) => !/gainTuVi|give|Loot/.test(x)) || st[0] || '?';
  }
  tvSrc[k] = (tvSrc[k] || 0) + amt / Math.max(1, Player.cultRate());
  return origGain.call(this, amt, auto);
};
const log = [];
const milestones = {};
const counters = { trib: 0, tribFail: 0, breakFail: 0, lose: 0 };
const fmtT = (s) => (s / 3600).toFixed(2) + 'h';
const start = now;

function runTimers(until) {
  timers.sort((a, b) => a.t - b.t);
  while (timers.length && timers[0].t <= until) {
    const t = timers.shift();
    now = Math.max(now, t.t);
    try { t.fn(); } catch (e) { console.error('Lỗi timer @' + fmtT((now - start) / 1000), e); process.exit(1); }
    timers.sort((a, b) => a.t - b.t);
  }
}

function equipBest() {
  const p = G().player;
  for (const slot of D.slotOrder) {
    const cur = Gear.get(p.equip[slot]);
    let best = cur, bs = cur ? Gear.score(cur) : -1;
    for (const g of G().gear) if (g.slot === slot && p.realm >= Gear.reqRealm(g) && Gear.score(g) > bs) { bs = Gear.score(g); best = g; }
    if (best && best !== cur) Gear.equip(best.uid);
  }
  /* dọn túi */
  for (const g of G().gear.slice()) if (!Gear.isEquipped(g) && (g.tier < Math.max(1, p.realm) - 0 || g.q <= 1)) Gear.salvage(g.uid, true);
}

function manageArts() {
  const p = G().player;
  for (const id of Object.keys(G().inv)) if (id.startsWith('book_')) Inv.use(id);
  /* công pháp tốt nhất */
  let best = p.tech, bv = 0;
  for (const id in p.techs) {
    const t = D.techniques[id];
    const v = t.mult * (1 + 0.08 * (p.techs[id] - 1)) * (Player.hasElement(t.el) ? 1 + Player.matchBonus() : 1);
    if (v > bv) { bv = v; best = id; }
  }
  p.tech = best;
  /* thần thông: 4 cái giai cao nhất, ưu tiên tấn công */
  const ids = Object.keys(p.skills).sort((a, b) => (D.skills[b].tier - D.skills[a].tier) || ((D.skills[a].self ? 1 : 0) - (D.skills[b].self ? 1 : 0)));
  p.eq = ids.slice(0, 4);
  while (Arts.techUp(p.tech).ok);
  for (const id of p.eq) { const c = Arts.skillCost(id); if (p.insight > c.insight * 3 && p.stones > c.stones * 5) Arts.skillUp(id); }
}

function shop() {
  const p = G().player;
  const heal = p.realm >= 6 ? 'cuu_chuyen_dan' : p.realm >= 2 ? 'dai_hoan_dan' : 'hoi_khi_dan';
  const healId = Market.fixedList().includes(heal) ? heal : 'hoi_khi_dan';
  if (Inv.count(healId) < 12 && p.stones > Inv.buyPrice(healId) * 30) Market.buy(healId, 10);
  for (let i = 0; i < G().market.stock.length; i++) {
    const e = G().market.stock[i];
    if (e.sold || e.price > p.stones * 0.25) continue;
    if (e.kind === 'item' && e.id.startsWith('book_s_') && !p.skills[e.id.slice(7)] && D.skills[e.id.slice(7)].tier >= p.realm) Market.buyStock(i);
    if (e.kind === 'item' && e.id.startsWith('book_t_') && !p.techs[e.id.slice(7)]) Market.buyStock(i);
  }
  for (const id of Market.fixedList()) {
    if (id.startsWith('book_s_') && !p.skills[id.slice(7)] && D.skills[id.slice(7)].tier >= Math.max(1, p.realm) && Inv.buyPrice(id) < p.stones * 0.2) Market.buy(id, 1);
    if (id.startsWith('book_t_') && !p.techs[id.slice(7)] && Inv.buyPrice(id) < p.stones * 0.3) Market.buy(id, 1);
  }
  Market.refresh(false);
}

function crafts() {
  const p = G().player;
  /* đan đột phá */
  const next = D.realms[p.realm + 1];
  if (next && next.pill && !Inv.has(next.pill)) {
    const r = Alchemy.recipe(next.pill);
    if (r && G().prof.alch.lv >= r.lv) Alchemy.craft(next.pill, 1);
  }
  for (const r of D.recipes.slice().reverse()) {
    if (r.lv > G().prof.alch.lv) continue;
    const it = D.items[r.id];
    if (it.effect.type === 'heal' && Inv.count(r.id) < 20) Alchemy.craft(r.id, 3);
    if (it.effect.type === 'tuvi' && p.tox < 30 && it.tier >= p.realm - 1) Alchemy.craft(r.id, 1);
  }
  for (const id of Object.keys(G().inv)) {
    const it = D.items[id];
    if (it.cat === 'pill' && it.effect.type === 'tuvi' && p.tox < 40 && !Player.canBreak()) Inv.use(id, 1);
    if (it.cat === 'pill' && it.effect.type === 'attr') Inv.use(id, 1);
    if (it.cat === 'pill' && it.effect.type === 'buff' && it.effect.buff === 'cult' && !p.buffs.cult) Inv.use(id, 1);
    if (it.cat === 'pill' && it.effect.type === 'insight') Inv.use(id, 5);
    if (id === 'tui_linh_thach') Inv.use(id, 5);
    if (id === 'bi_canh_lenh') Inv.use(id, 1);
    if (id === 'giai_doc_dan' && p.tox > 50) Inv.use(id, 1);
    if (id === 'tri_thuong_dan' && Player.isInjured()) Inv.use(id, 1);
    if (id === 'tho_nguyen_dan' && Player.lifespan() - p.age < 30) Inv.use(id, 1);
  }
  /* luyện khí */
  const t = Forge.maxTier();
  for (let i = 0; i < 2; i++) if (Forge.can(t) === true && p.stones > Forge.cost(t).stones * 4) Forge.craft('random', t);
  /* cường hóa vũ khí, pháp y */
  for (const slot of ['weapon', 'armor', 'helmet', 'ring']) {
    const g = Gear.get(p.equip[slot]);
    if (g && g.enh < 10) { const c = Gear.enhanceCost(g); if (p.stones > c.stones * 6 && Inv.has(c.ore, c.n)) Gear.enhance(g.uid); }
  }
  if (Cave.canUpgrade() === true && p.stones > Cave.upgradeCost().stones * 2) Cave.upgrade();
  /* dược viên */
  G().cave.garden.forEach((g, i) => {
    if (g && g.ready <= now) Cave.harvest(i);
    if (!G().cave.garden[i]) {
      const herb = (D.herbsByTier[Math.max(1, Math.min(10, p.realm))] || []).find((h) => Inv.has(h)) || D.herbsByTier[1].find((h) => Inv.has(h));
      if (herb) Cave.plant(i, herb);
    }
  });
  /* linh thú */
  for (const id of Object.keys(G().inv)) if (D.items[id].cat === 'egg') Pets.placeEgg(id);
  G().nests.forEach((n, i) => { if (n && n.ready <= now) Pets.hatch(i); });
  if (G().pets.length) {
    const best = G().pets.slice().sort((a, b) => Pets.atk(b) - Pets.atk(a))[0];
    G().activePet = best.uid;
    for (let tr = 1; tr <= 10; tr++) { const id = 'yeu_dan_' + tr; if (Inv.count(id) > 8) Pets.feed(best.uid, id, Inv.count(id) - 8); }
  }
}

function social() {
  const p = G().player;
  if (!G().sect && Player.gs() >= D.SECT_JOIN_GS) Sect.join('thanh_van');
  if (G().sect) {
    Sect.claimSalary();
    G().sect.missions.forEach((m, i) => { if (Sect.progress(m) >= m.n) Sect.claim(i); });
    for (let i = 0; i < G().sect.missions.length; i++) { const m = G().sect.missions[i]; if ((m.t === 'donate' && p.stones < m.cost * 3)) Sect.reroll(i); }
    const items = Sect.shopItems();
    const next = D.realms[p.realm + 1];
    items.forEach((e, i) => {
      if (next && e.id === next.pill && !Inv.has(e.id)) Sect.buy(i);
      if (e.id.startsWith('book_') && !Inv.has(e.id) && !(p.techs[e.id.slice(7)] || p.skills[e.id.slice(7)])) Sect.buy(i);
      if (e.id === 'ti_loi_phu' && Inv.count('ti_loi_phu') < 1 && next && next.type === 'trib') Sect.buy(i);
    });
  }
  while (Quests.mainDone()) Quests.claimMain();
  Quests.ensureDaily().list.forEach((t, i) => Quests.claimDaily(i));
  [0, 1, 2].forEach((j) => Quests.claimChest(j));
  if (Quests.loginReady()) Quests.claimLogin();
}

function fights() {
  if (Combat.active() || Explore.busy || Trib.s && !Trib.s.done) return;
  const p = G().player;
  /* bí cảnh */
  if (G().dungeon.run && ['done', 'failed'].includes(G().dungeon.run.status)) Dungeon.leave();
  if (G().dungeon.run && G().dungeon.run.status === 'rest') { Combat.clear(); Dungeon.next(); return; }
  const st = Player.stats();
  if (!G().dungeon.run && p.hp > st.hp * 0.95) {
    const ds = D.dungeons.filter((d) => Dungeon.canEnter(d) === true && Player.gs() >= d.lv - 1);
    if (ds.length) { Explore.setAuto(false); Combat.clear(); Dungeon.enter(ds[ds.length - 1].id); return; }
  }
  if (G().dungeon.run) return;
  /* tháp mỗi 15 phút */
  if (now - (fights.lastTower || 0) > 900000) {
    fights.lastTower = now;
    Explore.setAuto(false); Combat.clear(); Tower.challenge();
    return;
  }
  const m = D.mapForGs(Player.gs());
  if (G().map !== m.id) { Explore.setAuto(false); Explore.setMap(m.id); }
  if (Explore.bossReady(m) && p.hp > st.hp * 0.95 && Player.gs() >= m.lv[1] - 1) { Explore.setAuto(false); Combat.clear(); Explore.challengeBoss(); return; }
  if (!Explore.auto) { Combat.clear(); Explore.setAuto(true); Explore.autoStep(); }
}

function breakthrough() {
  const p = G().player;
  if (!Player.canBreak() || Combat.active() || (Trib.s && !Trib.s.done)) return;
  if (!Player.isMajorNext()) { Player.advanceMinor(true); return; }
  const next = D.realms[p.realm + 1];
  if (next.type === 'trib') {
    const pv = Trib.preview();
    const heals = Inv.count('hoi_khi_dan') * 0.35 + Inv.count('dai_hoan_dan') * 0.7 + Inv.count('cuu_chuyen_dan');
    const has = Inv.has(next.pill);
    const est = pv.total * (has ? 0.75 : 1) * (Inv.has('ti_loi_phu') ? 0.7 : 1);
    if (est > pv.hp * (1 + Math.min(heals, 6) * 0.9) && (breakthrough.wait = (breakthrough.wait || 0) + 1) < 120) return;
    breakthrough.wait = 0;
    Explore.setAuto(false);
    counters.trib++;
    Trib.start(true);
    return;
  }
  if (!Inv.has(next.pill) && (breakthrough.waitP = (breakthrough.waitP || 0) + 1) < 60) return;
  breakthrough.waitP = 0;
  const r = Player.majorBreak(true);
  if (r && !r.ok) counters.breakFail++;
}

let lastRealm = -1;
const endT = now + HOURS * 3600 * 1000;
let lastBot = 0;
let lastTrib = null;
while (now < endT) {
  const step = 250;
  runTimers(now + step);
  now += step;
  const dt = step / 1000;
  G().lastTick = now;
  Player.tick(dt, false);
  if (G().player.age >= Player.lifespan()) { log.push('Chết vì thọ nguyên @' + fmtT((now - start) / 1000)); break; }
  if (Trib.s !== lastTrib && Trib.s) lastTrib = Trib.s;
  if (lastTrib && lastTrib.done && !lastTrib.counted) { lastTrib.counted = true; if (!lastTrib.ok) counters.tribFail++; }
  if (now - lastBot >= 5000) {
    lastBot = now;
    try { breakthrough(); manageArts(); equipBest(); shop(); crafts(); social(); fights(); } catch (e) { console.error('Lỗi bot @' + fmtT((now - start) / 1000), e); process.exit(1); }
    if (Combat.b && Combat.b.over && Combat.b.result === 'lose' && !Combat.b.counted) { Combat.b.counted = true; counters.lose++; }
    const p = G().player;
    if (p.realm !== lastRealm) {
      lastRealm = p.realm;
      milestones[D.realms[p.realm].name] = { t: (now - start) / 1000, age: p.age, power: Player.power(), mult: (Player.cultRate() / D.realms[p.realm].rate).toFixed(1), stones: Math.floor(p.stones), tech: D.techniques[p.tech].name };
    }
    /* bế quan khi tu vi chậm: dùng tối đa 35% thọ nguyên */
    if ((now - start) % 1800000 < 5000 && p.age + 10 < Player.lifespan() * 0.35 && !Player.canBreak()) Player.beQuan(10);
  }
}

const p = G().player;
console.log('=== Mô phỏng ' + HOURS + ' giờ chơi (seed ' + seed + ') ===');
for (const k in milestones) console.log(k.padEnd(12), fmtT(milestones[k].t).padStart(8), ' tuổi', milestones[k].age.toFixed(0).padStart(5), ' lực chiến', String(milestones[k].power).padStart(10), ' hệ số TL ×' + milestones[k].mult, ' 💎' + milestones[k].stones, milestones[k].tech);
const st = Player.stats();
console.log('Hiện tại:', D.gsName(Player.gs()), '| tuổi', p.age.toFixed(1) + '/' + Player.lifespan(), '| linh thạch', Math.floor(p.stones), '| ngộ đạo', Math.floor(p.insight));
console.log('Chỉ số:', JSON.stringify({ hp: st.hp, atk: st.atk, def: st.def, spd: st.spd, crit: st.crit.toFixed(1) }));
console.log('Kỳ vọng thiết kế @gs:', JSON.stringify(Trib.expected(Player.gs())));
console.log('Trang bị:', D.slotOrder.map((s) => { const g = Gear.get(p.equip[s]); return g ? g.tier + D.qualities[g.q].short + '+' + g.enh : '-'; }).join(' '));
console.log('Công pháp:', D.techniques[p.tech].name, 'tầng', p.techs[p.tech], '| thần thông:', p.eq.map((id) => D.skills[id].name + ' ' + p.skills[id]).join(', '));
console.log('Nghề: đan', G().prof.alch.lv, 'khí', G().prof.forge.lv, '| động phủ', G().cave.lv, '| tháp', G().tower.best, '| linh thú', G().pets.map((x) => D.petById[x.id].name + ' ' + x.lv).join(', '));
console.log('Tông môn:', G().sect ? D.sectRanks[G().sect.rank].name + ' ' + G().sect.total : '-', '| nhiệm vụ chính', G().quests.main, '| thành tựu', Object.keys(G().ach).length);
console.log('Thống kê:', JSON.stringify(G().stats));
console.log('Đếm:', JSON.stringify(counters));
console.log('Nguồn tu vi (quy ra giây tu luyện):', Object.entries(tvSrc).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + (v / 3600).toFixed(1) + 'h').join(', '));
console.log('Chiến đấu theo cảnh giới (số trận, thua, lượt TB, % sinh lực mất TB, thua theo loại):');
for (const k in fstats) { const f = fstats[k]; console.log('  ' + k.padEnd(11), String(f.n).padStart(5), String(f.lose).padStart(4), (f.turns / f.n).toFixed(1).padStart(6), (f.hpLoss / f.n * 100).toFixed(0).padStart(5) + '%', JSON.stringify(f.lost)); }
log.forEach((l) => console.log(l));

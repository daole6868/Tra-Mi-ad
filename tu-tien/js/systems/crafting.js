'use strict';
/* Nghề phụ: luyện đan, luyện khí; động phủ & dược viên */

const Prof = {
  names: { alch: 'Luyện đan', forge: 'Luyện khí' },
  titles: ['Học Đồ', 'Nhất Phẩm', 'Nhị Phẩm', 'Tam Phẩm', 'Tứ Phẩm', 'Ngũ Phẩm', 'Lục Phẩm', 'Thất Phẩm', 'Bát Phẩm', 'Cửu Phẩm', 'Tông Sư'],
  title(lv) { return Prof.titles[Math.min(10, Math.floor(lv / 2))]; },
  addExp(kind, n) {
    const p = G.prof[kind];
    const max = kind === 'alch' ? D.ALCH_MAX : D.FORGE_MAX;
    if (p.lv >= max) { p.exp = 0; return; }
    p.exp += n;
    while (p.lv < max && p.exp >= D.profExp(p.lv)) {
      p.exp -= D.profExp(p.lv);
      p.lv++;
      Log.add(Prof.names[kind] + ' thăng lên cấp ' + p.lv + '!', 'good');
      UI.toast(Prof.names[kind] + ' đạt cấp ' + p.lv, 'good');
    }
    if (p.lv >= max) p.exp = 0;
    Ach.check();
  },
};

const Alchemy = {
  recipe(id) { return D.recipes.find((r) => r.id === id); },
  cost(r) { return Math.floor(5 * D.tierPrice(D.items[r.id].tier)); },
  chance(r) {
    const b = Player.bonuses(), a = Player.attrs();
    const c = r.chance + (G.prof.alch.lv - r.lv) * 0.03 + a.khiVan * 0.005 + (b.alch || 0) / 100;
    return U.clamp(c, 0.05, 0.98);
  },
  maxTimes(r) {
    let n = Infinity;
    for (const id in r.herbs) n = Math.min(n, Math.floor(Inv.count(id) / r.herbs[id]));
    const c = Alchemy.cost(r);
    if (c > 0) n = Math.min(n, Math.floor(G.player.stones / c));
    return Math.max(0, n === Infinity ? 0 : n);
  },
  craft(id, times = 1) {
    const r = Alchemy.recipe(id);
    if (!r) return { ok: false, msg: 'Không có đan phương.' };
    if (G.prof.alch.lv < r.lv) return { ok: false, msg: 'Cần luyện đan cấp ' + r.lv + '.' };
    times = Math.min(times, Alchemy.maxTimes(r));
    if (times <= 0) return { ok: false, msg: 'Không đủ nguyên liệu hoặc linh thạch.' };
    let made = 0, fails = 0;
    for (let i = 0; i < times; i++) {
      Inv.removeAll(r.herbs);
      Player.spendStones(Alchemy.cost(r));
      const exp = Math.floor(8 * Math.pow(r.lv, 1.2));
      if (Math.random() < Alchemy.chance(r)) {
        const n = r.out + (Math.random() < 0.15 ? 1 : 0);
        Inv.add(r.id, n);
        made += n;
        Stats.add('pillsMade');
        Prof.addExp('alch', exp);
      } else {
        fails++;
        Prof.addExp('alch', Math.floor(exp * 0.4));
      }
    }
    Quests.check();
    Ach.check();
    Sfx.play(made ? 'up' : 'fail');
    const it = D.items[r.id];
    const msg = made ? 'Luyện thành ' + made + ' ' + it.name + (fails ? ' (' + fails + ' lò thất bại)' : '') + '.' : 'Tất cả ' + fails + ' lò đều thất bại, đan dược hóa thành tro.';
    if (made) Log.add('Luyện đan: ' + msg, 'good');
    return { ok: true, made, fails, msg };
  },
};

const Forge = {
  maxTier() {
    return Math.max(1, Math.min(10, Math.max(1, G.player.realm), 1 + Math.floor(G.prof.forge.lv / 2)));
  },
  cost(tier) {
    return { ore: D.oreByTier[tier], oreN: 3, core: 'yeu_dan_' + tier, coreN: 1, stones: Math.floor(30 * D.tierPrice(tier)) };
  },
  qBonus() {
    const b = Player.bonuses(), a = Player.attrs();
    return G.prof.forge.lv * 3 + (b.forge || 0) + a.khiVan * 1.5;
  },
  can(tier) {
    const c = Forge.cost(tier);
    if (tier > Forge.maxTier()) return 'Chưa đủ cảnh giới hoặc cấp luyện khí.';
    if (!Inv.has(c.ore, c.oreN)) return 'Thiếu ' + D.items[c.ore].name + '.';
    if (!Inv.has(c.core, c.coreN)) return 'Thiếu ' + D.items[c.core].name + '.';
    if (G.player.stones < c.stones) return 'Không đủ linh thạch.';
    if (G.gear.length >= Gear.MAX) return 'Túi trang bị đã đầy.';
    return true;
  },
  craft(slot, tier) {
    const ok = Forge.can(tier);
    if (ok !== true) return { ok: false, msg: ok };
    const c = Forge.cost(tier);
    Inv.remove(c.ore, c.oreN);
    Inv.remove(c.core, c.coreN);
    Player.spendStones(c.stones);
    if (slot === 'random') slot = Gear.randomSlot();
    const q = Gear.rollQuality(Forge.qBonus());
    const g = Gear.create(slot, tier, q);
    Stats.add('forged');
    Prof.addExp('forge', Math.floor(10 * Math.pow(tier, 1.3) * (1 + q * 0.3)));
    Quests.check();
    Sfx.play(q >= 3 ? 'realm' : 'up');
    Log.add('Luyện khí: ' + Gear.name(g) + ' (' + D.qualities[q].name + ').', q >= 3 ? 'good' : '');
    return { ok: true, g };
  },
};

const Cave = {
  MAX: 10,
  mult() { return 1 + 0.15 * (G.cave.lv - 1); },
  slots(lv) { return Math.min(7, 2 + Math.floor((lv - 1) / 2)); },
  growMult() { return 1 - 0.05 * (G.cave.lv - 1); },
  names: ['Thảo Lư', 'Thạch Động', 'Linh Động', 'Tiểu Động Phủ', 'Động Phủ', 'Linh Sơn Động Phủ', 'Tụ Linh Động Phủ', 'Động Thiên', 'Tiểu Động Thiên', 'Động Thiên Phúc Địa'],
  name() { return Cave.names[G.cave.lv - 1]; },
  upgradeCost() {
    const lv = G.cave.lv;
    return { stones: Math.floor(150 * Math.pow(3.2, lv - 1)), realm: lv };
  },
  canUpgrade() {
    if (G.cave.lv >= Cave.MAX) return 'Đã đạt cấp tối đa.';
    const c = Cave.upgradeCost();
    if (G.player.realm < c.realm) return 'Cần đạt ' + D.realms[c.realm].name + '.';
    if (G.player.stones < c.stones) return 'Không đủ linh thạch.';
    return true;
  },
  upgrade() {
    const ok = Cave.canUpgrade();
    if (ok !== true) return { ok: false, msg: ok };
    Player.spendStones(Cave.upgradeCost().stones);
    G.cave.lv++;
    while (G.cave.garden.length < Cave.slots(G.cave.lv)) G.cave.garden.push(null);
    Log.add('Động phủ nâng cấp thành ' + Cave.name() + ' (cấp ' + G.cave.lv + ').', 'good');
    Quests.check();
    Sfx.play('up');
    return { ok: true, msg: 'Động phủ đạt cấp ' + G.cave.lv + '.' };
  },
  plant(i, herb) {
    if (G.cave.garden[i] || !Inv.has(herb)) return false;
    const it = D.items[herb];
    Inv.remove(herb, 1);
    const now = Date.now();
    G.cave.garden[i] = { herb, at: now, ready: now + it.grow * 1000 * Cave.growMult() };
    return true;
  },
  ready(i) { const g = G.cave.garden[i]; return g && g.ready <= Date.now(); },
  harvest(i) {
    const g = G.cave.garden[i];
    if (!g || g.ready > Date.now()) return 0;
    const n = U.randInt(2, 4) + Math.floor(G.cave.lv / 3);
    Inv.add(g.herb, n);
    G.cave.garden[i] = null;
    Stats.add('harvests');
    return n;
  },
  harvestAll(replant) {
    let total = 0;
    const out = [];
    G.cave.garden.forEach((g, i) => {
      if (g && g.ready <= Date.now()) {
        const herb = g.herb;
        const n = Cave.harvest(i);
        total += n;
        out.push(D.items[herb].name + ' ×' + n);
        if (replant && Inv.has(herb)) Cave.plant(i, herb);
      }
    });
    return { total, out };
  },
};

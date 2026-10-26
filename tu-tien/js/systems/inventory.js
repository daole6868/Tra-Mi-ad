'use strict';
/* Hành trang, trang bị, phần thưởng */

const Inv = {
  count(id) { return G.inv[id] || 0; },
  has(id, n = 1) { return (G.inv[id] || 0) >= n; },
  add(id, n = 1) {
    if (!D.items[id] || n <= 0) return;
    G.inv[id] = (G.inv[id] || 0) + n;
    const cat = D.items[id].cat;
    if (cat === 'herb') Stats.add('herbs', n);
  },
  remove(id, n = 1) {
    if ((G.inv[id] || 0) < n) return false;
    G.inv[id] -= n;
    if (G.inv[id] <= 0) delete G.inv[id];
    return true;
  },
  hasAll(map, mult = 1) {
    for (const id in map) if (!Inv.has(id, map[id] * mult)) return false;
    return true;
  },
  removeAll(map, mult = 1) {
    if (!Inv.hasAll(map, mult)) return false;
    for (const id in map) Inv.remove(id, map[id] * mult);
    return true;
  },
  buyPrice(id) {
    const it = D.items[id];
    const bg = D.backgrounds.find((b) => b.id === G.player.bg);
    const disc = (bg && bg.shopDiscount) || 0;
    return Math.max(1, Math.floor(it.price * D.tierPrice(it.tier) * (1 - disc)));
  },
  sellPrice(id) {
    const it = D.items[id];
    return Math.max(1, Math.floor(it.price * D.tierPrice(it.tier) * 0.35));
  },
  sell(id, n = 1) {
    n = Math.min(n, Inv.count(id));
    if (n <= 0) return 0;
    Inv.remove(id, n);
    return Player.gainStones(Inv.sellPrice(id) * n, true);
  },

  /** Dùng vật phẩm ngoài chiến đấu */
  use(id, n = 1) {
    const it = D.items[id];
    const p = G.player;
    if (!it || !Inv.has(id)) return { ok: false, msg: 'Không có vật phẩm.' };
    if (it.cat === 'book') return Inv.learn(id);
    if (it.cat === 'egg') return Pets.placeEgg(id);
    const e = it.effect;
    if (!e) return { ok: false, msg: 'Vật phẩm này không thể sử dụng trực tiếp.' };
    let used = 0;
    const msgs = [];
    const st = Player.stats();
    for (let i = 0; i < n; i++) {
      if (!Inv.has(id)) break;
      let m = null;
      switch (e.type) {
        case 'heal':
          if (p.hp >= st.hp && (!e.mp || p.mp >= st.mp)) { m = '!Sinh lực đã đầy.'; break; }
          p.hp = Math.min(st.hp, p.hp + st.hp * e.pct);
          if (e.mp) p.mp = Math.min(st.mp, p.mp + st.mp * e.mp);
          m = 'Hồi phục sinh lực.';
          break;
        case 'mp':
          if (p.mp >= st.mp) { m = '!Linh lực đã đầy.'; break; }
          p.mp = Math.min(st.mp, p.mp + st.mp * e.pct);
          m = 'Hồi phục linh lực.';
          break;
        case 'cure':
          if (!Player.isInjured()) { m = '!Ngươi không bị thương.'; break; }
          p.injuredUntil = 0; m = 'Thương thế đã lành.';
          break;
        case 'tuvi': {
          if (Player.isMax()) { m = '!Tu vi đã đạt đỉnh.'; break; }
          if (p.tox >= 90) { m = '!Đan độc quá nặng, không thể dùng thêm.'; break; }
          if (Player.canBreak()) { m = '!Tu vi đã đầy, hãy đột phá trước.'; break; }
          const f = it.tier >= p.realm ? 1 : Math.pow(0.35, p.realm - it.tier);
          const amt = Player.cultRate() * e.sec * f;
          Player.gainTuVi(amt);
          p.tox = Math.min(100, p.tox + e.tox);
          m = '+' + U.fmt(amt) + ' tu vi' + (f < 1 ? ' (đan dược cấp thấp, hiệu quả giảm)' : '') + '.';
          break;
        }
        case 'buff':
          p.buffs[e.buff] = { val: e.val, until: Date.now() + e.dur * 1000 };
          m = it.desc;
          break;
        case 'attr':
          if ((p.attrPills[e.attr] || 0) >= 5) { m = '!Đã dùng tối đa loại đan này trong kiếp này.'; break; }
          p.attrPills[e.attr] = (p.attrPills[e.attr] || 0) + 1;
          m = D.attrs[e.attr].name + ' +1.';
          break;
        case 'detox':
          if (p.tox <= 0) { m = '!Cơ thể không có đan độc.'; break; }
          p.tox = Math.max(0, p.tox - e.val); m = 'Đan độc giảm ' + e.val + '.';
          break;
        case 'life': {
          if (p.lifePills >= 8) { m = '!Thọ Nguyên Đan đã mất hiệu lực với ngươi.'; break; }
          const add = Math.max(20, Math.floor(Player.realm().life * e.pct));
          p.lifeBonus += add; p.lifePills++;
          m = 'Thọ nguyên +' + add + ' năm.';
          break;
        }
        case 'insight': {
          const b = Player.bonuses();
          const amt = Math.floor(e.base * (1 + p.realm) * (1 + (b.insight || 0) / 100));
          p.insight += amt; m = '+' + U.fmt(amt) + ' ngộ đạo.';
          break;
        }
        case 'dungeonTicket':
          G.dungeon.bonus++; m = 'Thêm 1 lượt vào bí cảnh.';
          break;
        case 'stoneBag': {
          const amt = Player.gainStones(40 * D.statScale(Player.gs()) * U.rand(0.8, 1.5), true);
          m = '+' + U.fmt(amt) + ' linh thạch.';
          break;
        }
        case 'reroot':
          Inv.remove(id, 1);
          UI.rerootModal();
          return { ok: true, msg: '' };
        case 'break':
          m = '!Đan dược này được dùng tự động khi đột phá ' + D.realms[e.realm].name + '.';
          break;
        case 'charm':
          m = '!Tị Lôi Phù tự kích hoạt khi độ kiếp.';
          break;
        default:
          m = '!Không thể sử dụng.';
      }
      if (m && m[0] === '!') {
        if (!used) return { ok: false, msg: m.slice(1) };
        break;
      }
      Inv.remove(id, 1);
      used++;
      msgs.length = 0; msgs.push(m);
    }
    Quests.check();
    return { ok: used > 0, msg: (used > 1 ? 'Dùng ' + used + ' ' + it.name + '. ' : 'Dùng ' + it.name + '. ') + (msgs[0] || '') };
  },

  learn(id) {
    const it = D.items[id], p = G.player;
    const L = it.learn;
    if (L.kind === 'tech') {
      const t = D.techniques[L.id];
      if (p.techs[L.id]) {
        const ins = 30 * Math.pow(2, t.grade);
        Inv.remove(id, 1); p.insight += ins;
        return { ok: true, msg: 'Đã lĩnh ngộ ' + t.name + ' từ trước, chuyển hóa thành ' + ins + ' ngộ đạo.' };
      }
      Inv.remove(id, 1);
      p.techs[L.id] = 1;
      Log.add('Lĩnh ngộ công pháp ' + t.name + '.', 'good');
      return { ok: true, msg: 'Lĩnh ngộ công pháp ' + t.name + '! Vào trang Công Pháp để chuyển tu.' };
    }
    const s = D.skills[L.id];
    if (p.skills[L.id]) {
      const ins = 15 * s.tier;
      Inv.remove(id, 1); p.insight += ins;
      return { ok: true, msg: 'Đã học ' + s.name + ' từ trước, chuyển hóa thành ' + ins + ' ngộ đạo.' };
    }
    Inv.remove(id, 1);
    p.skills[L.id] = 1;
    if (p.eq.length < D.SKILL_SLOTS) p.eq.push(L.id);
    Log.add('Học được thần thông ' + s.name + '.', 'good');
    Quests.check();
    return { ok: true, msg: 'Học được thần thông ' + s.name + (p.eq.includes(L.id) ? ' và đã trang bị.' : '.') };
  },

  /** Danh sách vật phẩm theo nhóm */
  list(cat) {
    const out = [];
    for (const id in G.inv) {
      const it = D.items[id];
      if (!it) continue;
      if (cat && cat !== 'all' && it.cat !== cat) continue;
      out.push(it);
    }
    const order = { pill: 0, herb: 1, ore: 2, core: 3, book: 4, egg: 5, special: 6 };
    out.sort((a, b) => (order[a.cat] - order[b.cat]) || (a.tier - b.tier) || a.name.localeCompare(b.name));
    return out;
  },
};

const Gear = {
  MAX: 150,
  get(uid) { return uid ? G.gear.find((g) => g.uid === uid) : null; },
  name(g) { return D.slots[g.slot].names[g.tier - 1] + (g.enh ? ' +' + g.enh : ''); },
  reqRealm(g) { return Math.max(0, g.tier - 1); },
  isEquipped(g) { return G.player.equip[g.slot] === g.uid; },

  rollAffixes(q) {
    const n = D.qualities[q].affixes;
    const pool = D.affixes.slice();
    const out = [];
    for (let i = 0; i < n && pool.length; i++) {
      const a = U.weighted(pool);
      pool.splice(pool.indexOf(a), 1);
      out.push({ k: a.k, v: Math.round(a.base * (1 + 0.5 * q) * U.rand(0.7, 1.3) * 10) / 10 });
    }
    return out;
  },

  rollQuality(bonusPct = 0, minQ = 0) {
    const list = D.qualities.map((q, i) => ({ i, w: i < minQ ? 0 : q.w * Math.pow(1 + bonusPct / 100, i) }));
    return U.weighted(list).i;
  },

  create(slot, tier, q) {
    const g = { uid: U.uid(), slot, tier: U.clamp(tier, 1, 10), q, enh: 0, affixes: Gear.rollAffixes(q), lock: false };
    G.gear.push(g);
    if (G.settings.autoSalvage >= 0 && q <= G.settings.autoSalvage && G.player && G.player.equip && Object.keys(G.player.equip).length >= 2) {
      const r = Gear.salvage(g.uid, true);
      if (r) { g._salvaged = true; }
    }
    return g;
  },

  randomSlot() { return U.pick(D.slotOrder); },

  mainStats(g) {
    const base = D.slots[g.slot].main, out = {};
    const qm = D.qualities[g.q].mult;
    for (const k in base) {
      if (D.flatKeys[k] && k !== 'spd') out[k] = base[k] * D.tierScale(g.tier) * qm * (1 + 0.07 * g.enh);
      else if (k === 'spd') out[k] = (base[k] + 0.6 * g.tier) * qm * (1 + 0.05 * g.enh);
      else out[k] = (base[k] + 0.3 * g.tier) * qm * (1 + 0.05 * g.enh);
    }
    return out;
  },

  value(g) { return Math.floor(10 * D.tierPrice(g.tier) * Math.pow(D.qualities[g.q].mult, 2) * (1 + 0.15 * g.enh)); },

  equip(uid, force) {
    const g = Gear.get(uid);
    if (!g) return { ok: false, msg: 'Không tìm thấy trang bị.' };
    if (!force && G.player.realm < Gear.reqRealm(g)) return { ok: false, msg: 'Cần đạt ' + D.realms[Gear.reqRealm(g)].name + ' để trang bị.' };
    const p = G.player;
    const st0 = Player.stats();
    p.equip[g.slot] = uid;
    const st = Player.stats();
    p.hp = Math.min(st.hp, p.hp * (st.hp / Math.max(1, st0.hp)));
    p.mp = Math.min(st.mp, p.mp);
    return { ok: true, msg: 'Đã trang bị ' + Gear.name(g) + '.' };
  },
  unequip(slot) {
    delete G.player.equip[slot];
    const st = Player.stats();
    G.player.hp = Math.min(G.player.hp, st.hp);
    G.player.mp = Math.min(G.player.mp, st.mp);
  },

  remove(uid) {
    const i = G.gear.findIndex((g) => g.uid === uid);
    if (i >= 0) G.gear.splice(i, 1);
  },

  sell(uid) {
    const g = Gear.get(uid);
    if (!g || g.lock || Gear.isEquipped(g)) return 0;
    Gear.remove(uid);
    return Player.gainStones(Gear.value(g), true);
  },

  salvageYield(g) {
    return { ore: D.oreByTier[g.tier], n: 1 + g.q + Math.floor(g.enh / 3), stones: Math.floor(Gear.value(g) * 0.3) };
  },
  salvage(uid, quiet) {
    const g = Gear.get(uid);
    if (!g || g.lock || Gear.isEquipped(g)) return null;
    const y = Gear.salvageYield(g);
    Gear.remove(uid);
    Inv.add(y.ore, y.n);
    Player.gainStones(y.stones, true);
    if (!quiet) Sfx.play('coin');
    return y;
  },

  enhanceCost(g) {
    return {
      stones: Math.floor(20 * D.tierPrice(g.tier) * Math.pow(g.enh + 1, 1.5)),
      ore: D.oreByTier[g.tier],
      n: 1 + Math.floor(g.enh / 3),
    };
  },
  enhanceChance(g) {
    const b = Player.bonuses();
    const base = g.enh < 3 ? 1 : Math.max(0.3, 1 - (g.enh - 2) * 0.055);
    return Math.min(1, base + (b.forge || 0) / 200);
  },
  enhance(uid) {
    const g = Gear.get(uid);
    if (!g) return { ok: false, msg: 'Không tìm thấy trang bị.' };
    if (g.enh >= 15) return { ok: false, msg: 'Đã cường hóa tối đa.' };
    const c = Gear.enhanceCost(g);
    if (G.player.stones < c.stones) return { ok: false, msg: 'Không đủ linh thạch.' };
    if (!Inv.has(c.ore, c.n)) return { ok: false, msg: 'Thiếu ' + c.n + ' ' + D.items[c.ore].name + '.' };
    Player.spendStones(c.stones);
    Inv.remove(c.ore, c.n);
    Stats.add('enhances');
    if (Math.random() < Gear.enhanceChance(g)) {
      g.enh++;
      Ach.check();
      Sfx.play('up');
      return { ok: true, success: true, msg: 'Cường hóa thành công! ' + Gear.name(g) };
    }
    let msg = 'Cường hóa thất bại.';
    if (g.enh >= 10) { g.enh--; msg += ' Cấp cường hóa giảm còn +' + g.enh + '.'; }
    Sfx.play('fail');
    return { ok: true, success: false, msg };
  },

  sorted(filter) {
    const list = G.gear.filter((g) => !filter || filter === 'all' || g.slot === filter);
    return list.sort((a, b) => (Gear.isEquipped(b) - Gear.isEquipped(a)) || (b.tier - a.tier) || (b.q - a.q) || (b.enh - a.enh));
  },

  /** Điểm so sánh đơn giản để biết món nào tốt hơn */
  score(g) {
    const m = Gear.mainStats(g);
    let s = (m.atk || 0) * 3 + (m.def || 0) * 2 + (m.hp || 0) * 0.35 + (m.mp || 0) * 0.1 + (m.spd || 0) * 5 + (m.crit || 0) * 4 + (m.dodge || 0) * 4;
    const sc = D.tierScale(g.tier);
    for (const af of g.affixes) s += af.v * sc * 0.6;
    return s;
  },
};

/* Phát phần thưởng tổng hợp */
const Loot = {
  give(r, src) {
    const out = [];
    if (!r) return out;
    if (r.stones) out.push('💎 ' + U.fmt(Player.gainStones(r.stones, r.raw)) + ' linh thạch');
    if (r.insight) { G.player.insight += r.insight; out.push('💡 ' + U.fmt(r.insight) + ' ngộ đạo'); }
    if (r.contrib && G.sect) { Sect.addContrib(r.contrib); out.push('🏅 ' + U.fmt(r.contrib) + ' cống hiến'); }
    if (r.tuvi) { Player.gainTuVi(r.tuvi); out.push('✨ ' + U.fmt(r.tuvi) + ' tu vi'); }
    if (r.items) {
      for (const id in r.items) {
        if (!D.items[id] || r.items[id] <= 0) continue;
        Inv.add(id, r.items[id]);
        out.push(D.items[id].icon + ' ' + D.items[id].name + ' ×' + r.items[id]);
      }
    }
    if (r.gear) {
      for (const gd of r.gear) {
        const g = Gear.create(gd.slot || Gear.randomSlot(), gd.tier, gd.q);
        out.push('<span style="color:' + D.qualities[g.q].color + '">' + D.slots[g.slot].icon + ' ' + Gear.name(g) + ' (' + D.qualities[g.q].short + ')</span>' + (g._salvaged ? ' → phân giải' : ''));
      }
    }
    return out;
  },
};

'use strict';
/* Nhân vật: chỉ số, tu luyện, đột phá, thọ nguyên */

const Player = {
  gs() { return D.rsToGs(G.player.realm, G.player.stage); },
  realm() { return D.realms[G.player.realm]; },
  req() {
    const p = G.player, r = D.realms[p.realm];
    return Math.floor(r.baseReq * Math.pow(r.grow, p.stage));
  },
  isMax() { return Player.gs() >= D.MAX_GS; },
  isMajorNext() {
    const p = G.player;
    return p.stage >= D.realms[p.realm].stages - 1;
  },
  rootType() { return D.rootTypes.find((r) => r.id === G.player.root.type) || D.rootTypes[0]; },
  rootName(root) {
    root = root || G.player.root;
    const rt = D.rootTypes.find((r) => r.id === root.type);
    if (rt.all) return rt.name;
    return rt.name + ' (' + root.els.map((e) => D.elements[e].name).join(' · ') + ')';
  },
  hasElement(el) {
    const root = G.player.root;
    if (!el || el === 'none') return false;
    if (el === 'all') return true;
    const rt = Player.rootType();
    return !!rt.all || root.els.includes(el);
  },
  matchBonus() {
    const rt = Player.rootType();
    return 0.4 / Math.max(1, rt.count || 1);
  },
  starterSkill(root) {
    const map = { kim: 'kim_quang_tram', moc: 'dang_man', thuy: 'bang_tien', hoa: 'hoa_cau', tho: 'tho_thuan', loi: 'hoa_cau', bang: 'bang_tien', phong: 'kim_quang_tram' };
    const el = root.els && root.els[0];
    return map[el] || 'hoa_cau';
  },

  attrs() {
    const p = G.player, out = {};
    for (const k in D.attrs) out[k] = (p.attrs[k] || 0) + (p.attrPills[k] || 0);
    return out;
  },

  /** Tổng hợp mọi nguồn bonus */
  bonuses() {
    const p = G.player, b = {};
    const t = D.techniques[p.tech];
    if (t) U.addBonus(b, t.bonus, 1 + 0.1 * ((p.techs[p.tech] || 1) - 1));
    for (const slot of D.slotOrder) {
      const g = Gear.get(p.equip[slot]);
      if (!g) continue;
      U.addBonus(b, Gear.mainStats(g));
      for (const af of g.affixes) b[af.k] = (b[af.k] || 0) + af.v;
    }
    if (G.sect) {
      const sd = D.sectById[G.sect.id];
      U.addBonus(b, sd.bonus, 1 + 0.5 * G.sect.rank);
    }
    const pet = Pets.active();
    if (pet) U.addBonus(b, Pets.passive(pet));
    for (const a of D.achievements) if (G.ach[a.id]) U.addBonus(b, a.b);
    for (const tl of D.reincTalents) {
      const lv = Reinc.lv(tl.id);
      if (lv && tl.key) b[tl.key] = (b[tl.key] || 0) + tl.per * lv;
    }
    const now = Date.now();
    for (const k in p.buffs) {
      const bf = p.buffs[k];
      if (bf.until > now) {
        const key = k === 'atk' ? 'atkPct' : k === 'def' ? 'defPct' : k;
        b[key] = (b[key] || 0) + bf.val;
      }
    }
    if (p.tribBonus) b.allPct = (b.allPct || 0) + p.tribBonus;
    return b;
  },

  stats() {
    const b = Player.bonuses(), a = Player.attrs();
    const s = D.statScale(Player.gs());
    const all = 1 + (b.allPct || 0) / 100;
    let hp = 100 * s * (1 + 0.05 * a.canCot) + (b.hp || 0);
    let mp = 50 * s * (1 + 0.06 * a.thanThuc) + (b.mp || 0);
    let atk = 12 * s * (1 + 0.03 * a.thanThuc) + (b.atk || 0);
    let def = 5 * s * (1 + 0.03 * a.canCot) + (b.def || 0);
    let spd = 10 + (b.spd || 0);
    hp *= (1 + (b.hpPct || 0) / 100) * all;
    mp *= (1 + (b.mpPct || 0) / 100) * all;
    atk *= (1 + (b.atkPct || 0) / 100) * all;
    def *= (1 + (b.defPct || 0) / 100) * all;
    spd *= (1 + (b.spdPct || 0) / 100);
    return {
      hp: Math.floor(hp), mp: Math.floor(mp), atk: Math.floor(atk), def: Math.floor(def),
      spd: Math.round(spd * 10) / 10,
      crit: Math.min(75, 5 + 0.5 * a.thanThuc + 0.3 * a.khiVan + (b.crit || 0)),
      critDmg: 150 + (b.critDmg || 0),
      dodge: Math.min(50, 3 + (b.dodge || 0)),
      lifesteal: Math.min(40, b.lifesteal || 0),
      drop: (b.drop || 0) + 3 * a.khiVan,
      bonus: b,
    };
  },

  /** Lực chiến tham khảo */
  power(st) {
    st = st || Player.stats();
    return Math.floor(st.atk * 3 + st.def * 2 + st.hp * 0.35 + st.mp * 0.1 + st.atk * (st.crit / 100) * (st.critDmg / 100) * 2 + st.spd * 5);
  },

  isInjured() { return G.player.injuredUntil > Date.now(); },

  /** Tốc độ tu luyện (tu vi/giây) kèm bảng phân tích */
  cultRate(detail) {
    const p = G.player, realm = Player.realm(), b = Player.bonuses(), a = Player.attrs();
    const parts = [];
    let rate = realm.rate * (1 + 0.1 * p.stage);
    parts.push(['Cảnh giới', U.fmt(rate) + '/s']);
    const rt = Player.rootType();
    rate *= rt.mult; parts.push(['Linh căn', '×' + rt.mult]);
    const ng = 1 + 0.04 * a.ngoTinh; rate *= ng; parts.push(['Ngộ tính', '×' + ng.toFixed(2)]);
    const t = D.techniques[p.tech];
    const tm = t.mult * (1 + 0.08 * ((p.techs[p.tech] || 1) - 1));
    rate *= tm; parts.push(['Công pháp', '×' + tm.toFixed(2)]);
    if (Player.hasElement(t.el)) {
      const mb = 1 + Player.matchBonus(); rate *= mb; parts.push(['Hợp linh căn', '×' + mb.toFixed(2)]);
    }
    const cm = Cave.mult(); rate *= cm; parts.push(['Động phủ', '×' + cm.toFixed(2)]);
    const cb = 1 + (b.cult || 0) / 100; rate *= cb; if (b.cult) parts.push(['Gia trì', '×' + cb.toFixed(2)]);
    if (p.tox > 0) { const tf = 1 - p.tox * 0.005; rate *= tf; parts.push(['Đan độc', '×' + tf.toFixed(2)]); }
    if (Player.isInjured()) { rate *= 0.5; parts.push(['Trọng thương', '×0.5']); }
    return detail ? { rate, parts } : rate;
  },

  insightRate() {
    const b = Player.bonuses(), a = Player.attrs();
    return 0.05 * (1 + 0.5 * G.player.realm) * (1 + 0.1 * a.ngoTinh) * (1 + (b.insight || 0) / 100);
  },

  lifespan() {
    const b = Player.bonuses();
    const base = Player.realm().life + G.player.lifeBonus;
    return Math.floor(base * (1 + (b.life || 0) / 100));
  },

  /** Cộng tu vi; tự đột phá tiểu cảnh giới nếu bật. Trả về số tầng đã lên */
  gainTuVi(amount, allowAuto = true) {
    const p = G.player;
    let ups = 0;
    let guard = 0;
    while (amount > 0 && guard++ < 200) {
      if (Player.isMax()) { p.tuVi = Math.min(p.tuVi + amount, Player.req()); break; }
      const req = Player.req();
      if (p.tuVi + amount < req) { p.tuVi += amount; break; }
      if (!Player.isMajorNext() && allowAuto && G.settings.autoBreak) {
        amount -= req - p.tuVi;
        p.tuVi = 0;
        Player.advanceMinor(true);
        ups++;
      } else {
        p.tuVi = req;
        break;
      }
    }
    return ups;
  },

  canBreak() { return !Player.isMax() && G.player.tuVi >= Player.req(); },

  advanceMinor(quiet) {
    const p = G.player;
    p.stage++;
    p.tuVi = 0;
    Stats.add('breakthroughs');
    Player.onRealmChange();
    if (!quiet) UI.toast('Đột phá thành công: ' + D.stageName(p.realm, p.stage), 'good');
    Log.add('Đột phá ' + D.stageName(p.realm, p.stage) + '.', 'realm');
    Sfx.play('up');
  },

  /** Tỉ lệ đột phá đại cảnh giới (loại chance) */
  breakChance(usePill) {
    const p = G.player, next = D.realms[p.realm + 1];
    if (!next) return 0;
    if (next.type === 'auto') return 1;
    const a = Player.attrs();
    let c = (next.chance || 0.5) + a.khiVan * 0.01 + p.breakFails * 0.05;
    if (usePill) c += 0.3;
    return U.clamp(c, 0.05, 1);
  },

  /** Đột phá đại cảnh giới (auto/chance). Thiên kiếp xử lý ở Trib */
  majorBreak(usePill) {
    const p = G.player, next = D.realms[p.realm + 1];
    if (!next || !Player.canBreak()) return null;
    if (next.type === 'trib') return null;
    if (usePill && next.pill && Inv.has(next.pill)) Inv.remove(next.pill, 1);
    else usePill = false;
    const chance = Player.breakChance(usePill);
    if (Math.random() < chance) {
      Player.enterRealm(p.realm + 1);
      return { ok: true, chance };
    }
    p.tuVi = Math.floor(p.tuVi * 0.7);
    p.breakFails++;
    p.injuredUntil = Date.now() + 5 * 60 * 1000;
    Log.add('Đột phá ' + next.name + ' thất bại! Tu vi tổn hao, kinh mạch bị thương.', 'bad');
    Sfx.play('fail');
    return { ok: false, chance };
  },

  enterRealm(r) {
    const p = G.player;
    p.realm = r;
    p.stage = 0;
    p.tuVi = 0;
    p.breakFails = 0;
    Stats.add('breakthroughs');
    Player.onRealmChange();
    const st = Player.stats();
    p.hp = st.hp; p.mp = st.mp;
    Log.add('Chúc mừng! Đột phá thành công ' + D.realms[r].name + ' kỳ. Thọ nguyên tăng lên ' + Player.lifespan() + ' năm.', 'realm');
    Sfx.play('realm');
    UI.flash(D.realms[r].color);
  },

  onRealmChange() {
    const gs = Player.gs();
    if (gs > (G.reinc.bestGs || 0)) G.reinc.bestGs = gs;
    Quests.check();
    Ach.check();
  },

  /** Hồi phục ngoài chiến đấu mỗi tick */
  regen(dt) {
    const p = G.player, st = Player.stats();
    if (Combat.active()) return;
    p.hp = Math.min(st.hp, p.hp + st.hp * 0.025 * dt);
    p.mp = Math.min(st.mp, p.mp + st.mp * 0.03 * dt);
  },

  /** Tick tu luyện chính */
  tick(dt, offline) {
    const p = G.player;
    const rate = Player.cultRate();
    const gain = rate * dt * (offline ? 0.8 : 1);
    Player.gainTuVi(gain);
    p.insight += Player.insightRate() * dt * (offline ? 0.8 : 1);
    p.tox = Math.max(0, p.tox - dt / 60);
    p.age += dt / D.YEAR_SECONDS;
    for (const k in p.buffs) if (p.buffs[k].until <= Date.now()) delete p.buffs[k];
    if (!offline) Player.regen(dt);
    return gain;
  },

  karmaLabel() {
    const k = G.player.karma;
    if (k >= 100) return ['Đại Thiện', 'good'];
    if (k >= 30) return ['Chính Nghĩa', 'good'];
    if (k <= -100) return ['Ma Đầu', 'bad'];
    if (k <= -30) return ['Tà Đạo', 'bad'];
    return ['Trung Lập', ''];
  },

  addKarma(n) { G.player.karma = U.clamp(G.player.karma + n, -500, 500); Ach.check(); },

  gainStones(n, noBonus) {
    if (!noBonus) {
      const b = Player.bonuses();
      n *= 1 + (b.stonePct || 0) / 100;
    }
    n = Math.floor(n);
    G.player.stones += n;
    Stats.add('stonesEarned', n);
    return n;
  },
  spendStones(n) {
    n = Math.ceil(n);
    if (G.player.stones < n) return false;
    G.player.stones -= n;
    return true;
  },

  /** Bế quan: đổi thọ nguyên lấy tu vi */
  beQuan(years) {
    const p = G.player;
    if (Combat.active()) return { err: 'Đang chiến đấu, không thể bế quan.' };
    if (p.age + years >= Player.lifespan()) return { err: 'Thọ nguyên không đủ để bế quan ' + years + ' năm.' };
    const rate = Player.cultRate();
    const before = Player.gs();
    const gain = rate * years * 30;
    p.age += years;
    const ups = Player.gainTuVi(gain);
    const ins = Player.insightRate() * years * 20;
    p.insight += ins;
    p.tox = Math.max(0, p.tox - years * 0.5);
    Stats.add('beQuanYears', years);
    Quests.check();
    Ach.check();
    return { gain, ins, ups, before };
  },
};

/* Bộ đếm thống kê trọn đời */
const Stats = {
  add(k, n = 1) {
    G.stats[k] = (G.stats[k] || 0) + n;
    Quests.onStat(k);
  },
  get(k) { return G.stats[k] || 0; },
};

/* Nhật ký sự kiện */
const Log = {
  add(msg, type = '') {
    const t = new Date();
    const time = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
    G.log.unshift({ msg, type, time });
    if (G.log.length > 150) G.log.length = 150;
    UI.appendLog && UI.appendLog({ msg, type, time });
  },
};

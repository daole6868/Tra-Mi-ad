'use strict';
/* Trạng thái game, lưu/đọc, xuất/nhập dữ liệu */

let G = null;

const Save = {
  KEY: 'vandao_tiendo_save_v1',

  blank() {
    const now = Date.now();
    return {
      v: 1,
      created: now,
      lastTick: now,
      player: null,
      inv: {},
      gear: [],
      prof: { alch: { lv: 1, exp: 0 }, forge: { lv: 1, exp: 0 } },
      cave: { lv: 1, garden: [null, null] },
      pets: [],
      activePet: null,
      nests: [null, null],
      sect: null,
      market: { stock: [], refreshAt: 0 },
      quests: { main: 0, mainBase: 0, daily: null, login: { last: '', streak: 0, claimed: '' } },
      ach: {},
      stats: {},
      map: 'thanh_van_son',
      bossCd: {},
      dungeon: { date: '', used: 0, bonus: 0, run: null },
      tower: { best: 0 },
      reinc: { count: 0, points: 0, talents: {}, bestGs: 0, totalPoints: 0 },
      settings: { sound: true, autoBreak: true, autoHeal: true, battleSpeed: 1, autoBattle: true, autoSalvage: -1, autoEvents: true },
      log: [],
      flags: {},
      ui: { tab: 'cultivate' },
    };
  },

  /** Bổ sung các trường thiếu (khi nâng cấp phiên bản) */
  fixup(s) {
    const b = Save.blank();
    for (const k in b) if (s[k] === undefined) s[k] = b[k];
    for (const k of ['prof', 'quests', 'dungeon', 'tower', 'reinc', 'settings', 'cave']) {
      for (const kk in b[k]) if (s[k][kk] === undefined) s[k][kk] = b[k][kk];
    }
    if (s.player) {
      const p = s.player;
      p.buffs = p.buffs || {};
      p.attrPills = p.attrPills || { ngoTinh: 0, canCot: 0, khiVan: 0, thanThuc: 0 };
      p.techs = p.techs || { dan_khi_quyet: 1 };
      p.skills = p.skills || {};
      p.eq = p.eq || [];
      p.equip = p.equip || {};
      p.lifePills = p.lifePills || 0;
      p.lifeBonus = p.lifeBonus || 0;
      p.tribBonus = p.tribBonus || 0;
      p.breakFails = p.breakFails || 0;
      p.karma = p.karma || 0;
      p.tox = p.tox || 0;
    }
    while (s.cave.garden.length < Cave.slots(s.cave.lv)) s.cave.garden.push(null);
    s.dungeon.run = null;
    return s;
  },

  serialize() { return JSON.stringify(G); },

  save() {
    if (!G || Main.skipSave) return false;
    try {
      localStorage.setItem(Save.KEY, Save.serialize());
      G.lastSave = Date.now();
      return true;
    } catch (e) {
      return false;
    }
  },

  loadRaw() {
    try { return localStorage.getItem(Save.KEY); } catch (e) { return null; }
  },

  parse(str) {
    const s = JSON.parse(str);
    if (!s || typeof s !== 'object' || !('v' in s)) throw new Error('Dữ liệu không hợp lệ');
    return Save.fixup(s);
  },

  exportString() {
    return btoa(unescape(encodeURIComponent(Save.serialize())));
  },

  importString(str) {
    const json = decodeURIComponent(escape(atob(str.trim())));
    return Save.parse(json);
  },

  wipe() {
    try { localStorage.removeItem(Save.KEY); } catch (e) { /* bỏ qua */ }
  },
};

/** Tạo kiếp sống mới. keep: dữ liệu giữ lại sau luân hồi */
function newLife(opts, keep) {
  const s = Save.blank();
  if (keep) {
    s.ach = keep.ach || {};
    s.stats = keep.stats || {};
    s.reinc = keep.reinc || s.reinc;
    s.settings = keep.settings || s.settings;
    s.tower = { best: 0 };
  }
  G = s;
  const bg = D.backgrounds.find((b) => b.id === opts.bg) || D.backgrounds[0];
  const attrs = Object.assign({}, opts.attrs);
  const tp = Reinc.lv('thien_phu');
  for (const k in attrs) attrs[k] += tp;
  for (const k in bg.attrs) attrs[k] = (attrs[k] || 0) + bg.attrs[k];
  s.player = {
    name: opts.name, gender: opts.gender, bg: bg.id,
    root: opts.root, attrs, attrPills: { ngoTinh: 0, canCot: 0, khiVan: 0, thanThuc: 0 },
    realm: 0, stage: 0, tuVi: 0, age: 16, lifeBonus: 0, lifePills: 0,
    hp: 1, mp: 1, karma: 0, insight: bg.insight || 0, stones: 100 + (bg.stones || 0) + Reinc.lv('gia_tai') * 500,
    tox: 0, injuredUntil: 0, buffs: {},
    tech: 'dan_khi_quyet', techs: { dan_khi_quyet: 1 }, skills: {}, eq: [], equip: {},
    tribBonus: 0, breakFails: 0,
  };
  const nghe = Reinc.lv('nghe_cu');
  s.prof.alch.lv += nghe;
  s.prof.forge.lv += nghe;
  /* Vật phẩm khởi đầu */
  Inv.add('hoi_khi_dan', 3);
  Inv.add('book_s_' + Player.starterSkill(opts.root), 1);
  for (const id in bg.items || {}) Inv.add(id, bg.items[id]);
  const w = Gear.create('weapon', 1, bg.gear ? bg.gear.quality : 0);
  const a = Gear.create('armor', 1, 0);
  Gear.equip(w.uid, true);
  Gear.equip(a.uid, true);
  const st = Player.stats();
  s.player.hp = st.hp;
  s.player.mp = st.mp;
  Quests.initMain();
  Market.refresh(true);
  s.flags.intro = true;
  return s;
}

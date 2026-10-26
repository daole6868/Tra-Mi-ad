'use strict';
/* Công pháp & thần thông (logic + giao diện), hành trang, chi tiết vật phẩm */

const Arts = {
  techCost(id) {
    const t = D.techniques[id], lv = G.player.techs[id] || 1;
    return Math.floor(25 * Math.pow(1.7, t.grade) * Math.pow(lv, 1.6));
  },
  techUp(id) {
    const p = G.player, lv = p.techs[id];
    if (!lv) return { ok: false, msg: 'Chưa lĩnh ngộ.' };
    if (lv >= D.TECH_MAX) return { ok: false, msg: 'Đã đại thành.' };
    const c = Arts.techCost(id);
    if (p.insight < c) return { ok: false, msg: 'Cần ' + U.fmt(c) + ' ngộ đạo.' };
    p.insight -= c;
    p.techs[id] = lv + 1;
    Quests.check(); Ach.check();
    Sfx.play('up');
    return { ok: true, msg: D.techniques[id].name + ' đạt tầng ' + (lv + 1) + '.' };
  },
  techSwitch(id) {
    if (!G.player.techs[id]) return { ok: false, msg: 'Chưa lĩnh ngộ.' };
    G.player.tech = id;
    return { ok: true, msg: 'Chuyển tu ' + D.techniques[id].name + '.' };
  },
  skillCost(id) {
    const s = D.skills[id], lv = G.player.skills[id] || 1;
    return { insight: Math.floor(12 * Math.pow(1.6, s.tier) * Math.pow(lv, 1.5)), stones: Math.floor(30 * D.tierPrice(s.tier) * lv) };
  },
  skillUp(id) {
    const p = G.player, lv = p.skills[id];
    if (!lv) return { ok: false, msg: 'Chưa học.' };
    if (lv >= D.SKILL_MAX) return { ok: false, msg: 'Đã đạt cảnh giới viên mãn.' };
    const c = Arts.skillCost(id);
    if (p.insight < c.insight) return { ok: false, msg: 'Cần ' + U.fmt(c.insight) + ' ngộ đạo.' };
    if (p.stones < c.stones) return { ok: false, msg: 'Cần ' + U.fmt(c.stones) + ' linh thạch.' };
    p.insight -= c.insight; p.stones -= c.stones;
    p.skills[id] = lv + 1;
    Sfx.play('up');
    return { ok: true, msg: D.skills[id].name + ' đạt cấp ' + (lv + 1) + '.' };
  },
  skillToggle(id) {
    const p = G.player;
    if (!p.skills[id]) return { ok: false, msg: 'Chưa học.' };
    const i = p.eq.indexOf(id);
    if (i >= 0) { p.eq.splice(i, 1); return { ok: true, msg: 'Đã tháo ' + D.skills[id].name + '.' }; }
    if (p.eq.length >= D.SKILL_SLOTS) return { ok: false, msg: 'Chỉ trang bị tối đa ' + D.SKILL_SLOTS + ' thần thông.' };
    p.eq.push(id);
    Quests.check();
    return { ok: true, msg: 'Đã trang bị ' + D.skills[id].name + '.' };
  },
};

UI.skillDesc = (s, lv = 1) => {
  const lm = 1 + 0.1 * (lv - 1);
  const parts = [];
  if (s.mult) parts.push('Sát thương ' + Math.round(s.mult * lm * 100) + '%' + (s.hits > 1 ? ' ×' + s.hits + ' đòn' : ''));
  if (s.pierce) parts.push('xuyên giáp ' + Math.round(s.pierce * 100) + '%');
  if (s.lifesteal) parts.push('hút máu ' + Math.round(s.lifesteal * 100) + '%');
  for (const e of s.effs) {
    const info = D.effectInfo[e.type];
    if (e.type === 'heal') parts.push('hồi ' + Math.round(e.pow * (1 + (lm - 1) * 0.5) * 100) + '% sinh lực');
    else if (e.type === 'shield') parts.push('hộ thuẫn ' + Math.round(e.pow * (1 + (lm - 1) * 0.5) * 100) + '% sinh lực');
    else if (info.dot) parts.push(Math.round((e.chance + 0.02 * (lv - 1)) * 100) + '% ' + info.name.toLowerCase() + ' ' + e.turns + ' lượt');
    else if (e.type === 'stun') parts.push(Math.round((e.chance + 0.02 * (lv - 1)) * 100) + '% gây choáng');
    else parts.push(info.name + ' ' + Math.round(e.pow * 100) + '% (' + (e.turns || 2) + ' lượt)');
  }
  parts.push(Math.round(s.mp * 100) + '% linh lực', 'hồi chiêu ' + s.cd);
  return parts.join(' · ');
};

UI.tabs.technique = {
  name: 'Công Pháp', short: 'Công pháp', icon: '📖',
  render() {
    const p = G.player;
    const t = D.techniques[p.tech], lv = p.techs[p.tech];
    const bonus = Object.keys(t.bonus).map((k) => D.fmtBonus(k, t.bonus[k] * (1 + 0.1 * (lv - 1)))).join(', ') || 'Không';
    const match = Player.hasElement(t.el);
    const cost = Arts.techCost(p.tech);
    const main = '<div class="tech-main" style="--gc:' + D.techGradeColor[t.grade] + '">' +
      '<div class="tm-head"><h3>' + t.name + '</h3><span class="grade">' + D.techGrades[t.grade] + '</span>' + UI.elChip(t.el) + (match ? '<span class="tag good">Hợp linh căn</span>' : '') + '</div>' +
      '<p class="muted">' + t.desc + '</p>' +
      '<div class="kv"><span>Tầng</span><b>' + lv + ' / ' + D.TECH_MAX + '</b></div>' +
      '<div class="kv"><span>Hệ số tu luyện</span><b>×' + (t.mult * (1 + 0.08 * (lv - 1))).toFixed(2) + '</b></div>' +
      '<div class="kv"><span>Gia trì</span><b>' + bonus + '</b></div>' +
      (lv < D.TECH_MAX ? '<button class="btn primary" data-act="techUp" data-arg="' + p.tech + '"' + (p.insight >= cost ? '' : ' disabled') + '>Ngộ đạo lên tầng ' + (lv + 1) + ' (💡 ' + U.fmt(cost) + ')</button>' : '<span class="tag good">Đại thành</span>') +
      '</div>';
    const others = Object.keys(p.techs).filter((id) => id !== p.tech).map((id) => {
      const o = D.techniques[id];
      return '<div class="row-card" style="--gc:' + D.techGradeColor[o.grade] + '"><div class="rc-main"><b style="color:var(--gc)">' + o.name + '</b> <small>' + D.techGrades[o.grade] + ' · tầng ' + p.techs[id] + '</small> ' + UI.elChip(o.el) +
        '<div class="muted small">×' + (o.mult * (1 + 0.08 * (p.techs[id] - 1))).toFixed(2) + ' tu luyện · ' + (Object.keys(o.bonus).map((k) => D.fmtBonus(k, o.bonus[k])).join(', ') || 'không gia trì') + '</div></div>' +
        '<button class="btn sm" data-act="techSwitch" data-arg="' + id + '">Chuyển tu</button></div>';
    }).join('') || '<p class="muted">Chưa có công pháp khác. Tìm bí tịch ở Phường Thị, Tông Môn, bí cảnh hoặc kỳ ngộ.</p>';
    const slots = '<div class="skill-slots">' + Array.from({ length: D.SKILL_SLOTS }, (_, i) => {
      const id = p.eq[i];
      return '<div class="sk-slot' + (id ? ' on' : '') + '">' + (id ? '<b>' + D.skills[id].name + '</b><small>cấp ' + p.skills[id] + '</small>' : '<span class="muted">Ô trống</span>') + '</div>';
    }).join('') + '</div>';
    const ids = Object.keys(p.skills).sort((a, b) => D.skills[b].tier - D.skills[a].tier);
    const list = ids.map((id) => {
      const s = D.skills[id], slv = p.skills[id], c = Arts.skillCost(id), on = p.eq.includes(id);
      return '<div class="row-card skill-card' + (on ? ' on' : '') + '">' +
        '<div class="rc-main"><b>' + s.name + '</b> <small>' + D.numHan[s.tier] + ' giai · cấp ' + slv + '</small> ' + UI.elChip(s.el) + (Player.hasElement(s.el) ? '<span class="tag good">+20%</span>' : '') + (s.self ? '<span class="tag">Hỗ trợ</span>' : '') +
        '<div class="muted small">' + UI.skillDesc(s, slv) + '</div></div>' +
        '<div class="rc-btns"><button class="btn sm ' + (on ? 'on' : '') + '" data-act="skillToggle" data-arg="' + id + '">' + (on ? 'Tháo' : 'Trang bị') + '</button>' +
        (slv < D.SKILL_MAX ? '<button class="btn sm ghost" data-act="skillUp" data-arg="' + id + '" title="💡 ' + U.fmt(c.insight) + ' · 💎 ' + U.fmt(c.stones) + '">Nâng cấp <small>💡' + U.fmt(c.insight) + ' 💎' + U.fmt(c.stones) + '</small></button>' : '') + '</div></div>';
    }).join('') || '<p class="muted">Chưa học thần thông nào. Dùng bí tịch trong Hành Trang.</p>';
    return UI.pageHead('Công Pháp & Thần Thông', 'Công pháp quyết định tốc độ tu luyện; thần thông quyết định uy lực chiến đấu. Điểm ngộ đạo: <b>' + U.fmt(p.insight) + '</b>') +
      UI.section('Công Pháp Chủ Tu', main) + UI.section('Công Pháp Đã Lĩnh Ngộ', others) +
      UI.section('Thần Thông Xuất Chiến', slots) + UI.section('Thần Thông Đã Học', list);
  },
};
A.techUp = (id) => { UI.result(Arts.techUp(id)); UI.renderMain(true); };
A.techSwitch = (id) => { UI.result(Arts.techSwitch(id)); UI.renderMain(true); };
A.skillUp = (id) => { UI.result(Arts.skillUp(id)); UI.renderMain(true); };
A.skillToggle = (id) => { UI.result(Arts.skillToggle(id)); UI.renderMain(true); };

/* ---------- Hành trang ---------- */
UI.invCats = [['all', 'Tất cả'], ['pill', 'Đan dược'], ['herb', 'Linh dược'], ['ore', 'Khoáng thạch'], ['core', 'Yêu đan'], ['book', 'Bí tịch'], ['egg', 'Trứng'], ['special', 'Đặc biệt'], ['gear', 'Trang bị']];
UI.tabs.inventory = {
  name: 'Hành Trang', short: 'Hành trang', icon: '🎒',
  render() {
    const cat = G.ui.invCat || 'all';
    const tabs = '<div class="seg">' + UI.invCats.map(([k, n]) => '<button class="seg-btn' + (k === cat ? ' on' : '') + '" data-act="invCat" data-arg="' + k + '">' + n + '</button>').join('') + '</div>';
    let body;
    if (cat === 'gear') body = UI.gearListHTML();
    else {
      const list = Inv.list(cat);
      body = list.length ? '<div class="item-grid">' + list.map((it) =>
        '<button class="item-cell" data-act="itemInfo" data-arg="' + it.id + '" title="' + U.esc(it.name) + '"><span class="ic">' + it.icon + '</span><span class="nm">' + it.name + '</span><span class="ct">×' + U.fmt(Inv.count(it.id)) + '</span><span class="tr">' + D.numHan[it.tier] + '</span></button>').join('') + '</div>'
        : '<p class="muted empty">Không có vật phẩm.</p>';
    }
    const nItems = Object.keys(G.inv).length;
    return UI.pageHead('Hành Trang', 'Túi trữ vật: ' + nItems + ' loại vật phẩm · ' + G.gear.length + '/' + Gear.MAX + ' trang bị') + tabs + body;
  },
};
UI.gearListHTML = () => {
  const slot = G.ui.gearSlot || 'all';
  const segs = '<div class="seg small">' + [['all', 'Tất cả']].concat(D.slotOrder.map((s) => [s, D.slots[s].name])).map(([k, n]) => '<button class="seg-btn' + (k === slot ? ' on' : '') + '" data-act="gearSlot" data-arg="' + k + '">' + n + '</button>').join('') + '</div>';
  const list = Gear.sorted(slot);
  const bulk = '<div class="row-btns"><button class="btn sm ghost" data-act="bulkGear" data-arg="sell">Bán toàn bộ Phàm phẩm</button><button class="btn sm ghost" data-act="bulkGear" data-arg="salvage">Phân giải toàn bộ ≤ Linh phẩm</button><button class="btn sm" data-act="autoEquip">✨ Mặc đồ tốt nhất</button></div>';
  if (!list.length) return segs + bulk + '<p class="muted empty">Chưa có trang bị.</p>';
  return segs + bulk + '<div class="gear-grid">' + list.map((g) => {
    const q = D.qualities[g.q];
    const eq = Gear.isEquipped(g);
    return '<button class="gear-card' + (eq ? ' eq' : '') + '" data-act="gearInfo" data-arg="' + g.uid + '" style="--qc:' + q.color + '">' +
      '<div class="gc-top"><span class="gc-ic">' + D.slots[g.slot].icon + '</span><span class="gc-name">' + Gear.name(g) + '</span>' + (eq ? '<span class="tag good">Đang mặc</span>' : '') + (g.lock ? '<span class="tag">🔒</span>' : '') + '</div>' +
      '<div class="gc-sub">' + q.name + ' · ' + D.numHan[g.tier] + ' giai · ' + D.slots[g.slot].name + '</div>' + UI.gearStatsHTML(g) + '</button>';
  }).join('') + '</div>';
};
A.invCat = (c) => { G.ui.invCat = c; UI.renderMain(); };
A.gearSlot = (s) => { G.ui.gearSlot = s; UI.renderMain(true); };
A.bulkGear = (mode) => {
  const maxQ = mode === 'sell' ? 0 : 1;
  const targets = G.gear.filter((g) => g.q <= maxQ && !g.lock && !Gear.isEquipped(g));
  if (!targets.length) return UI.toast('Không có trang bị phù hợp.', 'info');
  UI.confirm((mode === 'sell' ? 'Bán ' : 'Phân giải ') + targets.length + ' trang bị (không gồm đồ đang mặc hoặc đã khóa)?', () => {
    let stones = 0;
    for (const g of targets) {
      if (mode === 'sell') stones += Gear.sell(g.uid);
      else { const y = Gear.salvage(g.uid, true); if (y) stones += y.stones; }
    }
    UI.toast('Hoàn tất. +' + U.fmt(stones) + ' linh thạch' + (mode === 'salvage' ? ' và khoáng thạch' : '') + '.', 'good');
    Sfx.play('coin');
    UI.renderMain(true);
  });
};

UI.usable = (it) => {
  if (it.cat === 'book' || it.cat === 'egg') return true;
  if (!it.effect) return false;
  return !['break', 'charm'].includes(it.effect.type);
};
A.itemInfo = (id) => {
  const it = D.items[id];
  if (!it) return;
  const n = Inv.count(id);
  let extra = '';
  if (it.cat === 'book') {
    const L = it.learn;
    if (L.kind === 'skill') extra = '<p class="small">' + UI.skillDesc(D.skills[L.id]) + '</p>' + (G.player.skills[L.id] ? '<p class="muted small">Đã học — dùng sẽ chuyển hóa thành ngộ đạo.</p>' : '');
    else {
      const t = D.techniques[L.id];
      extra = '<p class="small">Hệ số tu luyện ×' + t.mult + ' · ' + (Object.keys(t.bonus).map((k) => D.fmtBonus(k, t.bonus[k])).join(', ') || 'không gia trì') + ' · ' + UI.elChip(t.el) + '</p>' + (G.player.techs[L.id] ? '<p class="muted small">Đã lĩnh ngộ — dùng sẽ chuyển hóa thành ngộ đạo.</p>' : '');
    }
  }
  if (it.cat === 'herb') extra = '<p class="muted small">Gieo trồng: ' + U.time(it.grow * Cave.growMult()) + ' cho 2–4+ cây.</p>';
  if (it.cat === 'core') extra = '<p class="muted small">Cho linh thú ăn: +' + U.fmt(D.coreExp(it.tier)) + ' kinh nghiệm.</p>';
  const actions = [];
  if (UI.usable(it)) {
    actions.push({ label: it.cat === 'book' ? 'Lĩnh ngộ' : it.cat === 'egg' ? 'Đặt vào ổ ấp' : 'Sử dụng', cls: 'primary', fn: () => { UI.result(Inv.use(id, 1)); UI.render(); } });
    if (n > 1 && it.cat === 'pill') actions.push({ label: 'Dùng ×' + Math.min(10, n), fn: () => { UI.result(Inv.use(id, Math.min(10, n))); UI.render(); } });
  }
  actions.push({ label: 'Bán 1 (' + U.fmt(Inv.sellPrice(id)) + ')', cls: 'ghost', fn: () => { Inv.sell(id, 1); Sfx.play('coin'); UI.render(); } });
  if (n > 1) actions.push({ label: 'Bán hết (' + U.fmt(Inv.sellPrice(id) * n) + ')', cls: 'ghost', fn: () => { UI.confirm('Bán toàn bộ ' + n + ' ' + it.name + '?', () => { Inv.sell(id, n); Sfx.play('coin'); UI.render(); }); } });
  UI.modal({
    title: it.icon + ' ' + it.name,
    body: '<div class="item-detail"><div class="kv"><span>Loại</span><b>' + D.cats[it.cat] + ' · ' + D.numHan[it.tier] + ' giai</b></div><div class="kv"><span>Số lượng</span><b>' + U.fmt(n) + '</b></div><p>' + it.desc + '</p>' + extra + '</div>',
    actions,
  });
};

A.gearInfo = (uid) => {
  const g = Gear.get(uid);
  if (!g) return;
  const q = D.qualities[g.q];
  const eq = Gear.isEquipped(g);
  const cur = Gear.get(G.player.equip[g.slot]);
  let cmp = '';
  if (cur && cur !== g) {
    const d = Gear.score(g) - Gear.score(cur);
    cmp = '<p class="small">So với đang mặc (' + Gear.name(cur) + '): <b class="' + (d >= 0 ? 'good' : 'bad') + '">' + (d >= 0 ? 'mạnh hơn' : 'yếu hơn') + '</b></p>';
  }
  const req = Gear.reqRealm(g);
  const actions = [];
  if (eq) actions.push({ label: 'Tháo xuống', fn: () => { Gear.unequip(g.slot); UI.render(); } });
  else actions.push({ label: 'Trang bị', cls: 'primary', disabled: G.player.realm < req, fn: () => { UI.result(Gear.equip(uid)); UI.render(); } });
  actions.push({ label: 'Cường hóa', fn: () => { G.ui.forgeSel = uid; G.ui.forgeMode = 'enh'; UI.go('forge'); } });
  actions.push({ label: g.lock ? '🔓 Mở khóa' : '🔒 Khóa', cls: 'ghost', fn: () => { g.lock = !g.lock; UI.render(); } });
  if (!eq && !g.lock) {
    actions.push({ label: 'Bán (' + U.fmt(Gear.value(g)) + ')', cls: 'ghost', fn: () => { Gear.sell(uid); Sfx.play('coin'); UI.render(); } });
    const y = Gear.salvageYield(g);
    actions.push({ label: 'Phân giải (' + y.n + ' ' + D.items[y.ore].name + ')', cls: 'ghost', fn: () => { Gear.salvage(uid); UI.render(); } });
  }
  UI.modal({
    title: '<span style="color:' + q.color + '">' + D.slots[g.slot].icon + ' ' + Gear.name(g) + '</span>',
    body: '<div class="item-detail"><div class="kv"><span>Phẩm chất</span><b style="color:' + q.color + '">' + q.name + '</b></div>' +
      '<div class="kv"><span>Phẩm cấp</span><b>' + D.numHan[g.tier] + ' giai · ' + D.slots[g.slot].name + '</b></div>' +
      '<div class="kv"><span>Yêu cầu</span><b class="' + (G.player.realm >= req ? '' : 'bad') + '">' + D.realms[req].name + '</b></div>' +
      '<div class="kv"><span>Cường hóa</span><b>+' + g.enh + ' / 15</b></div>' + UI.gearStatsHTML(g) + cmp + '</div>',
    actions,
  });
};

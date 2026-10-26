'use strict';
/* Giao diện luyện đan, luyện khí, động phủ, linh thú */

UI.profBar = (kind) => {
  const p = G.prof[kind];
  const max = kind === 'alch' ? D.ALCH_MAX : D.FORGE_MAX;
  const need = D.profExp(p.lv);
  return '<div class="prof-head"><div><span class="cp-eyebrow">' + Prof.names[kind] + ' sư</span><h3>' + Prof.title(p.lv) + ' · cấp ' + p.lv + '/' + max + '</h3></div>' +
    '<div class="prof-bar">' + (p.lv >= max ? '<span class="tag good">Viên mãn</span>' : UI.bar('prof-' + kind, 'xp', 'Kinh nghiệm').replace('<div class="bar-fill"></div>', '<div class="bar-fill" style="width:' + (p.exp / need * 100).toFixed(1) + '%"></div>').replace('<span class="bar-val"></span>', '<span class="bar-val">' + U.fmt(p.exp) + ' / ' + U.fmt(need) + '</span>')) + '</div></div>';
};

/* ---------- Luyện đan ---------- */
UI.tabs.alchemy = {
  name: 'Luyện Đan', short: 'Luyện đan', icon: '⚗️',
  render() {
    const lv = G.prof.alch.lv;
    const filter = G.ui.alchFilter || 'can';
    const seg = '<div class="seg small">' + [['can', 'Đủ cấp'], ['all', 'Tất cả đan phương']].map(([k, n]) => '<button class="seg-btn' + (k === filter ? ' on' : '') + '" data-act="alchFilter" data-arg="' + k + '">' + n + '</button>').join('') + '</div>';
    const list = D.recipes.filter((r) => filter === 'all' || r.lv <= lv).map((r) => {
      const it = D.items[r.id];
      const locked = r.lv > lv;
      const maxN = locked ? 0 : Alchemy.maxTimes(r);
      const ch = Alchemy.chance(r);
      return '<div class="recipe' + (locked ? ' dim' : '') + '">' +
        '<div class="rc-top"><span class="ic">' + it.icon + '</span><div><b>' + it.name + '</b><div class="muted small">' + it.desc + '</div></div></div>' +
        '<div class="needs">' + UI.needList(r.herbs) + '<span class="need ' + (G.player.stones >= Alchemy.cost(r) ? 'ok' : 'miss') + '">💎 ' + U.fmt(Alchemy.cost(r)) + '</span></div>' +
        '<div class="rc-foot"><span class="small">' + (locked ? '🔒 Cần cấp ' + r.lv : 'Thành công ' + Math.round(ch * 100) + '% · ra ' + r.out + ' viên') + '</span>' +
        '<div class="rc-btns"><button class="btn sm primary" data-act="alchCraft" data-arg="' + r.id + ':1"' + (maxN >= 1 ? '' : ' disabled') + '>Luyện</button>' +
        (maxN > 1 ? '<button class="btn sm" data-act="alchCraft" data-arg="' + r.id + ':' + Math.min(10, maxN) + '">×' + Math.min(10, maxN) + '</button>' : '') + '</div></div></div>';
    }).join('');
    return UI.pageHead('Luyện Đan', 'Thu thập linh dược và yêu đan để luyện chế đan dược. Cấp luyện đan càng cao, tỉ lệ thành công càng lớn.') +
      UI.section('Đan Lô', UI.profBar('alch')) + seg + '<div class="recipe-grid">' + list + '</div>';
  },
};
A.alchFilter = (f) => { G.ui.alchFilter = f; UI.renderMain(true); };
A.alchCraft = (arg) => {
  const [id, n] = arg.split(':');
  const r = Alchemy.craft(id, +n);
  UI.toast(r.msg, r.made ? 'good' : 'bad');
  UI.renderMain(true);
};

/* ---------- Luyện khí ---------- */
UI.tabs.forge = {
  name: 'Luyện Khí', short: 'Luyện khí', icon: '🔨',
  render() {
    const mode = G.ui.forgeMode || 'craft';
    const seg = '<div class="seg">' + [['craft', 'Luyện chế'], ['enh', 'Cường hóa']].map(([k, n]) => '<button class="seg-btn' + (k === mode ? ' on' : '') + '" data-act="forgeMode" data-arg="' + k + '">' + n + '</button>').join('') + '</div>';
    let body = '';
    if (mode === 'craft') {
      const maxT = Forge.maxTier();
      const tier = Math.min(G.ui.forgeTier || maxT, maxT);
      const slot = G.ui.forgeSlot || 'weapon';
      const c = Forge.cost(tier);
      const can = Forge.can(tier);
      const tiers = '<div class="seg small">' + Array.from({ length: maxT }, (_, i) => i + 1).map((t) => '<button class="seg-btn' + (t === tier ? ' on' : '') + '" data-act="forgeTier" data-arg="' + t + '">' + D.numHan[t] + ' giai</button>').join('') + '</div>';
      const slots = '<div class="slot-pick">' + D.slotOrder.concat(['random']).map((s) => '<button class="slot-btn' + (s === slot ? ' on' : '') + '" data-act="forgeSlot" data-arg="' + s + '">' + (s === 'random' ? '🎲 Ngẫu nhiên' : D.slots[s].icon + ' ' + D.slots[s].name) + '</button>').join('') + '</div>';
      const preview = slot === 'random' ? '' : '<p class="small">Thành phẩm: <b>' + D.slots[slot].names[tier - 1] + '</b> — ' +
        Object.keys(D.slots[slot].main).map((k) => D.fmtBonus(k, Gear.mainStats({ slot, tier, q: 0, enh: 0 })[k])).join(', ') + ' (Phàm phẩm, phẩm chất cao hơn mạnh hơn).</p>';
      const qb = Forge.qBonus();
      const probs = D.qualities.map((q, i) => q.w * Math.pow(1 + qb / 100, i));
      const tot = U.sum(probs);
      const odds = '<div class="odds">' + D.qualities.map((q, i) => '<span style="color:' + q.color + '">' + q.short + ' ' + (probs[i] / tot * 100).toFixed(1) + '%</span>').join('') + '</div>';
      body = UI.section('Lò Luyện Khí', UI.profBar('forge') +
        '<p class="muted small">Phẩm cấp tối đa: ' + D.numHan[maxT] + ' giai (theo cảnh giới và cấp luyện khí).</p>' + tiers + slots + preview +
        '<div class="needs">' + UI.needList({ [c.ore]: c.oreN, [c.core]: c.coreN }) + '<span class="need ' + (G.player.stones >= c.stones ? 'ok' : 'miss') + '">💎 ' + U.fmt(c.stones) + '</span></div>' +
        '<div class="small">Tỉ lệ phẩm chất:</div>' + odds +
        '<button class="btn primary big" data-act="forgeCraft"' + (can === true ? '' : ' disabled') + '>🔨 Luyện chế</button>' + (can === true ? '' : ' <span class="muted small">' + can + '</span>'));
    } else {
      const sel = Gear.get(G.ui.forgeSel) || Gear.get(G.player.equip.weapon);
      let panel = '<p class="muted">Chọn trang bị bên dưới để cường hóa.</p>';
      if (sel) {
        const c = Gear.enhanceCost(sel);
        const ch = Gear.enhanceChance(sel);
        const next = Object.assign({}, sel, { enh: sel.enh + 1 });
        panel = '<div class="enh-panel" style="--qc:' + D.qualities[sel.q].color + '"><div class="enh-cur">' + UI.gearLine(sel) + UI.gearStatsHTML(sel) + '</div>' +
          (sel.enh < 15 ? '<div class="enh-arrow">→</div><div class="enh-next"><span class="gear-name" style="color:var(--qc)">+' + next.enh + '</span>' + UI.gearStatsHTML(next) + '</div>' : '') + '</div>' +
          (sel.enh < 15 ? '<div class="needs">' + UI.needList({ [c.ore]: c.n }) + '<span class="need ' + (G.player.stones >= c.stones ? 'ok' : 'miss') + '">💎 ' + U.fmt(c.stones) + '</span></div>' +
          '<p class="small">Tỉ lệ thành công: <b>' + Math.round(ch * 100) + '%</b>' + (sel.enh >= 10 ? ' · <span class="bad">thất bại sẽ giảm 1 cấp</span>' : '') + '</p>' +
          '<button class="btn primary big" data-act="enhance" data-arg="' + sel.uid + '">✨ Cường hóa</button>' : '<span class="tag good">Đã cường hóa tối đa</span>');
      }
      const list = Gear.sorted('all').slice(0, 60).map((g) => '<button class="gear-pick' + (sel && g.uid === sel.uid ? ' on' : '') + '" data-act="forgeSel" data-arg="' + g.uid + '">' + UI.gearLine(g) + (Gear.isEquipped(g) ? ' <span class="tag good">Mặc</span>' : '') + '</button>').join('');
      body = UI.section('Cường Hóa', panel) + UI.section('Chọn Trang Bị', '<div class="gear-pick-list">' + list + '</div>');
    }
    return UI.pageHead('Luyện Khí', 'Dùng khoáng thạch và yêu đan luyện chế pháp bảo, cường hóa đến +15.') + seg + body;
  },
};
A.forgeMode = (m) => { G.ui.forgeMode = m; UI.renderMain(); };
A.forgeTier = (t) => { G.ui.forgeTier = +t; UI.renderMain(true); };
A.forgeSlot = (s) => { G.ui.forgeSlot = s; UI.renderMain(true); };
A.forgeSel = (uid) => { G.ui.forgeSel = uid; UI.renderMain(true); };
A.forgeCraft = () => {
  const maxT = Forge.maxTier();
  const r = Forge.craft(G.ui.forgeSlot || 'weapon', Math.min(G.ui.forgeTier || maxT, maxT));
  if (!r.ok) return UI.toast(r.msg, 'bad');
  const g = r.g;
  UI.toast('Luyện thành <b style="color:' + D.qualities[g.q].color + '">' + Gear.name(g) + '</b> (' + D.qualities[g.q].name + ')' + (g._salvaged ? ' — đã tự phân giải' : ''), 'good');
  UI.renderMain(true);
};
A.enhance = (uid) => {
  const r = Gear.enhance(uid);
  UI.toast(r.msg, r.success ? 'good' : 'bad');
  UI.renderMain(true);
};

/* ---------- Động phủ ---------- */
UI.tabs.cave = {
  name: 'Động Phủ', short: 'Động phủ', icon: '🏔️',
  render() {
    const c = G.cave;
    const up = Cave.canUpgrade();
    const cost = Cave.upgradeCost();
    const info = '<div class="cave-head"><div class="cave-ic">🏯</div><div><h3>' + Cave.name() + ' <small>cấp ' + c.lv + '/' + Cave.MAX + '</small></h3>' +
      '<div class="kv"><span>Tụ Linh Trận</span><b>Tu luyện ×' + Cave.mult().toFixed(2) + '</b></div>' +
      '<div class="kv"><span>Dược viên</span><b>' + Cave.slots(c.lv) + ' ô · sinh trưởng nhanh ' + Math.round((1 - Cave.growMult()) * 100) + '%</b></div>' +
      (c.lv < Cave.MAX ? '<div class="kv"><span>Nâng cấp</span><b>💎 ' + U.fmt(cost.stones) + ' · cần ' + D.realms[Math.min(10, cost.realm)].name + '</b></div>' +
        '<button class="btn primary" data-act="caveUp"' + (up === true ? '' : ' disabled') + '>Nâng cấp động phủ</button>' + (up === true ? '' : ' <span class="muted small">' + up + '</span>') : '<span class="tag good">Động Thiên Phúc Địa</span>') + '</div></div>';
    const herbs = Inv.list('herb');
    const garden = '<div class="garden">' + c.garden.map((g, i) => {
      if (!g) {
        const opts = herbs.map((h) => '<option value="' + h.id + '">' + h.icon + ' ' + h.name + ' (×' + Inv.count(h.id) + ')</option>').join('');
        return '<div class="plot empty"><span class="plot-ic">🟫</span><span class="muted small">Đất trống</span>' +
          (herbs.length ? '<select id="plot-' + i + '" class="sel"><option value="">— Chọn linh dược —</option>' + opts + '</select><button class="btn sm" data-act="plant" data-arg="' + i + '">Gieo trồng</button>' : '<span class="muted small">Cần linh dược để gieo</span>') + '</div>';
      }
      const it = D.items[g.herb];
      return '<div class="plot" data-plot="' + i + '"><span class="plot-ic">' + it.icon + '</span><b>' + it.name + '</b><div class="bar xp" id="plot-bar-' + i + '"><div class="bar-fill"></div><div class="bar-txt"><span class="bar-val"></span></div></div>' +
        '<button class="btn sm primary" data-act="harvest" data-arg="' + i + '" id="plot-btn-' + i + '" disabled>Thu hoạch</button></div>';
    }).join('') + '</div>' +
      '<div class="row-btns"><button class="btn" data-act="harvestAll" data-arg="1">🌾 Thu hoạch tất cả & gieo lại</button></div>';
    return UI.pageHead('Động Phủ', 'Nơi an thân lập mệnh. Nâng cấp Tụ Linh Trận để tăng tốc tu luyện; trồng linh dược trong dược viên.') +
      UI.section('Động Phủ', info) + UI.section('Dược Viên', garden);
  },
  refresh() {
    const now = Date.now();
    G.cave.garden.forEach((g, i) => {
      if (!g) return;
      const tot = g.ready - g.at, left = g.ready - now;
      UI.setBar('plot-bar-' + i, tot - Math.max(0, left), tot, left > 0 ? 'Còn ' + U.clock(left / 1000) : 'Đã chín');
      const b = document.getElementById('plot-btn-' + i);
      if (b) b.disabled = left > 0;
    });
  },
};
A.caveUp = () => { UI.result(Cave.upgrade()); UI.render(); };
A.plant = (i) => {
  const sel = document.getElementById('plot-' + i);
  if (!sel || !sel.value) return UI.toast('Hãy chọn linh dược để gieo.', 'bad');
  if (Cave.plant(+i, sel.value)) UI.renderMain(true);
};
A.harvest = (i) => {
  const g = G.cave.garden[+i];
  const n = Cave.harvest(+i);
  if (n) { UI.toast('Thu hoạch ' + n + ' ' + D.items[g.herb].name, 'good'); Quests.check(); }
  UI.renderMain(true);
};
A.harvestAll = (re) => {
  const r = Cave.harvestAll(!!re);
  UI.toast(r.total ? 'Thu hoạch: ' + r.out.join(', ') : 'Chưa có cây nào chín.', r.total ? 'good' : 'info');
  Quests.check();
  UI.renderMain(true);
};

/* ---------- Linh thú ---------- */
UI.tabs.pets = {
  name: 'Linh Thú', short: 'Linh thú', icon: '🐉',
  render() {
    const nests = '<div class="nests">' + G.nests.map((n, i) => {
      if (!n) {
        const eggs = Inv.list('egg');
        return '<div class="nest empty"><span class="plot-ic">🪺</span><span class="muted small">Ổ ấp trống</span>' +
          (eggs.length ? eggs.map((e) => '<button class="btn sm" data-act="placeEgg" data-arg="' + e.id + '">' + e.icon + ' ' + e.name + ' ×' + Inv.count(e.id) + '</button>').join('') : '<span class="muted small">Chưa có trứng (phường thị, thủ lĩnh, bí cảnh)</span>') + '</div>';
      }
      const it = D.items[n.egg];
      return '<div class="nest"><span class="plot-ic egg-wobble">🥚</span><b>' + it.name + '</b><div class="bar xp" id="nest-bar-' + i + '"><div class="bar-fill"></div><div class="bar-txt"><span class="bar-val"></span></div></div>' +
        '<button class="btn sm primary" id="nest-btn-' + i + '" data-act="hatch" data-arg="' + i + '" disabled>Ấp nở</button></div>';
    }).join('') + '</div>';
    const cores = [];
    for (let t = 1; t <= 10; t++) if (Inv.has('yeu_dan_' + t)) cores.push('yeu_dan_' + t);
    const list = G.pets.map((pet) => {
      const d = Pets.def(pet);
      const act = G.activePet === pet.uid;
      const pas = Pets.passive(pet);
      const need = D.petExpReq(pet.lv);
      const feed = cores.map((id) => '<button class="btn sm ghost" data-act="petFeed" data-arg="' + pet.uid + ':' + id + '" title="+' + U.fmt(D.coreExp(D.items[id].tier)) + ' kinh nghiệm">🔮' + D.numHan[D.items[id].tier] + ' ×' + Inv.count(id) + '</button>').join('');
      return '<div class="pet-card' + (act ? ' on' : '') + '">' +
        '<div class="pc-top"><span class="pet-ic">' + d.icon + '</span><div><b>' + d.name + '</b> <span class="stars">' + '★'.repeat(d.rarity) + '</span><div class="muted small">Cấp ' + pet.lv + ' (' + D.gsName(pet.lv) + ') · ' + UI.elChip(d.el) + '</div></div>' + (act ? '<span class="tag good">Xuất chiến</span>' : '') + '</div>' +
        '<div class="bar xp"><div class="bar-fill" style="width:' + Math.min(100, pet.exp / need * 100).toFixed(1) + '%"></div><div class="bar-txt"><span class="bar-lbl">Kinh nghiệm</span><span class="bar-val">' + U.fmt(pet.exp) + ' / ' + U.fmt(need) + '</span></div></div>' +
        '<div class="small">Công kích hộ chiến: <b>' + U.fmt(Pets.atk(pet)) + '</b> · Gia trì: ' + Object.keys(pas).map((k) => D.fmtBonus(k, pas[k])).join(', ') + '</div>' +
        '<div class="rc-btns">' + (act ? '' : '<button class="btn sm" data-act="petActive" data-arg="' + pet.uid + '">Xuất chiến</button>') + feed +
        '<button class="btn sm danger-ghost" data-act="petRelease" data-arg="' + pet.uid + '">Phóng sinh</button></div></div>';
    }).join('') || '<p class="muted">Chưa có linh thú. Ấp trứng để nhận linh thú đồng hành — linh thú hộ chiến và gia trì chỉ số cho chủ nhân.</p>';
    return UI.pageHead('Linh Thú Viên', 'Linh thú xuất chiến cùng ngươi tấn công mỗi lượt và ban gia trì vĩnh viễn. Giới hạn cấp: cảnh giới của ngươi +3. (' + G.pets.length + '/' + D.PET_MAX + ')') +
      UI.section('Ổ Ấp', nests) + UI.section('Linh Thú', '<div class="pet-grid">' + list + '</div>');
  },
  refresh() {
    const now = Date.now();
    G.nests.forEach((n, i) => {
      if (!n) return;
      const tot = n.ready - n.at, left = n.ready - now;
      UI.setBar('nest-bar-' + i, tot - Math.max(0, left), tot, left > 0 ? 'Còn ' + U.clock(left / 1000) : 'Sắp nở!');
      const b = document.getElementById('nest-btn-' + i);
      if (b) b.disabled = left > 0;
    });
  },
};
A.placeEgg = (id) => { UI.result(Pets.placeEgg(id)); UI.renderMain(true); };
A.hatch = (i) => {
  const r = Pets.hatch(+i);
  if (!r) return;
  if (r.err) return UI.toast(r.err, 'bad');
  const d = Pets.def(r);
  UI.modal({ title: '🐣 Linh Thú Xuất Thế', body: '<div class="hatch"><div class="pet-ic big">' + d.icon + '</div><h3>' + d.name + '</h3><div class="stars">' + '★'.repeat(d.rarity) + '</div><p class="muted">' + UI.elChip(d.el) + '</p></div>', actions: [{ label: 'Tuyệt vời', cls: 'primary' }] });
  UI.renderMain(true);
};
A.petActive = (uid) => { G.activePet = uid; UI.render(); };
A.petFeed = (arg) => {
  const [uid, core] = arg.split(':');
  const r = Pets.feed(uid, core, Inv.count(core) >= 5 ? 5 : 1);
  UI.result(r);
  UI.renderMain(true);
};
A.petRelease = (uid) => {
  const pet = G.pets.find((p) => p.uid === uid);
  if (!pet) return;
  UI.confirm('Phóng sinh ' + Pets.def(pet).name + '? Linh thú sẽ để lại yêu đan.', () => {
    const r = Pets.release(uid);
    if (r) UI.toast('Nhận ' + r.n + ' ' + D.items['yeu_dan_' + r.t].name, 'info');
    UI.render();
  }, { danger: true, yes: 'Phóng sinh' });
};

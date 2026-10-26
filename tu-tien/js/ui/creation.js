'use strict';
/* Tạo nhân vật, cốt truyện mở đầu, các hộp thoại đặc biệt */

const Creation = {
  surnames: ['Lâm', 'Tiêu', 'Hàn', 'Diệp', 'Vương', 'Lý', 'Trương', 'Mộc', 'Tần', 'Bạch', 'Lục', 'Cố', 'Mạc', 'Tô', 'Dương', 'Thẩm', 'Sở', 'Phương'],
  given: ['Phong', 'Vân', 'Thiên', 'Huyền', 'Lạc', 'Thần', 'Minh', 'Dao', 'Tuyết', 'Nguyệt', 'Hạo', 'Dật', 'Hiên', 'Uyển', 'Linh', 'Trần', 'Vũ', 'Khê', 'Sương', 'Mặc'],
  state: null,

  randomName() { return U.pick(Creation.surnames) + ' ' + U.pick(Creation.given) + (Math.random() < 0.35 ? ' ' + U.pick(Creation.given) : ''); },

  rollRoot(talent = 0) {
    const list = D.rootTypes.map((r) => ({ r, w: r.w * Math.pow(1 + 0.3 * talent, r.grade / 2) }));
    const rt = U.weighted(list).r;
    let els;
    if (rt.all) els = D.baseElements.slice();
    else if (rt.variant) els = [U.pick(D.variantElements)];
    else els = U.shuffle(D.baseElements).slice(0, rt.count);
    return { type: rt.id, els };
  },
  rollAttrs() {
    const out = {};
    for (const k in D.attrs) out[k] = U.randInt(2, 9);
    return out;
  },
};

UI.showCreation = (keep) => {
  Main.pendingKeep = keep;
  const tl = keep ? (keep.reinc.talents.linh_can || 0) : 0;
  Creation.state = {
    name: keep && keep.lastName ? keep.lastName : Creation.randomName(),
    gender: 'nam', bg: D.backgrounds[0].id,
    root: Creation.rollRoot(tl), attrs: Creation.rollAttrs(),
    rerolls: 5 + tl, keep,
  };
  UI.qi.stop();
  UI.modals.slice().forEach((m) => UI.closeModal(m));
  UI.renderCreation();
};

UI.renderCreation = () => {
  const s = Creation.state;
  const keep = s.keep;
  const rt = D.rootTypes.find((r) => r.id === s.root.type);
  const tp = keep ? (keep.reinc.talents.thien_phu || 0) : 0;
  const attrs = Object.keys(D.attrs).map((k) => '<div class="attr"><span class="attr-n">' + D.attrs[k].name + '</span><b>' + (s.attrs[k] + tp) + '</b><small class="muted">' + D.attrs[k].desc + '</small></div>').join('');
  const bgs = D.backgrounds.map((b) => '<button class="bg-card' + (b.id === s.bg ? ' on' : '') + '" data-act="crBg" data-arg="' + b.id + '"><b>' + b.name + '</b><small>' + b.desc + '</small><small class="gold">' +
    [Object.keys(b.attrs).map((k) => D.attrs[k].name + ' +' + b.attrs[k]).join(', '), b.stones ? '+' + b.stones + ' linh thạch' : '', b.shopDiscount ? 'giảm ' + b.shopDiscount * 100 + '% giá' : '', b.insight ? '+' + b.insight + ' ngộ đạo' : '', b.items ? Object.keys(b.items).map((id) => D.items[id].name + ' ×' + b.items[id]).join(', ') : '', b.gear ? 'Linh phẩm vũ khí' : ''].filter(Boolean).join(' · ') + '</small></button>').join('');
  const els = rt.all ? '<span class="el-chip" style="--c:#fff6dc">Ngũ hành đầy đủ</span>' : s.root.els.map((e) => UI.elChip(e)).join('');
  let reincBox = '';
  if (keep) {
    const talents = D.reincTalents.map((t) => {
      const lv = keep.reinc.talents[t.id] || 0, cost = D.reincCost(lv);
      return '<div class="row-card"><div class="rc-main"><b>' + t.name + '</b> <small>cấp ' + lv + '/' + t.max + '</small><div class="muted small">' + t.desc + '</div></div>' +
        (lv < t.max ? '<button class="btn sm" data-act="crTalent" data-arg="' + t.id + '"' + (keep.reinc.points >= cost ? '' : ' disabled') + '>☯ ' + cost + '</button>' : '<span class="tag good">Tối đa</span>') + '</div>';
    }).join('');
    reincBox = '<section class="panel"><h2 class="panel-title"><span>Luân Hồi Chuyển Thế</span></h2>' +
      '<p>' + (keep.reason === 'death' ? 'Thọ nguyên đã tận, kiếp trước <b>' + U.esc(keep.lastName) + '</b> tọa hóa.' : keep.lastName ? 'Kiếp trước <b>' + U.esc(keep.lastName) + '</b> chủ động bước vào luân hồi.' : '') +
      (keep.pts ? ' Nhận <b>☯ ' + keep.pts + '</b> điểm luân hồi.' : '') + ' Điểm hiện có: <b>☯ ' + keep.reinc.points + '</b>. Thiên phú được áp dụng ngay cho kiếp mới.</p>' +
      '<div class="talent-list">' + talents + '</div></section>';
  }
  document.getElementById('app').innerHTML =
    '<div class="creation">' +
      '<div class="cr-hero"><span class="seal big">道</span><h1>' + D.GAME_NAME + '</h1><p>Tiên lộ mờ mịt, vấn đạo trường sinh. Một phàm nhân, một linh căn, một con đường nghịch thiên.</p></div>' +
      reincBox +
      '<section class="panel"><h2 class="panel-title"><span>Đạo Hiệu</span></h2>' +
        '<div class="cr-row"><input id="cr-name" class="inp" maxlength="24" value="' + U.esc(s.name) + '" aria-label="Đạo hiệu"><button class="btn ghost" data-act="crName">🎲</button>' +
        '<div class="seg small"><button class="seg-btn' + (s.gender === 'nam' ? ' on' : '') + '" data-act="crGender" data-arg="nam">Nam tu</button><button class="seg-btn' + (s.gender === 'nu' ? ' on' : '') + '" data-act="crGender" data-arg="nu">Nữ tu</button></div></div></section>' +
      '<section class="panel"><h2 class="panel-title"><span>Trắc Linh Căn</span></h2>' +
        '<div class="root-box grade-' + rt.grade + '"><div class="root-name">' + rt.name + '</div><div class="root-els">' + els + '</div><p class="muted">' + rt.desc + '</p><div class="small">Tốc độ tu luyện ×' + rt.mult + ' · hợp hệ +' + Math.round(0.4 / Math.max(1, rt.count || 1) * 100) + '%</div></div>' +
        '<div class="attr-grid">' + attrs + '</div>' +
        '<button class="btn" data-act="crReroll"' + (s.rerolls > 0 ? '' : ' disabled') + '>🔮 Trắc lại linh căn (còn ' + s.rerolls + ' lượt)</button></section>' +
      '<section class="panel"><h2 class="panel-title"><span>Xuất Thân</span></h2><div class="bg-grid">' + bgs + '</div></section>' +
      '<div class="cr-go"><button class="btn primary big" data-act="crStart">Bước Vào Tiên Lộ</button></div>' +
    '</div>';
};

A.crName = () => { Creation.state.name = Creation.randomName(); UI.renderCreation(); };
A.crGender = (g) => { Creation.state.name = document.getElementById('cr-name').value || Creation.state.name; Creation.state.gender = g; UI.renderCreation(); };
A.crBg = (id) => { Creation.state.name = document.getElementById('cr-name').value || Creation.state.name; Creation.state.bg = id; UI.renderCreation(); };
A.crReroll = () => {
  const s = Creation.state;
  if (s.rerolls <= 0) return;
  s.name = document.getElementById('cr-name').value || s.name;
  s.rerolls--;
  const tl = s.keep ? (s.keep.reinc.talents.linh_can || 0) : 0;
  s.root = Creation.rollRoot(tl);
  s.attrs = Creation.rollAttrs();
  Sfx.unlock(); Sfx.play('coin');
  UI.renderCreation();
};
A.crTalent = (id) => {
  const s = Creation.state, r = s.keep.reinc;
  const t = D.reincTalents.find((x) => x.id === id);
  const lv = r.talents[id] || 0, cost = D.reincCost(lv);
  if (lv >= t.max || r.points < cost) return;
  r.points -= cost;
  r.talents[id] = lv + 1;
  if (id === 'linh_can') s.rerolls++;
  s.name = document.getElementById('cr-name').value || s.name;
  UI.renderCreation();
};
A.crStart = () => {
  const s = Creation.state;
  const name = (document.getElementById('cr-name').value || '').trim() || Creation.randomName();
  newLife({ name, gender: s.gender, bg: s.bg, root: s.root, attrs: s.attrs }, s.keep);
  Main.pendingKeep = null;
  Main.skipSave = false;
  Main.dying = false;
  if (s.keep && s.keep.reason) Log.add('Chuyển thế luân hồi. Kiếp thứ ' + (G.reinc.count + 1) + ' bắt đầu.', 'realm');
  Ach.check();
  Save.save();
  Main.boot(false);
};

UI.introModal = () => {
  const p = G.player;
  UI.modal({
    title: 'Tiên Lộ Khởi Đầu',
    body: '<div class="story"><p>Năm ấy ' + U.esc(p.name) + ' mười sáu tuổi. Một vị tiên sư đi ngang thôn nhỏ dưới chân Thanh Vân Sơn, đặt tay lên trán ' + (p.gender === 'nu' ? 'nàng' : 'chàng') + ' rồi khẽ gật đầu:</p>' +
      '<p><i>"' + Player.rootName() + '… cũng có chút tiên duyên. Quyển Dẫn Khí Quyết này, ngươi cầm lấy."</i></p>' +
      '<p>Từ đó, con đường vấn đạo trường sinh bắt đầu.</p></div>' +
      '<ul class="tips"><li>🧘 Tu vi tự tăng — kể cả khi ngươi rời game.</li><li>📋 Theo dõi <b>Nhiệm Vụ</b> chính tuyến để được dẫn đường.</li><li>🗺️ Thám hiểm để săn yêu thú, nhặt linh dược và gặp kỳ ngộ.</li><li>💾 Game tự lưu trong trình duyệt.</li></ul>',
    actions: [{ label: 'Bắt đầu tu luyện', cls: 'primary' }],
  });
};

UI.offlineModal = (r) => {
  UI.modal({
    title: '🌙 Bế Quan Ngoại Tuyến',
    body: '<p>Ngươi đã nhập định <b>' + U.time(r.sec) + '</b>' + (r.capped ? ' (giới hạn ' + U.time(r.cap) + ')' : '') + '.</p>' +
      '<div class="kv"><span>Tu vi thu được</span><b>+' + U.fmt(r.tuvi) + '</b></div>' +
      (r.ups ? '<div class="kv"><span>Đột phá</span><b>' + D.gsName(r.fromGs) + ' → ' + D.gsName(r.toGs) + '</b></div>' : '') +
      '<div class="kv"><span>Ngộ đạo</span><b>+' + U.fmt(r.insight) + '</b></div>' +
      '<div class="kv"><span>Năm tháng trôi qua</span><b>' + r.years.toFixed(1) + ' năm</b></div>' +
      (Player.canBreak() && Player.isMajorNext() ? '<p class="gold">Tu vi đã đầy — hãy đột phá đại cảnh giới!</p>' : ''),
    actions: [{ label: 'Tiếp tục', cls: 'primary' }],
  });
};

UI.eventModal = (ev, ctx) => {
  const actions = ev.choices.map((ch, i) => {
    const ok = ch.can ? ch.can(ctx) : true;
    return {
      label: ch.label(ctx) + (ok === true ? '' : ' — ' + ok), disabled: ok !== true, cls: i === 0 ? 'primary' : '',
      fn: () => {
        const res = Events.choose(ev, ctx, i, false);
        if (res.blocked) { UI.toast(res.text, 'bad'); return false; }
        UI.modal({
          title: ev.icon + ' ' + ev.title, body: '<p class="story">' + res.text + '</p>',
          actions: [{ label: res.fight ? '⚔️ Nghênh chiến' : 'Tiếp tục', cls: 'primary', fn: () => {
            if (res.fight) Events.fight(res.fight, ctx);
            else Explore.scheduleAuto();
            UI.renderIf('explore', true);
          } }],
          noClose: !!res.fight,
          onClose: () => { if (!res.fight) Explore.scheduleAuto(); },
        });
      },
    };
  });
  UI.modal({ title: ev.icon + ' Kỳ Ngộ: ' + ev.title, body: '<p class="story">' + ev.text(ctx) + '</p>', actions, noClose: true, cls: 'event' });
};

UI.rerootModal = () => {
  const old = G.player.root;
  const neu = Creation.rollRoot(Reinc.lv('linh_can') + 1);
  const box = (r, label) => {
    const rt = D.rootTypes.find((x) => x.id === r.type);
    return '<div class="root-box grade-' + rt.grade + '"><div class="cp-eyebrow">' + label + '</div><div class="root-name">' + rt.name + '</div><div class="root-els">' + (rt.all ? '' : r.els.map((e) => UI.elChip(e)).join('')) + '</div><div class="small">×' + rt.mult + ' tu luyện</div></div>';
  };
  UI.modal({
    title: '💧 Tẩy Linh Dịch', noClose: true,
    body: '<p>Linh dịch gột rửa kinh mạch, linh căn tái sinh. Chọn linh căn muốn giữ:</p><div class="grid-2">' + box(old, 'Hiện tại') + box(neu, 'Mới') + '</div>',
    actions: [
      { label: 'Giữ linh căn cũ', cls: 'ghost', fn: () => UI.render() },
      { label: 'Đổi linh căn mới', cls: 'primary', fn: () => { G.player.root = neu; Ach.check(); Log.add('Linh căn tái sinh: ' + Player.rootName(), 'good'); UI.render(); } },
    ],
  });
};

UI.deathModal = () => {
  Combat.abort();
  Explore.setAuto(false);
  const pts = Reinc.pointsFor();
  UI.modal({
    title: '🕯️ Thọ Nguyên Đã Tận', noClose: true, cls: 'storm',
    body: '<p class="story">Năm ' + Math.floor(G.player.age) + ' tuổi, ' + U.esc(G.player.name) + ' ngồi xếp bằng trong động phủ, khí tức dần tan vào thiên địa. Một đời tu hành dừng lại ở <b>' + D.gsName(Player.gs()) + '</b>.</p>' +
      '<p>Chân linh không diệt, bước vào lục đạo luân hồi. Nhận <b>☯ ' + pts + '</b> điểm luân hồi.</p>',
    actions: [{ label: '☯ Chuyển thế', cls: 'primary', fn: () => Reinc.perform('death') }],
  });
};

UI.endingModal = () => {
  UI.modal({
    title: '🌌 Đại Đạo Viên Mãn',
    body: '<p class="story">Cửu thiên chấn động, vạn đạo triều bái. ' + U.esc(G.player.name) + ' đã đạt tới <b>Chân Tiên Đại Viên Mãn</b> — đỉnh cao của tiên đồ.</p>' +
      '<p>Ngươi có thể tiếp tục chinh phục Thông Thiên Tháp vô tận, hoặc <b>luân hồi</b> để bắt đầu một kiếp mới mạnh mẽ hơn (nhận thêm 30 điểm luân hồi thưởng).</p>',
    actions: [{ label: 'Tiếp tục tiêu dao', cls: 'ghost' }, { label: 'Đến Luân Hồi', cls: 'primary', fn: () => UI.go('reinc') }],
  });
};

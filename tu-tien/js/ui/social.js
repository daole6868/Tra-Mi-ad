'use strict';
/* Giao diện tông môn, phường thị, nhiệm vụ, thành tựu, luân hồi, cài đặt */

/* ---------- Tông môn ---------- */
UI.tabs.sect = {
  name: 'Tông Môn', short: 'Tông môn', icon: '🏯',
  locked() { return Player.gs() < D.SECT_JOIN_GS ? 'Các tông môn chỉ thu nhận đệ tử từ ' + D.gsName(D.SECT_JOIN_GS) + ' trở lên.' : false; },
  render() {
    if (!G.sect) {
      const list = D.sects.map((s) => {
        const can = Sect.canJoin(s);
        const align = { chinh: ['Chính đạo', 'good'], trung: ['Trung lập', ''], ma: ['Ma đạo', 'bad'] }[s.align];
        return '<div class="card sect-card"><div class="dc-icon">' + s.icon + '</div><h3>' + s.name + ' <span class="tag ' + align[1] + '">' + align[0] + '</span></h3><p class="muted">' + s.desc + '</p>' +
          '<div class="small">Gia trì đệ tử: ' + Object.keys(s.bonus).map((k) => D.fmtBonus(k, s.bonus[k])).join(', ') + ' (tăng theo cấp bậc)</div>' +
          '<div class="small">Tuyệt học: 📘 ' + D.techniques[s.tech].name + ' · 📜 ' + D.skills[s.skill].name + '</div>' +
          '<button class="btn primary" data-act="sectJoin" data-arg="' + s.id + '"' + (can === true ? '' : ' disabled') + '>' + (can === true ? 'Bái nhập' : can) + '</button></div>';
      }).join('');
      return UI.pageHead('Tông Môn', 'Gia nhập tông môn để nhận nhiệm vụ, bổng lộc, gia trì và đổi bảo vật bằng cống hiến. Thiện duyên hiện tại: ' + G.player.karma + '.') + '<div class="card-grid">' + list + '</div>';
    }
    const s = Sect.data(), sc = G.sect, rk = Sect.rank();
    const nx = D.sectRanks[sc.rank + 1];
    const head = '<div class="sect-head"><div class="dc-icon">' + s.icon + '</div><div><h3>' + s.name + '</h3>' +
      '<div class="kv"><span>Cấp bậc</span><b>' + rk.name + '</b></div>' +
      '<div class="kv"><span>Cống hiến hiện có / tích lũy</span><b>🏅 ' + U.fmt(sc.contrib) + ' / ' + U.fmt(sc.total) + '</b></div>' +
      (nx ? '<div class="kv"><span>Thăng ' + nx.name + '</span><b>' + U.fmt(nx.total) + ' tích lũy · ' + D.gsName(nx.gs) + '</b></div>' : '') +
      '<div class="kv"><span>Gia trì</span><b>' + Object.keys(s.bonus).map((k) => D.fmtBonus(k, s.bonus[k] * (1 + 0.5 * sc.rank))).join(', ') + '</b></div>' +
      '<div class="row-btns"><button class="btn primary" data-act="sectSalary"' + (Sect.salaryReady() ? '' : ' disabled') + '>' + (Sect.salaryReady() ? '💰 Nhận bổng lộc hôm nay' : 'Đã nhận bổng lộc') + '</button>' +
      '<button class="btn" data-act="sectSpar"' + (Sect.sparLeft() > 0 && !Combat.active() ? '' : ' disabled') + '>⚔️ Luận võ (' + Sect.sparLeft() + '/' + D.SPAR_DAILY + ')</button>' +
      '<button class="btn danger-ghost" data-act="sectLeave">Rời tông môn</button></div></div></div>';
    const missions = sc.missions.map((m, i) => {
      const pr = Sect.progress(m);
      const done = pr >= m.n;
      return '<div class="row-card' + (done ? ' on' : '') + '"><div class="rc-main"><b>' + m.name + '</b><div class="muted small">Thưởng: 🏅 ' + U.fmt(m.reward.contrib) + (m.reward.stones ? ' · 💎 ' + U.fmt(m.reward.stones) : '') + '</div>' +
        '<div class="bar xp sm"><div class="bar-fill" style="width:' + (pr / m.n * 100) + '%"></div><div class="bar-txt"><span class="bar-val">' + (m.t === 'donate' ? (done ? 'Đủ linh thạch' : 'Thiếu linh thạch') : pr + ' / ' + m.n) + '</span></div></div></div>' +
        '<div class="rc-btns"><button class="btn sm primary" data-act="sectClaim" data-arg="' + i + '"' + (done ? '' : ' disabled') + '>Hoàn thành</button>' +
        '<button class="btn sm ghost" data-act="sectReroll" data-arg="' + i + '" title="Đổi nhiệm vụ khác">↻ 💎' + U.fmt(Sect.rerollCost()) + '</button></div></div>';
    }).join('');
    const shop = '<div class="shop-grid">' + Sect.shopItems().map((e, i) => {
      const it = D.items[e.id];
      const lock = sc.rank < e.rank;
      return '<div class="shop-item' + (lock ? ' dim' : '') + '"><span class="ic">' + it.icon + '</span><div class="si-main"><b>' + it.name + '</b><small class="muted">' + (lock ? '🔒 ' + D.sectRanks[e.rank].name : it.desc) + '</small></div>' +
        '<button class="btn sm" data-act="sectBuy" data-arg="' + i + '"' + (lock || sc.contrib < e.cost ? ' disabled' : '') + '>🏅 ' + U.fmt(e.cost) + '</button></div>';
    }).join('') + '</div>';
    return UI.pageHead(s.name, s.desc) + UI.section('Thân Phận Tông Môn', head) + UI.battleHTML('sect') + UI.section('Nhiệm Vụ Tông Môn', missions) + UI.section('Tàng Bảo Các', shop);
  },
  mounted() { if (Combat.b && Combat.b.kind === 'sect') UI.battleUpdate(Combat.b); },
};
A.sectJoin = (id) => {
  const s = D.sectById[id];
  UI.confirm('Bái nhập <b>' + s.name + '</b>? Rời tông môn sau này sẽ mất toàn bộ cống hiến và cấp bậc.', () => { if (Sect.join(id)) { UI.toast('Đã bái nhập ' + s.name, 'good'); UI.render(); } });
};
A.sectLeave = () => UI.confirm('Rời khỏi tông môn? Toàn bộ cống hiến và cấp bậc sẽ mất.', () => { Sect.leave(); UI.render(); }, { danger: true, yes: 'Rời đi' });
A.sectSalary = () => { const r = Sect.claimSalary(); if (r) UI.toast('Bổng lộc: ' + r.join(', '), 'good'); UI.render(); };
A.sectClaim = (i) => { const r = Sect.claim(+i); if (r) UI.toast('Hoàn thành: ' + r.join(', '), 'good'); UI.render(); };
A.sectReroll = (i) => { if (!Sect.reroll(+i)) UI.toast('Không đủ linh thạch.', 'bad'); UI.renderMain(true); };
A.sectBuy = (i) => { UI.result(Sect.buy(+i)); UI.render(); };
A.sectSpar = () => { Combat.clear(); if (Sect.spar()) UI.renderMain(true); };

/* ---------- Phường thị ---------- */
UI.tabs.market = {
  name: 'Phường Thị', short: 'Phường thị', icon: '🏪',
  render() {
    Market.refresh(false);
    const cat = G.ui.mkCat || 'pill';
    const cats = [['pill', 'Đan dược'], ['herb', 'Linh dược'], ['ore', 'Khoáng thạch'], ['core', 'Yêu đan'], ['book', 'Bí tịch'], ['misc', 'Khác']];
    const seg = '<div class="seg small">' + cats.map(([k, n]) => '<button class="seg-btn' + (k === cat ? ' on' : '') + '" data-act="mkCat" data-arg="' + k + '">' + n + '</button>').join('') + '</div>';
    const ids = Market.fixedList().filter((id) => {
      const c = D.items[id].cat;
      return cat === 'misc' ? (c === 'egg' || c === 'special') : c === cat;
    });
    const fixed = '<div class="shop-grid">' + ids.map((id) => {
      const it = D.items[id], pr = Inv.buyPrice(id);
      return '<div class="shop-item"><span class="ic">' + it.icon + '</span><div class="si-main"><b>' + it.name + '</b><small class="muted">' + it.desc + ' · có ' + Inv.count(id) + '</small></div>' +
        '<div class="si-btns"><button class="btn sm" data-act="buy" data-arg="' + id + ':1"' + (G.player.stones >= pr ? '' : ' disabled') + '>💎 ' + U.fmt(pr) + '</button>' +
        (it.cat !== 'book' ? '<button class="btn sm ghost" data-act="buy" data-arg="' + id + ':10"' + (G.player.stones >= pr * 10 ? '' : ' disabled') + '>×10</button>' : '') + '</div></div>';
    }).join('') + '</div>';
    const stock = '<div class="shop-grid">' + G.market.stock.map((e, i) => {
      let name, icon, desc;
      if (e.kind === 'gear') {
        const q = D.qualities[e.g.q];
        name = '<span style="color:' + q.color + '">' + Gear.name(e.g) + '</span>'; icon = D.slots[e.g.slot].icon;
        desc = q.name + ' · ' + D.numHan[e.g.tier] + ' giai · ' + e.g.affixes.map((a) => D.fmtBonus(a.k, a.v)).join(', ');
      } else { const it = D.items[e.id]; name = it.name; icon = it.icon; desc = it.desc; }
      return '<div class="shop-item rare' + (e.sold ? ' dim' : '') + '"><span class="ic">' + icon + '</span><div class="si-main"><b>' + name + '</b><small class="muted">' + desc + '</small></div>' +
        '<button class="btn sm primary" data-act="buyStock" data-arg="' + i + '"' + (e.sold || G.player.stones < e.price ? ' disabled' : '') + '>' + (e.sold ? 'Đã bán' : '💎 ' + U.fmt(e.price)) + '</button></div>';
    }).join('') + '</div>' +
      '<div class="row-btns"><span class="muted small" id="mk-timer"></span><button class="btn sm ghost" data-act="mkRefresh">↻ Làm mới (💎 ' + U.fmt(Market.refreshCost()) + ')</button></div>';
    return UI.pageHead('Phường Thị', 'Nơi tán tu tụ họp buôn bán. Bán vật phẩm trong Hành Trang để đổi linh thạch.') +
      UI.section('Kỳ Trân Các', stock, 'rare-panel') + UI.section('Quầy Hàng', seg + fixed);
  },
  refresh() {
    const t = document.getElementById('mk-timer');
    if (t) t.textContent = 'Làm mới sau ' + U.clock((G.market.refreshAt - Date.now()) / 1000);
    if (G.market.refreshAt <= Date.now()) { Market.refresh(false); UI.renderMain(true); }
  },
};
A.mkCat = (c) => { G.ui.mkCat = c; UI.renderMain(true); };
A.buy = (arg) => { const [id, n] = arg.split(':'); UI.result(Market.buy(id, +n)); UI.renderMain(true); };
A.buyStock = (i) => { UI.result(Market.buyStock(+i)); UI.renderMain(true); };
A.mkRefresh = () => { if (!Market.manualRefresh()) UI.toast('Không đủ linh thạch.', 'bad'); UI.renderMain(true); };

/* ---------- Nhiệm vụ ---------- */
UI.rewardText = (r) => {
  const out = [];
  if (r.stones) out.push('💎 ' + U.fmt(r.stones));
  if (r.insight) out.push('💡 ' + U.fmt(r.insight));
  if (r.contrib) out.push('🏅 ' + U.fmt(r.contrib));
  for (const id in r.items || {}) out.push(UI.itemIcon(id) + ' ' + UI.itemName(id) + ' ×' + r.items[id]);
  return out.join(' · ');
};
UI.tabs.quests = {
  name: 'Nhiệm Vụ', short: 'Nhiệm vụ', icon: '📋',
  render() {
    const q = Quests.cur();
    let main;
    if (q) {
      const [c, t] = Quests.progress(q, G.quests.mainBase);
      const done = c >= t;
      main = '<div class="quest-main' + (done ? ' done' : '') + '"><div class="cp-eyebrow">Chương ' + (G.quests.main + 1) + ' / ' + D.mainQuests.length + '</div><h3>' + q.name + '</h3><p>' + q.desc + '</p>' +
        (q.hint ? '<p class="muted small">💡 ' + q.hint + '</p>' : '') +
        '<div class="bar xp"><div class="bar-fill" style="width:' + Math.min(100, c / t * 100) + '%"></div><div class="bar-txt"><span class="bar-lbl">Tiến độ</span><span class="bar-val">' + (done ? 'Hoàn thành' : q.t === 'gs' ? D.gsName(Math.min(c, D.MAX_GS)) + ' → ' + D.gsName(t) : U.fmt(Math.min(c, t)) + ' / ' + U.fmt(t)) + '</span></div></div>' +
        '<div class="small">Thưởng: ' + UI.rewardText(q.reward) + '</div>' +
        '<button class="btn primary" data-act="claimMain"' + (done ? '' : ' disabled') + '>Nhận thưởng</button></div>';
    } else main = '<p class="good">Ngươi đã hoàn thành toàn bộ tiên đồ chính tuyến. Hãy chinh phục Thông Thiên Tháp hoặc luân hồi để mạnh hơn nữa!</p>';
    const d = Quests.ensureDaily();
    const daily = d.list.map((task, i) => {
      const pr = Quests.dailyProgress(task);
      const done = pr >= task.v;
      return '<div class="row-card' + (task.claimed ? ' dim' : done ? ' on' : '') + '"><div class="rc-main"><b>' + task.name + '</b><div class="muted small">' + pr + ' / ' + task.v + ' · +20 điểm năng động</div></div>' +
        '<button class="btn sm primary" data-act="claimDaily" data-arg="' + i + '"' + (done && !task.claimed ? '' : ' disabled') + '>' + (task.claimed ? 'Đã nhận' : 'Nhận') + '</button></div>';
    }).join('');
    const chests = '<div class="chests">' + D.dailyChests.map((p, j) => {
      const got = d.chests.includes(j), ok = d.points >= p;
      return '<button class="chest' + (got ? ' got' : ok ? ' ready' : '') + '" data-act="claimChest" data-arg="' + j + '"' + (ok && !got ? '' : ' disabled') + '><span>' + (got ? '📭' : '🎁') + '</span><small>' + p + ' điểm</small></button>';
    }).join('') + '</div><div class="bar xp"><div class="bar-fill" style="width:' + Math.min(100, d.points) + '%"></div><div class="bar-txt"><span class="bar-lbl">Năng động</span><span class="bar-val">' + d.points + ' / 100</span></div></div>';
    const L = Quests.loginState();
    const login = '<div class="login-row">' + D.loginRewards.map((r, i) => {
      const day = i + 1, cur = day === L.streak;
      const claimed = day < L.streak || (cur && L.claimed === L.last);
      return '<div class="login-day' + (cur ? ' cur' : '') + (claimed ? ' got' : '') + '"><b>Ngày ' + day + '</b><small>' + r.label + '</small></div>';
    }).join('') + '</div><button class="btn primary" data-act="claimLogin"' + (Quests.loginReady() ? '' : ' disabled') + '>' + (Quests.loginReady() ? 'Điểm danh hôm nay' : 'Đã điểm danh') + '</button>';
    return UI.pageHead('Nhiệm Vụ', 'Tiên đồ chính tuyến, nhiệm vụ hằng ngày và điểm danh. Nhiệm vụ ngày làm mới lúc 0 giờ.') +
      UI.section('Tiên Đồ Chính Tuyến', main) + '<div class="grid-2">' + UI.section('Nhiệm Vụ Hằng Ngày', daily + chests) + UI.section('Điểm Danh 7 Ngày', login) + '</div>';
  },
};
A.claimMain = () => { const r = Quests.claimMain(); if (r) UI.toast('Nhận thưởng: ' + r.join(', '), 'good'); UI.render(); };
A.claimDaily = (i) => { const r = Quests.claimDaily(+i); if (r) UI.toast(r.join(', '), 'good'); UI.render(); };
A.claimChest = (j) => { const r = Quests.claimChest(+j); if (r) UI.toast('Rương năng động: ' + r.join(', '), 'good'); UI.render(); };
A.claimLogin = () => { const r = Quests.claimLogin(); if (r) UI.toast('Điểm danh: ' + r.join(', '), 'good'); UI.render(); };

/* ---------- Thành tựu ---------- */
UI.tabs.achievements = {
  name: 'Thành Tựu', short: 'Thành tựu', icon: '🏆',
  render() {
    const list = D.achievements.map((a) => {
      const got = !!G.ach[a.id];
      return '<div class="ach' + (got ? ' got' : '') + '"><span class="ach-ic">' + (got ? '🏆' : '🔒') + '</span><div><b>' + a.name + '</b><div class="muted small">' + a.desc + '</div><div class="small">' + Object.keys(a.b).map((k) => D.fmtBonus(k, a.b[k])).join(', ') + '</div></div></div>';
    }).join('');
    const st = G.stats;
    const rows = [
      ['Yêu thú đã diệt', st.kills], ['Thủ lĩnh đã diệt', st.bossKills], ['Lần thám hiểm', st.explores], ['Kỳ ngộ', st.events],
      ['Đan dược luyện thành', st.pillsMade], ['Trang bị luyện chế', st.forged], ['Bí cảnh chinh phục', st.dungeons], ['Thiên kiếp vượt qua', st.tribs],
      ['Năm bế quan', st.beQuanYears], ['Linh thạch kiếm được', st.stonesEarned], ['Số lần luân hồi', G.reinc.count], ['Tháp cao nhất (kiếp này)', G.tower.best],
    ];
    return UI.pageHead('Thành Tựu', 'Đã đạt ' + Ach.count() + ' / ' + D.achievements.length + '. Mỗi thành tựu ban gia trì vĩnh viễn, giữ lại qua luân hồi.') +
      UI.section('Thống Kê Trọn Đời', '<div class="stat-grid">' + rows.map((r) => '<div class="stat"><span>' + r[0] + '</span><b>' + U.fmt(r[1] || 0) + '</b></div>').join('') + '</div>') +
      UI.section('Danh Sách', '<div class="ach-grid">' + list + '</div>');
  },
};

/* ---------- Luân hồi ---------- */
UI.tabs.reinc = {
  name: 'Luân Hồi', short: 'Luân hồi', icon: '☯️',
  render() {
    const pts = Reinc.pointsFor();
    const talents = D.reincTalents.map((t) => {
      const lv = Reinc.lv(t.id), cost = D.reincCost(lv);
      return '<div class="row-card"><div class="rc-main"><b>' + t.name + '</b> <small>cấp ' + lv + '/' + t.max + '</small><div class="muted small">' + t.desc + '</div></div>' +
        (lv < t.max ? '<button class="btn sm" data-act="reincUp" data-arg="' + t.id + '"' + (G.reinc.points >= cost ? '' : ' disabled') + '>☯ ' + cost + ' điểm</button>' : '<span class="tag good">Tối đa</span>') + '</div>';
    }).join('');
    const can = Reinc.canVoluntary();
    const info = '<p>Khi thọ nguyên cạn kiệt, ngươi sẽ chuyển thế. Cũng có thể chủ động luân hồi từ Trúc Cơ trở lên. Kiếp mới bắt đầu lại từ phàm nhân, nhưng giữ lại: <b>thành tựu, điểm luân hồi, thiên phú luân hồi, thống kê</b>.</p>' +
      '<div class="kv"><span>Điểm luân hồi hiện có</span><b>☯ ' + G.reinc.points + '</b></div>' +
      '<div class="kv"><span>Nếu luân hồi bây giờ nhận được</span><b>☯ ' + pts + '</b></div>' +
      '<div class="kv"><span>Số kiếp đã trải qua</span><b>' + G.reinc.count + '</b></div>' +
      '<button class="btn danger" data-act="reincNow"' + (can ? '' : ' disabled') + '>☯ Chủ động luân hồi' + (can ? '' : ' (cần Trúc Cơ)') + '</button>';
    return UI.pageHead('Luân Hồi', 'Đạo vô tận, kiếp sau mạnh hơn kiếp trước.') + UI.section('Lục Đạo Luân Hồi', info) + UI.section('Thiên Phú Luân Hồi', talents);
  },
};
A.reincUp = (id) => { if (Reinc.upgrade(id)) Sfx.play('up'); UI.renderMain(true); };
A.reincNow = () => UI.confirm('Chủ động luân hồi? Kiếp này sẽ kết thúc, ngươi nhận <b>☯ ' + Reinc.pointsFor() + '</b> điểm luân hồi và bắt đầu lại từ phàm nhân.', () => { Save.save(); Reinc.perform('voluntary'); }, { danger: true, yes: 'Luân hồi' });

/* ---------- Cài đặt & hướng dẫn ---------- */
UI.tabs.settings = {
  name: 'Cài Đặt', short: 'Cài đặt', icon: '⚙️',
  render() {
    const s = G.settings;
    const tg = (key, label, desc) => '<label class="set-row"><input type="checkbox" data-act="setToggle" data-arg="' + key + '"' + (s[key] ? ' checked' : '') + '><span><b>' + label + '</b><small class="muted">' + desc + '</small></span></label>';
    const opts = [['-1', 'Tắt'], ['0', 'Phàm phẩm'], ['1', 'Phàm & Linh phẩm']].map(([v, n]) => '<option value="' + v + '"' + (String(s.autoSalvage) === v ? ' selected' : '') + '>' + n + '</option>').join('');
    const set = tg('sound', 'Âm thanh', 'Hiệu ứng âm thanh khi chiến đấu, đột phá.') +
      tg('autoBreak', 'Tự đột phá tiểu cảnh giới', 'Tự lên tầng khi tu vi đầy (không áp dụng cho đại cảnh giới).') +
      tg('autoHeal', 'Tự dùng đan hồi phục', 'Tự dùng Hồi Khí/Hồi Linh Đan khi sinh lực/linh lực thấp, kể cả lúc độ kiếp.') +
      tg('autoBattle', 'Tự động chiến đấu', 'Tắt để tự chọn thần thông mỗi lượt khi đang xem trận đấu.') +
      tg('autoEvents', 'Tự xử lý kỳ ngộ khi tự động thám hiểm', 'Chọn phương án an toàn mặc định thay vì dừng lại hỏi.') +
      '<label class="set-row"><span><b>Tự phân giải trang bị nhặt được</b><small class="muted">Trang bị phẩm chất thấp sẽ được phân giải thành khoáng thạch.</small></span><select class="sel" data-change="setSalvage">' + opts + '</select></label>';
    const data = '<div class="row-btns"><button class="btn primary" data-act="saveNow">💾 Lưu ngay</button><button class="btn" data-act="exportSave">📤 Xuất dữ liệu</button><button class="btn" data-act="importSave">📥 Nhập dữ liệu</button><button class="btn danger-ghost" data-act="wipeSave">🗑 Xóa dữ liệu</button></div>' +
      '<p class="muted small">Game tự lưu mỗi 20 giây vào trình duyệt này. Dùng Xuất dữ liệu để sao lưu hoặc chuyển sang máy khác.</p>';
    return UI.pageHead('Cài Đặt', D.GAME_NAME + ' · phiên bản ' + D.VERSION) +
      UI.section('Tùy Chọn', '<div class="set-list">' + set + '</div>') + UI.section('Dữ Liệu', data) + UI.section('Hướng Dẫn Tu Tiên', UI.helpHTML());
  },
};
UI.helpHTML = () => '<div class="help">' +
  '<details open><summary>Bắt đầu</summary><p>Tu vi tự tăng theo thời gian (kể cả khi tắt game, tối đa ' + D.OFFLINE_BASE_H + ' giờ). Khi thanh tu vi đầy, bấm <b>Đột phá</b> ở trang Tu Luyện. Làm theo <b>Nhiệm Vụ chính tuyến</b> để được hướng dẫn từng bước.</p></details>' +
  '<details><summary>Cảnh giới & thiên kiếp</summary><p>Phàm Nhân → Luyện Khí (9 tầng) → Trúc Cơ → Kết Đan → Nguyên Anh → Hóa Thần → Luyện Hư → Hợp Thể → Đại Thừa → Độ Kiếp → Chân Tiên. Trúc Cơ và Kết Đan đột phá theo tỉ lệ (dùng Trúc Cơ Đan/Kết Kim Đan để tăng). Từ Nguyên Anh phải độ thiên kiếp: tăng sinh lực, phòng ngự, mang theo đan hồi phục và Tị Lôi Phù.</p></details>' +
  '<details><summary>Linh căn & ngũ hành</summary><p>Linh căn càng ít hệ càng tu luyện nhanh. Công pháp và thần thông cùng hệ với linh căn được thưởng thêm. Ngũ hành tương khắc: Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim (+30% sát thương). Lôi/Băng/Phong là dị hệ, mạnh hơn ngũ hành thường.</p></details>' +
  '<details><summary>Thọ nguyên & bế quan</summary><p>Mỗi 15 phút thực tế = 1 năm tuổi. Bế quan đổi năm tuổi lấy tu vi ngay lập tức. Hết thọ nguyên sẽ tọa hóa và luân hồi — hãy đột phá để tăng thọ nguyên hoặc dùng Thọ Nguyên Đan.</p></details>' +
  '<details><summary>Đan độc</summary><p>Đan dược tăng tu vi gây đan độc, làm chậm tu luyện (tối đa −50%). Đan độc tự tan 1 điểm/phút, hoặc dùng Giải Độc Đan.</p></details>' +
  '<details><summary>Chiến đấu</summary><p>Trận đấu theo lượt, tốc độ cao hành động nhiều hơn. Trang bị tối đa 4 thần thông. Thua trận mất 5% tu vi hiện tại và phải điều tức. Thông Thiên Tháp và luận võ không tiêu hao sinh lực.</p></details>' +
  '<details><summary>Kiếm linh thạch</summary><p>Đánh yêu thú, thủ lĩnh, bí cảnh, nhiệm vụ ngày, bổng lộc tông môn, bán vật phẩm và phân giải trang bị.</p></details>' +
  '</div>';
A.setToggle = (key, el) => { G.settings[key] = el.checked; if (key === 'sound' && el.checked) { Sfx.unlock(); Sfx.play('coin'); } };
A.setSalvage = (v) => { G.settings.autoSalvage = +v; };
A.saveNow = () => {
  const ok = Save.save();
  UI.toast(ok ? 'Đã lưu.' : 'Không thể lưu — trình duyệt chặn bộ nhớ. Hãy dùng Xuất dữ liệu.', ok ? 'good' : 'bad');
};
A.exportSave = () => {
  const str = Save.exportString();
  UI.modal({
    title: '📤 Xuất dữ liệu',
    body: '<p class="small">Sao chép đoạn mã dưới đây và cất giữ cẩn thận.</p><textarea id="exp-area" class="code-area" readonly>' + str + '</textarea>',
    actions: [
      { label: 'Đóng', cls: 'ghost' },
      { label: 'Sao chép', cls: 'primary', fn: () => {
        const ta = document.getElementById('exp-area');
        const fallback = () => { ta.focus(); ta.select(); UI.toast('Đã chọn sẵn — nhấn Ctrl+C / giữ để sao chép.', 'info'); };
        try { navigator.clipboard.writeText(str).then(() => UI.toast('Đã sao chép.', 'good'), fallback); } catch (e) { fallback(); }
        return false;
      } },
    ],
  });
};
A.importSave = () => {
  UI.modal({
    title: '📥 Nhập dữ liệu',
    body: '<p class="small">Dán mã dữ liệu đã xuất. Tiến trình hiện tại sẽ bị thay thế.</p><textarea id="imp-area" class="code-area" placeholder="Dán mã vào đây…"></textarea>',
    actions: [
      { label: 'Hủy', cls: 'ghost' },
      { label: 'Nhập', cls: 'primary', fn: () => {
        const v = document.getElementById('imp-area').value;
        try {
          const s = Save.importString(v);
          Combat.abort(); Explore.setAuto(false);
          G = s;
          Save.save();
          UI.toast('Nhập dữ liệu thành công.', 'good');
          if (s.player) Main.boot(false);
          else UI.showCreation(Object.assign({ ach: s.ach, stats: s.stats, reinc: s.reinc, settings: s.settings }, s.pending || {}));
        } catch (e) { UI.toast('Mã không hợp lệ: ' + e.message, 'bad'); return false; }
      } },
    ],
  });
};
A.wipeSave = () => UI.confirm('Xóa toàn bộ dữ liệu, kể cả luân hồi và thành tựu? Không thể hoàn tác.', () => {
  Combat.abort(); Explore.setAuto(false);
  Save.wipe();
  G = null;
  Main.skipSave = true;
  UI.showCreation(null);
}, { danger: true, yes: 'Xóa vĩnh viễn' });

'use strict';
/* Giao diện chiến đấu, thám hiểm, bí cảnh, Thông Thiên Tháp */

/* ---------- Khung chiến đấu dùng chung ---------- */
UI._seq = 0;
UI.battleVisible = () => {
  const b = Combat.b;
  return !!(b && document.getElementById('battle') && UI.battleTab[b.kind] === G.ui.tab && !UI.modalOpen());
};
UI.battleStart = (b) => {
  UI._seq = 0;
  if (UI.battleTab[b.kind] === G.ui.tab) UI.renderMain(true);
  UI.refresh();
};

UI.fighterHTML = (f, side, extra) =>
  '<div class="fighter ' + side + '" id="bf-' + side + '">' +
    '<div class="f-ava-wrap"><div class="f-ava">' + f.icon + '</div><div class="floats"></div></div>' +
    '<div class="f-info">' +
      '<div class="f-name">' + U.esc(f.name) + (f.boss ? ' <span class="tag boss">Thủ lĩnh</span>' : '') + '</div>' +
      '<div class="f-sub">' + (extra || '') + '</div>' +
      UI.bar('bf-' + side + '-hp', 'hp', 'HP') +
      (f.maxMp ? UI.bar('bf-' + side + '-mp', 'mp', 'MP') : '') +
      '<div class="f-effs" id="bf-' + side + '-eff"></div>' +
    '</div>' +
  '</div>';

UI.battleHTML = (kind) => {
  const b = Combat.b;
  if (!b || UI.battleTab[b.kind] !== kind) return '';
  const en = b.enemy;
  const spd = G.settings.battleSpeed;
  return '<section class="battle" id="battle">' +
    '<div class="b-head"><span class="b-title">' + U.esc(b.title || 'Chiến đấu') + '</span>' +
      '<div class="b-ctrl">' +
        '<button class="chip-btn ' + (G.settings.autoBattle ? 'on' : '') + '" data-act="toggleAutoBattle">' + (G.settings.autoBattle ? '🤖 Tự động' : '✋ Thủ công') + '</button>' +
        '<button class="chip-btn" data-act="battleSpeed">⏩ ' + spd + 'x</button>' +
      '</div></div>' +
    '<div class="b-field">' +
      UI.fighterHTML(b.player, 'player', D.gsName(Player.gs())) +
      '<div class="b-vs">VS</div>' +
      UI.fighterHTML(en, 'enemy', en.lvName + ' · ' + UI.elChip(en.el)) +
    '</div>' +
    (b.pet ? '<div class="b-pet">' + b.pet.icon + ' ' + b.pet.name + ' hộ chiến · công ' + U.fmt(b.pet.atk) + '</div>' : '') +
    '<div class="b-actions" id="b-actions"></div>' +
    '<div class="b-result" id="b-result" hidden></div>' +
    '<div class="b-log" id="b-log"></div>' +
  '</section>';
};

UI.battleActionsHTML = (b) => {
  if (b.over) return '';
  if (!b.waiting) return '<div class="b-wait">' + (G.settings.autoBattle ? 'Đang tự động chiến đấu…' : 'Chờ lượt…') + '</div>';
  const pl = b.player;
  let h = '<button class="btn sm" data-act="bAct" data-arg="attack">⚔️ Tấn công</button>';
  for (const sk of pl.skills) {
    const s = sk.s;
    const cd = pl.cds[s.id] > 0 ? pl.cds[s.id] : 0;
    const ok = Combat.canUse(pl, sk);
    h += '<button class="btn sm skill" data-act="bAct" data-arg="' + s.id + '"' + (ok ? '' : ' disabled') + ' title="' + U.esc(UI.skillDesc(s, sk.lv)) + '">' +
      s.name + (cd ? ' <small>(' + cd + ')</small>' : ' <small>' + Math.round(s.mp * 100) + '%MP</small>') + '</button>';
  }
  for (const id of ['hoi_khi_dan', 'dai_hoan_dan', 'cuu_chuyen_dan', 'hoi_linh_dan']) {
    if (Inv.has(id)) h += '<button class="btn sm ghost" data-act="bAct" data-arg="item:' + id + '">' + D.items[id].icon + ' ' + D.items[id].name + ' ×' + Inv.count(id) + '</button>';
  }
  if (b.kind !== 'tower' && b.kind !== 'sect') h += '<button class="btn sm ghost" data-act="bAct" data-arg="flee">🏃 Bỏ chạy</button>';
  return h;
};

UI.battleResultHTML = (b) => {
  const t = b.result === 'win' ? '<h3 class="good">Chiến Thắng</h3>' : b.result === 'flee' ? '<h3>Đã Thoát Thân</h3>' : '<h3 class="bad">Thất Bại</h3>';
  let rw = '';
  if (b.rewards && b.rewards.length) rw = '<div class="rw-list">' + b.rewards.map((r) => '<span class="rw">' + r + '</span>').join('') + '</div>';
  let btns = '';
  if (b.kind === 'explore') {
    btns = Explore.auto ? '<span class="muted">Tự động thám hiểm tiếp…</span> <button class="btn sm ghost" data-act="exAuto">Dừng tự động</button>' :
      '<button class="btn primary" data-act="exploreAgain">Tiếp tục thám hiểm</button><button class="btn ghost" data-act="battleClose">Đóng</button>';
  } else if (b.kind === 'dungeon') {
    const run = G.dungeon.run;
    if (run && run.status === 'rest') btns = '<button class="btn primary" data-act="dgNext">Tiến vào ải ' + (run.stage + 1) + '</button>' + (G.settings.autoBattle ? '<span class="muted">Tự động tiến lên…</span>' : '');
    else btns = '<button class="btn primary" data-act="dgLeave">Rời bí cảnh</button>';
  } else if (b.kind === 'tower') {
    btns = (b.result === 'win' ? '<button class="btn primary" data-act="towerGo">Khiêu chiến tầng ' + (G.tower.best + 1) + '</button>' : '<button class="btn primary" data-act="towerGo">Thử lại</button>') +
      '<button class="btn ghost" data-act="battleClose">Đóng</button>';
  } else {
    btns = '<button class="btn primary" data-act="battleClose">Đóng</button>';
  }
  return t + rw + '<div class="b-res-btns">' + btns + '</div>';
};

UI.battleUpdate = (b) => {
  const root = document.getElementById('battle');
  if (!root || Combat.b !== b) { b.events.length = 0; UI.refresh(); return; }
  const pl = b.player, en = b.enemy;
  UI.setBar('bf-player-hp', Math.max(0, pl.hp), pl.maxHp);
  UI.setBar('bf-player-mp', Math.max(0, pl.mp), pl.maxMp);
  UI.setBar('bf-enemy-hp', Math.max(0, en.hp), en.maxHp);
  const pe = document.getElementById('bf-player-eff'), ee = document.getElementById('bf-enemy-eff');
  if (pe) pe.innerHTML = UI.effChips(pl.effs, pl.shield) + (pl.stunned ? '<span class="eff">💫</span>' : '');
  if (ee) ee.innerHTML = UI.effChips(en.effs, en.shield) + (en.stunned ? '<span class="eff">💫</span>' : '');
  const acts = document.getElementById('b-actions');
  if (acts) acts.innerHTML = UI.battleActionsHTML(b);
  const res = document.getElementById('b-result');
  if (res) {
    res.hidden = !b.over;
    if (b.over && !res.dataset.done) { res.innerHTML = UI.battleResultHTML(b); res.dataset.done = '1'; }
  }
  const log = document.getElementById('b-log');
  if (log) {
    let html = '';
    for (const l of b.log) if (l.id > UI._seq) { html = '<div class="bl ' + l.cls + '">' + l.text + '</div>' + html; UI._seq = l.id; }
    if (html) log.insertAdjacentHTML('afterbegin', html);
    while (log.childNodes.length > 40) log.removeChild(log.lastChild);
  }
  for (const ev of b.events) {
    const host = document.querySelector('#bf-' + ev.side + ' .floats');
    if (!host) continue;
    const s = document.createElement('span');
    s.className = 'float ' + (ev.cls || '');
    s.textContent = ev.text;
    s.style.left = (35 + Math.random() * 30) + '%';
    host.appendChild(s);
    setTimeout(() => s.remove(), 1100);
    if (ev.cls === 'dmg' || ev.cls === 'crit' || ev.cls === 'pet' || ev.cls === 'dot') {
      const ava = document.querySelector('#bf-' + ev.side + ' .f-ava');
      if (ava) { ava.classList.remove('hit'); void ava.offsetWidth; ava.classList.add('hit'); }
    }
  }
  b.events.length = 0;
  UI.refresh();
};

A.bAct = (arg) => Combat.playerAct(arg);
A.toggleAutoBattle = () => {
  G.settings.autoBattle = !G.settings.autoBattle;
  const b = Combat.b;
  if (b && b.waiting && G.settings.autoBattle) { b.waiting = false; Combat.playerAuto(b); Combat.afterAction(b, b.player); }
  UI.renderMain(true);
  if (b) UI.battleUpdate(b);
};
A.battleSpeed = () => {
  const order = [1, 2, 4];
  G.settings.battleSpeed = order[(order.indexOf(G.settings.battleSpeed) + 1) % order.length];
  UI.renderMain(true);
  if (Combat.b) UI.battleUpdate(Combat.b);
};
A.battleClose = () => { Combat.clear(); UI.renderMain(true); };

/* ---------- Thám hiểm ---------- */
UI.tabs.explore = {
  name: 'Thám Hiểm', short: 'Thám hiểm', icon: '🗺️',
  render() {
    const cur = Explore.map();
    let maps = '<div class="map-grid">';
    for (const m of D.maps) {
      const un = Explore.unlocked(m);
      maps += '<button class="map-card' + (m.id === cur.id ? ' active' : '') + (un ? '' : ' locked') + '" data-act="setMap" data-arg="' + m.id + '" style="--hue:' + m.hue + '"' + (un ? '' : ' disabled') + '>' +
        '<span class="mc-icon">' + m.icon + '</span><span class="mc-name">' + m.name + '</span>' +
        '<span class="mc-lv">' + D.gsName(m.lv[0]) + (m.lv[1] !== m.lv[0] ? ' → ' + D.gsName(m.lv[1]) : '') + '</span>' +
        (un ? '' : '<span class="mc-lock">🔒 Cần ' + D.gsName(m.lv[0] - 1) + '</span>') + '</button>';
    }
    maps += '</div>';
    const mons = cur.mons.map((id) => '<span class="mon-chip" title="' + D.monsters[id].name + '">' + D.monsters[id].icon + ' ' + D.monsters[id].name + '</span>').join('');
    const boss = D.monsters[cur.boss];
    const herbs = D.herbsByTier[cur.tier].map((id) => UI.itemIcon(id) + ' ' + UI.itemName(id)).join(' · ');
    const busy = Combat.active() || Explore.busy;
    const panel =
      '<div class="ex-head" style="--hue:' + cur.hue + '"><div class="ex-icon">' + cur.icon + '</div><div><h2>' + cur.name + '</h2><p>' + cur.desc + '</p></div></div>' +
      '<div class="ex-info"><div><b>Yêu thú:</b> ' + mons + '</div><div><b>Thủ lĩnh:</b> <span class="mon-chip boss">' + boss.icon + ' ' + boss.name + '</span> · ' + D.gsName(cur.lv[1]) + '</div>' +
      '<div><b>Sản vật:</b> ' + herbs + ' · ' + UI.itemIcon(D.oreByTier[cur.tier]) + ' ' + UI.itemName(D.oreByTier[cur.tier]) + ' · 🔮 Yêu đan ' + D.numHan[cur.tier] + ' giai</div></div>' +
      '<div class="ex-actions">' +
        '<button class="btn primary big" data-act="explore" id="ex-btn"' + (busy ? ' disabled' : '') + '>🧭 Thám hiểm</button>' +
        '<button class="btn ' + (Explore.auto ? 'on' : 'ghost') + '" data-act="exAuto" id="ex-auto">' + (Explore.auto ? '⏸ Dừng tự động' : '🔁 Tự động thám hiểm') + '</button>' +
        '<button class="btn danger-ghost" data-act="exBoss" id="ex-boss">👹 Khiêu chiến thủ lĩnh</button>' +
      '</div>' +
      '<div class="ex-prog" id="ex-prog" hidden><div class="ex-prog-fill"></div></div>' +
      '<div class="ex-status" id="ex-status">' + (UI._exStatus || 'Linh khí nơi này dồi dào. Hãy cẩn thận yêu thú.') + '</div>';
    return UI.pageHead('Thám Hiểm', 'Ngao du bốn phương, săn yêu thú, tìm linh dược và kỳ ngộ.') +
      UI.section('Hành trình', panel, 'explore-panel') + UI.battleHTML('explore') + UI.section('Khu vực', maps);
  },
  mounted() { if (Combat.b && Combat.b.kind === 'explore') UI.battleUpdate(Combat.b); if (Explore.busy) UI.exploreProgress(true); },
  refresh() {
    const m = Explore.map();
    const bb = document.getElementById('ex-boss');
    if (bb) {
      const left = (G.bossCd[m.id] || 0) - Date.now();
      const busy = Combat.active() || Explore.busy;
      bb.disabled = left > 0 || busy;
      bb.textContent = left > 0 ? '👹 Thủ lĩnh hồi sinh sau ' + U.clock(left / 1000) : '👹 Khiêu chiến thủ lĩnh';
    }
    const eb = document.getElementById('ex-btn');
    if (eb) eb.disabled = Combat.active() || Explore.busy;
    const pr = document.getElementById('ex-prog');
    if (pr && Explore.busy) {
      pr.hidden = false;
      pr.firstChild.style.width = Math.min(100, (Date.now() - Explore.progressStart) / Explore.DURATION * 100) + '%';
    }
  },
};
UI.exploreProgress = (on) => {
  const pr = document.getElementById('ex-prog');
  if (pr) { pr.hidden = !on; if (on) pr.firstChild.style.width = '0%'; }
  if (on) UI.setExploreStatus('Đang thám hiểm…');
};
UI.setExploreStatus = (msg) => {
  UI._exStatus = msg;
  const el = document.getElementById('ex-status');
  if (el) el.innerHTML = msg;
};
A.setMap = (id) => {
  if (Explore.setMap(id)) { UI._exStatus = ''; UI.renderMain(true); }
  else UI.toast('Không thể đổi khu vực lúc này.', 'bad');
};
A.explore = () => { Combat.clear(); if (Explore.start()) UI.refresh(); };
A.exploreAgain = () => { Combat.clear(); UI.renderMain(true); Explore.start(); };
A.exAuto = () => {
  Explore.setAuto(!Explore.auto);
  if (Explore.auto) { Combat.clear(); UI.renderMain(true); Explore.autoStep(); }
  else UI.renderMain(true);
};
A.exBoss = () => { Combat.clear(); if (!Explore.challengeBoss()) UI.toast('Chưa thể khiêu chiến.', 'bad'); };

/* ---------- Bí cảnh ---------- */
UI.tabs.dungeon = {
  name: 'Bí Cảnh', short: 'Bí cảnh', icon: '🏛️',
  locked() { return Player.gs() < D.dungeons[0].req ? 'Mở khóa khi đạt ' + D.gsName(D.dungeons[0].req) + '.' : false; },
  render() {
    const run = G.dungeon.run;
    let body = '';
    if (run) {
      const d = D.dungeonById[run.id];
      let pips = '<div class="pips">';
      for (let i = 0; i < d.stages; i++) {
        const cls = i < run.stage || run.status === 'done' ? 'done' : i === run.stage ? 'cur' : '';
        pips += '<span class="pip ' + cls + '">' + (i === d.stages - 1 ? '👹' : i + 1) + '</span>';
      }
      pips += '</div>';
      let status = '';
      if (run.status === 'done') status = '<div class="dg-done"><h3 class="good">Chinh phục thành công!</h3><div class="rw-list">' + run.loot.map((r) => '<span class="rw">' + r + '</span>').join('') + '</div><button class="btn primary" data-act="dgLeave">Rời bí cảnh</button></div>';
      else if (run.status === 'failed') status = '<div class="dg-done"><h3 class="bad">Thất bại</h3><p>Ngươi bị đánh văng khỏi bí cảnh.</p><button class="btn primary" data-act="dgLeave">Rời bí cảnh</button></div>';
      else if (run.status === 'rest' && !Combat.b) status = '<div class="dg-done"><p>Ải ' + run.stage + ' đã vượt qua. Điều tức rồi tiến lên.</p><button class="btn primary" data-act="dgNext">Tiến vào ải ' + (run.stage + 1) + '</button></div>';
      body = UI.section(d.icon + ' ' + d.name, pips + status) + UI.battleHTML('dungeon');
    } else {
      body = '<div class="card-grid">' + D.dungeons.map((d) => {
        const can = Dungeon.canEnter(d);
        const boss = D.monsters[d.boss];
        return '<div class="card dungeon-card' + (Player.gs() < d.req ? ' dim' : '') + '">' +
          '<div class="dc-icon">' + d.icon + '</div><h3>' + d.name + '</h3><p class="muted">' + d.desc + '</p>' +
          '<div class="kv"><span>Yêu cầu</span><b>' + D.gsName(d.req) + '</b></div>' +
          '<div class="kv"><span>Số ải</span><b>' + d.stages + '</b></div>' +
          '<div class="kv"><span>Thủ lĩnh</span><b>' + boss.icon + ' ' + boss.name + '</b></div>' +
          '<div class="kv"><span>Phần thưởng</span><b>Trang bị Huyền phẩm+, bí tịch, trứng</b></div>' +
          '<button class="btn primary" data-act="dgEnter" data-arg="' + d.id + '"' + (can === true ? '' : ' disabled') + '>' + (can === true ? 'Tiến vào' : can) + '</button></div>';
      }).join('') + '</div>';
    }
    return UI.pageHead('Bí Cảnh', 'Lượt còn lại hôm nay: <b>' + Dungeon.left() + '</b> (mỗi ngày ' + Dungeon.maxDaily() + ' lượt, thêm lượt bằng Bí Cảnh Lệnh). Sinh lực không hồi giữa các ải.') + body;
  },
  mounted() { if (Combat.b && Combat.b.kind === 'dungeon') UI.battleUpdate(Combat.b); },
};
A.dgEnter = (id) => { Combat.clear(); if (Dungeon.enter(id)) UI.renderMain(); };
A.dgNext = () => { Dungeon.proceed(); };
A.dgLeave = () => { Dungeon.leave(); UI.renderMain(); };

/* ---------- Thông Thiên Tháp ---------- */
UI.tabs.tower = {
  name: 'Thông Thiên Tháp', short: 'Tháp', icon: '🗼',
  locked() { return Player.gs() < 1 ? 'Mở khóa khi đạt Luyện Khí.' : false; },
  render() {
    const f = G.tower.best + 1;
    const en = Tower.enemy(f);
    const r = Tower.reward(f);
    const rw = ['💎 ~' + U.fmt(r.stones) + ' linh thạch'];
    if (f % 5 === 0) rw.push('🌿 Linh dược, 🔮 yêu đan');
    if (f % 10 === 0) rw.push('🎁 Trang bị Huyền phẩm+, có thể có bí tịch');
    if (f % 30 === 0) rw.push('🥚 Trứng linh thú');
    if (f % 50 === 0) rw.push('💧 Tẩy Linh Dịch');
    const busy = Combat.active();
    const next = '<div class="tower-next">' +
      '<div class="tw-floor"><span class="tw-num">' + f + '</span><span>tầng</span></div>' +
      '<div class="tw-info"><div class="tw-en">' + en.icon + ' <b>' + en.name + '</b> ' + (en.boss ? '<span class="tag boss">Thủ lĩnh</span>' : en.elite ? '<span class="tag">Tinh anh</span>' : '') + '</div>' +
      '<div class="muted">' + en.lvName + ' · HP ' + U.fmt(en.maxHp) + ' · Công ' + U.fmt(en.atk) + ' · Thủ ' + U.fmt(en.def) + '</div>' +
      '<div class="rw-list">' + rw.map((x) => '<span class="rw">' + x + '</span>').join('') + '</div></div>' +
      '<div class="tw-btns"><button class="btn primary big" data-act="towerGo"' + (busy ? ' disabled' : '') + '>Khiêu chiến</button>' +
      '<button class="btn ' + (Tower.auto ? 'on' : 'ghost') + '" data-act="towerAuto">' + (Tower.auto ? '⏸ Dừng leo' : '🔁 Tự động leo') + '</button></div></div>';
    return UI.pageHead('Thông Thiên Tháp', 'Tầng cao nhất đã vượt: <b>' + G.tower.best + '</b>. Thí luyện không tiêu hao sinh lực; thất bại có thể thử lại ngay.') +
      UI.section('Tầng kế tiếp', next) + UI.battleHTML('tower');
  },
  mounted() { if (Combat.b && Combat.b.kind === 'tower') UI.battleUpdate(Combat.b); },
};
A.towerGo = () => { Combat.clear(); if (Tower.challenge()) UI.renderMain(true); };
A.towerAuto = () => {
  Tower.auto = !Tower.auto;
  if (Tower.auto && !Combat.active()) { Combat.clear(); Tower.challenge(); }
  UI.renderMain(true);
};

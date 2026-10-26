'use strict';
/* Giao diện tu luyện, đột phá, thiên kiếp, nhân vật */

UI.figureSVG = (gender) =>
  '<svg class="figure" viewBox="0 0 200 200" aria-hidden="true">' +
    '<defs><linearGradient id="robe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c4a50"/><stop offset="1" stop-color="#16292e"/></linearGradient></defs>' +
    '<ellipse cx="100" cy="176" rx="70" ry="9" fill="rgba(0,0,0,0.35)"/>' +
    '<path d="M38 168 Q100 132 162 168 Q100 186 38 168 Z" fill="url(#robe)" stroke="var(--aura)" stroke-opacity=".45" stroke-width="1.2"/>' +
    '<path d="M68 96 Q100 80 132 96 L142 150 Q100 164 58 150 Z" fill="url(#robe)" stroke="var(--aura)" stroke-opacity=".5" stroke-width="1.2"/>' +
    '<path d="M70 100 Q52 128 74 150 L92 146 Q78 128 84 108 Z" fill="#1d363b" stroke="var(--aura)" stroke-opacity=".35"/>' +
    '<path d="M130 100 Q148 128 126 150 L108 146 Q122 128 116 108 Z" fill="#1d363b" stroke="var(--aura)" stroke-opacity=".35"/>' +
    '<ellipse cx="100" cy="148" rx="15" ry="6" fill="#e9dcc0" opacity=".85"/>' +
    '<path d="M86 92 L100 112 L114 92" fill="none" stroke="#e9dcc0" stroke-opacity=".5" stroke-width="2"/>' +
    '<rect x="94" y="72" width="12" height="12" rx="3" fill="#e2d2b1"/>' +
    '<circle cx="100" cy="60" r="16" fill="#ead9b8"/>' +
    (gender === 'nu'
      ? '<path d="M83 58 Q84 40 100 40 Q116 40 117 58 Q112 48 100 48 Q88 48 83 58 Z" fill="#1a1512"/><path d="M84 56 Q78 84 86 96" stroke="#1a1512" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M116 56 Q122 84 114 96" stroke="#1a1512" stroke-width="5" fill="none" stroke-linecap="round"/>'
      : '<path d="M84 56 Q85 42 100 42 Q115 42 116 56 Q110 48 100 48 Q90 48 84 56 Z" fill="#1a1512"/>') +
    '<circle cx="100" cy="37" r="7" fill="#1a1512"/><rect x="92" y="34" width="16" height="3" rx="1.5" fill="var(--gold)"/>' +
    '<path d="M93 61 q3 2 6 0 M101 61 q3 2 6 0" stroke="#3a2b22" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '<circle cx="100" cy="52" r="1.6" fill="var(--aura)"/>' +
  '</svg>';

UI.tabs.cultivate = {
  name: 'Tu Luyện', short: 'Tu luyện', icon: '🧘',
  render() {
    const p = G.player, realm = Player.realm();
    const coreSize = 6 + p.realm * 2.2;
    const hero =
      '<div class="cult-hero" style="--aura:' + realm.color + '">' +
        '<div class="cult-stage" id="cult-stage">' +
          '<canvas id="qi-canvas" aria-hidden="true"></canvas>' +
          '<div class="aura-glow"></div>' +
          '<svg class="aura-ring" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92" fill="none" stroke="var(--aura)" stroke-opacity=".35" stroke-width="1" stroke-dasharray="2 7"/><circle cx="100" cy="100" r="80" fill="none" stroke="var(--aura)" stroke-opacity=".18" stroke-width="10" stroke-dasharray="1 22"/></svg>' +
          UI.figureSVG(p.gender) +
          '<div class="dantian" style="--core:' + coreSize + 'px"></div>' +
        '</div>' +
        '<div class="cult-panel">' +
          '<div class="cp-eyebrow">Cảnh giới hiện tại</div>' +
          '<h1 class="cp-realm" id="cv-realm"></h1>' +
          '<div class="cp-next" id="cv-next"></div>' +
          UI.bar('cv-bar', 'xp big', 'Tu vi') +
          '<div class="cp-rate" id="cv-rate"></div>' +
          '<div class="cp-actions"><button class="btn primary big" id="cv-break" data-act="breakthrough">Đột phá</button>' +
          '<label class="toggle"><input type="checkbox" id="opt-autobreak" data-act="toggleAutoBreak"' + (G.settings.autoBreak ? ' checked' : '') + '> Tự đột phá tiểu cảnh giới</label></div>' +
          '<div class="cp-status" id="cv-status"></div>' +
        '</div>' +
      '</div>';
    const years = [1, 10, 50, 100];
    const bq = '<p class="muted">Bế quan khổ tu: thọ nguyên trôi qua tức thì để đổi lấy tu vi và ngộ đạo. Mỗi năm bế quan tương đương 30 giây tu luyện. Không thể vượt đại cảnh giới khi bế quan.</p>' +
      '<div class="bq-grid">' + years.map((y) => '<button class="btn bq" data-act="beQuan" data-arg="' + y + '"><b>' + y + ' năm</b><small id="bq-' + y + '"></small></button>').join('') + '</div>';
    let ladder = '<ol class="ladder">';
    D.realms.forEach((r, i) => {
      const st = i < p.realm ? 'past' : i === p.realm ? 'cur' : '';
      const how = r.type === 'auto' ? 'Tự nhiên' : r.type === 'chance' ? 'Tỉ lệ ' + Math.round(r.chance * 100) + '%' : r.strikes + ' đạo lôi kiếp';
      ladder += '<li class="' + st + '" style="--c:' + r.color + '"><span class="ld-dot"></span><span class="ld-name">' + r.name + '</span><span class="ld-meta">' + (i === 0 ? 'Khởi đầu' : how) + ' · thọ ' + (r.life >= 1e6 ? '∞' : U.fmt(r.life)) + '</span></li>';
    });
    ladder += '</ol>';
    return hero +
      '<div class="grid-2">' +
        UI.section('Bế Quan', bq) +
        UI.section('Nguồn Tu Vi', '<div class="breakdown" id="cv-breakdown"></div>') +
      '</div>' +
      UI.section('Tiên Lộ', ladder, 'ladder-panel');
  },
  mounted() { UI.qi.start(); },
  unmounted() { UI.qi.stop(); },
  refresh() {
    const p = G.player;
    const el = document.getElementById('cv-realm');
    if (!el) return;
    el.textContent = D.stageName(p.realm, p.stage);
    el.style.color = Player.realm().color;
    const next = document.getElementById('cv-next');
    if (Player.isMax()) next.textContent = 'Đỉnh cao tiên đồ — có thể Luân Hồi để bắt đầu kiếp mới mạnh hơn.';
    else if (Player.isMajorNext()) {
      const nr = D.realms[p.realm + 1];
      next.innerHTML = 'Kế tiếp: <b style="color:' + nr.color + '">' + nr.name + '</b> — ' + (nr.type === 'auto' ? 'dẫn khí nhập thể' : nr.type === 'chance' ? 'đột phá đại cảnh giới' : 'độ ' + nr.strikes + ' đạo thiên kiếp');
    } else next.textContent = 'Kế tiếp: ' + D.gsName(Player.gs() + 1);
    const req = Player.req();
    UI.setBar('cv-bar', p.tuVi, req, Player.isMax() ? 'Viên mãn' : U.fmt(p.tuVi) + ' / ' + U.fmt(req) + ' (' + Math.floor(p.tuVi / req * 100) + '%)');
    const cr = Player.cultRate(true);
    const eta = Player.canBreak() ? 'Tu vi đã đầy' : 'đầy sau ' + U.time((req - p.tuVi) / Math.max(0.0001, cr.rate));
    document.getElementById('cv-rate').innerHTML = '<b>+' + U.fmt(cr.rate) + '</b> tu vi/giây · <b>+' + Player.insightRate().toFixed(2) + '</b> ngộ đạo/giây · ' + eta;
    const btn = document.getElementById('cv-break');
    const can = Player.canBreak();
    btn.disabled = !can;
    btn.classList.toggle('pulse', can && Player.isMajorNext());
    btn.textContent = Player.isMax() ? 'Đã viên mãn' : !Player.isMajorNext() ? 'Đột phá' : D.realms[p.realm + 1].type === 'trib' ? '⚡ Độ Thiên Kiếp' : '🌕 Đột phá ' + D.realms[p.realm + 1].name;
    /* Trạng thái */
    const now = Date.now();
    let chips = '';
    const life = Player.lifespan();
    chips += '<span class="chip' + (life - p.age < life * 0.1 ? ' bad' : '') + '">⏳ ' + Math.floor(p.age) + '/' + U.fmt(life) + ' tuổi</span>';
    if (p.tox > 0) chips += '<span class="chip' + (p.tox >= 60 ? ' bad' : '') + '" title="Đan độc giảm tốc độ tu luyện, tự tiêu tan 1 điểm/phút">☠️ Đan độc ' + Math.floor(p.tox) + '</span>';
    if (Player.isInjured()) chips += '<span class="chip bad">🩹 Trọng thương ' + U.clock((p.injuredUntil - now) / 1000) + '</span>';
    for (const k in p.buffs) {
      const bf = p.buffs[k];
      if (bf.until > now) chips += '<span class="chip good">' + ({ cult: '🌀 Tu luyện', atk: '🔥 Công', def: '🛡️ Thủ' }[k] || k) + ' +' + bf.val + '% · ' + U.clock((bf.until - now) / 1000) + '</span>';
    }
    if (p.breakFails) chips += '<span class="chip">📈 Kinh nghiệm thất bại +' + p.breakFails * 5 + '%</span>';
    document.getElementById('cv-status').innerHTML = chips;
    document.getElementById('cv-breakdown').innerHTML = '<table>' + cr.parts.map((x) => '<tr><td>' + x[0] + '</td><td>' + x[1] + '</td></tr>').join('') +
      '<tr class="total"><td>Tổng</td><td>' + U.fmt(cr.rate) + ' tu vi/giây</td></tr></table>';
    for (const y of [1, 10, 50, 100]) {
      const s = document.getElementById('bq-' + y);
      if (s) s.textContent = '+' + U.fmt(cr.rate * y * 30) + ' tu vi';
    }
    UI.qi.rate = cr.rate;
  },
};

/* Hạt linh khí bay vào đan điền */
UI.qi = {
  raf: 0, parts: [], rate: 1, last: 0,
  start() {
    UI.qi.stop();
    const cv = document.getElementById('qi-canvas');
    if (!cv) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const ctx = cv.getContext('2d');
    const fit = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    UI.qi.parts = [];
    UI.qi.last = performance.now();
    const color = Player.realm().color;
    const loop = (t) => {
      if (!document.getElementById('qi-canvas')) return UI.qi.stop();
      const dt = Math.min(0.05, (t - UI.qi.last) / 1000);
      UI.qi.last = t;
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width < 2) fit();
      const cx = w / 2, cy = h * 0.64;
      const spawn = 6 + Math.min(40, Math.log10(UI.qi.rate + 1) * 5);
      if (Math.random() < spawn * dt) {
        const a = Math.random() * Math.PI * 2, R = Math.max(w, h) * 0.55;
        UI.qi.parts.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, life: 1, sp: 0.35 + Math.random() * 0.5, r: 1 + Math.random() * 2.2 });
      }
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (const p of UI.qi.parts) {
        p.x += (cx - p.x) * p.sp * dt * 1.6;
        p.y += (cy - p.y) * p.sp * dt * 1.6 - 6 * dt;
        const d = Math.hypot(cx - p.x, cy - p.y);
        p.life = Math.min(1, d / 60);
        ctx.globalAlpha = 0.15 + 0.6 * p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      UI.qi.parts = UI.qi.parts.filter((p) => p.life > 0.08);
      UI.qi.raf = requestAnimationFrame(loop);
    };
    UI.qi.raf = requestAnimationFrame(loop);
  },
  stop() { cancelAnimationFrame(UI.qi.raf); UI.qi.raf = 0; },
};

A.toggleAutoBreak = (a, el) => { G.settings.autoBreak = el.checked; if (el.checked) Player.gainTuVi(0); };

A.breakthrough = () => {
  const p = G.player;
  if (!Player.canBreak()) return;
  if (!Player.isMajorNext()) { Player.advanceMinor(); UI.render(); return; }
  const next = D.realms[p.realm + 1];
  if (next.type === 'auto') {
    Player.majorBreak(false);
    UI.render();
    UI.modal({ title: 'Dẫn Khí Nhập Thể', body: '<p class="story">Linh khí thiên địa như dòng suối mát chảy vào kinh mạch. Từ hôm nay, ngươi không còn là phàm nhân — ngươi đã chính thức bước lên con đường tu tiên.</p><p>Thọ nguyên tăng lên <b>' + Player.lifespan() + '</b> năm. Hãy thám hiểm Thanh Vân Sơn Mạch để rèn luyện!</p>', actions: [{ label: 'Tiếp tục', cls: 'primary' }] });
    return;
  }
  if (next.type === 'chance') return UI.breakModal(next);
  return UI.tribModal(next);
};

UI.breakModal = (next) => {
  const has = next.pill && Inv.has(next.pill);
  const c0 = Player.breakChance(false), c1 = Player.breakChance(true);
  const body = '<p>Ngươi chuẩn bị xung kích bình cảnh <b style="color:' + next.color + '">' + next.name + '</b>. Thất bại sẽ tổn hao 30% tu vi và bị trọng thương 5 phút, nhưng lần sau tỉ lệ tăng thêm 5%.</p>' +
    '<div class="kv"><span>Tỉ lệ thành công</span><b>' + Math.round(c0 * 100) + '%</b></div>' +
    (next.pill ? '<div class="kv"><span>' + UI.itemIcon(next.pill) + ' ' + UI.itemName(next.pill) + ' (có ' + Inv.count(next.pill) + ')</span><b>' + (has ? '→ ' + Math.round(c1 * 100) + '%' : 'Luyện đan, Phường Thị hoặc tông môn') + '</b></div>' : '');
  const actions = [{ label: 'Chuẩn bị thêm', cls: 'ghost' }];
  if (has) actions.push({ label: 'Dùng ' + UI.itemName(next.pill) + ' (' + Math.round(c1 * 100) + '%)', cls: 'primary', fn: () => UI.doBreak(true) });
  actions.push({ label: 'Đột phá (' + Math.round(c0 * 100) + '%)', cls: has ? '' : 'primary', fn: () => UI.doBreak(false) });
  UI.modal({ title: '🌕 Đột Phá ' + next.name, body, actions });
};

UI.doBreak = (usePill) => {
  const r = Player.majorBreak(usePill);
  UI.render();
  if (!r) return;
  if (r.ok) {
    UI.modal({ title: '✨ Đột Phá Thành Công', body: '<p class="story">Thiên địa linh khí cuồn cuộn đổ về, bình cảnh vỡ tan! Ngươi đã đạt tới <b style="color:' + Player.realm().color + '">' + Player.realm().name + '</b>.</p><p>Thọ nguyên: <b>' + Player.lifespan() + '</b> năm. Chỉ số tăng vọt.</p>', actions: [{ label: 'Tuyệt vời', cls: 'primary' }] });
  } else {
    UI.modal({ title: 'Đột Phá Thất Bại', body: '<p>Chân nguyên phản phệ, kinh mạch tổn thương. Tu vi giảm 30%, trọng thương 5 phút (dùng Trị Thương Đan để chữa).</p><p>Lần đột phá sau tỉ lệ thành công tăng thêm 5%.</p>', actions: [{ label: 'Đã hiểu', cls: 'primary' }] });
  }
};

UI.tribModal = (next) => {
  const pv = Trib.preview();
  const pill = next.pill, has = pill && Inv.has(pill);
  const charm = Inv.has('ti_loi_phu');
  let est = pv.total * (charm ? 0.7 : 1);
  const heals = Inv.count('hoi_khi_dan') + Inv.count('dai_hoan_dan') + Inv.count('cuu_chuyen_dan');
  const body = '<p class="story">Muốn bước vào <b style="color:' + next.color + '">' + next.name + '</b>, phải vượt qua <b>' + pv.n + ' đạo lôi kiếp</b>. Kiếp lôi không phân thiện ác, chỉ có thân thể đủ mạnh mới sống sót.</p>' +
    '<div class="kv"><span>Sinh lực của ngươi</span><b>' + U.fmt(pv.hp) + '</b></div>' +
    '<div class="kv"><span>Tổng sát thương lôi kiếp ước tính</span><b class="' + (est > pv.hp ? 'bad' : 'good') + '">' + U.fmt(est) + '</b></div>' +
    '<div class="kv"><span>Hệ số phòng ngự</span><b>×' + pv.defF.toFixed(2) + '</b></div>' +
    '<div class="kv"><span>🧿 Tị Lôi Phù (−30%)</span><b>' + (charm ? 'Sẽ tự kích hoạt' : 'Không có') + '</b></div>' +
    '<div class="kv"><span>' + UI.itemIcon(pill) + ' ' + UI.itemName(pill) + ' (−25%)</span><b>' + (has ? 'Có ' + Inv.count(pill) : 'Không có') + '</b></div>' +
    '<div class="kv"><span>Đan dược hồi phục mang theo</span><b>' + heals + '</b></div>' +
    '<p class="muted">Thất bại: mất 40% tu vi, trọng thương 10 phút. Thành công: toàn chỉ số vĩnh viễn +2%. Đan dược hồi phục được dùng tự động khi sắp không chịu nổi (nếu bật tự động dùng đan).</p>';
  const actions = [{ label: 'Chuẩn bị thêm', cls: 'ghost' }];
  if (has) actions.push({ label: '⚡ Độ kiếp + ' + UI.itemName(pill), cls: 'primary', fn: () => { Trib.start(true); } });
  actions.push({ label: '⚡ Độ kiếp', cls: has ? '' : 'primary', fn: () => { Trib.start(false); } });
  UI.modal({ title: '⚡ Thiên Kiếp Giáng Lâm', body, actions, cls: 'storm' });
};

UI.tribOpen = (s) => {
  UI._trib = UI.modal({
    title: '⚡ Độ Kiếp', cls: 'storm trib', noClose: true,
    body: '<div class="trib-scene" id="trib-scene"><div class="clouds"></div><div class="bolt" id="trib-bolt"></div><div class="trib-fig">' + (G.player.gender === 'nu' ? '🧘‍♀️' : '🧘‍♂️') + '</div></div>' +
      '<div class="trib-count" id="trib-count"></div>' + UI.bar('trib-hp', 'hp big', 'Sinh lực') +
      '<div class="trib-log" id="trib-log"></div>',
    actions: [
      { label: '💊 Nuốt đan dược', cls: '', fn: () => { if (!Trib.heal()) UI.toast('Không còn đan dược hồi phục.', 'bad'); return false; } },
      { label: 'Đóng', cls: 'primary', disabled: true, fn: () => { UI._trib = null; UI.render(); } },
    ],
  });
  UI.tribUpdate(s);
};
UI.tribUpdate = (s) => {
  const m = UI._trib;
  if (!m) return;
  UI.setBar('trib-hp', Math.max(0, s.hp), s.maxHp);
  const c = document.getElementById('trib-count');
  if (c) c.innerHTML = s.done ? (s.ok ? '<b class="good">Độ kiếp thành công!</b>' : '<b class="bad">Độ kiếp thất bại</b>') : 'Lôi kiếp <b>' + s.i + '</b> / ' + s.n;
  const log = document.getElementById('trib-log');
  if (log) log.innerHTML = s.log.slice().reverse().map((l) => '<div>' + l + '</div>').join('');
  if (s.flash) {
    s.flash = false;
    const bolt = document.getElementById('trib-bolt'), scene = document.getElementById('trib-scene');
    if (bolt) { bolt.classList.remove('on'); void bolt.offsetWidth; bolt.classList.add('on'); }
    if (scene) { scene.classList.remove('shake'); void scene.offsetWidth; scene.classList.add('shake'); }
  }
  const btns = m.el.querySelectorAll('.modal-actions .btn');
  if (btns[0]) btns[0].disabled = s.done;
  if (btns[1]) btns[1].disabled = !s.done;
  if (s.done && s.ok) UI.flash(Player.realm().color);
};

A.beQuan = (y) => {
  y = +y;
  const r = Player.beQuan(y);
  if (r.err) return UI.toast(r.err, 'bad');
  UI.toast('Bế quan ' + y + ' năm: +' + U.fmt(r.gain) + ' tu vi, +' + U.fmt(r.ins) + ' ngộ đạo' + (r.ups ? ', đột phá ' + r.ups + ' tầng' : ''), 'good');
  Log.add('Bế quan ' + y + ' năm. Tu vi +' + U.fmt(r.gain) + '.', 'realm');
  UI.render();
};

/* ---------- Nhân vật ---------- */
UI.tabs.character = {
  name: 'Nhân Vật', short: 'Nhân vật', icon: '👤',
  render() {
    const p = G.player, st = Player.stats(), a = Player.attrs(), rt = Player.rootType();
    const bg = D.backgrounds.find((b) => b.id === p.bg);
    const [kl, kc] = Player.karmaLabel();
    const ident = '<div class="ident">' +
      '<div class="kv"><span>Đạo hiệu</span><b>' + U.esc(p.name) + '</b></div>' +
      '<div class="kv"><span>Xuất thân</span><b>' + (bg ? bg.name : '') + '</b></div>' +
      '<div class="kv"><span>Linh căn</span><b>' + Player.rootName() + '</b></div>' +
      '<div class="kv"><span></span><small class="muted">' + rt.desc + ' Tốc độ tu luyện ×' + rt.mult + ', hợp hệ +' + Math.round(Player.matchBonus() * 100) + '%.</small></div>' +
      '<div class="kv"><span>Thiện duyên</span><b class="' + kc + '">' + kl + ' (' + p.karma + ')</b></div>' +
      '<div class="kv"><span>Tuổi / Thọ nguyên</span><b>' + Math.floor(p.age) + ' / ' + U.fmt(Player.lifespan()) + '</b></div>' +
      '<div class="kv"><span>Luân hồi</span><b>' + G.reinc.count + ' kiếp</b></div>' +
      '<div class="kv"><span>Tông môn</span><b>' + (G.sect ? Sect.data().name + ' · ' + Sect.rank().name : 'Tán tu') + '</b></div>' +
      '</div>';
    let attrs = '<div class="attr-grid">';
    for (const k in D.attrs) {
      attrs += '<div class="attr" title="' + D.attrs[k].desc + '"><span class="attr-n">' + D.attrs[k].name + '</span><b>' + a[k] + '</b>' + (p.attrPills[k] ? '<small>(+' + p.attrPills[k] + ' đan)</small>' : '') + '<small class="muted">' + D.attrs[k].desc + '</small></div>';
    }
    attrs += '</div>';
    const rows = [
      ['Sinh lực', U.fmt(st.hp)], ['Linh lực', U.fmt(st.mp)], ['Công kích', U.fmt(st.atk)], ['Phòng ngự', U.fmt(st.def)],
      ['Tốc độ', st.spd], ['Bạo kích', st.crit.toFixed(1) + '%'], ['Bạo thương', st.critDmg.toFixed(0) + '%'], ['Né tránh', st.dodge.toFixed(1) + '%'],
      ['Hút máu', st.lifesteal.toFixed(1) + '%'], ['Rơi đồ', '+' + st.drop.toFixed(0) + '%'], ['Lực chiến', U.fmt(Player.power(st))],
    ];
    const stats = '<div class="stat-grid">' + rows.map((r) => '<div class="stat"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>').join('') + '</div>';
    let eq = '<div class="paperdoll">';
    for (const slot of D.slotOrder) {
      const g = Gear.get(p.equip[slot]);
      eq += '<button class="slot' + (g ? ' filled' : '') + '" data-act="' + (g ? 'gearInfo' : 'tab') + '" data-arg="' + (g ? g.uid : 'inventory') + '"' + (g ? ' style="--qc:' + D.qualities[g.q].color + '"' : '') + '>' +
        '<span class="slot-ic">' + D.slots[slot].icon + '</span><span class="slot-name">' + D.slots[slot].name + '</span>' +
        (g ? '<span class="slot-item" style="color:' + D.qualities[g.q].color + '">' + Gear.name(g) + '</span><small>' + D.numHan[g.tier] + ' giai · ' + D.qualities[g.q].short + '</small>' : '<span class="slot-item muted">Trống</span>') + '</button>';
    }
    eq += '</div><div class="row-btns"><button class="btn" data-act="autoEquip">✨ Mặc trang bị tốt nhất</button></div>';
    const b = st.bonus;
    const extra = ['cult', 'insight', 'drop', 'alch', 'forge', 'stonePct', 'allPct', 'life'].filter((k) => b[k]).map((k) => '<span class="chip">' + D.fmtBonus(k, b[k]) + '</span>').join('') || '<span class="muted">Chưa có.</span>';
    return UI.pageHead('Nhân Vật', 'Thân thể là bảo khí, căn cốt là nền móng.') +
      '<div class="grid-2">' + UI.section('Thân Phận', ident) + UI.section('Trang Bị', eq) + '</div>' +
      UI.section('Thuộc Tính Bẩm Sinh', attrs) + UI.section('Chỉ Số Chiến Đấu', stats) + UI.section('Gia Trì Khác', '<div class="chips">' + extra + '</div>');
  },
};

A.autoEquip = () => {
  let n = 0;
  for (const slot of D.slotOrder) {
    const cur = Gear.get(G.player.equip[slot]);
    let best = cur, bs = cur ? Gear.score(cur) : -1;
    for (const g of G.gear) {
      if (g.slot !== slot || G.player.realm < Gear.reqRealm(g)) continue;
      const s = Gear.score(g);
      if (s > bs) { bs = s; best = g; }
    }
    if (best && best !== cur) { Gear.equip(best.uid); n++; }
  }
  UI.toast(n ? 'Đã thay ' + n + ' món trang bị.' : 'Trang bị hiện tại đã là tốt nhất.', n ? 'good' : 'info');
  UI.render();
};

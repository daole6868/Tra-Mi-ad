'use strict';
/* Khung giao diện: điều hướng, thanh bên, hộp thoại, thông báo */

const A = {}; /* Bảng hành động: data-act="ten" data-arg="..." */

const UI = {
  tabs: {},
  groups: [
    { name: 'Tu Hành', tabs: ['cultivate', 'character', 'technique', 'inventory'] },
    { name: 'Thế Giới', tabs: ['explore', 'dungeon', 'tower'] },
    { name: 'Nghề Tu', tabs: ['alchemy', 'forge', 'cave', 'pets'] },
    { name: 'Giang Hồ', tabs: ['sect', 'market', 'quests', 'achievements'] },
    { name: 'Khác', tabs: ['reinc', 'settings'] },
  ],
  battleTab: { explore: 'explore', dungeon: 'dungeon', tower: 'tower', sect: 'sect' },
  logOpen: false,

  init() {
    document.addEventListener('click', UI.onClick);
    document.addEventListener('change', (e) => {
      const el = e.target.closest('[data-change]');
      if (!el || !A[el.dataset.change]) return;
      try { A[el.dataset.change](el.value, el, e); } catch (err) { console.error(err); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') UI.closeTopModal();
    });
  },

  onClick(e) {
    Sfx.unlock();
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = A[el.dataset.act];
    if (!fn) return;
    if (el.tagName !== 'INPUT' && el.tagName !== 'LABEL') e.preventDefault();
    try { fn(el.dataset.arg, el, e); } catch (err) { console.error(err); UI.toast('Lỗi: ' + err.message, 'bad'); }
  },

  /* ---------- Khung chính ---------- */
  mount() {
    document.getElementById('app').innerHTML =
      '<header class="topbar">' +
        '<div class="brand"><span class="seal">道</span><span class="brand-name">' + D.GAME_NAME + '</span></div>' +
        '<div class="top-res" id="top-res"></div>' +
        '<div class="top-actions">' +
          '<button class="icon-btn" id="battle-ind" data-act="gotoBattle" hidden title="Đang chiến đấu">⚔️</button>' +
          '<button class="icon-btn" data-act="toggleLog" title="Nhật ký">📜</button>' +
          '<button class="icon-btn" data-act="tab" data-arg="settings" title="Cài đặt">⚙️</button>' +
        '</div>' +
      '</header>' +
      '<div class="shell">' +
        '<aside class="side"><div id="side-card"></div><nav class="side-nav" id="side-nav"></nav></aside>' +
        '<main class="main" id="main" tabindex="-1"></main>' +
        '<section class="logpanel" id="logpanel"><div class="lp-head"><span>Nhật Ký Tu Hành</span><button class="icon-btn sm" data-act="toggleLog">✕</button></div><div class="lp-body" id="lp-body"></div></section>' +
      '</div>' +
      '<nav class="bottomnav" id="bottomnav"></nav>';
    UI.renderNav();
    UI.renderLog();
  },

  render() {
    if (!G || !G.player) return;
    if (!document.getElementById('main')) UI.mount();
    UI.renderSide();
    UI.renderNav();
    UI.renderMain();
  },

  renderMain(keepScroll) {
    const main = document.getElementById('main');
    if (!main) return;
    const tab = UI.tabs[G.ui.tab] || UI.tabs.cultivate;
    const y = main.scrollTop;
    const lock = tab.locked && tab.locked();
    main.innerHTML = '<div class="tab tab-' + G.ui.tab + '">' + (lock ? UI.lockedHTML(tab, lock) : tab.render()) + '</div>';
    if (keepScroll) main.scrollTop = y;
    if (!lock && tab.mounted) tab.mounted();
    UI.refresh();
  },

  renderIf(tab, keepScroll) {
    if (G && G.ui.tab === tab && document.getElementById('main') && !UI.modalOpen()) UI.renderMain(keepScroll);
    else if (G && G.ui.tab === tab) UI.dirty = true;
  },

  lockedHTML(tab, msg) {
    return '<div class="locked"><div class="locked-icon">🔒</div><h2>' + tab.name + '</h2><p>' + msg + '</p></div>';
  },

  go(tab) {
    if (!UI.tabs[tab]) return;
    if (UI.tabs[G.ui.tab] && UI.tabs[G.ui.tab].unmounted) UI.tabs[G.ui.tab].unmounted();
    const b = Combat.b;
    if (b && b.waiting && UI.battleTab[b.kind] !== tab) {
      /* Rời khỏi trận đang chờ thao tác: tự động đánh tiếp */
      b.waiting = false;
      Combat.playerAuto(b);
      Combat.afterAction(b, b.player);
    }
    G.ui.tab = tab;
    UI.renderNav();
    UI.renderMain();
    const main = document.getElementById('main');
    if (main) main.scrollTop = 0;
    if (window.innerWidth < 900) window.scrollTo(0, 0);
  },

  renderNav() {
    const side = document.getElementById('side-nav');
    const bottom = document.getElementById('bottomnav');
    if (!side) return;
    let html = '', bhtml = '';
    for (const g of UI.groups) {
      html += '<div class="nav-group"><div class="nav-group-name">' + g.name + '</div>';
      for (const id of g.tabs) {
        const t = UI.tabs[id];
        if (!t) continue;
        const act = G.ui.tab === id ? ' active' : '';
        const badge = '<span class="badge" data-badge="' + id + '" hidden></span>';
        html += '<button class="nav-btn' + act + '" data-act="tab" data-arg="' + id + '"><span class="nav-ic">' + t.icon + '</span><span class="nav-lbl">' + t.name + '</span>' + badge + '</button>';
        bhtml += '<button class="bn-btn' + act + '" data-act="tab" data-arg="' + id + '"><span class="nav-ic">' + t.icon + '</span><span class="bn-lbl">' + t.short + '</span>' + badge + '</button>';
      }
      html += '</div>';
    }
    side.innerHTML = html;
    bottom.innerHTML = bhtml;
    const ab = bottom.querySelector('.active');
    if (ab && ab.scrollIntoView) ab.scrollIntoView({ block: 'nearest', inline: 'center' });
    UI.refreshBadges();
  },

  renderSide() {
    const el = document.getElementById('side-card');
    if (!el) return;
    const p = G.player;
    el.innerHTML =
      '<div class="sc-top">' +
        '<div class="avatar" id="sc-avatar">' + (p.gender === 'nu' ? '🧘‍♀️' : '🧘‍♂️') + '</div>' +
        '<div class="sc-id"><div class="sc-name">' + U.esc(p.name) + '</div><div class="sc-realm" id="sc-realm"></div></div>' +
      '</div>' +
      UI.bar('sc-tuvi', 'xp', 'Tu vi') + UI.bar('sc-hp', 'hp', 'Sinh lực') + UI.bar('sc-mp', 'mp', 'Linh lực') +
      '<div class="sc-meta" id="sc-meta"></div>';
  },

  bar(id, cls, label) {
    return '<div class="bar ' + cls + '" id="' + id + '"><div class="bar-fill"></div><div class="bar-txt"><span class="bar-lbl">' + label + '</span><span class="bar-val"></span></div></div>';
  },
  setBar(id, cur, max, text) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return;
    const pct = max > 0 ? U.clamp(cur / max, 0, 1) * 100 : 0;
    el.firstChild.style.width = pct.toFixed(2) + '%';
    const v = el.querySelector('.bar-val');
    if (v) v.textContent = text != null ? text : U.fmt(cur) + ' / ' + U.fmt(max);
  },

  /** Cập nhật số liệu động (gọi ~4 lần/giây) */
  refresh() {
    if (!G || !G.player || !document.getElementById('main')) return;
    const p = G.player, st = Player.stats();
    const realmEl = document.getElementById('sc-realm');
    if (realmEl) {
      realmEl.textContent = D.stageName(p.realm, p.stage);
      realmEl.style.color = Player.realm().color;
    }
    UI.setBar('sc-tuvi', p.tuVi, Player.req(), Player.isMax() ? 'Viên mãn' : U.fmt(p.tuVi) + ' / ' + U.fmt(Player.req()));
    UI.setBar('sc-hp', p.hp, st.hp);
    UI.setBar('sc-mp', p.mp, st.mp);
    const meta = document.getElementById('sc-meta');
    if (meta) {
      const life = Player.lifespan();
      const warn = life - p.age < Math.max(5, life * 0.08);
      meta.innerHTML = '<span title="Tuổi / Thọ nguyên" class="' + (warn ? 'warn' : '') + '">⏳ ' + Math.floor(p.age) + ' / ' + U.fmt(life) + ' tuổi</span><span title="Lực chiến">⚔️ ' + U.fmt(Player.power(st)) + '</span>';
    }
    const res = document.getElementById('top-res');
    if (res) {
      res.innerHTML = '<span class="res" title="Linh thạch">💎 <b>' + U.fmt(p.stones) + '</b></span>' +
        '<span class="res" title="Điểm ngộ đạo">💡 <b>' + U.fmt(p.insight) + '</b></span>' +
        (G.sect ? '<span class="res" title="Cống hiến tông môn">🏅 <b>' + U.fmt(G.sect.contrib) + '</b></span>' : '');
    }
    const ind = document.getElementById('battle-ind');
    if (ind) {
      const b = Combat.b;
      const show = !!(b && !b.over && UI.battleTab[b.kind] !== G.ui.tab);
      ind.hidden = !show;
    }
    const tab = UI.tabs[G.ui.tab];
    if (tab && tab.refresh && !(tab.locked && tab.locked())) tab.refresh();
    UI.refreshBadges();
  },

  badgeCounts() {
    const out = {};
    out.quests = Quests.badge();
    const now = Date.now();
    out.cave = G.cave.garden.filter((g) => g && g.ready <= now).length;
    out.pets = G.nests.filter((n) => n && n.ready <= now).length;
    out.cultivate = Player.canBreak() && Player.isMajorNext() ? '!' : (Player.canBreak() && !G.settings.autoBreak ? '!' : 0);
    out.sect = G.sect && (Sect.salaryReady() || G.sect.missions.some((m) => Sect.progress(m) >= m.n)) ? '!' : 0;
    out.dungeon = Dungeon.left() > 0 && D.dungeons.some((d) => Player.gs() >= d.req) && !G.dungeon.run ? Dungeon.left() : 0;
    return out;
  },
  refreshBadges() {
    const c = UI.badgeCounts();
    document.querySelectorAll('[data-badge]').forEach((el) => {
      const v = c[el.dataset.badge];
      el.hidden = !v;
      if (v) el.textContent = v;
    });
  },

  /* ---------- Nhật ký ---------- */
  renderLog() {
    const body = document.getElementById('lp-body');
    if (!body || !G) return;
    body.innerHTML = G.log.slice(0, 80).map(UI.logLine).join('');
  },
  logLine(l) { return '<div class="log-line ' + l.type + '"><span class="lt">' + l.time + '</span>' + l.msg + '</div>'; },
  appendLog(l) {
    const body = document.getElementById('lp-body');
    if (!body) return;
    body.insertAdjacentHTML('afterbegin', UI.logLine(l));
    while (body.childNodes.length > 80) body.removeChild(body.lastChild);
  },

  /* ---------- Thông báo ---------- */
  toast(msg, type = 'info') {
    const root = document.getElementById('toasts');
    if (!root || !msg) return;
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = msg;
    root.appendChild(el);
    while (root.children.length > 4) root.removeChild(root.firstChild);
    setTimeout(() => el.classList.add('out'), 3200);
    setTimeout(() => el.remove(), 3700);
  },
  result(r) {
    if (!r) return;
    if (r.msg) UI.toast(r.msg, r.ok ? 'good' : 'bad');
  },
  flash(color) {
    const f = document.getElementById('flash');
    if (!f) return;
    f.style.setProperty('--flash', color || '#fff');
    f.classList.remove('on');
    void f.offsetWidth;
    f.classList.add('on');
  },

  /* ---------- Hộp thoại ---------- */
  modals: [],
  modalOpen() { return UI.modals.length > 0; },
  modal(o) {
    const root = document.getElementById('modal-root');
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    const acts = (o.actions || []).map((a, i) => '<button class="btn ' + (a.cls || '') + '" data-mi="' + i + '"' + (a.disabled ? ' disabled' : '') + '>' + a.label + '</button>').join('');
    wrap.innerHTML = '<div class="modal ' + (o.cls || '') + '" role="dialog" aria-modal="true">' +
      (o.title ? '<div class="modal-head"><h3>' + o.title + '</h3>' + (o.noClose ? '' : '<button class="icon-btn sm modal-x" aria-label="Đóng">✕</button>') + '</div>' : '') +
      '<div class="modal-body">' + (o.body || '') + '</div>' +
      (acts ? '<div class="modal-actions">' + acts + '</div>' : '') + '</div>';
    const m = { el: wrap, o };
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap && !o.noClose) return UI.closeModal(m);
      if (e.target.closest('.modal-x')) return UI.closeModal(m);
      const b = e.target.closest('[data-mi]');
      if (b && !b.disabled) {
        const a = o.actions[+b.dataset.mi];
        const keep = a.fn && a.fn(m) === false;
        if (!keep && a.close !== false) UI.closeModal(m);
      }
    });
    root.appendChild(wrap);
    UI.modals.push(m);
    if (o.onOpen) o.onOpen(m);
    const first = wrap.querySelector('.modal-actions .btn.primary') || wrap.querySelector('.modal-actions .btn');
    if (first && first.focus) first.focus({ preventScroll: true });
    return m;
  },
  closeModal(m) {
    if (!m || !m.el.parentNode) return;
    m.el.remove();
    UI.modals = UI.modals.filter((x) => x !== m);
    if (m.o.onClose) m.o.onClose(m);
    if (!UI.modals.length && UI.dirty) { UI.dirty = false; UI.renderMain(true); }
  },
  closeTopModal() {
    const m = UI.modals[UI.modals.length - 1];
    if (m && !m.o.noClose) UI.closeModal(m);
  },
  confirm(msg, onYes, opts = {}) {
    return UI.modal({
      title: opts.title || 'Xác nhận', body: '<p>' + msg + '</p>',
      actions: [
        { label: opts.no || 'Hủy', cls: 'ghost' },
        { label: opts.yes || 'Đồng ý', cls: opts.danger ? 'danger' : 'primary', fn: onYes },
      ],
    });
  },

  /* ---------- Thành phần dùng chung ---------- */
  itemIcon(id) { return D.items[id] ? D.items[id].icon : '❔'; },
  itemName(id) { return D.items[id] ? D.items[id].name : id; },
  tierBadge(t) { return '<span class="tier">' + D.numHan[t] + ' giai</span>'; },
  needList(map, mult = 1) {
    return Object.keys(map).map((id) => {
      const need = map[id] * mult, have = Inv.count(id);
      return '<span class="need ' + (have >= need ? 'ok' : 'miss') + '">' + UI.itemIcon(id) + ' ' + UI.itemName(id) + ' ' + U.fmt(have) + '/' + need + '</span>';
    }).join('');
  },
  gearLine(g) {
    const q = D.qualities[g.q];
    return '<span class="gear-name" style="color:' + q.color + '">' + D.slots[g.slot].icon + ' ' + Gear.name(g) + '</span>';
  },
  gearStatsHTML(g) {
    const m = Gear.mainStats(g);
    let h = '<div class="gstats">';
    for (const k in m) h += '<div class="gs-main">' + D.fmtBonus(k, m[k]) + '</div>';
    for (const af of g.affixes) h += '<div class="gs-aff">✦ ' + D.fmtBonus(af.k, af.v) + '</div>';
    return h + '</div>';
  },
  section(title, inner, extra = '') {
    return '<section class="panel ' + extra + '"><h2 class="panel-title"><span>' + title + '</span></h2>' + inner + '</section>';
  },
  pageHead(title, sub) {
    return '<div class="page-head"><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>';
  },
  effChips(effs, shield) {
    let h = '';
    for (const e of effs) {
      const info = D.effectInfo[e.type];
      if (info) h += '<span class="eff" title="' + info.name + ' (' + e.turns + ' lượt)">' + info.icon + e.turns + '</span>';
    }
    if (shield > 0) h += '<span class="eff" title="Hộ thuẫn">🛡️' + U.fmt(shield) + '</span>';
    return h;
  },
  el(name) { return D.elements[name] || D.elements.none; },
  elChip(name) {
    if (name === 'all') return '<span class="el-chip" style="--c:#fff6dc">Ngũ Hành</span>';
    const e = UI.el(name);
    return '<span class="el-chip" style="--c:' + e.color + '">' + e.name + '</span>';
  },
};

/* Hành động điều hướng chung */
A.tab = (id) => UI.go(id);
A.toggleLog = () => {
  UI.logOpen = !UI.logOpen;
  document.body.classList.toggle('log-open', UI.logOpen);
};
A.gotoBattle = () => { if (Combat.b) UI.go(UI.battleTab[Combat.b.kind] || 'explore'); };
A.closeModal = () => UI.closeTopModal();

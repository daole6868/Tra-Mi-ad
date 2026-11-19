'use strict';
/* Giao diện HTML phủ trên canvas: HUD, túi đồ & chế tạo, các màn hình */

const $ = (s, r = document) => r.querySelector(s);

const UI = {
  selSlot: -1,
  lastHot: '',
  panelOpen: false,
  pickups: new Map(),

  init() {
    this.hud = $('#hud');
    this.panel = $('#panel');
    this.screen = $('#screen');
    Input.onAction = (a) => {
      if (Game.mode === 'title') return;
      if (a === 'inv') this.toggleInventory();
      if (a === 'pause') { if (this.panelOpen) this.closeInventory(); else this.togglePause(); }
    };
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ui]');
      if (!b || b.disabled) return;
      Sfx.resume();
      Sfx.play('ui');
      const fn = this.actions[b.dataset.ui];
      if (fn) fn.call(this, b.dataset.arg, b, e);
    });
    $('#hotbar').addEventListener('click', (e) => {
      const s = e.target.closest('[data-slot]');
      if (!s) return;
      const i = +s.dataset.slot;
      if (Game.inv.sel === i && Input.usedTouch) Input.tap('use');
      Game.inv.sel = i;
      this.lastHot = '';
    });
    document.addEventListener('touchstart', () => { Sfx.resume(); if (!document.body.classList.contains('touch')) document.body.classList.add('touch'); Input.usedTouch = true; }, { passive: true });
    document.addEventListener('pointerdown', () => Sfx.resume(), { passive: true });
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) document.body.classList.add('touch');
    Input.bindTouch($('#touch'));
    try { const st = JSON.parse(localStorage.getItem('linhvuc_settings') || '{}'); Sfx.on = st.sound !== false; Sfx.musicOn = st.music !== false; } catch (e) { /* bỏ qua */ }
    this.showTitle();
  },
  saveSettings() { try { localStorage.setItem('linhvuc_settings', JSON.stringify({ sound: Sfx.on, music: Sfx.musicOn })); } catch (e) { /* bỏ qua */ } },

  /* ======================= Màn hình ======================= */
  showScreen(html, cls = '') {
    const b = document.getElementById('banner');
    if (b) b.classList.remove('show');
    this.screen.className = 'screen ' + cls;
    this.screen.innerHTML = '<div class="screen-card">' + html + '</div>';
    this.screen.hidden = false;
  },
  hideScreen() { this.screen.hidden = true; this.screen.innerHTML = ''; },

  showTitle() {
    Game.mode = 'title';
    Game.setupDemo();
    this.hud.hidden = true;
    this.closeInventory(true);
    const has = Game.hasSave();
    this.showScreen(
      '<div class="title-seal">道</div>' +
      '<h1 class="title">Linh Vực Cầu Sinh</h1>' +
      '<p class="subtitle">Tông môn tan nát, ngươi lạc vào Linh Vực hoang cổ. Sống sót qua từng đêm, chinh phục bốn bí cảnh, ghép lại Thiên Bia để mở đường trở về.</p>' +
      '<div class="menu">' +
        (has ? '<button class="btn primary" data-ui="continue">Tiếp tục hành trình</button>' : '') +
        '<button class="btn ' + (has ? '' : 'primary') + '" data-ui="newgame">Hành trình mới</button>' +
        '<button class="btn ghost" data-ui="help">Hướng dẫn &amp; điều khiển</button>' +
        '<button class="btn ghost" data-ui="sound">' + this.soundLabel() + '</button>' +
      '</div>' +
      '<p class="fine">Lưu tự động trong trình duyệt · Bàn phím, chuột hoặc cảm ứng · Chơi màn hình ngang</p>',
      'title-screen'
    );
  },
  soundLabel() { return 'Âm thanh: ' + (Sfx.on ? 'Bật' : 'Tắt') + ' · Nhạc: ' + (Sfx.musicOn ? 'Bật' : 'Tắt'); },

  helpHTML() {
    return '<h2>Hướng dẫn</h2>' +
      '<div class="help-grid">' +
      '<div><h3>Bàn phím &amp; chuột</h3><table class="keys">' +
      '<tr><td><kbd>A</kbd><kbd>D</kbd> / <kbd>←</kbd><kbd>→</kbd></td><td>Di chuyển</td></tr>' +
      '<tr><td><kbd>W</kbd> / <kbd>Space</kbd></td><td>Nhảy (giữ để nhảy cao)</td></tr>' +
      '<tr><td><kbd>J</kbd> / chuột trái</td><td>Chém · chặt cây · đập đá</td></tr>' +
      '<tr><td><kbd>K</kbd></td><td>Hỏa Cầu Thuật</td></tr>' +
      '<tr><td><kbd>L</kbd> / <kbd>Shift</kbd></td><td>Lướt (Ngự Phong Bộ)</td></tr>' +
      '<tr><td><kbd>F</kbd> / chuột phải</td><td>Dùng vật phẩm · đặt công trình · ăn</td></tr>' +
      '<tr><td><kbd>E</kbd></td><td>Tương tác (cổng, lửa trại, rương…)</td></tr>' +
      '<tr><td><kbd>M</kbd></td><td>Ngồi thiền tu luyện</td></tr>' +
      '<tr><td><kbd>1</kbd>–<kbd>8</kbd> / lăn chuột</td><td>Chọn ô nhanh</td></tr>' +
      '<tr><td><kbd>Tab</kbd> / <kbd>I</kbd></td><td>Túi đồ &amp; chế tạo</td></tr>' +
      '<tr><td><kbd>Esc</kbd></td><td>Tạm dừng</td></tr></table></div>' +
      '<div><h3>Sinh tồn</h3><ul class="tips">' +
      '<li>Đánh cây lấy gỗ, đập đá lấy đá. Mở Túi đồ để chế tạo Bàn chế tác rồi đặt xuống.</li>' +
      '<li>Ban đêm yêu ma kéo đến. Dựng Lửa trại (nhớ thêm củi), xây tường, hoặc ngủ trên Chiếu cỏ.</li>' +
      '<li>No bụng cạn thì mất máu. Hái quả dại, săn thỏ, nướng thịt ở lửa trại.</li>' +
      '<li>Ngồi thiền ở lửa trại / Bồ đoàn để tăng tu vi, đột phá cảnh giới và mở khóa thần thông.</li>' +
      '<li>Tử vong ngoài trời: rơi lại một nửa nguyên liệu — quay lại nhặt túi đồ.</li>' +
      '<li>Mỗi 4 đêm có Huyết Nguyệt: yêu ma đông và mạnh hơn.</li></ul>' +
      '<h3>Bí cảnh</h3><ul class="tips">' +
      '<li>Bốn cổng: Thanh Mộc (tây), Xích Viêm (đông), Hàn Băng (tận cùng tây), Cửu Thiên Lôi (tận cùng đông).</li>' +
      '<li>Mỗi lần vào có 3 Hồn Đăng (mạng). Thắp Hồn Đăng giữa đường để hồi sinh tại đó.</li>' +
      '<li>Hạ thủ lĩnh để lấy mảnh Thiên Bia và tinh hoa nguyên tố để luyện binh khí, đan đột phá.</li>' +
      '<li>Đặt đủ 4 mảnh vào Truyền Tống Trận ở trung tâm Tàn Tích để chiến thắng.</li></ul></div>' +
      '<div><h3>Cảm ứng (xoay ngang)</h3><ul class="tips"><li>◀ ▶ bên trái để di chuyển.</li><li>Nút bên phải: Nhảy, Chém, Phép, Lướt, Dùng, Tương tác.</li><li>Chạm vào ô đang chọn trên thanh công cụ để dùng nhanh.</li></ul></div>' +
      '</div>';
  },

  onStart(isNew) {
    this.hideScreen();
    this.hud.hidden = false;
    this.lastHot = '';
    this.toastRoot().innerHTML = '';
    if (isNew) {
      this.showScreen('<h2>Lạc vào Linh Vực</h2><p class="story">Đêm ấy, Thanh Vân Môn bị yêu ma san bằng. Ngươi — một đệ tử ngoại môn chưa từng tu luyện — bị cuốn vào Truyền Tống Trận đổ nát, tỉnh dậy giữa Linh Vực hoang cổ.</p><p class="story">Trận pháp chỉ còn trơ khung. Muốn trở về, phải tìm bốn mảnh <b>Thiên Bia</b> bị phong ấn trong bốn bí cảnh. Nhưng trước hết… hãy sống sót qua đêm nay.</p><div class="menu"><button class="btn primary" data-ui="resume">Bắt đầu</button></div>', 'intro');
      Game.paused = true;
    }
    this.lastHot = '';
  },

  togglePause() {
    if (Game.mode !== 'play') return;
    if (Game.paused && !this.panelOpen) { this.actions.resume.call(this); return; }
    Game.paused = true;
    Game.save();
    this.showScreen('<h2>Tạm dừng</h2><div class="menu">' +
      '<button class="btn primary" data-ui="resume">Tiếp tục</button>' +
      '<button class="btn" data-ui="help">Hướng dẫn</button>' +
      '<button class="btn" data-ui="sound">' + this.soundLabel() + '</button>' +
      '<button class="btn" data-ui="fullscreen">Toàn màn hình</button>' +
      '<button class="btn ghost" data-ui="totitle">Lưu &amp; về màn hình chính</button></div>' + this.statsHTML(), 'pause');
  },

  statsHTML() {
    const s = Game.stats;
    return '<div class="statline">Ngày ' + Game.day + ' · ' + DATA.realms[Game.player.realm].name + ' · Hạ ' + s.kills + ' yêu ma · Chế tạo ' + s.crafted + ' · Tử vong ' + s.deaths + ' · Thời gian ' + Math.floor(s.playTime / 60) + ' phút</div>';
  },

  dead(info) {
    this.closeInventory(true);
    this.showScreen('<h2 class="bad">Ngươi đã ngã xuống</h2><p class="story">' + M.esc(info.msg) + '</p>' +
      (info.lost && Object.keys(info.lost).length ? '<div class="lost">' + Object.keys(info.lost).map((id) => DATA.items[id].icon + ' ' + DATA.items[id].name + ' ×' + info.lost[id]).join(' · ') + '</div>' : '') +
      '<div class="menu"><button class="btn primary" data-ui="respawn">Hồi sinh</button></div>', 'dead');
  },

  victory() {
    this.closeInventory(true);
    this.showScreen('<div class="title-seal gold">仙</div><h2>Thiên Bia Hợp Nhất</h2><p class="story">Bốn mảnh Thiên Bia rực sáng, Truyền Tống Trận bừng tỉnh sau ngàn năm. Một cột sáng xuyên thấu tầng mây — con đường trở về đã mở.</p><p class="story">Ngươi sống sót qua <b>' + Game.day + ' ngày</b> ở Linh Vực, đạt tới <b>' + DATA.realms[Game.player.realm].name + '</b>.</p>' + this.statsHTML() +
      '<div class="menu"><button class="btn primary" data-ui="keepplaying">Ở lại tiếp tục tu luyện</button><button class="btn ghost" data-ui="totitle">Về màn hình chính</button></div>', 'victory');
  },

  sleep() {
    const f = $('#fade');
    f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
  },

  actions: {
    newgame() {
      if (Game.hasSave()) {
        this.showScreen('<h2>Bắt đầu lại?</h2><p class="story">Hành trình đang lưu sẽ bị ghi đè.</p><div class="seed"><label for="seed-in">Hạt giống thế giới (tùy chọn)</label><input id="seed-in" inputmode="numeric" placeholder="Ngẫu nhiên"></div><div class="menu"><button class="btn primary" data-ui="startnew">Bắt đầu hành trình mới</button><button class="btn ghost" data-ui="totitle">Quay lại</button></div>', 'title-screen');
        return;
      }
      this.actions.startnew.call(this);
    },
    startnew() {
      const inp = $('#seed-in');
      const seed = inp && inp.value.trim() ? (parseInt(inp.value.replace(/\D/g, ''), 10) || 0) : 0;
      Game.wipe();
      Game.newGame(seed || 0);
      Game.save();
    },
    continue() { if (!Game.load()) this.toast('Không đọc được dữ liệu lưu', 'bad'); },
    help() {
      const back = Game.mode === 'title' ? 'totitle' : 'pauseback';
      this.showScreen(this.helpHTML() + '<div class="menu"><button class="btn primary" data-ui="' + back + '">Quay lại</button></div>', 'help');
    },
    pauseback() { Game.paused = false; this.togglePause(); },
    sound() {
      if (Sfx.on && Sfx.musicOn) Sfx.musicOn = false;
      else if (Sfx.on) Sfx.on = false;
      else { Sfx.on = true; Sfx.musicOn = true; }
      this.saveSettings();
      const b = document.querySelector('[data-ui="sound"]');
      if (b) b.textContent = this.soundLabel();
    },
    fullscreen() {
      const el = document.documentElement;
      try {
        if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* bỏ qua */ } }).catch(() => this.toast('Trình duyệt không cho phép toàn màn hình', 'bad'));
        else if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      } catch (e) { this.toast('Trình duyệt không hỗ trợ toàn màn hình', 'bad'); }
    },
    resume() { this.hideScreen(); Game.paused = false; Input.clear(); },
    totitle() { if (Game.mode === 'play' || Game.mode === 'victory') Game.save(); this.showTitle(); },
    respawn() { this.hideScreen(); Game.respawn(); Input.clear(); },
    keepplaying() { this.hideScreen(); Game.mode = 'play'; Game.paused = false; },
    inv() { this.toggleInventory(); },
    pause() { this.togglePause(); },
    closepanel() { this.closeInventory(); },
    craft(arg) {
      const [i, n] = arg.split(':');
      const r = DATA.recipes[+i];
      const res = Craft.make(Game, r, +n);
      this.toast(res.msg, res.ok ? 'good' : 'bad');
      if (res.ok) Sfx.play('craft');
      this.renderPanel();
    },
    slot(arg) {
      const i = +arg;
      if (this.selSlot >= 0 && this.selSlot !== i) { Game.inv.swap(this.selSlot, i); this.selSlot = i; }
      else this.selSlot = this.selSlot === i ? -1 : i;
      this.renderPanel();
    },
    useSlot(arg) {
      const prev = Game.inv.sel;
      Game.inv.sel = +arg;
      const d = Game.inv.selectedDef();
      if (d && d.cat === 'place') { this.closeInventory(); this.toast('Nhấn F / nút Dùng để đặt ' + d.name, 'info'); return; }
      Game.useSelected();
      if (+arg >= 8) Game.inv.sel = prev;
      this.renderPanel();
    },
    tohot(arg) {
      const i = +arg;
      const empty = Game.inv.slots.findIndex((s, k) => k < 8 && !s);
      const target = empty >= 0 ? empty : Game.inv.sel;
      Game.inv.swap(i, target);
      this.selSlot = target;
      this.renderPanel();
    },
    drop(arg) {
      const s = Game.inv.slots[+arg];
      if (!s) return;
      Game.spawnDrop(s.id, s.n, Game.player.cx + Game.player.face * 30, Game.player.y);
      Game.drops[Game.drops.length - 1].t = -1.5;
      Game.inv.slots[+arg] = null;
      this.selSlot = -1;
      this.renderPanel();
    },
    unequip() {
      if (!Game.inv.armor) return;
      if (Game.inv.add(Game.inv.armor, 1) === 0) Game.inv.armor = null;
      this.renderPanel();
    },
    tab(arg) { this.panelTab = arg; this.renderPanel(); },
  },

  /* ======================= Túi đồ & chế tạo ======================= */
  toggleInventory() { if (this.panelOpen) this.closeInventory(); else this.openInventory(); },
  openInventory(tab) {
    if (Game.mode !== 'play' || !this.screen.hidden) return;
    this.panelOpen = true;
    Game.paused = true;
    Game.stopMeditate();
    if (tab) this.panelTab = tab;
    this.panel.hidden = false;
    this.renderPanel();
  },
  closeInventory(silent) {
    this.panelOpen = false;
    this.selSlot = -1;
    if (this.panel) this.panel.hidden = true;
    if (!silent && Game.mode === 'play') Game.paused = false;
    Input.clear();
    this.lastHot = '';
  },
  slotHTML(s, i, extra = '') {
    const d = s ? DATA.items[s.id] : null;
    const sel = i === this.selSlot ? ' sel' : '';
    const hot = i < 8 ? ' hot' : '';
    return '<button class="slot' + sel + hot + (d ? ' t' + d.tier : ' empty') + '" data-ui="slot" data-arg="' + i + '" title="' + (d ? M.esc(d.name) : '') + '">' +
      (i < 8 ? '<em>' + (i + 1) + '</em>' : '') + (d ? '<span class="ic">' + d.icon + '</span>' + (s.n > 1 ? '<b>' + s.n + '</b>' : '') : '') + extra + '</button>';
  },
  renderPanel() {
    if (!this.panelOpen) return;
    const inv = Game.inv;
    const tab = this.panelTab || 'craft';
    let grid = '<div class="inv-grid">' + inv.slots.map((s, i) => this.slotHTML(s, i)).join('') + '</div>';
    const arm = inv.armor ? DATA.items[inv.armor] : null;
    grid += '<div class="armor-row"><span>Giáp:</span>' + (arm ? '<span class="armor">' + arm.icon + ' ' + arm.name + ' · thủ ' + arm.def + '</span><button class="btn sm ghost" data-ui="unequip">Tháo</button>' : '<span class="muted">Chưa mặc giáp</span>') + '</div>';
    let detail = '<p class="muted small">Chọn một ô để xem chi tiết. Chọn ô rồi chọn ô khác để đổi chỗ; 8 ô đầu là thanh công cụ.</p>';
    if (this.selSlot >= 0 && inv.slots[this.selSlot]) {
      const s = inv.slots[this.selSlot], d = DATA.items[s.id];
      const usable = ['food', 'pill', 'armor', 'place'].includes(d.cat);
      detail = '<div class="detail"><div class="d-head"><span class="ic big">' + d.icon + '</span><div><b>' + d.name + '</b> ×' + s.n + '<div class="muted small">' + this.catName(d.cat) + this.itemStats(d) + '</div></div></div><p class="small">' + d.desc + '</p><div class="row">' +
        (usable ? '<button class="btn sm primary" data-ui="useSlot" data-arg="' + this.selSlot + '">' + (d.cat === 'place' ? 'Cầm để đặt' : d.cat === 'armor' ? 'Mặc' : 'Dùng') + '</button>' : '') +
        (this.selSlot >= 8 ? '<button class="btn sm" data-ui="tohot" data-arg="' + this.selSlot + '">Đưa lên thanh công cụ</button>' : '') +
        '<button class="btn sm ghost" data-ui="drop" data-arg="' + this.selSlot + '">Vứt bỏ</button></div></div>';
    }
    const list = Craft.list(Game);
    const near = Craft.stationsNear(Game);
    const groups = [[null, 'Tay không']].concat(Object.keys(DATA.stationNames).map((k) => [k, DATA.stationNames[k]]));
    let craft = '<div class="near">Trạm gần đây: ' + (near.size ? [...near].map((k) => '<span class="chip">' + DATA.stationNames[k] + '</span>').join('') : '<span class="muted">không có</span>') + '</div>';
    for (const [st, name] of groups) {
      const rows = list.map((x, i) => Object.assign({ i }, x)).filter((x) => x.r.station === st);
      if (!rows.length) continue;
      const avail = !st || near.has(st);
      craft += '<h4' + (avail ? '' : ' class="dim"') + '>' + name + (avail ? '' : ' · cần đứng gần') + '</h4>';
      rows.sort((a, b) => (b.can - a.can));
      for (const x of rows) {
        const r = x.r, d = DATA.items[r.out];
        const need = Object.keys(r.need).map((id) => '<span class="' + (inv.count(id) >= r.need[id] ? 'ok' : 'miss') + '">' + DATA.items[id].icon + ' ' + inv.count(id) + '/' + r.need[id] + '</span>').join('');
        const max = Craft.maxTimes(Game, r);
        craft += '<div class="recipe' + (x.can ? ' can' : '') + '"><span class="ic">' + d.icon + '</span><div class="rinfo"><b>' + d.name + (r.n > 1 ? ' ×' + r.n : '') + '</b><div class="need">' + need + '</div></div>' +
          '<button class="btn sm' + (x.can ? ' primary' : '') + '" data-ui="craft" data-arg="' + x.i + ':1"' + (x.can ? '' : ' disabled') + '>Chế</button>' +
          (x.can && max >= 5 && d.stack > 1 ? '<button class="btn sm" data-ui="craft" data-arg="' + x.i + ':5">×5</button>' : '') + '</div>';
      }
    }
    const p = Game.player;
    const R = DATA.realms[p.realm];
    const info = '<div class="pinfo"><b style="color:' + DATA.realmColor(p.realm) + '">' + R.name + '</b> · Sát thương ×' + R.dmg.toFixed(2) + ' · Thủ ' + Game.defense() + '<div class="muted small">Đã lĩnh ngộ: ' + (DATA.unlocks.filter((u) => p.realm >= u.realm).map((u) => u.name).join(', ') || 'chưa có') + (DATA.unlocks.find((u) => u.realm > p.realm) ? ' · Kế tiếp: ' + DATA.unlocks.find((u) => u.realm > p.realm).name + ' (' + DATA.realms[DATA.unlocks.find((u) => u.realm > p.realm).realm].name + ')' : '') + '</div></div>';
    this.panel.innerHTML = '<div class="panel-card">' +
      '<div class="panel-head"><h2>Túi Trữ Vật</h2><div class="tabs"><button class="tab' + (tab === 'craft' ? ' on' : '') + '" data-ui="tab" data-arg="craft">Chế tạo</button><button class="tab' + (tab === 'bag' ? ' on' : '') + '" data-ui="tab" data-arg="bag">Chi tiết</button></div><button class="btn sm ghost" data-ui="closepanel">Đóng' + (Input.usedTouch ? '' : ' (Tab)') + '</button></div>' +
      '<div class="panel-body tab-' + tab + '"><section class="col-inv">' + info + grid + detail + '</section><section class="col-craft">' + craft + '</section></div></div>';
  },
  catName(c) { return { mat: 'Nguyên liệu', food: 'Thức ăn', pill: 'Đan dược', tool: 'Công cụ', weapon: 'Vũ khí', armor: 'Giáp', place: 'Công trình', light: 'Chiếu sáng', key: 'Bảo vật' }[c] || c; },
  itemStats(d) {
    const o = [];
    if (d.dmg && d.cat === 'weapon') o.push('Sát thương ' + d.dmg);
    if (d.axe) o.push('Chặt ' + d.axe);
    if (d.pick) o.push('Khai thác cấp ' + d.pickTier);
    if (d.def) o.push('Thủ ' + d.def);
    if (d.hunger) o.push('No ' + (d.hunger > 0 ? '+' : '') + d.hunger);
    if (d.hp) o.push('Máu ' + (d.hp > 0 ? '+' : '') + d.hp);
    return o.length ? ' · ' + o.join(' · ') : '';
  },

  /* ======================= Thông báo ======================= */
  toastRoot() { return $('#toasts'); },
  toast(msg, type = 'info') {
    const root = this.toastRoot();
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    root.appendChild(el);
    while (root.children.length > 5) root.removeChild(root.firstChild);
    setTimeout(() => el.classList.add('out'), 2600);
    setTimeout(() => el.remove(), 3100);
  },
  pickup(id, n) {
    const d = DATA.items[id];
    const now = performance.now();
    const ex = this.pickups.get(id);
    if (ex && now - ex.t < 1500 && ex.el.isConnected) {
      ex.n += n; ex.t = now;
      ex.el.textContent = '+' + ex.n + ' ' + d.icon + ' ' + d.name + ' (' + Game.inv.count(id) + ')';
      return;
    }
    const root = this.toastRoot();
    const el = document.createElement('div');
    el.className = 'toast pickup t' + d.tier;
    el.textContent = '+' + n + ' ' + d.icon + ' ' + d.name + ' (' + Game.inv.count(id) + ')';
    root.appendChild(el);
    while (root.children.length > 5) root.removeChild(root.firstChild);
    this.pickups.set(id, { n, t: now, el });
    setTimeout(() => el.classList.add('out'), 2000);
    setTimeout(() => el.remove(), 2500);
  },
  banner(title, sub, kind = '') {
    const b = $('#banner');
    b.className = 'banner ' + kind;
    b.innerHTML = '<div class="b-title">' + M.esc(title) + '</div>' + (sub ? '<div class="b-sub">' + M.esc(sub) + '</div>' : '');
    void b.offsetWidth;
    b.classList.add('show');
    clearTimeout(this.bannerT);
    this.bannerT = setTimeout(() => b.classList.remove('show'), 2600);
  },
  unlock(u) {
    setTimeout(() => this.banner('Lĩnh ngộ: ' + u.name, u.desc, 'realm'), 2700);
  },
  onLevelChange() { this.lastHot = ''; },

  /* ======================= Cập nhật HUD mỗi khung hình ======================= */
  update() {
    if (Game.mode === 'title' || this.hud.hidden) return;
    const p = Game.player;
    const setBar = (id, v, max, txt) => {
      const el = document.getElementById(id);
      el.firstElementChild.style.width = M.clamp(v / max * 100, 0, 100) + '%';
      el.lastElementChild.textContent = txt;
    };
    const R = DATA.realms[p.realm];
    const realmEl = $('#h-realm');
    realmEl.textContent = R.name;
    realmEl.style.color = DATA.realmColor(p.realm);
    setBar('b-hp', p.hp, Game.maxHp(), Math.ceil(Math.max(0, p.hp)) + ' / ' + Game.maxHp());
    setBar('b-mp', p.mp, Game.maxMp(), Math.floor(p.mp) + ' / ' + Game.maxMp());
    setBar('b-food', p.hunger, 100, Math.ceil(p.hunger) + '%');
    setBar('b-tv', R.req === Infinity ? 1 : p.tuvi, R.req === Infinity ? 1 : R.req, R.req === Infinity ? 'Viên mãn' : Math.floor(p.tuvi) + ' / ' + R.req + (R.pill && p.tuvi >= R.req ? ' · cần ' + DATA.items[R.pill].name : ''));
    $('#b-food').classList.toggle('warn', p.hunger < 25);
    $('#b-hp').classList.toggle('warn', p.hp < Game.maxHp() * 0.3);
    /* đồng hồ */
    const h = Game.hours();
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    const night = Game.isNight();
    const icon = Game.level !== Game.world ? '🏛️' : Game.bloodMoon() ? '🩸' : night ? '🌙' : '☀️';
    const where = Game.level !== Game.world ? Game.dungeon.def.name + ' · Hồn Đăng ' + '●'.repeat(Game.lives) + '○'.repeat(3 - Game.lives) : Game.world.biomeAtX(p.cx).name;
    $('#h-clock').innerHTML = '<span class="ci">' + icon + '</span><b>Ngày ' + Game.day + '</b> · ' + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + '<div class="where">' + where + '</div>';
    /* mục tiêu */
    const g = DATA.goals[Game.goal];
    $('#h-goal').innerHTML = g ? '<span>Mục tiêu</span>' + g.text : '<span>Tự do</span>Linh Vực rộng lớn, tiếp tục tu luyện tới Nguyên Anh.';
    /* gợi ý tương tác */
    const pr = $('#prompt');
    const pl = Game.placement();
    const txt = Game.prompt ? (Input.usedTouch ? '' : '[E] ') + Game.prompt : pl ? (pl.ok ? (Input.usedTouch ? 'Nhấn Dùng' : '[F]') + ' để đặt ' + (pl.wall ? 'tường' : DATA.structures[pl.type].name) : 'Không thể đặt ở đây') : p.med ? 'Đang nhập định… (di chuyển để dừng)' : '';
    if (pr.textContent !== txt) pr.textContent = txt;
    pr.hidden = !txt;
    $('#t-act').textContent = Game.prompt ? '✋' : 'E';
    /* thanh công cụ */
    const sig = Game.inv.sel + '|' + Game.inv.slots.slice(0, 8).map((s) => s ? s.id + s.n : '-').join(',');
    if (sig !== this.lastHot) {
      this.lastHot = sig;
      $('#hotbar').innerHTML = Game.inv.slots.slice(0, 8).map((s, i) => {
        const d = s ? DATA.items[s.id] : null;
        return '<button class="hs' + (i === Game.inv.sel ? ' sel' : '') + (d ? ' t' + d.tier : '') + '" data-slot="' + i + '" title="' + (d ? M.esc(d.name) : '') + '"><em>' + (i + 1) + '</em>' + (d ? '<span class="ic">' + d.icon + '</span>' + (s.n > 1 ? '<b>' + s.n + '</b>' : '') : '') + '</button>';
      }).join('');
      const d = Game.inv.selectedDef();
      $('#held-name').textContent = d ? d.name : 'Tay không';
    }
    /* thanh máu thủ lĩnh */
    const bb = $('#bossbar');
    if (Game.boss && Game.boss.alive) {
      bb.hidden = false;
      bb.firstElementChild.textContent = Game.boss.def.name;
      bb.lastElementChild.firstElementChild.style.width = Math.max(0, Game.boss.hp / Game.boss.maxHp * 100) + '%';
    } else bb.hidden = true;
    this.minimap();
    $('#t-skill').classList.toggle('lock', !Game.unlocked('fireball'));
    $('#t-dash').classList.toggle('lock', !Game.unlocked('dash'));
    if (this.panelOpen) { this.panelT = (this.panelT || 0) + 1; }
  },

  minimap() {
    const cv = $('#minimap');
    const c = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    c.clearRect(0, 0, W, H);
    c.fillStyle = 'rgba(14,13,11,0.6)'; c.fillRect(0, 0, W, H);
    const p = Game.player;
    if (Game.level === Game.world) {
      const sx = W / Game.world.w;
      for (const b of DATA.biomes) { c.fillStyle = M.rgba(b.top, 0.55); c.fillRect(b.from * TILE * sx, H - 5, (b.to - b.from) * TILE * sx, 5); }
      for (const pt of Game.world.portals) {
        const D = DATA.dungeons[pt.id];
        c.fillStyle = Game.cleared[pt.id] ? '#ffd27a' : p.realm >= D.req ? D.pal.glow : '#6a645a';
        c.beginPath(); c.arc(pt.x * sx, H / 2 - 1, 4, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = '#ffe9a8'; c.fillRect(Game.world.array.x * sx - 2, 3, 4, 8);
      for (const s of Game.structures) if (s.type === 'lua_trai') { c.fillStyle = s.fuel > 0 ? '#ff9a3c' : '#5a5248'; c.fillRect(s.x * sx - 1, 5, 2, 5); }
      for (const b of Game.bags) { c.fillStyle = '#ffd27a'; c.fillRect(b.x * sx - 1.5, 2, 3, 3); }
      for (const m of Game.mobs) if (m.alive && m.ai !== 'passive' && Math.abs(m.cx - p.cx) < 1200) { c.fillStyle = '#d65a43'; c.fillRect(m.cx * sx - 1, H / 2, 2, 2); }
      c.fillStyle = '#ffffff';
      c.beginPath(); const px = p.cx * sx; c.moveTo(px, 1); c.lineTo(px - 4, H - 3); c.lineTo(px + 4, H - 3); c.closePath(); c.fill();
    } else {
      const D = Game.dungeon, sx = W / D.w;
      c.fillStyle = M.rgba(D.def.pal.accent, 0.4); c.fillRect(0, H / 2 - 1, W, 2);
      c.fillStyle = '#d65a43'; c.fillRect(D.arena.x0 * sx, 3, W - D.arena.x0 * sx, H - 6);
      for (const sh of D.shrines) { c.fillStyle = sh.lit ? '#ffd27a' : '#6a645a'; c.fillRect(sh.x * sx - 1.5, 4, 3, H - 8); }
      for (const ch of D.chests) if (!ch.open) { c.fillStyle = '#c9a24f'; c.fillRect(ch.x * sx - 2, H / 2 - 2, 4, 4); }
      c.fillStyle = '#ffffff';
      c.beginPath(); const px = p.cx * sx; c.moveTo(px, 1); c.lineTo(px - 4, H - 3); c.lineTo(px + 4, H - 3); c.closePath(); c.fill();
    }
  },
};

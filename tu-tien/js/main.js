'use strict';
/* Khởi động & vòng lặp chính */

const Main = {
  TICK_MS: 250,
  lastSave: 0,
  pendingKeep: null,
  skipSave: false,
  dying: false,
  timer: 0,

  start(hotSave) {
    UI.init();
    let loaded = null;
    const raw = hotSave || Save.loadRaw();
    if (raw) {
      try { loaded = Save.parse(raw); } catch (e) { console.warn('Không đọc được dữ liệu lưu', e); }
    }
    if (loaded && loaded.player) {
      G = loaded;
      Main.boot(true);
    } else if (loaded && loaded.pending) {
      G = loaded;
      UI.showCreation(Object.assign({ ach: loaded.ach, stats: loaded.stats, reinc: loaded.reinc, settings: loaded.settings }, loaded.pending));
    } else {
      UI.showCreation(null);
    }
    clearInterval(Main.timer);
    Main.timer = setInterval(Main.tick, Main.TICK_MS);
    window.addEventListener('beforeunload', () => Save.save());
    document.addEventListener('visibilitychange', () => { if (document.hidden) Save.save(); });
  },

  boot(offline) {
    UI.modals.slice().forEach((m) => UI.closeModal(m));
    UI.mount();
    Quests.loginState();
    Quests.ensureDaily();
    Dungeon.resetDaily();
    Market.refresh(false);
    if (offline) Main.offline(true);
    G.lastTick = Date.now();
    UI.render();
    UI.renderLog();
    Ach.check();
    if (G.flags.intro) { G.flags.intro = false; UI.introModal(); }
    else if (Quests.loginReady()) UI.toast('🎁 Hôm nay chưa điểm danh — vào Nhiệm Vụ để nhận quà.', 'quest');
  },

  offlineCap() { return (D.OFFLINE_BASE_H + 2 * Reinc.lv('be_quan')) * 3600; },

  /** Tính tiến trình khi vắng mặt */
  offline(showReport) {
    const now = Date.now();
    const el = (now - G.lastTick) / 1000;
    G.lastTick = now;
    if (el < 30) return;
    const cap = Main.offlineCap();
    const sec = Math.min(el, cap);
    const p = G.player;
    const before = { gs: Player.gs(), ins: p.insight, age: p.age };
    let tv = 0, left = sec;
    while (left > 0) {
      const dt = Math.min(left, 120);
      tv += Player.tick(dt, true);
      left -= dt;
    }
    const st = Player.stats();
    p.hp = st.hp; p.mp = st.mp;
    const r = { sec, cap, capped: el > cap, tuvi: tv, insight: p.insight - before.ins, years: p.age - before.age, fromGs: before.gs, toGs: Player.gs(), ups: Player.gs() - before.gs };
    if (showReport && sec >= 60) UI.offlineModal(r);
    else if (sec >= 60) UI.toast('Nhập định ' + U.time(sec) + ': +' + U.fmt(tv) + ' tu vi', 'info');
  },

  tick() {
    if (!G || !G.player || !document.getElementById('main')) return;
    const now = Date.now();
    const dt = (now - G.lastTick) / 1000;
    if (dt <= 0) return;
    if (dt > 30) Main.offline(false);
    else { G.lastTick = now; Player.tick(dt, false); }
    const p = G.player;
    if (!Main.dying && p.age >= Player.lifespan()) {
      Main.dying = true;
      UI.deathModal();
    }
    if (!G.flags.ending && Player.isMax() && p.tuVi >= Player.req()) {
      G.flags.ending = true;
      UI.endingModal();
    }
    if (now - Main.lastSave > 20000) { Save.save(); Main.lastSave = now; }
    UI.refresh();
  },
};

/* Khởi động — hỗ trợ giữ trạng thái khi trang được cập nhật trực tiếp */
(function () {
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) {
    try { hot.snapshot(() => ({ save: G ? Save.serialize() : null })); } catch (e) { /* bỏ qua */ }
  }
  const boot = (data) => Main.start(data && data.save);
  const go = () => {
    if (hot && hot.ready) hot.ready(boot);
    else boot((hot && hot.data) || {});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();

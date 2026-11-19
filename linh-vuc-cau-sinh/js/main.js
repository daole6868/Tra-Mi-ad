'use strict';
/* Khởi động & vòng lặp cố định 60 bước/giây */

const Main = {
  STEP: 1 / 60,
  acc: 0,
  last: 0,
  start() {
    const cv = document.getElementById('cv');
    Renderer.init(cv);
    Input.init(cv);
    UI.init();
    document.addEventListener('visibilitychange', () => { if (document.hidden && Game.mode === 'play') Game.save(); });
    window.addEventListener('beforeunload', () => { if (Game.mode === 'play') Game.save(); });
    requestAnimationFrame((t) => { this.last = t; this.loop(t); });
  },
  loop(ts) {
    const dt = Math.min(0.1, (ts - this.last) / 1000);
    this.last = ts;
    if (Game.mode === 'title') Game.demoTick(dt);
    else {
      this.acc += dt;
      let n = 0;
      while (this.acc >= this.STEP && n < 6) { Game.update(this.STEP); Input.endStep(); this.acc -= this.STEP; n++; }
      if (n === 6) this.acc = 0;
    }
    try { Renderer.draw(Game, ts / 1000, dt); } catch (e) { console.error(e); }
    UI.update(dt);
    let mood = 'day';
    if (Game.mode === 'play') mood = Game.boss && Game.boss.alive ? 'boss' : Game.level !== Game.world ? 'dungeon' : Game.isNight() ? 'night' : 'day';
    Sfx.music(dt, mood);
    requestAnimationFrame((t) => this.loop(t));
  },
};

/* Hỗ trợ giữ tiến trình khi trang được cập nhật trực tiếp */
(function () {
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) { try { hot.snapshot(() => ({ save: Game.mode === 'play' ? Game.serialize() : null })); } catch (e) { /* bỏ qua */ } }
  const boot = (data) => {
    Main.start();
    if (data && data.save) Game.load(data.save);
  };
  const go = () => { if (hot && hot.ready) hot.ready(boot); else boot((hot && hot.data) || {}); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();

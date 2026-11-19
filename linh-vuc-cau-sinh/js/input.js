'use strict';
/* Điều khiển: bàn phím, chuột, nút cảm ứng */

const Input = {
  keys: {},
  virt: {},
  _pressed: {},
  _released: {},
  onAction: null,
  usedTouch: false,
  map: {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
    KeyJ: 'attack', KeyK: 'skill', KeyL: 'dash', ShiftLeft: 'dash', ShiftRight: 'dash',
    KeyE: 'interact', KeyF: 'use', KeyM: 'meditate', KeyQ: 'prev', KeyR: 'next',
    Tab: 'inv', KeyI: 'inv', KeyC: 'inv', Escape: 'pause', KeyP: 'pause',
    Digit1: 'slot1', Digit2: 'slot2', Digit3: 'slot3', Digit4: 'slot4', Digit5: 'slot5', Digit6: 'slot6', Digit7: 'slot7', Digit8: 'slot8',
  },

  down(a) { return !!(this.keys[a] || this.virt[a]); },
  pressed(a) { return !!this._pressed[a]; },
  released(a) { return !!this._released[a]; },
  endStep() { this._pressed = {}; this._released = {}; },

  setState(store, a, v) {
    const before = this.down(a);
    store[a] = v;
    const after = this.down(a);
    if (!before && after) this._pressed[a] = true;
    if (before && !after) this._released[a] = true;
  },
  key(a, v) { this.setState(this.keys, a, v); },
  touch(a, v) { this.usedTouch = true; this.setState(this.virt, a, v); },
  tap(a) { this._pressed[a] = true; },
  clear() { this.keys = {}; this.virt = {}; },

  init(canvas) {
    const typing = (e) => e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
    window.addEventListener('keydown', (e) => {
      if (typing(e)) return;
      const a = this.map[e.code];
      if (!a) return;
      if (a === 'inv' || a === 'pause' || a === 'jump' || e.code.startsWith('Arrow') || e.code === 'Tab') e.preventDefault();
      if (e.repeat) return;
      if ((a === 'inv' || a === 'pause') && this.onAction) { this.onAction(a); return; }
      this.key(a, true);
    });
    window.addEventListener('keyup', (e) => {
      const a = this.map[e.code];
      if (a) this.key(a, false);
    });
    window.addEventListener('blur', () => { for (const k in this.keys) if (this.keys[k]) this.key(k, false); });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.key('attack', true);
      if (e.button === 2) this.key('use', true);
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.key('attack', false);
      if (e.button === 2) this.key('use', false);
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); this.tap(e.deltaY > 0 ? 'next' : 'prev'); }, { passive: false });
  },

  /* Gắn nút cảm ứng: phần tử có data-touch="action" */
  bindTouch(root) {
    const active = new Map();
    const start = (e) => {
      for (const t of e.changedTouches) {
        const el = document.elementFromPoint(t.clientX, t.clientY);
        const btn = el && el.closest('[data-touch]');
        if (!btn) continue;
        e.preventDefault();
        active.set(t.identifier, btn);
        btn.classList.add('on');
        this.touch(btn.dataset.touch, true);
      }
    };
    const move = (e) => {
      for (const t of e.changedTouches) {
        const prev = active.get(t.identifier);
        const el = document.elementFromPoint(t.clientX, t.clientY);
        const btn = el && el.closest('[data-touch]');
        if (btn === prev) continue;
        if (prev && (prev.dataset.touch === 'left' || prev.dataset.touch === 'right') && btn && (btn.dataset.touch === 'left' || btn.dataset.touch === 'right')) {
          prev.classList.remove('on'); this.touch(prev.dataset.touch, false);
          btn.classList.add('on'); this.touch(btn.dataset.touch, true);
          active.set(t.identifier, btn);
        }
      }
    };
    const end = (e) => {
      for (const t of e.changedTouches) {
        const btn = active.get(t.identifier);
        if (!btn) continue;
        btn.classList.remove('on');
        this.touch(btn.dataset.touch, false);
        active.delete(t.identifier);
      }
    };
    root.addEventListener('touchstart', start, { passive: false });
    root.addEventListener('touchmove', move, { passive: false });
    root.addEventListener('touchend', end);
    root.addEventListener('touchcancel', end);
  },
};

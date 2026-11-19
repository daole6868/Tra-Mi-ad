'use strict';
/* Túi đồ (8 ô đầu là thanh công cụ) và chế tạo */

class Inventory {
  constructor(size = 32) {
    this.slots = new Array(size).fill(null);
    this.armor = null;
    this.sel = 0;
  }
  def(id) { return DATA.items[id]; }
  count(id) {
    let n = 0;
    for (const s of this.slots) if (s && s.id === id) n += s.n;
    if (this.armor === id) n++;
    return n;
  }
  has(id, n = 1) { return this.count(id) >= n; }
  hasAll(need, mult = 1) {
    for (const id in need) if (this.count(id) < need[id] * mult) return false;
    return true;
  }
  /* Thêm vật phẩm, trả về số còn thừa nếu túi đầy */
  add(id, n = 1) {
    const d = this.def(id);
    if (!d) return n;
    const max = d.stack;
    if (max > 1) {
      for (const s of this.slots) {
        if (s && s.id === id && s.n < max) {
          const k = Math.min(n, max - s.n);
          s.n += k; n -= k;
          if (!n) return 0;
        }
      }
    }
    for (let i = 0; i < this.slots.length && n > 0; i++) {
      if (!this.slots[i]) {
        const k = Math.min(n, max);
        this.slots[i] = { id, n: k };
        n -= k;
      }
    }
    return n;
  }
  remove(id, n = 1) {
    if (this.count(id) < n) return false;
    for (let i = this.slots.length - 1; i >= 0 && n > 0; i--) {
      const s = this.slots[i];
      if (s && s.id === id) {
        const k = Math.min(n, s.n);
        s.n -= k; n -= k;
        if (s.n <= 0) this.slots[i] = null;
      }
    }
    return true;
  }
  removeAll(need, mult = 1) {
    if (!this.hasAll(need, mult)) return false;
    for (const id in need) this.remove(id, need[id] * mult);
    return true;
  }
  selected() { return this.slots[this.sel]; }
  selectedDef() { const s = this.selected(); return s ? this.def(s.id) : null; }
  swap(i, j) { const t = this.slots[i]; this.slots[i] = this.slots[j]; this.slots[j] = t; }
  freeSlots() { return this.slots.filter((s) => !s).length; }
  /* Bỏ một nửa nguyên liệu và thức ăn (khi tử vong), trả về danh sách đã bỏ */
  dropFraction(frac) {
    const out = {};
    this.slots.forEach((s, i) => {
      if (!s) return;
      const d = this.def(s.id);
      if (d.cat !== 'mat' && d.cat !== 'food') return;
      const k = Math.floor(s.n * frac);
      if (k <= 0) return;
      s.n -= k;
      out[s.id] = (out[s.id] || 0) + k;
      if (s.n <= 0) this.slots[i] = null;
    });
    return out;
  }
  toJSON() { return { slots: this.slots, armor: this.armor, sel: this.sel }; }
  static from(o) {
    const inv = new Inventory();
    if (o) {
      o.slots.forEach((s, i) => { if (i < inv.slots.length && s && DATA.items[s.id]) inv.slots[i] = { id: s.id, n: s.n }; });
      inv.armor = o.armor && DATA.items[o.armor] ? o.armor : null;
      inv.sel = o.sel || 0;
    }
    return inv;
  }
}

const Craft = {
  /* Các trạm chế tác trong tầm với của người chơi */
  stationsNear(game) {
    const set = new Set();
    if (!game.structures) return set;
    const p = game.player;
    for (const s of game.structures) {
      const def = DATA.structures[s.type];
      if (def.station && Math.abs(s.x - p.cx) < 90 && Math.abs(s.y - p.bottom) < 60) {
        if (s.type === 'lua_trai' && s.fuel <= 0) continue;
        set.add(def.station);
      }
    }
    return set;
  },
  list(game) {
    const near = Craft.stationsNear(game);
    return DATA.recipes.map((r) => ({
      r,
      near: !r.station || near.has(r.station),
      can: (!r.station || near.has(r.station)) && game.inv.hasAll(r.need),
    }));
  },
  maxTimes(game, r) {
    let n = 99;
    for (const id in r.need) n = Math.min(n, Math.floor(game.inv.count(id) / r.need[id]));
    return n;
  },
  make(game, r, times = 1) {
    const near = Craft.stationsNear(game);
    if (r.station && !near.has(r.station)) return { ok: false, msg: 'Cần đứng gần ' + DATA.stationNames[r.station] + '.' };
    times = Math.min(times, Craft.maxTimes(game, r));
    if (times <= 0) return { ok: false, msg: 'Không đủ nguyên liệu.' };
    game.inv.removeAll(r.need, times);
    const n = (r.n || 1) * times;
    const left = game.inv.add(r.out, n);
    if (left > 0) game.spawnDrop(r.out, left, game.player.cx, game.player.y);
    game.stats.crafted += times;
    return { ok: true, msg: 'Chế tạo ' + DATA.items[r.out].name + ' ×' + n };
  },
};

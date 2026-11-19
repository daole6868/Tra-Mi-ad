'use strict';
/* Bản đồ dạng lưới ô: thế giới bên ngoài (Linh Vực) và bí cảnh sinh ngẫu nhiên */

const T_AIR = 0, T_GROUND = 1, T_ROCK = 2, T_ICE = 3, T_HAZARD = 4, T_GATE = 6, T_WOOD = 10, T_STONE = 11;
const SOLID = new Uint8Array(32);
[T_GROUND, T_ROCK, T_ICE, T_GATE, T_WOOD, T_STONE].forEach((t) => { SOLID[t] = 1; });

class Level {
  constructor(cols, rows, kind) {
    this.cols = cols;
    this.rows = rows;
    this.kind = kind;
    this.tiles = new Uint8Array(cols * rows);
    this.wallHp = new Map();
    this.w = cols * TILE;
    this.h = rows * TILE;
  }
  get(c, r) {
    if (c < 0 || c >= this.cols) return T_ROCK;
    if (r < 0) return T_AIR;
    if (r >= this.rows) return T_ROCK;
    return this.tiles[r * this.cols + c];
  }
  set(c, r, t) {
    if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return;
    this.tiles[r * this.cols + c] = t;
  }
  solid(c, r) { return SOLID[this.get(c, r)] === 1; }
  hazard(c, r) { return this.get(c, r) === T_HAZARD; }
  /* Hàng đầu tiên là ô rắn tính từ trên xuống (bỏ qua ô nguy hiểm) */
  topSolid(c, from = 0) {
    for (let r = Math.max(0, from); r < this.rows; r++) if (this.solid(c, r)) return r;
    return this.rows;
  }
  /* Kiểm tra hộp va chạm có chạm ô rắn không */
  boxSolid(x, y, w, h) {
    const c0 = Math.floor(x / TILE), c1 = Math.floor((x + w - 0.01) / TILE);
    const r0 = Math.floor(y / TILE), r1 = Math.floor((y + h - 0.01) / TILE);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (this.solid(c, r)) return true;
    return false;
  }
  boxHazard(x, y, w, h) {
    const c0 = Math.floor(x / TILE), c1 = Math.floor((x + w - 0.01) / TILE);
    const r0 = Math.floor(y / TILE), r1 = Math.floor((y + h + 1) / TILE);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (this.hazard(c, r)) return true;
    return false;
  }
}

/* ======================= Linh Vực (thế giới bên ngoài) ======================= */
class Overworld extends Level {
  constructor(seed) {
    super(DATA.WORLD_COLS, DATA.WORLD_ROWS, 'overworld');
    this.seed = seed >>> 0;
    this.generate();
  }

  biomeIndexAt(c) {
    for (let i = 0; i < DATA.biomes.length; i++) if (c < DATA.biomes[i].to) return i;
    return DATA.biomes.length - 1;
  }
  biomeAt(c) { return DATA.biomes[this.biomeIndexAt(Math.max(0, Math.min(this.cols - 1, Math.floor(c))))]; }
  biomeAtX(x) { return this.biomeAt(x / TILE); }

  generate() {
    const rng = new RNG(this.seed);
    const cols = this.cols, B = DATA.biomes;
    const h = new Float32Array(cols);
    /* Địa hình: trộn mượt tham số các vùng ở ranh giới */
    for (let c = 0; c < cols; c++) {
      let sw = 0, sh = 0;
      B.forEach((b, i) => {
        const m = M.clamp((c - (b.from - 15)) / 30, 0, 1) * M.clamp(((b.to + 15) - c) / 30, 0, 1);
        if (m <= 0) return;
        const n = Noise.fbm(c * b.freq, this.seed + i * 131);
        let hh = b.base - b.amp * (n - 0.5) * 2.2;
        if (b.id === 'loi_phong') hh -= 8 * Math.max(0, Math.sin(c * 0.04 + this.seed % 7));
        sh += hh * m; sw += m;
      });
      h[c] = sh / sw;
    }
    const H = new Int16Array(cols);
    for (let c = 0; c < cols; c++) H[c] = Math.round(h[c]);
    /* San phẳng khu khởi đầu và cổng bí cảnh */
    const flat = (center, rad) => {
      const t = H[center];
      for (let c = center - rad; c <= center + rad; c++) if (c >= 0 && c < cols) H[c] = t;
    };
    flat(DATA.SPAWN_COL, 16);
    for (const id of DATA.dungeonOrder) flat(DATA.dungeons[id].col, 7);
    /* Hồ băng ở Hàn Đàm */
    const lake0 = 120, lake1 = 152;
    for (let c = lake0; c <= lake1; c++) H[c] = H[lake0] + 2;
    /* Giới hạn độ dốc: vùng núi cho phép bậc 2 ô, còn lại 1 ô */
    const maxStep = (c) => { const id = this.biomeAt(c).id; return id === 'loi_phong' || id === 'xich_thach' ? 2 : 1; };
    for (let pass = 0; pass < 3; pass++) {
      for (let c = 1; c < cols; c++) { const m = maxStep(c); if (H[c] - H[c - 1] > m) H[c] = H[c - 1] + m; if (H[c - 1] - H[c] > m) H[c] = H[c - 1] - m; }
      for (let c = cols - 2; c >= 0; c--) { const m = maxStep(c); if (H[c] - H[c + 1] > m) H[c] = H[c + 1] + m; if (H[c + 1] - H[c] > m) H[c] = H[c + 1] - m; }
    }
    for (let c = 0; c < cols; c++) H[c] = M.clamp(H[c], 30, this.rows - 8);
    this.heights = H;
    /* Lấp ô */
    for (let c = 0; c < cols; c++) {
      const top = H[c];
      const ice = c >= lake0 && c <= lake1;
      for (let r = top; r < this.rows; r++) this.set(c, r, r === top && ice ? T_ICE : r < top + 7 ? T_GROUND : T_ROCK);
    }
    this.lake = [lake0, lake1];
    /* Điểm đặc biệt */
    this.spawnX = DATA.SPAWN_COL * TILE + TILE / 2;
    this.portals = DATA.dungeonOrder.map((id) => {
      const c = DATA.dungeons[id].col;
      return { id, c, x: c * TILE + TILE / 2, y: H[c] * TILE };
    });
    this.array = { x: this.spawnX, y: H[DATA.SPAWN_COL] * TILE };
    /* Tài nguyên */
    const protectedCols = [DATA.SPAWN_COL].concat(DATA.dungeonOrder.map((id) => DATA.dungeons[id].col));
    this.resources = [];
    let c = 6;
    while (c < cols - 6) {
      const b = this.biomeAt(c);
      const near = protectedCols.some((p) => Math.abs(p - c) < (p === DATA.SPAWN_COL ? 10 : 9));
      const slope = Math.abs(H[c - 1] - H[c + 1]);
      const inLake = c >= lake0 - 1 && c <= lake1 + 1;
      if (!near && slope <= 1 && !inLake) {
        const pick = rng.weighted(b.res.map(([t, w]) => ({ t, w })));
        const R = DATA.resources[pick.t];
        this.resources.push({ id: 'r' + c, type: pick.t, c, x: c * TILE + TILE / 2, y: H[c] * TILE, hp: R.hp, alive: true, regrowDay: 0, flip: rng.chance(0.5), size: rng.range(0.85, 1.15), shake: 0 });
      }
      c += R_SPACING(b.id, rng);
    }
    function R_SPACING(id, r) { return id === 'truc_lam' ? r.int(2, 5) : id === 'tan_tich' ? r.int(4, 9) : r.int(3, 7); }
    /* Đạo cụ trang trí (tàn tích, bia đá) */
    this.props = [];
    for (let i = 0; i < 26; i++) {
      const pc = rng.int(430, 670);
      if (Math.abs(pc - DATA.SPAWN_COL) < 18) continue;
      this.props.push({ kind: rng.pick(['pillar', 'pillar', 'gate', 'stele', 'lantern']), x: pc * TILE, y: H[pc] * TILE, s: rng.range(0.8, 1.3) });
    }
    for (let i = 0; i < 14; i++) {
      const pc = rng.int(900, 1090);
      this.props.push({ kind: 'spire', x: pc * TILE, y: H[pc] * TILE, s: rng.range(0.7, 1.4) });
    }
  }

  groundY(x) { const c = M.clamp(Math.floor(x / TILE), 0, this.cols - 1); return this.heights[c] * TILE; }
}

/* ======================= Bí cảnh sinh ngẫu nhiên ======================= */
class Dungeon extends Level {
  constructor(id, seed) {
    const d = DATA.dungeons[id];
    const cols = 26 + d.sections * 40 + 70;
    super(cols, 34, 'dungeon');
    this.id = id;
    this.def = d;
    this.seed = seed >>> 0;
    let ok = false;
    for (let attempt = 0; attempt < 12 && !ok; attempt++) {
      this.tiles.fill(0);
      this.build(new RNG(this.seed + attempt * 7919));
      ok = this.validate();
      this.attempts = attempt + 1;
    }
    this.valid = ok;
  }

  build(rng) {
    const ROWS = this.rows, cols = this.cols;
    const floor = new Int16Array(cols).fill(24);
    const ceil = new Int16Array(cols).fill(12);
    const hazard = new Uint8Array(cols);
    const plats = [];
    this.spawns = [];
    this.chests = [];
    this.shrines = [];
    this.torches = [];
    const d = this.def;
    let c = 0, fl = 24;
    const flatRun = (n, h) => { for (let i = 0; i < n && c < cols; i++, c++) floor[c] = h; };
    /* Lối vào */
    flatRun(26, fl);
    this.entrance = { c: 5, x: 5 * TILE + TILE / 2, y: fl * TILE };
    this.shrines.push({ c: 14, x: 14 * TILE + TILE / 2, y: fl * TILE, lit: true });
    let lastFeature = '';
    const mons = d.mons;
    const ground = mons.filter((m) => !['flyer', 'diver', 'ghost'].includes(DATA.monsters[m].ai) && !DATA.monsters[m].fly);
    const air = mons.filter((m) => ['flyer', 'diver', 'ghost'].includes(DATA.monsters[m].ai) || DATA.monsters[m].fly);
    const addSpawn = (cc, rr, list) => {
      if (!list.length) list = mons;
      this.spawns.push({ type: rng.pick(list), c: cc, r: rr, elite: rng.chance(0.12) });
    };
    for (let s = 0; s < d.sections; s++) {
      const start = c;
      let feat = rng.weighted([{ f: 'hills', w: 3 }, { f: 'pit', w: 3 }, { f: 'platforms', w: lastFeature === 'platforms' ? 0 : 3 }, { f: 'stairs', w: 2 }, { f: 'arena', w: 2 }]).f;
      if (s === 0) feat = 'hills';
      lastFeature = feat;
      if (feat === 'hills') {
        while (c < start + 40) {
          fl = M.clamp(fl + rng.int(-3, 3), 17, 27);
          flatRun(Math.min(rng.int(4, 8), start + 40 - c), fl);
        }
        addSpawn(start + 12, floor[start + 12] - 1, ground);
        addSpawn(start + 30, floor[start + 30] - 1, ground);
      } else if (feat === 'pit') {
        flatRun(12, fl);
        const pw = rng.int(2, 4);
        for (let i = 0; i < pw; i++, c++) { floor[c] = ROWS - 2; hazard[c] = 1; }
        fl = M.clamp(fl + rng.int(-1, 1), 17, 27);
        flatRun(start + 40 - c, fl);
        addSpawn(start + 30, floor[start + 30] - 1, ground);
        addSpawn(start + 12 + Math.floor(pw / 2), fl - 6, air);
      } else if (feat === 'platforms') {
        flatRun(5, fl);
        const end = start + 34;
        let ph = fl - 1;
        let pc = c;
        while (pc < end) {
          const gap = rng.int(2, 3);
          for (let i = 0; i < gap && pc < end; i++, pc++) { floor[pc] = ROWS - 2; hazard[pc] = 1; }
          if (pc >= end) break;
          const pw = rng.int(3, 5);
          ph = M.clamp(ph + rng.int(-2, 2), 15, 24);
          plats.push({ c0: pc, c1: Math.min(end - 1, pc + pw - 1), r: ph });
          for (let i = 0; i < pw && pc < end; i++, pc++) { floor[pc] = ROWS - 2; hazard[pc] = 1; }
        }
        c = end;
        /* bờ đáp: không thấp hơn bệ cuối quá nhiều và không cao hơn 2 ô */
        fl = M.clamp(ph + rng.int(0, 2), 17, 26);
        if (plats.length) {
          const lp = plats[plats.length - 1];
          if (end - lp.c1 > 4) { plats.push({ c0: end - 3, c1: end - 1, r: M.clamp(fl - 1, 15, 24) }); }
        }
        flatRun(start + 40 - c, fl);
        addSpawn(start + 18, ph - 5, air);
        addSpawn(start + 37, floor[start + 37] - 1, ground);
      } else if (feat === 'stairs') {
        const steps = rng.int(3, 4);
        for (let i = 0; i < steps; i++) { fl = M.clamp(fl - 2, 15, 27); flatRun(3, fl); }
        const top = c;
        flatRun(8, fl);
        this.chestSpot(rng, top + 4, fl);
        while (c < start + 40) { fl = M.clamp(fl + 2, 15, 27); flatRun(Math.min(3, start + 40 - c), fl); }
        addSpawn(top + 4, floor[top + 4] - 1, mons.filter((m) => DATA.monsters[m].ai === 'shooter' || DATA.monsters[m].ai === 'turret').concat(ground));
      } else {
        fl = M.clamp(fl + rng.int(-2, 2), 18, 26);
        flatRun(40, fl);
        plats.push({ c0: start + 12, c1: start + 17, r: fl - 4 });
        plats.push({ c0: start + 24, c1: start + 29, r: fl - 5 });
        this.chestSpot(rng, start + 26, fl - 5);
        addSpawn(start + 10, fl - 1, ground);
        addSpawn(start + 20, fl - 1, ground);
        addSpawn(start + 32, fl - 7, air);
      }
      if (s === Math.floor(d.sections / 2)) {
        const sc = start + 3;
        this.shrines.push({ c: sc, x: sc * TILE + TILE / 2, y: floor[sc] * TILE, lit: false });
      }
    }
    /* Đấu trường thủ lĩnh */
    const arena0 = c + 4;
    fl = 24;
    flatRun(cols - c, fl);
    for (let i = arena0 - 4; i < cols; i++) { floor[i] = fl; ceil[i] = 5; }
    plats.push({ c0: arena0 + 12, c1: arena0 + 19, r: 19 });
    plats.push({ c0: arena0 + 42, c1: arena0 + 49, r: 19 });
    this.arena = { c0: arena0, c1: cols - 2, gateC: arena0 - 1, floorR: fl, x0: arena0 * TILE, x1: (cols - 2) * TILE, y: fl * TILE };
    this.bossSpawn = { x: (arena0 + 44) * TILE, y: fl * TILE };
    /* Trần hang */
    for (let i = 0; i < arena0 - 4; i++) {
      let lowest = floor[i];
      if (hazard[i]) lowest = 26;
      for (const p of plats) if (i >= p.c0 - 2 && i <= p.c1 + 2) lowest = Math.min(lowest, p.r);
      const n = Noise.value(i * 0.15, this.seed % 9973);
      ceil[i] = Math.max(2, Math.min(lowest - 9, Math.round(lowest - 11 - n * 4)));
    }
    /* Lấp ô */
    for (let i = 0; i < cols; i++) {
      for (let r = 0; r <= ceil[i]; r++) this.set(i, r, T_ROCK);
      for (let r = floor[i]; r < ROWS; r++) this.set(i, r, T_ROCK);
      if (hazard[i]) { this.set(i, ROWS - 3, T_HAZARD); this.set(i, ROWS - 2, T_ROCK); }
    }
    for (const p of plats) for (let i = p.c0; i <= p.c1; i++) { this.set(i, p.r, T_ROCK); this.set(i, p.r + 1, T_ROCK); }
    /* Tường cuối */
    for (let r = 0; r < ROWS; r++) { this.set(cols - 1, r, T_ROCK); this.set(cols - 2, r, r < fl ? T_AIR : T_ROCK); }
    this.floor = floor;
    this.ceil = ceil;
    this.plats = plats;
    this.hazardCols = hazard;
    /* Đuốc trang trí */
    for (let i = 8; i < cols - 4; i += 11 + (i % 5)) {
      if (hazard[i]) continue;
      this.torches.push({ x: i * TILE + TILE / 2, y: (floor[i] - 4) * TILE });
    }
    /* Dời điểm xuất hiện của quái nếu rơi vào trong đá */
    for (const sp of this.spawns) {
      const isAir = air.includes(sp.type);
      if (!this.solid(sp.c, sp.r) && !this.solid(sp.c, sp.r - 1) && (isAir || this.solid(sp.c, sp.r + 1))) continue;
      let best = -1;
      for (let r = ceil[sp.c] + 2; r < ROWS - 3; r++) {
        if (this.solid(sp.c, r) || this.solid(sp.c, r - 1) || this.hazard(sp.c, r)) continue;
        if (isAir) { if (best < 0 || Math.abs(r - (ceil[sp.c] + 4)) < Math.abs(best - (ceil[sp.c] + 4))) best = r; }
        else if (this.solid(sp.c, r + 1) && !this.hazard(sp.c, r + 1)) { best = r; break; }
      }
      sp.r = best;
    }
    this.spawns = this.spawns.filter((sp) => sp.r > 0);
    /* Rương phụ ở khu bằng phẳng */
    for (let tries = 0; this.chests.length < 3 && tries < 300; tries++) {
      const cc = rng.int(30, arena0 - 10);
      if (!hazard[cc] && Math.abs(floor[cc] - floor[cc + 1]) === 0) this.chestSpot(rng, cc, floor[cc]);
    }
  }

  chestSpot(rng, c, r) {
    if (this.chests.some((ch) => Math.abs(ch.c - c) < 6)) return;
    this.chests.push({ c, x: c * TILE + TILE / 2, y: r * TILE, open: false });
  }

  setGate(closed) {
    const g = this.arena.gateC;
    for (let r = 0; r < this.arena.floorR; r++) if (!this.solid(g, r) || this.get(g, r) === T_GATE) this.set(g, r, closed ? T_GATE : T_AIR);
  }

  /* Kiểm tra có đường đi từ lối vào tới đấu trường thủ lĩnh (mô phỏng khả năng nhảy của nhân vật) */
  standable(c, r) {
    return !this.solid(c, r) && !this.solid(c, r - 1) && this.solid(c, r + 1) && !this.hazard(c, r) && !this.hazard(c, r + 1);
  }
  validate() {
    const start = { c: this.entrance.c, r: this.floor[this.entrance.c] - 1 };
    if (!this.standable(start.c, start.r)) return false;
    const key = (c, r) => r * this.cols + c;
    const seen = new Uint8Array(this.cols * this.rows);
    const q = [start];
    seen[key(start.c, start.r)] = 1;
    while (q.length) {
      const p = q.shift();
      if (p.c >= this.arena.c0) { this.reach = seen; return true; }
      for (let dx = -6; dx <= 6; dx++) {
        for (let dy = -4; dy <= 8; dy++) {
          if (!dx && !dy) continue;
          const lim = dy <= -3 ? 3 : dy <= 0 ? 5 : 6;
          if (Math.abs(dx) > lim) continue;
          const nc = p.c + dx, nr = p.r + dy;
          if (nc < 0 || nc >= this.cols || nr < 1 || nr >= this.rows - 1) continue;
          if (seen[key(nc, nr)] || !this.standable(nc, nr)) continue;
          /* khoảng trống phía trên quỹ đạo */
          const topR = Math.min(p.r, nr) - (dy < 0 ? 2 : 1);
          let clear = true;
          const step = dx > 0 ? 1 : -1;
          for (let i = p.c; dx && i !== nc + step; i += step) {
            if (this.solid(i, topR) || this.solid(i, topR + 1)) { clear = false; break; }
          }
          if (!clear) continue;
          seen[key(nc, nr)] = 1;
          q.push({ c: nc, r: nr });
        }
      }
    }
    return false;
  }
}

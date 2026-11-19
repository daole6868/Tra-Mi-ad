'use strict';
/* Kết xuất: bầu trời, núi xa nhiều lớp, địa hình, thực thể, ánh sáng đêm, thời tiết */

const Renderer = {
  canvas: null, ctx: null, vw: 960, vh: 540, dpr: 1, k: 1,
  light: null, lctx: null,
  weather: [],
  stars: [],

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.light = document.createElement('canvas');
    this.lctx = this.light.getContext('2d');
    for (let i = 0; i < 90; i++) this.stars.push({ x: Math.random(), y: Math.random() * 0.6, r: Math.random() * 1.2 + 0.3, p: Math.random() * 6 });
    for (let i = 0; i < 90; i++) this.weather.push({ x: Math.random(), y: Math.random(), s: Math.random(), r: Math.random() * 6 });
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    const W = window.innerWidth, H = window.innerHeight;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.vh = H < 520 ? 405 : H < 760 ? 470 : 540;
    const aspect = M.clamp(W / H, 1.25, 2.4);
    this.vw = Math.round(this.vh * aspect);
    this.k = Math.min(W / this.vw, H / this.vh);
    const cw = Math.round(this.vw * this.k), ch = Math.round(this.vh * this.k);
    this.canvas.style.width = cw + 'px';
    this.canvas.style.height = ch + 'px';
    this.canvas.style.left = Math.round((W - cw) / 2) + 'px';
    this.canvas.style.top = Math.round((H - ch) / 2) + 'px';
    this.canvas.width = Math.round(cw * this.dpr);
    this.canvas.height = Math.round(ch * this.dpr);
    this.light.width = Math.ceil(this.vw / 2);
    this.light.height = Math.ceil(this.vh / 2);
    if (typeof Game !== 'undefined' && Game.player) Game.snapCamera();
  },

  /* ---------- Bảng màu bầu trời theo giờ ---------- */
  skyKeys: [
    [0, '#0b1020', '#1b2238'], [4.5, '#141a33', '#2a2f4d'], [5.5, '#3a3f63', '#e8a77a'], [7.5, '#8fb3c6', '#efe2c8'],
    [12, '#a9c9d4', '#f2ead6'], [16.5, '#b4c2c8', '#efdfc2'], [18.6, '#4f4a72', '#f0a06a'], [19.8, '#1a1f3d', '#3a3554'], [24, '#0b1020', '#1b2238'],
  ],
  skyAt(h) {
    const K = this.skyKeys;
    for (let i = 0; i < K.length - 1; i++) {
      if (h >= K[i][0] && h <= K[i + 1][0]) {
        const t = (h - K[i][0]) / (K[i + 1][0] - K[i][0]);
        return [M.mixColor(K[i][1], K[i + 1][1], t), M.mixColor(K[i][2], K[i + 1][2], t)];
      }
    }
    return [K[0][1], K[0][2]];
  },
  darkness(G) {
    if (G.level !== G.world) return 0.52;
    const h = G.hours();
    if (h >= 7 && h <= 17.5) return 0;
    if (h > 17.5 && h < 20.5) return M.smooth((h - 17.5) / 3) * 0.82;
    if (h >= 20.5 || h < 4) return 0.82;
    return (1 - M.smooth((h - 4) / 3)) * 0.82;
  },

  /* ======================= Vẽ khung hình ======================= */
  draw(G, t, dt) {
    const c = this.ctx;
    const s = this.k * this.dpr;
    c.setTransform(s, 0, 0, s, 0, 0);
    c.imageSmoothingEnabled = true;
    const vw = this.vw, vh = this.vh;
    if (!G.level) { c.fillStyle = '#0f1416'; c.fillRect(0, 0, vw, vh); return; }
    const cam = G.cam;
    const shx = cam.shake ? (Math.random() - 0.5) * cam.shake : 0, shy = cam.shake ? (Math.random() - 0.5) * cam.shake : 0;
    const cx = Math.round(cam.x + shx), cy = Math.round(cam.y + shy);
    const dungeon = G.level !== G.world;
    let skyTop, skyBot, biome = null;
    if (dungeon) { skyTop = G.dungeon.def.pal.sky1; skyBot = G.dungeon.def.pal.sky2; }
    else {
      biome = G.world.biomeAtX(G.player.cx);
      [skyTop, skyBot] = this.skyAt(G.hours());
      skyBot = M.mixColor(this.toHex(skyBot), biome.tint, 0.18);
      if (G.bloodMoon()) { skyTop = M.mixColor(this.toHex(skyTop), '#3a0508', 0.6); skyBot = M.mixColor(this.toHex(skyBot), '#7a1410', 0.5); }
    }
    const g = c.createLinearGradient(0, 0, 0, vh);
    g.addColorStop(0, skyTop); g.addColorStop(1, skyBot);
    c.fillStyle = g; c.fillRect(0, 0, vw, vh);
    if (dungeon) this.dungeonBack(c, G, cx, cy, t);
    else {
      const gsy = G.world.groundY(cx + vw / 2) - cy;
      this.anchor = this.anchor == null || Math.abs(this.anchor - gsy) > vh ? gsy : M.lerp(this.anchor, gsy, Math.min(1, dt * 2.5));
      this.overworldBack(c, G, cx, cy, t, skyBot, biome);
    }
    /* --------- Không gian thế giới --------- */
    c.save();
    c.translate(-cx, -cy);
    if (dungeon) this.dungeonTiles(c, G, cx, cy, t);
    else this.terrain(c, G, cx, cy, t);
    this.objects(c, G, cx, cy, t, dt);
    for (const m of G.mobs) if (m.x + m.w > cx - 60 && m.x < cx + vw + 60) Spr.mob(c, m, t);
    if (G.mode !== 'dead' || true) Spr.player(c, G.player, G, t);
    this.zones(c, G, t, false);
    this.particles(c, G, false);
    this.ghost(c, G, t);
    c.restore();
    /* --------- Ánh sáng & lớp phủ --------- */
    this.lighting(c, G, cx, cy, t);
    /* vật phát sáng & chữ vẽ sau lớp tối để luôn nổi bật */
    c.save();
    c.translate(-cx, -cy);
    this.projectiles(c, G, t);
    this.zones(c, G, t, true);
    this.particles(c, G, true);
    this.marker(c, G, t);
    this.texts(c, G);
    c.restore();
    if (!dungeon) this.weatherFx(c, G, biome, t, dt);
    if (G.flash > 0) { c.fillStyle = 'rgba(235,230,255,' + (G.flash * 4) + ')'; c.fillRect(0, 0, vw, vh); }
    const p = G.player;
    const low = p.hp / G.maxHp();
    const vg = c.createRadialGradient(vw / 2, vh / 2, vh * 0.35, vw / 2, vh / 2, vh * 0.95);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, low < 0.3 && G.mode === 'play' ? 'rgba(120,10,6,' + (0.55 + Math.sin(t * 6) * 0.1) + ')' : 'rgba(0,0,0,0.45)');
    c.fillStyle = vg; c.fillRect(0, 0, vw, vh);
  },

  toHex(rgb) {
    if (rgb[0] === '#') return rgb;
    const m = rgb.match(/\d+/g);
    return '#' + m.slice(0, 3).map((v) => (+v).toString(16).padStart(2, '0')).join('');
  },

  /* ---------- Nền thế giới: mặt trời/trăng, núi xa, rừng ---------- */
  overworldBack(c, G, cx, cy, t, skyBot, biome) {
    const vw = this.vw, vh = this.vh;
    const h = G.hours();
    const night = this.darkness(G);
    /* sao */
    if (night > 0.2) {
      for (const st of this.stars) {
        c.globalAlpha = night * (0.5 + Math.sin(t * 2 + st.p) * 0.3);
        c.fillStyle = '#f4f0e0';
        c.fillRect(st.x * vw, st.y * vh, st.r, st.r);
      }
      c.globalAlpha = 1;
    }
    /* mặt trời / mặt trăng */
    const dayT = (h - 5) / 15;
    if (dayT > 0 && dayT < 1) {
      const sx = vw * (0.1 + dayT * 0.8), sy = vh * (0.62 - Math.sin(dayT * Math.PI) * 0.5);
      Spr.glow(c, sx, sy, 70, '#ffe2a8', 0.5);
      Spr.circle(c, sx, sy, 16, '#f6dfb0');
    } else {
      const nt = ((h + 24 - 19.5) % 24) / 9.5;
      const mx = vw * (0.1 + nt * 0.8), my = vh * (0.6 - Math.sin(M.clamp(nt, 0, 1) * Math.PI) * 0.45);
      const blood = G.bloodMoon();
      Spr.glow(c, mx, my, 60, blood ? '#ff3b2f' : '#dfe6ff', 0.35);
      Spr.circle(c, mx, my, 13, blood ? '#c8402f' : '#e9ecf2');
      Spr.circle(c, mx + 4, my - 3, 10, M.rgba(blood ? '#7a1410' : '#c9cfdc', 0.4));
    }
    const ink = '#1b1a1e';
    const sb = this.toHex(skyBot);
    /* lớp núi xa */
    const A = this.anchor;
    this.ridge(c, cx * 0.08, 0, A - 120, 70, 0.0021, M.mixColor(sb, ink, 0.18), 11, 'peak');
    this.mist(c, A - 95, sb, 0.5);
    this.ridge(c, cx * 0.2, 0, A - 45, 60, 0.0042, M.mixColor(sb, ink, 0.36), 23, biome.id === 'loi_phong' ? 'spike' : 'peak');
    this.mist(c, A - 30, sb, 0.45);
    /* rừng gần theo vùng */
    this.forest(c, G, cx * 0.45, 0, A - 14, M.mixColor(sb, ink, 0.55), biome, t);
    this.mist(c, A + 4, sb, 0.3);
  },
  ridge(c, ox, oy, base, amp, freq, color, seed, style) {
    const vw = this.vw;
    c.beginPath();
    c.moveTo(0, this.vh);
    for (let x = 0; x <= vw + 8; x += 8) {
      const u = (x + ox) * freq;
      let y = Noise.fbm(u, seed, 4);
      if (style === 'spike') y = Math.pow(y, 2.2) * 1.7;
      else y = y * y * 1.4;
      c.lineTo(x, base - oy - y * amp * 2.2);
    }
    c.lineTo(vw, this.vh);
    c.closePath();
    c.fillStyle = color;
    c.fill();
  },
  mist(c, y, col, a) {
    const g = c.createLinearGradient(0, y - 40, 0, y + 30);
    g.addColorStop(0, M.rgba(col, 0));
    g.addColorStop(0.6, M.rgba(col, a));
    g.addColorStop(1, M.rgba(col, 0));
    c.fillStyle = g;
    c.fillRect(0, y - 40, this.vw, 70);
  },
  forest(c, G, ox, oy, base, color, biome, t) {
    const vw = this.vw, vh = this.vh;
    c.fillStyle = color;
    c.fillRect(0, base - oy + 20, vw, vh);
    const step = 26;
    const start = Math.floor(ox / step) - 1;
    for (let i = start; i < start + vw / step + 3; i++) {
      const x = i * step - ox;
      const hsh = Noise.hash(i, 77);
      const wx = (i * step) / 0.45;
      const b = G.world.biomeAtX(wx).id;
      const y = base - oy + 20 - Noise.fbm(i * 0.08, 5) * 30;
      c.beginPath();
      if (b === 'truc_lam') {
        for (let k = 0; k < 3; k++) { const bx = x + k * 7; c.moveTo(bx, y); c.lineTo(bx + 2 + Math.sin(t + i) * 2, y - 70 - hsh * 50); c.lineTo(bx + 3.5, y); }
      } else if (b === 'loi_phong' || b === 'xich_thach') {
        c.moveTo(x - 10, y); c.lineTo(x + hsh * 6, y - 30 - hsh * 50); c.lineTo(x + 14, y);
      } else if (b === 'tan_tich' && hsh > 0.7) {
        c.rect(x - 3, y - 50, 6, 50); c.rect(x - 9, y - 54, 18, 5);
      } else {
        const hh = 40 + hsh * 40;
        c.moveTo(x - 12, y); c.lineTo(x, y - hh); c.lineTo(x + 12, y);
        c.moveTo(x - 9, y - hh * 0.45); c.lineTo(x, y - hh * 1.15); c.lineTo(x + 9, y - hh * 0.45);
      }
      c.fill();
    }
  },

  /* ---------- Nền bí cảnh ---------- */
  dungeonBack(c, G, cx, cy, t) {
    const pal = G.dungeon.def.pal, vw = this.vw, vh = this.vh;
    for (let layer = 0; layer < 2; layer++) {
      const par = layer ? 0.45 : 0.2;
      const col = M.mixColor(pal.sky2, '#000000', layer ? 0.35 : 0.15);
      c.fillStyle = col;
      const step = layer ? 70 : 110;
      const start = Math.floor(cx * par / step) - 1;
      for (let i = start; i < start + vw / step + 3; i++) {
        const x = i * step - cx * par;
        const hsh = Noise.hash(i, 31 + layer);
        const w = 20 + hsh * 30;
        c.beginPath();
        c.moveTo(x - w, 0); c.lineTo(x + w, 0); c.lineTo(x + w * 0.2, vh * (0.25 + hsh * 0.25)); c.closePath(); c.fill();
        c.beginPath();
        c.moveTo(x - w * 1.2, vh); c.lineTo(x + w * 1.2, vh); c.lineTo(x + w * 0.1, vh * (0.55 - hsh * 0.2)); c.closePath(); c.fill();
        if (hsh > 0.6) Spr.glow(c, x, vh * (0.5 + hsh * 0.2), 30, pal.glow, 0.12 + Math.sin(t + i) * 0.05);
      }
    }
  },

  /* ---------- Địa hình thế giới ---------- */
  terrain(c, G, cx, cy, t) {
    const W = G.world, H = W.heights;
    const c0 = Math.max(0, Math.floor(cx / TILE) - 2), c1 = Math.min(W.cols - 1, Math.ceil((cx + this.vw) / TILE) + 2);
    const bottom = cy + this.vh + 20;
    /* thân đất */
    c.beginPath();
    c.moveTo(c0 * TILE, bottom);
    c.lineTo(c0 * TILE, H[c0] * TILE);
    for (let i = c0; i < c1; i++) {
      const mx = (i + 1) * TILE, my = ((H[i] + H[i + 1]) / 2) * TILE;
      c.quadraticCurveTo(i * TILE + TILE / 2, H[i] * TILE, mx, my);
    }
    c.lineTo(c1 * TILE + TILE, H[c1] * TILE);
    c.lineTo(c1 * TILE + TILE, bottom);
    c.closePath();
    const b = W.biomeAt((c0 + c1) / 2);
    const gr = c.createLinearGradient(0, cy + this.vh * 0.4, 0, bottom);
    gr.addColorStop(0, M.mixColor(b.ground, INK, 0.35));
    gr.addColorStop(1, M.mixColor(b.dark, INK, 0.6));
    c.fillStyle = gr;
    c.fill();
    /* viền mặt đất theo vùng */
    let i = c0;
    while (i < c1) {
      const bb = W.biomeAt(i);
      let j = i;
      while (j < c1 && W.biomeAt(j) === bb) j++;
      c.beginPath();
      c.moveTo(i * TILE, H[i] * TILE);
      for (let k = i; k < j; k++) c.quadraticCurveTo(k * TILE + TILE / 2, H[k] * TILE, (k + 1) * TILE, ((H[k] + H[Math.min(W.cols - 1, k + 1)]) / 2) * TILE);
      c.strokeStyle = bb.top; c.lineWidth = bb.id === 'han_dam' ? 6 : 3.5; c.lineCap = 'round';
      c.stroke();
      i = j;
    }
    /* cỏ */
    for (let k = c0; k < c1; k++) {
      const bb = W.biomeAt(k);
      if (bb.id !== 'truc_lam' && bb.id !== 'tan_tich') continue;
      const hsh = Noise.hash(k, 3);
      if (hsh < 0.45) continue;
      const x = k * TILE + hsh * 12, y = H[k] * TILE + 1;
      const sw = Math.sin(t * 2 + k) * 1.5;
      c.strokeStyle = M.mixColor(bb.top, INK, 0.3); c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2 + sw, y - 6 - hsh * 4); c.moveTo(x + 2, y); c.lineTo(x + 3 + sw, y - 5 - hsh * 3); c.stroke();
    }
    /* hồ băng */
    const [l0, l1] = W.lake;
    if (l1 >= c0 && l0 <= c1) {
      const ly = H[l0] * TILE;
      c.fillStyle = 'rgba(190,228,245,0.55)';
      c.fillRect(l0 * TILE, ly - 2, (l1 - l0 + 1) * TILE, 5);
      for (let k = l0; k <= l1; k += 3) { c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(k * TILE + ((t * 20 + k * 7) % 30), ly - 1, 6, 1); }
    }
    /* tường xây */
    this.builtWalls(c, W, c0, c1);
  },
  builtWalls(c, L, c0, c1) {
    for (let i = c0; i <= c1; i++) {
      for (let r = 0; r < L.rows; r++) {
        const tt = L.get(i, r);
        if (tt !== T_WOOD && tt !== T_STONE) continue;
        const x = i * TILE, y = r * TILE;
        if (tt === T_WOOD) {
          c.fillStyle = '#5a3e26'; c.fillRect(x + 1, y, 14, 16);
          c.fillStyle = '#6e4e30'; c.fillRect(x + 2, y + 1, 5, 14); c.fillRect(x + 9, y + 1, 5, 14);
          if (L.get(i, r - 1) === T_AIR) Spr.poly(c, [x + 1, y, x + 4.5, y - 4, x + 8, y, x + 11.5, y - 4, x + 15, y], '#5a3e26');
        } else {
          c.fillStyle = '#5c5a54'; c.fillRect(x, y, 16, 16);
          c.strokeStyle = '#3a3934'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, 15, 7.5); c.strokeRect(x + 4.5, y + 8, 7, 7.5);
        }
        const hp = L.wallHp.get(i * 1000 + r);
        if (hp != null) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x, y, 16 * (1 - hp / DATA.walls[tt].hp), 3); }
      }
    }
  },

  /* ---------- Ô bí cảnh ---------- */
  dungeonTiles(c, G, cx, cy, t) {
    const L = G.level, pal = L.def.pal;
    const c0 = Math.max(0, Math.floor(cx / TILE) - 1), c1 = Math.min(L.cols - 1, Math.ceil((cx + this.vw) / TILE) + 1);
    const r0 = Math.max(0, Math.floor(cy / TILE) - 1), r1 = Math.min(L.rows - 1, Math.ceil((cy + this.vh) / TILE) + 1);
    for (let i = c0; i <= c1; i++) {
      for (let r = r0; r <= r1; r++) {
        const tt = L.get(i, r);
        const x = i * TILE, y = r * TILE;
        if (tt === T_ROCK) {
          c.fillStyle = pal.rock; c.fillRect(x, y, TILE + 0.5, TILE + 0.5);
          const hs = Noise.hash(i * 131 + r, 9);
          if (hs > 0.8) { c.fillStyle = M.mixColor(pal.rock, '#000000', 0.25); c.fillRect(x + hs * 8, y + 4, 5, 3); }
          if (!L.solid(i, r - 1)) {
            c.fillStyle = pal.rockTop; c.fillRect(x, y, TILE + 0.5, 3);
            if (hs > 0.55) { c.fillStyle = M.rgba(pal.accent, 0.7); c.fillRect(x + hs * 10, y - 3, 2, 3); }
          }
          if (!L.solid(i, r + 1) && L.get(i, r + 1) !== T_HAZARD && hs > 0.6) Spr.poly(c, [x + 4, y + 16, x + 8, y + 16 + hs * 10, x + 12, y + 16], pal.rock);
        } else if (tt === T_HAZARD) {
          const wv = Math.sin(t * 3 + i * 0.8) * 2;
          c.fillStyle = M.mixColor(pal.hazard, '#000000', 0.3);
          c.fillRect(x, y + 4 + wv, TILE + 0.5, TILE - 4 - wv);
          c.fillStyle = pal.hazard; c.fillRect(x, y + 3 + wv, TILE + 0.5, 3);
          if (Noise.hash(i, Math.floor(t * 2)) > 0.92) G.particle(x + 8, y + 2, 0, -40, 0.7, 'ember', pal.glow, 2);
        } else if (tt === T_GATE) {
          c.fillStyle = M.rgba(pal.glow, 0.25 + Math.sin(t * 8 + r) * 0.1); c.fillRect(x + 4, y, 8, TILE);
          c.fillStyle = pal.glow; c.fillRect(x + 7, y, 2, TILE);
        }
      }
    }
  },

  /* ---------- Vật thể trong thế giới ---------- */
  objects(c, G, cx, cy, t, dt) {
    const inView = (x, pad = 120) => x > cx - pad && x < cx + this.vw + pad;
    if (G.level === G.world) {
      const W = G.world;
      for (const pr of W.props) if (inView(pr.x)) this.prop(c, pr, W);
      Spr.array(c, W.array.x, W.array.y, G.placed, t, G.won);
      for (const pt of W.portals) if (inView(pt.x)) Spr.portal(c, pt.x, pt.y, pt.id, G.player.realm >= DATA.dungeons[pt.id].req, t, G.cleared[pt.id]);
      for (const r of W.resources) {
        if (!inView(r.x)) continue;
        if (r.shake > 0) r.shake -= dt;
        Spr.resource(c, r, W.biomeAt(r.c), t);
      }
      for (const s of G.structures) if (inView(s.x)) Spr.structure(c, s, t, G);
      for (const b of G.bags) if (inView(b.x)) {
        Spr.glow(c, b.x, b.y - 6, 22, '#ffd27a', 0.4 + Math.sin(t * 4) * 0.15);
        Spr.ellipse(c, b.x, b.y - 5, 6, 5, '#7a5a3a');
        Spr.line(c, b.x - 3, b.y - 10, b.x + 3, b.y - 10, '#c9a24f', 1.5);
      }
    } else {
      const D = G.dungeon, pal = D.def.pal;
      for (const tc of D.torches) if (inView(tc.x)) {
        Spr.line(c, tc.x, tc.y + 10, tc.x, tc.y, '#3a2a1a', 2);
        Spr.glow(c, tc.x, tc.y - 4, 26, pal.glow, 0.5);
        Spr.ellipse(c, tc.x, tc.y - 4, 2.5, 4 + Math.sin(t * 18 + tc.x) * 1, pal.glow);
      }
      Spr.portal(c, D.entrance.x, D.entrance.y, D.id, true, t, false);
      if (D.exitPortal) Spr.portal(c, D.exitPortal.x, D.exitPortal.y, D.id, true, t * 1.5, true);
      for (const sh of D.shrines) if (inView(sh.x)) {
        Spr.poly(c, [sh.x - 6, sh.y, sh.x - 4, sh.y - 18, sh.x + 4, sh.y - 18, sh.x + 6, sh.y], '#2b2722');
        Spr.poly(c, [sh.x - 8, sh.y - 18, sh.x + 8, sh.y - 18, sh.x, sh.y - 26], '#2b2722');
        if (sh.lit) { Spr.glow(c, sh.x, sh.y - 13, 26, '#ffd27a', 0.6); Spr.circle(c, sh.x, sh.y - 13, 2.5, '#ffe9a8'); }
        else Spr.circle(c, sh.x, sh.y - 13, 2, '#5a5248');
      }
      for (const ch of D.chests) if (inView(ch.x)) {
        c.fillStyle = ch.open ? '#3a2a1a' : '#6b4a2a';
        c.fillRect(ch.x - 9, ch.y - 12, 18, 12);
        c.fillStyle = '#c9a24f'; c.fillRect(ch.x - 9, ch.y - 9, 18, 2); c.fillRect(ch.x - 1.5, ch.y - 9, 3, 5);
        if (!ch.open) Spr.glow(c, ch.x, ch.y - 8, 20, '#ffd27a', 0.25 + Math.sin(t * 3) * 0.1);
      }
    }
    /* vật phẩm rơi */
    c.font = '12px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    c.textAlign = 'center';
    for (const d of G.drops) {
      if (!inView(d.x)) continue;
      const tier = DATA.items[d.id].tier;
      const bob = d.onGround ? Math.sin(t * 4 + d.x) * 1.5 : 0;
      Spr.glow(c, d.x + 5, d.y + 5 + bob, 12, tier >= 3 ? '#ffd27a' : '#f4ead2', tier >= 3 ? 0.6 : 0.3);
      c.fillText(DATA.items[d.id].icon, d.x + 5, d.y + 10 + bob);
    }
  },
  marker(c, G, t) {
    c.textAlign = 'center';
    if (G.interactTarget && G.mode === 'play') {
      const p = G.player;
      c.fillStyle = 'rgba(239,231,210,0.9)';
      c.font = 'bold 10px "Be Vietnam Pro",sans-serif';
      const bx = p.cx, by = p.y - 22 + Math.sin(t * 5) * 2;
      c.beginPath(); c.arc(bx, by, 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = INK; c.fillText(Input.usedTouch ? '!' : 'E', bx, by + 3.5);
    }
  },
  prop(c, pr, W) {
    const col = M.mixColor(W.biomeAtX(pr.x).ground, INK, 0.55);
    c.save();
    c.translate(pr.x, pr.y);
    c.scale(pr.s, pr.s);
    c.fillStyle = col;
    if (pr.kind === 'pillar') { c.fillRect(-5, -60, 10, 60); c.fillRect(-8, -64, 16, 5); c.fillRect(-7, -6, 14, 6); }
    else if (pr.kind === 'gate') { c.fillRect(-30, -70, 6, 70); c.fillRect(24, -70, 6, 70); c.fillRect(-38, -78, 76, 7); c.fillRect(-32, -64, 64, 4); }
    else if (pr.kind === 'stele') { c.fillRect(-7, -34, 14, 34); c.beginPath(); c.arc(0, -34, 7, Math.PI, 0); c.fill(); }
    else if (pr.kind === 'lantern') { c.fillRect(-2, -26, 4, 26); c.fillRect(-7, -32, 14, 8); c.fillRect(-9, -35, 18, 3); }
    else if (pr.kind === 'spire') { c.beginPath(); c.moveTo(-10, 0); c.lineTo(-2, -90); c.lineTo(3, -70); c.lineTo(10, 0); c.fill(); }
    c.restore();
  },

  /* ---------- Đạn, vùng nguy hiểm, hiệu ứng ---------- */
  projectiles(c, G, t) {
    for (const pr of G.projs) {
      if (pr.delay > 0) continue;
      const col = G.projColor(pr.kind);
      if (pr.kind === 'wave') {
        c.save(); c.translate(pr.x, pr.y); c.scale(Math.sign(pr.vx) || 1, 1);
        c.beginPath(); c.arc(-8, 0, 16, -1.1, 1.1); c.strokeStyle = 'rgba(233,246,255,0.85)'; c.lineWidth = 4; c.stroke();
        c.restore();
      } else if (pr.kind === 'quake' || pr.kind === 'shock' || pr.kind === 'frost') {
        for (let i = 0; i < 3; i++) Spr.poly(c, [pr.x - 8 + i * 6 * Math.sign(pr.vx), pr.y + 12, pr.x - 4 + i * 6 * Math.sign(pr.vx), pr.y - 6 + i * 3, pr.x + i * 6 * Math.sign(pr.vx), pr.y + 12], M.rgba(col, 0.85));
        Spr.glow(c, pr.x, pr.y + 4, 20, col, 0.4);
      } else if (pr.kind === 'bolt') {
        Spr.glow(c, pr.x, pr.y, 14, col, 0.7);
        Spr.line(c, pr.x - pr.vx * 0.03, pr.y - pr.vy * 0.03, pr.x, pr.y, '#ffffff', 2.5);
      } else if (pr.kind === 'ice') {
        c.save(); c.translate(pr.x, pr.y); c.rotate(Math.atan2(pr.vy, pr.vx));
        Spr.poly(c, [8, 0, 0, -3, -6, 0, 0, 3], '#e9fbff'); c.restore();
        Spr.glow(c, pr.x, pr.y, 12, col, 0.45);
      } else {
        Spr.glow(c, pr.x, pr.y, pr.r * 3, col, 0.6);
        Spr.circle(c, pr.x, pr.y, pr.r * 0.7, pr.kind === 'seed' ? '#3f6b2a' : '#fff4d8');
      }
    }
  },
  zones(c, G, t, emissive) {
    for (const z of G.zones) {
      const warm = z.t < z.delay;
      if (emissive !== (z.kind === 'bolt')) continue;
      if (warm) {
        const k = z.t / z.delay;
        if (z.kind === 'line') { c.fillStyle = 'rgba(255,80,60,' + (0.12 + k * 0.2) + ')'; c.fillRect(z.x, z.y, z.w, z.h); continue; }
        if (z.kind === 'bolt') {
          c.fillStyle = (z.trib ? 'rgba(190,160,255,' : 'rgba(255,70,60,') + (0.08 + k * 0.2) + ')';
          c.fillRect(z.x, z.y, z.w, z.h);
          c.fillStyle = z.trib ? 'rgba(220,200,255,0.8)' : 'rgba(255,90,70,0.8)';
          c.fillRect(z.x + z.w / 2 - 1, z.y + z.h - 6, 2, 6);
          Spr.circle(c, z.x + z.w / 2, z.y + z.h - 3, 5 + k * 10, 'rgba(255,255,255,' + (0.1 + k * 0.2) + ')');
        } else {
          c.fillStyle = 'rgba(255,70,60,' + (0.12 + k * 0.25) + ')';
          c.fillRect(z.x, z.y + z.h - 6, z.w, 6);
        }
        continue;
      }
      if (z.kind === 'bolt') {
        c.beginPath();
        let x = z.x + z.w / 2, y = z.y;
        c.moveTo(x, y);
        while (y < z.y + z.h) { y += 18; x = z.x + z.w / 2 + (Math.random() - 0.5) * z.w * 0.7; c.lineTo(x, Math.min(y, z.y + z.h)); }
        c.strokeStyle = 'rgba(225,214,255,0.95)'; c.lineWidth = 5; c.stroke();
        c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.stroke();
        Spr.glow(c, z.x + z.w / 2, z.y + z.h, 60, '#c7b8ff', 0.6);
      } else if (z.kind === 'root') {
        const k = M.clamp((z.t - z.delay) / 0.12, 0, 1);
        for (let i = 0; i < 3; i++) Spr.poly(c, [z.x + 4 + i * 10, z.y + z.h, z.x + 9 + i * 10, z.y + z.h - z.h * k * (0.7 + i * 0.15), z.x + 14 + i * 10, z.y + z.h], '#3a2a1a');
      }
    }
  },
  particles(c, G, emissive) {
    const EM = { ring: 1, qi: 1, ember: 1, spark: 1 };
    for (const q of G.parts) {
      if (!!EM[q.kind] !== emissive) continue;
      const a = Math.max(0, q.life / q.max);
      if (q.kind === 'ring') {
        c.beginPath(); c.arc(q.x, q.y, q.size * (1.6 - a), 0, Math.PI * 2);
        c.strokeStyle = M.rgba(q.color, a); c.lineWidth = 2; c.stroke();
      } else if (q.kind === 'ghost') {
        c.fillStyle = M.rgba('#e9e2cf', a * 0.25); c.fillRect(q.x - 6, q.y - 14, 12, 28);
      } else if (q.kind === 'qi' || q.kind === 'ember' || q.kind === 'spark') {
        Spr.glow(c, q.x, q.y, q.size * 3, q.color, a * 0.6);
        c.fillStyle = M.rgba(q.color, a); c.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
      } else if (q.kind === 'smoke' || q.kind === 'dust') {
        Spr.circle(c, q.x, q.y, q.size * (1.5 - a * 0.5), M.rgba(q.color, a * 0.35));
      } else {
        c.fillStyle = M.rgba(q.color, Math.min(1, a * 1.4));
        c.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
      }
    }
  },
  texts(c, G) {
    c.textAlign = 'center';
    for (const tx of G.texts) {
      const a = 1 - tx.t / 0.9;
      c.font = (tx.big ? 'bold 16px ' : 'bold 12px ') + '"Be Vietnam Pro",sans-serif';
      c.lineWidth = 3; c.strokeStyle = 'rgba(10,9,8,' + a + ')';
      c.strokeText(tx.s, tx.x, tx.y);
      c.fillStyle = M.rgba(tx.color.length === 7 ? tx.color : '#ffffff', a);
      c.fillText(tx.s, tx.x, tx.y);
    }
  },
  ghost(c, G, t) {
    const pl = G.placement();
    if (!pl) return;
    c.globalAlpha = 0.5 + Math.sin(t * 6) * 0.1;
    if (pl.wall) {
      c.fillStyle = pl.ok ? 'rgba(127,208,138,0.45)' : 'rgba(214,90,67,0.45)';
      c.fillRect(pl.x, pl.y, pl.w, pl.h);
    } else {
      Spr.structure(c, { type: pl.type, x: pl.x, y: pl.y, fuel: 0 }, t, G);
      c.strokeStyle = pl.ok ? '#7fd08a' : '#d65a43'; c.lineWidth = 1.5;
      c.strokeRect(pl.x - pl.w / 2, pl.y - pl.h, pl.w, pl.h);
    }
    c.globalAlpha = 1;
  },

  /* ---------- Ánh sáng ---------- */
  lights(G, t) {
    const L = [];
    const p = G.player;
    const torch = G.lightRadius();
    L.push({ x: p.cx, y: p.cy, r: 70 + p.realm * 3 + torch, f: torch ? 0.06 : 0 });
    if (G.level === G.world) {
      for (const s of G.structures) {
        const S = DATA.structures[s.type];
        if (!S.light || (S.fuel && s.fuel <= 0)) continue;
        L.push({ x: s.x, y: s.y - 12, r: S.light, f: s.type === 'lua_trai' ? 0.08 : 0.02 });
      }
      for (const pt of G.world.portals) L.push({ x: pt.x, y: pt.y - 30, r: 90, f: 0 });
      L.push({ x: G.world.array.x, y: G.world.array.y - 10, r: 80 + G.placed.length * 30, f: 0 });
      for (const b of G.bags) L.push({ x: b.x, y: b.y, r: 40, f: 0 });
    } else {
      const D = G.dungeon;
      for (const tc of D.torches) L.push({ x: tc.x, y: tc.y, r: 110, f: 0.05 });
      for (const sh of D.shrines) if (sh.lit) L.push({ x: sh.x, y: sh.y - 12, r: 90, f: 0.03 });
      L.push({ x: D.entrance.x, y: D.entrance.y - 30, r: 100, f: 0 });
      if (D.exitPortal) L.push({ x: D.exitPortal.x, y: D.exitPortal.y - 30, r: 120, f: 0 });
      const cam = G.cam;
      for (let i = Math.floor(cam.x / TILE); i < (cam.x + this.vw) / TILE; i += 3) if (D.hazardCols[i]) L.push({ x: i * TILE + 8, y: (D.rows - 3) * TILE, r: 60, f: 0.04 });
      for (const m of G.mobs) if (m.alive && (m.def.look === 'wisp' || m.def.look === 'dragon' || m.def.look === 'phoenix' || m.def.look === 'crystal')) L.push({ x: m.cx, y: m.cy, r: m.boss ? 160 : 70, f: 0.04 });
    }
    for (const pr of G.projs) if (pr.kind === 'fireball' || pr.kind === 'fire' || pr.kind === 'bolt') L.push({ x: pr.x, y: pr.y, r: 45, f: 0.1 });
    for (const z of G.zones) if (z.kind === 'bolt' && z.t >= z.delay) L.push({ x: z.x + z.w / 2, y: z.y + z.h, r: 260, f: 0 });
    return L;
  },
  lighting(c, G, cx, cy, t) {
    const dark = this.darkness(G);
    if (dark <= 0.01) return;
    const l = this.lctx, w = this.light.width, h = this.light.height;
    l.globalCompositeOperation = 'source-over';
    l.clearRect(0, 0, w, h);
    const blood = G.level === G.world && G.bloodMoon();
    l.fillStyle = blood ? 'rgba(30,4,6,' + dark + ')' : G.level === G.world ? 'rgba(6,9,22,' + dark + ')' : 'rgba(4,4,8,' + dark + ')';
    l.fillRect(0, 0, w, h);
    l.globalCompositeOperation = 'destination-out';
    for (const L of this.lights(G, t)) {
      const x = (L.x - cx) / 2, y = (L.y - cy) / 2;
      const r = (L.r * (1 + (L.f ? Math.sin(t * 13 + L.x) * L.f : 0))) / 2;
      if (x < -r || x > w + r || y < -r || y > h + r) continue;
      const g = l.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.55, 'rgba(0,0,0,0.75)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      l.fillStyle = g;
      l.fillRect(x - r, y - r, r * 2, r * 2);
    }
    c.drawImage(this.light, 0, 0, this.vw, this.vh);
  },

  /* ---------- Thời tiết ---------- */
  weatherFx(c, G, biome, t, dt) {
    const kind = biome.weather;
    if (kind === 'none') return;
    const vw = this.vw, vh = this.vh;
    for (const w of this.weather) {
      if (kind === 'snow') { w.y += dt * (0.05 + w.s * 0.06); w.x += dt * 0.02 * Math.sin(t + w.r); }
      else if (kind === 'leaves') { w.y += dt * (0.04 + w.s * 0.04); w.x -= dt * (0.03 + w.s * 0.03); }
      else if (kind === 'embers') { w.y -= dt * (0.03 + w.s * 0.05); w.x += dt * 0.01 * Math.sin(t * 2 + w.r); }
      else if (kind === 'storm') { w.y += dt * (0.9 + w.s * 0.6); w.x -= dt * 0.25; }
      if (w.y > 1.05) { w.y = -0.05; w.x = Math.random(); }
      if (w.y < -0.05) { w.y = 1.05; w.x = Math.random(); }
      if (w.x < -0.05) w.x = 1.05; if (w.x > 1.05) w.x = -0.05;
      const x = w.x * vw, y = w.y * vh;
      if (kind === 'snow') Spr.circle(c, x, y, 1 + w.s * 1.6, 'rgba(255,255,255,0.8)');
      else if (kind === 'leaves') Spr.ellipse(c, x, y, 3, 1.4, M.rgba(w.s > 0.5 ? '#9fc77a' : '#d9b85a', 0.75), t * 2 + w.r);
      else if (kind === 'embers') { c.fillStyle = 'rgba(255,140,60,' + (0.4 + w.s * 0.5) + ')'; c.fillRect(x, y, 2, 2); }
      else if (kind === 'storm') Spr.line(c, x, y, x - 4, y + 12, 'rgba(200,205,235,0.35)', 1);
    }
    if (kind === 'storm' && Math.random() < dt * 0.15) G.flash = 0.15;
  },
};

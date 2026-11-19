'use strict';
/* Hình vẽ thủ tục: nhân vật, yêu thú, tài nguyên, công trình — phong cách bóng mực thủy mặc */

const INK = '#15130f';
const PAPER = '#efe7d2';

const Spr = {
  /* Tiện ích vẽ */
  circle(c, x, y, r, fill) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); },
  ellipse(c, x, y, rx, ry, fill, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); },
  poly(c, pts, fill, stroke, lw) {
    c.beginPath();
    c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  },
  line(c, x1, y1, x2, y2, col, w) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.stroke(); },
  glow(c, x, y, r, col, a = 0.5) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, M.rgba(col, a)); g.addColorStop(1, M.rgba(col, 0));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  },

  /* ======================= Nhân vật ======================= */
  scarf: null,
  player(c, p, G, t) {
    const x = p.cx, by = p.bottom + (p.stepOffset || 0);
    const blink = p.invT > 0 && Math.floor(t * 20) % 2 === 0;
    if (blink) c.globalAlpha = 0.45;
    const body = p.hurtT > 0 ? '#7a1f17' : INK;
    const rc = DATA.realmColor(p.realm);
    const run = p.onGround && Math.abs(p.vx) > 20;
    const sw = run ? Math.sin(p.anim * 1.1) : 0;
    const air = !p.onGround;
    c.save();
    c.translate(x, by);
    if (p.flying) {
      Spr.line(c, -16, 2, 18, 0, '#d9e6f0', 3);
      Spr.glow(c, 0, 0, 24, '#bfe4ff', 0.4);
    }
    if (p.med) {
      /* tư thế tọa thiền */
      Spr.glow(c, 0, -12, 34 + Math.sin(t * 3) * 4, rc, 0.35);
      Spr.ellipse(c, 0, -3, 11, 4, body);
      Spr.poly(c, [-7, -4, 7, -4, 5, -17, -5, -17], body);
      Spr.circle(c, 0, -21, 4.5, body);
      Spr.circle(c, 0, -27, 2.2, body);
      Spr.circle(c, 0, -10, 2.2, rc);
      c.restore();
      c.globalAlpha = 1;
      return;
    }
    c.scale(p.face, 1);
    /* khăn choàng (màu theo cảnh giới) */
    const wind = -Math.max(30, Math.abs(p.vx)) / 60;
    c.beginPath();
    c.moveTo(-1, -21);
    for (let i = 1; i <= 5; i++) {
      const k = i / 5;
      c.lineTo(wind * 14 * k * 1.6 - 2 * k, -21 + k * 4 + Math.sin(t * 9 - i * 0.9) * 2.4 * k);
    }
    c.strokeStyle = rc; c.lineWidth = 2.4; c.lineCap = 'round'; c.stroke();
    /* chân */
    if (air) {
      Spr.line(c, -2, -10, -5, -3, body, 3.4);
      Spr.line(c, 2, -10, 4, -2, body, 3.4);
    } else {
      Spr.line(c, -1, -10, -1 + sw * 5, 0, body, 3.4);
      Spr.line(c, 1, -10, 1 - sw * 5, 0, body, 3.4);
    }
    /* đạo bào */
    const flare = run ? 2 + Math.abs(sw) * 2 : air ? 4 : 1;
    Spr.poly(c, [-4, -22, 4, -22, 6 + flare * 0.4, -8, -6 - flare, -7], body);
    Spr.line(c, -3.5, -14, 4.5, -14, rc, 1.6);
    /* đầu & tóc */
    Spr.circle(c, 0.5, -25.5, 4.4, body);
    Spr.circle(c, -1.5, -30.5, 2.2, body);
    c.beginPath(); c.moveTo(-3, -27); c.quadraticCurveTo(-8 + wind * 3, -22, -7 + wind * 4, -16); c.strokeStyle = body; c.lineWidth = 1.8; c.stroke();
    Spr.circle(c, 2.6, -26, 0.9, PAPER);
    /* vũ khí & đòn chém */
    Spr.held(c, p, G, t, body);
    c.restore();
    c.globalAlpha = 1;
  },

  held(c, p, G, t, body) {
    const d = G.heldDef();
    const atk = p.atkT > 0;
    const prog = atk ? M.clamp(p.atkElapsed / 0.18, 0, 1) : 0;
    let ang;
    if (atk) ang = p.combo === 2 ? M.lerp(1.2, -1.6, prog) : M.lerp(-1.9, 1.1, prog);
    else ang = 0.9 + Math.sin(t * 2) * 0.05;
    const sx = 2, sy = -17;
    c.save();
    c.translate(sx, sy);
    Spr.line(c, 0, 0, Math.cos(ang) * 6, Math.sin(ang) * 6, body, 2.6);
    c.translate(Math.cos(ang) * 6, Math.sin(ang) * 6);
    c.rotate(ang);
    if (d && (d.cat === 'weapon')) {
      const col = { moc: '#9be36b', hoa: '#ff9a4c', thuy: '#bfeaff', loi: '#d9ccff' }[d.el] || (d.tier >= 1 ? '#d8dde2' : '#b48a5a');
      Spr.line(c, -2, 0, 20, 0, col, 2.2);
      Spr.line(c, 0, -3, 0, 3, '#c9a24f', 2);
      if (d.el) Spr.glow(c, 12, 0, 12, col, 0.35);
    } else if (d && d.cat === 'tool') {
      Spr.line(c, -2, 0, 14, 0, '#7a5a3a', 2);
      if (d.axe) Spr.poly(c, [11, -1, 16, -5, 17, 2, 12, 2], d.tier ? '#b8bec4' : '#8f8a80');
      else Spr.poly(c, [14, -6, 16, -6, 15, 6, 13, 6], d.tier ? '#b8bec4' : '#8f8a80');
    } else if (d && d.cat === 'light') {
      Spr.line(c, -2, 0, 10, 0, '#6a4a2a', 2.4);
      c.rotate(-ang);
      const f = 1 + Math.sin(t * 20) * 0.15;
      Spr.glow(c, 10, -4, 16 * f, '#ffb347', 0.6);
      Spr.ellipse(c, 10, -5, 2.6, 4.5 * f, '#ffd27a');
    } else if (d) {
      c.rotate(-ang);
      c.font = '10px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
      c.textAlign = 'center';
      c.fillText(d.icon, 3, 4);
    }
    c.restore();
    if (atk && prog > 0.05 && prog < 1) {
      /* vệt chém mực trắng */
      const a0 = p.combo === 2 ? 1.2 : -1.9, a1 = M.lerp(a0, p.combo === 2 ? -1.6 : 1.1, prog);
      c.save();
      c.translate(sx, sy);
      c.beginPath();
      c.arc(0, 0, p.combo === 3 ? 30 : 24, Math.min(a0, a1), Math.max(a0, a1));
      c.strokeStyle = p.combo === 3 ? 'rgba(255,236,190,0.75)' : 'rgba(244,236,214,0.6)';
      c.lineWidth = p.combo === 3 ? 7 : 5;
      c.lineCap = 'round';
      c.stroke();
      c.restore();
    }
  },

  /* ======================= Yêu thú ======================= */
  mob(c, m, t) {
    const def = m.def;
    const flash = m.flash > 0;
    const col = flash ? '#f4ead2' : M.mixColor(def.color, INK, m.boss ? 0.45 : 0.55);
    const acc = def.color;
    const a = m.anim;
    c.save();
    if (!m.alive) { c.globalAlpha = Math.max(0, m.dying / 0.5); }
    c.translate(m.cx, m.bottom);
    if (m.elite) Spr.glow(c, 0, -m.h / 2, Math.max(m.w, m.h), '#ffcf6b', 0.25);
    if (m.windup > 0 || m.state === 'wind' || m.state === 'tele') Spr.glow(c, 0, -m.h / 2, Math.max(m.w, m.h) * 0.9, '#ff3b2f', 0.35 + Math.sin(t * 30) * 0.15);
    c.scale(m.face >= 0 ? 1 : -1, 1);
    if (m.elite) c.scale(1, 1);
    const fn = Spr.looks[def.look] || Spr.looks.blob;
    fn(c, m, col, acc, a, t);
    c.restore();
    if (!m.boss && m.alive && m.hp < m.maxHp) {
      const w = Math.max(20, m.w);
      c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(m.cx - w / 2, m.y - 8, w, 3);
      c.fillStyle = m.elite ? '#ffcf6b' : '#c8402f'; c.fillRect(m.cx - w / 2, m.y - 8, w * Math.max(0, m.hp / m.maxHp), 3);
    }
  },
  eye(c, x, y, col = '#ff4b3a', r = 1.5) { Spr.glow(c, x, y, r * 4, col, 0.6); Spr.circle(c, x, y, r, col); },

  looks: {
    blob(c, m, col) { Spr.ellipse(c, 0, -m.h / 2, m.w / 2, m.h / 2, col); },
    rabbit(c, m, col, acc, a) {
      const hop = m.onGround ? 0 : -2;
      Spr.ellipse(c, -1, -6 + hop, 8, 6, col);
      Spr.circle(c, 6, -10 + hop, 4, col);
      Spr.ellipse(c, 6, -17 + hop, 1.6, 5, col, 0.2);
      Spr.ellipse(c, 4, -17 + hop, 1.6, 5, col, -0.2);
      Spr.circle(c, -8, -7 + hop, 2.4, '#efe7d2');
      Spr.circle(c, 7.5, -10.5 + hop, 0.9, '#2a1a12');
    },
    boar(c, m, col, acc, a) {
      const s = Math.sin(a * 10) * (Math.abs(m.vx) > 10 ? 3 : 0);
      for (const lx of [-10, -4, 6, 11]) Spr.line(c, lx, -8, lx + (lx % 2 ? s : -s), 0, col, 3);
      Spr.ellipse(c, 0, -12, 15, 8, col);
      Spr.poly(c, [10, -16, 19, -11, 18, -6, 10, -6], col);
      Spr.poly(c, [-12, -19, -4, -21, 6, -19, 0, -17], col);
      Spr.line(c, 17, -8, 21, -12, '#efe7d2', 1.5);
      Spr.eye(c, 14, -13, '#ffb04a', 1.1);
    },
    wolf(c, m, col, acc, a) {
      const s = Math.sin(a * 12) * (Math.abs(m.vx) > 10 ? 4 : 0);
      const sc = m.w / 28;
      c.scale(sc, sc);
      for (const lx of [-9, -5, 6, 10]) Spr.line(c, lx, -8, lx + (lx < 0 ? s : -s), 0, col, 2.6);
      Spr.ellipse(c, 0, -11, 12, 5.5, col);
      Spr.poly(c, [8, -16, 18, -12, 20, -9, 9, -7], col);
      Spr.poly(c, [9, -15, 11, -21, 13, -15], col);
      c.beginPath(); c.moveTo(-11, -12); c.quadraticCurveTo(-20, -18, -22, -10); c.strokeStyle = col; c.lineWidth = 3; c.stroke();
      Spr.eye(c, 15, -13, m.def.color === '#cfd6dc' || m.def.color === '#bfe4f2' ? '#7fd8ff' : '#ffcf4a', 1.1);
    },
    zombie(c, m, col, acc, a) {
      Spr.line(c, -2, -12, -2, 0, col, 3.2);
      Spr.line(c, 2, -12, 2, 0, col, 3.2);
      Spr.poly(c, [-6, -26, 6, -26, 7, -10, -7, -10], '#3b2a4a');
      Spr.line(c, 4, -23, 14, -23, col, 3);
      Spr.line(c, 4, -19, 14, -19, col, 3);
      Spr.circle(c, 1, -29, 4.6, col);
      Spr.poly(c, [-4, -33, 6, -33, 5, -36, -3, -36], '#2a2030');
      /* bùa trấn trên trán */
      Spr.poly(c, [2, -33, 6, -33, 6, -24, 2, -24], '#e8d27a');
      Spr.line(c, 4, -31, 4, -26, '#a8261c', 0.8);
      Spr.eye(c, 3, -29, '#9cff8a', 0.8);
    },
    ghost(c, m, col, acc, a, t) {
      c.globalAlpha *= 0.75;
      Spr.glow(c, 0, -m.h / 2, m.h, acc, 0.25);
      c.beginPath();
      c.moveTo(-m.w / 2, -m.h * 0.45);
      c.quadraticCurveTo(-m.w / 2, -m.h, 0, -m.h);
      c.quadraticCurveTo(m.w / 2, -m.h, m.w / 2, -m.h * 0.45);
      for (let i = 0; i <= 4; i++) c.lineTo(m.w / 2 - (i / 4) * m.w, -Math.sin(t * 6 + i) * 3 - (i % 2 ? 0 : 4));
      c.closePath();
      c.fillStyle = M.mixColor(acc, '#0a0c12', 0.35); c.fill();
      Spr.circle(c, 3, -m.h * 0.7, 1.6, '#0a0c12');
      Spr.circle(c, -3, -m.h * 0.7, 1.6, '#0a0c12');
    },
    bat(c, m, col, acc, a) {
      const f = Math.sin(a * 22) * 6;
      Spr.poly(c, [0, -8, -12, -10 - f, -8, -4, 0, -6, 8, -4, 12, -10 - f], col);
      Spr.ellipse(c, 0, -7, 3.5, 4, col);
      Spr.eye(c, 1.5, -8, '#ff3b2f', 0.8);
    },
    bird(c, m, col, acc, a) {
      const f = m.state === 'dive' ? -6 : Math.sin(a * 14) * 7;
      Spr.ellipse(c, 0, -8, 10, 4, col);
      Spr.poly(c, [-2, -9, -14, -14 - f, -10, -8], col);
      Spr.poly(c, [2, -9, 8, -16 - f, 10, -8], col);
      Spr.poly(c, [9, -10, 15, -8, 9, -6], '#d9b25f');
      Spr.poly(c, [-9, -8, -16, -11, -15, -5], col);
      Spr.glow(c, 0, -8, 14, acc, 0.25);
      Spr.eye(c, 7, -9, '#e1d6ff', 0.9);
    },
    treant(c, m, col, acc, a) {
      const s = Math.sin(a * 6) * 2;
      Spr.line(c, -3, -10, -4 + s, 0, col, 4);
      Spr.line(c, 3, -10, 4 - s, 0, col, 4);
      Spr.poly(c, [-7, -28, 7, -28, 6, -9, -6, -9], col);
      Spr.line(c, -5, -24, -13, -30 + s, col, 2.5);
      Spr.line(c, 5, -24, 13, -32 - s, col, 2.5);
      Spr.ellipse(c, 0, -32, 11, 7, M.mixColor(acc, INK, 0.45));
      Spr.eye(c, 3, -24, '#c9ff6b', 1.1);
    },
    wasp(c, m, col, acc, a) {
      const f = Math.sin(a * 40) * 4;
      Spr.ellipse(c, -2, -7, 4, 6 + f * 0.2, 'rgba(230,240,220,0.35)', -0.5);
      Spr.ellipse(c, 0, -6, 6, 3.5, col);
      Spr.ellipse(c, -6, -5, 4, 3, acc);
      Spr.line(c, -10, -4, -13, -3, INK, 1.5);
      Spr.eye(c, 5, -7, '#ff3b2f', 0.8);
    },
    snake(c, m, col, acc, a) {
      c.beginPath();
      for (let i = 0; i <= 10; i++) { const x = -13 + i * 2.4, y = -3 - Math.sin(a * 6 + i * 0.8) * 2; i ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.strokeStyle = col; c.lineWidth = 5; c.lineCap = 'round'; c.stroke();
      Spr.ellipse(c, 12, -6, 5, 3.5, col);
      if (m.windup > 0) Spr.glow(c, 15, -6, 10, '#9be36b', 0.6);
      Spr.eye(c, 13, -7, '#c9ff6b', 0.9);
    },
    wisp(c, m, col, acc, a, t) {
      const f = 1 + Math.sin(t * 12) * 0.08;
      Spr.glow(c, 0, -m.h / 2, m.h * 1.4, acc, 0.45);
      c.beginPath();
      c.moveTo(0, -m.h * 1.15 * f);
      c.quadraticCurveTo(m.w * 0.6, -m.h * 0.5, 0, 0);
      c.quadraticCurveTo(-m.w * 0.6, -m.h * 0.5, 0, -m.h * 1.15 * f);
      c.fillStyle = M.mixColor(acc, '#fff4d8', 0.35); c.fill();
      Spr.circle(c, 0, -m.h * 0.42, m.w * 0.28, '#fff4d8');
      Spr.circle(c, 2, -m.h * 0.48, 1.2, INK);
      Spr.circle(c, -2, -m.h * 0.48, 1.2, INK);
    },
    worm(c, m, col, acc, a) {
      for (let i = 0; i < 5; i++) {
        const x = 12 - i * 6, y = -6 - Math.abs(Math.sin(a * 5 + i)) * 3;
        Spr.circle(c, x, y, 6 - i * 0.5, i % 2 ? col : M.mixColor(acc, INK, 0.3));
      }
      Spr.glow(c, 14, -6, 10, '#ff6a1f', 0.4);
      Spr.eye(c, 15, -8, '#ffd27a', 1.2);
    },
    monkey(c, m, col, acc, a) {
      Spr.line(c, -2, -9, -4, 0, col, 3);
      Spr.line(c, 2, -9, 4, 0, col, 3);
      Spr.ellipse(c, 0, -13, 6, 6, col);
      Spr.circle(c, 3, -20, 4.5, col);
      Spr.line(c, 4, -14, 11, -18, col, 2.5);
      c.beginPath(); c.moveTo(-5, -12); c.quadraticCurveTo(-14, -16, -12, -24); c.strokeStyle = acc; c.lineWidth = 2; c.stroke();
      Spr.glow(c, -12, -24, 8, '#ff8a3c', 0.5);
      Spr.eye(c, 5, -21, '#ffd27a', 1);
    },
    crystal(c, m, col, acc, a, t) {
      Spr.glow(c, 0, -13, 26, acc, 0.35 + (m.windup > 0 ? 0.3 : 0));
      Spr.poly(c, [0, -28, 8, -12, 4, 0, -4, 0, -8, -12], M.mixColor(acc, '#0b1a26', 0.4), 'rgba(220,245,255,0.7)', 1);
      Spr.poly(c, [-9, -16, -13, -8, -9, -2, -6, -9], M.mixColor(acc, '#0b1a26', 0.55));
      Spr.poly(c, [9, -14, 13, -7, 9, -2, 6, -8], M.mixColor(acc, '#0b1a26', 0.55));
      Spr.circle(c, 0, -14, 2.4, '#e9fbff');
    },
    golem(c, m, col, acc, a, t) {
      const s = Math.sin(a * 6) * 2.5;
      const sc = m.h / 34;
      c.scale(sc, sc);
      Spr.poly(c, [-6, -12, -2, -12, -2, 0, -7, 0], col);
      Spr.poly(c, [2, -12, 6, -12, 7, 0, 2, 0], col);
      Spr.poly(c, [-10, -30, 10, -30, 8, -11, -8, -11], col);
      Spr.poly(c, [10, -28, 15, -18 + s, 12, -10 + s, 8, -20], col);
      Spr.poly(c, [-6, -36, 6, -36, 6, -30, -6, -30], col);
      Spr.line(c, -6, -22, 6, -18, acc, 1.2);
      Spr.line(c, 0, -26, -3, -14, acc, 1.2);
      Spr.glow(c, 0, -22, 10, acc, 0.4);
      Spr.eye(c, 2, -33, '#e1d6ff', 1.3);
    },
    /* ---------- Thủ lĩnh ---------- */
    treeKing(c, m, col, acc, a, t) {
      const s = Math.sin(a * 2) * 3;
      Spr.poly(c, [-20, 0, -14, -20, -26, 0], col);
      Spr.poly(c, [20, 0, 14, -20, 26, 0], col);
      Spr.poly(c, [-18, -70, 18, -70, 16, -10, -16, -10], col);
      Spr.line(c, -14, -60, -40, -86 + s, col, 7);
      Spr.line(c, -30, -78 + s, -44, -70 + s, col, 4);
      Spr.line(c, 14, -60, 40, -90 - s, col, 7);
      Spr.line(c, 32, -84 - s, 46, -96 - s, col, 4);
      Spr.ellipse(c, 0, -88, 38, 22, M.mixColor(acc, INK, 0.5));
      Spr.ellipse(c, -22, -82, 18, 12, M.mixColor(acc, INK, 0.6));
      Spr.ellipse(c, 24, -84, 18, 12, M.mixColor(acc, INK, 0.6));
      Spr.poly(c, [-8, -44, 8, -44, 4, -34, -4, -34], '#0b0907');
      Spr.eye(c, -6, -54, '#c9ff6b', 2.4);
      Spr.eye(c, 7, -54, '#c9ff6b', 2.4);
    },
    dragon(c, m, col, acc, a, t) {
      /* thân rồng uốn khúc */
      for (let i = 9; i >= 0; i--) {
        const x = -i * 9, y = -20 + Math.sin(t * 4 - i * 0.6) * 9;
        Spr.circle(c, x, y, 11 - i * 0.7, i % 2 ? col : M.mixColor(acc, INK, 0.35));
        if (i % 3 === 0) Spr.poly(c, [x - 3, y - 10 + i * 0.5, x, y - 18 + i * 0.6, x + 3, y - 10 + i * 0.5], acc);
      }
      Spr.poly(c, [6, -30, 30, -24, 34, -16, 8, -10], col);
      Spr.poly(c, [10, -30, 6, -42, 16, -32], acc);
      Spr.poly(c, [20, -28, 22, -40, 26, -28], acc);
      Spr.line(c, 30, -18, 44, -14 + Math.sin(t * 6) * 3, '#ffd27a', 1.4);
      Spr.glow(c, 26, -20, 26, '#ff6a1f', 0.45);
      Spr.eye(c, 22, -24, '#ffe08a', 2);
    },
    phoenix(c, m, col, acc, a, t) {
      const f = Math.sin(t * 7) * 14;
      Spr.glow(c, 0, -22, 60, acc, 0.35);
      c.beginPath(); c.moveTo(-8, -20);
      for (let i = 0; i < 3; i++) c.quadraticCurveTo(-40 - i * 8, -10 + i * 10 + f * 0.3, -60 - i * 6, 4 + i * 8);
      c.strokeStyle = M.rgba(acc, 0.8); c.lineWidth = 3; c.stroke();
      Spr.poly(c, [-4, -24, -40, -58 - f, -30, -26, -46, -30 - f * 0.6, -12, -16], M.mixColor(acc, INK, 0.3));
      Spr.poly(c, [4, -24, 30, -62 - f, 26, -28, 40, -34 - f * 0.6, 10, -16], M.mixColor(acc, INK, 0.2));
      Spr.ellipse(c, 0, -20, 14, 9, col);
      Spr.circle(c, 14, -30, 6, col);
      Spr.poly(c, [18, -32, 26, -29, 18, -27], '#e9f6ff');
      Spr.poly(c, [12, -36, 8, -46, 16, -38], acc);
      Spr.eye(c, 16, -31, '#ffffff', 1.4);
    },
    thunderGolem(c, m, col, acc, a, t) {
      const s = Math.sin(a * 3) * 3;
      Spr.poly(c, [-22, 0, -14, -34, -2, -34, -8, 0], col);
      Spr.poly(c, [8, 0, 2, -34, 14, -34, 22, 0], col);
      Spr.poly(c, [-30, -90, 30, -90, 24, -34, -24, -34], col);
      Spr.poly(c, [30, -86, 46, -60 + s, 40, -30 + s, 26, -56], col);
      Spr.poly(c, [-30, -86, -46, -60 - s, -40, -30 - s, -26, -56], col);
      Spr.poly(c, [-14, -110, 14, -110, 16, -90, -16, -90], col);
      Spr.poly(c, [-18, -112, -8, -126, -6, -110], acc);
      Spr.poly(c, [18, -112, 8, -126, 6, -110], acc);
      for (let i = 0; i < 4; i++) Spr.line(c, -20 + i * 12, -80, -14 + i * 12 + Math.sin(t * 20 + i) * 3, -44, M.rgba('#e1d6ff', 0.7), 1.4);
      Spr.glow(c, 0, -64, 40, acc, 0.35);
      Spr.eye(c, -6, -100, '#e1d6ff', 2.4);
      Spr.eye(c, 6, -100, '#e1d6ff', 2.4);
    },
  },

  /* ======================= Tài nguyên ======================= */
  resource(c, r, biome, t) {
    const R = DATA.resources[r.type];
    const sh = r.shake > 0 ? Math.sin(t * 60) * 2 : 0;
    c.save();
    c.translate(r.x + sh, r.y);
    c.scale((r.flip ? -1 : 1) * r.size, r.size);
    const dark = M.mixColor(biome.dark, INK, 0.4);
    if (!r.alive) {
      if (R.tool === 'axe') Spr.poly(c, [-5, 0, -4, -6, 4, -6, 5, 0], dark);
      else if (R.tool === 'pick') Spr.ellipse(c, 0, -2, 7, 3, dark);
      c.restore();
      return;
    }
    switch (r.type) {
      case 'tung': case 'tuyet_tung': {
        Spr.poly(c, [-3, 0, -2, -34, 2, -34, 3, 0], dark);
        const lay = [[-22, -30, 22, -30, 0, -60], [-18, -50, 18, -50, 0, -78], [-13, -68, 13, -68, 0, -96]];
        const leaf = r.type === 'tuyet_tung' ? '#5d6e74' : M.mixColor(biome.ground, INK, 0.45);
        for (const l of lay) Spr.poly(c, l, leaf);
        if (r.type === 'tuyet_tung') for (const l of lay) Spr.poly(c, [l[0] * 0.7, l[1] - 3, l[2] * 0.7, l[3] - 3, 0, l[5] + 4], '#eef4f6');
        break;
      }
      case 'phong': {
        Spr.poly(c, [-3, 0, -2, -40, 2, -40, 3, 0], dark);
        Spr.line(c, 0, -30, -14, -48, dark, 2.5);
        Spr.line(c, 0, -36, 12, -54, dark, 2.5);
        for (const [x, y, rr] of [[-14, -56, 16], [10, -62, 18], [-2, -74, 17], [16, -48, 11], [-20, -44, 10]]) Spr.circle(c, x, y, rr, M.mixColor('#b0442c', INK, 0.25));
        break;
      }
      case 'truc': {
        for (const [x, h, lean] of [[-6, 104, -4], [0, 112, 2], [6, 96, 6], [11, 84, 9]]) {
          const sway = Math.sin(t * 1.5 + x) * 2;
          Spr.line(c, x, 0, x + lean + sway, -h, M.mixColor('#4f7a4c', INK, 0.35), 2.6);
          for (let k = 1; k < 5; k++) Spr.line(c, x + (lean + sway) * k / 5 - 1.5, -h * k / 5, x + (lean + sway) * k / 5 + 1.5, -h * k / 5, INK, 1.2);
          for (let k = 0; k < 3; k++) Spr.ellipse(c, x + lean + sway + (k - 1) * 6, -h + 6 + k * 8, 7, 1.8, M.mixColor('#7fb08a', INK, 0.35), k % 2 ? 0.5 : -0.5);
        }
        break;
      }
      case 'da':
        Spr.poly(c, [-14, 0, -11, -14, -2, -20, 9, -16, 14, -6, 13, 0], M.mixColor(biome.ground, '#6e6a62', 0.5));
        Spr.line(c, -6, -12, 2, -16, 'rgba(255,255,255,0.18)', 2);
        break;
      case 'quang_sat': case 'linh_thach': case 'loi_van': {
        Spr.poly(c, [-15, 0, -12, -16, -2, -22, 10, -18, 15, -6, 14, 0], M.mixColor(biome.ground, '#4a4640', 0.6));
        const gem = r.type === 'quang_sat' ? '#a8754a' : r.type === 'linh_thach' ? '#7fe0d0' : '#b9a8ff';
        for (const [x, y] of [[-6, -10], [4, -14], [7, -6], [-1, -5]]) Spr.poly(c, [x, y - 3, x + 2, y, x, y + 3, x - 2, y], gem);
        if (r.type !== 'quang_sat') Spr.glow(c, 0, -10, 20, gem, 0.3 + Math.sin(t * 3) * 0.1);
        break;
      }
      case 'bui_qua':
        Spr.ellipse(c, 0, -8, 13, 9, M.mixColor('#3c5a45', INK, 0.4));
        for (const [x, y] of [[-6, -10], [3, -13], [7, -6], [-2, -5]]) Spr.circle(c, x, y, 2, '#c8402f');
        break;
      case 'linh_thao':
        for (let k = -2; k <= 2; k++) Spr.line(c, 0, 0, k * 4, -10 - Math.abs(k) * -2, '#5fae8f', 1.6);
        Spr.glow(c, 0, -10, 10, '#9be3b0', 0.4 + Math.sin(t * 2 + r.c) * 0.15);
        break;
      case 'hoa_linh_chi':
        Spr.line(c, 0, 0, 0, -6, '#d9c3a0', 2);
        Spr.ellipse(c, 0, -7, 7, 3.5, '#c2381e');
        Spr.glow(c, 0, -7, 12, '#ff8a3c', 0.35);
        break;
      case 'tuyet_lien':
        for (let k = 0; k < 6; k++) Spr.ellipse(c, Math.cos(k) * 3, -6 + Math.sin(k) * 2, 4, 1.6, '#f4fbff', k);
        Spr.glow(c, 0, -6, 12, '#bfeaff', 0.45);
        break;
    }
    c.restore();
  },

  /* ======================= Công trình ======================= */
  structure(c, s, t, G) {
    const S = DATA.structures[s.type];
    c.save();
    c.translate(s.x, s.y);
    switch (s.type) {
      case 'lua_trai': {
        Spr.line(c, -10, 0, 10, -5, '#5a3e26', 4);
        Spr.line(c, -10, -5, 10, 0, '#4a321e', 4);
        for (let i = -2; i <= 2; i++) Spr.circle(c, i * 5, 1, 3, '#57524a');
        if (s.fuel > 0) {
          const f = 1 + Math.sin(t * 14) * 0.12 + Math.sin(t * 23) * 0.06;
          Spr.glow(c, 0, -10, 46, '#ff9a3c', 0.45);
          c.beginPath(); c.moveTo(-8, -3); c.quadraticCurveTo(-6, -18 * f, 0, -26 * f); c.quadraticCurveTo(6, -18 * f, 8, -3); c.fillStyle = '#ff7a2f'; c.fill();
          c.beginPath(); c.moveTo(-4, -3); c.quadraticCurveTo(-2, -12 * f, 0, -17 * f); c.quadraticCurveTo(3, -12 * f, 4, -3); c.fillStyle = '#ffd27a'; c.fill();
        }
        break;
      }
      case 'ban_che_tac':
        Spr.poly(c, [-17, -18, 17, -18, 17, -14, -17, -14], '#5a3e26');
        Spr.line(c, -13, -14, -13, 0, '#4a321e', 3);
        Spr.line(c, 13, -14, 13, 0, '#4a321e', 3);
        Spr.line(c, -6, -22, 4, -19, '#b8bec4', 2);
        Spr.poly(c, [6, -24, 12, -24, 12, -18, 6, -18], '#8a6a44');
        break;
      case 'lo_luyen': {
        Spr.poly(c, [-15, 0, -13, -26, -6, -34, 6, -34, 13, -26, 15, 0], '#3e3a36');
        Spr.poly(c, [-6, -4, -6, -14, 6, -14, 6, -4], '#1a1410');
        Spr.glow(c, 0, -9, 22, '#ff7a2f', 0.45 + Math.sin(t * 6) * 0.1);
        Spr.poly(c, [-5, -5, -5, -12, 5, -12, 5, -5], '#ff8a3c');
        Spr.line(c, 4, -34, 4, -42, '#3e3a36', 4);
        break;
      }
      case 'dan_lo': {
        Spr.line(c, -9, 0, -7, -8, '#4a3a2a', 2.5);
        Spr.line(c, 9, 0, 7, -8, '#4a3a2a', 2.5);
        Spr.ellipse(c, 0, -14, 12, 9, '#6b5a3a');
        Spr.poly(c, [-8, -22, 8, -22, 6, -27, -6, -27], '#6b5a3a');
        Spr.circle(c, 0, -29, 2.5, '#c9a24f');
        Spr.glow(c, 0, -14, 20, '#9be3b0', 0.25 + Math.sin(t * 3) * 0.1);
        if (Math.random() < 0.1) G.particle(s.x + M.lerp(-3, 3, Math.random()), s.y - 30, 0, -20, 1.2, 'smoke', '#cfc6ad', 5);
        break;
      }
      case 'thao_tich':
        Spr.poly(c, [-17, 0, -17, -5, 17, -5, 17, 0], '#b89a5a');
        for (let i = -15; i < 16; i += 4) Spr.line(c, i, -5, i + 2, 0, '#8a7040', 1);
        Spr.ellipse(c, -12, -6, 5, 2.5, '#d8cfb4');
        break;
      case 'bo_doan':
        Spr.ellipse(c, 0, -3, 10, 4, '#a8853f');
        Spr.ellipse(c, 0, -4, 7, 2.4, '#c9a24f');
        break;
      case 'den_long': {
        Spr.line(c, 0, 0, 0, -30, '#3a2a1a', 2.5);
        Spr.line(c, 0, -30, 6, -32, '#3a2a1a', 2);
        Spr.glow(c, 6, -26, 30, '#ff8a4c', 0.45);
        Spr.ellipse(c, 6, -26, 5, 7, '#c8402f');
        Spr.line(c, 3, -26, 9, -26, '#ffd27a', 1);
        break;
      }
      case 'tu_linh_tran': {
        c.globalAlpha = 0.85;
        c.beginPath(); c.ellipse(0, -2, 30, 5, 0, 0, Math.PI * 2); c.strokeStyle = '#7fe0d0'; c.lineWidth = 1.5; c.stroke();
        c.beginPath(); c.ellipse(0, -2, 20, 3.3, 0, 0, Math.PI * 2); c.stroke();
        for (let i = 0; i < 8; i++) { const a = t * 0.6 + i * Math.PI / 4; Spr.circle(c, Math.cos(a) * 30, -2 + Math.sin(a) * 5, 1.5, '#bff7ec'); }
        c.globalAlpha = 1;
        Spr.glow(c, 0, -8, 34, '#7fe0d0', 0.2);
        break;
      }
    }
    c.restore();
  },

  /* Cổng bí cảnh */
  portal(c, x, y, id, open, t, cleared) {
    const pal = DATA.dungeons[id].pal;
    c.save();
    c.translate(x, y);
    Spr.poly(c, [-26, 0, -22, -64, -16, -64, -18, 0], '#26221c');
    Spr.poly(c, [26, 0, 22, -64, 16, -64, 18, 0], '#26221c');
    Spr.poly(c, [-34, -64, 34, -64, 30, -72, -30, -72], '#26221c');
    Spr.poly(c, [-28, -74, 28, -74, 24, -79, -24, -79], '#26221c');
    if (open) {
      Spr.glow(c, 0, -34, 60, pal.glow, 0.35);
      for (let i = 0; i < 5; i++) {
        c.beginPath();
        c.ellipse(0, -32, 15 - i * 2.4, 28 - i * 4.5, 0, t * (1 + i * 0.4) + i, t * (1 + i * 0.4) + i + 4.2);
        c.strokeStyle = M.rgba(i % 2 ? pal.glow : pal.accent, 0.8 - i * 0.12);
        c.lineWidth = 2.2;
        c.stroke();
      }
    } else {
      c.fillStyle = 'rgba(20,18,15,0.6)'; c.fillRect(-16, -62, 32, 62);
      Spr.line(c, -16, -50, 16, -20, '#5a5248', 2);
      Spr.line(c, 16, -50, -16, -20, '#5a5248', 2);
    }
    c.fillStyle = cleared ? '#ffd27a' : pal.accent;
    c.font = 'bold 10px "Noto Serif SC","Songti SC",serif';
    c.textAlign = 'center';
    c.fillText({ moc: '木', hoa: '火', thuy: '水', loi: '雷' }[id], 0, -66);
    c.restore();
  },

  /* Truyền Tống Trận */
  array(c, x, y, placed, t, won) {
    c.save();
    c.translate(x, y);
    const els = DATA.dungeonOrder;
    c.beginPath(); c.ellipse(0, -3, 44, 8, 0, 0, Math.PI * 2); c.strokeStyle = won ? '#ffd27a' : '#8f8a78'; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.ellipse(0, -3, 30, 5.5, 0, 0, Math.PI * 2); c.lineWidth = 1; c.stroke();
    els.forEach((id, i) => {
      const a = i * Math.PI / 2 + Math.PI / 4;
      const px = Math.cos(a) * 40, py = -3 + Math.sin(a) * 7;
      const lit = placed.includes(DATA.dungeons[id].fragment);
      Spr.poly(c, [px - 4, py, px - 3, py - 16, px + 3, py - 16, px + 4, py], '#3a352c');
      if (lit) { Spr.glow(c, px, py - 18, 18, DATA.dungeons[id].pal.glow, 0.7); Spr.circle(c, px, py - 18, 3, DATA.dungeons[id].pal.glow); }
    });
    if (won || placed.length === 4) {
      Spr.glow(c, 0, -40, 80, '#ffe9a8', 0.4);
      Spr.line(c, 0, 0, 0, -220, 'rgba(255,240,200,0.35)', 18);
    }
    c.restore();
  },
};

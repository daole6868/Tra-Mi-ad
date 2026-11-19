'use strict';
/* Linh Vực Cầu Sinh — tiện ích toán học, ngẫu nhiên có hạt giống, nhiễu */

const TILE = 16;

const M = {
  clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
  lerp: (a, b, t) => a + (b - a) * t,
  smooth: (t) => t * t * (3 - 2 * t),
  approach(v, target, step) { return v < target ? Math.min(v + step, target) : Math.max(v - step, target); },
  dist: (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by),
  sign: (v) => (v < 0 ? -1 : 1),
  overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; },
  fmt(n) {
    n = Math.floor(n);
    if (n < 1000) return String(n);
    if (n < 1e6) return (n / 1000).toFixed(n < 1e4 ? 1 : 0).replace(/\.0$/, '') + 'K';
    return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  },
  esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
  hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  },
  mixColor(a, b, t) {
    const A = M.hexToRgb(a), B = M.hexToRgb(b);
    return 'rgb(' + Math.round(M.lerp(A[0], B[0], t)) + ',' + Math.round(M.lerp(A[1], B[1], t)) + ',' + Math.round(M.lerp(A[2], B[2], t)) + ')';
  },
  rgba(h, a) { const c = M.hexToRgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; },
};

/* Bộ sinh số ngẫu nhiên có hạt giống (mulberry32) */
class RNG {
  constructor(seed) { this.s = (seed >>> 0) || 1; }
  next() {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a, b) { return a + this.next() * (b - a); }
  int(a, b) { return Math.floor(a + this.next() * (b - a + 1)); }
  chance(p) { return this.next() < p; }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  weighted(list) {
    let total = 0;
    for (const it of list) total += it.w;
    let r = this.next() * total;
    for (const it of list) { r -= it.w; if (r <= 0) return it; }
    return list[list.length - 1];
  }
}

/* Nhiễu giá trị 1 chiều (dùng cho địa hình và dãy núi nền) */
const Noise = {
  hash(i, seed) {
    let h = (i * 374761393 + seed * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  },
  value(x, seed) {
    const i = Math.floor(x), f = x - i;
    const a = Noise.hash(i, seed), b = Noise.hash(i + 1, seed);
    return M.lerp(a, b, M.smooth(f));
  },
  fbm(x, seed, oct = 4) {
    let v = 0, amp = 0.5, f = 1, norm = 0;
    for (let o = 0; o < oct; o++) {
      v += Noise.value(x * f, seed + o * 97) * amp;
      norm += amp;
      amp *= 0.5;
      f *= 2.03;
    }
    return v / norm;
  },
};

'use strict';
/* Vấn Đạo Tiên Đồ — tiện ích dùng chung */

const U = {
  rand(a, b) { return a + Math.random() * (b - a); },
  randInt(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
  chance(p) { return Math.random() < p; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  /** Chọn ngẫu nhiên theo trọng số. list: mảng object, key: tên trường trọng số */
  weighted(list, key = 'w') {
    let total = 0;
    for (const it of list) total += Math.max(0, it[key] || 0);
    let r = Math.random() * total;
    for (const it of list) {
      r -= Math.max(0, it[key] || 0);
      if (r <= 0) return it;
    }
    return list[list.length - 1];
  },
  clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
  uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); },
  now() { return Date.now(); },

  fmt(n) {
    if (n === Infinity) return '∞';
    if (!isFinite(n)) return '0';
    const neg = n < 0;
    let a = Math.abs(n);
    if (a < 1000) {
      const s = a >= 100 || Number.isInteger(a) ? Math.floor(a).toString() : (Math.floor(a * 10) / 10).toString();
      return (neg ? '-' : '') + s;
    }
    const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    let i = 0;
    while (a >= 1000 && i < units.length - 1) { a /= 1000; i++; }
    const s = a >= 100 ? a.toFixed(0) : a >= 10 ? a.toFixed(1) : a.toFixed(2);
    return (neg ? '-' : '') + s.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1') + units[i];
  },
  pct(v, d = 0) { return (v * 100).toFixed(d) + '%'; },
  time(sec) {
    sec = Math.max(0, Math.floor(sec));
    if (sec < 60) return sec + ' giây';
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h > 0) return h + ' giờ ' + (m ? m + ' phút' : '');
    return m + ' phút' + (s ? ' ' + s + ' giây' : '');
  },
  clock(sec) {
    sec = Math.max(0, Math.ceil(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const p = (x) => String(x).padStart(2, '0');
    return (h ? h + ':' + p(m) : m) + ':' + p(s);
  },
  todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  clone(o) { return JSON.parse(JSON.stringify(o)); },
  sum(arr) { return arr.reduce((a, b) => a + b, 0); },
  /** Gộp bonus dạng {key: value} vào target */
  addBonus(target, src, mult = 1) {
    if (!src) return target;
    for (const k in src) target[k] = (target[k] || 0) + src[k] * mult;
    return target;
  },
};

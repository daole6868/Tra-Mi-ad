'use strict';
/* Âm thanh tổng hợp bằng WebAudio (không cần tệp âm thanh) */

const Sfx = {
  ctx: null,
  last: {},
  init() {
    if (Sfx.ctx) return Sfx.ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) Sfx.ctx = new AC();
    } catch (e) { Sfx.ctx = null; }
    return Sfx.ctx;
  },
  tone(freq, dur, type = 'sine', vol = 0.06, when = 0, slide = 0) {
    const c = Sfx.ctx;
    const t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.08, freq = 800) {
    const c = Sfx.ctx;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = freq;
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start();
  },
  play(name) {
    if (!G || !G.settings || !G.settings.sound) return;
    if (!Sfx.ctx || Sfx.ctx.state !== 'running') return;
    const now = performance.now();
    if (now - (Sfx.last[name] || 0) < 70) return;
    Sfx.last[name] = now;
    try {
      switch (name) {
        case 'hit': Sfx.noise(0.08, 0.05, 1400); break;
        case 'crit': Sfx.noise(0.12, 0.08, 2400); Sfx.tone(880, 0.1, 'square', 0.025); break;
        case 'coin': Sfx.tone(988, 0.08, 'triangle', 0.05); Sfx.tone(1319, 0.12, 'triangle', 0.05, 0.07); break;
        case 'up': [523, 659, 784].forEach((f, i) => Sfx.tone(f, 0.18, 'triangle', 0.05, i * 0.07)); break;
        case 'realm': [392, 523, 659, 784, 1047].forEach((f, i) => Sfx.tone(f, 0.35, 'sine', 0.06, i * 0.09)); break;
        case 'win': [659, 784, 988].forEach((f, i) => Sfx.tone(f, 0.16, 'triangle', 0.04, i * 0.06)); break;
        case 'fail': Sfx.tone(330, 0.35, 'sawtooth', 0.035, 0, 0.5); break;
        case 'thunder': Sfx.noise(0.9, 0.18, 500); Sfx.tone(60, 0.6, 'sawtooth', 0.05, 0, 0.6); break;
        case 'click': Sfx.tone(660, 0.04, 'square', 0.02); break;
      }
    } catch (e) { /* bỏ qua lỗi âm thanh */ }
  },
  unlock() {
    const c = Sfx.init();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  },
};

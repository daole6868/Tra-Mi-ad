'use strict';
/* Âm thanh tổng hợp bằng WebAudio: hiệu ứng và nhạc nền ngũ cung kiểu đàn tranh */

const Sfx = {
  ctx: null, master: null, musicGain: null, on: true, musicOn: true, last: {},
  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.55; this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.32; this.musicGain.connect(this.master);
    } catch (e) { this.ctx = null; }
  },
  resume() { this.init(); if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); },
  tone(f, d, type, vol, when = 0, slide = 0, dest) {
    const c = this.ctx, t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest || this.master);
    o.start(t); o.stop(t + d + 0.05);
  },
  noise(d, vol, freq, type = 'lowpass', when = 0) {
    const c = this.ctx, len = Math.floor(c.sampleRate * d);
    const buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = c.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(this.master);
    s.start(c.currentTime + when);
  },
  play(name) {
    if (!this.on || !this.ctx || this.ctx.state !== 'running') return;
    const now = performance.now();
    if (now - (this.last[name] || 0) < 45) return;
    this.last[name] = now;
    try {
      switch (name) {
        case 'jump': this.tone(380, 0.12, 'triangle', 0.05, 0, 1.6); break;
        case 'jump2': this.tone(520, 0.16, 'sine', 0.06, 0, 1.8); break;
        case 'dash': this.noise(0.18, 0.12, 2400, 'bandpass'); break;
        case 'swing': this.noise(0.09, 0.08, 3200, 'highpass'); break;
        case 'hit': this.noise(0.07, 0.16, 900); this.tone(140, 0.08, 'square', 0.03); break;
        case 'crit': this.noise(0.12, 0.2, 1600); this.tone(880, 0.1, 'triangle', 0.05); break;
        case 'kill': this.tone(220, 0.25, 'sawtooth', 0.03, 0, 0.4); this.noise(0.2, 0.1, 500); break;
        case 'hurt': this.tone(200, 0.2, 'square', 0.05, 0, 0.6); break;
        case 'chop': this.noise(0.06, 0.18, 700); this.tone(180, 0.06, 'triangle', 0.05); break;
        case 'fall': this.noise(0.5, 0.15, 300); break;
        case 'mine': this.tone(1100, 0.05, 'square', 0.03); this.noise(0.05, 0.14, 2500, 'bandpass'); break;
        case 'clink': this.tone(1600, 0.08, 'triangle', 0.04); break;
        case 'pluck': this.tone(700, 0.08, 'sine', 0.05, 0, 1.3); break;
        case 'pickup': this.tone(880, 0.07, 'triangle', 0.035); this.tone(1320, 0.09, 'triangle', 0.03, 0.05); break;
        case 'place': this.noise(0.1, 0.15, 400); break;
        case 'eat': this.noise(0.08, 0.08, 1200, 'bandpass'); this.noise(0.08, 0.08, 1200, 'bandpass', 0.12); break;
        case 'pill': this.tone(660, 0.2, 'sine', 0.05, 0, 1.5); break;
        case 'equip': this.tone(440, 0.1, 'triangle', 0.05); this.tone(660, 0.12, 'triangle', 0.05, 0.06); break;
        case 'craft': [523, 659, 784].forEach((f, i) => this.tone(f, 0.15, 'triangle', 0.045, i * 0.06)); break;
        case 'fire': this.noise(0.3, 0.12, 900); this.tone(300, 0.25, 'sawtooth', 0.025, 0, 0.5); break;
        case 'wave': this.noise(0.2, 0.12, 4000, 'highpass'); break;
        case 'shoot': this.tone(500, 0.12, 'square', 0.025, 0, 0.6); break;
        case 'ice': this.tone(1500, 0.25, 'sine', 0.04, 0, 0.5); break;
        case 'charge': this.noise(0.4, 0.12, 300); break;
        case 'screech': this.tone(1200, 0.3, 'sawtooth', 0.03, 0, 0.5); break;
        case 'rumble': this.noise(0.6, 0.18, 160); break;
        case 'slam': this.noise(0.4, 0.3, 200); this.tone(60, 0.4, 'sine', 0.12, 0, 0.5); break;
        case 'thunder': this.noise(0.9, 0.3, 700); this.tone(55, 0.7, 'sawtooth', 0.06, 0, 0.6); break;
        case 'roar': this.tone(90, 0.9, 'sawtooth', 0.08, 0, 0.6); this.noise(0.9, 0.15, 400); break;
        case 'realm': [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.45, 'sine', 0.05, i * 0.08)); break;
        case 'portal': this.tone(220, 0.8, 'sine', 0.06, 0, 2); this.tone(330, 0.8, 'sine', 0.04, 0.1, 2); break;
        case 'chest': [659, 784, 988, 1319].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.04, i * 0.05)); break;
        case 'night': this.tone(110, 1.6, 'sine', 0.06, 0, 0.8); break;
        case 'death': [330, 262, 196, 131].forEach((f, i) => this.tone(f, 0.5, 'triangle', 0.05, i * 0.2)); break;
        case 'victory': [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.4, 'triangle', 0.05, i * 0.13)); break;
        case 'ui': this.tone(900, 0.04, 'square', 0.02); break;
      }
    } catch (e) { /* bỏ qua */ }
  },

  /* Nhạc nền: đàn tranh ngũ cung ngẫu hứng, đổi điệu theo ngày/đêm/bí cảnh */
  musicT: 0,
  music(dt, mood) {
    if (!this.musicOn || !this.ctx || this.ctx.state !== 'running') return;
    this.musicT -= dt;
    if (this.musicT > 0) return;
    const scales = {
      day: [293.7, 329.6, 392, 440, 523.3, 587.3, 659.3],
      night: [196, 220, 261.6, 293.7, 329.6, 392],
      dungeon: [146.8, 174.6, 196, 220, 261.6, 293.7],
      boss: [110, 130.8, 146.8, 164.8, 196],
    };
    const sc = scales[mood] || scales.day;
    const n = mood === 'boss' ? 4 : 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const f = sc[Math.floor(Math.random() * sc.length)];
      const w = i * (mood === 'boss' ? 0.18 : 0.32);
      this.tone(f, mood === 'boss' ? 0.5 : 1.8, 'triangle', 0.05, w, 0, this.musicGain);
      this.tone(f * 2, 0.6, 'sine', 0.012, w, 0, this.musicGain);
    }
    if (mood === 'boss') this.noise(0.25, 0.12, 120, 'lowpass');
    this.musicT = mood === 'boss' ? 0.9 : 2 + Math.random() * 3.5;
  },
};

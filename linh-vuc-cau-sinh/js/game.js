'use strict';
/* Lõi game: vật lý, nhân vật, yêu thú, chiến đấu, sinh tồn, bí cảnh, lưu trữ */

const GRAV = 1500, MAX_FALL = 720, RUN = 165, JUMP_V = 480, DJUMP_V = 430, DASH_V = 470;

const Phys = {
  move(e, lv, dt, noclip) {
    const sp = Math.max(Math.abs(e.vx), Math.abs(e.vy)) * dt;
    const steps = Math.max(1, Math.ceil(sp / 7));
    const sdt = dt / steps;
    const wasGround = e.onGround;
    e.onGround = false;
    e.hitWall = 0;
    e.hitCeil = false;
    for (let i = 0; i < steps; i++) {
      const nx = e.x + e.vx * sdt;
      if (!noclip && lv.boxSolid(nx, e.y, e.w, e.h)) {
        if (e.canStep && wasGround && e.vy >= 0 && !lv.boxSolid(nx, e.y - TILE, e.w, e.h) && !lv.boxSolid(e.x, e.y - TILE, e.w, e.h)) {
          e.y -= TILE;
          e.x = nx;
          e.stepOffset = (e.stepOffset || 0) + TILE;
        } else {
          if (e.vx > 0) e.x = Math.floor((nx + e.w) / TILE) * TILE - e.w - 0.01;
          else if (e.vx < 0) e.x = Math.floor(nx / TILE) * TILE + TILE + 0.01;
          e.hitWall = Math.sign(e.vx);
          e.vx = 0;
        }
      } else e.x = nx;
      const ny = e.y + e.vy * sdt;
      if (!noclip && lv.boxSolid(e.x, ny, e.w, e.h)) {
        if (e.vy > 0) { e.y = Math.floor((ny + e.h) / TILE) * TILE - e.h - 0.01; e.onGround = true; }
        else { e.y = Math.floor(ny / TILE) * TILE + TILE + 0.01; e.hitCeil = true; }
        e.vy = 0;
      } else e.y = ny;
    }
    if (!noclip && !e.onGround && e.vy >= 0 && lv.boxSolid(e.x, e.y + 1, e.w, e.h)) e.onGround = true;
    e.x = M.clamp(e.x, 0, lv.w - e.w);
    if (e.y > lv.h + 200) e.y = lv.h + 200;
    e.onIce = e.onGround && lv.get(Math.floor((e.x + e.w / 2) / TILE), Math.floor((e.y + e.h + 2) / TILE)) === T_ICE;
  },
};

class Player {
  constructor(x, groundY) {
    this.w = 12; this.h = 28;
    this.x = x - this.w / 2; this.y = groundY - this.h - 0.01;
    this.vx = 0; this.vy = 0; this.face = 1;
    this.onGround = false; this.canStep = true; this.stepOffset = 0;
    this.hp = 100; this.mp = 40; this.hunger = 100; this.tuvi = 0; this.realm = 0;
    this.coyote = 0; this.jumpBuf = 0; this.airJumps = 0;
    this.dashT = 0; this.dashCd = 0; this.invT = 0;
    this.atkT = 0; this.atkElapsed = 0; this.combo = 0; this.comboT = 0; this.hits = new Set(); this.harvested = false; this.queued = false; this.waved = false;
    this.castCd = 0; this.med = null; this.anim = 0; this.lastSafe = { x: this.x, y: this.y };
    this.flying = false; this.hurtT = 0; this.spawn = null;
  }
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get bottom() { return this.y + this.h; }
}

class Mob {
  constructor(type, x, groundY, o = {}) {
    const def = DATA.monsters[type] || DATA.bosses[type];
    this.type = type; this.def = def; this.boss = !!DATA.bosses[type];
    const sc = o.elite ? 1.25 : 1;
    this.w = Math.round(def.w * sc); this.h = Math.round(def.h * sc);
    this.x = x - this.w / 2; this.y = groundY - this.h - 0.01;
    this.vx = 0; this.vy = 0; this.face = -1; this.onGround = false;
    this.ai = this.boss ? 'boss' : def.ai;
    this.fly = this.boss ? !!def.fly : ['flyer', 'diver', 'ghost'].includes(def.ai) || !!def.fly;
    this.canStep = !this.fly;
    this.maxHp = this.hp = Math.round(def.hp * (o.hpMult || 1) * (o.elite ? 2 : 1));
    this.dmg = def.dmg * (o.dmgMult || 1) * (o.elite ? 1.3 : 1);
    this.elite = !!o.elite;
    this.state = 'idle'; this.t = 0; this.cd = Math.random() * 1.5;
    this.flash = 0; this.stun = 0; this.burn = 0; this.burnDps = 0; this.slow = 0; this.touchCd = 0;
    this.anim = Math.random() * 10; this.alive = true; this.aggro = !def.neutral; this.homeX = x;
    this.phase = 1; this.pattern = 0; this.windup = 0; this.sleep = !!o.sleep;
  }
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get bottom() { return this.y + this.h; }
}

const hook = (name, ...a) => { if (typeof UI !== 'undefined' && UI[name]) return UI[name](...a); };
const sfx = (name, v) => { if (typeof Sfx !== 'undefined') Sfx.play(name, v); };

const Game = {
  mode: 'title',
  paused: false,

  /* ======================= Khởi tạo ======================= */
  newGame(seed) {
    this.seed = (seed || (Date.now() % 1e9)) >>> 0;
    this.rng = new RNG(this.seed ^ 0x9e3779b9);
    this.world = new Overworld(this.seed);
    this.inv = new Inventory();
    this.structures = [];
    this.bags = [];
    this.time = 0.04;
    this.day = 1;
    this.cleared = {};
    this.placed = [];
    this.won = false;
    this.goal = 0;
    this.stats = { kills: 0, deaths: 0, crafted: 0, eaten: 0, harvested: 0, dungeonsEntered: 0, bossKills: 0, playTime: 0, nights: 0 };
    this.player = new Player(this.world.spawnX - 40, this.world.groundY(this.world.spawnX - 40));
    this.player.spawn = { x: this.world.spawnX - 40, y: this.world.groundY(this.world.spawnX - 40) };
    this.enterOverworld(null);
    this.mode = 'play';
    this.paused = false;
    hook('onStart', true);
  },

  /* Thế giới minh họa phía sau màn hình tiêu đề */
  setupDemo() {
    if (!this.demo) this.demo = new Overworld(20251119);
    this.world = this.demo;
    this.seed = this.demo.seed;
    this.inv = new Inventory();
    this.structures = [{ type: 'lua_trai', x: this.demo.spawnX + 70, y: this.demo.groundY(this.demo.spawnX + 70), fuel: 1e9 }];
    this.bags = []; this.placed = []; this.cleared = {}; this.won = false;
    this.day = 1; this.time = 0.52;
    this.stats = { kills: 0, deaths: 0, crafted: 0, eaten: 0, harvested: 0, dungeonsEntered: 0, bossKills: 0, playTime: 0, nights: 0 };
    this.player = new Player(this.demo.spawnX, this.demo.groundY(this.demo.spawnX));
    this.player.med = { t: 0 };
    this.enterOverworld(null);
    this.cam.x = this.demo.spawnX - 500;
  },
  demoTick(dt) {
    this.time = (this.time + dt / 900) % 1;
    this.cam.x += dt * 22;
    if (this.cam.x > this.world.w - 1200) this.cam.x = 300;
    this.cam.y = this.world.groundY(this.cam.x + 480) - (typeof Renderer !== 'undefined' ? Renderer.vh : 540) * 0.62;
    this.updateParticles(dt);
  },

  resetTransient() {
    this.mobs = []; this.projs = []; this.drops = []; this.zones = []; this.parts = []; this.texts = [];
    this.hitStop = 0; this.spawnT = 0; this.boss = null; this.trib = null; this.prompt = null; this.interactTarget = null;
    this.cam = this.cam || { x: 0, y: 0, shake: 0 };
  },

  enterOverworld(at) {
    this.resetTransient();
    this.level = this.world;
    this.dungeon = null;
    this.inDungeon = null;
    const p = this.player;
    if (at) { p.x = at.x - p.w / 2; p.y = this.topY(at.x) - p.h - 0.01; }
    p.vx = 0; p.vy = 0;
    this.snapCamera();
  },

  /* ======================= Trạng thái ======================= */
  hours() { return (this.time * 24 + 5) % 24; },
  isNight() { const h = this.hours(); return h >= 19.5 || h < 5; },
  bloodMoon() { return this.isNight() && this.day % 4 === 0; },
  realmDef(r) { return DATA.realms[r == null ? this.player.realm : r]; },
  unlocked(key) { const u = DATA.unlocks.find((x) => x.key === key); return !!u && this.player.realm >= u.realm; },
  armorDef() { return this.inv.armor ? DATA.items[this.inv.armor] : null; },
  maxHp() { return this.realmDef().hp; },
  maxMp() { const a = this.armorDef(); return this.realmDef().mp + (a && a.mp ? a.mp : 0); },
  defense() { const a = this.armorDef(); return a ? a.def : 0; },
  heldDef() { return this.inv.selectedDef(); },
  weaponDmg() { const d = this.heldDef(); return d && d.dmg ? d.dmg : 3; },
  lightRadius() { const d = this.heldDef(); return d && d.light ? d.light : 0; },
  hasStructure(type) { return this.structures.some((s) => s.type === type); },
  topY(x) { return this.level.topSolid(M.clamp(Math.floor(x / TILE), 0, this.level.cols - 1)) * TILE; },
  diffMult() {
    const d = Math.min(this.day - 1, 15);
    let hp = 1 + 0.12 * d, dmg = 1 + 0.06 * d;
    if (this.bloodMoon()) { hp *= 1.25; dmg *= 1.25; }
    const b = this.world.biomeAtX(this.player.cx).id;
    const z = b === 'loi_phong' ? 1.8 : b === 'han_dam' ? 1.5 : b === 'xich_thach' ? 1.3 : 1;
    return { hp: hp * z, dmg: dmg * z };
  },

  /* ======================= Vòng cập nhật ======================= */
  update(dt) {
    if (this.mode !== 'play' || this.paused) { this.updateParticles(dt * 0.5); return; }
    this.stats.playTime += dt;
    if (this.hitStop > 0) { this.hitStop -= dt; this.updateParticles(dt); return; }
    const wasNight = this.isNight();
    this.time += dt / DATA.DAY_SEC;
    if (this.time >= 1) { this.time -= 1; this.newDay(); }
    if (!wasNight && this.isNight()) {
      this.stats.nights++;
      hook('banner', this.bloodMoon() ? 'Huyết Nguyệt xuất hiện!' : 'Màn đêm buông xuống', this.bloodMoon() ? 'Yêu ma cuồng bạo, hãy cố thủ bên lửa trại' : 'Yêu ma bắt đầu xuất hiện', this.bloodMoon() ? 'blood' : 'night');
      sfx('night');
    }
    if (wasNight && !this.isNight()) hook('banner', 'Bình minh', 'Ngày ' + this.day, 'day');
    this.updatePlayer(dt);
    for (const m of this.mobs) this.updateMob(m, dt);
    this.mobs = this.mobs.filter((m) => m.alive || m.dying > 0);
    this.updateProjectiles(dt);
    this.updateZones(dt);
    this.updateDrops(dt);
    this.updateParticles(dt);
    this.updateSurvival(dt);
    if (this.level === this.world) { this.updateStructures(dt); this.spawner(dt); }
    else this.updateDungeon(dt);
    if (this.trib) this.updateTrib(dt);
    this.findInteract();
    this.updateCamera(dt);
    this.goalT = (this.goalT || 0) - dt;
    if (this.goalT <= 0) { this.goalT = 0.5; this.checkGoals(); }
    this.saveT = (this.saveT || 0) + dt;
    if (this.saveT > 30 && this.level === this.world) { this.saveT = 0; this.save(); }
  },

  newDay() {
    this.day++;
    for (const r of this.world.resources) if (!r.alive && r.regrowDay <= this.day) { r.alive = true; r.hp = DATA.resources[r.type].hp; }
  },

  /* ======================= Người chơi ======================= */
  updatePlayer(dt) {
    const p = this.player, I = Input;
    p.invT -= dt; p.dashCd -= dt; p.castCd -= dt; p.comboT -= dt; p.hurtT -= dt;
    p.stepOffset = M.approach(p.stepOffset, 0, 150 * dt);
    const move = (I.down('right') ? 1 : 0) - (I.down('left') ? 1 : 0);
    if (p.med) {
      if (move || I.pressed('jump') || I.pressed('attack') || I.pressed('dash')) this.stopMeditate();
      else this.meditateTick(dt);
    }
    if (p.dashT > 0) {
      p.dashT -= dt;
      p.vx = p.face * DASH_V;
      p.vy = 0;
      if (Math.random() < 0.6) this.particle(p.cx, p.cy, -p.face * 40, 0, 0.3, 'ghost', '#e9e2cf', 10);
    } else {
      const target = p.med ? 0 : move * RUN;
      const acc = p.onGround ? (p.onIce ? 380 : 1700) : 1100;
      p.vx = M.approach(p.vx, target, acc * dt);
      if (move && !p.med) p.face = move;
    }
    if (p.onGround) { p.coyote = 0.1; p.airJumps = this.unlocked('doubleJump') ? 1 : 0; } else p.coyote -= dt;
    if (I.pressed('jump')) p.jumpBuf = 0.13; else p.jumpBuf -= dt;
    if (p.jumpBuf > 0 && !p.med && p.dashT <= 0) {
      if (p.coyote > 0) {
        p.vy = -JUMP_V; p.coyote = 0; p.jumpBuf = 0;
        sfx('jump');
        for (let i = 0; i < 5; i++) this.particle(p.cx, p.bottom, M.lerp(-60, 60, Math.random()), -20, 0.35, 'dust', '#cfc6ad', 3);
      } else if (p.airJumps > 0) {
        p.vy = -DJUMP_V; p.airJumps--; p.jumpBuf = 0;
        sfx('jump2');
        this.particle(p.cx, p.bottom, 0, 0, 0.35, 'ring', DATA.realmColor(p.realm), 16);
      }
    }
    if (I.released('jump') && p.vy < -170) p.vy = -170;
    p.flying = false;
    if (this.unlocked('flight') && !p.onGround && I.down('jump') && p.airJumps === 0 && p.vy > -60 && p.mp > 1) {
      p.vy = Math.max(p.vy - 2400 * dt, -170);
      p.mp -= 12 * dt;
      p.flying = true;
    }
    if (p.dashT <= 0) p.vy = Math.min(MAX_FALL, p.vy + GRAV * dt);
    if (I.pressed('dash') && this.unlocked('dash') && p.dashCd <= 0 && p.mp >= 6 && !p.med) {
      p.dashT = 0.18; p.dashCd = 0.7; p.mp -= 6; p.invT = Math.max(p.invT, 0.24);
      sfx('dash');
    }
    Phys.move(p, this.level, dt);
    if (this.level.kind === 'dungeon') {
      if (this.level.boxHazard(p.x, p.y, p.w, p.h) || p.y > this.level.h) this.hazardHit();
      else if (p.onGround && !this.nearHazard(p)) p.lastSafe = { x: p.x, y: p.y };
    }
    if (I.pressed('attack') && !p.med) this.startAttack();
    this.updateAttack(dt);
    if (I.pressed('skill') && !p.med) this.castFireball();
    if (I.pressed('use')) this.useSelected();
    if (I.pressed('interact')) this.interact();
    if (I.pressed('meditate')) { if (p.med) this.stopMeditate(); else this.startMeditate(null); }
    for (let i = 0; i < 8; i++) if (I.pressed('slot' + (i + 1))) this.inv.sel = i;
    if (I.pressed('next')) this.inv.sel = (this.inv.sel + 1) % 8;
    if (I.pressed('prev')) this.inv.sel = (this.inv.sel + 7) % 8;
    p.anim += dt * (Math.abs(p.vx) > 10 ? Math.abs(p.vx) / 28 : 1.2);
  },

  nearHazard(p) {
    const c = Math.floor(p.cx / TILE), r = Math.floor(p.bottom / TILE);
    for (let dc = -1; dc <= 1; dc++) for (let dr = 0; dr <= 4; dr++) if (this.level.hazard(c + dc, r + dr)) return true;
    return false;
  },

  hazardHit() {
    const p = this.player;
    const dmg = Math.round(this.maxHp() * 0.15);
    this.text(p.cx, p.y - 6, '-' + dmg, '#ff7a6a');
    p.hp -= dmg;
    sfx('hurt');
    this.shake(6);
    const col = this.dungeon.def.pal.hazard;
    for (let i = 0; i < 14; i++) this.particle(p.cx, p.bottom, M.lerp(-120, 120, Math.random()), -Math.random() * 260, 0.6, 'spark', col, 4);
    if (p.hp <= 0) { this.die(); return; }
    p.x = p.lastSafe.x; p.y = p.lastSafe.y - 2; p.vx = 0; p.vy = 0; p.invT = 1;
  },

  hurtPlayer(dmg, dir, src) {
    const p = this.player;
    if (p.invT > 0 || this.mode !== 'play') return;
    const real = Math.max(1, Math.round(dmg * 100 / (100 + this.defense())));
    p.hp -= real;
    p.invT = 0.8; p.hurtT = 0.25;
    p.vx = (dir || -p.face) * 230; p.vy = -260; p.dashT = 0;
    if (p.med) this.stopMeditate();
    this.text(p.cx, p.y - 6, '-' + real, '#ff7a6a');
    this.shake(5);
    sfx('hurt');
    for (let i = 0; i < 8; i++) this.particle(p.cx, p.cy, M.lerp(-150, 150, Math.random()), M.lerp(-200, 40, Math.random()), 0.5, 'ink', '#a8261c', 3);
    if (p.hp <= 0) this.die(src);
  },

  /* ---------- Tấn công ---------- */
  startAttack() {
    const p = this.player;
    if (p.atkT > 0) { if (p.atkElapsed > 0.14) p.queued = true; return; }
    p.combo = p.comboT > 0 ? (p.combo % 3) + 1 : 1;
    p.atkT = p.combo === 3 ? 0.36 : 0.3;
    p.atkElapsed = 0; p.hits.clear(); p.harvested = false; p.waved = false; p.comboT = 0.6;
    sfx('swing');
  },
  attackBox() {
    const p = this.player, w = 38;
    return { x: p.face > 0 ? p.cx - 2 : p.cx - w + 2, y: p.y - 6, w, h: p.h + 10 };
  },
  updateAttack(dt) {
    const p = this.player;
    if (p.atkT <= 0) { if (p.queued) { p.queued = false; this.startAttack(); } return; }
    p.atkElapsed += dt; p.atkT -= dt;
    if (p.atkElapsed < 0.05 || p.atkElapsed > 0.17) return;
    const box = this.attackBox();
    const held = this.heldDef();
    const base = this.weaponDmg() * this.realmDef().dmg * (p.combo === 3 ? 1.5 : 1);
    let hitAny = false;
    for (const m of this.mobs) {
      if (!m.alive || p.hits.has(m) || !M.overlap(box, m)) continue;
      p.hits.add(m);
      hitAny = true;
      const crit = Math.random() < 0.08;
      this.damageMob(m, base * (crit ? 1.8 : 1) * M.lerp(0.9, 1.1, Math.random()), p.face, { knock: p.combo === 3 ? 1.6 : 1, el: held && held.el, crit, melee: true });
    }
    if (!hitAny && !p.harvested) {
      p.harvested = this.harvestAt(box) || this.hitWallAt(box);
    }
    if (p.combo === 3 && !p.waved && this.unlocked('swordWave') && p.atkElapsed > 0.08) {
      p.waved = true;
      this.projs.push({ x: p.cx + p.face * 14, y: p.cy - 2, vx: p.face * 520, vy: 0, r: 10, dmg: base * 0.6, owner: 'player', kind: 'wave', life: 0.5, pierce: true, hit: new Set() });
      sfx('wave');
    }
  },
  castFireball() {
    const p = this.player;
    if (!this.unlocked('fireball')) { hook('toast', 'Đạt Luyện Khí Tầng 2 để lĩnh ngộ Hỏa Cầu Thuật', 'info'); return; }
    if (p.castCd > 0) return;
    if (p.mp < 10) { hook('toast', 'Không đủ linh lực', 'bad'); return; }
    p.mp -= 10; p.castCd = 0.45;
    const dmg = 14 * this.realmDef().dmg * (1 + p.realm * 0.04);
    const angles = this.unlocked('fireFan') ? [-0.16, 0, 0.16] : [0];
    /* tự ngắm yêu ma gần nhất phía trước (trong góc ±60°) */
    let base = p.face > 0 ? 0 : Math.PI, best = 1e9;
    for (const m of this.mobs) {
      if (!m.alive || m.ai === 'passive') continue;
      const dx = m.cx - p.cx, dy = m.cy - (p.cy - 4), d = Math.hypot(dx, dy);
      if (d > 460 || Math.sign(dx) !== p.face) continue;
      const a = Math.atan2(dy, dx);
      if (Math.abs(Math.atan2(Math.sin(a - base), Math.cos(a - base))) > 1.05) continue;
      if (d < best) { best = d; this._aim = a; }
    }
    if (best < 1e9) base = this._aim;
    for (const a of angles) {
      this.projs.push({ x: p.cx + p.face * 10, y: p.cy - 4, vx: Math.cos(base + a) * 400, vy: Math.sin(base + a) * 400, r: 6, dmg, owner: 'player', kind: 'fireball', life: 1.4, hit: new Set() });
    }
    sfx('fire');
  },

  damageMob(m, dmg, dir, o = {}) {
    if (!m.alive) return;
    if (m.def.armor) dmg *= 1 - m.def.armor;
    dmg = Math.max(1, Math.round(dmg));
    m.hp -= dmg;
    m.flash = 0.12;
    m.aggro = true;
    if (!m.boss) {
      m.vx = dir * 170 * (o.knock || 1);
      if (!m.fly) m.vy = Math.min(m.vy, -130);
      m.stun = 0.16;
    }
    if (o.el === 'hoa') { m.burn = 3; m.burnDps = dmg * 0.15; }
    if (o.el === 'thuy') m.slow = 2;
    if (o.el === 'moc') this.player.hp = Math.min(this.maxHp(), this.player.hp + 1);
    if (o.el === 'loi' && Math.random() < 0.2) this.zones.push({ x: m.cx - 16, y: m.y - 260, w: 32, h: 260 + m.h, delay: 0.05, dur: 0.25, dmg: dmg * 0.8, kind: 'bolt', owner: 'player', t: 0, hit: new Set() });
    this.text(m.cx, m.y - 4, (o.crit ? '✦' : '') + dmg, o.crit ? '#ffd27a' : '#f4ead2', o.crit);
    for (let i = 0; i < 6; i++) this.particle(m.cx, m.cy, dir * M.lerp(40, 220, Math.random()), M.lerp(-180, 40, Math.random()), 0.45, 'ink', '#15120f', 3);
    if (o.melee) this.hitStop = Math.max(this.hitStop, o.crit ? 0.07 : 0.035);
    sfx(o.crit ? 'crit' : 'hit');
    if (m.hp <= 0) this.killMob(m);
  },

  killMob(m) {
    m.alive = false;
    m.dying = 0.5;
    this.stats.kills++;
    const def = m.def;
    for (let i = 0; i < 16; i++) this.particle(m.cx, m.cy, M.lerp(-220, 220, Math.random()), M.lerp(-260, 60, Math.random()), 0.8, 'ink', i % 3 ? '#15120f' : '#7a1f17', 4);
    const tv = (def.tuvi || 0) * (m.elite ? 2 : 1);
    if (tv) this.gainTuvi(tv);
    if (m.boss) return this.bossDefeated(m);
    for (const [id, a, b, ch] of def.drops || []) if (Math.random() < ch * (m.elite ? 1.5 : 1)) this.spawnDrop(id, a + Math.floor(Math.random() * (b - a + 1)), m.cx, m.cy);
    if (this.dungeon && Math.random() < (m.elite ? 0.12 : 0.03)) this.spawnDrop(this.dungeon.def.core, 1, m.cx, m.cy);
    sfx('kill');
  },

  /* ---------- Khai thác ---------- */
  harvestAt(box) {
    if (this.level !== this.world) return false;
    for (const r of this.world.resources) {
      if (!r.alive) continue;
      const R = DATA.resources[r.type];
      const rb = { x: r.x - R.w / 2, y: r.y - R.h * (R.tool === 'axe' ? 0.5 : 1), w: R.w, h: R.h * (R.tool === 'axe' ? 0.5 : 1) };
      if (!M.overlap(box, rb)) continue;
      const held = this.heldDef() || {};
      let power = 1;
      if (R.tool === 'axe') power = held.axe || 1;
      else if (R.tool === 'pick') {
        const tier = held.pickTier || 0;
        if (tier < (R.tier || 0)) {
          hook('toast', R.name + ' cần ' + (R.tier >= 2 ? 'cuốc sắt' : 'cuốc đá') + ' trở lên', 'bad');
          r.shake = 0.2;
          sfx('clink');
          return true;
        }
        power = held.pick || 1;
      }
      r.hp -= power;
      r.shake = 0.25;
      sfx(R.tool === 'pick' ? 'mine' : R.tool === 'axe' ? 'chop' : 'pluck');
      const col = R.tool === 'pick' ? '#bdb6a5' : R.tool === 'axe' ? '#8a6a44' : '#7fb08a';
      for (let i = 0; i < 5; i++) this.particle(r.x, r.y - 14, M.lerp(-120, 120, Math.random()), M.lerp(-220, -40, Math.random()), 0.5, 'chip', col, 3);
      if (r.hp <= 0) {
        r.alive = false;
        r.regrowDay = this.day + R.regrow;
        this.stats.harvested++;
        for (const [id, a, b, ch] of R.drops) if (Math.random() < ch) this.spawnDrop(id, a + Math.floor(Math.random() * (b - a + 1)), r.x, r.y - 20);
        if (R.tool === 'axe') sfx('fall');
      }
      return true;
    }
    return false;
  },
  hitWallAt(box) {
    const lv = this.level;
    const c0 = Math.floor(box.x / TILE), c1 = Math.floor((box.x + box.w) / TILE);
    const r0 = Math.floor(box.y / TILE), r1 = Math.floor((box.y + box.h) / TILE);
    for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) {
      const t = lv.get(c, r);
      if (t !== T_WOOD && t !== T_STONE) continue;
      this.damageWall(c, r, 20, true);
      return true;
    }
    return false;
  },
  damageWall(c, r, dmg, byPlayer) {
    const lv = this.level, key = c * 1000 + r;
    const t = lv.get(c, r);
    const hp = (lv.wallHp.has(key) ? lv.wallHp.get(key) : DATA.walls[t].hp) - dmg;
    sfx('chop');
    for (let i = 0; i < 4; i++) this.particle(c * TILE + 8, r * TILE + 8, M.lerp(-100, 100, Math.random()), -Math.random() * 150, 0.5, 'chip', t === T_WOOD ? '#8a6a44' : '#9a958a', 3);
    if (hp > 0) { lv.wallHp.set(key, hp); return; }
    lv.wallHp.delete(key);
    lv.set(c, r, T_AIR);
    if (byPlayer && Math.random() < 0.5) this.spawnDrop(t === T_WOOD ? 'tuong_go' : 'tuong_da', 1, c * TILE + 8, r * TILE);
  },

  /* ---------- Vật phẩm rơi ---------- */
  spawnDrop(id, n, x, y) {
    if (!n || !DATA.items[id]) return;
    this.drops.push({ id, n, x: x - 5, y: y - 5, w: 10, h: 10, vx: M.lerp(-90, 90, Math.random()), vy: -200 - Math.random() * 120, t: 0, onGround: false });
  },
  updateDrops(dt) {
    const p = this.player;
    for (const d of this.drops) {
      d.t += dt;
      const dx = p.cx - (d.x + 5), dy = p.cy - (d.y + 5), dist = Math.hypot(dx, dy);
      if (d.t > 0.35 && dist < 70) {
        d.vx = dx / dist * 260; d.vy = dy / dist * 260;
        d.x += d.vx * dt; d.y += d.vy * dt;
      } else {
        d.vy = Math.min(MAX_FALL, d.vy + GRAV * dt);
        if (d.onGround) d.vx *= 0.85;
        Phys.move(d, this.level, dt);
      }
      if (d.t > 0.3 && dist < 14) {
        const left = this.inv.add(d.id, d.n);
        const got = d.n - left;
        if (got > 0) { hook('pickup', d.id, got); sfx('pickup'); }
        d.n = left;
        if (left > 0 && !d.fullWarned) { d.fullWarned = true; hook('toast', 'Túi đồ đã đầy', 'bad'); }
      }
    }
    this.drops = this.drops.filter((d) => d.n > 0 && d.t < 600);
  },

  /* ======================= Yêu thú ======================= */
  updateMob(m, dt) {
    if (!m.alive) { m.dying -= dt; return; }
    const p = this.player;
    const dx = p.cx - m.cx, dy = p.cy - m.cy, dist = Math.hypot(dx, dy);
    if (m.sleep) { if (dist < 620) m.sleep = false; else return; }
    m.anim += dt;
    m.flash -= dt; m.touchCd -= dt; m.cd -= dt; m.slow -= dt;
    if (m.burn > 0) { m.burn -= dt; m.burnT = (m.burnT || 0) - dt; if (m.burnT <= 0) { m.burnT = 0.5; this.damageMob(m, m.burnDps * 0.5, 0, {}); if (!m.alive) return; this.particle(m.cx, m.y, 0, -60, 0.5, 'ember', '#ff8a3c', 3); } }
    if (m.def.sunburn && this.level === this.world && !this.isNight()) {
      m.sunT = (m.sunT || 0) - dt;
      if (m.sunT <= 0) { m.sunT = 0.5; this.damageMob(m, m.maxHp * 0.12, 0, {}); if (!m.alive) return; this.particle(m.cx, m.y, 0, -80, 0.6, 'smoke', '#e9e2cf', 6); }
    }
    const spd = (m.def.speed || 60) * (m.slow > 0 ? 0.5 : 1);
    if (m.stun > 0) {
      m.stun -= dt;
      if (!m.fly) m.vy = Math.min(MAX_FALL, m.vy + GRAV * dt); else { m.vx *= 0.9; m.vy *= 0.9; }
      Phys.move(m, this.level, dt, m.ai === 'ghost');
      return;
    }
    const face = Math.sign(dx) || 1;
    switch (m.ai) {
      case 'boss': this.bossAI(m, dt, dx, dy, dist); break;
      case 'passive':
        if (dist < 150 || m.flash > -1.5) { m.vx = M.approach(m.vx, -face * spd * 1.2, 900 * dt); m.face = -face; }
        else this.wander(m, dt, spd * 0.4);
        if (m.hitWall && m.onGround) m.vy = -330;
        break;
      case 'walker':
        if (m.aggro && dist < 460) {
          m.face = face;
          const stop = this.ledgeAhead(m) && dy < 20;
          m.vx = M.approach(m.vx, stop ? 0 : face * spd, 900 * dt);
          if (m.hitWall && m.onGround) { if (!this.attackWallAhead(m, dt)) m.vy = -390; }
        } else this.wander(m, dt, spd * 0.35);
        break;
      case 'charger':
        if (!m.aggro) { this.wander(m, dt, spd * 0.4); break; }
        if (m.state === 'idle' || m.state === 'walk') {
          m.face = face;
          m.vx = M.approach(m.vx, face * spd * 0.6, 600 * dt);
          if (dist < 300 && Math.abs(dy) < 60 && m.cd <= 0) { m.state = 'wind'; m.t = 0.55; m.vx = 0; }
          if (m.hitWall && m.onGround) m.vy = -380;
        } else if (m.state === 'wind') {
          m.vx = 0; m.t -= dt; m.windup = 1;
          if (m.t <= 0) { m.state = 'charge'; m.t = 0.85; m.windup = 0; sfx('charge'); }
        } else if (m.state === 'charge') {
          m.vx = m.face * spd * 3.4; m.t -= dt;
          if (m.t <= 0 || m.hitWall || (this.ledgeAhead(m) && this.level.kind === 'dungeon')) { m.state = 'idle'; m.cd = 1.2; m.vx = 0; }
        }
        break;
      case 'hopper':
        if (m.aggro && dist < 520) {
          m.face = face;
          if (m.onGround) { m.vx *= 0.8; if (m.cd <= 0 && !(this.ledgeAhead(m) && dy < 20)) { m.vy = -360; m.vx = face * spd * 1.3; m.cd = 0.85; } }
          if (m.hitWall && m.onGround) this.attackWallAhead(m, dt);
        } else this.wander(m, dt, spd * 0.2);
        break;
      case 'flyer': {
        const tx = p.cx + Math.sin(m.anim * 2) * 50, ty = p.cy - 34 + Math.cos(m.anim * 3) * 16;
        if (dist < 520) { m.vx = M.approach(m.vx, M.clamp((tx - m.cx) * 2, -spd, spd), 500 * dt); m.vy = M.approach(m.vy, M.clamp((ty - m.cy) * 2, -spd, spd), 500 * dt); }
        else { m.vx *= 0.95; m.vy = Math.sin(m.anim * 2) * 20; }
        m.face = face;
        break;
      }
      case 'diver':
        if (m.state === 'dive') {
          m.t -= dt;
          if (m.t <= 0 || m.onGround || m.hitWall) { m.state = 'rise'; m.t = 0.8; }
        } else if (m.state === 'rise') {
          m.vy = -spd * 0.8; m.vx *= 0.97; m.t -= dt;
          if (m.t <= 0) { m.state = 'hover'; m.cd = 1 + Math.random(); }
        } else {
          const tx = p.cx, ty = p.cy - 150;
          m.vx = M.approach(m.vx, M.clamp((tx - m.cx) * 2, -spd, spd), 400 * dt);
          m.vy = M.approach(m.vy, M.clamp((ty - m.cy) * 2, -spd * 0.7, spd * 0.7), 400 * dt);
          m.face = face;
          if (dist < 420 && Math.abs(dx) < 60 && m.cd <= 0) { m.state = 'dive'; m.t = 0.7; m.vx = face * spd * 0.5; m.vy = spd * 2.6; sfx('screech'); }
        }
        break;
      case 'ghost':
        if (dist < 600) {
          m.vx = M.approach(m.vx, M.clamp(dx, -spd, spd), 200 * dt);
          m.vy = M.approach(m.vy, M.clamp(dy - 6 + Math.sin(m.anim * 2.5) * 30, -spd, spd), 200 * dt);
        } else { m.vx *= 0.97; m.vy *= 0.97; }
        m.face = face;
        break;
      case 'shooter':
      case 'turret': {
        m.face = face;
        if (m.ai === 'shooter') {
          let want = 0;
          if (dist < 170) want = -face; else if (dist > 330) want = face;
          if (m.fly) {
            m.vx = M.approach(m.vx, want * spd, 400 * dt);
            m.vy = M.approach(m.vy, M.clamp((p.cy - 70 - m.cy) * 2, -spd, spd), 400 * dt);
          } else {
            if (want && this.ledgeAhead(m)) want = 0;
            m.vx = M.approach(m.vx, want * spd, 600 * dt);
          }
        }
        if (dist < 480 && m.cd <= 0 && m.windup <= 0) { m.windup = 0.4; }
        if (m.windup > 0) {
          m.windup -= dt;
          if (m.windup <= 0) {
            m.cd = m.ai === 'turret' ? 2.4 : 1.9 + Math.random() * 0.6;
            this.enemyShot(m, m.ai === 'turret' ? [-0.25, 0, 0.25] : [0]);
          }
        }
        break;
      }
    }
    if (!m.fly && m.ai !== 'boss') m.vy = Math.min(MAX_FALL, m.vy + GRAV * dt);
    if (m.ai === 'boss' && !m.fly) m.vy = Math.min(MAX_FALL, m.vy + GRAV * dt);
    Phys.move(m, this.level, dt, m.ai === 'ghost');
    if (this.level.kind === 'dungeon' && !m.fly && this.level.boxHazard(m.x, m.y, m.w, m.h)) { m.alive = false; m.dying = 0.3; return; }
    if (this.level === this.world && !m.boss && Math.abs(dx) > 1700) { m.alive = false; m.dying = 0; return; }
    if (m.ai !== 'passive' && m.aggro && m.touchCd <= 0 && M.overlap(m, p)) {
      m.touchCd = 0.9;
      this.hurtPlayer(m.dmg * (m.state === 'charge' || m.state === 'dive' ? 1.4 : 1), Math.sign(p.cx - m.cx) || 1, m);
    }
  },

  wander(m, dt, spd) {
    m.t -= dt;
    if (m.t <= 0) { m.t = 1.5 + Math.random() * 2.5; m.wdir = Math.random() < 0.4 ? 0 : Math.random() < 0.5 ? -1 : 1; if (Math.abs(m.cx - m.homeX) > 200) m.wdir = Math.sign(m.homeX - m.cx); }
    let want = (m.wdir || 0) * spd;
    if (want && this.ledgeAhead(m)) { want = 0; m.wdir = -m.wdir; }
    if (m.fly) { m.vx = M.approach(m.vx, want, 200 * dt); m.vy = Math.sin(m.anim * 1.7) * 25; }
    else m.vx = M.approach(m.vx, want, 500 * dt);
    if (want) m.face = Math.sign(want);
    if (m.hitWall && m.onGround && !m.fly) m.vy = -340;
  },

  ledgeAhead(m) {
    if (!m.onGround || m.fly) return false;
    const c = Math.floor((m.face > 0 ? m.x + m.w + 4 : m.x - 4) / TILE);
    const r = Math.floor((m.bottom + 2) / TILE);
    for (let i = 0; i < 4; i++) {
      if (this.level.hazard(c, r + i)) return true;
      if (this.level.solid(c, r + i)) return false;
    }
    return true;
  },

  attackWallAhead(m, dt) {
    const c = Math.floor((m.face > 0 ? m.x + m.w + 2 : m.x - 2) / TILE);
    for (let r = Math.floor(m.y / TILE); r <= Math.floor((m.bottom - 1) / TILE); r++) {
      const t = this.level.get(c, r);
      if (t === T_WOOD || t === T_STONE) {
        m.wallT = (m.wallT || 0) - dt;
        if (m.wallT <= 0) { m.wallT = 1; this.damageWall(c, r, m.dmg, false); }
        return true;
      }
    }
    return false;
  },

  enemyShot(m, angles) {
    const p = this.player;
    const kind = m.def.shot || 'fire';
    const ang = Math.atan2(p.cy - m.cy, p.cx - m.cx);
    const speed = kind === 'bolt' ? 360 : kind === 'seed' ? 260 : 240;
    for (const a of angles) {
      const pr = { x: m.cx, y: m.cy - 4, vx: Math.cos(ang + a) * speed, vy: Math.sin(ang + a) * speed, r: 6, dmg: m.dmg, owner: 'enemy', kind, life: 3 };
      if (kind === 'seed') { pr.grav = 600; pr.vy -= 140; }
      this.projs.push(pr);
    }
    sfx('shoot');
  },

  /* ---------- Thủ lĩnh ---------- */
  bossAI(m, dt, dx, dy, dist) {
    const p = this.player, A = this.dungeon.arena;
    const look = m.def.look;
    if (m.phase === 1 && m.hp < m.maxHp * 0.5) {
      m.phase = 2;
      hook('banner', m.def.name + ' nổi giận!', 'Giai đoạn hai', 'blood');
      sfx('roar');
      const add = { treeKing: 'doc_phong', dragon: 'hoa_linh', phoenix: 'thuy_quy', thunderGolem: 'loi_dieu' }[look];
      for (let i = 0; i < 2; i++) this.mobs.push(new Mob(add, A.x0 + 120 + i * (A.x1 - A.x0 - 240), A.y - 120, { hpMult: 1 }));
    }
    const fast = m.phase === 2 ? 0.72 : 1;
    const face = Math.sign(dx) || 1;
    if (look === 'treeKing' || look === 'thunderGolem') {
      if (m.state === 'charge') {
        m.vx = m.face * 380; m.t -= dt;
        if (m.t <= 0 || m.hitWall) { m.state = 'idle'; m.vx = 0; m.cd = 1.2 * fast; }
        return;
      }
      if (m.state === 'wind') { m.vx = 0; m.t -= dt; if (m.t <= 0) { m.state = 'charge'; m.t = 0.8; sfx('charge'); } return; }
      m.face = face;
      m.vx = M.approach(m.vx, Math.abs(dx) > 70 ? face * (look === 'treeKing' ? 40 : 55) : 0, 300 * dt);
      if (m.cd > 0) return;
      const pats = look === 'treeKing' ? ['roots', 'seeds', 'slam'] : ['strikes', 'shock', 'charge'];
      const pat = pats[m.pattern++ % pats.length];
      m.cd = 2.4 * fast;
      if (pat === 'roots') {
        const xs = [p.cx - 70, p.cx, p.cx + 70];
        for (const x of xs) this.zones.push({ x: x - 18, y: A.y - 56, w: 36, h: 56, delay: 0.85 * fast + 0.15, dur: 0.4, dmg: m.dmg, kind: 'root', owner: 'enemy', t: 0 });
        sfx('rumble');
      } else if (pat === 'seeds') {
        for (let i = 0; i < 5; i++) {
          const vx = (p.cx - m.cx) / 1.1 + (i - 2) * 50;
          this.projs.push({ x: m.cx, y: m.y + 20, vx, vy: -420 - i * 20, grav: 700, r: 7, dmg: m.dmg * 0.8, owner: 'enemy', kind: 'seed', life: 3 });
        }
        sfx('shoot');
      } else if (pat === 'slam' || pat === 'shock') {
        for (const s of [-1, 1]) this.projs.push({ x: m.cx, y: A.y - 12, vx: s * 300, vy: 0, r: 10, dmg: m.dmg * 0.9, owner: 'enemy', kind: look === 'thunderGolem' ? 'shock' : 'quake', life: 2.2, ground: true });
        this.shake(10); sfx('slam');
      } else if (pat === 'strikes') {
        const n = m.phase === 2 ? 6 : 4;
        for (let i = 0; i < n; i++) {
          const x = i === 0 ? p.cx : M.lerp(A.x0 + 40, A.x1 - 40, Math.random());
          this.zones.push({ x: x - 22, y: 0, w: 44, h: A.y, delay: 1.0 * fast + i * 0.12, dur: 0.3, dmg: m.dmg, kind: 'bolt', owner: 'enemy', t: 0 });
        }
        sfx('thunder');
      } else if (pat === 'charge') {
        m.state = 'wind'; m.t = 0.6; m.face = face;
      }
      return;
    }
    /* Thủ lĩnh bay: Xích Viêm Long, Băng Phượng */
    if (m.state === 'swoop') {
      m.t -= dt;
      m.vx = m.swoopDir * 520; m.vy = (m.swoopY - m.cy) * 4;
      if (m.t <= 0 || m.cx < A.x0 + 40 || m.cx > A.x1 - 40) { m.state = 'idle'; m.cd = 1.4 * fast; }
      return;
    }
    if (m.state === 'dive') {
      m.t -= dt;
      if (m.t <= 0 || m.bottom > A.y - 6) { m.state = 'rise'; m.t = 1; }
      return;
    }
    if (m.state === 'rise') { m.vy = -220; m.vx *= 0.96; m.t -= dt; if (m.t <= 0 || m.cy < A.y - 170) { m.state = 'idle'; } return; }
    if (m.state === 'tele') {
      m.t -= dt; m.vx *= 0.9; m.vy *= 0.9;
      if (m.t <= 0) {
        if (m.next === 'dive') { m.state = 'dive'; m.t = 0.9; const ang = Math.atan2(m.tgtY - m.cy, m.tgtX - m.cx); m.vx = Math.cos(ang) * 560; m.vy = Math.sin(ang) * 560; sfx('screech'); }
        else { m.state = 'swoop'; m.t = 1.6; sfx('screech'); }
      }
      return;
    }
    const hx = M.clamp(p.cx + Math.sin(m.anim * 0.8) * 160, A.x0 + 60, A.x1 - 60), hy = A.y - 140 + Math.sin(m.anim * 1.6) * 24;
    m.vx = M.approach(m.vx, M.clamp((hx - m.cx) * 1.6, -220, 220), 500 * dt);
    m.vy = M.approach(m.vy, M.clamp((hy - m.cy) * 1.6, -200, 200), 500 * dt);
    m.face = face;
    if (m.cd > 0) return;
    const pats = look === 'dragon' ? ['breath', 'dive', 'embers'] : ['fan', 'swoop', 'frost'];
    const pat = pats[m.pattern++ % pats.length];
    m.cd = 2.6 * fast;
    if (pat === 'breath') {
      const base = Math.atan2(p.cy - m.cy, p.cx - m.cx);
      for (let i = 0; i < 9; i++) this.projs.push({ x: m.cx, y: m.cy, vx: Math.cos(base + (i - 4) * 0.09) * (240 + i * 8), vy: Math.sin(base + (i - 4) * 0.09) * (240 + i * 8), r: 7, dmg: m.dmg * 0.7, owner: 'enemy', kind: 'fire', life: 2.5, delay: i * 0.06 });
      sfx('fire');
    } else if (pat === 'embers') {
      for (let i = 0; i < 8; i++) this.projs.push({ x: M.lerp(A.x0 + 30, A.x1 - 30, Math.random()), y: A.y - 330, vx: 0, vy: 60, grav: 300, r: 8, dmg: m.dmg * 0.7, owner: 'enemy', kind: 'fire', life: 4, delay: i * 0.25 });
    } else if (pat === 'fan') {
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; this.projs.push({ x: m.cx, y: m.cy, vx: Math.cos(a) * 230, vy: Math.sin(a) * 230, r: 6, dmg: m.dmg * 0.7, owner: 'enemy', kind: 'ice', life: 3 }); }
      sfx('ice');
    } else if (pat === 'frost') {
      for (const s of [-1, 1]) this.projs.push({ x: m.cx, y: A.y - 12, vx: s * 280, vy: 0, r: 10, dmg: m.dmg * 0.8, owner: 'enemy', kind: 'frost', life: 2.6, ground: true });
      sfx('ice');
    } else if (pat === 'dive') {
      m.state = 'tele'; m.t = 0.75; m.next = 'dive'; m.tgtX = p.cx; m.tgtY = A.y - 20;
      this.zones.push({ x: p.cx - 40, y: A.y - 10, w: 80, h: 10, delay: 0.75, dur: 0.01, dmg: 0, kind: 'mark', owner: 'enemy', t: 0 });
    } else if (pat === 'swoop') {
      m.swoopDir = p.cx > (A.x0 + A.x1) / 2 ? -1 : 1;
      m.x = (m.swoopDir > 0 ? A.x0 + 50 : A.x1 - 50) - m.w / 2;
      m.swoopY = p.cy;
      m.state = 'tele'; m.t = 0.8; m.next = 'swoop';
      this.zones.push({ x: A.x0, y: p.cy - 12, w: A.x1 - A.x0, h: 24, delay: 0.8, dur: 0.01, dmg: 0, kind: 'line', owner: 'enemy', t: 0 });
    }
  },

  /* ======================= Đạn & vùng nguy hiểm ======================= */
  updateProjectiles(dt) {
    const p = this.player;
    for (const pr of this.projs) {
      if (pr.delay > 0) { pr.delay -= dt; continue; }
      pr.life -= dt;
      if (pr.grav) pr.vy += pr.grav * dt;
      pr.x += pr.vx * dt; pr.y += pr.vy * dt;
      if (pr.ground) pr.y = this.groundUnder(pr.x, pr.y) - 12;
      if (Math.random() < 0.5) this.particle(pr.x, pr.y, -pr.vx * 0.1, -pr.vy * 0.1, 0.35, pr.kind === 'ice' || pr.kind === 'frost' ? 'spark' : 'ember', this.projColor(pr.kind), 3);
      const c = Math.floor(pr.x / TILE), r = Math.floor(pr.y / TILE);
      if (!pr.ground && this.level.solid(c, r)) { pr.life = 0; this.burst(pr.x, pr.y, this.projColor(pr.kind), 6); continue; }
      if (pr.ground && (this.level.solid(Math.floor((pr.x + Math.sign(pr.vx) * 8) / TILE), Math.floor((pr.y) / TILE)))) { pr.life = 0; continue; }
      if (pr.owner === 'player') {
        for (const m of this.mobs) {
          if (!m.alive || (pr.hit && pr.hit.has(m))) continue;
          if (Math.abs(m.cx - pr.x) < m.w / 2 + pr.r && Math.abs(m.cy - pr.y) < m.h / 2 + pr.r) {
            pr.hit.add(m);
            this.damageMob(m, pr.dmg, Math.sign(pr.vx) || 1, { knock: 0.6, el: pr.kind === 'fireball' ? 'hoa' : null });
            if (!pr.pierce) { pr.life = 0; this.burst(pr.x, pr.y, this.projColor(pr.kind), 8); break; }
          }
        }
      } else if (Math.abs(p.cx - pr.x) < p.w / 2 + pr.r && Math.abs(p.cy - pr.y) < p.h / 2 + pr.r) {
        this.hurtPlayer(pr.dmg, Math.sign(pr.vx) || 1);
        if (pr.kind === 'ice' || pr.kind === 'frost') p.vx *= 0.3;
        if (!pr.ground) pr.life = 0;
      }
    }
    this.projs = this.projs.filter((pr) => pr.life > 0);
  },
  groundUnder(x, y) {
    const c = Math.floor(x / TILE);
    for (let r = Math.floor(y / TILE); r < this.level.rows; r++) if (this.level.solid(c, r)) return r * TILE;
    return this.level.h;
  },
  projColor(k) { return { fireball: '#ffb347', wave: '#e9f6ff', seed: '#9be36b', fire: '#ff7a2f', ice: '#bfeaff', bolt: '#e1d6ff', frost: '#bfeaff', quake: '#8a6a44', shock: '#c7b8ff' }[k] || '#fff'; },

  updateZones(dt) {
    const p = this.player;
    for (const z of this.zones) {
      z.t += dt;
      if (z.t < z.delay) continue;
      if (!z.fired) {
        z.fired = true;
        if (z.kind === 'bolt') { sfx('thunder'); this.shake(6); this.flash = 0.12; }
        if (z.kind === 'root') sfx('slam');
      }
      if (z.owner === 'enemy' && z.dmg > 0 && !z.hitDone && M.overlap(z, p)) { z.hitDone = true; this.hurtPlayer(z.dmg, Math.sign(p.cx - (z.x + z.w / 2)) || 1); }
      if (z.owner === 'player') for (const m of this.mobs) if (m.alive && !z.hit.has(m) && M.overlap(z, m)) { z.hit.add(m); this.damageMob(m, z.dmg, 0, {}); }
    }
    this.zones = this.zones.filter((z) => z.t < z.delay + z.dur);
  },

  /* ======================= Hạt hiệu ứng ======================= */
  particle(x, y, vx, vy, life, kind, color, size) {
    if (this.parts.length > 700) return;
    this.parts.push({ x, y, vx, vy, life, max: life, kind, color, size });
  },
  burst(x, y, color, n) { for (let i = 0; i < n; i++) this.particle(x, y, M.lerp(-160, 160, Math.random()), M.lerp(-160, 160, Math.random()), 0.4, 'spark', color, 3); },
  text(x, y, s, color, big) { this.texts.push({ x, y, s, color, t: 0, big }); },
  shake(n) { this.cam.shake = Math.max(this.cam.shake, n); },
  updateParticles(dt) {
    for (const q of this.parts) {
      q.life -= dt;
      q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.kind === 'ink' || q.kind === 'chip' || q.kind === 'dust') q.vy += 700 * dt;
      if (q.kind === 'ember' || q.kind === 'smoke') q.vy -= 30 * dt;
      q.vx *= 0.98;
    }
    this.parts = this.parts.filter((q) => q.life > 0);
    for (const t of this.texts) { t.t += dt; t.y -= 40 * dt; }
    this.texts = this.texts.filter((t) => t.t < 0.9);
    if (this.flash > 0) this.flash -= dt;
  },

  /* ======================= Sinh tồn ======================= */
  updateSurvival(dt) {
    const p = this.player;
    const drain = DATA.HUNGER_PER_SEC * (p.med ? 1.6 : 1) * (p.dashT > 0 ? 3 : 1);
    p.hunger = Math.max(0, p.hunger - drain * dt);
    if (p.hunger <= 0) {
      this.starveT = (this.starveT || 0) - dt;
      if (this.starveT <= 0) { this.starveT = 1; p.hp -= 2; this.text(p.cx, p.y, 'Đói!', '#d98c3a'); if (p.hp <= 0) this.die('starve'); }
    } else if (p.hunger > 40 && p.hurtT < -3) p.hp = Math.min(this.maxHp(), p.hp + (0.6 + p.realm * 0.08) * dt);
    p.mp = Math.min(this.maxMp(), p.mp + (2 + p.realm * 0.2) * (p.med ? 3 : 1) * dt);
    p.hp = Math.min(p.hp, this.maxHp());
  },

  /* ---------- Tu luyện ---------- */
  meditateRate() {
    const p = this.player;
    let rate = 1.2;
    if (this.level === this.world) {
      for (const s of this.structures) {
        const d = DATA.structures[s.type];
        if (Math.abs(s.x - p.cx) > 70) continue;
        if (d.meditate) rate = Math.max(rate, 2.5 * d.meditate);
        if (s.type === 'lua_trai' && s.fuel > 0) rate = Math.max(rate, 2.5);
      }
    }
    return rate * (1 + p.realm * 0.04);
  },
  startMeditate(src) {
    const p = this.player;
    if (!p.onGround) return;
    if (this.mobs.some((m) => m.alive && m.ai !== 'passive' && m.aggro && Math.abs(m.cx - p.cx) < 260)) { hook('toast', 'Có yêu ma gần đây, không thể nhập định', 'bad'); return; }
    p.med = { src, t: 0 };
    p.vx = 0;
    hook('toast', 'Nhập định tu luyện · tốc độ ' + this.meditateRate().toFixed(1) + ' tu vi/giây', 'info');
  },
  stopMeditate() { this.player.med = null; },
  meditateTick(dt) {
    const p = this.player;
    p.med.t += dt;
    this.gainTuvi(this.meditateRate() * dt, true);
    if (Math.random() < dt * 8) {
      const a = Math.random() * Math.PI * 2;
      this.particle(p.cx + Math.cos(a) * 60, p.cy + Math.sin(a) * 40, -Math.cos(a) * 70, -Math.sin(a) * 50, 0.8, 'qi', DATA.realmColor(p.realm), 3);
    }
  },
  gainTuvi(n, quiet) {
    const p = this.player;
    const R = this.realmDef();
    if (R.req === Infinity) return;
    p.tuvi += n;
    if (!quiet && n >= 1) this.text(p.cx, p.y - 16, '+' + Math.floor(n) + ' tu vi', '#e6bf5a');
    while (p.tuvi >= this.realmDef().req) {
      const cur = this.realmDef();
      if (cur.pill) {
        p.tuvi = cur.req;
        if (!this.pillWarned) { this.pillWarned = true; hook('toast', 'Tu vi viên mãn! Cần ' + DATA.items[cur.pill].name + ' để đột phá', 'quest'); }
        break;
      }
      p.tuvi -= cur.req;
      this.realmUp();
    }
  },
  realmUp() {
    const p = this.player;
    p.realm++;
    this.pillWarned = false;
    p.hp = this.maxHp(); p.mp = this.maxMp();
    const R = this.realmDef();
    hook('banner', 'Đột phá: ' + R.name, 'Sinh lực ' + R.hp + ' · Sát thương ×' + R.dmg.toFixed(2), 'realm');
    sfx('realm');
    this.shake(4);
    for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; this.particle(p.cx, p.cy, Math.cos(a) * 220, Math.sin(a) * 220, 0.9, 'qi', DATA.realmColor(p.realm), 4); }
    const u = DATA.unlocks.find((x) => x.realm === p.realm);
    if (u) hook('unlock', u);
  },
  /* Đột phá đại cảnh giới bằng đan dược (có thể kèm lôi kiếp) */
  tryBreakthrough(pillId) {
    const p = this.player, R = this.realmDef();
    if (R.pill !== pillId) { hook('toast', 'Đan dược này dùng ở ' + DATA.realms[DATA.items[pillId].breakthrough].name + ' viên mãn', 'bad'); return false; }
    if (p.tuvi < R.req) { hook('toast', 'Tu vi chưa viên mãn (' + Math.floor(p.tuvi) + '/' + R.req + ')', 'bad'); return false; }
    if (this.trib) return false;
    this.inv.remove(pillId, 1);
    if (!R.trib) { p.tuvi = 0; this.realmUp(); return true; }
    if (this.level !== this.world) { hook('toast', 'Hãy độ kiếp ở bên ngoài bí cảnh', 'bad'); this.inv.add(pillId, 1); return false; }
    this.trib = { n: R.trib, i: 0, t: 1.6, end: 0 };
    hook('banner', 'Lôi Kiếp Giáng Lâm', R.trib + ' đạo thiên lôi — hãy né tránh!', 'blood');
    sfx('thunder');
    return true;
  },
  updateTrib(dt) {
    const tr = this.trib, p = this.player;
    tr.t -= dt;
    if (tr.i < tr.n) {
      if (tr.t <= 0) {
        tr.t = 1.25;
        tr.i++;
        const off = tr.i % 2 ? 0 : M.lerp(-50, 50, Math.random());
        this.zones.push({ x: p.cx + off - 26, y: p.y - 420, w: 52, h: 440 + p.h, delay: 0.85, dur: 0.3, dmg: this.maxHp() * 0.3, kind: 'bolt', owner: 'enemy', t: 0, trib: true });
      }
    } else if (tr.t <= -1.2) {
      this.trib = null;
      p.tuvi = 0;
      this.realmUp();
      hook('toast', 'Vượt qua lôi kiếp!', 'good');
    }
  },

  /* ======================= Công trình ======================= */
  updateStructures(dt) {
    for (const s of this.structures) {
      if (s.type === 'lua_trai' && s.fuel > 0) {
        s.fuel -= dt;
        if (Math.random() < dt * 10) this.particle(s.x + M.lerp(-6, 6, Math.random()), s.y - 12, M.lerp(-10, 10, Math.random()), -50, 0.9, 'ember', '#ffb347', 2);
      }
    }
  },
  placement() {
    const d = this.heldDef();
    if (!d || d.cat !== 'place' || this.level !== this.world) return null;
    const p = this.player;
    if (d.wall) {
      const c = Math.floor((p.cx + p.face * 22) / TILE);
      const top = this.level.topSolid(c, Math.floor(p.y / TILE) - 6);
      const r0 = top - DATA.WALL_H;
      let ok = r0 > 0;
      for (let r = r0; r < top && ok; r++) if (this.level.get(c, r) !== T_AIR) ok = false;
      const box = { x: c * TILE, y: r0 * TILE, w: TILE, h: DATA.WALL_H * TILE };
      if (ok && M.overlap(box, p)) ok = false;
      if (ok && this.mobs.some((m) => m.alive && M.overlap(box, m))) ok = false;
      return { wall: d.wall, c, r0, top, x: box.x, y: box.y, w: box.w, h: box.h, ok };
    }
    const S = DATA.structures[d.place];
    const cx = Math.round((p.cx + p.face * (18 + S.w / 2)) / 8) * 8;
    const c0 = Math.floor((cx - S.w / 2) / TILE), c1 = Math.floor((cx + S.w / 2 - 1) / TILE);
    const top = this.level.topSolid(c0, Math.floor(p.y / TILE) - 4);
    let ok = true;
    for (let c = c0; c <= c1; c++) if (this.level.topSolid(c, Math.floor(p.y / TILE) - 4) !== top) ok = false;
    const y = top * TILE;
    if (this.level.boxSolid(cx - S.w / 2, y - S.h, S.w, S.h - 1)) ok = false;
    for (const s of this.structures) if (Math.abs(s.x - cx) < (DATA.structures[s.type].w + S.w) / 2 + 4) ok = false;
    if (Math.abs(cx - this.world.array.x) < 60) ok = false;
    for (const pt of this.world.portals) if (Math.abs(cx - pt.x) < 50) ok = false;
    return { type: d.place, x: cx, y, w: S.w, h: S.h, ok };
  },
  placeSelected() {
    const pl = this.placement();
    if (!pl) return false;
    if (!pl.ok) { hook('toast', 'Không thể đặt ở đây (cần mặt đất bằng phẳng, trống)', 'bad'); return false; }
    const id = this.inv.selected().id;
    this.inv.remove(id, 1);
    if (pl.wall) {
      for (let r = pl.r0; r < pl.top; r++) this.level.set(pl.c, r, pl.wall);
    } else {
      const S = DATA.structures[pl.type];
      this.structures.push({ type: pl.type, x: pl.x, y: pl.y, fuel: S.fuel ? 240 : 0, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5) });
    }
    sfx('place');
    for (let i = 0; i < 8; i++) this.particle(pl.x + (pl.wall ? 8 : 0), pl.y, M.lerp(-80, 80, Math.random()), -Math.random() * 90, 0.5, 'dust', '#cfc6ad', 3);
    this.save();
    return true;
  },

  /* ======================= Dùng vật phẩm ======================= */
  useSelected() {
    const s = this.inv.selected();
    if (!s) return;
    const d = DATA.items[s.id];
    const p = this.player;
    if (d.cat === 'place') return this.placeSelected();
    if (d.cat === 'food' || d.cat === 'pill') {
      if (d.breakthrough != null) return this.tryBreakthrough(d.id);
      if (d.tuvi && this.realmDef().req === Infinity) return;
      if (d.hunger && p.hunger > 96 && !d.hp && !d.mp) { hook('toast', 'Đã no', 'info'); return; }
      this.inv.remove(d.id, 1);
      if (d.hunger) p.hunger = Math.min(100, p.hunger + d.hunger);
      if (d.hp) { p.hp = M.clamp(p.hp + d.hp, 1, this.maxHp()); if (d.hp < 0) this.text(p.cx, p.y, 'Đau bụng', '#d98c3a'); }
      if (d.mp) p.mp = Math.min(this.maxMp(), p.mp + d.mp);
      if (d.tuvi) this.gainTuvi(d.tuvi);
      if (d.cat === 'food') this.stats.eaten++;
      sfx(d.cat === 'food' ? 'eat' : 'pill');
      this.text(p.cx, p.y - 10, d.icon, '#fff');
      return;
    }
    if (d.cat === 'armor') {
      this.inv.remove(d.id, 1);
      if (this.inv.armor) this.inv.add(this.inv.armor, 1);
      this.inv.armor = d.id;
      hook('toast', 'Đã mặc ' + d.name, 'good');
      sfx('equip');
      return;
    }
    if (d.cat === 'key') return this.interact();
    hook('toast', d.cat === 'weapon' || d.cat === 'tool' ? 'Nhấn J / chuột trái để dùng ' + d.name : d.name + ': ' + d.desc, 'info');
  },

  /* ======================= Tương tác ======================= */
  findInteract() {
    const p = this.player;
    let best = null, bd = 1e9;
    const consider = (o, x, y, range, label) => {
      const d = Math.abs(x - p.cx) + Math.abs(y - p.bottom) * 0.5;
      if (d < range && d < bd) { bd = d; best = { o, label }; }
    };
    if (this.level === this.world) {
      for (const pt of this.world.portals) {
        const D = DATA.dungeons[pt.id];
        consider({ kind: 'portal', id: pt.id }, pt.x, pt.y, 44, (this.player.realm >= D.req ? 'Vào ' : '🔒 ') + D.name + (this.cleared[pt.id] ? ' (đã chinh phục)' : '') + (this.player.realm >= D.req ? '' : ' — cần ' + DATA.realms[D.req].name));
      }
      const A = this.world.array;
      consider({ kind: 'array' }, A.x, A.y, 60, 'Truyền Tống Trận (' + this.placed.length + '/4 mảnh Thiên Bia)');
      for (const s of this.structures) {
        const S = DATA.structures[s.type];
        let label = S.name;
        if (s.type === 'lua_trai') label = this.wantsFuel(s) ? 'Thêm củi vào lửa trại (' + Math.ceil(s.fuel / 60) + ' phút)' : s.fuel > 0 ? 'Ngồi thiền bên lửa trại' : 'Lửa trại đã tắt — cần Gỗ làm củi';
        else if (S.station) label = 'Mở ' + S.name;
        else if (S.bed) label = this.isNight() ? 'Ngủ đến sáng' : 'Đặt điểm hồi sinh';
        else if (S.meditate) label = 'Ngồi thiền (' + S.name + ')';
        else continue;
        consider({ kind: 'struct', s }, s.x, s.y, S.w / 2 + 26, label);
      }
      for (const b of this.bags) consider({ kind: 'bag', b }, b.x, b.y, 40, 'Nhặt lại túi đồ đánh rơi');
    } else {
      const D = this.dungeon;
      consider({ kind: 'exit' }, D.entrance.x, D.entrance.y, 44, 'Rời bí cảnh');
      if (D.exitPortal) consider({ kind: 'exit' }, D.exitPortal.x, D.exitPortal.y, 50, 'Trở về Linh Vực');
      for (const ch of D.chests) if (!ch.open) consider({ kind: 'chest', ch }, ch.x, ch.y, 34, 'Mở rương báu');
      for (const sh of D.shrines) if (!sh.lit) consider({ kind: 'shrine', sh }, sh.x, sh.y, 34, 'Thắp Hồn Đăng (điểm hồi sinh)');
    }
    this.interactTarget = best;
    this.prompt = best ? best.label : null;
  },

  interact() {
    const t = this.interactTarget;
    const p = this.player;
    if (!t) {
      const d = this.heldDef();
      if (d && d.cat === 'key') hook('toast', 'Mang mảnh Thiên Bia tới Truyền Tống Trận ở trung tâm Tàn Tích', 'info');
      return;
    }
    const o = t.o;
    switch (o.kind) {
      case 'portal': return this.enterDungeon(o.id);
      case 'exit': return this.exitDungeon();
      case 'array': return this.useArray();
      case 'bag': {
        for (const id in o.b.items) { const left = this.inv.add(id, o.b.items[id]); if (left) this.spawnDrop(id, left, p.cx, p.y); }
        this.bags = this.bags.filter((x) => x !== o.b);
        hook('toast', 'Đã nhặt lại túi đồ', 'good');
        sfx('pickup');
        return;
      }
      case 'chest': return this.openChest(o.ch);
      case 'shrine':
        o.sh.lit = true;
        this.dungeonSpawn = { x: o.sh.x, y: o.sh.y };
        p.hp = Math.min(this.maxHp(), p.hp + this.maxHp() * 0.3);
        hook('toast', 'Hồn Đăng đã thắp — hồi sinh tại đây khi tử vong', 'good');
        sfx('realm');
        return;
      case 'struct': {
        const s = o.s, S = DATA.structures[s.type];
        if (s.type === 'lua_trai' && this.wantsFuel(s)) {
          this.inv.remove('go', 1); s.fuel = Math.min(480, s.fuel + 90);
          sfx('place'); hook('toast', 'Lửa trại cháy thêm 90 giây', 'info');
          return;
        }
        if (s.type === 'lua_trai') { if (s.fuel <= 0) return hook('toast', 'Lửa đã tắt. Cầm Gỗ và nhấn E để nhóm lại', 'bad'); p.spawn = { x: s.x + 30, y: s.y }; return this.startMeditate(s); }
        if (S.station) return hook('openInventory', 'craft');
        if (S.bed) return this.sleep(s);
        if (S.meditate) return this.startMeditate(s);
      }
    }
  },

  /* Cầm gỗ trên tay, hoặc lửa sắp tắt mà trong túi có gỗ → E sẽ thêm củi */
  wantsFuel(s) {
    if (!this.inv.has('go') || s.fuel >= 470) return false;
    const held = this.heldDef();
    return (held && held.id === 'go') || s.fuel < 60;
  },

  sleep(s) {
    const p = this.player;
    p.spawn = { x: s.x, y: s.y };
    if (!this.isNight()) { hook('toast', 'Đã đặt điểm hồi sinh. Chỉ ngủ được vào ban đêm.', 'info'); return; }
    if (this.mobs.some((m) => m.alive && m.ai !== 'passive' && Math.abs(m.cx - p.cx) < 420)) { hook('toast', 'Yêu ma ở gần, không thể ngủ', 'bad'); return; }
    this.newDay();
    this.time = 0.02;
    p.hunger = Math.max(0, p.hunger - 25);
    p.hp = this.maxHp(); p.mp = this.maxMp();
    this.mobs = this.mobs.filter((m) => !m.def.night);
    hook('sleep');
    hook('banner', 'Bình minh', 'Ngày ' + this.day, 'day');
    this.save();
  },

  useArray() {
    for (const id of DATA.dungeonOrder) {
      const frag = DATA.dungeons[id].fragment;
      if (!this.placed.includes(frag) && this.inv.has(frag)) {
        this.inv.remove(frag, 1);
        this.placed.push(frag);
        hook('toast', 'Đặt ' + DATA.items[frag].name + ' vào trận (' + this.placed.length + '/4)', 'quest');
        sfx('realm');
      }
    }
    if (this.placed.length >= 4 && !this.won) {
      this.won = true;
      this.mode = 'victory';
      this.save();
      sfx('victory');
      hook('victory');
      return;
    }
    if (this.placed.length < 4) hook('toast', 'Truyền Tống Trận cần 4 mảnh Thiên Bia. Hiện có ' + this.placed.length + '/4.', 'info');
  },

  /* ======================= Bí cảnh ======================= */
  enterDungeon(id) {
    const D = DATA.dungeons[id];
    const p = this.player;
    if (p.realm < D.req) { hook('toast', D.name + ' cần ' + DATA.realms[D.req].name, 'bad'); return; }
    this.stopMeditate();
    this.save();
    this.resetTransient();
    this.dungeon = new Dungeon(id, (this.seed + this.stats.dungeonsEntered * 7919 + Math.floor(Math.random() * 1e6)) >>> 0);
    this.level = this.dungeon;
    this.inDungeon = id;
    this.stats.dungeonsEntered++;
    this.lives = 3;
    const E = this.dungeon.entrance;
    this.dungeonSpawn = { x: E.x + 30, y: E.y };
    p.x = E.x + 30 - p.w / 2; p.y = E.y - p.h - 0.01; p.vx = 0; p.vy = 0;
    p.lastSafe = { x: p.x, y: p.y };
    const tier = D.tier;
    for (const sp of this.dungeon.spawns) {
      this.mobs.push(new Mob(sp.type, sp.c * TILE + TILE / 2, (sp.r + 1) * TILE, { elite: sp.elite, sleep: true }));
    }
    this.bossSpawned = false;
    this.snapCamera();
    hook('banner', D.name, (this.cleared[id] ? 'Đã chinh phục · ' : '') + 'Bí cảnh ' + ['', 'nhất', 'nhị', 'tam', 'tứ'][tier] + ' giai · 3 Hồn Đăng', 'dungeon');
    sfx('portal');
    hook('onLevelChange');
  },
  exitDungeon() {
    const id = this.inDungeon;
    const pt = this.world.portals.find((x) => x.id === id);
    this.enterOverworld({ x: pt.x + 40 });
    sfx('portal');
    hook('onLevelChange');
    this.save();
  },
  updateDungeon(dt) {
    const D = this.dungeon, p = this.player, A = D.arena;
    if (!this.bossSpawned && p.x > A.x0 + 3 * TILE) {
      this.bossSpawned = true;
      D.setGate(true);
      const def = DATA.dungeons[D.id];
      const b = new Mob(def.boss, D.bossSpawn.x, D.bossSpawn.y - (DATA.bosses[def.boss].fly ? 150 : 0), {});
      b.cd = 2;
      this.mobs.push(b);
      this.boss = b;
      hook('banner', b.def.name, 'Thủ lĩnh ' + def.name, 'blood');
      sfx('roar');
      this.shake(8);
    }
  },
  bossDefeated(m) {
    const D = this.dungeon, def = DATA.dungeons[D.id];
    this.stats.bossKills++;
    D.setGate(false);
    this.boss = null;
    this.mobs.forEach((x) => { if (x !== m && x.alive) { x.alive = false; x.dying = 0.3; } });
    const first = !this.cleared[D.id];
    this.cleared[D.id] = true;
    if (first) this.spawnDrop(def.fragment, 1, m.cx, m.cy);
    this.spawnDrop(def.core, 2, m.cx, m.cy);
    this.spawnDrop('yeu_dan', 3 + def.tier * 2, m.cx, m.cy);
    this.spawnDrop('linh_thach', 2 + def.tier * 3, m.cx, m.cy);
    this.spawnDrop('hoi_khi_dan', 2, m.cx, m.cy);
    D.exitPortal = { x: (D.arena.x0 + D.arena.x1) / 2, y: D.arena.y };
    hook('banner', 'Chinh phục ' + def.name + '!', first ? 'Nhận ' + DATA.items[def.fragment].name : 'Phần thưởng đã rơi ra', 'realm');
    sfx('victory');
    this.shake(12);
  },
  openChest(ch) {
    ch.open = true;
    const tier = this.dungeon.def.tier;
    const r = Math.random;
    this.spawnDrop('hoi_khi_dan', 1 + Math.floor(r() * 2), ch.x, ch.y - 10);
    this.spawnDrop(r() < 0.5 ? 'thoi_sat' : 'linh_thach', 2 + Math.floor(r() * 2 * tier), ch.x, ch.y - 10);
    this.spawnDrop('yeu_dan', 1 + Math.floor(r() * tier), ch.x, ch.y - 10);
    if (r() < 0.3) this.spawnDrop('tu_khi_dan', 1, ch.x, ch.y - 10);
    if (r() < 0.25) this.spawnDrop('hoi_linh_dan', 2, ch.x, ch.y - 10);
    if (r() < 0.1) this.spawnDrop(this.dungeon.def.core, 1, ch.x, ch.y - 10);
    sfx('chest');
    this.burst(ch.x, ch.y - 8, '#ffd27a', 18);
  },

  /* ======================= Sinh quái ngoài trời ======================= */
  spawner(dt) {
    this.spawnT -= dt;
    if (this.spawnT > 0) return;
    this.spawnT = 1.2;
    const p = this.player, night = this.isNight();
    const near = this.mobs.filter((m) => m.alive && Math.abs(m.cx - p.cx) < 1100);
    const hostile = near.filter((m) => m.ai !== 'passive').length;
    const passive = near.length - hostile;
    const b = this.world.biomeAtX(p.cx);
    const vw = typeof Renderer !== 'undefined' ? Renderer.vw : 960;
    const targetH = night ? (this.bloodMoon() ? 8 : 4 + Math.min(3, Math.floor(this.day / 3))) : (b.id === 'loi_phong' || b.id === 'xich_thach' ? 2 : 1);
    let type = null;
    if (hostile < targetH && (night || Math.random() < 0.5)) {
      const list = (night ? b.night : b.day).filter((t) => DATA.monsters[t].ai !== 'passive');
      if (list.length) type = this.rng.pick(list);
    } else if (!night && passive < 2) {
      const list = b.day.filter((t) => DATA.monsters[t].ai === 'passive' || DATA.monsters[t].neutral);
      if (list.length) type = this.rng.pick(list);
    }
    if (!type) return;
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = M.clamp(p.cx + side * (vw / 2 + 60 + Math.random() * 220), 40, this.world.w - 40);
    if (night) for (const s of this.structures) if (s.type === 'lua_trai' && s.fuel > 0 && Math.abs(s.x - x) < 320) return;
    if (Math.abs(x - this.world.array.x) < 200 && !night) return;
    const def = DATA.monsters[type];
    const gy = this.topY(x);
    const dm = this.diffMult();
    const m = new Mob(type, x, gy - (['flyer', 'diver', 'ghost'].includes(def.ai) ? 110 : 0), { hpMult: dm.hp, dmgMult: dm.dmg, elite: night && Math.random() < 0.06 });
    if (this.level.boxSolid(m.x, m.y, m.w, m.h) && m.ai !== 'ghost') return;
    this.mobs.push(m);
  },

  /* ======================= Tử vong ======================= */
  die(cause) {
    const p = this.player;
    if (this.mode !== 'play') return;
    p.hp = 0;
    this.stats.deaths++;
    this.stopMeditate();
    let lost = null, msg = '';
    if (this.trib) { this.trib = null; p.tuvi = Math.floor(p.tuvi * 0.7); msg = 'Độ kiếp thất bại, tu vi tổn hao 30%. '; }
    if (this.level === this.world) {
      lost = this.inv.dropFraction(0.5);
      if (Object.keys(lost).length) this.bags.push({ x: p.cx, y: this.topY(p.cx), items: lost });
      msg += 'Một nửa nguyên liệu và thức ăn rơi lại tại chỗ — hãy quay lại nhặt.';
    } else {
      this.lives--;
      if (this.lives > 0) msg += 'Hồn Đăng còn ' + this.lives + '. Ngươi sẽ hồi sinh tại Hồn Đăng gần nhất.';
      else { lost = this.inv.dropFraction(0.25); msg += 'Hồn Đăng đã tắt — ngươi bị trục xuất khỏi bí cảnh và mất 1/4 nguyên liệu.'; }
    }
    this.mode = 'dead';
    sfx('death');
    hook('dead', { cause, msg, lost });
  },
  respawn() {
    const p = this.player;
    this.mode = 'play';
    p.hp = Math.round(this.maxHp() * 0.6);
    p.mp = this.maxMp();
    p.hunger = Math.max(p.hunger, 40);
    p.invT = 2; p.vx = 0; p.vy = 0; p.dashT = 0; p.atkT = 0;
    if (this.level !== this.world && this.lives > 0) {
      const sp = this.dungeonSpawn;
      p.x = sp.x - p.w / 2; p.y = sp.y - p.h - 0.01;
      if (this.boss) {
        this.boss.hp = this.boss.maxHp; this.boss.state = 'idle'; this.boss.phase = 1;
        this.mobs = this.mobs.filter((m) => m === this.boss || !m.alive || m.cx < this.dungeon.arena.x0);
        this.boss.alive = false; this.boss.dying = 0; this.boss = null;
        this.bossSpawned = false; this.dungeon.setGate(false);
      }
      this.projs = []; this.zones = [];
      this.snapCamera();
      return;
    }
    if (this.level !== this.world) { this.exitDungeon(); return; }
    const sp = p.spawn || { x: this.world.spawnX, y: 0 };
    this.mobs = this.mobs.filter((m) => Math.abs(m.cx - sp.x) > 500);
    p.x = sp.x - p.w / 2; p.y = this.topY(sp.x) - p.h - 0.01;
    this.projs = []; this.zones = [];
    this.snapCamera();
    this.save();
  },

  /* ======================= Mục tiêu ======================= */
  checkGoals() {
    let guard = 0;
    while (this.goal < DATA.goals.length && DATA.goals[this.goal].check(this) && guard++ < 20) {
      const g = DATA.goals[this.goal];
      this.goal++;
      if (this.goal < DATA.goals.length) hook('toast', '✔ ' + g.text.split(' (')[0], 'quest');
    }
  },

  /* ======================= Máy quay ======================= */
  snapCamera() {
    const vw = typeof Renderer !== 'undefined' ? Renderer.vw : 960, vh = typeof Renderer !== 'undefined' ? Renderer.vh : 540;
    this.cam.x = this.player.cx - vw / 2;
    this.cam.y = this.player.cy - vh * (this.level === this.world ? 0.66 : 0.58);
    this.clampCamera(vw, vh);
  },
  updateCamera(dt) {
    const vw = typeof Renderer !== 'undefined' ? Renderer.vw : 960, vh = typeof Renderer !== 'undefined' ? Renderer.vh : 540;
    const p = this.player;
    let tx = p.cx - vw / 2 + p.face * 50, ty = p.cy - vh * (this.level === this.world ? 0.66 : 0.58);
    if (this.boss && this.boss.alive) {
      const A = this.dungeon.arena;
      tx = M.clamp((p.cx + this.boss.cx) / 2 - vw / 2, A.x0 - 80, A.x1 - vw + 40);
      if (Math.abs(p.cx - this.boss.cx) > vw * 0.8) tx = p.cx - vw / 2 + Math.sign(this.boss.cx - p.cx) * vw * 0.3;
    }
    this.cam.x = M.lerp(this.cam.x, tx, Math.min(1, dt * 4));
    this.cam.y = M.lerp(this.cam.y, ty, Math.min(1, dt * 5));
    this.clampCamera(vw, vh);
    this.cam.shake = Math.max(0, this.cam.shake - dt * 30);
  },
  clampCamera(vw, vh) {
    this.cam.x = M.clamp(this.cam.x, 0, Math.max(0, this.level.w - vw));
    this.cam.y = M.clamp(this.cam.y, this.level === this.world ? -200 : 0, Math.max(0, this.level.h - vh));
  },

  /* ======================= Lưu trữ ======================= */
  KEY: 'linhvuc_caosinh_save_v1',
  serialize() {
    const p = this.player;
    const atPortal = this.level !== this.world ? this.world.portals.find((x) => x.id === this.inDungeon) : null;
    const walls = [];
    const W = this.world;
    for (let i = 0; i < W.tiles.length; i++) {
      const t = W.tiles[i];
      if (t === T_WOOD || t === T_STONE) walls.push([i, t, W.wallHp.get((i % W.cols) * 1000 + Math.floor(i / W.cols)) || 0]);
    }
    return JSON.stringify({
      v: 1, seed: this.seed, day: this.day, time: this.time, goal: this.goal,
      player: { x: atPortal ? atPortal.x + 40 : p.cx, hp: p.hp, mp: p.mp, hunger: p.hunger, tuvi: p.tuvi, realm: p.realm, spawn: p.spawn, face: p.face },
      inv: this.inv.toJSON(), structures: this.structures, bags: this.bags, walls,
      res: W.resources.filter((r) => !r.alive || r.hp < DATA.resources[r.type].hp).map((r) => [r.id, r.alive ? 1 : 0, r.hp, r.regrowDay]),
      cleared: this.cleared, placed: this.placed, won: this.won, stats: this.stats,
    });
  },
  save() {
    if (this.mode === 'title' || !this.world) return false;
    try { localStorage.setItem(this.KEY, this.serialize()); return true; } catch (e) { return false; }
  },
  hasSave() { try { return !!localStorage.getItem(this.KEY); } catch (e) { return false; } },
  load(str) {
    try { str = str || localStorage.getItem(this.KEY); } catch (e) { return false; }
    if (!str) return false;
    let s;
    try { s = JSON.parse(str); } catch (e) { return false; }
    if (!s || !s.seed) return false;
    this.seed = s.seed >>> 0;
    this.rng = new RNG(this.seed ^ 0x9e3779b9);
    this.world = new Overworld(this.seed);
    const W = this.world;
    for (const [i, t, hp] of s.walls || []) { W.tiles[i] = t; if (hp) W.wallHp.set((i % W.cols) * 1000 + Math.floor(i / W.cols), hp); }
    const byId = new Map(W.resources.map((r) => [r.id, r]));
    for (const [id, alive, hp, rd] of s.res || []) { const r = byId.get(id); if (r) { r.alive = !!alive; r.hp = hp; r.regrowDay = rd; } }
    this.inv = Inventory.from(s.inv);
    this.structures = (s.structures || []).filter((x) => DATA.structures[x.type]);
    this.bags = s.bags || [];
    this.day = s.day || 1; this.time = s.time || 0.04; this.goal = s.goal || 0;
    this.cleared = s.cleared || {}; this.placed = s.placed || []; this.won = !!s.won;
    this.stats = Object.assign({ kills: 0, deaths: 0, crafted: 0, eaten: 0, harvested: 0, dungeonsEntered: 0, bossKills: 0, playTime: 0, nights: 0 }, s.stats || {});
    const sp = s.player || {};
    this.player = new Player(sp.x || W.spawnX, W.groundY(sp.x || W.spawnX));
    const p = this.player;
    Object.assign(p, { hp: sp.hp || 100, mp: sp.mp || 40, hunger: sp.hunger == null ? 100 : sp.hunger, tuvi: sp.tuvi || 0, realm: sp.realm || 0, spawn: sp.spawn || null, face: sp.face || 1 });
    this.enterOverworld({ x: sp.x || W.spawnX });
    p.hp = Math.max(1, Math.min(p.hp, this.maxHp()));
    this.mode = 'play';
    this.paused = false;
    hook('onStart', false);
    return true;
  },
  wipe() { try { localStorage.removeItem(this.KEY); } catch (e) { /* bỏ qua */ } },
};

'use strict';
/* Hệ thống chiến đấu theo lượt (thanh hành động theo tốc độ) */

const Combat = {
  b: null,
  timer: null,
  SPEEDS: { 1: 650, 2: 330, 4: 160 },

  active() { return !!(Combat.b && !Combat.b.over); },

  elemMod(atkEl, defEl) {
    if (!atkEl || atkEl === 'none' || !defEl) return 1;
    if (atkEl === 'all') return 1.15;
    const ae = D.elements[atkEl], de = D.elements[defEl];
    if (!ae || !de) return 1;
    if (ae.variant) return de.variant ? 1 : 1.15;
    if (de.variant) return 0.9;
    if (D.counters[atkEl] === defEl) return 1.3;
    if (D.counters[defEl] === atkEl) return 0.8;
    return 1;
  },

  makeEnemy(monId, gs, opts = {}) {
    const m = D.monsters[monId];
    /* Hiệu chỉnh theo người chơi điển hình: ~6 lượt để hạ, mỗi đòn mất ~5% sinh lực */
    const E = D.expected(gs);
    const k = (opts.mult || 1) * (gs > D.MAX_GS ? Math.pow(1.12, gs - D.MAX_GS) : 1);
    const h = E.hp * 0.055;
    const r = D.gsToRS(Math.min(gs, D.MAX_GS)).r;
    let hp = 4.4 * E.atk * (1.4 + 0.35 * r) * m.hp * k;
    let atk = (h + Math.sqrt(h * h + 4 * h * E.def)) / 2 * m.atk * k;
    let def = 0.35 * E.atk * m.def * k;
    const spd = 10 * m.spd * (1 + 0.01 * Math.min(gs, 60));
    let crit = 5, critDmg = 150;
    if (opts.elite) { hp *= 1.6; atk *= 1.12; def *= 1.1; }
    if (opts.boss) { hp *= 3; atk *= 1.25; def *= 1.15; crit = 12; critDmg = 170; }
    let name = m.name;
    if (opts.elite) name = 'Tinh Anh · ' + name;
    if (opts.title) name = opts.title;
    return {
      id: monId, name, icon: m.icon, el: m.el, gs, lvName: D.gsName(Math.min(gs, D.MAX_GS)),
      hp: Math.floor(hp), maxHp: Math.floor(hp), mp: 0, maxMp: 0,
      atk: Math.floor(atk), def: Math.floor(def), spd, crit, critDmg, dodge: 3, lifesteal: 0,
      skills: m.skills.map((id) => ({ s: D.mskills[id], lv: 1 })),
      cds: {}, effs: [], shield: 0, gauge: U.rand(0, 30), boss: !!opts.boss, elite: !!opts.elite, side: 'enemy',
    };
  },

  makePlayer(sim) {
    const p = G.player, st = Player.stats();
    return {
      name: p.name, icon: p.gender === 'nu' ? '🧘‍♀️' : '🧘‍♂️', el: 'none',
      hp: sim ? st.hp : Math.max(1, Math.min(p.hp, st.hp)), maxHp: st.hp,
      mp: sim ? st.mp : Math.min(p.mp, st.mp), maxMp: st.mp,
      atk: st.atk, def: st.def, spd: st.spd, crit: st.crit, critDmg: st.critDmg, dodge: st.dodge, lifesteal: st.lifesteal,
      skills: p.eq.filter((id) => D.skills[id]).map((id) => ({ s: D.skills[id], lv: p.skills[id] || 1 })),
      cds: {}, effs: [], shield: 0, gauge: U.rand(10, 40), side: 'player', isPlayer: true,
    };
  },

  /** opts: {kind, title, sim, onWin(b)->string[], onLose(b), onEnd(b), canFlee} */
  start(enemy, opts = {}) {
    if (Combat.active()) return false;
    const pet = Pets.active();
    const b = {
      kind: opts.kind || 'explore', title: opts.title || '', opts,
      player: Combat.makePlayer(opts.sim), enemy,
      pet: pet ? Pets.fighter(pet) : null,
      turn: 0, log: [], events: [], over: false, result: null, rewards: [],
      waiting: false, potions: 0,
    };
    Combat.b = b;
    Combat.say(b, '⚔️ Gặp ' + enemy.name + ' (' + enemy.lvName + ')', 'sys');
    UI.battleStart && UI.battleStart(b);
    Combat.schedule(400);
    return true;
  },

  schedule(ms) {
    clearTimeout(Combat.timer);
    const delay = ms != null ? ms : Combat.SPEEDS[G.settings.battleSpeed] || 650;
    Combat.timer = setTimeout(Combat.step, delay);
  },

  say(b, text, cls = '') {
    b.seq = (b.seq || 0) + 1;
    b.log.push({ text, cls, id: b.seq });
    if (b.log.length > 80) b.log.shift();
  },
  pop(b, side, text, cls) { b.events.push({ side, text, cls }); },

  /** Hệ số buff/debuff */
  mod(f, up, down) {
    let m = 1;
    for (const e of f.effs) {
      if (e.type === up) m += e.pow;
      if (e.type === down) m -= e.pow;
    }
    return Math.max(0.2, m);
  },

  nextActor(b) {
    const fs = [b.player, b.enemy];
    let best = null, bt = Infinity;
    for (const f of fs) {
      const t = (100 - f.gauge) / Math.max(1, f.spd);
      if (t < bt) { bt = t; best = f; }
    }
    if (bt > 0) for (const f of fs) f.gauge += f.spd * bt;
    best.gauge -= 100;
    return best;
  },

  step() {
    const b = Combat.b;
    if (!b || b.over) return;
    if (b.waiting) return;
    const actor = b.nextActor || Combat.nextActor(b);
    b.nextActor = null;
    const target = actor === b.player ? b.enemy : b.player;
    b.turn++;
    /* Hiệu ứng đầu lượt */
    Combat.tickEffects(b, actor);
    if (Combat.checkEnd(b)) return;
    if (actor.stunned) {
      actor.stunned = false;
      Combat.say(b, actor.name + ' bị choáng, mất lượt!', 'muted');
      Combat.pop(b, actor.side, 'Choáng', 'stun');
      return Combat.afterAction(b, actor);
    }
    for (const k in actor.cds) if (actor.cds[k] > 0) actor.cds[k]--;
    if (actor.isPlayer) {
      actor.mp = Math.min(actor.maxMp, actor.mp + actor.maxMp * 0.06);
      const manual = !G.settings.autoBattle && UI.battleVisible && UI.battleVisible();
      if (manual) {
        b.waiting = true;
        b.actorPending = actor;
        UI.battleUpdate && UI.battleUpdate(b);
        return;
      }
      Combat.playerAuto(b);
    } else {
      Combat.enemyAct(b, actor, target);
    }
    Combat.afterAction(b, actor);
  },

  afterAction(b, actor) {
    if (actor && actor.isPlayer && b.pet && !b.over) Combat.petAct(b);
    if (Combat.checkEnd(b)) return;
    if (b.turn > 200) { Combat.finish(b, 'lose', 'Trận chiến kéo dài quá lâu, ngươi kiệt sức rút lui.'); return; }
    UI.battleUpdate && UI.battleUpdate(b);
    Combat.schedule();
  },

  /** Người chơi thao tác tay: choice = 'attack' | skillId | 'item:<id>' | 'flee' */
  playerAct(choice) {
    const b = Combat.b;
    if (!b || b.over || !b.waiting) return;
    const pl = b.player;
    if (choice === 'flee') {
      b.waiting = false;
      return Combat.flee(b);
    }
    if (choice.startsWith('item:')) {
      const ok = Combat.useItem(b, choice.slice(5));
      if (!ok) return;
    } else if (choice === 'attack') {
      Combat.doSkill(b, pl, b.enemy, null);
    } else {
      const sk = pl.skills.find((x) => x.s.id === choice);
      if (!sk || !Combat.canUse(pl, sk)) return;
      Combat.doSkill(b, pl, b.enemy, sk);
    }
    b.waiting = false;
    Combat.afterAction(b, pl);
  },

  canUse(f, sk) {
    return !(f.cds[sk.s.id] > 0) && f.mp >= sk.s.mp * f.maxMp - 0.001;
  },

  bestHealItem(needMp) {
    const order = needMp ? ['cuu_chuyen_dan', 'hoi_linh_dan'] : ['cuu_chuyen_dan', 'dai_hoan_dan', 'hoi_khi_dan'];
    return order.find((id) => Inv.has(id));
  },

  useItem(b, id) {
    const it = D.items[id];
    if (!it || !Inv.has(id) || !it.effect) return false;
    const pl = b.player, e = it.effect;
    if (e.type === 'heal') {
      const h = pl.maxHp * e.pct;
      pl.hp = Math.min(pl.maxHp, pl.hp + h);
      if (e.mp) pl.mp = Math.min(pl.maxMp, pl.mp + pl.maxMp * e.mp);
      Combat.pop(b, 'player', '+' + U.fmt(h), 'heal');
    } else if (e.type === 'mp') {
      pl.mp = Math.min(pl.maxMp, pl.mp + pl.maxMp * e.pct);
      Combat.pop(b, 'player', '+MP', 'mp');
    } else if (e.type === 'buff' && (e.buff === 'atk' || e.buff === 'def')) {
      G.player.buffs[e.buff] = { val: e.val, until: Date.now() + e.dur * 1000 };
      Combat.addEff(pl, { type: e.buff === 'atk' ? 'atkUp' : 'defUp', pow: e.val / 100, turns: 99 });
    } else return false;
    Inv.remove(id, 1);
    b.potions++;
    Combat.say(b, pl.name + ' dùng ' + it.name + '.', 'good');
    return true;
  },

  playerAuto(b) {
    const pl = b.player;
    const hpR = pl.hp / pl.maxHp, mpR = pl.mp / pl.maxMp;
    if (G.settings.autoHeal && hpR < 0.35 && b.potions < 6) {
      const id = Combat.bestHealItem(false);
      if (id && Combat.useItem(b, id)) return;
    }
    if (G.settings.autoHeal && mpR < 0.12 && b.potions < 6 && pl.skills.length) {
      const id = Combat.bestHealItem(true);
      if (id && Combat.useItem(b, id)) return;
    }
    let best = null, bestScore = 1.0;
    for (const sk of pl.skills) {
      if (!Combat.canUse(pl, sk)) continue;
      const s = sk.s;
      let score = 0;
      if (s.self) {
        const heal = s.effs.find((e) => e.type === 'heal');
        const shield = s.effs.find((e) => e.type === 'shield');
        const buff = s.effs.find((e) => e.type === 'atkUp' || e.type === 'defUp');
        if (heal && hpR < 0.5) score = 3 + (1 - hpR) * 4;
        if (shield && hpR < 0.75 && pl.shield <= 0) score = Math.max(score, 2.5);
        if (buff && !pl.effs.some((e) => e.type === buff.type)) score = Math.max(score, 2.2);
      } else {
        score = s.mult * s.hits * (1 + 0.1 * (sk.lv - 1)) * Combat.elemMod(s.el, b.enemy.el);
        if (s.effs.some((e) => e.type === 'stun')) score += 0.3;
      }
      if (score > bestScore) { bestScore = score; best = sk; }
    }
    Combat.doSkill(b, pl, b.enemy, best);
  },

  enemyAct(b, en, target) {
    const hpR = en.hp / en.maxHp;
    let pick = null;
    const ready = en.skills.filter((sk) => !(en.cds[sk.s.id] > 0));
    for (const sk of ready) {
      const s = sk.s;
      if (s.self) {
        if (s.effs.some((e) => e.type === 'heal') && hpR < 0.4) { pick = sk; break; }
        if (s.effs.some((e) => (e.type === 'atkUp' || e.type === 'defUp') && !en.effs.some((x) => x.type === e.type)) && Math.random() < 0.5) { pick = sk; break; }
        if (s.effs.some((e) => e.type === 'shield') && en.shield <= 0 && hpR < 0.7) { pick = sk; break; }
      }
    }
    if (!pick) {
      const atk = ready.filter((sk) => !sk.s.self);
      if (atk.length && Math.random() < (en.boss ? 0.7 : 0.55)) pick = U.pick(atk);
    }
    Combat.doSkill(b, en, target, pick);
  },

  addEff(f, e) {
    if (['atkUp', 'defUp', 'atkDown', 'defDown'].includes(e.type)) {
      const ex = f.effs.find((x) => x.type === e.type);
      if (ex) { ex.pow = Math.max(ex.pow, e.pow); ex.turns = Math.max(ex.turns, e.turns); return; }
    }
    f.effs.push(e);
  },

  doSkill(b, att, def, sk) {
    const s = sk ? sk.s : null;
    const lvM = sk ? 1 + 0.1 * (sk.lv - 1) : 1;
    const name = s ? s.name : 'Tấn công';
    if (s) {
      if (att.isPlayer) att.mp -= s.mp * att.maxMp;
      att.cds[s.id] = s.cd + 1;
    }
    if (s && s.self) {
      Combat.say(b, att.name + ' thi triển ' + name + '.', att.isPlayer ? 'pl' : 'en');
      for (const e of s.effs) Combat.applyEff(b, att, att, e, lvM, att);
      return;
    }
    const hits = s ? s.hits : 1;
    const mult = (s ? s.mult : 1) * lvM;
    let total = 0, crits = 0, missed = 0;
    for (let h = 0; h < hits && def.hp > 0; h++) {
      const r = Combat.hit(b, att, def, mult, s);
      if (r.miss) missed++;
      else { total += r.dmg; if (r.crit) crits++; }
    }
    let txt = att.name + (s ? ' thi triển ' + name : ' tấn công');
    if (missed === hits) txt += ' — bị né tránh!';
    else txt += ', gây ' + U.fmt(total) + ' sát thương' + (crits ? ' (bạo kích!)' : '') + (hits > 1 ? ' [' + (hits - missed) + ' đòn]' : '') + '.';
    Combat.say(b, txt, att.isPlayer ? 'pl' : 'en');
    if (total > 0) {
      const ls = (att.lifesteal || 0) / 100 + (s && s.lifesteal ? s.lifesteal : 0);
      if (ls > 0) {
        const heal = total * ls;
        att.hp = Math.min(att.maxHp, att.hp + heal);
        Combat.pop(b, att.side, '+' + U.fmt(heal), 'heal');
      }
      if (s) for (const e of s.effs) Combat.applyEff(b, att, def, e, lvM, att);
    }
    Sfx.play(crits ? 'crit' : 'hit');
  },

  hit(b, att, def, mult, s) {
    if (Math.random() * 100 < def.dodge) {
      Combat.pop(b, def.side, 'Né', 'miss');
      return { miss: true };
    }
    const atk = att.atk * Combat.mod(att, 'atkUp', 'atkDown');
    let dfn = def.def * Combat.mod(def, 'defUp', 'defDown');
    if (s && s.pierce) dfn *= 1 - s.pierce;
    const el = s ? s.el : 'none';
    let em = Combat.elemMod(el, def.el);
    if (att.isPlayer && s && Player.hasElement(el)) em *= 1.2;
    let dmg = mult * atk * atk / (atk + dfn) * em * U.rand(0.92, 1.08);
    const crit = Math.random() * 100 < att.crit;
    if (crit) dmg *= att.critDmg / 100;
    dmg = Math.max(1, Math.floor(dmg));
    Combat.damage(b, def, dmg, crit ? 'crit' : 'dmg');
    return { dmg, crit };
  },

  damage(b, f, dmg, cls) {
    if (f.shield > 0) {
      const ab = Math.min(f.shield, dmg);
      f.shield -= ab; dmg -= ab;
      if (ab > 0) Combat.pop(b, f.side, '🛡' + U.fmt(ab), 'shield');
    }
    f.hp -= dmg;
    if (dmg > 0) Combat.pop(b, f.side, '-' + U.fmt(dmg), cls);
  },

  applyEff(b, src, tgt, e, lvM, caster) {
    const chance = (e.chance == null ? 1 : e.chance) + 0.02 * ((lvM - 1) / 0.1);
    const info = D.effectInfo[e.type];
    if (e.type === 'heal') {
      const h = tgt.maxHp * e.pow * (1 + (lvM - 1) * 0.5);
      tgt.hp = Math.min(tgt.maxHp, tgt.hp + h);
      Combat.pop(b, tgt.side, '+' + U.fmt(h), 'heal');
      return;
    }
    if (e.type === 'shield') {
      tgt.shield += tgt.maxHp * e.pow * (1 + (lvM - 1) * 0.5);
      Combat.pop(b, tgt.side, 'Hộ thuẫn', 'shield');
      return;
    }
    if (Math.random() > chance) return;
    if (e.type === 'stun') {
      if (tgt.boss && Math.random() < 0.5) return;
      tgt.stunned = true;
      Combat.say(b, info.icon + ' ' + tgt.name + ' bị choáng!', 'muted');
      return;
    }
    if (info.dot) {
      Combat.addEff(tgt, { type: e.type, turns: e.turns, dmg: caster.atk * e.pow * (1 + (lvM - 1) * 0.5) * 0.6 });
      Combat.say(b, info.icon + ' ' + tgt.name + ' bị ' + info.name.toLowerCase() + '.', 'muted');
      return;
    }
    Combat.addEff(tgt, { type: e.type, pow: e.pow * (1 + (lvM - 1) * 0.3), turns: e.turns || 2 });
    Combat.say(b, info.icon + ' ' + tgt.name + ': ' + info.name + '.', 'muted');
  },

  tickEffects(b, f) {
    for (const e of f.effs) {
      const info = D.effectInfo[e.type];
      if (info && info.dot) {
        const d = Math.max(1, Math.floor(e.dmg));
        f.hp -= d;
        Combat.pop(b, f.side, '-' + U.fmt(d), 'dot');
      }
      e.turns--;
    }
    f.effs = f.effs.filter((e) => e.turns > 0);
  },

  petAct(b) {
    const pet = b.pet;
    pet.turn = (pet.turn || 0) + 1;
    const skill = pet.turn % 3 === 0;
    const mult = skill ? 2.2 : 0.9;
    const atk = pet.atk;
    const dfn = b.enemy.def * Combat.mod(b.enemy, 'defUp', 'defDown');
    let dmg = mult * atk * atk / (atk + dfn) * Combat.elemMod(pet.el, b.enemy.el) * U.rand(0.9, 1.1);
    dmg = Math.max(1, Math.floor(dmg));
    Combat.damage(b, b.enemy, dmg, 'pet');
    Combat.say(b, pet.icon + ' ' + pet.name + (skill ? ' tung tuyệt kỹ' : ' tấn công') + ', gây ' + U.fmt(dmg) + ' sát thương.', 'pet');
  },

  flee(b) {
    const chance = b.enemy.boss ? 0.35 : 0.6 + (b.player.spd - b.enemy.spd) * 0.02;
    if (Math.random() < U.clamp(chance, 0.2, 0.9)) {
      Combat.finish(b, 'flee', 'Ngươi thi triển độn thuật, thoát khỏi trận chiến.');
    } else {
      Combat.say(b, 'Chạy trốn thất bại!', 'bad');
      Combat.afterAction(b, b.player);
    }
  },

  checkEnd(b) {
    if (b.over) return true;
    if (b.enemy.hp <= 0) { Combat.finish(b, 'win'); return true; }
    if (b.player.hp <= 0) { Combat.finish(b, 'lose'); return true; }
    return false;
  },

  finish(b, result, msg) {
    if (b.over) return;
    b.over = true;
    b.result = result;
    clearTimeout(Combat.timer);
    b.waiting = false;
    const p = G.player;
    if (!b.opts.sim) {
      p.hp = Math.max(1, Math.floor(b.player.hp));
      p.mp = Math.max(0, Math.floor(b.player.mp));
    }
    if (result === 'win') {
      Combat.say(b, '🏆 Chiến thắng! Đánh bại ' + b.enemy.name + '.', 'good');
      if (b.pet) Pets.gainBattleExp(b.enemy.gs);
      try { b.rewards = (b.opts.onWin && b.opts.onWin(b)) || []; } catch (e) { console.error(e); b.rewards = []; }
      Sfx.play('win');
    } else if (result === 'lose') {
      Combat.say(b, msg || '💀 Thất bại! Ngươi bị trọng thương phải rút lui.', 'bad');
      if (!b.opts.sim) {
        p.hp = 1;
        const loss = Math.floor(p.tuVi * 0.05);
        p.tuVi -= loss;
        if (loss > 0) Combat.say(b, 'Tu vi tổn hao ' + U.fmt(loss) + '.', 'bad');
      }
      try { b.opts.onLose && b.opts.onLose(b); } catch (e) { console.error(e); }
      Sfx.play('fail');
    } else {
      Combat.say(b, msg, 'muted');
      try { b.opts.onLose && b.opts.onLose(b); } catch (e) { console.error(e); }
    }
    for (const r of b.rewards) Combat.say(b, '🎁 ' + r, 'loot');
    Quests.check();
    Ach.check();
    UI.battleUpdate && UI.battleUpdate(b);
    try { b.opts.onEnd && b.opts.onEnd(b); } catch (e) { console.error(e); }
  },

  /** Đóng trận đã kết thúc */
  clear() {
    if (Combat.b && Combat.b.over) Combat.b = null;
  },

  /** Hủy trận (ví dụ khi luân hồi) */
  abort() {
    clearTimeout(Combat.timer);
    Combat.b = null;
  },
};

'use strict';
/* Bí cảnh, Thông Thiên Tháp, Thiên kiếp */

const Dungeon = {
  resetDaily() {
    const t = U.todayKey();
    if (G.dungeon.date !== t) { G.dungeon.date = t; G.dungeon.used = 0; }
  },
  maxDaily() { return D.DUNGEON_DAILY + Reinc.lv('bi_canh'); },
  left() { Dungeon.resetDaily(); return Math.max(0, Dungeon.maxDaily() - G.dungeon.used) + G.dungeon.bonus; },
  run() { return G.dungeon.run; },
  /** Đang trong bí cảnh (chưa kết thúc) */
  busy() { const r = G.dungeon.run; return !!r && (r.status === 'fight' || r.status === 'rest'); },

  canEnter(d) {
    if (Player.gs() < d.req) return 'Cần đạt ' + D.gsName(d.req);
    if (Dungeon.left() <= 0) return 'Hết lượt hôm nay';
    if (Combat.active() || Explore.busy) return 'Đang bận';
    if (G.dungeon.run) return 'Đang ở trong bí cảnh';
    return true;
  },

  enter(id) {
    const d = D.dungeonById[id];
    if (!d || Dungeon.canEnter(d) !== true) return false;
    Explore.setAuto(false);
    Dungeon.resetDaily();
    if (G.dungeon.used < Dungeon.maxDaily()) G.dungeon.used++;
    else G.dungeon.bonus--;
    G.dungeon.run = { id, stage: 0, loot: [], status: 'fight' };
    Log.add('Tiến vào ' + d.name + '.', 'event');
    Dungeon.next();
    return true;
  },

  next() {
    const run = G.dungeon.run;
    if (!run) return;
    const d = D.dungeonById[run.id];
    const last = run.stage >= d.stages - 1;
    const gs = d.lv + Math.floor(run.stage / 2) + (last ? 1 : 0);
    const mon = last ? d.boss : U.pick(d.pool);
    const en = Combat.makeEnemy(mon, gs, { boss: last, elite: !last && run.stage % 2 === 1, tier: d.tier });
    run.status = 'fight';
    Combat.start(en, {
      kind: 'dungeon',
      title: d.name + ' — Ải ' + (run.stage + 1) + '/' + d.stages,
      onWin: (b) => {
        Stats.add('kills');
        if (last) Stats.add('bossKills');
        const r = { stones: 6 * D.statScale(gs) * (last ? 3 : 1), items: {} };
        if (Math.random() < 0.5) r.items['yeu_dan_' + d.tier] = 1;
        if (!Player.canBreak()) r.tuvi = Math.floor(Player.cultRate() * 15);
        return Loot.give(r);
      },
      onEnd: (b) => {
        if (b.result === 'win') {
          if (last) Dungeon.complete();
          else {
            run.stage++;
            run.status = 'rest';
            const st = Player.stats();
            G.player.mp = Math.min(st.mp, G.player.mp + st.mp * 0.3);
            G.player.hp = Math.min(st.hp, G.player.hp + st.hp * 0.25);
            if (G.settings.autoBattle) {
              clearTimeout(Dungeon.timer);
              Dungeon.timer = setTimeout(() => { if (G.dungeon.run && G.dungeon.run.status === 'rest' && !Combat.active()) { Combat.clear(); Dungeon.next(); } }, 2200);
            }
          }
        } else {
          Log.add('Thất bại tại ' + d.name + ' (ải ' + (run.stage + 1) + ').', 'bad');
          run.status = 'failed';
        }
        UI.renderIf && UI.renderIf('dungeon', true);
      },
    });
  },

  proceed() {
    const run = G.dungeon.run;
    if (!run || run.status !== 'rest' || Combat.active()) return;
    clearTimeout(Dungeon.timer);
    Combat.clear();
    Dungeon.next();
  },

  leave() {
    clearTimeout(Dungeon.timer);
    if (Combat.active()) return;
    G.dungeon.run = null;
    Combat.clear();
  },

  complete() {
    const run = G.dungeon.run;
    const d = D.dungeonById[run.id];
    Stats.add('dungeons');
    const st = Player.stats();
    const r = { stones: 40 * D.statScale(d.lv), items: {}, gear: [] };
    r.gear.push({ tier: d.tier, q: Gear.rollQuality(st.drop + 80, 2) });
    if (Math.random() < 0.4) r.gear.push({ tier: d.tier, q: Gear.rollQuality(st.drop + 40, 1) });
    r.items[U.pick(D.herbsByTier[d.tier])] = U.randInt(3, 5);
    r.items['yeu_dan_' + d.tier] = U.randInt(2, 4);
    if (Math.random() < 0.35) {
      const books = Object.keys(D.skills).filter((id) => !D.skills[id].sect && D.skills[id].tier >= d.tier && D.skills[id].tier <= d.tier + 1);
      if (books.length) r.items['book_s_' + U.pick(books)] = 1;
    }
    if (Math.random() < 0.15) {
      const techs = Object.keys(D.techniques).filter((id) => !D.techniques[id].sect && D.techniques[id].grade >= 1 && D.techBookTier[D.techniques[id].grade] <= d.tier + 2);
      if (techs.length) r.items['book_t_' + U.pick(techs)] = 1;
    }
    if (Math.random() < 0.25) r.items[d.tier >= 7 ? 'trung_tien_thu' : d.tier >= 4 ? 'trung_than_thu' : 'trung_yeu_thu'] = 1;
    const txt = Loot.give(r);
    run.status = 'done';
    run.loot = txt;
    Log.add('Chinh phục ' + d.name + '! Nhận: ' + txt.join(', '), 'loot');
    UI.toast('Chinh phục ' + d.name + '!', 'good');
    Quests.check();
    Ach.check();
  },
};

const Tower = {
  auto: false,
  floorGs(f) { return Math.min(D.MAX_GS, Math.floor((f - 1) / 2)); },
  floorMult(f) { return f > 91 ? Math.pow(1.06, f - 91) : 1; },
  enemy(f) {
    const gs = Tower.floorGs(f);
    const m = D.mapForGs(gs);
    const boss = f % 10 === 0;
    const mon = boss ? m.boss : m.mons[(f * 7) % m.mons.length];
    return Combat.makeEnemy(mon, gs, { boss, elite: !boss && f % 5 === 0, tier: m.tier, mult: Tower.floorMult(f) });
  },
  reward(f) {
    const gs = Tower.floorGs(f);
    const m = D.mapForGs(gs);
    const r = { stones: 10 * D.statScale(gs) * Tower.floorMult(f) * (f % 10 === 0 ? 5 : 1), items: {} };
    if (f % 5 === 0) { r.items[U.pick(D.herbsByTier[m.tier])] = 3; r.items['yeu_dan_' + m.tier] = 2; }
    if (f % 10 === 0) {
      r.gear = [{ tier: m.tier, q: Gear.rollQuality(Player.stats().drop + 60, 2) }];
      if (Math.random() < 0.5) {
        const books = Object.keys(D.skills).filter((id) => !D.skills[id].sect && Math.abs(D.skills[id].tier - m.tier) <= 1);
        r.items['book_s_' + U.pick(books)] = 1;
      }
      if (f % 30 === 0) r.items[m.tier >= 6 ? 'trung_than_thu' : 'trung_yeu_thu'] = 1;
      if (f % 50 === 0) r.items.tay_linh_dich = 1;
    }
    return r;
  },
  challenge() {
    if (Combat.active() || Explore.busy || Dungeon.busy()) return false;
    Explore.setAuto(false);
    const f = G.tower.best + 1;
    Combat.start(Tower.enemy(f), {
      kind: 'tower', title: 'Thông Thiên Tháp — Tầng ' + f, sim: true,
      onWin: () => {
        G.tower.best = f;
        Stats.add('towerClears');
        Ach.check();
        Quests.check();
        return Loot.give(Tower.reward(f));
      },
      onEnd: (b) => {
        if (b.result !== 'win') Tower.auto = false;
        UI.renderIf && UI.renderIf('tower', true);
        if (Tower.auto) {
          clearTimeout(Tower.timer);
          Tower.timer = setTimeout(() => {
            if (Tower.auto && !Combat.active() && G.ui.tab === 'tower') { Combat.clear(); Tower.challenge(); }
            else Tower.auto = false;
          }, 1500);
        }
      },
    });
    return true;
  },
};

/* Thiên kiếp */
const Trib = {
  s: null,
  timer: null,
  expected(gs) { return D.expected(gs); },

  preview() {
    const p = G.player, next = D.realms[p.realm + 1];
    const E = Trib.expected(Player.gs());
    const st = Player.stats();
    const defF = U.clamp(2 * E.def / (E.def + st.def), 0.4, 1.6);
    const n = next.strikes;
    const total = 1.15 * E.hp * defF * Math.max(0.75, 1 - 0.05 * p.breakFails);
    return { n, total, defF, hp: st.hp };
  },

  start(usePill) {
    const p = G.player, next = D.realms[p.realm + 1];
    if (!next || next.type !== 'trib' || !Player.canBreak() || Combat.active()) return false;
    Explore.setAuto(false);
    const pv = Trib.preview();
    let mult = 1;
    const used = [];
    if (usePill && next.pill && Inv.has(next.pill)) { Inv.remove(next.pill, 1); mult *= 0.75; used.push(D.items[next.pill].name); }
    if (Inv.has('ti_loi_phu')) { Inv.remove('ti_loi_phu', 1); mult *= 0.7; used.push('Tị Lôi Phù'); }
    const n = pv.n;
    const base = pv.total / n * mult;
    const dmgs = [];
    for (let i = 0; i < n; i++) dmgs.push(base * (0.8 + 0.4 * (n > 1 ? i / (n - 1) : 0)));
    const st = Player.stats();
    Trib.s = { i: 0, n, dmgs, hp: st.hp, maxHp: st.hp, log: [], done: false, ok: null, heals: 0, target: p.realm + 1, used };
    Trib.s.log.push('Trước khi độ kiếp, ngươi điều tức đến trạng thái đỉnh phong.' + (used.length ? ' Kích hoạt: ' + used.join(', ') + '.' : ''));
    Trib.s.log.push('Kiếp vân tụ lại, ' + n + ' đạo lôi kiếp sắp giáng xuống!');
    UI.tribOpen && UI.tribOpen(Trib.s);
    clearTimeout(Trib.timer);
    Trib.timer = setTimeout(Trib.strike, 1800);
    Sfx.play('thunder');
    return true;
  },

  heal() {
    const s = Trib.s;
    if (!s || s.done) return false;
    const id = Combat.bestHealItem(false);
    if (!id) return false;
    const e = D.items[id].effect;
    Inv.remove(id, 1);
    s.hp = Math.min(s.maxHp, s.hp + s.maxHp * e.pct);
    s.heals++;
    s.log.push('Nuốt ' + D.items[id].name + ', hồi phục sinh lực.');
    UI.tribUpdate && UI.tribUpdate(s);
    return true;
  },

  strike() {
    const s = Trib.s;
    if (!s || s.done) return;
    const dmg = s.dmgs[s.i];
    if (G.settings.autoHeal && dmg < s.maxHp * 0.95 && s.hp - dmg <= s.maxHp * 0.05 && s.heals < 10) {
      let guard = 0;
      while (s.hp - dmg <= s.maxHp * 0.05 && guard++ < 3 && Trib.heal());
    }
    s.hp -= dmg;
    s.log.push('⚡ Đạo lôi kiếp thứ ' + (s.i + 1) + ' giáng xuống: -' + U.fmt(dmg) + ' sinh lực.');
    s.flash = true;
    Sfx.play('thunder');
    s.i++;
    if (s.hp <= 0) return Trib.end(false);
    if (s.i >= s.n) return Trib.end(true);
    UI.tribUpdate && UI.tribUpdate(s);
    Trib.timer = setTimeout(Trib.strike, 1600);
  },

  end(ok) {
    const s = Trib.s, p = G.player;
    s.done = true; s.ok = ok;
    if (ok) {
      Stats.add('tribs');
      p.tribBonus += 2;
      s.log.push('Lôi kiếp tan biến, thiên địa giáng xuống cam lộ tẩy lễ thân thể! Toàn chỉ số vĩnh viễn +2%.');
      Player.enterRealm(s.target);
    } else {
      const loss = Math.floor(p.tuVi * 0.4);
      p.tuVi -= loss;
      p.hp = 1;
      p.breakFails++;
      p.injuredUntil = Date.now() + 10 * 60 * 1000;
      s.log.push('Thân thể không chịu nổi lôi kiếp! Độ kiếp thất bại, tu vi tổn hao ' + U.fmt(loss) + ', trọng thương 10 phút.');
      Log.add('Độ kiếp thất bại.', 'bad');
      Sfx.play('fail');
    }
    UI.tribUpdate && UI.tribUpdate(s);
    Quests.check();
    Ach.check();
  },
};

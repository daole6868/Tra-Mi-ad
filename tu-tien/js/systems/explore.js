'use strict';
/* Thám hiểm bản đồ, rơi đồ, thủ lĩnh */

const Explore = {
  busy: false,
  auto: false,
  timer: null,
  progressStart: 0,
  DURATION: 1100,
  BOSS_CD: 180 * 1000,

  map() { return D.mapById[G.map] || D.maps[0]; },
  unlocked(m) { return Player.gs() >= m.lv[0] - 1 || m.index === 0; },

  setMap(id) {
    const m = D.mapById[id];
    if (!m || !Explore.unlocked(m)) return false;
    if (Combat.active() || Explore.busy) return false;
    G.map = id;
    return true;
  },

  /** Cấp yêu thú gặp phải, bám theo cảnh giới người chơi */
  monsterGs(m) {
    const g = Player.gs();
    return U.clamp(g + U.randInt(-1, 1), m.index === 0 ? 0 : m.lv[0], m.lv[1]);
  },

  start() {
    if (Explore.busy || Combat.active() || UI.modalOpen()) return false;
    if (Dungeon.busy()) {
      UI.toast('Đang ở trong bí cảnh — hãy hoàn thành hoặc rời bí cảnh trước.', 'bad');
      Explore.setAuto(false);
      return false;
    }
    const st = Player.stats();
    if (G.player.hp < st.hp * 0.15) {
      UI.toast('Sinh lực quá thấp, hãy nghỉ ngơi hoặc dùng đan dược.', 'bad');
      Explore.setAuto(false);
      return false;
    }
    Explore.busy = true;
    Explore.progressStart = Date.now();
    UI.exploreProgress && UI.exploreProgress(true);
    clearTimeout(Explore.timer);
    Explore.timer = setTimeout(Explore.resolve, Explore.DURATION);
    return true;
  },

  setAuto(v) {
    Explore.auto = !!v;
    if (!v) clearTimeout(Explore.autoTimer);
    UI.renderIf && UI.renderIf('explore');
  },

  scheduleAuto(ms = 700) {
    clearTimeout(Explore.autoTimer);
    if (!Explore.auto) return;
    Explore.autoTimer = setTimeout(Explore.autoStep, ms);
  },

  autoStep() {
    if (!Explore.auto) return;
    if (Combat.active() || Explore.busy || UI.modalOpen()) return Explore.scheduleAuto(1000);
    const p = G.player, st = Player.stats();
    if (p.hp < st.hp * 0.6) {
      if (G.settings.autoHeal && p.hp < st.hp * 0.4) {
        const id = Combat.bestHealItem(false);
        if (id) { Inv.use(id, 1); return Explore.scheduleAuto(300); }
      }
      UI.setExploreStatus && UI.setExploreStatus('Đang điều tức hồi phục…');
      return Explore.scheduleAuto(1000);
    }
    Explore.start();
  },

  resolve() {
    Explore.busy = false;
    UI.exploreProgress && UI.exploreProgress(false);
    const m = Explore.map();
    Stats.add('explores');
    const roll = U.weighted([
      { k: 'mon', w: 61 }, { k: 'herb', w: 14 }, { k: 'ore', w: 10 },
      { k: 'stones', w: 6 }, { k: 'event', w: 6 }, { k: 'chest', w: 3 },
    ]).k;
    const tier = m.tier;
    switch (roll) {
      case 'mon': {
        const mid = U.pick(m.mons);
        const elite = Math.random() < 0.08;
        Explore.fight(Combat.makeEnemy(mid, Explore.monsterGs(m), { elite, tier }), m, false);
        return;
      }
      case 'herb': {
        const id = U.pick(D.herbsByTier[tier]);
        const n = U.randInt(1, 2) + (Math.random() < Player.stats().drop / 200 ? 1 : 0);
        Inv.add(id, n);
        Explore.found('🌿 Phát hiện linh dược: ' + D.items[id].name + ' ×' + n);
        break;
      }
      case 'ore': {
        const id = D.oreByTier[tier];
        const n = U.randInt(1, 2);
        Inv.add(id, n);
        Explore.found('⛏️ Khai thác được ' + D.items[id].name + ' ×' + n);
        break;
      }
      case 'stones': {
        const n = Player.gainStones(6 * D.statScale(Explore.monsterGs(m)) * U.rand(0.8, 1.3));
        Explore.found('💎 Nhặt được ' + U.fmt(n) + ' linh thạch');
        break;
      }
      case 'event':
        Events.trigger(m);
        break;
      case 'chest': {
        const r = Explore.chestReward(tier, false);
        const txt = Loot.give(r);
        Explore.found('🎁 Tìm thấy rương báu: ' + txt.join(', '));
        Sfx.play('coin');
        break;
      }
    }
    Quests.check();
    Explore.scheduleAuto();
  },

  found(msg) {
    Log.add(msg, 'loot');
    UI.setExploreStatus && UI.setExploreStatus(msg);
    UI.renderIf && UI.renderIf('explore', true);
  },

  chestReward(tier, big) {
    const r = { items: {} };
    const roll = Math.random();
    if (roll < 0.4 || big) r.gear = [{ tier, q: Gear.rollQuality(Player.stats().drop + 40, big ? 2 : 1) }];
    if (roll >= 0.4 && roll < 0.7) r.items[U.pick(D.herbsByTier[tier])] = U.randInt(2, 4);
    if (roll >= 0.7 || big) r.items['yeu_dan_' + tier] = U.randInt(1, 3);
    if (Math.random() < (big ? 0.35 : 0.08)) {
      const books = Object.keys(D.skills).filter((id) => !D.skills[id].sect && D.skills[id].tier <= tier);
      r.items['book_s_' + U.pick(books)] = 1;
    }
    r.stones = 10 * D.statScale(D.realmStart[Math.min(tier, 10)] || 1);
    return r;
  },

  fight(enemy, m, isBoss) {
    Combat.start(enemy, {
      kind: 'explore',
      title: m.name,
      onWin: (b) => Explore.rewards(b.enemy, m, isBoss),
      onEnd: (b) => {
        if (b.result === 'lose') {
          Explore.setAuto(false);
          Log.add('Bại trận trước ' + b.enemy.name + '.', 'bad');
        }
        if (Explore.auto) Explore.scheduleAuto(1200);
      },
    });
  },

  rewards(en, m, isBoss) {
    const st = Player.stats();
    const dropMult = 1 + st.drop / 100;
    const r = { items: {} };
    Stats.add('kills');
    if (isBoss || en.boss) Stats.add('bossKills');
    if (G.sect) Sect.onKill();
    r.stones = 4 * D.statScale(en.gs) * U.rand(0.8, 1.2) * (en.boss ? 6 : en.elite ? 2 : 1);
    /* Tu vi từ chiến đấu */
    const diff = Player.gs() - en.gs;
    const lf = diff <= 0 ? 1 : Math.max(0.1, 1 - 0.25 * diff);
    const tv = Player.cultRate() * 1.5 * lf * (en.boss ? 5 : en.elite ? 2 : 1);
    if (!Player.canBreak()) r.tuvi = Math.floor(tv);
    const tier = m.tier;
    if (Math.random() < 0.35 * dropMult || en.boss) r.items['yeu_dan_' + tier] = (en.boss ? U.randInt(2, 4) : 1);
    if (Math.random() < 0.12 * dropMult) r.items[U.pick(D.herbsByTier[tier])] = 1;
    if (Math.random() < 0.08 * dropMult) r.items[D.oreByTier[tier]] = U.randInt(1, 2);
    const gearChance = en.boss ? 0.7 : en.elite ? 0.25 : 0.07;
    if (Math.random() < gearChance * dropMult) {
      r.gear = [{ tier, q: Gear.rollQuality(st.drop + (en.boss ? 60 : en.elite ? 25 : 0), en.boss ? 1 : 0) }];
    }
    const bookChance = en.boss ? 0.12 : 0.008;
    if (Math.random() < bookChance * dropMult) {
      const books = Object.keys(D.skills).filter((id) => !D.skills[id].sect && Math.abs(D.skills[id].tier - tier) <= 1);
      r.items['book_s_' + U.pick(books)] = 1;
    }
    if (en.boss && Math.random() < 0.15 * dropMult) r.items[tier >= 5 ? 'trung_yeu_thu' : 'trung_linh_thu'] = 1;
    if (en.boss && Math.random() < 0.05 * dropMult) {
      const techs = Object.keys(D.techniques).filter((id) => !D.techniques[id].sect && D.techniques[id].grade > 0 && D.techBookTier[D.techniques[id].grade] <= tier + 1);
      if (techs.length) r.items['book_t_' + U.pick(techs)] = 1;
    }
    return Loot.give(r);
  },

  bossReady(m) { return (G.bossCd[m.id] || 0) <= Date.now(); },

  challengeBoss() {
    const m = Explore.map();
    if (Combat.active() || Explore.busy || Dungeon.busy()) return false;
    if (!Explore.bossReady(m)) return false;
    G.bossCd[m.id] = Date.now() + Explore.BOSS_CD;
    const gs = Math.min(D.MAX_GS, m.lv[1]);
    const en = Combat.makeEnemy(m.boss, gs, { boss: true, tier: m.tier });
    Explore.fight(en, m, true);
    return true;
  },
};

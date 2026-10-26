'use strict';
/* Nhiệm vụ, thành tựu, luân hồi */

const Quests = {
  initMain() { G.quests.main = 0; G.quests.notified = -1; Quests.activateMain(); },
  cur() { return D.mainQuests[G.quests.main] || null; },
  activateMain() {
    const q = Quests.cur();
    if (q && q.t === 'stat') G.quests.mainBase = Stats.get(q.k);
  },
  progress(q, base) {
    switch (q.t) {
      case 'gs': return [Player.gs(), q.v];
      case 'stat': return [Math.max(0, Stats.get(q.k) - (base || 0)), q.v];
      case 'sect': return [G.sect ? 1 : 0, 1];
      case 'cave': return [G.cave.lv, q.v];
      case 'pets': return [G.pets.length, q.v];
      case 'tower': return [G.tower.best, q.v];
      case 'techLv': return [G.player.techs[G.player.tech] || 1, q.v];
      case 'skillEq': return [G.player.eq.length, q.v];
    }
    return [0, 1];
  },
  mainDone() {
    const q = Quests.cur();
    if (!q) return false;
    const [c, t] = Quests.progress(q, G.quests.mainBase);
    return c >= t;
  },
  claimMain() {
    const q = Quests.cur();
    if (!q || !Quests.mainDone()) return null;
    const txt = Loot.give(q.reward);
    Log.add('Hoàn thành nhiệm vụ: ' + q.name + '.', 'good');
    G.quests.main++;
    Quests.activateMain();
    Sfx.play('coin');
    if (!Quests.cur()) Log.add('Ngươi đã đi hết tiên đồ chính tuyến. Đạo vô cùng tận!', 'realm');
    return txt;
  },

  ensureDaily() {
    const t = U.todayKey();
    const d = G.quests.daily;
    if (d && d.date === t) return d;
    const picks = U.shuffle(D.dailyPool).slice(0, D.DAILY_COUNT);
    const base = {};
    for (const p of picks) base[p.k] = Stats.get(p.k);
    G.quests.daily = { date: t, list: picks.map((p) => ({ k: p.k, v: p.v, name: p.name, claimed: false })), base, points: 0, chests: [] };
    return G.quests.daily;
  },
  dailyProgress(task) {
    const d = Quests.ensureDaily();
    return Math.min(task.v, Stats.get(task.k) - (d.base[task.k] || 0));
  },
  claimDaily(i) {
    const d = Quests.ensureDaily();
    const task = d.list[i];
    if (!task || task.claimed || Quests.dailyProgress(task) < task.v) return null;
    task.claimed = true;
    d.points += 20;
    return Loot.give({ stones: 15 * D.statScale(Player.gs()), insight: Math.floor(10 * (1 + G.player.realm)) });
  },
  claimChest(j) {
    const d = Quests.ensureDaily();
    if (d.chests.includes(j) || d.points < D.dailyChests[j]) return null;
    d.chests.push(j);
    const s = D.statScale(Player.gs());
    const r = [
      { stones: 50 * s, items: { hoi_khi_dan: 3, hoi_linh_dan: 2 } },
      { insight: Math.floor(50 * (1 + G.player.realm)), items: { boi_nguyen_dan: 1, tui_linh_thach: 1 } },
      { stones: 80 * s, items: { bi_canh_lenh: 1, tui_linh_thach: 2, [Math.random() < 0.3 ? 'trung_yeu_thu' : 'trung_linh_thu']: 1 } },
    ][j];
    return Loot.give(r);
  },

  /* Điểm danh 7 ngày */
  loginState() {
    const L = G.quests.login, t = U.todayKey();
    if (L.last !== t) {
      const y = new Date(Date.now() - 86400000);
      const yk = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
      L.streak = L.last === yk ? (L.streak % 7) + 1 : 1;
      L.last = t;
    }
    return L;
  },
  loginReady() { const L = Quests.loginState(); return L.claimed !== L.last; },
  claimLogin() {
    const L = Quests.loginState();
    if (L.claimed === L.last) return null;
    L.claimed = L.last;
    const day = D.loginRewards[(L.streak - 1) % 7];
    const s = D.statScale(Player.gs());
    const r = { items: Object.assign({}, day.items || {}) };
    if (day.stones) r.stones = day.stones * s;
    if (day.insight) r.insight = Math.floor(day.insight * (1 + G.player.realm));
    if (day.gear) r.gear = [{ tier: Math.max(1, G.player.realm), q: day.gear }];
    return Loot.give(r);
  },

  check() {
    if (!G || !G.player) return;
    if (Quests.mainDone() && G.quests.notified !== G.quests.main) {
      G.quests.notified = G.quests.main;
      UI.toast('Nhiệm vụ hoàn thành: ' + Quests.cur().name + ' — vào Nhiệm Vụ nhận thưởng', 'quest');
    }
  },
  onStat() { /* tiến độ được tính lại khi hiển thị */ },
  badge() {
    let n = 0;
    if (Quests.mainDone()) n++;
    const d = Quests.ensureDaily();
    d.list.forEach((t) => { if (!t.claimed && Quests.dailyProgress(t) >= t.v) n++; });
    D.dailyChests.forEach((p, j) => { if (d.points >= p && !d.chests.includes(j)) n++; });
    if (Quests.loginReady()) n++;
    return n;
  },
};

const Ach = {
  test(a) {
    const c = a.c;
    switch (c[0]) {
      case 'stat': return Stats.get(c[1]) >= c[2];
      case 'realm': return G.player.realm >= c[1];
      case 'alchLv': return G.prof.alch.lv >= c[1];
      case 'enh': return G.gear.some((g) => g.enh >= c[1]);
      case 'tower': return G.tower.best >= c[1];
      case 'pets': return G.pets.length >= c[1];
      case 'petRarity': return G.pets.some((p) => D.petById[p.id].rarity >= c[1]);
      case 'sect': return !!G.sect && G.sect.rank >= c[1];
      case 'reinc': return G.reinc.count >= c[1];
      case 'karma': return c[1] > 0 ? G.player.karma >= c[1] : G.player.karma <= c[1];
      case 'root': return Player.rootType().grade >= c[1];
      case 'techLv': return Object.values(G.player.techs).some((lv) => lv >= c[1]);
    }
    return false;
  },
  check() {
    if (!G || !G.player) return;
    for (const a of D.achievements) {
      if (G.ach[a.id]) continue;
      if (Ach.test(a)) {
        G.ach[a.id] = Date.now();
        Log.add('🏆 Đạt thành tựu: ' + a.name + ' (' + Object.keys(a.b).map((k) => D.fmtBonus(k, a.b[k])).join(', ') + ')', 'ach');
        UI.toast('🏆 Thành tựu: ' + a.name, 'ach');
      }
    }
  },
  count() { return Object.keys(G.ach).length; },
};

const Reinc = {
  lv(id) { return (G && G.reinc && G.reinc.talents[id]) || 0; },
  pointsFor() {
    const gs = Player.gs();
    let pts = Math.floor(Math.pow(gs, 1.6) / 6) + Math.floor(Ach.count() / 3);
    if (G.player.realm >= 10) pts += 30;
    return Math.max(1, pts);
  },
  canVoluntary() { return Player.gs() >= 10; },
  upgrade(id) {
    const t = D.reincTalents.find((x) => x.id === id);
    const lv = Reinc.lv(id);
    if (!t || lv >= t.max) return false;
    const cost = D.reincCost(lv);
    if (G.reinc.points < cost) return false;
    G.reinc.points -= cost;
    G.reinc.talents[id] = lv + 1;
    return true;
  },
  /** reason: 'death' | 'voluntary' */
  perform(reason) {
    const pts = Reinc.pointsFor();
    const reinc = U.clone(G.reinc);
    reinc.count++;
    reinc.points += pts;
    reinc.totalPoints = (reinc.totalPoints || 0) + pts;
    G.stats.reincs = (G.stats.reincs || 0) + 1;
    const keep = { ach: G.ach, stats: G.stats, reinc, settings: G.settings, lastName: G.player.name, reason, pts };
    Combat.abort();
    Explore.setAuto(false);
    clearTimeout(Explore.timer);
    Explore.busy = false;
    Tower.auto = false;
    /* Lưu trạng thái chờ chuyển thế để tải lại trang không mất điểm */
    const s = Save.blank();
    s.ach = keep.ach; s.stats = keep.stats; s.reinc = keep.reinc; s.settings = keep.settings;
    s.pending = { lastName: keep.lastName, reason, pts };
    G = s;
    Save.save();
    UI.showCreation(keep);
  },
};

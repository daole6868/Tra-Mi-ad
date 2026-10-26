'use strict';
/* Linh thú, tông môn, phường thị */

const Pets = {
  def(pet) { return D.petById[pet.id]; },
  active() { return G.pets.find((p) => p.uid === G.activePet) || null; },
  cap() { return Math.min(D.MAX_GS, Player.gs() + 3); },
  passive(pet) {
    const d = Pets.def(pet), out = {};
    for (const k in d.passive) out[k] = d.passive[k] * (pet.lv + 5);
    return out;
  },
  atk(pet) {
    const d = Pets.def(pet);
    return Math.floor(12 * D.statScale(pet.lv) * 1.4 * D.petRarityMult[d.rarity]);
  },
  fighter(pet) {
    const d = Pets.def(pet);
    return { name: d.name, icon: d.icon, el: d.el, atk: Pets.atk(pet), turn: 0 };
  },
  addExp(pet, n) {
    pet.exp += n;
    let ups = 0;
    while (pet.lv < Pets.cap() && pet.exp >= D.petExpReq(pet.lv)) {
      pet.exp -= D.petExpReq(pet.lv);
      pet.lv++;
      ups++;
    }
    if (pet.lv >= Pets.cap()) pet.exp = Math.min(pet.exp, D.petExpReq(pet.lv) - 1);
    if (ups) Log.add(Pets.def(pet).name + ' thăng lên cấp ' + pet.lv + '.', 'good');
    return ups;
  },
  feed(uid, coreId, n = 1) {
    const pet = G.pets.find((p) => p.uid === uid);
    if (!pet) return { ok: false, msg: 'Không tìm thấy linh thú.' };
    if (pet.lv >= Pets.cap()) return { ok: false, msg: 'Linh thú đã đạt giới hạn cấp (cảnh giới chủ nhân +3).' };
    n = Math.min(n, Inv.count(coreId));
    if (n <= 0) return { ok: false, msg: 'Không có yêu đan.' };
    const t = D.items[coreId].tier;
    Inv.remove(coreId, n);
    const ups = Pets.addExp(pet, D.coreExp(t) * n);
    Stats.add('petFeeds', n);
    Quests.check();
    return { ok: true, msg: Pets.def(pet).name + ' nuốt ' + n + ' ' + D.items[coreId].name + (ups ? ', lên ' + ups + ' cấp!' : '.') };
  },
  gainBattleExp(enemyGs) {
    const pet = Pets.active();
    if (!pet || enemyGs < pet.lv - 3) return;
    Pets.addExp(pet, Math.ceil(D.petExpReq(pet.lv) * 0.05));
  },
  placeEgg(eggId) {
    const i = G.nests.findIndex((n) => !n);
    if (i < 0) return { ok: false, msg: 'Ổ ấp đã đầy.' };
    if (!Inv.has(eggId)) return { ok: false, msg: 'Không có trứng.' };
    const it = D.items[eggId];
    Inv.remove(eggId, 1);
    const now = Date.now();
    G.nests[i] = { egg: eggId, at: now, ready: now + it.hatch * 1000 };
    return { ok: true, msg: 'Đã đặt ' + it.name + ' vào ổ ấp. Nở sau ' + U.time(it.hatch) + '.' };
  },
  hatch(i) {
    const n = G.nests[i];
    if (!n || n.ready > Date.now()) return null;
    if (G.pets.length >= D.PET_MAX) return { err: 'Linh thú viên đã đầy (' + D.PET_MAX + ').' };
    const it = D.items[n.egg];
    const [lo, hi] = it.rarity;
    const opts = [];
    for (let r = lo; r <= hi; r++) opts.push({ r, w: Math.pow(0.35, r - lo) * (1 + Player.attrs().khiVan * 0.02 * (r - lo)) });
    const rar = U.weighted(opts).r;
    const sp = U.pick(D.pets.filter((p) => p.rarity === rar));
    const pet = { uid: U.uid(), id: sp.id, lv: 1, exp: 0 };
    G.pets.push(pet);
    G.nests[i] = null;
    if (!G.activePet) G.activePet = pet.uid;
    Stats.add('pets');
    Log.add('Trứng nở ra ' + sp.name + ' (' + '★'.repeat(sp.rarity) + ')!', 'good');
    Quests.check();
    Ach.check();
    Sfx.play('realm');
    return pet;
  },
  release(uid) {
    const pet = G.pets.find((p) => p.uid === uid);
    if (!pet) return null;
    G.pets = G.pets.filter((p) => p.uid !== uid);
    if (G.activePet === uid) G.activePet = G.pets[0] ? G.pets[0].uid : null;
    const t = Math.max(1, Math.min(10, D.gsToRS(pet.lv).r));
    const n = 1 + Math.floor(pet.lv / 4) + Pets.def(pet).rarity;
    Inv.add('yeu_dan_' + t, n);
    return { t, n };
  },
};

const Sect = {
  data() { return G.sect ? D.sectById[G.sect.id] : null; },
  rank() { return D.sectRanks[G.sect.rank]; },
  canJoin(s) {
    if (G.sect) return 'Đã có tông môn.';
    if (Player.gs() < D.SECT_JOIN_GS) return 'Cần đạt ' + D.gsName(D.SECT_JOIN_GS) + '.';
    const k = G.player.karma;
    if (s.align === 'chinh' && k < -30) return 'Thiện duyên quá thấp, chính đạo không thu nhận.';
    if (s.align === 'ma' && k > 30) return 'Ngươi quá "chính nghĩa", ma đạo không tin tưởng.';
    return true;
  },
  join(id) {
    const s = D.sectById[id];
    if (!s || Sect.canJoin(s) !== true) return false;
    G.sect = { id, contrib: 0, total: 0, rank: 0, missions: [], salary: '', spar: { date: '', n: 0 } };
    for (let i = 0; i < 3; i++) G.sect.missions.push(Sect.genMission());
    Log.add('Bái nhập ' + s.name + ', trở thành Ngoại Môn Đệ Tử.', 'good');
    Quests.check();
    Ach.check();
    return true;
  },
  leave() {
    if (!G.sect) return;
    Log.add('Rời khỏi ' + Sect.data().name + '.', 'bad');
    G.sect = null;
  },
  missionContrib() { return Math.floor(25 * Math.pow(1.6, G.player.realm)); },
  addContrib(n) {
    if (!G.sect) return;
    G.sect.contrib += n;
    G.sect.total += n;
    Sect.checkRank();
  },
  canPromote() {
    const s = G.sect;
    if (!s || s.rank >= D.sectRanks.length - 1) return false;
    const nx = D.sectRanks[s.rank + 1];
    return s.total >= nx.total && Player.gs() >= nx.gs;
  },
  checkRank() {
    while (Sect.canPromote()) {
      G.sect.rank++;
      Log.add('Thăng cấp ' + Sect.rank().name + ' của ' + Sect.data().name + '!', 'good');
      UI.toast('Thăng cấp tông môn: ' + Sect.rank().name, 'good');
      Ach.check();
    }
  },
  genMission() {
    const r = Math.max(1, G.player.realm);
    const tier = Math.min(10, r);
    const types = [
      { t: 'kill', w: 3 }, { t: 'explore', w: 2 }, { t: 'herb', w: 2 }, { t: 'core', w: 2 },
      { t: 'donate', w: 1 }, { t: 'alch', w: 1 }, { t: 'boss', w: 1 },
    ];
    const t = U.weighted(types).t;
    const c = Sect.missionContrib();
    const m = { t, reward: { contrib: c, stones: Math.floor(8 * D.statScale(Player.gs())) } };
    switch (t) {
      case 'kill': m.k = 'kills'; m.n = U.randInt(8, 16); m.name = 'Tiêu diệt ' + m.n + ' yêu thú'; break;
      case 'explore': m.k = 'explores'; m.n = U.randInt(12, 25); m.name = 'Tuần tra (thám hiểm ' + m.n + ' lần)'; break;
      case 'alch': m.k = 'pillsMade'; m.n = U.randInt(1, 3); m.name = 'Luyện thành ' + m.n + ' lò đan'; m.reward.contrib = Math.floor(c * 1.2); break;
      case 'boss': m.k = 'bossKills'; m.n = 1; m.name = 'Trảm 1 thủ lĩnh yêu thú'; m.reward.contrib = Math.floor(c * 1.6); break;
      case 'herb': m.item = U.pick(D.herbsByTier[tier]); m.n = U.randInt(3, 6); m.name = 'Nộp ' + m.n + ' ' + D.items[m.item].name; break;
      case 'core': m.item = 'yeu_dan_' + tier; m.n = U.randInt(2, 4); m.name = 'Nộp ' + m.n + ' ' + D.items[m.item].name; m.reward.contrib = Math.floor(c * 1.2); break;
      case 'donate': m.cost = Math.floor(25 * D.statScale(Player.gs())); m.n = 1; m.name = 'Quyên góp ' + U.fmt(m.cost) + ' linh thạch'; m.reward.stones = 0; m.reward.contrib = Math.floor(c * 0.9); break;
    }
    if (m.k) m.base = Stats.get(m.k);
    return m;
  },
  progress(m) {
    if (m.k) return Math.min(m.n, Stats.get(m.k) - m.base);
    if (m.item) return Math.min(m.n, Inv.count(m.item));
    if (m.t === 'donate') return G.player.stones >= m.cost ? 1 : 0;
    return 0;
  },
  claim(i) {
    const m = G.sect && G.sect.missions[i];
    if (!m || Sect.progress(m) < m.n) return null;
    if (m.item) Inv.remove(m.item, m.n);
    if (m.t === 'donate' && !Player.spendStones(m.cost)) return null;
    const txt = Loot.give(m.reward);
    Stats.add('sectMissions');
    G.sect.missions[i] = Sect.genMission();
    Quests.check();
    return txt;
  },
  rerollCost() { return Math.floor(4 * D.statScale(Player.gs())); },
  reroll(i) {
    if (!G.sect || !Player.spendStones(Sect.rerollCost())) return false;
    G.sect.missions[i] = Sect.genMission();
    return true;
  },
  salaryReady() { return G.sect && G.sect.salary !== U.todayKey(); },
  claimSalary() {
    if (!Sect.salaryReady()) return null;
    G.sect.salary = U.todayKey();
    const r = Sect.rank();
    return Loot.give({ stones: r.salary * D.statScale(Player.gs()), contrib: Math.floor(Sect.missionContrib() * 0.3) });
  },
  sparLeft() {
    const sp = G.sect.spar, t = U.todayKey();
    if (sp.date !== t) { sp.date = t; sp.n = 0; }
    return D.SPAR_DAILY - sp.n;
  },
  spar() {
    if (!G.sect || Sect.sparLeft() <= 0 || Combat.active() || Explore.busy || Dungeon.busy()) return false;
    Explore.setAuto(false);
    G.sect.spar.n++;
    const gs = Math.min(D.MAX_GS, Player.gs() + (G.sect.spar.n >= 4 ? 1 : 0));
    const en = Combat.makeEnemy('dong_mon', gs, { tier: Math.max(1, G.player.realm) });
    en.name = U.pick(['Lý', 'Trương', 'Vương', 'Triệu', 'Lâm', 'Hàn', 'Tô', 'Diệp']) + ' ' + U.pick(['Sư Huynh', 'Sư Tỷ', 'Sư Đệ', 'Sư Muội']);
    Combat.start(en, {
      kind: 'sect', title: 'Luận Võ Đài — ' + Sect.data().name, sim: true,
      onWin: () => Loot.give({ contrib: Math.floor(Sect.missionContrib() * 0.6), stones: 6 * D.statScale(gs) }),
      onEnd: () => UI.renderIf && UI.renderIf('sect', true),
    });
    return true;
  },
  shopItems() {
    const s = Sect.data();
    return D.sectShop.map((e) => {
      let id = e.item;
      if (id === '@tech') id = 'book_t_' + s.tech;
      if (id === '@skill') id = 'book_s_' + s.skill;
      return { id, cost: e.cost, rank: e.rank };
    });
  },
  buy(idx) {
    const e = Sect.shopItems()[idx];
    if (!e || !G.sect) return { ok: false, msg: 'Không có vật phẩm.' };
    if (G.sect.rank < e.rank) return { ok: false, msg: 'Cần cấp bậc ' + D.sectRanks[e.rank].name + '.' };
    if (G.sect.contrib < e.cost) return { ok: false, msg: 'Không đủ cống hiến.' };
    G.sect.contrib -= e.cost;
    Inv.add(e.id, 1);
    return { ok: true, msg: 'Đổi được ' + D.items[e.id].name + '.' };
  },
  onKill() { /* tiến độ nhiệm vụ tính theo thống kê */ },
};

const Market = {
  REFRESH_MS: 20 * 60 * 1000,
  fixedList() {
    const r = Math.max(1, G.player.realm);
    const list = ['hoi_khi_dan', 'hoi_linh_dan', 'tri_thuong_dan', 'tu_khi_dan'];
    if (r >= 1) list.push('boi_nguyen_dan', 'giai_doc_dan', 'cuong_bao_dan', 'kim_cang_dan', 'bi_canh_lenh');
    if (r >= 2) list.push('dai_hoan_dan', 'ngung_nguyen_dan');
    if (r >= 3) list.push('ti_loi_phu', 'tho_nguyen_dan');
    if (r >= 4) list.push('thai_hu_dan');
    if (r >= 5) list.push('cuu_chuyen_dan');
    if (r >= 6) list.push('hon_nguyen_dan');
    if (r >= 8) list.push('tien_linh_dan');
    if (r >= 10) list.push('hong_mong_dan');
    for (let t = 1; t <= Math.min(10, r); t++) {
      list.push(...D.herbsByTier[t], D.oreByTier[t], 'yeu_dan_' + t);
    }
    list.push('trung_linh_thu');
    for (const id in D.techniques) if (D.techniques[id].grade === 1) list.push('book_t_' + id);
    for (const id in D.skills) if (!D.skills[id].sect && D.skills[id].tier <= Math.min(3, r)) list.push('book_s_' + id);
    return list.filter((id) => D.items[id]);
  },
  refresh(force) {
    const m = G.market;
    if (!force && m.refreshAt > Date.now()) return false;
    const r = Math.max(1, G.player.realm);
    const tier = Math.min(10, r);
    const stock = [];
    for (let i = 0; i < 6; i++) {
      const roll = Math.random();
      if (roll < 0.35) {
        const q = Gear.rollQuality(80, 2);
        const g = { uid: U.uid(), slot: Gear.randomSlot(), tier, q, enh: 0, affixes: Gear.rollAffixes(q), lock: false };
        stock.push({ kind: 'gear', g, price: Math.floor(Gear.value(g) * 3), sold: false });
      } else if (roll < 0.6) {
        const books = Object.keys(D.skills).filter((id) => !D.skills[id].sect && D.skills[id].tier >= Math.max(1, tier - 1) && D.skills[id].tier <= tier + 1);
        const id = 'book_s_' + U.pick(books);
        stock.push({ kind: 'item', id, n: 1, price: Math.floor(Inv.buyPrice(id) * 1.5), sold: false });
      } else if (roll < 0.72) {
        const techs = Object.keys(D.techniques).filter((id) => !D.techniques[id].sect && D.techniques[id].grade >= 1 && D.techBookTier[D.techniques[id].grade] <= tier + 2);
        const id = 'book_t_' + U.pick(techs);
        stock.push({ kind: 'item', id, n: 1, price: Math.floor(Inv.buyPrice(id) * 1.5), sold: false });
      } else {
        const pool = ['tay_tuy_dan', 'khai_tri_dan', 'duong_hon_dan', 'tho_nguyen_dan', 'ngo_dao_dan', 'trung_yeu_thu', 'tui_linh_thach'];
        if (tier >= 4) pool.push('trung_than_thu', 'tao_hoa_dan');
        if (tier >= 6) pool.push('tay_linh_dich');
        if (tier >= 8) pool.push('trung_tien_thu');
        const id = U.pick(pool);
        const scale = Math.max(1, D.tierPrice(tier) / D.tierPrice(D.items[id].tier));
        stock.push({ kind: 'item', id, n: 1, price: Math.floor(Inv.buyPrice(id) * 2 * Math.sqrt(scale)), sold: false });
      }
    }
    m.stock = stock;
    m.refreshAt = Date.now() + Market.REFRESH_MS;
    return true;
  },
  refreshCost() { return Math.floor(30 * D.tierPrice(Math.max(1, G.player.realm))); },
  manualRefresh() {
    if (!Player.spendStones(Market.refreshCost())) return false;
    Market.refresh(true);
    return true;
  },
  buy(id, n = 1) {
    const price = Inv.buyPrice(id) * n;
    if (!Player.spendStones(price)) return { ok: false, msg: 'Không đủ linh thạch.' };
    Inv.add(id, n);
    Sfx.play('coin');
    return { ok: true, msg: 'Mua ' + n + ' ' + D.items[id].name + '.' };
  },
  buyStock(i) {
    const e = G.market.stock[i];
    if (!e || e.sold) return { ok: false, msg: 'Hàng đã bán.' };
    if (e.kind === 'gear' && G.gear.length >= Gear.MAX) return { ok: false, msg: 'Túi trang bị đã đầy.' };
    if (!Player.spendStones(e.price)) return { ok: false, msg: 'Không đủ linh thạch.' };
    e.sold = true;
    if (e.kind === 'gear') G.gear.push(e.g);
    else Inv.add(e.id, e.n);
    Sfx.play('coin');
    return { ok: true, msg: 'Mua thành công.' };
  },
};

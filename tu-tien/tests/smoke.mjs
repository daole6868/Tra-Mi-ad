// Kiểm thử khói: mở game trong Chromium, tạo nhân vật, đi qua mọi trang, chạy vài hành động chính.
// Cách dùng: node tests/smoke.mjs [đường_dẫn_html] [thư_mục_ảnh]
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const file = resolve(process.argv[2] || 'index.html');
const shots = process.argv[3] ? resolve(process.argv[3]) : null;
if (shots) mkdirSync(shots, { recursive: true });

const errors = [];
const browser = await chromium.launch();
const run = async (viewport, tag) => {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', (e) => errors.push('[' + tag + '] pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push('[' + tag + '] console: ' + m.text()); });
  await page.goto('file://' + file);
  await page.waitForSelector('[data-act="crStart"]');
  if (shots) await page.screenshot({ path: shots + '/' + tag + '-0-creation.png', fullPage: true });
  await page.click('[data-act="crReroll"]');
  await page.click('[data-act="crBg"][data-arg="co_nhi"]');
  await page.click('[data-act="crStart"]');
  await page.waitForSelector('.modal');
  await page.click('.modal .btn.primary');
  /* Đột phá Luyện Khí */
  await page.evaluate(() => { G.player.tuVi = Player.req(); });
  await page.waitForTimeout(300);
  await page.click('#cv-break');
  await page.waitForSelector('.modal');
  await page.click('.modal .btn.primary');
  await page.waitForTimeout(500);
  if (shots) await page.screenshot({ path: shots + '/' + tag + '-1-cultivate.png', fullPage: true });
  /* Học thần thông */
  await page.evaluate(() => { const id = Object.keys(G.inv).find((k) => k.startsWith('book_s_')); Inv.use(id); UI.render(); });
  /* Thám hiểm & chiến đấu */
  await page.click('[data-act="tab"][data-arg="explore"] >> visible=true');
  await page.evaluate(() => { G.settings.battleSpeed = 4; });
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => { if (UI.modalOpen()) UI.closeTopModal(); if (!Combat.active()) { Combat.clear(); Explore.start(); } });
    await page.waitForTimeout(2500);
  }
  if (shots) await page.screenshot({ path: shots + '/' + tag + '-2-explore.png', fullPage: true });
  /* Trao thêm tài nguyên để kiểm thử các trang khác */
  await page.evaluate(() => {
    if (UI.modalOpen()) UI.modals.slice().forEach((m) => UI.closeModal(m));
    Combat.abort();
    G.player.realm = 2; G.player.stage = 1; G.player.stones = 1e6; G.player.insight = 1e5;
    for (const id of ['linh_chi', 'ngung_huyet', 'yeu_dan_1', 'yeu_dan_2', 'hac_thiet', 'tinh_cuong', 'trung_linh_thu', 'tu_van_hoa', 'bich_ngoc_thao']) Inv.add(id, 30);
    Sect.join('thanh_van');
    UI.render();
  });
  const tabs = await page.evaluate(() => Object.keys(UI.tabs));
  for (const t of tabs) {
    await page.evaluate((t) => UI.go(t), t);
    await page.waitForTimeout(250);
    if (shots && ['character', 'inventory', 'alchemy', 'forge', 'sect', 'quests', 'market', 'pets'].includes(t)) await page.screenshot({ path: shots + '/' + tag + '-tab-' + t + '.png', fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (overflow) errors.push('[' + tag + '] tràn ngang ở trang ' + t);
  }
  /* Hành động nghề */
  await page.evaluate(() => {
    UI.go('alchemy'); A.alchCraft('hoi_khi_dan:3');
    UI.go('forge'); A.forgeCraft();
    UI.go('pets'); A.placeEgg('trung_linh_thu'); G.nests[0].ready = Date.now() - 1; A.hatch('0');
    UI.closeTopModal();
    UI.go('cave'); Cave.plant(0, 'linh_chi'); UI.renderMain();
    UI.go('tower'); A.towerGo();
  });
  await page.waitForTimeout(4000);
  if (shots) await page.screenshot({ path: shots + '/' + tag + '-3-tower.png', fullPage: true });
  /* Bí cảnh + thiên kiếp */
  await page.evaluate(() => {
    Combat.abort(); Combat.clear();
    G.player.realm = 3; G.player.stage = 3; G.player.tuVi = Player.req();
    Inv.add('hoi_khi_dan', 10);
    UI.go('cultivate');
    A.breakthrough();
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => { const b = document.querySelector('.modal .btn.primary'); b && b.click(); });
  await page.waitForTimeout(9000);
  if (shots) await page.screenshot({ path: shots + '/' + tag + '-4-trib.png', fullPage: true });
  await page.evaluate(() => { UI.modals.slice().forEach((m) => UI.closeModal(m)); UI.go('dungeon'); A.dgEnter('that_huyen'); });
  await page.waitForTimeout(6000);
  if (shots) await page.screenshot({ path: shots + '/' + tag + '-5-dungeon.png', fullPage: true });
  /* Lưu / đọc */
  const ok = await page.evaluate(() => { Save.save(); const s = Save.importString(Save.exportString()); return !!s.player; });
  if (!ok) errors.push('[' + tag + '] xuất/nhập dữ liệu thất bại');
  await page.reload();
  await page.waitForTimeout(800);
  const realm = await page.evaluate(() => G && G.player && G.player.realm);
  if (realm == null) errors.push('[' + tag + '] tải lại không khôi phục được dữ liệu');
  await page.close();
};

/* Các luồng đặc biệt: thủ công, kỳ ngộ, ngoại tuyến, luân hồi, tọa hóa */
const flows = async () => {
  const tag = 'flows';
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  page.on('pageerror', (e) => errors.push('[' + tag + '] pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push('[' + tag + '] console: ' + m.text()); });
  await page.goto('file://' + file);
  await page.waitForSelector('[data-act="crStart"]');
  await page.click('[data-act="crStart"]');
  await page.waitForSelector('.modal');
  await page.click('.modal .btn.primary');
  const step = async (name, fn, wait = 300) => {
    try { await page.evaluate(fn); } catch (e) { errors.push('[' + tag + '] ' + name + ': ' + e.message); }
    await page.waitForTimeout(wait);
  };
  /* Chiến đấu thủ công */
  await step('manual', () => {
    G.player.realm = 1; G.player.stage = 2; Inv.use(Object.keys(G.inv).find((k) => k.startsWith('book_s_')));
    G.settings.autoBattle = false; G.settings.battleSpeed = 4;
    UI.go('explore');
    const en = Combat.makeEnemy('hoang_lang', 1, { tier: 1 });
    Combat.start(en, { kind: 'explore', onWin: () => ['test'] });
  }, 1500);
  for (let i = 0; i < 40; i++) {
    const done = await page.evaluate(() => {
      const b = Combat.b; if (!b || b.over) return true;
      const btn = document.querySelector('#b-actions [data-act="bAct"]:not([disabled])');
      if (btn) btn.click();
      return false;
    });
    if (done) break;
    await page.waitForTimeout(250);
  }
  const over = await page.evaluate(() => !!(Combat.b && Combat.b.over));
  if (!over) errors.push('[' + tag + '] trận thủ công không kết thúc');
  if (shots) await page.screenshot({ path: shots + '/flows-manual.png', fullPage: true });
  /* Kỳ ngộ thủ công */
  await step('event', () => {
    Combat.clear(); G.settings.autoBattle = true; Explore.auto = false;
    const ev = Events.list.find((e) => e.id === 'thuong_nhan');
    const ctx = { tier: 1, gs: 2, s: D.statScale(2), m: D.maps[0] };
    ev.prep(ctx); UI.eventModal(ev, ctx);
  });
  if (shots) await page.screenshot({ path: shots + '/flows-event.png' });
  await step('event-choose', () => { document.querySelector('.modal-wrap:last-child .modal-actions .btn:last-child').click(); });
  await step('event-close', () => { document.querySelector('.modal-wrap:last-child .modal-actions .btn').click(); });
  await step('event-fight', () => {
    const ev = Events.list.find((e) => e.id === 'tan_tu');
    const ctx = { tier: 1, gs: 2, s: D.statScale(2), m: D.maps[0] };
    UI.eventModal(ev, ctx);
    document.querySelector('.modal-wrap:last-child .modal-actions .btn').click();
  });
  await step('event-fight2', () => { document.querySelector('.modal-wrap:last-child .modal-actions .btn').click(); }, 3000);
  /* Vật phẩm & phường thị */
  await step('items', () => {
    UI.closeTopModal(); Combat.abort();
    G.player.stones = 1e7;
    UI.go('market'); A.buy('hoi_khi_dan:10'); A.buyStock('0'); A.mkRefresh();
    UI.go('inventory'); A.itemInfo('hoi_khi_dan');
  });
  await step('items2', () => { UI.closeTopModal(); A.invCat('gear'); const g = G.gear.find((x) => !Gear.isEquipped(x)); if (g) { A.gearInfo(g.uid); UI.closeTopModal(); } A.bulkGear('salvage'); });
  await step('items3', () => { const b = document.querySelector('.modal .btn.primary'); if (b) b.click(); UI.go('character'); A.autoEquip(); });
  /* Ngoại tuyến */
  await step('offline', () => { clearInterval(Main.timer); G.lastTick = Date.now() - 2 * 3600 * 1000; Save.save(); Main.skipSave = true; });
  await page.reload();
  await page.waitForTimeout(800);
  const off = await page.evaluate(() => !!document.querySelector('.modal-head h3') && document.querySelector('.modal-head h3').textContent);
  if (!off || !/Ngoại Tuyến/.test(off)) errors.push('[' + tag + '] không hiện báo cáo ngoại tuyến: ' + off);
  if (shots) await page.screenshot({ path: shots + '/flows-offline.png' });
  /* Luân hồi chủ động */
  await step('reinc', () => { UI.closeTopModal(); G.player.realm = 3; G.player.stage = 0; UI.go('reinc'); Reinc.perform('voluntary'); });
  await page.waitForSelector('[data-act="crStart"]');
  await step('reinc-talent', () => { const b = document.querySelector('[data-act="crTalent"]:not([disabled])'); if (b) b.click(); });
  if (shots) await page.screenshot({ path: shots + '/flows-reinc.png', fullPage: true });
  await page.reload();
  await page.waitForSelector('[data-act="crStart"]');
  await page.click('[data-act="crStart"]');
  await page.waitForTimeout(500);
  const rc = await page.evaluate(() => G.reinc.count);
  if (rc !== 1) errors.push('[' + tag + '] số lần luân hồi sai: ' + rc);
  /* Tọa hóa */
  await step('death', () => { UI.modals.slice().forEach((m) => UI.closeModal(m)); G.player.age = Player.lifespan() + 1; }, 800);
  const dm = await page.evaluate(() => document.querySelector('.modal-head h3') && document.querySelector('.modal-head h3').textContent);
  if (!dm || !/Thọ Nguyên/.test(dm)) errors.push('[' + tag + '] không hiện hộp thoại tọa hóa: ' + dm);
  await step('death2', () => document.querySelector('.modal .btn.primary').click(), 500);
  const cr = await page.evaluate(() => !!document.querySelector('[data-act="crStart"]'));
  if (!cr) errors.push('[' + tag + '] không chuyển sang màn chuyển thế');
  await page.close();
};

await flows();
await run({ width: 1400, height: 900 }, 'desktop');
await run({ width: 390, height: 844 }, 'mobile');
await browser.close();
if (errors.length) { console.log('LỖI:\n' + errors.join('\n')); process.exit(1); }
console.log('Kiểm thử khói: OK');

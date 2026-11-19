// Kiểm thử khói trên Chromium: đi qua vòng chơi chính bằng thao tác thật + một số lệnh dịch chuyển để rút ngắn thời gian.
// Cách dùng: node tests/smoke.mjs [đường_dẫn_html=index.html] [thư_mục_ảnh]
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const file = resolve(process.argv[2] || 'index.html');
const shots = process.argv[3] ? resolve(process.argv[3]) : null;
if (shots) mkdirSync(shots, { recursive: true });

const errors = [];
const fail = (m) => errors.push(m);
const browser = await chromium.launch();

async function page(viewport, tag, touch = false) {
  const p = await browser.newPage({ viewport, hasTouch: touch, isMobile: touch });
  p.on('pageerror', (e) => fail('[' + tag + '] lỗi trang: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_/.test(m.text())) fail('[' + tag + '] console: ' + m.text()); });
  await p.goto('file://' + file);
  await p.waitForTimeout(600);
  return p;
}
const shot = async (p, name) => { if (shots) await p.screenshot({ path: shots + '/' + name + '.png' }); };
const ev = (p, fn, arg) => p.evaluate(fn, arg);
const wait = (p, ms) => p.waitForTimeout(ms);

/* ---------------- Máy tính ---------------- */
{
  const tag = 'pc';
  const p = await page({ width: 1280, height: 720 }, tag);
  await ev(p, () => localStorage.clear());
  await shot(p, '01-title');
  await p.click('[data-ui="newgame"]');
  await wait(p, 200);
  await shot(p, '02-intro');
  await p.click('[data-ui="resume"]');
  await wait(p, 300);
  /* chặt cây thật bằng phím J */
  await ev(p, () => {
    const r = Game.world.resources.filter((x) => x.type === 'tung' || x.type === 'phong').sort((a, b) => Math.abs(a.x - Game.player.cx) - Math.abs(b.x - Game.player.cx))[0];
    Game.player.x = r.x - 28; Game.player.y = Game.topY(r.x - 28) - 30; Game.player.face = 1; window.__tree = r;
  });
  for (let i = 0; i < 16; i++) { await p.keyboard.press('KeyJ'); await wait(p, 120); }
  await wait(p, 900);
  const wood = await ev(p, () => Game.inv.count('go'));
  if (wood < 1) fail('[pc] chặt cây không nhận được gỗ (' + wood + ')');
  await shot(p, '03-chop');
  /* chế tạo bàn chế tác qua giao diện */
  await ev(p, () => { Game.inv.add('go', 40); Game.inv.add('da', 20); Game.inv.add('truc', 10); Game.inv.add('da_thu', 4); });
  await p.keyboard.press('Tab');
  await wait(p, 200);
  const btn = await p.$('.recipe.can [data-ui="craft"]');
  if (!btn) fail('[pc] không thấy công thức chế tạo khả dụng');
  await ev(p, () => { const i = DATA.recipes.findIndex((r) => r.out === 'ban_che_tac'); document.querySelector('[data-ui="craft"][data-arg="' + i + ':1"]').click(); });
  await wait(p, 150);
  await shot(p, '04-craft');
  if (!(await ev(p, () => Game.inv.count('ban_che_tac')))) fail('[pc] chế tạo Bàn chế tác thất bại');
  await p.keyboard.press('Tab');
  /* đặt công trình bằng phím F */
  const place = async (id) => {
    await ev(p, (id) => { const i = Game.inv.slots.findIndex((s) => s && s.id === id); if (i >= 8) Game.inv.swap(i, 7); Game.inv.sel = i >= 8 ? 7 : i; }, id);
    for (let k = 0; k < 6; k++) {
      const ok = await ev(p, () => { const pl = Game.placement(); return pl && pl.ok; });
      if (ok) break;
      await ev(p, () => { Game.player.x += 40; Game.player.y = Game.topY(Game.player.cx) - 30; });
      await wait(p, 120);
    }
    await p.keyboard.press('KeyF');
    await wait(p, 120);
  };
  await ev(p, () => { Game.player.x = Game.world.spawnX + 160; Game.player.y = Game.topY(Game.player.cx) - 30; Game.player.face = 1; });
  await wait(p, 200);
  await place('ban_che_tac');
  if (!(await ev(p, () => Game.hasStructure('ban_che_tac')))) fail('[pc] đặt Bàn chế tác thất bại');
  /* chế tạo rìu ở gần bàn */
  await ev(p, () => { const s = Game.structures[0]; Game.player.x = s.x - 30; Game.player.y = Game.topY(s.x - 30) - 30; });
  await wait(p, 150);
  const craftR = await ev(p, () => Craft.make(Game, DATA.recipes.find((r) => r.out === 'riu_da'), 1).ok && Craft.make(Game, DATA.recipes.find((r) => r.out === 'kiem_go'), 1).ok && Craft.make(Game, DATA.recipes.find((r) => r.out === 'lua_trai'), 1).ok);
  if (!craftR) fail('[pc] chế tạo ở bàn chế tác thất bại');
  await ev(p, () => { Game.player.x += 90; Game.player.y = Game.topY(Game.player.cx) - 30; });
  await place('lua_trai');
  if (!(await ev(p, () => Game.hasStructure('lua_trai')))) fail('[pc] dựng lửa trại thất bại');
  /* ngồi thiền bên lửa trại → Luyện Khí */
  await ev(p, () => { const s = Game.structures.find((x) => x.type === 'lua_trai'); Game.player.x = s.x + 10; Game.player.y = Game.topY(s.x + 10) - 30; Game.player.vx = 0; });
  await wait(p, 300);
  await ev(p, () => { Game.findInteract(); });
  await p.keyboard.press('KeyE');
  await wait(p, 1500);
  const med = await ev(p, () => !!Game.player.med && Game.player.tuvi > 0);
  if (!med) fail('[pc] ngồi thiền không tăng tu vi');
  await ev(p, () => Game.gainTuvi(45));
  await wait(p, 300);
  if ((await ev(p, () => Game.player.realm)) < 1) fail('[pc] không đột phá Luyện Khí');
  await shot(p, '05-meditate');
  /* đêm & yêu ma */
  await ev(p, () => { Game.stopMeditate(); Game.time = 0.66; Game.player.realm = 4; Game.inv.sel = Game.inv.slots.findIndex((s) => s && s.id === 'kiem_go'); Game.player.x += 600; Game.player.y = Game.topY(Game.player.cx) - 30; });
  await wait(p, 6000);
  const mobs = await ev(p, () => Game.mobs.filter((m) => m.alive && m.ai !== 'passive').length);
  if (mobs < 1) fail('[pc] ban đêm không sinh yêu ma');
  for (let i = 0; i < 20; i++) { await ev(p, () => { const m = Game.mobs.find((x) => x.alive && x.ai !== 'passive'); if (m) { Game.player.x = m.cx - Game.player.face * 20 - 6; Game.player.y = m.bottom - 30; Game.player.invT = 1; } }); await p.keyboard.press('KeyJ'); await wait(p, 150); }
  await shot(p, '06-night-fight');
  if ((await ev(p, () => Game.stats.kills)) < 1) fail('[pc] không hạ được yêu ma nào');
  /* bí cảnh Thanh Mộc */
  await ev(p, () => { Game.time = 0.2; const pt = Game.world.portals.find((x) => x.id === 'moc'); Game.player.x = pt.x - 6; Game.player.y = pt.y - 30; Game.mobs = []; });
  await wait(p, 200);
  await p.keyboard.press('KeyE');
  await wait(p, 900);
  if (!(await ev(p, () => Game.inDungeon === 'moc'))) fail('[pc] không vào được bí cảnh');
  await shot(p, '07-dungeon');
  await ev(p, () => { Game.player.x += 900; Game.player.y = Game.topY(Game.player.cx) - 30; });
  await wait(p, 1500);
  await shot(p, '08-dungeon-mid');
  await ev(p, () => { const A = Game.dungeon.arena; Game.player.x = A.x0 + 80; Game.player.y = A.y - 30; Game.player.invT = 99; Game.player.realm = 9; });
  await wait(p, 2500);
  if (!(await ev(p, () => !!Game.boss))) fail('[pc] thủ lĩnh không xuất hiện');
  await shot(p, '09-boss');
  await ev(p, () => { Game.boss.hp = 5; Game.player.x = Game.boss.cx - 26; Game.player.y = Game.boss.bottom - 30; Game.player.face = 1; });
  await p.keyboard.press('KeyJ');
  await wait(p, 600);
  if (!(await ev(p, () => Game.cleared.moc))) fail('[pc] hạ thủ lĩnh không ghi nhận chinh phục');
  await ev(p, () => { for (const d of Game.drops) { d.t = 1; d.x = Game.player.cx - 5; d.y = Game.player.cy - 5; } });
  await wait(p, 500);
  if (!(await ev(p, () => Game.inv.has('manh_moc')))) fail('[pc] không nhặt được mảnh Thiên Bia');
  await shot(p, '10-boss-down');
  await ev(p, () => { const e = Game.dungeon.exitPortal; Game.player.x = e.x - 6; Game.player.y = e.y - 30; Game.player.invT = 0; });
  await wait(p, 200);
  await p.keyboard.press('KeyE');
  await wait(p, 600);
  if (await ev(p, () => !!Game.inDungeon)) fail('[pc] không rời được bí cảnh');
  /* tử vong & hồi sinh */
  await ev(p, () => { Game.player.invT = 0; Game.player.hp = 1; Game.hurtPlayer(999, 1); });
  await wait(p, 400);
  if ((await ev(p, () => Game.mode)) !== 'dead') fail('[pc] không chuyển sang màn tử vong');
  await shot(p, '11-dead');
  await p.click('[data-ui="respawn"]');
  await wait(p, 300);
  if ((await ev(p, () => Game.mode)) !== 'play') fail('[pc] hồi sinh thất bại');
  /* lưu & tải lại */
  const before = await ev(p, () => ({ realm: Game.player.realm, st: Game.structures.length, day: Game.day, moc: !!Game.cleared.moc }));
  await ev(p, () => Game.save());
  await p.reload();
  await wait(p, 600);
  await p.click('[data-ui="continue"]');
  await wait(p, 400);
  const after = await ev(p, () => ({ realm: Game.player.realm, st: Game.structures.length, day: Game.day, moc: !!Game.cleared.moc }));
  if (JSON.stringify(before) !== JSON.stringify(after)) fail('[pc] tải lại sai: ' + JSON.stringify(before) + ' → ' + JSON.stringify(after));
  /* lôi kiếp (Kết Đan) */
  await ev(p, () => { Game.player.realm = 12; Game.player.tuvi = DATA.realms[12].req; Game.inv.add('ket_kim_dan', 1); Game.inv.slots[0] = { id: 'ket_kim_dan', n: 1 }; Game.inv.sel = 0; Game.mobs = []; Game.time = 0.2; });
  await p.keyboard.press('KeyF');
  await wait(p, 2200);
  if (!(await ev(p, () => !!Game.trib))) fail('[pc] lôi kiếp không bắt đầu');
  await shot(p, '12-trib');
  await ev(p, () => { Game.player.invT = 99; });
  await wait(p, 7500);
  if ((await ev(p, () => Game.player.realm)) !== 13) fail('[pc] vượt lôi kiếp không lên Kết Đan');
  /* chiến thắng */
  await ev(p, () => { for (const f of ['manh_moc', 'manh_hoa', 'manh_thuy', 'manh_loi']) if (!Game.inv.has(f)) Game.inv.add(f, 1); const A = Game.world.array; Game.player.x = A.x - 6; Game.player.y = Game.topY(A.x) - 30; });
  await wait(p, 300);
  await p.keyboard.press('KeyE');
  await wait(p, 600);
  if ((await ev(p, () => Game.mode)) !== 'victory') fail('[pc] không đạt chiến thắng');
  await shot(p, '13-victory');
  await p.click('[data-ui="keepplaying"]');
  await p.keyboard.press('Escape');
  await wait(p, 200);
  await shot(p, '14-pause');
  await p.close();
}

/* ---------------- Điện thoại xoay ngang (cảm ứng) ---------------- */
{
  const tag = 'mobile';
  const p = await page({ width: 844, height: 390 }, tag, true);
  await ev(p, () => localStorage.clear());
  await p.reload();
  await wait(p, 500);
  await shot(p, '20-m-title');
  await p.tap('[data-ui="newgame"]');
  await wait(p, 200);
  await p.tap('[data-ui="resume"]');
  await wait(p, 400);
  const vis = await ev(p, () => getComputedStyle(document.getElementById('touch')).display !== 'none');
  if (!vis) fail('[mobile] không hiện nút cảm ứng');
  const y0 = await ev(p, () => Game.player.y);
  await p.tap('[data-touch="jump"]');
  await wait(p, 120);
  const y1 = await ev(p, () => Game.player.y);
  if (!(y1 < y0 - 2)) fail('[mobile] nút Nhảy không hoạt động');
  await ev(p, () => { Game.inv.add('go', 12); Game.inv.add('da', 6); });
  await p.tap('[data-ui="inv"]');
  await wait(p, 200);
  await shot(p, '21-m-inventory');
  await p.tap('[data-ui="closepanel"]');
  await ev(p, () => { Game.time = 0.7; });
  await wait(p, 1200);
  await shot(p, '22-m-night');
  await ev(p, () => { const pt = Game.world.portals.find((x) => x.id === 'moc'); Game.player.realm = 3; Game.player.x = pt.x - 6; Game.player.y = pt.y - 30; Game.mobs = []; Game.time = 0.2; });
  await wait(p, 200);
  await p.tap('[data-touch="interact"]');
  await wait(p, 800);
  if (!(await ev(p, () => Game.inDungeon === 'moc'))) fail('[mobile] nút tương tác không vào bí cảnh');
  await shot(p, '23-m-dungeon');
  await p.close();
}

/* ---------------- Điện thoại dọc ---------------- */
{
  const p = await page({ width: 390, height: 844 }, 'portrait', true);
  const rot = await ev(p, () => getComputedStyle(document.getElementById('rotate')).display);
  if (rot === 'none') fail('[portrait] không hiện nhắc xoay ngang');
  await shot(p, '30-portrait');
  await p.close();
}

await browser.close();
if (errors.length) { console.log('LỖI:\n' + errors.join('\n')); process.exit(1); }
console.log('Kiểm thử khói: OK');

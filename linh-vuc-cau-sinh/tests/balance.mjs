// Kiểm tra cân bằng thủ lĩnh: một "người chơi máy" đứng đánh (không né), dùng đan khi máu thấp.
// Mỗi thủ lĩnh được thử với cảnh giới & trang bị dự kiến khi tới bí cảnh đó.
// Cách dùng: node tests/balance.mjs [số_trận=6]
import { load } from './harness.mjs';

const N = +(process.argv[2] || 6);
const prelude = `
const Input = { st: {}, pr: {}, down(a) { return !!this.st[a]; }, pressed(a) { return !!this.pr[a]; }, released() { return false; }, endStep() { this.pr = {}; }, clear() { this.st = {}; } };
const UI = {};
const Sfx = { play() {}, music() {} };
`;
const X = load(['js/util.js', 'js/data.js', 'js/world.js', 'js/inventory.js', 'js/game.js'], '; globalThis.__g = { Game, Input, DATA, Mob, M };', prelude);
const { Game, Input, DATA } = X.__g ? X.__g : globalThis.__g;

const plans = [
  { id: 'moc', realm: 4, weapon: 'kiem_sat', armor: 'ao_da', pills: 4 },
  { id: 'hoa', realm: 6, weapon: 'thanh_moc_kiem', armor: 'dao_bao', pills: 5 },
  { id: 'thuy', realm: 10, weapon: 'viem_long_kiem', armor: 'thiet_giap', pills: 6 },
  { id: 'loi', realm: 13, weapon: 'bang_phach_kiem', armor: 'han_giap', pills: 8 },
];
console.log('Thủ lĩnh            cảnh giới            vũ khí            thắng  thời gian TB  đan đã dùng TB  máu còn TB');
let bad = 0;
for (const pl of plans) {
  let wins = 0, time = 0, used = 0, hpLeft = 0, deaths = 0, timeouts = 0, bossLeft = 0;
  for (let k = 0; k < N; k++) {
    Game.newGame(1000 + k);
    const p = Game.player;
    p.realm = pl.realm;
    Game.inv = new (Game.inv.constructor)();
    Game.inv.slots[0] = { id: pl.weapon, n: 1 };
    Game.inv.slots[1] = { id: 'hoi_khi_dan', n: pl.pills };
    Game.inv.armor = pl.armor;
    Game.inv.sel = 0;
    Game.enterDungeon(pl.id);
    const A = Game.dungeon.arena;
    Game.mobs = [];
    p.x = A.x0 + 100; p.y = A.y - 30;
    p.hp = Game.maxHp(); p.mp = Game.maxMp();
    let t = 0, pills0 = pl.pills;
    const dt = 1 / 60;
    while (t < 240) {
      Input.st = {}; Input.pr = {};
      const b = Game.boss;
      if (b && b.alive) {
        const dx = b.cx - p.cx;
        const reach = b.fly ? 30 : b.w / 2 + 18;
        if (Math.abs(dx) > reach) Input.st[dx > 0 ? 'right' : 'left'] = true;
        else { p.face = Math.sign(dx) || 1; }
        /* thủ lĩnh bay: nhảy hai lần để chém lên */
        if (b.fly && b.cy < p.cy - 50 && Math.abs(dx) < 90) {
          Input.st.jump = true;
          if (p.onGround) Input.pr.jump = true;
          else if (p.vy > -40 && p.airJumps > 0) Input.pr.jump = true;
        }
        if (Math.abs(dx) < reach + 30 && Math.abs(b.cy - p.cy) < b.h / 2 + 40) Input.pr.attack = true;
        if (p.mp > 30) Input.pr.skill = true;
        if (p.hp < Game.maxHp() * 0.4 && Game.inv.has('hoi_khi_dan')) { Game.inv.sel = 1; Input.pr.use = true; }
        else Game.inv.sel = 0;
      }
      Game.update(dt);
      Input.endStep();
      t += dt;
      if (Game.mode === 'dead') { deaths++; bossLeft += Game.boss ? Game.boss.hp / Game.boss.maxHp : 1; break; }
      if (Game.cleared[pl.id]) { wins++; time += t; used += pills0 - Game.inv.count('hoi_khi_dan'); hpLeft += p.hp / Game.maxHp(); break; }
    }
    if (t >= 240) { timeouts++; bossLeft += Game.boss ? Game.boss.hp / Game.boss.maxHp : 1; }
  }
  const D = DATA.dungeons[pl.id];
  const line = DATA.bosses[D.boss].name.padEnd(20) + DATA.realms[pl.realm].name.padEnd(21) + DATA.items[pl.weapon].name.padEnd(18) + (wins + '/' + N).padStart(5) + (wins ? (time / wins).toFixed(0) + ' s' : '-').padStart(13) + (wins ? (used / wins).toFixed(1) : '-').padStart(16) + (wins ? Math.round(hpLeft / wins * 100) + '%' : '-').padStart(12) + (deaths + timeouts ? '   (thua ' + deaths + ', hết giờ ' + timeouts + ', thủ lĩnh còn TB ' + Math.round(bossLeft / (deaths + timeouts) * 100) + '%)' : '');
  console.log(line);
}

// Kiểm tra hiệu chỉnh chiến đấu: người chơi "điển hình" (trang bị đúng mức kỳ vọng) đấu yêu thú cùng cảnh giới.
// Cách dùng: node tests/duel.mjs
import { loadGame } from './harness.mjs';

const { X, clock, runTimers } = loadGame(7);
const { D, Player, Gear, Combat, Inv } = X;
X.newLife({ name: 'Thử', gender: 'nam', bg: 'tho_san', root: { type: 'tam', els: ['hoa', 'kim', 'moc'] }, attrs: { ngoTinh: 5, canCot: 5, khiVan: 5, thanThuc: 5 } }, null);
const G = () => X.G;
G().settings.battleSpeed = 4;
G().settings.autoHeal = false;

function setup(gs) {
  const g = G(), p = g.player;
  const { r, s } = D.gsToRS(gs);
  p.realm = r; p.stage = s;
  g.gear.length = 0; p.equip = {};
  const tier = Math.max(1, r), q = r <= 1 ? 0 : r <= 3 ? 1 : r <= 6 ? 2 : 3, enh = Math.min(10, 2 * r);
  const slots = gs < 2 ? ['weapon', 'armor'] : D.slotOrder;
  for (const sl of slots) { const it = Gear.create(sl, tier, q); it.enh = enh; it.affixes = []; Gear.equip(it.uid, true); }
  /* thần thông cùng giai, cấp 3 */
  p.skills = {}; p.eq = [];
  const sk = Object.keys(D.skills).filter((id) => !D.skills[id].sect && !D.skills[id].self && D.skills[id].tier === Math.max(1, Math.min(10, r))).slice(0, 3);
  for (const id of sk) { p.skills[id] = 3; p.eq.push(id); }
  G().pets = []; G().activePet = null; G().sect = null; G().ach = {};
  p.techs = { dan_khi_quyet: 1 }; p.tech = 'dan_khi_quyet';
}

console.log('gs  cảnh giới                 thắng  lượt  %HP mất   | người chơi atk/def/hp  vs  kỳ vọng');
for (const gs of [1, 3, 6, 9, 10, 13, 14, 18, 22, 26, 30, 34, 38, 42, 45]) {
  setup(gs);
  const st = Player.stats(), E = D.expected(gs);
  const m = D.mapForGs(gs);
  let win = 0, turns = 0, loss = 0, n = 60, bossWin = 0;
  for (let i = 0; i < n + 10; i++) {
    const boss = i >= n;
    G().player.hp = st.hp; G().player.mp = st.mp;
    const en = Combat.makeEnemy(boss ? m.boss : m.mons[i % m.mons.length], gs, { tier: m.tier, boss });
    Combat.abort();
    Combat.start(en, { kind: 'explore' });
    const b = Combat.b;
    let guard = 0;
    while (!b.over && guard++ < 2000) runTimers(clock.now + 200);
    if (boss) { if (b.result === 'win') bossWin++; continue; }
    if (b.result === 'win') win++;
    turns += b.turn; loss += (st.hp - Math.max(0, b.player.hp)) / st.hp;
  }
  console.log(String(gs).padStart(2), D.gsName(gs).padEnd(24), (win / n * 100).toFixed(0).padStart(4) + '%', (turns / n).toFixed(1).padStart(5), (loss / n * 100).toFixed(0).padStart(6) + '%', '  boss ' + bossWin + '/10',
    '|', [st.atk, st.def, st.hp].map((v) => X.U.fmt(v)).join('/'), ' vs ', [E.atk, E.def, E.hp].map((v) => X.U.fmt(v)).join('/'));
}

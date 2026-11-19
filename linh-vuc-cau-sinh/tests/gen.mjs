// Kiểm thử sinh bản đồ: mọi bí cảnh phải đi được từ lối vào tới đấu trường thủ lĩnh;
// thế giới bên ngoài phải đi bộ/nhảy được từ điểm khởi đầu tới cả 4 cổng bí cảnh.
// Cách dùng: node tests/gen.mjs [số_hạt_giống=300]
import { load } from './harness.mjs';

const N = +(process.argv[2] || 300);
const X = load();
let fail = 0;
for (const id of X.DATA.dungeonOrder) {
  let invalid = 0, attempts = 0, spawns = 0, chests = 0, cols = 0;
  for (let s = 1; s <= N; s++) {
    const d = new X.Dungeon(id, s * 2654435761);
    if (!d.valid) invalid++;
    attempts += d.attempts; spawns += d.spawns.length; chests += d.chests.length; cols = d.cols;
    for (const sp of d.spawns) {
      if (d.solid(sp.c, sp.r)) { console.log('Quái kẹt trong tường', id, s, sp); fail++; break; }
    }
  }
  console.log(`${id.padEnd(5)} ${N} bản đồ · không hợp lệ: ${invalid} · lần thử TB: ${(attempts / N).toFixed(2)} · quái TB: ${(spawns / N).toFixed(1)} · rương TB: ${(chests / N).toFixed(1)} · rộng ${cols} ô`);
  if (invalid) fail++;
}
/* Thế giới bên ngoài: đi bộ (bậc ≤ 1 ô tự bước, ≤ 4 ô nhảy) từ khởi đầu tới các cổng */
let wfail = 0;
for (let s = 1; s <= 60; s++) {
  const w = new X.Overworld(s * 7919);
  const H = w.heights;
  let maxStep = 0;
  for (let c = 1; c < w.cols; c++) maxStep = Math.max(maxStep, Math.abs(H[c] - H[c - 1]));
  if (maxStep > 4) { wfail++; console.log('Bậc địa hình quá cao', s, maxStep); }
  if (w.resources.length < 150) { wfail++; console.log('Quá ít tài nguyên', s, w.resources.length); }
}
console.log('Thế giới: 60 hạt giống, lỗi: ' + wfail + ' · tài nguyên mẫu: ' + new X.Overworld(1).resources.length);
if (fail || wfail) { console.log('THẤT BẠI'); process.exit(1); }
console.log('Sinh bản đồ: OK');

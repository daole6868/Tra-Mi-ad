'use strict';
/* Dữ liệu game: cảnh giới, vật phẩm, công thức, công trình, tài nguyên, sinh thái, yêu thú, bí cảnh */

const DATA = {};
DATA.NAME = 'Linh Vực Cầu Sinh';
DATA.VERSION = '1.0.0';

/* ---------- Cảnh giới ---------- */
DATA.realms = [];
(function () {
  const R = DATA.realms;
  R.push({ name: 'Phàm Nhân', req: 40, hp: 100, mp: 40, dmg: 1 });
  const lk = [60, 90, 130, 180, 250, 330, 430, 550, 700];
  for (let n = 1; n <= 9; n++) R.push({ name: 'Luyện Khí Tầng ' + n, req: lk[n - 1], hp: 100 + 12 * n, mp: 40 + 6 * n, dmg: 1 + 0.06 * n });
  R[9].pill = 'truc_co_dan';
  const k3 = ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ'];
  [[900, 260, 110, 1.8], [1200, 280, 120, 1.9], [1600, 300, 130, 2.0]].forEach((v, i) => R.push({ name: 'Trúc Cơ ' + k3[i], req: v[0], hp: v[1], mp: v[2], dmg: v[3] }));
  R[12].pill = 'ket_kim_dan'; R[12].trib = 4;
  [[2000, 380, 160, 2.4], [2600, 410, 170, 2.55], [3400, 440, 180, 2.7]].forEach((v, i) => R.push({ name: 'Kết Đan ' + k3[i], req: v[0], hp: v[1], mp: v[2], dmg: v[3] }));
  R[15].pill = 'hoa_anh_dan'; R[15].trib = 7;
  R.push({ name: 'Nguyên Anh', req: Infinity, hp: 560, mp: 240, dmg: 3.4 });
})();
DATA.realmColor = (r) => (r === 0 ? '#9a9486' : r <= 9 ? '#6fc2a0' : r <= 12 ? '#6fb0e6' : r <= 15 ? '#e6bf5a' : '#c49cf2');
/* Năng lực mở khóa theo cảnh giới */
DATA.unlocks = [
  { realm: 2, key: 'fireball', name: 'Hỏa Cầu Thuật', desc: 'Phím K: phóng cầu lửa (tốn linh lực).' },
  { realm: 3, key: 'doubleJump', name: 'Nhị Đoạn Khiêu', desc: 'Nhảy thêm một lần trên không.' },
  { realm: 6, key: 'dash', name: 'Ngự Phong Bộ', desc: 'Phím L/Shift: lướt nhanh, miễn thương trong chớp mắt.' },
  { realm: 10, key: 'swordWave', name: 'Kiếm Khí', desc: 'Đòn thứ ba của chuỗi chém phóng ra kiếm khí.' },
  { realm: 13, key: 'fireFan', name: 'Tam Muội Chân Hỏa', desc: 'Hỏa Cầu bắn ra ba quả cùng lúc.' },
  { realm: 16, key: 'flight', name: 'Ngự Kiếm Phi Hành', desc: 'Giữ phím nhảy trên không để bay (tốn linh lực).' },
];

/* ---------- Vật phẩm ---------- */
/* cat: mat (nguyên liệu), food, pill, tool, weapon, armor, place, light, key */
DATA.items = {};
function item(id, name, icon, cat, o) { DATA.items[id] = Object.assign({ id, name, icon, cat, stack: 99, tier: 0, desc: '' }, o || {}); }
item('go', 'Gỗ', '🪵', 'mat', { desc: 'Chặt cây mà có. Vật liệu xây dựng cơ bản.' });
item('truc', 'Trúc', '🎋', 'mat', { desc: 'Thân trúc dẻo dai, mọc nhiều ở Trúc Lâm.' });
item('da', 'Đá', '🪨', 'mat', { desc: 'Đập đá bằng cuốc để lấy.' });
item('quang_sat', 'Quặng sắt', '🟫', 'mat', { desc: 'Cần cuốc đá trở lên. Luyện trong lò thành thỏi sắt.' });
item('thoi_sat', 'Thỏi sắt', '🔩', 'mat', { tier: 1, desc: 'Luyện từ quặng sắt trong Lò luyện.' });
item('linh_thach', 'Linh thạch', '💎', 'mat', { tier: 2, desc: 'Đá chứa linh khí. Cần cuốc sắt. Có ở Xích Thạch Sơn và Lôi Phong.' });
item('loi_van_thach', 'Lôi văn thạch', '🔹', 'mat', { tier: 3, desc: 'Khoáng thạch nhiễm lôi điện ở Lôi Phong. Cần cuốc sắt.' });
item('da_thu', 'Da thú', '🐾', 'mat', { desc: 'Lột từ thú rừng.' });
item('xuong', 'Xương', '🦴', 'mat', { desc: 'Rơi ra từ yêu thú, cương thi.' });
item('yeu_dan', 'Yêu đan', '🔮', 'mat', { tier: 1, desc: 'Nội đan của yêu ma. Nguyên liệu luyện đan.' });
item('linh_thao', 'Linh thảo', '🌿', 'mat', { desc: 'Thảo dược phổ biến, dùng luyện đan.' });
item('hoa_linh_chi', 'Hỏa linh chi', '🍄', 'mat', { tier: 1, desc: 'Linh chi mọc trên đá đỏ Xích Thạch Sơn.' });
item('tuyet_lien', 'Tuyết liên', '🌼', 'mat', { tier: 1, desc: 'Hoa sen tuyết của Hàn Đàm.' });
item('moc_tinh', 'Mộc tinh', '🟢', 'mat', { tier: 3, desc: 'Tinh hoa Mộc hệ, rơi từ Thụ Yêu Vương.' });
item('hoa_tinh', 'Hỏa tinh', '🔴', 'mat', { tier: 3, desc: 'Tinh hoa Hỏa hệ, rơi từ Xích Viêm Long.' });
item('thuy_tinh', 'Băng tinh', '🔵', 'mat', { tier: 3, desc: 'Tinh hoa Băng hệ, rơi từ Băng Phượng.' });
item('loi_tinh', 'Lôi tinh', '🟣', 'mat', { tier: 3, desc: 'Tinh hoa Lôi hệ, rơi từ Lôi Thần Khôi Lỗi.' });
item('manh_moc', 'Thiên Bia · Mộc', '🧩', 'key', { stack: 1, tier: 4, desc: 'Mảnh Thiên Bia hệ Mộc. Mang về Truyền Tống Trận.' });
item('manh_hoa', 'Thiên Bia · Hỏa', '🧩', 'key', { stack: 1, tier: 4, desc: 'Mảnh Thiên Bia hệ Hỏa. Mang về Truyền Tống Trận.' });
item('manh_thuy', 'Thiên Bia · Thủy', '🧩', 'key', { stack: 1, tier: 4, desc: 'Mảnh Thiên Bia hệ Thủy. Mang về Truyền Tống Trận.' });
item('manh_loi', 'Thiên Bia · Lôi', '🧩', 'key', { stack: 1, tier: 4, desc: 'Mảnh Thiên Bia hệ Lôi. Mang về Truyền Tống Trận.' });
/* Thức ăn */
item('qua_dai', 'Quả dại', '🍒', 'food', { hunger: 12, desc: 'Hái từ bụi quả. No bụng +12.' });
item('thit_song', 'Thịt sống', '🥩', 'food', { hunger: 10, hp: -4, desc: 'Ăn sống dễ đau bụng. Nướng ở lửa trại ngon hơn.' });
item('thit_nuong', 'Thịt nướng', '🍖', 'food', { hunger: 35, hp: 6, desc: 'No bụng +35, sinh lực +6.' });
item('canh_thao', 'Thảo dược thang', '🍲', 'food', { hunger: 45, hp: 25, desc: 'No bụng +45, sinh lực +25.' });
/* Đan dược */
item('hoi_khi_dan', 'Hồi Khí Đan', '💊', 'pill', { hp: 60, desc: 'Hồi 60 sinh lực.' });
item('hoi_linh_dan', 'Hồi Linh Đan', '🧪', 'pill', { mp: 50, desc: 'Hồi 50 linh lực.' });
item('tich_coc_dan', 'Tích Cốc Đan', '🟡', 'pill', { hunger: 70, desc: 'No bụng +70.' });
item('tu_khi_dan', 'Tụ Khí Đan', '✨', 'pill', { tuvi: 120, desc: 'Tu vi +120.' });
item('truc_co_dan', 'Trúc Cơ Đan', '🌕', 'pill', { tier: 3, breakthrough: 9, desc: 'Dùng khi Luyện Khí Tầng 9 tu vi viên mãn để đột phá Trúc Cơ.' });
item('ket_kim_dan', 'Kết Kim Đan', '🌟', 'pill', { tier: 3, breakthrough: 12, desc: 'Dùng khi Trúc Cơ Hậu Kỳ viên mãn để đột phá Kết Đan (phải vượt 4 đạo lôi kiếp).' });
item('hoa_anh_dan', 'Hóa Anh Đan', '☀️', 'pill', { tier: 4, breakthrough: 15, desc: 'Dùng khi Kết Đan Hậu Kỳ viên mãn để đột phá Nguyên Anh (phải vượt 7 đạo lôi kiếp).' });
/* Công cụ */
item('riu_da', 'Rìu đá', '🪓', 'tool', { stack: 1, axe: 2, dmg: 5, desc: 'Chặt cây nhanh hơn.' });
item('cuoc_da', 'Cuốc đá', '⛏️', 'tool', { stack: 1, pick: 2, pickTier: 1, dmg: 5, desc: 'Đập đá, khai thác quặng sắt.' });
item('riu_sat', 'Rìu sắt', '🪓', 'tool', { stack: 1, tier: 1, axe: 4, dmg: 9, desc: 'Chặt cây rất nhanh.' });
item('cuoc_sat', 'Cuốc sắt', '⛏️', 'tool', { stack: 1, tier: 1, pick: 4, pickTier: 2, dmg: 9, desc: 'Khai thác được linh thạch và lôi văn thạch.' });
/* Vũ khí */
item('kiem_go', 'Kiếm gỗ', '🗡️', 'weapon', { stack: 1, dmg: 8, desc: 'Sát thương 8.' });
item('kiem_sat', 'Thiết kiếm', '🗡️', 'weapon', { stack: 1, tier: 1, dmg: 15, desc: 'Sát thương 15.' });
item('thanh_moc_kiem', 'Thanh Mộc Kiếm', '🗡️', 'weapon', { stack: 1, tier: 2, dmg: 24, el: 'moc', desc: 'Sát thương 24. Đòn chém hồi 1 sinh lực.' });
item('viem_long_kiem', 'Viêm Long Kiếm', '🗡️', 'weapon', { stack: 1, tier: 3, dmg: 36, el: 'hoa', desc: 'Sát thương 36. Gây bỏng.' });
item('bang_phach_kiem', 'Băng Phách Kiếm', '🗡️', 'weapon', { stack: 1, tier: 3, dmg: 52, el: 'thuy', desc: 'Sát thương 52. Làm chậm kẻ địch.' });
item('loi_dinh_kiem', 'Lôi Đình Kiếm', '🗡️', 'weapon', { stack: 1, tier: 4, dmg: 75, el: 'loi', desc: 'Sát thương 75. Thỉnh thoảng giáng sét.' });
/* Giáp */
item('ao_da', 'Áo da', '🥋', 'armor', { stack: 1, def: 15, desc: 'Phòng ngự 15.' });
item('dao_bao', 'Đạo bào', '👘', 'armor', { stack: 1, tier: 1, def: 30, mp: 20, desc: 'Phòng ngự 30, linh lực +20.' });
item('thiet_giap', 'Thiết giáp', '🛡️', 'armor', { stack: 1, tier: 2, def: 45, desc: 'Phòng ngự 45.' });
item('han_giap', 'Hàn Băng Giáp', '🧥', 'armor', { stack: 1, tier: 3, def: 70, mp: 30, desc: 'Phòng ngự 70, linh lực +30.' });
/* Chiếu sáng */
item('duoc', 'Đuốc', '🔥', 'light', { light: 150, desc: 'Cầm trên tay để soi sáng xung quanh.' });
/* Công trình đặt được */
item('lua_trai', 'Lửa trại', '🏕️', 'place', { place: 'lua_trai', desc: 'Sưởi ấm, nấu ăn, xua yêu ma. Nhớ thêm gỗ làm củi.' });
item('ban_che_tac', 'Bàn chế tác', '🧰', 'place', { place: 'ban_che_tac', desc: 'Mở khóa chế tạo công cụ, vũ khí, công trình.' });
item('lo_luyen', 'Lò luyện', '♨️', 'place', { place: 'lo_luyen', desc: 'Luyện quặng, rèn binh khí linh tinh.' });
item('dan_lo', 'Đan lô', '⚗️', 'place', { place: 'dan_lo', desc: 'Luyện đan dược.' });
item('thao_tich', 'Chiếu cỏ', '🛏️', 'place', { place: 'thao_tich', desc: 'Ngủ qua đêm và đặt điểm hồi sinh.' });
item('bo_doan', 'Bồ đoàn', '🧘', 'place', { place: 'bo_doan', desc: 'Ngồi thiền tu luyện nhanh gấp đôi.' });
item('den_long', 'Đèn lồng', '🏮', 'place', { place: 'den_long', desc: 'Chiếu sáng lâu dài, không cần củi.' });
item('tu_linh_tran', 'Tụ Linh Trận', '☯️', 'place', { place: 'tu_linh_tran', tier: 2, desc: 'Tu luyện trong trận nhanh gấp ba.' });
item('tuong_go', 'Tường gỗ', '🚧', 'place', { wall: 10, desc: 'Một cột tường gỗ cao 4 ô, chặn yêu thú đi bộ.' });
item('tuong_da', 'Tường đá', '🧱', 'place', { wall: 11, tier: 1, desc: 'Một cột tường đá cao 4 ô, bền gấp đôi tường gỗ.' });

/* ---------- Công trình ---------- */
DATA.structures = {
  lua_trai: { name: 'Lửa trại', w: 28, h: 22, light: 170, station: 'lua_trai', fuel: true, hp: 60 },
  ban_che_tac: { name: 'Bàn chế tác', w: 34, h: 22, station: 'ban_che_tac', hp: 80 },
  lo_luyen: { name: 'Lò luyện', w: 30, h: 34, light: 70, station: 'lo_luyen', hp: 120 },
  dan_lo: { name: 'Đan lô', w: 26, h: 28, light: 50, station: 'dan_lo', hp: 100 },
  thao_tich: { name: 'Chiếu cỏ', w: 34, h: 8, bed: true, hp: 40 },
  bo_doan: { name: 'Bồ đoàn', w: 20, h: 8, meditate: 2, hp: 40 },
  den_long: { name: 'Đèn lồng', w: 12, h: 40, light: 130, hp: 40 },
  tu_linh_tran: { name: 'Tụ Linh Trận', w: 60, h: 6, meditate: 3, light: 60, hp: 200 },
};
DATA.walls = { 10: { name: 'Tường gỗ', hp: 60 }, 11: { name: 'Tường đá', hp: 150 } };
DATA.WALL_H = 4;

/* ---------- Công thức chế tạo ---------- */
/* station: null = tay không; còn lại cần đứng gần công trình tương ứng */
DATA.recipes = [
  { out: 'ban_che_tac', station: null, need: { go: 10 } },
  { out: 'lua_trai', station: null, need: { go: 6, da: 3 } },
  { out: 'duoc', n: 2, station: null, need: { go: 2 } },
  { out: 'tuong_go', n: 2, station: null, need: { go: 4 } },
  { out: 'kiem_go', station: 'ban_che_tac', need: { go: 6 } },
  { out: 'riu_da', station: 'ban_che_tac', need: { go: 3, da: 4 } },
  { out: 'cuoc_da', station: 'ban_che_tac', need: { go: 3, da: 4 } },
  { out: 'thao_tich', station: 'ban_che_tac', need: { truc: 6, da_thu: 2 } },
  { out: 'bo_doan', station: 'ban_che_tac', need: { truc: 8 } },
  { out: 'ao_da', station: 'ban_che_tac', need: { da_thu: 6, xuong: 2 } },
  { out: 'lo_luyen', station: 'ban_che_tac', need: { da: 15, go: 5 } },
  { out: 'tuong_da', n: 2, station: 'ban_che_tac', need: { da: 6 } },
  { out: 'dan_lo', station: 'ban_che_tac', need: { da: 8, thoi_sat: 3, linh_thao: 2 } },
  { out: 'den_long', station: 'ban_che_tac', need: { go: 2, truc: 2, thoi_sat: 1 } },
  { out: 'riu_sat', station: 'ban_che_tac', need: { go: 3, thoi_sat: 4 } },
  { out: 'cuoc_sat', station: 'ban_che_tac', need: { go: 3, thoi_sat: 5 } },
  { out: 'kiem_sat', station: 'ban_che_tac', need: { thoi_sat: 6, go: 2 } },
  { out: 'dao_bao', station: 'ban_che_tac', need: { truc: 6, da_thu: 4, linh_thach: 3 } },
  { out: 'thiet_giap', station: 'ban_che_tac', need: { thoi_sat: 12, da_thu: 4 } },
  { out: 'tu_linh_tran', station: 'ban_che_tac', need: { linh_thach: 20, da: 20, yeu_dan: 5 } },
  { out: 'thoi_sat', station: 'lo_luyen', need: { quang_sat: 2, go: 1 } },
  { out: 'thanh_moc_kiem', station: 'lo_luyen', need: { moc_tinh: 1, thoi_sat: 6, truc: 10 } },
  { out: 'viem_long_kiem', station: 'lo_luyen', need: { hoa_tinh: 1, thoi_sat: 10, linh_thach: 8 } },
  { out: 'bang_phach_kiem', station: 'lo_luyen', need: { thuy_tinh: 1, thoi_sat: 12, linh_thach: 15, tuyet_lien: 3 } },
  { out: 'han_giap', station: 'lo_luyen', need: { thuy_tinh: 1, thoi_sat: 15, linh_thach: 10 } },
  { out: 'loi_dinh_kiem', station: 'lo_luyen', need: { loi_tinh: 1, loi_van_thach: 10, linh_thach: 25 } },
  { out: 'thit_nuong', station: 'lua_trai', need: { thit_song: 1 } },
  { out: 'canh_thao', station: 'lua_trai', need: { thit_song: 1, linh_thao: 1 } },
  { out: 'hoi_khi_dan', n: 2, station: 'dan_lo', need: { linh_thao: 2 } },
  { out: 'hoi_linh_dan', n: 2, station: 'dan_lo', need: { linh_thao: 1, qua_dai: 2 } },
  { out: 'tich_coc_dan', station: 'dan_lo', need: { qua_dai: 3, linh_thao: 1 } },
  { out: 'tu_khi_dan', station: 'dan_lo', need: { linh_thao: 2, yeu_dan: 1 } },
  { out: 'truc_co_dan', station: 'dan_lo', need: { moc_tinh: 1, hoa_tinh: 1, linh_thao: 5, yeu_dan: 3 } },
  { out: 'ket_kim_dan', station: 'dan_lo', need: { thuy_tinh: 1, hoa_linh_chi: 3, tuyet_lien: 3, yeu_dan: 6, linh_thach: 10 } },
  { out: 'hoa_anh_dan', station: 'dan_lo', need: { loi_tinh: 1, yeu_dan: 10, linh_thach: 20, tuyet_lien: 3, hoa_linh_chi: 3 } },
];
DATA.stationNames = { lua_trai: 'Lửa trại', ban_che_tac: 'Bàn chế tác', lo_luyen: 'Lò luyện', dan_lo: 'Đan lô' };

/* ---------- Tài nguyên thế giới ---------- */
/* tool: axe | pick | any; tier: cấp cuốc tối thiểu; drops: [id, min, max, xác suất] */
DATA.resources = {
  tung: { name: 'Cây tùng', tool: 'axe', hp: 6, regrow: 2, w: 30, h: 96, drops: [['go', 3, 5, 1], ['linh_thao', 1, 1, 0.12]] },
  truc: { name: 'Bụi trúc', tool: 'axe', hp: 4, regrow: 2, w: 26, h: 110, drops: [['truc', 2, 4, 1]] },
  phong: { name: 'Cây phong đỏ', tool: 'axe', hp: 7, regrow: 2, w: 34, h: 88, drops: [['go', 3, 6, 1]] },
  tuyet_tung: { name: 'Tùng tuyết', tool: 'axe', hp: 7, regrow: 3, w: 30, h: 90, drops: [['go', 3, 5, 1]] },
  da: { name: 'Tảng đá', tool: 'pick', tier: 0, hp: 6, regrow: 3, w: 30, h: 22, drops: [['da', 2, 4, 1]] },
  quang_sat: { name: 'Mạch quặng sắt', tool: 'pick', tier: 1, hp: 8, regrow: 4, w: 30, h: 24, drops: [['quang_sat', 1, 2, 1], ['da', 1, 1, 0.5]] },
  linh_thach: { name: 'Mạch linh thạch', tool: 'pick', tier: 2, hp: 12, regrow: 4, w: 30, h: 28, drops: [['linh_thach', 1, 2, 1]] },
  loi_van: { name: 'Lôi văn thạch', tool: 'pick', tier: 2, hp: 14, regrow: 4, w: 30, h: 28, drops: [['loi_van_thach', 1, 2, 1]] },
  bui_qua: { name: 'Bụi quả dại', tool: 'any', hp: 1, regrow: 1, w: 26, h: 20, drops: [['qua_dai', 1, 3, 1]] },
  linh_thao: { name: 'Linh thảo', tool: 'any', hp: 1, regrow: 2, w: 16, h: 16, drops: [['linh_thao', 1, 2, 1]] },
  hoa_linh_chi: { name: 'Hỏa linh chi', tool: 'any', hp: 1, regrow: 3, w: 16, h: 14, drops: [['hoa_linh_chi', 1, 1, 1]] },
  tuyet_lien: { name: 'Tuyết liên', tool: 'any', hp: 1, regrow: 3, w: 16, h: 16, drops: [['tuyet_lien', 1, 1, 1]] },
};

/* ---------- Sinh thái (vùng đất từ tây sang đông) ---------- */
DATA.biomes = [
  { id: 'han_dam', name: 'Hàn Đàm Tuyết Nguyên', from: 0, to: 180, base: 54, amp: 4, freq: 0.03, ground: '#cfd8de', top: '#f4f7f8', dark: '#56656e', tint: '#b9d0de', weather: 'snow',
    res: [['tuyet_tung', 5], ['da', 2], ['tuyet_lien', 2], ['quang_sat', 1], ['bui_qua', 1]], day: ['tho_linh'], night: ['tuyet_lang', 'u_hon', 'cuong_thi'] },
  { id: 'truc_lam', name: 'Trúc Lâm', from: 180, to: 420, base: 54, amp: 6, freq: 0.035, ground: '#3c5a45', top: '#7fb08a', dark: '#1d2e24', tint: '#a9d1b2', weather: 'leaves',
    res: [['truc', 6], ['tung', 3], ['bui_qua', 3], ['linh_thao', 3], ['da', 2]], day: ['tho_linh', 'heo_rung'], night: ['soi_xam', 'cuong_thi', 'u_hon'] },
  { id: 'tan_tich', name: 'Tàn Tích Thanh Vân', from: 420, to: 680, base: 55, amp: 2, freq: 0.03, ground: '#4a4a44', top: '#8f8c78', dark: '#24241f', tint: '#d6cfb4', weather: 'none',
    res: [['tung', 4], ['da', 4], ['bui_qua', 3], ['linh_thao', 2], ['quang_sat', 1]], day: ['tho_linh', 'heo_rung'], night: ['soi_xam', 'cuong_thi', 'u_hon'] },
  { id: 'xich_thach', name: 'Xích Thạch Sơn', from: 680, to: 900, base: 52, amp: 10, freq: 0.045, ground: '#6a3a2c', top: '#b0664a', dark: '#2e1913', tint: '#e0a98a', weather: 'embers',
    res: [['phong', 3], ['da', 4], ['quang_sat', 4], ['linh_thach', 2], ['hoa_linh_chi', 2]], day: ['heo_rung', 'soi_xam'], night: ['huyet_doi', 'cuong_thi', 'soi_xam'] },
  { id: 'loi_phong', name: 'Lôi Phong', from: 900, to: 1100, base: 48, amp: 16, freq: 0.05, ground: '#3b3a52', top: '#8a86b8', dark: '#17162a', tint: '#b8b2e6', weather: 'storm',
    res: [['tung', 2], ['da', 3], ['loi_van', 3], ['linh_thach', 3], ['linh_thao', 1]], day: ['loi_ung'], night: ['loi_ung', 'huyet_doi', 'u_hon'] },
];
DATA.WORLD_COLS = 1100;
DATA.WORLD_ROWS = 90;
DATA.SPAWN_COL = 550;

/* ---------- Yêu thú ---------- */
/* ai: passive | walker | charger | hopper | flyer | diver | ghost | shooter | turret */
DATA.monsters = {
  tho_linh: { name: 'Linh Thỏ', ai: 'passive', hp: 12, dmg: 0, speed: 120, w: 16, h: 12, look: 'rabbit', color: '#d8d2c2', tuvi: 2, drops: [['thit_song', 1, 1, 1], ['da_thu', 1, 1, 0.35]] },
  heo_rung: { name: 'Lợn Rừng', ai: 'charger', neutral: true, hp: 45, dmg: 12, speed: 70, w: 30, h: 20, look: 'boar', color: '#5b4636', tuvi: 6, drops: [['thit_song', 1, 2, 1], ['da_thu', 1, 2, 1]] },
  soi_xam: { name: 'Sói Xám', ai: 'walker', hp: 35, dmg: 9, speed: 120, w: 28, h: 18, look: 'wolf', color: '#5f646b', tuvi: 6, drops: [['da_thu', 1, 1, 0.8], ['xuong', 1, 1, 0.5], ['yeu_dan', 1, 1, 0.08]] },
  cuong_thi: { name: 'Cương Thi', ai: 'hopper', hp: 55, dmg: 12, speed: 90, w: 14, h: 30, look: 'zombie', color: '#4c5a4a', tuvi: 8, night: true, sunburn: true, drops: [['xuong', 1, 2, 0.8], ['yeu_dan', 1, 1, 0.2]] },
  u_hon: { name: 'U Hồn', ai: 'ghost', hp: 30, dmg: 8, speed: 60, w: 18, h: 22, look: 'ghost', color: '#a9c8d8', tuvi: 7, night: true, sunburn: true, drops: [['yeu_dan', 1, 1, 0.18]] },
  huyet_doi: { name: 'Huyết Bức', ai: 'flyer', hp: 22, dmg: 7, speed: 110, w: 18, h: 12, look: 'bat', color: '#5a2228', tuvi: 5, night: true, sunburn: true, drops: [['xuong', 1, 1, 0.3], ['yeu_dan', 1, 1, 0.08]] },
  tuyet_lang: { name: 'Tuyết Lang', ai: 'walker', hp: 60, dmg: 14, speed: 130, w: 30, h: 20, look: 'wolf', color: '#cfd6dc', tuvi: 10, drops: [['da_thu', 1, 2, 1], ['xuong', 1, 1, 0.6], ['yeu_dan', 1, 1, 0.15]] },
  loi_ung: { name: 'Lôi Ưng', ai: 'diver', hp: 50, dmg: 16, speed: 140, w: 26, h: 16, look: 'bird', color: '#6d64b0', tuvi: 12, drops: [['xuong', 1, 1, 0.5], ['yeu_dan', 1, 1, 0.2]] },
  /* Bí cảnh Mộc */
  thu_yeu: { name: 'Thụ Yêu', ai: 'walker', hp: 75, dmg: 10, speed: 70, w: 22, h: 30, look: 'treant', color: '#3f6b45', tuvi: 10, drops: [['go', 1, 3, 0.8], ['linh_thao', 1, 1, 0.4], ['yeu_dan', 1, 1, 0.15]] },
  doc_phong: { name: 'Độc Phong', ai: 'flyer', hp: 38, dmg: 8, speed: 100, w: 16, h: 12, look: 'wasp', color: '#a8b83a', tuvi: 8, drops: [['linh_thao', 1, 1, 0.3]] },
  dang_xa: { name: 'Đằng Xà', ai: 'shooter', hp: 60, dmg: 9, speed: 60, w: 26, h: 14, look: 'snake', color: '#527a3a', tuvi: 10, shot: 'seed', drops: [['da_thu', 1, 1, 0.5], ['yeu_dan', 1, 1, 0.15]] },
  /* Bí cảnh Hỏa */
  hoa_linh: { name: 'Hỏa Linh', ai: 'shooter', fly: true, hp: 110, dmg: 14, speed: 80, w: 18, h: 20, look: 'wisp', color: '#ff8a3c', tuvi: 18, shot: 'fire', drops: [['hoa_linh_chi', 1, 1, 0.3], ['yeu_dan', 1, 1, 0.2]] },
  dung_nham: { name: 'Dung Nham Trùng', ai: 'walker', hp: 160, dmg: 16, speed: 60, w: 30, h: 16, look: 'worm', color: '#7a2b18', tuvi: 20, drops: [['da', 2, 3, 0.8], ['linh_thach', 1, 1, 0.25], ['yeu_dan', 1, 1, 0.2]] },
  viem_hau: { name: 'Viêm Hầu', ai: 'hopper', hp: 130, dmg: 15, speed: 130, w: 18, h: 22, look: 'monkey', color: '#a8401f', tuvi: 18, drops: [['da_thu', 1, 1, 0.6], ['yeu_dan', 1, 1, 0.2]] },
  /* Bí cảnh Thủy */
  bang_tinh: { name: 'Băng Tinh', ai: 'turret', hp: 200, dmg: 18, speed: 0, w: 20, h: 26, look: 'crystal', color: '#9fd8ef', tuvi: 30, shot: 'ice', drops: [['tuyet_lien', 1, 1, 0.3], ['linh_thach', 1, 1, 0.3]] },
  han_lang: { name: 'Hàn Lang', ai: 'charger', hp: 300, dmg: 20, speed: 90, w: 32, h: 20, look: 'wolf', color: '#bfe4f2', tuvi: 32, drops: [['da_thu', 1, 2, 0.8], ['yeu_dan', 1, 1, 0.25]] },
  thuy_quy: { name: 'Thủy Quỷ', ai: 'ghost', hp: 220, dmg: 18, speed: 75, w: 20, h: 26, look: 'ghost', color: '#5a9fc8', tuvi: 30, drops: [['yeu_dan', 1, 1, 0.3]] },
  /* Bí cảnh Lôi */
  loi_khoi: { name: 'Lôi Khôi Lỗi', ai: 'walker', hp: 500, dmg: 26, speed: 65, w: 24, h: 34, look: 'golem', color: '#6c6aa0', tuvi: 50, armor: 0.25, drops: [['loi_van_thach', 1, 2, 0.6], ['yeu_dan', 1, 1, 0.3]] },
  loi_dieu: { name: 'Lôi Điểu', ai: 'diver', hp: 320, dmg: 24, speed: 160, w: 26, h: 16, look: 'bird', color: '#b6a8ff', tuvi: 48, drops: [['yeu_dan', 1, 1, 0.3]] },
  loi_tinh_quai: { name: 'Lôi Tinh', ai: 'shooter', fly: true, hp: 400, dmg: 24, speed: 70, w: 20, h: 20, look: 'wisp', color: '#c7b8ff', tuvi: 50, shot: 'bolt', drops: [['loi_van_thach', 1, 1, 0.4], ['linh_thach', 1, 1, 0.4]] },
};
/* Thủ lĩnh bí cảnh */
DATA.bosses = {
  thu_yeu_vuong: { name: 'Thụ Yêu Vương', hp: 2400, dmg: 20, w: 70, h: 104, look: 'treeKing', color: '#2f5a35', tuvi: 150 },
  xich_viem_long: { name: 'Xích Viêm Long', hp: 2600, dmg: 24, w: 64, h: 40, look: 'dragon', color: '#c2381e', tuvi: 300, fly: true },
  bang_phuong: { name: 'Băng Phượng', hp: 6000, dmg: 34, w: 60, h: 44, look: 'phoenix', color: '#8fd3f0', tuvi: 500, fly: true },
  loi_than: { name: 'Lôi Thần Khôi Lỗi', hp: 20000, dmg: 58, w: 70, h: 110, look: 'thunderGolem', color: '#5b55a6', tuvi: 800 },
};

/* ---------- Bí cảnh ---------- */
DATA.dungeons = {
  moc: { name: 'Thanh Mộc Bí Cảnh', col: 300, req: 1, tier: 1, mons: ['thu_yeu', 'doc_phong', 'dang_xa'], boss: 'thu_yeu_vuong', fragment: 'manh_moc', core: 'moc_tinh',
    hazard: 'Độc đầm', sections: 6, pal: { sky1: '#0f2419', sky2: '#24452c', rock: '#1e2b20', rockTop: '#5f8f5a', hazard: '#7bc84a', glow: '#9be36b', accent: '#7fd18a' } },
  hoa: { name: 'Xích Viêm Bí Cảnh', col: 800, req: 5, tier: 2, mons: ['hoa_linh', 'dung_nham', 'viem_hau'], boss: 'xich_viem_long', fragment: 'manh_hoa', core: 'hoa_tinh',
    hazard: 'Dung nham', sections: 7, pal: { sky1: '#1f0a06', sky2: '#4a170c', rock: '#2a1410', rockTop: '#a8482a', hazard: '#ff6a1f', glow: '#ffb15c', accent: '#ff8a4c' } },
  thuy: { name: 'Hàn Băng Bí Cảnh', col: 92, req: 10, tier: 3, mons: ['bang_tinh', 'han_lang', 'thuy_quy'], boss: 'bang_phuong', fragment: 'manh_thuy', core: 'thuy_tinh',
    hazard: 'Hàn thủy', sections: 7, pal: { sky1: '#071624', sky2: '#16384f', rock: '#16293a', rockTop: '#8fc6e0', hazard: '#4fb6e8', glow: '#bfeaff', accent: '#9fdcf5' } },
  loi: { name: 'Cửu Thiên Lôi Bí Cảnh', col: 1040, req: 13, tier: 4, mons: ['loi_khoi', 'loi_dieu', 'loi_tinh_quai'], boss: 'loi_than', fragment: 'manh_loi', core: 'loi_tinh',
    hazard: 'Lôi trì', sections: 8, pal: { sky1: '#0c0a1e', sky2: '#25204d', rock: '#1b1934', rockTop: '#8d84d6', hazard: '#b18cff', glow: '#e1d6ff', accent: '#c3b5ff' } },
};
DATA.dungeonOrder = ['moc', 'hoa', 'thuy', 'loi'];

/* ---------- Mục tiêu hướng dẫn ---------- */
/* check(G) trả về true khi hoàn thành */
DATA.goals = [
  { text: 'Đánh cây để lấy 10 Gỗ (phím J, chuột trái hoặc nút Chém)', check: (g) => g.inv.count('go') >= 10 || g.stats.crafted > 0 },
  { text: 'Mở Túi đồ (Tab hoặc 🎒) và chế tạo Bàn chế tác', check: (g) => g.inv.count('ban_che_tac') > 0 || g.hasStructure('ban_che_tac') },
  { text: 'Chọn Bàn chế tác ở thanh công cụ, nhấn F (nút Dùng) để đặt xuống', check: (g) => g.hasStructure('ban_che_tac') },
  { text: 'Đứng cạnh Bàn chế tác, chế tạo Rìu đá hoặc Cuốc đá', check: (g) => g.inv.count('riu_da') + g.inv.count('cuoc_da') > 0 },
  { text: 'Dựng Lửa trại trước khi trời tối (cần 6 gỗ, 3 đá)', check: (g) => g.hasStructure('lua_trai') },
  { text: 'Ăn gì đó khi đói — hái quả dại hoặc nướng thịt', check: (g) => g.stats.eaten > 0 },
  { text: 'Đứng cạnh Lửa trại, nhấn E để ngồi thiền đến Luyện Khí Tầng 1', check: (g) => g.player.realm >= 1 },
  { text: 'Rèn Thiết kiếm (Lò luyện + quặng sắt) rồi đi về phía tây vào Thanh Mộc Bí Cảnh', check: (g) => g.stats.dungeonsEntered > 0 },
  { text: 'Đánh bại Thụ Yêu Vương, lấy mảnh Thiên Bia · Mộc', check: (g) => g.cleared.moc },
  { text: 'Đạt Luyện Khí Tầng 5, chinh phục Xích Viêm Bí Cảnh (phía đông)', check: (g) => g.cleared.hoa },
  { text: 'Luyện Trúc Cơ Đan (Mộc tinh + Hỏa tinh) và đột phá Trúc Cơ', check: (g) => g.player.realm >= 10 },
  { text: 'Chinh phục Hàn Băng Bí Cảnh (tận cùng phía tây)', check: (g) => g.cleared.thuy },
  { text: 'Luyện Kết Kim Đan, vượt lôi kiếp đột phá Kết Đan', check: (g) => g.player.realm >= 13 },
  { text: 'Chinh phục Cửu Thiên Lôi Bí Cảnh (đỉnh Lôi Phong, tận cùng phía đông)', check: (g) => g.cleared.loi },
  { text: 'Đặt đủ 4 mảnh Thiên Bia vào Truyền Tống Trận để rời Linh Vực', check: (g) => g.won },
];

DATA.DAY_SEC = 360;   /* một ngày đêm = 6 phút */
DATA.HUNGER_PER_SEC = 1 / 3;

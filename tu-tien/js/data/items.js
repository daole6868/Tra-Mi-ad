'use strict';
/* Dữ liệu vật phẩm: linh dược, khoáng thạch, yêu đan, đan dược, trứng, vật phẩm đặc biệt, trang bị, đan phương */

D.cats = {
  pill: 'Đan dược', herb: 'Linh dược', ore: 'Khoáng thạch', core: 'Yêu đan',
  book: 'Bí tịch', egg: 'Trứng linh thú', special: 'Đặc biệt',
};

D.items = {};
function defItem(o) { D.items[o.id] = Object.assign({ price: 10, tier: 1, desc: '' }, o); }

/* ---------- Linh dược ---------- */
[
  ['linh_chi', 'Linh Chi Thảo', '🌿', 1], ['ngung_huyet', 'Ngưng Huyết Thảo', '🌱', 1],
  ['tu_van_hoa', 'Tử Vân Hoa', '🌸', 2], ['bich_ngoc_thao', 'Bích Ngọc Thảo', '🍀', 2],
  ['hoa_long_qua', 'Hỏa Long Quả', '🍒', 3], ['bang_tam_lien', 'Băng Tâm Liên', '🏵️', 3],
  ['nhan_sam', 'Thiên Niên Nhân Sâm', '🥕', 4], ['tuyet_lien', 'Thiên Sơn Tuyết Liên', '🌼', 4],
  ['long_huyet', 'Long Huyết Thảo', '🌺', 5], ['kim_o_qua', 'Kim Ô Quả', '🍊', 5],
  ['cuu_diep', 'Cửu Diệp Linh Chi', '🍄', 6], ['u_minh_hoa', 'U Minh Hoa', '🥀', 6],
  ['hai_tam_thao', 'Hải Tâm Thảo', '🌾', 7], ['giao_long_qua', 'Giao Long Quả', '🍇', 7],
  ['ma_la_hoa', 'Mạn Đà La Hoa', '🌹', 8], ['hon_tinh_thao', 'Hồn Tinh Thảo', '🌷', 8],
  ['tinh_than_qua', 'Tinh Thần Quả', '🌟', 9], ['hu_khong_lien', 'Hư Không Liên', '💮', 9],
  ['bat_tu_duoc', 'Bất Tử Thần Dược', '🌻', 10], ['ban_dao', 'Bàn Đào Tiên Quả', '🍑', 10],
].forEach(([id, name, icon, tier]) => defItem({
  id, name, icon, tier, cat: 'herb', price: 6,
  grow: [0, 2, 4, 7, 10, 14, 18, 24, 30, 38, 48][tier] * 60,
  desc: 'Linh dược ' + tier + ' giai, dùng để luyện đan hoặc gieo trồng trong dược viên.',
}));
D.herbsByTier = {};
for (const id in D.items) {
  const it = D.items[id];
  if (it.cat === 'herb') (D.herbsByTier[it.tier] = D.herbsByTier[it.tier] || []).push(id);
}

/* ---------- Khoáng thạch ---------- */
D.oreByTier = {};
[
  ['hac_thiet', 'Hắc Thiết Quặng', '⚫'], ['tinh_cuong', 'Tinh Cương Thạch', '🔩'], ['han_thiet', 'Hàn Thiết', '🧊'],
  ['huyen_kim', 'Huyền Kim', '🟡'], ['xich_viem_tinh', 'Xích Viêm Tinh', '🔶'], ['co_than_thiet', 'Cổ Thần Thiết', '⚙️'],
  ['tham_hai_ngoc', 'Thâm Hải Hàn Ngọc', '🔷'], ['ma_van_thiet', 'Ma Văn Thiết', '🟣'], ['tinh_than_thiet', 'Tinh Thần Thiết', '⭐'],
  ['hon_don_thach', 'Hỗn Độn Thạch', '💎'],
].forEach(([id, name, icon], i) => {
  defItem({ id, name, icon, tier: i + 1, cat: 'ore', price: 8, desc: 'Khoáng thạch ' + (i + 1) + ' giai, nguyên liệu luyện khí và cường hóa.' });
  D.oreByTier[i + 1] = id;
});

/* ---------- Yêu đan ---------- */
D.numHan = ['', 'Nhất', 'Nhị', 'Tam', 'Tứ', 'Ngũ', 'Lục', 'Thất', 'Bát', 'Cửu', 'Thập'];
for (let t = 1; t <= 10; t++) {
  defItem({ id: 'yeu_dan_' + t, name: 'Yêu Đan ' + D.numHan[t] + ' Giai', icon: '🔮', tier: t, cat: 'core', price: 15,
    desc: 'Tinh hoa của yêu thú ' + t + ' giai. Dùng luyện đan, luyện khí hoặc cho linh thú ăn.' });
}

/* ---------- Đan dược ---------- */
[
  { id: 'hoi_khi_dan', name: 'Hồi Khí Đan', icon: '💊', tier: 1, price: 15, effect: { type: 'heal', pct: 0.35 }, desc: 'Hồi phục 35% sinh lực.' },
  { id: 'hoi_linh_dan', name: 'Hồi Linh Đan', icon: '🧪', tier: 1, price: 15, effect: { type: 'mp', pct: 0.4 }, desc: 'Hồi phục 40% linh lực.' },
  { id: 'tri_thuong_dan', name: 'Trị Thương Đan', icon: '🩹', tier: 1, price: 30, effect: { type: 'cure' }, desc: 'Chữa khỏi trọng thương do đột phá thất bại.' },
  { id: 'tu_khi_dan', name: 'Tụ Khí Đan', icon: '✨', tier: 1, price: 40, effect: { type: 'tuvi', sec: 120, tox: 10 }, desc: 'Tăng tu vi bằng ' + U.time(120) + ' tu luyện. Đan độc +10.' },
  { id: 'truc_co_dan', name: 'Trúc Cơ Đan', icon: '🌕', tier: 1, price: 400, effect: { type: 'break', realm: 2 }, desc: 'Tăng 30% tỉ lệ đột phá Trúc Cơ (dùng khi đột phá).' },
  { id: 'boi_nguyen_dan', name: 'Bồi Nguyên Đan', icon: '🌀', tier: 2, price: 60, effect: { type: 'buff', buff: 'cult', val: 50, dur: 900 }, desc: 'Tốc độ tu luyện +50% trong 15 phút.' },
  { id: 'giai_doc_dan', name: 'Giải Độc Đan', icon: '🍵', tier: 2, price: 50, effect: { type: 'detox', val: 40 }, desc: 'Giảm 40 điểm đan độc.' },
  { id: 'cuong_bao_dan', name: 'Cuồng Bạo Đan', icon: '🔥', tier: 2, price: 40, effect: { type: 'buff', buff: 'atk', val: 25, dur: 300 }, desc: 'Công kích +25% trong 5 phút.' },
  { id: 'kim_cang_dan', name: 'Kim Cang Đan', icon: '🛡️', tier: 2, price: 40, effect: { type: 'buff', buff: 'def', val: 25, dur: 300 }, desc: 'Phòng ngự +25% trong 5 phút.' },
  { id: 'tay_tuy_dan', name: 'Tẩy Tủy Đan', icon: '🦴', tier: 2, price: 300, effect: { type: 'attr', attr: 'canCot' }, desc: 'Căn Cốt +1 vĩnh viễn (tối đa 5 lần/kiếp).' },
  { id: 'ket_kim_dan', name: 'Kết Kim Đan', icon: '🌕', tier: 2, price: 400, effect: { type: 'break', realm: 3 }, desc: 'Tăng 30% tỉ lệ đột phá Kết Đan (dùng khi đột phá).' },
  { id: 'dai_hoan_dan', name: 'Đại Hoàn Đan', icon: '💊', tier: 3, price: 30, effect: { type: 'heal', pct: 0.7 }, desc: 'Hồi phục 70% sinh lực.' },
  { id: 'ngung_nguyen_dan', name: 'Ngưng Nguyên Đan', icon: '✨', tier: 3, price: 50, effect: { type: 'tuvi', sec: 150, tox: 10 }, desc: 'Tăng tu vi bằng ' + U.time(150) + ' tu luyện. Đan độc +10.' },
  { id: 'tho_nguyen_dan', name: 'Thọ Nguyên Đan', icon: '⏳', tier: 3, price: 200, effect: { type: 'life', pct: 0.15 }, desc: 'Tăng thọ nguyên 15% thọ mệnh cảnh giới (tối đa 8 lần/kiếp).' },
  { id: 'khai_tri_dan', name: 'Khai Trí Đan', icon: '🧠', tier: 3, price: 300, effect: { type: 'attr', attr: 'ngoTinh' }, desc: 'Ngộ Tính +1 vĩnh viễn (tối đa 5 lần/kiếp).' },
  { id: 'duong_hon_dan', name: 'Dưỡng Hồn Đan', icon: '👁️', tier: 3, price: 300, effect: { type: 'attr', attr: 'thanThuc' }, desc: 'Thần Thức +1 vĩnh viễn (tối đa 5 lần/kiếp).' },
  { id: 'hoa_anh_dan', name: 'Hóa Anh Đan', icon: '🌕', tier: 3, price: 400, effect: { type: 'break', realm: 4 }, desc: 'Giảm 25% sát thương lôi kiếp khi đột phá Nguyên Anh.' },
  { id: 'ngo_dao_dan', name: 'Ngộ Đạo Đan', icon: '💡', tier: 4, price: 150, effect: { type: 'insight', base: 200 }, desc: 'Nhận một lượng lớn điểm ngộ đạo.' },
  { id: 'hoa_than_dan', name: 'Hóa Thần Đan', icon: '🌕', tier: 4, price: 400, effect: { type: 'break', realm: 5 }, desc: 'Giảm 25% sát thương lôi kiếp khi đột phá Hóa Thần.' },
  { id: 'thai_hu_dan', name: 'Thái Hư Đan', icon: '✨', tier: 5, price: 50, effect: { type: 'tuvi', sec: 180, tox: 10 }, desc: 'Tăng tu vi bằng ' + U.time(180) + ' tu luyện. Đan độc +10.' },
  { id: 'luyen_hu_dan', name: 'Luyện Hư Đan', icon: '🌕', tier: 5, price: 400, effect: { type: 'break', realm: 6 }, desc: 'Giảm 25% sát thương lôi kiếp khi đột phá Luyện Hư.' },
  { id: 'cuu_chuyen_dan', name: 'Cửu Chuyển Hoàn Hồn Đan', icon: '💊', tier: 6, price: 60, effect: { type: 'heal', pct: 1, mp: 1 }, desc: 'Hồi phục toàn bộ sinh lực và linh lực.' },
  { id: 'hop_the_dan', name: 'Hợp Thể Đan', icon: '🌕', tier: 6, price: 400, effect: { type: 'break', realm: 7 }, desc: 'Giảm 25% sát thương lôi kiếp khi đột phá Hợp Thể.' },
  { id: 'hon_nguyen_dan', name: 'Hỗn Nguyên Đan', icon: '✨', tier: 7, price: 50, effect: { type: 'tuvi', sec: 210, tox: 10 }, desc: 'Tăng tu vi bằng ' + U.time(210) + ' tu luyện. Đan độc +10.' },
  { id: 'dai_thua_dan', name: 'Đại Thừa Đan', icon: '🌕', tier: 7, price: 400, effect: { type: 'break', realm: 8 }, desc: 'Giảm 25% sát thương lôi kiếp khi đột phá Đại Thừa.' },
  { id: 'tao_hoa_dan', name: 'Tạo Hóa Đan', icon: '🍀', tier: 8, price: 500, effect: { type: 'attr', attr: 'khiVan' }, desc: 'Khí Vận +1 vĩnh viễn (tối đa 5 lần/kiếp).' },
  { id: 'do_kiep_dan', name: 'Độ Kiếp Đan', icon: '🌕', tier: 8, price: 400, effect: { type: 'break', realm: 9 }, desc: 'Giảm 25% sát thương lôi kiếp khi đột phá Độ Kiếp.' },
  { id: 'tien_linh_dan', name: 'Tiên Linh Đan', icon: '✨', tier: 9, price: 50, effect: { type: 'tuvi', sec: 240, tox: 10 }, desc: 'Tăng tu vi bằng ' + U.time(240) + ' tu luyện. Đan độc +10.' },
  { id: 'phi_thang_dan', name: 'Phi Thăng Đan', icon: '🌕', tier: 9, price: 400, effect: { type: 'break', realm: 10 }, desc: 'Giảm 25% sát thương Cửu Cửu Thiên Kiếp khi phi thăng.' },
  { id: 'hong_mong_dan', name: 'Hồng Mông Tử Khí Đan', icon: '✨', tier: 10, price: 50, effect: { type: 'tuvi', sec: 300, tox: 10 }, desc: 'Tăng tu vi bằng ' + U.time(300) + ' tu luyện. Đan độc +10.' },
].forEach((p) => defItem(Object.assign({ cat: 'pill' }, p)));

/* ---------- Đặc biệt ---------- */
defItem({ id: 'ti_loi_phu', name: 'Tị Lôi Phù', icon: '🧿', tier: 3, cat: 'special', price: 250, effect: { type: 'charm' }, desc: 'Tự động kích hoạt khi độ kiếp: giảm 30% sát thương lôi kiếp (tiêu hao 1).' });
defItem({ id: 'bi_canh_lenh', name: 'Bí Cảnh Lệnh', icon: '🎫', tier: 2, cat: 'special', price: 150, effect: { type: 'dungeonTicket' }, desc: 'Thêm 1 lượt vào bí cảnh hôm nay.' });
defItem({ id: 'tay_linh_dich', name: 'Tẩy Linh Dịch', icon: '💧', tier: 5, cat: 'special', price: 1500, effect: { type: 'reroot' }, desc: 'Gột rửa linh căn, gieo lại linh căn mới (có thể chọn giữ lại cái cũ).' });
defItem({ id: 'tui_linh_thach', name: 'Túi Linh Thạch', icon: '💰', tier: 1, cat: 'special', price: 100, effect: { type: 'stoneBag' }, desc: 'Mở ra nhận linh thạch theo cảnh giới hiện tại.' });

/* ---------- Trứng linh thú ---------- */
[
  { id: 'trung_linh_thu', name: 'Linh Thú Trứng', tier: 1, price: 150, rarity: [1, 2], hatch: 120 },
  { id: 'trung_yeu_thu', name: 'Yêu Thú Trứng', tier: 3, price: 400, rarity: [2, 3], hatch: 480 },
  { id: 'trung_than_thu', name: 'Thần Thú Trứng', tier: 5, price: 1200, rarity: [3, 5], hatch: 1200 },
  { id: 'trung_tien_thu', name: 'Tiên Thú Trứng', tier: 8, price: 3000, rarity: [4, 5], hatch: 2400 },
].forEach((e) => defItem(Object.assign({ cat: 'egg', icon: '🥚', desc: 'Đặt vào ổ ấp trong Linh Thú Viên để ấp nở (phẩm ' + e.rarity[0] + '–' + e.rarity[1] + ' sao).' }, e)));

/* ---------- Trang bị ---------- */
D.slots = {
  weapon: { name: 'Vũ khí', icon: '🗡️', main: { atk: 7 },
    names: ['Thiết Kiếm', 'Thanh Cương Kiếm', 'Hàn Băng Kiếm', 'Xích Diễm Đao', 'Tử Điện Thương', 'Lưu Hỏa Phiến', 'Long Ngâm Kiếm', 'Phá Quân Kích', 'Tinh Thần Kiếm', 'Tru Tiên Kiếm'] },
  armor: { name: 'Pháp y', icon: '🥋', main: { def: 4.5, hp: 35 },
    names: ['Bố Y', 'Thanh Sam', 'Huyền Văn Bào', 'Kim Lân Giáp', 'Băng Tàm Pháp Y', 'Hỏa Vân Bào', 'Cổ Thần Chiến Giáp', 'Hải Hoàng Lân Y', 'Tinh Hà Đạo Bào', 'Hỗn Độn Tiên Y'] },
  helmet: { name: 'Đầu quan', icon: '👑', main: { hp: 45, def: 2 },
    names: ['Bố Cân', 'Thanh Ngọc Trâm', 'Huyền Thiết Quan', 'Kim Ô Quan', 'Băng Phách Trâm', 'Xích Long Quan', 'Chiến Thần Khôi', 'Hải Tâm Châu Quan', 'Tinh Thần Quan', 'Tiên Đế Miện'] },
  boots: { name: 'Hài', icon: '👢', main: { spd: 2, dodge: 1.5 },
    names: ['Thảo Hài', 'Truy Phong Ngoa', 'Đạp Vân Ngoa', 'Lưu Tinh Ngoa', 'Băng Phách Hài', 'Hỏa Vân Ngoa', 'Thần Hành Ngoa', 'Lăng Ba Ngoa', 'Tinh Bộ Hài', 'Thái Hư Tiên Ngoa'] },
  ring: { name: 'Giới chỉ', icon: '💍', main: { atk: 3.5, crit: 2.5 },
    names: ['Đồng Giới', 'Ngọc Giới', 'Huyền Thiết Giới', 'Kim Linh Giới', 'Băng Tâm Giới', 'Viêm Long Giới', 'Huyết Ngọc Giới', 'Hải Thần Giới', 'Tinh Diệu Giới', 'Càn Khôn Giới'] },
  amulet: { name: 'Ngọc bội', icon: '📿', main: { mp: 30, hp: 25 },
    names: ['Mộc Hộ Phù', 'Thanh Ngọc Bội', 'Huyền Ngọc Bội', 'Ngưng Hồn Ngọc', 'Băng Hồn Bội', 'Phượng Huyết Ngọc', 'Cổ Thần Lệnh', 'Long Châu', 'Tinh Hồn Ngọc', 'Hỗn Nguyên Châu'] },
};
D.slotOrder = ['weapon', 'armor', 'helmet', 'boots', 'ring', 'amulet'];

/* Phụ tố ngẫu nhiên: giá trị = base * (1 + 0.5 * phẩm) * (0.7..1.3) */
D.affixes = [
  { k: 'atkPct', base: 3, w: 10 }, { k: 'hpPct', base: 4, w: 10 }, { k: 'defPct', base: 4, w: 10 },
  { k: 'mpPct', base: 5, w: 6 }, { k: 'crit', base: 1.5, w: 8 }, { k: 'critDmg', base: 6, w: 7 },
  { k: 'dodge', base: 1.2, w: 6 }, { k: 'spd', base: 1.5, w: 6 }, { k: 'lifesteal', base: 1, w: 4 },
  { k: 'cult', base: 2, w: 4 }, { k: 'drop', base: 3, w: 4 }, { k: 'insight', base: 3, w: 3 },
];

/* ---------- Đan phương ---------- */
D.recipes = [
  { id: 'hoi_khi_dan',      lv: 1,  herbs: { linh_chi: 2 }, out: 2, chance: 0.9 },
  { id: 'hoi_linh_dan',     lv: 1,  herbs: { ngung_huyet: 2 }, out: 2, chance: 0.9 },
  { id: 'tu_khi_dan',       lv: 1,  herbs: { linh_chi: 1, ngung_huyet: 2, yeu_dan_1: 1 }, out: 1, chance: 0.75 },
  { id: 'tri_thuong_dan',   lv: 2,  herbs: { ngung_huyet: 3 }, out: 1, chance: 0.8 },
  { id: 'truc_co_dan',      lv: 2,  herbs: { linh_chi: 3, ngung_huyet: 3, yeu_dan_1: 2 }, out: 1, chance: 0.55 },
  { id: 'boi_nguyen_dan',   lv: 3,  herbs: { tu_van_hoa: 2, bich_ngoc_thao: 1 }, out: 1, chance: 0.75 },
  { id: 'giai_doc_dan',     lv: 3,  herbs: { bich_ngoc_thao: 2, linh_chi: 2 }, out: 1, chance: 0.8 },
  { id: 'cuong_bao_dan',    lv: 3,  herbs: { tu_van_hoa: 1, yeu_dan_2: 1 }, out: 1, chance: 0.75 },
  { id: 'kim_cang_dan',     lv: 3,  herbs: { bich_ngoc_thao: 1, yeu_dan_2: 1 }, out: 1, chance: 0.75 },
  { id: 'ket_kim_dan',      lv: 4,  herbs: { tu_van_hoa: 3, bich_ngoc_thao: 3, yeu_dan_2: 2 }, out: 1, chance: 0.5 },
  { id: 'tay_tuy_dan',      lv: 5,  herbs: { bich_ngoc_thao: 3, yeu_dan_2: 3 }, out: 1, chance: 0.45 },
  { id: 'dai_hoan_dan',     lv: 5,  herbs: { hoa_long_qua: 2, bang_tam_lien: 1 }, out: 2, chance: 0.8 },
  { id: 'ngung_nguyen_dan', lv: 6,  herbs: { bang_tam_lien: 2, hoa_long_qua: 1, yeu_dan_3: 1 }, out: 1, chance: 0.7 },
  { id: 'hoa_anh_dan',      lv: 6,  herbs: { hoa_long_qua: 3, bang_tam_lien: 3, yeu_dan_3: 2 }, out: 1, chance: 0.5 },
  { id: 'tho_nguyen_dan',   lv: 7,  herbs: { bang_tam_lien: 3, nhan_sam: 1 }, out: 1, chance: 0.6 },
  { id: 'khai_tri_dan',     lv: 7,  herbs: { bang_tam_lien: 3, yeu_dan_3: 3 }, out: 1, chance: 0.45 },
  { id: 'duong_hon_dan',    lv: 7,  herbs: { hoa_long_qua: 3, yeu_dan_3: 3 }, out: 1, chance: 0.45 },
  { id: 'hoa_than_dan',     lv: 8,  herbs: { nhan_sam: 3, tuyet_lien: 3, yeu_dan_4: 2 }, out: 1, chance: 0.5 },
  { id: 'ngo_dao_dan',      lv: 9,  herbs: { tuyet_lien: 2, nhan_sam: 2 }, out: 1, chance: 0.65 },
  { id: 'luyen_hu_dan',     lv: 10, herbs: { long_huyet: 3, kim_o_qua: 3, yeu_dan_5: 2 }, out: 1, chance: 0.5 },
  { id: 'thai_hu_dan',      lv: 11, herbs: { long_huyet: 2, kim_o_qua: 2, yeu_dan_5: 1 }, out: 1, chance: 0.7 },
  { id: 'hop_the_dan',      lv: 12, herbs: { cuu_diep: 3, u_minh_hoa: 3, yeu_dan_6: 2 }, out: 1, chance: 0.5 },
  { id: 'cuu_chuyen_dan',   lv: 13, herbs: { cuu_diep: 2, u_minh_hoa: 2, yeu_dan_6: 1 }, out: 2, chance: 0.7 },
  { id: 'dai_thua_dan',     lv: 14, herbs: { hai_tam_thao: 3, giao_long_qua: 3, yeu_dan_7: 2 }, out: 1, chance: 0.5 },
  { id: 'hon_nguyen_dan',   lv: 15, herbs: { hai_tam_thao: 2, giao_long_qua: 2, yeu_dan_7: 1 }, out: 1, chance: 0.7 },
  { id: 'do_kiep_dan',      lv: 16, herbs: { ma_la_hoa: 3, hon_tinh_thao: 3, yeu_dan_8: 2 }, out: 1, chance: 0.5 },
  { id: 'tao_hoa_dan',      lv: 17, herbs: { ma_la_hoa: 3, hon_tinh_thao: 3, yeu_dan_8: 3 }, out: 1, chance: 0.4 },
  { id: 'phi_thang_dan',    lv: 18, herbs: { tinh_than_qua: 3, hu_khong_lien: 3, yeu_dan_9: 2 }, out: 1, chance: 0.5 },
  { id: 'tien_linh_dan',    lv: 19, herbs: { tinh_than_qua: 2, hu_khong_lien: 2, yeu_dan_9: 1 }, out: 1, chance: 0.7 },
  { id: 'hong_mong_dan',    lv: 20, herbs: { bat_tu_duoc: 2, ban_dao: 2, yeu_dan_10: 1 }, out: 1, chance: 0.7 },
];
D.ALCH_MAX = 20;
D.FORGE_MAX = 20;
D.profExp = function (lv) { return Math.floor(30 * Math.pow(1.38, lv - 1)); };

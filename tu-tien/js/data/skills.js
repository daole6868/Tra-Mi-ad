'use strict';
/* Công pháp, thần thông, kỹ năng yêu thú */

D.techGrades = ['Phàm phẩm', 'Hoàng phẩm', 'Huyền phẩm', 'Địa phẩm', 'Thiên phẩm', 'Tiên phẩm'];
D.techGradeColor = ['#bdb6a5', '#7fcf90', '#6eaeef', '#bd92f3', '#f2aa50', '#f2665e'];

/* el: hệ (trùng linh căn được thưởng), 'all' = hợp mọi linh căn, 'none' = không hệ */
D.techniques = {
  dan_khi_quyet:        { name: 'Dẫn Khí Quyết', grade: 0, el: 'none', mult: 1.0, bonus: {}, desc: 'Pháp môn nhập môn phổ biến nhất tu chân giới, dẫn linh khí vào kinh mạch.' },
  truong_xuan_cong:     { name: 'Trường Xuân Công', grade: 1, el: 'moc', mult: 1.3, bonus: { hpPct: 8 }, desc: 'Công pháp Mộc hệ ôn hòa, dưỡng sinh kéo dài sinh cơ.' },
  liet_hoa_quyet:       { name: 'Liệt Hỏa Quyết', grade: 1, el: 'hoa', mult: 1.3, bonus: { atkPct: 6 }, desc: 'Luyện hóa hỏa linh khí, chân nguyên nóng rực.' },
  canh_kim_quyet:       { name: 'Canh Kim Quyết', grade: 1, el: 'kim', mult: 1.3, bonus: { crit: 3 }, desc: 'Kim khí sắc bén, chuyên phá phòng ngự.' },
  huyen_thuy_quyet:     { name: 'Huyền Thủy Quyết', grade: 1, el: 'thuy', mult: 1.3, bonus: { mpPct: 12 }, desc: 'Chân nguyên như nước, liên miên bất tuyệt.' },
  hau_tho_quyet:        { name: 'Hậu Thổ Quyết', grade: 1, el: 'tho', mult: 1.3, bonus: { defPct: 8 }, desc: 'Lấy đất làm gốc, thân thể vững như bàn thạch.' },
  thanh_moc_truong_sinh: { name: 'Thanh Mộc Trường Sinh Công', grade: 2, el: 'moc', mult: 1.7, bonus: { hpPct: 14, life: 5 }, desc: 'Mộc hệ thượng thừa, tăng cả thọ nguyên.' },
  cuu_duong_than_cong:  { name: 'Cửu Dương Thần Công', grade: 2, el: 'hoa', mult: 1.7, bonus: { atkPct: 12 }, desc: 'Chí dương chí cương, hỏa lực bá đạo.' },
  ngu_kiem_chan_kinh:   { name: 'Ngự Kiếm Chân Kinh', grade: 2, el: 'kim', mult: 1.7, bonus: { crit: 5, critDmg: 15 }, desc: 'Lấy thân ngự kiếm, kiếm khí ngút trời.' },
  bich_hai_trieu_sinh:  { name: 'Bích Hải Triều Sinh Quyết', grade: 2, el: 'thuy', mult: 1.7, bonus: { mpPct: 18, defPct: 5 }, desc: 'Chân nguyên như thủy triều, tầng tầng lớp lớp.' },
  ban_thach_cong:       { name: 'Bàn Thạch Bất Động Công', grade: 2, el: 'tho', mult: 1.7, bonus: { defPct: 14, hpPct: 6 }, desc: 'Bất động như núi, vạn pháp khó xâm.' },
  cuu_thien_loi_dan:    { name: 'Cửu Thiên Lôi Dẫn Quyết', grade: 3, el: 'loi', mult: 2.3, bonus: { atkPct: 15, spd: 4 }, desc: 'Dẫn thiên lôi nhập thể, tốc độ như điện.' },
  huyen_bang_ngoc_cot:  { name: 'Huyền Băng Ngọc Cốt Công', grade: 3, el: 'bang', mult: 2.3, bonus: { defPct: 15, mpPct: 15 }, desc: 'Băng tâm ngọc cốt, hàn khí hộ thân.' },
  thanh_phong_tieu_dao: { name: 'Thanh Phong Tiêu Dao Du', grade: 3, el: 'phong', mult: 2.3, bonus: { dodge: 6, spd: 6 }, desc: 'Thân như gió mát, tiêu dao tự tại.' },
  dai_nhat_phan_thien:  { name: 'Đại Nhật Phần Thiên Quyết', grade: 3, el: 'hoa', mult: 2.3, bonus: { atkPct: 18 }, desc: 'Ngưng tụ đại nhật chân hỏa, thiêu đốt trời xanh.' },
  van_moc_hoi_xuan:     { name: 'Vạn Mộc Hồi Xuân Điển', grade: 3, el: 'moc', mult: 2.3, bonus: { hpPct: 20, lifesteal: 2 }, desc: 'Vạn mộc hồi xuân, sinh cơ bất tuyệt.' },
  thanh_van_kiem_dien:  { name: 'Thanh Vân Kiếm Điển', grade: 3, el: 'kim', mult: 2.4, sect: 'thanh_van', bonus: { atkPct: 12, crit: 6 }, desc: 'Trấn phái tuyệt học của Thanh Vân Môn.' },
  than_nong_kinh:       { name: 'Thần Nông Bách Thảo Kinh', grade: 3, el: 'moc', mult: 2.4, sect: 'duoc_vuong', bonus: { alch: 15, hpPct: 10 }, desc: 'Bí truyền của Dược Vương Cốc, tinh thông bách thảo.' },
  thien_co_dien_toan:   { name: 'Thiên Cơ Diễn Toán Quyết', grade: 3, el: 'none', mult: 2.4, sect: 'thien_co', bonus: { drop: 20, insight: 20 }, desc: 'Suy diễn thiên cơ, nắm bắt cơ duyên.' },
  van_bao_luyen_than:   { name: 'Vạn Bảo Luyện Thần Thuật', grade: 3, el: 'tho', mult: 2.4, sect: 'van_bao', bonus: { forge: 15, stonePct: 20 }, desc: 'Bí pháp luyện khí của Vạn Bảo Lâu.' },
  huyet_ma_dai_phap:    { name: 'Huyết Ma Đại Pháp', grade: 4, el: 'none', mult: 2.9, sect: 'huyet_ma', bonus: { atkPct: 15, lifesteal: 6 }, desc: 'Ma công lấy huyết dưỡng thân, tà dị vô cùng.' },
  thai_thuong_vong_tinh: { name: 'Thái Thượng Vong Tình Kinh', grade: 4, el: 'none', mult: 3.0, bonus: { allPct: 8 }, desc: 'Thái thượng vong tình, đạo tâm như băng.' },
  ngu_hanh_luan_chuyen: { name: 'Ngũ Hành Luân Chuyển Quyết', grade: 4, el: 'all', mult: 3.0, bonus: { hpPct: 10, atkPct: 10, defPct: 10 }, desc: 'Ngũ hành tương sinh, luân chuyển không ngừng.' },
  dao_duc_chan_kinh:    { name: 'Đạo Đức Chân Kinh', grade: 5, el: 'none', mult: 4.0, bonus: { cult: 20, insight: 30 }, desc: 'Đạo khả đạo, phi thường đạo.' },
  hon_don_khai_thien:   { name: 'Hỗn Độn Khai Thiên Kinh', grade: 5, el: 'all', mult: 4.5, bonus: { allPct: 15 }, desc: 'Công pháp khai thiên tích địa trong truyền thuyết.' },
};
D.TECH_MAX = 10;
D.techBookTier = [1, 1, 3, 5, 7, 9];
D.techBookPrice = [20, 80, 150, 250, 400, 700];

/*
 * Thần thông. mp = % linh lực tối đa. mult = hệ số sát thương. hits = số đòn.
 * effs: hiệu ứng [{type, chance, turns, pow}] — burn/poison/bleed (sát thương mỗi lượt), stun, shield, heal,
 * atkUp/defUp (bản thân), atkDown/defDown (đối thủ). self: chỉ tác động lên bản thân.
 */
D.skills = {
  hoa_cau:              { name: 'Hỏa Cầu Thuật', el: 'hoa', tier: 1, mp: 0.10, cd: 1, mult: 1.6, effs: [{ type: 'burn', chance: 0.3, turns: 2, pow: 0.25 }] },
  bang_tien:            { name: 'Băng Tiễn Thuật', el: 'thuy', tier: 1, mp: 0.10, cd: 1, mult: 1.5, effs: [{ type: 'stun', chance: 0.12 }] },
  kim_quang_tram:       { name: 'Kim Quang Trảm', el: 'kim', tier: 1, mp: 0.12, cd: 2, mult: 1.9, pierce: 0.2 },
  dang_man:             { name: 'Đằng Mạn Triền Nhiễu', el: 'moc', tier: 1, mp: 0.12, cd: 3, mult: 1.2, effs: [{ type: 'poison', chance: 0.7, turns: 3, pow: 0.22 }, { type: 'stun', chance: 0.2 }] },
  tho_thuan:            { name: 'Thổ Thuẫn Thuật', el: 'tho', tier: 1, mp: 0.15, cd: 4, self: true, effs: [{ type: 'shield', pow: 0.2 }] },
  hoi_xuan:             { name: 'Hồi Xuân Thuật', el: 'moc', tier: 1, mp: 0.18, cd: 4, self: true, effs: [{ type: 'heal', pow: 0.22 }] },
  ngu_kiem:             { name: 'Ngự Kiếm Thuật', el: 'kim', tier: 2, mp: 0.14, cd: 2, mult: 0.8, hits: 3 },
  liet_hoa_chuong:      { name: 'Liệt Hỏa Chưởng', el: 'hoa', tier: 2, mp: 0.15, cd: 2, mult: 2.2, effs: [{ type: 'burn', chance: 0.4, turns: 2, pow: 0.3 }] },
  huyen_bang_chuong:    { name: 'Huyền Băng Chưởng', el: 'thuy', tier: 2, mp: 0.16, cd: 3, mult: 2.0, effs: [{ type: 'stun', chance: 0.25 }] },
  chuong_tam_loi:       { name: 'Chưởng Tâm Lôi', el: 'loi', tier: 2, mp: 0.16, cd: 2, mult: 2.3, effs: [{ type: 'stun', chance: 0.15 }] },
  kim_cang_ho_the:      { name: 'Kim Cang Hộ Thể', el: 'tho', tier: 2, mp: 0.18, cd: 5, self: true, effs: [{ type: 'defUp', pow: 0.4, turns: 3 }] },
  van_kiem_quy_tong:    { name: 'Vạn Kiếm Quy Tông', el: 'kim', tier: 3, mp: 0.2, cd: 3, mult: 0.75, hits: 5 },
  thien_hoa_lieu_nguyen: { name: 'Thiên Hỏa Liệu Nguyên', el: 'hoa', tier: 3, mp: 0.2, cd: 3, mult: 2.8, effs: [{ type: 'burn', chance: 0.6, turns: 3, pow: 0.3 }] },
  huyet_sat_thuat:      { name: 'Huyết Sát Thuật', el: 'none', tier: 3, mp: 0.18, cd: 3, mult: 2.4, lifesteal: 0.5 },
  phong_nhan_loan_vu:   { name: 'Phong Nhận Loạn Vũ', el: 'phong', tier: 3, mp: 0.18, cd: 2, mult: 0.7, hits: 4 },
  bang_phong_thien_ly:  { name: 'Băng Phong Thiên Lý', el: 'bang', tier: 3, mp: 0.2, cd: 3, mult: 2.6, effs: [{ type: 'stun', chance: 0.3 }] },
  chien_y_soi_trao:     { name: 'Chiến Ý Sôi Trào', el: 'none', tier: 3, mp: 0.15, cd: 5, self: true, effs: [{ type: 'atkUp', pow: 0.4, turns: 3 }] },
  loi_dinh_van_quan:    { name: 'Lôi Đình Vạn Quân', el: 'loi', tier: 4, mp: 0.22, cd: 3, mult: 3.4, effs: [{ type: 'stun', chance: 0.25 }] },
  hau_tho_phong_an:     { name: 'Hậu Thổ Phong Ấn', el: 'tho', tier: 4, mp: 0.2, cd: 3, mult: 2.6, effs: [{ type: 'defDown', chance: 1, pow: 0.3, turns: 3 }] },
  van_doc_phe_tam:      { name: 'Vạn Độc Phệ Tâm', el: 'moc', tier: 4, mp: 0.2, cd: 3, mult: 1.8, effs: [{ type: 'poison', chance: 1, turns: 4, pow: 0.4 }] },
  thuy_long_ngam:       { name: 'Thủy Long Ngâm', el: 'thuy', tier: 4, mp: 0.22, cd: 3, mult: 3.2, effs: [{ type: 'atkDown', chance: 1, pow: 0.25, turns: 3 }] },
  dai_nhat_kim_o:       { name: 'Đại Nhật Kim Ô Quyền', el: 'hoa', tier: 5, mp: 0.24, cd: 3, mult: 3.8, effs: [{ type: 'burn', chance: 0.5, turns: 3, pow: 0.4 }] },
  thai_cuc_am_duong:    { name: 'Thái Cực Âm Dương', el: 'none', tier: 5, mp: 0.25, cd: 5, self: true, effs: [{ type: 'heal', pow: 0.25 }, { type: 'shield', pow: 0.2 }] },
  kiem_khi_tung_hoanh:  { name: 'Kiếm Khí Tung Hoành', el: 'kim', tier: 5, mp: 0.24, cd: 3, mult: 0.75, hits: 6, pierce: 0.2 },
  cuu_thien_huyen_loi:  { name: 'Cửu Thiên Huyền Lôi', el: 'loi', tier: 6, mp: 0.26, cd: 3, mult: 4.4, effs: [{ type: 'stun', chance: 0.3 }] },
  bat_diet_kim_than:    { name: 'Bất Diệt Kim Thân', el: 'tho', tier: 6, mp: 0.26, cd: 6, self: true, effs: [{ type: 'defUp', pow: 0.6, turns: 3 }, { type: 'shield', pow: 0.3 }] },
  u_minh_quy_trao:      { name: 'U Minh Quỷ Trảo', el: 'none', tier: 6, mp: 0.24, cd: 3, mult: 3.6, lifesteal: 0.4, effs: [{ type: 'atkDown', chance: 0.6, pow: 0.2, turns: 2 }] },
  phan_thien_diet_dia:  { name: 'Phần Thiên Diệt Địa', el: 'hoa', tier: 7, mp: 0.28, cd: 3, mult: 5.0, effs: [{ type: 'burn', chance: 0.7, turns: 3, pow: 0.5 }] },
  bang_tuyet_thien_dia: { name: 'Băng Tuyết Thiên Địa', el: 'bang', tier: 7, mp: 0.28, cd: 4, mult: 4.6, effs: [{ type: 'stun', chance: 0.4 }] },
  tru_tien_kiem_tran:   { name: 'Tru Tiên Kiếm Trận', el: 'kim', tier: 8, mp: 0.3, cd: 4, mult: 1.05, hits: 6, pierce: 0.3 },
  thoi_khong_dinh_tre:  { name: 'Thời Không Đình Trệ', el: 'none', tier: 8, mp: 0.3, cd: 6, mult: 2.0, effs: [{ type: 'stun', chance: 1 }] },
  hon_don_nhat_kich:    { name: 'Hỗn Độn Nhất Kích', el: 'none', tier: 9, mp: 0.32, cd: 4, mult: 6.5, pierce: 0.5 },
  van_vat_quy_nguyen:   { name: 'Vạn Vật Quy Nguyên', el: 'moc', tier: 9, mp: 0.3, cd: 5, self: true, effs: [{ type: 'heal', pow: 0.5 }] },
  dai_dao_vo_cuc:       { name: 'Đại Đạo Vô Cực', el: 'all', tier: 10, mp: 0.35, cd: 4, mult: 8, pierce: 0.5 },
  /* Tuyệt học tông môn */
  thanh_van_kiem_quyet: { name: 'Thanh Vân Vạn Kiếm Quyết', el: 'kim', tier: 4, mp: 0.22, cd: 3, mult: 0.9, hits: 5, pierce: 0.15, sect: 'thanh_van' },
  bach_thao_hoi_sinh:   { name: 'Bách Thảo Hồi Sinh', el: 'moc', tier: 4, mp: 0.22, cd: 4, self: true, sect: 'duoc_vuong', effs: [{ type: 'heal', pow: 0.35 }, { type: 'defUp', pow: 0.25, turns: 2 }] },
  thien_co_bien:        { name: 'Thiên Cơ Biến', el: 'none', tier: 4, mp: 0.22, cd: 4, mult: 2.4, sect: 'thien_co', effs: [{ type: 'stun', chance: 0.5 }, { type: 'defDown', chance: 1, pow: 0.25, turns: 2 }] },
  van_bao_phi_kiem:     { name: 'Vạn Bảo Phi Kiếm', el: 'tho', tier: 4, mp: 0.22, cd: 3, mult: 3.2, pierce: 0.3, sect: 'van_bao' },
  huyet_ma_thon_phe:    { name: 'Huyết Ma Thôn Phệ', el: 'none', tier: 4, mp: 0.22, cd: 3, mult: 3.0, lifesteal: 0.7, sect: 'huyet_ma' },
};
D.SKILL_MAX = 10;
D.SKILL_SLOTS = 4;
for (const id in D.skills) {
  const s = D.skills[id];
  s.id = id;
  s.effs = s.effs || [];
  s.hits = s.hits || 1;
  s.mult = s.mult || 0;
}
for (const id in D.techniques) D.techniques[id].id = id;

D.effectInfo = {
  burn:    { name: 'Thiêu đốt', icon: '🔥', dot: true },
  poison:  { name: 'Trúng độc', icon: '☠️', dot: true },
  bleed:   { name: 'Chảy máu', icon: '🩸', dot: true },
  stun:    { name: 'Choáng', icon: '💫' },
  shield:  { name: 'Hộ thuẫn', icon: '🛡️' },
  heal:    { name: 'Hồi phục', icon: '💚' },
  atkUp:   { name: 'Tăng công', icon: '⬆️' },
  defUp:   { name: 'Tăng thủ', icon: '🔰' },
  atkDown: { name: 'Giảm công', icon: '⬇️' },
  defDown: { name: 'Phá giáp', icon: '💔' },
};

/* Kỹ năng yêu thú */
D.mskills = {
  bite:    { name: 'Cắn Xé', mult: 1.5, cd: 2 },
  claw:    { name: 'Trảo Kích', mult: 1.25, cd: 2, effs: [{ type: 'bleed', chance: 0.4, turns: 2, pow: 0.25 }] },
  poison:  { name: 'Phun Độc', mult: 1.0, cd: 3, effs: [{ type: 'poison', chance: 0.7, turns: 3, pow: 0.25 }] },
  fire:    { name: 'Phun Lửa', mult: 1.6, cd: 3, effs: [{ type: 'burn', chance: 0.4, turns: 2, pow: 0.3 }] },
  ice:     { name: 'Hàn Băng Khí', mult: 1.3, cd: 3, effs: [{ type: 'stun', chance: 0.2 }] },
  thunder: { name: 'Lôi Kích', mult: 1.8, cd: 3, effs: [{ type: 'stun', chance: 0.15 }] },
  roar:    { name: 'Gầm Thét', self: true, cd: 4, effs: [{ type: 'atkUp', pow: 0.3, turns: 3 }] },
  harden:  { name: 'Thạch Hóa', self: true, cd: 4, effs: [{ type: 'defUp', pow: 0.5, turns: 3 }] },
  regen:   { name: 'Hấp Thu Linh Khí', self: true, cd: 5, effs: [{ type: 'heal', pow: 0.15 }] },
  charge:  { name: 'Xung Phong', mult: 2.0, cd: 3 },
  curse:   { name: 'Nguyền Rủa', mult: 0.8, cd: 4, effs: [{ type: 'atkDown', chance: 0.8, pow: 0.25, turns: 3 }] },
  drain:   { name: 'Hút Huyết', mult: 1.4, cd: 3, lifesteal: 0.5 },
  multi:   { name: 'Loạn Kích', mult: 0.6, hits: 3, cd: 3 },
  shatter: { name: 'Phá Giáp', mult: 1.2, cd: 4, effs: [{ type: 'defDown', chance: 0.8, pow: 0.3, turns: 3 }] },
  shield:  { name: 'Hộ Thân Cương Khí', self: true, cd: 5, effs: [{ type: 'shield', pow: 0.15 }] },
  doom:    { name: 'Diệt Thế Nhất Kích', mult: 3.0, cd: 5 },
  sword:   { name: 'Kiếm Khí Trảm', mult: 1.7, cd: 2, pierce: 0.2 },
  palm:    { name: 'Chưởng Pháp', mult: 1.5, cd: 2 },
};
for (const id in D.mskills) {
  const s = D.mskills[id];
  s.id = id; s.effs = s.effs || []; s.hits = s.hits || 1; s.mult = s.mult || 0; s.mp = 0;
}

/* Sinh vật phẩm bí tịch từ công pháp & thần thông */
for (const id in D.techniques) {
  const t = D.techniques[id];
  defItem({
    id: 'book_t_' + id, name: 'Bí tịch: ' + t.name, icon: '📘', cat: 'book', tier: D.techBookTier[t.grade],
    price: D.techBookPrice[t.grade], learn: { kind: 'tech', id },
    desc: 'Công pháp ' + D.techGrades[t.grade] + '. Dùng để lĩnh ngộ.',
  });
}
for (const id in D.skills) {
  const s = D.skills[id];
  defItem({
    id: 'book_s_' + id, name: 'Bí tịch: ' + s.name, icon: '📜', cat: 'book', tier: s.tier, price: 60,
    learn: { kind: 'skill', id }, desc: 'Thần thông ' + s.tier + ' giai. Dùng để học.',
  });
}

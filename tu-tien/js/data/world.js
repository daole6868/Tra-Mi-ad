'use strict';
/* Thế giới: yêu thú, bản đồ, bí cảnh */

/* hp/atk/def/spd là hệ số so với yêu thú chuẩn cùng cảnh giới */
D.monsters = {};
function defMon(id, name, icon, el, skills, o) {
  D.monsters[id] = Object.assign({ id, name, icon, el, skills, hp: 1, atk: 1, def: 1, spd: 1 }, o || {});
}
/* Bản đồ 1 */
defMon('hoang_lang', 'Hoang Lang', '🐺', 'kim', ['bite']);
defMon('doc_xa', 'Độc Xà', '🐍', 'moc', ['poison'], { hp: 0.8, spd: 1.2 });
defMon('son_tru', 'Sơn Trư', '🐗', 'tho', ['charge'], { hp: 1.3, atk: 0.9, spd: 0.8 });
defMon('linh_hau', 'Linh Hầu', '🐒', 'phong', ['multi'], { hp: 0.8, spd: 1.3 });
defMon('lang_vuong', 'Thanh Lang Vương', '🐺', 'kim', ['bite', 'roar']);
/* Bản đồ 2 */
defMon('hac_hung', 'Hắc Hùng', '🐻', 'tho', ['claw', 'harden'], { hp: 1.3, spd: 0.85 });
defMon('quy_dien_chu', 'Quỷ Diện Chu', '🕷️', 'moc', ['poison', 'curse']);
defMon('yeu_ho', 'Huyễn Yêu Hồ', '🦊', 'hoa', ['fire'], { spd: 1.2, hp: 0.9 });
defMon('cuong_thi', 'Cương Thi', '🧟', 'none', ['drain'], { def: 1.2, spd: 0.8 });
defMon('hac_phong_vuong', 'Hắc Phong Yêu Vương', '👹', 'none', ['claw', 'roar', 'multi']);
/* Bản đồ 3 */
defMon('thiet_giap_te', 'Thiết Giáp Tê', '🦏', 'tho', ['charge', 'harden'], { def: 1.5, spd: 0.8 });
defMon('phong_loi_ung', 'Phong Lôi Ưng', '🦅', 'loi', ['thunder'], { spd: 1.4, hp: 0.8 });
defMon('hoa_van_bao', 'Hỏa Vân Báo', '🐆', 'hoa', ['claw', 'fire'], { spd: 1.3 });
defMon('thanh_giac_nguu', 'Thanh Giác Ngưu', '🐂', 'tho', ['charge'], { hp: 1.3 });
defMon('kim_tinh_su', 'Kim Tình Sư Vương', '🦁', 'kim', ['bite', 'roar', 'charge']);
/* Bản đồ 4 */
defMon('sa_trung', 'Sa Trùng', '🐛', 'tho', ['bite', 'poison'], { hp: 1.2 });
defMon('doc_hat', 'Độc Hạt Vương', '🦂', 'moc', ['poison', 'shatter']);
defMon('huyet_anh_lang', 'Huyết Ảnh Lang', '🐺', 'hoa', ['claw', 'drain'], { spd: 1.3 });
defMon('phong_sa_yeu', 'Phong Sa Yêu', '🌪️', 'phong', ['multi'], { spd: 1.2, hp: 0.9 });
defMon('thon_thien_mang', 'Thôn Thiên Cự Mãng', '🐍', 'tho', ['bite', 'poison', 'doom']);
/* Bản đồ 5 */
defMon('bang_tinh', 'Băng Tinh Yêu', '❄️', 'bang', ['ice']);
defMon('tuyet_vien', 'Tuyết Viên', '🦍', 'thuy', ['claw', 'roar'], { hp: 1.2 });
defMon('bang_giao', 'Băng Giao', '🐉', 'thuy', ['ice', 'bite']);
defMon('han_suong_ho', 'Hàn Sương Hồ', '🦊', 'bang', ['ice', 'multi'], { spd: 1.25 });
defMon('bang_phuong', 'Băng Phượng', '🦢', 'bang', ['ice', 'regen', 'doom']);
/* Bản đồ 6 */
defMon('hoa_linh', 'Hỏa Linh', '🔥', 'hoa', ['fire'], { spd: 1.2 });
defMon('dung_nham', 'Dung Nham Cự Nhân', '🗿', 'tho', ['charge', 'harden'], { hp: 1.4, spd: 0.75 });
defMon('hoa_ky_lan', 'Hỏa Kỳ Lân', '🦌', 'hoa', ['fire', 'roar']);
defMon('viem_ma', 'Viêm Ma', '👺', 'hoa', ['drain', 'fire']);
defMon('viem_long', 'Xích Viêm Long', '🐲', 'hoa', ['fire', 'roar', 'doom']);
/* Bản đồ 7 */
defMon('oan_linh', 'Oán Linh', '👻', 'none', ['curse', 'drain'], { spd: 1.2 });
defMon('khoi_loi', 'Cổ Chiến Khôi Lỗi', '💂', 'kim', ['harden', 'charge'], { def: 1.5 });
defMon('ma_tuong', 'Ma Tướng', '🧟', 'none', ['sword', 'shatter']);
defMon('cot_long', 'Bạch Cốt Long', '🦴', 'none', ['bite', 'curse'], { hp: 1.2 });
defMon('ma_than_tan_hon', 'Ma Thần Tàn Hồn', '💀', 'none', ['curse', 'drain', 'doom']);
/* Bản đồ 8 */
defMon('hai_yeu', 'Hải Yêu', '🧜', 'thuy', ['ice', 'curse']);
defMon('cu_kinh', 'Thâm Hải Cự Kình', '🐋', 'thuy', ['charge', 'shield'], { hp: 1.5, spd: 0.8 });
defMon('giao_long', 'Giao Long', '🐉', 'thuy', ['bite', 'thunder']);
defMon('hai_quai', 'Thiên Túc Hải Quái', '🐙', 'thuy', ['multi', 'poison']);
defMon('hai_hoang', 'Hải Hoàng', '🔱', 'thuy', ['ice', 'shield', 'doom']);
/* Bản đồ 9 */
defMon('ma_binh', 'U Minh Ma Binh', '😈', 'none', ['sword', 'multi']);
defMon('huyet_ma', 'Huyết Ma', '🩸', 'hoa', ['drain', 'curse']);
defMon('phe_hon_lang', 'Phệ Hồn Ma Lang', '🐺', 'none', ['claw', 'bite'], { spd: 1.3 });
defMon('cuu_u_ma_xa', 'Cửu U Ma Xà', '🐍', 'moc', ['poison', 'drain']);
defMon('ma_ton', 'Cửu U Ma Tôn', '👿', 'none', ['curse', 'drain', 'doom', 'roar']);
/* Bản đồ 10 */
defMon('hu_khong_thu', 'Hư Không Thú', '🌌', 'loi', ['thunder', 'multi']);
defMon('tinh_khong_cu_thu', 'Tinh Không Cự Thú', '🪐', 'tho', ['charge', 'harden'], { hp: 1.4, spd: 0.8 });
defMon('phe_tinh_trung', 'Phệ Tinh Trùng', '☄️', 'hoa', ['fire', 'drain'], { spd: 1.2 });
defMon('hu_linh', 'Hư Không Linh', '👁️', 'none', ['curse', 'ice']);
defMon('hu_khong_chu', 'Hư Không Chi Chủ', '🌀', 'loi', ['thunder', 'shield', 'doom']);
/* Bản đồ 11 */
defMon('thien_binh', 'Thiên Binh', '🛡️', 'kim', ['sword', 'harden'], { def: 1.3 });
defMon('tien_hac', 'Tiên Hạc', '🕊️', 'phong', ['multi', 'regen'], { spd: 1.3 });
defMon('thuy_thu', 'Thụy Thú', '🦄', 'none', ['charge', 'roar']);
defMon('thien_tuong', 'Thiên Tướng', '⚔️', 'kim', ['sword', 'shatter']);
defMon('thien_ma', 'Vực Ngoại Thiên Ma', '🌑', 'none', ['curse', 'drain', 'doom', 'shield']);
/* Thủ lĩnh bí cảnh */
defMon('huyen_quy', 'Thất Huyền Thủ Hộ Quy', '🐢', 'thuy', ['harden', 'ice', 'charge'], { def: 1.4 });
defMon('huyet_sac_vuong', 'Huyết Sắc Yêu Vương', '🦇', 'none', ['drain', 'claw', 'roar']);
defMon('tien_phu_khoi_loi', 'Tiên Phủ Thủ Hộ Khôi Lỗi', '🗿', 'kim', ['sword', 'harden', 'doom'], { def: 1.4 });
defMon('van_yeu_vuong', 'Vạn Yêu Chi Vương', '🐯', 'hoa', ['claw', 'roar', 'fire', 'doom']);
defMon('long_hon', 'Thái Cổ Long Hồn', '🐉', 'loi', ['thunder', 'bite', 'shield', 'doom']);
defMon('chien_than', 'Thiên Đình Chiến Thần', '⚡', 'kim', ['sword', 'shatter', 'roar', 'doom']);
/* Đối thủ người (tỷ thí, kỳ ngộ) */
defMon('tan_tu', 'Tán Tu Cướp Đường', '🥷', 'none', ['sword', 'palm']);
defMon('ma_tu', 'Ma Tu', '🧛', 'none', ['drain', 'curse']);
defMon('dong_mon', 'Đồng Môn Sư Huynh', '🧑‍🦱', 'none', ['sword', 'palm', 'shield']);
defMon('doi_thu', 'Thiên Kiêu Đối Thủ', '🤺', 'none', ['sword', 'palm', 'roar']);
defMon('ho_bao_thu', 'Yêu Thú Hộ Bảo', '🐲', 'hoa', ['bite', 'fire', 'roar'], { hp: 1.2 });

D.maps = [
  { id: 'thanh_van_son', name: 'Thanh Vân Sơn Mạch', tier: 1, lv: [1, 4], icon: '⛰️', hue: 150,
    mons: ['hoang_lang', 'doc_xa', 'son_tru', 'linh_hau'], boss: 'lang_vuong',
    desc: 'Dãy núi mây xanh dưới chân Thanh Vân Môn, nơi tu sĩ mới nhập môn rèn luyện.' },
  { id: 'hac_phong_lam', name: 'Hắc Phong Lâm', tier: 1, lv: [5, 9], icon: '🌲', hue: 110,
    mons: ['hac_hung', 'quy_dien_chu', 'yeu_ho', 'cuong_thi'], boss: 'hac_phong_vuong',
    desc: 'Khu rừng gió đen quanh năm âm u, yêu khí dày đặc.' },
  { id: 'van_thu_coc', name: 'Vạn Thú Cốc', tier: 2, lv: [10, 13], icon: '🏞️', hue: 90,
    mons: ['thiet_giap_te', 'phong_loi_ung', 'hoa_van_bao', 'thanh_giac_nguu'], boss: 'kim_tinh_su',
    desc: 'Thung lũng vạn thú, yêu thú Trúc Cơ kỳ hoành hành.' },
  { id: 'xich_sa', name: 'Xích Sa Hoang Mạc', tier: 3, lv: [14, 17], icon: '🏜️', hue: 25,
    mons: ['sa_trung', 'doc_hat', 'huyet_anh_lang', 'phong_sa_yeu'], boss: 'thon_thien_mang',
    desc: 'Sa mạc đỏ như máu, ẩn giấu cổ mộ và độc trùng.' },
  { id: 'bang_phong', name: 'Băng Phong Tuyết Vực', tier: 4, lv: [18, 21], icon: '🏔️', hue: 195,
    mons: ['bang_tinh', 'tuyet_vien', 'bang_giao', 'han_suong_ho'], boss: 'bang_phuong',
    desc: 'Vùng tuyết vạn năm không tan, hàn khí thấu xương.' },
  { id: 'viem_nguc', name: 'Viêm Ngục Hỏa Sơn', tier: 5, lv: [22, 25], icon: '🌋', hue: 10,
    mons: ['hoa_linh', 'dung_nham', 'hoa_ky_lan', 'viem_ma'], boss: 'viem_long',
    desc: 'Núi lửa ngàn năm, dung nham chảy thành sông.' },
  { id: 'co_chien_truong', name: 'Thượng Cổ Chiến Trường', tier: 6, lv: [26, 29], icon: '⚔️', hue: 300,
    mons: ['oan_linh', 'khoi_loi', 'ma_tuong', 'cot_long'], boss: 'ma_than_tan_hon',
    desc: 'Chiến trường thời thượng cổ, oán khí ngút trời.' },
  { id: 'vo_tan_hai', name: 'Vô Tận Hải', tier: 7, lv: [30, 33], icon: '🌊', hue: 210,
    mons: ['hai_yeu', 'cu_kinh', 'giao_long', 'hai_quai'], boss: 'hai_hoang',
    desc: 'Biển cả mênh mông không bờ, hải tộc xưng bá.' },
  { id: 'cuu_u', name: 'Cửu U Ma Vực', tier: 8, lv: [34, 37], icon: '🕳️', hue: 330,
    mons: ['ma_binh', 'huyet_ma', 'phe_hon_lang', 'cuu_u_ma_xa'], boss: 'ma_ton',
    desc: 'Ma vực chín tầng địa ngục, ma tộc hoành hành.' },
  { id: 'hu_khong', name: 'Thiên Ngoại Hư Không', tier: 9, lv: [38, 41], icon: '🌌', hue: 260,
    mons: ['hu_khong_thu', 'tinh_khong_cu_thu', 'phe_tinh_trung', 'hu_linh'], boss: 'hu_khong_chu',
    desc: 'Hư không ngoài trời đất, không gian vỡ vụn.' },
  { id: 'tien_gioi', name: 'Tiên Giới Tàn Cảnh', tier: 10, lv: [42, 45], icon: '🏯', hue: 45,
    mons: ['thien_binh', 'tien_hac', 'thuy_thu', 'thien_tuong'], boss: 'thien_ma',
    desc: 'Tàn tích tiên giới sau đại kiếp, thiên ma xâm lấn.' },
];
D.mapById = {};
D.maps.forEach((m, i) => { m.index = i; D.mapById[m.id] = m; });
D.mapForGs = function (gs) {
  let best = D.maps[0];
  for (const m of D.maps) if (gs >= m.lv[0]) best = m;
  return best;
};

D.dungeons = [
  { id: 'that_huyen', name: 'Thất Huyền Bí Cảnh', req: 5, lv: 7, tier: 1, stages: 5, icon: '🏛️',
    pool: ['hac_hung', 'quy_dien_chu', 'yeu_ho', 'son_tru'], boss: 'huyen_quy',
    desc: 'Bí cảnh do bảy vị tán tu thượng cổ để lại, mỗi trăm năm mở một lần.' },
  { id: 'huyet_sac', name: 'Huyết Sắc Cấm Địa', req: 11, lv: 13, tier: 2, stages: 5, icon: '🩸',
    pool: ['thiet_giap_te', 'phong_loi_ung', 'hoa_van_bao', 'thanh_giac_nguu'], boss: 'huyet_sac_vuong',
    desc: 'Cấm địa nhuốm máu, chỉ tu sĩ dưới Kết Đan mới vào được.' },
  { id: 'tien_phu', name: 'Thượng Cổ Tiên Phủ', req: 17, lv: 19, tier: 4, stages: 6, icon: '🏯',
    pool: ['bang_tinh', 'tuyet_vien', 'doc_hat', 'huyet_anh_lang'], boss: 'tien_phu_khoi_loi',
    desc: 'Động phủ của một vị tiên nhân thượng cổ, cơ quan trùng trùng.' },
  { id: 'van_yeu_quat', name: 'Vạn Yêu Quật', req: 23, lv: 25, tier: 5, stages: 6, icon: '🕸️',
    pool: ['hoa_linh', 'dung_nham', 'hoa_ky_lan', 'viem_ma'], boss: 'van_yeu_vuong',
    desc: 'Hang ổ của vạn yêu, yêu vương ngự trị.' },
  { id: 'long_mo', name: 'Thái Cổ Long Mộ', req: 31, lv: 33, tier: 7, stages: 7, icon: '🐉',
    pool: ['hai_yeu', 'cu_kinh', 'giao_long', 'cot_long'], boss: 'long_hon',
    desc: 'Lăng mộ chân long thái cổ, long hồn bất diệt.' },
  { id: 'thien_dinh', name: 'Thiên Đình Di Tích', req: 39, lv: 42, tier: 10, stages: 7, icon: '⚡',
    pool: ['thien_binh', 'tien_hac', 'thien_tuong', 'hu_linh'], boss: 'chien_than',
    desc: 'Di tích thiên đình cổ xưa, chiến thần vẫn canh giữ cổng trời.' },
];
D.dungeonById = {};
D.dungeons.forEach((d) => { D.dungeonById[d.id] = d; });
D.DUNGEON_DAILY = 3;

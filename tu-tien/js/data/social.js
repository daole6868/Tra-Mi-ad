'use strict';
/* Tông môn, linh thú, nhiệm vụ, thành tựu, luân hồi */

/* ---------- Tông môn ---------- */
D.sects = [
  { id: 'thanh_van', name: 'Thanh Vân Môn', icon: '⚔️', align: 'chinh', bonus: { atkPct: 4, crit: 1 },
    tech: 'thanh_van_kiem_dien', skill: 'thanh_van_kiem_quyet',
    desc: 'Chính đạo đệ nhất kiếm tông. Đệ tử tăng công kích và bạo kích.' },
  { id: 'duoc_vuong', name: 'Dược Vương Cốc', icon: '🌿', align: 'chinh', bonus: { alch: 4, hpPct: 3 },
    tech: 'than_nong_kinh', skill: 'bach_thao_hoi_sinh',
    desc: 'Thánh địa đan đạo. Đệ tử luyện đan dễ thành công, sinh lực dồi dào.' },
  { id: 'thien_co', name: 'Thiên Cơ Các', icon: '🔭', align: 'trung', bonus: { drop: 5, insight: 5 },
    tech: 'thien_co_dien_toan', skill: 'thien_co_bien',
    desc: 'Nắm giữ thiên cơ, trung lập giữa chính tà. Tăng rơi đồ và ngộ đạo.' },
  { id: 'van_bao', name: 'Vạn Bảo Lâu', icon: '💰', align: 'trung', bonus: { forge: 4, stonePct: 6 },
    tech: 'van_bao_luyen_than', skill: 'van_bao_phi_kiem',
    desc: 'Thương hội kiêm luyện khí đại tông. Tăng luyện khí và linh thạch nhận được.' },
  { id: 'huyet_ma', name: 'Huyết Ma Tông', icon: '🩸', align: 'ma', bonus: { cult: 6, lifesteal: 1 },
    tech: 'huyet_ma_dai_phap', skill: 'huyet_ma_thon_phe',
    desc: 'Ma đạo cự phách, tu luyện thần tốc nhưng bị chính đạo căm ghét.' },
];
D.sectById = {};
D.sects.forEach((s) => { D.sectById[s.id] = s; });
D.sectRanks = [
  { name: 'Ngoại Môn Đệ Tử', total: 0, gs: 3, salary: 20 },
  { name: 'Nội Môn Đệ Tử', total: 150, gs: 6, salary: 40 },
  { name: 'Chân Truyền Đệ Tử', total: 800, gs: 10, salary: 70 },
  { name: 'Hộ Pháp', total: 3000, gs: 14, salary: 110 },
  { name: 'Trưởng Lão', total: 10000, gs: 18, salary: 160 },
  { name: 'Thái Thượng Trưởng Lão', total: 35000, gs: 26, salary: 230 },
  { name: 'Chưởng Môn', total: 120000, gs: 34, salary: 320 },
];
D.SECT_JOIN_GS = 3;
D.SPAR_DAILY = 5;
/* Tàng Bảo Các tông môn: cost = cống hiến, rank = cấp bậc tối thiểu */
D.sectShop = [
  { item: 'hoi_khi_dan', cost: 5, rank: 0 },
  { item: 'tu_khi_dan', cost: 15, rank: 0 },
  { item: 'truc_co_dan', cost: 80, rank: 0 },
  { item: 'boi_nguyen_dan', cost: 30, rank: 1 },
  { item: 'bi_canh_lenh', cost: 60, rank: 1 },
  { item: 'ket_kim_dan', cost: 250, rank: 2 },
  { item: 'trung_yeu_thu', cost: 300, rank: 2 },
  { item: '@tech', cost: 600, rank: 2 },
  { item: 'tho_nguyen_dan', cost: 200, rank: 3 },
  { item: 'ti_loi_phu', cost: 400, rank: 3 },
  { item: 'hoa_anh_dan', cost: 700, rank: 3 },
  { item: '@skill', cost: 1200, rank: 3 },
  { item: 'hoa_than_dan', cost: 1800, rank: 4 },
  { item: 'trung_than_thu', cost: 2500, rank: 4 },
  { item: 'luyen_hu_dan', cost: 4000, rank: 4 },
  { item: 'hop_the_dan', cost: 9000, rank: 5 },
  { item: 'tay_linh_dich', cost: 8000, rank: 5 },
  { item: 'dai_thua_dan', cost: 20000, rank: 5 },
  { item: 'do_kiep_dan', cost: 45000, rank: 6 },
  { item: 'phi_thang_dan', cost: 90000, rank: 6 },
];

/* ---------- Linh thú ---------- */
D.pets = [
  { id: 'hoa_ho', name: 'Tiểu Hỏa Hồ', icon: '🦊', el: 'hoa', rarity: 1, passive: { atkPct: 0.15 } },
  { id: 'thanh_xa', name: 'Thanh Lân Xà', icon: '🐍', el: 'moc', rarity: 1, passive: { hpPct: 0.2 } },
  { id: 'linh_tho', name: 'Ngọc Linh Thố', icon: '🐇', el: 'none', rarity: 1, passive: { drop: 0.25 } },
  { id: 'thiet_quy', name: 'Thiết Bối Quy', icon: '🐢', el: 'tho', rarity: 1, passive: { defPct: 0.2 } },
  { id: 'kim_dieu', name: 'Kim Sí Điêu', icon: '🦅', el: 'kim', rarity: 2, passive: { crit: 0.08 } },
  { id: 'bang_diep', name: 'Băng Tinh Điệp', icon: '🦋', el: 'bang', rarity: 2, passive: { mpPct: 0.3 } },
  { id: 'loi_ho', name: 'Lôi Văn Hổ', icon: '🐯', el: 'loi', rarity: 2, passive: { atkPct: 0.22 } },
  { id: 'huyen_vu', name: 'Huyền Vũ Ấu Thú', icon: '🐢', el: 'thuy', rarity: 3, passive: { defPct: 0.25, hpPct: 0.2 } },
  { id: 'xich_su', name: 'Xích Diễm Sư', icon: '🦁', el: 'hoa', rarity: 3, passive: { atkPct: 0.3 } },
  { id: 'cuu_vi_ho', name: 'Cửu Vĩ Thiên Hồ', icon: '🦊', el: 'none', rarity: 4, passive: { cult: 0.3, insight: 0.2 } },
  { id: 'au_long', name: 'Thanh Long Ấu Tể', icon: '🐉', el: 'moc', rarity: 4, passive: { atkPct: 0.3, hpPct: 0.3 } },
  { id: 'chu_tuoc', name: 'Chu Tước', icon: '🦚', el: 'hoa', rarity: 5, passive: { atkPct: 0.45, critDmg: 0.6 } },
  { id: 'ky_lan', name: 'Hỗn Độn Kỳ Lân', icon: '🦄', el: 'none', rarity: 5, passive: { allPct: 0.25, cult: 0.25 } },
];
D.petById = {};
D.pets.forEach((p) => { D.petById[p.id] = p; });
D.PET_MAX = 12;
D.PET_EGG_SLOTS = 2;
D.petRarityMult = [0, 0.3, 0.38, 0.48, 0.6, 0.75];
D.petExpReq = function (lv) { return Math.floor(40 * Math.pow(1.3, lv)); };
D.coreExp = function (t) { return Math.floor(50 * Math.pow(2.6, t)); };

/* ---------- Nhiệm vụ chính tuyến ---------- */
/* t: gs | stat (tăng so với lúc nhận) | sect | cave | pets | tower | techLv | skillEq */
D.mainQuests = [
  { name: 'Dẫn Khí Nhập Thể', desc: 'Tu luyện đủ tu vi rồi đột phá để bước vào Luyện Khí kỳ.', t: 'gs', v: 1, hint: 'Tu vi tự tăng theo thời gian. Mở trang Tu Luyện và bấm Đột Phá khi thanh tu vi đầy.', reward: { stones: 100, items: { hoi_khi_dan: 3 } } },
  { name: 'Học Thần Thông', desc: 'Dùng bí tịch thần thông trong hành trang rồi trang bị nó.', t: 'skillEq', v: 1, hint: 'Hành Trang → Bí tịch → Dùng. Sau đó vào Công Pháp để trang bị.', reward: { insight: 30, stones: 50 } },
  { name: 'Sơ Thí Phong Mang', desc: 'Đánh bại 3 yêu thú ở Thanh Vân Sơn Mạch.', t: 'stat', k: 'kills', v: 3, hint: 'Vào Thám Hiểm và bấm Thám hiểm.', reward: { stones: 80, items: { tu_khi_dan: 1 } } },
  { name: 'Hái Thuốc Trên Núi', desc: 'Thu thập 5 linh dược.', t: 'stat', k: 'herbs', v: 5, hint: 'Linh dược có thể nhặt được khi thám hiểm.', reward: { stones: 100 } },
  { name: 'Khai Lò Luyện Đan', desc: 'Luyện thành công 1 lò đan dược.', t: 'stat', k: 'pillsMade', v: 1, hint: 'Luyện Đan → chọn Hồi Khí Đan.', reward: { items: { linh_chi: 4, ngung_huyet: 4 } } },
  { name: 'Luyện Khí Tầng Ba', desc: 'Đạt Luyện Khí tầng 3.', t: 'gs', v: 3, reward: { stones: 200, items: { book_t_truong_xuan_cong: 1 } } },
  { name: 'Bái Nhập Tông Môn', desc: 'Gia nhập một tông môn.', t: 'sect', v: 1, hint: 'Mở trang Tông Môn.', reward: { stones: 200 } },
  { name: 'Hoàn Thành Sư Mệnh', desc: 'Hoàn thành 2 nhiệm vụ tông môn.', t: 'stat', k: 'sectMissions', v: 2, reward: { contrib: 50 } },
  { name: 'Rèn Binh Khí', desc: 'Luyện chế 1 món trang bị.', t: 'stat', k: 'forged', v: 1, hint: 'Luyện Khí → chọn vị trí và phẩm cấp.', reward: { items: { hac_thiet: 6 } } },
  { name: 'Khai Phá Động Phủ', desc: 'Nâng động phủ lên cấp 2.', t: 'cave', v: 2, reward: { stones: 300 } },
  { name: 'Trảm Yêu Vương', desc: 'Đánh bại 1 thủ lĩnh yêu thú.', t: 'stat', k: 'bossKills', v: 1, hint: 'Thám Hiểm → Khiêu chiến thủ lĩnh.', reward: { stones: 400, items: { trung_linh_thu: 1 } } },
  { name: 'Leo Thông Thiên Tháp', desc: 'Vượt qua tầng 5 Thông Thiên Tháp.', t: 'tower', v: 5, reward: { stones: 300 } },
  { name: 'Linh Thú Đồng Hành', desc: 'Ấp nở 1 linh thú.', t: 'pets', v: 1, hint: 'Linh Thú → đặt trứng vào ổ ấp.', reward: { items: { yeu_dan_1: 5 } } },
  { name: 'Luyện Khí Đại Viên Mãn', desc: 'Đạt Luyện Khí tầng 9.', t: 'gs', v: 9, reward: { items: { truc_co_dan: 1 } } },
  { name: 'Trúc Cơ Thành Công', desc: 'Đột phá Trúc Cơ kỳ.', t: 'gs', v: 10, reward: { stones: 1500, items: { book_s_ngu_kiem: 1 } } },
  { name: 'Thất Huyền Bí Cảnh', desc: 'Chinh phục 1 bí cảnh.', t: 'stat', k: 'dungeons', v: 1, reward: { stones: 1000, items: { bi_canh_lenh: 1 } } },
  { name: 'Cường Hóa Trang Bị', desc: 'Cường hóa trang bị 5 lần.', t: 'stat', k: 'enhances', v: 5, reward: { items: { tinh_cuong: 6 } } },
  { name: 'Ngộ Đạo Công Pháp', desc: 'Nâng công pháp chủ tu lên tầng 3.', t: 'techLv', v: 3, reward: { insight: 200 } },
  { name: 'Bế Quan Khổ Tu', desc: 'Bế quan tổng cộng 10 năm.', t: 'stat', k: 'beQuanYears', v: 10, reward: { items: { boi_nguyen_dan: 2 } } },
  { name: 'Kết Thành Kim Đan', desc: 'Đột phá Kết Đan kỳ.', t: 'gs', v: 14, reward: { stones: 8000, items: { ti_loi_phu: 1, trung_yeu_thu: 1 } } },
  { name: 'Thông Thiên Tầng 20', desc: 'Vượt qua tầng 20 Thông Thiên Tháp.', t: 'tower', v: 20, reward: { stones: 6000 } },
  { name: 'Nguyên Anh Lão Quái', desc: 'Vượt Tam Cửu Lôi Kiếp, đột phá Nguyên Anh.', t: 'gs', v: 18, reward: { stones: 40000, items: { ngo_dao_dan: 2 } } },
  { name: 'Hóa Thần Chân Quân', desc: 'Đột phá Hóa Thần kỳ.', t: 'gs', v: 22, reward: { stones: 2e5, items: { trung_than_thu: 1 } } },
  { name: 'Thông Thiên Tầng 50', desc: 'Vượt qua tầng 50 Thông Thiên Tháp.', t: 'tower', v: 50, reward: { stones: 5e5 } },
  { name: 'Luyện Hư Hợp Đạo', desc: 'Đột phá Luyện Hư kỳ.', t: 'gs', v: 26, reward: { stones: 1e6 } },
  { name: 'Hợp Thể Đại Năng', desc: 'Đột phá Hợp Thể kỳ.', t: 'gs', v: 30, reward: { stones: 3e6 } },
  { name: 'Đại Thừa Tôn Giả', desc: 'Đột phá Đại Thừa kỳ.', t: 'gs', v: 34, reward: { stones: 1e7, items: { trung_tien_thu: 1 } } },
  { name: 'Độ Kiếp Thiên Tôn', desc: 'Đột phá Độ Kiếp kỳ.', t: 'gs', v: 38, reward: { stones: 3e7 } },
  { name: 'Phi Thăng Tiên Giới', desc: 'Vượt Cửu Cửu Thiên Kiếp, phi thăng thành Chân Tiên.', t: 'gs', v: 42, reward: { stones: 1e8 } },
  { name: 'Chân Tiên Đại Viên Mãn', desc: 'Đạt Chân Tiên Đại Viên Mãn — đỉnh cao tiên đồ.', t: 'gs', v: 45, reward: { stones: 5e8 } },
];

/* ---------- Nhiệm vụ hằng ngày ---------- */
D.dailyPool = [
  { k: 'kills', v: 30, name: 'Đánh bại 30 yêu thú' },
  { k: 'explores', v: 40, name: 'Thám hiểm 40 lần' },
  { k: 'pillsMade', v: 3, name: 'Luyện đan 3 lần' },
  { k: 'forged', v: 1, name: 'Luyện khí 1 lần' },
  { k: 'towerClears', v: 1, name: 'Vượt 1 tầng Thông Thiên Tháp' },
  { k: 'dungeons', v: 1, name: 'Chinh phục 1 bí cảnh' },
  { k: 'sectMissions', v: 2, name: 'Hoàn thành 2 nhiệm vụ tông môn' },
  { k: 'harvests', v: 2, name: 'Thu hoạch dược viên 2 lần' },
  { k: 'petFeeds', v: 3, name: 'Cho linh thú ăn 3 lần' },
  { k: 'bossKills', v: 1, name: 'Đánh bại 1 thủ lĩnh' },
  { k: 'events', v: 2, name: 'Gặp 2 kỳ ngộ' },
  { k: 'enhances', v: 2, name: 'Cường hóa 2 lần' },
];
D.DAILY_COUNT = 5;
D.dailyChests = [40, 60, 100];
D.loginRewards = [
  { stones: 300, label: '300 linh thạch ×cảnh giới' },
  { items: { hoi_khi_dan: 5, hoi_linh_dan: 5 }, label: '5 Hồi Khí Đan, 5 Hồi Linh Đan' },
  { insight: 100, label: '100 ngộ đạo ×cảnh giới' },
  { items: { trung_linh_thu: 1 }, label: '1 Linh Thú Trứng' },
  { stones: 800, label: '800 linh thạch ×cảnh giới' },
  { items: { boi_nguyen_dan: 2, bi_canh_lenh: 1 }, label: '2 Bồi Nguyên Đan, 1 Bí Cảnh Lệnh' },
  { gear: 3, label: '1 trang bị Địa phẩm' },
];

/* ---------- Thành tựu ---------- */
/* c: điều kiện (stat >= v | realm >= v | ...), b: bonus vĩnh viễn */
D.achievements = [
  { id: 'kill_10', name: 'Sơ Thí Phong Mang', desc: 'Đánh bại 10 yêu thú', c: ['stat', 'kills', 10], b: { atkPct: 1 } },
  { id: 'kill_100', name: 'Bách Chiến Tu Sĩ', desc: 'Đánh bại 100 yêu thú', c: ['stat', 'kills', 100], b: { atkPct: 2 } },
  { id: 'kill_1000', name: 'Thiên Nhân Trảm', desc: 'Đánh bại 1.000 yêu thú', c: ['stat', 'kills', 1000], b: { atkPct: 3 } },
  { id: 'kill_10000', name: 'Sát Thần', desc: 'Đánh bại 10.000 yêu thú', c: ['stat', 'kills', 10000], b: { atkPct: 5 } },
  { id: 'boss_1', name: 'Trảm Yêu Vương', desc: 'Đánh bại 1 thủ lĩnh', c: ['stat', 'bossKills', 1], b: { hpPct: 2 } },
  { id: 'boss_25', name: 'Khắc Tinh Yêu Vương', desc: 'Đánh bại 25 thủ lĩnh', c: ['stat', 'bossKills', 25], b: { hpPct: 3 } },
  { id: 'boss_100', name: 'Vạn Yêu Chi Chủ', desc: 'Đánh bại 100 thủ lĩnh', c: ['stat', 'bossKills', 100], b: { hpPct: 5 } },
  { id: 'realm_2', name: 'Trúc Cơ Đạo Thành', desc: 'Đạt Trúc Cơ kỳ', c: ['realm', 2], b: { cult: 3 } },
  { id: 'realm_3', name: 'Kim Đan Đại Đạo', desc: 'Đạt Kết Đan kỳ', c: ['realm', 3], b: { cult: 3 } },
  { id: 'realm_4', name: 'Nguyên Anh Lão Quái', desc: 'Đạt Nguyên Anh kỳ', c: ['realm', 4], b: { cult: 4 } },
  { id: 'realm_5', name: 'Hóa Thần Chân Quân', desc: 'Đạt Hóa Thần kỳ', c: ['realm', 5], b: { cult: 4 } },
  { id: 'realm_6', name: 'Luyện Hư Đại Năng', desc: 'Đạt Luyện Hư kỳ', c: ['realm', 6], b: { cult: 5 } },
  { id: 'realm_7', name: 'Hợp Thể Tôn Giả', desc: 'Đạt Hợp Thể kỳ', c: ['realm', 7], b: { cult: 5 } },
  { id: 'realm_8', name: 'Đại Thừa Thánh Nhân', desc: 'Đạt Đại Thừa kỳ', c: ['realm', 8], b: { cult: 5 } },
  { id: 'realm_9', name: 'Độ Kiếp Thiên Tôn', desc: 'Đạt Độ Kiếp kỳ', c: ['realm', 9], b: { cult: 6 } },
  { id: 'realm_10', name: 'Phi Thăng Thành Tiên', desc: 'Phi thăng Chân Tiên', c: ['realm', 10], b: { cult: 10, allPct: 5 } },
  { id: 'alch_10', name: 'Sơ Nhập Đan Đạo', desc: 'Luyện đan thành công 10 lần', c: ['stat', 'pillsMade', 10], b: { alch: 2 } },
  { id: 'alch_200', name: 'Đan Đạo Tông Sư', desc: 'Luyện đan thành công 200 lần', c: ['stat', 'pillsMade', 200], b: { alch: 3 } },
  { id: 'alch_lv', name: 'Đan Thánh', desc: 'Luyện đan đạt cấp 20', c: ['alchLv', 20], b: { alch: 5, hpPct: 3 } },
  { id: 'forge_10', name: 'Tiểu Thành Luyện Khí', desc: 'Luyện chế 10 trang bị', c: ['stat', 'forged', 10], b: { forge: 2 } },
  { id: 'forge_100', name: 'Luyện Khí Tông Sư', desc: 'Luyện chế 100 trang bị', c: ['stat', 'forged', 100], b: { forge: 4 } },
  { id: 'enh_10', name: 'Thần Binh Sơ Thành', desc: 'Cường hóa một trang bị lên +10', c: ['enh', 10], b: { atkPct: 2 } },
  { id: 'enh_15', name: 'Thần Binh Đại Thành', desc: 'Cường hóa một trang bị lên +15', c: ['enh', 15], b: { atkPct: 4 } },
  { id: 'tower_10', name: 'Đăng Tháp', desc: 'Vượt tầng 10 Thông Thiên Tháp', c: ['tower', 10], b: { defPct: 2 } },
  { id: 'tower_40', name: 'Vọng Thiên', desc: 'Vượt tầng 40 Thông Thiên Tháp', c: ['tower', 40], b: { defPct: 3 } },
  { id: 'tower_90', name: 'Thông Thiên', desc: 'Vượt tầng 90 Thông Thiên Tháp', c: ['tower', 90], b: { defPct: 5, allPct: 2 } },
  { id: 'dungeon_1', name: 'Thám Hiểm Bí Cảnh', desc: 'Chinh phục 1 bí cảnh', c: ['stat', 'dungeons', 1], b: { drop: 3 } },
  { id: 'dungeon_30', name: 'Bí Cảnh Chi Chủ', desc: 'Chinh phục 30 bí cảnh', c: ['stat', 'dungeons', 30], b: { drop: 6 } },
  { id: 'pet_1', name: 'Ngự Thú Sư', desc: 'Sở hữu 1 linh thú', c: ['pets', 1], b: { hpPct: 1 } },
  { id: 'pet_r5', name: 'Thần Thú Chi Chủ', desc: 'Sở hữu linh thú 5 sao', c: ['petRarity', 5], b: { allPct: 3 } },
  { id: 'sect_join', name: 'Có Chốn Nương Thân', desc: 'Gia nhập tông môn', c: ['sect', 0], b: { defPct: 1 } },
  { id: 'sect_elder', name: 'Trưởng Lão Tông Môn', desc: 'Đạt cấp bậc Trưởng Lão', c: ['sect', 4], b: { allPct: 2 } },
  { id: 'stones_1m', name: 'Phú Giáp Nhất Phương', desc: 'Tích lũy kiếm được 1 triệu linh thạch', c: ['stat', 'stonesEarned', 1e6], b: { stonePct: 5 } },
  { id: 'stones_1b', name: 'Phú Khả Địch Quốc', desc: 'Tích lũy kiếm được 1 tỷ linh thạch', c: ['stat', 'stonesEarned', 1e9], b: { stonePct: 10 } },
  { id: 'event_10', name: 'Cơ Duyên Thâm Hậu', desc: 'Gặp 10 kỳ ngộ', c: ['stat', 'events', 10], b: { drop: 2 } },
  { id: 'event_100', name: 'Thiên Mệnh Chi Tử', desc: 'Gặp 100 kỳ ngộ', c: ['stat', 'events', 100], b: { drop: 5, cult: 3 } },
  { id: 'explore_1000', name: 'Vân Du Tứ Hải', desc: 'Thám hiểm 1.000 lần', c: ['stat', 'explores', 1000], b: { spd: 2 } },
  { id: 'trib_1', name: 'Độ Kiếp Thành Công', desc: 'Vượt qua 1 lần thiên kiếp', c: ['stat', 'tribs', 1], b: { hpPct: 2 } },
  { id: 'trib_7', name: 'Lôi Kiếp Bất Diệt', desc: 'Vượt qua 7 lần thiên kiếp', c: ['stat', 'tribs', 7], b: { hpPct: 5, defPct: 3 } },
  { id: 'reinc_1', name: 'Luân Hồi Chuyển Thế', desc: 'Luân hồi 1 lần', c: ['reinc', 1], b: { cult: 5 } },
  { id: 'reinc_5', name: 'Vạn Thế Luân Hồi', desc: 'Luân hồi 5 lần', c: ['reinc', 5], b: { cult: 10 } },
  { id: 'karma_good', name: 'Đại Thiện Nhân', desc: 'Thiện duyên đạt 100', c: ['karma', 100], b: { insight: 5 } },
  { id: 'karma_bad', name: 'Ma Đầu Khét Tiếng', desc: 'Thiện duyên xuống -100', c: ['karma', -100], b: { atkPct: 3 } },
  { id: 'root_good', name: 'Thiên Kiêu Chi Tư', desc: 'Sở hữu Thiên Linh Căn trở lên', c: ['root', 4], b: { cult: 3 } },
  { id: 'tech_max', name: 'Công Pháp Đại Thành', desc: 'Nâng một công pháp lên tầng 10', c: ['techLv', 10], b: { cult: 5 } },
  { id: 'bequan_100', name: 'Khổ Tu Trăm Năm', desc: 'Bế quan tổng cộng 100 năm', c: ['stat', 'beQuanYears', 100], b: { insight: 5 } },
];

/* ---------- Luân hồi thiên phú ---------- */
D.reincTalents = [
  { id: 'tien_duyen', name: 'Tiên Duyên', max: 15, per: 8, key: 'cult', desc: 'Tốc độ tu luyện +8%/cấp' },
  { id: 'kiep_hau', name: 'Kiếp Hậu Dư Sinh', max: 15, per: 4, key: 'allPct', desc: 'Toàn chỉ số +4%/cấp' },
  { id: 'thien_phu', name: 'Thiên Phú Dị Bẩm', max: 5, per: 1, desc: 'Mọi thuộc tính khởi đầu +1/cấp' },
  { id: 'linh_can', name: 'Linh Căn Chuyển Thế', max: 5, per: 1, desc: 'Tăng cơ hội linh căn tốt, +1 lượt trắc linh căn/cấp' },
  { id: 'truong_sinh', name: 'Trường Sinh', max: 10, per: 10, key: 'life', desc: 'Thọ nguyên +10%/cấp' },
  { id: 'phuc_duyen', name: 'Phúc Duyên', max: 10, per: 6, key: 'drop', desc: 'Tỉ lệ rơi đồ +6%/cấp' },
  { id: 'tuc_tue', name: 'Túc Tuệ', max: 10, per: 15, key: 'insight', desc: 'Ngộ đạo +15%/cấp' },
  { id: 'gia_tai', name: 'Gia Tài Kiếp Trước', max: 10, per: 500, desc: 'Khởi đầu thêm 500 linh thạch/cấp' },
  { id: 'nghe_cu', name: 'Tiền Kiếp Nghề Cũ', max: 5, per: 1, desc: 'Luyện đan & luyện khí khởi đầu +1 cấp/cấp' },
  { id: 'be_quan', name: 'Bế Quan Tâm Pháp', max: 6, per: 2, desc: 'Giới hạn tu luyện ngoại tuyến +2 giờ/cấp' },
  { id: 'bi_canh', name: 'Bí Cảnh Thông Hành', max: 2, per: 1, desc: 'Thêm 1 lượt bí cảnh mỗi ngày/cấp' },
];
D.reincCost = function (lv) { return lv + 1; };
D.OFFLINE_BASE_H = 12;
D.YEAR_SECONDS = 900; /* 15 phút thực = 1 năm tuổi */

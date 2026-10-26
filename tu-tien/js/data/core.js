'use strict';
/* Dữ liệu cốt lõi: ngũ hành, linh căn, thuộc tính, xuất thân, cảnh giới, phẩm chất */

const D = {};

D.GAME_NAME = 'Vấn Đạo Tiên Đồ';
D.VERSION = '1.0.0';

D.elements = {
  kim:   { name: 'Kim',   color: '#e6cf86' },
  moc:   { name: 'Mộc',   color: '#7fca7c' },
  thuy:  { name: 'Thủy',  color: '#6fb5ea' },
  hoa:   { name: 'Hỏa',   color: '#ef7d52' },
  tho:   { name: 'Thổ',   color: '#c99f68' },
  loi:   { name: 'Lôi',   color: '#b997ff', variant: true },
  bang:  { name: 'Băng',  color: '#a9e8f2', variant: true },
  phong: { name: 'Phong', color: '#9fe3bb', variant: true },
  none:  { name: 'Vô',    color: '#b8b2a2' },
};
D.baseElements = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
D.variantElements = ['loi', 'bang', 'phong'];
/* X khắc counters[X] (tương khắc ngũ hành) */
D.counters = { kim: 'moc', moc: 'tho', tho: 'thuy', thuy: 'hoa', hoa: 'kim' };

D.rootTypes = [
  { id: 'ngu',    name: 'Ngũ Linh Căn',     count: 5, mult: 0.8,  w: 30,  grade: 0, desc: 'Tạp linh căn, linh khí hỗn tạp, tu luyện gian nan.' },
  { id: 'tu',     name: 'Tứ Linh Căn',      count: 4, mult: 1.0,  w: 28,  grade: 1, desc: 'Tư chất bình thường, phần lớn tán tu đều như vậy.' },
  { id: 'tam',    name: 'Tam Linh Căn',     count: 3, mult: 1.25, w: 22,  grade: 2, desc: 'Tư chất khá, đủ để các tông môn nhỏ thu nhận.' },
  { id: 'song',   name: 'Song Linh Căn',    count: 2, mult: 1.6,  w: 12,  grade: 3, desc: 'Thiên phú xuất chúng, đại tông môn tranh nhau chiêu mộ.' },
  { id: 'thien',  name: 'Thiên Linh Căn',   count: 1, mult: 2.2,  w: 5,   grade: 4, desc: 'Ngàn năm khó gặp, tu luyện thần tốc.' },
  { id: 'bien',   name: 'Biến Dị Linh Căn', count: 1, mult: 2.5,  w: 2.5, grade: 5, variant: true, desc: 'Linh căn dị chủng Lôi/Băng/Phong, uy lực kinh người.' },
  { id: 'hondon', name: 'Hỗn Độn Linh Căn', count: 0, mult: 3.4,  w: 0.5, grade: 6, all: true, desc: 'Truyền thuyết khai thiên, vạn pháp đều thông.' },
];

D.attrs = {
  ngoTinh:  { name: 'Ngộ Tính',  desc: 'Tăng tốc độ tu luyện (+4%/điểm) và ngộ đạo (+10%/điểm).' },
  canCot:   { name: 'Căn Cốt',   desc: 'Tăng sinh lực (+5%/điểm) và phòng ngự (+3%/điểm).' },
  khiVan:   { name: 'Khí Vận',   desc: 'Tăng tỉ lệ rơi đồ (+3%/điểm), đột phá (+1%/điểm) và kỳ ngộ tốt.' },
  thanThuc: { name: 'Thần Thức', desc: 'Tăng linh lực (+6%/điểm), công kích (+3%/điểm) và bạo kích.' },
};

D.backgrounds = [
  { id: 'tho_san',  name: 'Con nhà thợ săn',        desc: 'Lớn lên giữa rừng sâu, thân thể cường tráng.', attrs: { canCot: 2 }, items: { hoi_khi_dan: 5 } },
  { id: 'thu_huong', name: 'Thư hương thế gia',      desc: 'Đọc vạn quyển sách, tâm tư linh mẫn.', attrs: { ngoTinh: 2, thanThuc: 1 }, insight: 50 },
  { id: 'thuong_nhan', name: 'Con nhà thương nhân',  desc: 'Mang theo gia tài, mua bán được giá.', attrs: {}, stones: 600, shopDiscount: 0.1 },
  { id: 'co_nhi',   name: 'Cô nhi lưu lạc',          desc: 'Mệnh khổ nhưng phúc duyên sâu dày.', attrs: { khiVan: 3 } },
  { id: 'gia_toc',  name: 'Hậu duệ tu tiên gia tộc', desc: 'Gia tộc sa sút, chỉ còn chút di sản.', attrs: { thanThuc: 1, ngoTinh: 1 }, items: { tu_khi_dan: 3 }, gear: { slot: 'weapon', tier: 1, quality: 1 } },
];

D.stageNames4 = ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ', 'Đại Viên Mãn'];

/*
 * Cảnh giới. type: auto (luôn thành công) / chance (theo tỉ lệ) / trib (độ thiên kiếp)
 * baseReq*grow^stage = tu vi cần cho mỗi tiểu cảnh giới. rate = tu vi/giây cơ bản. mult = hệ số chỉ số.
 */
D.realms = [
  { id: 'pham',      name: 'Phàm Nhân',  stages: 1, baseReq: 30,      grow: 1,    rate: 1,     mult: 1,     life: 80,    type: 'auto',   color: '#a7a397' },
  { id: 'luyen_khi', name: 'Luyện Khí',  stages: 9, baseReq: 400,     grow: 1.28, rate: 2,     mult: 1.6,   life: 120,   type: 'auto',   color: '#8fd3b6' },
  { id: 'truc_co',   name: 'Trúc Cơ',    stages: 4, baseReq: 16000,   grow: 1.45, rate: 8,     mult: 5,     life: 250,   type: 'chance', chance: 0.6,  pill: 'truc_co_dan', color: '#7ec8e3' },
  { id: 'ket_dan',   name: 'Kết Đan',    stages: 4, baseReq: 1.2e5,   grow: 1.45, rate: 30,    mult: 14,    life: 500,   type: 'chance', chance: 0.5,  pill: 'ket_kim_dan', color: '#f2c94c' },
  { id: 'nguyen_anh', name: 'Nguyên Anh', stages: 4, baseReq: 1.1e6,  grow: 1.45, rate: 120,   mult: 40,    life: 1000,  type: 'trib', strikes: 3, pill: 'hoa_anh_dan', color: '#b38cf0' },
  { id: 'hoa_than',  name: 'Hóa Thần',   stages: 4, baseReq: 9.6e6,   grow: 1.45, rate: 500,   mult: 110,   life: 2000,  type: 'trib', strikes: 4, pill: 'hoa_than_dan', color: '#f08ca8' },
  { id: 'luyen_hu',  name: 'Luyện Hư',   stages: 4, baseReq: 7.7e7,   grow: 1.45, rate: 2000,  mult: 300,   life: 4000,  type: 'trib', strikes: 5, pill: 'luyen_hu_dan', color: '#6be0d8' },
  { id: 'hop_the',   name: 'Hợp Thể',    stages: 4, baseReq: 5.3e8,   grow: 1.45, rate: 8000,  mult: 800,   life: 8000,  type: 'trib', strikes: 6, pill: 'hop_the_dan', color: '#ff9f5a' },
  { id: 'dai_thua',  name: 'Đại Thừa',   stages: 4, baseReq: 3.5e9,   grow: 1.45, rate: 3e4,   mult: 2200,  life: 15000, type: 'trib', strikes: 7, pill: 'dai_thua_dan', color: '#ffe08a' },
  { id: 'do_kiep',   name: 'Độ Kiếp',    stages: 4, baseReq: 3.4e10,  grow: 1.45, rate: 1.2e5, mult: 6000,  life: 30000, type: 'trib', strikes: 8, pill: 'do_kiep_dan', color: '#c7a6ff' },
  { id: 'chan_tien', name: 'Chân Tiên',  stages: 4, baseReq: 2.5e11,  grow: 1.45, rate: 5e5,   mult: 16000, life: 1e6,   type: 'trib', strikes: 9, pill: 'phi_thang_dan', color: '#fff6dc' },
];

/* Chỉ số tổng (global stage) — bắt đầu của từng cảnh giới */
D.realmStart = [];
(function () {
  let acc = 0;
  for (const r of D.realms) { D.realmStart.push(acc); acc += r.stages; }
  D.MAX_GS = acc - 1;
})();

D.gsToRS = function (gs) {
  gs = Math.max(0, Math.min(D.MAX_GS, Math.floor(gs)));
  for (let r = D.realms.length - 1; r >= 0; r--) {
    if (gs >= D.realmStart[r]) return { r, s: gs - D.realmStart[r] };
  }
  return { r: 0, s: 0 };
};
D.rsToGs = function (r, s) { return D.realmStart[r] + s; };

/* Hệ số chỉ số theo cảnh giới tổng, dùng chung cho người chơi, yêu thú, linh thú */
D.statScale = function (gs) {
  if (gs > D.MAX_GS) return D.statScale(D.MAX_GS) * Math.pow(1.12, gs - D.MAX_GS);
  const { r, s } = D.gsToRS(gs);
  return D.realms[r].mult * (1 + 0.15 * s);
};
/* Hệ số cho trang bị/vật phẩm theo phẩm cấp (tier 1..10 tương ứng cảnh giới) */
D.tierScale = function (t) { return D.realms[Math.max(1, Math.min(10, t))].mult * 1.2; };
D.tierPrice = function (t) { return D.realms[Math.max(1, Math.min(10, t))].mult / 1.6; };

D.stageName = function (r, s) {
  const realm = D.realms[r];
  if (realm.stages === 1) return realm.name;
  if (realm.stages === 9) return realm.name + ' Tầng ' + (s + 1);
  return realm.name + ' ' + D.stageNames4[s];
};
D.gsName = function (gs) { const { r, s } = D.gsToRS(gs); return D.stageName(r, s); };

D.qualities = [
  { name: 'Phàm phẩm', short: 'Phàm', color: '#bdb6a5', mult: 1,    affixes: 0, w: 52 },
  { name: 'Linh phẩm', short: 'Linh', color: '#7fcf90', mult: 1.2,  affixes: 1, w: 28 },
  { name: 'Huyền phẩm', short: 'Huyền', color: '#6eaeef', mult: 1.45, affixes: 2, w: 13 },
  { name: 'Địa phẩm',  short: 'Địa',  color: '#bd92f3', mult: 1.75, affixes: 3, w: 5 },
  { name: 'Thiên phẩm', short: 'Thiên', color: '#f2aa50', mult: 2.1,  affixes: 4, w: 1.2 },
  { name: 'Tiên phẩm', short: 'Tiên', color: '#f2665e', mult: 2.5,  affixes: 5, w: 0.25 },
];

/*
 * Chỉ số "người chơi điển hình" ở mỗi cảnh giới (trang bị cùng giai, phẩm chất trung bình, cường hóa vừa phải).
 * Yêu thú và thiên kiếp được hiệu chỉnh theo mốc này, nên người chơi đầu tư nhiều sẽ thấy dễ hơn.
 */
D._expCache = {};
D.expected = function (gs) {
  gs = Math.max(0, Math.min(D.MAX_GS, Math.floor(gs)));
  if (D._expCache[gs]) return D._expCache[gs];
  const { r, s: st } = D.gsToRS(gs);
  const s = D.statScale(gs);
  const stages = D.realms[r].stages;
  let ts;
  if (r <= 1) ts = D.tierScale(1);
  else {
    const f = stages > 1 ? st / (stages - 1) : 1;
    ts = Math.pow(D.tierScale(r - 1), 1 - f) * Math.pow(D.tierScale(r), f);
  }
  const qi = r <= 1 ? 0 : r <= 3 ? 1 : r <= 6 ? 2 : 3;
  const g = ts * D.qualities[qi].mult * (1 + 0.07 * Math.min(10, 2 * r)) * Math.min(1, 0.4 + 0.15 * gs);
  const pct = 1 + 0.1 * r;
  const E = {
    atk: (12 * s * 1.18 + 10.5 * g) * pct,
    def: (5 * s * 1.18 + 6.5 * g) * pct,
    hp: (100 * s * 1.3 + 105 * g) * pct,
  };
  return (D._expCache[gs] = E);
};

/* Nhãn cho các loại bonus (đơn vị %, trừ khi ghi chú) */
D.bonusLabels = {
  hp: 'Sinh lực', mp: 'Linh lực', atk: 'Công kích', def: 'Phòng ngự', spd: 'Tốc độ',
  hpPct: 'Sinh lực %', mpPct: 'Linh lực %', atkPct: 'Công kích %', defPct: 'Phòng ngự %', spdPct: 'Tốc độ %',
  crit: 'Bạo kích %', critDmg: 'Bạo thương %', dodge: 'Né tránh %', lifesteal: 'Hút máu %',
  cult: 'Tốc độ tu luyện %', insight: 'Ngộ đạo %', drop: 'Tỉ lệ rơi đồ %', alch: 'Luyện đan %',
  forge: 'Luyện khí %', stonePct: 'Linh thạch nhận %', allPct: 'Toàn chỉ số %', life: 'Thọ nguyên %',
};
D.flatKeys = { hp: 1, mp: 1, atk: 1, def: 1, spd: 1 };
D.fmtBonus = function (k, v) {
  const lbl = D.bonusLabels[k] || k;
  const val = D.flatKeys[k] ? U.fmt(v) : (Math.round(v * 10) / 10);
  return lbl.replace(' %', '') + ' +' + val + (D.flatKeys[k] ? '' : '%');
};

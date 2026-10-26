# Kế hoạch dự án — Vấn Đạo Tiên Đồ

> Đơn vị phát triển (giả định): **Linh Vân Studio** · Thể loại: nhập vai tu tiên nhàn rỗi (idle RPG) · Nền tảng: trình duyệt (PC + điện thoại) · Ngôn ngữ: Tiếng Việt · Phiên bản phát hành: **1.0.0**

## 1. Tầm nhìn sản phẩm

**Một câu:** Hành trình từ phàm nhân đến Chân Tiên — tu luyện cả khi tắt máy, đột phá bình cảnh, độ thiên kiếp, luyện đan luyện khí, bái nhập tông môn, nuôi linh thú, và luân hồi để kiếp sau mạnh hơn kiếp trước.

| Hạng mục | Quyết định |
|---|---|
| Đối tượng | Người chơi Việt yêu thích truyện tu tiên (Phàm Nhân Tu Tiên, Tiên Nghịch…), thích game nhàn rỗi, chơi ngắt quãng 5–30 phút |
| Điểm khác biệt | Cảnh giới chuẩn tu tiên 11 đại cảnh giới / 46 tiểu cảnh giới; thiên kiếp có hoạt cảnh; thọ nguyên + bế quan + luân hồi tạo quyết định chiến lược; chạy ngay trên trình duyệt, không cài đặt, không cần mạng |
| Mô hình | Miễn phí, không quảng cáo, không nạp tiền (không có tiền tệ cao cấp) |
| Ràng buộc kỹ thuật | Một trang HTML tĩnh, JavaScript thuần, không thư viện ngoài, mở trực tiếp bằng `file://` được, lưu trong trình duyệt |

## 2. Đội ngũ (vai trò) & phân công

| Vai trò | Trách nhiệm | Sản phẩm bàn giao |
|---|---|---|
| Producer | Phạm vi, tiến độ, rủi ro, nghiệm thu | Tài liệu này, danh sách phát hành |
| Lead Game Designer | Vòng chơi, cảnh giới, hệ thống | `docs/GDD.md` |
| System / Balance Designer | Công thức, đường cong tu vi, hiệu chỉnh yêu thú | `js/data/*`, `tests/sim.mjs`, `tests/duel.mjs` |
| Gameplay Engineer | Engine chiến đấu, hệ thống, lưu trữ, ngoại tuyến | `js/systems/*`, `js/state.js`, `js/main.js` |
| UI/UX Engineer | Giao diện đáp ứng, hoạt cảnh, âm thanh | `js/ui/*`, `css/style.css` |
| Narrative Writer | Cốt truyện mở đầu, 17 kỳ ngộ, mô tả vật phẩm | Văn bản trong `js/systems/events.js`, `js/data/*` |
| QA Engineer | Kiểm thử khói, kiểm thử luồng, kiểm thử cân bằng | `tests/smoke.mjs`, báo cáo mục 7 |

## 3. Phạm vi tính năng (đã hoàn thành trong 1.0)

**Cốt lõi**
- [x] Tạo nhân vật: đạo hiệu, giới tính, 5 xuất thân, trắc linh căn (7 loại, 8 hệ), 4 thuộc tính bẩm sinh, 5 lượt trắc lại
- [x] Tu luyện nhàn rỗi theo thời gian thực + tu luyện ngoại tuyến (80%, tối đa 12 giờ, nâng được)
- [x] 11 đại cảnh giới / 46 tiểu cảnh giới; tự đột phá tiểu cảnh giới
- [x] Đột phá đại cảnh giới theo tỉ lệ (Trúc Cơ, Kết Đan) với đan dược hỗ trợ, thất bại bị trọng thương
- [x] Thiên kiếp (Nguyên Anh → Chân Tiên, 3–9 đạo lôi) có hoạt cảnh, dùng đan, Tị Lôi Phù
- [x] Thọ nguyên, bế quan (đổi tuổi lấy tu vi), tọa hóa → luân hồi
- [x] Đan độc, trọng thương, buff có thời hạn

**Chiến đấu & thế giới**
- [x] Chiến đấu theo lượt, thanh hành động theo tốc độ, tự động / thủ công, tốc độ 1x/2x/4x
- [x] 39 thần thông + 18 kỹ năng yêu thú; hiệu ứng thiêu đốt, trúng độc, chảy máu, choáng, hộ thuẫn, hồi phục, tăng/giảm công thủ, xuyên giáp, hút máu, đa đòn
- [x] Ngũ hành tương khắc + dị hệ Lôi/Băng/Phong
- [x] 11 bản đồ, 66 yêu thú & đối thủ, thủ lĩnh hồi sinh 3 phút, tinh anh
- [x] 17 kỳ ngộ có lựa chọn, ảnh hưởng thiện duyên (chính/tà)
- [x] 6 bí cảnh nhiều ải (sinh lực không hồi giữa ải), 3 lượt/ngày + Bí Cảnh Lệnh
- [x] Thông Thiên Tháp vô tận, phần thưởng mốc 5/10/30/50 tầng

**Nghề tu & kinh tế**
- [x] Luyện đan: 30 đan phương, 20 cấp đan sư
- [x] Luyện khí: 6 vị trí × 10 giai × 6 phẩm chất, phụ tố ngẫu nhiên, cường hóa +15, phân giải
- [x] Động phủ 10 cấp (Tụ Linh Trận) + dược viên trồng linh dược
- [x] Linh thú: 4 loại trứng, 13 loài 1–5 sao, ấp nở, cho ăn yêu đan, hộ chiến + gia trì
- [x] Phường thị (quầy cố định + Kỳ Trân Các làm mới 20 phút), bán vật phẩm
- [x] 25 công pháp (6 phẩm) nâng tầng bằng điểm ngộ đạo

**Xã hội & meta**
- [x] 5 tông môn (chính/trung/ma), 7 cấp bậc, nhiệm vụ, bổng lộc, luận võ, Tàng Bảo Các
- [x] 30 chương nhiệm vụ chính tuyến có gợi ý hướng dẫn
- [x] Nhiệm vụ hằng ngày + rương năng động + điểm danh 7 ngày
- [x] 46 thành tựu có gia trì vĩnh viễn
- [x] Luân hồi: 11 thiên phú vĩnh viễn, giữ thành tựu & thống kê
- [x] Lưu tự động, xuất/nhập mã dữ liệu, xóa dữ liệu; âm thanh tổng hợp; hướng dẫn trong game

**Ngoài phạm vi 1.0 (để lại cho bản sau):** máy chủ, bảng xếp hạng trực tuyến, PvP thật, chat, nạp tiền.

## 4. Lộ trình & cột mốc

| Giai đoạn | Nội dung | Tiêu chí hoàn thành |
|---|---|---|
| M0 · Tiền sản xuất | Ý tưởng, GDD, kiến trúc dữ liệu | GDD được duyệt, danh sách hệ thống chốt |
| M1 · Vòng chơi lõi | Tu luyện, cảnh giới, đột phá, lưu/đọc, ngoại tuyến | Chơi được từ Phàm Nhân tới Kết Đan |
| M2 · Chiến đấu & thế giới | Engine chiến đấu, bản đồ, yêu thú, kỳ ngộ, rơi đồ | Thám hiểm tự động ổn định |
| M3 · Nghề tu | Luyện đan, luyện khí, cường hóa, động phủ, linh thú | Tất cả đan phương/trang bị tạo được |
| M4 · Nội dung cuối | Bí cảnh, tháp, thiên kiếp, tông môn, phường thị | Đi hết 11 cảnh giới |
| M5 · Meta | Nhiệm vụ, thành tựu, điểm danh, luân hồi | Vòng lặp luân hồi khép kín |
| M6 · Alpha – cân bằng | Mô phỏng 60 giờ chơi, hiệu chỉnh yêu thú/thiên kiếp | Đạt mục tiêu nhịp độ ở mục 6 |
| M7 · Beta – QA | Kiểm thử khói PC + điện thoại, luồng đặc biệt, tràn ngang | 0 lỗi JS, 0 trang tràn ngang |
| M8 · Phát hành | Đóng gói 1 tệp, tài liệu | `dist/VanDaoTienDo.html` chạy offline |

Tất cả cột mốc M0–M8 đã hoàn thành cho bản 1.0.

## 5. Kiến trúc kỹ thuật

```
tu-tien/
├── index.html            Trang chạy chính (nạp CSS + JS theo thứ tự)
├── css/style.css         Toàn bộ giao diện, đáp ứng 3 mức (≥1280, ≥900, điện thoại)
├── js/utils.js           Tiện ích (số, thời gian, ngẫu nhiên có trọng số)
├── js/data/              Dữ liệu thuần (data-driven): cảnh giới, vật phẩm, công pháp, bản đồ, tông môn…
├── js/state.js           Cấu trúc save, lưu/đọc/xuất/nhập, tạo kiếp mới
├── js/systems/           Logic game, không phụ thuộc DOM (chạy được trong Node để kiểm thử)
├── js/ui/                Hiển thị từng trang + hộp thoại
├── js/main.js            Khởi động, vòng lặp 4 lần/giây, ngoại tuyến, tự lưu 20 giây
├── tools/build.mjs       Đóng gói thành 1 tệp HTML
├── tests/                smoke.mjs (trình duyệt), sim.mjs (cân bằng), duel.mjs (hiệu chỉnh chiến đấu)
└── docs/                 Kế hoạch dự án, GDD
```

Nguyên tắc:
- **Dữ liệu tách khỏi logic**: thêm yêu thú/đan dược/công pháp chỉ cần sửa `js/data/*`.
- **Logic tách khỏi giao diện**: `js/systems/*` chỉ gọi `UI.*` qua các hook có kiểm tra tồn tại, nhờ đó mô phỏng chạy trong Node.
- **Một nguồn hiệu chỉnh**: `D.expected(gs)` mô tả "người chơi điển hình"; yêu thú và thiên kiếp đều tính từ đây.
- **Lưu trữ an toàn**: mọi thao tác `localStorage` bọc `try/catch`; trạng thái chờ luân hồi cũng được lưu để tải lại trang không mất điểm.

## 6. Mục tiêu cân bằng & kết quả

Mục tiêu nhịp độ (người chơi tích cực, tối ưu): Luyện Khí < 15 phút, Trúc Cơ < 1 giờ, Chân Tiên khoảng 30 giờ; người chơi thong thả + ngoại tuyến: 40–60 giờ. Mỗi đại cảnh giới dài hơn cảnh giới trước.

Kết quả `node tests/sim.mjs 60` (người chơi máy, 2 seed):

| Cảnh giới | Seed 12345 | Seed 777 |
|---|---|---|
| Luyện Khí | 0.11 h | 0.15 h |
| Trúc Cơ | 0.24 h | 0.27 h |
| Kết Đan | 0.68 h | 0.85 h |
| Nguyên Anh | 1.17 h | 1.52 h |
| Hóa Thần | 2.33 h | 2.83 h |
| Luyện Hư | 4.10 h | 4.43 h |
| Hợp Thể | 6.99 h | 7.47 h |
| Đại Thừa | 10.5 h | 11.4 h |
| Độ Kiếp | 17.8 h | 18.3 h |
| Chân Tiên | 30.4 h | 30.1 h |

Nguồn tu vi (60 giờ): tu luyện thụ động ~53%, chiến đấu ~22%, đan dược ~11%, bế quan ~7%, kỳ ngộ ~6% — tu luyện vẫn là trục chính, hoạt động chủ động tăng tốc ~1.9 lần.

Hiệu chỉnh chiến đấu (`node tests/duel.mjs`, người chơi đúng mức kỳ vọng, không gia trì): thắng 100% trận thường ở mọi cảnh giới, 5–15 lượt, mất 2–38% sinh lực; thủ lĩnh là thử thách thật (thắng 0–10/10 tùy thời điểm trong cảnh giới). Người chơi đầu tư (trang bị Tiên phẩm, thần thông cấp 10) vượt trội rõ rệt — phần thưởng cho công sức; thử thách cuối là Thông Thiên Tháp trên tầng 90.

## 7. Kế hoạch & kết quả kiểm thử

| Bộ kiểm thử | Phạm vi | Kết quả 1.0 |
|---|---|---|
| `node --check` | Cú pháp mọi tệp JS | Đạt |
| `tests/smoke.mjs` | Chromium PC 1400×900 + điện thoại 390×844: tạo nhân vật, đột phá, thám hiểm, mọi trang, luyện đan/khí, linh thú, tháp, thiên kiếp, bí cảnh, xuất/nhập, tải lại | Đạt, 0 lỗi JS, 0 tràn ngang |
| `tests/smoke.mjs` (luồng) | Chiến đấu thủ công, kỳ ngộ có giao dịch & giao chiến, phường thị, phân giải hàng loạt, báo cáo ngoại tuyến, luân hồi chủ động + tải lại giữa chừng, tọa hóa | Đạt |
| `tests/sim.mjs` | 60 giờ chơi giả lập: không lỗi thời gian chạy, nhịp độ đúng mục tiêu | Đạt |
| `tests/duel.mjs` | Hiệu chỉnh yêu thú theo cảnh giới | Đạt |

## 8. Rủi ro & giảm thiểu

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Lạm phát tu vi do cộng dồn hệ số | Cao | Mọi nguồn tu vi phụ quy đổi theo "giây tu luyện" thay vì % yêu cầu; đan độc giới hạn đan dược; mô phỏng mỗi lần đổi số |
| Bế quan làm hỏng nhịp độ | Trung bình | 1 năm = 30 giây tu luyện; thọ nguyên là cái giá thật |
| Mất dữ liệu (xóa trình duyệt, chế độ ẩn danh) | Trung bình | Tự lưu 20 giây + khi đóng tab; xuất/nhập mã dữ liệu |
| Trình duyệt chặn âm thanh/phông chữ | Thấp | Âm thanh chỉ bật sau thao tác; phông có phương án dự phòng |
| Tab chạy nền bị trình duyệt làm chậm | Thấp | Tính theo thời gian thực đã trôi, tự bù như ngoại tuyến |

## 9. Lộ trình sau phát hành (đề xuất)

1. **1.1** — Sự kiện theo mùa (Trung Thu, Tết), thêm 2 bí cảnh, đạo lữ (song tu).
2. **1.2** — Trận pháp & phù lục (nghề thứ 3), hệ thống thiên phú công pháp.
3. **2.0** — Máy chủ: bảng xếp hạng, luận kiếm PvP không đồng bộ, tông môn chiến.

## 10. Định nghĩa hoàn thành (DoD)

Một tính năng được coi là xong khi: có dữ liệu trong `js/data`, logic chạy được trong Node, giao diện hoạt động ở cả PC và điện thoại, được kiểm thử khói hoặc mô phỏng bao phủ, không phát sinh lỗi console, và được mô tả trong GDD.

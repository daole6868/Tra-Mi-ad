# Vấn Đạo Tiên Đồ 道

Game nhập vai **tu tiên** nhàn rỗi chạy ngay trên trình duyệt — tiếng Việt, không cần cài đặt, không cần máy chủ, chơi được cả trên điện thoại.

Từ một phàm nhân mười sáu tuổi, trắc linh căn, bái nhập tông môn, luyện đan luyện khí, săn yêu thú, độ thiên kiếp… cho đến khi phi thăng **Chân Tiên**. Thọ nguyên cạn thì luân hồi, kiếp sau mạnh hơn kiếp trước.

## Chơi ngay

- **Cách nhanh nhất:** mở tệp [`dist/VanDaoTienDo.html`](dist/VanDaoTienDo.html) bằng trình duyệt (Chrome, Edge, Firefox, Safari). Chỉ một tệp duy nhất, chơi offline được.
- **Từ mã nguồn:** mở `index.html` trong thư mục này.
- Dữ liệu tự lưu trong trình duyệt. Muốn chuyển máy: *Cài Đặt → Xuất dữ liệu*, rồi *Nhập dữ liệu* ở máy kia.

## Tính năng

| Nhóm | Nội dung |
|---|---|
| Tu hành | 11 đại cảnh giới / 46 tiểu cảnh giới, tu luyện cả khi tắt game, bế quan đổi thọ nguyên lấy tu vi, đan độc, trọng thương |
| Đột phá | Trúc Cơ & Kết Đan theo tỉ lệ (có đan hỗ trợ), từ Nguyên Anh độ thiên kiếp 3→9 đạo lôi có hoạt cảnh |
| Nhân vật | 7 loại linh căn, 8 hệ, 4 thuộc tính bẩm sinh, 5 xuất thân, thiện duyên chính/tà |
| Chiến đấu | Theo lượt có tốc độ, tự động hoặc thủ công, 39 thần thông, ngũ hành tương khắc, hiệu ứng thiêu đốt/độc/choáng/hộ thuẫn… |
| Thế giới | 11 bản đồ, 66 yêu thú & đối thủ, thủ lĩnh, 17 kỳ ngộ có lựa chọn, 6 bí cảnh, Thông Thiên Tháp vô tận |
| Nghề tu | Luyện đan (30 đan phương), luyện khí (6 vị trí × 10 giai × 6 phẩm), cường hóa +15, phân giải, động phủ & dược viên, linh thú 13 loài |
| Giang hồ | 5 tông môn, 7 cấp bậc, nhiệm vụ, bổng lộc, luận võ, Tàng Bảo Các; phường thị & Kỳ Trân Các |
| Meta | 30 chương nhiệm vụ chính tuyến (kiêm hướng dẫn), nhiệm vụ ngày, điểm danh 7 ngày, 46 thành tựu, luân hồi với 11 thiên phú |

## Mẹo tân thủ

1. Bấm **Đột Phá** ở trang Tu Luyện khi thanh tu vi đầy để vào Luyện Khí.
2. Vào **Hành Trang → Bí tịch** dùng quyển thần thông được tặng, rồi **Thám Hiểm** Thanh Vân Sơn Mạch.
3. Làm theo **Nhiệm Vụ** chính tuyến — mỗi chương chỉ dẫn một hệ thống mới.
4. Trước khi độ kiếp: mặc đồ tốt nhất, mang theo đan hồi phục và Tị Lôi Phù.

## Cấu trúc & phát triển

```
index.html        Trang game
css/style.css     Giao diện
js/data/          Dữ liệu (cảnh giới, vật phẩm, công pháp, bản đồ, tông môn…)
js/systems/       Logic game (không phụ thuộc DOM)
js/ui/            Giao diện từng trang
js/state.js       Lưu / đọc / xuất / nhập
js/main.js        Khởi động & vòng lặp
tools/build.mjs   Đóng gói thành dist/VanDaoTienDo.html
tests/            Kiểm thử trình duyệt, mô phỏng cân bằng, hiệu chỉnh chiến đấu
docs/             Kế hoạch dự án & tài liệu thiết kế (GDD)
```

Lệnh (cần Node 18+; kiểm thử trình duyệt cần Playwright + Chromium):

```bash
node tools/build.mjs            # đóng gói 1 tệp vào dist/
node tests/smoke.mjs            # kiểm thử khói trên PC & điện thoại
node tests/sim.mjs 60           # mô phỏng 60 giờ chơi, in thời điểm đạt từng cảnh giới
node tests/duel.mjs             # kiểm tra độ khó yêu thú theo cảnh giới
```

Tài liệu: [Kế hoạch dự án](docs/KE_HOACH_DU_AN.md) · [Thiết kế game (GDD)](docs/GDD.md)

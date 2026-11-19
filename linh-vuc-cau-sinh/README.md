# Linh Vực Cầu Sinh 道

Game **tu tiên sinh tồn màn hình ngang** chạy ngay trên trình duyệt — tiếng Việt, chơi bằng bàn phím/chuột hoặc cảm ứng trên điện thoại xoay ngang.

Tông môn bị diệt, ngươi lạc vào Linh Vực hoang cổ. Chặt cây, đập đá, dựng lửa trại, sống sót qua những đêm yêu ma kéo đến; ngồi thiền đột phá từ Phàm Nhân lên Nguyên Anh; chinh phục bốn bí cảnh sinh ngẫu nhiên, hạ bốn thủ lĩnh, ghép lại Thiên Bia để mở đường trở về.

## Chơi ngay

- Mở [`dist/LinhVucCauSinh.html`](dist/LinhVucCauSinh.html) bằng trình duyệt (một tệp duy nhất, chơi offline).
- Hoặc mở `index.html` trong thư mục này.
- Trên điện thoại: xoay ngang màn hình; có thể bật Toàn màn hình trong menu Tạm dừng.

## Điều khiển

| | Bàn phím / chuột | Cảm ứng |
|---|---|---|
| Di chuyển / nhảy | A D / ← →, W / Space | ◀ ▶, Nhảy |
| Chém, chặt cây, đập đá | J / chuột trái | Chém |
| Hỏa Cầu · Lướt | K · L / Shift | Phép · Lướt |
| Dùng, ăn, đặt công trình | F / chuột phải | Dùng |
| Tương tác · Ngồi thiền | E · M | E · Thiền |
| Ô nhanh · Túi đồ · Tạm dừng | 1–8 · Tab · Esc | chạm ô · 🎒 · ❚❚ |

## Có gì trong game

- **Sinh tồn:** ngày đêm, đói, Huyết Nguyệt, lửa trại cần củi, xây tường, ngủ qua đêm, tử vong rơi đồ.
- **Thế giới:** 5 vùng đất (tuyết, rừng trúc, tàn tích, núi đỏ, núi sét), tài nguyên mọc lại, thời tiết.
- **Chế tạo:** 57 vật phẩm, 35 công thức ở 5 trạm; công cụ, binh khí nguyên tố, giáp, đan dược, công trình.
- **Tu luyện:** 17 cảnh giới, 6 thần thông mở dần, lôi kiếp phải né khi đột phá Kết Đan và Nguyên Anh.
- **Bí cảnh:** 4 bí cảnh sinh ngẫu nhiên mỗi lần vào (luôn đi được), 12 loại yêu ma, rương, Hồn Đăng, 4 thủ lĩnh nhiều chiêu.
- **Hình ảnh & âm thanh:** vẽ hoàn toàn bằng code theo phong cách thủy mặc, ánh sáng đêm, nhạc đàn tranh tổng hợp — không có tệp ảnh hay âm thanh.

## Phát triển

```bash
node tools/build.mjs        # đóng gói 1 tệp vào dist/
node tests/gen.mjs 300      # 1.200 bí cảnh phải đi được tới thủ lĩnh
node tests/balance.mjs 8    # người chơi máy thử đánh 4 thủ lĩnh
node tests/smoke.mjs        # kiểm thử khói trên Chromium (cần Playwright)
```

Tài liệu: [Kế hoạch dự án](docs/KE_HOACH_DU_AN.md) · [Thiết kế game (GDD)](docs/GDD.md)

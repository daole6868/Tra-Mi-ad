# Kế hoạch dự án — Linh Vực Cầu Sinh

> Đơn vị phát triển (giả định): **Linh Vân Studio** · Thể loại: hành động sinh tồn tu tiên 2D, góc nhìn ngang · Nền tảng: trình duyệt (PC bàn phím/chuột, điện thoại cảm ứng xoay ngang) · Ngôn ngữ: Tiếng Việt · Phiên bản: **1.0.0**

## 1. Tầm nhìn

**Một câu:** Lạc vào Linh Vực sau khi tông môn bị diệt — chặt cây, dựng trại, sống qua những đêm yêu ma, ngồi thiền đột phá cảnh giới, rồi chinh phục bốn bí cảnh để ghép lại Thiên Bia và trở về.

| Hạng mục | Quyết định |
|---|---|
| Khác biệt so với "Vấn Đạo Tiên Đồ" (bản nhàn rỗi) | Điều khiển trực tiếp thời gian thực, góc nhìn ngang, sinh tồn (đói, đêm, tử vong rơi đồ), bí cảnh là màn đi cảnh sinh ngẫu nhiên |
| Người chơi mục tiêu | Thích tu tiên + sinh tồn kiểu Terraria/Don't Starve, chơi 15–60 phút mỗi lần |
| Thời lượng một lượt hoàn chỉnh | 1,5 – 3 giờ để chinh phục 4 bí cảnh; sau đó chơi tự do |
| Phong cách hình ảnh | Tranh thủy mặc: bóng mực trên nền giấy dó, núi xa nhiều lớp mờ sương, điểm son đỏ & vàng kim; ban đêm chỉ còn ánh lửa |
| Ràng buộc kỹ thuật | HTML + Canvas 2D + JavaScript thuần, không thư viện, không tệp ảnh/âm thanh (mọi thứ vẽ & tổng hợp bằng code), mở trực tiếp bằng trình duyệt |

## 2. Đội ngũ & vai trò

| Vai trò | Trách nhiệm | Bàn giao |
|---|---|---|
| Producer | Phạm vi, tiến độ, nghiệm thu | Tài liệu này |
| Game Designer | Vòng chơi sinh tồn, tiến trình cảnh giới, bí cảnh, thủ lĩnh | `docs/GDD.md`, `js/data.js` |
| Level Designer | Bộ sinh bí cảnh có kiểm chứng đường đi | `js/world.js`, `tests/gen.mjs` |
| Gameplay Engineer | Vật lý, điều khiển, AI yêu thú, chiến đấu, lưu trữ | `js/game.js`, `js/input.js`, `js/inventory.js` |
| Technical Artist | Hình vẽ thủ tục, ánh sáng đêm, thời tiết, hiệu ứng | `js/sprites.js`, `js/render.js` |
| UI/UX | HUD, túi đồ & chế tạo, cảm ứng, màn hình | `js/ui.js`, `css/style.css` |
| Audio | Hiệu ứng & nhạc ngũ cung tổng hợp | `js/audio.js` |
| QA | Kiểm thử khói trình duyệt, kiểm thử sinh bản đồ, kiểm thử cân bằng thủ lĩnh | `tests/` |

## 3. Phạm vi 1.0 (đã hoàn thành)

**Sinh tồn**
- [x] Ngày/đêm 6 phút, bình minh, hoàng hôn; Huyết Nguyệt mỗi 4 đêm
- [x] No bụng giảm dần, đói mất máu; hồi máu khi no
- [x] Tử vong ngoài trời: rơi một nửa nguyên liệu & thức ăn thành túi đồ để nhặt lại
- [x] Lửa trại cần củi, xua yêu ma, là điểm hồi sinh; chiếu cỏ để ngủ qua đêm
- [x] Xây tường gỗ/đá (yêu thú đi bộ phải phá tường), phá tường lấy lại vật liệu

**Thế giới**
- [x] Linh Vực rộng 1.100 ô, 5 vùng: Hàn Đàm Tuyết Nguyên (băng trơn), Trúc Lâm, Tàn Tích Thanh Vân, Xích Thạch Sơn, Lôi Phong
- [x] 12 loại tài nguyên mọc lại theo ngày; cấp cuốc khai thác (đá → sắt → linh thạch/lôi văn thạch)
- [x] 8 yêu thú ngoài trời theo vùng & giờ (thỏ, lợn rừng, sói, cương thi sợ nắng, u hồn xuyên tường, huyết bức, tuyết lang, lôi ưng)
- [x] Thời tiết theo vùng: tuyết, lá rơi, tàn lửa, giông sét

**Chế tạo & tu luyện**
- [x] 57 vật phẩm, 35 công thức ở 5 trạm (tay không, Lửa trại, Bàn chế tác, Lò luyện, Đan lô)
- [x] 8 công trình đặt được + 2 loại tường; xem trước vị trí đặt
- [x] 17 cảnh giới (Phàm Nhân → Luyện Khí 1–9 → Trúc Cơ → Kết Đan → Nguyên Anh), ngồi thiền ở lửa trại/Bồ đoàn/Tụ Linh Trận
- [x] Đột phá đại cảnh giới bằng đan; Kết Đan & Nguyên Anh phải né lôi kiếp
- [x] 6 thần thông mở theo cảnh giới: Hỏa Cầu (tự ngắm), nhảy hai lần, lướt, kiếm khí, tam muội chân hỏa, ngự kiếm phi hành

**Bí cảnh**
- [x] 4 bí cảnh sinh ngẫu nhiên mỗi lần vào: đồi, hố độc, bệ đá trên dung nham, bậc thang, đấu trường
- [x] 12 yêu thú bí cảnh (6 kiểu AI), tinh anh, rương báu, Hồn Đăng (3 mạng + điểm hồi sinh)
- [x] 4 thủ lĩnh, mỗi con 3 chiêu có báo trước + giai đoạn hai: Thụ Yêu Vương, Xích Viêm Long, Băng Phượng, Lôi Thần Khôi Lỗi
- [x] Kết thúc: đặt 4 mảnh Thiên Bia vào Truyền Tống Trận

**Hệ thống**
- [x] 15 mục tiêu hướng dẫn nối tiếp (kiêm tutorial)
- [x] Điều khiển bàn phím, chuột, cảm ứng; nhắc xoay ngang trên điện thoại dọc
- [x] Lưu tự động (30 giây, khi đặt công trình, khi ra/vào bí cảnh, khi ẩn tab)
- [x] Âm thanh & nhạc tổng hợp WebAudio (bật/tắt)

## 4. Lộ trình

| Mốc | Nội dung | Tiêu chí |
|---|---|---|
| M0 | Ý tưởng, GDD, phong cách hình ảnh | Duyệt GDD |
| M1 | Vật lý ô lưới, điều khiển, camera | Chạy nhảy mượt, bậc 1 ô tự bước |
| M2 | Thế giới sinh từ hạt giống, tài nguyên, chặt/đập | Thu thập được gỗ, đá |
| M3 | Túi đồ, chế tạo, đặt công trình, tường | Dựng trại hoàn chỉnh |
| M4 | Ngày/đêm, đói, yêu ma, ánh sáng | Sống qua đêm đầu tiên |
| M5 | Tu luyện, đột phá, thần thông, lôi kiếp | Đạt Nguyên Anh |
| M6 | Bí cảnh sinh ngẫu nhiên + kiểm chứng đường đi | 1.200 bản đồ thử đều qua được |
| M7 | 4 thủ lĩnh, kết thúc | Thắng được cả 4 |
| M8 | HUD, cảm ứng, âm thanh, lưu | Chơi trọn trên điện thoại |
| M9 | Cân bằng & QA | Mục 6, 7 |

Cả M0–M9 hoàn thành cho bản 1.0.

## 5. Kiến trúc

```
linh-vuc-cau-sinh/
├── index.html          Canvas + lớp HUD HTML
├── css/style.css       HUD, túi đồ, màn hình, nút cảm ứng (tối ưu màn hình thấp)
├── js/util.js          Toán, RNG có hạt giống, nhiễu 1D
├── js/data.js          Toàn bộ dữ liệu game (data-driven)
├── js/world.js         Lưới ô; sinh Linh Vực & bí cảnh; kiểm chứng đường đi (BFS theo khả năng nhảy)
├── js/inventory.js     Túi đồ 32 ô, chế tạo theo trạm
├── js/game.js          Vật lý, người chơi, yêu thú & thủ lĩnh, chiến đấu, sinh tồn, lưu
├── js/input.js         Bàn phím, chuột, cảm ứng đa điểm
├── js/audio.js         WebAudio
├── js/sprites.js       Vẽ thủ tục nhân vật, yêu thú, tài nguyên, công trình
├── js/render.js        Bầu trời theo giờ, núi nhiều lớp, địa hình, ánh sáng, thời tiết
├── js/ui.js            HUD, túi đồ, màn hình
├── js/main.js          Vòng lặp bước cố định 60 Hz
├── tools/build.mjs     Đóng gói 1 tệp
└── tests/              gen.mjs, balance.mjs, smoke.mjs
```

- **Bước cố định 60 Hz** cho vật lý ổn định; vẽ theo `requestAnimationFrame`.
- **Va chạm AABB với lưới ô 16 px**, chia nhỏ bước khi nhanh, tự bước lên bậc 1 ô.
- **Bí cảnh luôn đi được**: mỗi bản đồ sinh ra được kiểm bằng BFS mô phỏng tầm nhảy (cao 4 ô, xa 3–6 ô); sai thì sinh lại (trung bình 1,3 lần).
- **Ánh sáng**: lớp tối vẽ trên canvas phụ nửa độ phân giải, đục lỗ bằng gradient tại nguồn sáng; vật phát sáng & chữ vẽ sau lớp tối.
- **Lưu gọn**: chỉ lưu hạt giống thế giới + các thay đổi (tường, tài nguyên đã khai thác, công trình), tải lại sinh lại thế giới.

## 6. Cân bằng (kết quả kiểm thử)

`node tests/balance.mjs 8` — người chơi máy **không né đòn**, chỉ đứng đánh, nhảy hai lần lên thủ lĩnh bay và dùng Hồi Khí Đan khi máu < 40%:

| Thủ lĩnh | Cảnh giới · vũ khí dự kiến | Thắng | Thời gian | Đan dùng | Máu còn |
|---|---|---|---|---|---|
| Thụ Yêu Vương | Luyện Khí 4 · Thiết kiếm | 8/8 | 37 s | 3 | 61% |
| Xích Viêm Long | Luyện Khí 6 · Thanh Mộc Kiếm | 5/8 | 41 s | 4,8 | 52% |
| Băng Phượng | Trúc Cơ Sơ Kỳ · Viêm Long Kiếm | 6/8 | 47 s | 6 | 36% |
| Lôi Thần Khôi Lỗi | Kết Đan Sơ Kỳ · Băng Phách Kiếm | 8/8 | 34 s | 2,5 | 45% |

Người chơi thật biết né sẽ thắng thoải mái hơn; người chưa chuẩn bị (thiếu đan, vũ khí yếu) sẽ thua — đúng chủ đích. Thủ lĩnh bay (rồng, phượng) khó nhất vì phải nhảy hai lần hoặc dùng bệ đá trong đấu trường.

Tiến trình tu luyện: Luyện Khí 1→9 cần 2.720 tu vi (≈ 8 phút ngồi thiền ở Bồ đoàn + điểm từ chiến đấu); Trúc Cơ 3.700; Kết Đan 8.000 — cộng thời gian sinh tồn, thu thập và 4 bí cảnh ra một lượt chơi 1,5–3 giờ.

## 7. Kiểm thử

| Bộ kiểm thử | Nội dung | Kết quả |
|---|---|---|
| `node --check js/*.js` | Cú pháp | Đạt |
| `node tests/gen.mjs 300` | 1.200 bí cảnh (4 loại × 300 hạt giống) đều đi được tới thủ lĩnh, không quái kẹt trong đá; 60 thế giới có độ dốc ≤ 4 ô và ≥ 150 tài nguyên | Đạt |
| `node tests/balance.mjs 8` | 4 thủ lĩnh thắng được với cảnh giới & trang bị dự kiến | Đạt (bảng mục 6) |
| `node tests/smoke.mjs` | Chromium 1280×720: chặt cây bằng phím thật, chế tạo qua giao diện, đặt công trình bằng F, ngồi thiền bằng E, đánh yêu ma ban đêm, vào bí cảnh, hạ thủ lĩnh, nhặt Thiên Bia, rời bí cảnh, tử vong & hồi sinh, lưu & tải lại, lôi kiếp, chiến thắng; điện thoại 844×390 cảm ứng: nút Nhảy, túi đồ, vào bí cảnh bằng nút tương tác; điện thoại dọc: nhắc xoay ngang | Đạt, 0 lỗi JS |

## 8. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Bí cảnh sinh ra bị kẹt không qua được | Kiểm chứng BFS trong game + 1.200 bản đồ trong kiểm thử |
| Trên điện thoại nút che màn chơi | Bố trí nút ở hai góc dưới, thu nhỏ HUD khi màn hình thấp, gợi ý xoay ngang |
| Mất tiến trình | Lưu tự động nhiều thời điểm; dữ liệu lưu nhỏ (chỉ phần thay đổi) |
| Hiệu năng máy yếu | Canvas ánh sáng nửa độ phân giải; quái ngoài màn hình trong bí cảnh "ngủ"; giới hạn 700 hạt |
| Thủ lĩnh quá khó / quá dễ | Bộ kiểm thử cân bằng chạy lại mỗi lần đổi số |

## 9. Sau phát hành (đề xuất)

1. **1.1** — Rương chứa đồ, câu cá ở Hàn Đàm, nấu ăn nhiều món, thêm thời tiết ảnh hưởng (lạnh ở Hàn Đàm cần áo ấm).
2. **1.2** — Linh thú đồng hành (thuần phục yêu thú), nhiệm vụ của tàn hồn sư phụ, bí cảnh thứ năm (Hỗn Độn).
3. **2.0** — Chơi hai người cùng máy, chế độ tử vong vĩnh viễn, bảng xếp hạng số ngày sống sót.

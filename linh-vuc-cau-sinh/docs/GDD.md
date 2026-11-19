# Tài liệu thiết kế (GDD) — Linh Vực Cầu Sinh 1.0

## 1. Cốt truyện & mục tiêu

Thanh Vân Môn bị yêu ma san bằng. Một đệ tử ngoại môn bị cuốn vào Truyền Tống Trận đổ nát và tỉnh dậy ở **Linh Vực** — vùng đất hoang cổ đầy yêu thú. Trận pháp chỉ còn trơ khung; muốn trở về phải tìm **bốn mảnh Thiên Bia** phong ấn trong bốn bí cảnh. Chiến thắng khi đặt đủ 4 mảnh vào trận ở trung tâm Tàn Tích. Sau đó có thể ở lại tu luyện tiếp.

## 2. Vòng chơi

```
Ban ngày: thu thập (gỗ, đá, quặng, thảo dược, thịt) → chế tạo → dựng trại
Hoàng hôn: thêm củi, xây tường, chuẩn bị đan dược
Ban đêm: cố thủ quanh lửa trại / ngồi thiền tu luyện / ngủ qua đêm
Khi đủ mạnh: vượt bí cảnh → hạ thủ lĩnh → mảnh Thiên Bia + tinh hoa nguyên tố
Tinh hoa → binh khí mới + đan đột phá → cảnh giới mới → bí cảnh kế tiếp
```

## 3. Điều khiển

| Hành động | Bàn phím / chuột | Cảm ứng |
|---|---|---|
| Di chuyển | A/D, ←/→ | ◀ ▶ |
| Nhảy (giữ để nhảy cao) | W, ↑, Space | Nhảy |
| Chém / chặt / đập | J, chuột trái | Chém |
| Hỏa Cầu (tự ngắm) | K | Phép |
| Lướt | L, Shift | Lướt |
| Dùng / ăn / đặt | F, chuột phải | Dùng, hoặc chạm lại ô đang chọn |
| Tương tác | E | Nút ✋/E |
| Ngồi thiền | M | Thiền |
| Ô nhanh | 1–8, lăn chuột, Q/R | Chạm ô |
| Túi đồ & chế tạo | Tab, I, C | 🎒 |
| Tạm dừng | Esc, P | ❚❚ |

Cảm giác điều khiển: thời gian "coyote" 0,1 s, đệm nhảy 0,13 s, nhả phím sớm thì nhảy thấp, tự bước lên bậc cao 1 ô.

## 4. Nhân vật & chỉ số

| Chỉ số | Nguồn |
|---|---|
| Sinh lực | Theo cảnh giới (100 → 560); hồi 0,6 + 0,08 × cảnh giới mỗi giây khi no > 40 và 3 giây không bị đánh |
| Linh lực | Theo cảnh giới + giáp; hồi 2 + 0,2 × cảnh giới/giây (×3 khi thiền); Hỏa Cầu tốn 10, lướt tốn 6 |
| No bụng | 100, giảm 1 mỗi 3 giây (×1,6 khi thiền); về 0 mất 2 máu/giây |
| Tu vi | Ngồi thiền, hạ yêu ma, Tụ Khí Đan |
| Phòng ngự | Giáp: sát thương nhận = sát thương × 100 / (100 + thủ) |

Sát thương cận chiến = sát thương vũ khí × hệ số cảnh giới × (đòn 3 của chuỗi ×1,5) × ±10%, bạo kích 8% ×1,8. Chuỗi 3 đòn, đòn 3 đẩy lùi mạnh. Bị đánh: bất tử 0,8 s, bị đẩy lùi, dừng ngồi thiền.

## 5. Cảnh giới & thần thông

| # | Cảnh giới | Tu vi để lên | Sinh lực | Hệ số sát thương | Đột phá |
|---|---|---|---|---|---|
| 0 | Phàm Nhân | 40 | 100 | ×1,00 | tự động |
| 1–9 | Luyện Khí 1–9 | 60, 90, 130, 180, 250, 330, 430, 550, 700 | 112–208 | ×1,06–1,54 | tự động; tầng 9 cần **Trúc Cơ Đan** |
| 10–12 | Trúc Cơ | 900, 1.200, 1.600 | 260–300 | ×1,8–2,0 | Hậu Kỳ cần **Kết Kim Đan** + 4 đạo lôi kiếp |
| 13–15 | Kết Đan | 2.000, 2.600, 3.400 | 380–440 | ×2,4–2,7 | Hậu Kỳ cần **Hóa Anh Đan** + 7 đạo lôi kiếp |
| 16 | Nguyên Anh | — | 560 | ×3,4 | đỉnh |

Tốc độ thiền (tu vi/giây): bất kỳ đâu 1,2 · bên lửa trại đang cháy 2,5 · Bồ đoàn 5 · Tụ Linh Trận 7,5; nhân (1 + 0,04 × cảnh giới).

**Lôi kiếp:** mỗi 1,25 s một cột sét giáng vào vị trí người chơi (báo trước 0,85 s), sát thương 30% sinh lực tối đa. Né hết là đột phá; tử vong thì mất 30% tu vi và mất đan.

| Mở ở | Thần thông |
|---|---|
| Luyện Khí 2 | Hỏa Cầu Thuật (tự ngắm yêu ma gần nhất phía trước trong góc ±60°) |
| Luyện Khí 3 | Nhị Đoạn Khiêu — nhảy hai lần |
| Luyện Khí 6 | Ngự Phong Bộ — lướt, miễn thương 0,24 s |
| Trúc Cơ | Kiếm Khí — đòn 3 phóng sóng kiếm xuyên thấu |
| Kết Đan | Tam Muội Chân Hỏa — Hỏa Cầu bắn 3 quả |
| Nguyên Anh | Ngự Kiếm Phi Hành — giữ nhảy trên không để bay |

## 6. Thời gian & sinh tồn

- Một ngày đêm = 6 phút: ngày 05:00–19:30 (≈ 3,6 phút), đêm ≈ 2,4 phút. Ngày mới bắt đầu lúc 05:00.
- **Ban đêm**: yêu ma xuất hiện ngoài màn hình, tối đa 4 + ⌊ngày/3⌋ (tối đa +3) con gần người chơi; không sinh trong bán kính 320 px quanh lửa trại đang cháy.
- **Huyết Nguyệt** (đêm ngày 4, 8, 12…): tối đa 8 con, máu & sát thương ×1,25, bầu trời nhuốm đỏ.
- **Độ khó theo ngày**: máu yêu ma ×(1 + 0,12 × (ngày − 1)), sát thương ×(1 + 0,06 × (ngày − 1)), giới hạn ở ngày 16. Theo vùng: Xích Thạch ×1,3, Hàn Đàm ×1,5, Lôi Phong ×1,8.
- Cương thi, u hồn, huyết bức bị **thiêu dưới nắng** (mất 24% máu/giây).
- **Ngủ** trên chiếu cỏ vào ban đêm (không có yêu ma trong 420 px): sang sáng hôm sau, hồi đầy máu & linh lực, mất 25 no bụng, đặt điểm hồi sinh.
- **Tử vong ngoài trời**: rơi 50% mỗi chồng nguyên liệu & thức ăn thành túi đồ phát sáng tại chỗ; hồi sinh ở chiếu cỏ / lửa trại đã ngồi / điểm khởi đầu với 60% máu.

## 7. Linh Vực

| Vùng (từ tây sang đông) | Ô | Địa hình | Tài nguyên | Yêu ma ngày / đêm | Thời tiết |
|---|---|---|---|---|---|
| Hàn Đàm Tuyết Nguyên | 0–180 | phẳng, hồ băng trơn | tùng tuyết, đá, tuyết liên, sắt | thỏ / tuyết lang, u hồn, cương thi | tuyết |
| Trúc Lâm | 180–420 | đồi thoải | trúc, tùng, quả, linh thảo | thỏ, lợn rừng / sói, cương thi, u hồn | lá rơi |
| Tàn Tích Thanh Vân (khởi đầu) | 420–680 | rất phẳng, cột đá đổ | tùng, đá, quả, sắt | thỏ, lợn rừng / sói, cương thi, u hồn | — |
| Xích Thạch Sơn | 680–900 | đồi dốc (bậc 2 ô) | phong đỏ, đá, sắt, linh thạch, hỏa linh chi | lợn rừng, sói / huyết bức, cương thi, sói | tàn lửa |
| Lôi Phong | 900–1100 | núi cao (bậc 2 ô) | lôi văn thạch, linh thạch | lôi ưng / lôi ưng, huyết bức, u hồn | giông sét |

Cổng bí cảnh: Thanh Mộc (ô 300), Xích Viêm (ô 800), Hàn Băng (ô 92), Cửu Thiên Lôi (ô 1040). Truyền Tống Trận ở ô 550.

Tài nguyên: cây chặt bằng rìu (tay không sức 1, rìu đá 2, rìu sắt 4); đá đập bằng cuốc (quặng sắt cần cuốc đá, linh thạch & lôi văn thạch cần cuốc sắt). Tài nguyên mọc lại sau 1–4 ngày.

## 8. Chế tạo

| Trạm | Công thức tiêu biểu |
|---|---|
| Tay không | Bàn chế tác (10 gỗ), Lửa trại (6 gỗ + 3 đá), Đuốc, Tường gỗ |
| Bàn chế tác | Kiếm gỗ, rìu/cuốc đá & sắt, Thiết kiếm, Áo da, Đạo bào, Thiết giáp, Lò luyện, Đan lô, Chiếu cỏ, Bồ đoàn, Đèn lồng, Tường đá, Tụ Linh Trận |
| Lò luyện | Thỏi sắt (2 quặng + 1 gỗ), 4 binh khí nguyên tố, Hàn Băng Giáp |
| Lửa trại | Thịt nướng, Thảo dược thang |
| Đan lô | Hồi Khí/Hồi Linh/Tích Cốc/Tụ Khí Đan, Trúc Cơ/Kết Kim/Hóa Anh Đan |

Đường tiến trình binh khí: Kiếm gỗ (8) → Thiết kiếm (15) → Thanh Mộc Kiếm (24, hút máu) → Viêm Long Kiếm (36, bỏng) → Băng Phách Kiếm (52, làm chậm) → Lôi Đình Kiếm (75, gọi sét). Giáp: Áo da 15 → Đạo bào 30 → Thiết giáp 45 → Hàn Băng Giáp 70.

Đan đột phá cần tinh hoa từ thủ lĩnh: Trúc Cơ Đan = Mộc tinh + Hỏa tinh; Kết Kim Đan = Băng tinh; Hóa Anh Đan = Lôi tinh. Mỗi thủ lĩnh rơi 2 tinh hoa; yêu ma bí cảnh rơi thêm (3%, tinh anh 12%), rương 10%.

## 9. Yêu ma & AI

| Kiểu AI | Hành vi | Ví dụ |
|---|---|---|
| passive | đi lang thang, chạy khi bị lại gần | Linh Thỏ |
| walker | đuổi theo, nhảy qua tường thấp, phá tường xây, dừng ở mép vực | Sói, Thụ Yêu, Lôi Khôi Lỗi (giảm 25% sát thương nhận) |
| charger | gồng 0,55 s (phát sáng đỏ) rồi lao gấp 3,4 lần tốc độ | Lợn Rừng (trung lập tới khi bị đánh), Hàn Lang |
| hopper | nhảy cóc về phía người chơi | Cương Thi, Viêm Hầu |
| flyer | bay lượn quanh đầu người chơi | Huyết Bức, Độc Phong |
| diver | lơ lửng phía trên rồi bổ nhào | Lôi Ưng, Lôi Điểu |
| ghost | bay xuyên tường | U Hồn, Thủy Quỷ |
| shooter / turret | giữ khoảng cách, gồng rồi bắn (hạt cong, lửa, băng, sét) | Đằng Xà, Hỏa Linh, Băng Tinh, Lôi Tinh |

Tinh anh (6% ban đêm, 12% trong bí cảnh): máu ×2, sát thương ×1,3, to hơn, hào quang vàng.

## 10. Bí cảnh

| Bí cảnh | Yêu cầu | Đoạn | Nguy hiểm | Thủ lĩnh (máu) |
|---|---|---|---|---|
| Thanh Mộc | Luyện Khí 1 | 6 | Độc đầm | Thụ Yêu Vương (2.400) |
| Xích Viêm | Luyện Khí 5 | 7 | Dung nham | Xích Viêm Long (2.600, bay) |
| Hàn Băng | Trúc Cơ | 7 | Hàn thủy | Băng Phượng (6.000, bay) |
| Cửu Thiên Lôi | Kết Đan | 8 | Lôi trì | Lôi Thần Khôi Lỗi (20.000) |

**Sinh bản đồ:** chuỗi đoạn dài 40 ô chọn ngẫu nhiên — đồi (chênh ±3), hố độc (rộng 2–4), bệ đá trên chất nguy hiểm (khe 2–3, chênh ±2), bậc thang lên cao nguyên (có rương), đấu trường (2 bệ, 3 quái). Trần hang cách nền ≥ 8 ô. Đấu trường thủ lĩnh 70 ô, cửa đóng khi vào.

**Kiểm chứng:** BFS trên các ô đứng được; từ mỗi ô được nhảy tới ô cách ngang ≤ 3 khi cao hơn 3–4 ô, ≤ 5 khi cao hơn ≤ 2 ô, ≤ 6 khi thấp hơn, kèm kiểm tra khoảng trống trên đầu. Bản đồ không tới được đấu trường sẽ bị sinh lại.

**Hồn Đăng:** 3 mạng mỗi lượt vào; thắp đèn giữa đường để hồi sinh ở đó (hồi 30% máu khi thắp). Rơi vào chất nguy hiểm: mất 15% máu và quay về chỗ đứng an toàn gần nhất. Hết mạng: bị trục xuất, mất 1/4 nguyên liệu. Thua ở đấu trường: thủ lĩnh hồi đầy, cửa mở lại.

**Thủ lĩnh:** mỗi con xoay vòng 3 chiêu, nghỉ 2,4–2,6 s giữa chiêu (×0,72 ở giai đoạn hai, dưới 50% máu, kèm 2 tay sai).

| Thủ lĩnh | Chiêu |
|---|---|
| Thụ Yêu Vương | rễ đâm từ đất (3 vị trí, báo trước) · mưa hạt cong · dậm đất tạo sóng chạy hai bên (nhảy qua) |
| Xích Viêm Long | phun lửa quạt 9 tia · bổ nhào theo dấu đỏ · mưa tàn lửa từ trần |
| Băng Phượng | 12 mũi băng tỏa tròn · lướt ngang theo vệt đỏ · sóng băng chạy dọc nền |
| Lôi Thần Khôi Lỗi | 4–6 cột sét báo trước · sóng xung kích hai bên · gồng rồi lao |

Phần thưởng: mảnh Thiên Bia (lần đầu), 2 tinh hoa, yêu đan, linh thạch, Hồi Khí Đan, cổng trở về.

## 11. Giao diện & hình ảnh

- **HUD**: trái-trên cảnh giới + 4 thanh (sinh lực, linh lực, no bụng, tu vi) + mục tiêu hiện tại; giữa-trên bản đồ dải ngang (vùng, cổng, lửa trại, túi rơi, yêu ma gần); phải-trên ngày/giờ/vùng; giữa-dưới gợi ý tương tác + thanh 8 ô.
- **Túi đồ**: 32 ô (8 ô đầu là thanh nhanh), đổi chỗ bằng hai lần chạm, ô giáp; cột chế tạo nhóm theo trạm, hiện trạm đang ở gần.
- **Hình ảnh**: bầu trời 9 mốc màu theo giờ, mặt trời/trăng/sao, 3 lớp núi + rừng theo vùng có sương, địa hình đường cong mượt viền màu vùng, nhân vật bóng mực khăn choàng màu cảnh giới, vệt chém mực trắng, chữ sát thương, mực văng khi trúng đòn, rung màn hình, ngưng khung khi chém trúng.
- **Ánh sáng**: đêm tối tới 82%, bí cảnh 52%; nguồn sáng: người chơi (mạnh dần theo cảnh giới, đuốc +150), lửa trại (nhấp nháy), đèn lồng, lò, cổng, trận, đuốc & chất nguy hiểm trong bí cảnh, cầu lửa, sét.
- **Âm thanh**: ~40 hiệu ứng tổng hợp; nhạc đàn tranh ngũ cung ngẫu hứng đổi điệu ngày/đêm/bí cảnh/thủ lĩnh.

## 12. Lưu trữ

Khóa `linhvuc_caosinh_save_v1` trong localStorage: hạt giống, ngày/giờ, mục tiêu, người chơi, túi đồ, công trình, túi rơi, tường xây, tài nguyên đã khai thác, bí cảnh đã chinh phục, mảnh đã đặt, thống kê. Lưu khi: mỗi 30 giây ngoài trời, đặt công trình, vào/ra bí cảnh, ngủ, tạm dừng, ẩn tab, đóng trang. Lưu khi đang trong bí cảnh sẽ đặt người chơi trước cổng bí cảnh đó.

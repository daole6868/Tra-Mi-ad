# Tài liệu thiết kế game (GDD) — Vấn Đạo Tiên Đồ 1.0

## 1. Vòng chơi

```
            ┌──────────── Tu luyện thụ động (cả khi offline) ────────────┐
            ▼                                                             │
  Tu vi đầy → Đột phá tiểu cảnh giới → … → Đột phá đại cảnh giới / Thiên kiếp
            ▲                                     │
            │                                     ▼
  Thám hiểm → yêu thú, linh dược, khoáng, kỳ ngộ → Luyện đan / Luyện khí → mạnh hơn
            ▲                                     │
            └── Tông môn, nhiệm vụ, bí cảnh, tháp ┘
  Thọ nguyên cạn hoặc viên mãn → Luân hồi → thiên phú vĩnh viễn → kiếp mới nhanh hơn
```

- **Vòng ngắn (giây–phút):** thám hiểm, chiến đấu, nhặt đồ, đột phá tiểu cảnh giới.
- **Vòng trung (phút–giờ):** luyện đan/khí, cường hóa, nâng công pháp, nhiệm vụ tông môn, bí cảnh, đại cảnh giới.
- **Vòng dài (ngày):** nhiệm vụ ngày, điểm danh, thiên kiếp lớn, Thông Thiên Tháp, luân hồi.

## 2. Nhân vật

### 2.1 Linh căn
| Linh căn | Số hệ | Tốc độ tu luyện | Trọng số xuất hiện |
|---|---|---|---|
| Ngũ Linh Căn | 5 | ×0.8 | 30 |
| Tứ Linh Căn | 4 | ×1.0 | 28 |
| Tam Linh Căn | 3 | ×1.25 | 22 |
| Song Linh Căn | 2 | ×1.6 | 12 |
| Thiên Linh Căn | 1 | ×2.2 | 5 |
| Biến Dị (Lôi/Băng/Phong) | 1 | ×2.5 | 2.5 |
| Hỗn Độn | mọi hệ | ×3.4 | 0.5 |

Công pháp/thần thông cùng hệ linh căn: tu luyện +40%/số hệ, sát thương thần thông +20%. Thiên phú luân hồi "Linh Căn Chuyển Thế" nâng trọng số linh căn tốt theo `w × (1 + 0.3·cấp)^(phẩm/2)`.

### 2.2 Thuộc tính bẩm sinh (2–9 mỗi chỉ số, cộng xuất thân)
- **Ngộ Tính:** tu luyện +4%/điểm, ngộ đạo +10%/điểm
- **Căn Cốt:** sinh lực +5%/điểm, phòng ngự +3%/điểm
- **Khí Vận:** rơi đồ +3%/điểm, đột phá +1%/điểm, bạo kích +0.3%/điểm, kỳ ngộ tốt hơn
- **Thần Thức:** linh lực +6%/điểm, công kích +3%/điểm, bạo kích +0.5%/điểm

Đan dược tăng vĩnh viễn (tối đa 5 lần/kiếp/loại): Tẩy Tủy Đan, Khai Trí Đan, Dưỡng Hồn Đan, Tạo Hóa Đan.

### 2.3 Chỉ số
```
s = hệ số cảnh giới = realm.mult × (1 + 0.15 × tầng)
HP  = (100·s·(1+0.05·Căn Cốt) + trang bị) × (1+HP%) × (1+Toàn%)
MP  = (50·s·(1+0.06·Thần Thức) + trang bị) × (1+MP%) × (1+Toàn%)
ATK = (12·s·(1+0.03·Thần Thức) + trang bị) × (1+Công%) × (1+Toàn%)
DEF = (5·s·(1+0.03·Căn Cốt) + trang bị) × (1+Thủ%) × (1+Toàn%)
Tốc độ = 10 + trang bị; Bạo kích ≤ 75%; Né ≤ 50%; Hút máu ≤ 40%
```
Nguồn gia trì: công pháp, trang bị (chỉ số chính + phụ tố), tông môn (×(1+0.5·cấp bậc)), linh thú, thành tựu, thiên phú luân hồi, buff đan dược, thiên kiếp (+2% toàn chỉ số mỗi lần vượt).

## 3. Cảnh giới

| # | Cảnh giới | Tiểu cảnh | Tu vi tầng đầu | Tăng/tầng | Tu vi/giây gốc | Hệ số chỉ số | Thọ | Cách đột phá |
|---|---|---|---|---|---|---|---|---|
| 0 | Phàm Nhân | 1 | 30 | — | 1 | 1 | 80 | Tự nhiên |
| 1 | Luyện Khí | 9 tầng | 400 | ×1.28 | 2 | 1.6 | 120 | Tự nhiên |
| 2 | Trúc Cơ | 4 kỳ | 16K | ×1.45 | 8 | 5 | 250 | 60% (+30% Trúc Cơ Đan) |
| 3 | Kết Đan | 4 kỳ | 120K | ×1.45 | 30 | 14 | 500 | 50% (+30% Kết Kim Đan) |
| 4 | Nguyên Anh | 4 kỳ | 1.1M | ×1.45 | 120 | 40 | 1.000 | 3 đạo lôi kiếp |
| 5 | Hóa Thần | 4 kỳ | 9.6M | ×1.45 | 500 | 110 | 2.000 | 4 đạo lôi kiếp |
| 6 | Luyện Hư | 4 kỳ | 77M | ×1.45 | 2.000 | 300 | 4.000 | 5 đạo lôi kiếp |
| 7 | Hợp Thể | 4 kỳ | 530M | ×1.45 | 8.000 | 800 | 8.000 | 6 đạo lôi kiếp |
| 8 | Đại Thừa | 4 kỳ | 3.5B | ×1.45 | 30.000 | 2.200 | 15.000 | 7 đạo lôi kiếp |
| 9 | Độ Kiếp | 4 kỳ | 34B | ×1.45 | 120.000 | 6.000 | 30.000 | 8 đạo lôi kiếp |
| 10 | Chân Tiên | 4 kỳ | 250B | ×1.45 | 500.000 | 16.000 | ∞ | Cửu Cửu Thiên Kiếp (9 đạo) |

Tiểu cảnh giới tự đột phá khi tu vi đầy (có thể tắt). Đại cảnh giới phải bấm tay. Tu vi bị chặn ở mức đầy cho tới khi đột phá đại cảnh giới.

**Đột phá theo tỉ lệ:** `tỉ lệ = gốc + 1%·Khí Vận + 5%·số lần thất bại (+30% nếu dùng đan)`. Thất bại: mất 30% tu vi, trọng thương 5 phút (tu luyện ×0.5).

**Thiên kiếp:** tổng sát thương = `1.15 × HP kỳ vọng × hệ số phòng ngự`, chia thành N đạo tăng dần (0.8→1.2). `hệ số phòng ngự = 2·DEF_kỳ vọng / (DEF_kỳ vọng + DEF)` trong [0.4, 1.6]. Đan đột phá −25%, Tị Lôi Phù −30%, mỗi lần thất bại trước −5% (tối đa −25%). Đan hồi phục tự dùng khi đòn kế tiếp có thể chí mạng. Thất bại: −40% tu vi, trọng thương 10 phút. Thành công: +2% toàn chỉ số vĩnh viễn.

## 4. Tốc độ tu luyện
```
tu vi/giây = rate × (1 + 0.1·tầng) × linh căn × (1 + 0.04·Ngộ Tính) × công pháp × (hợp hệ) × động phủ × (1 + Tu luyện%)
            × (1 − 0.5% × đan độc) × (0.5 nếu trọng thương)
công pháp = mult × (1 + 0.08·(tầng − 1));  động phủ = 1 + 0.15·(cấp − 1)
```
Nguồn tu vi khác, đều quy ra **giây tu luyện hiện tại** để không lạm phát:
- Hạ yêu thú: 1.5 giây (tinh anh ×2, thủ lĩnh ×5), giảm khi yêu thú thấp cấp hơn
- Đan tu vi: 2–5 phút (đan thấp giai hơn cảnh giới bị giảm ×0.35 mỗi cấp), +10 đan độc (tự tan 1/phút)
- Bế quan: 30 giây/năm, tiêu hao thọ nguyên; ngộ đạo ×20 giây/năm
- Kỳ ngộ Linh Tuyền 40 giây, Luận Đạo 15 giây; ải bí cảnh 15 giây
- Ngoại tuyến: 80% tốc độ, tối đa 12 giờ (+2 giờ/cấp thiên phú Bế Quan Tâm Pháp)

**Thọ nguyên:** 15 phút thực = 1 năm tuổi. Thọ = (thọ cảnh giới + Thọ Nguyên Đan) × (1 + Thọ%). Hết thọ → tọa hóa → luân hồi.

## 5. Chiến đấu

- **Lượt:** mỗi bên có thanh hành động, đầy 100 thì hành động; tốc độ cao hành động nhiều hơn.
- **Sát thương:** `hệ số × ATK² / (ATK + DEF·(1 − xuyên giáp)) × ngũ hành × (1.2 nếu hợp linh căn) × ±8% × (bạo thương nếu bạo kích)`, trừ vào hộ thuẫn trước.
- **Ngũ hành:** Kim→Mộc→Thổ→Thủy→Hỏa→Kim (khắc +30%, bị khắc −20%). Dị hệ Lôi/Băng/Phong +15% lên ngũ hành thường, ngũ hành đánh dị hệ −10%.
- **Linh lực:** hồi 6%/lượt; thần thông tốn % linh lực tối đa, có hồi chiêu.
- **Thần thông:** cấp 1–10, mỗi cấp +10% hệ số, +2% tỉ lệ hiệu ứng. Trang bị tối đa 4.
- **Tự động:** dùng đan khi HP < 35% / MP < 12% (tối đa 6 lần/trận), ưu tiên hồi máu khi < 50%, hộ thuẫn/buff khi cần, còn lại chọn thần thông sát thương kỳ vọng cao nhất.
- **Thua:** HP còn 1, mất 5% tu vi hiện tại. Tháp và luận võ là thí luyện, không mất gì.
- **Linh thú:** tấn công sau mỗi lượt của chủ (×0.9), mỗi lượt thứ 3 tung tuyệt kỹ (×2.2).

**Hiệu chỉnh yêu thú** — từ chỉ số "người chơi điển hình" `D.expected(gs)` (trang bị cùng giai, Phàm→Linh→Huyền→Địa theo cảnh giới, cường hóa 2×cảnh giới, gia trì +10%/cảnh giới):
```
HP yêu thú  = 4.4 × ATK_kv × (1.4 + 0.35 × cảnh giới) × hệ số loài   (≈ 6–9 lượt để hạ)
ATK yêu thú = nghiệm của x²/(x + DEF_kv) = 5.5% × HP_kv              (≈ 5.5% sinh lực mỗi đòn)
DEF yêu thú = 0.35 × ATK_kv
Tinh anh: HP ×1.6, ATK ×1.12 · Thủ lĩnh: HP ×3, ATK ×1.25, bạo kích 12%
```

## 6. Thế giới

| Bản đồ | Cảnh giới | Thủ lĩnh |
|---|---|---|
| Thanh Vân Sơn Mạch | Luyện Khí 1–4 | Thanh Lang Vương |
| Hắc Phong Lâm | Luyện Khí 5–9 | Hắc Phong Yêu Vương |
| Vạn Thú Cốc | Trúc Cơ | Kim Tình Sư Vương |
| Xích Sa Hoang Mạc | Kết Đan | Thôn Thiên Cự Mãng |
| Băng Phong Tuyết Vực | Nguyên Anh | Băng Phượng |
| Viêm Ngục Hỏa Sơn | Hóa Thần | Xích Viêm Long |
| Thượng Cổ Chiến Trường | Luyện Hư | Ma Thần Tàn Hồn |
| Vô Tận Hải | Hợp Thể | Hải Hoàng |
| Cửu U Ma Vực | Đại Thừa | Cửu U Ma Tôn |
| Thiên Ngoại Hư Không | Độ Kiếp | Hư Không Chi Chủ |
| Tiên Giới Tàn Cảnh | Chân Tiên | Vực Ngoại Thiên Ma |

**Thám hiểm (1.1 giây/lần):** yêu thú 61% (8% tinh anh), linh dược 14%, khoáng 10%, linh thạch 6%, kỳ ngộ 6%, rương báu 3%. Thủ lĩnh khiêu chiến được mỗi 3 phút.

**Rơi đồ khi hạ yêu thú:** linh thạch `4·s`, yêu đan 35%, linh dược 12%, khoáng 8%, trang bị 7% (tinh anh 25%, thủ lĩnh 70%), bí tịch 0.8% (thủ lĩnh 12%), trứng (thủ lĩnh 15%). Tất cả nhân với `1 + rơi đồ%`.

**Kỳ ngộ (17):** Lão Nhân Hấp Hối, Linh Tuyền, Cổ Động Phủ, Tán Tu Chặn Đường, Cổ Thụ Ngộ Đạo, Thương Nhân Bí Ẩn, Tàn Hồn Cao Nhân, Yêu Thú Hộ Bảo, Ma Tu Tàn Sát Thôn Làng, Thiên Tài Địa Bảo, Linh Thú Bị Thương, Gặp Gỡ Đạo Hữu, Trận Pháp Thượng Cổ, Thiên Địa Dị Tượng, Đan Phương Cổ, Đạo Chích, Ngọc Giản Thượng Cổ. Lựa chọn thay đổi thiện duyên (−500…500), ảnh hưởng việc gia nhập chính/ma đạo. Khi tự động thám hiểm có thể chọn tự xử lý theo phương án an toàn.

**Bí cảnh (6):** 5–7 ải, ải lẻ là tinh anh, ải cuối là thủ lĩnh riêng; giữa các ải hồi 25% HP và 30% MP. Thưởng chinh phục: trang bị ≥ Huyền phẩm, linh dược, yêu đan, 35% bí tịch thần thông, 15% bí tịch công pháp, 25% trứng. 3 lượt/ngày (+thiên phú, +Bí Cảnh Lệnh).

**Thông Thiên Tháp:** tầng f có yêu thú cảnh giới `⌊(f−1)/2⌋`; tầng 5n tinh anh, 10n thủ lĩnh; trên tầng 91 mạnh thêm ×1.06 mỗi tầng. Thưởng lần đầu: linh thạch mỗi tầng; 5 tầng: linh dược + yêu đan; 10 tầng: trang bị Huyền+; 30 tầng: trứng; 50 tầng: Tẩy Linh Dịch.

## 7. Nghề tu & vật phẩm

- **Linh dược:** 20 loại (2 mỗi giai). **Khoáng thạch:** 10 loại. **Yêu đan:** 10 giai.
- **Đan dược (30):** hồi phục, tu vi, đột phá (9 loại tương ứng 9 đại cảnh giới), buff, thuộc tính vĩnh viễn, thọ nguyên, giải độc, trị thương, ngộ đạo.
- **Luyện đan:** 30 đan phương mở dần theo cấp 1–20. `tỉ lệ = gốc + 3%·(cấp − cấp yêu cầu) + 0.5%·Khí Vận + Luyện đan%`; 15% ra thêm 1 viên; thất bại vẫn nhận 40% kinh nghiệm.
- **Trang bị:** 6 vị trí (Vũ khí, Pháp y, Đầu quan, Hài, Giới chỉ, Ngọc bội) × 10 giai × 6 phẩm chất (Phàm ×1 · Linh ×1.2 · Huyền ×1.45 · Địa ×1.75 · Thiên ×2.1 · Tiên ×2.5; số phụ tố 0–5). Chỉ số chính `gốc × hệ số giai × phẩm chất × (1 + 7%·cường hóa)`. 12 loại phụ tố, có cả tốc độ tu luyện, rơi đồ, ngộ đạo.
- **Luyện khí:** giai tối đa = min(cảnh giới, 1 + ⌊cấp/2⌋). Phẩm chất ngẫu nhiên, trọng số phẩm i nhân `(1 + thưởng/100)^i`, thưởng = 3·cấp + Luyện khí% + 1.5·Khí Vận.
- **Cường hóa +15:** 100% tới +3, sau đó giảm 5.5%/cấp (tối thiểu 30%); từ +10 thất bại tụt 1 cấp.
- **Phân giải:** trả khoáng thạch (1 + phẩm + cường hóa/3) và 30% giá trị.
- **Động phủ 10 cấp:** tu luyện +15%/cấp, dược viên 2→7 ô, cây lớn nhanh 5%/cấp. Gieo 1 cây thu 2–4 (+cấp/3).
- **Linh thú:** 13 loài, 1–5 sao; 4 loại trứng (2–40 phút); cấp tối đa = cảnh giới chủ + 3; ăn yêu đan `50·2.6^giai` kinh nghiệm; gia trì `hệ số loài × (cấp + 5)`.
- **Công pháp (25):** 6 phẩm, tầng 1–10 bằng ngộ đạo `25·1.7^phẩm·tầng^1.6`. 5 công pháp trấn phái chỉ đổi ở tông môn.

## 8. Tông môn

| Tông môn | Phe | Gia trì gốc (×(1+0.5·cấp bậc)) |
|---|---|---|
| Thanh Vân Môn | Chính | Công +4%, Bạo kích +1% |
| Dược Vương Cốc | Chính | Luyện đan +4%, Sinh lực +3% |
| Thiên Cơ Các | Trung lập | Rơi đồ +5%, Ngộ đạo +5% |
| Vạn Bảo Lâu | Trung lập | Luyện khí +4%, Linh thạch +6% |
| Huyết Ma Tông | Ma | Tu luyện +6%, Hút máu +1% |

Cấp bậc: Ngoại Môn → Nội Môn (150) → Chân Truyền (800) → Hộ Pháp (3.000) → Trưởng Lão (10.000) → Thái Thượng Trưởng Lão (35.000) → Chưởng Môn (120.000 cống hiến tích lũy, kèm yêu cầu cảnh giới). 3 nhiệm vụ luân phiên (diệt yêu, tuần tra, luyện đan, trảm thủ lĩnh, nộp dược/yêu đan, quyên góp), bổng lộc ngày, 5 trận luận võ/ngày, Tàng Bảo Các 20 món.

## 9. Meta

- **Nhiệm vụ chính tuyến:** 30 chương từ Dẫn Khí Nhập Thể đến Chân Tiên Đại Viên Mãn, mỗi chương có gợi ý thao tác — đóng vai trò hướng dẫn tân thủ.
- **Nhiệm vụ ngày:** 5 việc ngẫu nhiên/ngày, mỗi việc +20 năng động; rương 40/60/100 điểm.
- **Điểm danh 7 ngày:** linh thạch, đan dược, ngộ đạo, trứng, Bí Cảnh Lệnh, trang bị Địa phẩm (ngày 7).
- **Thành tựu (46):** gia trì vĩnh viễn, giữ qua luân hồi.
- **Luân hồi:** điểm = `⌊gs^1.6 / 6⌋ + ⌊thành tựu / 3⌋ (+30 nếu đạt Chân Tiên)`. 11 thiên phú (tu luyện, toàn chỉ số, thuộc tính khởi đầu, linh căn, thọ, rơi đồ, ngộ đạo, gia tài, nghề cũ, giới hạn ngoại tuyến, lượt bí cảnh); cấp n tốn n+1 điểm.

## 10. Kinh tế

Linh thạch nhận ~ `4 × hệ số cảnh giới` mỗi yêu thú; giá vật phẩm = `giá gốc × (mult cảnh giới của giai / 1.6)`, bán lại 35%. Chi tiêu chính: luyện khí, cường hóa, động phủ (150 × 3.2^(cấp−1)), đan dược, bí tịch, Kỳ Trân Các. Cống hiến tông môn là tiền tệ riêng cho đan đột phá & công pháp trấn phái. Điểm ngộ đạo dùng nâng công pháp và thần thông.

## 11. Giao diện & trải nghiệm

- Chủ đề "đêm mực ngọc trên núi": nền xanh mực, chữ ngà, điểm vàng kim, son đỏ (ấn triện 道). Phông Cormorant Garamond (tiêu đề) + Be Vietnam Pro (nội dung), có dự phòng hệ thống.
- PC: thanh bên nhân vật + điều hướng nhóm | nội dung | nhật ký. Điện thoại: thẻ nhân vật gọn, thanh điều hướng đáy cuộn ngang, nhật ký dạng ngăn kéo.
- Trang Tu Luyện: hình tu sĩ tọa thiền, vòng hào quang theo màu cảnh giới, đan điền lớn dần theo cảnh giới, hạt linh khí bay vào (canvas, tắt khi giảm chuyển động).
- Huy hiệu đỏ trên menu báo việc cần làm (nhiệm vụ nhận thưởng, dược viên chín, trứng nở, bí cảnh còn lượt, đột phá đại cảnh giới).
- Âm thanh tổng hợp WebAudio (đánh, bạo kích, lên cấp, đột phá, sấm sét), bật/tắt được.

## 12. Lưu trữ

`localStorage` khóa `vandao_tiendo_save_v1`, tự lưu 20 giây + khi ẩn/đóng tab. Xuất/nhập bằng chuỗi base64. `Save.fixup` bổ sung trường thiếu khi nâng phiên bản. Trạng thái chờ chuyển thế được lưu riêng để tải lại trang không mất điểm luân hồi.

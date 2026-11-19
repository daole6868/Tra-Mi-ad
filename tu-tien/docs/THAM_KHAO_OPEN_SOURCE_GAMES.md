# Đánh giá kho `bobeff/open-source-games`

> Nguồn: https://github.com/bobeff/open-source-games · kiểm tra ngày 19/11/2026 · commit mới nhất `3a9ab8f` (25/02/2026, "Add Dead Ascend…", PR #107)

## 1. Kho này là gì

- Một **danh sách tuyển chọn (bookmark cá nhân)** các game mã nguồn mở và các bản làm lại (remake/re-implementation) mã nguồn mở của game thương mại. Kho **không chứa mã game**, chỉ có `README.md` (458 dòng), `CONTRIBUTING.md`, giấy phép **CC0 1.0** (phạm vi công cộng) và một script Python nhỏ `scripts/coauthor.py` để tạo dòng `Co-authored-by` từ tên người dùng GitHub.
- Quy tắc đóng góp: chủ kho chỉ nhận game **họ thấy thú vị**; mỗi game một pull request; giữ thứ tự chữ cái; định dạng `**[Tên](trang_game)** - Mô tả ngắn. [[source]](kho_mã_nguồn)`.
- Khoảng **170 dự án** trong 17 thể loại, cộng 9 danh sách tham khảo khác ở cuối.

| Thể loại | Số mục* | Ví dụ tiêu biểu |
|---|---:|---|
| Bắn súng góc nhìn thứ nhất | 40 | Doom, Quake, Xonotic, Red Eclipse, các bản port Build engine |
| Nhập vai (RPG) | 28 | OpenMW (Morrowind), Daggerfall Unity, DevilutionX (Diablo), Fallout CE, Veloren |
| Chiến thuật thời gian thực | 25 | 0 A.D., OpenRA, Warzone 2100, Mindustry, Beyond All Reason |
| Platformer | 14 | VVVVVV, Super Mario 64 (decompile), DDraceNetwork, Frogatto & Friends |
| Chiến thuật theo lượt | 13 | Battle for Wesnoth, Freeciv, Unciv, fheroes2, VCMI, OpenXcom |
| Đua xe | 12 | SuperTuxKart, Speed Dreams, wipEout rewrite |
| Xây dựng thành phố | 10 | Julius (Caesar III), micropolisJS, IsoCity |
| Góc nhìn thứ ba | 8 | OpenLara, OpenRW (GTA III), Tomb Engine |
| Roguelike | 7 | NetHack, Dungeon Crawl Stone Soup, Shattered Pixel Dungeon, Cataclysm: DDA |
| Phiêu lưu | 6 | ScummVM, Endless Sky, Zelda 3 |
| Kinh doanh / Tycoon | 5 | OpenTTD, OpenRCT2, CorsixTH |
| Giải đố | 3 | Whatajong (mạt chược roguelike), Portal64, BlockOut II |
| Còn lại (hành động, sandbox, shoot'em up, thể thao, thủ thành) | 7 | Hypersomnia, Taisei (fangame Touhou), Server Survival |

\* Số mục tính cả mục con (ví dụ các bản port của cùng một game).

**Nơi lưu mã nguồn:** 159/183 liên kết `[[source]]` trỏ tới GitHub; còn lại là Codeberg (5), GitLab (4), SourceForge (4) và một số máy chủ riêng.

## 2. Kết quả kiểm tra chất lượng danh sách

**Liên kết:** thử `git ls-remote` ẩn danh với cả 158 kho GitHub khác nhau trong danh sách → **157 truy cập được**, **1 không truy cập được**: `Open-KO/KnightOnline` (mục OpenKO). Kho này có thể đã bị xóa, đổi tên hoặc chuyển sang riêng tư; chưa xác minh được trên giao diện web.

**Lỗi nội dung phát hiện được:**

| # | Vị trí | Vấn đề |
|---|---|---|
| 1 | Role-Playing games → **GemRB** | Liên kết `[[source]]` trỏ tới bài Wikipedia "Infinity Engine" chứ không phải kho mã nguồn GemRB |
| 2 | Racing games → **Dust Racing 2D** | `[[source]]` trỏ tới `cflavio/yorg` (kho của game Yorg), trong khi tiêu đề trỏ tới `juzzlin/DustRacing2D` — có vẻ chép nhầm |
| 3 | Turn-Based strategies → **Ancient Beast** | Tên không in đậm như các mục khác |
| 4 | Mục lục | Ghi "Tower Defense games" nhưng tiêu đề là "Tower Defence games" (liên kết vẫn chạy) |
| 5 | Thứ tự chữ cái | "NetHack" đứng trước "Meritous" (Roguelikes); "wipEout" đứng sau "Yorg" (Racing) — trái quy tắc của chính kho |

Đây là các lỗi nhỏ, có thể gửi pull request sửa lên kho gốc nếu muốn.

## 3. Lưu ý pháp lý trước khi tham khảo

- **Nhiều mục là bản dịch ngược / làm lại của game thương mại** (Zelda 3, Super Mario 64, Zelda: Twilight Princess, RE3/GTA III–VC, Doom 64, Diablo…). Phần mã có thể mở nhưng **dữ liệu game (hình, âm thanh, bản đồ) vẫn thuộc bản quyền hãng gốc** và người chơi phải tự có bản gốc. Không nên dùng làm nền cho sản phẩm của mình.
- **Giấy phép "lây nhiễm"**: nhiều dự án dùng GPL/AGPL. Chép mã của chúng vào Vấn Đạo Tiên Đồ sẽ buộc cả game phải phát hành theo GPL/AGPL. Với các dự án MIT/MPL thì dễ hơn nhưng vẫn phải giữ ghi công. → **Chỉ học ý tưởng thiết kế, không chép mã.**
- Bản thân Vấn Đạo Tiên Đồ hiện **chưa có tệp giấy phép**. Nếu muốn người khác đóng góp hoặc muốn gửi game vào các danh sách như thế này, nên chọn một giấy phép (ví dụ MIT cho mã).

## 4. Liên quan tới Vấn Đạo Tiên Đồ

**Không có game tu tiên / huyền huyễn phương Đông nào** trong danh sách, cũng **không có game nhàn rỗi (idle/incremental)**. Vấn Đạo Tiên Đồ không trùng thể loại với mục nào — đây là khoảng trống.

Các dự án đáng tham khảo nhất (giấy phép và ngôn ngữ đọc trực tiếp từ kho mã nguồn ngày 19/11/2026):

| Dự án | Thể loại | Công nghệ | Giấy phép | Điều Vấn Đạo Tiên Đồ có thể học |
|---|---|---|---|---|
| **Unciv** | Chiến thuật lượt (Civ V) | Kotlin, luật chơi dạng JSON | MPL-2.0 | Bộ luật chơi tách thành tệp JSON, người chơi tự viết mod → tách `js/data/*` thành JSON để hỗ trợ mod |
| **Cataclysm: DDA** | Roguelike sinh tồn | C++, ~6.800 tệp JSON | CC BY-SA 3.0 | Nội dung khổng lồ hoàn toàn dữ liệu hóa: vật phẩm, quái, công thức chế tạo đều là JSON |
| **OpenNefia** | Roguelike (Elona) | C#, YAML + Lua | MIT | Engine dựng lại để mod bằng YAML/Lua; Elona là roguelike Nhật nhiều hệ thống đan xen như game tu tiên |
| **Shattered Pixel Dungeon** | Roguelike | Java | GPL-3.0 | Hầm ngục sinh ngẫu nhiên, vật phẩm chưa nhận diện → bí cảnh nhiều tầng sinh ngẫu nhiên, đan dược "chưa giám định" |
| **Dungeon Crawl Stone Soup** | Roguelike | C++ | GPL-2.0 | Hệ thống thần linh có giới luật và độ sùng kính → tông môn có môn quy, vi phạm bị phạt |
| **Brogue CE** | Roguelike | C | AGPL-3.0 | Giao diện tối giản mà rõ thông tin |
| **Battle for Wesnoth** | Chiến thuật lượt | C++, WML | GPL-2.0 | Giờ trong ngày ảnh hưởng phe chính/tà → giờ âm dương tăng giảm sức mạnh theo thiện duyên |
| **Athena Crisis** | Chiến thuật lượt | TypeScript/React | MIT | Game chiến thuật theo lượt hiện đại chạy trên web: tham khảo hoạt ảnh và cách tổ chức giao diện |
| **Ancient Beast** | Chiến thuật lượt online | TypeScript | AGPL-3.0 | Game theo lượt chơi trên trình duyệt, đấu online |
| **Whatajong** | Mạt chược solitaire kiểu roguelike | TypeScript | MIT | Phong cách phương Đông trên web, kết hợp giải đố với tiến trình roguelike |
| **Taisei Project** | Shoot'em up (fangame Touhou) | C | MIT (mã) | Thẩm mỹ Đông Á, nhiều "thần thông" đẹp mắt |
| **micropolisJS**, **OpenPanzer** | Mô phỏng / chiến thuật | JavaScript | GPL-3.0 / GPL-2.0+ | Game JS thuần trên trình duyệt như Vấn Đạo Tiên Đồ |
| **Server Survival**, **IsoCity** | Thủ thành / xây thành phố | JS / TypeScript | MIT | Game web nhỏ gọn, triển khai tĩnh |
| **Mindustry** | Sandbox thủ thành | Java | GPL-3.0 | Dây chuyền sản xuất → luyện đan/luyện khí theo chuỗi nguyên liệu |

## 5. Đề xuất cho các bản cập nhật tiếp theo

Xếp theo giá trị / công sức:

1. **Tách dữ liệu sang JSON + hỗ trợ mod** (theo Unciv, Cataclysm, OpenNefia). Hiện dữ liệu đã nằm riêng trong `js/data/`, nên chủ yếu là đổi định dạng và viết bộ nạp.
2. **Bí cảnh sinh ngẫu nhiên** nhiều tầng, chọn đường rẽ, có rương và bẫy (theo Shattered Pixel Dungeon / Brogue) thay cho chuỗi ải cố định.
3. **Giờ âm dương**: theo giờ thật, ban ngày tăng hệ Hỏa/Kim, ban đêm tăng Thủy/ma đạo (theo Wesnoth).
4. **Môn quy tông môn**: mỗi tông môn có điều cấm (ví dụ Thanh Vân cấm cướp bóc trong kỳ ngộ), vi phạm mất cống hiến, giữ đúng được gia trì thêm (theo DCSS).
5. **Đan dược chưa giám định** từ kỳ ngộ, phải dùng thử hoặc thuê đan sư giám định.
6. **Thêm tệp giấy phép** cho dự án. Sau đó có thể cân nhắc gửi Vấn Đạo Tiên Đồ vào các danh sách mở (lưu ý kho này chỉ nhận game chủ kho thấy thú vị).

## 6. Các danh sách khác được giới thiệu

Awesome Game Remakes · Awesome Open Source Games · Games on GitHub · Libre Game Wiki · danh sách engine thay thế trên diễn đàn OpenMW · trilarion "List of Open Source Games" · Mac Source Ports · Open Source Game Clones (osgameclones.com) · Wikipedia "List of open-source video games".

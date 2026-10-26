'use strict';
/* Kỳ ngộ ngẫu nhiên khi thám hiểm */

const Events = {
  /* Mỗi sự kiện: text(ctx), choices[{label(ctx), can(ctx)->true|lý do, run(ctx)->{text, fight?}}], auto(ctx)->index */
  list: [
    {
      id: 'lao_gia', title: 'Lão Nhân Hấp Hối', icon: '🧓', w: 10,
      text: () => 'Bên vệ đường, một lão giả râu tóc bạc phơ nằm thoi thóp, bên hông đeo một túi trữ vật cũ kỹ. Lão yếu ớt đưa tay về phía ngươi…',
      choices: [
        { label: () => 'Cứu chữa (tốn 1 Hồi Khí Đan)', can: () => Inv.has('hoi_khi_dan') || 'Cần 1 Hồi Khí Đan',
          run: (c) => {
            Inv.remove('hoi_khi_dan', 1); Player.addKarma(10);
            const r = Math.random();
            if (r < 0.4) {
              const pool = Object.keys(D.techniques).filter((id) => !D.techniques[id].sect && D.techniques[id].grade >= 1 && D.techniques[id].grade <= Math.min(3, 1 + Math.floor(c.tier / 3)));
              const id = 'book_t_' + U.pick(pool);
              Inv.add(id, 1);
              return { text: 'Lão giả hồi tỉnh, cảm kích tặng ngươi một quyển ' + D.items[id].name + '. Thiện duyên +10.' };
            }
            if (r < 0.8) {
              const ins = Math.floor(60 * (1 + G.player.realm)); G.player.insight += ins;
              return { text: 'Lão giả truyền cho ngươi chút tâm đắc tu luyện cả đời. Ngộ đạo +' + ins + '. Thiện duyên +10.' };
            }
            const n = Player.gainStones(25 * c.s);
            return { text: 'Lão giả cảm tạ, để lại ' + U.fmt(n) + ' linh thạch rồi hóa thành làn khói xanh biến mất. Thiện duyên +10.' };
          } },
        { label: () => 'Lấy túi trữ vật',
          run: (c) => {
            Player.addKarma(-15);
            if (Math.random() < 0.25) {
              return { text: 'Lão giả bất ngờ bật dậy cười gằn — hóa ra là ma tu giả chết dụ người! Thiện duyên -15.',
                fight: { mon: 'ma_tu', gs: c.gs, elite: true, reward: () => ({ stones: 30 * c.s }) } };
            }
            const n = Player.gainStones(30 * c.s);
            return { text: 'Ngươi lấy túi trữ vật, bên trong có ' + U.fmt(n) + ' linh thạch. Thiện duyên -15.' };
          } },
        { label: () => 'Rời đi', run: () => ({ text: 'Ngươi lắc đầu bỏ đi. Tu tiên giới hiểm ác, cẩn thận vẫn hơn.' }) },
      ],
      auto: () => (Inv.has('hoi_khi_dan', 3) ? 0 : 2),
    },
    {
      id: 'linh_tuyen', title: 'Linh Tuyền Ẩn Giấu', icon: '⛲', w: 10,
      text: () => 'Sau thác nước, ngươi phát hiện một hồ linh tuyền tỏa khói trắng, linh khí nồng đậm gấp mười lần bên ngoài.',
      choices: [
        { label: () => 'Ngâm mình tu luyện',
          run: () => {
            const st = Player.stats();
            G.player.hp = st.hp; G.player.mp = st.mp;
            if (Player.canBreak()) return { text: 'Linh tuyền gột rửa thân thể, sinh lực và linh lực hồi phục hoàn toàn.' };
            const tv = Player.cultRate() * 40; Player.gainTuVi(tv);
            return { text: 'Linh khí tràn vào kinh mạch. Tu vi +' + U.fmt(tv) + ', sinh lực hồi phục hoàn toàn.' };
          } },
        { label: () => 'Thu thập linh thủy',
          run: () => { Inv.add('hoi_linh_dan', 2); Inv.add('hoi_khi_dan', 1); return { text: 'Ngươi luyện linh thủy thành 2 Hồi Linh Đan và 1 Hồi Khí Đan.' }; } },
      ],
      auto: () => 0,
    },
    {
      id: 'co_dong_phu', title: 'Cổ Động Phủ', icon: '🕳️', w: 8,
      text: () => 'Một cửa đá phủ đầy rêu xanh hé mở sau vách núi. Bên trong le lói ánh sáng của cấm chế thượng cổ.',
      choices: [
        { label: () => 'Tiến vào thám hiểm',
          run: (c) => {
            if (Math.random() < 0.55) {
              const txt = Loot.give(Explore.chestReward(c.tier, true));
              return { text: 'Chủ nhân động phủ đã tọa hóa từ lâu. Ngươi thu được: ' + txt.join(', ') + '.' };
            }
            return { text: 'Một khôi lỗi thủ hộ bừng tỉnh, mắt đỏ rực lao về phía ngươi!',
              fight: { mon: 'khoi_loi', gs: c.gs + 1, elite: true, reward: () => Explore.chestReward(c.tier, true) } };
          } },
        { label: () => 'Rời đi', run: () => ({ text: 'Ngươi ghi nhớ vị trí rồi rời đi.' }) },
      ],
      auto: () => 0,
    },
    {
      id: 'tan_tu', title: 'Tán Tu Chặn Đường', icon: '🥷', w: 10,
      text: () => 'Ba tên tán tu bịt mặt chặn đường: "Để lại linh thạch, tha cho cái mạng!"',
      choices: [
        { label: () => 'Ra tay',
          run: (c) => ({ text: 'Ngươi rút binh khí nghênh chiến!',
            fight: { mon: 'tan_tu', gs: c.gs, elite: true, reward: () => { Player.addKarma(3); return { stones: 15 * c.s, items: { hoi_khi_dan: 1 } }; } } }) },
        { label: () => 'Nộp tiền mãi lộ',
          run: () => { const n = Math.floor(G.player.stones * 0.1); G.player.stones -= n; return { text: 'Ngươi nộp ' + U.fmt(n) + ' linh thạch. Bọn chúng cười lớn bỏ đi.' }; } },
      ],
      auto: () => 0,
    },
    {
      id: 'co_thu', title: 'Cổ Thụ Ngộ Đạo', icon: '🌳', w: 9,
      text: () => 'Một cây cổ thụ vạn năm, lá rơi như mưa vàng. Ngồi dưới gốc cây, tâm thần ngươi bỗng trở nên tĩnh lặng lạ thường.',
      choices: [
        { label: () => 'Tọa thiền ngộ đạo',
          run: () => {
            const a = Player.attrs();
            const ins = Math.floor(50 * (1 + G.player.realm) * (1 + a.ngoTinh * 0.1));
            G.player.insight += ins;
            return { text: 'Ngươi chìm vào cảnh giới vong ngã. Ngộ đạo +' + ins + '.' };
          } },
        { label: () => 'Hái linh quả',
          run: (c) => { const id = U.pick(D.herbsByTier[c.tier]); Inv.add(id, 3); return { text: 'Ngươi hái được 3 ' + D.items[id].name + '.' }; } },
      ],
      auto: () => 0,
    },
    {
      id: 'thuong_nhan', title: 'Thương Nhân Bí Ẩn', icon: '🧙', w: 8,
      prep: (c) => {
        const pool = ['tay_tuy_dan', 'khai_tri_dan', 'duong_hon_dan', 'tho_nguyen_dan', 'boi_nguyen_dan', 'trung_linh_thu', 'ti_loi_phu', 'bi_canh_lenh', 'ngo_dao_dan'];
        if (c.tier >= 3) pool.push('trung_yeu_thu');
        if (c.tier >= 5) pool.push('tao_hoa_dan', 'tay_linh_dich');
        const id = U.pick(pool);
        c.offer = { id, price: Math.floor(Inv.buyPrice(id) * 0.6 * Math.max(1, D.tierPrice(c.tier) / D.tierPrice(D.items[id].tier) * 0.5)) };
      },
      text: (c) => 'Một lão già trùm áo đen ngồi bên tảng đá, trước mặt bày một món đồ: ' + D.items[c.offer.id].icon + ' ' + D.items[c.offer.id].name + '. "Duyên phận… chỉ ' + U.fmt(c.offer.price) + ' linh thạch."',
      choices: [
        { label: (c) => 'Mua (' + U.fmt(c.offer.price) + ' linh thạch)', can: (c) => G.player.stones >= c.offer.price || 'Không đủ linh thạch',
          run: (c) => { Player.spendStones(c.offer.price); Inv.add(c.offer.id, 1); return { text: 'Giao dịch thành công. Ngươi nhận được ' + D.items[c.offer.id].name + '.' }; } },
        { label: () => 'Từ chối', run: () => ({ text: 'Lão già nhún vai, thân ảnh mờ dần trong sương.' }) },
      ],
      auto: () => 1,
    },
    {
      id: 'tan_hon', title: 'Tàn Hồn Cao Nhân', icon: '👻', w: 7,
      text: () => 'Từ chiếc nhẫn cổ dưới đất, một luồng tàn hồn bay ra: "Tiểu hữu, bái ta làm thầy, lão phu truyền cho ngươi tuyệt thế thần thông!"',
      choices: [
        { label: () => 'Bái sư',
          run: (c) => {
            const a = Player.attrs();
            if (Math.random() < 0.5 + a.khiVan * 0.03) {
              const pool = Object.keys(D.skills).filter((id) => !D.skills[id].sect && D.skills[id].tier >= c.tier && D.skills[id].tier <= c.tier + 1);
              const id = 'book_s_' + U.pick(pool.length ? pool : Object.keys(D.skills).filter((x) => !D.skills[x].sect));
              Inv.add(id, 1);
              return { text: 'Tàn hồn quả thật là cao nhân, truyền cho ngươi ' + D.items[id].name + ' rồi tiêu tán vào thiên địa.' };
            }
            const loss = Math.floor(G.player.tuVi * 0.15);
            G.player.tuVi -= loss;
            G.player.injuredUntil = Date.now() + 3 * 60 * 1000;
            return { text: 'Lão quỷ định đoạt xá! Ngươi liều mạng đẩy lùi, tu vi tổn hao ' + U.fmt(loss) + ' và bị trọng thương.' };
          } },
        { label: () => 'Diệt tàn hồn',
          run: () => { Player.addKarma(5); const ins = Math.floor(40 * (1 + G.player.realm)); G.player.insight += ins; return { text: 'Ngươi dùng chân hỏa thiêu diệt tàn hồn, ngộ ra chút đạo lý. Ngộ đạo +' + ins + '.' }; } },
      ],
      auto: () => 1,
    },
    {
      id: 'ho_bao', title: 'Yêu Thú Hộ Bảo', icon: '🐲', w: 9,
      text: () => 'Một gốc linh dược ngàn năm tỏa hào quang rực rỡ, bên cạnh có một yêu thú hung tợn đang ngủ say canh giữ.',
      choices: [
        { label: () => 'Đoạt bảo',
          run: (c) => ({ text: 'Yêu thú bừng tỉnh gầm vang!',
            fight: { mon: 'ho_bao_thu', gs: c.gs + 1, elite: true, reward: () => ({ items: { [U.pick(D.herbsByTier[c.tier])]: 3, [U.pick(D.herbsByTier[Math.min(10, c.tier + 1)])]: 1 } }) } }) },
        { label: () => 'Lén lút hái thuốc',
          run: (c) => {
            const a = Player.attrs();
            if (Math.random() < 0.4 + a.khiVan * 0.03) {
              const id = U.pick(D.herbsByTier[Math.min(10, c.tier + 1)]); Inv.add(id, 1);
              return { text: 'Ngươi nín thở hái được 1 ' + D.items[id].name + ' rồi lặng lẽ rút lui.' };
            }
            return { text: 'Cành khô gãy rắc — yêu thú mở mắt!',
              fight: { mon: 'ho_bao_thu', gs: c.gs + 1, elite: true, reward: () => ({ items: { [U.pick(D.herbsByTier[c.tier])]: 3 } }) } };
          } },
      ],
      auto: () => 0,
    },
    {
      id: 'ma_tu', title: 'Ma Tu Tàn Sát Thôn Làng', icon: '🔥', w: 8,
      text: () => 'Khói lửa bốc lên từ thôn làng dưới chân núi. Một tên ma tu đang hút huyết dân làng để luyện công.',
      choices: [
        { label: () => 'Ra tay cứu giúp',
          run: (c) => ({ text: 'Ngươi quát lớn, lao thẳng về phía ma tu!',
            fight: { mon: 'ma_tu', gs: c.gs, elite: false, reward: () => { Player.addKarma(15); return { stones: 20 * c.s, insight: 20 * (1 + G.player.realm) }; } } }) },
        { label: () => 'Gia nhập cướp bóc', run: (c) => { Player.addKarma(-20); const n = Player.gainStones(25 * c.s); return { text: 'Ngươi cùng ma tu vơ vét, thu được ' + U.fmt(n) + ' linh thạch. Thiện duyên -20.' }; } },
        { label: () => 'Lặng lẽ rời đi', run: () => { Player.addKarma(-2); return { text: 'Ngươi quay mặt bước đi, trong lòng có chút bất an.' }; } },
      ],
      auto: () => 0,
    },
    {
      id: 'bao_vat', title: 'Thiên Tài Địa Bảo Xuất Thế', icon: '🌠', w: 6,
      text: () => 'Hào quang ngút trời, một kiện bảo vật từ lòng đất bay lên! Một thiên kiêu tông môn khác cũng đang lao tới tranh đoạt.',
      choices: [
        { label: () => 'Tranh đoạt',
          run: (c) => ({ text: '"Bảo vật có đức giả cư chi!" — đối phương rút kiếm.',
            fight: { mon: 'doi_thu', gs: c.gs + 1, elite: true, reward: () => ({ gear: [{ tier: c.tier, q: Gear.rollQuality(Player.stats().drop + 50, 3) }] }) } }) },
        { label: () => 'Đứng ngoài quan sát', run: () => { const ins = Math.floor(25 * (1 + G.player.realm)); G.player.insight += ins; return { text: 'Quan sát trận tranh đoạt, ngươi lĩnh hội được đôi chút. Ngộ đạo +' + ins + '.' }; } },
      ],
      auto: () => 1,
    },
    {
      id: 'linh_thu', title: 'Linh Thú Bị Thương', icon: '🦌', w: 7,
      text: () => 'Một con linh thú nhỏ bị bẫy kẹp chân, đôi mắt long lanh nhìn ngươi cầu cứu.',
      choices: [
        { label: () => 'Cứu chữa (tốn 1 Hồi Khí Đan)', can: () => Inv.has('hoi_khi_dan') || 'Cần 1 Hồi Khí Đan',
          run: (c) => {
            Inv.remove('hoi_khi_dan', 1); Player.addKarma(5);
            if (Math.random() < 0.35) {
              const egg = c.tier >= 5 ? 'trung_yeu_thu' : 'trung_linh_thu'; Inv.add(egg, 1);
              return { text: 'Linh thú dẫn ngươi về tổ, tặng ngươi một quả ' + D.items[egg].name + '. Thiện duyên +5.' };
            }
            const id = U.pick(D.herbsByTier[c.tier]); Inv.add(id, 2);
            return { text: 'Linh thú ngậm tới 2 ' + D.items[id].name + ' để tạ ơn. Thiện duyên +5.' };
          } },
        { label: () => 'Lấy yêu đan', run: (c) => { Player.addKarma(-5); Inv.add('yeu_dan_' + c.tier, 2); return { text: 'Ngươi lấy được 2 ' + D.items['yeu_dan_' + c.tier].name + '. Thiện duyên -5.' }; } },
      ],
      auto: () => (Inv.has('hoi_khi_dan', 3) ? 0 : 1),
    },
    {
      id: 'dao_huu', title: 'Gặp Gỡ Đạo Hữu', icon: '🧑‍🤝‍🧑', w: 8,
      text: () => 'Một tu sĩ trẻ tuổi phong thái bất phàm chắp tay: "Đạo hữu, gặp nhau là duyên, chi bằng luận đạo một phen?"',
      choices: [
        { label: () => 'Luận đạo',
          run: () => {
            const ins = Math.floor(30 * (1 + G.player.realm)); G.player.insight += ins;
            let t = 'Hai người đàm đạo suốt đêm. Ngộ đạo +' + ins;
            if (!Player.canBreak()) { const tv = Player.cultRate() * 15; Player.gainTuVi(tv); t += ', tu vi +' + U.fmt(tv); }
            return { text: t + '.' };
          } },
        { label: () => 'Tỷ thí',
          run: (c) => ({ text: '"Tốt! Xin chỉ giáo!"', fight: { mon: 'dong_mon', gs: c.gs, reward: () => ({ stones: 12 * c.s, insight: 20 * (1 + G.player.realm) }) } }) },
      ],
      auto: () => 0,
    },
    {
      id: 'tran_phap', title: 'Trận Pháp Thượng Cổ', icon: '🔯', w: 6,
      text: () => 'Trên mặt đất khắc đầy phù văn, một trận pháp cổ xưa vẫn còn vận chuyển. Trung tâm trận có một hộp ngọc.',
      choices: [
        { label: () => 'Phá trận',
          run: (c) => {
            const a = Player.attrs();
            if (Math.random() < 0.45 + a.thanThuc * 0.03) {
              const n = Player.gainStones(50 * c.s); Inv.add(D.oreByTier[c.tier], 3);
              return { text: 'Thần thức nhìn thấu trận nhãn! Ngươi lấy được ' + U.fmt(n) + ' linh thạch và 3 ' + D.items[D.oreByTier[c.tier]].name + '.' };
            }
            const st = Player.stats();
            G.player.hp = Math.max(1, G.player.hp - st.hp * 0.3);
            G.player.injuredUntil = Date.now() + 3 * 60 * 1000;
            return { text: 'Trận pháp phản phệ! Ngươi mất 30% sinh lực và bị trọng thương.' };
          } },
        { label: () => 'Rời đi', run: () => ({ text: 'Ngươi không dám mạo hiểm.' }) },
      ],
      auto: () => 1,
    },
    {
      id: 'di_tuong', title: 'Thiên Địa Dị Tượng', icon: '🌈', w: 4,
      text: () => 'Bầu trời bỗng hiện cầu vồng bảy sắc, linh khí thiên địa cuồn cuộn đổ xuống nơi ngươi đứng!',
      choices: [
        { label: () => 'Hấp thu linh khí', run: () => { G.player.buffs.cult = { val: 100, until: Date.now() + 300000 }; return { text: 'Tốc độ tu luyện +100% trong 5 phút!' }; } },
      ],
      auto: () => 0,
    },
    {
      id: 'dan_phuong', title: 'Đan Phương Cổ', icon: '📃', w: 6,
      text: () => 'Trong khe đá, ngươi tìm thấy một quyển đan phương ố vàng, ghi chép tâm đắc của một vị đan sư thượng cổ.',
      choices: [
        { label: () => 'Nghiên cứu', run: () => { const e = Math.floor(D.profExp(G.prof.alch.lv) * 0.5); Prof.addExp('alch', e); return { text: 'Thuật luyện đan tiến bộ. Kinh nghiệm luyện đan +' + e + '.' }; } },
        { label: () => 'Bán cho thương hội', run: (c) => { const n = Player.gainStones(15 * c.s); return { text: 'Bán được ' + U.fmt(n) + ' linh thạch.' }; } },
      ],
      auto: () => 0,
    },
    {
      id: 'dao_chich', title: 'Đạo Chích', icon: '🦹', w: 6,
      text: () => 'Có kẻ lén lút thò tay vào túi trữ vật của ngươi rồi bỏ chạy!',
      choices: [
        { label: () => 'Truy đuổi',
          run: (c) => {
            const st = Player.stats(), a = Player.attrs();
            if (Math.random() < 0.35 + st.spd * 0.01 + a.thanThuc * 0.02) {
              const n = Player.gainStones(10 * c.s);
              return { text: 'Ngươi bắt được tên trộm, hắn dâng hết ' + U.fmt(n) + ' linh thạch xin tha.' };
            }
            const n = Math.floor(G.player.stones * 0.05); G.player.stones -= n;
            return { text: 'Tên trộm biến mất trong rừng. Mất ' + U.fmt(n) + ' linh thạch.' };
          } },
        { label: () => 'Bỏ qua', run: () => { const n = Math.floor(G.player.stones * 0.05); G.player.stones -= n; return { text: 'Mất ' + U.fmt(n) + ' linh thạch. Của đi thay người.' }; } },
      ],
      auto: () => 0,
    },
    {
      id: 'ngoc_gian', title: 'Ngọc Giản Thượng Cổ', icon: '📗', w: 5,
      text: () => 'Dưới lớp đất đá, một ngọc giản tỏa sáng mờ ảo. Thần thức chạm vào, vô số chữ cổ hiện lên.',
      choices: [
        { label: () => 'Thần thức thăm dò',
          run: (c) => {
            if (Math.random() < 0.12) {
              const pool = Object.keys(D.techniques).filter((id) => !D.techniques[id].sect && D.techniques[id].grade >= 2 && D.techBookTier[D.techniques[id].grade] <= c.tier + 2);
              if (pool.length) { const id = 'book_t_' + U.pick(pool); Inv.add(id, 1); return { text: 'Đây là một bộ công pháp hoàn chỉnh! Nhận được ' + D.items[id].name + '.' }; }
            }
            const ins = Math.floor(45 * (1 + G.player.realm)); G.player.insight += ins;
            return { text: 'Ngọc giản chỉ còn tàn thiên, nhưng ngươi vẫn lĩnh ngộ được. Ngộ đạo +' + ins + '.' };
          } },
      ],
      auto: () => 0,
    },
  ],

  trigger(m) {
    const ev = U.weighted(Events.list);
    const gs = Explore.monsterGs(m);
    const ctx = { tier: m.tier, gs, s: D.statScale(gs), m };
    if (ev.prep) ev.prep(ctx);
    Stats.add('events');
    if (Explore.auto && G.settings.autoEvents) {
      let idx = ev.auto(ctx);
      const ch = ev.choices[idx];
      if (ch.can && ch.can(ctx) !== true) idx = ev.choices.length - 1;
      Events.choose(ev, ctx, idx, true);
      return;
    }
    UI.eventModal(ev, ctx);
  },

  /** Thực hiện lựa chọn. Trả về kết quả cho UI */
  choose(ev, ctx, idx, auto) {
    const ch = ev.choices[idx];
    if (ch.can) {
      const ok = ch.can(ctx);
      if (ok !== true) return { text: ok, blocked: true };
    }
    const res = ch.run(ctx) || { text: '' };
    Log.add(ev.icon + ' ' + ev.title + ': ' + res.text, 'event');
    Quests.check();
    Ach.check();
    if (auto) {
      if (res.fight) Events.fight(res.fight, ctx);
      else { UI.setExploreStatus && UI.setExploreStatus(ev.icon + ' ' + ev.title + ': ' + res.text); Explore.scheduleAuto(); }
    }
    return res;
  },

  fight(f, ctx) {
    const en = Combat.makeEnemy(f.mon, Math.min(D.MAX_GS + 5, f.gs), { elite: f.elite, tier: ctx.tier });
    Combat.start(en, {
      kind: 'explore', title: 'Kỳ ngộ',
      onWin: () => {
        Stats.add('kills');
        return Loot.give(f.reward ? f.reward() : {});
      },
      onEnd: (b) => {
        if (b.result === 'lose') Explore.setAuto(false);
        if (Explore.auto) Explore.scheduleAuto(1200);
      },
    });
  },
};

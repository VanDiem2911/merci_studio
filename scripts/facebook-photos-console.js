/*
 * Tải ảnh mới nhất của một page Facebook ngay trong Console (F12), dùng luôn phiên đăng nhập sẵn có.
 *
 * Cách dùng
 *   1. Chrome hoặc Edge, đã đăng nhập Facebook, mở (tải lại trang cho sạch):
 *        https://www.facebook.com/mercistudio.official/photos
 *   2. F12 -> tab Console. Lần đầu Chrome chặn dán: gõ tay  allow pasting  rồi Enter.
 *   3. Dán TOÀN BỘ file này -> Enter.
 *   4. Hộp "Chọn thư mục" hiện ra: chọn  docs\research\merci\facebook-photos  (hoặc thư mục bất kỳ),
 *      bấm "Xem tệp" / "Cho phép chỉnh sửa". Không chọn thì ảnh rơi vào thư mục Downloads.
 *   5. Để yên tab đó (đừng chuyển sang tab khác quá lâu). Gõ  window.__merciStop = true  rồi Enter để dừng.
 *
 * Thứ tự: đúng thứ tự lưới ảnh trên tab Ảnh của Facebook (trên cùng = mới nhất). Nó cuộn tab Ảnh để gom
 * danh sách, rồi lần lượt bấm mở từng ảnh trong lưới, đọc ảnh lớn đang hiển thị, đóng lại và tải về.
 * Chỉ lấy ảnh trong lưới (link có set=pb.), bỏ ảnh bìa và ảnh đại diện nằm phía trên lưới (đó là ảnh cũ).
 * Không dùng nút "Ảnh tiếp theo" vì nút đó đi theo thứ tự album, không phải thứ tự lưới.
 * Tên file: 0001_<mã ảnh>.jpg (0001 = ảnh trên cùng). Chạy lại sẽ bỏ qua ảnh đã có trong thư mục đã chọn.
 * Kiểm tra nhanh: file 0001 phải đúng là ảnh trên cùng, bên trái của tab Ảnh.
 * Firefox không có hộp chọn thư mục (File System Access chỉ có trên Chrome / Edge).
 *
 * Đổi số lượng: gõ  window.__MERCI_LIMIT = 200  trước khi dán (mặc định 1000).
 * Chỉ đếm tổng số ảnh, không tải: gõ  window.__MERCI_COUNT_ONLY = true; window.__MERCI_LIMIT = 100000
 * trước khi dán. Nó cuộn hết tab Ảnh rồi báo tổng (rất nhanh, không mở từng ảnh).
 */
(async () => {
  const LIMIT = window.__MERCI_LIMIT || 1000;
  const COUNT_ONLY = !!window.__MERCI_COUNT_ONLY;
  const SCROLL_WAIT = 1500; // ms chờ sau mỗi lần cuộn để Facebook tải thêm ảnh
  const PHOTO_TIMEOUT = 10000; // ms chờ một ảnh mở ra trước khi bỏ qua
  const MIN_WIDTH = 300; // bỏ qua ảnh nhỏ (avatar, icon)

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pad = (n) => String(n).padStart(4, "0");
  const log = (...a) => console.log("%c[MERCI]", "color:#c2410c;font-weight:bold", ...a);
  window.__merciStop = false;

  if (!/(^|\.)facebook\.com$/.test(location.hostname)) {
    log("Hãy mở trang Facebook (…/photos) rồi dán lại script.");
    return;
  }
  const photoId = () =>
    (location.href.match(/[?&]fbid=(\d+)/) || location.pathname.match(/\/photos\/[^/]*\/(\d{8,})/) || [])[1];
  if (photoId()) {
    log("Đang ở trong một ảnh. Tải lại trang https://www.facebook.com/<tên page>/photos rồi dán lại script.");
    return;
  }

  // 1. chọn thư mục (phải gọi ngay, khi còn "thao tác của người dùng")
  let dir = null;
  const have = new Set();
  if (COUNT_ONLY) {
    log("Chế độ chỉ đếm: không tải ảnh.");
  } else if (window.showDirectoryPicker) {
    try {
      dir = await window.showDirectoryPicker({ mode: "readwrite" });
      for await (const [name] of dir.entries()) {
        const m = name.match(/^\d{4}_(\d+)\.(jpg|png|webp)$/);
        if (m) have.add(m[1]);
      }
      log(`Thư mục: ${dir.name} (đã có ${have.size} ảnh, sẽ bỏ qua)`);
    } catch {
      log("Không chọn thư mục: ảnh sẽ tải vào thư mục Downloads của trình duyệt.");
    }
  } else {
    log("Trình duyệt không hỗ trợ chọn thư mục: ảnh sẽ tải vào thư mục Downloads.");
  }

  // 2. gom danh sách ảnh theo đúng thứ tự lưới trên tab Ảnh
  // Lưới ảnh dùng link  photo.php?fbid=...&set=pb.<mã page>...  Ảnh bìa và ảnh đại diện nằm phía trên lưới,
  // có link khác (set=a....), nên phải loại ra, nếu không sẽ lấy nhầm ảnh cũ.
  let usedFallback = false;
  const gridLinks = () => {
    const all = [...document.querySelectorAll('a[href*="fbid="]')];
    const grid = all.filter((a) => /[?&]set=pb\./.test(a.href));
    if (grid.length) return grid;
    usedFallback = all.length > 0;
    return all.filter((a) => a.getBoundingClientRect().width < 400); // bỏ ảnh bìa (rất rộng)
  };
  const order = [];
  const known = new Set();
  const scan = () => {
    for (const a of gridLinks()) {
      const m = a.href.match(/[?&]fbid=(\d+)/);
      if (m && !known.has(m[1])) {
        known.add(m[1]);
        order.push(m[1]);
      }
    }
  };
  // cuộn tới ảnh cuối cùng đã thấy (chạy được với mọi vùng cuộn của Facebook), rồi cuộn thêm một chút
  const scrollToEnd = () => {
    const all = gridLinks();
    if (all.length) all[all.length - 1].scrollIntoView({ block: "end" });
    window.scrollBy(0, 600);
  };
  log("Đang cuộn tab Ảnh để lấy danh sách...");
  let still = 0;
  let last = 0;
  while (order.length < LIMIT && still < 8 && !window.__merciStop) {
    scan();
    if (order.length === last) still++;
    else {
      still = 0;
      last = order.length;
      if (order.length % 50 < 20) log(`Thấy ${order.length} ảnh...`);
    }
    scrollToEnd();
    await sleep(SCROLL_WAIT);
  }
  scan();
  if (usedFallback) log("Cảnh báo: không thấy lưới ảnh kiểu set=pb., đang dùng cách dự phòng. Kiểm tra file 0001 có đúng ảnh mới nhất không.");
  const ids = order.slice(0, LIMIT);
  log(`Tab Ảnh có ${order.length} ảnh${order.length >= LIMIT ? " (dừng ở giới hạn, có thể còn nữa)" : ""}. Sẽ lấy ${ids.length} ảnh đầu (mới nhất).`);
  window.__merciIds = ids;
  if (COUNT_ONLY || ids.length === 0) {
    if (COUNT_ONLY) log(`TỔNG SỐ ẢNH thấy được: ${order.length}.`);
    window.scrollTo(0, 0);
    return;
  }

  // 3. mở từng ảnh trong lưới, đọc ảnh lớn đang hiển thị
  // ảnh đang xem = ảnh Facebook hiển thị to nhất trên màn hình (trang có nhiều hộp thoại khác nhau,
  // nên không dựa vào role="dialog")
  const bigImage = () => {
    let best = null;
    for (const img of document.querySelectorAll("img")) {
      const src = img.currentSrc || img.src;
      if (!/scontent|fbcdn/.test(src) || !img.complete || img.naturalWidth < MIN_WIDTH) continue;
      const r = img.getBoundingClientRect();
      const area = r.width * r.height;
      if (r.width > 200 && (!best || area > best.area)) {
        best = { src, w: img.naturalWidth, h: img.naturalHeight, area };
      }
    }
    return best;
  };
  const waitForPhoto = async (id, prevSrc) => {
    const t0 = Date.now();
    while (Date.now() - t0 < PHOTO_TIMEOUT) {
      const img = photoId() === id ? bigImage() : null;
      if (img && img.src !== prevSrc) {
        await sleep(400); // để ảnh độ phân giải cao thay ảnh mờ
        return bigImage() || img;
      }
      await sleep(250);
    }
    return null;
  };
  const closeViewer = async () => {
    history.back();
    for (let i = 0; i < 16 && photoId(); i++) await sleep(250);
    if (photoId()) {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true }));
      for (let i = 0; i < 12 && photoId(); i++) await sleep(250);
    }
    await sleep(350);
  };

  log("Bắt đầu mở từng ảnh (mỗi ảnh khoảng 2-3 giây)...");
  const items = [];
  let prevSrc = null;
  let misses = 0;
  for (let i = 0; i < ids.length && !window.__merciStop; i++) {
    const id = ids[i];
    if (have.has(id)) {
      items.push({ id, rank: i + 1, skipped: true });
      continue;
    }
    const anchor = document.querySelector(`a[href*="fbid=${id}"]`);
    if (!anchor) {
      log(`Không thấy ảnh ${i + 1} (${id}) trong lưới, bỏ qua.`);
      misses++;
      continue;
    }
    anchor.scrollIntoView({ block: "center" });
    await sleep(250);
    anchor.click();
    const img = await waitForPhoto(id, prevSrc);
    if (!img) {
      log(`Không mở được ảnh ${i + 1} (${id}), bỏ qua.`);
      misses++;
      if (photoId()) await closeViewer();
      if (misses >= 8 && misses > items.length / 2) {
        log("Quá nhiều ảnh không mở được: Facebook có thể đang giới hạn. Dừng lại, thử lại sau.");
        break;
      }
      continue;
    }
    prevSrc = img.src;
    items.push({ id, rank: i + 1, url: img.src, width: img.w, height: img.h });
    if (items.length % 25 === 0) log(`Đã mở ${items.length}/${ids.length} ảnh...`);
    await closeViewer();
    await sleep(500 + Math.random() * 700);
  }
  log(`Mở xong ${items.filter((x) => x.url).length} ảnh (bỏ qua ${items.filter((x) => x.skipped).length} ảnh đã có). Bắt đầu tải...`);

  // 4. tải về
  const manifest = [];
  let ok = 0;
  let skipped = 0;
  let failed = 0;
  for (const it of items) {
    if (window.__merciStop) break;
    if (it.skipped) {
      skipped++;
      continue;
    }
    try {
      const res = await fetch(it.url, { credentials: "omit" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const ext = /webp/.test(blob.type) ? "webp" : /png/.test(blob.type) ? "png" : "jpg";
      const name = `${pad(it.rank)}_${it.id}.${ext}`;
      if (dir) {
        const handle = await dir.getFileHandle(name, { create: true });
        const w = await handle.createWritable();
        await w.write(blob);
        await w.close();
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 15000);
        await sleep(350);
      }
      manifest.push({ rank: it.rank, id: it.id, file: name, width: it.width, height: it.height, bytes: blob.size });
      ok++;
      if (ok % 25 === 0) log(`Đã tải ${ok}...`);
    } catch (e) {
      failed++;
      log(`Lỗi ảnh ${it.rank} (${it.id}): ${e.message}`);
    }
  }

  if (dir && manifest.length) {
    try {
      const handle = await dir.getFileHandle("manifest.json", { create: true });
      const w = await handle.createWritable();
      await w.write(JSON.stringify(manifest, null, 2));
      await w.close();
    } catch {
      /* không ghi được manifest cũng không sao */
    }
  }

  const sizes = manifest.map((m) => Math.max(m.width, m.height)).sort((a, b) => a - b);
  log(
    `XONG. Tải ${ok}, bỏ qua ${skipped} (đã có), lỗi ${failed}, không mở được ${misses}.` +
      (sizes.length ? ` Cạnh dài: nhỏ nhất ${sizes[0]}px, lớn nhất ${sizes[sizes.length - 1]}px.` : ""),
  );
  window.scrollTo(0, 0);
  window.__merciPhotos = manifest;
})();

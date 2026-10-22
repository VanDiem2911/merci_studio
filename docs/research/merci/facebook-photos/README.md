# Facebook photos

Thư mục này chứa ảnh tải về từ https://www.facebook.com/mercistudio.official/photos. Bạn cũng có thể tự thả ảnh vào đây.

## Cách nhanh: dán vào Console (dùng luôn phiên đăng nhập sẵn có)

1. Chrome hoặc Edge đã đăng nhập Facebook, mở https://www.facebook.com/mercistudio.official/photos
2. Chép script vào clipboard (PowerShell, đứng ở thư mục dự án):
   `Get-Content scripts\facebook-photos-console.js -Raw | Set-Clipboard`
3. F12, tab Console, dán, Enter. Hộp chọn thư mục hiện ra: chọn thư mục này (`docs\research\merci\facebook-photos`).
4. Để yên tab đó. Gõ `window.__merciStop = true` rồi Enter để dừng. Chạy lại sẽ bỏ qua ảnh đã có.

Script tự bấm mở ảnh mới nhất rồi bấm "Ảnh tiếp theo" liên tục, nên 1000 ảnh mất khoảng nửa tiếng.
Chỉ đếm tổng số ảnh: gõ `window.__MERCI_COUNT_ONLY = true; window.__MERCI_LIMIT = 100000` rồi dán script.

## Cách khác: chạy bằng Node (có cửa sổ Chrome riêng, phải đăng nhập trong đó)

```bash
npm run fb:photos
```

Lần đầu: một cửa sổ Chrome mở ra, **tự đăng nhập Facebook trong cửa sổ đó** rồi quay lại terminal bấm Enter.
Script không đọc hay lưu mật khẩu; phiên đăng nhập nằm trong `scripts/.fb-profile/` (đã gitignore, đừng gửi cho ai).
Không đăng nhập thì Facebook chỉ cho xem khoảng 80 ảnh.

| Lệnh | Tác dụng |
| --- | --- |
| `npm run fb:photos -- --count-only` | Chỉ đếm số ảnh trang hiển thị, không tải |
| `npm run fb:photos -- --limit 200` | Tải ít hơn |
| `npm run fb:photos -- --quality grid` | Nhanh hơn nhưng chỉ ảnh thu nhỏ trên lưới |
| `npm run fb:photos -- --delay 4000` | Chờ lâu hơn giữa các ảnh (ms) nếu bị Facebook chặn |

- Tên file: `0001_<mã ảnh>.jpg`, số `0001` là ảnh mới nhất. Chạy lại sẽ bỏ qua ảnh đã có (tải tiếp được).
- `manifest.json` ghi kích thước, dung lượng, và `quality` (`full` hoặc `grid`) của từng ảnh.
- `photo-ids.txt` là danh sách mã ảnh theo thứ tự mới nhất.
- 1000 ảnh mất khoảng một giờ. Thất bại 5 ảnh liên tiếp thì script dừng; đợi một lúc rồi chạy lại.
- Nếu bạn là quản trị viên page, "Tải thông tin của bạn" của Facebook là cách chính thức lấy toàn bộ ảnh gốc.

Ảnh ở đây chưa được đưa vào website. Việc nhóm concept và tách ảnh ghép sẽ làm sau khi có ảnh.

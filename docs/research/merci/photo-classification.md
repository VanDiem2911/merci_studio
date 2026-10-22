# Phân loại ảnh MERCI studio

Tạo tự động bởi `scripts/build-merci-assets.py`, đừng sửa tay: sửa `CONCEPTS` trong script rồi chạy lại.

- **Bộ ảnh** = một buổi chụp (cùng trang phục, phông nền, người mẫu).
- **Concept** = chủ đề hiển thị trên một trang của web, gồm một hoặc nhiều bộ ảnh.
- `FB nnn` là số thứ tự ảnh trong `facebook-photos/` (001 = ảnh mới nhất), `Drive nn` là ảnh trong `drive-source/`.
- **Có bản gốc** = có ảnh lớn trong `drive-originals/` (1366 × 2048, ảnh ghép 2000 × 2000): hiện trên web, không phóng.
- **Chờ bản gốc** = chỉ có bản 206 px (hoặc tile ~68 × 97 px): đang ẨN khỏi web cho đến khi có ảnh lớn.

| Concept (slug) | Bộ ảnh | Nguồn | Có bản gốc | Chờ bản gốc |
| --- | --- | --- | ---: | ---: |
| `lily-voan-trang` | Voan ren, corset, ngọc trai | FB 011–020, FB 030–039 | 16 | 4 |
| `lily-voan-trang` | Lily, jeans, găng ren, rèm trắng | FB 021–029 | 7 | 2 |
| `dem-tuyet-hoc-duong` | Áo thủy thủ, blazer, đèn lồng (2 ảnh ghép) | ảnh ghép FB 008, ảnh ghép FB 009 | 0 | 12 |
| `nang-kem-mu-moc` | Mũ móc, váy lanh, phông vàng kem (Drive) | Drive 26, Drive 30, Drive 34, Drive 36 | 0 | 4 |
| `thien-than-canh-den` | Cánh đen, váy dây, giày cao gót | FB 410–423 | 0 | 13 |
| `cuc-vang-nen-xanh` | Khăn caro, tóc ngắn, nền xanh | FB 089–099 | 4 | 7 |
| `cuc-vang-nen-xanh` | Khăn caro, tóc xoăn, nền xanh | FB 243–252 | 0 | 10 |
| `blazer-den` | Blazer đen, tóc nâu dài, nền trắng xám | FB 123–132 | 6 | 4 |
| `blazer-den` | Blazer đen, nơ voan, ghế kim loại | FB 143–152 | 6 | 4 |
| `hong-phan-bong-bay` | Bóng hồng, tai nai, bóng nắng cửa sổ | FB 133–142 | 9 | 1 |
| `do-nen-do` | Nền đỏ, váy đen, hoa hồng đỏ | FB 221–228 | 0 | 8 |
| `nen-hong-non-coi` | Phông hồng, nón cói, váy tulle xanh mint | ảnh gốc 782018454, ảnh gốc 785365100, ảnh gốc 786071279, ảnh gốc 786166952, ảnh gốc 786467918, ảnh gốc 786564723, ảnh gốc 787308226 | 7 | 0 |
| `xuan-sac-hoa-dao` | Áo voan, hoa cài tóc, nền olive (Drive) | Drive 27, Drive 28, Drive 29, Drive 37, Drive 46 | 0 | 5 |
| `bong-den-ca-tinh` | Váy đen, chùm bóng đen (2 ảnh ghép) | ảnh ghép FB 062, ảnh ghép FB 065 | 12 | 0 |
| `thien-than-canh-trang` | Cánh trắng, nền xám, nghiêng mặt | FB 050–059 | 2 | 8 |
| `thien-than-canh-trang` | Cánh trắng, váy ngắn, nền xám | FB 351–360 | 8 | 2 |
| `thien-than-canh-trang` | Cánh trắng, nền đen | FB 435–448 | 0 | 14 |
| `ao-long-nau` | Áo khoác lông nâu, đồ đen, nền xám | FB 100–122 | 5 | 18 |
| `sinh-nhat-bong-so` | Bóng số 25, mũ lưỡi trai xanh | FB 173–180 | 0 | 8 |
| `non-coi-vintage` | Nón cói, váy trắng, ghế gỗ, mèo | FB 263–274 | 10 | 2 |
| `non-coi-vintage` | Nón cói, váy mini, chó poodle | FB 295–302 | 0 | 8 |
| `vuong-mien-bong-den` | Vương miện, bóng đen (4 ảnh ghép) | ảnh ghép FB 063, ảnh ghép FB 069, ảnh ghép FB 403, ảnh ghép FB 409 | 6 | 18 |
| `sage-bang-do-hoa` | Băng đô hoa, nền xanh sage, bể kính | FB 163–172 | 4 | 6 |
| `street-den` | Streetwear đen, mũ lưỡi trai, nền trắng | FB 331–340 | 0 | 10 |
| `lily-vay-trang` | Váy dây trắng, lily, tường xám | FB 080–087 | 7 | 1 |
| `lily-vay-trang` | Váy kem, lily, nền xám | FB 361–371 | 9 | 2 |
| `vay-do-be-thuy-tinh` | Váy voan đỏ, nền kem, bể thủy tinh | FB 040–049 | 7 | 3 |
| `hoa-trang-nang-be` | Hoa trắng, áo hai dây kem, nắng tường be | FB 287–294 | 0 | 8 |
| `cap-doi-ao-den` | Vest đen, váy đen, hoa baby | FB 253–262 | 9 | 1 |
| `no-ruy-bang` | Nơ ruy băng xanh cobalt | FB 181–188 | 8 | 0 |
| `no-ruy-bang` | Ruy băng kem, bánh nhỏ | FB 229–236 | 0 | 8 |
| `so-28-hoc-duong` | Bóng số 28, đồng phục (ảnh ghép) | ảnh ghép FB 068 | 6 | 0 |
| `len-kem-tre-vai` | Áo len trễ vai, tóc búi, nền be | FB 189–200 | 5 | 7 |
| `len-kem-tre-vai` | Áo len trễ vai, mái thưa, hoa đồng tiền hồng | FB 211–220 | 0 | 10 |
| `mu-long-dem-dong` | Mũ lông nâu, tuyết bokeh (ảnh ghép) | ảnh ghép FB 005 | 0 | 6 |
| `vang-chanh` | Váy vàng, chanh, bể kính | FB 341–350 | 0 | 10 |
| `tat-luoi-ao-khoac` | Blazer, tất lưới, nơ đỏ (2 ảnh ghép) | ảnh ghép FB 070, ảnh ghép FB 398 | 0 | 12 |
| `cap-doi-so-mi-trang` | Sơ mi trắng, bé cún, bóng nắng cửa sổ | FB 275–286 | 9 | 3 |
| `doi-bong-den` | Blazer, cà vạt, bóng đen | FB 372–381 | 0 | 10 |
| `mong-mo-bong-trang` | Bóng trắng, váy xếp tầng, hạt sao (2 ảnh ghép) | ảnh ghép FB 060, ảnh ghép FB 064 | 12 | 0 |
| `toc-thang-ao-den` | Áo đen, tóc thẳng dài, nền trắng | FB 424–434 | 0 | 11 |
| `gau-bong-net-ve` | Gấu bông, mèo xám, nét vẽ màu | FB 153–162 | 8 | 2 |
| `giang-sinh` | Đỏ len, áo khoác nâu cây thông, đen bạc (3 ảnh ghép) | ảnh ghép FB 001, ảnh ghép FB 002, ảnh ghép FB 006 | 0 | 18 |
| `long-trang-tuyet` | Mũ lông trắng, khăn len, tuyết (2 ảnh ghép) | ảnh ghép FB 003, ảnh ghép FB 010 | 0 | 12 |
| `ao-len-do-bob` | Áo len đỏ, tóc bob (ảnh ghép) | ảnh ghép FB 400 | 0 | 6 |
| `cuc-hoa-mi` | Khăn họa tiết hoa nhí, cúc họa mi (Drive) | Drive 42, Drive 44, Drive 45, Drive 48 | 0 | 4 |
| `vay-den-banh-trang` | Váy đen, ngọc trai, bánh kem trắng | FB 382–389 | 0 | 8 |
| `hai-nguoi` | Hai người, blazer đen và nâu | FB 201–210 | 0 | 10 |
| `hai-nguoi` | Hai người, áo trắng quần đen | FB 237–242 | 0 | 6 |
| `khan-len-sac-mau` | Khăn xanh cobalt; mũ khăn đỏ, ô đỏ (2 ảnh ghép) | ảnh ghép FB 004, ảnh ghép FB 007 | 0 | 12 |
| `lily-hong-quan-jeans` | Crop top trắng, jeans, lily hồng | FB 321–330 | 6 | 4 |
| `bau-xinh` | Bướm cam, phông xanh rêu đậm | FB 303–312 | 5 | 5 |
| `bau-xinh` | Crop top xám nhạt, jeans | FB 313–320 | 3 | 5 |
| `tiem-an-vat-xanh` | Sơ mi sọc xanh, snack, bánh sừng bò (ảnh ghép) | ảnh ghép FB 074 | 6 | 0 |
| `thu-vang-doi-ta` | Lá khô, áo len kem, bịt tai lông (Drive) | Drive 32, Drive 35, Drive 47 | 0 | 3 |
| `tao-do-ao-trang` | Áo phồng tay trắng, táo đỏ (ảnh ghép) | ảnh ghép FB 071 | 6 | 0 |
| `sinh-nhat-am-ap` | Áo len trễ vai, mũ sinh nhật, bánh nến (ảnh ghép) | ảnh ghép FB 061 | 6 | 0 |
| `cong-chua-du-hoa` | Váy tulle kem, dù cài hoa, lily hồng (2 ảnh ghép) | ảnh ghép FB 073, ảnh ghép FB 077 | 12 | 0 |
| `nang-som-can-mat` | Cận mặt, ánh sáng ấm (Drive) | Drive 24, Drive 25, Drive 31, Drive 39 | 0 | 4 |

Tổng 585 ảnh trong 48 concept: 226 ảnh có bản gốc, 359 ảnh chờ bản gốc.
Trên web: 26 concept. Ẩn 22 concept vì có dưới 4 ảnh nét.

## Cần thêm ảnh gốc (xếp theo concept)

Bỏ ảnh lớn vào thư mục Drive `AnhFB`, rồi chạy `download-drive-folder.py`, `match-originals.py`, `build-merci-assets.py`.

- `lily-voan-trang`: 6 ảnh, FB 015, 025, 029, 033–034, 038
- `dem-tuyet-hoc-duong` (concept đang ẩn): 12 ảnh, ảnh ghép FB 008 (6 tile); ảnh ghép FB 009 (6 tile)
- `nang-kem-mu-moc` (concept đang ẩn): 4 ảnh, Drive 26, 30, 34, 36
- `thien-than-canh-den` (concept đang ẩn): 13 ảnh, FB 410–421, 423
- `cuc-vang-nen-xanh`: 17 ảnh, FB 091, 093, 095–099, 243–252
- `blazer-den`: 8 ảnh, FB 123, 125–126, 129, 144, 146, 148, 151
- `hong-phan-bong-bay`: 1 ảnh, FB 139
- `do-nen-do` (concept đang ẩn): 8 ảnh, FB 221–228
- `xuan-sac-hoa-dao` (concept đang ẩn): 5 ảnh, Drive 27, 28, 29, 37, 46
- `thien-than-canh-trang`: 24 ảnh, FB 050–054, 056, 058–059, 353, 356, 435–448
- `ao-long-nau`: 18 ảnh, FB 101, 103–105, 107–118, 121–122
- `sinh-nhat-bong-so` (concept đang ẩn): 8 ảnh, FB 173–180
- `non-coi-vintage`: 10 ảnh, FB 265, 269, 295–302
- `vuong-mien-bong-den`: 18 ảnh, ảnh ghép FB 069 (6 tile); ảnh ghép FB 403 (6 tile); ảnh ghép FB 409 (6 tile)
- `sage-bang-do-hoa`: 6 ảnh, FB 166, 168–172
- `street-den` (concept đang ẩn): 10 ảnh, FB 331–340
- `lily-vay-trang`: 3 ảnh, FB 085, 361, 363
- `vay-do-be-thuy-tinh`: 3 ảnh, FB 043, 047, 049
- `hoa-trang-nang-be` (concept đang ẩn): 8 ảnh, FB 287–294
- `cap-doi-ao-den`: 1 ảnh, FB 262
- `no-ruy-bang`: 8 ảnh, FB 229–236
- `len-kem-tre-vai`: 17 ảnh, FB 194–200, 211–220
- `mu-long-dem-dong` (concept đang ẩn): 6 ảnh, ảnh ghép FB 005 (6 tile)
- `vang-chanh` (concept đang ẩn): 10 ảnh, FB 341–350
- `tat-luoi-ao-khoac` (concept đang ẩn): 12 ảnh, ảnh ghép FB 070 (6 tile); ảnh ghép FB 398 (6 tile)
- `cap-doi-so-mi-trang`: 3 ảnh, FB 284–286
- `doi-bong-den` (concept đang ẩn): 10 ảnh, FB 372–381
- `toc-thang-ao-den` (concept đang ẩn): 11 ảnh, FB 424–434
- `gau-bong-net-ve`: 2 ảnh, FB 161–162
- `giang-sinh` (concept đang ẩn): 18 ảnh, ảnh ghép FB 001 (6 tile); ảnh ghép FB 002 (6 tile); ảnh ghép FB 006 (6 tile)
- `long-trang-tuyet` (concept đang ẩn): 12 ảnh, ảnh ghép FB 003 (6 tile); ảnh ghép FB 010 (6 tile)
- `ao-len-do-bob` (concept đang ẩn): 6 ảnh, ảnh ghép FB 400 (6 tile)
- `cuc-hoa-mi` (concept đang ẩn): 4 ảnh, Drive 42, 44, 45, 48
- `vay-den-banh-trang` (concept đang ẩn): 8 ảnh, FB 382–389
- `hai-nguoi` (concept đang ẩn): 16 ảnh, FB 201–210, 237–242
- `khan-len-sac-mau` (concept đang ẩn): 12 ảnh, ảnh ghép FB 004 (6 tile); ảnh ghép FB 007 (6 tile)
- `lily-hong-quan-jeans`: 4 ảnh, FB 325–326, 328, 330
- `bau-xinh`: 10 ảnh, FB 303, 307–308, 311–317
- `thu-vang-doi-ta` (concept đang ẩn): 3 ảnh, Drive 32, 35, 47
- `nang-som-can-mat` (concept đang ẩn): 4 ảnh, Drive 24, 25, 31, 39

## Bản trùng, đã loại

- `fb:422` giống hệt `fb:418`
- `fb:088` giống hệt `fb:081`
- `fbc:391` giống hệt `fbc:079`
- `fbc:392` giống hệt `fbc:070`
- `fbc:393` giống hệt `fbc:078`
- `fbc:394` giống hệt `fbc:075`
- `fbc:397` giống hệt `fbc:076`
- `fbc:399` giống hệt `fbc:072`
- `fbc:401` giống hệt `fbc:064`
- `fbc:402` giống hệt `fbc:063`
- `fbc:404` giống hệt `fbc:065`
- `fbc:405` giống hệt `fbc:066`
- `fbc:406` giống hệt `fbc:067`
- `fbc:407` giống hệt `fbc:069`
- `fbc:408` giống hệt `fbc:068`
- `dr:33` giống hệt `dr:32`

## Ảnh ghép không dùng (concept đã có ảnh đơn của cùng buổi chụp)

- ảnh ghép FB 066 → `hong-phan-bong-bay` (ghép theo mắt thường: cùng trang phục, đạo cụ, phông)
- ảnh ghép FB 067 → `sinh-nhat-bong-so` (ghép theo mắt thường: cùng trang phục, đạo cụ, phông)
- ảnh ghép FB 072 → `lily-hong-quan-jeans` (ghép theo mắt thường: cùng trang phục, đạo cụ, phông)
- ảnh ghép FB 075 → `gau-bong-net-ve` (ghép theo mắt thường: cùng trang phục, đạo cụ, phông)
- ảnh ghép FB 076 → `non-coi-vintage` (ghép theo mắt thường: cùng trang phục, đạo cụ, phông)
- ảnh ghép FB 078 → `lily-voan-trang` (ghép theo mắt thường: cùng trang phục, đạo cụ, phông)
- ảnh ghép FB 079 → `vay-do-be-thuy-tinh` (ghép theo mắt thường: cùng trang phục, đạo cụ, phông)
- ảnh ghép FB 390 → `street-den` (ghép theo mắt thường: cùng trang phục, đạo cụ, phông)
- ảnh ghép FB 395 → `no-ruy-bang` (ghép theo mắt thường: cùng trang phục, đạo cụ, phông)
- ảnh ghép FB 396 → `lily-vay-trang` (ghép theo mắt thường: cùng trang phục, đạo cụ, phông)

import imageManifest from "./concept-images.generated.json";
import type { CategorySlug } from "./categories";

export type Mood = "sang-kem" | "dien-anh" | "de-thuong" | "co-dien";
export type Occasion = "sinh-nhat" | "ky-niem" | "chan-dung-ca-nhan" | "cap-doi" | "mua-dong";

export interface ConceptImage {
  src: string;
  width: number;
  height: number;
  /** average colour, used as the placeholder while the photo loads */
  tone: string;
  /** which shoot (bộ ảnh) of the concept this photo belongs to, 1-based; photos of one set are consecutive */
  set?: number;
}

export interface Concept {
  slug: string;
  name: string;
  category: CategorySlug;
  tagline: string;
  story: string;
  props: string[];
  moods: Mood[];
  occasions: Occasion[];
  images: ConceptImage[];
}

export const MOODS: { id: Mood; label: string }[] = [
  { id: "sang-kem", label: "Sáng, kem, nhẹ nhàng" },
  { id: "dien-anh", label: "Tối, điện ảnh" },
  { id: "de-thuong", label: "Đáng yêu, vui nhộn" },
  { id: "co-dien", label: "Cổ điển, lãng mạn" },
];

export const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: "chan-dung-ca-nhan", label: "Chân dung cá nhân" },
  { id: "sinh-nhat", label: "Sinh nhật" },
  { id: "ky-niem", label: "Kỷ niệm, tốt nghiệp" },
  { id: "cap-doi", label: "Chụp cùng người thương" },
  { id: "mua-dong", label: "Mùa đông, Giáng sinh" },
];

type Draft = Omit<Concept, "images">;

/**
 * Names, taglines and stories are first drafts written from what the photos show.
 * Category assignment and grouping are assumptions: edit here, no code changes needed.
 * Which photos belong to which concept (and which shoot inside it) is set in scripts/build-merci-assets.py,
 * see docs/research/merci/photo-classification.md.
 * Order matters: it is the order of the home grid (alternating light and dark shoots).
 */
const DRAFTS: Draft[] = [
  {
    slug: "lily-voan-trang",
    name: "Lily & Voan Trắng",
    category: "chan-dung",
    tagline: "Lãng mạn như buổi sáng đầu tiên",
    story:
      "Voan thêu, corset ren, chuỗi ngọc và những cành lily. Một bộ chân dung thanh khiết trên nền sáng, và một bộ khác ngồi xếp bằng với quần jeans, găng ren giữa rèm trắng.",
    props: ["Voan ren", "Corset ren", "Hoa lily trắng", "Chuỗi ngọc", "Găng tay ren", "Quần jeans"],
    moods: ["sang-kem", "co-dien"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "dem-tuyet-hoc-duong",
    name: "Đêm Tuyết Học Đường",
    category: "nghe-thuat",
    tagline: "Tuyết rơi trên sân trường vắng",
    story:
      "Đồng phục blazer và áo thủy thủ giữa đêm xanh thẫm, tuyết bay, đèn lồng sáng. Khung hình điện ảnh cho ai thích những câu chuyện lặng.",
    props: ["Blazer đồng phục", "Áo thủy thủ", "Đèn lồng", "Bịt tai lông", "Tuyết"],
    moods: ["dien-anh"],
    occasions: ["mua-dong", "chan-dung-ca-nhan"],
  },
  {
    slug: "nang-kem-mu-moc",
    name: "Nắng Kem Mũ Móc",
    category: "concept-ca-nhan",
    tagline: "Một chiều vàng kem, một chiếc mũ đan tay",
    story:
      "Phông vàng kem, váy lanh trắng, mũ móc và bục thạch cao. Dáng ngồi, dáng quỳ, dáng nghiêng đầu, rất lười và rất đẹp.",
    props: ["Mũ móc", "Váy lanh trắng", "Bục thạch cao", "Đĩa trái cây xanh"],
    moods: ["sang-kem", "co-dien"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "thien-than-canh-den",
    name: "Thiên Thần Cánh Đen",
    category: "nghe-thuat",
    tagline: "Bóng đêm cũng có đôi cánh",
    story:
      "Đôi cánh lông vũ đen, váy dây đen và giày cao gót trên phông xám sáng. Tương phản mạnh, dáng nằm, dáng quỳ, dáng nghiêng người: cá tính nhưng vẫn gọn.",
    props: ["Cánh lông vũ đen", "Váy dây đen", "Giày cao gót"],
    moods: ["dien-anh"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "cuc-vang-nen-xanh",
    name: "Cúc Vàng Nền Xanh",
    category: "chan-dung",
    tagline: "Khăn caro, cúc vàng và một nụ cười thật to",
    story:
      "Khăn trùm họa tiết caro nhỏ, những bông cúc vàng và trắng trên nền xanh dương. Hai bộ ảnh tươi sáng, nhiều biểu cảm, nhìn là thấy vui.",
    props: ["Khăn trùm caro", "Cúc vàng", "Cúc trắng", "Nền xanh dương"],
    moods: ["de-thuong"],
    occasions: ["chan-dung-ca-nhan"],
  },
  {
    slug: "blazer-den",
    name: "Blazer Đen",
    category: "chan-dung",
    tagline: "Một chiếc blazer, rất nhiều thần thái",
    story:
      "Blazer đen oversize, ghế kim loại và nền trắng xám; một bộ thêm nơ voan mỏng trước ngực. Tối giản, gọn và hợp ảnh chân dung cá nhân.",
    props: ["Blazer đen", "Ghế kim loại", "Nơ voan", "Tất mỏng"],
    moods: ["dien-anh", "sang-kem"],
    occasions: ["chan-dung-ca-nhan"],
  },
  {
    slug: "hong-phan-bong-bay",
    name: "Hồng Phấn Bóng Bay",
    category: "concept-ca-nhan",
    tagline: "Mây trắng, bóng hồng và một chút tinh nghịch",
    story:
      "Đồ trắng phối bóng hồng pastel dưới bóng nắng cửa sổ, phụ kiện tóc ngộ nghĩnh. Hợp những ai muốn ảnh vui mà vẫn sạch và sáng.",
    props: ["Bóng bay hồng", "Áo khoác trắng", "Phụ kiện tóc", "Bóng nắng cửa sổ"],
    moods: ["de-thuong", "sang-kem"],
    occasions: ["sinh-nhat", "ky-niem"],
  },
  {
    slug: "do-nen-do",
    name: "Đỏ Thẫm Hoa Hồng",
    category: "nghe-thuat",
    tagline: "Đỏ thật đỏ, đen thật đen",
    story:
      "Nền đỏ thẫm, váy hai dây đen và những bông hồng đỏ sẫm. Màu đậm, tương phản mạnh, đúng chất ảnh nghệ thuật.",
    props: ["Nền đỏ", "Váy hai dây đen", "Hoa hồng đỏ sẫm"],
    moods: ["dien-anh", "co-dien"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "nen-hong-non-coi",
    name: "Nền Hồng Nón Cói",
    category: "concept-ca-nhan",
    tagline: "Hồng kẹo, xanh bạc hà và một chiếc nón cói",
    story:
      "Phông hồng kẹo, váy tulle xanh bạc hà, áo ren và chiếc nón cói cài hoa đồng tiền, cánh hoa rải trên sàn. Một bộ ảnh ngọt như kẹo, nhiều dáng ngồi, nằm và chống má.",
    props: ["Nón cói", "Váy tulle xanh mint", "Áo ren", "Hoa đồng tiền", "Phông hồng"],
    moods: ["de-thuong", "sang-kem"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "xuan-sac-hoa-dao",
    name: "Xuân Sắc Hoa Đào",
    category: "co-trang",
    tagline: "Áo voan trắng, tóc cài hoa",
    story:
      "Áo voan dài tay, tóc búi thấp cài hoa nhỏ, nền xanh olive và bình hoa xuân hồng nhạt. Cổ trang theo hướng nhẹ nhàng, dễ mặc, dễ thương.",
    props: ["Áo voan dài tay", "Hoa cài tóc", "Bình hoa xuân"],
    moods: ["co-dien", "sang-kem"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "bong-den-ca-tinh",
    name: "Bóng Đen Cá Tính",
    category: "nghe-thuat",
    tagline: "Đen, gọn và hơi nổi loạn",
    story:
      "Váy đen trơn, chùm bóng đen trên nền xám lạnh và một chiếc bánh nhỏ. Tối giản nhưng đủ để có chất riêng.",
    props: ["Bóng bay đen", "Váy đen", "Bánh kem", "Tất lưới"],
    moods: ["dien-anh"],
    occasions: ["sinh-nhat", "chan-dung-ca-nhan"],
  },
  {
    slug: "thien-than-canh-trang",
    name: "Thiên Thần Cánh Trắng",
    category: "nghe-thuat",
    tagline: "Đôi cánh lông vũ, ánh sáng dịu",
    story:
      "Cánh lông vũ trắng dang rộng, váy trắng ngắn trên nền xám khói, và một bộ dựng trên phông đen để cánh sáng bừng lên. Nhẹ như một giấc mơ.",
    props: ["Cánh lông vũ trắng", "Váy trắng", "Nền xám khói", "Phông đen tương phản"],
    moods: ["sang-kem", "dien-anh"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "ao-long-nau",
    name: "Áo Lông Nâu",
    category: "chan-dung",
    tagline: "Ấm, mềm và rất nhiều dáng",
    story:
      "Áo khoác lông nâu khoác hờ trên đồ đen, tất mỏng, nền xám trung tính. Hơn hai mươi dáng từ ngồi, nằm đến đứng nghiêng, hợp ai thích ảnh thời trang mùa lạnh.",
    props: ["Áo khoác lông nâu", "Áo cổ lọ đen", "Tất mỏng", "Nền xám"],
    moods: ["dien-anh", "co-dien"],
    occasions: ["chan-dung-ca-nhan", "mua-dong"],
  },
  {
    slug: "sinh-nhat-bong-so",
    name: "Sinh Nhật Bóng Số",
    category: "concept-ca-nhan",
    tagline: "Hai mươi lăm, bay lên một chút",
    story:
      "Bóng số trắng in chữ Happy Birthday, mũ lưỡi trai xanh, váy trắng và một chiếc bánh nhỏ trên nền kem. Concept sinh nhật tươi sáng, đổi số theo tuổi của bạn.",
    props: ["Bóng số khổng lồ", "Mũ lưỡi trai", "Bánh kem nhỏ", "Váy trắng"],
    moods: ["de-thuong", "sang-kem"],
    occasions: ["sinh-nhat"],
  },
  {
    slug: "non-coi-vintage",
    name: "Nón Cói Vintage",
    category: "chu-de-rieng",
    tagline: "Nón cói cài hoa, bốt nâu và ghế gỗ",
    story:
      "Váy trắng xoè, nón cói gắn hoa, bốt da nâu, giỏ hoa và chiếc ghế gỗ cong, có bé mèo hoặc bé cún góp mặt. Phong cách đồng quê cổ điển, nhiều dáng để chọn.",
    props: ["Nón cói", "Bốt da nâu", "Ghế gỗ cong", "Giỏ hoa", "Thú cưng"],
    moods: ["co-dien", "sang-kem"],
    occasions: ["ky-niem", "chan-dung-ca-nhan"],
  },
  {
    slug: "vuong-mien-bong-den",
    name: "Vương Miện Bóng Đen",
    category: "nghe-thuat",
    tagline: "Nữ hoàng lạnh giữa chùm bóng đen",
    story:
      "Mũ vương miện trắng đen, vương miện gai đen, váy tulle và chùm bóng đen trên nền xám bạc. Một buổi sinh nhật theo kiểu nữ hoàng.",
    props: ["Vương miện", "Bóng bay đen", "Váy tulle đen", "Blazer đen", "Nơ voan"],
    moods: ["dien-anh"],
    occasions: ["sinh-nhat", "ky-niem"],
  },
  {
    slug: "sage-bang-do-hoa",
    name: "Băng Đô Hoa Nền Sage",
    category: "chan-dung",
    tagline: "Xanh sage, hoa nhí và một bể kính",
    story:
      "Nền xanh sage dịu, áo cổ lọ xám mỏng, băng đô hoa nhí và bình hoa hồng phấn, thêm bể kính thủy tinh làm đạo cụ. Tươi, mềm, hơi mơ.",
    props: ["Băng đô hoa", "Áo cổ lọ xám", "Bể kính", "Hoa hồng phấn"],
    moods: ["de-thuong", "co-dien"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "street-den",
    name: "Đen Đường Phố",
    category: "nghe-thuat",
    tagline: "Mũ lưỡi trai, quần thể thao, ánh nhìn lạnh",
    story:
      "Áo ngực thể thao, quần thể thao ống rộng, áo khoác đen, mũ lưỡi trai và tai nghe trên phông trắng. Streetwear gọn, tóc mái ngố, nhiều dáng nằm ngồi.",
    props: ["Quần thể thao", "Mũ lưỡi trai", "Tai nghe", "Áo khoác đen"],
    moods: ["dien-anh", "de-thuong"],
    occasions: ["chan-dung-ca-nhan"],
  },
  {
    slug: "lily-vay-trang",
    name: "Lily Váy Trắng",
    category: "chan-dung",
    tagline: "Một cành lily, một chiếc váy trắng",
    story:
      "Váy dây trắng hoặc váy kem, bó hoa lily và nền xám nhạt. Hai bộ ảnh cùng tinh thần: sạch, sáng, để nét mặt và đôi tay ôm hoa làm trọng tâm.",
    props: ["Hoa lily trắng", "Váy dây trắng", "Váy kem", "Nền xám nhạt"],
    moods: ["sang-kem", "co-dien"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "vay-do-be-thuy-tinh",
    name: "Váy Đỏ Bể Thủy Tinh",
    category: "nghe-thuat",
    tagline: "Voan đỏ trên nền kem",
    story:
      "Váy voan đỏ trễ vai, ga giường trắng kem, bông đồng tiền đỏ và chiếc bể thủy tinh đựng hoa. Ấm, gợi cảm và rất điện ảnh.",
    props: ["Váy voan đỏ", "Hoa đồng tiền đỏ", "Bể thủy tinh", "Ga giường kem"],
    moods: ["dien-anh", "co-dien"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "hoa-trang-nang-be",
    name: "Hoa Trắng Nắng Be",
    category: "chan-dung",
    tagline: "Nắng xiên qua bức tường be",
    story:
      "Áo hai dây kem, bó hoa trắng và vệt nắng xiên trên tường be. Ảnh nhẹ, ấm, hợp tóc búi gọn và dáng giơ tay mơ màng.",
    props: ["Hoa trắng", "Áo hai dây kem", "Ánh nắng cửa sổ"],
    moods: ["sang-kem", "co-dien"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "cap-doi-ao-den",
    name: "Đôi Ta Áo Đen",
    category: "chu-de-rieng",
    tagline: "Hai sắc đen và một bó hoa nhí",
    story:
      "Bộ vest đen và chiếc váy đen buộc dây trên phông trắng, bó hoa baby làm điểm nhấn. Dáng ôm, tựa vai, cầm máy ảnh chụp lại nhau, tự nhiên như một buổi hẹn.",
    props: ["Vest đen", "Váy buộc dây", "Hoa baby trắng", "Máy ảnh nhỏ"],
    moods: ["dien-anh", "sang-kem"],
    occasions: ["cap-doi", "ky-niem"],
  },
  {
    slug: "no-ruy-bang",
    name: "Nơ Ruy Băng",
    category: "concept-ca-nhan",
    tagline: "Dải ruy băng dài trên mái tóc",
    story:
      "Váy trắng mỏng và những dải ruy băng dài, lúc xanh cobalt lúc trắng kem, buộc nơ trên tóc hoặc rải trên sàn. Vừa dịu vừa tinh nghịch, một bộ có thêm chiếc bánh nhỏ.",
    props: ["Ruy băng xanh", "Ruy băng kem", "Váy trắng", "Bánh kem nhỏ"],
    moods: ["de-thuong", "sang-kem"],
    occasions: ["sinh-nhat", "chan-dung-ca-nhan"],
  },
  {
    slug: "so-28-hoc-duong",
    name: "Số 28 Học Đường",
    category: "concept-ca-nhan",
    tagline: "Đồng phục, bóng số và nền xám khói",
    story:
      "Áo len đen, váy xếp ly, vớ trắng và những quả bóng số khổng lồ. Hợp ảnh tuổi mới hoặc kỷ yếu theo hướng cá tính.",
    props: ["Bóng số khổng lồ", "Đồng phục", "Vớ trắng"],
    moods: ["dien-anh", "de-thuong"],
    occasions: ["sinh-nhat", "ky-niem"],
  },
  {
    slug: "len-kem-tre-vai",
    name: "Len Kem Trễ Vai",
    category: "chan-dung",
    tagline: "Áo len kem, gò má ửng hồng",
    story:
      "Áo len kem trễ vai trên nền be nâu, má hồng nhẹ, đôi khi thêm một bông đồng tiền hồng. Ảnh cận mặt, dáng tay chống má, tóc búi hoặc mái thưa.",
    props: ["Áo len trễ vai", "Hoa đồng tiền hồng", "Nền be nâu"],
    moods: ["sang-kem"],
    occasions: ["chan-dung-ca-nhan"],
  },
  {
    slug: "mu-long-dem-dong",
    name: "Mũ Lông Đêm Đông",
    category: "nghe-thuat",
    tagline: "Hơi ấm giữa trời tuyết",
    story:
      "Mũ lông nâu, khăn len, ánh đèn vàng và tuyết bokeh. Những khung cận mặt ấm và tối, đúng kiểu phim mùa đông.",
    props: ["Mũ lông nâu", "Khăn len", "Ánh đèn vàng", "Tuyết bokeh"],
    moods: ["dien-anh"],
    occasions: ["mua-dong", "chan-dung-ca-nhan"],
  },
  {
    slug: "vang-chanh",
    name: "Vàng Chanh Tươi",
    category: "concept-ca-nhan",
    tagline: "Váy vàng, chanh và một bể kính",
    story:
      "Váy hai dây vàng tươi, những lát chanh, bể kính thả chanh trên nền xanh bạc hà nhạt. Mát, tươi, hợp mùa hè và ảnh sinh nhật.",
    props: ["Váy vàng", "Chanh tươi", "Bể kính", "Kẹp tóc ngôi sao"],
    moods: ["de-thuong", "sang-kem"],
    occasions: ["sinh-nhat", "chan-dung-ca-nhan"],
  },
  {
    slug: "tat-luoi-ao-khoac",
    name: "Tất Lưới Áo Khoác",
    category: "nghe-thuat",
    tagline: "Áo khoác tối, tất lưới và mái tóc rối",
    story:
      "Blazer đen, tất lưới (có bộ tất đỏ), nơ đỏ trên tóc búi rối, áo khoác nâu sẫm và móng tay đen. Cá tính, hơi nổi loạn.",
    props: ["Blazer đen", "Tất lưới", "Nơ đỏ", "Móng đen"],
    moods: ["dien-anh"],
    occasions: ["chan-dung-ca-nhan"],
  },
  {
    slug: "cap-doi-so-mi-trang",
    name: "Sơ Mi Trắng & Bé Cún",
    category: "chu-de-rieng",
    tagline: "Hai áo trắng và một bé cún bông xù",
    story:
      "Sơ mi trắng, bóng nắng cửa sổ trên tường và chú cún trắng bông xù. Hai người ôm nhau, cười nhiều, thêm bé cún tham gia khung hình.",
    props: ["Sơ mi trắng", "Bóng nắng cửa sổ", "Thú cưng"],
    moods: ["sang-kem", "de-thuong"],
    occasions: ["cap-doi", "ky-niem"],
  },
  {
    slug: "doi-bong-den",
    name: "Đôi Bóng Đen",
    category: "chu-de-rieng",
    tagline: "Blazer, cà vạt và một chùm bóng đen",
    story:
      "Blazer đen, sơ mi trắng cà vạt và chùm bóng đen trên nền xám. Hai người tạo dáng vui nhộn, từ ôm vai, giơ tay vẫy đến nằm dài trên sàn.",
    props: ["Blazer đen", "Cà vạt", "Bóng bay đen"],
    moods: ["de-thuong", "dien-anh"],
    occasions: ["cap-doi", "ky-niem", "sinh-nhat"],
  },
  {
    slug: "mong-mo-bong-trang",
    name: "Mộng Mơ Bóng Trắng",
    category: "concept-ca-nhan",
    tagline: "Trắng kem, bồng bềnh như giấc mơ",
    story:
      "Váy xếp tầng màu kem, bóng trắng, hạt sao lấp lánh và chú gấu bông nhỏ trên nền be. Concept mơ màng, hợp ảnh sinh nhật hoặc kỷ niệm.",
    props: ["Bóng bay trắng", "Váy xếp tầng", "Phụ kiện tóc", "Hạt sao lấp lánh"],
    moods: ["sang-kem", "de-thuong"],
    occasions: ["sinh-nhat", "ky-niem"],
  },
  {
    slug: "toc-thang-ao-den",
    name: "Tóc Thẳng Áo Đen",
    category: "chan-dung",
    tagline: "Mái tóc dài đen thẳng làm trọng tâm",
    story:
      "Áo đen ôm, mái tóc thẳng dài mượt trên phông trắng xám. Tối giản đến mức chỉ còn dáng người, mái tóc và ánh nhìn.",
    props: ["Áo đen ôm", "Tóc thẳng dài", "Phông trắng xám"],
    moods: ["dien-anh", "sang-kem"],
    occasions: ["chan-dung-ca-nhan"],
  },
  {
    slug: "gau-bong-net-ve",
    name: "Gấu Bông & Nét Vẽ",
    category: "concept-ca-nhan",
    tagline: "Tranh vẽ tay, gấu bông và một bé mèo",
    story:
      "Áo xếp ly kem, chân váy nâu, tất nâu, gấu bông và mèo xám trên nền trắng tím, thêm những nét vẽ màu sáp trên kính. Tuổi thơ trở lại trong vài khung hình.",
    props: ["Gấu bông", "Mèo xám", "Nét vẽ màu", "Tất nâu"],
    moods: ["de-thuong"],
    occasions: ["chan-dung-ca-nhan", "ky-niem"],
  },
  {
    slug: "giang-sinh",
    name: "Giáng Sinh",
    category: "chu-de-rieng",
    tagline: "Đỏ, nâu và đen bạc",
    story:
      "Ba kiểu Giáng sinh: váy đỏ len với sợi len trắng, áo khoác lông nâu cùng cây thông và xe đẩy quà, và bộ đen trắng trước bức tường gương bạc.",
    props: ["Cây thông", "Xe đẩy quà", "Mũ ông già Noel", "Áo khoác lông nâu", "Tường gương bạc"],
    moods: ["de-thuong", "sang-kem"],
    occasions: ["mua-dong", "ky-niem"],
  },
  {
    slug: "long-trang-tuyet",
    name: "Lông Trắng Tuyết",
    category: "chan-dung",
    tagline: "Mềm như bông tuyết đầu mùa",
    story:
      "Mũ lông trắng, áo lông xù, khăn len dày trên nền trời xanh và rừng thông phủ tuyết, những hạt tuyết li ti trên tóc.",
    props: ["Mũ lông trắng", "Áo lông xù", "Khăn len trắng", "Tuyết"],
    moods: ["sang-kem"],
    occasions: ["mua-dong", "chan-dung-ca-nhan"],
  },
  {
    slug: "ao-len-do-bob",
    name: "Áo Len Đỏ Tóc Bob",
    category: "chan-dung",
    tagline: "Đỏ tươi, tóc bob và chiếc nơ mảnh",
    story:
      "Áo len đỏ, tóc bob ngắn, khăn voan mỏng quàng cổ và chiếc vương miện giấy đỏ ở vài khung. Cận mặt, màu mạnh, nét ngộ.",
    props: ["Áo len đỏ", "Khăn voan", "Vương miện giấy đỏ"],
    moods: ["de-thuong", "dien-anh"],
    occasions: ["sinh-nhat", "chan-dung-ca-nhan"],
  },
  {
    slug: "cuc-hoa-mi",
    name: "Cúc Họa Mi",
    category: "chan-dung",
    tagline: "Khăn trùm hoa nhí, má hồng và cúc trắng",
    story:
      "Khăn họa tiết hoa nhí, má hồng đậm kiểu Hàn, những bông cúc họa mi cài lên khăn và tay. Chân dung tươi, trong và rất ngọt.",
    props: ["Khăn họa tiết hoa", "Cúc họa mi", "Nhẫn bạc"],
    moods: ["de-thuong", "co-dien"],
    occasions: ["chan-dung-ca-nhan"],
  },
  {
    slug: "vay-den-banh-trang",
    name: "Váy Đen Bánh Trắng",
    category: "chan-dung",
    tagline: "Váy đen, ngọc trai và chiếc bánh nhỏ",
    story:
      "Váy đen dây mảnh, dây chuyền ngọc trai, chiếc bánh kem trắng và cành lông vũ trên phông trắng hồng. Ảnh sinh nhật theo hướng sang, gọn.",
    props: ["Váy đen", "Chuỗi ngọc trai", "Bánh kem trắng", "Lông vũ"],
    moods: ["sang-kem", "dien-anh"],
    occasions: ["sinh-nhat", "chan-dung-ca-nhan"],
  },
  {
    slug: "hai-nguoi",
    name: "Hai Người, Một Khung Hình",
    category: "chu-de-rieng",
    tagline: "Chụp đôi với người bạn muốn giữ lại",
    story:
      "Hai người trong blazer đen và nâu trên nền xám nhạt, hoặc áo trắng quần đen trên phông trắng. Dáng tựa vai, ôm má, ghé sát: những khung hình thân thiết.",
    props: ["Blazer đen và nâu", "Áo trắng quần đen", "Nền xám nhạt"],
    moods: ["sang-kem", "de-thuong"],
    occasions: ["cap-doi", "ky-niem"],
  },
  {
    slug: "khan-len-sac-mau",
    name: "Khăn Len Sắc Màu",
    category: "nghe-thuat",
    tagline: "Xanh cobalt và đỏ tươi giữa trời lạnh",
    story:
      "Khăn len xanh cobalt với găng tay kem; mũ len, khăn và chiếc ô đỏ với đôi má ửng hồng trong tuyết. Hai bộ cận mặt, màu mạnh, mùa đông rất tươi.",
    props: ["Khăn len xanh", "Găng tay kem", "Mũ len đỏ", "Khăn đỏ", "Ô đỏ"],
    moods: ["dien-anh", "de-thuong"],
    occasions: ["mua-dong", "chan-dung-ca-nhan"],
  },
  {
    slug: "lily-hong-quan-jeans",
    name: "Lily Hồng & Jeans",
    category: "chan-dung",
    tagline: "Áo trắng, jeans rộng và hoa lily hồng",
    story:
      "Crop top trắng, quần jeans ống rộng và những bông lily hồng trên nền trắng. Chân dung năng động, tóc xoăn dài buông và ánh nhìn tự tin.",
    props: ["Lily hồng", "Crop top trắng", "Jeans ống rộng"],
    moods: ["sang-kem", "de-thuong"],
    occasions: ["chan-dung-ca-nhan"],
  },
  {
    slug: "bau-xinh",
    name: "Bầu Xinh",
    category: "chu-de-rieng",
    tagline: "Hai bộ ảnh bầu, một tối một sáng",
    story:
      "Một bộ trên phông xanh rêu đậm với bướm cam và cành khô, một bộ crop top xám nhạt với quần jeans trên nền sáng. Dành cho mẹ bầu muốn lưu lại bụng bầu theo cách dịu dàng.",
    props: ["Bướm cam", "Cành khô", "Crop top", "Quần jeans"],
    moods: ["dien-anh", "sang-kem"],
    occasions: ["ky-niem", "chan-dung-ca-nhan"],
  },
  {
    slug: "tiem-an-vat-xanh",
    name: "Tiệm Ăn Vặt Xanh",
    category: "chu-de-rieng",
    tagline: "Áo sơ mi xanh, snack và bánh sừng bò",
    story:
      "Nền trắng sáng, áo sơ mi sọc xanh, gói snack vàng và giỏ bánh. Chủ đề vui, nhìn là muốn cười theo.",
    props: ["Snack", "Bánh sừng bò", "Sơ mi sọc xanh", "Kẹp tóc"],
    moods: ["de-thuong", "sang-kem"],
    occasions: ["ky-niem", "chan-dung-ca-nhan"],
  },
  {
    slug: "thu-vang-doi-ta",
    name: "Thu Vàng Đôi Ta",
    category: "chu-de-rieng",
    tagline: "Hai người, một mùa lá vàng",
    story:
      "Áo len kem, khăn caro, bịt tai lông và cả một thảm lá khô. Concept cho cặp đôi, bạn thân hoặc gia đình nhỏ.",
    props: ["Lá khô", "Áo len kem", "Khăn caro", "Bịt tai lông"],
    moods: ["sang-kem", "de-thuong"],
    occasions: ["cap-doi", "ky-niem", "mua-dong"],
  },
  {
    slug: "tao-do-ao-trang",
    name: "Táo Đỏ Áo Trắng",
    category: "concept-ca-nhan",
    tagline: "Áo trắng phồng tay và những quả táo đỏ",
    story:
      "Áo và quần short trắng, tay phồng, tóc xoăn dài, cầm quả táo đỏ trên phông trắng. Nhẹ, tươi và rất dễ chụp.",
    props: ["Táo đỏ", "Áo phồng tay", "Quần short trắng"],
    moods: ["sang-kem", "de-thuong"],
    occasions: ["chan-dung-ca-nhan"],
  },
  {
    slug: "sinh-nhat-am-ap",
    name: "Sinh Nhật Ấm Áp",
    category: "concept-ca-nhan",
    tagline: "Nến nhỏ, bánh nhỏ, sofa be",
    story:
      "Áo len trễ vai, mũ sinh nhật, chiếc bánh có nến và góc sofa ấm. Một buổi sinh nhật nhẹ, không cần ồn ào.",
    props: ["Bánh kem và nến", "Mũ sinh nhật", "Sofa be", "Áo len trễ vai"],
    moods: ["sang-kem", "de-thuong"],
    occasions: ["sinh-nhat"],
  },
  {
    slug: "cong-chua-du-hoa",
    name: "Công Chúa Dù Hoa",
    category: "nghe-thuat",
    tagline: "Váy voan kem và chiếc dù cài hoa",
    story:
      "Váy tulle phồng màu kem, dù cài hoa, cánh hoa rải trên sàn và những bông lily hồng. Khung hình cổ tích, dịu và sang.",
    props: ["Váy tulle", "Dù cài hoa", "Cánh hoa", "Lily hồng"],
    moods: ["co-dien", "sang-kem"],
    occasions: ["ky-niem", "chan-dung-ca-nhan"],
  },
  {
    slug: "nang-som-can-mat",
    name: "Nắng Sớm Cận Mặt",
    category: "chan-dung",
    tagline: "Gần đến mức thấy từng sợi tóc",
    story:
      "Cận cảnh làn da, ánh nhìn và những sợi tóc lòa xòa dưới ánh sáng ấm. Chân dung gần, dịu và rất thật.",
    props: ["Ánh sáng ấm", "Tóc buông lơi", "Hoa lan trắng"],
    moods: ["sang-kem"],
    occasions: ["chan-dung-ca-nhan"],
  },
];

const manifest = imageManifest as Record<string, ConceptImage[]>;

/**
 * A concept with no photo in the manifest stays in DRAFTS (its copy is kept) but is not shown: the build script leaves
 * out photos that only exist as 206 px thumbnails, and hides a concept until it has enough sharp ones.
 */
export const CONCEPTS: Concept[] = DRAFTS.map((d) => ({
  ...d,
  images: manifest[d.slug] ?? [],
})).filter((c) => c.images.length > 0);

export function getConcept(slug: string): Concept | undefined {
  return CONCEPTS.find((c) => c.slug === slug);
}

export function conceptsByCategory(category: CategorySlug): Concept[] {
  return CONCEPTS.filter((c) => c.category === category);
}

export function adjacentConcepts(slug: string): { prev: Concept; next: Concept } {
  const i = CONCEPTS.findIndex((c) => c.slug === slug);
  const prev = CONCEPTS[(i - 1 + CONCEPTS.length) % CONCEPTS.length];
  const next = CONCEPTS[(i + 1) % CONCEPTS.length];
  return { prev, next };
}

export function coverOf(c: Concept): ConceptImage {
  return c.images[0];
}

/**
 * Photos of the studio, flat, for the diary page. `perConcept` keeps the page light: at most that many photos
 * from each concept, spread evenly across it so every shoot of the concept still shows up.
 */
export function allPhotos(perConcept = Infinity): { concept: Concept; image: ConceptImage; index: number }[] {
  return CONCEPTS.flatMap((concept) => {
    const n = concept.images.length;
    const take = Math.min(n, perConcept);
    return Array.from({ length: take }, (_, k) => {
      const index = take === n ? k : Math.floor((k * n) / take);
      return { concept, image: concept.images[index], index };
    });
  });
}

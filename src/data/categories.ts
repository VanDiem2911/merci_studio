export type CategorySlug =
  | "chan-dung"
  | "nghe-thuat"
  | "co-trang"
  | "concept-ca-nhan"
  | "chu-de-rieng";

export interface Category {
  slug: CategorySlug;
  name: string;
  short: string;
  blurb: string;
}

/** The five services the studio listed, in the order they listed them (concept cá nhân first). */
export const CATEGORIES: Category[] = [
  {
    slug: "concept-ca-nhan",
    name: "Concept cá nhân",
    short: "Cá nhân",
    blurb:
      "Một concept dựng riêng cho sinh nhật, kỷ niệm hay đơn giản là một ngày bạn muốn lưu lại.",
  },
  {
    slug: "nghe-thuat",
    name: "Chụp ảnh nghệ thuật",
    short: "Nghệ thuật",
    blurb: "Bố cục, màu sắc và cảm xúc được dàn dựng như một khung hình điện ảnh.",
  },
  {
    slug: "co-trang",
    name: "Chụp ảnh cổ trang",
    short: "Cổ trang",
    blurb: "Trang phục dịu dàng, tóc cài hoa, không gian hoài cổ.",
  },
  {
    slug: "chan-dung",
    name: "Chụp ảnh chân dung",
    short: "Chân dung",
    blurb: "Ánh sáng mềm, đường nét tự nhiên, để bạn thấy mình đẹp theo cách riêng.",
  },
  {
    slug: "chu-de-rieng",
    name: "Chủ đề & phong cách riêng",
    short: "Chủ đề riêng",
    blurb: "Bạn mang ý tưởng, MERCI dựng bối cảnh, từ mùa lá vàng đến tiệm ăn vặt xanh.",
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

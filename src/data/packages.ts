/**
 * SAMPLE DATA. The studio has not sent its real price list yet.
 * Replace every value below, then set CONTENT_IS_DRAFT = false in site.ts.
 */
export interface Package {
  slug: string;
  name: string;
  tagline: string;
  /** VND, whole dong */
  price: number;
  featured?: boolean;
  items: { label: string; value: string }[];
  perks: string[];
}

export const PACKAGES: Package[] = [
  {
    slug: "mini",
    name: "Mini",
    tagline: "Thử một concept nhỏ",
    price: 349000,
    items: [
      { label: "Concept", value: "1" },
      { label: "Thời gian chụp", value: "30 phút" },
      { label: "Trang phục", value: "1 bộ" },
      { label: "Ảnh chỉnh sửa", value: "5 ảnh" },
    ],
    perks: ["Nhận ảnh gốc qua Drive", "Chọn ảnh ngay tại studio"],
  },
  {
    slug: "classic",
    name: "Classic",
    tagline: "Gói được chọn nhiều nhất",
    price: 690000,
    featured: true,
    items: [
      { label: "Concept", value: "1" },
      { label: "Thời gian chụp", value: "60 phút" },
      { label: "Trang phục", value: "2 bộ" },
      { label: "Ảnh chỉnh sửa", value: "12 ảnh" },
    ],
    perks: ["Nhận ảnh gốc qua Drive", "Chọn ảnh ngay tại studio", "Gợi ý dáng cùng nhiếp ảnh"],
  },
  {
    slug: "premium",
    name: "Premium",
    tagline: "Hai concept, một buổi chụp dài",
    price: 1290000,
    items: [
      { label: "Concept", value: "2" },
      { label: "Thời gian chụp", value: "120 phút" },
      { label: "Trang phục", value: "4 bộ" },
      { label: "Ảnh chỉnh sửa", value: "25 ảnh" },
    ],
    perks: [
      "Nhận ảnh gốc qua Drive",
      "Chọn ảnh ngay tại studio",
      "Gợi ý dáng cùng nhiếp ảnh",
      "Trang điểm tại studio",
    ],
  },
];

export function getPackage(slug: string): Package | undefined {
  return PACKAGES.find((p) => p.slug === slug);
}

export function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

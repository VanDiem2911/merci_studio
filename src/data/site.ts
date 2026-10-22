/** Business facts supplied by the studio. Anything not listed here has NOT been provided yet. */
export const SITE = {
  name: "MERCI studio",
  shortName: "MERCI",
  tagline: "where every shot is a story",
  descriptor: "Tiệm chụp ảnh concept tại TP. Hồ Chí Minh",
  city: "Hồ Chí Minh",
  phoneDisplay: "098 194 91 08",
  phoneTel: "0981949108",
  zaloUrl: "https://zalo.me/0981949108",
  telUrl: "tel:0981949108",
  facebookUrl: "https://www.facebook.com/mercistudio.official",
  messengerUrl: "https://m.me/mercistudio.official",
  mapsUrl:
    "https://www.google.com/maps/place/MERCI+studio+-+Ti%E1%BB%87m+Ch%E1%BB%A5p+%E1%BA%A2nh/@10.8102214,106.6830674,17z",
  mapsEmbedUrl: "https://www.google.com/maps?q=10.8102214,106.6830674&z=16&output=embed",
  url: "https://mercistudio.vn",
} as const;

export const SERVICES = [
  "Chụp ảnh concept cá nhân",
  "Chụp ảnh nghệ thuật",
  "Chụp ảnh cổ trang",
  "Chụp ảnh chân dung",
  "Chụp ảnh theo chủ đề và phong cách riêng",
] as const;

/**
 * Pricing and the About copy are placeholders until the studio sends real figures.
 * While this is true, the pricing page shows a visible "bảng giá minh hoạ" notice.
 * Set to false once packages.ts holds the real prices.
 */
export const CONTENT_IS_DRAFT = true;

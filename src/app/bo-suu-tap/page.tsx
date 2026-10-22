import type { Metadata } from "next";
import { GalleryStrip } from "@/components/sites/merci/gallery-strip";
import { CONCEPTS } from "@/data/concepts";

export const metadata: Metadata = {
  title: "Bộ sưu tập ảnh",
  description: "Lướt qua các bộ ảnh của MERCI studio theo từng concept, mở từng bộ để xem toàn bộ ảnh.",
};

export default function GalleryPage() {
  return <GalleryStrip concepts={CONCEPTS} />;
}

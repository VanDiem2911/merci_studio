import type { Metadata } from "next";
import { ConceptBrowser } from "@/components/sites/merci/concept-browser";
import { CONCEPTS } from "@/data/concepts";

export const metadata: Metadata = {
  title: "Danh sách concept",
  description: "Toàn bộ concept chụp ảnh của MERCI studio: chân dung, nghệ thuật, cổ trang, concept cá nhân và chủ đề riêng.",
};

export default function ConceptIndexPage() {
  return (
    <ConceptBrowser
      concepts={CONCEPTS}
      title="Tất cả concept"
      blurb="Mỗi concept là một bối cảnh đã dựng sẵn: màu, trang phục, đạo cụ và ánh sáng. Chọn một cái bạn thích, hoặc mang ý tưởng riêng đến để MERCI dựng cùng bạn."
    />
  );
}

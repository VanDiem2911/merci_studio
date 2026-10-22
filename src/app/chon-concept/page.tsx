import type { Metadata } from "next";
import { ConceptPicker } from "@/components/sites/merci/concept-picker";

export const metadata: Metadata = {
  title: "Chọn concept",
  description: "Chọn dịp chụp và tông ảnh, MERCI studio gợi ý những concept hợp với bạn rồi chuyển thẳng sang đặt lịch.",
};

export default function PickerPage() {
  return <ConceptPicker />;
}

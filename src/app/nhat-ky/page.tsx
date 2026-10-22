import type { Metadata } from "next";
import { DiaryField, type DiaryPhoto } from "@/components/sites/merci/diary-field";
import { allPhotos } from "@/data/concepts";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Nhật ký ảnh",
  description: "Những khoảnh khắc trong studio MERCI, trôi tự do trên một tấm canvas hoặc xoay trên quả cầu ảnh.",
};

/** Every photo is a DOM node on the canvas and on the sphere, so each concept lends a few instead of all. */
const PHOTOS_PER_CONCEPT = 6;

export default function DiaryPage() {
  const photos: DiaryPhoto[] = allPhotos(PHOTOS_PER_CONCEPT).map(({ concept, image }) => ({
    slug: concept.slug,
    name: concept.name,
    src: image.src,
    width: image.width,
    height: image.height,
    tone: image.tone,
  }));
  return <DiaryField photos={photos} tagline={SITE.tagline} />;
}

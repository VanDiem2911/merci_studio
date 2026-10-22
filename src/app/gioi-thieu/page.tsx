import type { Metadata } from "next";
import { TransitionLink } from "@/components/sites/merci/transition";
import { WipeImage } from "@/components/sites/merci/wipe-image";
import { CATEGORIES } from "@/data/categories";
import { getConcept } from "@/data/concepts";
import { SERVICES, SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "MERCI studio là tiệm chụp ảnh concept ở TP. Hồ Chí Minh. Mỗi buổi chụp được dựng như một câu chuyện nhỏ.",
};

const PHOTOS = [
  ["lily-voan-trang", 3],
  ["mong-mo-bong-trang", 1],
  ["nen-hong-non-coi", 2],
] as const;

export default function AboutPage() {
  const photos = PHOTOS.flatMap(([slug, i]) => {
    const concept = getConcept(slug);
    const image = concept?.images[i];
    return concept && image ? [{ concept, image }] : [];
  });
  return (
    <main className="container-96 pb-20 pt-32 md:pt-40">
      <header className="grid gap-10 md:grid-cols-[1fr_54vw] md:gap-12">
        <h1 className="text-[3rem] leading-none md:text-[5rem] [&::first-letter]:italic">(Giới thiệu)</h1>
        <div className="grid max-w-[40rem] gap-5 text-[1.1rem] leading-relaxed">
          <p>
            MERCI studio là tiệm chụp ảnh ở TP. Hồ Chí Minh, nơi mỗi buổi chụp được dựng như một câu chuyện nhỏ: có bối cảnh,
            có trang phục, có ánh sáng, và có bạn là nhân vật chính.
          </p>
          <p>
            Chúng mình chụp ảnh concept cá nhân, chân dung, ảnh nghệ thuật, cổ trang và những chủ đề riêng do chính bạn gợi ý.
            Từ một ngày sinh nhật, một mùa kỷ niệm, đến đơn giản là một ngày bạn muốn nhớ.
          </p>
          <p>
            Bạn không cần biết tạo dáng. Hãy chọn concept bạn thích, nhắn cho MERCI qua Zalo hoặc Messenger, rồi cùng hẹn một
            khung giờ.
          </p>
          <p className="font-display italic">Hẹn gặp bạn ở studio. — MERCI</p>
        </div>
      </header>

      <section className="mt-16 grid gap-12 md:mt-24 md:grid-cols-[1fr_54vw]">
        <aside className="grid content-start gap-10 md:sticky md:top-32 md:self-start">
          <div className="grid gap-4">
            <h2 className="label">Liên hệ</h2>
            <ul className="grid gap-3 text-[1.05rem]">
              <li>
                <span className="label block">Zalo / điện thoại</span>
                <a className="link-line" href={SITE.zaloUrl} target="_blank" rel="noreferrer">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <span className="label block">Messenger</span>
                <a className="link-line" href={SITE.messengerUrl} target="_blank" rel="noreferrer">
                  m.me/mercistudio.official
                </a>
              </li>
              <li>
                <span className="label block">Facebook</span>
                <a className="link-line" href={SITE.facebookUrl} target="_blank" rel="noreferrer">
                  mercistudio.official
                </a>
              </li>
              <li>
                <span className="label block">Địa điểm</span>
                <a className="link-line" href={SITE.mapsUrl} target="_blank" rel="noreferrer">
                  Xem trên Google Maps
                </a>
              </li>
            </ul>
          </div>
          <TransitionLink href="/dat-lich" className="btn-ink is-solid w-fit">
            Đặt lịch chụp
          </TransitionLink>
        </aside>

        <div className="grid gap-4 md:gap-6">
          {photos.map(({ concept, image }, i) => (
            <div key={image.src} className={i === 1 ? "ml-auto w-[78%]" : i === 2 ? "w-[64%]" : "w-full"}>
              <WipeImage
                src={image.src}
                width={image.width}
                height={image.height}
                tone={image.tone}
                alt={`${concept.name}, ảnh minh hoạ phong cách MERCI`}
                sizes="(max-width: 767px) 92vw, 42vw"
              />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="services" className="mt-20 md:mt-32">
        <h2 id="services" className="label mb-4">
          Dịch vụ
        </h2>
        <ul className="border-b border-ink/20">
          {SERVICES.map((s, i) => {
            const cat = CATEGORIES[i];
            return (
              <li key={s} className="row-item">
                <TransitionLink
                  href={cat ? `/danh-muc/${cat.slug}` : "/concept"}
                  className="grid grid-cols-[2.5rem_1fr] items-baseline gap-4 py-4 text-[1.2rem] md:grid-cols-[4rem_1.5fr_1fr] md:text-[1.45rem]"
                >
                  <span className="font-display text-[1rem] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display">{s}</span>
                  <span className="hidden text-[0.95rem] md:block">{cat?.blurb}</span>
                </TransitionLink>
              </li>
            );
          })}
        </ul>
      </section>

      <p
        aria-hidden="true"
        className="mt-20 select-none text-center font-display text-[22vw] leading-[0.85] tracking-[-0.03em] text-ink/90 md:mt-28"
      >
        merci
      </p>
    </main>
  );
}

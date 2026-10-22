import type { Metadata } from "next";
import { Globe, MessageCircle, Phone } from "lucide-react";
import { TransitionLink } from "@/components/sites/merci/transition";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Nhắn MERCI studio qua Zalo, Messenger hoặc Facebook để hỏi concept, báo giá và hẹn lịch chụp.",
};

const CHANNELS = [
  {
    name: "Zalo",
    detail: SITE.phoneDisplay,
    href: SITE.zaloUrl,
    note: "Nhanh nhất để chốt lịch và gửi ảnh tham khảo.",
    Icon: Phone,
  },
  {
    name: "Messenger",
    detail: "mercistudio.official",
    href: SITE.messengerUrl,
    note: "Nhắn thẳng với page, tiện nếu bạn đã dùng Facebook.",
    Icon: MessageCircle,
  },
  {
    name: "Facebook",
    detail: "MERCI studio",
    href: SITE.facebookUrl,
    note: "Xem thêm ảnh và hoạt động mới của studio.",
    Icon: Globe,
  },
] as const;

export default function ContactPage() {
  return (
    <main className="container-96 pb-20 pt-32 md:pt-40">
      <header className="mb-12 grid max-w-[44rem] gap-4 md:mb-16">
        <h1 className="text-[3rem] leading-none md:text-[5rem] [&::first-letter]:italic">Liên hệ</h1>
        <p className="text-[1.1rem] text-ink-soft">
          Chọn kênh bạn quen dùng. Cứ kể ý tưởng, MERCI sẽ gợi ý concept và hẹn lịch cùng bạn.
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-3">
        {CHANNELS.map(({ name, detail, href, note, Icon }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group grid h-full gap-4 border border-ink/30 p-6 transition-colors duration-500 hover:bg-ink hover:text-cream focus-visible:bg-ink focus-visible:text-cream"
            >
              <Icon className="size-7" aria-hidden="true" strokeWidth={1.4} />
              <span className="grid gap-1">
                <span className="font-display text-[2rem] leading-none">{name}</span>
                <span className="text-[1.05rem]">{detail}</span>
              </span>
              <span className="text-[0.95rem] opacity-75">{note}</span>
            </a>
          </li>
        ))}
      </ul>

      <section aria-labelledby="map" className="mt-16 grid gap-6 md:mt-24 md:grid-cols-[1fr_2fr]">
        <div className="grid content-start gap-4">
          <h2 id="map" className="text-[2rem] md:text-[2.6rem]">
            Ghé studio
          </h2>
          <p className="text-ink-soft">Mở bản đồ để xem đường đi. Nhắn trước để MERCI giữ khung giờ cho bạn.</p>
          <div className="flex flex-wrap gap-3">
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="btn-ink">
              Chỉ đường
            </a>
            <TransitionLink href="/dat-lich" className="btn-ink is-solid">
              Đặt lịch
            </TransitionLink>
          </div>
        </div>
        <div className="aspect-[4/3] w-full overflow-hidden border border-ink/30 md:aspect-[16/10]">
          <iframe
            title="Bản đồ MERCI studio"
            src={SITE.mapsEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="size-full border-0 grayscale-[0.35] sepia-[0.15]"
          />
        </div>
      </section>
    </main>
  );
}

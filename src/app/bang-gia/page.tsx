import type { Metadata } from "next";
import { TransitionLink } from "@/components/sites/merci/transition";
import { formatVnd, PACKAGES } from "@/data/packages";
import { CONTENT_IS_DRAFT, SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Bảng giá theo gói",
  description: "Các gói chụp của MERCI studio: số concept, thời gian, trang phục và số ảnh chỉnh sửa.",
};

export default function PricingPage() {
  return (
    <main className="container-96 pb-20 pt-32 md:pt-40">
      <header className="mb-10 grid max-w-[44rem] gap-4 md:mb-14">
        <h1 className="text-[3rem] leading-none md:text-[5rem] [&::first-letter]:italic">Bảng giá</h1>
        <p className="text-[1.1rem] text-ink-soft">
          Chọn gói theo số concept và thời gian bạn muốn. Cần gói riêng cho nhóm bạn hoặc sự kiện? Nhắn MERCI để được tư vấn.
        </p>
      </header>

      {CONTENT_IS_DRAFT && (
        <p role="note" className="mb-10 border border-ink/40 bg-cream-deep px-4 py-3 text-[0.95rem]">
          <strong className="font-semibold">Bảng giá minh hoạ.</strong> Các gói và mức giá dưới đây là số liệu mẫu, MERCI sẽ cập
          nhật giá chính thức. Vui lòng nhắn Zalo {SITE.phoneDisplay} để biết giá hiện tại.
        </p>
      )}

      <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
        {PACKAGES.map((p) => (
          <li
            key={p.slug}
            className={`grid content-start gap-6 border p-6 md:p-8 ${
              p.featured ? "border-ink bg-ink text-cream" : "border-ink/30"
            }`}
          >
            <div className="grid gap-1">
              {p.featured && <span className="label !text-cream/80">Được chọn nhiều nhất</span>}
              <h2 className="text-[2.4rem] leading-none">{p.name}</h2>
              <p className={p.featured ? "text-cream/80" : "text-ink-soft"}>{p.tagline}</p>
            </div>
            <p className="font-display text-[2.6rem] leading-none tabular-nums">{formatVnd(p.price)}</p>
            <dl className="grid gap-2 text-[1rem]">
              {p.items.map((it) => (
                <div
                  key={it.label}
                  className={`flex justify-between gap-4 border-t pt-2 ${p.featured ? "border-cream/25" : "border-ink/15"}`}
                >
                  <dt className={p.featured ? "text-cream/75" : "text-ink-soft"}>{it.label}</dt>
                  <dd className="font-medium">{it.value}</dd>
                </div>
              ))}
            </dl>
            <ul className="grid gap-2 text-[0.95rem]">
              {p.perks.map((perk) => (
                <li key={perk} className="flex gap-2">
                  <span aria-hidden="true">+</span>
                  {perk}
                </li>
              ))}
            </ul>
            <TransitionLink
              href={`/dat-lich?goi=${p.slug}`}
              className={`btn-ink ${
                p.featured ? "!border-cream !bg-cream !text-ink hover:!text-cream [&::before]:!bg-ink-soft" : "is-solid"
              }`}
            >
              Chọn gói {p.name}
            </TransitionLink>
          </li>
        ))}
      </ul>

      <section aria-labelledby="help" className="mt-16 grid justify-items-start gap-4 md:mt-24">
        <h2 id="help" className="text-[2rem] md:text-[2.8rem]">
          Chưa biết chọn concept nào?
        </h2>
        <p className="max-w-[50ch] text-ink-soft">
          Trả lời hai câu hỏi ngắn về dịp chụp và tông ảnh, MERCI sẽ gợi ý những concept hợp với bạn.
        </p>
        <TransitionLink href="/chon-concept" className="btn-ink">
          Chọn concept giúp tôi
        </TransitionLink>
      </section>
    </main>
  );
}

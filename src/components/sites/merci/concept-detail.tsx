"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { getCategory } from "@/data/categories";
import type { Concept } from "@/data/concepts";
import { SITE } from "@/data/site";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useRevealed } from "@/lib/reveal";
import { TransitionLink } from "./transition";
import { WipeImage } from "./wipe-image";

/** Staggered placements on a 9-column grid, repeating every six photos. */
const PLACEMENTS: { col: string; offset: string }[] = [
  { col: "1 / 5", offset: "0vh" },
  { col: "7 / 10", offset: "28vh" },
  { col: "3 / 7", offset: "6vh" },
  { col: "8 / 10", offset: "14vh" },
  { col: "1 / 4", offset: "0vh" },
  { col: "5 / 9", offset: "22vh" },
];

/** How far past its native size a photo may be shown. Keeps small originals from turning to mush. */
const MAX_UPSCALE = 1.7;

interface Props {
  concept: Concept;
  prev: Concept;
  next: Concept;
}

export function ConceptDetail({ concept, prev, next }: Props) {
  const category = getCategory(concept.category);
  const [cover, ...rest] = concept.images;
  const revealed = useRevealed();
  const intro = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!revealed) return;
    const el = intro.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-intro]",
        { y: 36, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out", stagger: 0.09 },
      );
      gsap.fromTo(
        "[data-intro-image]",
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power4.inOut" },
      );
    }, el);
    return () => ctx.revert();
  }, [revealed]);

  return (
    <main>
      <section ref={intro} className="container-96 grid min-h-svh items-center gap-10 pb-12 pt-28 md:grid-cols-[1fr_54vw] md:gap-12 md:pt-20">
        <div className="grid content-center gap-5 md:max-w-[34rem]">
          <p data-intro className="label">
            <TransitionLink href={`/danh-muc/${concept.category}`} className="link-line">
              {category?.name}
            </TransitionLink>
          </p>
          <h1
            data-intro
            className="text-[2.9rem] leading-[1.02] md:text-[4.4rem] [&::first-letter]:italic"
          >
            {concept.name}
          </h1>
          <p data-intro className="font-display text-[1.35rem] italic leading-snug text-ink-soft">
            {concept.tagline}
          </p>
          <p data-intro className="text-[1.05rem] leading-relaxed">
            {concept.story}
          </p>
          <ul data-intro className="flex flex-wrap gap-2" aria-label="Đạo cụ và trang phục">
            {concept.props.map((p) => (
              <li key={p} className="rounded-full border border-ink/30 px-3 py-1 text-[0.9rem]">
                {p}
              </li>
            ))}
          </ul>
          <div data-intro className="mt-2 flex flex-wrap gap-3">
            <TransitionLink href={`/dat-lich?concept=${concept.slug}`} className="btn-ink is-solid">
              Chọn concept này
            </TransitionLink>
            <a href={SITE.zaloUrl} target="_blank" rel="noreferrer" className="btn-ink">
              Hỏi qua Zalo
            </a>
          </div>
          <p data-intro className="text-[0.9rem] text-ink-soft">
            {concept.images.length} ảnh trong concept này. Cuộn xuống để xem hết.
          </p>
        </div>

        <div data-intro-image className="relative mx-auto w-full max-w-[40rem] md:ml-auto" style={{ aspectRatio: "4 / 5", maxHeight: "75vh" }}>
          <div className="absolute inset-0 overflow-hidden" style={{ background: cover.tone }}>
            <Image
              src={cover.src}
              alt={`${concept.name}, ảnh đại diện`}
              fill
              priority
              sizes="(max-width: 767px) 92vw, 54vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {rest.length > 0 && (
        <section aria-label={`Ảnh trong concept ${concept.name}`} className="container-96 grid gap-y-16 py-16 md:grid-cols-9 md:gap-x-4 md:gap-y-[14vh] md:py-24">
          {rest.map((img, i) => {
            const p = PLACEMENTS[i % PLACEMENTS.length];
            return (
              <div
                key={img.src}
                className="md:[grid-column:var(--col)] md:pt-[var(--offset)]"
                style={{ "--col": p.col, "--offset": p.offset } as React.CSSProperties}
              >
                <div
                  className={i % 2 === 1 ? "ml-auto" : ""}
                  style={{ maxWidth: `min(100%, ${Math.round(img.width * MAX_UPSCALE)}px)`, width: i % 2 === 1 ? "82%" : "100%" }}
                >
                  <WipeImage
                    src={img.src}
                    width={img.width}
                    height={img.height}
                    tone={img.tone}
                    alt={`${concept.name}, ảnh ${i + 2}`}
                    sizes="(max-width: 767px) 90vw, 44vw"
                  />
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section aria-labelledby="cta-title" className="container-96 grid justify-items-center gap-5 py-20 text-center md:py-28">
        <h2 id="cta-title" className="max-w-[22ch] text-[2.2rem] leading-tight md:text-[3rem]">
          Thích concept này? Mình hẹn lịch nhé.
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <TransitionLink href={`/dat-lich?concept=${concept.slug}`} className="btn-ink is-solid">
            Đặt lịch chụp
          </TransitionLink>
          <TransitionLink href="/chon-concept" className="btn-ink">
            Xem concept khác phù hợp
          </TransitionLink>
        </div>
      </section>

      <nav aria-label="Concept trước và sau" className="container-96 flex flex-wrap justify-center gap-4 pb-24 md:pb-32">
        {[
          { label: "Concept trước", c: prev },
          { label: "Concept sau", c: next },
        ].map(({ label, c }) => (
          <TransitionLink
            key={label}
            href={`/concept/${c.slug}`}
            className="group relative block aspect-[1/1.3] w-[min(100%,20rem)] overflow-hidden border border-ink"
          >
            <Image
              src={c.images[0].src}
              alt=""
              fill
              sizes="20rem"
              className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
            />
            <span className="absolute inset-0 bg-ink/45 transition-opacity duration-500 group-hover:bg-ink/25" />
            <span className="absolute inset-x-0 bottom-0 grid gap-1 p-4 text-center text-cream">
              <span className="label !text-cream/85">{label}</span>
              <span className="font-display text-[1.5rem] leading-tight">{c.name}</span>
            </span>
          </TransitionLink>
        ))}
      </nav>
    </main>
  );
}

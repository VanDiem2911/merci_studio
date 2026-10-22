"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Category } from "@/data/categories";
import { getCategory } from "@/data/categories";
import type { Concept } from "@/data/concepts";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/gsap";
import { useRevealed } from "@/lib/reveal";
import { PanGrid, type GridItem } from "./pan-grid";
import { TransitionLink } from "./transition";

type View = "list" | "grid";

interface Props {
  concepts: Concept[];
  title: string;
  blurb: string;
  category?: Category;
}

/** Concept index: a ruled list with a floating photo preview, or the same endless pan grid as the home page. */
export function ConceptBrowser({ concepts, title, blurb }: Props) {
  const [view, setView] = useState<View>("list");
  const [hover, setHover] = useState(0);
  const revealed = useRevealed();
  const listRef = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  // grid view owns the wheel, so freeze page scroll underneath it
  useEffect(() => {
    if (view !== "grid") return;
    document.documentElement.classList.add("no-scroll");
    document.body.classList.add("no-scroll");
    return () => {
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
    };
  }, [view]);

  useEffect(() => {
    if (!revealed || view !== "list" || prefersReducedMotion()) return;
    const rows = listRef.current?.querySelectorAll("li");
    if (rows) {
      gsap.fromTo(rows, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.04 });
    }
    if (headRef.current) {
      gsap.fromTo(headRef.current.children, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.08 });
    }
  }, [revealed, view]);

  useEffect(() => {
    const el = preview.current;
    if (!el || view !== "list" || !isFinePointer()) return;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      x(e.clientX + 28);
      y(e.clientY - el.offsetHeight / 2);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [view]);

  const items: GridItem[] = concepts.map((c) => ({
    key: c.slug,
    href: `/concept/${c.slug}`,
    name: c.name,
    meta: getCategory(c.category)?.short,
    image: c.images[0],
  }));

  const switcher = (
    <div
      role="group"
      aria-label="Chế độ xem"
      className="fixed right-[2%] top-[5.25rem] z-[15] flex items-center gap-1 font-display text-[1.05rem] uppercase tracking-[0.04em] md:top-[5.75rem]"
    >
      {(["list", "grid"] as const).map((v, i) => (
        <span key={v} className="flex items-center gap-1">
          {i === 1 && <span aria-hidden="true">/</span>}
          <button
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className="min-h-11 px-1 opacity-50 transition-opacity duration-200 aria-pressed:opacity-100"
          >
            {v === "list" ? "Danh sách" : "Lưới"}
          </button>
        </span>
      ))}
    </div>
  );

  if (concepts.length === 0) {
    return (
      <main className="container-96 pb-24 pt-32 md:pt-40">
        <div className="mb-10 grid max-w-[46rem] gap-3 md:mb-14">
          <h1 className="text-[2.6rem] leading-[1.05] md:text-[3.6rem]">{title}</h1>
          <p className="text-[1.05rem] text-ink-soft">{blurb}</p>
        </div>
        <p className="max-w-[46rem] text-[1.1rem]">
          Ảnh của mục này đang được cập nhật. Bạn xem thử các concept khác, hoặc nhắn MERCI để được tư vấn riêng.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <TransitionLink href="/concept" className="btn-ink">
            Xem tất cả concept
          </TransitionLink>
          <TransitionLink href="/dat-lich" className="btn-ink is-solid">
            Đặt lịch
          </TransitionLink>
        </div>
      </main>
    );
  }

  if (view === "grid") {
    return (
      <>
        {switcher}
        <div className="fixed inset-0 z-[5] bg-cream">
          <h1 className="visually-hidden">{title}</h1>
          <PanGrid items={items} />
        </div>
      </>
    );
  }

  return (
    <main className="container-96 pb-24 pt-32 md:pt-40">
      {switcher}
      <div ref={headRef} className="mb-10 grid max-w-[46rem] gap-3 md:mb-14">
        <p className="label">{concepts.length} concept</p>
        <h1 className="text-[2.6rem] leading-[1.05] md:text-[3.6rem]">{title}</h1>
        <p className="text-[1.05rem] text-ink-soft">{blurb}</p>
      </div>

      <ul ref={listRef} className="border-b border-ink/20" onMouseLeave={() => preview.current && gsap.to(preview.current, { autoAlpha: 0, duration: 0.25 })}>
        {concepts.map((c, i) => (
          <li
            key={c.slug}
            className="row-item overflow-hidden"
            onMouseEnter={() => {
              setHover(i);
              if (preview.current && isFinePointer()) gsap.to(preview.current, { autoAlpha: 1, duration: 0.3 });
            }}
          >
            <TransitionLink
              href={`/concept/${c.slug}`}
              className="grid grid-cols-[1.5fr_1fr] items-baseline gap-4 py-3 text-[1.2rem] md:grid-cols-[1.5fr_1fr_6rem] md:text-[1.35rem]"
            >
              <span className="font-display">{c.name}</span>
              <span className="text-[0.95rem]">{getCategory(c.category)?.name}</span>
              <span className="hidden text-right text-[0.95rem] tabular-nums md:block">{c.images.length} ảnh</span>
            </TransitionLink>
          </li>
        ))}
      </ul>

      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[30] hidden aspect-[4/5] w-[16vw] min-w-[9rem] overflow-hidden opacity-0 [@media(hover:hover)]:block"
        style={{ visibility: "hidden" }}
      >
        {concepts.map((c, i) => (
          <Image
            key={c.slug}
            src={c.images[0].src}
            alt=""
            fill
            sizes="16vw"
            className="object-cover transition-opacity duration-300"
            style={{ opacity: hover === i ? 1 : 0 }}
          />
        ))}
      </div>
    </main>
  );
}

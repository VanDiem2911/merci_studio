"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCategory } from "@/data/categories";
import type { Concept } from "@/data/concepts";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useRevealed } from "@/lib/reveal";
import { wheelStepper } from "@/lib/wheel";
import { TransitionLink } from "./transition";

interface Props {
  concept: Concept;
  prev: Concept;
  next: Concept;
}

/** Full-screen viewer for one collection: wipe between photos, tick-mark timeline with previews, info drawer. */
export function GalleryViewer({ concept, prev, next }: Props) {
  const total = concept.images.length;
  const [index, setIndex] = useState(0);
  const [info, setInfo] = useState(false);
  const [peek, setPeek] = useState<number | null>(null);
  const revealed = useRevealed();
  const frame = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const direction = useRef(1);
  const first = useRef(true);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (to: number) => {
      const wrapped = (to + total) % total;
      direction.current = to >= index ? 1 : -1;
      setIndex(wrapped);
    },
    [index, total],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      direction.current = dir;
      setIndex((i) => (i + dir + total) % total);
    },
    [total],
  );

  // the mouse wheel turns the photo: one notch or one trackpad swipe is one photo
  useEffect(() => {
    if (info) return; // the open info drawer scrolls on its own
    const onWheel = wheelStepper(step);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [step, info]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = frame.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(
      el,
      { clipPath: direction.current > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85, ease: "power4.inOut" },
    );
  }, [index]);

  useEffect(() => {
    if (!revealed || prefersReducedMotion()) return;
    gsap.fromTo("[data-viewer-in]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 });
    gsap.fromTo(frame.current, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power4.inOut" });
  }, [revealed]);

  useEffect(() => {
    const el = drawer.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.clipPath = info ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)";
      return;
    }
    gsap.to(el, { clipPath: info ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)", duration: 0.7, ease: "power4.inOut" });
  }, [info]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === "Escape") setInfo(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const current = concept.images[index];
  const category = getCategory(concept.category);

  return (
    <main
      className="fixed inset-0 flex flex-col bg-cream pt-[4.5rem] md:pt-20"
      onPointerDown={(e) => {
        swipe.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const s = swipe.current;
        swipe.current = null;
        if (!s) return;
        const dx = e.clientX - s.x;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.4) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      <h1 className="visually-hidden">
        {concept.name}, ảnh {index + 1} trên {total}
      </h1>

      <div className="relative min-h-0 flex-1 px-[2%]">
        <div ref={frame} className="relative mx-auto flex h-full w-full items-center justify-center">
          <Image
            key={current.src}
            src={current.src}
            alt={`${concept.name}, ảnh ${index + 1} trên ${total}`}
            width={current.width}
            height={current.height}
            priority
            sizes="(max-width: 767px) 96vw, 70vw"
            draggable={false}
            className="h-full max-h-full w-auto max-w-full select-none object-contain"
          />
        </div>

        {/* the photos on either side are fetched in advance so the wipe never reveals an empty frame */}
        <div aria-hidden="true" className="pointer-events-none absolute -z-10 size-px overflow-hidden opacity-0">
          {[1, -1].map((d) => {
            const img = concept.images[(index + d + total) % total];
            return (
              <Image
                key={img.src}
                src={img.src}
                alt=""
                width={img.width}
                height={img.height}
                loading="eager"
                sizes="(max-width: 767px) 96vw, 70vw"
              />
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Ảnh trước"
          onClick={() => go(index - 1)}
          data-viewer-in
          className="absolute left-[3%] top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-ink bg-cream/80 backdrop-blur transition-[background,color] hover:bg-ink hover:text-cream focus-visible:bg-ink focus-visible:text-cream md:left-[6%]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Ảnh sau"
          onClick={() => go(index + 1)}
          data-viewer-in
          className="absolute right-[3%] top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-ink bg-cream/80 backdrop-blur transition-[background,color] hover:bg-ink hover:text-cream focus-visible:bg-ink focus-visible:text-cream md:right-[6%]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="container-96 grid gap-3 pb-4 pt-3 md:gap-4 md:pb-6">
        <div data-viewer-in className="relative">
          {peek !== null && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-full mb-3 h-24 w-16 -translate-x-1/2 overflow-hidden border border-ink"
              style={{ left: `calc(50% + (${(peek + 0.5) / total} - 0.5) * min(100%, 44rem))` }}
            >
              <Image src={concept.images[peek].src} alt="" fill sizes="64px" className="object-cover" />
            </div>
          )}
          <div role="group" aria-label="Chọn ảnh" className="mx-auto flex h-8 max-w-[44rem] items-end gap-px">
            {concept.images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Ảnh ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => go(i)}
                onMouseEnter={() => setPeek(i)}
                onMouseLeave={() => setPeek(null)}
                onFocus={() => setPeek(i)}
                onBlur={() => setPeek(null)}
                className="group flex h-full min-w-0 flex-1 items-end justify-center"
              >
                <span
                  className="block w-px bg-ink transition-[height,opacity,width] duration-300 group-hover:h-5 group-hover:opacity-100"
                  style={{ height: i === index ? "1.5rem" : i % 5 === 0 ? "0.9rem" : "0.55rem", opacity: i === index ? 1 : 0.4, width: i === index ? 2 : 1 }}
                />
              </button>
            ))}
          </div>
        </div>

        <div data-viewer-in className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pr-16 md:pr-40">
          <div className="grid gap-0.5">
            <span className="font-display text-[1.4rem] leading-tight md:text-[1.7rem]">{concept.name}</span>
            <span className="text-[0.9rem] text-ink-soft">{category?.name}</span>
          </div>
          <p aria-hidden="true" className="font-display text-[1.1rem] tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ink" aria-expanded={info} onClick={() => setInfo((v) => !v)}>
              Thông tin
            </button>
            <TransitionLink href={`/dat-lich?concept=${concept.slug}`} className="btn-ink is-solid">
              Đặt lịch concept này
            </TransitionLink>
          </div>
        </div>
      </div>

      <div
        ref={drawer}
        role="region"
        aria-label={`Thông tin concept ${concept.name}`}
        aria-hidden={!info}
        inert={!info}
        className="absolute inset-x-0 bottom-0 z-[60] max-h-[78svh] overflow-y-auto bg-ink text-cream"
        style={{ clipPath: "inset(100% 0% 0% 0%)" }}
      >
        <div className="container-96 grid gap-8 py-8 md:grid-cols-[1.2fr_1fr] md:py-12">
          <div className="grid content-start gap-3">
            <p className="label !text-cream/70">{category?.name}</p>
            <h2 className="text-[2rem] leading-tight md:text-[2.8rem]">{concept.name}</h2>
            <p className="font-display text-[1.2rem] italic text-cream/80">{concept.tagline}</p>
            <p className="max-w-[52ch] leading-relaxed text-cream/90">{concept.story}</p>
          </div>
          <div className="grid content-start gap-5">
            <ul className="flex flex-wrap gap-2" aria-label="Đạo cụ và trang phục">
              {concept.props.map((p) => (
                <li key={p} className="rounded-full border border-cream/40 px-3 py-1 text-[0.9rem]">
                  {p}
                </li>
              ))}
            </ul>
            <div className="grid gap-2 border-t border-cream/25 pt-4 text-[1rem]">
              <TransitionLink href={`/concept/${concept.slug}`} className="link-line w-fit">
                Xem trang concept
              </TransitionLink>
              <TransitionLink href={`/bo-suu-tap/${prev.slug}`} className="link-line w-fit">
                Bộ sưu tập trước: {prev.name}
              </TransitionLink>
              <TransitionLink href={`/bo-suu-tap/${next.slug}`} className="link-line w-fit">
                Bộ sưu tập sau: {next.name}
              </TransitionLink>
              <TransitionLink href="/bo-suu-tap" className="link-line w-fit">
                Về tất cả bộ sưu tập
              </TransitionLink>
            </div>
            <button type="button" className="btn-ink !border-cream !text-cream hover:!text-ink w-fit [&::before]:!bg-cream" onClick={() => setInfo(false)}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

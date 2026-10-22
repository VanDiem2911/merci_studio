"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCategory } from "@/data/categories";
import type { Concept } from "@/data/concepts";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { clamp, mod } from "@/lib/math";
import { useRevealed } from "@/lib/reveal";
import { wheelStepper } from "@/lib/wheel";
import { TransitionLink, useTransition } from "./transition";

/** angle between two neighbouring cards: they fold towards the viewer like pages of a book */
const STEP_DEG = 68;
/** cards further than this from the centre are edge-on or facing away, so they are not drawn */
const VISIBLE = 1;

/** shortest signed distance on a ring of n items */
function ringDelta(i: number, pos: number, n: number) {
  return mod(i - pos + n / 2, n) - n / 2;
}

/**
 * Photo reel: concepts are cards hinged edge to edge on the inside of a vertical drum. The centred card lies flat,
 * its neighbours fold towards the viewer like turning pages. Wheel, drag, arrow keys or a click on a neighbour
 * roll it; the centred card opens the collection.
 */
export function GalleryStrip({ concepts }: { concepts: Concept[] }) {
  const n = concepts.length;
  const [active, setActive] = useState(0);
  const revealed = useRevealed();
  const stage = useRef<HTMLDivElement>(null);
  const frames = useRef<(HTMLAnchorElement | null)[]>([]);
  const nameRef = useRef<HTMLDivElement>(null);
  const api = useRef({ center: (i: number) => void i });
  const spread = useRef({ v: 0 });
  const { go } = useTransition();

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    let pos = 0;
    let target = 0;
    let idleTimer: number | undefined;
    let dragging = false;
    let captured = false;
    let moved = 0;
    let lastY = 0;
    let lastActive = 0;
    let lastPos = Number.NaN;
    let lastSpread = Number.NaN;
    let radius = 400;

    const measure = () => {
      const frameH = frames.current[0]?.offsetHeight ?? 440;
      // cards meet on a regular polygon: the apothem puts every hinge exactly on the neighbour's edge (4% gap)
      radius = frameH / 2 / Math.tan(((STEP_DEG * 1.04) / 2) * (Math.PI / 180));
      // keep the foreshortening the same whatever the card size
      el.style.perspective = `${(frameH * 4.6).toFixed(0)}px`;
      lastPos = Number.NaN; // redraw with the new size
    };

    const render = () => {
      const s = reduced ? 1 : spread.current.v;
      for (let i = 0; i < n; i++) {
        const f = frames.current[i];
        if (!f) continue;
        const d = ringDelta(i, pos, n);
        const abs = Math.abs(d);
        if (abs > VISIBLE + 0.5) {
          f.style.visibility = "hidden";
          continue;
        }
        f.style.visibility = "visible";
        const a = d * STEP_DEG * s;
        // the drum axis sits in front of the cards: push the ring back by its radius, turn it, bring it forward
        // again, so the centred card ends at z = 0 (true size) and the outer edges of its neighbours come closer
        f.style.transform = `translateZ(${radius.toFixed(1)}px) rotateX(${a.toFixed(2)}deg) translateZ(${(-radius).toFixed(1)}px)`;
        f.style.opacity = String(clamp(1 - (abs - 1) * 1.6, 0, 1) * s);
        const shade = f.lastElementChild as HTMLElement | null;
        if (shade) shade.style.opacity = (Math.min(abs, 1) * 0.2).toFixed(3);
        f.style.zIndex = String(100 - Math.round(abs * 10));
      }
      const idx = mod(Math.round(pos), n);
      if (idx !== lastActive) {
        frames.current[lastActive]?.removeAttribute("aria-current");
        frames.current[idx]?.setAttribute("aria-current", "true");
        lastActive = idx;
        setActive(idx);
      }
    };

    const tick = () => {
      // time based, so the roll feels the same at 60 and 144 Hz
      const k = 1 - Math.pow(1 - 0.13, gsap.ticker.deltaRatio(60));
      pos += (target - pos) * k;
      if (Math.abs(target - pos) < 0.0005) pos = target;
      const s = reduced ? 1 : spread.current.v;
      if (pos === lastPos && s === lastSpread) return; // nothing moved: no style writes
      lastPos = pos;
      lastSpread = s;
      render();
    };

    const snap = () => {
      target = Math.round(target);
    };
    // dragging rolls continuously and settles on the nearest card, leaning the way the finger was going
    let dragFrom = 0;
    const nudge = (delta: number) => {
      target = clamp(target + delta, pos - 3, pos + 3);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(snap, 140);
    };
    const step = (dir: number) => {
      target = clamp(Math.round(target) + dir, pos - 3, pos + 3);
    };

    const onWheel = wheelStepper(step);
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = 0;
      lastY = e.clientY;
      dragFrom = Math.round(target);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dy = e.clientY - lastY;
      lastY = e.clientY;
      moved += Math.abs(dy);
      if (moved > 8 && !captured) {
        captured = true;
        el.setPointerCapture(e.pointerId);
      }
      nudge(-dy / 190);
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (captured && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      captured = false;
      window.clearTimeout(idleTimer);
      // a short flick that did not pass the halfway mark still turns to the next card
      let end = Math.round(target);
      if (end === dragFrom && Math.abs(target - dragFrom) > 0.08) end = dragFrom + Math.sign(target - dragFrom);
      target = end;
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved > 8) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") step(-1);
      else return;
      e.preventDefault();
    };

    api.current.center = (i: number) => {
      const here = Math.round(target);
      target = here + ringDelta(i, here, n);
    };

    measure();
    gsap.ticker.add(tick);
    window.addEventListener("resize", measure);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClickCapture, true);
    window.addEventListener("keydown", onKey);
    return () => {
      gsap.ticker.remove(tick);
      window.clearTimeout(idleTimer);
      window.removeEventListener("resize", measure);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [n]);

  // reel unfolds from a flat stack
  useEffect(() => {
    if (!revealed || prefersReducedMotion()) return;
    gsap.to(spread.current, { v: 1, duration: 1.5, ease: "power4.out" });
    if (stage.current) {
      gsap.fromTo("[data-strip-label]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.4 });
    }
  }, [revealed]);

  // title swaps with a short rise
  useEffect(() => {
    const el = nameRef.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(el.children, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.06 });
  }, [active]);

  const current = concepts[active];

  const cards = useMemo(
    () =>
      concepts.map((c, i) => (
        <TransitionLink
          key={c.slug}
          href={`/bo-suu-tap/${c.slug}`}
          ref={(node: HTMLAnchorElement | null) => {
            frames.current[i] = node;
          }}
          aria-label={`${c.name}, ${c.images.length} ảnh`}
          aria-current={i === 0 ? "true" : undefined}
          draggable={false}
          onFocus={() => api.current.center(i)}
          onClick={(e) => {
            if (frames.current[i]?.getAttribute("aria-current") !== "true") {
              e.preventDefault();
              api.current.center(i);
            }
          }}
          className="absolute inset-0 block select-none overflow-hidden bg-ink/10 [backface-visibility:hidden]"
          style={{ visibility: "hidden" }}
        >
          <Image
            src={c.images[0].src}
            alt=""
            fill
            sizes="(max-width: 639px) 80vw, 30rem"
            draggable={false}
            priority={i < 3}
            className="object-cover"
            style={{ objectPosition: "50% 20%" }}
          />
          {/* darkens the cards that fold away; an opacity change is far cheaper to animate than a filter */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: 0 }} />
        </TransitionLink>
      )),
    [concepts],
  );

  return (
    <main className="fixed inset-0 overflow-hidden bg-cream" aria-label="Bộ sưu tập ảnh">
      <h1 className="visually-hidden">Bộ sưu tập ảnh</h1>
      <div
        ref={stage}
        className="absolute inset-0 touch-none"
        style={{ perspective: "2200px", perspectiveOrigin: "50% 50%" }}
      >
        <div
          className="absolute left-1/2 top-[42%] h-[46vh] max-h-[36rem] -translate-x-1/2 -translate-y-1/2 md:top-1/2 md:h-[54vh] md:max-h-[38rem]"
          style={{ transformStyle: "preserve-3d", aspectRatio: "3 / 4" }}
        >
          {cards}
        </div>
      </div>

      <div
        ref={nameRef}
        data-strip-label
        aria-live="polite"
        className="pointer-events-none absolute inset-x-[4%] bottom-40 z-[120] grid gap-1 bg-cream/90 px-3 py-2 text-center backdrop-blur-sm md:inset-x-auto md:bottom-auto md:left-[2%] md:top-1/2 md:max-w-[17rem] md:-translate-y-1/2 md:bg-transparent md:p-0 md:text-left md:backdrop-blur-none"
      >
        <span className="font-display text-[1.7rem] font-semibold uppercase leading-[1.05] tracking-[0.01em] md:text-[2.3rem]">
          {current.name}
        </span>
        <span className="text-[0.95rem] text-ink-soft">
          {getCategory(current.category)?.name} · {current.images.length} ảnh
        </span>
      </div>

      <p
        data-strip-label
        className="pointer-events-none absolute right-[2%] top-1/2 z-[120] hidden -translate-y-1/2 font-display text-[2.6rem] italic md:block [&::first-letter]:not-italic"
      >
        Bộ sưu tập
      </p>

      <p className="pointer-events-none absolute bottom-5 left-1/2 z-[120] -translate-x-1/2 text-[0.9rem] text-ink-soft">
        Cuộn, kéo hoặc dùng phím mũi tên · Nhấn khung giữa để mở
      </p>

      <button
        type="button"
        className="btn-ink absolute bottom-24 left-1/2 z-[120] -translate-x-1/2 !min-h-11 md:bottom-auto md:left-[2%] md:top-[calc(50%+7.5rem)] md:translate-x-0"
        onClick={() => go(`/bo-suu-tap/${current.slug}`)}
      >
        Mở {current.images.length} ảnh
      </button>
    </main>
  );
}

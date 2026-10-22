"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ConceptImage } from "@/data/concepts";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { clamp, wrap } from "@/lib/math";
import { useRevealed } from "@/lib/reveal";
import { TransitionLink } from "./transition";

export interface GridItem {
  key: string;
  href: string;
  name: string;
  meta?: string;
  image: ConceptImage;
}

const COLS = 5;
/** vertical speed per column: neighbours drift at different rates, which is what gives the grid depth */
const COL_SPEED = [1, 1.14, 0.9, 1.2, 1.04];
const DRAG_THRESHOLD = 6;

function metrics() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const colW = vw >= 992 ? vw * 0.26 : vw >= 768 ? vw * 0.36 : vw >= 480 ? vw * 0.44 : vw * 0.6;
  const rowH = vw >= 480 ? vh * 0.65 : vh * 0.55;
  return { vw, vh, colW, rowH };
}

/**
 * Endless, draggable grid of photos. Wheel / trackpad / drag / touch pan it in both axes with
 * inertia; columns parallax against each other and the photos lean into the motion.
 * Tiles are real links, so keyboard focus pans the focused tile into the centre.
 */
export function PanGrid({ items, hint = true }: { items: GridItem[]; hint?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const revealed = useRevealed();
  const introPlayed = useRef(false);

  const rows = Math.max(4, Math.ceil(items.length / COLS));
  const total = rows * COLS;
  const tiles = Array.from({ length: total }, (_, i) => items[i % items.length]);

  // motion loop
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    let m = metrics();
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const last = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let dragging = false;
    let captured = false;
    let moved = 0;
    let startPointer = { x: 0, y: 0 };
    let lastPointer = { x: 0, y: 0 };
    let throwVel = { x: 0, y: 0 };
    let touched = false;

    const place = () => {
      const W = COLS * m.colW;
      const H = rows * m.rowH;
      for (let i = 0; i < total; i++) {
        const tile = tileRefs.current[i];
        if (!tile) continue;
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = wrap(col * m.colW + pos.x, -m.colW, W);
        const y = wrap(row * m.rowH + pos.y * COL_SPEED[col], -m.rowH, H);
        tile.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
        tile.dataset.x = String(x);
        tile.dataset.y = String(y);
        const img = imgRefs.current[i];
        if (img && !reduced) {
          const lx = clamp(-vel.x * 0.5, -26, 26);
          const ly = clamp(-vel.y * 0.5, -26, 26);
          img.style.transform = `translate3d(${lx.toFixed(1)}px,${ly.toFixed(1)}px,0) skewY(${clamp(vel.y * 0.035, -5, 5).toFixed(2)}deg) scale(1.16)`;
        }
      }
    };

    const size = () => {
      m = metrics();
      for (let i = 0; i < total; i++) {
        const tile = tileRefs.current[i];
        if (tile) {
          tile.style.width = `${m.colW}px`;
          tile.style.height = `${m.rowH}px`;
        }
      }
      place();
    };

    const tick = () => {
      // time based: the same feel at 60 and 144 Hz, and no jump after a slow frame
      const frames = gsap.ticker.deltaRatio(60);
      const ease = 1 - Math.pow(1 - (dragging ? 0.28 : 0.085), frames);
      const follow = 1 - Math.pow(0.75, frames);
      pos.x += (target.x - pos.x) * ease;
      pos.y += (target.y - pos.y) * ease;
      vel.x += (pos.x - last.x - vel.x) * follow;
      vel.y += (pos.y - last.y - vel.y) * follow;
      last.x = pos.x;
      last.y = pos.y;
      place();
    };

    const markTouched = () => {
      if (touched) return;
      touched = true;
      if (hintRef.current) gsap.to(hintRef.current, { autoAlpha: 0, duration: 0.6 });
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      markTouched();
      const k = e.deltaMode === 1 ? 32 : 1;
      const dx = (e.shiftKey ? e.deltaY : e.deltaX) * k;
      const dy = (e.shiftKey ? 0 : e.deltaY) * k;
      target.x -= dx * 0.9;
      target.y -= dy * 0.9;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = 0;
      startPointer = { x: e.clientX, y: e.clientY };
      lastPointer = { x: e.clientX, y: e.clientY };
      throwVel = { x: 0, y: 0 };
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPointer.x;
      const dy = e.clientY - lastPointer.y;
      lastPointer = { x: e.clientX, y: e.clientY };
      moved = Math.max(moved, Math.hypot(e.clientX - startPointer.x, e.clientY - startPointer.y));
      if (moved > DRAG_THRESHOLD) {
        markTouched();
        // capture only once it is really a drag, so plain clicks still reach the tile link
        if (!captured) {
          captured = true;
          el.setPointerCapture(e.pointerId);
          el.style.cursor = "grabbing";
        }
      }
      target.x += dx;
      target.y += dy;
      throwVel = { x: throwVel.x * 0.6 + dx * 0.4, y: throwVel.y * 0.6 + dy * 0.4 };
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "grab";
      if (captured && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      captured = false;
      if (moved > DRAG_THRESHOLD) {
        target.x += throwVel.x * 14;
        target.y += throwVel.y * 14;
      }
    };
    // a drag must not click through to the tile under the pointer
    const onClickCapture = (e: MouseEvent) => {
      if (moved > DRAG_THRESHOLD) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    const onFocusIn = (e: FocusEvent) => {
      const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-tile]");
      if (!tile) return;
      const tx = Number(tile.dataset.x) + m.colW / 2;
      const ty = Number(tile.dataset.y) + m.rowH / 2;
      target.x += m.vw / 2 - tx;
      target.y += (m.vh / 2 - ty) / COL_SPEED[Number(tile.dataset.col)];
      markTouched();
    };
    const onKey = (e: KeyboardEvent) => {
      const step = 140;
      if (e.key === "ArrowDown") target.y -= step;
      else if (e.key === "ArrowUp") target.y += step;
      else if (e.key === "ArrowLeft") target.x += step;
      else if (e.key === "ArrowRight") target.x -= step;
      else return;
      e.preventDefault();
      markTouched();
    };

    size();
    gsap.ticker.add(tick);
    window.addEventListener("resize", size);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("keydown", onKey);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", size);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("keydown", onKey);
    };
  }, [rows, total]);

  // entrance: tiles wipe up from the centre outwards
  useEffect(() => {
    if (!revealed || introPlayed.current) return;
    introPlayed.current = true;
    const list = tileRefs.current.filter((t): t is HTMLDivElement => !!t);
    if (prefersReducedMotion()) {
      gsap.set(list, { clipPath: "inset(0% 0% 0% 0%)" });
      return;
    }
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dist = (t: HTMLDivElement) =>
      Math.hypot(Number(t.dataset.x) + t.offsetWidth / 2 - cx, Number(t.dataset.y) + t.offsetHeight / 2 - cy);
    const sorted = [...list].sort((a, b) => dist(a) - dist(b));
    gsap.fromTo(
      sorted,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power4.inOut", stagger: 0.045 },
    );
    const imgs = imgRefs.current.filter((i): i is HTMLDivElement => !!i);
    gsap.from(imgs, { opacity: 0.001, duration: 0.01 });
  }, [revealed]);

  return (
    <div
      ref={root}
      role="region"
      aria-label="Lưới concept, kéo hoặc cuộn để khám phá, dùng phím mũi tên để di chuyển"
      tabIndex={-1}
      className="relative h-svh w-full cursor-grab select-none overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {tiles.map((item, i) => {
        const col = i % COLS;
        return (
          <div
            key={i}
            data-tile
            data-col={col}
            ref={(node) => {
              tileRefs.current[i] = node;
            }}
            aria-hidden={i >= items.length ? true : undefined}
            className="group absolute left-0 top-0 will-change-transform"
            style={{ clipPath: "inset(100% 0% 0% 0%)" }}
          >
            <TransitionLink
              href={item.href}
              tabIndex={i >= items.length ? -1 : 0}
              draggable={false}
              className="block size-full p-1"
            >
              <span className="relative block size-full overflow-hidden" style={{ background: item.image.tone }}>
                <span
                  ref={(node) => {
                    imgRefs.current[i] = node as HTMLDivElement | null;
                  }}
                  className="absolute inset-0 block will-change-transform"
                  style={{ transform: "scale(1.16)" }}
                >
                  <Image
                    src={item.image.src}
                    alt={i >= items.length ? "" : `${item.name}${item.meta ? `, ${item.meta}` : ""}`}
                    fill
                    sizes="(max-width: 479px) 60vw, (max-width: 767px) 44vw, (max-width: 991px) 36vw, 26vw"
                    draggable={false}
                    priority={i < 8}
                    className="object-cover"
                  />
                </span>
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent px-3 pb-3 pt-10 text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                  <span className="block font-display text-[1.05rem] leading-tight">{item.name}</span>
                  {item.meta && <span className="block text-[0.8rem] opacity-90">{item.meta}</span>}
                </span>
              </span>
            </TransitionLink>
          </div>
        );
      })}
      {hint && (
        <p
          ref={hintRef}
          className="pointer-events-none absolute bottom-5 left-[2%] z-10 font-display text-[0.95rem] italic text-ink [text-shadow:0_0_14px_var(--cream)]"
        >
          Cuộn hoặc kéo để khám phá
        </p>
      )}
    </div>
  );
}

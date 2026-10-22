"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { clamp, wrap } from "@/lib/math";
import { useRevealed } from "@/lib/reveal";
import { TransitionLink } from "./transition";

export interface DiaryPhoto {
  slug: string;
  name: string;
  src: string;
  width: number;
  height: number;
  tone: string;
}

type Mode = "grid" | "globe";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(list: T[], seed: number): T[] {
  const rnd = mulberry32(seed);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const DRAG = 6;

/**
 * Photos on an endless canvas. Every photo is fitted inside its own cell and only whole columns move at their own
 * speed, so neighbours keep their distance and nothing ever slides over anything else.
 */
function GridField({ photos }: { photos: DiaryPhoto[] }) {
  const COLS = 12;
  const ROWS = Math.ceil(photos.length / COLS);
  const root = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const revealed = useRevealed();
  const played = useRef(false);

  const layout = useMemo(() => {
    const rnd = mulberry32(7);
    const colDepth = Array.from({ length: COLS }, () => 0.9 + rnd() * 0.3);
    return shuffled(photos, 11).map((p, i) => ({
      photo: p,
      col: i % COLS,
      row: Math.floor(i / COLS),
      jx: (rnd() - 0.5) * 0.2,
      jy: (rnd() - 0.5) * 0.2,
      rot: (rnd() - 0.5) * 10,
      fit: 0.8 + rnd() * 0.2,
      depth: colDepth[i % COLS],
    }));
  }, [photos]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let dragging = false;
    let captured = false;
    let moved = 0;
    let start = { x: 0, y: 0 };
    let last = { x: 0, y: 0 };
    let throwV = { x: 0, y: 0 };
    let cw = 0;
    let ch = 0;

    const size = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const wide = vw >= 768;
      cw = wide ? vw * 0.25 : vw * 0.5;
      ch = wide ? vh * 0.5 : vh * 0.34;
      // the box a photo may fill inside its cell: the rest of the cell is breathing room
      const boxW = cw * (wide ? 0.68 : 0.8);
      const boxH = ch * (wide ? 0.8 : 0.82);
      layout.forEach((it, i) => {
        const a = refs.current[i];
        if (!a) return;
        const ratio = it.photo.height / it.photo.width;
        const h = ratio > boxH / boxW ? boxH : boxW * ratio;
        a.style.width = `${((h / ratio) * it.fit).toFixed(1)}px`;
        a.style.height = `${(h * it.fit).toFixed(1)}px`;
      });
      place();
    };
    const place = () => {
      const W = COLS * cw;
      const H = ROWS * ch;
      layout.forEach((it, i) => {
        const a = refs.current[i];
        if (!a) return;
        const x = wrap((it.col + 0.5 + it.jx) * cw + pos.x, -cw * 1.2, W);
        const y = wrap((it.row + 0.5 + it.jy) * ch + pos.y * it.depth, -ch * 1.2, H);
        a.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${it.rot.toFixed(2)}deg)`;
      });
    };
    const tick = () => {
      const e = 1 - Math.pow(1 - (dragging ? 0.3 : 0.075), gsap.ticker.deltaRatio(60));
      pos.x += (target.x - pos.x) * e;
      pos.y += (target.y - pos.y) * e;
      place();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 32 : 1;
      target.x -= (e.shiftKey ? e.deltaY : e.deltaX) * k * 0.9;
      target.y -= (e.shiftKey ? 0 : e.deltaY) * k * 0.9;
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = 0;
      start = last = { x: e.clientX, y: e.clientY };
      throwV = { x: 0, y: 0 };
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      moved = Math.max(moved, Math.hypot(e.clientX - start.x, e.clientY - start.y));
      if (moved > DRAG && !captured) {
        captured = true;
        el.setPointerCapture(e.pointerId);
      }
      target.x += dx;
      target.y += dy;
      throwV = { x: throwV.x * 0.6 + dx * 0.4, y: throwV.y * 0.6 + dy * 0.4 };
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (captured && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      captured = false;
      if (moved > DRAG) {
        target.x += throwV.x * 14;
        target.y += throwV.y * 14;
      }
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved > DRAG) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const s = 140;
      if (e.key === "ArrowDown") target.y -= s;
      else if (e.key === "ArrowUp") target.y += s;
      else if (e.key === "ArrowLeft") target.x += s;
      else if (e.key === "ArrowRight") target.x -= s;
      else return;
      e.preventDefault();
    };

    size();
    gsap.ticker.add(tick);
    window.addEventListener("resize", size);
    window.addEventListener("keydown", onKey);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClickCapture, true);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", size);
      window.removeEventListener("keydown", onKey);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, [layout, ROWS]);

  useEffect(() => {
    if (!revealed || played.current) return;
    played.current = true;
    const nodes = refs.current.filter((n): n is HTMLAnchorElement => !!n);
    if (prefersReducedMotion()) {
      gsap.set(nodes, { autoAlpha: 1 });
      return;
    }
    gsap.fromTo(nodes, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: "power2.out", stagger: { each: 0.012, from: "random" } });
  }, [revealed]);

  return (
    <div ref={root} className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden" role="region" aria-label="Ảnh nhật ký trôi tự do, kéo hoặc cuộn để di chuyển">
      {layout.map((it, i) => (
        <TransitionLink
          key={it.photo.src}
          href={`/concept/${it.photo.slug}`}
          ref={(node: HTMLAnchorElement | null) => {
            refs.current[i] = node;
          }}
          draggable={false}
          aria-label={`${it.photo.name}, xem concept`}
          className="group absolute left-0 top-0 block -translate-x-1/2 -translate-y-1/2 opacity-0 will-change-transform"
          style={{ visibility: "hidden" }}
        >
          <span className="relative block size-full shadow-[0_14px_30px_-18px_rgb(27_23_19/0.5)] transition-transform duration-500 group-hover:scale-[1.05]" style={{ background: it.photo.tone }}>
            <Image src={it.photo.src} alt="" fill sizes="(max-width: 767px) 40vw, 20vw" draggable={false} className="object-cover" />
          </span>
        </TransitionLink>
      ))}
    </div>
  );
}

/** degrees between two neighbouring photos on the sphere */
const STEP = 6.5;
const MAX_LAT = 75;
const rad = (d: number) => (d * Math.PI) / 180;

/**
 * The viewer stands at the centre of a sphere whose inner wall is tiled with small photos: the ones straight ahead are
 * tiny, the ones towards the edge of the screen grow and lean. Drag to look around; it drifts slowly on its own.
 */
function GlobeField({ photos }: { photos: DiaryPhoto[] }) {
  const root = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLAnchorElement | null)[]>([]);
  const revealed = useRevealed();

  const placed = useMemo(() => {
    const rnd = mulberry32(5);
    const pool = shuffled(photos, 3);
    const n = pool.length;
    // hop through the pool in big strides so photos that repeat sit far apart on the sphere
    let stride = Math.max(1, Math.round(n * 0.618));
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
    while (gcd(stride, n) !== 1) stride++;
    const items: {
      photo: DiaryPhoto;
      lon: number;
      lat: number;
      rot: number;
      w: number;
      first: boolean;
      ux: number;
      uy: number;
      uz: number;
    }[] = [];
    const seen = new Set<string>();
    let k = 0;
    for (let lat = -MAX_LAT; lat <= MAX_LAT + 0.01; lat += STEP) {
      const cols = Math.max(1, Math.round((360 / STEP) * Math.cos(rad(lat))));
      for (let c = 0; c < cols; c++) {
        const lon = (c / cols) * 360;
        const photo = pool[(k * stride) % n];
        k++;
        const first = !seen.has(photo.src);
        seen.add(photo.src);
        items.push({
          photo,
          lon,
          lat,
          rot: (rnd() - 0.5) * 50,
          w: rad(STEP) * (0.3 + rnd() * 0.28),
          first,
          ux: -Math.cos(rad(lat)) * Math.sin(rad(lon)),
          uy: -Math.sin(rad(lat)),
          uz: -Math.cos(rad(lat)) * Math.cos(rad(lon)),
        });
      }
    }
    return items;
  }, [photos]);

  useEffect(() => {
    const el = root.current;
    const w = world.current;
    if (!el || !w) return;
    const reduced = prefersReducedMotion();
    const drift = reduced ? 0 : 0.05;
    const rot = { x: 0, y: 0 };
    const vel = { x: 0, y: drift };
    let dragging = false;
    let captured = false;
    let moved = 0;
    let start = { x: 0, y: 0 };
    let last = { x: 0, y: 0 };
    let P = 700;
    let cosMax = 0.6;
    const shown = new Uint8Array(placed.length);

    const size = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // eye distance from the screen: scales with the screen so the field of view stays similar
      P = Math.hypot(vw, vh) * 0.42;
      const R = P / 0.72;
      el.style.perspective = `${P.toFixed(0)}px`;
      el.style.setProperty("--R", `${R.toFixed(0)}px`);
      el.style.setProperty("--k", vw < 768 ? "1.5" : "1");
      // photos beyond the corner of the screen (plus a margin) are not drawn at all
      cosMax = Math.cos(Math.atan(Math.hypot(vw, vh) / 2 / P) + rad(8));
      shown.fill(2); // force the next tick to re-evaluate everything
    };
    const tick = () => {
      const f = gsap.ticker.deltaRatio(60);
      if (!dragging) {
        rot.y += vel.y * f;
        rot.x = clamp(rot.x + vel.x * f, -60, 60);
        vel.x *= Math.pow(0.95, f);
        vel.y += (drift - vel.y) * (1 - Math.pow(0.98, f));
      }
      w.style.transform = `translateZ(${P.toFixed(0)}px) rotateX(${rot.x.toFixed(2)}deg) rotateY(${rot.y.toFixed(2)}deg)`;
      // which photos face the screen? same rotation as the CSS above, applied to each photo's direction
      const cy = Math.cos(rad(rot.y));
      const sy = Math.sin(rad(rot.y));
      const cx = Math.cos(rad(rot.x));
      const sx = Math.sin(rad(rot.x));
      for (let i = 0; i < placed.length; i++) {
        const it = placed[i];
        const z1 = -it.ux * sy + it.uz * cy;
        const z2 = it.uy * sx + z1 * cx;
        const visible = -z2 > cosMax ? 1 : 0;
        if (shown[i] === visible) continue;
        shown[i] = visible;
        const node = nodes.current[i];
        if (node) node.style.display = visible ? "block" : "none";
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = 0;
      start = last = { x: e.clientX, y: e.clientY };
      vel.x = 0;
      vel.y = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      moved = Math.max(moved, Math.hypot(e.clientX - start.x, e.clientY - start.y));
      if (moved > DRAG && !captured) {
        captured = true;
        el.setPointerCapture(e.pointerId);
      }
      // the photos follow the finger: dragging right slides the wall to the right
      rot.y -= dx * 0.1;
      rot.x = clamp(rot.x + dy * 0.1, -60, 60);
      vel.y = -dx * 0.1;
      vel.x = dy * 0.1;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (captured && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      captured = false;
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved > DRAG) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      vel.y += clamp(e.deltaX, -80, 80) * 0.004;
      vel.x -= clamp(e.deltaY, -80, 80) * 0.004;
    };

    size();
    gsap.ticker.add(tick);
    window.addEventListener("resize", size);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", size);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("wheel", onWheel);
    };
  }, [placed]);

  useEffect(() => {
    if (!revealed || prefersReducedMotion()) return;
    gsap.fromTo(world.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4, ease: "power2.out" });
  }, [revealed]);

  return (
    <div
      ref={root}
      className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden"
      style={{ perspective: "700px", ["--R" as string]: "970px", ["--k" as string]: "1" }}
      role="region"
      aria-label="Quả cầu ảnh nhật ký, kéo để nhìn quanh"
    >
      <div ref={world} className="absolute left-1/2 top-1/2 size-0" style={{ transformStyle: "preserve-3d" }}>
        {placed.map((it, i) => (
          <TransitionLink
            key={i}
            href={`/concept/${it.photo.slug}`}
            ref={(node: HTMLAnchorElement | null) => {
              nodes.current[i] = node;
            }}
            draggable={false}
            aria-label={it.first ? `${it.photo.name}, xem concept` : undefined}
            aria-hidden={it.first ? undefined : true}
            tabIndex={it.first ? undefined : -1}
            className="group absolute left-0 top-0 hidden"
            style={{
              width: `calc(var(--R) * var(--k) * ${it.w.toFixed(4)})`,
              aspectRatio: `${it.photo.width} / ${it.photo.height}`,
              transform: `translate(-50%, -50%) rotateY(${it.lon.toFixed(2)}deg) rotateX(${(-it.lat).toFixed(2)}deg) translateZ(calc(var(--R) * -1)) rotateZ(${it.rot.toFixed(1)}deg)`,
              background: it.photo.tone,
            }}
          >
            <span className="relative block size-full transition-transform duration-300 group-hover:scale-[1.5]">
              <Image src={it.photo.src} alt="" fill sizes="96px" loading="eager" draggable={false} className="object-cover" />
            </span>
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}

export function DiaryField({ photos, tagline }: { photos: DiaryPhoto[]; tagline: string }) {
  const [mode, setMode] = useState<Mode>("grid");
  const labels: Record<Mode, string> = { grid: "Lưới", globe: "Quả cầu" };

  return (
    <main className="fixed inset-0 bg-cream" aria-label="Nhật ký ảnh">
      <h1 className="visually-hidden">Nhật ký ảnh</h1>
      {mode === "grid" ? <GridField photos={photos} /> : <GlobeField photos={photos} />}

      <div
        role="group"
        aria-label="Chế độ xem"
        className="absolute right-[2%] top-[5.25rem] z-[15] flex items-center gap-1 font-display text-[1.05rem] uppercase tracking-[0.04em] md:top-[5.75rem]"
      >
        {(["grid", "globe"] as const).map((m, i) => (
          <span key={m} className="flex items-center gap-1">
            {i === 1 && <span aria-hidden="true">/</span>}
            <button
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className="min-h-11 px-1 opacity-50 transition-opacity duration-200 aria-pressed:opacity-100"
            >
              {labels[m]}
            </button>
          </span>
        ))}
      </div>

      <p className="pointer-events-none absolute bottom-5 left-[2%] z-10 grid max-w-[calc(100%-9rem)] gap-0.5 bg-cream/90 px-3 py-2 backdrop-blur-sm">
        <span className="font-display text-[1.4rem] italic">{tagline}</span>
        <span className="text-[0.9rem] text-ink-soft">
          {photos.length} khoảnh khắc · kéo hoặc cuộn để xem, nhấn vào ảnh để mở concept
        </span>
      </p>
    </main>
  );
}

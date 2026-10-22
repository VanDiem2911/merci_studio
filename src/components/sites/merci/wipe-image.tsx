"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

interface WipeImageProps {
  src: string;
  width: number;
  height: number;
  alt: string;
  tone?: string;
  sizes: string;
  priority?: boolean;
  /** drift the photo slowly against the scroll */
  parallax?: boolean;
  /** play the wipe when scrolled into view (otherwise it shows immediately) */
  reveal?: boolean;
  className?: string;
}

/** Photo that wipes in from the bottom when it scrolls into view, with optional parallax. */
export function WipeImage({
  src,
  width,
  height,
  alt,
  tone,
  sizes,
  priority,
  parallax = true,
  reveal = true,
  className = "",
}: WipeImageProps) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current;
    const img = inner.current;
    if (!el || !img || prefersReducedMotion()) {
      if (el) el.style.clipPath = "none";
      return;
    }
    const ctx = gsap.context(() => {
      if (reveal) {
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: "power4.inOut",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
        gsap.fromTo(
          img,
          { scale: 1.3 },
          { scale: parallax ? 1.14 : 1, duration: 1.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } },
        );
      } else {
        gsap.set(el, { clipPath: "none" });
        gsap.set(img, { scale: parallax ? 1.14 : 1 });
      }
      if (parallax) {
        gsap.fromTo(
          img,
          { yPercent: -6 },
          { yPercent: 6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      }
    }, el);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [parallax, reveal]);

  return (
    <div
      ref={frame}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio: `${width} / ${height}`, background: tone, clipPath: reveal ? "inset(100% 0% 0% 0%)" : undefined }}
    >
      <div ref={inner} className="absolute inset-0 will-change-transform">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    </div>
  );
}

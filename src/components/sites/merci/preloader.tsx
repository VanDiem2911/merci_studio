"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { revealStore } from "@/lib/reveal";

const SEEN_KEY = "merci:preloaded";

/** First-visit curtain: logo fades in, curtain lifts, pages then play their entrances. */
export function Preloader() {
  const panel = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked: just play it */
    }
    const finish = () => {
      el.style.display = "none";
      revealStore.set(true);
    };
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    const tl = gsap.timeline({ onComplete: finish });
    if (!seen) {
      tl.fromTo(
        logo.current,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" },
      ).to(logo.current, { autoAlpha: 0, y: -10, duration: 0.45, ease: "power2.in" }, "+=0.35");
    } else {
      tl.set(logo.current, { autoAlpha: 0 });
    }
    tl.to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.85, ease: "power3.inOut" }, seen ? 0 : "-=0.1");
    tl.add(() => revealStore.set(true), "-=0.45");
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={panel}
      data-preloader-root
      aria-hidden="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-cream"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div ref={logo} className="w-[min(60vw,22rem)]" style={{ visibility: "hidden" }}>
        <Image
          src="/sites/merci/logo.png"
          alt=""
          width={636}
          height={248}
          priority
          className="h-auto w-full"
        />
      </div>
      <noscript>
        <style>{"[data-preloader-root]{display:none}"}</style>
      </noscript>
    </div>
  );
}

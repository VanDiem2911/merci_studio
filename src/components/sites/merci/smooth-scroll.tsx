"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { isLockedPath } from "@/lib/paths";

/** Lenis smooth scroll on regular content pages. Locked pages handle their own wheel input. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const locked = isLockedPath(pathname);
    document.documentElement.classList.toggle("no-scroll", locked);
    document.body.classList.toggle("no-scroll", locked);
    window.scrollTo(0, 0);
    if (locked || prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}

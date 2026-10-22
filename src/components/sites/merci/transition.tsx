"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { revealStore } from "@/lib/reveal";

interface TransitionApi {
  go: (href: string) => void;
}

const TransitionContext = createContext<TransitionApi>({ go: () => undefined });

export function useTransition() {
  return useContext(TransitionContext);
}

const COVER_MS = 0.6;
const UNCOVER_MS = 0.7;

/** Cream-and-ink wipe between routes. Pages wait on revealStore before playing entrances. */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const pendingHref = useRef<string | null>(null);
  const busy = useRef(false);
  const lastPath = useRef(pathname);
  const fallback = useRef<number | undefined>(undefined);

  const uncover = useCallback(() => {
    const el = overlay.current;
    window.clearTimeout(fallback.current);
    if (!el) {
      revealStore.set(true);
      busy.current = false;
      return;
    }
    gsap.to(el, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: UNCOVER_MS,
      ease: "power3.inOut",
      onStart: () => {
        window.setTimeout(() => revealStore.set(true), UNCOVER_MS * 450);
      },
      onComplete: () => {
        gsap.set(el, { display: "none" });
        busy.current = false;
        pendingHref.current = null;
      },
    });
  }, []);

  const go = useCallback(
    (href: string) => {
      if (busy.current) return;
      const target = new URL(href, window.location.href);
      if (target.origin !== window.location.origin) {
        window.location.href = href;
        return;
      }
      if (target.pathname === window.location.pathname && target.search === window.location.search) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = overlay.current;
      if (prefersReducedMotion() || !el) {
        router.push(href);
        return;
      }
      busy.current = true;
      pendingHref.current = href;
      revealStore.set(false);
      gsap.set(el, { display: "block", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.to(el, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: COVER_MS,
        ease: "power3.inOut",
        onComplete: () => {
          router.push(href);
          // if the route never changes (error, same path), do not trap the visitor
          fallback.current = window.setTimeout(uncover, 2500);
        },
      });
    },
    [router, uncover],
  );

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (pendingHref.current) {
      // let the new page mount under the cover, then lift it
      const t = window.setTimeout(uncover, 120);
      return () => window.clearTimeout(t);
    }
    // back/forward navigation: no wipe, just replay entrances
    revealStore.set(false);
    const t = window.setTimeout(() => revealStore.set(true), 80);
    return () => window.clearTimeout(t);
  }, [pathname, uncover]);

  const api = useMemo(() => ({ go }), [go]);

  return (
    <TransitionContext.Provider value={api}>
      {children}
      <div
        ref={overlay}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70] hidden bg-ink"
        style={{ clipPath: "inset(100% 0% 0% 0%)" }}
      />
    </TransitionContext.Provider>
  );
}

type LinkProps = ComponentProps<typeof Link>;

/** next/link that plays the wipe first. Modified clicks, new tabs and hash links stay native. */
export function TransitionLink({ href, onClick, target, ...rest }: LinkProps) {
  const { go } = useTransition();
  const handle = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (target && target !== "_self") return;
      const url = typeof href === "string" ? href : (href.pathname ?? "");
      if (!url.startsWith("/") || url.startsWith("//")) return;
      e.preventDefault();
      go(typeof href === "string" ? href : url);
    },
    [go, href, onClick, target],
  );
  return <Link href={href} target={target} onClick={handle} {...rest} />;
}

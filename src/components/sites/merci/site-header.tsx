"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/data/categories";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useRevealed } from "@/lib/reveal";
import { TransitionLink } from "./transition";

const LINKS = [
  { href: "/bo-suu-tap", label: "Bộ sưu tập" },
  { href: "/nhat-ky", label: "Nhật ký" },
  { href: "/bang-gia", label: "Bảng giá" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const revealed = useRevealed();
  const [menu, setMenu] = useState<{ path: string; open: boolean }>({ path: pathname, open: false });
  const [dropdown, setDropdown] = useState(false);
  const header = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const played = useRef(false);

  // the mobile menu belongs to the page it was opened on
  const mobileOpen = menu.open && menu.path === pathname;
  const closeAll = useCallback(() => {
    setMenu({ path: pathname, open: false });
    setDropdown(false);
  }, [pathname]);

  useEffect(() => {
    if (!revealed || played.current || prefersReducedMotion()) return;
    played.current = true;
    const el = header.current;
    if (!el) return;
    gsap.fromTo(
      el.querySelectorAll("[data-nav-in]"),
      { y: -16, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.06 },
    );
  }, [revealed]);

  useEffect(() => {
    const items = list.current?.querySelectorAll("li");
    if (!items || prefersReducedMotion()) return;
    if (dropdown) {
      gsap.fromTo(items, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", stagger: 0.04 });
    }
  }, [dropdown]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeAll]);

  const conceptActive = pathname.startsWith("/concept") || pathname.startsWith("/danh-muc") || pathname === "/chon-concept";

  return (
    <header ref={header} className="fixed inset-x-0 top-0 z-50">
      <nav aria-label="Chính" className="container-96 grid grid-cols-[max-content_1fr] items-center gap-4 py-3 [text-shadow:0_0_2px_var(--cream),0_0_6px_var(--cream),0_0_12px_var(--cream),0_0_22px_var(--cream)] md:py-4">
        <TransitionLink
          href="/"
          aria-label="MERCI studio, trang chủ"
          data-nav-in
          onClick={closeAll}
          className="relative z-[3] block w-[7.25rem] md:w-[8.5rem]"
        >
          <Image src="/sites/merci/logo.png" alt="MERCI studio" width={636} height={248} priority className="h-auto w-full [filter:drop-shadow(0_0_6px_var(--cream))_drop-shadow(0_0_2px_var(--cream))]" />
        </TransitionLink>

        <div
          id="site-menu"
          className={`${
            mobileOpen ? "flex" : "hidden"
          } fixed inset-0 z-[2] flex-col items-center justify-center gap-7 bg-cream md:static md:flex md:flex-row md:justify-end md:gap-6 md:bg-transparent`}
        >
          <div
            className="relative flex flex-col items-center md:items-start"
            onMouseEnter={() => matchMedia("(hover: hover)").matches && setDropdown(true)}
            onMouseLeave={() => setDropdown(false)}
            onFocus={(e) => e.target.matches(":focus-visible") && setDropdown(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setDropdown(false);
            }}
            data-nav-in
          >
            {/* the word itself is a link to every concept; the topics open on hover or keyboard focus, and on a phone
                with the +/- button beside the word */}
            <div className="flex items-center">
              <span aria-hidden="true" className="size-11 md:hidden" />
              <TransitionLink
                href="/concept"
                onClick={closeAll}
                aria-current={pathname === "/concept" ? "page" : undefined}
                aria-controls="concept-menu"
                data-open={dropdown || conceptActive}
                className="nav-link text-[2rem] md:text-[1.1rem]"
              >
                Concept
                <span aria-hidden="true" className="relative ml-1 hidden size-3 md:inline-block">
                  <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
                  <span
                    className="absolute left-1/2 top-0 h-full w-px bg-current transition-transform duration-300"
                    style={{ transform: dropdown ? "scaleY(0)" : "scaleY(1)" }}
                  />
                </span>
              </TransitionLink>
              <button
                type="button"
                aria-expanded={dropdown}
                aria-controls="concept-menu"
                aria-label={dropdown ? "Thu gọn các chủ đề" : "Mở các chủ đề"}
                onClick={() => setDropdown((v) => !v)}
                className="grid size-11 place-items-center md:hidden"
              >
                <span aria-hidden="true" className="relative block size-4">
                  <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
                  <span
                    className="absolute left-1/2 top-0 h-full w-px bg-current transition-transform duration-300"
                    style={{ transform: dropdown ? "scaleY(0)" : "scaleY(1)" }}
                  />
                </span>
              </button>
            </div>
            <div
              id="concept-menu"
              className={`${dropdown ? "block" : "hidden"} md:absolute md:left-0 md:top-full md:min-w-[14rem] md:pt-1 ${dropdown ? "md:block" : "md:hidden"}`}
            >
              <ul ref={list} className="grid gap-0.5 overflow-hidden text-center md:gap-1 md:text-left">
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <TransitionLink
                      href={`/danh-muc/${c.slug}`}
                      onClick={closeAll}
                      className="link-line block py-1 font-display text-[1.15rem] uppercase tracking-[0.04em] md:text-[0.95rem]"
                    >
                      {c.short}
                    </TransitionLink>
                  </li>
                ))}
                <li>
                  <TransitionLink href="/chon-concept" onClick={closeAll} className="link-line block py-1 font-display text-[1.15rem] uppercase tracking-[0.04em] md:text-[0.95rem]">
                    Chọn concept giúp tôi
                  </TransitionLink>
                </li>
              </ul>
            </div>
          </div>

          {LINKS.map((l) => (
            <TransitionLink
              key={l.href}
              href={l.href}
              onClick={closeAll}
              data-nav-in
              aria-current={pathname === l.href || pathname.startsWith(`${l.href}/`) ? "page" : undefined}
              className="nav-link text-[2rem] md:text-[1.1rem]"
            >
              {l.label}
            </TransitionLink>
          ))}

          <TransitionLink
            href="/dat-lich"
            onClick={closeAll}
            data-nav-in
            aria-current={pathname === "/dat-lich" ? "page" : undefined}
            className="btn-ink is-solid !min-h-[44px] text-[1.25rem] md:text-[0.85rem]"
          >
            Đặt lịch
          </TransitionLink>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileOpen}
          aria-controls="site-menu"
          onClick={() => setMenu({ path: pathname, open: !mobileOpen })}
          className="relative z-[3] ml-auto grid size-11 place-items-center md:hidden"
        >
          <span aria-hidden="true" className="relative block size-5">
            <span className="absolute left-0 top-1/2 h-px w-full bg-ink transition-transform duration-300" style={{ transform: mobileOpen ? "rotate(45deg)" : "translateY(-4px)" }} />
            <span className="absolute left-0 top-1/2 h-px w-full bg-ink transition-transform duration-300" style={{ transform: mobileOpen ? "rotate(-45deg)" : "translateY(4px)" }} />
          </span>
        </button>
      </nav>
    </header>
  );
}

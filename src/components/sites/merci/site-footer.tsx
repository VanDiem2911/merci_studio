"use client";

import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/data/categories";
import { SERVICES, SITE } from "@/data/site";
import { isLockedPath } from "@/lib/paths";
import { TransitionLink } from "./transition";

/** Footer for the scrolling content pages. The pan/strip/sphere pages are full-screen and skip it. */
export function SiteFooter() {
  const pathname = usePathname();
  if (isLockedPath(pathname)) return null;

  return (
    <footer className="mt-auto border-t border-ink/20 bg-cream">
      <div className="container-96 grid gap-10 py-10 md:grid-cols-3 md:py-14">
        <div className="grid content-start gap-4">
          <h2 className="label">Liên hệ đặt lịch</h2>
          <ul className="grid gap-3 text-[1.05rem]">
            <li>
              <a className="link-line" href={SITE.zaloUrl} target="_blank" rel="noreferrer">
                Zalo {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <a className="link-line" href={SITE.messengerUrl} target="_blank" rel="noreferrer">
                Messenger
              </a>
            </li>
            <li>
              <a className="link-line" href={SITE.facebookUrl} target="_blank" rel="noreferrer">
                Facebook MERCI studio
              </a>
            </li>
            <li>
              <a className="link-line" href={SITE.mapsUrl} target="_blank" rel="noreferrer">
                Chỉ đường trên Google Maps
              </a>
            </li>
          </ul>
        </div>
        <div className="grid content-start gap-4">
          <h2 className="label">Khám phá</h2>
          <ul className="grid gap-3 text-[1.05rem]">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <TransitionLink className="link-line" href={`/danh-muc/${c.slug}`}>
                  {c.name}
                </TransitionLink>
              </li>
            ))}
            <li>
              <TransitionLink className="link-line" href="/chon-concept">
                Chọn concept giúp tôi
              </TransitionLink>
            </li>
            <li>
              <TransitionLink className="link-line" href="/bang-gia">
                Bảng giá theo gói
              </TransitionLink>
            </li>
          </ul>
        </div>
        <div className="grid content-start gap-4">
          <h2 className="label">Dịch vụ</h2>
          <ul className="grid gap-3 text-[1.05rem] text-ink-soft">
            {SERVICES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-96 flex flex-wrap items-baseline justify-between gap-3 border-t border-ink/20 py-5 text-[0.9rem] text-ink-soft">
        <span className="font-display text-[1.1rem] italic text-ink">{SITE.tagline}</span>
        <span>
          © {new Date().getFullYear()} {SITE.name}, {SITE.city}
        </span>
      </div>
    </footer>
  );
}

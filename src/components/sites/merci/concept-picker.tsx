"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getCategory } from "@/data/categories";
import { CONCEPTS, MOODS, OCCASIONS, type Mood, type Occasion } from "@/data/concepts";
import { TransitionLink } from "./transition";

const MAX_PICKS = 3;

/** Two questions narrow the list; up to three concepts are carried into the booking form. */
export function ConceptPicker() {
  const [occasion, setOccasion] = useState<Occasion | "all">("all");
  const [mood, setMood] = useState<Mood | "all">("all");
  const [picks, setPicks] = useState<string[]>([]);

  const results = useMemo(
    () =>
      CONCEPTS.filter(
        (c) => (occasion === "all" || c.occasions.includes(occasion)) && (mood === "all" || c.moods.includes(mood)),
      ),
    [occasion, mood],
  );

  const toggle = (slug: string) =>
    setPicks((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : p.length >= MAX_PICKS ? p : [...p, slug]));

  const bookingHref = picks.length ? `/dat-lich?concept=${picks.join(",")}` : "/dat-lich";

  return (
    <main className="container-96 pb-40 pt-32 md:pt-40">
      <header className="mb-10 grid max-w-[46rem] gap-4 md:mb-14">
        <h1 className="text-[3rem] leading-none md:text-[5rem] [&::first-letter]:italic">Chọn concept</h1>
        <p className="text-[1.1rem] text-ink-soft">
          Trả lời hai câu hỏi, MERCI lọc giúp những concept hợp với bạn. Chọn tối đa {MAX_PICKS} concept rồi sang bước đặt lịch.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="field">
          <legend className="legend mb-2 font-display text-[0.85rem] uppercase tracking-[0.06em]">1. Bạn chụp cho dịp nào?</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="chip" aria-pressed={occasion === "all"} onClick={() => setOccasion("all")}>
              Dịp nào cũng được
            </button>
            {OCCASIONS.map((o) => (
              <button key={o.id} type="button" className="chip" aria-pressed={occasion === o.id} onClick={() => setOccasion(o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend className="legend mb-2 font-display text-[0.85rem] uppercase tracking-[0.06em]">2. Bạn thích tông ảnh nào?</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="chip" aria-pressed={mood === "all"} onClick={() => setMood("all")}>
              Tông nào cũng được
            </button>
            {MOODS.map((m) => (
              <button key={m.id} type="button" className="chip" aria-pressed={mood === m.id} onClick={() => setMood(m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <p role="status" aria-live="polite" className="mb-6 mt-10 font-display text-[1.3rem] italic">
        {results.length > 0 ? `${results.length} concept phù hợp` : "Chưa có concept khớp cả hai lựa chọn"}
      </p>

      {results.length === 0 ? (
        <div className="grid justify-items-start gap-4 border border-ink/30 p-6">
          <p>Thử nới một trong hai lựa chọn, hoặc nhắn MERCI để dựng concept riêng cho bạn.</p>
          <button
            type="button"
            className="btn-ink"
            onClick={() => {
              setOccasion("all");
              setMood("all");
            }}
          >
            Xem tất cả concept
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {results.map((c) => {
            const picked = picks.includes(c.slug);
            const full = !picked && picks.length >= MAX_PICKS;
            return (
              <li key={c.slug} className="grid content-start gap-2">
                <div className="relative aspect-[4/5] overflow-hidden" style={{ background: c.images[0].tone }}>
                  <Image
                    src={c.images[0].src}
                    alt={`${c.name}, ảnh đại diện`}
                    fill
                    sizes="(max-width: 767px) 46vw, (max-width: 1023px) 31vw, 23vw"
                    className="object-cover"
                  />
                  {picked && (
                    <span className="absolute left-2 top-2 rounded-full bg-ink px-3 py-1 text-[0.8rem] text-cream">Đã chọn</span>
                  )}
                </div>
                <div className="grid gap-0.5">
                  <h2 className="font-display text-[1.25rem] leading-tight">{c.name}</h2>
                  <p className="text-[0.9rem] text-ink-soft">{getCategory(c.category)?.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="chip"
                    aria-pressed={picked}
                    disabled={full}
                    onClick={() => toggle(c.slug)}
                    aria-label={`${picked ? "Bỏ chọn" : "Chọn"} concept ${c.name}`}
                  >
                    {picked ? "Bỏ chọn" : full ? "Đã đủ 3" : "Chọn"}
                  </button>
                  <TransitionLink href={`/concept/${c.slug}`} className="chip inline-flex items-center">
                    Xem
                  </TransitionLink>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {picks.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-[40] border-t border-ink/25 bg-cream/95 backdrop-blur">
          <div className="container-96 flex flex-wrap items-center justify-between gap-3 py-3 pr-0 md:pr-40">
            <p className="min-w-0 text-[0.95rem]" aria-live="polite">
              Đã chọn {picks.length}/{MAX_PICKS}:{" "}
              <span className="font-medium">{picks.map((s) => CONCEPTS.find((c) => c.slug === s)?.name).join(", ")}</span>
            </p>
            <TransitionLink href={bookingHref} className="btn-ink is-solid">
              Tiếp tục đặt lịch
            </TransitionLink>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { CONCEPTS } from "@/data/concepts";
import { getPackage, PACKAGES } from "@/data/packages";
import { SITE } from "@/data/site";

const SLOTS = ["Buổi sáng", "Buổi chiều", "Buổi tối", "Nhờ MERCI gợi ý"] as const;
const MAX_CONCEPTS = 3;

interface Values {
  name: string;
  phone: string;
  concepts: string[];
  pack: string;
  date: string;
  slot: string;
  people: string;
  note: string;
}

type Errors = Partial<Record<"name" | "phone" | "date" | "people", string>>;

function todayIso(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function normalisePhone(raw: string): string {
  return raw.replace(/[\s.\-()]/g, "");
}

function validate(v: Values): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Bạn cho MERCI biết tên nhé (ít nhất 2 ký tự).";
  if (!/^(0|\+84)\d{9,10}$/.test(normalisePhone(v.phone))) e.phone = "Số điện thoại chưa đúng. Ví dụ: 0981 949 108.";
  if (v.date && v.date < todayIso()) e.date = "Ngày chụp cần từ hôm nay trở đi.";
  const people = Number(v.people);
  if (!Number.isInteger(people) || people < 1 || people > 10) e.people = "Số người từ 1 đến 10.";
  return e;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function buildMessage(v: Values): string {
  const names = v.concepts.map((s) => CONCEPTS.find((c) => c.slug === s)?.name).filter(Boolean);
  const pack = getPackage(v.pack);
  const lines = [
    "[Đặt lịch chụp tại MERCI studio]",
    `Họ tên: ${v.name.trim()}`,
    `SĐT/Zalo: ${normalisePhone(v.phone)}`,
    `Concept: ${names.length ? names.join(", ") : "Chưa chọn, cần tư vấn"}`,
    `Gói: ${pack ? pack.name : "Chưa chọn, cần tư vấn"}`,
    `Ngày mong muốn: ${v.date ? formatDate(v.date) : "Chưa chắc, nhờ MERCI gợi ý"}`,
    `Khung giờ: ${v.slot}`,
    `Số người: ${v.people}`,
  ];
  if (v.note.trim()) lines.push(`Ghi chú: ${v.note.trim()}`);
  return lines.join("\n");
}

/**
 * Collects a booking request and hands it to the studio as a ready-made Zalo / Messenger message.
 * Nothing is stored on this site yet: the admin inbox is a later phase.
 */
export function BookingForm() {
  const params = useSearchParams();
  const uid = useId();
  const initial = useMemo<Values>(() => {
    const fromUrl = (params.get("concept") ?? "")
      .split(",")
      .filter((s) => CONCEPTS.some((c) => c.slug === s))
      .slice(0, MAX_CONCEPTS);
    const pack = params.get("goi") ?? "";
    return {
      name: "",
      phone: "",
      concepts: fromUrl,
      pack: getPackage(pack) ? pack : "",
      date: "",
      slot: SLOTS[3],
      people: "1",
      note: "",
    };
  }, [params]);

  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Errors, boolean>>>({});
  const [sent, setSent] = useState<string | null>(null);
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const today = useMemo(() => todayIso(), []);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (key in errors || touched[key as keyof Errors]) setErrors(validate(next));
  };
  const blur = (key: keyof Errors) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(values));
  };
  const toggleConcept = (slug: string) =>
    set(
      "concepts",
      values.concepts.includes(slug)
        ? values.concepts.filter((s) => s !== slug)
        : values.concepts.length >= MAX_CONCEPTS
          ? values.concepts
          : [...values.concepts, slug],
    );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, phone: true, date: true, people: true });
    const firstKey = (["name", "phone", "date", "people"] as const).find((k) => found[k]);
    if (firstKey) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }
    setSent(buildMessage(values));
    setCopied(null);
  };

  const copy = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("ok");
      return true;
    } catch {
      setCopied("fail");
      return false;
    }
  };

  const err = (k: keyof Errors) => (touched[k] || errors[k] ? errors[k] : undefined);

  if (sent) {
    return (
      <section aria-labelledby={`${uid}-done`} className="grid max-w-[44rem] gap-6">
        <h2 id={`${uid}-done`} className="text-[2.2rem] leading-tight md:text-[3rem]">
          Gần xong rồi. Gửi tin nhắn này cho MERCI nhé.
        </h2>
        <p className="text-ink-soft">
          Yêu cầu của bạn <strong className="font-semibold text-ink">chưa được lưu trên website</strong>. Bấm một trong hai nút
          dưới đây: nội dung được sao chép sẵn, bạn chỉ cần dán vào khung chat để MERCI xác nhận lịch.
        </p>
        <label className="field">
          <span className="legend font-display text-[0.85rem] uppercase tracking-[0.06em]">Tin nhắn</span>
          <textarea readOnly rows={9} value={sent} className="input font-mono text-[0.95rem]" onFocus={(e) => e.currentTarget.select()} />
        </label>
        <div className="flex flex-wrap gap-3">
          <a
            href={SITE.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-ink is-solid"
            onClick={() => void copy(sent)}
          >
            Sao chép và mở Zalo
          </a>
          <a href={SITE.messengerUrl} target="_blank" rel="noreferrer" className="btn-ink" onClick={() => void copy(sent)}>
            Sao chép và mở Messenger
          </a>
          <button type="button" className="btn-ink" onClick={() => void copy(sent)}>
            Chỉ sao chép
          </button>
          <button type="button" className="btn-ink" onClick={() => setSent(null)}>
            Sửa lại thông tin
          </button>
        </div>
        <p role="status" aria-live="polite" className="min-h-6 text-[0.95rem]">
          {copied === "ok" && "Đã sao chép tin nhắn. Dán vào khung chat là xong."}
          {copied === "fail" && "Trình duyệt không cho sao chép tự động. Hãy bôi đen khung tin nhắn ở trên rồi sao chép."}
        </p>
      </section>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid max-w-[46rem] gap-6" aria-describedby={`${uid}-intro`}>
      <p id={`${uid}-intro`} className="text-[0.95rem] text-ink-soft">
        Các mục có dấu <span aria-hidden="true">*</span>
        <span className="visually-hidden">sao</span> là bắt buộc. Sau bước này bạn sẽ gửi yêu cầu qua Zalo hoặc Messenger.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="field">
          <label htmlFor={`${uid}-name`}>Họ tên *</label>
          <input
            id={`${uid}-name`}
            name="name"
            className="input"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => blur("name")}
            aria-invalid={!!err("name")}
            aria-describedby={err("name") ? `${uid}-name-err` : undefined}
            required
          />
          {err("name") && (
            <p id={`${uid}-name-err`} className="field-error">
              {err("name")}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-phone`}>SĐT / Zalo *</label>
          <input
            id={`${uid}-phone`}
            name="phone"
            className="input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0981 949 108"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() => blur("phone")}
            aria-invalid={!!err("phone")}
            aria-describedby={err("phone") ? `${uid}-phone-err` : undefined}
            required
          />
          {err("phone") && (
            <p id={`${uid}-phone-err`} className="field-error">
              {err("phone")}
            </p>
          )}
        </div>
      </div>

      <fieldset className="field">
        <legend className="legend mb-2 font-display text-[0.85rem] uppercase tracking-[0.06em]">
          Concept quan tâm (tối đa {MAX_CONCEPTS})
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONCEPTS.map((c) => {
            const on = values.concepts.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                className="chip"
                aria-pressed={on}
                disabled={!on && values.concepts.length >= MAX_CONCEPTS}
                onClick={() => toggleConcept(c.slug)}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        <p className="text-[0.9rem] text-ink-soft">Chưa chọn được? Cứ để trống, MERCI sẽ tư vấn.</p>
      </fieldset>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="field">
          <label htmlFor={`${uid}-pack`}>Gói chụp</label>
          <select id={`${uid}-pack`} className="input" value={values.pack} onChange={(e) => set("pack", e.target.value)}>
            <option value="">Chưa chọn, cần tư vấn</option>
            {PACKAGES.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${uid}-people`}>Số người chụp *</label>
          <input
            id={`${uid}-people`}
            name="people"
            className="input"
            type="number"
            min={1}
            max={10}
            inputMode="numeric"
            value={values.people}
            onChange={(e) => set("people", e.target.value)}
            onBlur={() => blur("people")}
            aria-invalid={!!err("people")}
            aria-describedby={err("people") ? `${uid}-people-err` : undefined}
          />
          {err("people") && (
            <p id={`${uid}-people-err`} className="field-error">
              {err("people")}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-date`}>Ngày mong muốn</label>
          <input
            id={`${uid}-date`}
            name="date"
            className="input"
            type="date"
            min={today}
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            onBlur={() => blur("date")}
            aria-invalid={!!err("date")}
            aria-describedby={err("date") ? `${uid}-date-err` : undefined}
          />
          {err("date") && (
            <p id={`${uid}-date-err`} className="field-error">
              {err("date")}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-slot`}>Khung giờ</label>
          <select id={`${uid}-slot`} className="input" value={values.slot} onChange={(e) => set("slot", e.target.value)}>
            {SLOTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${uid}-note`}>Ghi chú (ý tưởng, màu sắc, dịp đặc biệt)</label>
        <textarea
          id={`${uid}-note`}
          className="input"
          rows={4}
          maxLength={500}
          value={values.note}
          onChange={(e) => set("note", e.target.value)}
        />
        <p className="text-right text-[0.85rem] text-ink-soft">{values.note.length}/500</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-ink is-solid">
          Tạo tin nhắn đặt lịch
        </button>
        <p className="text-[0.9rem] text-ink-soft">Hoặc nhắn thẳng qua Zalo {SITE.phoneDisplay}.</p>
      </div>
    </form>
  );
}

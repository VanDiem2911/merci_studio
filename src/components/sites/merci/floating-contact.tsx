import { MessageCircle, Phone } from "lucide-react";
import { SITE } from "@/data/site";

/** Always-on shortcuts to Zalo and Messenger. Icon-only on phones so they never cover content. */
export function FloatingContact() {
  const base =
    "group flex size-12 items-center justify-center gap-2 rounded-full bg-cream text-[0.95rem] font-medium text-ink shadow-[0_6px_24px_-10px_rgb(27_23_19/0.45)] transition-[background,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-cream focus-visible:bg-ink focus-visible:text-cream md:h-12 md:w-auto md:px-4";
  return (
    <div className="fixed bottom-4 right-4 z-[55] grid gap-2 md:bottom-6 md:right-6">
      <a href={SITE.zaloUrl} target="_blank" rel="noreferrer" className={base} aria-label={`Nhắn Zalo ${SITE.phoneDisplay}`}>
        <Phone className="size-[1.1rem]" aria-hidden="true" />
        <span className="hidden md:inline">Zalo</span>
      </a>
      <a href={SITE.messengerUrl} target="_blank" rel="noreferrer" className={base} aria-label="Nhắn qua Messenger">
        <MessageCircle className="size-[1.1rem]" aria-hidden="true" />
        <span className="hidden md:inline">Messenger</span>
      </a>
    </div>
  );
}

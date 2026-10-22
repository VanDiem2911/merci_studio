import { TransitionLink } from "@/components/sites/merci/transition";

export default function NotFound() {
  return (
    <main className="container-96 grid min-h-svh content-center justify-items-start gap-5 py-32">
      <p className="label">404</p>
      <h1 className="text-[3rem] leading-none md:text-[5.5rem] [&::first-letter]:italic">Trang này không có.</h1>
      <p className="max-w-[44ch] text-[1.1rem] text-ink-soft">
        Có thể đường dẫn đã đổi hoặc concept này đã được gỡ. Mời bạn xem các concept đang có hoặc về trang chủ.
      </p>
      <div className="flex flex-wrap gap-3">
        <TransitionLink href="/concept" className="btn-ink is-solid">
          Xem tất cả concept
        </TransitionLink>
        <TransitionLink href="/" className="btn-ink">
          Về trang chủ
        </TransitionLink>
      </div>
    </main>
  );
}

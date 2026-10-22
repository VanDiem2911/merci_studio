import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/sites/merci/booking-form";

export const metadata: Metadata = {
  title: "Đặt lịch chụp",
  description: "Điền vài thông tin, MERCI studio tạo sẵn tin nhắn để bạn gửi qua Zalo hoặc Messenger và chốt lịch.",
};

export default function BookingPage() {
  return (
    <main className="container-96 pb-20 pt-32 md:pt-40">
      <header className="mb-10 grid max-w-[44rem] gap-4 md:mb-14">
        <h1 className="text-[3rem] leading-none md:text-[5rem] [&::first-letter]:italic">Đặt lịch chụp</h1>
        <p className="text-[1.1rem] text-ink-soft">
          Kể cho MERCI biết bạn muốn chụp gì và khi nào. Chúng mình xác nhận lịch qua Zalo hoặc Messenger.
        </p>
      </header>
      <Suspense fallback={<p className="text-ink-soft">Đang tải biểu mẫu…</p>}>
        <BookingForm />
      </Suspense>
    </main>
  );
}

import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import { FloatingContact } from "@/components/sites/merci/floating-contact";
import { Preloader } from "@/components/sites/merci/preloader";
import { SiteFooter } from "@/components/sites/merci/site-footer";
import { SiteHeader } from "@/components/sites/merci/site-header";
import { SmoothScroll } from "@/components/sites/merci/smooth-scroll";
import { TransitionProvider } from "@/components/sites/merci/transition";
import { SITE } from "@/data/site";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.descriptor}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "MERCI studio chụp ảnh concept cá nhân, chân dung, nghệ thuật, cổ trang và chủ đề riêng tại TP. Hồ Chí Minh. Chọn concept, xem bảng giá, đặt lịch qua Zalo hoặc Messenger.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.descriptor}`,
    description: SITE.tagline,
    images: [{ url: "/sites/merci/concepts/lily-voan-trang/lily-voan-trang-01.jpg", width: 824, height: 824 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4eee2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${playfair.variable} ${beVietnam.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="visually-hidden focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
        >
          Bỏ qua điều hướng
        </a>
        <TransitionProvider>
          <SmoothScroll />
          <SiteHeader />
          <div id="main" className="flex flex-1 flex-col">
            {children}
          </div>
          <SiteFooter />
          <FloatingContact />
          <Preloader />
        </TransitionProvider>
      </body>
    </html>
  );
}

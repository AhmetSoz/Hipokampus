import type { Metadata, Viewport } from "next";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

/* Tipografi ÖNERİ statüsündedir (bkz. karar kaydı C bölümü).
   Değiştirmek için bu iki tanım ve globals.css'teki iki satır yeterli. */
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans",
  display: "swap",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Hipokampüs — Bakım sürecinde yol arkadaşınız",
    template: "%s · Hipokampüs",
  },
  description:
    "İleri yaştaki bireylerin ve ailelerinin ihtiyaçlarını netleştirmesine, " +
    "doğrulanmış uzmanlarla buluşmasına ve bakım sürecini planlamasına yardımcı " +
    "olmayı hedefleyen dijital koordinasyon platformu. Hipokampüs bir sağlık " +
    "kuruluşu değildir.",
  robots: {
    // Site henüz yayında değil (KAPI 1 açılmadı). Dizine eklenmesini istemiyoruz.
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0e5c63",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${newsreader.variable} ${sourceSans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper">
        <a
          href="#icerik"
          className="sr-only rounded-md bg-teal-700 px-5 py-3 text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
        >
          Doğrudan içeriğe geç
        </a>
        <SiteHeader />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

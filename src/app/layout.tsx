import type { Metadata, Viewport } from "next";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCurrentUser } from "@/data/session";
import "./globals.css";

/**
 * Başlıktaki giriş durumu. Sunucuda çözülüp istemci bileşenine veri
 * olarak geçilir — SiteHeader etkileşimli olduğu için istemci bileşeni,
 * oturum bilgisiyse yalnızca sunucuda okunabilir.
 */
async function getHeaderSession() {
  const user = await getCurrentUser();
  if (!user) return null;
  return { role: user.role };
}

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
    default: "Hipokampüs — Gerontoloji uzmanlarıyla görüşün",
    template: "%s · Hipokampüs",
  },
  description:
    "İleri yaştaki bireylerin ve ailelerinin ihtiyaçlarını netleştirmesine, " +
    "doğrulanmış gerontoloji uzmanlarıyla görüşmesine ve süreci planlamasına yardımcı " +
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${newsreader.variable} ${sourceSans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper">
        {/* Kayıtlı okuma tercihlerini ilk boyamadan önce uygula —
            yoksa sayfa açılırken yazı boyutu bir an sıçrıyor. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var r=document.documentElement;var s=localStorage.getItem("hk-text-size");if(s)r.dataset.textSize=s;var m=localStorage.getItem("hk-motion");if(m)r.dataset.motion=m;}catch(e){}`,
          }}
        />
        <a
          href="#icerik"
          className="sr-only rounded-md bg-teal-700 px-5 py-3 text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
        >
          Doğrudan içeriğe geç
        </a>
        <SiteHeader session={await getHeaderSession()} />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

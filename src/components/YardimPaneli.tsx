"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * "Ne nerede?" yardım paneli.
 *
 * Sahibinin talebi: "sayfayı ilk açtığımızda istediğimiz zaman
 * tıklayabileceğimiz, ne nerede sorabileceğimiz bir bölme olması lazım;
 * hiçbir şeyi nereden kullanacağımı bulamadım."
 *
 * Sağ altta sabit bir düğme; her panel sayfasında aynı yerde (WCAG 3.2.6,
 * yardımın tutarlı konumu). Rol'e göre farklı içerik gösterir çünkü
 * danışanın ve uzmanın soruları aynı değil.
 *
 * Tasarım kararı: modal DEĞİL, yandan açılan bir panel. Modal sayfayı
 * kilitler; buradaki amaç kullanıcının panele bakarken açıklamayı
 * okuyabilmesi.
 */

type Madde = { baslik: string; metin: string; href?: string; link?: string };

const DANISAN: Madde[] = [
  {
    baslik: "Uzmanı nasıl seçerim?",
    metin:
      "Menüdeki “Uzman bulun” düğmesi sizi uzman listesine götürür. Konuya göre süzebilir, profili açıp “… ile başlayın” diyerek başvurabilirsiniz. Sıralama ücretle değişmez.",
    href: "/uzmanlar",
    link: "Uzman listesini açın",
  },
  {
    baslik: "Uzmanla nerede yazışırım?",
    metin:
      "“Mesajlarım” bölümünde. Her başvuru bir danışma dosyası olur; yazışma, görüşme takvimi ve seans notları o dosyanın içindedir.",
    href: "/panel/mesajlar",
    link: "Mesajlarıma gidin",
  },
  {
    baslik: "Görüşme nasıl ayarlanır?",
    metin:
      "Uzman size bir saat önerir; dosyanın içindeki “Görüşme takvimi” bölümünde onaylarsınız. Onayladıktan sonra görüşme bağlantısı görünür.",
  },
  {
    baslik: "Formlar ne işe yarar?",
    metin:
      "Uzman sizi daha iyi tanımak için form gönderebilir. “Formlar” bölümünde doldurursunuz. Puan verilmez, tanı konmaz; yanıtlarınız uzmana olduğu gibi iletilir.",
    href: "/panel/formlar",
    link: "Formlarımı görün",
  },
  {
    baslik: "Danışmanlık planı nedir?",
    metin:
      "Görüşmenin kalıcı çıktısı. Maddeler hâlinde yazılır ve her maddenin durumunu (yapılacak / sürüyor / tamamlandı) siz güncellersiniz.",
    href: "/panel/plan",
    link: "Planı açın",
  },
  {
    baslik: "Aile üyeleri neyi görüyor?",
    metin:
      "“Erişim ve izinler” bölümünde kimin neyi gördüğünü görürsünüz. Ödeme yapmak, sağlık ve görüşme verisini görme hakkı vermez.",
    href: "/panel/erisim",
    link: "Erişimi inceleyin",
  },
];

const UZMAN: Madde[] = [
  {
    baslik: "Danışanlarım nerede?",
    metin:
      "“Danışanlarım” bölümünde, her danışan ve ona ait açık dosyalar listelenir. Dosyaya girince tüm araçlar sekmeler hâlinde önünüze gelir.",
    href: "/uzman-panel/danisanlar",
    link: "Danışanlarıma gidin",
  },
  {
    baslik: "Dosya içindeki sekmeler ne işe yarar?",
    metin:
      "Yazışma: mesajlar ve görüşme takvimi. Seanslar: her görüşmeden sonraki notlarınız ve ölçümler. Formlar: atadığınız değerlendirmeler ve gelen yanıtlar. Görevler: danışmanlık planına eklediğiniz maddeler.",
  },
  {
    baslik: "Görüşmeyi nasıl ayarlarım?",
    metin:
      "Yazışma sekmesindeki “Yeni görüşme önerin” bölümünden tarih, saat ve bağlantı girersiniz. Danışan onaylayana kadar bağlantı ona gösterilmez.",
  },
  {
    baslik: "Seans notu ve grafik nasıl çalışır?",
    metin:
      "Seanslar sekmesinde not bırakırsınız; isterseniz ölçüm de eklersiniz. Aynı etiketi ikinci kez kullandığınızda değişim otomatik olarak grafiğe döner. Not önce taslak olur, “Yayınla” demeden danışan görmez.",
  },
  {
    baslik: "Form atamak zorunda mıyım?",
    metin:
      "Hayır. Formlar sekmesinden isterseniz atarsınız; danışan doldurduğunda yanıtlar aynı sekmede tablo hâlinde görünür. Puan hesaplanmaz, yorum size aittir.",
  },
];

export function YardimPaneli({ rol }: { rol: "danisan" | "uzman" }) {
  const [open, setOpen] = useState(false);
  const maddeler = rol === "uzman" ? UZMAN : DANISAN;

  // Esc ile kapansın — açık bir panelin kaçış yolu olmalı.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="hk-yardim"
        className="fixed right-5 bottom-5 z-40 flex min-h-[3.25rem] items-center gap-2 rounded-full bg-teal-700 px-5 font-semibold text-white shadow-[var(--shadow-pop)] transition-[transform,background-color] duration-[var(--dur-base)] ease-[var(--ease-calm)] hover:-translate-y-px hover:bg-teal-800 active:scale-[0.97]"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none">
          <circle cx="10" cy="10" r="8.2" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M7.6 7.6a2.4 2.4 0 1 1 3.2 2.26c-.5.18-.8.66-.8 1.19v.35"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="10" cy="14.4" r="1" fill="currentColor" />
        </svg>
        {open ? "Kapatın" : "Ne nerede?"}
      </button>

      {open && (
        <>
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="hk-fade fixed inset-0 z-40 bg-ink-900/20"
          />
          <aside
            id="hk-yardim"
            aria-label="Ne nerede? yardım paneli"
            className="hk-slide-in fixed top-0 right-0 bottom-0 z-50 w-full max-w-md overflow-y-auto border-l border-ink-200 bg-paper p-6 shadow-[var(--shadow-pop)] sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
                  Yardım
                </p>
                <h2 className="text-2xl">Ne nerede?</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[2.75rem] rounded-lg border-2 border-ink-300 px-4 font-semibold text-ink-800 hover:bg-ink-100"
              >
                Kapatın
              </button>
            </div>

            <ul className="space-y-4">
              {maddeler.map((m) => (
                <li
                  key={m.baslik}
                  className="rounded-xl border border-ink-200 bg-white p-5 shadow-[var(--shadow-soft)]"
                >
                  <p className="mb-2 text-lg font-semibold text-ink-900">
                    {m.baslik}
                  </p>
                  <p className="text-ink-700">{m.metin}</p>
                  {m.href && (
                    <Link
                      href={m.href}
                      onClick={() => setOpen(false)}
                      className="mt-3 inline-block font-semibold text-teal-800 underline underline-offset-4"
                    >
                      {m.link} →
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-6 rounded-xl border-l-4 border-teal-300 bg-teal-50 p-4 text-ink-800">
              Hipokampüs bir sağlık kuruluşu değildir; tanı koymaz, tedavi
              uygulamaz. Acil bir durumda <strong>112&apos;yi arayın.</strong>
            </p>
          </aside>
        </>
      )}
    </>
  );
}

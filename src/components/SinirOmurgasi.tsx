"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sinir omurgası — sayfayı boydan boya kat eden, kaydırdıkça çizilen
 * tek bir sinir lifi. Bölümler bu lifin üzerindeki düğümlere oturur ve
 * lif oraya ulaştığında düğüm yanar.
 *
 * Sahibinin isteği: "sinir ağlarıyla bağlamayı yaparken her şeyi kılıfına
 * uydurmamız lazım" — bölümleri yalnızca soldurarak açmak yetersizdi,
 * aralarında görünür bir bağ yoktu. Artık anlatı fiziksel olarak bağlı.
 *
 * Düğüm konumları çalışma anında `[data-omurga]` işaretli bölümlerden
 * okunuyor; sayfaya bölüm eklendiğinde burada elle bir şey güncellemek
 * gerekmiyor.
 *
 * Başarım: scroll dinleyicisi rAF ile kısılıyor ve `passive`. Her karede
 * DOM ölçmüyoruz — konumlar yalnızca yükleme ve yeniden boyutlandırmada
 * hesaplanıyor.
 */

type Dugum = { yuzde: number; etiket: string };

export function SinirOmurgasi() {
  const ref = useRef<HTMLDivElement>(null);
  const [dugumler, setDugumler] = useState<Dugum[]>([]);
  const [ilerleme, setIlerleme] = useState(0);
  const [hareketVar, setHareketVar] = useState(true);

  // Hareket tercihini bir kez oku (efekt içinde setState uyarısı vermesin
  // diye başlangıç değerini fonksiyonla veremiyoruz: SSR'da window yok).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const uygula = () => setHareketVar(!mq.matches);
    uygula();
    mq.addEventListener("change", uygula);
    return () => mq.removeEventListener("change", uygula);
  }, []);

  useEffect(() => {
    const kap = ref.current;
    if (!kap) return;

    const olc = () => {
      const kapUst = kap.getBoundingClientRect().top + window.scrollY;
      const kapYuk = kap.offsetHeight || 1;
      const bulunan: Dugum[] = [];
      kap.querySelectorAll<HTMLElement>("[data-omurga]").forEach((el) => {
        const merkez =
          el.getBoundingClientRect().top + window.scrollY - kapUst + 64;
        bulunan.push({
          yuzde: Math.min(98, Math.max(2, (merkez / kapYuk) * 100)),
          etiket: el.dataset.omurga ?? "",
        });
      });
      setDugumler(bulunan);
    };

    let bekleyen = false;
    const guncelle = () => {
      bekleyen = false;
      const kapUst = kap.getBoundingClientRect().top + window.scrollY;
      const kapYuk = kap.offsetHeight || 1;
      // Ekranın ortası referans: bölüm ortaya geldiğinde düğüm yanar.
      const okuma = window.scrollY + window.innerHeight * 0.5 - kapUst;
      setIlerleme(Math.min(1, Math.max(0, okuma / kapYuk)));
    };
    const onScroll = () => {
      if (bekleyen) return;
      bekleyen = true;
      requestAnimationFrame(guncelle);
    };

    olc();
    guncelle();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", olc);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", olc);
    };
  }, []);

  // Hareket kapalıysa lif tamamen çizili dursun; yine de bağ görünür.
  const cizili = hareketVar ? ilerleme : 1;

  return (
    /* İçerik sütununa hizalanıyor: ekranın en solunda dururken anlatıdan
       kopuk görünüyordu. Dış sarmalayıcı içerikle aynı genişlikte
       ortalanıyor, lif de onun sol kenarının hemen dışında duruyor. */
    <div
      ref={ref}
      aria-hidden
      /* z-10: bölümler `relative` olduğu için DOM sırasıyla omurganın
         üstüne boyanıyor ve lifi yutuyordu. Lif yalnızca soldaki boş
         kanalda ve pointer-events-none, üstte durması sorun değil. */
      className="pointer-events-none absolute inset-y-0 right-0 left-0 z-10 hidden lg:block"
    >
      <div className="relative mx-auto h-full w-full max-w-[84rem]">
        <div className="absolute inset-y-0 left-0 w-16">
      <svg
        viewBox="0 0 64 1000"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {/* Sönük iz: lifin nereye gideceğini önceden gösterir */}
        <path
          d={OMURGA}
          fill="none"
          stroke="var(--color-ink-200)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Çizilen lif */}
        <path
          d={OMURGA}
          fill="none"
          stroke="var(--color-teal-600)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - cizili}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
      </svg>

      {/* Düğümler — lif ulaştığında yanar */}
      {dugumler.map((d, i) => {
        const yanik = cizili * 100 >= d.yuzde - 1;
        return (
          <div
            key={i}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ top: `${d.yuzde}%` }}
          >
            <span
              className={`block rounded-full transition-[width,height,background-color,box-shadow] duration-[var(--dur-slow)] ease-[var(--ease-calm)] ${
                yanik
                  ? "size-4 bg-teal-700 shadow-[0_0_0_7px_var(--color-teal-100)]"
                  : "size-2.5 bg-ink-200"
              }`}
            />
          </div>
        );
      })}
        </div>
      </div>
    </div>
  );
}

/* Hafifçe kıvrılan dikey lif — düz çizgi mekanik duruyor. */
const OMURGA =
  "M32 0 C20 120, 44 200, 32 320 C20 440, 44 520, 32 640 C20 760, 44 840, 32 1000";

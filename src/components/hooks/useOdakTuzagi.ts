"use client";

import { useEffect, useRef } from "react";

/**
 * Açılır panellerde odak yönetimi.
 *
 * Projede dört yüzen katman var (YardimPaneli, MesajKutusu, BildirimZili,
 * mobil menü) ve hiçbirinde odak yönetimi yoktu: panel açılınca odak
 * sayfa gövdesinde kalıyor, Tab arka plandaki içeriğe kaçıyor ve panel
 * kapanınca odak sayfa başına düşüyordu. Klavye kullanıcısı her açıp
 * kapatmada yerini kaybediyordu.
 *
 * TUZAK HERKESE UYGULANMAZ. Bu bilinçli:
 *  - Arka planı karartıp tıklamayı yutan katman FİİLEN modaldir; orada
 *    Tab'ın dışarı çıkması yanlış (`tuzak: true`).
 *  - Karartmayan, sayfayı okunur bırakan katmanda tuzak YANLIŞ olur —
 *    kullanıcıyı okuyabildiği içerikten hapseder (`tuzak: false`).
 * İkisinde de ortak olan: Escape ile kapanma ve kapanışta odağın
 * tetikleyiciye dönmesi.
 *
 * `inert` KULLANILMIYOR: App Router'da arka plan ağacına güvenilir
 * biçimde uygulanamıyor ve polyfill'i yok. `aria-modal="true"` + odak
 * tuzağı aynı işi görüyor.
 */

const ODAKLANABILIR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useOdakTuzagi(
  ref: React.RefObject<HTMLElement | null>,
  {
    acik,
    kapat,
    tuzak = false,
  }: { acik: boolean; kapat: () => void; tuzak?: boolean },
) {
  /* Paneli açan öğe. Kapanışta odağı buraya geri veriyoruz. */
  const tetikleyici = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!acik) return;

    tetikleyici.current = document.activeElement as HTMLElement | null;

    /* Açılışta ilk odaklanabilir öğeye geç; yoksa kabın kendisine.
       Kap `tabIndex={-1}` taşımalı ki odak alabilsin. */
    const kap = ref.current;
    const ilk = kap?.querySelector<HTMLElement>(ODAKLANABILIR);
    (ilk ?? kap)?.focus();

    function tusa(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        kapat();
        return;
      }
      if (e.key !== "Tab" || !tuzak) return;

      const kap = ref.current;
      if (!kap) return;
      const odaklar = [...kap.querySelectorAll<HTMLElement>(ODAKLANABILIR)]
        /* Görünmeyen öğeler (kapalı alt bölüm, `hidden`) Tab sırasında
           yok sayılır; döngüye katarsak odak kaybolur. */
        .filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (odaklar.length === 0) return;

      const ilk = odaklar[0];
      const son = odaklar[odaklar.length - 1];

      if (e.shiftKey && document.activeElement === ilk) {
        e.preventDefault();
        son.focus();
      } else if (!e.shiftKey && document.activeElement === son) {
        e.preventDefault();
        ilk.focus();
      }
    }

    document.addEventListener("keydown", tusa);
    return () => {
      document.removeEventListener("keydown", tusa);
      /* Kapanışta odağı geri ver — ama yalnızca odak hâlâ panelin
         içindeyse. Kullanıcı bu arada başka bir yere tıkladıysa onun
         seçimini bozmuyoruz. */
      const aktif = document.activeElement;
      if (!aktif || aktif === document.body || ref.current?.contains(aktif)) {
        tetikleyici.current?.focus();
      }
    };
  }, [acik, kapat, tuzak, ref]);
}

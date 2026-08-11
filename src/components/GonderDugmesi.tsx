"use client";

import { useFormStatus } from "react-dom";
import { Dugme } from "./form";

/**
 * Gönderim sırasında kendini devre dışı bırakan submit düğmesi.
 *
 * İki işi var:
 *  1. ERİŞİLEBİLİRLİK: `aria-busy` ve değişen metin, işlemin sürdüğünü
 *     ekran okuyucuya da söyler. Aksi hâlde sunucu eylemi 2-3 saniye
 *     sürerken hiçbir geri bildirim yok.
 *  2. ÇİFT GÖNDERİM: Randevu slotu rezervasyonunda yarış durumunun en sık
 *     senaryosu, aynı kullanıcının sabırsızlanıp iki kez tıklamasıdır.
 *     Bu düğme onu tamamen ortadan kaldırır. (Gerçek yarışın garantisi
 *     veritabanındaki kısmi tekil indekstir — bu yalnızca ilk savunma.)
 *
 * `useFormStatus` React 19 ile yerleşik; ek bağımlılık yok. Kancanın
 * çalışması için düğmenin `<form>`'un İÇİNDE olması şart — form'un
 * kendisinde çağrılırsa her zaman `pending: false` döner.
 */
export function GonderDugmesi({
  children,
  beklerken = "Gönderiliyor…",
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  beklerken?: string;
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Dugme
      type="submit"
      variant={variant}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? beklerken : children}
    </Dugme>
  );
}

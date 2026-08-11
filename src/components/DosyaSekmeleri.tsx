import { SekmeCubugu, sekmeCoz } from "./SekmeCubugu";

/**
 * Dosya sekmeleri.
 *
 * Uzman dosya sayfası altı bölümü alt alta yığıyordu ve ~6 ekran
 * uzunluğundaydı; not eklemek için sayfanın yarısını kaydırmak
 * gerekiyordu. Sekmeler tek ekrana indiriyor.
 *
 * Görünüm ve davranış `SekmeCubugu`'na taşındı (danışan detay sayfası da
 * aynısını kullanıyor). Bu dosya, dosya sayfasına özgü sekme listesini
 * tanımlayan ince bir sarmalayıcı olarak kaldı.
 */

export type SekmeId = "yazisma" | "seanslar" | "formlar" | "gorevler";

export const SEKMELER: { id: SekmeId; label: string }[] = [
  { id: "yazisma", label: "Yazışma" },
  { id: "seanslar", label: "Seanslar" },
  { id: "formlar", label: "Formlar" },
  { id: "gorevler", label: "Görevler" },
];

export function normalizeSekme(value: unknown): SekmeId {
  return sekmeCoz(value, SEKMELER);
}

export function DosyaSekmeleri({
  basePath,
  aktif,
  rozetler = {},
}: {
  basePath: string;
  aktif: SekmeId;
  /** Sekme başına sayı rozeti; 0 ise gösterilmez. */
  rozetler?: Partial<Record<SekmeId, number>>;
}) {
  return (
    <SekmeCubugu
      basePath={basePath}
      sekmeler={SEKMELER}
      aktif={aktif}
      rozetler={rozetler}
      etiket="Dosya bölümleri"
    />
  );
}

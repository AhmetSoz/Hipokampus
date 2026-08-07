import type { NeedAreaId } from "./types";

/**
 * GÖZLEMLER — "ne fark ettiniz?"
 *
 * Amaç: kişiyi tanımlamak değil, DOĞRU UZMANA YÖNLENDİRMEK. Aile
 * "hangi başlıkta destek arıyorum" sorusunu yanıtlamakta zorlanıyor;
 * ama "ne fark ettim" sorusunu kolayca yanıtlıyor. Bu liste o cevabı
 * ihtiyaç başlıklarına çeviriyor.
 *
 * BUNLAR BELİRTİ (SEMPTOM) DEĞİLDİR ve bir duruma işaret etmezler:
 *  - Hiçbir gözlem bir hastalığa, tanıya veya klinik tabloya bağlanmaz.
 *  - Sonuçta puan, yüzde veya risk düzeyi üretilmez (kilitli karar);
 *    yalnızca ihtiyaç başlıkları, ilgililik sırasına göre listelenir.
 *  - Metinler günlük dildedir; tıbbi terim bilerek kullanılmaz.
 *
 * `areas` bir gözlemin hangi başlıklarla ilgili olduğunu söyler. Sıralama
 * için kaç gözlemin aynı başlığı işaret ettiği sayılır — bu bir skor
 * değil, alaka sıralamasıdır (arama sonucu sıralaması gibi).
 */

export type Observation = {
  id: string;
  label: string;
  areas: NeedAreaId[];
};

export const OBSERVATIONS: Observation[] = [
  {
    id: "tekrar",
    label: "Aynı şeyleri kısa aralıklarla tekrar tekrar soruyor",
    areas: ["hafiza"],
  },
  {
    id: "unutma",
    label: "Randevuları, faturaları, konuşulanları unutuyor",
    areas: ["hafiza", "saglik-koordinasyon"],
  },
  {
    id: "ilac",
    label: "İlaçlarını almayı unutuyor ya da karıştırıyor",
    areas: ["gunluk", "saglik-koordinasyon"],
  },
  {
    id: "ev-isleri",
    label: "Alışveriş, yemek, temizlik gibi işler zorlaşmaya başladı",
    areas: ["gunluk"],
  },
  {
    id: "denge",
    label: "Denge kaybı, takılma veya düşme yaşandı",
    areas: ["ev-guvenlik"],
  },
  {
    id: "banyo",
    label: "Banyo, merdiven gibi yerlerde zorlanıyor",
    areas: ["ev-guvenlik"],
  },
  {
    id: "yon",
    label: "Bildiği yerlerde yön bulmakta zorlandığı oldu",
    areas: ["hafiza", "ev-guvenlik"],
  },
  {
    id: "iceri-kapanma",
    label: "Eskisi kadar dışarı çıkmıyor, kimseyle görüşmüyor",
    areas: ["sosyal"],
  },
  {
    id: "bakim-yuku",
    label: "Sorumluluğu tek başıma taşıyorum, yoruldum",
    areas: ["bakim-veren"],
  },
  {
    id: "aile-anlasmazlik",
    label: "Ailede ne yapılacağı konusunda anlaşamıyoruz",
    areas: ["aile-karar"],
  },
  {
    id: "secenek-bilgisi",
    label: "Destek seçeneklerini ve maliyetlerini bilmiyoruz",
    areas: ["secenekler"],
  },
  {
    id: "hangi-bolum",
    label: "Hangi doktora ya da bölüme başvuracağımızı bilmiyoruz",
    areas: ["saglik-koordinasyon"],
  },
];

/**
 * Seçilen gözlemlerden ihtiyaç başlıklarını çıkarır, en çok işaret
 * edilenden başlayarak sıralar. Eşitlikte `NEED_AREAS` sırası korunur —
 * böylece sonuç her seferinde aynı, öngörülebilir olur.
 */
export function areasFromObservations(
  observationIds: string[],
  areaOrder: NeedAreaId[],
): NeedAreaId[] {
  const counts = new Map<NeedAreaId, number>();
  for (const obs of OBSERVATIONS) {
    if (!observationIds.includes(obs.id)) continue;
    for (const area of obs.areas) {
      counts.set(area, (counts.get(area) ?? 0) + 1);
    }
  }

  return [...counts.keys()].sort((a, b) => {
    const diff = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
    return diff !== 0 ? diff : areaOrder.indexOf(a) - areaOrder.indexOf(b);
  });
}

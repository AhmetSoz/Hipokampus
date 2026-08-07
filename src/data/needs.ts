import type { NeedArea, NeedAreaId } from "./types";

/**
 * İhtiyaç başlıkları.
 *
 * Bunlar klinik ölçek DEĞİLDİR ve bir değerlendirme üretmezler. Kişinin
 * durumunu ölçmezler; ailenin neyi konuşmak istediğini sorarlar. Sıralama
 * anlamlı değildir, öncelik belirtmez.
 */
export const NEED_AREAS: NeedArea[] = [
  {
    id: "gunluk",
    label: "Günlük yaşam desteği",
    hint: "Alışveriş, yemek, ev işleri, ilaçların düzenli alınması.",
  },
  {
    id: "ev-guvenlik",
    label: "Ev güvenliği ve düzenlemeler",
    hint: "Düşme riski, banyo ve merdiven, aydınlatma, kolay ulaşılabilirlik.",
  },
  {
    id: "hafiza",
    label: "Hafıza ve yön bulmada değişiklikler",
    hint: "Fark ettiğiniz değişiklikleri bir uzmanla konuşmak istiyorsanız.",
  },
  {
    id: "saglik-koordinasyon",
    label: "Sağlık randevularının koordinasyonu",
    hint: "Randevuların takibi, hangi bölüme başvurulacağının netleşmesi.",
  },
  {
    id: "bakim-veren",
    label: "Yakının yükü ve tükenmişlik",
    hint: "Yorgunluk, tükenmişlik, sorumluluğun tek kişide toplanması.",
  },
  {
    id: "sosyal",
    label: "Sosyal bağ ve yalnızlık",
    hint: "Gün içinde temas, komşuluk, sosyal etkinliklere katılım.",
  },
  {
    id: "secenekler",
    label: "Destek seçenekleri ve bütçe",
    hint: "Evde destek, gündüz merkezi, kurum gibi seçeneklerin karşılaştırılması.",
  },
  {
    id: "aile-karar",
    label: "Aile içi karar ve iletişim",
    hint: "Kardeşler arası görüş ayrılığı, kararın kim tarafından verileceği.",
  },
];

const BY_ID = new Map(NEED_AREAS.map((a) => [a.id, a]));

export function needArea(id: NeedAreaId): NeedArea {
  const area = BY_ID.get(id);
  if (!area) throw new Error(`Bilinmeyen ihtiyaç başlığı: ${id}`);
  return area;
}

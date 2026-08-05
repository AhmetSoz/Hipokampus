import type { Availability, Expert, NeedAreaId } from "./types";

/**
 * ÖRNEK UZMAN VERİSİ — TAMAMI TEMSİLÎDİR.
 *
 * Buradaki kişiler gerçek değildir. Gerçek kişi adı, gerçek kurum adı veya
 * gerçek diploma bilgisi kullanılmamıştır.
 *
 * Meslek alanları TEMSİLÎDİR: ilk fazda hangi uzman türlerinin yer alacağı
 * henüz karara bağlanmadı (açık soru 3).
 *
 * BİLEREK YOK: deneyim yılı, kişi bazlı yanıt süresi, ücret, yıldız puanı,
 * kullanıcı yorumu, adli sicil durumu, değerlendirme puanı.
 */
const EXPERTS: Expert[] = [
  {
    id: "u1",
    slug: "elif-tanyeri",
    name: "Elif Tanyeri",
    field: "Gerontoloji",
    city: "İstanbul",
    specialties: [
      "Evde bakım düzeni kurma",
      "Bakım seçeneklerinin karşılaştırılması",
      "Aile içi rol paylaşımı",
    ],
    availability: "bu-hafta",
    verifiedAt: "2026-06-14",
    about:
      "Bakım sürecinin en zor kısmının nereden başlanacağını bilmemek olduğunu düşünüyorum. Görüşmelerimizde önce evdeki günlük akışı konuşuyoruz, sonra neyin gerçekten değişmesi gerektiğine birlikte karar veriyoruz.",
    needAreas: ["gunluk", "secenekler", "aile-karar", "bakim-veren"],
    languages: ["Türkçe"],
  },
  {
    id: "u2",
    slug: "murat-sencan",
    name: "Murat Şencan",
    field: "Gerontoloji",
    city: "Ankara",
    specialties: [
      "Hafıza değişikliklerinde ilk adımlar",
      "Hangi uzmana başvurulacağının netleştirilmesi",
      "Tanı sürecinde aileye eşlik etme",
    ],
    availability: "bu-hafta",
    verifiedAt: "2026-06-28",
    about:
      "Hafızayla ilgili değişiklikler fark edildiğinde ailelerin en çok ihtiyaç duyduğu şey sakin bir açıklama oluyor. Ne olduğunu ve olmadığını konuşuyoruz, ardından hangi uzmana başvurulacağını netleştiriyoruz.",
    needAreas: ["hafiza", "saglik-koordinasyon", "aile-karar"],
    languages: ["Türkçe", "İngilizce"],
  },
  {
    id: "u3",
    slug: "ayse-kurtoglu",
    name: "Ayşe Kurtoğlu",
    field: "Sosyal hizmet",
    city: "İzmir",
    specialties: [
      "Ulaşılabilecek destek ve hakların çıkarılması",
      "Kurum bakımına geçiş süreci",
      "Sosyal izolasyonun kırılması",
    ],
    availability: "gelecek-hafta",
    verifiedAt: "2026-05-30",
    about:
      "Uzun yıllar evde bakım süreçlerinde çalıştım. Ailelerin haklarını ve ulaşabilecekleri destekleri bilmemesi en sık karşılaştığım durum. Konuşmalarımızda seçenekleri tek tek çıkarıyoruz.",
    needAreas: ["secenekler", "sosyal", "aile-karar", "bakim-veren"],
    languages: ["Türkçe"],
  },
  {
    id: "u4",
    slug: "hakan-devrim",
    name: "Hakan Devrim",
    field: "Fizyoterapi",
    city: "İstanbul",
    specialties: [
      "Düşme riskinin azaltılması",
      "Ev içi güvenlik düzenlemeleri",
      "Hareket korkusuyla baş etme",
    ],
    availability: "bu-hafta",
    verifiedAt: "2026-07-02",
    about:
      "Düşme korkusu, hareketi kısıtladığı için çoğu zaman düşmenin kendisinden daha çok zarar veriyor. Evin içindeki günlük hareketi ve güvenliği birlikte gözden geçiriyoruz.",
    needAreas: ["ev-guvenlik", "gunluk"],
    languages: ["Türkçe"],
  },
  {
    id: "u5",
    slug: "zeynep-arslan",
    name: "Zeynep Arslan",
    field: "Beslenme ve diyetetik",
    city: "Bursa",
    specialties: [
      "İleri yaşta iştah ve beslenme değişiklikleri",
      "Evdeki mevcut düzeni bozmadan iyileştirme",
    ],
    availability: "dolu",
    verifiedAt: "2026-07-11",
    about:
      "İleri yaşta iştah ve beslenme alışkanlıkları değişiyor; bu çoğu zaman fark edilmeden ilerliyor. Evdeki mevcut düzeni bozmadan neyin iyileştirilebileceğine bakıyoruz.",
    needAreas: ["gunluk", "saglik-koordinasyon"],
    languages: ["Türkçe"],
  },
  {
    id: "u6",
    slug: "necla-boran",
    name: "Necla Boran",
    field: "Psikoloji",
    city: "Ankara",
    specialties: [
      "Bakım verenin tükenmişliği",
      "Sorumluluğun tek kişide toplanması",
      "Aile içi çatışmanın yumuşatılması",
    ],
    availability: "gelecek-hafta",
    verifiedAt: "2026-04-19",
    about:
      "Bakım veren kişinin yorgunluğu genellikle en son konuşulan konu oluyor. Oysa süreç uzadıkça belirleyici hale geliyor. Bu yükü nasıl paylaşabileceğinizi konuşuyoruz.",
    needAreas: ["bakim-veren", "sosyal", "aile-karar"],
    languages: ["Türkçe"],
  },
  {
    id: "u7",
    slug: "serkan-ulutas",
    name: "Serkan Ulutaş",
    field: "Geriatri hemşireliği",
    city: "İzmir",
    specialties: [
      "Çoklu ilaç kullanımının takibi",
      "Randevu takviminin sadeleştirilmesi",
      "Evde işleyen basit düzenler kurma",
    ],
    availability: "bu-hafta",
    verifiedAt: "2026-06-05",
    about:
      "Birden fazla ilacın birlikte takibi, ailelerin en çok zorlandığı konulardan biri. Evde işleyen basit bir düzen kurmayı ve randevu takvimini sadeleştirmeyi konuşuyoruz.",
    needAreas: ["saglik-koordinasyon", "gunluk", "ev-guvenlik"],
    languages: ["Türkçe"],
  },
  {
    id: "u8",
    slug: "pinar-esen",
    name: "Pınar Esen",
    field: "Gerontoloji",
    city: "Antalya",
    specialties: [
      "Kardeşler arası karar ayrılıkları",
      "Herkesin aynı bilgiyle konuşabilmesi",
      "Uzaktan bakım koordinasyonu",
    ],
    availability: "bu-hafta",
    verifiedAt: "2026-07-21",
    about:
      "Ailelerin çoğu bana kardeşler arasında anlaşamadıkları bir noktada ulaşıyor. Kararı benim yerinize vermem değil, herkesin aynı bilgiyle konuşabilmesi işe yarıyor.",
    needAreas: ["aile-karar", "secenekler", "sosyal"],
    languages: ["Türkçe"],
  },
];

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  "bu-hafta": "Bu hafta müsait",
  "gelecek-hafta": "Gelecek hafta müsait",
  dolu: "Şu anda dolu",
};

/**
 * Platform yanıt taahhüdü.
 *
 * Kişi bazlı yanıt süresi BİLEREK gösterilmiyor: uzmanları birbiriyle
 * kıyaslatan bir ölçüt olurdu. Bunun yerine tek bir kurumsal taahhüt var —
 * kim olursa olsun aynı söz geçerli.
 */
export const RESPONSE_COMMITMENT = "En geç 2 iş günü içinde";

export async function listFields(): Promise<string[]> {
  return [...new Set(EXPERTS.map((e) => e.field))].sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
}

export async function listCities(): Promise<string[]> {
  return [...new Set(EXPERTS.map((e) => e.city))].sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
}

/**
 * Günlük dönüşümlü sıra.
 *
 * Uygun uzmanlar arasında kimse kalıcı olarak üstte kalmasın diye liste her
 * gün kaydırılıyor. Gün içinde sabit, günler arasında dönüşümlü. Ücretin
 * sıralamaya etkisi yok — kilitli karar.
 */
function dailyRotation(count: number): number {
  const day = Math.floor(Date.now() / 86_400_000);
  return count > 0 ? day % count : 0;
}

export async function listExperts(filter?: {
  field?: string;
  city?: string;
  needArea?: NeedAreaId;
}): Promise<Expert[]> {
  // Müsait olanlar önce; dolu olanlar sona. Bunun dışında hiyerarşi yok.
  const rank: Record<Availability, number> = {
    "bu-hafta": 0,
    "gelecek-hafta": 0,
    dolu: 1,
  };

  const matched = EXPERTS.filter((e) => {
    if (filter?.field && e.field !== filter.field) return false;
    if (filter?.city && e.city !== filter.city) return false;
    if (filter?.needArea && !e.needAreas.includes(filter.needArea)) return false;
    return true;
  });

  const available = matched.filter((e) => rank[e.availability] === 0);
  const busy = matched.filter((e) => rank[e.availability] === 1);

  const offset = dailyRotation(available.length);
  const rotated = [...available.slice(offset), ...available.slice(0, offset)];

  return [...rotated, ...busy];
}

export async function getExpert(slug: string): Promise<Expert | null> {
  return EXPERTS.find((e) => e.slug === slug) ?? null;
}

export async function getExpertById(id: string): Promise<Expert | null> {
  return EXPERTS.find((e) => e.id === id) ?? null;
}

export async function listExpertSlugs(): Promise<string[]> {
  return EXPERTS.map((e) => e.slug);
}

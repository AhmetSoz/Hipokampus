import type {
  AccessLogEntry,
  Consultant,
  DataScope,
  FamilyMember,
  PlanItem,
} from "./types";

/**
 * ÖRNEK PANEL VERİSİ — TAMAMI TEMSİLÎDİR.
 *
 * Kurgu bilinçli olarak "ödeme ≠ veri görme" kuralını görünür kılacak
 * şekilde seçildi: Mehmet ödemeyi yapıyor ama sağlık ve görüşme verisini
 * göremiyor. Sunumda bu farkı göstermek için en net örnek.
 */

const CONSULTANT: Consultant = {
  id: "d1",
  name: "Fatma Demir",
  birthYear: 1948,
  city: "İzmir",
  summary:
    "Eşini kaybettikten sonra tek başına yaşıyor. Günlük işlerin çoğunu kendisi yapıyor; alışveriş ve ilaç takibinde desteğe ihtiyaç duyuyor.",
};

const FAMILY: FamilyMember[] = [
  {
    id: "a0",
    name: "Fatma Demir",
    relation: "Kendisi",
    relationRole: "birey",
    scopes: ["saglik-gorusme", "gunluk-lojistik", "odeme-fatura"],
    status: "aktif",
    payer: false,
    invitedAt: "2026-06-02",
    expiresAt: null,
  },
  {
    id: "a1",
    name: "Ayşe Demir",
    relation: "Kızı",
    relationRole: "bakim-veren",
    scopes: ["saglik-gorusme", "gunluk-lojistik"],
    status: "aktif",
    payer: false,
    invitedAt: "2026-06-02",
    expiresAt: null,
  },
  {
    id: "a2",
    name: "Mehmet Demir",
    relation: "Oğlu",
    relationRole: "aile-uyesi",
    // Ödemeyi yapan kişi. Sağlık ve görüşme kapsamı BİLEREK yok.
    scopes: ["odeme-fatura"],
    status: "aktif",
    payer: true,
    invitedAt: "2026-06-05",
    expiresAt: null,
  },
  {
    id: "a3",
    name: "Zehra Demir",
    relation: "Gelini",
    relationRole: "aile-uyesi",
    scopes: ["gunluk-lojistik"],
    status: "aktif",
    payer: false,
    invitedAt: "2026-06-18",
    expiresAt: "2026-12-18",
  },
  {
    id: "a4",
    name: "Kemal Demir",
    relation: "Kardeşi",
    relationRole: "aile-uyesi",
    scopes: [],
    // Silinmedi, askıya alındı. Aile ilişkileri geri döner, silme dönmez.
    status: "askida",
    payer: false,
    invitedAt: "2026-06-20",
    expiresAt: null,
  },
];

const PLAN: PlanItem[] = [
  {
    id: "p1",
    title: "Haftalık alışveriş için sabit bir gün belirleyin",
    detail:
      "Alışverişin her hafta aynı gün yapılması, hem unutulmayı önlüyor hem de Fatma Hanım'ın kendi listesini önceden hazırlamasına imkân veriyor.",
    needArea: "gunluk",
    status: "tamamlandi",
    authorExpertId: "u1",
    createdAt: "2026-07-08",
  },
  {
    id: "p2",
    title: "İlaçlar için haftalık bölmeli kutu kullanın",
    detail:
      "Sabah ve akşam dozları ayrı bölmelerde olacak şekilde pazar günü hazırlanması, günlük takibi tek bakışta yapılabilir hâle getiriyor.",
    needArea: "saglik-koordinasyon",
    status: "surüyor",
    authorExpertId: "u1",
    createdAt: "2026-07-08",
  },
  {
    id: "p3",
    title: "Banyoda tutunma barı ve kaymaz paspas",
    detail:
      "Küvete giriş çıkış, evdeki en yüksek düşme riski. Tutunma barının duvara sabitlenmesi ve kaymaz paspas bu riski belirgin biçimde azaltıyor.",
    needArea: "ev-guvenlik",
    status: "yapilacak",
    authorExpertId: "u1",
    createdAt: "2026-07-15",
  },
  {
    id: "p4",
    title: "Haftada bir gün komşu ziyareti veya telefon görüşmesi",
    detail:
      "Sosyal temasın takvime yazılması, iyi niyetli ama belirsiz kalan planların gerçekleşme ihtimalini artırıyor.",
    needArea: "sosyal",
    status: "yapilacak",
    authorExpertId: "u1",
    createdAt: "2026-07-15",
  },
];

const ACCESS_LOG: AccessLogEntry[] = [
  {
    id: "l1",
    memberId: "a1",
    scope: "saglik-gorusme",
    section: "Bakım planı",
    at: "2026-08-04T19:42:00",
  },
  {
    id: "l2",
    memberId: "a2",
    scope: "odeme-fatura",
    section: "Ödeme ve abonelik",
    at: "2026-08-04T11:15:00",
  },
  {
    id: "l3",
    memberId: "a1",
    scope: "saglik-gorusme",
    section: "Danışma dosyası",
    at: "2026-08-03T21:07:00",
  },
  {
    id: "l4",
    memberId: "a3",
    scope: "gunluk-lojistik",
    section: "Genel bakış",
    at: "2026-08-03T09:30:00",
  },
];

/* ------------------------------------------------------------------ */

export async function getConsultant(): Promise<Consultant> {
  return CONSULTANT;
}

export async function listFamily(): Promise<FamilyMember[]> {
  return FAMILY;
}

export async function getFamilyMember(id: string): Promise<FamilyMember | null> {
  return FAMILY.find((m) => m.id === id) ?? null;
}

export async function listPlanItems(): Promise<PlanItem[]> {
  return PLAN;
}

export async function listAccessLog(): Promise<AccessLogEntry[]> {
  return [...ACCESS_LOG].sort((a, b) => b.at.localeCompare(a.at));
}

/** Bir kişinin verilen kapsama erişimi var mı? */
export function canAccess(member: FamilyMember, scope: DataScope): boolean {
  return member.status === "aktif" && member.scopes.includes(scope);
}

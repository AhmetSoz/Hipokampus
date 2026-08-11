import "server-only";
import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db/client";
import {
  appointments,
  expertAvailabilityExceptions,
  expertAvailabilityRules,
  experts,
} from "@/db/schema";
import { yeniId } from "@/lib/kimlik";
import {
  bugunTr,
  gunEkle,
  trGun,
  trHaftaGunu,
  trYerelToUTC,
} from "@/lib/zaman";

/**
 * Uzman müsaitliği ve boş slot üretimi.
 *
 * MODEL: haftalık tekrarlayan kural + gün bazlı istisna. Somut slot
 * satırı üretilmez; liste her istekte hesaplanır (bkz. db/schema.ts
 * "MÜSAİTLİK" bölümü).
 *
 * Kurallar DUVAR SAATİ tutar (Türkiye yerel dakika), randevular mutlak an.
 * Çeviri yalnızca `lib/zaman.ts` üzerinden.
 *
 * Slot üretimi tamamen DETERMİNİSTİK: aynı girdi her zaman aynı listeyi
 * verir, rastgelelik yok. Sunucu ve istemci aynı sonucu üretsin diye
 * (hidrasyon) ve test edilebilir kalsın diye.
 */

export type MusaitlikKurali = {
  id: string;
  weekday: number;
  startMinute: number;
  endMinute: number;
  slotMinutes: number;
  gapMinutes: number;
};

export type MusaitlikIstisnasi = {
  id: string;
  day: string;
  kind: "kapali" | "ek-slot";
  startMinute: number | null;
  endMinute: number | null;
  note: string | null;
};

export type Slot = {
  /** ISO — mutlak an. */
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  durum: "bos" | "dolu";
};

export type SlotGunu = { gun: string; slotlar: Slot[] };

/* ------------------------------------------------------------------ */
/* Kurallar                                                             */

export async function listRules(expertId: string): Promise<MusaitlikKurali[]> {
  const rows = await db
    .select()
    .from(expertAvailabilityRules)
    .where(eq(expertAvailabilityRules.expertId, expertId))
    .orderBy(
      asc(expertAvailabilityRules.weekday),
      asc(expertAvailabilityRules.startMinute),
    );
  return rows.map((r) => ({
    id: r.id,
    weekday: r.weekday,
    startMinute: r.startMinute,
    endMinute: r.endMinute,
    slotMinutes: r.slotMinutes,
    gapMinutes: r.gapMinutes,
  }));
}

/**
 * Kuralları tamamen değiştirir (sil + yaz).
 *
 * Kısmi güncelleme yerine tam değişim: düzenleme ekranı zaten haftanın
 * tamamını tek formda gönderiyor ve hangi satırın silindiğini ayrıca
 * izlemek gereksiz karmaşıklık olurdu.
 *
 * `db.batch()` ile tek HTTP isteği ve tek transaction — burada karar
 * gerektiren bir adım yok, dolayısıyla batch'in interaktif olmaması
 * sorun değil (rezervasyondan farkı bu).
 */
export async function saveRules(
  expertId: string,
  kurallar: Omit<MusaitlikKurali, "id">[],
): Promise<void> {
  const now = new Date();
  const temiz = kurallar.filter(
    (k) =>
      k.weekday >= 1 &&
      k.weekday <= 7 &&
      k.startMinute >= 0 &&
      k.endMinute > k.startMinute &&
      k.endMinute <= 24 * 60 &&
      k.slotMinutes > 0,
  );

  const sil = db
    .delete(expertAvailabilityRules)
    .where(eq(expertAvailabilityRules.expertId, expertId));

  if (temiz.length === 0) {
    await sil;
    return;
  }

  await db.batch([
    sil,
    db.insert(expertAvailabilityRules).values(
      temiz.map((k) => ({
        id: yeniId("mk"),
        expertId,
        weekday: k.weekday,
        startMinute: k.startMinute,
        endMinute: k.endMinute,
        slotMinutes: k.slotMinutes,
        gapMinutes: k.gapMinutes,
        createdAt: now,
      })),
    ),
  ]);
}

/* ------------------------------------------------------------------ */
/* İstisnalar                                                           */

export async function listExceptions(
  expertId: string,
  aralik?: { fromDay: string; toDay: string },
): Promise<MusaitlikIstisnasi[]> {
  const rows = await db
    .select()
    .from(expertAvailabilityExceptions)
    .where(
      aralik
        ? and(
            eq(expertAvailabilityExceptions.expertId, expertId),
            gte(expertAvailabilityExceptions.day, aralik.fromDay),
            lte(expertAvailabilityExceptions.day, aralik.toDay),
          )
        : eq(expertAvailabilityExceptions.expertId, expertId),
    )
    .orderBy(asc(expertAvailabilityExceptions.day));
  return rows.map((r) => ({
    id: r.id,
    day: r.day,
    kind: r.kind,
    startMinute: r.startMinute,
    endMinute: r.endMinute,
    note: r.note,
  }));
}

export async function addException(input: {
  expertId: string;
  day: string;
  kind: "kapali" | "ek-slot";
  startMinute: number | null;
  endMinute: number | null;
  note: string | null;
}): Promise<void> {
  await db.insert(expertAvailabilityExceptions).values({
    id: yeniId("mi"),
    expertId: input.expertId,
    day: input.day,
    kind: input.kind,
    startMinute: input.kind === "ek-slot" ? input.startMinute : null,
    endMinute: input.kind === "ek-slot" ? input.endMinute : null,
    note: input.note,
    createdAt: new Date(),
  });
}

export async function removeException(
  expertId: string,
  id: string,
): Promise<void> {
  /* `expertId` koşulu şart: id istemciden geliyor ve tek başına
     kullanılırsa başkasının istisnası silinebilirdi. */
  await db
    .delete(expertAvailabilityExceptions)
    .where(
      and(
        eq(expertAvailabilityExceptions.id, id),
        eq(expertAvailabilityExceptions.expertId, expertId),
      ),
    );
}

/* ------------------------------------------------------------------ */
/* Slot üretimi                                                         */

type Aralik = { start: number; end: number };

/**
 * Bir günün müsait aralıklarını çıkarır (saf fonksiyon).
 *
 * `kapali` istisnası günü tamamen kapatır — kısmi kapatma bilerek yok:
 * "öğleden sonra kapalıyım" demek isteyen uzman kuralı değiştirir ya da
 * o günü kapatıp `ek-slot` ile istediği aralığı açar. İki mekanizmanın
 * kesişimini modellemek, kazandırdığından çok karmaşıklık getiriyordu.
 */
function gunAraliklari(
  gun: string,
  kurallar: MusaitlikKurali[],
  istisnalar: MusaitlikIstisnasi[],
): Aralik[] {
  const gunun = istisnalar.filter((i) => i.day === gun);
  if (gunun.some((i) => i.kind === "kapali")) {
    /* Gün kapalı; yalnızca açıkça eklenmiş ek slotlar geçerli. */
    return gunun
      .filter((i) => i.kind === "ek-slot" && i.startMinute !== null)
      .map((i) => ({ start: i.startMinute!, end: i.endMinute! }));
  }

  const haftaGunu = trHaftaGunu(gun);
  const temel = kurallar
    .filter((k) => k.weekday === haftaGunu)
    .map((k) => ({ start: k.startMinute, end: k.endMinute }));

  const ek = gunun
    .filter((i) => i.kind === "ek-slot" && i.startMinute !== null)
    .map((i) => ({ start: i.startMinute!, end: i.endMinute! }));

  return [...temel, ...ek];
}

/** O gün için geçerli slot uzunluğu/boşluğu. İlk eşleşen kural belirler. */
function gunKurali(
  gun: string,
  kurallar: MusaitlikKurali[],
): { slotMinutes: number; gapMinutes: number } {
  const k = kurallar.find((x) => x.weekday === trHaftaGunu(gun));
  return {
    slotMinutes: k?.slotMinutes ?? 45,
    gapMinutes: k?.gapMinutes ?? 15,
  };
}

/**
 * Bir uzmanın verilen gün aralığındaki boş slotları.
 *
 * Toplam üç sorgu (kurallar, istisnalar, mevcut randevular) — gün
 * sayısından bağımsız.
 */
export async function listOpenSlots(
  expertId: string,
  secenek?: { fromDay?: string; gunSayisi?: number },
): Promise<SlotGunu[]> {
  const [uzman] = await db
    .select({
      leadHours: experts.bookingLeadHours,
      horizonDays: experts.bookingHorizonDays,
    })
    .from(experts)
    .where(eq(experts.id, expertId));
  if (!uzman) return [];

  const baslangic = secenek?.fromDay ?? bugunTr();
  const gunSayisi = Math.min(
    secenek?.gunSayisi ?? uzman.horizonDays,
    uzman.horizonDays,
  );
  const gunler = Array.from({ length: gunSayisi }, (_, i) =>
    gunEkle(baslangic, i),
  );
  const sonGun = gunler[gunler.length - 1];

  const [kurallar, istisnalar] = await Promise.all([
    listRules(expertId),
    listExceptions(expertId, { fromDay: baslangic, toDay: sonGun }),
  ]);
  if (kurallar.length === 0 && istisnalar.length === 0) return [];

  /* Aralıktaki aktif randevular — tek sorgu. Dolu slotları işaretlemek
     için; gizlemek yerine "dolu" göstermek uzmanın takviminin gerçekten
     kullanıldığını gösteriyor ve boş bir liste hissini önlüyor. */
  const dolular = await db
    .select({
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.expertId, expertId),
        inArray(appointments.status, ["teklif", "kabul"]),
        gte(appointments.startsAt, trYerelToUTC(baslangic, 0)),
        lte(appointments.startsAt, trYerelToUTC(gunEkle(sonGun, 1), 0)),
      ),
    );

  const enErken = Date.now() + uzman.leadHours * 3600_000;
  const sonuc: SlotGunu[] = [];

  for (const gun of gunler) {
    const araliklar = gunAraliklari(gun, kurallar, istisnalar);
    if (araliklar.length === 0) continue;

    const { slotMinutes, gapMinutes } = gunKurali(gun, kurallar);
    const slotlar: Slot[] = [];

    for (const a of araliklar) {
      for (
        let dk = a.start;
        dk + slotMinutes <= a.end;
        dk += slotMinutes + gapMinutes
      ) {
        const baslar = trYerelToUTC(gun, dk);
        if (baslar.getTime() < enErken) continue;
        const biter = new Date(baslar.getTime() + slotMinutes * 60000);

        const cakisiyor = dolular.some(
          (d) => d.startsAt < biter && d.endsAt > baslar,
        );

        slotlar.push({
          startsAt: baslar.toISOString(),
          endsAt: biter.toISOString(),
          durationMinutes: slotMinutes,
          durum: cakisiyor ? "dolu" : "bos",
        });
      }
    }

    if (slotlar.length > 0) {
      slotlar.sort((x, y) => x.startsAt.localeCompare(y.startsAt));
      sonuc.push({ gun, slotlar });
    }
  }

  return sonuc;
}

/**
 * Verilen anın gerçekten yayınlanmış bir slot olup olmadığı.
 *
 * Rezervasyondan önce çağrılır. Olmadan, istemci herhangi bir saati
 * gönderip uzmanın müsait olmadığı bir zamana randevu yazdırabilirdi —
 * slot listesini üretmek yetmez, seçileni doğrulamak da gerekir.
 */
export async function slotGecerliMi(
  expertId: string,
  startsAt: Date,
): Promise<{ gecerli: boolean; durationMinutes: number }> {
  const gun = trGun(startsAt);
  const gunler = await listOpenSlots(expertId, { fromDay: gun, gunSayisi: 1 });
  const iso = startsAt.toISOString();
  const slot = gunler[0]?.slotlar.find((s) => s.startsAt === iso);
  return slot && slot.durum === "bos"
    ? { gecerli: true, durationMinutes: slot.durationMinutes }
    : { gecerli: false, durationMinutes: 0 };
}

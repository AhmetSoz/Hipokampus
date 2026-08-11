import { and, asc, eq, gt, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { appointments, conversations } from "@/db/schema";
import type { Appointment, AppointmentStatus } from "./types";
import { yeniId } from "@/lib/kimlik";

/**
 * Randevular. Akış: uzman saat teklif eder (`teklif`) → danışan kabul
 * (`kabul`) veya reddeder (`reddedildi`). Görüşme bağlantısı randevuya
 * bağlıdır; görüşme kaydı alınmaz (kilitli karar).
 */

function toAppointment(row: typeof appointments.$inferSelect): Appointment {
  return {
    id: row.id,
    conversationId: row.conversationId,
    proposedByExpertId: row.proposedByExpertId,
    expertId: row.expertId,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    durationMinutes: row.durationMinutes,
    proposedBy: row.proposedBy,
    status: row.status,
    note: row.note,
    meetingUrl: row.meetingUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

/** `startsAt` + süre. Tek yerden hesaplansın diye ayrı. */
function bitis(startsAt: Date, durationMinutes: number): Date {
  return new Date(startsAt.getTime() + durationMinutes * 60000);
}

export async function listAppointments(
  conversationId: string,
): Promise<Appointment[]> {
  const rows = await db
    .select()
    .from(appointments)
    .where(eq(appointments.conversationId, conversationId))
    .orderBy(asc(appointments.startsAt));
  return rows.map(toAppointment);
}

/** Bir hanenin tüm dosyalarındaki randevular — panel özeti için. */
export async function listAppointmentsForConsultant(
  consultantId: string,
): Promise<Appointment[]> {
  const convRows = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(eq(conversations.consultantId, consultantId));
  if (convRows.length === 0) return [];

  const rows = await db
    .select()
    .from(appointments)
    .where(
      inArray(
        appointments.conversationId,
        convRows.map((c) => c.id),
      ),
    )
    .orderBy(asc(appointments.startsAt));
  return rows.map(toAppointment);
}

/** Bir uzmanın belirli aralıktaki randevuları — ajanda ekranı. */
export async function listAppointmentsForExpert(
  expertId: string,
  aralik?: { from: Date; to: Date },
): Promise<Appointment[]> {
  const rows = await db
    .select()
    .from(appointments)
    .where(
      aralik
        ? and(
            eq(appointments.expertId, expertId),
            gte(appointments.startsAt, aralik.from),
            lt(appointments.startsAt, aralik.to),
          )
        : eq(appointments.expertId, expertId),
    )
    .orderBy(asc(appointments.startsAt));
  return rows.map(toAppointment);
}

/**
 * Uzmanın takviminde bu aralıkla örtüşen aktif bir randevu var mı?
 *
 * `startsAt < yeniBitis && endsAt > yeniBaslangic` — klasik aralık
 * örtüşme testi. Yalnızca `teklif`/`kabul` sayılır; reddedilmiş veya
 * iptal edilmiş randevu o saati yeniden serbest bırakır.
 */
export async function cakismaVarMi(
  expertId: string,
  startsAt: Date,
  endsAt: Date,
): Promise<boolean> {
  const [row] = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(
      and(
        eq(appointments.expertId, expertId),
        inArray(appointments.status, ["teklif", "kabul"]),
        lt(appointments.startsAt, endsAt),
        gt(appointments.endsAt, startsAt),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function proposeAppointment(input: {
  conversationId: string;
  expertId: string;
  startsAt: Date;
  durationMinutes: number;
  note: string | null;
  meetingUrl: string | null;
}): Promise<void> {
  await db.insert(appointments).values({
    id: yeniId("r"),
    conversationId: input.conversationId,
    proposedByExpertId: input.expertId,
    expertId: input.expertId,
    startsAt: input.startsAt,
    endsAt: bitis(input.startsAt, input.durationMinutes),
    durationMinutes: input.durationMinutes,
    proposedBy: "uzman",
    status: "teklif",
    note: input.note,
    meetingUrl: input.meetingUrl,
    createdAt: new Date(),
  });
}

export type RezervasyonSonucu =
  | { ok: true; id: string }
  | { ok: false; sebep: "dolu" };

/**
 * Danışanın seçtiği slotu rezerve eder.
 *
 * YARIŞ DURUMU: iki danışan aynı slota aynı anda basabilir. neon-http'de
 * `transaction()` yok ve `db.batch()` interaktif değil — birinci
 * sorgunun sonucuna bakıp ikinciyi kurgulayamıyoruz. Bu yüzden karar tek
 * bir SQL ifadesine gömülüyor: `insert … select … where not exists(...)`.
 * Örtüşen aktif bir randevu varsa hiçbir satır yazılmaz ve `returning`
 * boş döner.
 *
 * Bu tek başına YETMEZ: READ COMMITTED altında iki eşzamanlı istek de
 * "not exists" görebilir. Sert garanti şemadaki kısmi tekil indekstir
 * (`appointments_expert_slot_uq`); ikinci INSERT 23505 alır ve burada
 * yakalanır. İki katman birlikte çalışıyor — ifade örtüşen ama
 * başlangıcı farklı randevuları da yakalıyor (10:00/60dk vs 10:30/45dk),
 * indeks ise gerçek eşzamanlılığı kesiyor.
 *
 * Slot doğrudan `kabul` olarak yazılıyor: uzman o saati yayımlayarak
 * zaten "müsaitim" demiştir; ikinci bir onay turu asenkron bir üründe
 * gereksiz bekleme ekler (bkz. "okundu bilgisi yok" kararının gerekçesi).
 */
export async function rezerveEt(input: {
  conversationId: string;
  expertId: string;
  startsAt: Date;
  durationMinutes: number;
  meetingUrl: string | null;
}): Promise<RezervasyonSonucu> {
  const id = yeniId("r");
  const endsAt = bitis(input.startsAt, input.durationMinutes);

  /* ZAMAN DAMGASI HAM SQL'DE: `Date` nesnesini doğrudan parametre olarak
     geçmeyin. Drizzle'ın `timestamp({mode:"date"})` eşleyicisi ile
     sürücünün ham parametre serileştirmesi AYNI DEĞİL; ham yolda Date
     yerel saate göre yazılıyor ve kayıt sunucunun ofseti kadar kayıyor
     (Türkiye'de 3 saat). Bu hata testte yakalandı: 15:00 seçilen slot
     18:00 olarak kaydedildi.

     Çözüm: ISO dizesini açıkça `timestamptz`e çevirip `at time zone
     'UTC'` ile naive değere indirmek. Sonuç sürücüden de sunucunun
     TimeZone ayarından da bağımsız ve drizzle'ın yazdığıyla birebir aynı. */
  const ts = (d: Date) => sql`${d.toISOString()}::timestamptz at time zone 'UTC'`;

  try {
    const sonuc = await db.execute(sql`
      insert into appointments (
        id, conversation_id, proposed_by_expert_id, expert_id,
        starts_at, ends_at, duration_minutes, proposed_by,
        status, note, meeting_url, created_at
      )
      select
        ${id}, ${input.conversationId}, ${input.expertId}, ${input.expertId},
        ${ts(input.startsAt)}, ${ts(endsAt)}, ${input.durationMinutes}, 'danisan',
        'kabul', null, ${input.meetingUrl}, ${ts(new Date())}
      where not exists (
        select 1 from appointments a
         where a.expert_id = ${input.expertId}
           and a.status in ('teklif', 'kabul')
           and a.starts_at < ${ts(endsAt)}
           and a.ends_at > ${ts(input.startsAt)}
      )
      returning id
    `);

    const satirlar = (sonuc as unknown as { rows?: unknown[] }).rows ?? sonuc;
    const yazildi = Array.isArray(satirlar) ? satirlar.length > 0 : false;
    return yazildi ? { ok: true, id } : { ok: false, sebep: "dolu" };
  } catch (e) {
    /* 23505 = unique_violation. Kısmi tekil indeks devreye girdi:
       başka bir istek aynı slotu bizden milisaniyeler önce aldı. */
    const kod = (e as { code?: string })?.code;
    if (kod === "23505") return { ok: false, sebep: "dolu" };
    throw e;
  }
}

export async function setAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<void> {
  await db
    .update(appointments)
    .set({ status })
    .where(eq(appointments.id, appointmentId));
}

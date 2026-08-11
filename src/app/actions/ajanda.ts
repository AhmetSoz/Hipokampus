"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addException,
  removeException,
  saveRules,
  slotGecerliMi,
} from "@/data/availability";
import { rezerveEt } from "@/data/appointments";
import { getConversation } from "@/data/conversations";
import { getExpertById } from "@/data/experts";
import { guvenliBildir, notifyExpert } from "@/data/notifications";
import { getCurrentExpert } from "@/data/session";
import { gunGecerliMi, saatToDakika, trTarihSaat } from "@/lib/zaman";

/**
 * Müsaitlik ve slot rezervasyonu eylemleri.
 *
 * `care.ts` zaten 300 satıra yakın; takvim akışı ayrı dosyada tutuluyor.
 *
 * Hata gösterimi projedeki desenle aynı: `redirect(?hata=...)` — sessiz
 * başarısızlık yok.
 */

/* ------------------------------------------------------------------ */
/* Uzman: haftalık kurallar                                             */

export async function musaitlikKurallariniKaydet(formData: FormData) {
  const expert = await getCurrentExpert();

  const slotMinutes = Number(formData.get("slot") ?? "45");
  const gapMinutes = Number(formData.get("bosluk") ?? "15");

  if (!Number.isFinite(slotMinutes) || slotMinutes < 15 || slotMinutes > 240) {
    redirect("/uzman-panel/musaitlik?hata=slot");
  }
  if (!Number.isFinite(gapMinutes) || gapMinutes < 0 || gapMinutes > 120) {
    redirect("/uzman-panel/musaitlik?hata=bosluk");
  }

  /* Form her hafta günü için bir açık/kapalı kutusu ve saat aralığı
     gönderiyor; kapalı günler hiç kural üretmiyor. */
  const kurallar = [];
  for (let weekday = 1; weekday <= 7; weekday++) {
    if (formData.get(`acik-${weekday}`) !== "on") continue;

    const bas = saatToDakika(String(formData.get(`bas-${weekday}`) ?? ""));
    const bit = saatToDakika(String(formData.get(`bit-${weekday}`) ?? ""));
    if (bas === null || bit === null) {
      redirect("/uzman-panel/musaitlik?hata=saat");
    }
    if (bit <= bas) {
      redirect("/uzman-panel/musaitlik?hata=sira");
    }
    if (bit - bas < slotMinutes) {
      redirect("/uzman-panel/musaitlik?hata=kisa");
    }
    kurallar.push({
      weekday,
      startMinute: bas,
      endMinute: bit,
      slotMinutes,
      gapMinutes,
    });
  }

  await saveRules(expert.id, kurallar);

  revalidatePath("/uzman-panel/musaitlik");
  revalidatePath("/uzman-panel/ajanda");
  redirect("/uzman-panel/musaitlik?kaydedildi=1");
}

/* ------------------------------------------------------------------ */
/* Uzman: gün bazlı istisnalar                                          */

export async function istisnaEkle(formData: FormData) {
  const expert = await getCurrentExpert();

  const day = String(formData.get("gun") ?? "");
  const kind = String(formData.get("tur") ?? "");
  if (!gunGecerliMi(day)) redirect("/uzman-panel/musaitlik?hata=gun");
  if (kind !== "kapali" && kind !== "ek-slot") {
    redirect("/uzman-panel/musaitlik?hata=tur");
  }

  let startMinute: number | null = null;
  let endMinute: number | null = null;

  if (kind === "ek-slot") {
    startMinute = saatToDakika(String(formData.get("bas") ?? ""));
    endMinute = saatToDakika(String(formData.get("bit") ?? ""));
    if (startMinute === null || endMinute === null || endMinute <= startMinute) {
      redirect("/uzman-panel/musaitlik?hata=saat");
    }
  }

  const note = String(formData.get("not") ?? "").trim().slice(0, 120);

  await addException({
    expertId: expert.id,
    day,
    kind,
    startMinute,
    endMinute,
    note: note || null,
  });

  revalidatePath("/uzman-panel/musaitlik");
  revalidatePath("/uzman-panel/ajanda");
  redirect("/uzman-panel/musaitlik?kaydedildi=1");
}

export async function istisnaSil(formData: FormData) {
  const expert = await getCurrentExpert();
  const id = String(formData.get("istisna") ?? "");
  if (!id) return;

  await removeException(expert.id, id);

  revalidatePath("/uzman-panel/musaitlik");
  revalidatePath("/uzman-panel/ajanda");
}

/* ------------------------------------------------------------------ */
/* Danışan: slot seçimi                                                 */

/**
 * Danışan yayınlanmış bir slotu alır.
 *
 * Randevu doğrudan `kabul` olur — uzman o saati yayımlayarak zaten
 * müsait olduğunu söylemiştir; ikinci bir onay turu asenkron bir üründe
 * gereksiz bekleme eklerdi (bkz. "okundu bilgisi yok" kararının aynı
 * gerekçesi).
 *
 * `slotGecerliMi` şart: slot listesini üretmek yetmez, istemciden gelen
 * saatin gerçekten yayınlanmış bir slot olduğunu da doğrulamak gerekir.
 * Aksi hâlde herhangi bir saat gönderilip uzmanın müsait olmadığı bir
 * zamana randevu yazdırılabilirdi.
 */
export async function slotRezerveEt(formData: FormData) {
  const conversationId = String(formData.get("dosya") ?? "");
  const baslangicRaw = String(formData.get("baslangic") ?? "");
  if (!conversationId || !baslangicRaw) return;

  const base = `/panel/mesajlar/${conversationId}`;

  const startsAt = new Date(baslangicRaw);
  if (Number.isNaN(startsAt.getTime())) redirect(`${base}?slotHata=gecersiz`);

  const dosya = await getConversation(conversationId);
  if (!dosya) redirect(`${base}?slotHata=gecersiz`);

  const { gecerli, durationMinutes } = await slotGecerliMi(
    dosya.expertId,
    startsAt,
  );
  if (!gecerli) redirect(`${base}?slotHata=dolu`);

  const uzman = await getExpertById(dosya.expertId);

  const sonuc = await rezerveEt({
    conversationId,
    expertId: dosya.expertId,
    startsAt,
    durationMinutes,
    meetingUrl: uzman?.defaultMeetingUrl ?? null,
  });

  if (!sonuc.ok) redirect(`${base}?slotHata=dolu`);

  await guvenliBildir(
    notifyExpert(dosya.expertId, {
      title: "Danışan görüşme saati seçti",
      body: trTarihSaat(startsAt),
      href: "/uzman-panel/ajanda",
    }),
  );

  revalidatePath(base);
  revalidatePath("/panel");
  revalidatePath("/uzman-panel/ajanda");
  revalidatePath(`/uzman-panel/mesajlar/${conversationId}`);
  redirect(`${base}?slotAlindi=1`);
}

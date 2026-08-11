import { slotRezerveEt } from "@/app/actions/ajanda";
import { GonderDugmesi } from "@/components/GonderDugmesi";
import type { SlotGunu } from "@/data/availability";
import { trSaat, trUzunTarih } from "@/lib/zaman";

/**
 * Danışanın uzmanın boş saatlerinden seçmesi.
 *
 * Her slot kendi küçük `<form>`'u — JavaScript olmadan da çalışır ve
 * istemci durumu gerektirmez. Seçilen saat doğrudan onaylanmış randevu
 * olur: uzman o saati yayımlayarak zaten müsait olduğunu söylemiştir,
 * ikinci bir onay turu asenkron bir üründe gereksiz bekleme eklerdi.
 *
 * Dolu saatler gizlenmiyor, üzeri çizili gösteriliyor: boş bir liste
 * "uzman hiç çalışmıyor" izlenimi verirdi; dolu saatler takvimin gerçekten
 * kullanıldığını gösteriyor.
 *
 * Sunucu bileşeni.
 */
export function SlotSecici({
  conversationId,
  gunler,
  gunLimiti = 7,
  tumuHref,
}: {
  conversationId: string;
  gunler: SlotGunu[];
  gunLimiti?: number;
  /** Kalan günler için tam sayfa bağlantısı. */
  tumuHref?: string;
}) {
  const gosterilen = gunler.slice(0, gunLimiti);
  const kalan = gunler.length - gosterilen.length;

  if (gunler.length === 0) {
    return (
      <p className="text-ink-600">
        Uzmanınız şu an için boş saat yayımlamamış. Görüşme saatini yazışarak
        da belirleyebilirsiniz.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {gosterilen.map((g) => (
        <div key={g.gun}>
          <h4 className="mb-2 font-semibold text-ink-900">
            {trUzunTarih(`${g.gun}T12:00:00Z`)}
          </h4>
          <ul className="flex flex-wrap gap-2">
            {g.slotlar.map((s) =>
              s.durum === "dolu" ? (
                <li key={s.startsAt}>
                  <span
                    className="flex min-h-[3rem] items-center rounded-xl border-2 border-ink-200 bg-ink-100 px-4 text-ink-500 line-through"
                    aria-label={`${trSaat(s.startsAt)} — dolu`}
                  >
                    {trSaat(s.startsAt)}
                  </span>
                </li>
              ) : (
                <li key={s.startsAt}>
                  <form action={slotRezerveEt}>
                    <input type="hidden" name="dosya" value={conversationId} />
                    <input
                      type="hidden"
                      name="baslangic"
                      value={s.startsAt}
                    />
                    <GonderDugmesi
                      variant="secondary"
                      beklerken="…"
                      className="px-4"
                    >
                      <span className="sr-only">
                        {trUzunTarih(`${g.gun}T12:00:00Z`)}{" "}
                      </span>
                      {trSaat(s.startsAt)}
                      <span className="sr-only">
                        {" "}
                        — {s.durationMinutes} dakika, boş
                      </span>
                    </GonderDugmesi>
                  </form>
                </li>
              ),
            )}
          </ul>
        </div>
      ))}

      {kalan > 0 && tumuHref && (
        <a
          href={tumuHref}
          className="inline-block font-semibold text-teal-800 underline underline-offset-4"
        >
          {kalan} gün daha görün →
        </a>
      )}
    </div>
  );
}

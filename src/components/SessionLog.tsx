import { addSessionNote, publishSession } from "@/app/actions/sessions";
import type { SessionNote } from "@/data/types";
import { BarChart } from "./Charts";
import { SessionChart } from "./SessionChart";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Seans notları — danışma dosyasının ALTINDA, zaman içinde tekrarlayan
 * kayıtlar. "Sohbet" akışından (ConversationThread) bilerek ayrı bir
 * bileşen: farklı bir amaca hizmet ediyor (geçmiş izleme), farklı bir
 * hayat döngüsü var (taslak → yayında). Bkz. karar kaydı "Seans notu".
 */
export function SessionLog({
  conversationId,
  viewer,
  sessions,
  canAdd,
  seansHata = false,
}: {
  conversationId: string;
  viewer: "danisan" | "uzman";
  sessions: SessionNote[];
  /** Yeni seans ekleme formu yalnızca uzman ve açık dosyalarda gösterilir. */
  canAdd: boolean;
  seansHata?: boolean;
}) {
  /* Sayıya çevrilebilen ölçümleri etikete göre grupla; ≥2 noktası olanlar
     grafik olur.

     `sessions` yeniden eskiye sıralı; grafik ise soldan sağa zamanda
     ILERLEMELİ. Aynı gün girilen iki seansın tarihi birebir aynı olduğu
     için grafik içindeki tarih sıralaması onları yeniden düzenleyemiyor
     ve seri ters çiziliyordu — artışı düşüş gibi gösteriyordu. Bu yüzden
     seriyi burada eskiden yeniye kuruyoruz. */
  const seriesByLabel = new Map<
    string,
    { date: string; value: number; unit: string | null }[]
  >();
  for (const s of [...sessions].reverse()) {
    for (const m of s.measurements) {
      const num = Number(m.value.replace(",", "."));
      if (Number.isNaN(num)) continue;
      const arr = seriesByLabel.get(m.label) ?? [];
      arr.push({ date: s.occurredAt, value: num, unit: m.unit });
      seriesByLabel.set(m.label, arr);
    }
  }
  const charts = [...seriesByLabel.entries()].filter(([, pts]) => pts.length >= 2);

  /**
   * Bir ölçümün bir önceki seanstaki değerine göre farkı. Tek başına
   * "15 sn" bir şey söylemiyor; asıl bilgi değişimin yönü ve miktarı.
   * Yön belirtilir ama İYİ/KÖTÜ diye YORUMLANMAZ — yorum uzmana ait.
   */
  const degisim = (
    sessionId: string,
    label: string,
    value: string,
  ): string | null => {
    const seri = seriesByLabel.get(label);
    if (!seri) return null;
    const guncel = Number(value.replace(",", "."));
    if (Number.isNaN(guncel)) return null;

    // sessions yeniden eskiye; bu seansın bir öncekini bul.
    const idx = sessions.findIndex((s) => s.id === sessionId);
    for (let i = idx + 1; i < sessions.length; i++) {
      const m = sessions[i].measurements.find((x) => x.label === label);
      if (!m) continue;
      const onceki = Number(m.value.replace(",", "."));
      if (Number.isNaN(onceki)) return null;
      const fark = guncel - onceki;
      if (fark === 0) return "değişim yok";
      const yuvarlak = Math.round(Math.abs(fark) * 10) / 10;
      return `${fark > 0 ? "↑" : "↓"} ${String(yuvarlak).replace(".", ",")}`;
    }
    return null;
  };

  /* En son seansın sayısal ölçümleri — yan yana karşılaştırma için. */
  const sonOlcumler = (sessions[0]?.measurements ?? [])
    .map((m) => ({ label: m.label, value: Number(m.value.replace(",", ".")) }))
    .filter((m) => !Number.isNaN(m.value));

  /* Daha önce kullanılmış etiketler (birimiyle), en yeniden eskiye —
     yeni seans formunda öneri olarak sunulur. */
  const oncekiEtiketler: { label: string; unit: string | null }[] = [];
  for (const s of sessions) {
    for (const m of s.measurements) {
      if (!oncekiEtiketler.some((e) => e.label === m.label)) {
        oncekiEtiketler.push({ label: m.label, unit: m.unit });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-6">
        <h2 className="mb-1 text-2xl">Seanslar</h2>
        <p className="mb-5 text-ink-600">
          {viewer === "uzman"
            ? "Her görüşmeden sonra kısa bir not bırakın. Yayınladığınızda danışan ve yetkili aile üyeleri görür."
            : "Uzmanın yayınladığı seans notları."}
        </p>

        {(charts.length > 0 || sonOlcumler.length > 1) && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {charts.map(([label, points]) => (
              <SessionChart
                key={label}
                label={label}
                unit={points[0].unit}
                points={points}
              />
            ))}
            {/* Tek ölçüm türü tek grafik demek; birden fazla ölçüm varsa
                son seanstaki değerleri yan yana karşılaştırmak da gerekir. */}
            {sonOlcumler.length > 1 && (
              <BarChart
                title="Son seanstaki ölçümler"
                items={sonOlcumler}
              />
            )}
          </div>
        )}

        {sessions.length === 0 ? (
          <p className="text-ink-600">Henüz seans notu yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink-200 text-base text-ink-600">
                  <th className="py-2 pr-4 font-semibold">Tarih</th>
                  <th className="py-2 pr-4 font-semibold">Not</th>
                  <th className="py-2 pr-4 font-semibold">Ölçümler</th>
                  {viewer === "uzman" && (
                    <th className="py-2 font-semibold">Durum</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-ink-100 align-top last:border-0"
                  >
                    <td className="py-3 pr-4 whitespace-nowrap text-ink-700">
                      {formatDate(s.occurredAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-ink-900">{s.title}</p>
                      <p className="mt-1 max-w-md text-ink-700">{s.note}</p>
                    </td>
                    <td className="py-3 pr-4 text-ink-700">
                      {s.measurements.length === 0 ? (
                        "—"
                      ) : (
                        <ul className="space-y-1">
                          {s.measurements.map((m) => {
                            const d = degisim(s.id, m.label, m.value);
                            return (
                              <li key={m.id}>
                                <span className="text-ink-600">{m.label}:</span>{" "}
                                <span className="font-semibold text-ink-900">
                                  {m.value}
                                  {m.unit ? ` ${m.unit}` : ""}
                                </span>
                                {d && (
                                  <span className="ml-1 text-base text-ink-600">
                                    ({d})
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </td>
                    {viewer === "uzman" && (
                      <td className="py-3">
                        {s.status === "yayinda" ? (
                          <span className="rounded-full bg-teal-100 px-3 py-1 text-base font-semibold text-teal-900">
                            Yayında
                          </span>
                        ) : (
                          <form action={publishSession}>
                            <input type="hidden" name="seans" value={s.id} />
                            <input
                              type="hidden"
                              name="dosya"
                              value={conversationId}
                            />
                            <button
                              type="submit"
                              className="rounded-lg border-2 border-teal-700 px-3 py-1 text-base font-semibold text-teal-800 hover:bg-teal-50"
                            >
                              Yayınla
                            </button>
                          </form>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canAdd && (
        <form
          action={addSessionNote}
          className="rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-6"
        >
          <input type="hidden" name="dosya" value={conversationId} />
          <h3 className="mb-4 text-xl text-ink-900">Yeni seans notu</h3>

          {seansHata && (
            <p className="mb-3 font-semibold text-danger-700">
              Başlık ve not alanları boş olamaz.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <div>
              <label
                htmlFor="seans-tarih"
                className="mb-2 block font-semibold text-ink-900"
              >
                Tarih
              </label>
              <input
                id="seans-tarih"
                name="tarih"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
              />
            </div>
            <div>
              <label
                htmlFor="seans-baslik"
                className="mb-2 block font-semibold text-ink-900"
              >
                Başlık
              </label>
              <input
                id="seans-baslik"
                name="baslik"
                type="text"
                placeholder="Örn. İkinci görüşme"
                className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
              />
            </div>
          </div>

          <label
            htmlFor="seans-not"
            className="mt-4 mb-2 block font-semibold text-ink-900"
          >
            Not
          </label>
          <textarea
            id="seans-not"
            name="not"
            rows={4}
            className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 focus:border-teal-600"
          />

          <p className="mt-5 mb-2 font-semibold text-ink-900">
            Ölçümler (opsiyonel)
          </p>
          <p className="mb-3 text-base text-ink-600">
            Sayısal bir değer girerseniz zamanla değişimi grafikte gösterebiliriz.
            Örn. &quot;Yürüme mesafesi&quot;, 50, &quot;m&quot;.
          </p>
          {/* Etiket serbest metin ama önceki etiketler öneri olarak
              sunuluyor. Sebep: grafik serileri etiketin BİREBİR aynı
              olmasına göre gruplanıyor; "Tek ayak süresi" ile "Tek ayak
              durma süresi" iki ayrı seri olur ve trend kaybolur. Öneri
              listesi bu hatayı pratikte ortadan kaldırıyor. */}
          <datalist id="hk-olcum-etiketleri">
            {oncekiEtiketler.map((e) => (
              <option key={e.label} value={e.label} />
            ))}
          </datalist>

          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_5rem] gap-2">
                <input
                  name="olcum-etiket"
                  list="hk-olcum-etiketleri"
                  placeholder="Etiket"
                  className="min-h-[2.75rem] rounded-lg border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
                />
                <input
                  name="olcum-deger"
                  placeholder="Değer"
                  className="min-h-[2.75rem] rounded-lg border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
                />
                <input
                  name="olcum-birim"
                  placeholder="Birim"
                  className="min-h-[2.75rem] rounded-lg border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
                />
              </div>
            ))}
          </div>

          {oncekiEtiketler.length > 0 && (
            <p className="mt-3 text-base text-ink-600">
              Daha önce kullandıklarınız:{" "}
              {oncekiEtiketler.map((e, i) => (
                <span key={e.label}>
                  {i > 0 && ", "}
                  <span className="font-semibold text-ink-800">
                    {e.label}
                    {e.unit ? ` (${e.unit})` : ""}
                  </span>
                </span>
              ))}
              . Aynı etiketi kullanırsanız değişim grafikte görünür.
            </p>
          )}

          <button
            type="submit"
            className="mt-5 min-h-[3.25rem] rounded-xl bg-teal-700 px-7 font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 active:scale-[0.97]"
          >
            Kaydedin (taslak)
          </button>
          <p className="mt-2 text-base text-ink-600">
            Kaydettiğinizde taslak olur; danışan görmez. Yayınlamak için
            listeden &quot;Yayınla&quot;ya basın.
          </p>
        </form>
      )}
    </div>
  );
}

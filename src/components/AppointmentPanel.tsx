import {
  proposeAppointmentAction,
  respondToAppointment,
  updateAppointmentByExpert,
} from "@/app/actions/care";
import { APPOINTMENT_STATUS_LABEL, type Appointment } from "@/data/types";

/**
 * Randevu akışı. Uzman bir saat teklif eder; danışan kabul veya reddeder.
 * Görüşme bağlantısı randevuya bağlıdır ve yalnızca KABUL EDİLMİŞ bir
 * randevuda gösterilir — onaylanmamış bir saat için bağlantı vermek
 * "randevu kesinleşti" izlenimi yaratırdı.
 *
 * Görüşme kaydı alınmaz (kilitli karar); bağlantı harici bir araca çıkar.
 */

const TONE: Record<Appointment["status"], string> = {
  teklif: "bg-sky-200 text-ink-900",
  kabul: "bg-teal-100 text-teal-900",
  reddedildi: "bg-ink-100 text-ink-700",
  iptal: "bg-ink-100 text-ink-700",
  tamamlandi: "bg-teal-700 text-white",
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AppointmentPanel({
  conversationId,
  viewer,
  appointments,
  canPropose,
  hata,
}: {
  conversationId: string;
  viewer: "danisan" | "uzman";
  appointments: Appointment[];
  canPropose: boolean;
  hata?: string;
}) {
  const upcoming = appointments.filter(
    (a) => a.status === "teklif" || a.status === "kabul",
  );
  const past = appointments.filter(
    (a) => a.status !== "teklif" && a.status !== "kabul",
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="mb-1 text-2xl">Görüşme takvimi</h2>
        <p className="mb-5 text-ink-600">
          {viewer === "uzman"
            ? "Danışana bir saat teklif edin; onayladığında görüşme bağlantısı ikinize de görünür."
            : "Uzmanınızın önerdiği saatler. Uygun olanı onaylayın."}
        </p>

        {upcoming.length === 0 ? (
          <p className="text-ink-600">Planlanmış görüşme yok.</p>
        ) : (
          <ul className="space-y-4">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className={`rounded-xl border-2 p-5 ${
                  a.status === "kabul"
                    ? "border-teal-300 bg-teal-50"
                    : "border-sky-300 bg-sky-50"
                }`}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-ink-900">
                    {formatWhen(a.startsAt)}
                  </p>
                  <span
                    className={`rounded-full px-4 py-1 text-base font-semibold ${TONE[a.status]}`}
                  >
                    {APPOINTMENT_STATUS_LABEL[a.status]}
                  </span>
                </div>
                <p className="mb-3 text-base text-ink-600">
                  {a.durationMinutes} dakika
                </p>
                {a.note && <p className="mb-4 text-ink-700">{a.note}</p>}

                {a.status === "kabul" && a.meetingUrl && (
                  <a
                    href={a.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 inline-flex min-h-[3rem] items-center rounded-xl bg-teal-700 px-6 font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 active:scale-[0.97]"
                  >
                    Görüşmeye katılın
                  </a>
                )}

                {viewer === "danisan" && a.status === "teklif" && (
                  <div className="flex flex-wrap gap-3">
                    <form action={respondToAppointment}>
                      <input type="hidden" name="randevu" value={a.id} />
                      <input type="hidden" name="dosya" value={conversationId} />
                      <input type="hidden" name="yanit" value="kabul" />
                      <button
                        type="submit"
                        className="min-h-[3rem] rounded-xl bg-teal-700 px-6 font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 active:scale-[0.97]"
                      >
                        Bu saati onaylayın
                      </button>
                    </form>
                    <form action={respondToAppointment}>
                      <input type="hidden" name="randevu" value={a.id} />
                      <input type="hidden" name="dosya" value={conversationId} />
                      <input type="hidden" name="yanit" value="reddedildi" />
                      <button
                        type="submit"
                        className="min-h-[3rem] rounded-xl border-2 border-ink-300 bg-white px-6 font-semibold text-ink-800 hover:-translate-y-px hover:bg-white/70"
                      >
                        Uygun değil
                      </button>
                    </form>
                  </div>
                )}

                {viewer === "uzman" && (
                  <div className="flex flex-wrap gap-3">
                    {a.status === "kabul" && (
                      <form action={updateAppointmentByExpert}>
                        <input type="hidden" name="randevu" value={a.id} />
                        <input
                          type="hidden"
                          name="dosya"
                          value={conversationId}
                        />
                        <input type="hidden" name="durum" value="tamamlandi" />
                        <button
                          type="submit"
                          className="min-h-[2.75rem] rounded-lg border-2 border-teal-700 px-4 font-semibold text-teal-800 hover:bg-teal-50"
                        >
                          Görüşme yapıldı
                        </button>
                      </form>
                    )}
                    <form action={updateAppointmentByExpert}>
                      <input type="hidden" name="randevu" value={a.id} />
                      <input type="hidden" name="dosya" value={conversationId} />
                      <input type="hidden" name="durum" value="iptal" />
                      <button
                        type="submit"
                        className="min-h-[2.75rem] rounded-lg border-2 border-ink-300 px-4 font-semibold text-ink-700 hover:bg-ink-100"
                      >
                        İptal edin
                      </button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {past.length > 0 && (
          <div className="mt-6 border-t border-ink-100 pt-5">
            <h3 className="mb-3 font-semibold text-ink-900">Geçmiş</h3>
            <ul className="space-y-2">
              {past.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 text-ink-700"
                >
                  <span>{formatWhen(a.startsAt)}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-base ${TONE[a.status]}`}
                  >
                    {APPOINTMENT_STATUS_LABEL[a.status]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {viewer === "uzman" && canPropose && (
        <form
          action={proposeAppointmentAction}
          className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]"
        >
          <input type="hidden" name="dosya" value={conversationId} />
          <h3 className="mb-4 text-xl text-ink-900">Yeni görüşme önerin</h3>

          {hata && (
            <p className="mb-4 font-semibold text-danger-700">
              {hata === "tarih"
                ? "Tarih veya saat geçerli değil."
                : "Tarih ve saat gerekli."}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="rnd-tarih"
                className="mb-2 block font-semibold text-ink-900"
              >
                Tarih
              </label>
              <input
                id="rnd-tarih"
                name="tarih"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
              />
            </div>
            <div>
              <label
                htmlFor="rnd-saat"
                className="mb-2 block font-semibold text-ink-900"
              >
                Saat
              </label>
              <input
                id="rnd-saat"
                name="saat"
                type="time"
                defaultValue="10:00"
                className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
              />
            </div>
            <div>
              <label
                htmlFor="rnd-sure"
                className="mb-2 block font-semibold text-ink-900"
              >
                Süre (dk)
              </label>
              <input
                id="rnd-sure"
                name="sure"
                type="number"
                min={15}
                step={5}
                defaultValue={45}
                className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
              />
            </div>
          </div>

          <label
            htmlFor="rnd-link"
            className="mt-4 mb-2 block font-semibold text-ink-900"
          >
            Görüşme bağlantısı (Google Meet, Zoom vb.)
          </label>
          <input
            id="rnd-link"
            name="link"
            type="url"
            placeholder="https://meet.google.com/..."
            className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-4 text-ink-900 focus:border-teal-600"
          />

          <label
            htmlFor="rnd-not"
            className="mt-4 mb-2 block font-semibold text-ink-900"
          >
            Not (opsiyonel)
          </label>
          <input
            id="rnd-not"
            name="not"
            type="text"
            placeholder="Örn. İlk tanışma görüşmesi"
            className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-4 text-ink-900 focus:border-teal-600"
          />

          <button
            type="submit"
            className="mt-5 min-h-[3.25rem] rounded-xl bg-teal-700 px-7 font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 active:scale-[0.97]"
          >
            Saat önerin
          </button>
          <p className="mt-2 text-base text-ink-600">
            Danışan onaylayana kadar görüşme bağlantısı ona gösterilmez.
          </p>
        </form>
      )}
    </div>
  );
}

import { assignAssessment, createTask } from "@/app/actions/care";
import { NEED_AREAS } from "@/data/needs";
import type {
  AssessmentAssignment,
  AssessmentTemplate,
  PlanItem,
} from "@/data/types";

/**
 * Uzmanın dosya içinden yaptığı atamalar: değerlendirme formu ve görev.
 *
 * Form yanıtları burada OLDUĞU GİBİ gösterilir — puan, ortalama veya risk
 * yüzdesi hesaplanmaz (kilitli karar). Yorumu yapan kişi uzmandır.
 */

const STATUS_TONE: Record<PlanItem["status"], string> = {
  yapilacak: "bg-sky-200 text-ink-900",
  surüyor: "bg-teal-100 text-teal-900",
  tamamlandi: "bg-teal-700 text-white",
};

const STATUS_LABEL: Record<PlanItem["status"], string> = {
  yapilacak: "Yapılacak",
  surüyor: "Sürüyor",
  tamamlandi: "Tamamlandı",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ExpertTools({
  conversationId,
  consultantId,
  templates,
  assignments,
  tasks,
  bolum = "hepsi",
  gorevHata,
}: {
  conversationId: string;
  consultantId: string;
  templates: AssessmentTemplate[];
  assignments: AssessmentAssignment[];
  tasks: PlanItem[];
  /** Sayfa sekmelere bölündüğünde yalnızca ilgili bölüm gösterilir. */
  bolum?: "formlar" | "gorevler" | "hepsi";
  gorevHata?: boolean;
}) {
  const completed = assignments.filter((a) => a.status === "tamamlandi");
  const pending = assignments.filter((a) => a.status === "atandi");

  return (
    <div className="space-y-6">
      {/* --- Değerlendirme formları --- */}
      {bolum !== "gorevler" && (
      <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="mb-1 text-2xl">Değerlendirme formları</h2>
        <p className="mb-5 text-ink-600">
          Danışana bir form atayın; doldurduğunda yanıtları burada görürsünüz.
        </p>

        <form
          action={assignAssessment}
          className="mb-6 flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="danisan" value={consultantId} />
          <input type="hidden" name="dosya" value={conversationId} />
          <div className="min-w-[16rem] flex-1">
            <label
              htmlFor="sablon"
              className="mb-2 block font-semibold text-ink-900"
            >
              Form seçin
            </label>
            <select
              id="sablon"
              name="sablon"
              className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.items.length} soru)
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="min-h-[3rem] rounded-xl border-2 border-teal-700 px-6 font-semibold text-teal-800 hover:bg-teal-50"
          >
            Atayın
          </button>
        </form>

        {pending.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-2 font-semibold text-ink-900">Bekleyen</h3>
            <ul className="space-y-2">
              {pending.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper-warm px-4 py-3"
                >
                  <span className="text-ink-800">{a.templateTitle}</span>
                  <span className="text-base text-ink-600">
                    {formatDate(a.assignedAt)} · yanıt bekleniyor
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {completed.length === 0 ? (
          <p className="text-ink-600">Henüz tamamlanmış form yok.</p>
        ) : (
          <div className="space-y-5">
            {completed.map((a) => (
              <details
                key={a.id}
                className="rounded-xl border-2 border-teal-300 bg-teal-50 p-5"
                open
              >
                <summary className="cursor-pointer text-lg font-semibold text-ink-900">
                  {a.templateTitle}{" "}
                  <span className="font-normal text-ink-600">
                    · {formatDate(a.assignedAt)}
                  </span>
                </summary>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[30rem] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-teal-200 text-base text-ink-600">
                        <th className="py-2 pr-4 font-semibold">Soru</th>
                        <th className="py-2 font-semibold">Yanıt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-teal-200/60 align-top last:border-0"
                        >
                          <td className="py-3 pr-4 text-ink-800">
                            {item.prompt}
                          </td>
                          <td className="py-3 font-semibold text-ink-900">
                            {a.answers[item.id] ?? (
                              <span className="font-normal text-ink-500">
                                Yanıtlanmadı
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
      )}

      {/* --- Görev / hedef ataması --- */}
      {bolum !== "formlar" && (
      <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="mb-1 text-2xl">Görevler ve hedefler</h2>
        <p className="mb-5 text-ink-600">
          Bakım planına madde ekleyin. Danışan panelinde durumunu kendisi
          güncelleyebilir.
        </p>

        {tasks.length === 0 ? (
          <p className="mb-6 text-ink-600">Henüz görev atanmadı.</p>
        ) : (
          <ul className="mb-6 space-y-3">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-ink-200 bg-paper-warm p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-semibold text-ink-900">{t.title}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-base font-semibold ${STATUS_TONE[t.status]}`}
                  >
                    {STATUS_LABEL[t.status]}
                  </span>
                </div>
                <p className="mt-1 text-ink-700">{t.detail}</p>
              </li>
            ))}
          </ul>
        )}

        <form action={createTask} className="border-t border-ink-100 pt-5">
          <input type="hidden" name="danisan" value={consultantId} />
          <input type="hidden" name="dosya" value={conversationId} />
          <h3 className="mb-4 text-xl text-ink-900">Yeni görev</h3>

          {gorevHata && (
            <p className="mb-4 font-semibold text-danger-700">
              Başlık ve açıklama gerekli.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
            <div>
              <label
                htmlFor="gorev-baslik"
                className="mb-2 block font-semibold text-ink-900"
              >
                Başlık
              </label>
              <input
                id="gorev-baslik"
                name="baslik"
                type="text"
                placeholder="Örn. Haftalık yürüyüş planı"
                className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-4 text-ink-900 focus:border-teal-600"
              />
            </div>
            <div>
              <label
                htmlFor="gorev-alan"
                className="mb-2 block font-semibold text-ink-900"
              >
                İhtiyaç alanı
              </label>
              <select
                id="gorev-alan"
                name="alan"
                className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
              >
                {NEED_AREAS.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label
            htmlFor="gorev-aciklama"
            className="mt-4 mb-2 block font-semibold text-ink-900"
          >
            Açıklama
          </label>
          <textarea
            id="gorev-aciklama"
            name="aciklama"
            rows={3}
            className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 focus:border-teal-600"
          />

          <button
            type="submit"
            className="mt-5 min-h-[3.25rem] rounded-xl bg-teal-700 px-7 font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 active:scale-[0.97]"
          >
            Görevi atayın
          </button>
        </form>
      </section>
      )}
    </div>
  );
}

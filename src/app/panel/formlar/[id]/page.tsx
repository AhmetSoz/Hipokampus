import Link from "next/link";
import { notFound } from "next/navigation";
import { submitAssessment } from "@/app/actions/care";
import { Notice } from "@/components/ui";
import { getAssignment } from "@/data/assessments";
import { getCurrentConsultantId, getCurrentMember } from "@/data/session";
import type { AssessmentItem } from "@/data/types";

/**
 * Değerlendirme formunu doldurma ekranı.
 *
 * Madde tipleri veriden gelir; buradaki hiçbir soru metni kodda sabit
 * değildir (bkz. data/assessments.ts — içerik serbest, lisanslı ölçek
 * maddesi taşınmaz). Puan hesaplanmaz.
 */

function Alan({
  item,
  value,
  readOnly,
}: {
  item: AssessmentItem;
  value: string | undefined;
  readOnly: boolean;
}) {
  const name = `yanit-${item.id}`;

  if (readOnly) {
    return (
      <p className="rounded-xl border border-ink-200 bg-paper-warm px-4 py-3 text-lg text-ink-800">
        {value?.trim() ? value : <span className="text-ink-500">Yanıtlanmadı</span>}
      </p>
    );
  }

  if (item.responseType === "metin") {
    return (
      <textarea
        id={item.id}
        name={name}
        rows={3}
        defaultValue={value}
        className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-lg text-ink-900 focus:border-teal-600"
      />
    );
  }

  if (item.responseType === "evet-hayir") {
    return (
      <div className="flex flex-wrap gap-3">
        {["Evet", "Hayır"].map((opt) => (
          <label
            key={opt}
            className="cursor-pointer rounded-xl border-2 border-ink-200 bg-white px-6 py-3 text-lg text-ink-900 shadow-[var(--shadow-soft)] has-checked:border-teal-700 has-checked:bg-teal-50 has-checked:font-semibold"
          >
            <input
              type="radio"
              name={name}
              value={opt}
              defaultChecked={value === opt}
              className="sr-only"
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }

  if (item.responseType === "olcek") {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="flex size-14 cursor-pointer items-center justify-center rounded-xl border-2 border-ink-200 bg-white text-lg text-ink-900 shadow-[var(--shadow-soft)] has-checked:border-teal-700 has-checked:bg-teal-700 has-checked:font-semibold has-checked:text-white"
          >
            <input
              type="radio"
              name={name}
              value={String(n)}
              defaultChecked={value === String(n)}
              className="sr-only"
            />
            {n}
          </label>
        ))}
      </div>
    );
  }

  // cok-secmeli
  return (
    <div className="grid gap-2">
      {(item.options ?? []).map((opt) => (
        <label
          key={opt}
          className="cursor-pointer rounded-xl border-2 border-ink-200 bg-white px-5 py-3 text-lg text-ink-900 shadow-[var(--shadow-soft)] has-checked:border-teal-700 has-checked:bg-teal-50 has-checked:font-semibold"
        >
          <input
            type="radio"
            name={name}
            value={opt}
            defaultChecked={value === opt}
            className="sr-only"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

export default async function FormDoldurSayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const member = await getCurrentMember();
  if (!member.scopes.includes("saglik-gorusme")) {
    return (
      <Notice tone="teal" title="Bu formu göremiyorsunuz">
        <p>
          Değerlendirme formları sağlık ve görüşme kapsamındadır. Bu yetkiyi
          yalnızca panel sahibi verebilir.
        </p>
      </Notice>
    );
  }

  const { id } = await params;
  const assignment = await getAssignment(id);
  if (!assignment) notFound();

  // Yetki: başka bir haneye atanmış form görünmemeli.
  if (assignment.consultantId !== (await getCurrentConsultantId())) notFound();

  const done = assignment.status === "tamamlandi";

  return (
    <div className="space-y-6">
      <Link
        href="/panel/formlar"
        className="inline-flex items-center gap-2 text-teal-800 underline underline-offset-4"
      >
        ← Tüm formlar
      </Link>

      <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)]">
        <h1 className="mb-2 text-3xl">{assignment.templateTitle}</h1>
        {assignment.templateDescription && (
          <p className="text-lg text-ink-700">
            {assignment.templateDescription}
          </p>
        )}
        {done && (
          <p className="mt-4 inline-block rounded-full bg-teal-100 px-4 py-2 text-base font-semibold text-teal-900">
            Tamamlandı — yanıtlarınız uzmanınıza iletildi
          </p>
        )}
      </div>

      <form action={submitAssessment} className="space-y-5">
        <input type="hidden" name="atama" value={assignment.id} />

        {assignment.items.map((item, i) => (
          <div
            key={item.id}
            className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]"
          >
            <label
              htmlFor={item.id}
              className="mb-4 flex gap-4 text-lg font-semibold text-ink-900"
            >
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-100 font-[family-name:var(--font-display)] text-base text-teal-800"
              >
                {i + 1}
              </span>
              <span>{item.prompt}</span>
            </label>
            <div className="pl-12">
              <Alan
                item={item}
                value={assignment.answers[item.id]}
                readOnly={done}
              />
            </div>
          </div>
        ))}

        {!done && (
          <button
            type="submit"
            className="min-h-[3.5rem] w-full rounded-xl bg-teal-700 px-7 text-lg font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)] active:scale-[0.98] sm:w-auto"
          >
            Formu gönderin
          </button>
        )}
      </form>

      <Notice title="Puan hesaplanmaz">
        <p>
          Yanıtlarınız uzmanınıza olduğu gibi iletilir. Otomatik bir skor, risk
          yüzdesi veya tanı üretilmez.
        </p>
      </Notice>
    </div>
  );
}

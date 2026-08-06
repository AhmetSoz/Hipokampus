import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/ui";
import { listAssignmentsForConsultant } from "@/data/assessments";
import { getCurrentConsultantId, getCurrentMember } from "@/data/session";

export const metadata: Metadata = { title: "Formlar" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function FormlarSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const member = await getCurrentMember();

  if (!member.scopes.includes("saglik-gorusme")) {
    return (
      <Notice tone="teal" title="Bu bölümü göremiyorsunuz">
        <p>
          Değerlendirme formları sağlık ve görüşme kapsamındadır. Bu yetkiyi
          yalnızca panel sahibi verebilir.
        </p>
      </Notice>
    );
  }

  const sp = await searchParams;
  const assignments = await listAssignmentsForConsultant(
    await getCurrentConsultantId(),
  );
  const pending = assignments.filter((a) => a.status === "atandi");
  const done = assignments.filter((a) => a.status === "tamamlandi");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-3xl sm:text-4xl">Formlar</h1>
        <p className="max-w-2xl text-lg text-ink-700">
          Uzmanınızın doldurmanızı istediği değerlendirme ve takip formları.
        </p>
      </div>

      {sp.durum === "tamamlandi" && (
        <p className="rounded-xl border-2 border-teal-300 bg-teal-50 px-5 py-4 font-semibold text-teal-900">
          Formunuz kaydedildi. Uzmanınız yanıtlarınızı görebilir.
        </p>
      )}

      <section className="rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)]">
        <h2 className="mb-4 text-2xl">Bekleyen formlar</h2>
        {pending.length === 0 ? (
          <p className="text-ink-600">Doldurmanız gereken form yok.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/panel/formlar/${a.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-teal-300 bg-teal-50 p-5 shadow-[var(--shadow-soft)] hover:-translate-y-px hover:shadow-[var(--shadow-card)]"
                >
                  <span>
                    <span className="block text-lg font-semibold text-ink-900">
                      {a.templateTitle}
                    </span>
                    <span className="block text-base text-ink-600">
                      {a.items.length} soru · {formatDate(a.assignedAt)}{" "}
                      tarihinde atandı
                    </span>
                  </span>
                  <span className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white">
                    Doldurun
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)]">
        <h2 className="mb-4 text-2xl">Tamamladıklarınız</h2>
        {done.length === 0 ? (
          <p className="text-ink-600">Henüz tamamlanmış form yok.</p>
        ) : (
          <ul className="space-y-3">
            {done.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/panel/formlar/${a.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-200 bg-paper-warm p-5 hover:-translate-y-px hover:border-teal-300"
                >
                  <span>
                    <span className="block text-lg font-semibold text-ink-900">
                      {a.templateTitle}
                    </span>
                    <span className="block text-base text-ink-600">
                      {Object.keys(a.answers).length} yanıt kaydedildi
                    </span>
                  </span>
                  <span className="rounded-full bg-teal-100 px-4 py-2 text-base font-semibold text-teal-900">
                    Tamamlandı
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Notice title="Bu formlar puan üretmez">
        <p>
          Yanıtlarınız uzmanınıza olduğu gibi iletilir; otomatik bir skor veya
          risk yüzdesi hesaplanmaz. Değerlendirmeyi yapan kişi uzmandır.
        </p>
      </Notice>
    </div>
  );
}

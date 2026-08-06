import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/ui";
import { listConversationsForExpert } from "@/data/conversations";
import { getConsultant, listFamily } from "@/data/household";
import { getCurrentExpert } from "@/data/session";
import { SCOPE_LABEL } from "@/data/types";
import type { Conversation, Consultant, FamilyMember } from "@/data/types";

export const metadata: Metadata = { title: "Danışanlarım" };

/**
 * Uzmanın danışanları. Gerçek hesaplar geldiğinde bir uzmanın birden
 * fazla haneyle çalışması mümkün oldu; bu yüzden dosyalar danışana göre
 * gruplanıyor (eskiden tek sabit hane varsayılıyordu).
 */
export default async function DanisanlarSayfasi() {
  const expert = await getCurrentExpert();
  const conversations = await listConversationsForExpert(expert.id);

  const byConsultant = new Map<string, Conversation[]>();
  for (const c of conversations) {
    const list = byConsultant.get(c.consultantId) ?? [];
    list.push(c);
    byConsultant.set(c.consultantId, list);
  }

  const groups: {
    consultant: Consultant;
    conversations: Conversation[];
    withHealthAccess: FamilyMember[];
  }[] = [];

  for (const [consultantId, convs] of byConsultant) {
    const [consultant, family] = await Promise.all([
      getConsultant(consultantId),
      listFamily(consultantId),
    ]);
    groups.push({
      consultant,
      conversations: convs,
      withHealthAccess: family.filter(
        (m) => m.status === "aktif" && m.scopes.includes("saglik-gorusme"),
      ),
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-3xl sm:text-4xl">Danışanlarım</h1>
        <p className="max-w-2xl text-lg text-ink-700">
          Görüştüğünüz kişiler ve açık dosyalar.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-ink-700">
          Henüz danışanınız yok. Size başvuru yapıldığında burada görünür.
        </p>
      ) : (
        groups.map(({ consultant, conversations: convs, withHealthAccess }) => (
          <section key={consultant.id} className="space-y-4">
            <article className="rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)]">
              <h2 className="mb-1 text-2xl">{consultant.name}</h2>
              <p className="mb-5 text-ink-600">
                {consultant.city} ·{" "}
                {new Date().getFullYear() - consultant.birthYear} yaşında
              </p>
              <p className="mb-6 text-ink-700">{consultant.summary}</p>

              <div className="border-t border-ink-100 pt-5">
                <h3 className="mb-3 text-lg font-semibold text-ink-900">
                  Dosyalar
                </h3>
                <ul className="space-y-2">
                  {convs.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/uzman-panel/mesajlar/${c.id}`}
                        className="text-teal-800 underline underline-offset-4"
                      >
                        {c.subject}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            {/* Uzmanın bilmesi gereken: yazdığı şeyi kim görecek */}
            <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-7 shadow-[var(--shadow-soft)]">
              <h3 className="mb-3 text-xl">Yazdıklarınızı kim görüyor?</h3>
              <p className="mb-5 text-ink-800">
                Bu danışanın panelinde sağlık ve görüşme kapsamına{" "}
                <strong>{withHealthAccess.length} kişi</strong> erişebiliyor.
                Yetkiyi panel sahibi belirler; siz değiştiremezsiniz.
              </p>
              <ul className="space-y-3">
                {withHealthAccess.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-teal-200 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-ink-900">
                      <strong className="font-semibold">{m.name}</strong>{" "}
                      <span className="text-ink-600">{m.relation}</span>
                    </span>
                    <span className="text-base text-ink-600">
                      {m.scopes.map((s) => SCOPE_LABEL[s]).join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))
      )}

      <Notice>
        <p>
          Ödemeyi yapan aile üyesinin sağlık ve görüşme verisine erişimi{" "}
          <strong>otomatik olarak açılmaz.</strong> Bu iki yetki birbirinden
          bağımsızdır.
        </p>
      </Notice>
    </div>
  );
}

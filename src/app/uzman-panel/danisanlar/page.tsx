import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/ui";
import { listConversationsForExpert } from "@/data/conversations";
import { getConsultant, listFamily } from "@/data/household";
import { SCOPE_LABEL } from "@/data/types";

export const metadata: Metadata = { title: "Danışanlarım" };

export default async function DanisanlarSayfasi() {
  const [consultant, conversations, family] = await Promise.all([
    getConsultant(),
    listConversationsForExpert("u1"),
    listFamily(),
  ]);

  const withHealthAccess = family.filter(
    (m) => m.status === "aktif" && m.scopes.includes("saglik-gorusme"),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-3xl sm:text-4xl">Danışanlarım</h1>
        <p className="max-w-2xl text-lg text-ink-700">
          Görüştüğünüz kişiler ve açık dosyalar.
        </p>
      </div>

      <article className="rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-7">
        <h2 className="mb-1 text-2xl">{consultant.name}</h2>
        <p className="mb-5 text-ink-600">
          {consultant.city} · {new Date().getFullYear() - consultant.birthYear}{" "}
          yaşında
        </p>
        <p className="mb-6 text-ink-700">{consultant.summary}</p>

        <div className="border-t border-ink-100 pt-5">
          <h3 className="mb-3 text-lg font-semibold text-ink-900">
            Dosyalar
          </h3>
          <ul className="space-y-2">
            {conversations.map((c) => (
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
      <section className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-7 shadow-[var(--shadow-soft)]">
        <h2 className="mb-3 text-2xl">Yazdıklarınızı kim görüyor?</h2>
        <p className="mb-5 text-ink-800">
          Bu danışanın panelinde sağlık ve görüşme kapsamına{" "}
          <strong>{withHealthAccess.length} kişi</strong> erişebiliyor. Yetkiyi
          panel sahibi belirler; siz değiştiremezsiniz.
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
      </section>

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

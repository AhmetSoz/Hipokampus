import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/ui";
import { listConversations } from "@/data/conversations";
import { getExpertById, RESPONSE_COMMITMENT } from "@/data/experts";
import { getCurrentMember } from "@/data/session";
import type { ConversationStatus } from "@/data/types";

export const metadata: Metadata = { title: "Danışma dosyaları" };

const STATUS_LABEL: Record<ConversationStatus, string> = {
  acik: "Bilgi toplanıyor",
  "yanit-bekliyor": "Uzman yanıtı bekleniyor",
  tamamlandi: "Tamamlandı",
};

export default async function MesajlarSayfasi() {
  const member = await getCurrentMember();

  if (!member.scopes.includes("saglik-gorusme")) {
    return (
      <Notice tone="teal" title="Bu bölümü göremiyorsunuz">
        <p>
          Danışma dosyaları sağlık ve görüşme kapsamındadır. Bu yetkiyi yalnızca
          panel sahibi verebilir.
        </p>
      </Notice>
    );
  }

  const conversations = await listConversations();
  const experts = await Promise.all(
    conversations.map((c) => getExpertById(c.expertId)),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-3xl sm:text-4xl">Danışma dosyaları</h1>
        <p className="max-w-2xl text-lg text-ink-700">
          Her görüşme, adı ve kapsamı olan bir dosyadır. Sohbet geçmişi değil,
          takip edilebilir bir iş.
        </p>
      </div>

      <ul className="space-y-4">
        {conversations.map((c, i) => {
          const expert = experts[i];
          const last = c.messages.at(-1);
          return (
            <li key={c.id}>
              <Link
                href={`/panel/mesajlar/${c.id}`}
                className="block rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[var(--shadow-lift)]"
              >
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-xl text-ink-900">{c.subject}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-base font-semibold ${
                      c.status === "tamamlandi"
                        ? "bg-teal-100 text-teal-900"
                        : "bg-sand-200 text-ink-900"
                    }`}
                  >
                    {STATUS_LABEL[c.status]}
                  </span>
                </div>
                <p className="mb-3 text-ink-600">
                  {expert?.name} · {expert?.field}
                </p>
                {last && (
                  <p className="line-clamp-2 text-ink-700">
                    <span className="font-semibold">{last.authorName}:</span>{" "}
                    {last.body.split("\n")[0]}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <Notice tone="teal" title="Yanıt süresi kişiye göre değişmez">
        <p>
          Hangi uzmanla görüşürseniz görüşün aynı taahhüt geçerli:{" "}
          <strong>{RESPONSE_COMMITMENT.toLocaleLowerCase("tr")} yanıt.</strong>{" "}
          Görüşmeler yazışarak yapılır, görüntülü görüşme ve görüşme kaydı yoktur.
        </p>
      </Notice>
    </div>
  );
}

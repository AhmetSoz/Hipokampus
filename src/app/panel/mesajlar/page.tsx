import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/ui";
import { listConversationsForConsultant } from "@/data/conversations";
import { getExpertById, RESPONSE_COMMITMENT } from "@/data/experts";
import { getCurrentConsultantId, getCurrentMember } from "@/data/session";
import type { ConversationStatus } from "@/data/types";

export const metadata: Metadata = { title: "Mesajlarım" };

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
}

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

  const conversations = await listConversationsForConsultant(
    await getCurrentConsultantId(),
  );
  const experts = await Promise.all(
    conversations.map((c) => getExpertById(c.expertId)),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-3xl sm:text-4xl">Mesajlarım</h1>
        <p className="max-w-2xl text-lg text-ink-700">
          Her uzmanla yazışmanız ayrı bir başlık altında. Yazışmanın yanında
          görüşme takvimi ve seans notları da aynı yerde.
        </p>
      </div>

      {conversations.length === 0 ? (
        /* Boş durum bir çıkmaz olmamalı: mesajlaşmanın nasıl başladığını
           anlatıp doğrudan uzman listesine götürüyoruz. */
        <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-7">
          <h2 className="mb-2 text-xl text-ink-900">Henüz yazışmanız yok</h2>
          <p className="mb-5 text-ink-800">
            Yazışma, bir uzmana başvurduğunuzda başlar. Uzman listesinden
            konunuza uygun birini seçip başvurmanız yeterli.
          </p>
          <Link
            href="/uzmanlar"
            className="inline-flex min-h-[3.25rem] items-center rounded-xl bg-teal-700 px-7 font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 active:scale-[0.97]"
          >
            Uzman bulun
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {conversations.map((c, i) => {
            const expert = experts[i];
            const last = c.messages.at(-1);
            const sizdeMi = c.status === "acik";
            return (
              <li key={c.id}>
                <Link
                  href={`/panel/mesajlar/${c.id}`}
                  className="block rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-calm)] hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[var(--shadow-lift)]"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="min-w-0">
                      {/* Kiminle konuştuğunuz başlıktan önce gelir —
                          kullanıcı önce kişiyi arıyor, konuyu değil. */}
                      <p className="text-lg font-semibold text-ink-900">
                        {expert?.name}
                        <span className="ml-2 font-normal text-ink-600">
                          {expert?.field}
                        </span>
                      </p>
                      <p className="text-ink-700">{c.subject}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-base font-semibold ${
                        c.status === "tamamlandi"
                          ? "bg-teal-100 text-teal-900"
                          : sizdeMi
                            ? "bg-teal-700 text-white"
                            : "bg-sky-200 text-ink-900"
                      }`}
                    >
                      {sizdeMi ? "Sıra sizde" : STATUS_LABEL[c.status]}
                    </span>
                  </div>

                  {last && (
                    <div className="rounded-xl border border-ink-100 bg-paper-warm p-4">
                      <p className="mb-1 text-base text-ink-600">
                        Son mesaj · {formatWhen(last.sentAt)}
                      </p>
                      <p className="line-clamp-2 text-ink-800">
                        <span className="font-semibold">
                          {last.author === "uzman" ? expert?.name : "Siz"}:
                        </span>{" "}
                        {last.body.split("\n")[0]}
                      </p>
                    </div>
                  )}

                  <p className="mt-3 font-semibold text-teal-800">
                    Yazışmayı açın →
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

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

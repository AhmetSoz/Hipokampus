import { sendMessage } from "@/app/actions/messages";
import { RESPONSE_COMMITMENT } from "@/data/experts";
import type { Conversation, ConversationStatus, Expert } from "@/data/types";

/**
 * Danışma dosyası görünümü. İki taraf da (danışan ve uzman) aynı bileşeni
 * kullanır; yalnızca `viewer` değişir.
 *
 * Araştırma gereği BİLEREK YOK: okundu bilgisi, "yazıyor" göstergesi,
 * geri sayım sayacı. Bunların yerine dosya durumu ve mutlak saatli
 * yanıt taahhüdü var.
 */

const STATUS: Record<
  ConversationStatus,
  { label: string; tone: string; step: number }
> = {
  acik: { label: "Bilgi toplanıyor", tone: "bg-teal-100 text-teal-900", step: 1 },
  "yanit-bekliyor": {
    label: "Uzman yanıtı bekleniyor",
    tone: "bg-sand-200 text-ink-900",
    step: 2,
  },
  tamamlandi: {
    label: "Tamamlandı — plan teslim edildi",
    tone: "bg-teal-700 text-white",
    step: 4,
  },
};

const STEPS = [
  "Bilgi toplama",
  "Uzman değerlendirmesi",
  "Plan hazırlanıyor",
  "Plan teslim edildi",
];

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConversationThread({
  conversation,
  expert,
  viewer,
}: {
  conversation: Conversation;
  expert: Expert;
  viewer: "danisan" | "uzman";
}) {
  const status = STATUS[conversation.status];
  const waiting = conversation.status === "yanit-bekliyor";

  return (
    <div className="space-y-6">
      {/* Dosya başlığı — "sohbet" değil, adı olan bir iş */}
      <header className="rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-6">
        <p className="mb-1 text-base text-ink-600">Danışma dosyası</p>
        <h1 className="mb-4 text-2xl sm:text-3xl">{conversation.subject}</h1>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-4 py-2 text-base font-semibold ${status.tone}`}
          >
            {status.label}
          </span>
          <span className="text-base text-ink-600">
            {viewer === "danisan" ? expert.name : "Danışan: Ayşe Demir"} ·{" "}
            {formatWhen(conversation.startedAt)} tarihinde açıldı
          </span>
        </div>

        {/* Aşama göstergesi — asenkron belirsizliğin panzehiri */}
        <ol className="mt-6 grid gap-2 border-t border-ink-100 pt-6 sm:grid-cols-4">
          {STEPS.map((label, i) => {
            const done = i + 1 <= status.step;
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
                    done ? "bg-teal-700 text-white" : "bg-ink-100 text-ink-600"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-base ${done ? "text-ink-900" : "text-ink-600"}`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </header>

      {waiting && viewer === "danisan" && (
        <p className="rounded-xl border-l-4 border-teal-300 bg-teal-50 p-5 text-ink-800 shadow-[var(--shadow-soft)]">
          Mesajınız uzmana iletildi.{" "}
          <strong>{RESPONSE_COMMITMENT.toLocaleLowerCase("tr")} yanıt</strong>{" "}
          alacaksınız. Bu süre aşılırsa size seçenek sunulur; sessizce
          beklemeye bırakılmazsınız.
        </p>
      )}

      <ol className="space-y-5">
        {conversation.messages.map((m) => {
          const mine =
            (viewer === "danisan" && m.author === "danisan") ||
            (viewer === "uzman" && m.author === "uzman");
          return (
            <li
              key={m.id}
              className={`rounded-2xl border p-6 shadow-[var(--shadow-soft)] ${
                m.author === "uzman"
                  ? "border-teal-200 bg-teal-50"
                  : "border-ink-200 bg-white"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-semibold text-ink-900">
                  {m.authorName}
                  {m.author === "uzman" && (
                    <span className="ml-2 font-normal text-ink-600">uzman</span>
                  )}
                  {mine && (
                    <span className="ml-2 font-normal text-ink-600">siz</span>
                  )}
                </p>
                <p className="text-base text-ink-600">{formatWhen(m.sentAt)}</p>
              </div>
              <div className="space-y-3 text-lg text-ink-800">
                {m.body.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      {conversation.status === "tamamlandi" ? (
        <div className="rounded-2xl border-2 border-teal-700 bg-white p-7 shadow-[var(--shadow-soft)]">
          <p className="mb-2 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
            Teslim edildi
          </p>
          <h2 className="mb-3 text-2xl">Bakım planınız hazır</h2>
          <p className="mb-6 text-ink-700">
            Plan, yazışmanın içinde bir mesaj değil; ayrı ve kalıcı bir
            belgedir. Yazdırabilir, aile üyelerinizle paylaşabilirsiniz.
          </p>
          <a
            href="/panel/plan"
            className="inline-flex min-h-[3.25rem] items-center rounded-xl bg-teal-700 px-7 text-lg font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)] active:scale-[0.97]"
          >
            Bakım planını açın
          </a>
          <p className="mt-6 border-t border-ink-100 pt-5 text-base text-ink-600">
            Bu danışma tamamlandı. Plan hakkında soru sormaya devam
            edebilirsiniz; yeni bir konu için yeni danışma başlatın.
          </p>
        </div>
      ) : (
        <form
          action={sendMessage}
          className="rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-6"
        >
          <input type="hidden" name="dosya" value={conversation.id} />
          <input type="hidden" name="taraf" value={viewer} />

          <label
            htmlFor="yeni-mesaj"
            className="mb-3 block text-lg font-semibold text-ink-900"
          >
            {viewer === "uzman" ? "Yanıtınızı yazın" : "Mesajınızı yazın"}
          </label>
          <textarea
            id="yeni-mesaj"
            name="mesaj"
            rows={4}
            required
            className="min-h-[7rem] w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-lg leading-relaxed text-ink-900 focus:border-teal-600"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            {/* Acil durum uyarısı: üçüncü katman.
                Her mesajın üstünde değil, yalnızca yazma alanının altında. */}
            <p className="text-base text-ink-600">
              Acil bir durum için mesaj yazmayın — 112&apos;yi arayın.
            </p>
            <button
              type="submit"
              className="min-h-[3.75rem] rounded-xl bg-teal-700 px-8 text-lg font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)] active:scale-[0.97]"
            >
              Gönderin
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

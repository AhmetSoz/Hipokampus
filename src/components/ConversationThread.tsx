import { sendMessage } from "@/app/actions/messages";
import { RESPONSE_COMMITMENT } from "@/data/experts";
import type { Conversation, ConversationStatus } from "@/data/types";

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
    tone: "bg-sky-200 text-ink-900",
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

/** Sohbet balonu için: yalnızca saat. Gün, ayırıcı şeritte yazılıyor. */
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .replace(/\(.*\)/, "")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("tr");
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Dosya başlığı — sekmelerden bağımsız, her zaman görünür.
 *
 * `ConversationThread`'den ayrıldı: uzman tarafında sayfa sekmelere
 * bölündü ve "Seanslar" sekmesindeyken de hangi dosyada olduğunuzu
 * görmeniz gerekiyor.
 */
export function ConversationHeader({
  conversation,
  counterpartName,
  viewer,
}: {
  conversation: Conversation;
  /** Karşı taraf: danışana uzmanın adı, uzmana danışanın adı. */
  counterpartName: string;
  viewer: "danisan" | "uzman";
}) {
  const status = STATUS[conversation.status];

  return (
    <header className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
      <p className="mb-1 text-base text-ink-600">Danışma dosyası</p>
      <h1 className="mb-4 text-2xl sm:text-3xl">{conversation.subject}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-4 py-2 text-base font-semibold ${status.tone}`}
        >
          {status.label}
        </span>
        <span className="text-base text-ink-600">
          {viewer === "danisan" ? counterpartName : `Danışan: ${counterpartName}`}{" "}
          · {formatWhen(conversation.startedAt)} tarihinde açıldı
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
  );
}

export function ConversationThread({
  conversation,
  viewer,
  bosMesajHatasi = false,
}: {
  conversation: Conversation;
  viewer: "danisan" | "uzman";
  /** Kullanıcı boş/yalnızca boşluk içeren bir mesaj göndermeye çalıştı. */
  bosMesajHatasi?: boolean;
}) {
  const waiting = conversation.status === "yanit-bekliyor";

  return (
    <div className="space-y-6">

      {waiting && viewer === "danisan" && (
        <p className="rounded-xl border-l-4 border-teal-300 bg-teal-50 p-5 text-ink-800 shadow-[var(--shadow-soft)]">
          Mesajınız uzmana iletildi.{" "}
          <strong>{RESPONSE_COMMITMENT.toLocaleLowerCase("tr")} yanıt</strong>{" "}
          alacaksınız. Bu süre aşılırsa size seçenek sunulur; sessizce
          beklemeye bırakılmazsınız.
        </p>
      )}

      {/* Sohbet görünümü: kendi mesajın sağda ve dolu, karşınınki solda.
          Önceden her mesaj tam genişlikte bir kart olduğu için yazışma
          "sohbet" gibi okunmuyordu; sahibi mesajlaşmanın daha tanıdık ve
          kolay olmasını istedi. */}
      <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6">
        <ol className="space-y-4">
          {conversation.messages.map((m, i) => {
            const mine =
              (viewer === "danisan" && m.author === "danisan") ||
              (viewer === "uzman" && m.author === "uzman");
            const oncekiGun = conversation.messages[i - 1]
              ? formatDay(conversation.messages[i - 1].sentAt)
              : null;
            const bugun = formatDay(m.sentAt);
            const yeniGun = oncekiGun !== bugun;

            return (
              <li key={m.id}>
                {yeniGun && (
                  <p className="my-4 text-center text-base text-ink-500">
                    <span className="rounded-full bg-ink-100 px-3 py-1">
                      {bugun}
                    </span>
                  </p>
                )}
                <div
                  className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
                >
                  {!mine && (
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-600 to-teal-800 text-base font-semibold text-white"
                    >
                      {initials(m.authorName)}
                    </span>
                  )}
                  <div className={`max-w-[75%] ${mine ? "text-right" : ""}`}>
                    {!mine && (
                      <p className="mb-1 text-base text-ink-600">
                        {m.authorName}
                        {m.author === "uzman" && " · uzman"}
                      </p>
                    )}
                    <div
                      className={`inline-block rounded-2xl px-4 py-3 text-left text-lg leading-relaxed ${
                        mine
                          ? "rounded-br-sm bg-teal-700 text-white"
                          : "rounded-bl-sm bg-ink-100 text-ink-900"
                      }`}
                    >
                      {m.body.split("\n\n").map((p, k) => (
                        <p key={k} className={k > 0 ? "mt-3" : undefined}>
                          {p}
                        </p>
                      ))}
                    </div>
                    <p className="mt-1 text-base text-ink-500">
                      {formatTime(m.sentAt)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {conversation.status === "tamamlandi" ? (
        <div className="rounded-2xl border-2 border-teal-700 bg-white p-7 shadow-[var(--shadow-soft)]">
          <p className="mb-2 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
            Teslim edildi
          </p>
          <h2 className="mb-3 text-2xl">Danışmanlık planınız hazır</h2>
          <p className="mb-6 text-ink-700">
            Plan, yazışmanın içinde bir mesaj değil; ayrı ve kalıcı bir
            belgedir. Yazdırabilir, aile üyelerinizle paylaşabilirsiniz.
          </p>
          <a
            href="/panel/plan"
            className="inline-flex min-h-[3.25rem] items-center rounded-xl bg-teal-700 px-7 text-lg font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)] active:scale-[0.97]"
          >
            Planı açın
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

          <label htmlFor="yeni-mesaj" className="sr-only">
            {viewer === "uzman" ? "Yanıtınızı yazın" : "Mesajınızı yazın"}
          </label>
          {bosMesajHatasi && (
            <p className="mb-3 font-semibold text-danger-700">
              Mesaj boş olamaz. Lütfen bir şeyler yazın.
            </p>
          )}

          {/* Yazma alanı ve gönder düğmesi yan yana — sohbet
              uygulamalarındaki tanıdık düzen. */}
          <div className="flex items-end gap-3">
            <textarea
              id="yeni-mesaj"
              name="mesaj"
              rows={2}
              required
              placeholder={
                viewer === "uzman"
                  ? "Yanıtınızı yazın…"
                  : "Mesajınızı yazın…"
              }
              className="min-h-[3.5rem] flex-1 resize-y rounded-2xl border-2 border-ink-200 bg-white px-4 py-3 text-lg leading-relaxed text-ink-900 focus:border-teal-600"
            />
            <button
              type="submit"
              aria-label="Gönderin"
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow,background-color] duration-[var(--dur-base)] ease-[var(--ease-calm)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)] active:scale-[0.95]"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
                <path
                  d="M3 11h13M11 4.5 17.5 11 11 17.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Acil durum uyarısı: yalnızca yazma alanının altında. */}
          <p className="mt-3 text-base text-ink-600">
            Acil bir durum için mesaj yazmayın — 112&apos;yi arayın.
          </p>
        </form>
      )}
    </div>
  );
}

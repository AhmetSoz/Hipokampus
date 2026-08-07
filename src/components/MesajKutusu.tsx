"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sendMessage } from "@/app/actions/messages";

/**
 * Yüzen mesaj kutusu — sağ altta, her panel sayfasından erişilebilir.
 *
 * Sahibinin isteği: "mesaj kısmı çok daha ayrı olmalı, hepsini tek bir
 * noktaya sıkıştırmışsın, sağ alta açılabilir kutucuk koy, her şeyi
 * basit ve bilindik şekle getir."
 *
 * Bilindik desen: kapalıyken yuvarlak düğme + okunmamış rozeti, açıkken
 * önce yazışma listesi, birini seçince o yazışma ve altında yazma alanı.
 * Mobilde tam genişlikte alttan açılan bir sayfa olur; masaüstünde sağ
 * altta sabit bir kutu.
 *
 * Menüdeki "Mesajlarım" bölümü kaldırılmadı: kutu hızlı erişim,
 * tam sayfa ise geniş görünüm. İkisi aynı veriye bakar.
 */

export type KutuMesaj = {
  id: string;
  author: "danisan" | "uzman";
  authorName: string;
  body: string;
  sentAt: string;
};

export type KutuDosya = {
  id: string;
  subject: string;
  karsiTaraf: string;
  durum: "acik" | "yanit-bekliyor" | "tamamlandi";
  messages: KutuMesaj[];
};

function saat(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function gun(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
}

function bashHarf(ad: string) {
  return ad
    .replace(/\(.*\)/, "")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("tr");
}

export function MesajKutusu({
  dosyalar,
  viewer,
  tumMesajlarHref,
}: {
  dosyalar: KutuDosya[];
  viewer: "danisan" | "uzman";
  tumMesajlarHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [acikDosya, setAcikDosya] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Önce yazışmadan listeye, sonra kutuyu kapat.
      if (acikDosya) setAcikDosya(null);
      else setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, acikDosya]);

  /* Sıra kimde? Danışan için "acik" (uzman yanıtladı), uzman için
     "yanit-bekliyor" (danışan yazdı) sırayı bu tarafa geçirir. */
  const sizdeSayisi = dosyalar.filter((d) =>
    viewer === "danisan" ? d.durum === "acik" : d.durum === "yanit-bekliyor",
  ).length;

  const secili = dosyalar.find((d) => d.id === acikDosya) ?? null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="hk-mesaj-kutusu"
        className="fixed right-5 bottom-5 z-40 flex min-h-[3.5rem] items-center gap-2 rounded-full bg-teal-700 pr-6 pl-5 font-semibold text-white shadow-[var(--shadow-pop)] transition-[transform,background-color] duration-[var(--dur-base)] ease-[var(--ease-calm)] hover:-translate-y-px hover:bg-teal-800 active:scale-[0.97]"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
          <path
            d="M3 9.5C3 6.46 5.96 4 9.6 4h2.8C16.04 4 19 6.46 19 9.5s-2.96 5.5-6.6 5.5H9l-4 3v-3.4C3.8 13.6 3 11.7 3 9.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        Mesajlar
        {sizdeSayisi > 0 && (
          <span className="flex size-6 items-center justify-center rounded-full bg-white text-base text-teal-800">
            {sizdeSayisi}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="hk-fade fixed inset-0 z-40 bg-ink-900/20 sm:hidden"
          />
          <section
            id="hk-mesaj-kutusu"
            aria-label="Mesajlar"
            className="hk-kutu-ac fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col rounded-t-2xl border border-ink-200 bg-paper shadow-[var(--shadow-pop)] sm:inset-x-auto sm:right-5 sm:bottom-24 sm:h-[32rem] sm:w-[24rem] sm:rounded-2xl"
          >
            {/* Başlık */}
            <div className="flex items-center gap-3 border-b border-ink-200 p-4">
              {secili && (
                <button
                  type="button"
                  onClick={() => setAcikDosya(null)}
                  aria-label="Listeye dönün"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-100"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
                    <path
                      d="M11 4 6 9l5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
              <p className="min-w-0 flex-1 truncate text-lg font-semibold text-ink-900">
                {secili ? secili.karsiTaraf : "Mesajlar"}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Kapatın"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-100"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
                  <path
                    d="M4 4l10 10M14 4L4 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Liste görünümü */}
            {!secili && (
              <div className="flex-1 overflow-y-auto">
                {dosyalar.length === 0 ? (
                  <div className="p-5">
                    <p className="mb-4 text-ink-700">
                      {viewer === "danisan"
                        ? "Henüz yazışmanız yok. Bir uzmana başvurduğunuzda burada başlar."
                        : "Henüz yazışmanız yok. Size başvuru yapıldığında burada görünür."}
                    </p>
                    {viewer === "danisan" && (
                      <Link
                        href="/uzmanlar"
                        onClick={() => setOpen(false)}
                        className="inline-flex min-h-[3rem] items-center rounded-xl bg-teal-700 px-5 font-semibold text-white"
                      >
                        Uzman bulun
                      </Link>
                    )}
                  </div>
                ) : (
                  <ul className="divide-y divide-ink-100">
                    {dosyalar.map((d) => {
                      const son = d.messages.at(-1);
                      const sizde =
                        viewer === "danisan"
                          ? d.durum === "acik"
                          : d.durum === "yanit-bekliyor";
                      return (
                        <li key={d.id}>
                          <button
                            type="button"
                            onClick={() => setAcikDosya(d.id)}
                            className="flex w-full items-start gap-3 p-4 text-left hover:bg-teal-50"
                          >
                            <span
                              aria-hidden
                              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-600 to-teal-800 font-semibold text-white"
                            >
                              {bashHarf(d.karsiTaraf)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-2">
                                <span className="truncate font-semibold text-ink-900">
                                  {d.karsiTaraf}
                                </span>
                                {sizde && (
                                  <span className="shrink-0 rounded-full bg-teal-700 px-2 py-0.5 text-base text-white">
                                    yeni
                                  </span>
                                )}
                              </span>
                              <span className="block truncate text-base text-ink-600">
                                {son ? son.body.split("\n")[0] : d.subject}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* Yazışma görünümü */}
            {secili && (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  <p className="text-center text-base text-ink-500">
                    {secili.subject}
                  </p>
                  {secili.messages.map((m) => {
                    const benim = m.author === viewer;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${benim ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[80%] ${benim ? "text-right" : ""}`}>
                          <div
                            className={`inline-block rounded-2xl px-3.5 py-2.5 text-left leading-relaxed ${
                              benim
                                ? "rounded-br-sm bg-teal-700 text-white"
                                : "rounded-bl-sm bg-ink-100 text-ink-900"
                            }`}
                          >
                            {m.body.split("\n\n").map((par, k) => (
                              <p key={k} className={k > 0 ? "mt-2" : undefined}>
                                {par}
                              </p>
                            ))}
                          </div>
                          <p className="mt-0.5 text-base text-ink-500">
                            {gun(m.sentAt)} · {saat(m.sentAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {secili.durum !== "tamamlandi" ? (
                  <form
                    action={sendMessage}
                    className="border-t border-ink-200 p-3"
                  >
                    <input type="hidden" name="dosya" value={secili.id} />
                    <input type="hidden" name="taraf" value={viewer} />
                    <div className="flex items-end gap-2">
                      <label htmlFor="kutu-mesaj" className="sr-only">
                        Mesajınız
                      </label>
                      <textarea
                        id="kutu-mesaj"
                        name="mesaj"
                        rows={1}
                        required
                        placeholder="Mesaj yazın…"
                        className="min-h-[2.75rem] flex-1 resize-y rounded-xl border-2 border-ink-200 bg-white px-3 py-2 text-ink-900 focus:border-teal-600"
                      />
                      <button
                        type="submit"
                        aria-label="Gönderin"
                        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.95]"
                      >
                        <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden fill="none">
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
                  </form>
                ) : (
                  <p className="border-t border-ink-200 p-4 text-base text-ink-600">
                    Bu danışma tamamlandı.
                  </p>
                )}
              </>
            )}

            <Link
              href={tumMesajlarHref}
              onClick={() => setOpen(false)}
              className="border-t border-ink-200 p-3 text-center font-semibold text-teal-800 hover:bg-teal-50"
            >
              Tüm mesajları açın →
            </Link>
          </section>
        </>
      )}
    </>
  );
}

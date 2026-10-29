"use client";

import { useState, useTransition } from "react";
import { sadelestir } from "@/app/actions/sadelestir";

/**
 * Seans notu metin alanı. Claude açıksa "Aile için sadeleştirin" önerisi
 * notun altında bir taslak olarak belirir; uzman "Bunu kullan" demeden
 * kendi metni değişmez.
 */
export function SeansNotuAlani({ claudeAcik }: { claudeAcik: boolean }) {
  const [not, setNot] = useState("");
  const [oneri, setOneri] = useState<{
    metin: string;
    yapilacaklar: string[];
    dikkat: string | null;
  } | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, baslat] = useTransition();

  const iste = () => {
    setHata(null);
    baslat(async () => {
      const y = await sadelestir(not);
      if (y.ok) setOneri({ metin: y.metin, yapilacaklar: y.yapilacaklar, dikkat: y.dikkat });
      else setHata(y.hata);
    });
  };

  const kullan = () => {
    if (!oneri) return;
    const liste = oneri.yapilacaklar.length
      ? `\n\nEvde yapılacaklar:\n${oneri.yapilacaklar.map((y) => `- ${y}`).join("\n")}`
      : "";
    setNot(oneri.metin + liste);
    setOneri(null);
  };

  return (
    <div>
      <textarea
        id="seans-not"
        name="not"
        rows={5}
        value={not}
        onChange={(e) => setNot(e.target.value)}
        className="w-full rounded-[10px] border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 focus:border-teal-600"
      />

      {claudeAcik && (
        <div className="mt-2">
          <button
            type="button"
            onClick={iste}
            disabled={bekliyor || not.trim().length < 30}
            className="text-base font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 disabled:text-ink-500 disabled:no-underline"
          >
            {bekliyor ? "Hazırlanıyor…" : "Aile için sadeleştirin"}
          </button>
          <span className="ml-2 text-base text-ink-600">
            Claude ile bir taslak; siz onaylamadan notunuz değişmez.
          </span>
        </div>
      )}

      {hata && (
        <p role="alert" className="mt-3 border-l-4 border-ink-700 bg-paper-warm px-4 py-2 text-ink-900">
          {hata}
        </p>
      )}

      {oneri && (
        <div className="mt-4 rounded-md border border-sky-300 bg-sky-50 p-5" aria-live="polite">
          <p className="mb-2 font-semibold text-ink-900">Ailenin okuyacağı sürüm (taslak)</p>
          <p className="whitespace-pre-line text-ink-900">{oneri.metin}</p>
          {oneri.yapilacaklar.length > 0 && (
            <>
              <p className="mt-4 mb-1 font-semibold text-ink-900">Evde yapılacaklar</p>
              <ul className="list-disc space-y-1 pl-6 text-ink-900">
                {oneri.yapilacaklar.map((y) => (
                  <li key={y}>{y}</li>
                ))}
              </ul>
            </>
          )}
          {oneri.dikkat && (
            <p className="mt-4 text-base text-ink-700">
              <span className="font-semibold text-ink-900">Kontrol edin: </span>
              {oneri.dikkat}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={kullan}
              className="min-h-[2.75rem] rounded-[10px] bg-teal-700 px-5 font-semibold text-white hover:bg-teal-800"
            >
              Bunu nota alın
            </button>
            <button
              type="button"
              onClick={() => setOneri(null)}
              className="text-teal-800 underline underline-offset-4"
            >
              Vazgeçin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

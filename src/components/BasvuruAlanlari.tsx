"use client";

import { useEffect, useState } from "react";
import { OZET_ANAHTARI } from "./NeedsForm";

/**
 * Başvuru formunun konu ve açıklama alanları. İhtiyaç netleştirmeden
 * "Bu özetle başvurun" ile gelindiyse özet sekme belleğinden bir kez okunur
 * ve hemen silinir; adres çubuğuna hiçbir şey yazılmaz.
 */
export function BasvuruAlanlari({ slug }: { slug: string }) {
  const [konu, setKonu] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [ozettenGeldi, setOzettenGeldi] = useState(false);

  useEffect(() => {
    try {
      const ham = sessionStorage.getItem(OZET_ANAHTARI);
      if (!ham) return;
      sessionStorage.removeItem(OZET_ANAHTARI);
      const o = JSON.parse(ham) as { slug: string; konu: string; aciklama: string };
      if (o.slug !== slug) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tek seferlik, istemci belleğinden okuma
      setKonu(o.konu);
      setAciklama(o.aciklama);
      setOzettenGeldi(true);
    } catch {}
  }, [slug]);

  return (
    <>
      {ozettenGeldi && (
        <p className="mb-5 border-l-4 border-teal-300 bg-sky-50 px-4 py-3 text-ink-800">
          Hazırladığınız özet aşağıya eklendi. Göndermeden önce okuyup
          değiştirebilirsiniz.
        </p>
      )}

      <label htmlFor="konu" className="mb-2 block font-semibold text-ink-900">
        Konu
      </label>
      <input
        id="konu"
        name="konu"
        type="text"
        value={konu}
        onChange={(e) => setKonu(e.target.value)}
        placeholder="Örn. Günlük düzeni yeniden kurmak"
        required
        className="mb-5 min-h-[3.25rem] w-full rounded-[10px] border-2 border-ink-200 bg-white px-4 text-lg text-ink-900 focus:border-teal-600"
      />

      <label htmlFor="aciklama" className="mb-2 block font-semibold text-ink-900">
        Durumunuzu kısaca anlatın
      </label>
      <textarea
        id="aciklama"
        name="aciklama"
        rows={6}
        value={aciklama}
        onChange={(e) => setAciklama(e.target.value)}
        required
        placeholder="Neyle zorlanıyorsunuz, nereden başlamak istiyorsunuz?"
        className="w-full rounded-[10px] border-2 border-ink-200 bg-white px-4 py-3 text-lg leading-relaxed text-ink-900 focus:border-teal-600"
      />
    </>
  );
}

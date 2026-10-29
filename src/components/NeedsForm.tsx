"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  netlestir,
  type NetlestirmeSonucu,
} from "@/app/actions/netlestir";
import { NEED_AREAS } from "@/data/needs";
import { areasFromObservations, OBSERVATIONS } from "@/data/observations";
import { NeedIcon } from "./NeedIcon";
import { ButtonLink } from "./ui";

/**
 * İHTİYAÇ NETLEŞTİRME
 *
 * İki yol var ve ikisi de aynı yere çıkar — ihtiyaç başlıkları:
 *  1. Yazarak: aile durumu kendi cümleleriyle anlatır, Claude bunu özet,
 *     başlık, hazırlık soruları ve en fazla üç uzman önerisine çevirir
 *     (bkz. app/actions/netlestir.ts). Metin açık onayla gönderilir,
 *     veritabanına yazılmaz.
 *  2. İşaretleyerek: hiçbir şey sunucuya gitmez; 12 gözlem başlıklara
 *     eşlenir (data/observations.ts).
 *
 * Kilitli kararlar: puan/skor/risk yok, tanı yok, otomatik acil durum
 * tespiti yok, otomatik uzman ataması yok. 112 bilgisi her sonuçta durur.
 */

const RECIPIENTS = [
  { id: "anne-baba", label: "Annem ya da babam" },
  { id: "es", label: "Eşim" },
  { id: "yakin", label: "Bir yakınım" },
  { id: "kendim", label: "Kendim" },
] as const;

type Stage = "yaz" | "gozlem" | "konular" | "sonuc" | "claude-sonuc";

const PRIMARY_BTN =
  "inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-[10px] bg-teal-700 px-7 text-lg font-semibold text-white hover:bg-teal-800 active:scale-[0.98] disabled:pointer-events-none disabled:bg-ink-300";
const TEXT_BTN =
  "text-lg text-teal-800 underline decoration-teal-300 underline-offset-[6px] hover:decoration-teal-700";

export const OZET_ANAHTARI = "hk-basvuru-ozeti";

export function NeedsForm({ claudeAcik }: { claudeAcik: boolean }) {
  const [stage, setStage] = useState<Stage>(claudeAcik ? "yaz" : "gozlem");
  const [recipient, setRecipient] = useState<string>("anne-baba");
  const [metin, setMetin] = useState("");
  const [onay, setOnay] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [sonuc, setSonuc] = useState<NetlestirmeSonucu | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [observed, setObserved] = useState<string[]>([]);
  const [bekliyor, baslat] = useTransition();

  const recipientLabel =
    RECIPIENTS.find((r) => r.id === recipient)?.label ?? "Bir yakınım";

  const gonder = () => {
    setHata(null);
    baslat(async () => {
      const y = await netlestir({ kimIcin: recipientLabel, metin, onay });
      if (!y.ok) {
        setHata(y.hata);
        return;
      }
      if (y.sonuc.yetersiz) {
        setHata(y.sonuc.yetersiz);
        return;
      }
      setSonuc(y.sonuc);
      setStage("claude-sonuc");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const reset = () => {
    setSelected([]);
    setObserved([]);
    setSonuc(null);
    setHata(null);
    setStage(claudeAcik ? "yaz" : "gozlem");
  };

  if (stage === "claude-sonuc" && sonuc) {
    return <ClaudeSonucu sonuc={sonuc} onReset={reset} />;
  }

  /* ------------------------------------------------------------------ */
  /* Yazarak anlatma                                                     */

  if (stage === "yaz") {
    const yeterli = metin.trim().length >= 40;
    return (
      <div>
        <fieldset className="mb-6">
          <legend className="mb-3 text-lg text-ink-700">Kimin için yazıyorsunuz?</legend>
          <div className="flex flex-wrap gap-2">
            {RECIPIENTS.map((r) => (
              <label
                key={r.id}
                className={`cursor-pointer rounded-full border px-4 py-2 text-lg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-600 ${
                  recipient === r.id
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-ink-300 bg-white text-ink-800 hover:border-teal-600"
                }`}
              >
                <input
                  type="radio"
                  name="recipient"
                  value={r.id}
                  checked={recipient === r.id}
                  onChange={() => setRecipient(r.id)}
                  className="sr-only"
                />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor="anlatim" className="sr-only">
          Ne fark ettiğinizi kendi cümlelerinizle yazın
        </label>
        <div className="hk-defter">
          <textarea
            id="anlatim"
            value={metin}
            onChange={(e) => setMetin(e.target.value)}
            rows={7}
            maxLength={3000}
            disabled={bekliyor}
            aria-describedby="anlatim-ipucu"
            placeholder="Örneğin: Annem 78 yaşında, yalnız yaşıyor. Son birkaç aydır aynı soruları sık soruyor, iki kez ocağı açık unuttu. Ben haftada iki gün yanına gidebiliyorum, kardeşim başka şehirde…"
            className="block w-full resize-y bg-transparent font-[family-name:var(--font-display)] text-[1.35rem] leading-[2.25rem] text-ink-900 placeholder:text-ink-500 focus:outline-none disabled:opacity-60"
          />
        </div>
        <p id="anlatim-ipucu" className="mt-3 text-base text-ink-600">
          Ne zamandan beri, ne sıklıkta, sizi en çok ne düşündürüyor? İsim, telefon
          ve kimlik numarası yazmayın.
        </p>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-base text-ink-700">
          <input
            type="checkbox"
            checked={onay}
            onChange={(e) => setOnay(e.target.checked)}
            className="mt-1 size-5 shrink-0 accent-teal-700"
          />
          <span>
            Yazdıklarımın, özet çıkarılması için Anthropic&apos;in Claude modeline
            gönderilmesini kabul ediyorum. Hipokampüs bu metni kaydetmez; sayfayı
            kapattığımda kaybolur.
          </span>
        </label>

        {hata && (
          <p
            role="alert"
            className="mt-5 border-l-4 border-ink-700 bg-paper-warm px-4 py-3 text-ink-900"
          >
            {hata}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <button
            type="button"
            disabled={!yeterli || !onay || bekliyor}
            onClick={gonder}
            className={PRIMARY_BTN}
          >
            {bekliyor ? "Okunuyor…" : "Özeti hazırlayın"}
          </button>
          <button type="button" onClick={() => setStage("gozlem")} className={TEXT_BTN}>
            Yazmak yerine listeden işaretleyeyim
          </button>
        </div>
        {bekliyor && (
          <p aria-live="polite" className="mt-4 text-base text-ink-600">
            Yazdıklarınız okunuyor ve uzman listesiyle karşılaştırılıyor. Bu
            genellikle yarım dakikadan kısa sürer.
          </p>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Listeden işaretleme — sunucuya hiçbir şey gitmez                     */

  if (stage === "gozlem") {
    return (
      <div>
        <h2 className="mb-2 text-3xl">Ne fark ettiniz?</h2>
        <p className="mb-6 max-w-2xl text-ink-700">
          Tanıdık geleni işaretleyin. Bu bir değerlendirme değil; hangi konuda kimin
          yardımcı olabileceğini bulmaya yarıyor. Bu yolda hiçbir şey sunucuya
          gönderilmez.
        </p>
        <fieldset>
          <legend className="sr-only">Fark ettikleriniz</legend>
          <ul className="divide-y divide-ink-200 border-y border-ink-200">
            {OBSERVATIONS.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-start gap-4 py-3.5 hover:bg-sky-50">
                  <input
                    type="checkbox"
                    checked={observed.includes(o.id)}
                    onChange={() =>
                      setObserved((prev) =>
                        prev.includes(o.id) ? prev.filter((x) => x !== o.id) : [...prev, o.id],
                      )
                    }
                    className="mt-1.5 size-5 shrink-0 accent-teal-700"
                  />
                  <span className="text-lg text-ink-900">{o.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <button
            type="button"
            disabled={observed.length === 0}
            onClick={() => {
              setSelected(areasFromObservations(observed, NEED_AREAS.map((a) => a.id)));
              setStage("sonuc");
            }}
            className={PRIMARY_BTN}
          >
            Başlıkları görün
          </button>
          {claudeAcik && (
            <button type="button" onClick={() => setStage("yaz")} className={TEXT_BTN}>
              Kendi cümlelerimle yazayım
            </button>
          )}
          <button type="button" onClick={() => setStage("konular")} className={TEXT_BTN}>
            Başlıkları doğrudan seçeyim
          </button>
        </div>
      </div>
    );
  }

  if (stage === "konular") {
    return (
      <div>
        <h2 className="mb-2 text-3xl">Hangi konularda destek arıyorsunuz?</h2>
        <p className="mb-6 max-w-2xl text-ink-700">Birden fazla seçebilirsiniz.</p>
        <fieldset>
          <legend className="sr-only">Destek aradığınız konular</legend>
          <ul className="divide-y divide-ink-200 border-y border-ink-200">
            {NEED_AREAS.map((area) => (
              <li key={area.id}>
                <label className="flex cursor-pointer items-start gap-4 py-4 hover:bg-sky-50">
                  <input
                    type="checkbox"
                    checked={selected.includes(area.id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(area.id)
                          ? prev.filter((x) => x !== area.id)
                          : [...prev, area.id],
                      )
                    }
                    className="mt-1.5 size-5 shrink-0 accent-teal-700"
                  />
                  <span>
                    <span className="block text-lg font-semibold text-ink-900">{area.label}</span>
                    <span className="block text-base text-ink-600">{area.hint}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => setStage("sonuc")}
            className={PRIMARY_BTN}
          >
            Başlıkları görün
          </button>
          <button type="button" onClick={() => setStage("gozlem")} className={TEXT_BTN}>
            Geri
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Liste yolunun sonucu                                                */

  const chosen = selected
    .map((id) => NEED_AREAS.find((a) => a.id === id))
    .filter((a): a is (typeof NEED_AREAS)[number] => Boolean(a));

  return (
    <div>
      <h2 className="mb-3 text-3xl">Bir uzmanla bu başlıklardan başlayabilirsiniz</h2>
      <p className="mb-8 max-w-2xl text-ink-700">
        {observed.length > 0
          ? "İşaretlediklerinizin en çok işaret ettiği başlıklar, en ilgiliden başlayarak. Bir değerlendirme ya da tanı değildir."
          : "Seçtiğiniz başlıklar. Hipokampüs bunlara puan ya da risk değeri vermez."}
      </p>
      <BaslikListesi
        basliklar={chosen.map((a) => ({ id: a.id, neden: a.hint }))}
      />
      <p className="mt-8 text-base text-ink-600">
        Bu yanıtlar hiçbir yere gönderilmedi; sayfayı yenilerseniz kaybolur.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <ButtonLink href={`/uzmanlar?konu=${chosen[0]?.id ?? ""}`} withArrow>
          Bu konudaki uzmanlar
        </ButtonLink>
        <button type="button" onClick={reset} className={TEXT_BTN}>
          Baştan başlayın
        </button>
      </div>
      <AcilNotu />
    </div>
  );
}

/* -------------------------------------------------------------------- */

function ClaudeSonucu({
  sonuc,
  onReset,
}: {
  sonuc: NetlestirmeSonucu;
  onReset: () => void;
}) {
  const router = useRouter();
  const [ozet, setOzet] = useState(sonuc.ozet);

  const basvur = (slug: string) => {
    const konu = sonuc.basliklar[0]
      ? NEED_AREAS.find((a) => a.id === sonuc.basliklar[0].id)?.label
      : undefined;
    try {
      sessionStorage.setItem(
        OZET_ANAHTARI,
        JSON.stringify({ slug, konu: konu ?? "", aciklama: ozet }),
      );
    } catch {}
    router.push(`/basvuru/${slug}`);
  };

  return (
    <div className="hk-pop">
      <section aria-labelledby="ozet-baslik">
        <h2 id="ozet-baslik" className="mb-2 text-3xl">
          Uzmanın okuyacağı özet
        </h2>
        <p className="mb-4 text-ink-700">
          Yazdıklarınızdan çıkarıldı. Eksik ya da yanlış bir yer varsa burada
          düzeltin; başvururken bu metin gider.
        </p>
        <div className="hk-defter">
          <textarea
            value={ozet}
            onChange={(e) => setOzet(e.target.value)}
            rows={5}
            aria-labelledby="ozet-baslik"
            className="block w-full resize-y bg-transparent font-[family-name:var(--font-display)] text-[1.3rem] leading-[2.25rem] text-ink-900 focus:outline-none"
          />
        </div>
      </section>

      {sonuc.sinirNotu && (
        <p className="mt-6 border-l-4 border-ink-700 bg-paper-warm px-4 py-3 text-ink-900">
          {sonuc.sinirNotu}
        </p>
      )}

      {sonuc.basliklar.length > 0 && (
        <section className="mt-12" aria-labelledby="baslik-baslik">
          <h2 id="baslik-baslik" className="mb-5 text-3xl">
            Konuşulacak başlıklar
          </h2>
          <BaslikListesi basliklar={sonuc.basliklar} />
        </section>
      )}

      {sonuc.sorular.length > 0 && (
        <section className="mt-12" aria-labelledby="soru-baslik">
          <h2 id="soru-baslik" className="mb-2 text-3xl">
            Görüşmeden önce düşünün
          </h2>
          <p className="mb-5 text-ink-700">
            Yanıtlarını bir kenara not ederseniz ilk görüşme daha verimli geçer.
          </p>
          <ol className="list-[decimal-leading-zero] space-y-3 pl-10 marker:font-[family-name:var(--font-display)] marker:text-teal-700">
            {sonuc.sorular.map((s) => (
              <li key={s} className="pl-2 text-lg text-ink-900">
                {s}
              </li>
            ))}
          </ol>
        </section>
      )}

      {sonuc.uzmanlar.length > 0 && (
        <section className="mt-12" aria-labelledby="uzman-baslik">
          <h2 id="uzman-baslik" className="mb-2 text-3xl">
            Bu konularda çalışan uzmanlar
          </h2>
          <p className="mb-6 text-ink-700">
            En fazla üç öneri. Sıralama günden güne değişir, seçim sizindir.
          </p>
          <ul className="divide-y divide-ink-200 border-y border-ink-200">
            {sonuc.uzmanlar.map((u) => (
              <li key={u.id} className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="text-xl text-ink-900">
                    <Link
                      href={`/uzmanlar/${u.slug}`}
                      className="font-[family-name:var(--font-display)] text-2xl hover:text-teal-700"
                    >
                      {u.ad}
                    </Link>
                  </p>
                  <p className="mb-3 text-base text-ink-600">
                    {u.alan} · {u.sehir} · {u.musaitlik}
                  </p>
                  <p className="max-w-xl text-ink-800">
                    <span className="font-semibold text-ink-900">Neden bu kişi? </span>
                    {u.neden}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => basvur(u.slug)}
                  className="inline-flex min-h-[3rem] items-center justify-center rounded-[10px] border-2 border-teal-700 px-5 text-lg font-semibold text-teal-800 hover:bg-teal-50"
                >
                  Bu özetle başvurun
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 print:hidden">
        <button type="button" onClick={() => window.print()} className={TEXT_BTN}>
          Bu sayfayı yazdırın
        </button>
        <button type="button" onClick={onReset} className={TEXT_BTN}>
          Baştan yazın
        </button>
      </div>

      <p className="mt-10 border-t border-ink-200 pt-5 text-base text-ink-600">
        Bu sayfa, yazdıklarınızdan Claude (Anthropic) ile hazırlandı. Bir
        değerlendirme ya da tanı değildir; puan veya risk değeri içermez.
        Metniniz Hipokampüs&apos;te kaydedilmedi.
      </p>
      <AcilNotu />
    </div>
  );
}

function BaslikListesi({
  basliklar,
}: {
  basliklar: { id: string; neden: string }[];
}) {
  return (
    <ol className="space-y-6">
      {basliklar.map((b) => {
        const area = NEED_AREAS.find((a) => a.id === b.id);
        if (!area) return null;
        return (
          <li key={b.id} className="grid grid-cols-[2.5rem_1fr] gap-4">
            <span
              aria-hidden
              className="mt-1 flex size-10 items-center justify-center rounded-full bg-sky-100 text-teal-700"
            >
              <NeedIcon area={area.id} className="size-5" />
            </span>
            <span>
              <span className="block text-xl text-ink-900">{area.label}</span>
              <span className="mt-1 block text-ink-700">{b.neden}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function AcilNotu() {
  return (
    <p className="mt-6 text-base text-ink-600">
      Durum acil hâle gelirse <strong className="text-ink-900">112&apos;yi arayın.</strong>{" "}
      Hipokampüs acil müdahale sunmaz.
    </p>
  );
}

"use client";

import { useState } from "react";
import { NEED_AREAS } from "@/data/needs";
import { areasFromObservations, OBSERVATIONS } from "@/data/observations";
import { ButtonLink, Card, Notice } from "./ui";

/**
 * İHTİYAÇ FORMU — DEMO
 *
 * Kilitli kararlar bu bileşende doğrudan uygulanır:
 *  - Sunucuya hiçbir yanıt yazılmaz. Bu dosyada tek bir fetch/XHR yoktur,
 *    localStorage dahil hiçbir kalıcı depolama kullanılmaz. Sayfa
 *    yenilendiğinde her şey kaybolur; bu bir eksiklik değil, karardır.
 *  - Puan, skor, yüzde veya risk değeri ÜRETİLMEZ. Sonuç yalnızca
 *    ihtiyaç başlıklarını, alaka sırasına göre gösterir.
 *  - Hiçbir klinik ölçek (MMSE, MoCA, Mini-Cog, GDS vb.) kullanılmaz.
 *    Sorular kişinin durumunu ölçmez; ailenin ne gördüğünü sorar.
 *
 * AKIŞ DEĞİŞİKLİĞİ (2026-08-06): formun başındaki açık güvenlik sorusu
 * SAHİBİNİN KARARIYLA KALDIRILDI — gerekçesi: "acil hastanın bizde ne
 * işi var, misyonumuz bu değil, nasıl müdahale edebiliriz." Yerine
 * gözlem tabanlı yönlendirme geldi: aile "hangi başlıkta destek
 * arıyorum" sorusunu zor yanıtlıyor ama "ne fark ettim" sorusunu kolay
 * yanıtlıyor; başlıkları biz çıkarıyoruz (bkz. data/observations.ts).
 */

type Recipient = { id: string; label: string };

const RECIPIENTS: Recipient[] = [
  { id: "anne-baba", label: "Annem veya babam için" },
  { id: "es", label: "Eşim için" },
  { id: "yakin", label: "Bir yakınım için" },
  { id: "kendim", label: "Kendim için" },
];

type Stage = "kim" | "gozlem" | "konular" | "sonuc";

const OPTION_CARD =
  "flex cursor-pointer items-center gap-4 rounded-xl border-2 px-5 shadow-[var(--shadow-soft)]";
const OPTION_CARD_STATE = (active: boolean) =>
  active
    ? "border-teal-700 bg-teal-50 shadow-[var(--shadow-card)]"
    : "border-ink-200 bg-white hover:-translate-y-px hover:border-teal-300 hover:shadow-[var(--shadow-card)]";

const PRIMARY_BTN =
  "min-h-[3.25rem] rounded-xl bg-teal-700 px-7 text-lg font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)] active:scale-[0.97] disabled:pointer-events-none disabled:translate-y-0 disabled:bg-ink-300 disabled:shadow-none";
const GHOST_BTN =
  "min-h-[3.25rem] rounded-xl px-4 text-lg text-teal-800 underline underline-offset-4 hover:text-teal-600";

export function NeedsForm() {
  const [stage, setStage] = useState<Stage>("kim");
  const [recipient, setRecipient] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [observed, setObserved] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleObserved = (id: string) =>
    setObserved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const reset = () => {
    setSelected([]);
    setObserved([]);
    setRecipient(null);
    setStage("kim");
  };

  /* ------------------------------------------------------------------ */
  /* Adım 1 — kimin için                                                 */

  if (stage === "kim") {
    return (
      <Shell key="kim" step={1} total={2} title="Kimin için buradasınız?">
        <fieldset>
          <legend className="sr-only">Kimin için destek arıyorsunuz?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {RECIPIENTS.map((r) => (
              <label
                key={r.id}
                className={`min-h-[3.5rem] ${OPTION_CARD} ${OPTION_CARD_STATE(recipient === r.id)}`}
              >
                <input
                  type="radio"
                  name="recipient"
                  value={r.id}
                  checked={recipient === r.id}
                  onChange={() => setRecipient(r.id)}
                  className="size-5 accent-teal-700"
                />
                <span className="text-lg">{r.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            disabled={!recipient}
            onClick={() => setStage("gozlem")}
            className={PRIMARY_BTN}
          >
            Devam edin
          </button>
        </div>
      </Shell>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Adım 2 — ne fark ettiniz? (yönlendirmenin asıl kaynağı)              */

  if (stage === "gozlem") {
    return (
      <Shell
        key="gozlem"
        step={2}
        total={2}
        title="Ne fark ettiniz?"
        description="Size tanıdık geleni işaretleyin. Doğru ya da yanlış cevap yok; bunlar bir değerlendirme değil, hangi konuda kimin yardımcı olabileceğini bulmamıza yarıyor."
      >
        <fieldset>
          <legend className="sr-only">Fark ettikleriniz</legend>
          <div className="grid gap-3">
            {OBSERVATIONS.map((o) => {
              const active = observed.includes(o.id);
              return (
                <label
                  key={o.id}
                  className={`items-start py-4 ${OPTION_CARD} ${OPTION_CARD_STATE(active)}`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleObserved(o.id)}
                    className="mt-1 size-5 shrink-0 accent-teal-700"
                  />
                  <span className="text-lg text-ink-900">{o.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={observed.length === 0}
            onClick={() => {
              setSelected(
                areasFromObservations(
                  observed,
                  NEED_AREAS.map((a) => a.id),
                ),
              );
              setStage("sonuc");
            }}
            className={PRIMARY_BTN}
          >
            Sonucu görün
          </button>
          <button
            type="button"
            onClick={() => setStage("kim")}
            className={GHOST_BTN}
          >
            Geri
          </button>
        </div>

        {/* Ne göreceğini zaten bilen kullanıcıyı gözlem listesine mahkûm
            etmiyoruz — başlıkları doğrudan seçebilir. */}
        <button
          type="button"
          onClick={() => setStage("konular")}
          className="mt-4 block text-base text-teal-800 underline underline-offset-4"
        >
          Başlıkları kendim seçmek istiyorum
        </button>
      </Shell>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Adım 3 — konular                                                    */

  if (stage === "konular") {
    return (
      <Shell
        key="konular"
        step={2}
        total={2}
        title="Hangi konularda destek arıyorsunuz?"
        description="Birden fazla seçebilirsiniz. Doğru ya da yanlış cevap yok; bu yalnızca konuşmak istediğiniz konuları görünür kılmak için."
      >
        <fieldset>
          <legend className="sr-only">Destek aradığınız konular</legend>
          <div className="grid gap-3">
            {NEED_AREAS.map((area) => {
              const active = selected.includes(area.id);
              return (
                <label
                  key={area.id}
                  className={`items-start p-5 ${OPTION_CARD} ${OPTION_CARD_STATE(active)}`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggle(area.id)}
                    className="mt-1.5 size-5 shrink-0 accent-teal-700"
                  />
                  <span>
                    <span className="block text-lg font-semibold text-ink-900">
                      {area.label}
                    </span>
                    <span className="block text-base text-ink-600">
                      {area.hint}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => setStage("sonuc")}
            className={PRIMARY_BTN}
          >
            Başlıkları görün
          </button>
          <button
            type="button"
            onClick={() => setStage("gozlem")}
            className={GHOST_BTN}
          >
            Geri
          </button>
        </div>
      </Shell>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Sonuç — puan yok, yalnızca başlıklar                                */

  /* Gözlemden gelen sıra ANLAMLIDIR (en ilgili başlık başta) — bu yüzden
     NEED_AREAS sırasına göre değil, `selected` sırasına göre diziyoruz. */
  const chosen = selected
    .map((id) => NEED_AREAS.find((a) => a.id === id))
    .filter((a): a is (typeof NEED_AREAS)[number] => Boolean(a));

  return (
    <div className="hk-pop">
      <p className="mb-3 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
        İhtiyaç başlıklarınız
      </p>
      <h2 className="mb-4 text-3xl sm:text-4xl">
        Bir uzmanla konuşurken bu başlıklardan başlayabilirsiniz
      </h2>
      <p className="mb-10 max-w-2xl text-ink-700">
        {observed.length > 0
          ? "Bunlar, işaretlediklerinizin en çok işaret ettiği başlıklar — en ilgiliden başlayarak sıralandı. Bir değerlendirme veya tanı değildir; puan, yüzde ya da risk değeri üretilmez."
          : "Aşağıdakiler sizin seçtiğiniz başlıklardır. Hipokampüs bunlara bir puan, yüzde veya risk değeri vermez; bir değerlendirme sonucu üretmez."}
      </p>

      <ol className="mb-10 space-y-4">
        {chosen.map((area, i) => (
          <li key={area.id}>
            <Card className="flex gap-5 p-6">
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-600 to-teal-800 font-[family-name:var(--font-display)] text-white shadow-[var(--shadow-soft)]"
              >
                {i + 1}
              </span>
              <span>
                <span className="block text-xl text-ink-900">
                  {area.label}
                </span>
                <span className="block text-base text-ink-600">
                  {area.hint}
                </span>
              </span>
            </Card>
          </li>
        ))}
      </ol>

      <Notice title="Bu yanıtlar kaydedilmedi">
        <p>
          Doldurduğunuz hiçbir bilgi sunucuya gönderilmedi ve cihazınıza da
          kaydedilmedi. Sayfayı yenilerseniz bu başlıklar kaybolur. Saklamak
          isterseniz ekran görüntüsü alabilir veya sayfayı yazdırabilirsiniz.
        </p>
      </Notice>

      <div className="mt-10 rounded-2xl border-2 border-teal-300 bg-teal-50 p-7">
        <h3 className="mb-3 text-xl">Sırada ne var?</h3>
        <p className="mb-6 text-ink-800">
          <strong>{chosen[0].label}</strong> başlığında çalışan uzmanları
          görebilir, birini seçip doğrudan başvurabilirsiniz. Başvuru için bir
          hesap açmanız gerekir; birkaç bilgi yeterli.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <ButtonLink href={`/uzmanlar?konu=${chosen[0].id}`} withArrow>
            Bu konudaki uzmanlar
          </ButtonLink>
          <button type="button" onClick={reset} className={GHOST_BTN}>
            Baştan doldurun
          </button>
        </div>
      </div>

      <p className="mt-10 text-base text-ink-600">
        Durum acil hâle gelirse{" "}
        <strong className="text-ink-900">112&apos;yi arayın.</strong>{" "}
        Hipokampüs acil müdahale sunmaz.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------- */

function Shell({
  step,
  total,
  title,
  description,
  children,
}: {
  step: number;
  total: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="hk-pop">
      <div className="mb-8">
        <p className="mb-3 text-base text-ink-600">
          Adım {step} / {total}
        </p>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Form ilerlemesi"
        >
          <div
            className="h-full rounded-full bg-linear-to-r from-teal-500 to-teal-700 transition-[width] duration-500"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="mb-3 text-3xl sm:text-4xl">{title}</h2>
      {description && (
        <p className="mb-8 max-w-2xl text-ink-700">{description}</p>
      )}
      {!description && <div className="mb-8" />}
      {children}
    </div>
  );
}

"use client";

import { useState } from "react";
import { NEED_AREAS } from "@/data/needs";
import { ButtonLink, Card, Notice } from "./ui";

/**
 * İHTİYAÇ FORMU — DEMO
 *
 * Kilitli kararlar bu bileşende doğrudan uygulanır:
 *  - Sunucuya hiçbir yanıt yazılmaz. Bu dosyada tek bir fetch/XHR yoktur,
 *    localStorage dahil hiçbir kalıcı depolama kullanılmaz. Sayfa
 *    yenilendiğinde her şey kaybolur; bu bir eksiklik değil, karardır.
 *  - Puan, skor, yüzde veya risk değeri ÜRETİLMEZ. Sonuç yalnızca
 *    kullanıcının kendi seçtiği ihtiyaç başlıklarını geri gösterir.
 *  - Hiçbir klinik ölçek (MMSE, MoCA, Mini-Cog, GDS vb.) kullanılmaz.
 *    Sorular kişinin durumunu ölçmez; ailenin ne konuşmak istediğini sorar.
 *  - Formun başında tek bir açık güvenlik sorusu vardır. "Evet" yanıtında
 *    acil yönlendirme gösterilir ve form DURUR — devam yolu yoktur.
 *  - Otomatik acil durum tespiti (NLP) yoktur; yalnızca bu açık soru vardır.
 */

type Recipient = { id: string; label: string };

const RECIPIENTS: Recipient[] = [
  { id: "anne-baba", label: "Annem veya babam için" },
  { id: "es", label: "Eşim için" },
  { id: "yakin", label: "Bir yakınım için" },
  { id: "kendim", label: "Kendim için" },
];

type Stage = "guvenlik" | "acil" | "kim" | "konular" | "sonuc";

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
  const [stage, setStage] = useState<Stage>("guvenlik");
  const [recipient, setRecipient] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const reset = () => {
    setSelected([]);
    setRecipient(null);
    setStage("guvenlik");
  };

  /* ------------------------------------------------------------------ */
  /* Adım 1 — tek açık güvenlik sorusu                                   */

  if (stage === "guvenlik") {
    return (
      <Shell key="guvenlik" step={1} total={3} title="Önce tek bir soru">
        <fieldset>
          <legend className="mb-6 text-2xl text-ink-900">
            Şu anda kişinin veya bir başkasının güvenliğiyle ilgili acil bir
            tehlike var mı?
          </legend>
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => setStage("acil")}
              className="min-h-[3.5rem] flex-1 rounded-xl border-2 border-danger-600 bg-danger-50 px-6 text-lg font-semibold text-ink-900 shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-danger-100 active:scale-[0.98]"
            >
              Evet, var
            </button>
            <button
              type="button"
              onClick={() => setStage("kim")}
              className="min-h-[3.5rem] flex-1 rounded-xl border-2 border-teal-700 bg-white px-6 text-lg font-semibold text-teal-800 shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-50 active:scale-[0.98]"
            >
              Hayır, yok
            </button>
          </div>
        </fieldset>
      </Shell>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Acil yönlendirme — form burada DURUR                                */

  if (stage === "acil") {
    return (
      <div className="hk-pop rounded-2xl border-2 border-danger-600 bg-danger-50 p-8 sm:p-10">
        <span
          aria-hidden
          className="mb-5 flex size-14 items-center justify-center rounded-full bg-danger-600 text-white"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 3 2 24h24L14 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M14 11v6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="14" cy="20.2" r="1.4" fill="currentColor" />
          </svg>
        </span>
        <h2 className="mb-4 text-3xl text-ink-900">Lütfen 112&apos;yi arayın.</h2>
        <p className="mb-4 text-lg text-ink-800">
          Acil bir tehlike varsa doğru adres Hipokampüs değildir. Hipokampüs
          acil müdahale sunmaz ve 7/24 izleme yapmaz.
        </p>
        <ul className="mb-8 space-y-2 text-lg text-ink-800">
          <li>
            <strong>112</strong> — Acil Çağrı Merkezi
          </li>
          <li>
            <strong>183</strong> — Sosyal Destek Hattı
          </li>
        </ul>
        <p className="mb-8 text-ink-700">
          Tehlike geçtiğinde bu formu yeniden doldurabilirsiniz. Şimdilik burada
          duruyoruz.
        </p>
        <button
          type="button"
          onClick={reset}
          className="min-h-[3.25rem] rounded-xl border-2 border-ink-300 bg-white px-7 text-lg font-semibold text-ink-800 hover:-translate-y-px hover:bg-white/70 active:scale-[0.97]"
        >
          Başa dön
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Adım 2 — kimin için                                                 */

  if (stage === "kim") {
    return (
      <Shell key="kim" step={2} total={3} title="Kimin için buradasınız?">
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
            onClick={() => setStage("konular")}
            className={PRIMARY_BTN}
          >
            Devam edin
          </button>
          <button
            type="button"
            onClick={() => setStage("guvenlik")}
            className={GHOST_BTN}
          >
            Geri
          </button>
        </div>
      </Shell>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Adım 3 — konular                                                    */

  if (stage === "konular") {
    return (
      <Shell
        key="konular"
        step={3}
        total={3}
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
            onClick={() => setStage("kim")}
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

  const chosen = NEED_AREAS.filter((a) => selected.includes(a.id));

  return (
    <div className="hk-pop">
      <p className="mb-3 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
        İhtiyaç başlıklarınız
      </p>
      <h2 className="mb-4 text-3xl sm:text-4xl">
        Bir uzmanla konuşurken bu başlıklardan başlayabilirsiniz
      </h2>
      <p className="mb-10 max-w-2xl text-ink-700">
        Aşağıdakiler sizin seçtiğiniz başlıklardır. Hipokampüs bunlara bir puan,
        yüzde veya risk değeri vermez; bir değerlendirme sonucu üretmez.
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

      <div className="mt-10 rounded-2xl border border-ink-200 bg-paper-warm p-7">
        <h3 className="mb-3 text-xl">Sırada ne var?</h3>
        <p className="mb-6 text-ink-700">
          İlk başlığınızda çalışan uzmanlara bakabilirsiniz. Görüşme başlatma
          henüz açık değildir; Hipokampüs geliştirme aşamasındadır.
        </p>
        <div className="flex flex-wrap gap-4">
          <ButtonLink href={`/uzmanlar?konu=${chosen[0].id}`} withArrow>
            Bu konuda çalışan uzmanlar
          </ButtonLink>
          <button type="button" onClick={reset} className={GHOST_BTN}>
            Formu baştan doldurun
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

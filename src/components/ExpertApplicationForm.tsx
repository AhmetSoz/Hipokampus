"use client";

import { useState } from "react";
import { Notice } from "./ui";

/**
 * UZMAN ÖN BAŞVURUSU — arayüz hazır, TOPLAMA KAPALI.
 *
 * Başvuru gönderimi bilerek bağlanmamıştır. Yasal metinler hazır olmadan
 * kişisel veri toplanmayacaktır (KAPI 1 şartı). Bu yüzden burada da hiçbir
 * fetch/XHR yoktur ve girilen bilgiler hiçbir yere gönderilmez.
 *
 * TODO (KAPI 1 açıldığında): yasal metinler ve aydınlatma yayımlandıktan
 * sonra gönderim uçlarını bağla, açık rıza alanını ekle.
 */

const FIELD =
  "min-h-[3.25rem] w-full rounded-xl border-2 border-ink-200 bg-white px-4 text-lg text-ink-900 focus:border-teal-600";

export function ExpertApplicationForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="hk-pop rounded-2xl border-2 border-teal-300 bg-teal-50 p-8 sm:p-10">
        <h2 className="mb-4 text-3xl">Başvuru toplama henüz açılmadı</h2>
        <p className="mb-4 text-lg text-ink-800">
          Girdiğiniz bilgiler <strong>hiçbir yere gönderilmedi</strong> ve
          kaydedilmedi. Yasal metinlerimiz tamamlanmadan kişisel veri
          toplamıyoruz.
        </p>
        <p className="mb-8 text-ink-700">
          Bu form, sürecin nasıl işleyeceğini şimdiden görebilmeniz için
          yayımlandı. Başvurular açıldığında bu sayfadan duyurulacaktır.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="min-h-[3.25rem] rounded-xl border-2 border-teal-700 bg-white px-7 text-lg font-semibold text-teal-800 hover:-translate-y-px hover:bg-white/70 active:scale-[0.97]"
        >
          Forma dönün
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-7"
    >
      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Ad ve soyad" htmlFor="ad">
          <input
            id="ad"
            name="ad"
            type="text"
            autoComplete="name"
            required
            className={FIELD}
          />
        </Field>

        <Field label="E-posta adresi" htmlFor="eposta">
          <input
            id="eposta"
            name="eposta"
            type="email"
            autoComplete="email"
            required
            className={FIELD}
          />
        </Field>

        <Field label="Uzmanlık alanı" htmlFor="alan">
          <input
            id="alan"
            name="alan"
            type="text"
            required
            placeholder="Örn. gerontoloji"
            className={FIELD}
          />
        </Field>

        <Field label="Şehir" htmlFor="sehir">
          <input
            id="sehir"
            name="sehir"
            type="text"
            autoComplete="address-level2"
            className={FIELD}
          />
        </Field>

        <Field label="Telefon" htmlFor="telefon" optional>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            autoComplete="tel"
            className={FIELD}
          />
        </Field>
      </div>

      <Field
        label="Neyin üzerine çalışıyorsunuz?"
        htmlFor="uzmanlik"
        hint="Profilinizde gösterilecek asıl bilgi budur. Her satıra bir konu yazın — örneğin “günlük yaşam düzeni”, “yakının tükenmişliği”."
      >
        <textarea
          id="uzmanlik"
          name="uzmanlik"
          rows={4}
          required
          className={`${FIELD} py-3 leading-relaxed`}
        />
      </Field>

      <Field
        label="Kısaca kendinizden söz eder misiniz?"
        htmlFor="hakkinda"
        optional
        hint="Danışanlar bu metni profilinizde okuyacak."
      >
        <textarea
          id="hakkinda"
          name="hakkinda"
          rows={5}
          className={`${FIELD} py-3 leading-relaxed`}
        />
      </Field>

      <Notice title="Bu formu göndermek ne anlama gelir?">
        <p>
          Şu anda başvuru toplama <strong>kapalıdır</strong>. Gönder
          düğmesine bastığınızda bilgileriniz hiçbir sunucuya iletilmez. Yasal
          metinler tamamlandığında başvurular açılacak ve bu sayfa
          güncellenecektir.
        </p>
      </Notice>

      <button
        type="submit"
        className="min-h-[3.5rem] w-full rounded-xl bg-teal-700 px-7 text-lg font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)] active:scale-[0.97] sm:w-auto"
      >
        Ön başvuruyu gönderin
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-lg font-semibold text-ink-900"
      >
        {label}
        {optional && (
          <span className="ml-2 text-base font-normal text-ink-500">
            (isteğe bağlı)
          </span>
        )}
      </label>
      {hint && <p className="mb-2 text-base text-ink-600">{hint}</p>}
      {children}
    </div>
  );
}

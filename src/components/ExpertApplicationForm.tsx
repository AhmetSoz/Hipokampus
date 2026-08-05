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
  "min-h-[3.25rem] w-full rounded-lg border-2 border-ink-200 bg-white px-4 text-lg text-ink-900 transition-colors focus:border-teal-600";

export function ExpertApplicationForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-xl border-2 border-teal-300 bg-teal-50 p-8 sm:p-10">
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
          className="min-h-[3.25rem] rounded-lg border-2 border-teal-700 bg-white px-7 text-lg font-semibold text-teal-800 transition-colors hover:bg-white/60"
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
          <input id="ad" name="ad" type="text" required className={FIELD} />
        </Field>

        <Field label="E-posta adresi" htmlFor="eposta">
          <input
            id="eposta"
            name="eposta"
            type="email"
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

        <Field label="Alanınızdaki deneyim yılı" htmlFor="deneyim">
          <input
            id="deneyim"
            name="deneyim"
            type="number"
            min={0}
            max={70}
            required
            className={FIELD}
          />
        </Field>

        <Field label="Şehir" htmlFor="sehir">
          <input id="sehir" name="sehir" type="text" className={FIELD} />
        </Field>

        <Field label="Telefon" htmlFor="telefon" optional>
          <input id="telefon" name="telefon" type="tel" className={FIELD} />
        </Field>
      </div>

      <Field
        label="Kısaca kendinizden söz eder misiniz?"
        htmlFor="hakkinda"
        optional
        hint="Hangi konularda çalıştığınız ve kimlerle görüştüğünüz bize yardımcı olur."
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
        className="min-h-[3.5rem] w-full rounded-lg bg-teal-700 px-7 text-lg font-semibold text-white transition-colors hover:bg-teal-800 sm:w-auto"
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

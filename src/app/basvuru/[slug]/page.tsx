import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { applyToExpert } from "@/app/actions/care";
import { BrandPath } from "@/components/BrandPath";
import { Container, Notice } from "@/components/ui";
import { getExpert, RESPONSE_COMMITMENT } from "@/data/experts";
import { getCurrentUser } from "@/data/session";

export const metadata: Metadata = { title: "Başvuru" };

export default async function BasvuruSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const expert = await getExpert(slug);
  if (!expert) notFound();

  /* Başvuru bir hane kaydı gerektirir; giriş yapmamış ziyaretçi önce
     hesap açmalı. Demo çerezi burada yeterli sayılmaz — başvuru gerçek
     veri yazar. */
  const user = await getCurrentUser();
  if (!user || user.role !== "danisan") {
    redirect(`/giris?donus=/basvuru/${slug}`);
  }

  const hata = sp.hata === "eksik" ? "Konu ve açıklama gerekli." : undefined;

  return (
    <div className="bg-paper">
      <div className="relative isolate overflow-hidden bg-sky-50 py-14 sm:py-16">
        <BrandPath className="absolute inset-0 h-full w-full opacity-70" />
        <Container className="relative">
          <p className="hk-enter mb-4 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
            Başvuru
          </p>
          <h1
            className="hk-enter mb-4 text-4xl sm:text-5xl"
            style={{ animationDelay: "60ms" }}
          >
            {expert.name} ile başlayın
          </h1>
          <p
            className="hk-enter max-w-2xl text-xl text-ink-700"
            style={{ animationDelay: "120ms" }}
          >
            {expert.field} · {expert.city}
          </p>
        </Container>
      </div>

      <Container className="py-10 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <form
            action={applyToExpert}
            className="hk-enter rounded-2xl border border-ink-200 bg-white p-8 shadow-[var(--shadow-card)]"
          >
            <input type="hidden" name="uzman" value={expert.id} />
            <input type="hidden" name="slug" value={expert.slug} />

            {hata && (
              <p className="mb-5 rounded-xl border-2 border-danger-300 bg-danger-50 px-4 py-3 font-semibold text-danger-700">
                {hata}
              </p>
            )}

            <label
              htmlFor="konu"
              className="mb-2 block font-semibold text-ink-900"
            >
              Konu
            </label>
            <input
              id="konu"
              name="konu"
              type="text"
              placeholder="Örn. Günlük düzeni yeniden kurmak"
              required
              className="mb-5 min-h-[3.25rem] w-full rounded-xl border-2 border-ink-200 bg-white px-4 text-lg text-ink-900 focus:border-teal-600"
            />

            <label
              htmlFor="aciklama"
              className="mb-2 block font-semibold text-ink-900"
            >
              Durumunuzu kısaca anlatın
            </label>
            <textarea
              id="aciklama"
              name="aciklama"
              rows={6}
              required
              placeholder="Neyle zorlanıyorsunuz, nereden başlamak istiyorsunuz?"
              className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-lg leading-relaxed text-ink-900 focus:border-teal-600"
            />
            <p className="mt-2 mb-6 text-base text-ink-600">
              Acil bir durum için buraya yazmayın — 112&apos;yi arayın.
            </p>

            <button
              type="submit"
              className="min-h-[3.5rem] w-full rounded-xl bg-teal-700 px-7 text-lg font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)] active:scale-[0.98]"
            >
              Başvurunuzu gönderin
            </button>
          </form>

          <div className="mt-8 space-y-4">
            <Notice tone="teal" title="Sonra ne olacak?">
              <p>
                Başvurunuz {expert.name} adlı uzmana iletilir ve{" "}
                <strong>{RESPONSE_COMMITMENT.toLocaleLowerCase("tr")}</strong>{" "}
                yanıt alırsınız. Bu sırada panelinizde bir{" "}
                <strong>ön değerlendirme formu</strong> açılır; onu
                doldurduğunuzda uzman sizi daha iyi tanıyarak başlar.
              </p>
            </Notice>
            <p className="text-center">
              <Link
                href={`/uzmanlar/${expert.slug}`}
                className="text-teal-800 underline underline-offset-4"
              >
                Önce profili tekrar inceleyeyim
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

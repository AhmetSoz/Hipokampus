import type { Metadata } from "next";
import Link from "next/link";
import { registerUzman } from "@/app/actions/auth";
import { BrandPath } from "@/components/BrandPath";
import { Container, Notice } from "@/components/ui";

export const metadata: Metadata = {
  title: "Uzman kaydı",
  description: "Hipokampüs uzman hesabı oluşturun.",
};

const HATA: Record<string, string> = {
  eksik: "Zorunlu alanları doldurun.",
  kisa: "Parola en az 8 karakter olmalı.",
  kayitli: "Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.",
};

const INPUT =
  "min-h-[3.25rem] w-full rounded-xl border-2 border-ink-200 bg-white px-4 text-lg text-ink-900 focus:border-teal-600";

export default async function UzmanKayitSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const hata = typeof sp.hata === "string" ? HATA[sp.hata] : undefined;

  return (
    <div className="bg-paper">
      <div className="relative isolate overflow-hidden bg-sky-50 py-16 sm:pt-20 sm:pb-12">
        <BrandPath className="absolute inset-0 h-full w-full opacity-70" />
        <Container className="relative">
          <p className="hk-enter mb-4 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
            Uzman kaydı
          </p>
          <h1
            className="hk-enter mb-4 text-4xl sm:text-5xl"
            style={{ animationDelay: "60ms" }}
          >
            Uzman hesabı açın
          </h1>
          <p
            className="hk-enter max-w-2xl text-xl text-ink-700"
            style={{ animationDelay: "120ms" }}
          >
            Profiliniz uzman listesinde görünür; danışanlar size başvurabilir.
          </p>
        </Container>
      </div>

      <Container className="py-10 sm:py-12">
        <div className="mx-auto max-w-lg">
          <form
            action={registerUzman}
            className="hk-enter rounded-2xl border border-ink-200 bg-white p-8 shadow-[var(--shadow-card)]"
          >
            {hata && (
              <p className="mb-5 rounded-xl border-2 border-danger-300 bg-danger-50 px-4 py-3 font-semibold text-danger-700">
                {hata}
              </p>
            )}

            <label htmlFor="ad" className="mb-2 block font-semibold text-ink-900">
              Ad soyad
            </label>
            <input id="ad" name="ad" type="text" required className={`${INPUT} mb-5`} />

            <div className="mb-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="alan"
                  className="mb-2 block font-semibold text-ink-900"
                >
                  Alan
                </label>
                <input
                  id="alan"
                  name="alan"
                  type="text"
                  placeholder="Gerontoloji"
                  required
                  className={INPUT}
                />
              </div>
              <div>
                <label
                  htmlFor="sehir"
                  className="mb-2 block font-semibold text-ink-900"
                >
                  Şehir
                </label>
                <input id="sehir" name="sehir" type="text" required className={INPUT} />
              </div>
            </div>

            <label
              htmlFor="uzmanliklar"
              className="mb-2 block font-semibold text-ink-900"
            >
              Çalıştığınız konular
            </label>
            <input
              id="uzmanliklar"
              name="uzmanliklar"
              type="text"
              placeholder="Günlük yaşam düzeni, ilaç takibi, düşme riski"
              className={INPUT}
            />
            <p className="mt-2 mb-5 text-base text-ink-600">
              Virgülle ayırın. Profilinizde bu başlıklar görünür.
            </p>

            <label
              htmlFor="hakkinda"
              className="mb-2 block font-semibold text-ink-900"
            >
              Kısa tanıtım
            </label>
            <textarea
              id="hakkinda"
              name="hakkinda"
              rows={3}
              className="mb-5 w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-lg text-ink-900 focus:border-teal-600"
            />

            <label
              htmlFor="eposta"
              className="mb-2 block font-semibold text-ink-900"
            >
              E-posta
            </label>
            <input
              id="eposta"
              name="eposta"
              type="email"
              autoComplete="email"
              required
              className={`${INPUT} mb-5`}
            />

            <label
              htmlFor="parola"
              className="mb-2 block font-semibold text-ink-900"
            >
              Parola
            </label>
            <input
              id="parola"
              name="parola"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className={INPUT}
            />
            <p className="mt-2 mb-6 text-base text-ink-600">En az 8 karakter.</p>

            <button
              type="submit"
              className="min-h-[3.5rem] w-full rounded-xl bg-teal-700 px-7 text-lg font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)] active:scale-[0.98]"
            >
              Uzman hesabı oluşturun
            </button>
          </form>

          <p className="hk-enter mt-6 text-center text-ink-700">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/giris"
              className="font-semibold text-teal-800 underline underline-offset-4"
            >
              Giriş yapın
            </Link>
          </p>

          <div className="mt-10">
            <Notice title="Doğrulama süreci ayrıdır">
              <p>
                Bu prototipte kayıt olan uzman listede hemen görünür. Gerçek
                işletmede{" "}
                <Link
                  href="/dogrulama"
                  className="font-semibold text-teal-800 underline underline-offset-4"
                >
                  doğrulama süreci
                </Link>{" "}
                tamamlanmadan profil yayına alınmayacaktır.
              </p>
            </Notice>
          </div>
        </div>
      </Container>
    </div>
  );
}

import Link from "next/link";
import { Logo } from "./Logo";

/**
 * Altbilgi metinleri karar kaydına bağlıdır. Aşağıdaki ifadeler
 * GERİ ALINMIŞTIR ve buraya yazılamaz:
 *   - "Verileriniz kimseyle paylaşılmaz"
 *   - "Tüm veriler Türkiye'de saklanır"
 *   - "Bilimsel Danışma Kurulu denetiminde"
 *   - "Başvuranların %20'sini alıyoruz"
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-ink-200 bg-paper-warm">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="h-16 sm:h-20" />
            <p className="mt-6 max-w-sm text-ink-700">
              Bakım sürecini birlikte planlamak için kurulan dijital koordinasyon
              platformu. Uzman ve akademisyenlerin katkısıyla geliştiriliyor.
            </p>
          </div>

          <nav aria-label="Site haritası">
            <h2 className="mb-4 text-lg text-ink-900">Sayfalar</h2>
            <ul className="space-y-3 text-ink-700">
              <li>
                <Link href="/nasil-calisir" className="hover:text-teal-700">
                  Nasıl çalışır
                </Link>
              </li>
              <li>
                <Link href="/uzmanlar" className="hover:text-teal-700">
                  Uzmanlar
                </Link>
              </li>
              <li>
                <Link href="/dogrulama" className="hover:text-teal-700">
                  Uzman doğrulama
                </Link>
              </li>
              <li>
                <Link href="/ihtiyac-formu" className="hover:text-teal-700">
                  İhtiyaç formu
                </Link>
              </li>
              <li>
                <Link href="/giris" className="hover:text-teal-700">
                  Demo paneli
                </Link>
              </li>
              <li>
                <Link href="/uzman" className="hover:text-teal-700">
                  Uzmanlar için
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 text-lg text-ink-900">Bilgileriniz</h2>
            <p className="text-ink-700">
              Bilgileriniz yalnızca hizmetin sunulması için gerekli kişilerle,
              sizin yetkinizle paylaşılır.
            </p>
            <p className="mt-4 text-ink-600">
              Yasal metinler hazırlanma aşamasındadır.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-sand-300 bg-sand-100 p-6 sm:p-7">
          <p className="font-semibold text-ink-900">
            Hipokampüs bir sağlık kuruluşu değildir.
          </p>
          <p className="mt-2 max-w-3xl text-ink-700">
            Tanı koymaz, tedavi uygulamaz, acil müdahale sunmaz, 7/24 izleme
            yapmaz. Acil bir durumda{" "}
            <strong className="text-ink-900">112&apos;yi arayın.</strong>
          </p>
        </div>

        <p className="mt-8 text-base text-ink-500">
          © {new Date().getFullYear()} Hipokampüs · Geliştirme aşamasındadır,
          yayında bir hizmet yoktur.
        </p>
      </div>
    </footer>
  );
}

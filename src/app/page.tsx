import Link from "next/link";
import { BrandPath } from "@/components/BrandPath";
import { Logo } from "@/components/Logo";
import { NeedsForm } from "@/components/NeedsForm";
import { ButtonLink, Container } from "@/components/ui";

/**
 * Ana sayfa.
 *
 * YÖN (2026-08-06, sahibinin talimatı): "10 tane tanıtım kelimesiyle
 * kaydır-kaydır bir site istemiyorum; hızlıca kendimizi anlatıp güven
 * verip doğrudan kullanıcıyla etkileşime geçmeliyiz."
 *
 * Bu yüzden sayfa bir tanıtım broşürü değil, bir GİRİŞ NOKTASI:
 * ihtiyaç formu ayrı bir sayfaya link olarak durmuyor, doğrudan burada,
 * ilk ekranda başlıyor. Ziyaretçi okumak yerine ilk saniyede bir şey
 * yapıyor. Eski "Üç adım / Güven / Uzman mısınız" bölümleri tek bir ince
 * şeride indirildi — aynı bilgi, dörtte bir yer.
 *
 * Kilitli kararlar korundu: form güvenlik sorusuyla başlar (NeedsForm),
 * "sağlık kuruluşu değildir" uyarısı sayfada kalır, puan/skor yoktur.
 */

const KISA_GUVEN = [
  {
    baslik: "Puan ve yorum yok",
    metin: "Yıldız, deneyim yılı, yanıt hızı gösterilmez.",
    href: "/dogrulama",
    link: "Doğrulama sürecimiz",
  },
  {
    baslik: "Seçim sizde",
    metin: "En fazla üç öneri, her biri için gerekçe. Otomatik atama yok.",
    href: "/uzmanlar",
    link: "Uzmanlara göz atın",
  },
  {
    baslik: "Elinizde plan kalır",
    metin: "Görüşmenin çıktısı maddeler hâlinde yazılı bir bakım planı.",
    href: "/nasil-calisir",
    link: "Nasıl çalışır?",
  },
] as const;

export default function AnaSayfa() {
  return (
    <>
      {/* --- Giriş: anlatma, başlat ---------------------------------- */}
      <div className="relative isolate overflow-hidden bg-sky-50">
        <BrandPath
          animate
          className="absolute inset-0 h-full w-full opacity-90"
        />

        <Container width="wide" className="relative py-12 sm:py-16">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            {/* Sol: kim olduğumuz — kısa tutuldu, bilerek */}
            <div>
              <p className="hk-enter mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-base text-teal-800 backdrop-blur-sm">
                <span aria-hidden className="size-2 rounded-full bg-sky-500" />
                Geliştirme aşamasında — yayında bir hizmet yok
              </p>

              <h1
                className="hk-enter max-w-xl text-4xl leading-[1.12] sm:text-5xl"
                style={{ animationDelay: "70ms" }}
              >
                Bakım sürecinde{" "}
                <span className="text-teal-700">nereden başlayacağınızı</span>{" "}
                birlikte bulalım.
              </h1>

              <p
                className="hk-enter mt-5 max-w-lg text-xl text-ink-700"
                style={{ animationDelay: "140ms" }}
              >
                Birkaç soru yeter. Yanıtlarınız hiçbir sunucuya gönderilmez,
                puan verilmez. Sağdaki formu doldurmaya hemen başlayabilirsiniz.
              </p>

              <p
                className="hk-enter mt-6 max-w-lg rounded-xl border-l-4 border-teal-300 bg-white/70 p-4 text-ink-800 backdrop-blur-sm"
                style={{ animationDelay: "200ms" }}
              >
                Hipokampüs bir sağlık kuruluşu <strong>değildir</strong>; tanı
                koymaz, tedavi uygulamaz, acil müdahale sunmaz. Acil bir tehlike
                varsa <strong>112&apos;yi arayın.</strong>
              </p>

              <div
                className="hk-enter mt-6 flex flex-wrap gap-3"
                style={{ animationDelay: "260ms" }}
              >
                <ButtonLink href="/uzmanlar" variant="secondary" withArrow>
                  Önce uzmanlara bakayım
                </ButtonLink>
                <ButtonLink href="/giris/demo" variant="secondary">
                  Örnek paneli açın
                </ButtonLink>
              </div>
            </div>

            {/* Sağ: asıl iş — form ilk ekranda başlıyor */}
            <div
              className="hk-enter rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8"
              style={{ animationDelay: "180ms" }}
            >
              <NeedsForm />
            </div>
          </div>
        </Container>
      </div>

      {/* --- Güven: üç cümle, tek şerit ------------------------------ */}
      <div className="border-y border-ink-100 bg-paper-warm">
        <Container width="wide" className="py-10">
          <ul className="grid gap-6 sm:grid-cols-3">
            {KISA_GUVEN.map((k) => (
              <li key={k.baslik}>
                <p className="mb-1 text-lg font-semibold text-ink-900">
                  {k.baslik}
                </p>
                <p className="mb-2 text-ink-700">{k.metin}</p>
                <Link
                  href={k.href}
                  className="text-base font-semibold text-teal-800 underline underline-offset-4"
                >
                  {k.link}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* --- Uzman daveti: ince bant --------------------------------- */}
      <div className="relative isolate overflow-hidden bg-teal-800">
        <BrandPath
          soften={false}
          className="absolute inset-0 h-full w-full opacity-25"
        />
        <Container width="wide" className="relative py-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Logo
                variant="lockupReverse"
                decorative
                className="hidden h-12 sm:block"
              />
              <div>
                <p className="text-xl text-white">
                  Gerontoloji veya ilgili alanda uzman mısınız?
                </p>
                <p className="text-teal-100">
                  Ücretinizi ve takviminizi siz belirlersiniz; sıralamada
                  yerinizi kimse satın alamaz.
                </p>
              </div>
            </div>
            <ButtonLink href="/uzman" variant="onDark" withArrow>
              Bizimle çalışın
            </ButtonLink>
          </div>
        </Container>
      </div>
    </>
  );
}

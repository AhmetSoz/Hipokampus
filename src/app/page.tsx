import Link from "next/link";
import { BrandPath } from "@/components/BrandPath";
import { DevamKarti, type BekleyenIs } from "@/components/DevamKarti";
import { Logo } from "@/components/Logo";
import { NeedsForm } from "@/components/NeedsForm";
import { ButtonLink, Container } from "@/components/ui";
import { claudeAcikMi } from "@/lib/claude";
import { listAppointmentsForConsultant } from "@/data/appointments";
import { listAssignmentsForConsultant } from "@/data/assessments";
import {
  listConversationsForConsultant,
  listConversationsForExpert,
} from "@/data/conversations";
import { getConsultant } from "@/data/household";
import { getCurrentUser } from "@/data/session";

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
 * 2026-10-29: ilk ekran bir yazma alanı. Aile durumu kendi cümleleriyle
 * yazar, Claude özete ve başlıklara çevirir (bkz. NeedsForm). Yan sütun
 * defterin kenar notu gibi: metnin nereye gittiğini ve Hipokampüs'ün ne
 * yapmadığını formun hemen yanında söyler.
 */

const SONRASI = [
  {
    baslik: "Özet",
    metin:
      "Yazdıklarınız, uzmanın ilk okuyacağı birkaç cümleye ve konuşulacak başlıklara dönüşür. Düzeltmek sizin elinizde.",
  },
  {
    baslik: "Seçim",
    metin:
      "Bu başlıklarda çalışan en fazla üç uzman, her biri için bir gerekçeyle. Puan, yıldız, yorum yok; sıra her gün değişir.",
  },
  {
    baslik: "Görüşme",
    metin:
      "Uzman bir saat önerir, siz onaylarsınız. Görüşme Meet ya da Zoom üzerinden yapılır, kayıt alınmaz.",
  },
  {
    baslik: "Yazılı plan",
    metin:
      "Görüşmenin çıktısı maddeler hâlinde bir bakım planıdır. Ailede kim neyi üstlendi, panelden takip edilir.",
  },
] as const;

/**
 * Giriş yapmış kullanıcı için bekleyen işleri toplar. Hesabı olan kişi
 * tanıtımı tekrar okumaz, formu baştan doldurmaz — doğrudan işine döner.
 */
async function girisYapmisIcerik() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (user.role === "uzman" && user.expertId) {
    const dosyalar = await listConversationsForExpert(user.expertId);
    const bekleyenler: BekleyenIs[] = [
      {
        etiket: "Yanıtınızı bekleyen dosya",
        sayi: dosyalar.filter((c) => c.status === "yanit-bekliyor").length,
        href: "/uzman-panel",
      },
      {
        etiket: "Açık dosya",
        sayi: dosyalar.filter((c) => c.status !== "tamamlandi").length,
        href: "/uzman-panel/danisanlar",
      },
    ];
    return { ad: "Uzman paneliniz", panelHref: "/uzman-panel", bekleyenler };
  }

  if (user.consultantId) {
    const [consultant, dosyalar, formlar, randevular] = await Promise.all([
      getConsultant(user.consultantId),
      listConversationsForConsultant(user.consultantId),
      listAssignmentsForConsultant(user.consultantId),
      listAppointmentsForConsultant(user.consultantId),
    ]);
    const bekleyenler: BekleyenIs[] = [
      {
        etiket: "Onayınızı bekleyen randevu",
        sayi: randevular.filter((r) => r.status === "teklif").length,
        href: "/panel/mesajlar",
      },
      {
        etiket: "Doldurmanız gereken form",
        sayi: formlar.filter((f) => f.status === "atandi").length,
        href: "/panel/formlar",
      },
      {
        etiket: "Açık danışma dosyası",
        sayi: dosyalar.filter((c) => c.status !== "tamamlandi").length,
        href: "/panel/mesajlar",
      },
    ];
    return { ad: consultant.name, panelHref: "/panel", bekleyenler };
  }

  return { ad: "Paneliniz", panelHref: "/panel", bekleyenler: [] };
}

export default async function AnaSayfa() {
  const oturum = await girisYapmisIcerik();

  if (oturum) {
    return (
      <div className="relative isolate overflow-hidden bg-sky-50">
        <BrandPath className="absolute inset-0 h-full w-full opacity-60" />
        <Container width="wide" className="relative py-14 sm:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div>
              <h1 className="hk-enter max-w-xl text-4xl leading-[1.12] sm:text-5xl">
                Kaldığınız yerden devam edin.
              </h1>
              <p className="hk-enter mt-5 max-w-lg text-xl text-ink-700">
                Bekleyen işleriniz yanda. Panelinizde her şeye ulaşabilirsiniz.
              </p>
              <div className="mt-8">
                <ButtonLink href="/uzmanlar" variant="secondary" withArrow>
                  Uzmanlara göz atın
                </ButtonLink>
              </div>
            </div>
            <DevamKarti
              ad={oturum.ad}
              panelHref={oturum.panelHref}
              bekleyenler={oturum.bekleyenler}
            />
          </div>
        </Container>
      </div>
    );
  }

  const claudeAcik = claudeAcikMi();

  return (
    <>
      <div className="relative isolate overflow-hidden bg-linear-to-b from-sky-50 to-paper">
        <BrandPath animate className="absolute inset-x-0 top-0 h-[36rem] w-full opacity-35" />

        <Container width="wide" className="relative pt-10 pb-16 sm:pt-14 sm:pb-24">
          <p className="hk-enter mb-8 flex items-center gap-3 text-base text-ink-600">
            <span aria-hidden className="h-px w-8 bg-ink-300" />
            Prototip. Henüz yayında bir hizmet yok; uzmanlar ve dosyalar örnektir.
          </p>

          <h1
            className="hk-enter max-w-4xl text-[2.5rem] leading-[1.08] tracking-[-0.01em] sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            Bir şeyler değişiyor ama kime gideceğinizi bilmiyorsanız,{" "}
            <span className="text-teal-700">buradan başlayın.</span>
          </h1>

          <p
            className="hk-enter mt-6 max-w-2xl text-xl text-ink-700"
            style={{ animationDelay: "120ms" }}
          >
            {claudeAcik
              ? "Fark ettiklerinizi kendi cümlelerinizle yazın. Uzmanın okuyacağı kısa bir özete, konuşulacak başlıklara ve bu konularda çalışan doğrulanmış uzmanlara çevirelim."
              : "Fark ettiklerinizi işaretleyin; konuşulacak başlıkları ve bu konularda çalışan doğrulanmış uzmanları gösterelim."}
          </p>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-14">
            <div
              className="hk-enter rounded-md border border-ink-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8"
              style={{ animationDelay: "180ms" }}
            >
              <NeedsForm claudeAcik={claudeAcik} />
            </div>

            <aside
              className="hk-enter space-y-8 text-base text-ink-700 lg:border-l lg:border-ink-200 lg:pt-2 lg:pl-6"
              style={{ animationDelay: "240ms" }}
              aria-label="Kenar notları"
            >
              <div>
                <p className="mb-1 font-semibold text-ink-900">Metniniz nereye gider?</p>
                <p>
                  {claudeAcik
                    ? "Onay verirseniz yalnızca özet çıkarmak için Claude'a. Hipokampüs veritabanına yazılmaz. Listeden işaretleme yolunda hiçbir şey gönderilmez."
                    : "Hiçbir yere. İşaretledikleriniz yalnızca bu sayfada kalır; yenilediğinizde kaybolur."}
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-ink-900">Ne yapmaz?</p>
                <p>
                  Tanı koymaz, puan ya da risk değeri vermez, uzmanı sizin yerinize
                  seçmez. Hipokampüs bir sağlık kuruluşu değildir.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-ink-900">Acil bir durumda</p>
                <p>
                  Beklemeyin, <strong className="text-ink-900">112&apos;yi arayın.</strong>
                </p>
              </div>
              <p>
                <Link
                  href="/giris/demo"
                  className="font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4"
                >
                  Örnek paneli açın
                </Link>{" "}
                — bir ailenin ve bir uzmanın gördüğü ekranlar.
              </p>
            </aside>
          </div>
        </Container>
      </div>

      <section className="border-t border-ink-200 bg-paper" aria-labelledby="sonrasi">
        <Container width="wide" className="py-16 sm:py-20">
          <h2 id="sonrasi" className="mb-10 max-w-2xl text-3xl sm:text-4xl">
            Yazdıktan sonra
          </h2>
          <ol className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {SONRASI.map((s, i) => (
              <li key={s.baslik} className="border-t-2 border-teal-700 pt-5">
                <p className="mb-3 flex items-baseline gap-3">
                  <span className="font-[family-name:var(--font-display)] text-2xl text-teal-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xl font-semibold text-ink-900">{s.baslik}</span>
                </p>
                <p className="text-ink-700">{s.metin}</p>
              </li>
            ))}
          </ol>
          <p className="mt-12 text-lg">
            <Link
              href="/nasil-calisir"
              className="font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4"
            >
              Nasıl çalıştığını ayrıntılı okuyun
            </Link>
            <span className="text-ink-500"> · </span>
            <Link
              href="/dogrulama"
              className="font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4"
            >
              Uzmanları nasıl doğruluyoruz
            </Link>
          </p>
        </Container>
      </section>

      <div className="bg-teal-800">
        <Container width="wide" className="py-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Logo variant="lockupReverse" decorative className="hidden h-12 sm:block" />
              <div>
                <p className="text-xl text-white">
                  Gerontoloji ya da ilgili bir alanda uzman mısınız?
                </p>
                <p className="text-teal-100">
                  Ücretinizi ve takviminizi siz belirlersiniz; sıralamada yerinizi
                  kimse satın alamaz.
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

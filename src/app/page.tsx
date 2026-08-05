import Link from "next/link";
import { BrandPath } from "@/components/BrandPath";
import { Logo } from "@/components/Logo";
import {
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Notice,
  Section,
  StepCard,
} from "@/components/ui";

/* Sade, tek çizgili simgeler — logonun çizgi kalınlığıyla (2px, yuvarlak
   uç) aynı ailede. Kütüphane eklemek yerine üç tanesi elle çizildi. */

function IconClipboard() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden fill="none">
      <rect
        x="5"
        y="4"
        width="16"
        height="19"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M10 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 12h8M9 16h8M9 20h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden fill="none">
      <circle cx="10" cy="9" r="3.4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 21c0-3.6 2.7-6 6-6s6 2.4 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="18.5" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16.8 14.2c2.6.3 4.6 2.4 4.6 5.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPanel() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden fill="none">
      <rect
        x="3.5"
        y="4.5"
        width="19"
        height="17"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M3.5 9.5h19" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="7" r="0.9" fill="currentColor" />
      <circle cx="10" cy="7" r="0.9" fill="currentColor" />
      <path
        d="M7.5 14h5M7.5 17.5h8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const QUICK_LINKS = [
  {
    href: "/ihtiyac-formu",
    icon: IconClipboard,
    title: "İhtiyacınızı netleştirin",
    desc: "2 dakika, ücretsiz, hiçbir kayıt tutulmaz.",
  },
  {
    href: "/uzmanlar",
    icon: IconPeople,
    title: "Uzmanlara göz atın",
    desc: "Konuya göre süzün, karşılaştırma yok.",
  },
  {
    href: "/giris",
    icon: IconPanel,
    title: "Paneli deneyin",
    desc: "Gerçek bir aile örneğiyle, hemen şimdi.",
  },
] as const;

export default function AnaSayfa() {
  return (
    <>
      {/* ---------------------------------------------------------------- */}
      <div className="relative isolate overflow-hidden bg-sky-50">
        <BrandPath
          animate
          className="absolute inset-0 h-full w-full opacity-90"
        />
        <Container width="wide" className="relative py-16 sm:py-24">
          <p className="hk-enter mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-base text-teal-800 backdrop-blur-sm">
            <span aria-hidden className="size-2 rounded-full bg-sky-500" />
            Geliştirme aşamasında — yayında bir hizmet yok
          </p>

          <h1
            className="hk-enter max-w-3xl text-4xl leading-[1.12] sm:text-6xl"
            style={{ animationDelay: "70ms" }}
          >
            Bakım süreci belirsizlikle başlar.{" "}
            <span className="text-teal-700">İlk adım, neyi konuşmanız
            gerektiğini görmek.</span>
          </h1>

          <p
            className="hk-enter mt-6 max-w-xl text-xl text-ink-700"
            style={{ animationDelay: "140ms" }}
          >
            Doğrulanmış uzmanlarla buluşun, planı birlikte yazın. Anlatmaktansa
            göstermeyi tercih ediyoruz — aşağıdan hemen başlayın.
          </p>

          <div
            className="hk-enter mt-9 flex flex-wrap gap-4"
            style={{ animationDelay: "210ms" }}
          >
            <ButtonLink href="/ihtiyac-formu" withArrow>
              İhtiyacınızı netleştirin
            </ButtonLink>
            <ButtonLink href="/nasil-calisir" variant="secondary">
              Nasıl çalışır?
            </ButtonLink>
          </div>
        </Container>

        {/* Hızlı girişler — okumak yerine tıklamak isteyenler için üç kapı. */}
        <Container width="wide" className="relative pb-12 sm:pb-16">
          <ul
            className="hk-enter grid gap-4 sm:grid-cols-3"
            style={{ animationDelay: "280ms" }}
          >
            {QUICK_LINKS.map(({ href, icon: Icon, title, desc }) => (
              <li key={href}>
                <Link href={href} className="group block h-full">
                  <Card
                    interactive
                    className="flex h-full items-start gap-4 p-6 backdrop-blur-sm"
                  >
                    <span
                      aria-hidden
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 transition-colors duration-200 group-hover:bg-teal-100"
                    >
                      <Icon />
                    </span>
                    <span className="min-w-0">
                      <span className="mb-1 flex items-center gap-1.5 text-lg font-semibold text-ink-900">
                        {title}
                        <svg
                          aria-hidden
                          width="16"
                          height="16"
                          viewBox="0 0 18 18"
                          className="shrink-0 text-teal-600 transition-transform duration-200 group-hover:translate-x-0.5"
                        >
                          <path
                            d="M4 9h9.5M9 4.5 14 9l-5 4.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </svg>
                      </span>
                      <span className="block text-base text-ink-600">
                        {desc}
                      </span>
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* ---------------------------------------------------------------- */}
      <div className="bg-paper py-6 sm:py-8">
        <Container>
          <Notice title="Önce sınırlarımız">
            <p>
              Hipokampüs bir sağlık kuruluşu <strong>değildir</strong>; tanı
              koymaz, tedavi uygulamaz, acil müdahale sunmaz. Acil bir
              tehlike varsa <strong>112&apos;yi arayın.</strong>
            </p>
          </Notice>
        </Container>
      </div>

      {/* ---------------------------------------------------------------- */}
      <Section tone="warm">
        <Container width="wide">
          <Eyebrow>Üç adım</Eyebrow>
          <h2 className="mb-10 max-w-2xl text-3xl sm:text-4xl">
            Ödeme kararını, ne olduğunu gördükten sonra verirsiniz
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <StepCard step={1} title="İhtiyacınızı netleştirin" meta="Ücretsiz">
              <p>
                Birkaç soru, başlıklar hâlinde bir sonuç. Puan yok, yüzde yok.
              </p>
            </StepCard>

            <StepCard step={2} title="Uzmanınızı siz seçin" meta="Ücretli görüşme">
              <p>
                En fazla üç öneri, her biri için <em>neden bu kişi?</em>{" "}
                açıklaması. Seçim her zaman sizde.
              </p>
            </StepCard>

            <StepCard
              step={3}
              title="Yazılı planla ayrılın"
              meta="Takip isteğe bağlı"
            >
              <p>
                Elinizde maddeler hâlinde bir plan kalır. Takibi isterseniz
                eklersiniz.
              </p>
            </StepCard>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section tone="paper">
        <Container width="wide">
          <div className="grid items-start gap-12 md:grid-cols-2">
            <div>
              <Eyebrow>Güven</Eyebrow>
              <h2 className="mb-5 text-3xl sm:text-4xl">
                Burada kimse puanlanmıyor
              </h2>
              <p className="mb-5 text-ink-700">
                Yıldız, yorum, deneyim yılı, yanıt hızı — hiçbiri yok. Bu
                ölçütler bir sıralama kurar, sıralama da herkesi aynı birkaç
                kişiye yığar.
              </p>
              <p className="text-ink-700">
                Doğrulamayı geçen herkes yeterlidir. Soru &ldquo;kim daha
                iyi&rdquo; değil, &ldquo;kim bana uygun.&rdquo;
              </p>
              <div className="mt-8">
                <ButtonLink href="/dogrulama" variant="secondary" withArrow>
                  Doğrulama sürecimiz
                </ButtonLink>
              </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { t: "Uzmanlık alanları", d: "Neyin üzerine çalıştığı." },
                { t: "Çalıştığı konular", d: "İhtiyaç başlıklarınızla eşleşen." },
                { t: "Doğrulama rozeti", d: "Süreci tamamladığının kanıtı." },
                { t: "Müsaitlik", d: "Görüşmeye açık olup olmadığı." },
              ].map((item) => (
                <li key={item.t}>
                  <Card className="h-full p-6">
                    <p className="mb-1 font-semibold text-teal-800">
                      {item.t}
                    </p>
                    <p className="text-base text-ink-700">{item.d}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section tone="teal">
        <Container width="wide">
          <div className="grid items-center gap-10 md:grid-cols-[1.5fr_1fr]">
            <div>
              <Logo
                variant="lockupReverse"
                decorative
                className="mb-8 h-16 sm:h-20"
              />
              <h2 className="mb-4 text-3xl text-white sm:text-4xl">
                Gerontolog veya ilgili alanda uzman mısınız?
              </h2>
              <p className="text-lg text-teal-100">
                Ücretinizi ve takviminizi siz belirlersiniz; sıralamada
                yerinizi kimse satın alamaz.
              </p>
            </div>
            <div className="md:justify-self-end">
              <ButtonLink href="/uzman" variant="onDark" withArrow>
                Bizimle çalışın
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

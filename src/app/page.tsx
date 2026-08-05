import { Logo } from "@/components/Logo";
import { MemoryTrail } from "@/components/MemoryTrail";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Notice,
  Section,
  StepCard,
} from "@/components/ui";

export default function AnaSayfa() {
  return (
    <>
      {/* ---------------------------------------------------------------- */}
      <div className="relative isolate overflow-hidden bg-linear-to-b from-white via-sky-50 to-sky-100">
        <MemoryTrail />
        <Container width="wide" className="py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="hk-enter mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-base text-teal-800">
              <span aria-hidden className="size-2 rounded-full bg-sand-400" />
              Geliştirme aşamasındadır — yayında bir hizmet yoktur
            </p>

            <h1
              className="hk-enter text-4xl leading-[1.15] sm:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              Bakım süreci belirsizlikle başlar.
              <br />
              <span className="text-teal-700">
                İlk adım, neye ihtiyacınız olduğunu görmek.
              </span>
            </h1>

            <p
              className="hk-enter mt-7 max-w-2xl text-xl text-ink-700"
              style={{ animationDelay: "160ms" }}
            >
              Hipokampüs; ileri yaştaki bireylerin ve ailelerinin ihtiyaçlarını
              netleştirmesine, doğrulanmış gerontologlar ve ilgili uzmanlarla
              buluşmasına, bakım sürecini planlayıp takip etmesine yardımcı
              olmayı hedefleyen bir dijital koordinasyon platformudur.
            </p>

            <div
              className="hk-enter mt-10 flex flex-wrap gap-4"
              style={{ animationDelay: "240ms" }}
            >
              <ButtonLink href="/ihtiyac-formu">
                İhtiyacınızı netleştirin
              </ButtonLink>
              <ButtonLink href="/nasil-calisir" variant="secondary">
                Nasıl çalışır?
              </ButtonLink>
            </div>

            <p
              className="hk-enter mt-6 text-base text-ink-600"
              style={{ animationDelay: "300ms" }}
            >
              İhtiyaç formu ücretsizdir ve yanıtlarınız hiçbir sunucuya
              kaydedilmez.
            </p>
          </div>
        </Container>
      </div>

      {/* ---------------------------------------------------------------- */}
      <Section tone="paper">
        <Container>
          <Notice title="Önce sınırlarımızı söyleyelim">
            <p>
              Hipokampüs bir sağlık kuruluşu <strong>değildir</strong>. Tanı
              koymaz, tedavi uygulamaz, acil müdahale sunmaz, 7/24 izleme yapmaz.
              Yaptığı iş, doğru kişiyle doğru konuyu konuşmanızı kolaylaştırmaktır.
            </p>
            <p>
              Şu anda kişinin veya bir başkasının güvenliğiyle ilgili acil bir
              tehlike varsa lütfen <strong>112&apos;yi arayın.</strong>
            </p>
          </Notice>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section tone="warm">
        <Container width="wide">
          <Eyebrow>Üç adım</Eyebrow>
          <h2 className="mb-4 max-w-2xl text-3xl sm:text-4xl">
            Ödeme kararını, ne olduğunu gördükten sonra verirsiniz
          </h2>
          <p className="mb-12 max-w-2xl text-ink-700">
            İlk adım ücretsizdir. Yalnızca konuşmak istediğiniz konular
            netleştikten sonra bir uzmanla görüşmeye karar verirsiniz.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <StepCard step={1} title="İhtiyacınızı netleştirin" meta="Ücretsiz">
              <p>
                Birkaç soruyla, destek arayabileceğiniz konuları başlıklar
                hâlinde görürsünüz. Puan verilmez, yüzde hesaplanmaz, bir
                değerlendirme sonucu üretilmez.
              </p>
            </StepCard>

            <StepCard step={2} title="Uzmanınızı siz seçin" meta="Ücretli görüşme">
              <p>
                Size en fazla üç uzman önerilir ve her biri için{" "}
                <em>neden bu kişi?</em> açıklaması gösterilir. Otomatik atama
                yoktur; seçimi her zaman siz yaparsınız.
              </p>
            </StepCard>

            <StepCard
              step={3}
              title="Yazılı planla ayrılın"
              meta="Takip isteğe bağlı"
            >
              <p>
                Görüşmenin sonunda elinizde maddeler hâlinde yazılı bir bakım
                planı kalır. Dilerseniz planın belirli aralıklarla gözden
                geçirildiği takibi eklersiniz.
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
                Yıldız puanı yok. Bunun bir sebebi var.
              </h2>
              <p className="mb-5 text-ink-700">
                Bakım kararları, memnuniyet puanıyla verilecek kararlar değil. Bu
                yüzden uzmanları beş yıldız üzerinden sıralamıyoruz ve kullanıcı
                yorumu yayınlamıyoruz.
              </p>
              <p className="text-ink-700">
                Bunun yerine karar vermenize yarayacak somut bilgileri
                gösteriyoruz. Sıralama hiçbir koşulda ücret karşılığı
                değiştirilemez.
              </p>
              <div className="mt-8">
                <ButtonLink href="/dogrulama" variant="secondary">
                  Doğrulama sürecimiz
                </ButtonLink>
              </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { t: "Deneyim yılı", d: "Uzmanın alanında geçirdiği süre." },
                {
                  t: "Yanıt süresi",
                  d: "Mesajlara ortalama ne kadar sürede döndüğü.",
                },
                {
                  t: "Doğrulama rozeti",
                  d: "Hipokampüs doğrulama sürecini tamamladı.",
                },
                {
                  t: "Müsaitlik",
                  d: "Yakın dönemde görüşmeye açık olup olmadığı.",
                },
              ].map((item) => (
                <li
                  key={item.t}
                  className="rounded-lg border border-ink-200 bg-white p-6"
                >
                  <p className="mb-1 font-semibold text-teal-800">{item.t}</p>
                  <p className="text-base text-ink-700">{item.d}</p>
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
                Hipokampüs&apos;ü uzman ve akademisyenlerin katkısıyla
                geliştiriyoruz. Ücretinizi ve takviminizi siz belirlersiniz;
                sıralamada yerinizi kimse satın alamaz.
              </p>
            </div>
            <div className="md:justify-self-end">
              <ButtonLink
                href="/uzman"
                className="!bg-white !text-teal-800 hover:!bg-sand-100"
              >
                Bizimle çalışın
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

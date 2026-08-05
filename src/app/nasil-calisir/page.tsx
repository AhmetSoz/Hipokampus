import type { Metadata } from "next";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Notice,
  Section,
  StepCard,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Nasıl çalışır",
  description:
    "Ücretsiz ihtiyaç netleştirmeden başlayan, uzman görüşmesi ve yazılı bakım " +
    "planıyla devam eden, takibi isteğe bağlı bırakan üç adımlı akış.",
};

export default function NasilCalisirSayfasi() {
  return (
    <>
      <div className="bg-linear-to-b from-sky-50 to-paper py-16 sm:py-20">
        <Container>
          <h1 className="mb-5 text-4xl sm:text-5xl">Nasıl çalışır</h1>
          <p className="max-w-2xl text-xl text-ink-700">
            Üç adım var ve ilki ücretsiz. Ödeme kararını, ne alacağınızı
            gördükten sonra veriyorsunuz.
          </p>
        </Container>
      </div>

      <Section tone="paper">
        <Container width="wide">
          <div className="grid gap-6 md:grid-cols-3">
            <StepCard step={1} title="İhtiyaç netleştirme" meta="Ücretsiz">
              <p>
                Formun başında tek bir güvenlik sorusu sorulur. Ardından kimin
                için buradasınız ve hangi konularda destek arıyorsunuz diye
                sorulur.
              </p>
              <p className="mt-3">
                Sonunda seçtiğiniz ihtiyaç başlıklarını görürsünüz. Puan, yüzde
                veya risk değeri üretilmez.
              </p>
            </StepCard>

            <StepCard step={2} title="Uzman görüşmesi" meta="Ücretli">
              <p>
                Size en fazla üç uzman önerilir. Her öneri, <em>neden bu kişi?</em>{" "}
                açıklamasıyla birlikte gelir.
              </p>
              <p className="mt-3">
                Otomatik atama yoktur. Seçimi siz yaparsınız. Görüşme kaydı
                alınmaz.
              </p>
            </StepCard>

            <StepCard
              step={3}
              title="Yazılı bakım planı ve takip"
              meta="Takip isteğe bağlı"
            >
              <p>
                Görüşmenin teslimatı, maddeler hâlinde yazılı bir bakım planıdır
                ve görüşme ücretine dahildir.
              </p>
              <p className="mt-3">
                Takip isterseniz ayrı bir kalemdir; belirli sürelidir ve tanımlı
                bir bitişi vardır. Süresiz abonelik değildir.
              </p>
            </StepCard>
          </div>
        </Container>
      </Section>

      <Section tone="warm">
        <Container>
          <Eyebrow>Sınırlar</Eyebrow>
          <h2 className="mb-8 text-3xl sm:text-4xl">Yapmadığımız şeyler</h2>

          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              {
                t: "Tanı koymayız",
                d: "Hipokampüs bir sağlık kuruluşu değildir; tanı ve tedavi süreçleri yürütmez.",
              },
              {
                t: "Acil müdahale sunmayız",
                d: "Acil durumlarda 112 aranmalıdır. 7/24 izleme yapmayız.",
              },
              {
                t: "Klinik ölçek uygulamayız",
                d: "İhtiyaç formunda hiçbir klinik test veya tarama ölçeği kullanılmaz.",
              },
              {
                t: "Puan üretmeyiz",
                d: "Ne kullanıcıya ne uzmana puan verilir. Sonuç ekranı yalnızca başlık gösterir.",
              },
              {
                t: "Sıralamayı satmayız",
                d: "Uzman sıralaması hiçbir koşulda ücret karşılığı değiştirilemez.",
              },
              {
                t: "Görüşmeyi kaydetmeyiz",
                d: "Görüşme kaydı alınmaz. Elinizde kalan, üzerinde anlaştığınız yazılı plandır.",
              },
            ].map((item) => (
              <li
                key={item.t}
                className="rounded-lg border border-ink-200 bg-white p-6"
              >
                <p className="mb-1 text-lg font-semibold text-ink-900">
                  {item.t}
                </p>
                <p className="text-base text-ink-700">{item.d}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <Eyebrow>Bilgileriniz</Eyebrow>
          <h2 className="mb-6 text-3xl sm:text-4xl">
            Kimin neyi göreceği baştan bellidir
          </h2>
          <div className="space-y-5 text-ink-700">
            <p>
              Bilgileriniz yalnızca hizmetin sunulması için gerekli kişilerle,
              sizin yetkinizle paylaşılır.
            </p>
            <p>
              <strong className="text-ink-900">
                Ödeme yapmak, sağlık veya görüşme verisini görme hakkı vermez.
              </strong>{" "}
              Süreci bir aile üyesi başlatmış ve ödemeyi o yapmış olsa bile,
              hizmetin öznesi ve verilerin sahibi ileri yaştaki bireydir.
            </p>
            <p>
              İhtiyaç formu demosunda hiçbir yanıt sunucuya yazılmaz.
            </p>
          </div>

          <div className="mt-10">
            <Notice title="Yasal metinler hazırlanıyor">
              <p>
                Hipokampüs geliştirme aşamasındadır. Yasal metinler
                tamamlanmadan ücretli hizmet, gerçek eşleştirme ve veri kaydı
                başlatılmayacaktır.
              </p>
            </Notice>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/ihtiyac-formu">
              İhtiyaç formunu deneyin
            </ButtonLink>
            <ButtonLink href="/dogrulama" variant="secondary">
              Doğrulama süreci
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}

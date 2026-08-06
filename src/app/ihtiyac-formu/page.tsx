import type { Metadata } from "next";
import { BrandPath } from "@/components/BrandPath";
import { NeedsForm } from "@/components/NeedsForm";
import { Container, Notice } from "@/components/ui";

export const metadata: Metadata = {
  title: "İhtiyaç formu",
  description:
    "Birkaç soruyla destek arayabileceğiniz konuları başlıklar hâlinde görün. " +
    "Ücretsizdir, puan verilmez ve yanıtlarınız hiçbir sunucuya kaydedilmez.",
};

export default function IhtiyacFormuSayfasi() {
  return (
    <div className="relative isolate overflow-hidden bg-linear-to-b from-sky-50 to-paper py-16 sm:py-20">
      <BrandPath className="absolute inset-0 h-full w-full opacity-60" />
      <Container className="relative">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl sm:text-5xl">İhtiyaç formu</h1>
          <p className="max-w-2xl text-xl text-ink-700">
            Bu form, konuşmak istediğiniz konuları netleştirmenize yardımcı olur.
            Bir değerlendirme aracı değildir.
          </p>
        </div>

        <div className="mb-12">
          <Notice tone="teal" title="Bu form neyi yapmaz">
            <p>
              Size puan vermez, yüzde hesaplamaz, risk düzeyi belirlemez ve tanı
              koymaz. Hiçbir klinik ölçek kullanılmaz. Yanıtlarınız hiçbir
              sunucuya gönderilmez ve cihazınıza kaydedilmez.
            </p>
          </Notice>
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-7 sm:p-10">
          <NeedsForm />
        </div>
      </Container>
    </div>
  );
}

import type { Metadata } from "next";
import { BrandPath } from "@/components/BrandPath";
import { NeedsForm } from "@/components/NeedsForm";
import { Container } from "@/components/ui";
import { claudeAcikMi } from "@/lib/claude";

export const metadata: Metadata = {
  title: "İhtiyaç formu",
  description:
    "Fark ettiklerinizi yazın ya da işaretleyin; konuşulacak başlıkları ve bu " +
    "konularda çalışan uzmanları görün. Ücretsizdir, puan verilmez.",
};

export default function IhtiyacFormuSayfasi() {
  return (
    <div className="relative isolate overflow-hidden bg-linear-to-b from-sky-50 to-paper py-16 sm:py-20">
      <BrandPath className="absolute inset-0 h-full w-full opacity-50" />
      <Container className="relative">
        <div className="mb-10">
          <h1 className="mb-4 text-4xl sm:text-5xl">İhtiyaç formu</h1>
          <p className="max-w-2xl text-xl text-ink-700">
            Bir uzmanla neyi konuşacağınızı netleştirir. Size puan vermez, risk
            düzeyi belirlemez, tanı koymaz; hiçbir klinik ölçek kullanılmaz.
          </p>
        </div>

        <div className="rounded-md border border-ink-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-10">
          <NeedsForm claudeAcik={claudeAcikMi()} />
        </div>
      </Container>
    </div>
  );
}

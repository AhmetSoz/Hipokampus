import type { Metadata } from "next";
import { ButtonLink, Container, Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Sayfa bulunamadı" };

export default function BulunamadiSayfasi() {
  return (
    <div className="bg-linear-to-b from-sky-50 to-paper py-20 sm:py-28">
      <Container width="narrow">
        <p className="mb-4 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
          Sayfa bulunamadı
        </p>
        <h1 className="mb-5 text-4xl sm:text-5xl">
          Aradığınız sayfa burada değil
        </h1>
        <p className="mb-10 text-xl text-ink-700">
          Adres yanlış yazılmış olabilir ya da sayfa taşınmış olabilir. Aşağıdan
          devam edebilirsiniz.
        </p>

        <div className="mb-12 flex flex-wrap gap-4">
          <ButtonLink href="/">Ana sayfaya dönün</ButtonLink>
          <ButtonLink href="/uzmanlar" variant="secondary">
            Uzmanlara bakın
          </ButtonLink>
        </div>

        <Notice>
          <p>
            Acil bir durumdaysanız bu sayfayı kapatın ve{" "}
            <strong className="text-ink-900">112&apos;yi arayın.</strong>{" "}
            Hipokampüs acil müdahale sunmaz.
          </p>
        </Notice>
      </Container>
    </div>
  );
}

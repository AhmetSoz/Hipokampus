import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/ui";
import { listConversationsForExpert } from "@/data/conversations";
import { RESPONSE_COMMITMENT } from "@/data/experts";
import { getConsultant } from "@/data/household";

export const metadata: Metadata = { title: "Uzman paneli" };

export default async function UzmanPanelGenelBakis() {
  const [conversations, consultant] = await Promise.all([
    listConversationsForExpert("u1"),
    getConsultant(),
  ]);

  const waiting = conversations.filter((c) => c.status === "yanit-bekliyor");
  const open = conversations.filter((c) => c.status !== "tamamlandi");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-3xl sm:text-4xl">Genel bakış</h1>
        <p className="max-w-2xl text-lg text-ink-700">
          {waiting.length > 0
            ? `${waiting.length} dosya yanıtınızı bekliyor.`
            : "Yanıt bekleyen dosyanız yok."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { t: "Açık dosya", v: open.length },
          { t: "Yanıt bekleyen", v: waiting.length },
          { t: "Tamamlanan", v: conversations.length - open.length },
        ].map((s) => (
          <div
            key={s.t}
            className="rounded-xl border border-ink-200 bg-white p-6"
          >
            <p className="text-base text-ink-600">{s.t}</p>
            <p className="font-[family-name:var(--font-display)] text-4xl text-ink-900">
              {s.v}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-ink-200 bg-white p-7">
        <h2 className="mb-5 text-2xl">Dosyalarınız</h2>
        {conversations.length === 0 ? (
          <p className="text-ink-700">Henüz dosyanız yok.</p>
        ) : (
          <ul className="space-y-4">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/uzman-panel/mesajlar/${c.id}`}
                  className="block rounded-lg border border-ink-200 bg-paper-warm p-5 transition-colors hover:border-teal-400"
                >
                  <p className="text-lg font-semibold text-ink-900">
                    {c.subject}
                  </p>
                  <p className="text-base text-ink-600">
                    {consultant.name} · {c.messages.length} mesaj
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Notice tone="teal" title="Yanıt taahhüdü size ait değil, platforma ait">
        <p>
          Danışanlara kişi bazlı yanıt hızınız gösterilmiyor. Herkes için tek bir
          söz veriliyor:{" "}
          <strong>{RESPONSE_COMMITMENT.toLocaleLowerCase("tr")} yanıt.</strong>{" "}
          Böylece hızlı yanıt verenle vermeyen arasında bir sıralama oluşmuyor.
        </p>
      </Notice>

      <Notice title="Profilinizde ne görünüyor?">
        <p>
          Deneyim yılınız, yanıt hızınız, aldığınız değerlendirme puanı ve adli
          sicil durumunuz <strong>kamuya gösterilmez.</strong> Danışanın gördüğü
          şey; neyin üzerine çalıştığınız, hangi konularda destek verdiğiniz,
          doğrulamayı tamamladığınız ve müsaitliğinizdir.
        </p>
      </Notice>
    </div>
  );
}

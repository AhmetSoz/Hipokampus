import type { Metadata } from "next";
import { Card, Eyebrow, Notice } from "@/components/ui";
import { listConversations } from "@/data/conversations";
import { getExpertById } from "@/data/experts";
import { getCurrentMember } from "@/data/session";
import type { ConversationStatus } from "@/data/types";

export const metadata: Metadata = { title: "Ödeme ve abonelik" };

const STATUS_LABEL: Record<ConversationStatus, string> = {
  acik: "Sürüyor",
  "yanit-bekliyor": "Sürüyor",
  tamamlandi: "Tamamlandı",
};

/**
 * Ödeme yapan kişinin gördüğü — BİLİNÇLİ OLARAK EKSİK — ekran.
 *
 * Kilitli karar: "Ödeme yapmak, sağlık/görüşme verisini görme hakkı vermez."
 * Bu sayfa hizmet kalemlerini (hangi uzmanla, ne zaman, ne durumda) gösterir;
 * görüşme içeriğini, notları veya bakım planını GÖSTERMEZ.
 *
 * Fiyat rakamı da bilerek yok — arayüzde hiçbir yerde fiyat gösterilmez
 * (sahibinin kararı) ve fiyat düzeyi zaten kararlaştırılmadı (açık soru 5).
 */
export default async function OdemeSayfasi() {
  const member = await getCurrentMember();

  if (!member.scopes.includes("odeme-fatura")) {
    return (
      <Notice tone="teal" title="Bu bölümü göremiyorsunuz">
        <p>
          Ödeme ve abonelik bilgisi ayrı bir kapsamdır. Bu yetkiyi yalnızca
          panel sahibi verebilir.
        </p>
      </Notice>
    );
  }

  const conversations = await listConversations();
  const experts = await Promise.all(
    conversations.map((c) => getExpertById(c.expertId)),
  );

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>Ödeme ve abonelik</Eyebrow>
        <h1 className="text-3xl sm:text-4xl">Hizmet kalemleriniz</h1>
      </div>

      <Notice title="Ödemeyi siz yapıyorsunuz; sağlık içeriğini görme yetkisini yalnızca panel sahibi verebilir">
        <p>
          Bu ekranda hangi uzmanla, ne zaman görüşüldüğünü ve hizmetin
          durumunu görürsünüz. <strong>Görüşme içeriği, notlar ve bakım planı
          bu kapsama dahil değildir.</strong>
        </p>
      </Notice>

      {conversations.length === 0 ? (
        <p className="text-ink-700">Henüz bir hizmet kalemi yok.</p>
      ) : (
        <ul className="space-y-4">
          {conversations.map((c, i) => {
            const expert = experts[i];
            return (
              <li key={c.id}>
                <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
                  <div>
                    <p className="text-lg font-semibold text-ink-900">
                      Uzman görüşmesi — {expert?.name}
                    </p>
                    <p className="text-base text-ink-600">
                      {expert?.field} ·{" "}
                      {new Date(c.startedAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-base font-semibold ${
                      c.status === "tamamlandi"
                        ? "bg-teal-100 text-teal-900"
                        : "bg-sky-200 text-ink-900"
                    }`}
                  >
                    {STATUS_LABEL[c.status]}
                  </span>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Notice tone="teal" title="Tutar neden gösterilmiyor?">
        <p>
          Fiyat düzeyi henüz kararlaştırılmadı ve Hipokampüs geliştirme
          aşamasındadır. Bu prototipte hiçbir ekranda fiyat rakamı gösterilmez.
        </p>
      </Notice>
    </div>
  );
}

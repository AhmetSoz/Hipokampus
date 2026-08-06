import Link from "next/link";
import { notFound } from "next/navigation";
import { ConversationThread } from "@/components/ConversationThread";
import { Notice } from "@/components/ui";
import { getConversation } from "@/data/conversations";
import { getExpertById } from "@/data/experts";
import { getCurrentMember } from "@/data/session";

export default async function DanismaDosyasi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const member = await getCurrentMember();

  if (!member.scopes.includes("saglik-gorusme")) {
    return (
      <Notice tone="teal" title="Bu dosyayı göremiyorsunuz">
        <p>
          Danışma dosyaları sağlık ve görüşme kapsamındadır. Bu yetkiyi yalnızca
          panel sahibi verebilir.
        </p>
      </Notice>
    );
  }

  const { id } = await params;
  const sp = await searchParams;
  const conversation = await getConversation(id);
  if (!conversation) notFound();

  const expert = await getExpertById(conversation.expertId);
  if (!expert) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/panel/mesajlar"
        className="inline-flex items-center gap-2 text-teal-800 underline underline-offset-4"
      >
        ← Tüm dosyalar
      </Link>
      <ConversationThread
        conversation={conversation}
        expert={expert}
        viewer="danisan"
        bosMesajHatasi={sp.hata === "bos"}
      />
    </div>
  );
}

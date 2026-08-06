import Link from "next/link";
import { notFound } from "next/navigation";
import { ConversationThread } from "@/components/ConversationThread";
import { getConversation } from "@/data/conversations";
import { getExpertById } from "@/data/experts";

export default async function UzmanDanismaDosyasi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const conversation = await getConversation(id);
  if (!conversation) notFound();

  const expert = await getExpertById(conversation.expertId);
  if (!expert) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/uzman-panel"
        className="inline-flex items-center gap-2 text-teal-800 underline underline-offset-4"
      >
        ← Genel bakış
      </Link>
      <ConversationThread
        conversation={conversation}
        expert={expert}
        viewer="uzman"
        bosMesajHatasi={sp.hata === "bos"}
      />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getThreadMessages, markThreadRead, getPartnerName } from "@/lib/messaging";
import { MessageThread } from "@/components/messages/MessageThread";

export default async function TalentThreadPage({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center">
        <div className="text-lg font-bold">Log in to see this conversation</div>
      </div>
    );
  }

  const [messages, partnerName] = await Promise.all([
    getThreadMessages(supabase, user.id, partnerId),
    getPartnerName(supabase, partnerId),
  ]);
  await markThreadRead(supabase, user.id, partnerId);

  return (
    <MessageThread
      currentUserId={user.id}
      partnerId={partnerId}
      partnerName={partnerName}
      backHref="/talent/messages"
      initialMessages={messages}
    />
  );
}

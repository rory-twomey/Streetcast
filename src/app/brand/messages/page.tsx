import { createClient } from "@/lib/supabase/server";
import { getConversationPartners } from "@/lib/messaging";
import { ConversationList } from "@/components/messages/ConversationList";

export default async function BrandMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center">
        <div className="text-lg font-bold">Log in to see your messages</div>
      </div>
    );
  }

  const partners = await getConversationPartners(supabase, user.id, "brand");
  return <ConversationList partners={partners} basePath="/brand/messages" />;
}

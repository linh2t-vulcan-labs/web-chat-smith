import type { Metadata } from "next";

import { ConversationMain } from "@/components/conversation-main";
import { generateLocalizedPageMetadata } from "@/metadata/seo";
import { CONVERSATION_URL, GUEST_URL } from "@/utils/constants/url";

interface TConversationPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TConversationPageProps): Promise<Metadata> {
  const { locale } = await params;
  const base = await generateLocalizedPageMetadata(
    locale,
    CONVERSATION_URL,
    undefined,
    {
      canonicalPathname: GUEST_URL,
    }
  );
  return { ...base, robots: { follow: true, index: false } };
}

export default function Page() {
  return <ConversationMain isHome />;
}

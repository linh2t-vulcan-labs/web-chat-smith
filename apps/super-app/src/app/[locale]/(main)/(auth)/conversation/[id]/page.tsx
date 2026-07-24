import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { getServerCookieValue } from "@/app/actions/credentials";
import { ConversationMain } from "@/components/conversation-main";
import { DEFAULT_CONVERSATION_NAME } from "@/core/models/conversation";
import { conversationServerService } from "@/core/repositories";
import { redirect } from "@/i18n/navigation";
import { generateDefaultMetadata } from "@/metadata/seo";
import { USER_ID_KEY } from "@/utils/commons/keys";

interface TPageParams {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export async function generateMetadata(props: TPageParams): Promise<Metadata> {
  const params = await props.params;
  const { id, locale } = params;

  const defaultMetadata = await generateDefaultMetadata(locale);
  const userId = await getServerCookieValue(USER_ID_KEY);

  if (!userId) {
    return defaultMetadata;
  }

  const [, conversation] =
    await conversationServerService.getInternalConversationInfo(id, userId);

  const hasGeneratedName =
    conversation?.name && conversation.name !== DEFAULT_CONVERSATION_NAME;

  return {
    ...defaultMetadata,
    title: hasGeneratedName ? conversation.name : defaultMetadata.title,
  };
}

export default async function Home(props: TPageParams) {
  const params = await props.params;
  const userId = await getServerCookieValue(USER_ID_KEY);
  const locale = await getLocale();

  const [, conversation] = userId
    ? await conversationServerService.getInternalConversationInfo(
        params.id,
        userId
      )
    : [];

  if (conversation && conversation.useCase !== "chat") {
    redirect({ href: conversation.path, locale });
  }

  return <ConversationMain id={params.id} />;
}

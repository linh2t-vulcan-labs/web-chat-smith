import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { getServerCookieValue } from "@/app/actions/credentials";
import { AssistantWriting } from "@/components/assistant-writing";
import { DEFAULT_CONVERSATION_NAME } from "@/core/models/conversation";
import { conversationServerService } from "@/core/repositories";
import { redirect } from "@/i18n/navigation";
import { USER_ID_KEY } from "@/utils/commons/keys";

interface TPageParams {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(props: TPageParams): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;

  const userId = await getServerCookieValue(USER_ID_KEY);

  const t = await getTranslations("assistantWriting");
  const metadataTitle = t("metadata.title");

  if (!userId) {
    return {
      title: metadataTitle,
    };
  }

  const [, conversation] =
    await conversationServerService.getInternalConversationInfo(id, userId);

  const hasGeneratedName =
    conversation?.name && conversation.name !== DEFAULT_CONVERSATION_NAME;

  return {
    title: hasGeneratedName ? conversation.name : metadataTitle,
  };
}

// Note: update logic assistant writing when redesign is complete - GU-1030

export default async function Page(props: TPageParams) {
  const params = await props.params;
  const userId = await getServerCookieValue(USER_ID_KEY);
  const locale = await getLocale();

  const [, conversation] = userId
    ? await conversationServerService.getInternalConversationInfo(
        params.id,
        userId
      )
    : [];

  if (conversation && conversation.useCase !== "academic_writing") {
    redirect({ href: conversation.path, locale });
  }

  return <AssistantWriting id={params.id} />;
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AssistantWriting } from "@/components/assistant-writing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const metadataTranslate = await getTranslations({
    locale,
    namespace: "assistantWriting.metadata",
  });
  return {
    title: metadataTranslate("title"),
  };
}

export default function Page() {
  return <AssistantWriting />;
}

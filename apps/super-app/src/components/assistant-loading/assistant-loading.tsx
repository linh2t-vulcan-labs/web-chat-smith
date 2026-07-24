import { useTranslations } from "next-intl";
import React from "react";

import { LoadingRound } from "@/components/loading-icon";

interface TAssistantLoadingProps {
  text?: string;
}
export default function AssistantLoading({
  text: _text = "loading",
}: TAssistantLoadingProps) {
  const t = useTranslations("assistantWriting.result");
  const loadingText = t("loading");
  return (
    <div className="absolute start-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
      <LoadingRound className="mb-[45px]" color="#00A681" />
      <p className="text-bodyM-highlight text-text-general-secondary">
        {loadingText}
      </p>
    </div>
  );
}

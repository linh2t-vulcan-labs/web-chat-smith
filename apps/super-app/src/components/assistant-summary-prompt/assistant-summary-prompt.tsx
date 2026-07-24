import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

import { Button } from "@/components/button";

export interface TAssistantSummaryPromptProps {
  prompt: string;
  isShowEditBtn?: boolean;
  onClick: () => void;
}

export default function AssistantSummaryPrompt({
  prompt,
  isShowEditBtn = true,
  onClick,
}: TAssistantSummaryPromptProps) {
  const commonT = useTranslations("common");

  return (
    <div className="relative max-h-[284px] min-h-[90px] overflow-hidden text-text-input-placeholder">
      {prompt}
      <div className="absolute bottom-0 start-0 flex h-[90px] w-full items-end">
        {isShowEditBtn && (
          <Button
            color="neutral"
            startIcon={
              <Image src="/icons/edit.svg" width={24} height={24} alt="edit" />
            }
            onClick={onClick}
          >
            {commonT("cta.edit")}
          </Button>
        )}
      </div>
    </div>
  );
}

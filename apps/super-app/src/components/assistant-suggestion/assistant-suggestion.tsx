import React from "react";

import { SVGIcon } from "@/components/svg-icon";

import { Button } from "../button";

export default function AssistantSuggestion({
  suggestion,
  onClick,
}: {
  suggestion: string;
  onClick: (value: string) => void;
}) {
  return (
    <Button
      className="px-medium-2 gap-medium-2! py-medium-1.5 bg-surface-conversation-bot-default rounded-rounded text-start"
      size="none"
      color="text"
      endIcon={
        <SVGIcon
          src="/icons/triangle-right.svg"
          className="text-text-general-primary"
          width={24}
          height={24}
        />
      }
      onClick={() => onClick(suggestion)}
    >
      <span className="text-text-general-secondary line-clamp-2 flex-1 text-sm">
        {suggestion}
      </span>
    </Button>
  );
}

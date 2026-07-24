import React from "react";

import { LoadingIcon } from "@/components/loading-icon";

import type { TAssistantBubbleLoadingProps } from "./types";

function AssistantBubbleLoading(props: TAssistantBubbleLoadingProps) {
  const { style } = props;
  return (
    <div style={style} className="flex w-full flex-row justify-start">
      <div className="block w-4/5">
        <div className="flex w-full flex-row gap-3 will-change-auto">
          <div className="flex w-full flex-row justify-start">
            <div className="rounded-tl-default rounded-tr-default rounded-br-default bg-surface-conversation-bot-default size-fit max-w-full overflow-x-auto px-4 py-3 whitespace-break-spaces will-change-auto">
              <LoadingIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssistantBubbleLoading;

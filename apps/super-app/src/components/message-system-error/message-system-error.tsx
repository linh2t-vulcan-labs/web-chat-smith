import { useTranslations } from "next-intl";

import type { TMessageSystemErrorProps } from "@/components/message-system-error/types";
import { SVGIcon } from "@/components/svg-icon";

export default function MessageSystemError(props: TMessageSystemErrorProps) {
  const { title, content } = props;
  const conversationT = useTranslations("conversationPage");

  return (
    <div className="gap-medium-2 rounded-default thickness-thin border-border-input-default bg-surface-general-primary p-medium-2 text-text-general-secondary inline-flex w-fit items-center backdrop-blur-2xl">
      <div className="rounded-circle inline-flex size-6 items-center justify-center bg-[#9C231D]">
        <SVGIcon src="/icons/outlined/union.svg" width={16} height={16} />
      </div>
      <div className="gap-small-0.5 flex flex-1 flex-col">
        {title && (
          <h4 className="text-bodyM-medium text-text-general-secondary">
            {title}
          </h4>
        )}
        <p className="text-footnoteM-neutral text-text-general-quaternary">
          {content || conversationT("normalChat.error.desc")}
        </p>
      </div>
    </div>
  );
}

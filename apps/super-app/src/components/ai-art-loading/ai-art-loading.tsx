import { useTranslations } from "next-intl";
import Image from "next/image";

import { compositeStyles } from "@/utils/commons/styles";

interface TAIArtLoadingProps {
  className?: string;
}

function AIArtLoading({ className }: TAIArtLoadingProps) {
  const conversationT = useTranslations("conversationPage");

  return (
    <div
      className={compositeStyles(
        "gap-medium-2 rounded-default border-border-input-default bg-surface-general-bright-overlay p-medium-2 flex border",
        className
      )}
    >
      <div className="rounded-circle bg-surface-action-default-hover px-small-0.5 flex size-[24px] items-center justify-center">
        <div className="size-[12px] animate-spin">
          <Image
            src="/images/generating.png"
            alt="loading..."
            width={32}
            height={32}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <p className="text-bodyM-medium text-text-general-secondary">
          {conversationT("createImage.loading.title")}
        </p>
        <p className="text-footnoteM-neutral text-text-general-quaternary">
          {conversationT("createImage.loading.desc")}
        </p>
      </div>
    </div>
  );
}

export default AIArtLoading;

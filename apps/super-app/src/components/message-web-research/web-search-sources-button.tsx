import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { compositeStyles } from "@/utils/commons/styles";

export interface TWebSearchSourcesButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function WebSearchSourceButton(
  props: TWebSearchSourcesButtonProps
) {
  const { className = "", onClick } = props;
  const conversationT = useTranslations("conversationPage");
  const label = conversationT("webSearch.sources");
  return (
    <Button
      className={compositeStyles(
        "gap-small-0.5! bg-surface-general-glass! py-small-0.5! pl-small-0.75! pr-small-1! text-footnoteM-neutral hover:bg-surface-input-hover! w-fit font-normal",
        className
      )}
      startIcon={
        <div className="rounded-circle bg-surface-inputControl-neutral-default dark:bg-surface-action-inverse-default p-small-0.5 inline-flex size-6 items-center justify-center">
          <Icon name="link" size={16} />
        </div>
      }
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

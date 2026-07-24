import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";

import type { TDeepResearchSourcesButtonProps } from "./types";

export default function DeepResearchSourceButton(
  props: TDeepResearchSourcesButtonProps
) {
  const { onClick } = props;
  const conversationT = useTranslations("conversationPage");
  const label = conversationT("deepResearch.sources");
  return (
    <div className="px-medium-3">
      <Button
        className="gap-small-0.5! bg-surface-general-glass! py-small-0.5! ps-small-0.75! pe-small-1! text-footnoteM-neutral hover:bg-surface-input-hover! w-fit font-normal"
        startIcon={
          <div className="rounded-circle bg-surface-inputControl-neutral-default dark:bg-surface-action-inverse-default p-small-0.5 inline-flex size-6 items-center justify-center">
            <Icon name="link" size={16} />
          </div>
        }
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
}

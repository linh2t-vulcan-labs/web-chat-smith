import { useTranslations } from "next-intl";

import { ButtonV2 } from "@/components/button-v2";
import { Icon } from "@/components/icon";

import type { TToastCitationErrorProps } from "./types";

export default function ToastCitationError(props: TToastCitationErrorProps) {
  const { isShowButton = true, onClick } = props;
  const conversationT = useTranslations("conversationPage");
  const commonT = useTranslations("common");
  const title = conversationT("toast.error.somethingWentWrong");
  const description = conversationT("toast.error.tryAgain");
  const buttonlabel = commonT("cta.tryAgain");

  return (
    <div className="gap-medium-2 rounded-rounded bg-surface-general-bright-overlay px-medium-2 py-medium-1.5 flex w-full overflow-hidden">
      <div className="relative inline-flex items-center">
        <div className="bg-radial-toast-error pointer-events-none absolute top-1/2 start-0 size-[240px] -translate-x-1/2 -translate-y-1/2" />
        <div className="rounded-circle bg-surface-general-bright-overlay p-small-0.5">
          <Icon name="error" size={24} />
        </div>
      </div>
      <div className="gap-small-1 inline-flex flex-1 flex-col">
        <div className="">
          <h1 className="text-bodyM-medium text-text-general-secondary">
            {title}
          </h1>
          <p className="text-footnoteM-neutral text-text-general-tertiary">
            {description}
          </p>
        </div>
        {isShowButton && (
          <div>
            <ButtonV2
              color="secondary"
              size="xxs"
              className="text-footnoteM-neutral!"
              onClick={onClick}
            >
              {buttonlabel}
            </ButtonV2>
          </div>
        )}
      </div>
    </div>
  );
}

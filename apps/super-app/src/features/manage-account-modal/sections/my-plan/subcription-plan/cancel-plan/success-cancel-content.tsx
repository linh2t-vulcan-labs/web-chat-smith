import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import { Link } from "@/i18n/navigation";
import { LINK_NEED_HELP_CONST } from "@/utils/constants/privilege";

import type { TSuccessCancelContentProps } from "./types";

function successCancelDateStrong(chunks: ReactNode) {
  return <span className="typo-v1-body-default-strong">{chunks}</span>;
}

function successCancelContactLink(chunks: ReactNode) {
  return (
    <Link
      href={LINK_NEED_HELP_CONST}
      className="typo-v1-action-inline-md text-v1-text-hierarchy-primary underline"
    >
      {chunks}
    </Link>
  );
}

function successCancelLineBreak() {
  return <br />;
}

export default function SuccessCancelContent(
  props: TSuccessCancelContentProps
) {
  const { expiredAt, onClose } = props;
  const t = useTranslations("myPlan");
  return (
    <div className="gap-v1-structural-section-standard px-v1-structural-component-large pt-v1-structural-section-standard pb-v1-structural-component-medium flex w-full flex-col items-center justify-center">
      <div className="gap-v1-structural-content-tight flex flex-col items-center justify-center">
        <div className="rounded-v1-circle p-v1-structural-component-medium relative flex items-center justify-center">
          <div
            className="bg-v1-surface-status-error-subtle rounded-v1-circle absolute inset-0"
            style={{ opacity: "var(--opacity-de-emphasis, 0.6)" }}
            aria-hidden
          />
          <SvgIcon
            name="circle-check"
            size={68}
            className="text-v1-icons-status-error relative z-10"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="typo-v1-heading-h3 text-v1-text-hierarchy-primary py-v1-structural-component-large text-center">
            {t("successCancel.title")}
          </h1>
          <p className="typo-v1-body-default-normal text-v1-text-hierarchy-secondary text-center">
            {t.rich("successCancel.description", {
              break: successCancelLineBreak,
              contact: successCancelContactLink,
              date: expiredAt,
              strong: successCancelDateStrong,
            })}
          </p>
        </div>
      </div>
      <div className="w-full">
        <Button variant="default" size="l" className="w-full" onClick={onClose}>
          {t("actions.gotIt")}
        </Button>
      </div>
    </div>
  );
}

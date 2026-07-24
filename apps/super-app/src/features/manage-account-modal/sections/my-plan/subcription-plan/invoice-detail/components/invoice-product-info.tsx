import { useTranslations } from "next-intl";

import { Badge } from "@/components/badge-ds";
import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import type { TInvoiceInfo } from "@/features/manage-account-modal/utils";

interface TInvoiceProductInfoProps {
  invoiceInfo: TInvoiceInfo;
  isLargeScreen?: boolean;
  hideViewInvoice?: boolean;
  onViewInvoice: () => void;
}

export function InvoiceProductInfo(props: Readonly<TInvoiceProductInfoProps>) {
  const {
    invoiceInfo,
    hideViewInvoice = false,
    isLargeScreen = true,
    onViewInvoice,
  } = props;
  const myPlanT = useTranslations("myPlan");

  const t = useTranslations("myPlan");

  return (
    <div className="flex w-full justify-between">
      <div className="gap-v1-structural-component-large flex w-full flex-col">
        <div className="flex w-full items-start justify-between md:items-center">
          <span className="gap-v1-structural-content-tight typo-v1-markdown-h1 text-v1-level-gold-text flex flex-row items-center">
            {invoiceInfo.productName}
            <Badge.Level color="gold" size="md">
              <SvgIcon name="gold" size={16} /> {t("notice.badgePro")}
            </Badge.Level>
          </span>
          {isLargeScreen && !hideViewInvoice ? (
            <Button
              variant="outline"
              size="s"
              className="text-v1-action-text-secondary h-fit text-nowrap"
              onClick={onViewInvoice}
            >
              {myPlanT("actions.viewInvoice")}
            </Button>
          ) : null}
        </div>

        <div className="flex w-full flex-col">
          {/* Note: GU-1134 temporarily hidden this price */}
          {/* <span className="text-bodyM-highlight text-text-general-secondary md:text-bodyL-highlight">
            {invoiceInfo.productPrice}{" "}
            <span className="text-footnoteM-neutral md:text-bodyS-neutral">
              / {invoiceInfo.durationUnitLabel}
            </span>
          </span> */}
          <p className="typo-v1-title-md-light text-v1-text-hierarchy-primary">
            {myPlanT("invoice.billingDate")}
          </p>
          <p className="typo-v1-caption-mdhelper-text text-v1-text-hierarchy-secondary">
            {invoiceInfo.createdAt}
          </p>
        </div>
        {!isLargeScreen && !hideViewInvoice && (
          <Button
            variant="outline"
            size="l"
            className="text-v1-action-text-secondary w-full"
            onClick={onViewInvoice}
          >
            {myPlanT("actions.viewInvoice")}
          </Button>
        )}
      </div>
    </div>
  );
}

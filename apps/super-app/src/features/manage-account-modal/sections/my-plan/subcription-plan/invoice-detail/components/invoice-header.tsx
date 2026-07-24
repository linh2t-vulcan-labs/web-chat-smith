"use client";

import { useTranslations } from "next-intl";

import type { TInvoiceInfo } from "@/features/manage-account-modal/utils";
import {
  mappingPaymentTransactionStatusColor,
  mappingPaymentTransactionStatusLabel,
} from "@/utils/mappers/payment";

import { PlanStatusTag } from "../../../plan-status-tag";
import { ModalHeader } from "../../modal-header";

interface TInvoiceHeaderProps {
  invoiceInfo: TInvoiceInfo;
  onClose: () => void;
}

export function InvoiceHeader(props: Readonly<TInvoiceHeaderProps>) {
  const { invoiceInfo, onClose } = props;
  const t = useTranslations("myPlan");

  return (
    <ModalHeader
      onClose={onClose}
      className="md:pl-v1-structural-section-compact! md:py-v1-structural-component-medium! h-15 px-0! py-0! md:h-full"
      contentClassName="pl-v1-structural-content-relaxed md:pl-0!"
      title={
        <span className="gap-v1-structural-component-micro typo-v1-heading-h3 text-v1-text-hierarchy-primary flex w-full items-center">
          {t("invoice.title")} {invoiceInfo.invoiceNumber}
          <PlanStatusTag
            size="sm"
            color={mappingPaymentTransactionStatusColor(invoiceInfo.status)}
            label={t(
              `paymentTransactionStatus.${mappingPaymentTransactionStatusLabel(invoiceInfo.status)}`
            )}
            className="ms-v1-structural-component-micro"
          />
        </span>
      }
    />
  );
}

import { Separator } from "radix-ui";

import { cn } from "@/components/utils/cn";
import { ECheckoutSessionMode } from "@/core/models/payment";
import type { TInvoiceInfo } from "@/features/manage-account-modal/utils";

import type { TInvoiceRow } from "../types";
import { InvoiceHeader } from "./invoice-header";
import { InvoiceProductInfo } from "./invoice-product-info";
import { InvoiceSummary } from "./invoice-summary";
import { InvoiceTable } from "./invoice-table";
import { PaymentMethodSection } from "./payment-method-section";

interface TInvoiceDetailContentProps {
  invoiceInfo: TInvoiceInfo;
  tableInvoiceData: TInvoiceRow[];
  isLargeScreen: boolean;
  transactionMode?: ECheckoutSessionMode;
  scrollable?: boolean;
  onClose: () => void;
  onViewInvoice: () => void;
}

export function InvoiceDetailContent(
  props: Readonly<TInvoiceDetailContentProps>
) {
  const {
    invoiceInfo,
    tableInvoiceData,
    isLargeScreen,
    transactionMode,
    scrollable = false,
    onClose,
    onViewInvoice,
  } = props;

  const hiddenViewInvoiceMode = [
    ECheckoutSessionMode.CHECKOUT_SESSION_MODE_SUBSCRIPTION,
    ECheckoutSessionMode.CHECKOUT_SESSION_MODE_PAYMENT,
    ECheckoutSessionMode.CHECKOUT_SESSION_MODE_PAYMENT_METHOD_CHANGE,
  ];

  return (
    <div
      className={cn("flex flex-col", scrollable && "h-full overflow-hidden")}
    >
      <InvoiceHeader invoiceInfo={invoiceInfo} onClose={onClose} />
      <div
        className={cn(
          "p-v1-structural-content-relaxed md:px-v1-structural-section-compact md:pb-v1-structural-section-standard w-full md:pt-0",
          scrollable && "flex-1 overflow-y-auto"
        )}
      >
        <InvoiceProductInfo
          invoiceInfo={invoiceInfo}
          isLargeScreen={isLargeScreen}
          hideViewInvoice={
            transactionMode !== undefined &&
            hiddenViewInvoiceMode.includes(transactionMode) &&
            invoiceInfo.totalAmount === 0
          }
          onViewInvoice={onViewInvoice}
        />
        <Separator.Root
          className="my-v1-structural-component-large bg-v1-border-status-divider-high h-px w-full"
          orientation="horizontal"
        />
        <PaymentMethodSection invoiceInfo={invoiceInfo} />
        <Separator.Root
          className="my-v1-structural-component-large bg-v1-border-status-divider-high h-px w-full"
          orientation="horizontal"
        />
        <InvoiceTable isLargeScreen={isLargeScreen} data={tableInvoiceData} />
        <Separator.Root
          className="my-v1-structural-component-large bg-v1-border-status-divider-high h-px w-full"
          orientation="horizontal"
        />
        <InvoiceSummary
          isLargeScreen={isLargeScreen}
          invoiceInfo={invoiceInfo}
        />
      </div>
    </div>
  );
}

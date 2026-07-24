import { LoadingProcessing } from "@/components/loading-icon";
import { Modal } from "@/components/modal";
import { Sheet, SheetContent } from "@/components/sheet";
import { MODAL_Z_INDEX } from "@/config/z-index";
import {
  useGetDetailTransaction,
  useGetPaymentInvoice,
} from "@/features/manage-account-modal/hooks";
import { useMediaQuery } from "@/hooks/use-media-query";

import { InvoiceDetailContent } from "./components";
import { useInvoiceData } from "./hooks";
import type { TInvoiceDetailProps } from "./types";

function NotFoundState() {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="text-bodyM-neutral text-text-general-tertiary">
        No transaction found
      </span>
    </div>
  );
}

export default function InvoiceDetail(props: Readonly<TInvoiceDetailProps>) {
  const { open, transactionId, transactionMode, onClose } = props;

  const { data, isLoading } = useGetDetailTransaction({
    transactionId,
    transactionMode,
  });
  const getPaymentInvoiceMutation = useGetPaymentInvoice(transactionId);
  const { invoiceInfo, tableInvoiceData } = useInvoiceData(data);

  const isPending = getPaymentInvoiceMutation.isPending || isLoading;
  const showInvoiceContent = Boolean(data && invoiceInfo);
  const showNotFoundEmptyState = !isLoading && !showInvoiceContent;

  const isLargeScreen = useMediaQuery("md");

  const handleViewInvoice = () => {
    getPaymentInvoiceMutation.mutate();
  };

  if (isLargeScreen) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        zIndex={MODAL_Z_INDEX.MANAGE_ACCOUNT}
        containerClassName="rounded-v1-xl thickness-thin! border-v1-border-structural-default bg-v1-surface-hierarchy-raised md:w-[900px] md:max-w-[900px]"
        isPreventClickOutside
      >
        {isPending && <LoadingProcessing isSpinning />}
        {showInvoiceContent && invoiceInfo && (
          <InvoiceDetailContent
            invoiceInfo={invoiceInfo}
            tableInvoiceData={tableInvoiceData}
            transactionMode={transactionMode}
            isLargeScreen
            onClose={onClose}
            onViewInvoice={handleViewInvoice}
          />
        )}
        {showNotFoundEmptyState && <NotFoundState />}
      </Modal>
    );
  }

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-v1-xl thickness-thin! border-v1-border-structural-default bg-v1-surface-hierarchy-container-low flex h-[90svh] flex-col overflow-hidden"
      >
        {isPending && <LoadingProcessing isSpinning />}
        {showInvoiceContent && invoiceInfo && (
          <InvoiceDetailContent
            invoiceInfo={invoiceInfo}
            tableInvoiceData={tableInvoiceData}
            transactionMode={transactionMode}
            isLargeScreen={false}
            scrollable
            onClose={onClose}
            onViewInvoice={handleViewInvoice}
          />
        )}
        {showNotFoundEmptyState && <NotFoundState />}
      </SheetContent>
    </Sheet>
  );
}

import { useTranslations } from "next-intl";
import { Separator } from "radix-ui";

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/features/manage-account-modal/components/table";
import type { TInvoiceInfo } from "@/features/manage-account-modal/utils";

interface TInvoiceSummaryProps {
  invoiceInfo: TInvoiceInfo;
  isLargeScreen: boolean;
}

export function InvoiceSummary(props: Readonly<TInvoiceSummaryProps>) {
  const { isLargeScreen, invoiceInfo } = props;
  const myPlanT = useTranslations("myPlan");

  if (isLargeScreen) {
    return (
      <Table className="border-spacing-y-medium-1.5 w-full table-fixed border-separate">
        <colgroup>
          <col style={{ width: "400px" }} />
          <col style={{ width: "auto" }} />
          <col style={{ width: "auto" }} />
          <col style={{ width: "auto" }} />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableCell />
            <TableCell />
            <TableCell className="typo-v1-title-md-normal text-v1-text-hierarchy-tertiary p-0!">
              {myPlanT("invoice.subtotal")}
            </TableCell>
            <TableCell className="typo-v1-title-md-normal text-v1-text-hierarchy-primary p-0! text-end">
              {invoiceInfo.subTotal}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell />
            <TableCell className="typo-v1-title-md-normal text-v1-text-hierarchy-tertiary p-0!">
              {myPlanT("invoice.gst")}
            </TableCell>
            <TableCell className="typo-v1-title-md-normal text-v1-text-hierarchy-primary p-0! text-end">
              {invoiceInfo.tax}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell />
            <TableCell className="typo-v1-title-md-normal text-v1-text-hierarchy-tertiary p-0!">
              {myPlanT("invoice.total")}
            </TableCell>
            <TableCell className="typo-v1-title-md-normal text-v1-text-hierarchy-primary p-0! text-end">
              {invoiceInfo.total}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="rounded-v1-medium bg-v1-surface-glass-dark-whisper p-v1-structural-content-relaxed flex w-full flex-col">
      <div className="gap-v1-structural-content-relaxed inline-grid w-full [grid-auto-rows:fit-content(100%)] [grid-template-columns:repeat(2,minmax(0,1fr))]">
        <p className="typo-v1-title-md-normal text-v1-text-hierarchy-tertiary">
          {myPlanT("invoice.subtotal")}
        </p>
        <p className="typo-v1-title-md-normal text-v1-text-hierarchy-primary text-end">
          {invoiceInfo.subTotal}
        </p>

        <p className="typo-v1-title-md-normal text-v1-text-hierarchy-tertiary">
          {myPlanT("invoice.gst")}
        </p>
        <p className="typo-v1-title-md-normal text-v1-text-hierarchy-primary text-end">
          {invoiceInfo.tax}
        </p>
      </div>

      <Separator.Root
        className="bg-v1-border-status-divider-high my-v1-structural-content-relaxed h-px w-full"
        orientation="horizontal"
      />

      <div className="inline-grid w-full [grid-auto-rows:fit-content(100%)] [grid-template-columns:repeat(2,minmax(0,1fr))]">
        <p className="typo-v1-title-md-normal text-v1-text-hierarchy-tertiary">
          {myPlanT("invoice.total")}
        </p>
        <p className="typo-v1-title-md-normal text-v1-text-hierarchy-primary text-end">
          {invoiceInfo.total}
        </p>
      </div>
    </div>
  );
}

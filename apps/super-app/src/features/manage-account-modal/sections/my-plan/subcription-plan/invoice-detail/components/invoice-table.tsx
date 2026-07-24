import type { CellContext, ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/features/manage-account-modal/components/table";
import { mappingPaymentTransactionOriginLabel } from "@/utils/mappers/payment";

import { PlanStatusTag } from "../../../plan-status-tag";
import type { TInvoiceRow } from "../types";

type TInvoiceTableProps = Readonly<{
  data: TInvoiceRow[];
  isLargeScreen: boolean;
}>;

function ProductCell({ row }: CellContext<TInvoiceRow, unknown>) {
  const myPlanT = useTranslations("myPlan");
  return (
    <div className="gap-small-1 flex flex-col">
      <span className="text-bodyM-neutral text-text-general-secondary">
        {row.original.productName}
      </span>
      <span className="text-bodyS-neutral text-text-general-tertiary">
        {row.original.billingPeriod}
      </span>
      {Boolean(mappingPaymentTransactionOriginLabel(row.original.origin)) && (
        <PlanStatusTag
          color="green"
          label={myPlanT(
            `historyStatus.${mappingPaymentTransactionOriginLabel(row.original.origin)}`
          )}
        />
      )}
    </div>
  );
}

function BillingPeriodMobileCell({
  getValue,
}: CellContext<TInvoiceRow, unknown>) {
  const value = getValue() as string;
  const [startDate, endDate] = value.split(" - ");
  return (
    <>
      {startDate} <br />- {endDate}
    </>
  );
}

function OriginMobileCell({ row }: CellContext<TInvoiceRow, unknown>) {
  const myPlanT = useTranslations("myPlan");
  return mappingPaymentTransactionOriginLabel(row.original.origin) ? (
    <PlanStatusTag
      color="green"
      label={myPlanT(
        `historyStatus.${mappingPaymentTransactionOriginLabel(row.original.origin)}`
      )}
    />
  ) : null;
}

// oxlint-disable-next-line react/react-compiler -- compiler skips memoization here because this component uses @tanstack/react-table, which returns functions that cannot be safely memoized; verified incompatible-library skip, not a correctness issue
export function InvoiceTable(props: Readonly<TInvoiceTableProps>) {
  const { isLargeScreen, data } = props;
  const myPlanT = useTranslations("myPlan");

  // Desktop columns - optimized for larger screens with rich cell rendering
  const invoiceDetailColumns: ColumnDef<TInvoiceRow>[] = useMemo(
    () => [
      {
        accessorKey: "productName",
        cell: ProductCell,
        header: myPlanT("invoice.product"),
        id: "product",
      },
      {
        accessorKey: "quantity",
        header: myPlanT("invoice.qty"),
        id: "quantity",
      },
      {
        accessorKey: "taxPercentage",
        header: myPlanT("invoice.gst"),
        id: "taxPercentage",
      },
      {
        accessorKey: "subTotal",
        header: myPlanT("invoice.amountExclTax"),
        id: "subTotal",
      },
    ],
    [myPlanT]
  );

  // Mobile columns - simplified for mobile view with basic value extraction
  const invoiceDetailMobileColumns: ColumnDef<TInvoiceRow>[] = useMemo(
    () => [
      {
        accessorKey: "productName",
        cell: ({ getValue }) => String(getValue()),
        header: myPlanT("invoice.product"),
        id: "product",
      },
      {
        accessorKey: "billingPeriod",
        cell: BillingPeriodMobileCell,
        header: myPlanT("billing.period"),
        id: "period",
      },
      {
        accessorKey: "quantity",
        cell: ({ getValue }) => String(getValue()),
        header: myPlanT("invoice.qty"),
        id: "quantity",
      },
      {
        accessorKey: "taxPercentage",
        cell: ({ getValue }) => String(getValue()),
        header: myPlanT("invoice.gst"),
        id: "taxPercentage",
      },
      {
        accessorKey: "subTotal",
        cell: ({ getValue }) => String(getValue()),
        header: myPlanT("invoice.amountExclTax"),
        id: "subTotal",
      },
      {
        accessorKey: "origin",
        cell: OriginMobileCell,
        header: myPlanT("billing.type"),
        id: "origin",
      },
    ],
    [myPlanT]
  );

  const table = useReactTable<TInvoiceRow>({
    columns: isLargeScreen ? invoiceDetailColumns : invoiceDetailMobileColumns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLargeScreen) {
    return (
      <Table className="border-spacing-y-medium-1.5 w-full table-fixed border-separate">
        <colgroup>
          <col style={{ width: "400px" }} />
          <col style={{ width: "auto" }} />
          <col style={{ width: "auto" }} />
          <col style={{ width: "auto" }} />
        </colgroup>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="thickness-none! self-stretch"
            >
              {headerGroup.headers.map((header, headerIndex) => {
                const isLastHeader =
                  headerIndex === headerGroup.headers.length - 1;
                return (
                  <TableCell
                    key={header.id}
                    className={clsx(
                      "typo-v1-title-md-normal text-v1-text-hierarchy-tertiary p-0!",
                      isLastHeader && "text-right"
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header as React.ReactNode,
                      header.getContext()
                    )}{" "}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="thickness-none! self-stretch">
              {row.getVisibleCells().map((cell, cellIndex) => {
                const isLastCell =
                  cellIndex === row.getVisibleCells().length - 1;
                return (
                  <TableCell
                    key={cell.id}
                    className={clsx(
                      "py-small-0.25 typo-v1-title-md-normal text-v1-text-hierarchy-primary px-0 align-baseline!",
                      isLastCell && "text-right"
                    )}
                  >
                    {flexRender(
                      cell.column.columnDef.cell as React.ReactNode,
                      cell.getContext()
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  const headers = table.getHeaderGroups()[0]?.headers ?? [];
  const firstRowCells = table.getRowModel().rows[0]?.getVisibleCells() ?? [];

  return (
    <div className="rounded-v1-medium bg-v1-surface-glass-dark-whisper gap-v1-structural-content-relaxed p-v1-structural-content-relaxed inline-grid w-full [grid-auto-rows:fit-content(100%)] [grid-template-columns:repeat(2,minmax(0,1fr))] self-stretch">
      {headers.flatMap((header, index) => [
        <p
          key={`label-${header.id}`}
          className="typo-v1-title-md-normal text-v1-text-hierarchy-tertiary"
        >
          {flexRender(
            header.column.columnDef.header as React.ReactNode,
            header.getContext()
          )}
        </p>,
        <p
          key={`value-${header.id}`}
          className="typo-v1-title-md-normal text-v1-text-hierarchy-primary text-end text-nowrap"
        >
          {firstRowCells[index] &&
            flexRender(
              firstRowCells[index].column.columnDef.cell as React.ReactNode,
              firstRowCells[index].getContext()
            )}
        </p>,
      ])}
    </div>
  );
}

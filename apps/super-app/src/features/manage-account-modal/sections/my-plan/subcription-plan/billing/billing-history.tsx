"use client";

import { IconsTriangleDown2Icon } from "@cs/icons/icons-triangle-down-2";
import type { ColumnDef, PaginationState, Row } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/button-ds";
import type { PaymentTransactionItemModel } from "@/core/models/payment";
import { ECheckoutSessionMode } from "@/core/models/payment";
import { Pagination } from "@/features/manage-account-modal/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/features/manage-account-modal/components/table";
import { useGetTransactionsOfSubscription } from "@/features/manage-account-modal/hooks";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatIsoToShortMonthDate } from "@/utils/commons/date-time";
import { compositeStyles } from "@/utils/commons/styles";
import {
  getCurrencySymbol,
  mappingPaymentTransactionStatusColor,
  mappingPaymentTransactionStatusLabel,
} from "@/utils/mappers/payment";

import { PlanStatusTag } from "../../plan-status-tag";
import type { TBillingHistoryProps } from "../types";
import { BillingHistorySkeleton } from "./billing-history-skeleton";
import { BILLING_HISTORY_PAGE_SIZE } from "./constants";

interface ColumnLayoutMeta {
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  cellClassName?: string;
  cellStyle?: CSSProperties;
}

const getColumnLayoutMeta = (meta: unknown): ColumnLayoutMeta | undefined =>
  meta as ColumnLayoutMeta | undefined;

const InvoiceDetail = dynamic(() => import("../invoice-detail/invoice-detail"));

const INITIAL_PAGE_INDEX = 0;

const toApiPage = (pageIndex: number): number => pageIndex + 1;

const isExistNextPage = (pageSize: number, totalRecords: number) => {
  if (pageSize <= 0) {
    return false;
  }
  return Math.ceil(totalRecords / pageSize) > 1;
};

type TMyPlanTranslator = ReturnType<typeof useTranslations<"myPlan">>;
type TOnClickInvoiceDetailModal = (
  transactionId: string,
  transactionMode: ECheckoutSessionMode
) => void;

function CreatedAtCell({
  row,
}: Readonly<{ row: Row<PaymentTransactionItemModel> }>) {
  return (
    <span className="typo-v1-title-md-normal text-v1-text-hierarchy-primary">
      {formatIsoToShortMonthDate(row.original.createdAt)}
    </span>
  );
}

function AmountCell({
  row,
}: Readonly<{ row: Row<PaymentTransactionItemModel> }>) {
  return (
    <span className="typo-v1-title-md-normal text-v1-text-hierarchy-primary">
      {getCurrencySymbol(row.original.currency)}
      {row.original.amountReceived}
    </span>
  );
}

function DescriptionCell({
  row,
}: Readonly<{ row: Row<PaymentTransactionItemModel> }>) {
  return (
    <div className="typo-v1-caption-mdhelper-text text-v1-text-hierarchy-secondary line-clamp-2 text-wrap">
      {row.original.description}
    </div>
  );
}

function StatusCell({
  row,
  t,
}: Readonly<{ row: Row<PaymentTransactionItemModel>; t: TMyPlanTranslator }>) {
  return (
    <PlanStatusTag
      size="sm"
      color={mappingPaymentTransactionStatusColor(row.original.status)}
      label={t(
        `paymentTransactionStatus.${mappingPaymentTransactionStatusLabel(row.original.status)}`
      )}
    />
  );
}

function ActionsCell({
  row,
  t,
  onClickInvoiceDetailModal,
}: Readonly<{
  row: Row<PaymentTransactionItemModel>;
  t: TMyPlanTranslator;
  onClickInvoiceDetailModal: TOnClickInvoiceDetailModal;
}>) {
  if (row.original.mode === ECheckoutSessionMode.CHECKOUT_SESSION_MODE_REFUND) {
    return null;
  }
  return (
    <Button
      variant="ghost"
      className="!typo-v1-action-inline-xs text-v1-text-hierarchy-secondary underline before:hidden"
      onClick={() =>
        onClickInvoiceDetailModal(
          row.original.vendorPaymentId,
          row.original.mode
        )
      }
    >
      {t("actions.viewInvoice")}
    </Button>
  );
}

function MobileCreatedAtCell({
  row,
}: Readonly<{ row: Row<PaymentTransactionItemModel> }>) {
  return (
    <div className="gap-v1-content-micro flex w-full flex-col items-start justify-start">
      <div className="typo-v1-title-md-normal text-v1-text-hierarchy-primary">
        {formatIsoToShortMonthDate(row.original.createdAt)}
      </div>
      <div className="typo-v1-caption-mdhelper-text text-v1-text-hierarchy-secondary line-clamp-2 w-full text-wrap">
        {row.original.description}
      </div>
    </div>
  );
}

function MobilePriceCell({
  row,
  t,
  onClickInvoiceDetailModal,
}: Readonly<{
  row: Row<PaymentTransactionItemModel>;
  t: TMyPlanTranslator;
  onClickInvoiceDetailModal: TOnClickInvoiceDetailModal;
}>) {
  return (
    <div className="flex w-full items-center justify-end">
      <div className="flex flex-col items-end justify-between">
        <span className="typo-v1-title-md-normal text-v1-text-hierarchy-primary">
          {getCurrencySymbol(row.original.currency)}
          {row.original.amountReceived}
        </span>
        <PlanStatusTag
          size="sm"
          color={mappingPaymentTransactionStatusColor(row.original.status)}
          label={t(
            `paymentTransactionStatus.${mappingPaymentTransactionStatusLabel(row.original.status)}`
          )}
        />
      </div>
      {/* Note (Redesign): Change to components/svg-icon-ds for SvgIcon. Update new icons */}
      <Button
        variant="ghost"
        iconOnly
        prefixIcon={
          <IconsTriangleDown2Icon
            width={16}
            height={16}
            className="-rotate-90"
          />
        }
        onClick={() =>
          onClickInvoiceDetailModal(
            row.original.vendorPaymentId,
            row.original.mode
          )
        }
      />
    </div>
  );
}

const renderCreatedAtCell = ({
  row,
}: Readonly<{ row: Row<PaymentTransactionItemModel> }>) => (
  <CreatedAtCell row={row} />
);

const renderAmountCell = ({
  row,
}: Readonly<{ row: Row<PaymentTransactionItemModel> }>) => (
  <AmountCell row={row} />
);

const renderDescriptionCell = ({
  row,
}: Readonly<{ row: Row<PaymentTransactionItemModel> }>) => (
  <DescriptionCell row={row} />
);

const createStatusCellRenderer = (t: TMyPlanTranslator) => {
  const StatusCellRenderer = ({
    row,
  }: Readonly<{ row: Row<PaymentTransactionItemModel> }>) => (
    <StatusCell row={row} t={t} />
  );
  StatusCellRenderer.displayName = "StatusCellRenderer";
  return StatusCellRenderer;
};

const createActionsCellRenderer = (
  t: TMyPlanTranslator,
  onClickInvoiceDetailModal: TOnClickInvoiceDetailModal
) => {
  const ActionsCellRenderer = ({
    row,
  }: Readonly<{ row: Row<PaymentTransactionItemModel> }>) => (
    <ActionsCell
      row={row}
      t={t}
      onClickInvoiceDetailModal={onClickInvoiceDetailModal}
    />
  );
  ActionsCellRenderer.displayName = "ActionsCellRenderer";
  return ActionsCellRenderer;
};

const renderMobileCreatedAtCell = ({
  row,
}: Readonly<{ row: Row<PaymentTransactionItemModel> }>) => (
  <MobileCreatedAtCell row={row} />
);

const createMobilePriceCellRenderer = (
  t: TMyPlanTranslator,
  onClickInvoiceDetailModal: TOnClickInvoiceDetailModal
) => {
  const MobilePriceCellRenderer = ({
    row,
  }: Readonly<{ row: Row<PaymentTransactionItemModel> }>) => (
    <MobilePriceCell
      row={row}
      t={t}
      onClickInvoiceDetailModal={onClickInvoiceDetailModal}
    />
  );
  MobilePriceCellRenderer.displayName = "MobilePriceCellRenderer";
  return MobilePriceCellRenderer;
};

// oxlint-disable-next-line react/react-compiler -- compiler skips memoization here because this component uses @tanstack/react-table, which returns functions that cannot be safely memoized; verified incompatible-library skip, not a correctness issue
export function BillingHistory(props: TBillingHistoryProps) {
  const {
    subscriptionId,
    resetPaginationTrigger,
    isBillingTrial: _isBillingTrial,
    onFetchedBillingHistory,
  } = props;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: INITIAL_PAGE_INDEX,
    pageSize: BILLING_HISTORY_PAGE_SIZE,
  });
  const [invoiceDetailModalSetting, setInvoiceDetailModalSetting] = useState<{
    open: boolean;
    transactionId: string;
    transactionMode?: ECheckoutSessionMode;
  }>({
    open: false,
    transactionId: "",
    transactionMode: undefined,
  });
  const isLargeScreen = useMediaQuery("md");
  const t = useTranslations("myPlan");
  const commonT = useTranslations("common");

  useEffect(() => {
    if (resetPaginationTrigger) {
      setPagination({
        pageIndex: INITIAL_PAGE_INDEX,
        pageSize: BILLING_HISTORY_PAGE_SIZE,
      });
    }
  }, [resetPaginationTrigger]);

  const {
    data: billingHistory,
    isLoading,
    isSuccess,
  } = useGetTransactionsOfSubscription({
    limit: pagination.pageSize,
    page: toApiPage(pagination.pageIndex),
    subscriptionId,
  });

  useEffect(() => {
    if (isSuccess && billingHistory?.data?.length) {
      const isExitsRefundTxt =
        billingHistory?.data?.findIndex(
          (item) =>
            item.mode === ECheckoutSessionMode.CHECKOUT_SESSION_MODE_REFUND
        ) > -1;
      onFetchedBillingHistory?.(isExitsRefundTxt);
    }
  }, [isSuccess, billingHistory, onFetchedBillingHistory]);

  const memoizedBillingHistory: PaymentTransactionItemModel[] = useMemo(
    () => billingHistory?.data || [],
    [billingHistory]
  );

  const onClickInvoiceDetailModal = useCallback(
    (transactionId: string, transactionMode: ECheckoutSessionMode) => {
      setInvoiceDetailModalSetting({
        open: true,
        transactionId,
        transactionMode,
      });
    },
    []
  );

  const onCloseInvoiceDetailModal = () => {
    setInvoiceDetailModalSetting({
      open: false,
      transactionId: "",
    });
  };

  const desktopColumns: ColumnDef<PaymentTransactionItemModel>[] = useMemo(
    () => [
      {
        accessorKey: "createdAt",
        cell: renderCreatedAtCell,
        meta: {
          maxWidth: 150,
          width: 150,
        },
      },
      {
        accessorKey: "amount",
        cell: renderAmountCell,
        meta: {
          maxWidth: 120,
          width: 120,
        },
      },
      {
        accessorKey: "description",
        cell: renderDescriptionCell,
        meta: {
          maxWidth: 120,
          width: 120,
        },
      },
      {
        accessorKey: "status",
        cell: createStatusCellRenderer(t),
        meta: {
          maxWidth: 70,
          width: 70,
        },
      },
      {
        cell: createActionsCellRenderer(t, onClickInvoiceDetailModal),
        enableHiding: true,
        id: "actions",
        meta: {
          cellClassName: "text-right",
          maxWidth: 140,
          width: 140,
        },
      },
    ],
    [t, onClickInvoiceDetailModal]
  );

  const mobileColumns: ColumnDef<PaymentTransactionItemModel>[] = useMemo(
    () => [
      {
        accessorKey: "createdAt",
        cell: renderMobileCreatedAtCell,
      },
      {
        accessorKey: "price",
        cell: createMobilePriceCellRenderer(t, onClickInvoiceDetailModal),
      },
    ],
    [t, onClickInvoiceDetailModal]
  );

  const totalRecords = Number(billingHistory?.totalRecords ?? 0);
  const isShowPagination = isExistNextPage(pagination.pageSize, totalRecords);

  const table = useReactTable({
    columns: isLargeScreen ? desktopColumns : mobileColumns,
    data: memoizedBillingHistory,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onPaginationChange: setPagination,
    rowCount: totalRecords,
    state: {
      pagination,
    },
  });

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: page - 1,
    }));
  };

  return (
    <div className="gap-v1-structural-content-relaxed flex w-full flex-col">
      <div className="flex w-full flex-col">
        <h3 className="typo-v1-title-md-normal text-v1-text-hierarchy-primary">
          {t("billing.billingHistoryTitle")}
        </h3>
        <span className="typo-v1-caption-mdhelper-text text-v1-text-hierarchy-secondary">
          {totalRecords > 0
            ? t("billing.invoicesCount", {
                count: totalRecords,
              })
            : t("billing.noInvoices")}
        </span>
      </div>

      {isLoading ? (
        <BillingHistorySkeleton />
      ) : (
        <>
          <Table className="w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-(--spacing-v1-structural-content-relaxed)">
            <colgroup>
              {isLargeScreen ? (
                <>
                  <col style={{ width: "200px" }} />
                  <col style={{ width: "160px" }} />
                  <col style={{ width: "180px" }} />
                  <col style={{ width: "80px" }} />
                  <col style={{ width: "auto" }} />
                </>
              ) : (
                <>
                  <col className="w-8/12" />
                  <col className="w-4/12" />
                </>
              )}
            </colgroup>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={compositeStyles("thickness-none! self-stretch")}
                >
                  {row.getVisibleCells().map((cell, index, arr) => {
                    const meta = getColumnLayoutMeta(
                      cell.column.columnDef.meta
                    );
                    const isLastCell = index === arr.length - 1;

                    return (
                      <TableCell
                        key={cell.id}
                        className={compositeStyles(
                          "h-v1-8 md:h-v1-7 p-0! align-baseline!",
                          !isLastCell && "pr-v1-structural-component-micro!",
                          meta?.cellClassName
                        )}
                        style={meta?.cellStyle}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {isShowPagination && (
            <Pagination
              currentPage={pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              siblingCount={isLargeScreen ? 1 : 0}
              onPageChange={handlePageChange}
              nextLabel={commonT("cta.next")}
              previousLabel={commonT("cta.back")}
            />
          )}
        </>
      )}

      {invoiceDetailModalSetting.open && (
        <InvoiceDetail
          open={invoiceDetailModalSetting.open}
          transactionMode={invoiceDetailModalSetting.transactionMode}
          transactionId={invoiceDetailModalSetting.transactionId}
          onClose={onCloseInvoiceDetailModal}
        />
      )}
    </div>
  );
}

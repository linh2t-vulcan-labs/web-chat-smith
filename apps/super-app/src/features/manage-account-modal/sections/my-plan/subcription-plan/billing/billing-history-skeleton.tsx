"use client";

import { Skeleton } from "@/components/skeleton";
import { SVGIcon } from "@/components/svg-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/features/manage-account-modal/components/table";
import { useMediaQuery } from "@/hooks/use-media-query";
import { compositeStyles } from "@/utils/commons/styles";

import { BILLING_HISTORY_PAGE_SIZE } from "./constants";

type TBillingHistorySkeletonProps = Readonly<{
  rowCount?: number;
}>;

/** Matches loaded `TableCell` rhythm: gutter between columns, none after the last cell. */
const TABLE_CELL_BASE = "h-v1-8 md:h-v1-7 p-0! align-baseline!";

const TABLE_CELL_WITH_GUTTER = compositeStyles(
  TABLE_CELL_BASE,
  "pr-v1-structural-component-micro!"
);

const skeletonBarIndexes = (count: number) =>
  Array.from({ length: count }, (_, i) => i);

const MOBILE_TABLE_ROW_SPACING =
  "border-spacing-y-(--spacing-v1-structural-content-relaxed)" as const;

const MOBILE_SKELETON_CELL_LEFT = compositeStyles(
  "h-[40px] p-0! align-baseline! pr-v1-structural-component-micro! flex flex-col justify-between items-start"
);

const MOBILE_SKELETON_CELL_RIGHT = compositeStyles(
  "h-[40px] p-0! align-baseline! flex items-center justify-end gap-v1-structural-component-micro"
);

export function BillingHistorySkeleton(props: TBillingHistorySkeletonProps) {
  const isLargeScreen = useMediaQuery("md");
  const { rowCount = BILLING_HISTORY_PAGE_SIZE } = props;
  const rows = skeletonBarIndexes(rowCount);

  if (isLargeScreen) {
    return <BillingHistoryDesktopSkeleton rows={rows} />;
  }

  return <BillingHistoryMobileSkeleton rows={rows} />;
}

/** Mirrors `desktopColumns`: date, amount, description, status, actions. */
function BillingHistoryDesktopSkeleton({
  rows,
}: Readonly<{ rows: readonly number[] }>) {
  return (
    <Table className="w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-(--spacing-v1-structural-content-relaxed)">
      <colgroup>
        <col style={{ width: "200px" }} />
        <col style={{ width: "160px" }} />
        <col style={{ width: "180px" }} />
        <col style={{ width: "80px" }} />
        <col style={{ width: "auto" }} />
      </colgroup>
      <TableBody>
        {rows.map((rowIndex) => (
          <TableRow
            key={`billing-history-skeleton-desktop-${rowIndex}`}
            className="thickness-none! self-stretch"
          >
            <TableCell className={TABLE_CELL_WITH_GUTTER}>
              <Skeleton className="w-[92px]" />
            </TableCell>
            <TableCell className={TABLE_CELL_WITH_GUTTER}>
              <Skeleton className="w-[72px]" />
            </TableCell>
            <TableCell className={TABLE_CELL_WITH_GUTTER}>
              <div className="gap-v1-content-micro flex flex-col">
                <Skeleton className="w-[140px]" />
                <Skeleton className="w-[110px]" />
              </div>
            </TableCell>
            <TableCell className={TABLE_CELL_WITH_GUTTER}>
              <Skeleton className="w-[64px]" />
            </TableCell>
            <TableCell
              className={compositeStyles(TABLE_CELL_BASE, "text-right")}
            >
              <Skeleton className="ms-auto w-[120px]" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** Mirrors `mobileColumns`: left (date + description), right (amount + status + chevron). */
function BillingHistoryMobileSkeleton({
  rows,
}: Readonly<{ rows: readonly number[] }>) {
  return (
    <Table
      className={compositeStyles(
        "w-full table-fixed border-separate border-spacing-x-0",
        MOBILE_TABLE_ROW_SPACING
      )}
    >
      <colgroup>
        <col className="w-8/12" />
        <col className="w-4/12" />
      </colgroup>
      <TableBody>
        {rows.map((rowIndex) => (
          <TableRow
            key={`billing-history-skeleton-mobile-${rowIndex}`}
            className="thickness-none! self-stretch"
          >
            <TableCell className={MOBILE_SKELETON_CELL_LEFT}>
              <Skeleton className="h-[12px] w-[100px]" />
              <Skeleton className="h-[12px] w-[168px]" />
            </TableCell>
            <TableCell className={MOBILE_SKELETON_CELL_RIGHT}>
              <div className="flex h-[40px] flex-col items-end justify-between">
                <Skeleton className="h-[12px] w-[40px]" />
                <Skeleton className="h-[12px] w-[53px]" />
              </div>
              <span
                className="text-v1-icon-primary flex shrink-0 items-center justify-center"
                aria-hidden
              >
                <SVGIcon
                  src="/icons/triangle-down-2.svg"
                  width={16}
                  height={16}
                  className="-rotate-90"
                />
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

"use client";

import React, { useMemo } from "react";

import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import { useMediaQuery } from "@/hooks/use-media-query";

import type { PaginationProps } from "./types";

type PageItem = number | "ellipsis";

function buildPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): PageItem[] {
  const maxWithoutEllipsis = siblingCount * 2 + 5;
  if (totalPages <= maxWithoutEllipsis) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + 2 * siblingCount;
    return [
      ...Array.from({ length: leftCount }, (_, i) => i + 1),
      "ellipsis",
      totalPages,
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + 2 * siblingCount;
    return [
      1,
      "ellipsis",
      ...Array.from(
        { length: rightCount },
        (_, i) => totalPages - rightCount + 1 + i
      ),
    ];
  }

  return [
    1,
    "ellipsis",
    ...Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, i) => leftSibling + i
    ),
    "ellipsis",
    totalPages,
  ];
}

export function Pagination({
  currentPage,
  totalPages,
  nextLabel = "Next",
  previousLabel = "Back",
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className,
}: PaginationProps) {
  const pageRange = useMemo(
    () => buildPageRange(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount]
  );

  const isLargeScreen = useMediaQuery("md");

  const buttonSize = isLargeScreen ? "xs" : "xxs";

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn(
        "md:gap-v1-structural-content-tight flex w-full items-center justify-center select-none",
        className
      )}
    >
      {showFirstLast && (
        <Button
          variant="utility"
          size={buttonSize}
          iconOnly
          disabled={isFirstPage}
          onClick={() => onPageChange(1)}
          aria-label="First page"
          className="disabled:before:bg-transparent"
          prefixIcon={<SvgIcon name="chevron-left-to-line" size={24} />}
        />
      )}

      <Button
        variant="utility"
        size={buttonSize}
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        className="disabled:before:bg-transparent"
        prefixIcon={<SvgIcon name="chevron-left" size={16} />}
      >
        {previousLabel}
      </Button>

      {pageRange.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="typo-v1-action-xs-light text-v1-action-text-tertiary inline-flex min-w-[28px] items-center justify-center"
            aria-hidden
          >
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant="ghost"
            size={buttonSize}
            className={cn(
              "min-w-[28px]",
              page === currentPage && "bg-v1-surface-overlay-interactive-hover"
            )}
            onClick={() => page !== currentPage && onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {String(page)}
          </Button>
        )
      )}

      <Button
        variant="utility"
        size={buttonSize}
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        className="disabled:before:bg-transparent"
        suffixIcon={<SvgIcon name="chevron-right" size={16} />}
      >
        {nextLabel}
      </Button>

      {showFirstLast && (
        <Button
          variant="utility"
          size={buttonSize}
          iconOnly
          disabled={isLastPage}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
          className="disabled:before:bg-transparent"
          prefixIcon={<SvgIcon name="chevron-right-to-line" size={24} />}
        />
      )}
    </nav>
  );
}

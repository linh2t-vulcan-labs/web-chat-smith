import { useMemo } from "react";

import type { DetailTransactionItemModel } from "@/core/models/payment";
import type { TInvoiceInfo } from "@/features/manage-account-modal/utils";
import { InvoiceDataTransformer } from "@/features/manage-account-modal/utils";

import type { TInvoiceRow } from "../types";

export function useInvoiceData(data: DetailTransactionItemModel | undefined) {
  const invoiceInfo = useMemo<TInvoiceInfo | null>(
    () => InvoiceDataTransformer.transform(data),
    [data]
  );

  const tableInvoiceData = useMemo<TInvoiceRow[]>(() => {
    if (!invoiceInfo || !data) {
      return [];
    }

    return [
      {
        billingPeriod: invoiceInfo.billingPeriod,
        createdAt: invoiceInfo.createdAt,
        discount: invoiceInfo.discount,
        fee: invoiceInfo.fee,
        origin: data.paddle.origin,
        productName: invoiceInfo.productName,
        quantity: invoiceInfo.quantity,
        status: invoiceInfo.status,
        subTotal: invoiceInfo.subTotal,
        tax: invoiceInfo.tax,
        taxPercentage: invoiceInfo.taxPercentage,
        total: invoiceInfo.total,
      },
    ];
  }, [invoiceInfo, data]);

  return {
    invoiceInfo,
    tableInvoiceData,
  };
}

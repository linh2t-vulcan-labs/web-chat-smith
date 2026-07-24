export type TUpdatePaymentMethodModalProps = Readonly<{
  open: boolean;
  transactionId: string | null;
  subscriptionId: string | null;
  onClose: () => void;
}>;

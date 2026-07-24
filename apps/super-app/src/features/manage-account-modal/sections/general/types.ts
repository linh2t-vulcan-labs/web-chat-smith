import type { TAvatarProps } from "@/components/avatar/types";
import type { ButtonProps } from "@/components/button-ds";

export type TGeneralTabGroupContentProps = Readonly<{
  title: string;
  description: string;
  items: TGeneralTabContentProps[];
}>;

export type TConfirmModalType =
  | "signout"
  | "delete-account-no-active-subscription"
  | "delete-account-with-active-subscription-from-mobile"
  | "delete-account-with-active-subscription-from-web"
  | "";

export type TGeneralTabContentProps = Readonly<{
  title: string;
  description: string;
  avatarProps?: TAvatarProps;
  prefixNode?: React.ReactNode;
}>;

export type TConfirmModalProps = Readonly<{
  open: boolean;
  type: TConfirmModalType;
  onClose: () => void;
  onConfirm: () => void;
}>;

export type TConfirmModalConfig = Readonly<{
  title: string;
  description: string | React.ReactNode | null;
  actionLabel: string;
  variant: ButtonProps["variant"];
  actionClassName?: string;
  requiresConfirmation?: boolean;
  cancelText?: string;
  confirmText?: string;
}>;

import type { Dialog } from "radix-ui";

export interface TErrorLogin {
  err: string;
  message: string;
}

export interface TMessageLoginPopup {
  open: boolean;
}

export interface TLoginFlowMainProps {
  isOpenLoginModal: boolean;
  dialogContentProps?: Dialog.DialogContentProps;
  onClose?: () => void;
}

"use client";

import dynamic from "next/dynamic";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useModalShow } from "../hooks/use-modal-show";
import type {
  ConfirmationOptionType,
  ConfirmationServiceType,
} from "../types/confirmation";
import { createDeferred } from "../utils/deferred";
import type { Deferred } from "../utils/deferred";

// Rendered closed by default and only opened on demand, so splitting it out
// of the root bundle defers its cost (radix Dialog) off the critical path.
const ConfirmDialog = dynamic(
  async () => {
    const mod = await import("../component/confirm-dialog");
    return mod.ConfirmDialog;
  },
  { ssr: false }
);

// Confirmation Context
const ConfirmationContext = createContext<
  (options: ConfirmationOptionType) => Promise<boolean>
>(() => Promise.resolve(false));

export const ConfirmationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setShow, show, onHide } = useModalShow();
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationOptionType>({});

  const awaitingPromiseRef = useRef<Deferred<boolean> | null>(null);

  const openConfirmation = useCallback(
    (options: ConfirmationOptionType): Promise<boolean> => {
      setConfirmationState(options);
      setShow(true);
      const deferred = createDeferred<boolean>();
      awaitingPromiseRef.current = deferred;
      return deferred.promise;
    },
    [setShow]
  );

  const handleClose = () => {
    if (awaitingPromiseRef.current) {
      if (confirmationState?.catchOnCancel) {
        awaitingPromiseRef.current.reject();
      } else {
        awaitingPromiseRef.current.resolve(false);
      }
    }
    setConfirmationState({});
    onHide();
  };

  const handleOk = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve(true);
    }
    setConfirmationState({});
    onHide();
  };

  return (
    <ConfirmationContext value={openConfirmation}>
      {children}
      <ConfirmDialog
        open={show}
        alertDialog={Boolean(confirmationState?.alertDialog)}
        title={confirmationState.title}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
        message={confirmationState.message}
        onClose={handleClose}
        onOK={handleOk}
      />
    </ConfirmationContext>
  );
};

let confirmContext: ConfirmationServiceType | undefined;
// let alertContext: ConfirmationServiceType | undefined;

const setConfirmContext = (openDialog: ConfirmationServiceType) => {
  confirmContext = openDialog;
};

// const setAlertContext = (openDialog: ConfirmationServiceType) => {
//   alertContext = openDialog;
// };

const useRegisterConfirmationService = (
  register: (openDialog: ConfirmationServiceType) => void
) => {
  const openDialog = useContext(ConfirmationContext) as ConfirmationServiceType;
  useEffect(() => {
    register(openDialog);
  }, [openDialog, register]);
};

export const Confirm = () => {
  useRegisterConfirmationService(setConfirmContext);
  return null;
};

// export const Alert = () => {
//   useRegisterConfirmationService(setAlertContext);
//   return null;
// };
export const showConfirm = (
  options: ConfirmationOptionType
): Promise<boolean> => {
  if (!confirmContext) {
    throw new Error(
      "Confirm context is not initialized. Make sure <Confirm /> component is rendered."
    );
  }
  return confirmContext(options);
};

// const showAlert = (options: ConfirmationOptionType): Promise<boolean> => {
//   if (!alertContext) {
//     throw new Error(
//       "Alert context is not initialized. Make sure <Alert /> component is rendered."
//     );
//   }
//   return alertContext({
//     alertDialog: true,
//     ...options,
//   });
// };

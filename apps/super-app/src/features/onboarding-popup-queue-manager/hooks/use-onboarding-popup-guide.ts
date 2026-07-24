import { useEffect, useState } from "react";

import { useOnboardingPopupQueueManagerStoreState } from "../store";
import { EPopupStatus } from "../store/types";
import { findPopupInQueue } from "../utils/store";

interface TUseOnboardingPopupGuideProps {
  popupId: string;
  onClose?: () => void;
  onOpen?: () => void;
}

export function useOnboardingPopupGuide(props: TUseOnboardingPopupGuideProps) {
  const { popupId, onOpen, onClose } = props;

  const [isOpen, setIsOpen] = useState(false);

  const currentPopups = useOnboardingPopupQueueManagerStoreState(
    (state) => state.currentPopups
  );
  const updatePopupStatus = useOnboardingPopupQueueManagerStoreState(
    (state) => state.updatePopupStatus
  );
  const completeCurrentPopup = useOnboardingPopupQueueManagerStoreState(
    (state) => state.completeCurrentPopup
  );

  useEffect(() => {
    const currentPopup = findPopupInQueue(popupId, currentPopups, {
      status: EPopupStatus.PENDING,
    });
    if (!currentPopup) {
      return;
    }

    // oxlint-disable-next-line react/react-compiler -- opens the popup and syncs queue status when this popup becomes the pending one in the shared queue; synchronizing with an external queue store, not a render derivation
    setIsOpen(true);
    updatePopupStatus(currentPopup.id, EPopupStatus.SHOWING);
    onOpen?.();
  }, [currentPopups, onOpen, popupId, updatePopupStatus]);

  const handleClose = () => {
    setIsOpen(false);
    completeCurrentPopup(popupId);
    onClose?.();
  };
  return { handleClose, isOpen };
}

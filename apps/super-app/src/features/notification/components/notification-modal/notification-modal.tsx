import React from "react";

import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useGlobalState } from "@/store/global/hooks";

import { NotificationContent } from "../notification-content";
import type { TNotificationModalProps } from "./types";

const NotificationModal: React.FC<TNotificationModalProps> = ({
  open,
  onClose,
}) => {
  const isDesktop = useMediaQuery("md", { defaultValue: true });
  const isExpanded = useGlobalState((state) => state.isOpenSidebar);
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);

  const handleNotificationClick = (shouldClose: boolean) => {
    if (shouldClose) {
      onClose?.();
    }
    if (shouldClose && !isDesktop && isExpanded) {
      toggleSidebar(false);
    }
  };
  if (isDesktop) {
    return null;
  }

  return (
    <ModalV2
      open={open}
      zIndex={98}
      containerClassName="overflow-hidden max-w-full md:max-w-[calc(100vw-40px)] md:min-w-[422px] bg-surface-general-new-secondary! top-[60px]!"
      className="rounded-default border-border-input-default w-[calc(100vw-20px)] overflow-hidden border p-0!"
      onClose={onClose}
      centered={false}
    >
      <SVGIcon
        src="/icons/outlined/closed-v2.svg"
        className="end-medium-1.5 top-medium-2.5 text-icon-general-primary absolute"
        onClick={onClose}
        width={24}
        height={24}
      />
      <NotificationContent
        isMobile={true}
        onNotificationClick={handleNotificationClick}
      />
    </ModalV2>
  );
};

export default NotificationModal;

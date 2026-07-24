"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { Toast } from "radix-ui";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { SafeImage } from "@/features/notification/components/safe-image";
import { useRouter } from "@/i18n/navigation";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { getCurrentPathAndSearchParams } from "@/utils/commons/helpers";

const FALLBACK_SRC = "/images/notification-icon-default.png";
const NOTIFICATION_IMAGE_DEFAULT = "/images/notification-icon-default.png";

interface NotificationToastProps {
  title: string;
  content: string;
  link?: string;
  imageUrl?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  open,
  title,
  content,
  link,
  imageUrl,
  onOpenChange,
  onClose,
}) => {
  const router = useRouter();
  const isDesktop = useMediaQuery("md");
  const isExpanded = useGlobalState((state) => state.isOpenSidebar);
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);
  const resetConversationStore = useConversationState(
    (state) => state.resetStore
  );

  const handleClickNotification = () => {
    const currentPath = getCurrentPathAndSearchParams();
    if (!isDesktop && isExpanded) {
      toggleSidebar(false);
    }
    onClose?.();
    if (link && link !== currentPath) {
      resetConversationStore({ selectedId: "" });
      router.replace(link);
    }
  };

  return (
    <Toast.Root
      open={open}
      onOpenChange={onOpenChange}
      className="top-large-8 rounded-rounded thickness-thin bg-surface-general-primary p-medium-2 md:p-medium-3 fixed end-4 w-[343px] border-white/10 md:w-[320px]"
    >
      <Toast.Close asChild className="end-small-1 top-small-1 absolute">
        <button type="button">
          <SVGIcon
            src="/icons/outlined/closed-v4.svg"
            className="text-text-general-tertiary! hidden md:inline-block"
            width={24}
            height={24}
          />
          <SVGIcon
            src="/icons/outlined/closed-v4.svg"
            className="text-text-input-focus! inline-block md:hidden"
            width={20}
            height={20}
          />
        </button>
      </Toast.Close>
      <div
        className="gap-medium-2 flex hover:cursor-pointer"
        onClick={handleClickNotification}
      >
        <div className="rounded-circle relative size-12 min-w-12">
          <SafeImage
            className="rounded-circle bg-text-general-brand-identity object-cover dark:bg-transparent"
            alt="title"
            fallbackSrc={FALLBACK_SRC}
            src={imageUrl || NOTIFICATION_IMAGE_DEFAULT}
            fill
            sizes="48px"
          />
        </div>
        <div className="gap-small-0.5 flex flex-col">
          <div className="pe-medium-1.5 text-bodyS-highlight text-text-general-secondary md:pr-small-0">
            {title}
          </div>
          <div className="text-footnoteM-neutral text-text-general-quaternary">
            {content}
          </div>
        </div>
      </div>
    </Toast.Root>
  );
};

export default NotificationToast;

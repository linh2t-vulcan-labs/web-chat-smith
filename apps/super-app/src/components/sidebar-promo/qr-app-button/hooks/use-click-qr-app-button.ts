import { useGuestStore } from "@/features/guest-mode/stores/guest-mode/hooks";
import type { TLinkAction } from "@/libs/tracking-event";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

export function useClickQrAppButton() {
  const { sendTrackingEvent } = useSendTrackingEvent();
  const userId = useGlobalState((state) => state.user.id);
  const guestStore = useGuestStore();

  const handleActionQrAppButton = (action: "openLink" | "copyLink") => {
    sendTrackingEvent({
      name: EventKeys.MainLeftSidebarDownloadApp,
      payload: {
        action: action as TLinkAction,
        vulcan_user_id: userId,
      },
    });
  };

  const handleClickQrAppButton = () => {
    if (!userId && guestStore) {
      const guestId = guestStore.getState().anonId || "";
      sendTrackingEvent({
        name: EventKeys.NewNavbarClick,
        payload: {
          guest_id: guestId,
          trigger: "app_download",
        },
      });
      return;
    }

    sendTrackingEvent({
      name: EventKeys.NewNavbarClick,
      payload: {
        trigger: "app_download",
        vulcan_user_id: userId,
      },
    });
  };
  return { handleActionQrAppButton, handleClickQrAppButton };
}

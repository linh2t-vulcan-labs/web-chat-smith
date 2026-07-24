import { CopyButton } from "@/components/copy-button";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";

import type { TMessageActionsProps } from "./types";

const MessageActions = ({ message }: TMessageActionsProps) => {
  const { sendTrackingEvent } = useSendTrackingEvent();
  const guestId = useGuestState((state) => state.anonId);
  // Tracking GuestChatCopyTap
  const handleOnCopy = () => {
    if (guestId) {
      sendTrackingEvent({
        name: EventKeys.GuestChatCopyTap,
        payload: {
          guest_id: guestId,
        },
      });
    }
  };
  return (
    <div className="mt-small-1 flex items-center gap-small-0.25">
      <CopyButton content={message.content} onCopy={handleOnCopy} />
    </div>
  );
};

export default MessageActions;

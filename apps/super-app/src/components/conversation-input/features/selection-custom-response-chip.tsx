"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { usePostSelectedCustomResponse } from "@/hooks/conversations/use-custom-response-actions";
import useLocalStorage from "@/hooks/use-local-storage";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { HAS_SEEN_CUSTOM_RESPONSES } from "@/utils/commons/keys";

import { SelectionCustomResponse } from "../../selection-custom-response";
import type { TSelectionModelAIChipProps } from "./types";

export const SelectionCustomResponseChip: React.FC<
  TSelectionModelAIChipProps
> = (props) => {
  const { disabled } = props;
  const conversationT = useTranslations("conversationPage");
  const customResponses = useGlobalState((state) => state.customResponses);
  const selectedCustomResponse = useGlobalState(
    (state) => state.selectedCustomResponse
  );
  const { isValidPremiumUser } = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const user = useGlobalState((state) => state.user);
  const setSelectedCustomResponse = useGlobalState(
    (state) => state.setSelectedCustomResponse
  );
  const { mutateAsync } = usePostSelectedCustomResponse();

  // For Tracking
  const { sendTrackingEvent } = useSendTrackingEvent();

  const [seenCustomResponse, setSeenCustomResponse] = useLocalStorage<boolean>(
    user.id ? `${HAS_SEEN_CUSTOM_RESPONSES}-${user.id}` : "",
    false
  );

  const handleSelectCustomResponse = async (tone: string) => {
    setSeenCustomResponse(true);
    try {
      const result = (await mutateAsync(tone)) as { success?: boolean } | null;
      if (result?.success) {
        setSelectedCustomResponse(tone); // Only set selected response if mutation was successful
        // Tracking ChatResponseCustomSelect
        sendTrackingEvent({
          name: EventKeys.ChatResponseCustomSelect,
          payload: {
            vulcan_style: tone,
            vulcan_user_id: user.id,
          },
        });
      }
    } catch (error) {
      toast.error(null, {
        description: conversationT("toast.error.system"),
      });
      console.error(error);
    }
  };

  if (!customResponses.length) {
    return null;
  }

  return (
    <SelectionCustomResponse
      models={customResponses}
      seenModels={seenCustomResponse}
      selectedModel={selectedCustomResponse}
      isPremiumUser={isValidPremiumUser}
      onModelSelect={handleSelectCustomResponse}
      disabled={disabled}
    />
  );
};

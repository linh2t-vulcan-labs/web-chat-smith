import { useCallback, useEffect, useRef } from "react";

import type { AIModelItem } from "@/core/models/model";
import { useFeatureGating } from "@/features/guest-mode/hooks/use-feature-gating";
import { EConversationMode } from "@/features/guest-mode/models/conversation";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useMediaQuery } from "@/hooks/use-media-query";
import { parseAsString, useQueryState } from "@/libs/nuqs";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

import { isValidConversationMode } from "./utils";

export const useGuestConversationHandlerUrlParams = () => {
  const [modelParams, setModelParams] = useQueryState("model", parseAsString);
  const [modeParams, setModeParams] = useQueryState("mode", parseAsString);
  const [taskParams, setTaskParams] = useQueryState("task", parseAsString);

  const chatModels = useGlobalState((state) => state.models);

  const selectedModel = useGuestState((state) => state.selectedModel);
  const isVerifiedCaptcha = useGuestState((state) => state.isVerifiedCaptcha);
  const setSelectedModel = useGuestState((state) => state.setSelectedModel);

  const { sendTrackingEvent } = useSendTrackingEvent();

  const isLargeScreen = useMediaQuery("md");

  const guestId = useGuestState((state) => state.anonId);
  const { showLoginModal } = useFeatureGating();

  // Track if mode param is being set from user interaction (not URL)
  const isSettingModeFromUserAction = useRef(false);
  // Track if model param is being set from user interaction (not URL)
  const isSettingModelFromUserAction = useRef(false);
  // Track if task param is being set from user interaction (not URL)
  const isSettingTaskFromUserAction = useRef(false);

  const handleSelectConversationMode = useCallback(
    (mode: EConversationMode, fromUrl = false) => {
      const trackingEventName = {
        [EConversationMode.DEEP_RESEARCH]: EventKeys.GuestChatDeepResearchUsage,
        [EConversationMode.AI_ART]: EventKeys.GuestChatArtUsage,
        [EConversationMode.WEB_SEARCH]: EventKeys.GuestChatWebSearchUsage,
      } satisfies Partial<Record<EConversationMode, EventKeys>>;

      if (mode in trackingEventName && guestId) {
        const eventName =
          trackingEventName[mode as keyof typeof trackingEventName];
        sendTrackingEvent({
          name: eventName,
          payload: {
            guest_id: guestId,
          },
        });
      }
      if (isLargeScreen) {
        if (!fromUrl) {
          isSettingModeFromUserAction.current = true;
        }
        setModeParams(mode);

        showLoginModal("advance_mode");
      }
    },
    [guestId, isLargeScreen, sendTrackingEvent, setModeParams, showLoginModal]
  );

  const handleSignInAdvanceFeature = (mode?: string) => {
    showLoginModal("advance_mode");
    if (mode) {
      // Set flag before setting param to prevent useEffect from processing it
      isSettingModeFromUserAction.current = true;
      setModeParams(mode);
    }
  };

  const handleSelectChatModel = useCallback(
    (model: AIModelItem, fromUrl = false) => {
      if (model.value === selectedModel.value) {
        return;
      }

      // Set flag before setting param to prevent useEffect from processing it
      if (!fromUrl) {
        isSettingModelFromUserAction.current = true;
      }
      setModelParams(model.value);
      const isModelLocked = !model.availableRoles.includes("guest");

      if (isModelLocked) {
        showLoginModal("model");
        return;
      }

      setSelectedModel(model);
    },
    [selectedModel.value, setModelParams, setSelectedModel, showLoginModal]
  );

  const handleSelectUseCaseList = useCallback(
    (options?: { task: string; callback?: () => void; fromUrl?: boolean }) => {
      showLoginModal("task");
      options?.callback?.();
      if (options?.task) {
        // Set flag before setting param to prevent useEffect from processing it
        if (!options?.fromUrl) {
          isSettingTaskFromUserAction.current = true;
        }
        setTaskParams(options?.task);
      }
    },
    [setTaskParams, showLoginModal]
  );

  /**
   * Handle URL params with priority system
   * Priority: Task Param > Mode Param > Model Param
   *
   * 1. If taskParams exists: clear modeParams, process task, skip mode handler
   * 2. If modeParams exists (and no taskParams): process mode
   * 3. modelParams is processed last
   */
  useEffect(() => {
    if (!isVerifiedCaptcha) {
      return;
    }

    // Priority 1: Task Param (highest priority)
    if (taskParams) {
      // Skip processing if task param was set from user action (not URL)
      if (isSettingTaskFromUserAction.current) {
        isSettingTaskFromUserAction.current = false;
        return;
      }

      // Clear mode params if task param exists (task takes precedence)
      if (modeParams) {
        setModeParams(null);
      }
      // Use centralized handler with fromUrl = true
      handleSelectUseCaseList({ fromUrl: true, task: taskParams });
      return;
    }

    // Priority 2: Mode Param (second priority)
    // Only process if taskParams doesn't exist (already returned above)
    if (modeParams && isValidConversationMode(modeParams)) {
      // Skip processing if mode param was set from user action (not URL)
      if (isSettingModeFromUserAction.current) {
        isSettingModeFromUserAction.current = false;
        return;
      }

      // Use centralized handler with fromUrl = true
      handleSelectConversationMode(modeParams, true);
    }
  }, [
    taskParams,
    isVerifiedCaptcha,
    modeParams,
    setModeParams,
    handleSelectUseCaseList,
    handleSelectConversationMode,
  ]);

  // Handle model params changes from URL (lowest priority)
  useEffect(() => {
    if (!modelParams || !chatModels || chatModels.length === 0) {
      return;
    }

    // Skip processing if model param was set from user action (not URL)
    if (isSettingModelFromUserAction.current) {
      isSettingModelFromUserAction.current = false;
      return;
    }

    const groupModel = chatModels.find((model) => model.value === modelParams);
    if (!groupModel) {
      setModelParams(null);
      return;
    }

    const chatModel = chatModels
      .flatMap((model) => model.models)
      .find((model) => model.value === modelParams);

    if (!chatModel) {
      setModelParams(null);
      return;
    }

    // Use centralized handler with fromUrl = true
    handleSelectChatModel(chatModel, true);
  }, [modelParams, chatModels, setModelParams, handleSelectChatModel]);

  return {
    handleSelectChatModel,
    handleSelectConversationMode,
    handleSelectUseCaseList,
    handleSignInAdvanceFeature,
    modeParams,
    modelParams,
    taskParams,
  };
};

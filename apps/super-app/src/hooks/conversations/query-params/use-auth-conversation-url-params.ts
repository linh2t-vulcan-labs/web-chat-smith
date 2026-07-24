import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import { IMAGE_MODELS } from "@/config/models";
import { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import type { TValidationResult } from "@/core/models/conversation";
import { EConversationMode } from "@/core/models/conversation";
import type { AIModel, AIModelItem } from "@/core/models/model";
import { EAIValueModel } from "@/core/models/model";
import { conversationUC } from "@/core/usecases";
import { useBananaTourSteps } from "@/features/banana-guide-tour/hooks";
import { useOnboardingPopupGuide } from "@/features/onboarding-popup-queue-manager/hooks";
import { useHasClickedCreateImage } from "@/hooks/image-creation/use-has-clicked-create-image";
import useLocalStorage from "@/hooks/use-local-storage";
import { usePathname } from "@/i18n/navigation";
import { useGuideTour } from "@/libs/guide-tour/provider";
import { parseAsString, useQueryState } from "@/libs/nuqs";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import {
  defaultConversationStoreState,
  defaultSelectedImageModel,
} from "@/store/conversation/constants";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { readAiToolLandingBannerHandoff } from "@/utils/commons/ai-tool-landing-generate-handoff";
import {
  HAS_SEEN_GEMINI_BANANA_TOUR_KEY,
  SEEN_IMAGE_MODELS,
  SEEN_MODELS,
} from "@/utils/commons/keys";
import { CONVERSATION_URL } from "@/utils/constants/url";

import { isValidConversationMode } from "./utils";

/**
 * Callback type for handling task parameter changes from URL
 * @param taskKey - The task key from URL params
 */
export type TaskParamHandler = (taskKey: string) => void;

export const useAuthConversationUrlParams = () => {
  const [modelParams, setModelParams] = useQueryState("model", parseAsString);
  const [modeParams, setModeParams] = useQueryState("mode", parseAsString);
  const [taskParams, setTaskParams] = useQueryState("task", parseAsString);

  useBananaTourSteps();

  const { isValidPremiumUser } = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const chatModels = useGlobalState((state) => state.models);
  const isFinishFetchProfile = useGlobalState(
    (state) => state.isFinishFetchProfile
  );

  const currentConversationMode = useConversationState((state) => state.mode);
  const selectedFiles = useConversationState((state) => state.selectedFiles);
  const selectedModel = useConversationState((state) => state.selectedModel);
  const selectedId = useConversationState((state) => state.selectedId);
  const selectedAIArt = useConversationState((state) => state.selectedAIArt);
  const selectedImageModel = useConversationState(
    (state) => state.selectedImageModel
  );
  const sessionId = useConversationState((state) => state.sessionId);

  const userId = useGlobalState((state) => state.user.id);

  // Keep a stable reference to the handler that can be registered dynamically
  const taskParamHandlerRef = useRef<TaskParamHandler | null>(null);

  // Refs to track if URL params have been processed (to prevent re-processing during runtime)
  const hasProcessedTaskParam = useRef(false);
  const hasProcessedModeParam = useRef(false);
  const hasProcessedModelParam = useRef(false);
  const lastProcessedModeValue = useRef<string | null>(null);
  const pathname = usePathname();

  const setSelectedFiles = useConversationState(
    (state) => state.setSelectedFiles
  );
  const setSelectedAIArt = useConversationState(
    (state) => state.setSelectedAIArt
  );
  const setConversationMode = useConversationState((state) => state.setMode);
  const setSelectedModel = useConversationState(
    (state) => state.setSelectedModel
  );
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const setSelectedImageModel = useConversationState(
    (state) => state.setSelectedImageModel
  );
  const setIsOpenSliderAIArt = useConversationState(
    (state) => state.setIsOpenSliderAIArt
  );
  const setIsOpenImageUploadNotSupportedValidationModal = useConversationState(
    (state) => state.setIsOpenImageUploadNotSupportedValidationModal
  );
  const setUserInput = useConversationState((state) => state.setUserInput);

  const { isOpen: isOpenWhatsNewImageTooltip } = useOnboardingPopupGuide({
    popupId: HAS_SEEN_GEMINI_BANANA_TOUR_KEY,
  });

  useGuideTour();
  const { setHasClickedCreateImage } = useHasClickedCreateImage();
  const { sendTrackingEvent } = useSendTrackingEvent();
  const commonT = useTranslations("common");

  const getErrorMessage = useCallback(
    (result: TValidationResult): string => {
      if (result.errorKey) {
        return commonT(result.errorKey, result.errorParams);
      }
      return "";
    },
    [commonT]
  );

  const [seenChatModels, setSeenChatModels] = useLocalStorage<AIModelItem[]>(
    userId ? `${SEEN_MODELS}-${userId}` : "",
    []
  );

  const [seenImageModels, setSeenImageModels] = useLocalStorage<AIModelItem[]>(
    userId ? `${SEEN_IMAGE_MODELS}-${userId}` : "",
    []
  );

  /**
   * Allows child components to register a handler for task param changes.
   * This enables the handler to access component-specific state and methods.
   */
  const registerTaskParamHandler = useCallback((handler: TaskParamHandler) => {
    taskParamHandlerRef.current = handler;
  }, []);

  const handleSetSeenImageModels = (model: AIModelItem) => {
    // Check if the model is already in the seenImageModels array
    const isModelExist = seenImageModels.some(
      (seenModel) => seenModel.value === model.value
    );

    if (!isModelExist) {
      setSeenImageModels([...seenImageModels, model]);
    }
  };

  /**
   * Handle Deep Research mode selection and tracking
   */
  const handleDeepResearchMode = useCallback(() => {
    sendTrackingEvent({
      name: EventKeys.ChatDeepResearchUsage,
      payload: {
        vulcan_user_id: userId,
      },
    });
    setSelectedFiles(defaultConversationStoreState.selectedFiles);
  }, [sendTrackingEvent, setSelectedFiles, userId]);

  /**
   * Handle AI Art mode selection with validation and tracking
   * @returns false if validation fails, true if successful
   */
  const handleAIArtMode = useCallback((): boolean => {
    // Validate files
    const validateFilesResult = conversationUC.validateFilesForConversation({
      conversationMode: EConversationMode.AI_ART,
      files: selectedFiles,
      selectedAIArt,
    });

    if (!validateFilesResult.isValid) {
      toast.error(null, { description: getErrorMessage(validateFilesResult) });
      return false;
    }

    const isChatSmithText2Image =
      selectedImageModel.value === EAIValueModel.chatsmith;
    const isText2Image =
      isChatSmithText2Image ||
      (selectedAIArt.value === EAIART_STYLE.NONE && selectedFiles.length === 0);

    sendTrackingEvent({
      name: EventKeys.ChatArtUsage,
      payload: {
        model: isChatSmithText2Image ? "text2image" : selectedImageModel.value,
        vulcan_type: isText2Image ? "text2image" : "image2image",
        vulcan_user_id: userId,
      },
    });

    setSelectedImageModel(defaultSelectedImageModel); // reset to default image model (Nano Banana) when user click Create Image
    setHasClickedCreateImage(true);
    return true;
  }, [
    getErrorMessage,
    selectedFiles,
    selectedAIArt,
    selectedImageModel.value,
    sendTrackingEvent,
    setHasClickedCreateImage,
    setSelectedImageModel,
    userId,
  ]);

  /**
   * Handle Web Search mode selection and tracking
   */
  const handleWebSearchMode = useCallback(() => {
    sendTrackingEvent({
      name: EventKeys.ChatWebSearchUsage,
      payload: {
        vulcan_user_id: userId,
      },
    });
    setSelectedFiles(defaultConversationStoreState.selectedFiles);
  }, [sendTrackingEvent, setSelectedFiles, userId]);

  /**
   * Handle mode-specific setup and validation
   * @returns false if mode selection should be aborted, true otherwise
   */
  const handleModeSpecificSetup = useCallback(
    (mode: EConversationMode, isNotModeSelected: boolean): boolean => {
      if (!isNotModeSelected) {
        return true;
      }

      switch (mode) {
        case EConversationMode.DEEP_RESEARCH: {
          handleDeepResearchMode();
          return true;
        }
        case EConversationMode.AI_ART: {
          return handleAIArtMode();
        }
        case EConversationMode.WEB_SEARCH: {
          handleWebSearchMode();
          return true;
        }
        default: {
          return true;
        }
      }
    },
    [handleAIArtMode, handleDeepResearchMode, handleWebSearchMode]
  );

  /**
   * Update URL params for mode change
   */
  const updateModeUrlParams = useCallback(
    (newMode: EConversationMode, fromUrl: boolean) => {
      const modeValue = newMode === EConversationMode.CHAT ? null : newMode;

      setModeParams(modeValue);

      // Keep modelParams for AI_ART mode (to preserve image model selection on reload)
      // Clear modelParams for other modes
      if (newMode !== EConversationMode.AI_ART && !fromUrl) {
        setModelParams(null);
      }
    },
    [setModeParams, setModelParams]
  );

  /**
   * Reset conversation state to defaults
   */
  const resetConversationState = useCallback(() => {
    setTaskParams(null);
    setSelectedImageModel(defaultConversationStoreState["selectedImageModel"]);
    setSelectedAIArt(defaultConversationStoreState["selectedAIArt"]);
    // if (isEditImage) {
    //   setIsEditImage(false);
    // }
  }, [setSelectedAIArt, setSelectedImageModel, setTaskParams]);

  const handleSelectConversationMode = useCallback(
    (mode: EConversationMode, fromUrl = false) => {
      // Handle isNotModeSelected for case manually select mode from button
      const isNotModeSelected = mode !== currentConversationMode;

      // Handle mode-specific setup and validation
      const shouldContinue = handleModeSpecificSetup(mode, isNotModeSelected);

      if (!shouldContinue) {
        return;
      }

      let newMode = EConversationMode.CHAT;
      if (fromUrl || isNotModeSelected) {
        newMode = mode;
      }

      // Update store state
      setConversationMode(newMode);

      // Update URL params
      updateModeUrlParams(newMode, fromUrl);

      // Reset conversation state — only on an actual mode switch, not when
      // this URL-driven mode is reprocessed while already selected (would
      // otherwise wipe an in-progress style/model pick, e.g. selectedAIArt).
      if (isNotModeSelected) {
        resetConversationState();
      }
    },
    [
      currentConversationMode,
      handleModeSpecificSetup,
      resetConversationState,
      setConversationMode,
      updateModeUrlParams,
    ]
  );

  const handleSelectChatModel = useCallback(
    (model: AIModelItem, _fromUrl = false) => {
      if (model.value === selectedModel.value) {
        return;
      }
      sendTrackingEvent({
        name: EventKeys.SwitchingGPTModelClicked,
        payload: {
          model_name: model.value,
          vulcan_user_id: userId,
        },
      });

      setModelParams(model.value);

      const isChatBlocked =
        !model.availableRoles.includes("free") && !isValidPremiumUser;
      const isModelExist = seenChatModels.some(
        (seenModel) => seenModel.value === model.value
      );

      if (!isModelExist) {
        setSeenChatModels([...seenChatModels, model]);
      }

      if (isChatBlocked) {
        setIsOpenSubscriptionModal(true, "ai_model");
        return;
      }

      setSelectedModel(model);
    },
    [
      isValidPremiumUser,
      seenChatModels,
      selectedModel.value,
      sendTrackingEvent,
      setIsOpenSubscriptionModal,
      setModelParams,
      setSeenChatModels,
      setSelectedModel,
      userId,
    ]
  );

  const handleSelectImageModel = useCallback(
    (model: AIModelItem, fromUrl = false) => {
      // Note: Will correct logic after PO and designer define a new rule. The old logic is const isChatBlocked = !model.availableRoles.includes("free") && !isValidPremiumUser;
      const isChatBlocked = false;
      const MAX_IMAGES_ALLOWED_CHATSMITH = 0;
      const isChatsmithModelBlocked =
        model.value === EAIValueModel.chatsmith &&
        selectedFiles.length > MAX_IMAGES_ALLOWED_CHATSMITH;

      setModelParams(model.value);

      if (!fromUrl) {
        const isModelExist = seenImageModels.some(
          (seenModel) => seenModel.value === model.value
        );

        if (!isModelExist) {
          setSeenImageModels([...seenImageModels, model]);
        }
      }

      if (isChatBlocked) {
        setIsOpenSubscriptionModal(true, "ai_model");
        return;
      }

      if (isChatsmithModelBlocked) {
        setIsOpenImageUploadNotSupportedValidationModal(true);
        return;
      }

      setSelectedImageModel(model);
      // Reset the AI Art style when the image model is changed
      setIsOpenSliderAIArt(true);
    },
    [
      selectedFiles.length,
      seenImageModels,
      setIsOpenImageUploadNotSupportedValidationModal,
      setIsOpenSliderAIArt,
      // oxlint-disable-next-line react/react-compiler -- deps list intentionally mirrors the sibling handleSelectModel callback's shape; narrowing risks stale closures in this subscription-gated flow, out of scope to verify here
      setIsOpenSubscriptionModal,
      setModelParams,
      setSeenImageModels,
      setSelectedImageModel,
    ]
  );

  /**
   * Wrapper for setTaskParams that prevents the useEffect from triggering
   * when the task param is being set programmatically (e.g., from user interaction)
   */
  const handleSetTaskParams = (value: string | null) => {
    setTaskParams(value);
  };

  /**
   * Process task parameter from URL (Priority 1 - Highest)
   * Clears mode params if task param exists since task takes precedence
   */
  const processTaskParam = useCallback(
    (conversationId: string) => {
      if (!taskParams || conversationId) {
        return;
      }

      if (modeParams) {
        setModeParams(null);
      }

      if (taskParamHandlerRef.current) {
        taskParamHandlerRef.current(taskParams);
      }
    },
    [modeParams, setModeParams, taskParams]
  );

  /**
   * Process mode parameter from URL (Priority 2)
   */
  const processModeParam = useCallback(() => {
    if (!modeParams || !isValidConversationMode(modeParams)) {
      return;
    }

    handleSelectConversationMode(modeParams, true);
  }, [handleSelectConversationMode, modeParams]);

  /**
   * Process model parameter from URL (Priority 3 - Lowest)
   * Handles both chat models and image models based on current mode
   */
  const processModelParam = useCallback(
    (_chatModels?: AIModel[]) => {
      if (!_chatModels || _chatModels?.length === 0) {
        return;
      }

      const isImageCreationMode = modeParams === EConversationMode.AI_ART;

      // Try to find image model (only in AI_ART mode)
      if (isImageCreationMode) {
        const selectedImageModel = IMAGE_MODELS.find(
          (model) => model.value === modelParams
        );

        if (selectedImageModel) {
          handleSelectImageModel(selectedImageModel as AIModelItem, true);
          return;
        }
      }

      // Try to find group model (e.g., "openai", "gemini", "grok", "deepseek", "claude")

      const groupModel = _chatModels.find(
        (model) => model.value === modelParams
      );
      const groupModelFirstItem = groupModel?.models[0];
      if (groupModelFirstItem) {
        handleSelectChatModel(groupModelFirstItem, true);
        return;
      }

      // Try to find specific model (e.g., "gpt-4", "gemini-pro")
      const selectedModel = _chatModels
        .flatMap((model) => model.models)
        .find((model) => model.value === modelParams);

      if (selectedModel) {
        handleSelectChatModel(selectedModel, true);
        return;
      }

      // If model is not valid will set to null
      setModelParams(null);
    },
    [
      handleSelectChatModel,
      handleSelectImageModel,
      modeParams,
      modelParams,
      setModelParams,
    ]
  );

  useEffect(() => {
    if (!isFinishFetchProfile || !taskParams || hasProcessedTaskParam.current) {
      return;
    }

    processTaskParam(selectedId);
    hasProcessedTaskParam.current = true;
  }, [isFinishFetchProfile, processTaskParam, selectedId, taskParams]);

  useEffect(() => {
    if (!isFinishFetchProfile || !modeParams) {
      return;
    }

    // Only reprocess when the URL's mode value itself changes — `processModeParam`
    // is recreated whenever unrelated store state (e.g. conversation switch resets
    // `mode`) changes, and reprocessing on that identity change alone caused a
    // stale `currentConversationMode` to be treated as a real mode switch, racing
    // nuqs's router.replace against the pending Link navigation.
    if (lastProcessedModeValue.current === modeParams) {
      return;
    }

    lastProcessedModeValue.current = modeParams;
    processModeParam();
  }, [isFinishFetchProfile, modeParams, processModeParam]);

  useEffect(() => {
    const isConversationPage = pathname === CONVERSATION_URL;

    if (
      !isFinishFetchProfile ||
      !modeParams ||
      modeParams !== EConversationMode.AI_ART ||
      sessionId ||
      !isConversationPage ||
      hasProcessedModeParam.current
    ) {
      return;
    }

    // Show banana tour if user is on banana route and has not seen the tour yet
    if (isOpenWhatsNewImageTooltip) {
      // Note: Uncomment this when the banana tour is ready
      // startTour(bananaTourSteps, { callback: handleGuideTourCallback });

      hasProcessedModeParam.current = true;
    }
  }, [
    isFinishFetchProfile,
    pathname,
    isOpenWhatsNewImageTooltip,
    sessionId,
    modeParams,
  ]);

  useEffect(() => {
    if (
      !isFinishFetchProfile ||
      !chatModels.length ||
      !modelParams ||
      hasProcessedModelParam.current
    ) {
      return;
    }

    processModelParam(chatModels);
    hasProcessedModelParam.current = true;
  }, [isFinishFetchProfile, chatModels, modelParams, processModelParam]);

  /** Banner handoff: prompt for all groups; art style only when image landing stored it. */
  useEffect(() => {
    const isConversationPage = pathname === CONVERSATION_URL;
    if (!isFinishFetchProfile || !isConversationPage) {
      return;
    }

    const handoff = readAiToolLandingBannerHandoff();
    if (!handoff) {
      return;
    }

    if (handoff.prompt) {
      setUserInput(handoff.prompt);
    }
  }, [
    isFinishFetchProfile,
    pathname,
    modeParams,
    setUserInput,
    setSelectedAIArt,
  ]);

  return {
    handleSelectChatModel,
    handleSelectConversationMode,
    handleSelectImageModel,
    handleSetSeenImageModels,
    modeParams,
    modelParams,
    registerTaskParamHandler,
    seenChatModels,
    seenImageModels,
    setTaskParams: handleSetTaskParams,
    taskParams,
  };
};

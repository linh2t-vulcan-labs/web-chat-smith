import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand/vanilla";

import type {
  TConversationState,
  TMessageTemp,
} from "@/core/models/conversation";
import {
  EConversationMode,
  LIMIT_MESSAGE_STATUSES,
} from "@/core/models/conversation";
import { conversationUC } from "@/core/usecases";
import { omit } from "@/libs/lodash-es";
import { defaultAssistantWriting } from "@/utils/constants/assistant";
import { defaultConversationState } from "@/utils/constants/conversation";

import { defaultConversationStoreState } from "./constants";
import type { TConversationStore } from "./types";

const createConversationStore = () =>
  createStore<TConversationStore>()(
    immer((set, get) => ({
      ...defaultConversationStoreState,

      checkDisabledInputBasedOnMessageStatus: () => {
        const currentConversation = get().selectedId || "";
        const conversationState = get().conversationStates[currentConversation];
        const messages = conversationState?.messages ?? [];

        const isDisabled = messages.some((message) =>
          LIMIT_MESSAGE_STATUSES.has(message.status)
        );

        return isDisabled;
      },
      initialConversationInput() {
        set((state) => {
          state.selectedFiles = defaultConversationStoreState.selectedFiles;
          state.suggestions = defaultConversationStoreState.suggestions;
          state.userInput = defaultConversationStoreState.userInput;
          state.fileUploadStates =
            defaultConversationStoreState.fileUploadStates;
          state.sessionId = null;
        });
      },
      initializeConversation: (input) => {
        const {
          chatType,
          conversationMode,
          userMessage: prompt,
          selectedFiles,
          initialMessages,
          conversationId,
          imageStyle,
        } = input;
        const isUseCase = chatType === "usecase";
        const isAIArtMode = conversationMode === EConversationMode.AI_ART;
        let imageStyleTemp = get().selectedAIArt?.value;

        if (imageStyle) {
          imageStyleTemp = imageStyle;
        }

        const userMessage = conversationUC.createTempMessage({
          files: isUseCase ? [] : selectedFiles,
          imageStyle: isAIArtMode ? imageStyleTemp : undefined,
          prompt,
          role: "user",
          type: conversationUC.getTypeOfUserMessage(conversationMode),
        });

        const assistantTempMessage = conversationUC.createTempMessage({
          prompt: "",
          role: "assistant",
          status: "pending",
          type: conversationUC.getTypeOfAssistantMessage(conversationMode),
        });

        let messages: TMessageTemp[];

        const isExistComingSoonMessage = initialMessages?.some(
          (message) => message.status === "comingSoon"
        );

        if (initialMessages) {
          // Filter out error messages before creating new messages
          const filteredInitialMessages =
            conversationUC.filterErrorMessages(initialMessages);

          messages = isExistComingSoonMessage
            ? [
                ...filteredInitialMessages.slice(0, -2),
                userMessage,
                assistantTempMessage,
              ]
            : [...filteredInitialMessages, userMessage, assistantTempMessage];
        } else {
          messages = [userMessage, assistantTempMessage];
        }

        get().setConversationStates(conversationId || "", {
          messages,
          status: "loading",
        });

        get().resetDisabledStatusBasedOnMessageStatus();

        return { assistantTempMessage, messages, userMessage };
      },
      removeFileUploadStateByFileId: (fileId) => {
        const currentFileUploadStates = get().fileUploadStates;
        const updatedFileUploadStates = Object.fromEntries(
          Object.entries(currentFileUploadStates).filter(
            ([curFileId]) => curFileId !== fileId
          )
        );

        set({ fileUploadStates: updatedFileUploadStates });
      },
      resetDisabledStatusBasedOnMessageStatus: () => {
        const {
          selectedId,
          conversationStates,
          checkDisabledInputBasedOnMessageStatus,
        } = get();

        const currentConversationState =
          conversationStates[selectedId] || defaultConversationState;
        const hasError = currentConversationState.status === "error";
        const hasLimitIssue = checkDisabledInputBasedOnMessageStatus();

        if (!hasError && !hasLimitIssue) {
          return;
        }

        const getTrimmedMessages = () => {
          const { messages } = currentConversationState;

          if (hasError || hasLimitIssue) {
            if (
              messages.length > 1 &&
              messages[messages?.length - 2]?.role === "user"
            ) {
              return messages.slice(0, -2); // Remove user
            }
            // Regenerate: only assistant's  message
            return messages.slice(0, -1); // Remove only assistant
          }

          return currentConversationState.messages;
        };

        const updatedConversationState: TConversationState = {
          ...currentConversationState,
          messages: getTrimmedMessages(),
          status:
            hasError || hasLimitIssue
              ? "idle"
              : currentConversationState.status,
        };

        set({
          conversationStates: {
            ...conversationStates,
            [selectedId]: {
              ...currentConversationState,
              ...updatedConversationState,
            },
          },
        });
      },
      resetStore(resetParams) {
        const {
          selectedId,
          conversationStates,
          assistantWritingStates,
          checkDisabledInputBasedOnMessageStatus,
        } = get();

        const resetFields = omit(
          defaultConversationStoreState,
          "selectedModel",
          "streamControllers",
          "selectedId",
          "temporaryMessageForStreaming"
        );

        const currentConversationState =
          conversationStates[selectedId] || defaultConversationState;
        const hasError = currentConversationState.status === "error";
        const hasLimitIssue = checkDisabledInputBasedOnMessageStatus();

        const getTrimmedMessages = () => {
          const messages = conversationUC.filterErrorMessages(
            currentConversationState.messages
          );

          if (hasError || hasLimitIssue) {
            if (
              messages.length > 1 &&
              messages[messages?.length - 2]?.role === "user"
            ) {
              return messages.slice(0, -2); // Remove user
            }
            // Regenerate: only assistant's  message
            return messages.slice(0, -1); // Remove only assistant
          }

          return messages;
        };

        const updatedConversationState: TConversationState = {
          ...currentConversationState,
          messages: getTrimmedMessages(),
          status:
            hasError || hasLimitIssue
              ? "idle"
              : currentConversationState.status,
        };

        set({
          ...resetFields,
          assistantWritingStates: {
            ...assistantWritingStates,
            "": defaultAssistantWriting,
          },
          conversationStates: {
            ...conversationStates,
            [selectedId]: updatedConversationState,
            "": defaultConversationState,
          },
          ...resetParams,
        });
      },
      setAssistantWritingSettings: (assistantWritingSettings) => {
        set({ assistantWritingSettings });
      },
      setAssistantWritingStates: (id, newState) => {
        set((state) => {
          const currentStates =
            state.assistantWritingStates[id] || defaultAssistantWriting;

          state.assistantWritingStates[id] = {
            ...currentStates,
            ...newState,
          };
        }, true);
      },
      setConversationCancelledState: (conversationId, messages, content) => {
        get().setConversationStates(conversationId, {
          isNew: false,
          messages: conversationUC.markLastAssistantMessageAsCancelled(
            messages,
            content
          ),
          status: "submitted",
        });
      },
      setConversationErrorState: (conversationId, messages, content) => {
        get().setConversationStates(conversationId, {
          isNew: false,
          messages: conversationUC.markLastAssistantMessageAsError(
            messages,
            content
          ),
          status: "error",
        });
      },
      setConversationStates: (conversationId, newState) => {
        set((state) => {
          const currentStates =
            get().conversationStates[conversationId] ||
            defaultConversationState;

          state.conversationStates[conversationId] = {
            ...currentStates,
            ...newState,
          };
        }, true);
      },
      setConversationWarningState: (conversationId, messages, content) => {
        const updatedMessages: TMessageTemp[] = messages.map(
          (message, index) => {
            // If not the last message, return the message
            if (index !== messages.length - 1) {
              return message;
            }

            // If the message is a user message, return the message
            if (message.role === "user") {
              return message;
            }

            return {
              ...message,
              content: content || message.content,
              status: "error",
            };
          }
        );

        get().setConversationStates(conversationId, {
          isNew: false,
          messages: updatedMessages,
          status: "submitted",
        });
      },
      setIsEditImage: (isEditImage) => {
        set({ isEditImage });
      },
      setIsOpenConsentsConfirm: (isOpenConsentsConfirm) => {
        set({ isOpenConsentsConfirm });
      },
      setIsOpenConversationSync: (isOpenConversationSync) => {
        set({ isOpenConversationSync });
      },
      setIsOpenImageLimitAlert: (isOpenImageLimitAlert) => {
        set({ isOpenImageLimitAlert });
      },
      setIsOpenImageModelDropdown(isOpen) {
        set({ isOpenImageModelDropdown: isOpen });
      },
      setIsOpenImageUploadNotSupportedModal: (
        isOpenImageUploadNotSupportedModal
      ) => {
        set({ isOpenImageUploadNotSupportedModal });
      },
      setIsOpenImageUploadNotSupportedValidationModal: (
        isOpenImageUploadNotSupportedValidationModal
      ) => {
        set({ isOpenImageUploadNotSupportedValidationModal });
      },
      setIsOpenSliderAIArt: (isOpenSliderAIArt) => {
        set({ isOpenSliderAIArt });
      },
      setIsOpenUploadFileModal: (isOpenUploadFileModal) => {
        set({ isOpenUploadFileModal });
      },
      setMode: (mode) => {
        set({ mode });
      },
      setSelectedAIArt: (selectedAIArt) => {
        set({ selectedAIArt });
      },
      setSelectedFiles: (selectedFiles) => {
        set({ selectedFiles });
      },
      setSelectedId: (selectedId) => {
        set({ selectedId });
      },
      setSelectedImageModel(selectedImageModel) {
        set({ selectedImageModel });
      },
      setSelectedModel(selectedModel) {
        set({ selectedModel });
      },
      setSessionId(sessionId) {
        set({ sessionId });
      },
      setStreamControllers(conversationId, controller) {
        const updatedControllers = {
          ...get().streamControllers,
          [conversationId]: controller,
        };

        set({ streamControllers: updatedControllers });
      },
      setSuggestions(suggestions) {
        set({ suggestions });
      },
      setUseCaseConversation(useCaseConversation) {
        set({ useCaseConversation });
      },
      setUserInput(userInput) {
        set({ userInput });
      },
      stopStreamingMessages(conversationId) {
        const controller = get().streamControllers[conversationId];

        if (controller) {
          clearInterval(controller);
          get().setStreamControllers(conversationId, null);

          const tempMsg = (
            get().conversationStates[conversationId] || defaultConversationState
          ).temporaryMessageForStreaming;

          if (tempMsg) {
            const conversation =
              get().conversationStates[conversationId] ||
              defaultConversationState;

            // Exclude latest item
            const currentMessages = conversation.messages.slice(0, -1);

            const updatedMessage = [...currentMessages, tempMsg];

            get().setConversationStates(conversationId, {
              ...conversation,
              isNew: false,
              messages: updatedMessage,
              status: "submitted",
            });

            set({ temporaryMessageForStreaming: null });
          }
        }
      },
      streamingMessage: async (conversationId, assistantMessage) => {
        await Promise.resolve();
        const conversation =
          get().conversationStates[conversationId] || defaultConversationState;
        const isDeepResearchMode = assistantMessage.type === "deep_research";

        const updatedMessage: TMessageTemp[] = conversation.messages.map(
          (message, index) => {
            if (index !== conversation.messages.length - 1) {
              return message;
            }

            return {
              ...assistantMessage,
              content: isDeepResearchMode ? assistantMessage.content : "",
              status: "success",
              uiContent: isDeepResearchMode ? "" : assistantMessage.content,
            };
          }
        );

        get().setConversationStates(conversationId, {
          ...conversation,
          messages: updatedMessage,
          status: "generating",
          temporaryMessageForStreaming: assistantMessage,
        });

        const sourceContent = isDeepResearchMode
          ? assistantMessage.uiContent
          : assistantMessage.content;

        if (!sourceContent) {
          return;
        }

        const updateMessageContent = (content: string) => {
          const updatedFields = isDeepResearchMode
            ? { uiContent: content }
            : { content };
          get().updateTempMsgById(conversationId, assistantMessage.id, {
            ...assistantMessage,
            ...updatedFields,
          });
        };

        updateMessageContent(sourceContent);

        // Ensure final content is set

        get().setStreamControllers(conversationId, null);

        const conversationData = get().conversationStates[conversationId];
        get().setConversationStates(conversationId, {
          ...conversationData,
          isNew: false,
          status: "submitted",
        });
      },
      updateFeedbackStatusMessage: (conversationId, messageId, status) => {
        const conversationState = get().conversationStates[conversationId];
        const currentMessages = conversationState?.messages || [];
        const updatedMessages = conversationUC.updateFieldForAssistantMessage(
          currentMessages,
          messageId,
          {
            feedbackStatus: status,
          }
        );
        get().setConversationStates(conversationId, {
          messages: updatedMessages,
        });
      },
      updateFileUploadStatesByFileId: (fileId, fileUploadStates) => {
        const currentFileUploadStates = get().fileUploadStates;
        const prevFileState = currentFileUploadStates[fileId] ?? {
          isError: false,
          isLoading: false,
        };

        const updatedFileUploadStates = {
          ...currentFileUploadStates,
          [fileId]: {
            ...prevFileState,
            ...fileUploadStates,
          },
        };

        set({ fileUploadStates: updatedFileUploadStates });
      },
      updateSelectedFiles: (files) => {
        const updatedFiles = [...get().selectedFiles, ...files];

        set({ selectedFiles: updatedFiles });
      },
      updateTempMsgById: (conversationId, messageId, messagesUpdated) => {
        const conversation =
          get().conversationStates[conversationId] || defaultConversationState;

        const messages = conversation.messages.map((message) => {
          if (message.id === messageId) {
            return messagesUpdated;
          }

          return message;
        });

        get().setConversationStates(conversationId, {
          ...conversation,
          messages,
        });
      },
    }))
  );

export type TCreateConversationStore = ReturnType<
  typeof createConversationStore
>;

export { createConversationStore };

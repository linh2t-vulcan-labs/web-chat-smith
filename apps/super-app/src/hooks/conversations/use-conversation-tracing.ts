import { useCallback, useMemo } from "react";

import type {
  TReadSourceDTO,
  TStopLongRunningTaskType,
} from "@/core/http/dto/conversation";
import type {
  ConversationModel,
  TMessageTemp,
} from "@/core/models/conversation";
import {
  EConversationMode,
  EStopConversationTaskType,
} from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useQueryClient } from "@/libs/react-query";

import { useHandlePollingDeepResearchProcess } from "../deep-research/use-handle-polling-process";
import { useHandlePollingProcessImageToImage } from "../image-creation/use-handle-polling-process-image-to-image";
import { useGetChatPollingResult } from "../polling-process/use-get-chat-polling-result";
import { getConversationQueryKey } from "./use-get-conversation";

type TTracingType = "deep_research" | "image_creation" | "realtime_search";

type TTracingController = { stop: () => void } | undefined;

type TTracingStrategy = (
  conversationInfo: ConversationModel,
  messages: TMessageTemp[],
  enabledChatSync: boolean
) => TTracingController;

const startedTracingRef = { current: new Set<string>() };
const stopControllersRef = { current: new Map<string, () => void>() };

export function registerTracingController(
  conversationId: string,
  stop: () => void
): void {
  stopControllersRef.current.set(conversationId, stop);
  startedTracingRef.current.add(conversationId);
}

// function unregisterTracingController(conversationId: string): void {
//   stopControllersRef.current.delete(conversationId);
//   startedTracingRef.current.delete(conversationId);
// }

export function useConversationTracing() {
  const queryClient = useQueryClient();
  const { startTracingProgressDeepResearch } =
    useHandlePollingDeepResearchProcess();
  const { startTracingProgressImageToImage } =
    useHandlePollingProcessImageToImage();
  const { startTracingProgressV2 } = useGetChatPollingResult();
  const { isBeta: enabledChatSync } = useChatSyncFlag();

  const tracingStrategies = useMemo<Record<TTracingType, TTracingStrategy>>(
    () => ({
      deep_research: startTracingProgressDeepResearch,
      image_creation: startTracingProgressImageToImage,
      realtime_search: startTracingProgressV2,
    }),
    [
      startTracingProgressDeepResearch,
      startTracingProgressImageToImage,
      startTracingProgressV2,
    ]
  );

  const startTracing = useCallback(
    (
      conversationInfo: ConversationModel | undefined | null,
      messages: TMessageTemp[],
      enabledChatSync: boolean
    ) => {
      if (!conversationInfo) {
        return;
      }

      const { longPollingProcess, id: conversationId } = conversationInfo;

      if (!longPollingProcess?.processId || !longPollingProcess?.type) {
        return;
      }

      const tracingType = longPollingProcess.type as TTracingType;

      // If the conversation is already being traced, do nothing to avoid duplicate tracing
      if (startedTracingRef.current.has(conversationId)) {
        return;
      }
      // Get the tracing strategy for the conversation type
      const strategy = tracingStrategies[tracingType];
      if (!strategy) {
        console.warn(`Unknown tracing type: ${tracingType}`);
        return;
      }

      // Add the conversation to the started tracing set
      startedTracingRef.current.add(conversationId);

      // Start the tracing
      const controller = strategy(conversationInfo, messages, enabledChatSync);
      if (controller?.stop) {
        registerTracingController(conversationId, controller.stop);
      }
    },
    [tracingStrategies]
  );

  const getStopType = useCallback((convMode: EConversationMode) => {
    switch (convMode) {
      case EConversationMode.DEEP_RESEARCH: {
        return EStopConversationTaskType.PROCESS_TYPE_DEEP_RESEARCH;
      }
      case EConversationMode.WEB_SEARCH: {
        return EStopConversationTaskType.PROCESS_TYPE_REAL_TIME_SEARCH;
      }
      case EConversationMode.AI_ART: {
        return EStopConversationTaskType.PROCESS_TYPE_IMAGE_GENERATION;
      }
      default: {
        return "";
      }
    }
  }, []);

  const stopTracing = useCallback(
    async (
      conversationId: string,
      processId: string,
      conversationMode: EConversationMode
    ) => {
      if (!processId || !conversationId) {
        return;
      }

      const stopType = getStopType(conversationMode);
      const payload = {
        conversation_id: conversationId,
        process_id: processId,
        read_source: (enabledChatSync
          ? "READ_SOURCE_CONVERSATION_NEXUS"
          : "READ_SOURCE_ENGINE") as TReadSourceDTO,
        type: stopType as TStopLongRunningTaskType,
      };
      await conversationClientService.stopLongRunningTask(payload);
      await queryClient.invalidateQueries({
        queryKey: getConversationQueryKey(conversationId),
      });
      const stop = stopControllersRef.current.get(conversationId);
      if (stop) {
        stop();
        startedTracingRef.current.delete(conversationId);
        stopControllersRef.current.delete(conversationId);
      }
    },
    [getStopType, enabledChatSync, queryClient]
  );

  // const cleanupTracing = useCallback(
  //   (conversationInfo: ConversationModel | undefined | null) => {
  //     stopTracing(conversationInfo);
  //   },
  //   [stopTracing]
  // );

  return {
    startTracing,
    stopTracing,
    // cleanupTracing,
  };
}

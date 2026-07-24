"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  toastConnectionLost,
  toastGenerationFailed,
} from "@/features/suite/components/custom/error-toast";
import type {
  PromptInputMessage,
  SuiteCanvasAttachmentMeta,
  SuiteImageSelectionBounds,
} from "@/features/suite/components/ui/ai-elements/prompt-input";
import {
  useDeleteMessage,
  useGetMessageHistory,
  usePostMessage,
} from "@/features/suite/hooks/api/use-message";
import { quotaQueryOptions } from "@/features/suite/hooks/api/use-quota";
import { useStreamMessage } from "@/features/suite/hooks/api/use-stream";
import { useSuiteTracking } from "@/features/suite/hooks/use-suite-tracking";
import { createCreativeStreamCoordinator } from "@/features/suite/services/design-studio/stream/design-studio-stream-coordinator";
import {
  useSuiteConversation,
  useSuiteConversationStore,
} from "@/features/suite/stores/conversation/hooks";
import type {
  ConversationItem,
  DesignGuidelineSection,
  SuiteAssetType,
  ThinkingStep,
} from "@/features/suite/types/conversation";
import type {
  SuiteCreativeDirectionModel,
  SuiteCreativeMessageModel,
  TSuiteCreativeMaskInput,
  TSuiteCreativeMessageModeHint,
} from "@/features/suite/types/design-studio";
import type { SuiteDetailEntryType } from "@/features/suite/types/main-flow";
import {
  isSuiteNotFoundError,
  isSuiteQuotaExceededError,
} from "@/features/suite/utils/api-error";
import { CONVERSATION_ITEM_TYPE } from "@/features/suite/utils/constants/conversation";
import { SUITE_DETAIL_ENTRY_TYPE } from "@/features/suite/utils/constants/main-flow";
import { isNetworkError } from "@/features/suite/utils/network";
import { getPromptAttachmentSnapshots } from "@/features/suite/utils/prompt-attachment-snapshot";
import { useQueryClient } from "@/libs/react-query";

interface UseConversationOptions {
  entryType?: SuiteDetailEntryType;
  onAutoSubmitError?: (
    message: Extract<ConversationItem, { type: "user" }>,
    error?: unknown
  ) => void;
  onAutoSubmitQuotaReached?: (
    message: Extract<ConversationItem, { type: "user" }>
  ) => void;
  onEnsureProjectId?: () => Promise<string | undefined>;
  onProjectNotFound?: () => void;
  projectId?: string;
  templateId?: string;
}

interface RunStreamOptions {
  appendUser: boolean;
  images: string[];
  imageSelections: SuiteImageSelectionBounds[];
  promptAttachments: Extract<
    ConversationItem,
    { type: "user" }
  >["promptAttachments"];
  referenceUploadIds: string[];
  // Display-only uploads (e.g. canvas annotation/mask crops). NOT forwarded to the AI pipeline —
  // sent as display_image_ids so they render in history without acting as generation references.
  displayImageIds: string[];
  templateId?: string;
  text: string;
  assetType: SuiteAssetType;
  requestContext: MessageRequestContext;
}

interface MessageRequestContext {
  mask?: TSuiteCreativeMaskInput;
  modeHint: TSuiteCreativeMessageModeHint;
  targetImageId?: string;
}

function getCurrentAssetType(items: ConversationItem[]): SuiteAssetType {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    const item = items[i];
    if (!item) {
      continue;
    }
    if (item.type === "mode-chip") {
      const label = item.label.toLowerCase();
      // Only a real "poster" template lays out vertically. The generic "template" fallback
      // label (template.type missing) must NOT be treated as poster — its images are logos
      // and should lay out in a horizontal row like normal logo generation.
      return label === "poster" ? "poster" : "logo";
    }
  }
  return "logo";
}

function getDefaultMessageModeHint(
  entryType: SuiteDetailEntryType,
  items: ConversationItem[]
): TSuiteCreativeMessageModeHint {
  if (
    entryType === SUITE_DETAIL_ENTRY_TYPE.PROMPTING ||
    entryType === SUITE_DETAIL_ENTRY_TYPE.TEMPLATE
  ) {
    const hasGenerated = items.some(
      (item) => item.type === CONVERSATION_ITEM_TYPE.GENERATED
    );
    return hasGenerated ? "edit" : "create";
  }

  // Existing-project chat is temporarily treated as edit until real intent detection lands.
  return "edit";
}

function normalizeMask(
  bounds: SuiteImageSelectionBounds
): TSuiteCreativeMaskInput {
  return {
    height: bounds.height,
    width: bounds.width,
    x: bounds.x,
    y: bounds.y,
  };
}

function getCanvasRequestContext(
  files: PromptInputMessage["files"],
  fallbackModeHint: TSuiteCreativeMessageModeHint,
  templateId?: string
): MessageRequestContext {
  const annotationMeta = files
    .map((file) => file.canvasMeta)
    .find(
      (
        meta
      ): meta is Extract<SuiteCanvasAttachmentMeta, { type: "annotation" }> =>
        meta?.type === "annotation"
    );

  if (annotationMeta) {
    const { targetImageId } = annotationMeta;
    if (!targetImageId && !templateId) {
      throw new Error(
        "Creative Studio target image id is required for inpaint."
      );
    }

    return {
      modeHint: "inpaint",
      ...(targetImageId && { targetImageId }),
      mask: normalizeMask(annotationMeta.bounds),
    };
  }

  const fullImageMeta = files
    .map((file) => file.canvasMeta)
    .find(
      (
        meta
      ): meta is Extract<SuiteCanvasAttachmentMeta, { type: "full-image" }> =>
        meta?.type === "full-image"
    );

  if (fullImageMeta) {
    const { targetImageId } = fullImageMeta;
    if (!targetImageId && !templateId) {
      throw new Error(
        "Creative Studio target image id is required for image edit."
      );
    }

    return {
      modeHint: "edit",
      ...(targetImageId && { targetImageId }),
    };
  }

  return { modeHint: fallbackModeHint };
}

function getGuidelineSectionsFromModel(
  options: SuiteCreativeDirectionModel[]
): DesignGuidelineSection[] {
  return options.map((d) => ({ coreConcept: d.coreConcept, label: d.title }));
}

// Rebuild the thinking steps from a stored message's analysis metadata. Mirrors the live
// coordinator's analysisStepsFromData (same labels/order) so history renders the same "Thought".
function analysisToThinkingSteps(
  analysis: NonNullable<SuiteCreativeMessageModel["metadata"]>["analysis"]
): ThinkingStep[] {
  if (!analysis) {
    return [];
  }
  return [
    analysis.brandName && {
      description: analysis.brandName,
      label: "Brand name",
    },
    analysis.industry && { description: analysis.industry, label: "Industry" },
    analysis.logoType && { description: analysis.logoType, label: "Type" },
    analysis.style && { description: analysis.style, label: "Style" },
  ].filter((s): s is ThinkingStep => Boolean(s));
}

// The "image being acted on" slot: a mask/inpaint turn carries its marked-region crop in
// displayImagesUrls (display_image_ids) — show that instead of the full targetImageUrl so the
// bubble reflects what the user marked, not the whole image. Plain edits (no crop) fall back
// to targetImageUrl. Genuine reference uploads (attachedImageUrls) and the template always show.
function resolveActedOnImages(message: SuiteCreativeMessageModel): string[] {
  const displayImagesUrls = message.metadata?.displayImagesUrls ?? [];
  if (displayImagesUrls.length) {
    return displayImagesUrls;
  }
  if (message.metadata?.targetImageUrl) {
    return [message.metadata.targetImageUrl];
  }
  return [];
}

function buildUserConversationItem(
  message: SuiteCreativeMessageModel
): ConversationItem {
  const userImages = [
    ...(message.metadata?.templateImageUrl
      ? [message.metadata.templateImageUrl]
      : []),
    ...resolveActedOnImages(message),
    ...(message.metadata?.attachedImageUrls ?? []),
  ];
  return {
    text: message.content,
    type: "user",
    ...(userImages.length ? { images: userImages } : {}),
  };
}

// An assistant turn can carry up to two bot bubbles: `intention` (opening, shown BEFORE the
// guideline/generated) and `content` (closing summary, shown AFTER generated). Either may be
// absent — a chat-only turn has just `intention`; emit each independently in stream order:
// intention → guideline → generated → content.
function buildAssistantConversationItems(
  message: SuiteCreativeMessageModel
): ConversationItem[] {
  // Failed assistant turn → show the error card, not the (partial) metadata.
  if (message.status === "failed") {
    return [{ type: "error" }];
  }

  const items: ConversationItem[] = [];

  const intention = message.metadata?.intention;
  if (intention) {
    items.push({ isAnimating: false, text: intention, type: "bot" });
  }

  // Replay the completed "Thought" from analysis metadata (static — no animation on history).
  const thinkingSteps = analysisToThinkingSteps(message.metadata?.analysis);
  if (thinkingSteps.length > 0) {
    items.push({
      isAnimating: false,
      status: "complete",
      steps: thinkingSteps,
      title: "Thought",
      type: "thinking",
    });
  }

  const options = message.metadata?.options ?? [];
  if (options.length > 0) {
    const sections = getGuidelineSectionsFromModel(options);
    if (sections.length > 0) {
      items.push({
        isAnimating: false,
        sections,
        status: "complete",
        title: "Design concepts",
        type: "design-guidelines",
      });
    }
  }

  const generatedUrls = message.metadata?.generatedImageUrls;
  if (generatedUrls && generatedUrls.length > 0) {
    items.push({
      generationId: message.id,
      images: generatedUrls,
      title: `Generated ${generatedUrls.length === 1 ? "image" : "images"}`,
      type: "generated",
    });

    if (message.content) {
      items.push({ isAnimating: false, text: message.content, type: "bot" });
    }
  }

  return items;
}

function messagesToItems(
  messages: SuiteCreativeMessageModel[]
): ConversationItem[] {
  const items: ConversationItem[] = [];

  for (const message of messages) {
    if (message.role === "user") {
      items.push(buildUserConversationItem(message));
    } else if (message.role === "assistant") {
      items.push(...buildAssistantConversationItems(message));
    }
  }

  return items;
}

type StreamCoordinator = ReturnType<typeof createCreativeStreamCoordinator>;
interface StreamCoordinatorRef {
  current: StreamCoordinator | null;
}
interface PendingBlockAnimationCompleteRef {
  current: ((id?: string) => void) | null;
}

function trackImageGenResult(
  coordinator: StreamCoordinator,
  hasTemplate: boolean,
  tracking: ReturnType<typeof useSuiteTracking>
) {
  const imageGenResult = coordinator.getImageGenResult();
  if (imageGenResult.failed || imageGenResult.action) {
    tracking.trackImageGen({
      action: imageGenResult.action ?? "",
      status: imageGenResult.failed ? "failed" : "success",
      type: hasTemplate ? "with template" : "no template",
    });
  }
}

function disposeStreamCoordinator(
  coordinatorRef: StreamCoordinatorRef,
  pendingBlockAnimationCompleteRef: PendingBlockAnimationCompleteRef
) {
  coordinatorRef.current?.dispose();
  coordinatorRef.current = null;
  pendingBlockAnimationCompleteRef.current = null;
}

// Stream was aborted by the offline listener → mutateAsync resolved cleanly (no throw), so the
// catch handler never ran. Show the "connection lost" toast here instead.
function cleanupAfterOfflineAbort(
  offlineAborted: boolean,
  streamStarted: boolean,
  coordinatorRef: StreamCoordinatorRef,
  pendingBlockAnimationCompleteRef: PendingBlockAnimationCompleteRef
) {
  if (!(offlineAborted && streamStarted)) {
    return;
  }
  disposeStreamCoordinator(coordinatorRef, pendingBlockAnimationCompleteRef);
  toastConnectionLost();
}

function buildUserMessageItem(
  options: Pick<
    RunStreamOptions,
    | "text"
    | "images"
    | "imageSelections"
    | "promptAttachments"
    | "referenceUploadIds"
  >
): ConversationItem {
  return {
    text: options.text,
    type: "user",
    ...(options.images.length > 0 && { images: options.images }),
    ...(options.imageSelections.length > 0 && {
      imageSelections: options.imageSelections,
    }),
    ...(options.promptAttachments &&
      options.promptAttachments.length > 0 && {
        promptAttachments: options.promptAttachments,
      }),
    ...(options.referenceUploadIds.length > 0 && {
      referenceUploadIds: options.referenceUploadIds,
    }),
  };
}

function buildPostMessagePayload(
  currentProjectId: string,
  options: RunStreamOptions
) {
  return {
    content: options.text,
    projectId: currentProjectId,
    referenceUploadIds: options.referenceUploadIds,
    ...(options.displayImageIds.length > 0 && {
      displayImageIds: options.displayImageIds,
    }),
    // template_id and target_image_id are mutually exclusive: on the template's first
    // message both would carry the same template.id, so prefer template_id and drop
    // target_image_id when templateId is present.
    ...(!options.templateId &&
      options.requestContext.targetImageId && {
        targetImageId: options.requestContext.targetImageId,
      }),
    ...(options.requestContext.mask && {
      mask: options.requestContext.mask,
    }),
    ...(options.templateId && { templateId: options.templateId }),
  };
}

async function ensureCurrentProjectId(
  projectIdRef: { current: string | undefined },
  onEnsureProjectId: (() => Promise<string | undefined>) | undefined,
  setIsPreparingProject: (value: boolean) => void
): Promise<string> {
  if (!projectIdRef.current) {
    setIsPreparingProject(true);
    try {
      const nextProjectId = await onEnsureProjectId?.();
      if (nextProjectId) {
        projectIdRef.current = nextProjectId;
      }
    } finally {
      setIsPreparingProject(false);
    }
  }

  const currentProjectId = projectIdRef.current;
  if (!currentProjectId) {
    throw new Error(
      "Creative Studio project id is required before posting a message."
    );
  }
  return currentProjectId;
}

interface RunStreamErrorContext {
  coordinatorRef: StreamCoordinatorRef;
  pendingBlockAnimationCompleteRef: PendingBlockAnimationCompleteRef;
  shouldRollback: boolean;
  streamStarted: boolean;
  store: ReturnType<typeof useSuiteConversationStore>;
  initialItems: ConversationItem[];
  tracking: ReturnType<typeof useSuiteTracking>;
  queryClient: ReturnType<typeof useQueryClient>;
}

// Stream started (POST succeeded) but failed mid-way — keep the user message, toast only.
function handleRunStreamFailureAfterStart(
  error: unknown,
  ctx: RunStreamErrorContext
) {
  disposeStreamCoordinator(
    ctx.coordinatorRef,
    ctx.pendingBlockAnimationCompleteRef
  );
  if (isNetworkError(error)) {
    toastConnectionLost();
  } else {
    toastGenerationFailed();
  }
}

// Quota exceeded: detect by the backend's body code (8 = RESOURCE_EXHAUSTED) — the HTTP status is
// lost by the Axios interceptor. Only then refresh quota so the limit UI / countdown updates; keep
// the user message visible, no rollback, no toast.
async function handleRunStreamQuotaExceeded(ctx: RunStreamErrorContext) {
  ctx.tracking.trackHitLimit();
  try {
    await ctx.queryClient.fetchQuery({ ...quotaQueryOptions, staleTime: 0 });
  } catch {
    // ignore quota fetch failure — the limit card just won't update this round
  }
}

// Stream-event errors are already turned into an error card by the coordinator's renderError();
// this only catches transport-level failures of the resume connection.
function handleResumeStreamError(
  error: unknown,
  coordinatorRef: StreamCoordinatorRef,
  pendingBlockAnimationCompleteRef: PendingBlockAnimationCompleteRef
) {
  if ((error as Error).name === "AbortError") {
    return;
  }
  disposeStreamCoordinator(coordinatorRef, pendingBlockAnimationCompleteRef);
  if (isNetworkError(error)) {
    toastConnectionLost();
  }
}

async function handleRunStreamError(
  error: unknown,
  ctx: RunStreamErrorContext
) {
  const isAborted = (error as Error).name === "AbortError";
  if (isAborted) {
    // An intentional cancel (stop button, unmount, going offline, or a newer stream superseding
    // this one). Not an error — swallow so callers (e.g. the auto-submit .catch) don't surface a
    // "sending failed" toast. The finally block resets the streaming state.
    return;
  }

  if (ctx.shouldRollback && ctx.streamStarted) {
    handleRunStreamFailureAfterStart(error, ctx);
    return;
  }

  if (!ctx.shouldRollback) {
    // renderError() already handled — don't propagate.
    return;
  }

  disposeStreamCoordinator(
    ctx.coordinatorRef,
    ctx.pendingBlockAnimationCompleteRef
  );

  if (isSuiteQuotaExceededError(error)) {
    await handleRunStreamQuotaExceeded(ctx);
    return;
  }

  ctx.store.getState().setItems(ctx.initialItems);
  throw error;
}

export function useConversation({
  entryType = SUITE_DETAIL_ENTRY_TYPE.PROJECT,
  onAutoSubmitError,
  onAutoSubmitQuotaReached,
  onEnsureProjectId,
  onProjectNotFound,
  projectId,
  templateId,
}: UseConversationOptions = {}) {
  const items = useSuiteConversation((s) => s.items);
  const store = useSuiteConversationStore();
  const queryClient = useQueryClient();
  const tracking = useSuiteTracking();

  const postMessageMutation = usePostMessage();
  const streamMessageMutation = useStreamMessage();
  const deleteMessageMutation = useDeleteMessage();
  const [isPreparingProject, setIsPreparingProject] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  // True while the animation queue still has blocks to reveal — stays true AFTER the network stream
  // ends (message.done) until the last bot/thinking/guideline block finishes animating. Used to keep
  // the composer disabled until the reveal fully completes, not just until the SSE connection closes.
  const [isAnimating, setIsAnimating] = useState(false);
  const [streamStartItemCount, setStreamStartItemCount] = useState<
    number | null
  >(null);
  const didResumeHomeSubmitRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const pendingBlockAnimationCompleteRef = useRef<
    ((id?: string) => void) | null
  >(null);
  const coordinatorRef = useRef<ReturnType<
    typeof createCreativeStreamCoordinator
  > | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeGenerationRef = useRef<{
    projectId: string;
    messageId: string;
  } | null>(null);
  const projectIdRef = useRef(projectId);
  const isConversationAliveRef = useRef(false);
  const pendingTemplateIdRef = useRef(templateId);
  const [isTemplateFirstMessage, setIsTemplateFirstMessage] = useState(
    Boolean(templateId)
  );
  const onAutoSubmitErrorRef = useRef(onAutoSubmitError);
  useEffect(() => {
    onAutoSubmitErrorRef.current = onAutoSubmitError;
  });
  const onAutoSubmitQuotaReachedRef = useRef(onAutoSubmitQuotaReached);
  useEffect(() => {
    onAutoSubmitQuotaReachedRef.current = onAutoSubmitQuotaReached;
  });
  const onProjectNotFoundRef = useRef(onProjectNotFound);
  useEffect(() => {
    onProjectNotFoundRef.current = onProjectNotFound;
  });

  // SuiteConversationProvider lives at layout level — persists across project navigations.
  // Reset on unmount so the next project mounts with a clean store; also drop any pending timers.
  // Deferred + cancellable: React Strict Mode double-invokes this effect on mount (setup → cleanup →
  // setup), and running the cleanup synchronously would wipe the items seeded by handleUseTemplate/
  // handleSubmitPrompt before this hook ever gets a chance to read them. A real unmount has no
  // matching re-setup to cancel the timeout, so the reset still happens for genuine navigations away.
  useEffect(() => {
    isConversationAliveRef.current = true;
    const processedMessageIds = processedMessageIdsRef.current;
    return () => {
      isConversationAliveRef.current = false;
      setTimeout(() => {
        if (isConversationAliveRef.current) {
          return;
        }
        abortControllerRef.current?.abort();
        coordinatorRef.current?.dispose();
        coordinatorRef.current = null;
        processedMessageIds.clear();
        store.getState().reset();
      }, 0);
    };
  }, [store]);

  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  // Capture projectId at mount — only load history for pre-existing projects,
  // not for projects created mid-session where projectId starts undefined.
  const mountProjectIdRef = useRef(projectId);

  const {
    data: historyData,
    error: historyError,
    hasNextPage: hasNextHistoryPage,
    fetchNextPage: fetchNextHistoryPage,
    isFetching: isFetchingHistory,
  } = useGetMessageHistory({
    // oxlint-disable-next-line react/react-compiler -- intentionally reads the mount-time snapshot of projectId from a ref so history is only ever fetched for the pre-existing project captured at mount
    projectId: mountProjectIdRef.current ?? "",
    pageSize: 10,
  });

  // Project deleted/never existed → history returns NOT_FOUND. Bail back to home.
  useEffect(() => {
    if (isSuiteNotFoundError(historyError)) {
      onProjectNotFoundRef.current?.();
    }
  }, [historyError]);

  const processedHistoryPagesRef = useRef(0);
  // Server message ids already rendered. Page windows reshuffle after new messages are streamed
  // (react-query refetches page 0 → it returns the newer turn, sliding older messages into the
  // next page), so the same message can come back on a later page. Dedup by id, not by page count.
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const [historyPageCount, setHistoryPageCount] = useState(0);

  useEffect(() => {
    if (!historyData?.pages || historyData.pages.length === 0) {
      processedHistoryPagesRef.current = 0;
      processedMessageIdsRef.current.clear();
      return;
    }
    const newPages = historyData.pages.slice(processedHistoryPagesRef.current);
    if (newPages.length === 0) {
      return;
    }

    for (const page of newPages) {
      if (!page?.messages?.length) {
        continue;
      }
      // Drop any message already rendered (overlap across reshuffled pages → no duplicates).
      const freshMessages = page.messages.filter(
        (message) => !processedMessageIdsRef.current.has(message.id)
      );
      if (freshMessages.length === 0) {
        continue;
      }
      for (const message of freshMessages) {
        processedMessageIdsRef.current.add(message.id);
      }
      const newItems = messagesToItems([...freshMessages].toReversed());
      if (newItems.length === 0) {
        continue;
      }
      store.getState().prependItems(newItems);
    }

    processedHistoryPagesRef.current = historyData.pages.length;
    setHistoryPageCount(historyData.pages.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyData]);

  const runStreamAfterProjectReady = useCallback(
    async (options: RunStreamOptions) => {
      if (isSubmittingRef.current) {
        throw new Error(
          "A Creative Studio message is already being submitted."
        );
      }

      const initialItems = store.getState().items;
      isSubmittingRef.current = true;
      setStreamStartItemCount(store.getState().items.length);
      setIsStreaming(true);
      let shouldRollback = true;
      let streamStarted = false;
      let offlineAborted = false;

      // Create the abort controller UP FRONT (before the POST), not after it. The POST is async and
      // outlives the component: if the user backs out while it's in flight, the unmount cleanup must
      // have a controller to abort — otherwise the POST finishes post-unmount, opens an orphaned
      // stream, and that stream runs in parallel with the re-entry's resume (duplicate bubbles).
      // Tear down any previous in-flight stream first so two readers can never coexist on this ref.
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const handleOffline = () => {
        offlineAborted = true;
        abortController.abort();
      };

      try {
        if (options.appendUser) {
          store.getState().appendItem(buildUserMessageItem(options));
        }

        const currentProjectId = await ensureCurrentProjectId(
          projectIdRef,
          onEnsureProjectId,
          setIsPreparingProject
        );

        const postMessageResult = await postMessageMutation.mutateAsync(
          buildPostMessagePayload(currentProjectId, options)
        );

        if (!postMessageResult?.messageId) {
          throw new Error("Creative Studio assistant message id is missing.");
        }

        // Unmounted (or otherwise aborted) while the POST was in flight → the message now exists
        // server-side and the re-entry will resume it; do NOT also open a stream here (would run in
        // parallel with that resume). Bail before touching the coordinator/store.
        if (abortController.signal.aborted) {
          return;
        }

        const generationId = postMessageResult.messageId;
        coordinatorRef.current?.dispose();
        activeGenerationRef.current = {
          messageId: generationId,
          projectId: currentProjectId,
        };

        const coordinator = createCreativeStreamCoordinator({
          generationId,
          store,
          assetType: options.assetType,
          onMessageDone: () => {
            shouldRollback = false;
          },
          onError: () => toastGenerationFailed(),
          // Animation-complete callbacks fire inside React effects / DOM events; defer advancing
          // the queue out of that call stack before appending the next block.
          scheduleAdvance: (cb) => setTimeout(cb, 0),
          onQueueActiveChange: setIsAnimating,
        });
        coordinatorRef.current = coordinator;
        pendingBlockAnimationCompleteRef.current =
          coordinator.onBlockAnimationComplete;

        // Abort the stream immediately when the browser goes offline instead of waiting for
        // TCP timeout. Flag lets the finally block show the appropriate toast.
        window.addEventListener("offline", handleOffline, { once: true });

        streamStarted = true;
        await streamMessageMutation.mutateAsync({
          handlers: coordinator.handlers,
          messageId: postMessageResult.messageId,
          projectId: currentProjectId,
          signal: abortController.signal,
        });

        // Stream ended normally (incl. fatal error events, which resolve). Fire image_gen once if a
        // logo_design generation happened this turn. failed = a fatal error rendered.
        trackImageGenResult(coordinator, Boolean(options.templateId), tracking);
      } catch (error) {
        await handleRunStreamError(error, {
          coordinatorRef,
          initialItems,
          pendingBlockAnimationCompleteRef,
          queryClient,
          shouldRollback,
          store,
          streamStarted,
          tracking,
        });
      } finally {
        window.removeEventListener("offline", handleOffline);
        cleanupAfterOfflineAbort(
          offlineAborted,
          streamStarted,
          coordinatorRef,
          pendingBlockAnimationCompleteRef
        );
        abortControllerRef.current = null;
        activeGenerationRef.current = null;
        setIsPreparingProject(false);
        isSubmittingRef.current = false;
        setIsStreaming(false);
        setStreamStartItemCount(null);
      }
    },
    [
      onEnsureProjectId,
      postMessageMutation,
      queryClient,
      store,
      streamMessageMutation,
      tracking,
    ]
  );

  // Resume an in-flight generation after a reload: the newest history message is still `pending`
  // (BE only has this status), so its partial content was already rendered by messagesToItems and
  // we now reconnect the SSE stream from the message's own lastEventId — BE replays only events
  // AFTER it, so the coordinator appends the remaining blocks. No appendUser / postMessage (the
  // message already exists); the lastEventId comes from the message, not a FE-stored ref.
  const runResumeStream = useCallback(
    async (message: SuiteCreativeMessageModel) => {
      if (isSubmittingRef.current) {
        return;
      }
      const currentProjectId = projectIdRef.current;
      if (!currentProjectId) {
        return;
      }

      isSubmittingRef.current = true;
      setStreamStartItemCount(store.getState().items.length);
      setIsStreaming(true);

      const generationId = message.id;
      coordinatorRef.current?.dispose();
      // Tear down any stream still in flight before opening a new one (see runStreamAfterProjectReady).
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      activeGenerationRef.current = {
        messageId: generationId,
        projectId: currentProjectId,
      };

      const assetType = getCurrentAssetType(store.getState().items);
      const coordinator = createCreativeStreamCoordinator({
        generationId,
        store,
        assetType,
        // Resume path doesn't need to flip a rollback flag (nothing to roll back on resume).
        onMessageDone: () => {
          // Intentionally a no-op for the resume flow.
        },
        onError: () => toastGenerationFailed(),
        scheduleAdvance: (cb) => setTimeout(cb, 0),
        onQueueActiveChange: setIsAnimating,
      });
      coordinatorRef.current = coordinator;
      pendingBlockAnimationCompleteRef.current =
        coordinator.onBlockAnimationComplete;

      // On resume the SSE replays only events AFTER lastEventId, and analysis_ready (which carries
      // the planned image count) already fired before it — so the coordinator's fillThinking won't
      // re-seed the canvas skeleton count. The count was persisted in metadata.analysis, so seed the
      // same pendingSkeletonHint the live analysis_ready would have set: the canvas pre-renders the
      // in-flight skeletons (generationId = message.id) and arriving images replace them by id.
      const plannedCount = message.metadata?.analysis?.count ?? 0;
      if (plannedCount > 0) {
        store.getState().setPendingSkeletonHint({
          assetType,
          count: plannedCount,
          generationId,
        });
      }

      let resumeOfflineAborted = false;
      const handleResumeOffline = () => {
        resumeOfflineAborted = true;
        abortController.abort();
      };
      window.addEventListener("offline", handleResumeOffline, { once: true });

      try {
        await streamMessageMutation.mutateAsync({
          handlers: coordinator.handlers,
          messageId: generationId,
          projectId: currentProjectId,
          signal: abortController.signal,
          ...(message.lastEventId && { lastEventId: message.lastEventId }),
        });

        // Resume ended — fire image_gen if its replayed events included a logo_design generation.
        // type comes from the persisted message (templateImageUrl present → the gen used a template).
        trackImageGenResult(
          coordinator,
          Boolean(message.metadata?.templateImageUrl),
          tracking
        );
      } catch (error) {
        handleResumeStreamError(
          error,
          coordinatorRef,
          pendingBlockAnimationCompleteRef
        );
      } finally {
        window.removeEventListener("offline", handleResumeOffline);
        // Stream aborted by offline listener → mutateAsync resolved cleanly, catch didn't run.
        cleanupAfterOfflineAbort(
          resumeOfflineAborted,
          true,
          coordinatorRef,
          pendingBlockAnimationCompleteRef
        );
        abortControllerRef.current = null;
        activeGenerationRef.current = null;
        isSubmittingRef.current = false;
        setIsStreaming(false);
        setStreamStartItemCount(null);
      }
    },
    [store, streamMessageMutation, tracking]
  );

  // After history's first page is in, reconnect if its newest message is still streaming (pending).
  const didTryResumeRef = useRef(false);
  useEffect(() => {
    if (didTryResumeRef.current) {
      return;
    }
    const newestMessage = historyData?.pages?.[0]?.messages?.[0];
    if (!newestMessage) {
      return;
    }
    // We're already streaming this exact generation (e.g. just submitted it and history refetched
    // mid-stream). Resume is only for picking up a generation we are NOT already streaming — opening
    // a second connection here would dispatch the same SSE events twice. Skip without consuming the
    // one-shot, so a genuine resume can still fire once this stream ends.
    if (
      isSubmittingRef.current ||
      activeGenerationRef.current?.messageId === newestMessage.id
    ) {
      return;
    }
    didTryResumeRef.current = true;
    if (newestMessage.status === "pending") {
      void runResumeStream(newestMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyData]);

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    const active = activeGenerationRef.current;
    if (active) {
      void (async () => {
        try {
          await deleteMessageMutation.mutateAsync(active);
        } catch {
          // Best-effort cleanup; ignore delete failures.
        }
      })();
    }
  }, [deleteMessageMutation]);

  const handleSubmit = (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!message.text.trim() && message.files.length === 0) {
      return;
    }
    const hasCanvasAttachment = message.files.some((f) => f.canvasMeta);
    if (!message.text.trim() && !hasCanvasAttachment) {
      throw new Error("Creative Studio message content is required.");
    }

    const images = message.files
      .filter((f) => f.type === "file" && f.mediaType?.startsWith("image/"))
      .map((f) => f.url);
    // Canvas annotation/mask crops upload to get a uploadId, but they are display-only — the mask
    // bounds (not the crop image) drive inpaint. Route their ids to display_image_ids; everything
    // else (recent/file/drop reference uploads) stays in reference_upload_ids for the AI pipeline.
    const referenceUploadIds: string[] = [];
    const displayImageIds: string[] = [];
    for (const file of message.files) {
      const { uploadId } = file;
      if (typeof uploadId !== "string" || uploadId === "") {
        continue;
      }
      if (file.canvasMeta?.type === "annotation") {
        displayImageIds.push(uploadId);
      } else {
        referenceUploadIds.push(uploadId);
      }
    }
    const promptAttachments = getPromptAttachmentSnapshots(message.files);
    const imageSelections = message.files
      .map((file) => file.canvasMeta)
      .filter((meta) => meta?.type === "annotation")
      .map((meta) => meta.bounds);
    const consumedTemplateId = pendingTemplateIdRef.current;
    pendingTemplateIdRef.current = undefined;
    setIsTemplateFirstMessage(false);

    const requestContext = getCanvasRequestContext(
      message.files,
      getDefaultMessageModeHint(entryType, items),
      consumedTemplateId
    );

    return runStreamAfterProjectReady({
      appendUser: true,
      images,
      imageSelections,
      promptAttachments,
      requestContext,
      referenceUploadIds,
      displayImageIds,
      ...(consumedTemplateId && { templateId: consumedTemplateId }),
      text: message.text.trim(),
      assetType: getCurrentAssetType(items),
    });
  };

  useEffect(() => {
    if (didResumeHomeSubmitRef.current || isStreaming) {
      return;
    }
    if (items.length !== 1 || items[0]?.type !== "user") {
      return;
    }

    didResumeHomeSubmitRef.current = true;
    const [autoSubmitItem] = items;

    // Quota already exceeded when navigating from home — rollback message to prompt input,
    // show quota card (already visible via useGetQuota in sidebar), no toast.
    const cachedQuota = queryClient.getQueryData<
      Awaited<ReturnType<typeof quotaQueryOptions.queryFn>>
    >(quotaQueryOptions.queryKey);
    if (
      cachedQuota !== null &&
      cachedQuota !== undefined &&
      cachedQuota.remaining <= 0
    ) {
      store.getState().setItems([]);
      onAutoSubmitQuotaReachedRef.current?.(autoSubmitItem);
      return;
    }

    const autoSubmitText = autoSubmitItem.text;
    const consumedTemplateId = pendingTemplateIdRef.current;
    pendingTemplateIdRef.current = undefined;
    // oxlint-disable-next-line react/react-compiler -- clears the template-first-message flag once the pending template ref is consumed for auto-submit; one-shot state transition tied to the ref above, not a render derivation
    setIsTemplateFirstMessage(false);

    const runAutoSubmit = async () => {
      try {
        await runStreamAfterProjectReady({
          appendUser: false,
          images: autoSubmitItem.images ?? [],
          imageSelections: autoSubmitItem.imageSelections ?? [],
          promptAttachments: autoSubmitItem.promptAttachments,
          requestContext: {
            modeHint: getDefaultMessageModeHint(entryType, items),
          },
          referenceUploadIds: autoSubmitItem.referenceUploadIds ?? [],
          // Home auto-submit never carries canvas annotations (canvas lives in studio detail only).
          displayImageIds: [],
          ...(consumedTemplateId && { templateId: consumedTemplateId }),
          text: autoSubmitText,
          assetType: getCurrentAssetType(items),
        });
      } catch (error) {
        onAutoSubmitErrorRef.current?.(autoSubmitItem, error);
      }
    };
    void runAutoSubmit();
  }, [
    entryType,
    items,
    isStreaming,
    queryClient,
    runStreamAfterProjectReady,
    store,
    templateId,
  ]);

  return {
    cancelStream,
    fetchNextHistoryPage,
    handleSubmit,
    hasNextHistoryPage: hasNextHistoryPage ?? false,
    historyPageCount,
    isAnimating,
    isFetchingHistory,
    isPreparingProject,
    isStreaming,
    isTemplateFirstMessage,
    streamStartItemCount,
    items,
    // Single completion signal for every animated block (bot/thinking/guideline) → advances
    // the queue so the next block appears only after the current finishes animating.
    onBlockAnimationComplete: useCallback((id?: string) => {
      pendingBlockAnimationCompleteRef.current?.(id);
    }, []),
  };
}

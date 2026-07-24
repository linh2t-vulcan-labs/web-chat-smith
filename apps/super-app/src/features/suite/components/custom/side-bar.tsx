"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { StickToBottomContext } from "use-stick-to-bottom";

import {
  toastConnectionLost,
  toastSendingFailed,
} from "@/features/suite/components/custom/error-toast";
import { usePromptInputController } from "@/features/suite/components/ui/ai-elements/prompt-input";
import type { SuitePromptAttachment } from "@/features/suite/components/ui/ai-elements/prompt-input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/features/suite/components/ui/sidebar";
import { quotaQueryOptions, useGetQuota } from "@/features/suite/hooks/api";
import { useConversation } from "@/features/suite/hooks/use-conversation";
import { useSuiteModeChipLabel } from "@/features/suite/hooks/use-suite-mode-chip-label";
import { useSuiteProjectNotFoundRedirect } from "@/features/suite/hooks/use-suite-project-not-found-redirect";
import { useSuiteProjectTitle } from "@/features/suite/hooks/use-suite-project-title";
import { useSuiteConversation } from "@/features/suite/stores/conversation/hooks";
import type { SuiteDetailEntryType } from "@/features/suite/types/main-flow";
import { CONVERSATION_ITEM_TYPE } from "@/features/suite/utils/constants/conversation";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";
import { SUITE_DETAIL_ENTRY_TYPE } from "@/features/suite/utils/constants/main-flow";
import { isNetworkError } from "@/features/suite/utils/network";
import { useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@/libs/react-query";

import { ChatHeader } from "./chat-header/index";
import { QuotaHitLimitCard, SuitePromptInput } from "./prompt-input/index";
import { ConversationItemRow } from "./suite-conversation/conversation-item-row";
import {
  SuiteConversation,
  SuiteUserMessage,
} from "./suite-conversation/index";
import { SuiteLoadingIcon } from "./suite-loading-icon";

interface CustomSideBarProps {
  entryType?: SuiteDetailEntryType;
  // The tool's home path, used as the back/redirect fallback when there is no in-app onBack
  // (i.e. a directly-opened detail URL). Threaded in so the sidebar stays tool-agnostic.
  homeRoute: string;
  isProjectActivating?: boolean;
  onBack?: () => void;
  onEnsureProjectId?: () => Promise<string | undefined>;
  projectId?: string;
  templateId?: string;
}

export function CustomSideBar(props: CustomSideBarProps) {
  return <CustomSideBarInner {...props} />;
}

function CustomSideBarInner({
  entryType = SUITE_DETAIL_ENTRY_TYPE.PROJECT,
  homeRoute,
  isProjectActivating = false,
  onBack,
  onEnsureProjectId,
  projectId,
  templateId,
}: CustomSideBarProps) {
  const router = useRouter();
  const redirectOnProjectNotFound = useSuiteProjectNotFoundRedirect(
    homeRoute,
    onBack
  );
  const { toggleSidebar } = useSidebar();
  const [failedMessage, setFailedMessage] = useState<{
    text: string;
    images: string[];
  } | null>(null);
  const [autoSubmitFailed, setAutoSubmitFailed] = useState(false);
  const historyItemCount = useSuiteConversation((s) => s.historyItemCount);
  const {
    items,
    handleSubmit,
    isAnimating,
    isPreparingProject,
    isStreaming,
    streamStartItemCount,
    cancelStream,
    fetchNextHistoryPage,
    hasNextHistoryPage,
    isFetchingHistory,
    onBlockAnimationComplete,
  } = useConversation({
    entryType,
    onAutoSubmitError: (message, error) => {
      const restoredAttachments: SuitePromptAttachment[] = (
        message.promptAttachments ?? []
      ).map((attachment) => ({ ...attachment }));

      controller.textInput.setInput(message.text);
      controller.attachments.restoreFiles?.(restoredAttachments);
      setFailedMessage(null);
      setAutoSubmitFailed(true);
      if (isNetworkError(error)) {
        toastConnectionLost();
      } else {
        toastSendingFailed();
      }
    },
    onAutoSubmitQuotaReached: (message) => {
      const restoredAttachments: SuitePromptAttachment[] = (
        message.promptAttachments ?? []
      ).map((attachment) => ({ ...attachment }));
      controller.textInput.setInput(message.text);
      controller.attachments.restoreFiles?.(restoredAttachments);
    },
    onEnsureProjectId,
    onProjectNotFound: redirectOnProjectNotFound,
    projectId,
    templateId,
  });
  const controller = usePromptInputController();
  const modeChipLabel = useSuiteModeChipLabel();
  const projectTitle = useSuiteProjectTitle({ entryType, projectId });
  // Fetch quota on entering any project (incl. freshly created ones); use-stream invalidates this after generations.
  const queryClient = useQueryClient();
  const { data: quota } = useGetQuota();
  // Refetch quota when the countdown expires so the limit re-evaluates. Stable identity → the
  // self-ticking QuotaHitLimitCard (below) never re-subscribes.
  const onQuotaExpired = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: quotaQueryOptions.queryKey,
    });
  }, [queryClient]);
  // Quota exhausted -> disable submit + block calls. The countdown ticking lives inside
  // QuotaHitLimitCard so the per-second tick doesn't re-render this whole sidebar.
  const isQuotaReached =
    quota !== null && quota !== undefined && quota.remaining <= 0;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef<StickToBottomContext>(null);
  const hasNewAssistantItem =
    streamStartItemCount !== null &&
    items
      .slice(streamStartItemCount)
      .some(
        (item) =>
          item.type !== CONVERSATION_ITEM_TYPE.USER &&
          item.type !== CONVERSATION_ITEM_TYPE.MODE_CHIP
      );
  const showProjectLoading =
    isPreparingProject ||
    isProjectActivating ||
    (isStreaming && !hasNewAssistantItem);

  // Stable refs — effects read these without stale closures
  const hasNextHistoryPageRef = useRef(hasNextHistoryPage);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-value ref updated during render so scroll effects read current pagination state without stale closures
  hasNextHistoryPageRef.current = hasNextHistoryPage;
  const isFetchingHistoryRef = useRef(isFetchingHistory);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-value ref updated during render so scroll effects read current pagination state without stale closures
  isFetchingHistoryRef.current = isFetchingHistory;
  const fetchNextHistoryPageRef = useRef(fetchNextHistoryPage);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-callback ref updated during render so scroll effects call the newest fetcher without stale closures
  fetchNextHistoryPageRef.current = fetchNextHistoryPage;

  // historyItemCount is in Zustand — updates atomically with items in the same render.
  // useLayoutEffect fires before paint → no visible flash of content at top.
  const prevHistoryItemCountRef = useRef(0);
  const prevScrollHeightRef = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (historyItemCount === 0) {
      prevHistoryItemCountRef.current = 0;
      return;
    }

    const scrollEl = stickToBottomRef.current?.scrollRef.current;
    if (!scrollEl) {
      return;
    }

    const prevScrollBehavior = scrollEl.style.scrollBehavior;
    scrollEl.style.scrollBehavior = "auto";

    if (prevHistoryItemCountRef.current === 0) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    } else if (
      historyItemCount > prevHistoryItemCountRef.current &&
      prevScrollHeightRef.current !== null
    ) {
      const diff = scrollEl.scrollHeight - prevScrollHeightRef.current;
      scrollEl.scrollTop += diff;
      prevScrollHeightRef.current = null;
    }

    scrollEl.style.scrollBehavior = prevScrollBehavior;

    prevHistoryItemCountRef.current = historyItemCount;
  }, [historyItemCount]);

  // Guard prevents multiple fetches while isFetchingHistory state hasn't updated yet
  const fetchGuardRef = useRef(false);
  useEffect(() => {
    if (!isFetchingHistory) {
      fetchGuardRef.current = false;
    }
  }, [isFetchingHistory]);

  // Scroll listener — attached once on mount to StickToBottom's inner scroll element
  useEffect(() => {
    const scrollEl = stickToBottomRef.current?.scrollRef.current;
    if (!scrollEl) {
      return;
    }

    const handleScroll = () => {
      if (
        scrollEl.scrollTop < 100 &&
        hasNextHistoryPageRef.current &&
        !fetchGuardRef.current &&
        !isFetchingHistoryRef.current
      ) {
        fetchGuardRef.current = true;
        prevScrollHeightRef.current = scrollEl.scrollHeight;
        fetchNextHistoryPageRef.current();
      }
    };

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, []);

  // Re-pin when the scroller VIEWPORT resizes. use-stick-to-bottom only observes its CONTENT:
  // when the viewport height changes instead (footer/prompt-input area growing or shrinking, a
  // loading row toggling, …) the lib is blind to it — a viewport GROW makes the browser clamp
  // scrollTop, which the lib misreads as a user scroll-up and permanently escapes its bottom
  // lock for the rest of the turn; a viewport SHRINK silently leaves the view sitting above the
  // bottom with no event at all. If we were at/near the bottom just before the viewport change,
  // re-assert the lock via scrollToBottom (it re-sets the lib's internal isAtBottom).
  useEffect(() => {
    const ctx = stickToBottomRef.current;
    const scrollEl = ctx?.scrollRef.current;
    if (!ctx || !scrollEl) {
      return;
    }

    let lastDist =
      scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
    const trackDist = () => {
      lastDist =
        scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
    };
    // Real user intent on the scroller — suppresses the guard re-pins below so a user who starts
    // reading right after a viewport change is never yanked back down.
    let lastIntentAt = 0;
    const markIntent = () => {
      lastIntentAt = Date.now();
    };

    const repin = () => {
      stickToBottomRef.current?.scrollToBottom({ animation: "instant" });
      lastDist = 0;
    };

    // The browser clamp triggered by a viewport GROW lands AFTER our immediate re-pin (the lib's
    // escape verdict runs in its own setTimeout after that clamp scroll event), so the lib can die
    // again right after we just rescued it — and the next content grow then sits off-bottom with
    // no further viewport change to wake us. Re-check a few times after each viewport change and
    // re-pin if we've drifted off-bottom with no user input since the change.
    let guardTimers: ReturnType<typeof setTimeout>[] = [];
    const scheduleGuard = () => {
      for (const t of guardTimers) {
        clearTimeout(t);
      }
      const changedAt = Date.now();
      guardTimers = [150, 400, 900].map((delay) =>
        setTimeout(() => {
          if (lastIntentAt > changedAt) {
            return;
          }
          const dist =
            scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
          if (dist > 4) {
            repin();
          }
        }, delay)
      );
    };

    let lastClientHeight = scrollEl.clientHeight;
    const ro = new ResizeObserver(() => {
      if (scrollEl.clientHeight === lastClientHeight) {
        return;
      }
      lastClientHeight = scrollEl.clientHeight;
      // 70px mirrors the lib's own STICK_TO_BOTTOM_OFFSET_PX "near bottom" threshold, so this
      // re-pins exactly when the lib itself would still consider the user at the bottom.
      if (lastDist <= 70) {
        repin();
        scheduleGuard();
      }
    });
    ro.observe(scrollEl);
    scrollEl.addEventListener("scroll", trackDist, { passive: true });
    scrollEl.addEventListener("wheel", markIntent, { passive: true });
    scrollEl.addEventListener("touchstart", markIntent, { passive: true });
    scrollEl.addEventListener("mousedown", markIntent);
    scrollEl.addEventListener("keydown", markIntent);
    return () => {
      ro.disconnect();
      for (const t of guardTimers) {
        clearTimeout(t);
      }
      scrollEl.removeEventListener("scroll", trackDist);
      scrollEl.removeEventListener("wheel", markIntent);
      scrollEl.removeEventListener("touchstart", markIntent);
      scrollEl.removeEventListener("mousedown", markIntent);
      scrollEl.removeEventListener("keydown", markIntent);
    };
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    router.push(homeRoute);
  };

  const handleSubmitWithRestore = useCallback(
    (
      msg: Parameters<typeof handleSubmit>[0],
      e: Parameters<typeof handleSubmit>[1]
    ) => {
      setFailedMessage(null);
      setAutoSubmitFailed(false);
      // Sending while scrolled up in history: smooth-scroll back to the bottom via the lib so the
      // sent message (and the stream that follows) is visible. scrollToBottom also re-locks
      // isAtBottom, so stick-to-bottom keeps following as the response grows. Guard mirrors
      // handleSubmit's empty-input early return — don't scroll when nothing will be sent.
      if (msg.text.trim() || msg.files.length > 0) {
        stickToBottomRef.current?.scrollToBottom({ animation: "smooth" });
      }
      const savedText = controller.textInput.value;
      const savedFiles = controller.attachments.captureForRestore?.() ?? [];
      const runSubmit = async () => {
        try {
          await handleSubmit(msg, e);
          controller.attachments.releaseRestore?.();
        } catch (error: unknown) {
          controller.textInput.setInput(savedText);
          controller.attachments.restoreFiles?.(savedFiles);
          setFailedMessage({
            images: savedFiles
              .map((f) => f.url)
              .filter((u): u is string => !!u),
            text: savedText,
          });
          if (isNetworkError(error)) {
            toastConnectionLost();
          } else {
            toastSendingFailed();
          }
        }
      };
      void runSubmit();
      // Return nothing so the base PromptInput takes the sync path and clears immediately
    },
    [controller, handleSubmit]
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    const dist =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (dist < 100) {
      bottomRef.current?.scrollTo({
        behavior: "smooth",
      });
    }
  }, [items.length, showProjectLoading]);

  const handleTitleChange = projectTitle.setDraftTitle;
  const handleTitleCommit = projectTitle.commitDraftTitle;
  const handleTitleReset = projectTitle.resetDraftTitle;

  return (
    <Sidebar
      side="left"
      data-testid={DATA_TEST_ID.suite.custom.customSideBar}
      className="rounded-v1-xl border-v1-border-structural-subtle border"
    >
      <SidebarHeader className="gap-0 p-0">
        <ChatHeader
          title={projectTitle.draftTitle}
          isRenamingTitle={projectTitle.isRenamingTitle}
          canRename={projectTitle.canRename}
          onBack={handleBack}
          onCollapse={toggleSidebar}
          onTitleChange={handleTitleChange}
          onTitleCommit={handleTitleCommit}
          onTitleReset={handleTitleReset}
        />
      </SidebarHeader>

      <SidebarContent ref={scrollContainerRef} className="pb-2">
        {isFetchingHistory && (
          <div className="flex justify-center py-2">
            <SuiteLoadingIcon />
          </div>
        )}
        <SuiteConversation contextRef={stickToBottomRef}>
          {items.map((item, i) => {
            // Generating is transient — direction.options appends guidelines below it, but only
            // image.ready/generated should replace it.
            if (item.type === CONVERSATION_ITEM_TYPE.GENERATING) {
              const itemsAfter = items.slice(i + 1);
              if (
                itemsAfter.some(
                  (it) => it.type === CONVERSATION_ITEM_TYPE.GENERATED
                )
              ) {
                return null;
              }
            }
            if (
              item.type === CONVERSATION_ITEM_TYPE.GENERATED &&
              item.isCanvasOnly
            ) {
              return null;
            }

            // History items (prepended) get no enter animation and a stable id key so live items
            // don't remount on prepend. Each row is memoized (ConversationItemRow) so a streaming
            // store tick only re-renders the changed row, not the whole list.
            const isHistoryItem = i < historyItemCount;
            const key = item.id ?? `${item.type}-${i}`;
            const isLastItem = i === items.length - 1;

            return (
              <ConversationItemRow
                key={key}
                item={item}
                isHistoryItem={isHistoryItem}
                showFailed={autoSubmitFailed && isLastItem}
                modeChipLabel={modeChipLabel}
                onBlockAnimationComplete={onBlockAnimationComplete}
              />
            );
          })}
          {failedMessage && (
            <SuiteUserMessage
              className="animate-in fade-in-0 slide-in-from-bottom-2 space-y-0 duration-300"
              images={failedMessage.images}
              showFailed
            >
              {failedMessage.text}
            </SuiteUserMessage>
          )}
          {showProjectLoading && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <SuiteLoadingIcon />
            </div>
          )}
          <div ref={bottomRef} />
        </SuiteConversation>
      </SidebarContent>

      <SidebarFooter className="px-v1-structural-component-medium py-structural-component-micro sticky bottom-0 gap-0 bg-transparent">
        {isQuotaReached ? (
          <QuotaHitLimitCard
            resetAt={quota?.resetAt}
            onExpired={onQuotaExpired}
            className="mb-v1-structural-component-micro"
          />
        ) : null}
        <SuitePromptInput
          onSubmitAction={handleSubmitWithRestore}
          showTypingPlaceholder={false}
          placeholder="Ask anything, create anything"
          textAreaClassName="max-h-31"
          // Keep the composer locked until the reveal fully finishes: isStreaming covers the network
          // stream (until message.done), isAnimating covers the queue tail (until the last block
          // finishes animating). Without the latter the button re-enables while text is still typing out.
          isStreaming={isStreaming || isAnimating}
          onStop={cancelStream}
          // Lock submit while at the limit. Guard on resetAt so a remaining<=0 with no reset window
          // can't lock the composer forever; if resetAt is stale the card's onExpired refetch corrects it.
          isSubmitDisabled={isQuotaReached && !!quota?.resetAt}
        />
        <p className="text-v1-text-hierarchy-secondary typo-v1-support-secondary-normal p-v1-structural-component-micro italic opacity-60">
          Please ensure your creations respect copyright.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";

import type { TMessageTemp } from "@/core/models/conversation";
import { EConversationMode } from "@/core/models/conversation";

const SCROLL_THRESHOLD = 150;
const DEFAULT_SCROLL_RETRY = 3;
const EMPTY_MESSAGES: TMessageTemp[] = [];

export function useConversationScroll(
  messages: TMessageTemp[] | undefined,
  isShowLoadingMessage: boolean,
  isGenerating: boolean,
  conversationId?: string
) {
  const conversationMessages = messages ?? EMPTY_MESSAGES;
  const [scrollContainerZone, setScrollContainerZone] =
    useState<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const [isShouldAutoScroll, setIsShouldAutoScroll] = useState(true);
  const [, setIsUserScrolling] = useState(false);

  const messagesLengthRef = useRef(conversationMessages.length);
  const scrollPositionRef = useRef(0);
  const previousConversationIdRef = useRef(conversationId);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "auto", retries?: number) => {
      const tryScroll = () => {
        if (lastItemRef.current) {
          lastItemRef.current.scrollIntoView({ behavior, block: "end" });
        } else if (retries && retries > 0) {
          // oxlint-disable-next-line react/react-compiler -- self-referential retry: scrollToBottom schedules its own retry via rAF, so it's necessarily read before its own const binding is fully assigned; restructuring this recursive pattern is a larger change out of scope here
          requestAnimationFrame(() => scrollToBottom(behavior, retries - 1));
        }
      };

      requestAnimationFrame(tryScroll);
    },
    []
  );

  // Count messages that contain image generation content
  const countImageContent = useCallback(() => {
    if (conversationMessages.length === 0) {
      return 0;
    }
    // Count messages with type="image_creation"
    const imageCreationCount = conversationMessages.filter(
      (msg) => msg.type === EConversationMode.AI_ART && msg.files.length > 0
    ).length;
    return imageCreationCount;
  }, [conversationMessages]);

  // Determine if we should delay scrolling to allow all content to load
  const shouldDelayScrollToLoadAllData = useCallback(() => {
    const imageCount = countImageContent(); // Count of image generation messages
    const hasDeepResearch = conversationMessages.some(
      (msg) => msg.type === EConversationMode.DEEP_RESEARCH
    ); // Check for deep research messages
    const hasWebSearch = conversationMessages.some(
      (msg) => msg.type === "realtime_search"
    ); // Check for web search messages

    // Delay if there are images, deep research, or web search messages
    return imageCount > 0 || hasDeepResearch || hasWebSearch;
  }, [countImageContent, conversationMessages]);

  useEffect(() => {
    const isConversationChanged =
      previousConversationIdRef.current !== conversationId;

    if (isConversationChanged) {
      previousConversationIdRef.current = conversationId;

      messagesLengthRef.current = 0;
      scrollPositionRef.current = 0;
      setIsShouldAutoScroll(true);
      if (conversationMessages.length > 0) {
        scrollToBottom("instant");
      }
    }
  }, [conversationId, conversationMessages.length, scrollToBottom]);

  useEffect(() => {
    const isDelay = shouldDelayScrollToLoadAllData();
    const isNewMessage =
      conversationMessages.length > messagesLengthRef.current;
    if (messagesLengthRef.current === 0 && isShouldAutoScroll) {
      if (isDelay) {
        // delay scroll to allow all data to load
        setTimeout(() => {
          scrollToBottom("instant");
        }, 1000);
      } else {
        setTimeout(() => {
          scrollToBottom("instant", DEFAULT_SCROLL_RETRY);
        }, 500);
      }
      return;
    }

    // start new message
    if (isShouldAutoScroll && (isNewMessage || isShowLoadingMessage)) {
      scrollToBottom("auto");
    }

    messagesLengthRef.current = conversationMessages.length;
  }, [
    conversationMessages.length,
    isShouldAutoScroll,
    isShowLoadingMessage,
    scrollToBottom,
    shouldDelayScrollToLoadAllData,
  ]);

  useEffect(() => {
    // Scroll when markdown expands after generation finishes
    if (!isGenerating && isShouldAutoScroll) {
      scrollToBottom("auto");
    }
  }, [isGenerating, isShouldAutoScroll, scrollToBottom]);

  useEffect(() => {
    if (!scrollContainerZone) {
      return;
    }

    let userScrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(userScrollTimeout);

      // Get current scroll position
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerZone;

      // Detect if user is scrolling up or down
      const isScrollingUp =
        scrollTop < scrollPositionRef.current + SCROLL_THRESHOLD;

      if (isScrollingUp) {
        setIsUserScrolling(true);
        setIsShouldAutoScroll(false);
      }

      // Check if at bottom
      const isAtBottom =
        scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;

      if (isAtBottom) {
        setIsShouldAutoScroll(true);
      }

      // Update scroll position reference
      scrollPositionRef.current = scrollTop;

      // Reset user scrolling flag after a short delay
      userScrollTimeout = setTimeout(() => {
        setIsUserScrolling(false);
      }, 150);
    };

    scrollContainerZone.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainerZone.removeEventListener("scroll", handleScroll);
      clearTimeout(userScrollTimeout);
    };
  }, [scrollContainerZone]);

  // Reset scroll behavior when component mounts
  useEffect(
    () => () => {
      scrollPositionRef.current = 0;
      setIsShouldAutoScroll(true);
    },
    []
  );

  return {
    lastItemRef,
    lastMessageRef,
    scrollContainerZone,
    scrollToBottom,
    setIsShouldAutoScroll,
    setScrollContainerZone,
  };
}

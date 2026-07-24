"use client";

import { memo } from "react";

import type { ConversationItem } from "@/features/suite/types/conversation";
import { CONVERSATION_ITEM_TYPE } from "@/features/suite/utils/constants/conversation";

import {
  SuiteBotMessage,
  SuiteDesignGuidelines,
  SuiteGenerated,
  SuiteGenerating,
  SuiteMessageBotError,
  SuiteModeChip,
  SuiteThinking,
  SuiteUserMessage,
} from "./index";

interface ConversationItemRowProps {
  item: ConversationItem;
  // Live items get an enter animation; history (prepended) items don't.
  isHistoryItem: boolean;
  // Only the trailing user message shows the failed state; computed by the parent so it stays a
  // stable `false` for every other row (keeps memo effective).
  showFailed: boolean;
  modeChipLabel: string;
  // Stable (useCallback) — passing it down instead of an inline arrow is what lets memo skip rows.
  onBlockAnimationComplete: (id?: string) => void;
}

// Memoized so a store update during streaming (which re-renders the sidebar every ~tick) does NOT
// re-render every conversation row — only the row whose `item` reference actually changed. Item
// objects are referentially stable across updates (Immer structural sharing), and all props here
// are stable, so React.memo can skip untouched rows. The onAnimationComplete arrow lives INSIDE this
// component on purpose: it's only recreated when this row genuinely re-renders, not on every sidebar tick.
export const ConversationItemRow = memo(
  ({
    item,
    isHistoryItem,
    showFailed,
    modeChipLabel,
    onBlockAnimationComplete,
  }: ConversationItemRowProps) => {
    const animClass = isHistoryItem
      ? undefined
      : "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 space-y-0";

    if (item.type === CONVERSATION_ITEM_TYPE.MODE_CHIP) {
      return <SuiteModeChip className={animClass} label={modeChipLabel} />;
    }
    if (item.type === CONVERSATION_ITEM_TYPE.USER) {
      return (
        <SuiteUserMessage
          className={animClass}
          images={item.images}
          showFailed={showFailed}
        >
          {item.text}
        </SuiteUserMessage>
      );
    }
    if (item.type === CONVERSATION_ITEM_TYPE.BOT) {
      return (
        <SuiteBotMessage
          className={animClass}
          isAnimating={item.isAnimating}
          onAnimationComplete={() => onBlockAnimationComplete(item.id)}
        >
          {item.text}
        </SuiteBotMessage>
      );
    }
    if (item.type === CONVERSATION_ITEM_TYPE.THINKING) {
      return (
        <SuiteThinking
          className={animClass}
          title={item.title}
          steps={item.steps}
          open={item.isOpen}
          isAnimating={item.isAnimating}
          onAnimationComplete={() => onBlockAnimationComplete(item.id)}
        />
      );
    }
    if (item.type === CONVERSATION_ITEM_TYPE.DESIGN_GUIDELINES) {
      return (
        <SuiteDesignGuidelines
          className={animClass}
          title={item.title}
          status={item.status}
          sections={item.sections}
          open={item.isOpen}
          isAnimating={item.isAnimating}
          onAnimationComplete={() => onBlockAnimationComplete(item.id)}
        />
      );
    }
    if (item.type === CONVERSATION_ITEM_TYPE.GENERATING) {
      return (
        <SuiteGenerating
          className={animClass}
          durationMs={item.durationMs}
          imageCount={item.imageCount}
          label="Generating..."
        />
      );
    }
    if (item.type === CONVERSATION_ITEM_TYPE.GENERATED) {
      return (
        <SuiteGenerated
          className={animClass}
          title={item.title}
          images={item.images}
        />
      );
    }
    if (item.type === CONVERSATION_ITEM_TYPE.ERROR) {
      return (
        <SuiteMessageBotError
          className={animClass}
          {...(item.title && { title: item.title })}
          {...(item.description && { description: item.description })}
        />
      );
    }

    return null;
  }
);
ConversationItemRow.displayName = "ConversationItemRow";

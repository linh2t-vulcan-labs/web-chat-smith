import { useRef } from "react";

import type { TSuggestionCard } from "@/components/typing-animation/types";
import {
  configSuggestions,
  deepResearchSuggestions,
  DEFAULT_WELCOME_CONVERSATION_SUGGESTIONS,
  funSocialSuggestions,
  imageToImageSuggestions,
  infoQuerySuggestions,
  textToImageSuggestions,
} from "@/config/suggestion-options";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { generateRandomUUIDV4, safeJsonParse } from "@/utils/commons/helpers";

export interface TSuggestionItem {
  id: string;
  key: string; // key to use translation
  title: string;
  prompt: string;
  url: string;
}

interface TConversationSuggestionsData {
  imageToImage: TSuggestionItem[];
  textToImage: TSuggestionItem[];
  infoQuery: TSuggestionItem[];
  funSocial: TSuggestionItem[];
  deepResearch: TSuggestionItem[];
  config: typeof configSuggestions;
}

// Helper function to get random item from array
const getRandomItem = <T>(array: T[]): T | undefined =>
  array[Math.floor(Math.random() * array.length)];

// Helper to build a single suggestion card from a list + its config entry,
// preserving the exact field mapping used for every suggestion type.
const buildSuggestionCard = (
  items: TSuggestionItem[],
  configEntry: (typeof configSuggestions)[keyof typeof configSuggestions]
): TSuggestionCard | null => {
  if (items.length === 0) {
    return null;
  }

  const item = getRandomItem(items);

  if (!item) {
    return null;
  }

  return {
    actionType: configEntry?.actionType,
    id: generateRandomUUIDV4(),
    isEnabled: configEntry?.isEnabled,
    key: item.key,
    prompt: item.prompt,
    title: item.title,
    type: configEntry?.type,
    url: item.url,
  };
};

export const useConversationSuggestions = () => {
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();

  // Use ref to store the generated suggestions to ensure they are only generated once
  const suggestionsRef = useRef<TSuggestionCard[]>([]);
  const isInitializedRef = useRef(false);

  // Only generate suggestions once on initial mount
  // oxlint-disable-next-line react/react-compiler -- deliberate generate-once-via-ref pattern so random suggestions are computed a single time and stay stable across re-renders
  if (!isInitializedRef.current && isReady) {
    // Get all suggestions from single Remote Config key
    const suggestionsRaw = getValueSyncRemoteConfig(
      REMOTE_CONFIG_KEY.CONVERSATION_SUGGESTION_OPTIONS
    );

    // Parse suggestions data
    const suggestionsData =
      safeJsonParse<TConversationSuggestionsData>(suggestionsRaw) ||
      DEFAULT_WELCOME_CONVERSATION_SUGGESTIONS;

    // Extract lists and config
    const imageToImageList =
      suggestionsData.imageToImage || imageToImageSuggestions;
    const textToImageList =
      suggestionsData.textToImage || textToImageSuggestions;
    const infoQueryList = suggestionsData.infoQuery || infoQuerySuggestions;
    const funSocialList = suggestionsData.funSocial || funSocialSuggestions;
    const deepResearchList =
      suggestionsData.deepResearch || deepResearchSuggestions;
    const config = suggestionsData.config || configSuggestions;

    // Generate random suggestions only once
    const generatedSuggestions: TSuggestionCard[] = [];

    // Only add suggestion if array has items — same order as before.
    const suggestionSources = [
      [imageToImageList, config.imageToImage] as const,
      [textToImageList, config.textToImage] as const,
      [infoQueryList, config.infoQuery] as const,
      [funSocialList, config.funSocial] as const,
      [deepResearchList, config.deepResearch] as const,
    ];

    for (const [items, configEntry] of suggestionSources) {
      const card = buildSuggestionCard(items, configEntry);
      if (card) {
        generatedSuggestions.push(card);
      }
    }

    // Cache the suggestions and mark as initialized
    // oxlint-disable-next-line react/react-compiler -- part of the same generate-once-via-ref pattern guarded above
    suggestionsRef.current = generatedSuggestions;
    isInitializedRef.current = true;
  }

  // oxlint-disable-next-line react/react-compiler -- reads the once-generated cached suggestions from the ref set above
  return suggestionsRef.current;
};

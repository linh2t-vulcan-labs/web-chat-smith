import type { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import useLocalStorage from "@/hooks/use-local-storage";
import { SEEN_AI_CARD_ITEMS } from "@/utils/commons/keys";

/**
 * Custom hook to manage and persist which AI Art style cards the user has seen
 *
 * Stores an array of EAIART_STYLE values in localStorage,
 * scoped by user ID (so each user has separate "seen" history).
 *
 * Returns:
 *  - seenItems: array of styles the user has marked as seen
 *  - markAsSeen: function to mark a style as seen
 *  - hasSeen: function to check if a style has been seen
 *
 * @param userId - string, the user identification key to scope storage
 */
export function useSeenAIArtItems(userId: string) {
  const [seenItems, setSeenItems] = useLocalStorage<EAIART_STYLE[]>(
    userId ? `${SEEN_AI_CARD_ITEMS}-${userId}` : "",
    []
  );

  const markAsSeen = (value: EAIART_STYLE) => {
    setSeenItems((prev) => [...prev, value]);
  };

  const hasSeen = (value: EAIART_STYLE) => seenItems.includes(value);

  return { hasSeen, markAsSeen, seenItems };
}

import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";
import type { Messages } from "./utils";
import {
  isValidLocale,
  mergeMessages,
  resolveConfiguredLocale,
  toUniqueLocales,
} from "./utils";

type MessageLoader = (locale: string) => Promise<Record<string, unknown>>;
interface RequestConfigOptions {
  fallbackLocales?: readonly string[];
  getMessageFallback?: (args: {
    namespace?: string;
    key: string;
    error: unknown;
  }) => string;
}

const defaultMessageFallback = ({
  namespace,
  key,
}: {
  namespace?: string;
  key: string;
}) => (namespace ? `${namespace}.${key}` : key);

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const safeLoadMessages = async (
  loadMessages: MessageLoader,
  locale: string
): Promise<Messages | undefined> => {
  try {
    const messages = await loadMessages(locale);
    return isObjectRecord(messages) ? messages : undefined;
  } catch {
    return undefined;
  }
};

const loadAndMergeMessages = async (
  loadMessages: MessageLoader,
  candidates: string[]
): Promise<Messages> => {
  const candidateMessagesList = await Promise.all(
    candidates.map((candidate) => safeLoadMessages(loadMessages, candidate))
  );

  let messages: Messages = {};
  for (const candidateMessages of candidateMessagesList) {
    if (!candidateMessages) {
      continue;
    }

    // Start from default locale and let requested locale overwrite existing keys.
    messages = mergeMessages(messages, candidateMessages);
  }

  return messages;
};

/**
 * Caches the merged messages per unique locale-candidate chain so the same
 * fallback/merge work isn't repeated on every request for a given locale.
 * Messages are static build-time content, so caching is safe in production;
 * dev keeps a fresh load per request to reflect local message edits.
 */
const createMessagesLoader = (loadMessages: MessageLoader) => {
  const cache = new Map<string, Promise<Messages>>();
  const isCacheEnabled = process.env.NODE_ENV === "production";

  return (candidates: string[]): Promise<Messages> => {
    if (!isCacheEnabled) {
      return loadAndMergeMessages(loadMessages, candidates);
    }

    const cacheKey = candidates.join("|");
    let cached = cache.get(cacheKey);
    if (!cached) {
      cached = loadAndMergeMessages(loadMessages, candidates);
      cache.set(cacheKey, cached);
    }

    return cached;
  };
};

/**
 * Creates a next-intl request config with a caller-provided message loader.
 * The loader must be defined in the app so that the bundler can resolve
 * the relative path to the messages folder at build time.
 *
 * @example
 * // apps/web/src/i18n/request.ts
 * import { createRequestConfig } from "@cs/i18n/request";
 * export default createRequestConfig(
 *   async (locale) => (await import(`../../messages/${locale}.json`)).default
 * );
 */
export const createRequestConfig = (
  loadMessages: MessageLoader,
  options?: RequestConfigOptions
) => {
  const loadMergedMessages = createMessagesLoader(loadMessages);

  return getRequestConfig(async ({ requestLocale }) => {
    let requested: string | undefined;
    try {
      requested = await requestLocale;
    } catch {
      requested = undefined;
    }

    const resolvedLocale =
      resolveConfiguredLocale(requested) ?? routing.defaultLocale;

    // Build candidates from lowest → highest priority so later entries overwrite earlier ones.
    // Order: default locale → custom fallbacks → resolved locale. Only valid
    // configured locales can have a message file, so invalid entries are dropped.
    const localeCandidates = toUniqueLocales(
      [
        routing.defaultLocale,
        ...(options?.fallbackLocales ?? []),
        resolvedLocale,
      ].filter(isValidLocale)
    );

    const messages = await loadMergedMessages(localeCandidates);

    return {
      getMessageFallback: options?.getMessageFallback ?? defaultMessageFallback,
      locale: resolvedLocale,
      messages,
    };
  });
};

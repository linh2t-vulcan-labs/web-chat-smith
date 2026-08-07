import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";

import { routing } from "./routing";
import type { Messages } from "./utils";
import { isValidLocale, mergeMessages, toUniqueLocales } from "./utils";

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
 * Build candidates from lowest → highest priority so later entries overwrite
 * earlier ones. Order: default locale → custom fallbacks → resolved locale.
 * Only valid configured locales can have a message file, so invalid entries
 * are dropped.
 */
const buildLocaleCandidates = (
  resolvedLocale: string,
  fallbackLocales: readonly string[] = []
): string[] =>
  toUniqueLocales(
    [routing.defaultLocale, ...fallbackLocales, resolvedLocale].filter(
      isValidLocale
    )
  );

/**
 * Creates a next-intl request config with a caller-provided message loader.
 * The loader must be defined in the app so that the bundler can resolve
 * the relative path to the messages folder at build time.
 *
 * Resolves the locale from `next/root-params` instead of next-intl's own
 * `requestLocale` — this is next-intl's root-params-based setup (Next.js
 * 16.3+): `app/[locale]/layout.tsx` must be an actual root layout (no
 * `layout.tsx` above it) for `locale` to be readable this way. Locale
 * validation is centralized here — `notFound()` fires once, for any invalid
 * segment, instead of every `[locale]`-scoped layout re-validating `params`
 * itself.
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

  return getRequestConfig(async () => {
    const requested = await rootLocale();
    if (!hasLocale(routing.locales, requested)) {
      notFound();
    }

    const localeCandidates = buildLocaleCandidates(
      requested,
      options?.fallbackLocales
    );
    const messages = await loadMergedMessages(localeCandidates);

    return {
      getMessageFallback: options?.getMessageFallback ?? defaultMessageFallback,
      locale: requested,
      messages,
    };
  });
};

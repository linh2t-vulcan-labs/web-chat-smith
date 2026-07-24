import "server-only";
import { getLocale, getMessages } from "next-intl/server";

import {
  // AI_TOOL_LOCALES,
  DEFAULT_LOCALE,
  normalizeAIToolLocale,
} from "./config";
import type { AIToolLocale } from "./config";

/**
 * AI tool translations are loaded via next-intl `messages` (see `src/i18n/request.ts`)
 * from `src/i18n/locale/<locale>/ai_tool.json`.
 */
export type AIToolMessages = Record<string, unknown>;

type PrimitiveValue = string | number | boolean;

async function loadMessagesFromNextIntl(): Promise<AIToolMessages> {
  const all = (await getMessages()) as Record<string, unknown>;
  const { aiTool } = all;
  if (aiTool && typeof aiTool === "object") {
    return aiTool as Record<string, unknown>;
  }
  return {};
}

/**
 * When routed under `src/app/[locale]/...`, next-intl can provide the active locale
 * without relying on request cookies, keeping pages SSG/ISR-friendly.
 */
async function getAIToolLocaleFromNextIntl(): Promise<AIToolLocale> {
  try {
    const locale = await getLocale();
    return normalizeAIToolLocale(locale);
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * Walks a dot-delimited path against a translation message tree and returns
 * the value if found.
 */
function resolvePath(messages: unknown, path: string): unknown {
  let acc: unknown = messages;
  for (const segment of path.split(".")) {
    if (acc === null || acc === undefined) {
      return;
    }
    if (typeof acc !== "object") {
      return;
    }
    acc = (acc as Record<string, unknown>)[segment];
  }
  return acc;
}

function interpolate(
  template: string,
  values?: Record<string, PrimitiveValue>
): string {
  if (!values) {
    return template;
  }
  return template.replaceAll(
    /\{(?<name>\w+)\}/gu,
    (match, _p1, _offset, _string, groups?: { name: string }) => {
      const name = groups?.name ?? "";
      const replacement = values[name];
      return replacement === undefined ? match : String(replacement);
    }
  );
}

export interface AIToolTranslator {
  /** Look up a translation by dot-path; returns the key itself when missing. */
  (key: string, values?: Record<string, PrimitiveValue>): string;
  /** Look up an array of strings; returns an empty array when missing. */
  array: (key: string) => string[];
  /** Raw access for non-string nodes (objects, arrays, etc). */
  raw: <T = unknown>(key: string) => T | undefined;
}

function createTranslator(messages: AIToolMessages): AIToolTranslator {
  const t = ((key: string, values?: Record<string, PrimitiveValue>): string => {
    const node = resolvePath(messages, key);
    if (typeof node === "string") {
      return interpolate(node, values);
    }
    return key;
  }) as AIToolTranslator;

  t.array = (key: string): string[] => {
    const node = resolvePath(messages, key);
    if (Array.isArray(node)) {
      return node.filter((item): item is string => typeof item === "string");
    }
    return [];
  };

  t.raw = <T = unknown>(key: string): T | undefined =>
    resolvePath(messages, key) as T | undefined;

  return t;
}

export interface AIToolTranslation {
  locale: AIToolLocale;
  messages: AIToolMessages;
  t: AIToolTranslator;
}

export async function getAIToolTranslation(
  override?: AIToolLocale
): Promise<AIToolTranslation> {
  const locale = override ?? (await getAIToolLocaleFromNextIntl());
  const messages = await loadMessagesFromNextIntl();
  return {
    locale,
    messages,
    t: createTranslator(messages),
  };
}

export type { AIToolLocale } from "./config";

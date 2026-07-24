import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

// import type { TUserProfileDTO } from "@/core/http/dto/user";
import { routing } from "@/i18n/routing";
import { omitBy } from "@/libs/lodash-es";

import { CALLBACK_URL_QUERY_PARAM } from "../constants/common";
import { EFileExtension, extensionToMimeTypeMap } from "../constants/file";
// import { HTTP_STATUS } from "../constants/http";
import { BLOGS_URL, CONVERSATION_URL } from "../constants/url";
import { EDURATION_UNIT } from "./enums";
import {
  FREE_USAGE_CLIENT_KEY,
  // HAS_SEEN_NEW_FEATURES_MODAL_KEY,
  HAS_SEEN_REMINDER_MODAL_KEY,
  IS_SIGNED_IN_KEY,
  LOCAL_STORAGE_KEY,
  SIGNIN_SOURCE_PATH_KEY,
  SIGNIN_TIME_KEY,
  USER_ID_KEY,
} from "./keys";

export const generateRandomUUIDV4 = () => uuidv4();

export const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * max) + min;

export const generatePathUrl = ({
  id,
  path = "/conversation",
}: {
  id?: string;
  path?: string;
}) => {
  let fullPath = path;

  if (id) {
    fullPath += `/${id}`;
  }

  return fullPath;
};

// const getTextareaRowsByText = (text: string, maxRows = 0) => {
//   const { length } = text.split(" ");
//   const _rows = Math.ceil(length / 14);

//   if (_rows >= 0 && _rows <= 1) {
//     return 1;
//   }

//   if (!maxRows) {
//     return _rows;
//   }

//   return _rows > maxRows ? maxRows : _rows;
// };

// const isAuthentError = (status: number | string) =>
//   Number(status) === HTTP_STATUS.UNAUTHORIZED;

// const isAuthentSuccessModel = (obj: object): obj is TUserProfileDTO => {
//   if (Object.hasOwn(obj, "is_privilege_web")) {
//     return true;
//   }

//   return false;
// };

export const localStorageImpl = {
  load: <T>(key: string): T | null => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  remove: (key: string) => {
    localStorage.removeItem(key);
    dispatchStorageEvent(key, null);
  },

  save: <T>(key: string, value: T) => {
    // Don't save undefined or null values, remove the key instead
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
      dispatchStorageEvent(key, null);
      return;
    }

    const stringifyValue = JSON.stringify(value);
    localStorage.setItem(key, stringifyValue);
    dispatchStorageEvent(key, stringifyValue);
  },
};

export const clearAuthStorage = () => {
  const keys = [
    HAS_SEEN_REMINDER_MODAL_KEY,
    IS_SIGNED_IN_KEY,
    USER_ID_KEY,
    LOCAL_STORAGE_KEY.AUTH_REFRESH_LOCK,
  ];
  for (const key of keys) {
    localStorage.removeItem(key);
  }
};

/**
 * Removes every localStorage key scoped to this userId (`<prefix>-<userId>`).
 * Unlike clearAuthStorage (survives logout so a returning user keeps their
 * preferences), this is for account deletion: the userId can never come back,
 * so its scoped keys would otherwise be permanent orphans.
 */
export const clearUserScopedStorage = (userId: string) => {
  if (!userId) {
    return;
  }
  // Substring match, not endsWith: some keys append a version segment after
  // the userId (e.g. `${popupId}-${userId}-${version}`), so userId is not
  // always the last segment.
  const marker = `-${userId}`;
  for (const key of Object.keys(localStorage)) {
    if (key.includes(marker)) {
      localStorage.removeItem(key);
    }
  }
};

export const clearAuthTime = () => {
  localStorage.removeItem(SIGNIN_TIME_KEY);
  localStorage.removeItem(SIGNIN_SOURCE_PATH_KEY);
};

// const clearGuestId = () => {
//   localStorage.removeItem(LOCAL_STORAGE_KEY.GUEST_ID);
// };

export const dispatchStorageEvent = (key: string, newValue: string | null) => {
  window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
};

export const safeJsonParse = <T>(str: string) => {
  try {
    const jsonValue: T = JSON.parse(str);
    return jsonValue;
  } catch {
    // ignore parse errors
  }
};

export const capitalizeFirstLetter = (val: string) =>
  String(val).charAt(0).toUpperCase() + String(val).slice(1);

export const createSlug = (name: string) => {
  const slug = name.toLowerCase().replaceAll(/\s+/gu, "-");
  const encodedSlug = encodeURIComponent(slug);
  return encodedSlug;
};

export const getNameFromSlug = (name: string) => {
  const parts = name.split("-");

  if (!Number.isNaN(Number(parts[0]))) {
    parts.shift();
  }

  const slug = parts.join(" ");
  const decodedSlug = decodeURIComponent(slug);

  return decodedSlug;
};

// const getIdFromSlug = (slug: string) => slug.split("-").shift() ?? "";

export const isServer = typeof window === "undefined";

// const cleanObj = (obj: Record<string, unknown>): Record<string, unknown> =>
//   Object.fromEntries(
//     Object.entries(obj).filter(
//       ([, value]) => value !== null && value !== undefined
//     )
//   );

// const convertObjectToParameter = (obj: Record<string, unknown>) =>
//   new URLSearchParams(
//     Object.entries(cleanObj(obj)).map(([key, value]) => [key, String(value)])
//   ).toString();

// const toCamelCase = (text: string) => {
//   if (!text) {
//     return "";
//   }

//   return text
//     .toLowerCase()
//     .replaceAll(/[-_]+(?<char>.)?/gu, (_, char) =>
//       char ? char.toUpperCase() : ""
//     )
//     .replace(/^(?<first>.)/u, (char) => char.toLowerCase());
// };

export const toCapitalCase = (text: string): string => {
  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const generateUrlWithParams = (
  paramsToUpdate: Record<string, string>
) => {
  if (typeof window === "undefined") {
    return "";
  }

  const currentUrl = new URL(window.location.href);
  const params = new URLSearchParams(currentUrl.search);

  for (const [key, value] of Object.entries(paramsToUpdate)) {
    params.set(key, value);
  }

  return `${currentUrl.origin}${currentUrl.pathname}?${params.toString()}`;
};

// const convertToMilliSeconds = (second: number) => second * 1000;

// const scrollToSection = (id: string, offset = 72) => {
//   const element = document.querySelector(`#${id}`);
//   if (element) {
//     const headerOffset = offset; // Adjust this based on your fixed header height
//     const elementPosition =
//       element.getBoundingClientRect().top + window.scrollY;
//     const offsetPosition = elementPosition - headerOffset;

//     window.scrollTo({
//       top: offsetPosition,
//       behavior: "smooth", // Smooth scrolling behavior
//     });
//   }
// };

export const getAllGetterNames = (obj: object): Set<string | symbol> => {
  const getters = new Set<string | symbol>();
  let currentPrototype = Reflect.getPrototypeOf(obj);

  while (currentPrototype && currentPrototype !== Object.prototype) {
    const keys = Reflect.ownKeys(currentPrototype);
    for (const k of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(currentPrototype, k);
      if (descriptor && descriptor.get) {
        getters.add(k);
      }
    }
    currentPrototype = Reflect.getPrototypeOf(currentPrototype);
  }

  return getters;
};

export const removeNullAndUndefined = <T>(obj: object) =>
  omitBy(
    obj,
    (value) => value === "" || value === null || value === undefined
  ) as T;

export const estimateTokens = (text: string) => Math.ceil(text.length / 4); // ~1 token ≈ 4 chars

export const checkImageFileType = (
  fileName: string,
  fileType?: string
): boolean => {
  if (fileType) {
    return fileType.startsWith("image");
  }

  const ext = fileName.split(".").pop()?.toLowerCase() as
    | EFileExtension
    | undefined;

  return ext
    ? [
        EFileExtension.PNG,
        EFileExtension.JPEG,
        EFileExtension.JPG,
        EFileExtension.WEBP,
      ].includes(ext)
    : false;
};

export const getMimeTypeFromFile = (
  fileName: string,
  fileType?: string
): string => {
  if (fileType) {
    return fileType;
  }

  const ext =
    (fileName.split(".").pop()?.toLowerCase() as EFileExtension) ??
    EFileExtension.TXT;

  return extensionToMimeTypeMap[ext];
};

export const mbToBytes = (mb: number) => mb * 1024 * 1024;

export const openNewTab = (url: string) => {
  if (!isServer) {
    globalThis.window.open?.(url, "_blank")?.focus();
  }
};

// function getCookie(name: string): string | undefined {
//   if (typeof document === "undefined") {
//     return undefined;
//   }
//   const value = document.cookie
//     .split("; ")
//     .find((row) => row.startsWith(`${name}=`))
//     ?.split("=")[1];

//   return value ? decodeURIComponent(value) : undefined;
// }

export function downloadFileFromBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Triggers a file download by navigating the browser to the provided URL.
 *
 * Best used for URLs that already include the desired file name via query
 * params or rely on the server's `Content-Disposition` header to set it.
 *
 * @param url - Absolute or relative download URL.
 * @param target - Window target (`"_blank"` by default) used for navigation.
 */
// function downloadFileFromUrl(
//   url: string,
//   target: "_self" | "_blank" = "_blank"
// ): void {
//   const anchor = document.createElement("a");
//   anchor.href = url;
//   anchor.target = target;
//   anchor.rel = target === "_blank" ? "noopener noreferrer" : "";
//   anchor.click();
// }

export function getFirstMarkdownTitle(markdown: string): string | null {
  const match = markdown.match(/^#{1,6} (?<title>.+)$/mu);
  return match ? (match[1] as string).trim() : null;
}

/**
 * Strips markdown formatting from text and returns plain text.
 * Removes markdown syntax (bold, italic, headers, lists, links, etc.)
 * while preserving the text content for SEO purposes.
 */
export function stripMarkdown(text: string): string {
  if (!text) {
    return "";
  }

  // 1️⃣ Escape HTML entities (prevents XSS & JSON-LD injection)
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  // 2️⃣ Remove markdown formatting
  return (
    escaped
      // Remove fenced code blocks
      .replaceAll(/```[\s\S]*?```/gu, "")
      // Inline code
      .replaceAll(/`(?<content>[^`]+)`/gu, "$1")
      // Headers
      .replaceAll(/^#{1,6}\s+/gmu, "")
      // Bold / italic
      .replaceAll(/\*\*(?<content>[^*]+)\*\*/gu, "$1")
      .replaceAll(/__(?<content>[^_]+)__/gu, "$1")
      .replaceAll(/\*(?<content>[^*]+)\*/gu, "$1")
      .replaceAll(/_(?<content>[^_]+)_/gu, "$1")
      // Links & images
      .replaceAll(/!\[(?<content>[^\]]*)\]\([^)]+\)/gu, "$1")
      .replaceAll(/\[(?<content>[^\]]+)\]\([^)]+\)/gu, "$1")
      // Horizontal rules
      .replaceAll(/^---+$/gmu, "")
      // Lists
      .replaceAll(/^[\s]*[-*+]\s+/gmu, "")
      .replaceAll(/^\s*\d+\.\s+/gmu, "")
      // Blockquotes
      .replaceAll(/^>\s+/gmu, "")
      // Normalize spacing
      .replaceAll(/\n{3,}/gu, "\n\n")
      .trim()
  );
}

export const getCallbackUrl = (defaultUrl = CONVERSATION_URL): string => {
  if (typeof window === "undefined") {
    return defaultUrl;
  }

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(CALLBACK_URL_QUERY_PARAM) || defaultUrl;
};

/**
 * Builds a redirect URL by merging current query parameters (except callbackUrl) with the base URL
 * @param baseUrl - The base URL to redirect to (typically from getCallbackUrl)
 * @returns The full URL with merged query parameters (no duplicates)
 */
export const buildRedirectUrlWithQueryParams = (baseUrl: string): string => {
  if (typeof window === "undefined") {
    return baseUrl;
  }

  // Parse the base URL to extract path and existing query params
  const [basePath, baseQueryString] = baseUrl.split("?");
  const baseParams = new URLSearchParams(baseQueryString || "");

  // Get current page query params
  const currentParams = new URLSearchParams(window.location.search);

  // Remove the callbackUrl parameter as it's already used in the baseUrl path
  currentParams.delete(CALLBACK_URL_QUERY_PARAM);

  // Merge params: start with base URL params, then add/override with current params
  // This ensures current page context takes precedence
  const mergedParams = new URLSearchParams(baseParams);
  for (const [key, value] of currentParams) {
    mergedParams.set(key, value);
  }

  // If there are no parameters at all, return just the path
  const finalParamsString = mergedParams.toString();
  if (!finalParamsString) {
    return basePath as string;
  }

  return `${basePath}?${finalParamsString}`;
};

export const triplet = (
  e1: number,
  e2: number,
  e3: number,
  keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63);

export const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

// const clearOldFeatureKeys = (currentVersion: string) => {
//   const prefix = HAS_SEEN_NEW_FEATURES_MODAL_KEY;
//   const currentKey = `${HAS_SEEN_NEW_FEATURES_MODAL_KEY}-${currentVersion}`;

//   for (const key of Object.keys(localStorage)) {
//     if (key.startsWith(prefix) && key !== currentKey) {
//       localStorage.removeItem(key);
//     }
//   }
// };

export const emptyFn = () => {
  // Intentionally a no-op, used as a default callback placeholder.
};

export const clearOldVersionKeys = (currentVersion: string, prefix: string) => {
  const currentKey = `${prefix}-${currentVersion}`;

  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(prefix) && key !== currentKey) {
      localStorage.removeItem(key);
    }
  }
};

// Ticket GU-518: Update badge percentage for new pricing
export const getBadgePercentageProductPrice = (
  durationUnit: EDURATION_UNIT,
  _newPricing: boolean
) => {
  const percentageMapping = {
    [EDURATION_UNIT.YEAR]: 80,
    [EDURATION_UNIT.MONTH]: 77,
    [EDURATION_UNIT.WEEK]: 0,
    [EDURATION_UNIT.DAY]: 0,
    [EDURATION_UNIT.QUARTERLY]: 0,
  };

  // const yearlyDSPercentage = newPricing ? 75 : 70;
  // const monthlyDSPercentage = newPricing ? 66 : 33;
  return percentageMapping[durationUnit];
};

/**
 * Returns a promise that resolves after waiting for the specified milliseconds.
 */
export const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
export const getOriginalPriceBaseOnDiscountPercentage = (
  durationUnit: EDURATION_UNIT,
  defaultPrice: number,
  newPricing: boolean
) => {
  const discountPercentage = getBadgePercentageProductPrice(
    durationUnit,
    newPricing
  );
  return (Number(defaultPrice) * (100 / (100 - discountPercentage))).toFixed(2);
};

export const calculateDiscountPercentage = (
  originalPrice: string | null | undefined,
  sellingPrice: number,
  currencySymbol: string | null | undefined
) => {
  if (!originalPrice || !Number.isFinite(sellingPrice)) {
    return 0;
  }

  let normalizedPrice = originalPrice;

  if (currencySymbol) {
    normalizedPrice = normalizedPrice.split(currencySymbol).join("");
  }

  // Keep only numeric characters and decimal separators.
  normalizedPrice = normalizedPrice.replaceAll(/[^\d,.-]/gu, "");

  const hasComma = normalizedPrice.includes(",");
  const hasDot = normalizedPrice.includes(".");

  // If there is only a comma separator, treat it as decimal separator.
  normalizedPrice =
    hasComma && !hasDot
      ? normalizedPrice.replace(",", ".")
      : normalizedPrice.replaceAll(",", "");

  const originalPriceNumber = Number(normalizedPrice);

  if (!Number.isFinite(originalPriceNumber) || originalPriceNumber <= 0) {
    return 0;
  }

  const discount =
    ((originalPriceNumber - sellingPrice) / originalPriceNumber) * 100;

  if (!Number.isFinite(discount) || discount <= 0) {
    return 0;
  }

  return Math.round(discount);
};

/**
 * Gets the formatted original price with currency symbol.
 * Returns null if the original price equals the selling price (no discount).
 * @param durationUnit - The duration unit of the product
 * @param defaultPrice - The default/selling price value
 * @param currencySymbol - The currency symbol (e.g., "$", "€")
 * @param newPricing - Whether to use new pricing calculation
 * @returns Formatted original price with currency symbol, or null if no discount
 */
export const getFormattedOriginalPrice = (
  durationUnit: EDURATION_UNIT,
  defaultPrice: number,
  currencySymbol: string,
  newPricing: boolean
): string => {
  const originalPrice = getOriginalPriceBaseOnDiscountPercentage(
    durationUnit,
    defaultPrice,
    newPricing
  );

  // If original price equals selling price, don't show it
  if (Number(originalPrice) === Number(defaultPrice)) {
    return "";
  }

  return `${currencySymbol}${originalPrice}`;
};

/**
 * Returns the current browser path including any search parameters.
 * Useful for comparing against deep-link targets before navigating.
 */
export const getCurrentPathAndSearchParams = (): string =>
  globalThis.window.location.pathname + globalThis.window.location.search;

export function formatTitleWithCurrentDate(title: string): string {
  const now = new Date();

  const replacements: Record<string, string> = {
    day: now.toLocaleString("en-US", { day: "numeric" }),
    month: now.toLocaleString("en-US", { month: "long" }),
    year: now.getFullYear().toString(),
  };

  return title.replaceAll(
    /\{\{(?<key>year|month|day)\}\}/gu,
    (_, key: string) => replacements[key] as string
  );
}

/**
 * Generate a blog detail page URL: /blogs/{category}/{slug}-{blogId}
 * With `language`, prefixes the path (e.g. /ar/blogs/...). Default locale `en` uses as-needed routing (no /en prefix).
 */
export function getBlogDetailUrl(
  categorySlug: string | undefined | null,
  slug: string,
  blogId?: number | null,
  language?: string | null
): string {
  const hasBlogId = blogId !== null && blogId !== undefined;
  const formattedBlogId = hasBlogId ? blogId.toString().padStart(5, "0") : "";
  const slugSuffix = hasBlogId ? `-${formattedBlogId}` : "";

  let path: string;
  if (categorySlug) {
    const slugWithId = hasBlogId ? `${slug}-${formattedBlogId}` : slug;
    path = `${BLOGS_URL}/${categorySlug}/${slugWithId}`;
  } else {
    path = `${BLOGS_URL}/${slug}${slugSuffix}`;
  }

  if (!language || language === routing.defaultLocale) {
    return path;
  }

  return `/${language}${path}`;
}

/** Single object for all free-usage client state (one localStorage key, scoped by userId) */
interface FreeUsageClientState {
  lastChatAt?: Record<string, string>;
  toastShown?: Record<
    string,
    { lastResetAt: string; milestones: ("24h" | "48h")[] }
  >;
}

const getFreeUsageClientState = (): FreeUsageClientState => {
  if (globalThis.window === undefined) {
    return {};
  }
  return (
    localStorageImpl.load<FreeUsageClientState>(FREE_USAGE_CLIENT_KEY) ?? {}
  );
};

const saveFreeUsageClientState = (state: FreeUsageClientState) => {
  if (globalThis.window === undefined) {
    return;
  }
  localStorageImpl.save(FREE_USAGE_CLIENT_KEY, state);
};

export const recordLastChatAt = (userId: string) => {
  if (globalThis.window === undefined || !userId) {
    return;
  }
  const state = getFreeUsageClientState();
  const lastChatAt = { ...state.lastChatAt, [userId]: dayjs().toISOString() };
  saveFreeUsageClientState({ ...state, lastChatAt });
};

export const getLastChatAt = (userId: string | null): string | null => {
  if (globalThis.window === undefined || !userId) {
    return null;
  }
  return getFreeUsageClientState().lastChatAt?.[userId] ?? null;
};

export const getDelayUntilNextMidnightMs = () =>
  dayjs().startOf("day").add(1, "day").diff(dayjs()) + 1000;

/** Show 24h/48h toast at most once per (userId, lastResetAt, caseType). Scoped by user so switching accounts works. */
export function tryShowInactiveToastOnce(
  userId: string,
  lastResetAt: string,
  caseType: "24h" | "48h",
  showToast: () => void
): void {
  if (globalThis.window === undefined) {
    return;
  }
  const state = getFreeUsageClientState();
  const byUser = state.toastShown?.[userId];
  const alreadyShownThisCycle =
    byUser?.lastResetAt === lastResetAt &&
    byUser?.milestones?.includes(caseType);
  if (alreadyShownThisCycle) {
    return;
  }

  showToast();
  const sameCycle = byUser?.lastResetAt === lastResetAt;
  const nextByUser = sameCycle
    ? { ...byUser, milestones: [...byUser.milestones, caseType] }
    : { lastResetAt, milestones: [caseType] as ("24h" | "48h")[] };
  const toastShown = { ...state.toastShown, [userId]: nextByUser };
  saveFreeUsageClientState({ ...state, toastShown });
}

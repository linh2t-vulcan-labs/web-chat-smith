import { attachCanonicalFaqSlugs } from "./faq-canonical-slugs";
import type { TQuestionCategory, TQuestionCategoryRaw } from "./types";

const FAQ_DATA_LOADERS = {
  ar: async () => {
    const mod = await import("./ar");
    return mod.FAQ_DATA_AR;
  },
  en: async () => {
    const mod = await import("./en");
    return mod.FAQ_DATA_EN;
  },
  es: async () => {
    const mod = await import("./es");
    return mod.FAQ_DATA_ES;
  },
  hi: async () => {
    const mod = await import("./hi");
    return mod.FAQ_DATA_HI;
  },
  ja: async () => {
    const mod = await import("./ja");
    return mod.FAQ_DATA_JA;
  },
  ko: async () => {
    const mod = await import("./ko");
    return mod.FAQ_DATA_KO;
  },
  th: async () => {
    const mod = await import("./th");
    return mod.FAQ_DATA_TH;
  },
  zh: async () => {
    const mod = await import("./zh");
    return mod.FAQ_DATA_ZH;
  },
} satisfies Record<string, () => Promise<TQuestionCategoryRaw[]>>;

type FaqLocale = keyof typeof FAQ_DATA_LOADERS;

function isFaqLocale(locale: string): locale is FaqLocale {
  return locale in FAQ_DATA_LOADERS;
}

export async function getFaqDataByLocale(
  locale: string
): Promise<TQuestionCategory[]> {
  const normalizedLocale = String(locale || "").toLowerCase();
  const loadFaqData = isFaqLocale(normalizedLocale)
    ? FAQ_DATA_LOADERS[normalizedLocale]
    : FAQ_DATA_LOADERS.en;

  const raw = await loadFaqData();
  return attachCanonicalFaqSlugs(raw);
}

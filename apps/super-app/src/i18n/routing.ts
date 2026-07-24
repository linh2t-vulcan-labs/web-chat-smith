import { createAppRouting } from "@cs/i18n/routing";

export const routing = createAppRouting({
  defaultLocale: "en",
  locales: ["en", "ar", "zh", "es", "th", "ko", "ja", "hi"] as const,
});

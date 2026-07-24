import { DEFAULT_LOCALE } from "./constants";

export interface NextIntlConfig {
  messagesPath?: string;
  srcPath?: string | string[];
  requestConfig?: string;
}

export const createNextIntlConfig = (config?: NextIntlConfig) =>
  ({
    experimental: {
      extract: true,
      messages: {
        format: "json",
        locales: "infer",
        path: config?.messagesPath ?? "./messages",

        // Optional
        precompile: true,
        sourceLocale: DEFAULT_LOCALE,
      },
      srcPath: config?.srcPath ?? "./src",
    },
    requestConfig: config?.requestConfig,
  }) as const;

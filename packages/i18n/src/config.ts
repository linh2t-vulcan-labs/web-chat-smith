import { DEFAULT_LOCALE } from "./constants";

export interface NextIntlConfig {
  messagesPath?: string;
  srcPath?: string | string[];
  requestConfig?: string;
}

const buildMessagesConfig = (messagesPath?: string) =>
  ({
    format: "json",
    locales: "infer",
    path: messagesPath ?? "./messages",
    precompile: true,
    sourceLocale: DEFAULT_LOCALE,
  }) as const;

export const createNextIntlConfig = (config?: NextIntlConfig) =>
  ({
    experimental: {
      extract: true,
      messages: buildMessagesConfig(config?.messagesPath),
      srcPath: config?.srcPath ?? "./src",
    },
    requestConfig: config?.requestConfig,
  }) as const;

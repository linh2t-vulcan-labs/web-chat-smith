import { createRequestConfig } from "@cs/i18n/request";

export default createRequestConfig(async (locale) => {
  const messages = await import(`../messages/${locale}.json`);
  return messages.default;
});

import { createNextIntlConfig } from "@cs/i18n/config";
import { createNextConfig } from "@cs/next-config";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  createNextIntlConfig({
    messagesPath: "./messages",
    requestConfig: "./i18n/request.ts",
    srcPath: ["./app", "./components", "../../packages/ui/src"],
  })
);

export default withNextIntl(
  createNextConfig({
    publicRuntimeConfig: {
      isProd: process.env.NODE_ENV === "production",
      webUrl: "http://localhost:3000",
    },
  })
);

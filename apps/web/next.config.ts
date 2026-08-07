import { createNextIntlConfig } from "@cs/i18n/config";
import { createNextConfig } from "@cs/next-config";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  createNextIntlConfig({
    messagesPath: "./messages",
    requestConfig: "./i18n/request.ts",
    srcPath: ["./app", "./components", "./hooks", "../../packages/ui/src"],
  })
);

export default withNextIntl(
  createNextConfig({
    publicRuntimeConfig: {
      isProd: process.env.NODE_ENV === "production",
      webUrl: "http://localhost:3000",
    },
    // shiki loads its languages/themes/wasm via dynamic import; Turbopack
    // can't trace those for the server bundle, so it must stay external
    // rather than bundled for SSR.
    serverExternalPackages: ["sharp", "shiki"],
    // `locale` is a root param (`app/[locale]/layout.tsx` is the only root
    // layout), so there's no single layout.tsx + not-found.tsx pair that can
    // compose a 404 for both an invalid locale segment and a genuinely
    // unmatched route — see `app/global-not-found.tsx`.
    experimental: { globalNotFound: true },
  })
);

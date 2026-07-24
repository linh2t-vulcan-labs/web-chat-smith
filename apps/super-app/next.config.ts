import path from "node:path";

import { createNextIntlConfig } from "@cs/i18n/config";
import { createNextConfig } from "@cs/next-config";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  createNextIntlConfig({
    messagesPath: "./messages",
    requestConfig: "./src/i18n/request.ts",
    srcPath: ["./src", "../../packages/ui/src"],
  })
);

// Next.js freezes experimental.serverActions.allowedOrigins at build/config-
// eval time — there's no per-request recompute hook. Since super-app now
// builds once and deploys the same image to every environment (see
// packages/env), this can no longer be derived from CS_PUBLIC_WEB_URL
// (a per-environment runtime value). Per the migration's own guidance
// ("variables identical across all environments should remain TS constants,
// not env vars"), the finite list of valid ChatSmith origins is hardcoded
// here instead — it's the same list regardless of which environment this
// built image is deployed to.
const SUPER_APP_ALLOWED_ORIGINS = [
  "https://chatsmith.io",
  "https://dev.chatsmith.io",
  "https://stg.chatsmith.io",
  "https://qa.chatsmith.io",
  "http://localhost:3000",
] as const;

export default withNextIntl(
  createNextConfig({
    // createNextConfig() never imports @cs/env itself — isProd comes from the
    // standard NODE_ENV (always set correctly by Docker/`next dev`/`next
    // start`, no schema validation involved). webUrl is only used to compute
    // `allowedDevOrigins` in local dev (!isProd) — hardcoded to the app's own
    // local port, not a per-environment value.
    publicRuntimeConfig: {
      isProd: process.env.NODE_ENV === "production",
      webUrl: "http://localhost:3000",
    },
    // reactStrictMode: false,
    // typedRoutes: false,
    reactCompiler: true,
    turbopack: {
      root: path.join(import.meta.dirname, "../.."),
      rules: {
        "*.svg": {
          as: "*.js",
          loaders: ["@svgr/webpack"],
        },
      },
    },
    // oxlint-disable-next-line require-await
    async rewrites() {
      return [
        {
          destination: "/sitemap/:id",
          source: "/sitemap/:id.xml",
        },
      ];
    },
    // oxlint-disable-next-line require-await
    async redirects() {
      return [
        {
          destination: "/",
          permanent: true,
          source: "/guest",
        },
      ];
    },
    // images: {
    //   remotePatterns: [
    //     {
    //       hostname: "assets-global.website-files.com",
    //       pathname: "/636b968ac38dd1495ec4edcd/**",
    //       port: "",
    //       protocol: "https",
    //     },
    //   ],
    // },
    experimental: {
      optimizePackageImports: ["next-sanity", "sanity", "zod", "zod/mini"],
      serverActions: {
        allowedOrigins: [...SUPER_APP_ALLOWED_ORIGINS],
      },
      // TypeScript 7 (native preview) doesn't expose the classic compiler API
      // Next's type-check worker expects; this routes type checking through
      // the `tsc` CLI instead so builds don't crash on TS 7.
      useTypeScriptCli: true,
    },
  })
);

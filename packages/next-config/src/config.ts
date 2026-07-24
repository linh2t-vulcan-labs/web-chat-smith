import type { NextConfig } from "next";

import {
  ASSETS_ROUTE,
  BASE_OPTIMIZE_PACKAGES,
  BASE_REMOTE_PATTERNS,
  BASE_TRANSPILE_PACKAGES,
  IMMUTABLE_CACHE_CONTROL,
  PAGE_ROUTE,
  STATIC_ASSETS_ROUTE,
} from "./constants";
import { buildSecurityHeaders } from "./security-headers";
import { isNonEmptyString, toDomainWildcard } from "./utils";

export interface PublicRuntimeConfig {
  isProd: boolean;
  webUrl: string;
  cookieDomain?: string;
}

export interface CreateNextConfigOptions extends Partial<NextConfig> {
  /**
   * super-app/web/creative-studio all resolve their public config
   * (CS_PUBLIC_*) at container-start/request time (see packages/env),
   * never at build time — so this factory never reads @cs/env itself.
   * Supply isProd from NODE_ENV and webUrl for local-dev `allowedDevOrigins`.
   */
  publicRuntimeConfig: PublicRuntimeConfig;
}

interface ResolvedPublicConfig {
  isProd: boolean;
  domainWildcard: string | undefined;
  webUrl: string;
}

const resolvePublicConfig = (
  publicRuntimeConfig: PublicRuntimeConfig
): ResolvedPublicConfig => {
  const { isProd, webUrl, cookieDomain } = publicRuntimeConfig;
  return {
    domainWildcard: toDomainWildcard(cookieDomain),
    isProd,
    webUrl,
  };
};

export const createNextConfig = (
  overrides: CreateNextConfigOptions
): NextConfig => {
  const { publicRuntimeConfig, ...nextOverrides } = overrides;

  const { isProd, domainWildcard, webUrl } =
    resolvePublicConfig(publicRuntimeConfig);

  const allowedOrigins = [webUrl, domainWildcard].filter(isNonEmptyString);

  const {
    allowedDevOrigins: overrideDevOrigins,
    basePath,
    experimental: overrideExperimental,
    headers: overrideHeaders,
    images: overrideImages,
    transpilePackages: overrideTranspilePackages,
    ...restOverrides
  } = nextOverrides;

  const { remotePatterns: overrideRemotePatterns, ...restImages } =
    overrideImages ?? {};

  const devOrigins = isProd
    ? (overrideDevOrigins ?? undefined)
    : [new URL(webUrl).hostname, ...(overrideDevOrigins ?? [])];

  const config: NextConfig = {
    compress: true,
    ...(isProd ? {} : ({ logging: { fetches: { fullUrl: true } } } as const)),
    output: "standalone",
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    reactStrictMode: true,
    typedRoutes: true,
    typescript: { ignoreBuildErrors: true },
    // Not a forced default: `partialPrefetching` throws at config validation
    // unless `cacheComponents` is also true, and Cache Components changes
    // data-fetching/caching semantics enough that apps must opt into both
    // deliberately (see `overrides`) rather than inherit it silently.
    reactCompiler: true,
    images: {
      dangerouslyAllowSVG: false,
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 2_592_000, // 30 days
      ...restImages,
      remotePatterns: [
        ...BASE_REMOTE_PATTERNS,
        ...(overrideRemotePatterns ?? []),
      ],
    },
    ...restOverrides,
    ...(devOrigins?.length ? { allowedDevOrigins: devOrigins } : {}),
    basePath: basePath ?? "",
    deploymentId:
      restOverrides.deploymentId || process.env.APP_RELEASE || undefined,
    env: {
      ...restOverrides.env,
      NEXT_PUBLIC_APP_BASE_PATH: basePath ?? "",
    },
    experimental: {
      ...overrideExperimental,
      inlineCss: true,
      optimizePackageImports: [
        ...BASE_OPTIMIZE_PACKAGES,
        ...(overrideExperimental?.optimizePackageImports ?? []),
      ],
      serverActions: {
        allowedOrigins,
        bodySizeLimit: "1mb",
        ...overrideExperimental?.serverActions,
      },
      sri: { algorithm: "sha256" },
      taint: true,
      turbopackRustReactCompiler: true,
      typedEnv: true,
      useOffline: true,
      useTypeScriptCli: true,
      webVitalsAttribution: ["FCP", "LCP", "CLS", "FID", "TTFB", "INP"],
    },
    headers: async () => {
      const routes = [
        {
          headers: buildSecurityHeaders(isProd),
          source: PAGE_ROUTE,
        },
        {
          headers: [
            {
              key: "Cache-Control",
              value: isProd ? IMMUTABLE_CACHE_CONTROL : "no-store",
            },
          ],
          source: ASSETS_ROUTE,
        },
        {
          headers: [
            {
              key: "Cache-Control",
              value: isProd ? IMMUTABLE_CACHE_CONTROL : "no-store",
            },
          ],
          source: STATIC_ASSETS_ROUTE,
        },
      ];
      return overrideHeaders
        ? [...routes, ...(await overrideHeaders())]
        : routes;
    },
    transpilePackages: [
      ...new Set([
        ...BASE_TRANSPILE_PACKAGES,
        ...(overrideTranspilePackages ?? []),
      ]),
    ],
  };

  return config;
};

import { isNonEmptyString, toDomainWildcard } from "@cs/core/domain";
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

/** Local-dev-only `allowedDevOrigins` (the app's own host, plus any override) — `undefined` in prod, where Next's default same-origin check is sufficient. */
const resolveDevOrigins = (
  isProd: boolean,
  webUrl: string,
  overrideDevOrigins: string[] | undefined
): string[] | undefined =>
  isProd
    ? (overrideDevOrigins ?? undefined)
    : [new URL(webUrl).hostname, ...(overrideDevOrigins ?? [])];

/** Base image-optimization config, merged with an app's own `images` override (its `remotePatterns` are appended to, not replaced by, the shared base list). */
const buildImagesConfig = (
  overrideImages: NextConfig["images"]
): NextConfig["images"] => {
  const { remotePatterns: overrideRemotePatterns, ...restImages } =
    overrideImages ?? {};
  return {
    dangerouslyAllowSVG: false,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2_592_000, // 30 days
    ...restImages,
    remotePatterns: [
      ...BASE_REMOTE_PATTERNS,
      ...(overrideRemotePatterns ?? []),
    ],
  };
};

/** Shared experimental flags, merged with an app's own `experimental` override (`optimizePackageImports`/`serverActions` are appended to/merged with, not replaced by, the shared defaults). */
const buildExperimentalConfig = (
  overrideExperimental: NextConfig["experimental"],
  allowedOrigins: string[]
): NextConfig["experimental"] => ({
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
  instantInsights: {
    validationLevel: "warning",
  },
});

/** `allowedDevOrigins` override entry, only present when there's actually something to add. */
const buildDevOriginsOverride = (
  devOrigins: string[] | undefined
): Pick<NextConfig, "allowedDevOrigins"> =>
  devOrigins?.length ? { allowedDevOrigins: devOrigins } : {};

/** The deployment id override, falling back to the `APP_RELEASE` env var, or `undefined` if neither is set. */
const resolveDeploymentId = (
  overrideDeploymentId: NextConfig["deploymentId"]
): NextConfig["deploymentId"] =>
  overrideDeploymentId || process.env.APP_RELEASE || undefined;

/** `Cache-Control` header entry shared by both static-asset route groups — long-lived immutable caching in prod, disabled in dev so local rebuilds are always reflected. */
const buildCacheControlHeader = (isProd: boolean) => [
  {
    key: "Cache-Control",
    value: isProd ? IMMUTABLE_CACHE_CONTROL : "no-store",
  },
];

/** The app's security/asset-caching header routes, plus any app-specific routes appended via `overrideHeaders`. */
const buildHeadersFn =
  (
    isProd: boolean,
    overrideHeaders: NextConfig["headers"]
  ): NextConfig["headers"] =>
  async () => {
    const routes = [
      {
        headers: buildSecurityHeaders(isProd),
        source: PAGE_ROUTE,
      },
      {
        headers: buildCacheControlHeader(isProd),
        source: ASSETS_ROUTE,
      },
      {
        headers: buildCacheControlHeader(isProd),
        source: STATIC_ASSETS_ROUTE,
      },
    ];
    return overrideHeaders ? [...routes, ...(await overrideHeaders())] : routes;
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

  const devOrigins = resolveDevOrigins(isProd, webUrl, overrideDevOrigins);

  const config: NextConfig = {
    compress: true,
    ...(isProd ? {} : ({ logging: { fetches: { fullUrl: true } } } as const)),
    output: "standalone",
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    reactStrictMode: true,
    typedRoutes: true,
    typescript: { ignoreBuildErrors: true },
    reactCompiler: true,
    cacheComponents: true,
    partialPrefetching: true,
    serverExternalPackages: ["sharp"],
    images: buildImagesConfig(overrideImages),
    ...restOverrides,
    ...buildDevOriginsOverride(devOrigins),
    basePath: basePath ?? "",
    deploymentId: resolveDeploymentId(restOverrides.deploymentId),
    env: {
      ...restOverrides.env,
      NEXT_PUBLIC_APP_BASE_PATH: basePath ?? "",
    },
    experimental: buildExperimentalConfig(overrideExperimental, allowedOrigins),
    headers: buildHeadersFn(isProd, overrideHeaders),
    transpilePackages: [
      ...new Set([
        ...BASE_TRANSPILE_PACKAGES,
        ...(overrideTranspilePackages ?? []),
      ]),
    ],
  };

  return config;
};

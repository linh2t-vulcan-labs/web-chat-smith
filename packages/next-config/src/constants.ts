export const BASE_REMOTE_PATTERNS = [
  { hostname: "**.chatsmith.io", protocol: "https" as const },
  { hostname: "chatsmith.io", protocol: "https" as const },
  { hostname: "**.vulcanlabs.co", protocol: "https" as const },
  { hostname: "lh3.googleusercontent.com", protocol: "https" as const },
  { hostname: "graph.facebook.com", protocol: "https" as const },
  { hostname: "cdn.sanity.io", protocol: "https" as const },
  { hostname: "storage.googleapis.com", protocol: "https" as const },
  { hostname: "picsum.photos", protocol: "https" as const },
  { hostname: "placehold.co", protocol: "https" as const },
  { hostname: "images.unsplash.com", protocol: "https" as const },
];

// Every workspace package that ships raw TypeScript/TSX (no build step) and
// is reachable, directly or transitively, from at least one app's runtime
// import graph (apps/web, apps/super-app) — not just what that app imports
// directly. E.g. @cs/themes pulls in @cs/icons; @cs/api-client pulls in
// @cs/validation.
// @cs/design-tokens is excluded — it only exports CSS, nothing for a JS/TS
// compiler to transpile. @cs/ts-config is excluded — dev-only tsconfig
// files, never imported at runtime.
// Note: under Turbopack (this repo's bundler) and even webpack for the App
// Router, workspace packages are transpiled automatically regardless of this
// list — see transpilePackages.md ("Turbopack transpiles workspace packages
// ... automatically under both routers. Webpack does the same for the App
// Router."). This list only bites if a future app falls back to Pages
// Router, or the monorepo picks up an actual node_modules dependency that
// ships raw TS. Kept for that case and as living documentation of the
// raw-TS dependency graph.
export const BASE_TRANSPILE_PACKAGES = [
  "@cs/api-client",
  "@cs/core",
  "@cs/env",
  "@cs/firebase",
  "@cs/flags",
  "@cs/i18n",
  "@cs/icons",
  "@cs/next-config",
  "@cs/notifications",
  "@cs/security",
  "@cs/themes",
  "@cs/ui",
  "@cs/validation",
] as const;

// Third-party (non-workspace) packages with a large named-export surface —
// candidates for tree-shaking via optimizePackageImports. Next.js already
// auto-applies this to a built-in list (lucide-react, date-fns, lodash-es,
// @headlessui/react, recharts, ...; see default optimize list in
// next/dist/server/config.js) — don't repeat those here.
export const BASE_OPTIMIZE_PACKAGES = [
  "radix-ui",
  "@base-ui/react",
  "motion",
  "react-syntax-highlighter",
  "konva",
  "react-konva",
  "@tanstack/react-table",
] as const;

export const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";
export const ASSETS_ROUTE = "/assets/:path*";
export const STATIC_ASSETS_ROUTE =
  "/:all*\\.(ico|jpg|jpeg|png|gif|webp|avif|svg|eot|otf|ttf|woff|woff2)$";
export const PAGE_ROUTE = "/:path((?!api).*)*";

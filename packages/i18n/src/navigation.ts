import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

// Re-exported so consumers (e.g. a locale switcher) read the active locale
// without importing `next-intl` directly for this one hook. Unlike
// `useExtracted`/`getExtracted`, this isn't subject to extraction static
// analysis, so wrapping it here is safe.
export { useLocale } from "next-intl";

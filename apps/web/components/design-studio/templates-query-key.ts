/**
 * Shared between the server prefetch (`app/[locale]/design-studio-templates/page.tsx`)
 * and the client `useApiQuery` (`templates-list.tsx`) — must be the exact
 * same key for `HydrationBoundary` to land the server-fetched result on the
 * client query's cache entry.
 */
export const TEMPLATES_QUERY_KEY = ["design-studio", "templates"];

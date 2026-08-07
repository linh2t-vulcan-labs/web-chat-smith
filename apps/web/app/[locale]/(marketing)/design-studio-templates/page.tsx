import { getQueryClient } from "@cs/api-client/core/query-client";
import { serverFetch } from "@cs/api-client/server/server-fetch";
import { designStudio } from "@cs/api-client/services/design-studio";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { cacheLife } from "next/cache";
import { connection } from "next/server";
import { Suspense } from "react";

import {
  TemplatesList,
  TemplatesListSkeleton,
} from "@/components/design-studio/templates-list";
import { TEMPLATES_QUERY_KEY } from "@/components/design-studio/templates-query-key";

export const metadata = {
  description: "Demo of server-prefetched public data via HydrationBoundary.",
  title: "Design Studio templates",
};

/**
 * `designStudio.listTemplates` is `auth: "none"` AND the same for every
 * visitor — exactly the case `packages/api-client/README.md` §3 point 4
 * says to reach for Next's `"use cache"` instead of `prefetchServerQuery()`:
 * the per-request `QueryClient` (`core/query-client.ts`) can't cache across
 * requests, so `prefetchServerQuery()` alone re-hits the backend on every
 * navigation to this page — verified directly (every `GET
 * /design-studio-templates`, including back/forward, logged its own `GET
 * .../creative-studio/v1/creative/templates` before this change). `"use
 * cache"` is Next's Data Cache, which DOES persist across requests, so this
 * is the layer that actually needs to own the caching — not TanStack Query.
 *
 * `cacheLife` is called here (not abstracted into a shared helper) per the
 * Next.js docs' own recommendation: keep the cache lifetime visible at the
 * call site. `"hours"` (5 min stale / 1 hr revalidate / 1 day expire) fits a
 * template catalog that changes at most a few times a day, not every
 * request — pick a shorter profile if this ever needs faster propagation of
 * new templates, or add `cacheTag("design-studio-templates")` + a
 * `revalidateTag()` call wherever templates are authored if that lag becomes
 * a real problem.
 */
const getCachedTemplates = async () => {
  "use cache";
  cacheLife("hours");

  const [error, data] = await serverFetch(designStudio.listTemplates, {});
  if (error) {
    throw error;
  }
  return data;
};

/**
 * `queryClient.setQueryData()` stamps `dataUpdatedAt` via `Date.now()`
 * internally (same as `prefetchQuery()` would) — verified directly: without
 * `await connection()` below, Next throws "encountered the unstable value
 * `Date.now()` while prerendering" for this route, because Cache Components
 * still attempts to prerender a static shell for any route with no explicit
 * dynamic marker, REGARDLESS of whether the data came from `"use cache"` or
 * an uncached fetch. `connection()` is Next's sanctioned way to opt a
 * subtree out of that prerender attempt and defer it to real request time
 * (see the "Random values and timestamps" section of Next's caching guide)
 * — this is the same class of bug as the 🛑 warning in
 * `packages/api-client/README.md` §3 (TanStack's internal `Date.now()`
 * tripping Cache Components), just triggered by `setQueryData` instead of
 * `prefetchQuery`. A component calling `connection()` must sit behind its
 * own `<Suspense>` boundary (below) so the rest of the page can still
 * prerender as a static shell around it.
 */
const TemplatesHydrator = async () => {
  await connection();

  const queryClient = getQueryClient();
  const data = await getCachedTemplates();
  queryClient.setQueryData(TEMPLATES_QUERY_KEY, data);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TemplatesList />
    </HydrationBoundary>
  );
};

/**
 * Second demo page (alongside `[locale]/(workspace)/page.tsx`'s client-only
 * `AuthStatus`)
 * — this one exercises the OTHER branch of the fetch decision guide
 * (`packages/api-client/README.md` §3): server-fetched public data, still
 * handed to a Client Component through `HydrationBoundary` so `TemplatesList`
 * can use `useApiQuery` like any other query. `TemplatesHydrator` is the only
 * place that renders the result — this outer component only lays out the
 * static shell (title, caption) and the `<Suspense>` boundary, per the
 * "Server Component render is not a render source" rule in the same doc
 * section.
 */
const DesignStudioTemplatesPage = () => (
  <div className="flex min-h-svh flex-col gap-4 p-6">
    <h1 className="font-semibold text-lg">Design Studio templates</h1>
    <p className="text-muted-foreground text-xs">
      Server (&quot;use cache&quot; + HydrationBoundary)
    </p>
    <Suspense fallback={<TemplatesListSkeleton />}>
      <TemplatesHydrator />
    </Suspense>
  </div>
);

export default DesignStudioTemplatesPage;

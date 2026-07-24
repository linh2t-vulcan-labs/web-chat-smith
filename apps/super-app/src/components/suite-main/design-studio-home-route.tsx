import { CookieManager } from "@/app/api/auth-v2/utils/cookie-manager";
import { getProjectsServerQueryOptions } from "@/features/suite/hooks/api/use-project.server";
import { getTemplatesInfiniteQueryOptions } from "@/features/suite/hooks/api/use-template";
import { SUITE_TOOL } from "@/features/suite/utils/constants/route";
import {
  dehydrate,
  getQueryClient,
  HydrationBoundary,
} from "@/libs/react-query";

import SuiteMain from "./suite-main";

interface DesignStudioHomeRouteProps {
  // When set, the home renders deep-linked to a use-case (its prompt chip pre-selected).
  initialUsecaseSlug?: string;
  isGuest?: boolean;
}

// Server render for the Design Studio home. Shared by /design-studio, /guest/design-studio and their
// use-case deep links (.../<slug>) so every entry prefetches identically and differs only by which
// chip is pre-selected. Guests have no auth token / projects → only templates are prefetched.
export async function DesignStudioHomeRoute({
  initialUsecaseSlug,
  isGuest = false,
}: DesignStudioHomeRouteProps) {
  const queryClient = getQueryClient();

  if (isGuest) {
    await queryClient.prefetchInfiniteQuery(
      getTemplatesInfiniteQueryOptions({ category: "logo", pageSize: 25 })
    );
  } else {
    const accessToken = await CookieManager.getAccessTokenFromEncrypted();
    await Promise.all([
      accessToken
        ? queryClient.prefetchInfiniteQuery(
            getProjectsServerQueryOptions({ pageSize: 3 }, accessToken)
          )
        : Promise.resolve(),
      queryClient.prefetchInfiniteQuery(
        getTemplatesInfiniteQueryOptions({ category: "logo", pageSize: 25 })
      ),
    ]);
  }

  // Per-request seed for the logo-template shuffle (AC9). Generated on the server and passed down so
  // SSR and hydration share it (no flash). A fresh server render (reload) re-seeds; a cached soft-nav
  // reuses it → order stays stable within a session. MUST stay server-side — never re-roll on client.
  // oxlint-disable-next-line react/react-compiler -- server-only per-request random seed, intentionally generated once per request in this async server component, not during a client render
  const shuffleSeed = Math.floor(Math.random() * 0xff_ff_ff_ff);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SuiteMain
        isGuest={isGuest}
        tool={SUITE_TOOL.DESIGN}
        initialUsecaseSlug={initialUsecaseSlug}
        shuffleSeed={shuffleSeed}
      />
    </HydrationBoundary>
  );
}

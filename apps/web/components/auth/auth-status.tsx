"use client";

import { useApiQuery } from "@cs/api-client/hooks/use-api-query";
import { useApiAuth } from "@cs/api-client/providers/auth-provider";
import { userManagement } from "@cs/api-client/services/user-management";
import { Button } from "@cs/ui/components/shadcn/button";
import { Skeleton } from "@cs/ui/components/shadcn/skeleton";

import { SignInWithGoogleButton } from "@/components/auth/sign-in-with-google-button";

const PROFILE_QUERY_KEY = ["user-management", "profile"];

/**
 * One skeleton for the whole "we don't know the final view yet" window —
 * covers both `isInitializing` (don't know signed-in/out yet) and the
 * profile fetch that follows once signed-in is confirmed (2 sequential
 * network round-trips, see the component doc comment below). Rendering 1
 * shape here instead of 2 different loading texts back-to-back is what
 * collapses 2 layout shifts into (at most) 1: skeleton → real content, never
 * skeleton → text → text → content.
 *
 * Sized for the taller of the 2 possible outcomes (authenticated: 3 profile
 * rows + button) via `min-h` — if the real outcome turns out to be the
 * shorter one (signed-out: just a button), the swap leaves a bit of empty
 * space below rather than the layout growing, which reads as far less
 * jarring than a reflow.
 */
const AuthStatusSkeleton = () => (
  <div className="flex min-h-32 flex-col gap-2">
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5">
      <Skeleton className="h-3 w-10" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-10" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-14" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-9 w-20" />
  </div>
);

/** Single-line stand-in for a header — sized for inline placement, not a page section. */
const AuthStatusCompactSkeleton = () => (
  <div className="flex items-center gap-2">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-16" />
  </div>
);

export interface AuthStatusProps {
  /** Renders a single-line variant (email + inline logout) for the shared header instead of the full profile block — see `apps/web/components/layout/header.tsx`. Default `false`. */
  compact?: boolean;
}

/**
 * Demo of the sign-in flow: shows the sign-in button when logged out, and
 * the fetched profile once `ApiAuthProvider` has an access token.
 *
 * Deliberately client-only — no server prefetch/`HydrationBoundary` for
 * this query. An earlier version prefetched via a Server Component
 * (`queryClient.prefetchQuery` + `dehydrate`), but under this app's Next 16
 * Cache Components, that Server Component gets speculatively re-invoked
 * (TanStack Query's internal `Date.now()` timestamping on query settle
 * trips Cache Components' "bail out of prerendering" retry), and each
 * re-invocation independently re-runs the auth restore chain — since the
 * profile endpoint is `auth: "required"`, that meant a real
 * refresh-token *rotation* against the backend on every one of those
 * speculative re-renders, PLUS the client's own independent restore: 3 real
 * rotations for one page load instead of 1, against a backend with no
 * rotation grace period. The client's own `QueryClient` singleton (see
 * `core/query-client.ts`) already caches/dedupes correctly across remounts
 * within `staleTime` (verified directly), so the server-prefetch's only
 * real benefit here — avoiding one client-side loading flash on a cold
 * load — isn't worth that risk for a peripheral demo widget.
 */
export const AuthStatus = ({ compact = false }: AuthStatusProps) => {
  const { isAuthenticated, isInitializing, isPending, logout, setPending } =
    useApiAuth();

  const handleLogout = async () => {
    setPending(true);
    try {
      // AuthSyncProvider's onAccessTokenChange listener (wired at the app
      // root) reacts to this and calls router.refresh() so server-rendered
      // auth state picks up the cleared session cookie.
      await logout();
    } finally {
      setPending(false);
    }
  };

  const profileQuery = useApiQuery({
    enabled: isAuthenticated,
    queryFn: ({ signal }) => userManagement.getProfile(undefined, { signal }),
    queryKey: PROFILE_QUERY_KEY,
  });

  // `profileQuery.isPending` is also true while the query is disabled
  // (signed-out) — only counts as "still loading" once we know we're
  // authenticated and it actually started fetching.
  const isLoadingProfile = isAuthenticated && profileQuery.isPending;
  if (isInitializing || isLoadingProfile) {
    return compact ? <AuthStatusCompactSkeleton /> : <AuthStatusSkeleton />;
  }

  if (!isAuthenticated) {
    return <SignInWithGoogleButton />;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {profileQuery.data && <span>{profileQuery.data.email}</span>}
        <Button
          disabled={isPending}
          onClick={handleLogout}
          size="sm"
          type="button"
          variant="ghost"
        >
          Log out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {profileQuery.isError && (
        <p role="alert">Failed to load profile: {profileQuery.error.message}</p>
      )}
      {profileQuery.data && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-2">
          <dt className="text-muted-foreground">Email</dt>
          <dd>{profileQuery.data.email}</dd>
          <dt className="text-muted-foreground">Name</dt>
          <dd>
            {[profileQuery.data.firstName, profileQuery.data.lastName]
              .filter(Boolean)
              .join(" ") || profileQuery.data.username}
          </dd>
          <dt className="text-muted-foreground">User ID</dt>
          <dd>{profileQuery.data.id}</dd>
        </dl>
      )}
      <Button
        disabled={isPending}
        onClick={handleLogout}
        type="button"
        variant="outline"
      >
        Log out
      </Button>
    </div>
  );
};

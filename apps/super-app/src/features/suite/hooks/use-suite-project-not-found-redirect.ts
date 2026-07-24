"use client";

import { useCallback } from "react";

import { useRouter } from "@/i18n/navigation";

// Sends the user back to the tool's Creative Studio home when the opened project no longer exists.
// In-app navigation passes `onBack` (resets the detail flow in place); a directly-opened URL has
// none, so we `replace` to home — replace (not push) so the dead project URL is dropped from history.
// `homeRoute` is the tool's home path (e.g. SUITE_TOOL_ROUTES[tool].HOME), passed in so this works
// for any suite tool (logo, video, …) instead of hardcoding one.
export function useSuiteProjectNotFoundRedirect(
  homeRoute: string,
  onBack?: () => void
) {
  const router = useRouter();

  return useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    router.replace(homeRoute);
  }, [homeRoute, onBack, router]);
}

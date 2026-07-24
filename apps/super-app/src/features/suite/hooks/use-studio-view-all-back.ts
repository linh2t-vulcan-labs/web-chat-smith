"use client";

import type { SuiteToolRoutes } from "@/features/suite/types/routes";
import { SUITE_BACK_BEHAVIOR } from "@/features/suite/utils/constants/route";
import { useRouter } from "@/i18n/navigation";

interface StudioViewAllBack {
  backHref: string;
  // When set, HomeAllProjectsPage preventDefaults the link and calls this instead of navigating.
  onBack?: () => void;
}

// View-all "back" target, governed by SUITE_BACK_BEHAVIOR:
//   "studio-root"      → plain link to the studio root.
//   "return-to-origin" → step back to the actual previous entry (the use-case/home the list was opened
//                        from), falling back to the studio root when there is no in-app history
//                        (direct load / reload of the view-all URL, where router.back would exit the app).
export function useStudioViewAllBack(
  routes: SuiteToolRoutes
): StudioViewAllBack {
  const router = useRouter();

  if (SUITE_BACK_BEHAVIOR === "return-to-origin") {
    return {
      backHref: routes.HOME,
      onBack: () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
          return;
        }
        router.push(routes.HOME);
      },
    };
  }

  return { backHref: routes.HOME };
}

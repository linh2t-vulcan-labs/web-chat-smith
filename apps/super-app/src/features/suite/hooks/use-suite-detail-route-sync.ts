"use client";

import { useEffect, useRef } from "react";

import type { SuiteToolRoutes } from "@/features/suite/types/routes";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// A suite "detail" screen is layout state on the home/view-all route (the URL is faked via
// window.history), so `isDetailActive` can drift from the URL when something OTHER than the suite
// navigates (e.g. an external sidebar icon doing router.push, or the browser back button). This hook
// reconciles the drift: when the URL leaves a detail path while the detail layout is open, it resets.
//
// Two triggers, both needed:
//   1. usePathname() — next-intl, already locale-stripped. Fires on any DIFFERENT-path change,
//      including the manual replaceState the suite itself performs (Next 14.1+ tracks history
//      methods). Works on every browser. Covers: existing/created project (URL has an id) -> home
//      or view-all. We act only on an actual pathname CHANGE, never on isDetailActive flipping, so
//      opening an optimistic compose (isDetailActive=true while the URL stays the base route) is
//      not mistaken for "leaving detail".
//   2. Navigation API 'currententrychange' — fires even when router.push targets the CURRENT path,
//      which usePathname cannot see. Needed only for the narrow case: detail layout open while the
//      URL is still the base route (a not-yet-prompted compose), and an external link pushes that
//      same base route. Supported ~88% (Chrome/Edge 102+, Safari/iOS 26.2+, Firefox 147+); older
//      browsers simply skip this one case and behave as before.
//
// Alternatives for that narrow same-path case, rejected (documented so we don't re-research):
//   - Monkey-patch window.history.pushState: 100% coverage, but mutates a global Next 14.1 also
//     patches -> fragile. Rejected.
//   - URL sentinel (e.g. ?new=1) on the compose state: 100% coverage, but pollutes the URL. Rejected.

// window.location may carry a locale prefix (direct load/reload on a non-default locale), while the
// suite's own manual history writes are locale-free. Strip the prefix before classifying so both
// shapes compare equal. Mirrors stripLocaleFromPathname in the auth middleware.
function stripLocale(pathname: string): string {
  const segments = pathname.split("/");
  const [, maybeLocale] = segments;
  if (
    routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
  ) {
    const stripped = ["", ...segments.slice(2)].join("/");
    return stripped || "/";
  }
  return pathname;
}

// Detail = a path directly under HOME carrying an extra segment (the project id) that is not the
// known view-all sub-route, and not a use-case home (/design-studio/<slug>). HOME, VIEW_ALL and the
// use-case homes are all non-detail (home surfaces).
function isDetailPathname(
  pathname: string,
  routes: SuiteToolRoutes,
  usecaseSlugs: string[]
): boolean {
  if (!pathname.startsWith(`${routes.HOME}/`)) {
    return false;
  }
  if (pathname === routes.VIEW_ALL) {
    return false;
  }
  if (usecaseSlugs.some((slug) => pathname === `${routes.HOME}/${slug}`)) {
    return false;
  }
  return true;
}

interface UseSuiteDetailRouteSyncOptions {
  isDetailActive: boolean;
  routes: SuiteToolRoutes;
  // Use-case slugs of the current studio (/design-studio/<slug>) — treated as home, not detail.
  usecaseSlugs: string[];
  // Reset the detail layout state WITHOUT touching the URL — the URL is already correct when this
  // fires (something else navigated). Touching the URL here would fight that navigation.
  onLeaveDetail: () => void;
}

export function useSuiteDetailRouteSync({
  isDetailActive,
  routes,
  usecaseSlugs,
  onLeaveDetail,
}: UseSuiteDetailRouteSyncOptions) {
  const pathname = usePathname();

  // Latest values, readable from the long-lived currententrychange listener without re-subscribing.
  const isDetailActiveRef = useRef(isDetailActive);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-value ref updated during render so the long-lived navigation listener reads current state without re-subscribing
  isDetailActiveRef.current = isDetailActive;
  const routesRef = useRef(routes);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-value ref updated during render so the long-lived navigation listener reads current state without re-subscribing
  routesRef.current = routes;
  const usecaseSlugsRef = useRef(usecaseSlugs);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-value ref updated during render so the long-lived navigation listener reads current state without re-subscribing
  usecaseSlugsRef.current = usecaseSlugs;
  const onLeaveDetailRef = useRef(onLeaveDetail);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-callback ref updated during render so the long-lived navigation listener calls the newest callback without re-subscribing
  onLeaveDetailRef.current = onLeaveDetail;

  // Trigger 1 — react only to a real pathname change (not to isDetailActive flipping).
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;
    if (prev === pathname) {
      return;
    }
    if (
      isDetailActiveRef.current &&
      !isDetailPathname(pathname, routesRef.current, usecaseSlugsRef.current)
    ) {
      onLeaveDetailRef.current();
    }
  }, [pathname]);

  // Trigger 2 — catch same-path navigations usePathname can't (see note above).
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const nav = (window as unknown as { navigation?: EventTarget }).navigation;
    if (!nav) {
      return;
    }

    const handleEntryChange = () => {
      // Defer: this fires synchronously off whatever call stack triggered the
      // history write (ours, Next's router, or a third-party history patch),
      // which can land inside React's useInsertionEffect commit window. State
      // updates aren't allowed there, so push the check to the next microtask.
      queueMicrotask(() => {
        if (!isDetailActiveRef.current) {
          return;
        }
        const current = stripLocale(window.location.pathname);
        if (
          !isDetailPathname(current, routesRef.current, usecaseSlugsRef.current)
        ) {
          onLeaveDetailRef.current();
        }
      });
    };

    nav.addEventListener("currententrychange", handleEntryChange);
    return () =>
      nav.removeEventListener("currententrychange", handleEntryChange);
  }, []);
}

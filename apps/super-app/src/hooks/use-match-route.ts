"use client";

import { usePathname } from "@/i18n/navigation";

type MatchResult = {
  params: Record<string, string>;
} | null;

/**
 * This hook checks if the current `pathname` matches a route pattern.
 * Example pattern = "/pathname/:id"
 * - Support **wildcard** (ex: "/pathname/*")
 * @param pattern - The route pattern to match against, e.g. "/pathname/:id".
 * @returns The matched params, or `null` if the pathname does not match the pattern.
 */
export function useMatchRoute(pattern: string): MatchResult {
  const pathname = usePathname();

  const patternSegments = pattern.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);

  const params: Record<string, string> = {};

  // oxlint-disable-next-line react/react-compiler -- compiler internal error (empty block with goto terminal) triggered by this loop's early-return control flow; not a component/hook purity issue, restructuring to appease the compiler is out of scope here
  for (let i = 0, j = 0; i < patternSegments.length; i += 1, j += 1) {
    const p = patternSegments[i];
    const s = pathSegments[j];

    if (!p) {
      continue;
    }

    if (p === "*") {
      // wildcard: match all the rest
      return { params };
    }

    if (!s) {
      return null; // path is shorter than pattern
    }

    if (p.startsWith(":")) {
      // dynamic segment
      params[p.slice(1)] = s;
    } else if (p !== s) {
      return null; // not match
    }
  }

  // If pattern is shorter than path (and has no wildcard) then no match
  if (pathSegments.length > patternSegments.length) {
    return null;
  }

  return { params };
}

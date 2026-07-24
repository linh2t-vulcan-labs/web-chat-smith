"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export type HeaderNavLayout = "compact" | "expanded";

const NAV_MARK = "nav";
const BRAND_MARK = "brand";
const RIGHT_MARK = "right";

/** Inline nav only at this viewport+; below always compact (hamburger). Matches header CSS. */
const DESKTOP_NAV_MIN_WIDTH_PX = 900;

function isDesktopNavViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(`(min-width: ${DESKTOP_NAV_MIN_WIDTH_PX}px)`)
    .matches;
}

/** Extra px when toggling layout — avoids flicker at the fit boundary. */
const LAYOUT_HYSTERESIS_PX = 24;

/** Minimum gap between left (brand + nav) and right clusters in expanded mode. */
const DEFAULT_LEFT_RIGHT_SAFE_GAP_PX = 40;
const LEFT_RIGHT_SAFE_GAP_VAR = "--ai-header-nav-layout-safe-gap";

function readLeftRightSafeGapPx(scope: HTMLElement): number {
  const raw = getComputedStyle(scope)
    .getPropertyValue(LEFT_RIGHT_SAFE_GAP_VAR)
    .trim();
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : DEFAULT_LEFT_RIGHT_SAFE_GAP_PX;
}

function fitsExpandedLayout(
  requiredWidth: number,
  available: number,
  previous: HeaderNavLayout | null
): boolean {
  if (previous === "expanded") {
    return requiredWidth <= available + LAYOUT_HYSTERESIS_PX;
  }
  if (previous === "compact") {
    return requiredWidth <= available - LAYOUT_HYSTERESIS_PX;
  }
  return requiredWidth <= available + 0.5;
}

interface UseHeaderNavLayoutOptions {
  /**
   * When true (e.g. mobile drawer open), skip layout updates so right-slot DOM changes
   * do not flip expanded ↔ compact and fight the drawer open state.
   */
  freezeMeasure?: boolean;
}

/**
 * Picks compact (hamburger + drawer) vs expanded (inline nav) from available header width,
 * not a fixed viewport breakpoint — stays correct when nav items or labels change.
 */
export function useHeaderNavLayout(
  containerRef: RefObject<HTMLDivElement | null>,
  remeasureKey: string,
  options?: UseHeaderNavLayoutOptions
): HeaderNavLayout | null {
  const freezeMeasure = options?.freezeMeasure ?? false;
  const layoutRef = useRef<HeaderNavLayout | null>(null);
  const stableRightWidthRef = useRef(0);

  /** `null` until first measure — CSS viewport fallback paints desktop nav before hydration. */
  const [layout, setLayout] = useState<HeaderNavLayout | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const applyLayout = (next: HeaderNavLayout) => {
      if (layoutRef.current === next) {
        return;
      }
      layoutRef.current = next;
      setLayout(next);
    };

    const measure = () => {
      if (!isDesktopNavViewport()) {
        if (!freezeMeasure) {
          applyLayout("compact");
        }
        return;
      }

      const header = container.closest<HTMLElement>("[data-header-root]");
      const nav = container.querySelector<HTMLElement>(
        `[data-header-measure="${NAV_MARK}"]`
      );
      const brandLead = container.querySelector<HTMLElement>(
        `[data-header-measure="${BRAND_MARK}"]`
      );
      const right = container.querySelector<HTMLElement>(
        `[data-header-measure="${RIGHT_MARK}"]`
      );
      if (!header || !nav || !brandLead || !right) {
        return;
      }

      header.dataset.measuring = "true";
      const navWidth = nav.scrollWidth;
      delete header.dataset.measuring;

      const left = brandLead.parentElement;
      if (!left) {
        return;
      }

      // `getComputedStyle` returns length values as unit-suffixed strings (e.g. "56px").
      // `Number()` can't parse that — it returns `NaN`, which fails every `<=` comparison
      // below and forced "compact" unconditionally regardless of viewport width. This is
      // NOT the `unicorn/prefer-number-coercion` case (plain numeric string): the "px"
      // suffix requires `parseFloat`'s partial-parse behavior.
      const containerStyle = getComputedStyle(container);
      // oxlint-disable-next-line unicorn/prefer-number-coercion -- `Number()` can't strip the "px" suffix; see comment above
      const paddingLeft = Number.parseFloat(containerStyle.paddingLeft);
      // oxlint-disable-next-line unicorn/prefer-number-coercion -- `Number()` can't strip the "px" suffix; see comment above
      const paddingRight = Number.parseFloat(containerStyle.paddingRight);
      const paddingX = paddingLeft + paddingRight;
      // oxlint-disable-next-line unicorn/prefer-number-coercion -- `Number()` can't strip the "px" suffix; see comment above
      const leftGap = Number.parseFloat(getComputedStyle(left).gap) || 0;

      const rightWidth = right.offsetWidth;
      if (!freezeMeasure && rightWidth > 0) {
        stableRightWidthRef.current = rightWidth;
      }

      const rightForFit = stableRightWidthRef.current || rightWidth;
      const expandedLeftWidth = brandLead.offsetWidth + navWidth + leftGap;
      const safeGap = readLeftRightSafeGapPx(header);
      const requiredWidth = expandedLeftWidth + rightForFit + safeGap;
      const available = container.clientWidth - paddingX;
      const previous = layoutRef.current;
      const fitsExpanded = fitsExpandedLayout(
        requiredWidth,
        available,
        previous
      );

      if (!freezeMeasure) {
        applyLayout(fitsExpanded ? "expanded" : "compact");
      }
    };

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    const nav = container.querySelector(`[data-header-measure="${NAV_MARK}"]`);
    const right = container.querySelector(
      `[data-header-measure="${RIGHT_MARK}"]`
    );
    const brandLead = container.querySelector(
      `[data-header-measure="${BRAND_MARK}"]`
    );
    if (nav) {
      observer.observe(nav);
    }
    if (right) {
      observer.observe(right);
    }
    if (brandLead) {
      observer.observe(brandLead);
    }
    measure();

    // Re-measure once the real webfont has swapped in (FOUT): the first pass above
    // uses fallback-font metrics, and a font-driven width change in nav/brand/right
    // would otherwise flip the layout right after it settles, instead of once up front.
    let cancelled = false;
    (async () => {
      await document.fonts?.ready;
      if (!cancelled) {
        measure();
      }
    })();

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [containerRef, remeasureKey, freezeMeasure]);

  return layout;
}

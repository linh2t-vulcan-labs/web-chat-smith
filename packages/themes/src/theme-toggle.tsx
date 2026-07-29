"use client";

import { IconMoon } from "@cs/icons/moon";
import { IconSunMedium } from "@cs/icons/sun-medium";
import { Button } from "@cs/ui/components/shadcn/button";
import type { ComponentProps } from "react";

import { useTheme } from "./provider";

export const ThemeToggle = (
  props: Omit<ComponentProps<typeof Button>, "children" | "onClick">
) => {
  const { toggle } = useTheme();

  return (
    <Button
      aria-label="Toggle theme"
      onClick={toggle}
      size="icon"
      variant="ghost"
      {...props}
    >
      {/* Both icons always render; the `dark:` variant (keyed off the `.dark`
          class `ThemeScript` sets on <html> before first paint) picks the
          visible one purely in CSS. Deliberately not branching on
          `resolvedTheme` in JS here — this component can render inside a
          route's own <Suspense> boundary and hydrate on a separate pass from
          `ThemeProvider`, so gating on `mounted` (local or from context) still
          risks a mismatch or a visible icon swap depending on which pass wins. */}
      <IconMoon className="dark:hidden" />
      <IconSunMedium className="hidden dark:block" />
    </Button>
  );
};

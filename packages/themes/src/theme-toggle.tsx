"use client";

import { IconMoon } from "@cs/icons/moon";
import { IconSunMedium } from "@cs/icons/sun-medium";
import { Button } from "@cs/ui/components/button";
import type { ComponentProps } from "react";

import { useTheme } from "./provider";

export const ThemeToggle = (
  props: Omit<ComponentProps<typeof Button>, "children" | "onClick">
) => {
  const { resolvedTheme, toggle, mounted } = useTheme();

  return (
    <Button
      aria-label="Toggle theme"
      disabled={!mounted}
      onClick={toggle}
      size="icon"
      variant="ghost"
      {...props}
    >
      {resolvedTheme === "dark" ? <IconSunMedium /> : <IconMoon />}
    </Button>
  );
};

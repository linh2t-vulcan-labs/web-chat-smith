"use client";

import { REMOTE_CONFIG_KEYS } from "@cs/flags/keys";
import { ThemeToggle } from "@cs/themes";

import { Feature } from "@/lib/flags-react";

/**
 * `ThemeToggle` gated behind `ENABLE_THEME_TOGGLE` — pulled out of
 * `Header`/the workspace `[locale]/layout.tsx` into its own named component
 * so the gating behavior has a stable, directly testable unit (see
 * `theme-toggle-gated.test.tsx`) instead of being inline JSX inside a route
 * file.
 */
export const ThemeToggleGated = () => (
  <Feature flag={REMOTE_CONFIG_KEYS.ENABLE_THEME_TOGGLE}>
    <ThemeToggle />
  </Feature>
);

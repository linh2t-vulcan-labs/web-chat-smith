import type { Theme } from "./types";

/** CSS media query string for dark mode preference. */
export const DARK_MEDIA = "(prefers-color-scheme: dark)";

/**
 * localStorage key shared by ThemeScript and ThemeProvider.
 * If you pass a custom storageKey to ThemeProvider, pass the same value to ThemeScript.
 */
export const STORAGE_KEY = "cs_theme";

/** Fallback theme when localStorage is empty. */
export const DEFAULT_THEME: Theme = "system";

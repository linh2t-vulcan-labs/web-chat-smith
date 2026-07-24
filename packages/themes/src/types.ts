export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  /** undefined until the component has mounted and read localStorage */
  resolvedTheme: ResolvedTheme | undefined;
  setTheme: (theme: Theme) => void;
  /** Flips between light and dark based on the current DOM class. */
  toggle: () => void;
  /** false during SSR and the first client render; true after useEffect */
  mounted: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  /**
   * Suppress all CSS transitions for one frame while the theme class swaps,
   * so color/background transitions defined elsewhere don't visibly animate
   * on toggle. Defaults to true.
   */
  disableTransitionOnChange?: boolean;
}

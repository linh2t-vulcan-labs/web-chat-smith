// "use client";

import type { ThemeProviderProps } from "@wrksz/themes/next";
import { ThemeProvider as NextThemesProvider } from "@wrksz/themes/next";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      disableTransitionOnChange
      attribute="data-theme"
      defaultTheme="dark"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

import { DARK_MEDIA, DEFAULT_THEME, STORAGE_KEY } from "./constants";
import type {
  ResolvedTheme,
  Theme,
  ThemeContextValue,
  ThemeProviderProps,
} from "./types";

// ─── helpers ──────────────────────────────────────────────────────────────────
// Mirrored (not shared) by the inline script in theme-script.tsx — that script
// runs unbundled, before React or any module graph exists, so it can't import
// these. Keep the two in sync when changing theme resolution or storage keys.

const prefersDark = (): boolean => window.matchMedia(DARK_MEDIA).matches;

const resolveTheme = (
  theme: Theme,
  systemDark: boolean = prefersDark()
): ResolvedTheme => {
  if (theme !== "system") {
    return theme;
  }
  return systemDark ? "dark" : "light";
};

/** Validate and narrow a raw string to Theme. Returns null for unknown values. */
const parseTheme = (v: string | null): Theme | null => {
  if (v === "light" || v === "dark" || v === "system") {
    return v;
  }
  return null;
};

/** Read the stored preference. Returns null when nothing is stored or storage is blocked. */
const readStored = (): Theme | null => {
  try {
    return parseTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    // localStorage blocked (strict private browsing, sandboxed iframe, etc.)
    return null;
  }
};

/** Swap only the opposite class — avoids a frame with no theme class applied. */
const applyClass = (resolved: ResolvedTheme): void => {
  const el = document.documentElement;
  el.classList.remove(resolved === "dark" ? "light" : "dark");
  el.classList.add(resolved);
  // Also themes native form controls, scrollbars, and the browser's own UI.
  el.style.colorScheme = resolved;
};

/**
 * Briefly disables all CSS transitions so a theme toggle doesn't animate
 * every color/background/border on the page at once. Call the returned
 * function AFTER applying the theme change. The double rAF ties removal to
 * an actual paint boundary (the first rAF fires just before the next paint,
 * the second fires only after that paint has happened) rather than an
 * arbitrary timer, guaranteeing one frame renders with transitions off
 * before the override lifts.
 */
const suppressTransitions = (): (() => void) => {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.append(style);
  return () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove();
      });
    });
  };
};

// ─── context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── provider ─────────────────────────────────────────────────────────────────

export const ThemeProvider = ({
  children,
  defaultTheme = DEFAULT_THEME,
  disableTransitionOnChange = true,
}: ThemeProviderProps) => {
  // `theme`         — user's stored intent: 'light' | 'dark' | 'system'.
  //                   Keeps the "follow OS" intent distinct from a concrete color so
  //                   it survives OS preference changes without losing what the user set.
  // `resolvedTheme` — actual visual state: always 'light' | 'dark', never 'system'.
  //                   For non-CSS consumers (charts, Monaco, etc.) that need the real
  //                   color without re-deriving it from theme + OS. Undefined until
  //                   mounted to prevent SSR/client hydration mismatches.
  // Lazily initialized from storage (not `defaultTheme`) so `theme` is already
  // correct on the very first client render. Reading localStorage here is safe
  // despite differing from the server's render (which has no storage and falls
  // back to `defaultTheme`): this component renders no DOM of its own, and every
  // consumer of `theme`/`resolvedTheme` is masked by `mounted` until this same
  // effect pass completes, so there's no server/client markup to mismatch.
  // This used to be synced from an effect instead, which left a window — during
  // the initial mount effects, before that sync effect's `setTheme` took hold —
  // where the effect below could still see the stale `defaultTheme` ('system')
  // and briefly force the DOM to the OS preference even when an explicit stored
  // 'light'/'dark' preference disagreed with it (visible as a light→dark→light
  // flash whenever the stored preference differs from the current OS setting).
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined"
      ? defaultTheme
      : (readStored() ?? defaultTheme)
  );
  const [mounted, setMounted] = useState(false);
  // Mirrors the OS preference for the `resolvedTheme` returned to consumers.
  // Kept as state (not read live via prefersDark() at render time) so a
  // change fires a re-render — otherwise a consumer's `resolvedTheme` would
  // go stale whenever theme === 'system' and the OS preference flips.
  // Lazy-initialized (rather than set from an effect) so the subscribing
  // effect below only ever calls setState from its change callback.
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => typeof window !== "undefined" && prefersDark()
  );

  // Runs synchronously before every paint. On most renders the DOM already
  // matches (the class was already applied by whichever call changed
  // `theme`), so the classList check makes this a no-op read with no writes.
  // It only does real work after a full remount (e.g. the `[locale]`-scoped
  // root layout remounting on a language switch), when React re-reconciles
  // <html>'s static className and strips whatever class isn't in that prop —
  // this restores it before the browser paints. We read from storage (not
  // `theme` state) so this stays correct even immediately after such a
  // remount, before the freshly re-initialized `theme` state has settled.
  useLayoutEffect(() => {
    const resolved = resolveTheme(readStored() ?? "system");
    if (!document.documentElement.classList.contains(resolved)) {
      applyClass(resolved);
    }
  });

  // `theme` is already correct from the lazy initializer above — this effect
  // only flips `mounted` once the client is interactive, unblocking consumers
  // gated on it (e.g. `ThemeToggle`'s disabled state, `resolvedTheme`). It
  // can't be initialized render-safely instead: `mounted` must start `false`
  // on both server and client so a consumer's first client render matches the
  // server-rendered markup, only flipping once hydration is confirmed done.
  // oxlint-disable-next-line react-doctor/rendering-hydration-no-flicker -- the flash this rule warns about is exactly what `mounted` is for: consumers render their non-mounted fallback until this fires, by design
  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler react-doctor/no-initialize-state -- setState in an effect body is intentional here, not a subscription callback: this is the one-time "confirm hydration is done" signal, not synchronizing with an external system. Can't be lazy-initialized: `mounted` must start `false` on both server and client so the client's first (hydration) render matches the server-rendered markup, only flipping once hydration is confirmed done
    setMounted(true);
  }, []);

  const applyTheme = (next: Theme) => {
    const restore = disableTransitionOnChange ? suppressTransitions() : null;
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage blocked — theme still applies for this session.
    }
    applyClass(resolveTheme(next));
    restore?.();
  };

  const toggle = () => {
    const next: Theme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    applyTheme(next);
  };

  // Cross-tab sync — StorageEvent fires in every tab except the writer.
  // Uses e.newValue directly (the value that triggered the event) rather than
  // re-reading localStorage, which avoids a redundant read and correctly handles
  // key deletion (e.newValue === null → parseTheme returns null → no-op).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) {
        return;
      }
      const next = parseTheme(e.newValue);
      if (next) {
        const restore = disableTransitionOnChange
          ? suppressTransitions()
          : null;
        setTheme(next);
        applyClass(resolveTheme(next));
        restore?.();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [disableTransitionOnChange]);

  // Tracks the OS preference continuously (not just while theme === 'system')
  // so it's already current if the user later switches to 'system'.
  useEffect(() => {
    const mq = window.matchMedia(DARK_MEDIA);
    const onChange = () => setSystemPrefersDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Re-resolve the DOM class when the OS preference changes while
  // theme === 'system'. Reacts to `systemPrefersDark` state (above) instead
  // of its own matchMedia listener so there's a single source of truth.
  useEffect(() => {
    if (theme !== "system") {
      return;
    }
    applyClass(systemPrefersDark ? "dark" : "light");
  }, [theme, systemPrefersDark]);

  const resolvedTheme: ResolvedTheme | undefined = mounted
    ? resolveTheme(theme, systemPrefersDark)
    : undefined;

  const value: ThemeContextValue = {
    mounted,
    resolvedTheme,
    setTheme: applyTheme,
    theme,
    toggle,
  };
  // react/jsx-no-constructed-context-values predates React Compiler (enabled
  // for this app in next.config.ts) and doesn't know the compiler already
  // memoizes this object and the `applyTheme`/`toggle` closures it holds.
  // A manual useMemo here would need those two in its deps to stay correct,
  // which defeats the point — the compiler's memoization is already correct.
  // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
  return <ThemeContext value={value}>{children}</ThemeContext>;
};

// ─── hook ─────────────────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return ctx;
};

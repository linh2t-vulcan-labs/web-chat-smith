/**
 * Lets TokenManager (a plain class outside React) trigger a client-side route
 * transition instead of a hard `window.location` reload when a session expires.
 *
 * A hard reload remounts the entire app shell (GlobalStateProvider, Suspense
 * fallback, etc.), which is why an expired session used to show the loading
 * overlay twice: once for the doomed page, once again after the full reload.
 * AuthSyncProvider registers the real navigator on mount; without it (e.g. if
 * the provider hasn't mounted yet) we fall back to the old hard redirect.
 */
type NavigateFn = (href: string) => void;

let navigate: NavigateFn | null = null;

export function registerTokenExpiryNavigate(fn: NavigateFn | null) {
  navigate = fn;
}

export function navigateOnTokenExpiry(href: string) {
  if (navigate) {
    navigate(href);
    return;
  }
  window.location.href = href;
}

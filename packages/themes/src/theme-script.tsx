import { DARK_MEDIA, STORAGE_KEY } from "./constants";

// Runs synchronously while the browser parses <head>, before first paint —
// this is what actually prevents the flash. `ThemeProvider`'s useLayoutEffect
// only prevents a flash *after* hydration; on a cold load the server-rendered
// HTML paints before React ever runs.
//
// Deliberately a raw <script>, not `next/script`: tested both, and
// `next/script` (even with strategy="beforeInteractive") hits the exact same
// React dev warning below once the surrounding tree is torn down and rebuilt
// on the client (e.g. a locale-switch soft nav) — `next/script` solves
// third-party script loading/dedup, not this. Next.js's own anti-FOUC guide
// (preventing-flash-before-hydration.md) uses a raw <script> for the same
// reason. What would actually avoid the warning is keeping this script out
// of any tree that can be remounted client-side — but `[locale]` is a
// Next.js root param (see app/[locale]/layout.tsx's doc comment), so
// `<head>`/`ThemeScript` has no layer left above it to hide behind, and DOES
// remount (and re-log this dev-only warning once) on a locale switch.
// Confirmed live (2026-08-07): harmless in practice — the type swap below
// still means the browser never re-executes the script on that remount, so
// theme correctness isn't affected — but it is NOT silent; treat this as the
// same accepted, single-root-layout cost documented in
// `root-providers.tsx`/`auth-sync-provider.tsx`, not a solved problem.
const SCRIPT = `(function(){try{var k="${STORAGE_KEY}",v=localStorage.getItem(k),d=window.matchMedia("${DARK_MEDIA}").matches,t=v==="light"||v==="dark"?v:d?"dark":"light",e=document.documentElement;e.classList.remove(t==="dark"?"light":"dark");e.classList.add(t);e.style.colorScheme=t}catch(_){}})()`;

/**
 * Place inside <head>, before any content, in the root layout:
 *
 *   <html suppressHydrationWarning>
 *     <head><ThemeScript /></head>
 *     <body>{children}</body>
 *   </html>
 *
 * Server Component — renders a blocking inline script, no client JS needed.
 */
export const ThemeScript = () => (
  <script
    // React warns about rendering raw <script> tags in dev on EVERY client
    // render/commit of this node — the type swap doesn't silence that
    // warning (confirmed live: it still logs once per locale switch, see
    // the file-level comment above), it only ensures the browser never
    // re-executes the script's content on a remount (only `text/javascript`
    // scripts run; `text/plain` is inert) — hydration correctness, not
    // console silence.
    type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
    suppressHydrationWarning
    // eslint-disable-next-line react/no-danger -- static, non-user-controlled script content
    dangerouslySetInnerHTML={{ __html: SCRIPT }}
  />
);

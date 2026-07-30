"use client";

// Root-layout-failure fallback. Must define its own `<html>`/`<body>` — it
// replaces the root layout entirely when active (see Next's error.js file
// convention docs). Unlike `not-found.tsx` (a Server Component that can read
// the locale cookie via `cookies()` and call `getExtracted({ locale })`),
// error boundaries must be Client Components — no server-only API access —
// so there's no equivalent way to read the visitor's locale here without
// resorting to a raw `document.cookie` parse + manual message lookup. Given
// this only renders when the entire root layout crashes (the rarest failure
// path in the app), that complexity isn't worth it: static English only.
// `global-error` also bypasses `@cs/ui/globals.css`/Tailwind entirely (it
// replaces the whole root layout, which is what loads that stylesheet), so
// this is a plain inline-styled fallback — hoisted to a module-level
// constant (not recreated per render) rather than a Tailwind class.
const CONTAINER_STYLE = {
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  fontFamily: "system-ui, sans-serif",
  gap: "0.75rem",
  height: "100vh",
  justifyContent: "center",
  textAlign: "center",
} as const;

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={CONTAINER_STYLE}>
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. Please try again.</p>
          <button onClick={() => retry()} type="button">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

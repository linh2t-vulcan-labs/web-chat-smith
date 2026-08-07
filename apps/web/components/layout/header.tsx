import { Link } from "@cs/i18n/navigation";
import { LanguageSwitcher } from "@cs/ui/components/cs/language-switcher";
import type { ReactNode } from "react";

import { AuthStatus } from "@/components/auth/auth-status";

/**
 * Primary in-app destinations only — `/landing`, `/playground`, and
 * `/design-studio-templates` are marketing/dev pages reached by direct link,
 * deliberately left out of the nav to keep it uncluttered.
 */
const NAV_LINKS = [
  { href: "/", label: "Chat" },
  { href: "/design-studio", label: "Design Studio" },
  { href: "/blog", label: "Blog" },
  { href: "/chatbot", label: "Chatbot" },
] as const;

/**
 * Shared header for every page under `app/[locale]/layout.tsx` — both the
 * `(workspace)` and `(marketing)` nested route groups. Composes
 * `LanguageSwitcher` (`@cs/ui`), a caller-supplied `themeToggle` slot, and
 * `AuthStatus` in its `compact` variant. A Server Component itself — each
 * child already owns its own `"use client"` boundary where it needs one.
 *
 * `themeToggle` is a slot, not a hardcoded `<ThemeToggle />`, because only
 * `(workspace)` mounts `FlagsProvider` (`(marketing)` deliberately doesn't —
 * see `app/[locale]/(marketing)/layout.tsx`'s comment). `ENABLE_THEME_TOGGLE`
 * can only gate the toggle where a `<Feature>`/`useFlag` call has a provider
 * to read from, so each nested group layout decides what to pass here
 * instead of `Header` assuming a context that isn't always mounted.
 */
export const Header = ({ themeToggle }: { themeToggle: ReactNode }) => (
  <header className="flex items-center justify-between gap-4 border-b p-4">
    <div className="flex items-center gap-6">
      <Link className="font-semibold" href="/">
        Chat Smith
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {NAV_LINKS.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
    <div className="flex items-center gap-3">
      <LanguageSwitcher />
      {themeToggle}
      <AuthStatus compact />
    </div>
  </header>
);

import { Link } from "@cs/i18n/navigation";
import { ThemeToggle } from "@cs/themes";
import { LanguageSwitcher } from "@cs/ui/components/language-switcher";

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
] as const;

/**
 * Shared header for every page under `[locale]/layout.tsx` — both the
 * `(workspace)` and `(marketing)` route groups. Composes 3 pieces that
 * already existed and already worked together (previously assembled ad hoc
 * in the old root page): `LanguageSwitcher` (`@cs/ui`), `ThemeToggle`
 * (`@cs/themes`), and `AuthStatus` in its `compact` variant. A Server
 * Component itself — each child already owns its own `"use client"`
 * boundary where it needs one.
 */
export const Header = () => (
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
      <ThemeToggle />
      <AuthStatus compact />
    </div>
  </header>
);

"use client";

import { Link } from "@cs/i18n/navigation";
import { Button } from "@cs/ui/components/button";
import { useExtracted } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";

const renderGuidelinesLink = (chunks: ReactNode) => (
  <Link href="/">{chunks}</Link>
);

/**
 * Demonstrates every valid `useExtracted` usage pattern from
 * https://next-intl.dev/docs/usage/extraction — no message keys or JSON
 * files to maintain by hand; the strings below *are* the source messages.
 */
export const ExtractionDemo = () => {
  // ✅ Default namespace: makes `t` available in this component.
  const t = useExtracted();

  // ✅ Namespaced: groups messages under "ExtractionDemo" in messages/en.json.
  const tDesignSystem = useExtracted("ExtractionDemo.design-system");

  const [clicks, setClicks] = useState(0);

  // ✅ Usage inside an event handler is supported.
  const onClick = () => {
    setClicks((count) => count + 1);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* ✅ String literal */}
      <p>{t("Look ma, no keys!")}</p>

      {/* ✅ Interpolation with dynamic values */}
      <p>{t("Hello {name}!", { name: "Chat Smith" })}</p>

      {/* ✅ ICU plural, embedded directly in the source string */}
      <p>
        {t(
          "You clicked {count, plural, =0 {not once} one {one time} other {# times}}.",
          { count: clicks }
        )}
      </p>

      {/* ✅ ICU select */}
      <p>
        {t(
          "Status: {status, select, online {🟢 Online} offline {⚪ Offline} other {Unknown}}.",
          {
            status: clicks > 0 ? "online" : "offline",
          }
        )}
      </p>

      {/* ✅ Rich text — chunks render as real React nodes (here, our
          localized `Link` from `@cs/i18n/navigation`) */}
      <p>
        {t.rich("Please refer to the <link>guidelines</link>.", {
          link: renderGuidelinesLink,
        })}
      </p>

      {/* ✅ Explicit id + description: gives translators context without
          changing the rendered text. Useful when the same English string
          needs different translations depending on where it's used. */}
      <p>
        {t({
          description: "Button label for the extraction demo counter",
          id: "ExtractionDemo.cta",
          message: "Click me",
        })}
      </p>

      {/* ✅ Namespaced usage */}
      <Button onClick={onClick} type="button">
        {tDesignSystem("Increment")}
      </Button>

      {/* ❌ NOT valid (kept as comments — would break static extraction):
        const key = "Hello";
        t(key);                          // dynamic key, only known at runtime
        someFn(t);                       // passing `t` across a function boundary
        export const useExtractedAlias = useExtracted; // re-exporting the hook
      */}
    </div>
  );
};

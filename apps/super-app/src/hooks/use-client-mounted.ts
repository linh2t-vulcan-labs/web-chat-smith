"use client";

import { useEffect, useState } from "react";

/** True after the first client commit — use to avoid SSR/client markup mismatches. */
export function useClientMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- classic client-mounted flag set once on mount to gate SSR-unsafe rendering, not a render derivation
    setMounted(true);
  }, []);

  return mounted;
}

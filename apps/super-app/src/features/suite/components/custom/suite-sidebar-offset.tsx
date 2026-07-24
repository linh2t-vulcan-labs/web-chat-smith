"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { useIsMobile } from "@/features/suite/hooks/use-mobile";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

export function SuiteSidebarOffset({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const divRef = useRef<HTMLDivElement | null>(null);
  const [offsetReady, setOffsetReady] = useState(false);

  useLayoutEffect(() => {
    const el = divRef.current;
    if (!el) {
      return;
    }

    if (isMobile) {
      el.style.setProperty("--main-sidebar-offset", "0px");
      // oxlint-disable-next-line react/react-compiler -- marks the DOM-measured offset ready after directly mutating a CSS custom property on the DOM node (external system), not a render derivation
      setOffsetReady(true);
      return;
    }

    const sidebar = document.querySelector("#sidebar");
    if (!sidebar) {
      el.style.setProperty("--main-sidebar-offset", "0px");
      setOffsetReady(true);
      return;
    }

    const update = () => {
      const { width } = sidebar.getBoundingClientRect();
      el.style.setProperty("--main-sidebar-offset", `${width}px`);
      setOffsetReady(true);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(sidebar);
    return () => ro.disconnect();
  }, [isMobile]);

  return (
    <div
      ref={divRef}
      // Hide until the sidebar offset has been measured (was `.suite-root [data-offset-ready="false"]`).
      className="data-[offset-ready=false]:invisible"
      data-testid={DATA_TEST_ID.suite.custom.suiteSidebarOffset}
      data-offset-ready={offsetReady}
    >
      {children}
    </div>
  );
}

import { useEffect, useRef } from "react";

import { useGlobalState } from "@/store/global/hooks";
import { generateRandomUUIDV4 } from "@/utils/commons/helpers";

export function useBlockingOverlayRegistration(open: boolean) {
  const registerBlockingOverlay = useGlobalState(
    (state) => state.registerBlockingOverlay
  );
  const unregisterBlockingOverlay = useGlobalState(
    (state) => state.unregisterBlockingOverlay
  );
  const idRef = useRef<string>(`blocking-overlay-${generateRandomUUIDV4()}`);

  useEffect(() => {
    const id = idRef.current;

    if (!open) {
      unregisterBlockingOverlay(id);
      return;
    }

    registerBlockingOverlay(id);

    return () => {
      unregisterBlockingOverlay(id);
    };
  }, [open, registerBlockingOverlay, unregisterBlockingOverlay]);
}

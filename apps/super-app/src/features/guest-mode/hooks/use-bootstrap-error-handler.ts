import { useEffect } from "react";

import { useGuestState } from "../stores/guest-mode/hooks";

/**
 * Custom hook to handle bootstrap errors
 * Follows Single Responsibility Principle - only handles bootstrap error logic
 */
export function useBootstrapErrorHandler(onError: () => void) {
  const bootstrapError = useGuestState((state) => state.bootstrapError);

  useEffect(() => {
    if (bootstrapError) {
      // console.error("[useBootstrapErrorHandler] Bootstrap failed:", bootstrapError);
      onError();
    }
  }, [bootstrapError, onError]);
}

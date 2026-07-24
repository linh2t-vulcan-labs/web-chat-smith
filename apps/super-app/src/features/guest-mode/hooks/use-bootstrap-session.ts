import { useQuery } from "@/libs/react-query";

import type { BootstrapModel } from "../models";
import { useInitGuestMode } from "./use-init-guest-mode/use-init-guest-mode";

const BOOTSTRAP_TIMEOUT_MS = 20_000;

/**
 * Creates a timeout wrapper for bootstrap session
 * Follows DRY principle by extracting timeout logic
 */
function createTimeoutPromise<T>(
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  return new Promise<T>((_resolve, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
}

/**
 * Custom hook to bootstrap guest session with timeout and retry
 * Follows Single Responsibility Principle - only handles bootstrap logic
 */
export function useBootstrapSession() {
  const { bootstrapSession } = useInitGuestMode();

  return useQuery<BootstrapModel | undefined>({
    queryFn: () => {
      const timeoutPromise = createTimeoutPromise<BootstrapModel>(
        BOOTSTRAP_TIMEOUT_MS,
        "Bootstrap session timeout"
      );
      return Promise.race([bootstrapSession(), timeoutPromise]);
    },
    queryKey: ["bootstrapGuestSession"],
    retry: 2,
    retryDelay: 1000,
    staleTime: Infinity,
  });
}

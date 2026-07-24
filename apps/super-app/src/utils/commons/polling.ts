export interface PollOptions<T> {
  /**
   * Function that returns the data to check
   */
  fetcher: () => Promise<T>;

  /**
   * A predicate function to determine if polling should stop
   */
  validate: (result: T) => boolean;

  /**
   * Called when validate returns true
   */
  onSuccess?: (result: T) => void;

  /**
   * Called when polling hits timeout or error
   */
  onError?: (error: unknown) => void;

  /**
   * Milliseconds between each poll (default: 2000)
   */
  interval?: number;

  /**
   * Timeout in milliseconds to stop polling (default: 30000)
   */
  timeout?: number;

  /**
   * Max retry
   */
  maxRetries?: number; // Retry count on error (default: 1)
}

/**
 * Reusable polling utility with abort capability
 */
export function startPolling<T>(options: PollOptions<T>) {
  const {
    fetcher,
    validate,
    onSuccess,
    onError,
    interval = 2000,
    timeout = 30_000,
    maxRetries = 1,
  } = options;

  let stopped = false;
  let retryCount = 0;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const stop = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
    stopped = true;
  };

  const poll = async () => {
    if (stopped) {
      return;
    }

    try {
      const result = await fetcher();

      if (stopped) {
        return;
      }

      if (validate(result)) {
        stop();
        onSuccess?.(result);
      }
    } catch (error) {
      retryCount += 1;

      if (retryCount > maxRetries) {
        stop();
        onError?.(error);
      }
      // else: skip this interval, let next interval retry
    }
  };

  intervalId = setInterval(poll, interval);

  timeoutId = setTimeout(() => {
    stop();
    onError?.(new Error("Polling timed out"));
  }, timeout);

  void poll(); // Fire immediately

  return { stop };
}

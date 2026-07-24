export const isNetworkError = (error: unknown): boolean =>
  !navigator.onLine || error instanceof TypeError;

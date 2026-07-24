/**
 *
 * @param searchParams - The URL search params to inspect for UTM tracking keys.
 * @returns check blog url has utm_ search params
 */
export function hasUTMParams(searchParams: URLSearchParams) {
  for (const key of searchParams.keys()) {
    if (key.toLowerCase().startsWith("utm_")) {
      return true;
    }
  }
  return false;
}

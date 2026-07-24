export const toDomainWildcard = (
  domain: string | undefined
): string | undefined =>
  domain && domain !== "localhost" ? `*.${domain}` : undefined;

export const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0;

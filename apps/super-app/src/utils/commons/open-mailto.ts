/**
 * Opens a mailto link in the user's default email client.
 * This is a lightweight utility to avoid pulling in the entire helpers.ts bundle.
 *
 * @param mailtoLink - The mailto URL (e.g., "mailto:support@example.com")
 */
export const openMailto = (mailtoLink: string) => {
  if (globalThis.window !== undefined && mailtoLink.startsWith("mailto:")) {
    globalThis.window.location.href = mailtoLink;
  }
};

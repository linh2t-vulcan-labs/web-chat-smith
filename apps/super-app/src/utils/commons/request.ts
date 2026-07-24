import { isServer } from "./helpers";

export const safeResponseJsonFormat = async <T>(
  response: Response
): Promise<T | undefined> => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

export const getAppQRUrl = () =>
  isServer ? "" : `${window.location.origin}/api/qr-redirect`;

/**
 * Where the last-synced FCM token (and the user it was synced for) is
 * persisted, so a page reload doesn't re-register an unchanged token. The
 * default implementation uses `localStorage`; pass your own to swap it out
 * (e.g. for a test double).
 */
export interface TokenStore {
  getToken: () => string | null;
  getUserId: () => string | null;
  save: (token: string, userId: string | null) => void;
  clear: () => void;
}

const readLocalStorage = (key: string): string | null =>
  typeof window === "undefined" ? null : window.localStorage.getItem(key);

export const createLocalStorageTokenStore = (
  namespace = "cs-notifications"
): TokenStore => {
  const tokenKey = `${namespace}:token`;
  const userIdKey = `${namespace}:uid`;

  return {
    clear: () => {
      if (typeof window === "undefined") {
        return;
      }
      window.localStorage.removeItem(tokenKey);
      window.localStorage.removeItem(userIdKey);
    },
    getToken: () => readLocalStorage(tokenKey),
    getUserId: () => readLocalStorage(userIdKey),
    save: (token, userId) => {
      if (typeof window === "undefined") {
        return;
      }
      window.localStorage.setItem(tokenKey, token);
      if (userId) {
        window.localStorage.setItem(userIdKey, userId);
      } else {
        window.localStorage.removeItem(userIdKey);
      }
    },
  };
};

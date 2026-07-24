import { LOCAL_STORAGE_KEY } from "@/utils/commons/keys";

export const broadcastLogout = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY.LOGOUT_EVENT, Date.now().toString());
};

export const broadcastLogin = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY.LOGIN_EVENT, Date.now().toString());
};

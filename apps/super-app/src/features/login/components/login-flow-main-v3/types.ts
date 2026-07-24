import type { TSearchParamsLoginPage } from "@/core/http/dto/user";

export type TLoginFlowMain = TSearchParamsLoginPage;

export interface TErrorLogin {
  err: string;
  message: string;
}

export interface TMessageLoginPopup {
  open: boolean;
}

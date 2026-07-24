import type { EAUTH_PROVIDER } from "@/utils/commons/enums";

export interface TOAuthProviderV3Props {
  href: string;
  imageURL: string;
  imageLightURL: string;
  provider: EAUTH_PROVIDER;
  mode?: "mobile";
  onClick?: () => void;
}

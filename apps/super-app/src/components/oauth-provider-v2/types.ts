import type { EAUTH_PROVIDER } from "@/utils/commons/enums";

export interface TOAuthProviderV2Props {
  href: string;
  imageURL: string;
  provider: EAUTH_PROVIDER;
  onClick?: (provider: EAUTH_PROVIDER) => void;
}

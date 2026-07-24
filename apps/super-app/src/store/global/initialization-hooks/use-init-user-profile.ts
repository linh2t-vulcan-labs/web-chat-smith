import type { RefObject } from "react";

import { userClientService } from "@/core/repositories";
import { useQuery } from "@/libs/react-query";

import type { TCreateGlobalStore } from "../store";

export function getUserInfoQueryKey(isAuthenticated: boolean) {
  return ["userInfo", isAuthenticated];
}

export const useInitUserProfile = (
  store: RefObject<TCreateGlobalStore | null>,
  isAuthenticated: boolean
) => {
  const { data: userResponse } = useQuery({
    enabled: isAuthenticated,
    queryFn: async () => await userClientService.getUserProfile(),
    queryKey: getUserInfoQueryKey(isAuthenticated),
  });

  return userResponse;
};

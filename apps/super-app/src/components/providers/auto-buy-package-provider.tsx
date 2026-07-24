"use client";

import { useEffect } from "react";

import type { ProductModel } from "@/core/models/product";
import useLocalStorage from "@/hooks/use-local-storage";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { useAuthState } from "@/store/auth";
import { useGlobalState } from "@/store/global/hooks";
import { LOCAL_STORAGE_KEY } from "@/utils/commons/keys";

export default function AutoBuyPackageProvider() {
  const [productInCart, setProductInCart] = useLocalStorage<
    ProductModel | undefined
  >(LOCAL_STORAGE_KEY.GUEST_MODE_PRODUCT);
  const { isReady } = useRemoteConfigContext();

  const isFinishFetchProfile = useGlobalState(
    (state) => state.isFinishFetchProfile
  );
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const setSelectedProductForCheckout = useGlobalState(
    (state) => state.setSelectedProductForCheckout
  );
  const isAuthenticated = useAuthState((state) => state.isAuthenticated);

  useEffect(() => {
    if (
      !isFinishFetchProfile ||
      !isReady ||
      !productInCart ||
      !isAuthenticated
    ) {
      return;
    }

    const { isValidPremiumUser } = userSubscriptionInfo;

    if (!isValidPremiumUser) {
      // Open subscription modal and store pending checkout intent.
      setIsOpenSubscriptionModal(true, "guest");
      setSelectedProductForCheckout(productInCart);
    }

    setProductInCart(undefined);
  }, [
    userSubscriptionInfo,
    productInCart,
    isFinishFetchProfile,
    isAuthenticated,
    isReady,
    setIsOpenSubscriptionModal,
    setProductInCart,
    setSelectedProductForCheckout,
  ]);

  return null;
}

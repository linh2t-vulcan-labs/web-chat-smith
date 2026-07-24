import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import {
  paymentClientService,
  productClientService,
} from "@/core/repositories";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useQuery } from "@/libs/react-query";

import type { TCreateGlobalStore } from "../store";

export const useInitProducts = (
  store: RefObject<TCreateGlobalStore | null>
) => {
  const hasInitializedRef = useRef(false);
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();

  const { data: productResponse } = useQuery({
    enabled: isReady,
    queryFn: async () => {
      const apiVersion = getValueSyncRemoteConfig(
        REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_INFO
      );

      return await productClientService.getProductsByAppId(apiVersion || "v1");
    },
    queryKey: ["products", isReady],
  });

  const { data: paymentProductsResponse } = useQuery({
    enabled: isReady,
    queryFn: () => paymentClientService.getPaymentProducts(),
    queryKey: ["payment-products", isReady],
  });

  useEffect(() => {
    if (hasInitializedRef.current || !store.current) {
      return;
    }

    if (!productResponse || !paymentProductsResponse) {
      return;
    }

    const [, products] = productResponse;
    const [, paymentProducts] = paymentProductsResponse;

    const vendorProductIdBySource = new Map(
      (paymentProducts ?? []).map((mapping) => [
        mapping.sourceProductId,
        mapping.vendorProductId,
      ])
    );

    // Mutate in place to preserve the ProductModel class instance — getters
    // like `pricePerWeek` / `sellingPrice` live on the prototype and would be
    // lost by an object spread, which would also break the ProductModel[] type.
    const merged = (products ?? []).map((product) => {
      product.vendorProductId = vendorProductIdBySource.get(product.id);
      return product;
    });

    store.current.getState().setProducts(merged);
    hasInitializedRef.current = true;
  }, [productResponse, paymentProductsResponse, store]);
};
